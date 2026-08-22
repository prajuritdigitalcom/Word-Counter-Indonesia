/**
 * AI Writing Pattern Master Analyzer (v2.1.0)
 * Multi-Signal Stylometric Heuristic Engine for Indonesian text.
 */
import { MIN_WORDS_FOR_SCORING, ENGINE_VERSION } from '../../data/aiPatterns';
import { countWords } from '../textAnalyzer';
import {
  PreparedTextContext,
  AiPatternResult,
  AiPatternCategoryResult,
  AiFeatureScores,
  AiFeatureApplicable,
} from './types';

// Feature extractors
import { extractLexicalFeature } from './features/lexical';
import { extractSentenceFeature } from './features/sentence';
import { extractParagraphFeature } from './features/paragraph';
import { extractRepetitionFeature } from './features/repetition';
import { extractEnumerationFeature } from './features/enumeration';
import { extractConcretenessFeature } from './features/concreteness';
import { extractTransitionFeature } from './features/transition';
import { extractPunctuationFeature } from './features/punctuation';
import { extractAiPhraseFeature } from './features/aiPhrase';
import { extractNaturalnessFeature } from './features/naturalness';
import { calculateAggregatedScore } from './scoring';

/**
 * Shared Tokenization & Context Preparation
 */
function prepareTextContext(rawText: string): PreparedTextContext {
  const trimmedText = rawText.trim();
  const wordCount = countWords(trimmedText);

  const paragraphs = trimmedText
    .split(/\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  // Split sentences respecting common Indonesian abbreviations and numbers
  const sanitized = trimmedText
    .replace(/(\d)\.(\d)/g, '$1__DOT__$2')
    .replace(/\b(Dr|dr|Prof|prof|Ir|ir|S\.Kom|S\.Pd|S\.H|S\.E|dkk|dll|dst|dsb|tsb|Jl|No|Yth)\.(?=\s|$)/gi, '$1__ABBR__');

  const sentences = sanitized
    .split(/(?<=[.!?])(?:\s+|$)/)
    .map((s) => s.replace(/__DOT__/g, '.').replace(/__ABBR__/g, '.').trim())
    .filter((s) => s.length > 0 && /[a-zA-Z0-9\u00C0-\u024F\u1E00-\u1EFF]/.test(s));

  // Shared lowercased word tokens
  const tokens = trimmedText
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
    .split(/\s+/)
    .map((t) => t.replace(/^-+|-+$/g, ''))
    .filter((t) => t.length > 0);

  const sentenceTokens = sentences.map((sent) =>
    sent
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
      .split(/\s+/)
      .map((t) => t.replace(/^-+|-+$/g, ''))
      .filter((t) => t.length > 0)
  );

  const paragraphTokens = paragraphs.map((para) =>
    para
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
      .split(/\s+/)
      .map((t) => t.replace(/^-+|-+$/g, ''))
      .filter((t) => t.length > 0)
  );

  return {
    rawText,
    trimmedText,
    wordCount,
    paragraphs,
    sentences,
    tokens,
    sentenceTokens,
    paragraphTokens,
  };
}

export function analyzeAiPatterns(text: string, targetKeyword?: string): AiPatternResult {
  if (!text || text.trim().length === 0) {
    return {
      status: 'empty',
      engineVersion: ENGINE_VERSION,
      wordCount: 0,
      score: 0,
      label: null,
      labelText: null,
      confidence: null,
      activeCategoriesCount: 0,
      categories: [],
    };
  }

  const ctx = prepareTextContext(text);

  // Under threshold (< 150 words): Return tooShort status without numeric score
  if (ctx.wordCount < MIN_WORDS_FOR_SCORING) {
    return {
      status: 'tooShort',
      engineVersion: ENGINE_VERSION,
      wordCount: ctx.wordCount,
      score: 0,
      label: null,
      labelText: null,
      confidence: null,
      activeCategoriesCount: 0,
      categories: [],
    };
  }

  // Extract all 10 features
  const lexical = extractLexicalFeature(ctx);
  const sentence = extractSentenceFeature(ctx);
  const paragraph = extractParagraphFeature(ctx);
  const repetition = extractRepetitionFeature(ctx, targetKeyword);
  const enumeration = extractEnumerationFeature(ctx);
  const concreteness = extractConcretenessFeature(ctx);
  const transition = extractTransitionFeature(ctx);
  const punctuation = extractPunctuationFeature(ctx);
  const aiPhrase = extractAiPhraseFeature(ctx);
  const naturalness = extractNaturalnessFeature(ctx, concreteness.concretenessDensity);

  const featureScores: AiFeatureScores = {
    lexical: lexical.score,
    sentence: sentence.score,
    paragraph: paragraph.score,
    repetition: repetition.score,
    enumeration: enumeration.score,
    concreteness: concreteness.score,
    transition: transition.score,
    punctuation: punctuation.score,
    aiSpecificPhrase: aiPhrase.score,
    naturalnessPenalty: naturalness.penaltyScore,
  };

  const featureApplicable: AiFeatureApplicable = {
    lexical: lexical.applicable,
    sentence: sentence.applicable,
    paragraph: paragraph.applicable,
    repetition: repetition.applicable,
    enumeration: enumeration.applicable,
    concreteness: concreteness.applicable,
    transition: transition.applicable,
    punctuation: punctuation.applicable,
    aiSpecificPhrase: aiPhrase.applicable,
    naturalnessPenalty: naturalness.applicable,
  };

  // Calculate aggregated score and tiers
  const aggregated = calculateAggregatedScore(featureScores, featureApplicable, ctx.wordCount);

  const categories: AiPatternCategoryResult[] = [
    aiPhrase.categoryResult,
    repetition.categoryResult,
    enumeration.categoryResult,
    sentence.categoryResult,
    transition.categoryResult,
    lexical.categoryResult,
    concreteness.categoryResult,
    punctuation.categoryResult,
    paragraph.categoryResult,
    naturalness.categoryResult,
  ];

  return {
    status: 'scored',
    engineVersion: ENGINE_VERSION,
    wordCount: ctx.wordCount,
    score: aggregated.score,
    label: aggregated.label,
    labelText: aggregated.labelText,
    confidence: aggregated.confidence,
    confidenceDetail: aggregated.confidenceDetail,
    activeCategoriesCount: aggregated.activeCategoriesCount,
    eligibleCategoriesCount: aggregated.eligibleCategoriesCount,
    categories,
    featureScores,
  };
}
