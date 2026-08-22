/**
 * Concreteness & Factual Specificity Feature Extractor (Section 31 & v2.1.0 Update)
 * Analyzes density of real-world data points: numbers, dates, units, quotes, proper nouns,
 * as well as grounded personal narrative markers to prevent human story penalization.
 */
import { PreparedTextContext, AiPatternCategoryResult, AiPatternMatch } from '../types';
import { FIRST_PERSON_PRONOUNS } from '../../../data/aiPatterns';

// Precompiled Regexes
const NUMERIC_DATA_REGEX = /\b(?:\d{1,3}(?:\.\d{3})+|\d+(?:,\d+)?|\d+%|Rp\s*[\d.]+|[\d.]+\s*(?:kg|km|meter|liter|persen|ribu|juta|miliar|triliun|jam|hari|tahun|bulan))\b/giu;
const DATE_MONTH_REGEX = /\b(?:\d{1,2}\s+(?:Januari|Februari|Maret|April|Mei|Juni|Juli|Agustus|September|Oktober|November|Desember)|\d{1,2}[-/]\d{1,2}[-/]\d{2,4})\b/giu;
const DIRECT_QUOTE_REGEX = /["“][^"”]{4,100}["”]/gu;

export function extractConcretenessFeature(ctx: PreparedTextContext): {
  categoryResult: AiPatternCategoryResult;
  score: number;
  concretenessDensity: number;
  applicable: boolean;
} {
  const { rawText, sentences, sentenceTokens, tokens, wordCount } = ctx;
  const applicable = wordCount >= 50;

  if (wordCount === 0 || !applicable) {
    return {
      categoryResult: {
        id: 'concreteness',
        name: 'Kekonkretan & Kepadatan Fakta',
        detail: 'Teks belum mencukupi untuk analisis kekonkretan',
        contribution: 'Rendah',
        matches: [],
        rawScore: 0,
        applicable,
      },
      score: 0,
      concretenessDensity: 0,
      applicable,
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
      for (let i = 1; i < words.length; i++) {
        const clean = words[i].replace(/^[^\p{L}]+|[^\p{L}]+$/gu, '');
        if (/^[A-Z\u00C0-\u00DE][a-z\u00DF-\u00FF]+$/.test(clean)) {
          midProperNounCount++;
        }
      }
    }
  }

  // 3. First-person pronoun density across all token positions
  let pronounCount = 0;
  for (const t of tokens) {
    if (FIRST_PERSON_PRONOUNS.has(t)) {
      pronounCount++;
    }
  }
  const pronounDensity = pronounCount * factor; // per 1k words

  // 4. Sentence length variance (rhythm grounding)
  const sentLengths = sentenceTokens.map((s) => s.length).filter((l) => l > 0);
  let sentStdDev = 0;
  if (sentLengths.length >= 3) {
    const avg = sentLengths.reduce((a, b) => a + b, 0) / sentLengths.length;
    const variance = sentLengths.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / sentLengths.length;
    sentStdDev = Math.sqrt(variance);
  }

  // Narrative grounding credit (e.g. personal narrative with varied sentence lengths)
  const narrativeGroundingPoints = (pronounDensity >= 6.0 && sentStdDev >= 5.0) ? Math.min(pronounCount * 0.8, 8) : 0;

  const totalConcretePoints =
    numMatches.length +
    dateMatches.length +
    quoteMatches.length +
    Math.min(midProperNounCount, 15) +
    narrativeGroundingPoints;

  const concretenessDensity = totalConcretePoints * factor; // per 1k words

  if (numMatches.length > 0) matches.push({ phrase: 'Data angka/satuan', count: numMatches.length });
  if (dateMatches.length > 0) matches.push({ phrase: 'Tanggal spesifik', count: dateMatches.length });
  if (quoteMatches.length > 0) matches.push({ phrase: 'Kutipan langsung', count: quoteMatches.length });
  if (midProperNounCount > 0) matches.push({ phrase: 'Nama entitas spesifik', count: midProperNounCount });
  if (narrativeGroundingPoints > 0) matches.push({ phrase: 'Sinyal narasi personal', count: Math.round(narrativeGroundingPoints) });

  // Inverse score:
  // Density < 4 per 1k words in a 200+ word article indicates high abstractness/lack of grounding.
  // Narrative-dense texts (high pronoun + high variance) are shielded from abstractness penalty.
  let rawScore = 0;
  if (wordCount >= 150) {
    if (concretenessDensity < 4.0) {
      rawScore = Math.min((4.0 - concretenessDensity) / 3.5, 1);
    }
  }

  // If text is rich in first-person narrative and varied sentence rhythm, heavily dampen abstractness score
  if (pronounDensity >= 10.0 && sentStdDev >= 5.0) {
    rawScore = Math.max(0, rawScore - 0.7);
  } else if (pronounDensity >= 6.0 && sentStdDev >= 4.5) {
    rawScore = Math.max(0, rawScore - 0.4);
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
      applicable,
    },
    score: rawScore,
    concretenessDensity,
    applicable,
  };
}
