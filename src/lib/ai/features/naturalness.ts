/**
 * Human Naturalness & Mitigating Signals Extractor (Section 9 & v2.1.0 Update)
 * Detects natural rhythm, informal markers, first-person experiences, and factual depth.
 */
import {
  INFORMAL_MARKERS,
  FIRST_PERSON_EXPERIENCE_MARKERS,
  FIRST_PERSON_PRONOUNS,
} from '../../../data/aiPatterns';
import { PreparedTextContext, AiPatternCategoryResult, AiPatternMatch } from '../types';

function createPhraseRegexes(list: string[]) {
  return list.map((phrase) => ({
    phrase,
    regex: new RegExp(`(?:^|(?<=[^\\p{L}\\p{N}]))${phrase.replace(/\s+/g, '\\s+')}(?=[^\\p{L}\\p{N}]|$)`, 'giu'),
  }));
}

const INFORMAL_REGEXES = createPhraseRegexes(INFORMAL_MARKERS);
const FIRST_PERSON_REGEXES = createPhraseRegexes(FIRST_PERSON_EXPERIENCE_MARKERS);

export function extractNaturalnessFeature(
  ctx: PreparedTextContext,
  concretenessDensity: number
): {
  categoryResult: AiPatternCategoryResult;
  penaltyScore: number;
  applicable: boolean;
} {
  const { rawText, sentenceTokens, tokens, wordCount } = ctx;
  const applicable = wordCount >= 30;

  if (wordCount === 0 || !applicable) {
    return {
      categoryResult: {
        id: 'naturalness',
        name: 'Sinyal Naturalitas & Keaslian Manusia',
        detail: 'Tidak ada teks untuk dianalisis',
        contribution: 'Rendah',
        matches: [],
        rawScore: 0,
        applicable,
      },
      penaltyScore: 0,
      applicable,
    };
  }

  const factor = 1000 / wordCount;
  const matches: AiPatternMatch[] = [];

  // 1. Informal markers
  let informalCount = 0;
  for (const { phrase, regex } of INFORMAL_REGEXES) {
    const m = rawText.match(regex);
    if (m && m.length > 0) {
      matches.push({ phrase, count: m.length });
      informalCount += m.length;
    }
  }

  // 2. First-person experience markers
  let experienceCount = 0;
  for (const { phrase, regex } of FIRST_PERSON_REGEXES) {
    const m = rawText.match(regex);
    if (m && m.length > 0) {
      matches.push({ phrase, count: m.length });
      experienceCount += m.length;
    }
  }

  // 3. First-person pronoun density across all positions
  let pronounCount = 0;
  for (const t of tokens) {
    if (FIRST_PERSON_PRONOUNS.has(t)) {
      pronounCount++;
    }
  }
  const pronounDensity = pronounCount * factor;

  // 4. Sentence length stdDev (rhythm variance)
  const sentLengths = sentenceTokens.map((s) => s.length).filter((l) => l > 0);
  let sentStdDev = 0;
  if (sentLengths.length >= 3) {
    const avg = sentLengths.reduce((a, b) => a + b, 0) / sentLengths.length;
    const variance = sentLengths.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / sentLengths.length;
    sentStdDev = Math.sqrt(variance);
  }
  // High variance (stdDev > 5.5 words) indicates lively, varied sentence pacing
  const varianceScore = sentStdDev > 5.5 ? Math.min((sentStdDev - 5.5) / 5.5, 1) : 0;

  // 5. Concreteness bonus
  const concreteBonus = concretenessDensity > 6.0 ? Math.min((concretenessDensity - 6.0) / 8.0, 1) : 0;

  const informalDensity = informalCount * factor;
  const experienceDensity = experienceCount * factor;

  const informalScore = Math.min(informalDensity / 2.5, 1);
  const experienceScore = Math.min(experienceDensity / 1.5, 1);
  const pronounScore = pronounDensity > 5.0 ? Math.min((pronounDensity - 5.0) / 10.0, 1) : 0;

  // Overall naturalness score (0..1)
  const penaltyScore = Math.min(
    varianceScore * 0.30 +
      concreteBonus * 0.25 +
      experienceScore * 0.20 +
      informalScore * 0.15 +
      pronounScore * 0.10,
    1
  );

  const contribution = penaltyScore > 0.5 ? 'Tinggi' : penaltyScore > 0.2 ? 'Sedang' : 'Rendah';
  const detail =
    penaltyScore > 0.35
      ? `Ritme tulisan dinamis (variasi kalimat ±${sentStdDev.toFixed(1)} kata), memiliki nuansa alami/faktual`
      : 'Gaya penulisan netral';

  return {
    categoryResult: {
      id: 'naturalness',
      name: 'Sinyal Naturalitas & Keaslian Manusia',
      detail,
      contribution,
      matches: matches.slice(0, 4),
      rawScore: penaltyScore,
      applicable,
    },
    penaltyScore,
    applicable,
  };
}
