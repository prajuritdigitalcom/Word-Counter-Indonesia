/**
 * Lexical Stylometric Feature Extractor
 */
import { GENERIC_VOCABULARY, INDONESIAN_FUNCTION_WORDS } from '../../../data/aiPatterns';
import { PreparedTextContext, AiPatternCategoryResult, AiPatternMatch } from '../types';

// Precompiled Regex for generic vocabulary matching
const GENERIC_VOCAB_REGEXES = GENERIC_VOCABULARY.map((word) => ({
  word,
  regex: new RegExp(`(?:^|(?<=[^\\p{L}\\p{N}]))${word.replace(/\s+/g, '\\s+')}(?=[^\\p{L}\\p{N}]|$)`, 'giu'),
}));

/**
 * Calculate Mean Segmental Type-Token Ratio (MSTTR)
 * Divides text into 100-word blocks to prevent text-length bias on TTR.
 */
function calculateMSTTR(tokens: string[], segmentSize = 100): number {
  if (tokens.length < segmentSize) {
    return new Set(tokens).size / Math.max(tokens.length, 1);
  }
  let sumTTR = 0;
  let segments = 0;
  for (let i = 0; i <= tokens.length - segmentSize; i += segmentSize) {
    const chunk = tokens.slice(i, i + segmentSize);
    sumTTR += new Set(chunk).size / segmentSize;
    segments++;
  }
  return segments > 0 ? sumTTR / segments : 0;
}

export function extractLexicalFeature(ctx: PreparedTextContext): {
  categoryResult: AiPatternCategoryResult;
  score: number;
} {
  const { tokens, wordCount } = ctx;
  if (wordCount === 0 || tokens.length === 0) {
    return {
      categoryResult: {
        id: 'lexical',
        name: 'Keragaman Kosakata & Kata Generik',
        detail: 'Tidak ada teks untuk dianalisis',
        contribution: 'Rendah',
        matches: [],
        rawScore: 0,
      },
      score: 0,
    };
  }

  const factor = 1000 / wordCount;

  // 1. Generic vocabulary density
  const genericMatches: AiPatternMatch[] = [];
  let genericTotal = 0;

  for (const { word, regex } of GENERIC_VOCAB_REGEXES) {
    const m = ctx.rawText.match(regex);
    if (m && m.length > 0) {
      genericMatches.push({ phrase: word, count: m.length });
      genericTotal += m.length;
    }
  }
  genericMatches.sort((a, b) => b.count - a.count);

  const genericDensity = genericTotal * factor; // per 1000 words
  // AI text often has generic density > 15-25 per 1k words
  const genericScore = Math.min(Math.max((genericDensity - 8) / 20, 0), 1);

  // 2. MSTTR (Type-Token Ratio across 100-word chunks)
  const msttr = calculateMSTTR(tokens);
  // Extremely uniform vocabulary (< 0.55 MSTTR) adds a slight AI signal; rich vocab (> 0.72) is natural
  const msttrScore = msttr < 0.58 ? Math.min((0.58 - msttr) / 0.18, 1) : 0;

  // 3. Function words ratio
  let functionWordCount = 0;
  for (const t of tokens) {
    if (INDONESIAN_FUNCTION_WORDS.has(t)) {
      functionWordCount++;
    }
  }
  const functionRatio = functionWordCount / tokens.length;
  // Standard Indonesian function word ratio is 0.35-0.50. Very high (>0.56) indicates boilerplate padding.
  const functionScore = functionRatio > 0.54 ? Math.min((functionRatio - 0.54) / 0.15, 1) : 0;

  // Aggregate lexical raw score (0..1)
  const rawScore = Math.min(genericScore * 0.55 + msttrScore * 0.25 + functionScore * 0.2, 1);

  const contribution = rawScore > 0.65 ? 'Tinggi' : rawScore > 0.3 ? 'Sedang' : 'Rendah';
  const detail =
    genericTotal > 0
      ? `${genericTotal} kata/frasa generik (${genericDensity.toFixed(1)}/1k kata), rasio variasi ${Math.round(msttr * 100)}%`
      : `Keragaman kosakata normal (${Math.round(msttr * 100)}%)`;

  return {
    categoryResult: {
      id: 'lexical',
      name: 'Keragaman Kosakata & Kata Generik',
      detail,
      contribution,
      matches: genericMatches.slice(0, 5),
      rawScore,
    },
    score: rawScore,
  };
}
