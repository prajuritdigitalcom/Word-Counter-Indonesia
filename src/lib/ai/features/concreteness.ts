/**
 * Concreteness & Factual Specificity Feature Extractor (Section 31)
 * Analyzes density of real-world data points: numbers, dates, units, quotes, and proper nouns.
 * Low concreteness provides a mild signal for generic ungrounded AI text.
 */
import { PreparedTextContext, AiPatternCategoryResult, AiPatternMatch } from '../types';

// Precompiled Regexes
const NUMERIC_DATA_REGEX = /\b(?:\d{1,3}(?:\.\d{3})+|\d+(?:,\d+)?|\d+%|Rp\s*[\d.]+|[\d.]+\s*(?:kg|km|meter|liter|persen|ribu|juta|miliar|triliun|jam|hari|tahun|bulan))\b/giu;
const DATE_MONTH_REGEX = /\b(?:\d{1,2}\s+(?:Januari|Februari|Maret|April|Mei|Juni|Juli|Agustus|September|Oktober|November|Desember)|\d{1,2}[-/]\d{1,2}[-/]\d{2,4})\b/giu;
const DIRECT_QUOTE_REGEX = /["“][^"”]{4,100}["”]/gu;

export function extractConcretenessFeature(ctx: PreparedTextContext): {
  categoryResult: AiPatternCategoryResult;
  score: number;
  concretenessDensity: number;
} {
  const { rawText, sentences, wordCount } = ctx;
  if (wordCount === 0) {
    return {
      categoryResult: {
        id: 'concreteness',
        name: 'Kekonkretan & Kepadatan Fakta',
        detail: 'Tidak ada teks untuk dianalisis',
        contribution: 'Rendah',
        matches: [],
        rawScore: 0,
      },
      score: 0,
      concretenessDensity: 0,
    };
  }

  const factor = 1000 / wordCount;
  const matches: AiPatternMatch[] = [];

  // 1. Numeric & measurement points
  const numMatches = rawText.match(NUMERIC_DATA_REGEX) || [];
  const dateMatches = rawText.match(DATE_MONTH_REGEX) || [];
  const quoteMatches = rawText.match(DIRECT_QUOTE_REGEX) || [];

  // 2. Mid-sentence proper nouns (capitalized words not at the beginning of sentence)
  let midProperNounCount = 0;
  for (const sentence of sentences) {
    const words = sentence.trim().split(/\s+/);
    if (words.length > 1) {
      // Check words after the first word
      for (let i = 1; i < words.length; i++) {
        const clean = words[i].replace(/^[^\p{L}]+|[^\p{L}]+$/gu, '');
        if (/^[A-Z\u00C0-\u00DE][a-z\u00DF-\u00FF]+$/.test(clean)) {
          midProperNounCount++;
        }
      }
    }
  }

  const totalConcretePoints = numMatches.length + dateMatches.length + quoteMatches.length + Math.min(midProperNounCount, 15);
  const concretenessDensity = totalConcretePoints * factor; // per 1k words

  if (numMatches.length > 0) matches.push({ phrase: 'Data angka/satuan', count: numMatches.length });
  if (dateMatches.length > 0) matches.push({ phrase: 'Tanggal spesifik', count: dateMatches.length });
  if (quoteMatches.length > 0) matches.push({ phrase: 'Kutipan langsung', count: quoteMatches.length });
  if (midProperNounCount > 0) matches.push({ phrase: 'Nama entitas spesifik', count: midProperNounCount });

  // Inverse score:
  // Density < 4 per 1k words in a 300+ word article indicates high abstractness/lack of grounding
  let rawScore = 0;
  if (wordCount >= 200) {
    if (concretenessDensity < 4.0) {
      rawScore = Math.min((4.0 - concretenessDensity) / 3.5, 1);
    }
  }

  const contribution = rawScore > 0.6 ? 'Tinggi' : rawScore > 0.25 ? 'Sedang' : 'Rendah';
  const detail =
    concretenessDensity > 8
      ? `Tingkat kekonkretan tinggi (${concretenessDensity.toFixed(1)} data/fakta per 1k kata) — tulisan kaya referensi nyata`
      : concretenessDensity >= 3
      ? `Tingkat kekonkretan sedang (${concretenessDensity.toFixed(1)} data/fakta per 1k kata)`
      : `Teks cenderung abstrak tanpa data/angka spesifik (${concretenessDensity.toFixed(1)} data/fakta per 1k kata)`;

  return {
    categoryResult: {
      id: 'concreteness',
      name: 'Kekonkretan & Kepadatan Fakta',
      detail,
      contribution,
      matches,
      rawScore,
    },
    score: rawScore,
    concretenessDensity,
  };
}
