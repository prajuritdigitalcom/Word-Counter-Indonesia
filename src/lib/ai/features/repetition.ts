/**
 * Repetition & Structural Parallelism Feature Extractor
 */
import { PreparedTextContext, AiPatternCategoryResult, AiPatternMatch } from '../types';

// Precompiled Regex for negative parallelism
const NEGATIVE_PARALLELISM_PATTERNS = [
  {
    regex: /\bbukan\s+hanya\b[\s\S]{1,60}?\btetapi\s+juga\b/giu,
    label: 'bukan hanya ... tetapi juga',
  },
  {
    regex: /\bbukan\s+hanya\b[\s\S]{1,60}?\bmelainkan\s+juga\b/giu,
    label: 'bukan hanya ... melainkan juga',
  },
  {
    regex: /\bbukan\s+sekadar\b[\s\S]{1,60}?\bmelainkan\b/giu,
    label: 'bukan sekadar ... melainkan',
  },
  {
    regex: /\btidak\s+hanya\b[\s\S]{1,60}?\btetapi\s+juga\b/giu,
    label: 'tidak hanya ... tetapi juga',
  },
];

export function extractRepetitionFeature(ctx: PreparedTextContext): {
  categoryResult: AiPatternCategoryResult;
  score: number;
} {
  const { tokens, rawText, wordCount } = ctx;
  if (wordCount < 10 || tokens.length < 10) {
    return {
      categoryResult: {
        id: 'repetition',
        name: 'Pengulangan Frasa & Struktur Paralel',
        detail: 'Teks terlalu pendek untuk analisis pengulangan',
        contribution: 'Rendah',
        matches: [],
        rawScore: 0,
      },
      score: 0,
    };
  }

  const factor = 1000 / wordCount;
  const matches: AiPatternMatch[] = [];

  // 1. Negative parallelism structures
  let parallelismCount = 0;
  for (const item of NEGATIVE_PARALLELISM_PATTERNS) {
    const m = rawText.match(item.regex);
    if (m && m.length > 0) {
      matches.push({ phrase: item.label, count: m.length });
      parallelismCount += m.length;
    }
  }
  const parallelismDensity = parallelismCount * factor; // per 1k words
  const parallelismScore = Math.min(parallelismDensity / 3.5, 1);

  // 2. Repeated 3-grams & 4-grams (structural repetition)
  const trigramCounts = new Map<string, number>();
  for (let i = 0; i <= tokens.length - 3; i++) {
    const tri = `${tokens[i]} ${tokens[i + 1]} ${tokens[i + 2]}`;
    // Exclude if all digits
    if (/^\d+\s+\d+\s+\d+$/.test(tri)) continue;
    trigramCounts.set(tri, (trigramCounts.get(tri) || 0) + 1);
  }

  let repeatedTrigramsTotal = 0;
  for (const [tri, count] of trigramCounts.entries()) {
    if (count >= 3) {
      matches.push({ phrase: tri, count });
      repeatedTrigramsTotal += count;
    }
  }

  const repeatedTriDensity = repeatedTrigramsTotal * factor;
  const nGramScore = Math.min(repeatedTriDensity / 8, 1);

  matches.sort((a, b) => b.count - a.count);

  const rawScore = Math.min(parallelismScore * 0.6 + nGramScore * 0.4, 1);
  const contribution = rawScore > 0.6 ? 'Tinggi' : rawScore > 0.25 ? 'Sedang' : 'Rendah';

  const detail =
    matches.length > 0
      ? `${matches.length} pola pengulangan frase/struktur (${parallelismCount} negasi paralel, ${repeatedTrigramsTotal} repetisi frasa)`
      : 'Tingkat pengulangan struktur normal';

  return {
    categoryResult: {
      id: 'repetition',
      name: 'Pengulangan Frasa & Struktur Paralel',
      detail,
      contribution,
      matches: matches.slice(0, 4),
      rawScore,
    },
    score: rawScore,
  };
}
