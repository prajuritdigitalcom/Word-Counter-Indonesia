/**
 * Types & Interfaces for the Humanizer Reverse Engine
 */
import { AiPatternLevel, AiPatternResult } from '../ai/types';

export type HumanizerMode = 'natural' | 'balanced' | 'strong';

export type HumanizerStep =
  | 'idle'
  | 'analyzing'
  | 'building_prompt'
  | 'generating'
  | 'reanalyzing'
  | 'completed'
  | 'error';

export interface GeminiKeyState {
  configured: boolean;
  verifiedAt?: number;
  maskedKey?: string;
  modelName?: string;
  rememberInBrowser?: boolean;
}

export interface HumanizerOptions {
  mode: HumanizerMode;
  targetKeyword?: string;
}

export interface CategoryComparison {
  id: string;
  name: string;
  beforeScore: number; // 0..100
  afterScore: number; // 0..100
  beforeContribution: string;
  afterContribution: string;
  improved: boolean;
}

export interface HumanizerResult {
  originalText: string;
  rewrittenText: string;
  beforeAnalysis: AiPatternResult;
  afterAnalysis: AiPatternResult;
  scoreDelta: number; // positive = improvement (score decreased)
  improved: boolean;
  changes: string[];
  warnings?: string[];
  categoryComparisons: CategoryComparison[];
  passCount: number; // 1 or 2
  mode: HumanizerMode;
  timestamp: number;
}
