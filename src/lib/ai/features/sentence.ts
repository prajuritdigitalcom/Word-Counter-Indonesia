/**
 * Sentence-Level Stylometric Feature Extractor
 * Detects overly uniform sentence lengths and repetitive sentence openings.
 */
import { PreparedTextContext, AiPatternCategoryResult, AiPatternMatch } from '../types';

export function extractSentenceFeature(ctx: PreparedTextContext): {
  categoryResult: AiPatternCategoryResult;
  score: number;
} {
  const { sentences, sentenceTokens, wordCount } = ctx;
  const sentenceCount = sentences.length;

  if (sentenceCount < 3 || wordCount === 0) {
    return {
      categoryResult: {
        id: 'sentence',
        name: 'Struktur & Variasi Kalimat',
        detail: 'Jumlah kalimat belum mencukupi untuk analisis variasi',
        contribution: 'Rendah',
        matches: [],
        rawScore: 0,
      },
      score: 0,
    };
  }

  // 1. Calculate sentence lengths and variance
  const lengths = sentenceTokens.map((s) => s.length).filter((l) => l > 0);
  if (lengths.length === 0) {
    return {
      categoryResult: {
        id: 'sentence',
        name: 'Struktur & Variasi Kalimat',
        detail: 'Variasi panjang kalimat normal',
        contribution: 'Rendah',
        matches: [],
        rawScore: 0,
      },
      score: 0,
    };
  }

  const avgLength = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  const variance = lengths.reduce((acc, val) => acc + Math.pow(val - avgLength, 2), 0) / lengths.length;
  const stdDev = Math.sqrt(variance);

  // AI text often has very low sentence standard deviation (< 4.5) with avg length tightly around 14-22 words
  const isTooUniform = stdDev < 4.2 && avgLength >= 12 && avgLength <= 24;
  const uniformityScore = isTooUniform ? Math.min((4.2 - stdDev) / 3.0, 1) : 0;

  // 2. Sentence opening diversity & repetition (first 2 words)
  const openingCounts = new Map<string, number>();
  for (const tokens of sentenceTokens) {
    if (tokens.length >= 2) {
      const opening = `${tokens[0]} ${tokens[1]}`;
      openingCounts.set(opening, (openingCounts.get(opening) || 0) + 1);
    } else if (tokens.length === 1) {
      const opening = tokens[0];
      openingCounts.set(opening, (openingCounts.get(opening) || 0) + 1);
    }
  }

  const repeatedOpenings: AiPatternMatch[] = [];
  let maxOpeningRepeat = 0;
  for (const [opening, count] of openingCounts.entries()) {
    if (count >= 2) {
      repeatedOpenings.push({ phrase: opening, count });
    }
    if (count > maxOpeningRepeat) maxOpeningRepeat = count;
  }
  repeatedOpenings.sort((a, b) => b.count - a.count);

  const repeatedOpeningRatio = maxOpeningRepeat / sentenceCount;
  const openingScore = repeatedOpeningRatio > 0.25 ? Math.min((repeatedOpeningRatio - 0.25) / 0.35, 1) : 0;

  // 3. Middle-length bin concentration (ratio of sentences in 12-24 words)
  const middleBinCount = lengths.filter((l) => l >= 12 && l <= 24).length;
  const middleBinRatio = middleBinCount / lengths.length;
  const binConcentrationScore = middleBinRatio > 0.75 ? Math.min((middleBinRatio - 0.75) / 0.25, 1) : 0;

  const rawScore = Math.min(uniformityScore * 0.45 + openingScore * 0.35 + binConcentrationScore * 0.2, 1);
  const contribution = rawScore > 0.6 ? 'Tinggi' : rawScore > 0.3 ? 'Sedang' : 'Rendah';

  const detail =
    isTooUniform || maxOpeningRepeat >= 3
      ? `Rata-rata ${avgLength.toFixed(1)} kata/kalimat (variasi rendah: ±${stdDev.toFixed(1)} kata), ${repeatedOpenings.length} pola pembuka berulang`
      : `Rata-rata ${avgLength.toFixed(1)} kata/kalimat (variasi sehat: ±${stdDev.toFixed(1)} kata)`;

  return {
    categoryResult: {
      id: 'sentence',
      name: 'Struktur & Variasi Kalimat',
      detail,
      contribution,
      matches: repeatedOpenings.slice(0, 4),
      rawScore,
    },
    score: rawScore,
  };
}
