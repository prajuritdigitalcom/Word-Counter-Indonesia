/**
 * AI Pattern Evaluation & Benchmark Script (Section 18 & 19)
 * Calculates accuracy, precision, recall, F1, and False Positive Rate across labeled datasets.
 */
import { analyzeAiPatterns } from './analyzer';
import { ALL_DETECTION_SAMPLES, DetectionSample } from '../../data/aiDetectionSamples';

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
  falsePositiveRate: number; // Critical metric: human text flagged as high/AI
  falseNegativeRate: number;
  threshold: number;
}

export function evaluateDataset(
  samples: DetectionSample[] = ALL_DETECTION_SAMPLES,
  threshold = 50
): EvaluationMetrics {
  let tp = 0;
  let tn = 0;
  let fp = 0;
  let fn = 0;

  for (const sample of samples) {
    const result = analyzeAiPatterns(sample.text);
    const isPredictedAi = result.score >= threshold;

    if (sample.label === 'ai' && isPredictedAi) tp++;
    else if (sample.label === 'human' && !isPredictedAi) tn++;
    else if (sample.label === 'human' && isPredictedAi) fp++;
    else if (sample.label === 'ai' && !isPredictedAi) fn++;
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
  };
}
