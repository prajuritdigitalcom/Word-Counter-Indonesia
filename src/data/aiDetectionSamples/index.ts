import { DetectionSample, HUMAN_FORMAL_SAMPLES } from './human-formal';
import {
  HUMAN_INFORMAL_SAMPLES,
  HUMAN_CODESWITCH_SAMPLES,
  HUMAN_SEO_BUSINESS_SAMPLES,
} from './human-informal';
import {
  AI_GENERIC_SAMPLES,
  AI_REALISTIC_SAMPLES,
  AI_SINGLE_PARAGRAPH_SAMPLES,
  AI_CONVERSATIONAL_SAMPLES,
} from './ai-generic';

export * from './human-formal';
export * from './human-informal';
export * from './ai-generic';

export const ALL_DETECTION_SAMPLES: DetectionSample[] = [
  ...HUMAN_FORMAL_SAMPLES,
  ...HUMAN_INFORMAL_SAMPLES,
  ...HUMAN_CODESWITCH_SAMPLES,
  ...HUMAN_SEO_BUSINESS_SAMPLES,
  ...AI_GENERIC_SAMPLES,
  ...AI_REALISTIC_SAMPLES,
  ...AI_SINGLE_PARAGRAPH_SAMPLES,
  ...AI_CONVERSATIONAL_SAMPLES,
];

export const TRAIN_DETECTION_SAMPLES: DetectionSample[] = ALL_DETECTION_SAMPLES.filter(
  (s) => s.split === 'train'
);

export const TEST_DETECTION_SAMPLES: DetectionSample[] = ALL_DETECTION_SAMPLES.filter(
  (s) => s.split === 'test'
);
