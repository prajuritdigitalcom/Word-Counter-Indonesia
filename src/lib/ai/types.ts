/**
 * Types and interfaces for the Multi-Signal Stylometric AI Pattern Engine (v2.0.0)
 */

export type AiPatternLevel = 'rendah' | 'sedang' | 'tinggi';
export type ContributionLevel = 'Rendah' | 'Sedang' | 'Tinggi';

export interface AiPatternMatch {
  phrase: string;
  count: number;
}

export interface AiPatternCategoryResult {
  id:
    | 'lexical'
    | 'sentence'
    | 'paragraph'
    | 'repetition'
    | 'enumeration'
    | 'concreteness'
    | 'transition'
    | 'punctuation'
    | 'aiSpecificPhrase'
    | 'naturalness';
  name: string;
  detail: string;
  contribution: ContributionLevel;
  matches: AiPatternMatch[];
  rawScore: number; // 0..1 scale
}

export interface AiFeatureScores {
  lexical: number;
  sentence: number;
  paragraph: number;
  repetition: number;
  enumeration: number;
  concreteness: number; // Inverse signal: low concreteness = higher AI-likeness
  transition: number;
  punctuation: number;
  aiSpecificPhrase: number;
  naturalnessPenalty: number; // Subtracted or mitigating factor
}

export interface AiPatternResult {
  status: 'empty' | 'tooShort' | 'scored';
  engineVersion: string;
  wordCount: number;
  score: number; // 0..100
  label: AiPatternLevel | null;
  labelText: string | null;
  confidence: AiPatternLevel | null;
  activeCategoriesCount: number;
  categories: AiPatternCategoryResult[];
  featureScores?: AiFeatureScores;
}

export interface PreparedTextContext {
  rawText: string;
  trimmedText: string;
  wordCount: number;
  paragraphs: string[];
  sentences: string[];
  tokens: string[]; // shared lowercase word tokens
  sentenceTokens: string[][]; // tokens per sentence
  paragraphTokens: string[][]; // tokens per paragraph
}
