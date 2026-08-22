/**
 * Paragraph-Level Stylometric Feature Extractor (v2.1.0)
 * Detects rigid formulaic paragraph structures and unnaturally uniform paragraph lengths.
 */
import { PreparedTextContext, AiPatternCategoryResult } from '../types';

export function extractParagraphFeature(ctx: PreparedTextContext): {
  categoryResult: AiPatternCategoryResult;
  score: number;
  applicable: boolean;
} {
  const { paragraphs, paragraphTokens, wordCount } = ctx;
  const paragraphCount = paragraphs.length;
  const applicable = paragraphCount >= 3 && wordCount >= 50;

  if (!applicable || wordCount === 0) {
    return {
      categoryResult: {
        id: 'paragraph',
        name: 'Struktur & Variasi Paragraf',
        detail: 'Jumlah paragraf belum mencukupi untuk analisis keseragaman (butuh minimal 3 paragraf)',
        contribution: 'Rendah',
        matches: [],
        rawScore: 0,
        applicable,
      },
      score: 0,
      applicable,
    };
  }

  const lengths = paragraphTokens.map((p) => p.length).filter((l) => l > 0);
  const avgWordsPerPara = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  const variance = lengths.reduce((acc, val) => acc + Math.pow(val - avgWordsPerPara, 2), 0) / lengths.length;
  const stdDev = Math.sqrt(variance);

  // Overly uniform paragraph lengths (e.g., standard deviation < 10 words with avg 35-85 words)
  const isTooUniform = stdDev < 10 && avgWordsPerPara >= 35 && avgWordsPerPara <= 85;
  const uniformityScore = isTooUniform ? Math.min((10 - stdDev) / 8, 1) : 0;

  const rawScore = uniformityScore;
  const contribution = rawScore > 0.6 ? 'Tinggi' : rawScore > 0.25 ? 'Sedang' : 'Rendah';

  const detail = isTooUniform
    ? `${paragraphCount} paragraf dengan panjang sangat seragam (rata-rata ${avgWordsPerPara.toFixed(0)} ± ${stdDev.toFixed(1)} kata)`
    : `${paragraphCount} paragraf dengan variasi panjang yang wajar (rata-rata ${avgWordsPerPara.toFixed(0)} ± ${stdDev.toFixed(1)} kata)`;

  return {
    categoryResult: {
      id: 'paragraph',
      name: 'Struktur & Variasi Paragraf',
      detail,
      contribution,
      matches: [],
      rawScore,
      applicable,
    },
    score: rawScore,
    applicable,
  };
}
