/**
 * Paragraph Transition Distribution & Entropy Feature Extractor (v2.1.0)
 */
import { PARAGRAPH_START_TRANSITIONS } from '../../../data/aiPatterns';
import { PreparedTextContext, AiPatternCategoryResult, AiPatternMatch } from '../types';

// Precompiled Regexes for transitions at paragraph beginnings
const TRANSITION_REGEXES = PARAGRAPH_START_TRANSITIONS.map((transition) => ({
  transition,
  regex: new RegExp(`^${transition.replace(/\s+/g, '\\s+')}(?:[,\\s]|$)`, 'iu'),
}));

export function extractTransitionFeature(ctx: PreparedTextContext): {
  categoryResult: AiPatternCategoryResult;
  score: number;
  applicable: boolean;
} {
  const { paragraphs, wordCount } = ctx;
  const totalParagraphs = paragraphs.length;
  const applicable = totalParagraphs >= 2 && wordCount >= 50;

  if (!applicable || wordCount === 0) {
    return {
      categoryResult: {
        id: 'transition',
        name: 'Transisi Awal Paragraf',
        detail: 'Jumlah paragraf belum mencukupi untuk analisis transisi (butuh minimal 2 paragraf)',
        contribution: 'Rendah',
        matches: [],
        rawScore: 0,
        applicable,
      },
      score: 0,
      applicable,
    };
  }

  let transitionParagraphsCount = 0;
  const transitionMatchesMap = new Map<string, number>();

  for (const para of paragraphs) {
    for (const { transition, regex } of TRANSITION_REGEXES) {
      if (regex.test(para)) {
        transitionParagraphsCount++;
        transitionMatchesMap.set(transition, (transitionMatchesMap.get(transition) || 0) + 1);
        break;
      }
    }
  }

  const matches: AiPatternMatch[] = Array.from(transitionMatchesMap.entries())
    .map(([phrase, count]) => ({ phrase, count }))
    .sort((a, b) => b.count - a.count);

  const transitionRatio = transitionParagraphsCount / totalParagraphs;

  // Repetition of identical transition openers
  const maxSingleTransition = matches.length > 0 ? matches[0].count : 0;
  const repetitionRatio = maxSingleTransition / totalParagraphs;

  // If > 25% of paragraphs start with a transition or single transition is repeated 3+ times
  let rawScore = 0;
  if (transitionRatio > 0.25 || repetitionRatio > 0.3) {
    rawScore = Math.min(
      Math.max(
        transitionRatio > 0.25 ? (transitionRatio - 0.25) / 0.45 : 0,
        repetitionRatio > 0.3 ? (repetitionRatio - 0.3) / 0.4 : 0
      ),
      1
    );
  }

  const contribution = rawScore > 0.6 ? 'Tinggi' : rawScore > 0.25 ? 'Sedang' : 'Rendah';
  const detail =
    transitionParagraphsCount > 0
      ? `${transitionParagraphsCount} dari ${totalParagraphs} paragraf diawali kata transisi (${matches.length} variasi transisi)`
      : 'Penggunaan kata transisi paragraf normal dan bervariasi';

  return {
    categoryResult: {
      id: 'transition',
      name: 'Transisi Awal Paragraf',
      detail,
      contribution,
      matches,
      rawScore,
      applicable,
    },
    score: rawScore,
    applicable,
  };
}
