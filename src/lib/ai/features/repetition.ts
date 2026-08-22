/**
 * Repetition & Structural Parallelism Feature Extractor (v2.1.0)
 * Evaluates structural repetition, negative parallelism, and n-gram patterns,
 * with protection for legitimate SEO keyword targeting.
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

export function extractRepetitionFeature(
  ctx: PreparedTextContext,
  targetKeyword?: string
): {
  categoryResult: AiPatternCategoryResult;
  score: number;
  applicable: boolean;
} {
  const { tokens, rawText, wordCount } = ctx;
  const applicable = wordCount >= 20 && tokens.length >= 20;

  if (!applicable) {
    return {
      categoryResult: {
        id: 'repetition',
        name: 'Pengulangan Frasa & Struktur Paralel',
        detail: 'Teks belum mencukupi untuk analisis pengulangan',
        contribution: 'Rendah',
        matches: [],
        rawScore: 0,
        applicable,
      },
      score: 0,
      applicable,
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

  const normalizedKeyword = targetKeyword ? targetKeyword.toLowerCase().trim() : '';

  let repeatedTrigramsTotal = 0;
  const repeatingTrigramsList: { phrase: string; count: number }[] = [];

  for (const [tri, count] of trigramCounts.entries()) {
    if (count >= 3) {
      // If matches target keyword explicitly, skip or dampen
      if (normalizedKeyword && (tri.includes(normalizedKeyword) || normalizedKeyword.includes(tri))) {
        continue;
      }
      matches.push({ phrase: tri, count });
      repeatingTrigramsList.push({ phrase: tri, count });
      repeatedTrigramsTotal += count;
    }
  }

  // Check if repetition is dominated by a SINGLE focal phrase (classic SEO keyword repetition)
  // vs multiple distinct repeating phrases (LLM structural echo)
  let nGramScore = 0;
  if (repeatingTrigramsList.length > 0) {
    const totalCount = repeatingTrigramsList.reduce((acc, curr) => acc + curr.count, 0);
    const maxCount = Math.max(...repeatingTrigramsList.map((r) => r.count));
    const isSingleFocalPhrase = repeatingTrigramsList.length <= 2 && maxCount / totalCount > 0.65;

    const repeatedTriDensity = repeatedTrigramsTotal * factor;

    if (isSingleFocalPhrase) {
      // Legitimate single-topic/keyword repetition: dampen heavily
      nGramScore = Math.min(Math.max((repeatedTriDensity - 15) / 25, 0), 0.35);
    } else {
      // Multiple distinct repeating template trigrams
      nGramScore = Math.min(repeatedTriDensity / 8, 1);
    }
  }

  matches.sort((a, b) => b.count - a.count);

  const rawScore = Math.min(parallelismScore * 0.65 + nGramScore * 0.35, 1);
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
      applicable,
    },
    score: rawScore,
    applicable,
  };
}
