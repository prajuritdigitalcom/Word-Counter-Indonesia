/**
 * AI Phrase & Specificity Feature Extractor (v2.1.0)
 * Penalizes/dampens common formal Indonesian phrases while keeping high-confidence AI phrases distinct.
 */
import {
  AI_ASSISTANT_META_PHRASES,
  CLICHE_PHRASES,
  VAGUE_ATTRIBUTION_PHRASES,
  COMMON_FORMAL_PHRASES,
} from '../../../data/aiPatterns';
import { PreparedTextContext, AiPatternCategoryResult, AiPatternMatch } from '../types';

function createPhraseRegexes(list: string[]) {
  return list.map((phrase) => ({
    phrase,
    regex: new RegExp(`(?:^|(?<=[^\\p{L}\\p{N}]))${phrase.replace(/\s+/g, '\\s+')}(?=[^\\p{L}\\p{N}]|$)`, 'giu'),
  }));
}

const META_REGEXES = createPhraseRegexes(AI_ASSISTANT_META_PHRASES);
const CLICHE_REGEXES = createPhraseRegexes(CLICHE_PHRASES);
const VAGUE_REGEXES = createPhraseRegexes(VAGUE_ATTRIBUTION_PHRASES);
const COMMON_FORMAL_REGEXES = createPhraseRegexes(COMMON_FORMAL_PHRASES);

export function extractAiPhraseFeature(ctx: PreparedTextContext): {
  categoryResult: AiPatternCategoryResult;
  score: number;
  applicable: boolean;
} {
  const { rawText, wordCount } = ctx;
  const applicable = wordCount >= 20;

  if (!applicable || wordCount === 0) {
    return {
      categoryResult: {
        id: 'aiSpecificPhrase',
        name: 'Frasa Khas Asisten & Klise AI',
        detail: 'Tidak ada teks untuk dianalisis',
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

  // 1. High Specificity: AI Assistant Meta Phrases
  let metaCount = 0;
  for (const { phrase, regex } of META_REGEXES) {
    const m = rawText.match(regex);
    if (m && m.length > 0) {
      matches.push({ phrase, count: m.length });
      metaCount += m.length;
    }
  }

  // 2. Medium Specificity: Clichés & Vague Attribution
  let clicheCount = 0;
  for (const { phrase, regex } of CLICHE_REGEXES) {
    const m = rawText.match(regex);
    if (m && m.length > 0) {
      matches.push({ phrase, count: m.length });
      clicheCount += m.length;
    }
  }

  let vagueCount = 0;
  for (const { phrase, regex } of VAGUE_REGEXES) {
    const m = rawText.match(regex);
    if (m && m.length > 0) {
      matches.push({ phrase, count: m.length });
      vagueCount += m.length;
    }
  }

  // 3. Low Specificity: Common Formal Indonesian Phrases
  let formalCount = 0;
  for (const { regex } of COMMON_FORMAL_REGEXES) {
    const m = rawText.match(regex);
    if (m && m.length > 0) {
      formalCount += m.length;
    }
  }

  // Densities per 1,000 words
  const metaDensity = metaCount * factor;
  const clicheDensity = (clicheCount + vagueCount) * factor;
  const formalDensity = formalCount * factor;

  // Meta score: 1-2 per 1k words is significant
  const metaScore = Math.min(metaDensity / 2.0, 1);
  // Cliché score: 4-6 per 1k words
  const clicheScore = Math.min(clicheDensity / 5.0, 1);
  // Formal score: heavily dampened (max contribution only 0.15)
  const formalScore = Math.min(formalDensity / 12.0, 0.15);

  const rawScore = Math.min(metaScore * 0.65 + clicheScore * 0.3 + formalScore * 0.05, 1);
  const contribution = rawScore > 0.6 ? 'Tinggi' : rawScore > 0.25 ? 'Sedang' : 'Rendah';

  matches.sort((a, b) => b.count - a.count);

  const detail =
    metaCount > 0
      ? `${metaCount} frasa khas chatbot/asisten AI, ${clicheCount + vagueCount} frasa klise/atribusi samar`
      : clicheCount + vagueCount > 0
      ? `${clicheCount + vagueCount} frasa klise/atribusi samar terdeteksi`
      : 'Tidak ada frasa khas AI atau klise berlebih';

  return {
    categoryResult: {
      id: 'aiSpecificPhrase',
      name: 'Frasa Khas Asisten & Klise AI',
      detail,
      contribution,
      matches: matches.slice(0, 5),
      rawScore,
      applicable,
    },
    score: rawScore,
    applicable,
  };
}
