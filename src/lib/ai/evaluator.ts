/**
 * AI Pattern Evaluation & Benchmark Script (v2.1.0)
 * Evaluates performance across curated datasets, separating train/tuning and held-out test splits.
 * 
 * Note: Metrics are computed on curated internal benchmarks (40+ Indonesian text samples across
 * journalistic, financial, narrative personal, business SEO, and various AI models/generations),
 * designed to assess stylometric heuristic performance and false-positive resilience.
 */
import { analyzeAiPatterns } from './analyzer';
import {
  ALL_DETECTION_SAMPLES,
  TRAIN_DETECTION_SAMPLES,
  TEST_DETECTION_SAMPLES,
  DetectionSample,
} from '../../data/aiDetectionSamples';

export interface EvaluationMetrics {
  totalSamples: number;
  truePositives: number;
  trueNegatives: number;
  falsePositives: number;
  falseNegatives: number;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  falsePositiveRate: number; // Critical metric: human text flagged as AI (score >= threshold)
  falseNegativeRate: number;
  threshold: number;
  sampleDetails?: { id: string; title: string; label: string; score: number; predicted: string }[];
}

export function evaluateDataset(
  samples: DetectionSample[] = TEST_DETECTION_SAMPLES.length > 0 ? TEST_DETECTION_SAMPLES : ALL_DETECTION_SAMPLES,
  threshold = 50,
  includeDetails = false
): EvaluationMetrics {
  let tp = 0;
  let tn = 0;
  let fp = 0;
  let fn = 0;
  const sampleDetails: { id: string; title: string; label: string; score: number; predicted: string }[] = [];

  for (const sample of samples) {
    const result = analyzeAiPatterns(sample.text);
    const isPredictedAi = result.score >= threshold;
    const predictedLabel = isPredictedAi ? 'ai' : 'human';

    if (sample.label === 'ai' && isPredictedAi) tp++;
    else if (sample.label === 'human' && !isPredictedAi) tn++;
    else if (sample.label === 'human' && isPredictedAi) fp++;
    else if (sample.label === 'ai' && !isPredictedAi) fn++;

    if (includeDetails) {
      sampleDetails.push({
        id: sample.id,
        title: sample.title,
        label: sample.label,
        score: result.score,
        predicted: predictedLabel,
      });
    }
  }

  const total = samples.length;
  const accuracy = total > 0 ? (tp + tn) / total : 0;
  const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
  const recall = tp + fn > 0 ? tp / (tp + fn) : 0;
  const f1Score = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;
  const falsePositiveRate = fp + tn > 0 ? fp / (fp + tn) : 0;
  const falseNegativeRate = tp + fn > 0 ? fn / (tp + fn) : 0;

  return {
    totalSamples: total,
    truePositives: tp,
    trueNegatives: tn,
    falsePositives: fp,
    falseNegatives: fn,
    accuracy,
    precision,
    recall,
    f1Score,
    falsePositiveRate,
    falseNegativeRate,
    threshold,
    sampleDetails: includeDetails ? sampleDetails : undefined,
  };
}

/**
 * Sweep threshold across candidate range to identify optimal operating point
 * prioritizing low False Positive Rate (FPR) on human text.
 */
export function sweepThresholds(
  samples: DetectionSample[] = TEST_DETECTION_SAMPLES,
  minThreshold = 25,
  maxThreshold = 75,
  step = 5
): EvaluationMetrics[] {
  const sweeps: EvaluationMetrics[] = [];
  for (let t = minThreshold; t <= maxThreshold; t += step) {
    sweeps.push(evaluateDataset(samples, t));
  }
  return sweeps;
}
