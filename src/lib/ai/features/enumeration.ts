/**
 * Triadic Enumeration ("Rule of Three") Feature Extractor (Section 30)
 * Detects structural list-of-three/four patterns characteristic of generative LLMs.
 * e.g. "efisiensi, produktivitas, dan kualitas hidup"
 */
import { PreparedTextContext, AiPatternCategoryResult, AiPatternMatch } from '../types';

// Precompiled Regex for 3-part or 4-part enumerations with commas and 'dan'/'serta'
const TRIADIC_ENUMERATION_REGEX =
  /\b([\p{L}\p{N}-]+(?:\s+[\p{L}\p{N}-]+){0,3}),\s+([\p{L}\p{N}-]+(?:\s+[\p{L}\p{N}-]+){0,3}),?\s+(?:dan|serta)\s+([\p{L}\p{N}-]+(?:\s+[\p{L}\p{N}-]+){0,3})\b/giu;

export function extractEnumerationFeature(ctx: PreparedTextContext): {
  categoryResult: AiPatternCategoryResult;
  score: number;
} {
  const { rawText, wordCount } = ctx;
  if (wordCount === 0) {
    return {
      categoryResult: {
        id: 'enumeration',
        name: 'Enumerasi Triadik (Rule of Three)',
        detail: 'Tidak ada teks untuk dianalisis',
        contribution: 'Rendah',
        matches: [],
        rawScore: 0,
      },
      score: 0,
    };
  }

  const factor = 1000 / wordCount;
  const matches: AiPatternMatch[] = [];
  const foundMatches = rawText.match(TRIADIC_ENUMERATION_REGEX) || [];

  for (const m of foundMatches) {
    const clean = m.replace(/\s+/g, ' ').trim();
    if (clean.length > 0) {
      matches.push({ phrase: clean, count: 1 });
    }
  }

  const count = matches.length;
  const densityPer1k = count * factor;

  // Normalization:
  // 0–2 per 1k words: normal/natural (low score)
  // > 2 per 1k words: rising
  // > 5.5 per 1k words: approaching 1.0
  let rawScore = 0;
  if (densityPer1k > 2.0) {
    rawScore = Math.min((densityPer1k - 2.0) / 4.0, 1);
  }

  const contribution = rawScore > 0.6 ? 'Tinggi' : rawScore > 0.25 ? 'Sedang' : 'Rendah';
  const detail =
    count > 0
      ? `${count} konstruksi enumerasi tiga unsur (${densityPer1k.toFixed(1)}/1k kata)`
      : 'Tidak ada pola enumerasi triadik berlebih';

  return {
    categoryResult: {
      id: 'enumeration',
      name: 'Enumerasi Triadik (Rule of Three)',
      detail,
      contribution,
      matches: matches.slice(0, 3),
      rawScore,
    },
    score: rawScore,
  };
}
