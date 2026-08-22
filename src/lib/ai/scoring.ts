/**
 * Nonlinear Multi-Signal Scoring Engine (v2.1.0)
 * Normalizes applicable weights, enforces category convergence protections,
 * and scales stylometric indicators with smoothstep saturation.
 */
import { FEATURE_WEIGHTS, MIN_CATEGORIES_FOR_HIGH_TIER } from '../../data/aiPatterns';
import { AiFeatureScores, AiFeatureApplicable, AiPatternLevel } from './types';

/**
 * Smoothstep non-linear saturation curve
 */
export function smoothstep(x: number, edge0 = 0.0, edge1 = 1.0): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/**
 * Calculate final aggregated score (0..100) using normalized feature weights,
 * naturalness mitigation, dynamic applicable category gating, and nonlinear scaling.
 */
export function calculateAggregatedScore(
  features: AiFeatureScores,
  applicable: AiFeatureApplicable,
  wordCount: number
): {
  score: number;
  label: AiPatternLevel;
  labelText: string;
  confidence: AiPatternLevel;
  confidenceDetail: string;
  activeCategoriesCount: number;
  eligibleCategoriesCount: number;
} {
  // 1. Calculate sum of weights for applicable positive features
  const positiveKeys: (keyof Omit<AiFeatureScores, 'naturalnessPenalty'>)[] = [
    'lexical',
    'sentence',
    'paragraph',
    'repetition',
    'enumeration',
    'concreteness',
    'transition',
    'punctuation',
    'aiSpecificPhrase',
  ];

  let totalPositiveApplicableWeight = 0;
  let rawPositiveWeighted = 0;
  let eligibleCategoriesCount = 0;

  for (const key of positiveKeys) {
    if (applicable[key]) {
      const weight = FEATURE_WEIGHTS[key];
      totalPositiveApplicableWeight += weight;
      rawPositiveWeighted += features[key] * weight;
      eligibleCategoriesCount++;
    }
  }

  // Normalize positive score against available applicable weight
  const positiveWeighted =
    totalPositiveApplicableWeight > 0
      ? rawPositiveWeighted / totalPositiveApplicableWeight
      : 0;

  // Subtract naturalness mitigation
  const netScore = Math.max(
    0,
    positiveWeighted - features.naturalnessPenalty * FEATURE_WEIGHTS.naturalnessPenalty
  );

  // Apply smoothstep saturation curve (calibrated for v2.1.0 normalized weights)
  const saturated = smoothstep(netScore, 0.02, 0.55);
  const finalScore = Math.min(Math.round(saturated * 100), 100);

  // Count active feature categories (rawScore > 0.15)
  const activeCategoriesCount = positiveKeys.filter((k) => applicable[k] && features[k] > 0.15).length;

  // Dynamic convergence threshold based on eligible categories
  const requiredCategoriesForHighTier = Math.min(
    MIN_CATEGORIES_FOR_HIGH_TIER,
    Math.max(eligibleCategoriesCount, 1)
  );

  // Determine Statistical Confidence and Contextual Detail
  let confidence: AiPatternLevel = 'sedang';
  let confidenceDetail = 'Sampel cukup memadai (300-800 kata)';

  if (wordCount < 300) {
    confidence = 'sedang';
    confidenceDetail = 'Sampel terbatas (<300 kata) — analisis lebih andal pada artikel >300 kata';
  } else if (wordCount >= 800 && activeCategoriesCount >= 4) {
    confidence = 'tinggi';
    confidenceDetail = 'Sampel panjang (>800 kata) dengan sinyal data memadai';
  }

  // Determine Label and LabelText with Multi-Category Convergence protection
  let label: AiPatternLevel = 'rendah';
  let labelText = 'Pola AI Rendah';

  if (finalScore >= 50) {
    if (activeCategoriesCount >= requiredCategoriesForHighTier) {
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
    confidenceDetail,
    activeCategoriesCount,
    eligibleCategoriesCount,
  };
}
