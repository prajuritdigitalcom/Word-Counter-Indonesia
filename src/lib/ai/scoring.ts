/**
 * Nonlinear Multi-Signal Scoring Engine (v2.0.0)
 */
import { FEATURE_WEIGHTS, MIN_CATEGORIES_FOR_HIGH_TIER } from '../../data/aiPatterns';
import { AiFeatureScores, AiPatternLevel } from './types';

/**
 * Smoothstep non-linear saturation curve
 */
export function smoothstep(x: number, edge0 = 0.0, edge1 = 1.0): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/**
 * Calculate final aggregated score (0..100) using feature weights,
 * naturalness mitigation, and nonlinear scaling.
 */
export function calculateAggregatedScore(
  features: AiFeatureScores,
  wordCount: number
): {
  score: number;
  label: AiPatternLevel;
  labelText: string;
  confidence: AiPatternLevel;
  activeCategoriesCount: number;
} {
  // Sum positive AI indicators
  const positiveWeighted =
    features.lexical * FEATURE_WEIGHTS.lexical +
    features.sentence * FEATURE_WEIGHTS.sentence +
    features.paragraph * FEATURE_WEIGHTS.paragraph +
    features.repetition * FEATURE_WEIGHTS.repetition +
    features.enumeration * FEATURE_WEIGHTS.enumeration +
    features.concreteness * FEATURE_WEIGHTS.concreteness +
    features.transition * FEATURE_WEIGHTS.transition +
    features.punctuation * FEATURE_WEIGHTS.punctuation +
    features.aiSpecificPhrase * FEATURE_WEIGHTS.aiSpecificPhrase;

  // Subtract naturalness mitigation
  const netScore = Math.max(0, positiveWeighted - features.naturalnessPenalty * FEATURE_WEIGHTS.naturalnessPenalty);

  // Apply smoothstep saturation curve to prevent single runaway features
  const saturated = smoothstep(netScore, 0.02, 0.75);
  const finalScore = Math.min(Math.round(saturated * 100), 100);

  // Count active feature categories (score > 0.15)
  const activeCategoriesCount = [
    features.lexical,
    features.sentence,
    features.paragraph,
    features.repetition,
    features.enumeration,
    features.concreteness,
    features.transition,
    features.punctuation,
    features.aiSpecificPhrase,
  ].filter((s) => s > 0.15).length;

  // Determine Confidence
  let confidence: AiPatternLevel = 'sedang';
  if (wordCount < 300) {
    confidence = features.aiSpecificPhrase > 0.5 ? 'sedang' : 'rendah';
  } else if (wordCount >= 800 && activeCategoriesCount >= 4) {
    confidence = 'tinggi';
  } else if (wordCount >= 300) {
    confidence = 'sedang';
  }

  // Determine Label and LabelText with Multi-Category Convergence protection
  let label: AiPatternLevel = 'rendah';
  let labelText = 'Pola AI Rendah';

  if (finalScore >= 50) {
    if (activeCategoriesCount >= MIN_CATEGORIES_FOR_HIGH_TIER) {
      label = 'tinggi';
      labelText = finalScore >= 75 ? 'Pola AI Sangat Tinggi' : 'Pola AI Tinggi';
    } else {
      // Convergence protection: single dominant feature without corroboration downgrades to 'sedang'
      label = 'sedang';
      labelText = 'Pola AI Sedang';
    }
  } else if (finalScore >= 25) {
    label = 'sedang';
    labelText = 'Pola AI Sedang';
  } else {
    label = 'rendah';
    labelText = 'Pola AI Rendah';
  }

  return {
    score: finalScore,
    label,
    labelText,
    confidence,
    activeCategoriesCount,
  };
}
