/**
 * Text Analyzer Core Engine
 * Deterministic, realtime, client-side text processing logic.
 */

import { INDONESIAN_STOPWORDS } from './stopwords';

export interface TopWordItem {
  word: string;
  count: number;
  percentage: number;
}

export interface NGramItem {
  phrase: string;
  count: number;
  percentage: number;
}

export interface KeywordDensityResult {
  keyword: string;
  occurrences: number;
  density: number;
}

export interface TextStatistics {
  wordCount: number;
  uniqueWordCount: number;
  charCount: number;
  charCountNoSpaces: number;
  sentenceCount: number;
  paragraphCount: number;
  readingTimeText: string;
  readingTimeMinutes: number;
  avgWordsPerSentence: number;
  avgWordsPerParagraph: number;
  avgCharsPerWord: number;
  topWords: TopWordItem[];
  topBigrams: NGramItem[];
  topTrigrams: NGramItem[];
}

/**
 * Common Indonesian titles, degrees, and abbreviations that shouldn't split sentences
 */
const COMMON_ABBREVIATIONS = [
  'Dr', 'dr', 'Drs', 'dra', 'Dra', 'Prof', 'prof', 'Ir', 'ir', 'H', 'Hj',
  'S.Kom', 'S.Pd', 'S.H', 'S.E', 'S.Sos', 'S.T', 'S.Ked', 'M.Si', 'M.Pd', 'M.Kom', 'M.T', 'M.M',
  'dkk', 'dll', 'dst', 'dsb', 'tsb', 'thn', 'bln', 'hlm',
  'Jl', 'No', 'Yth', 'a.n', 'u.p', 'd/a', 'd.a',
];

/**
 * Helper to extract clean word tokens (lowercase, punctuation stripped)
 */
export function tokenizeWords(text: string): string[] {
  if (!text || typeof text !== 'string') return [];
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
    .split(/\s+/)
    .map((t) => t.replace(/^-+|-+$/g, ''))
    .filter((t) => t.length > 0);
}

/**
 * Count words in text using whitespace normalization
 * Trim leading/trailing spaces and split by \s+
 */
export function countWords(text: string): number {
  if (!text || typeof text !== 'string') return 0;
  const trimmed = text.trim();
  if (trimmed.length === 0) return 0;
  return trimmed.split(/\s+/).filter(Boolean).length;
}

/**
 * Count unique words (case-insensitive)
 */
export function countUniqueWords(text: string, preTokenized?: string[]): number {
  if (!text || typeof text !== 'string') return 0;
  const tokens = preTokenized ?? tokenizeWords(text);
  return new Set(tokens).size;
}

/**
 * Single-pass Grapheme-aware character counting (Total & Without Spaces)
 * Emojis and combined characters count as 1 character
 * Optimizes performance by running Intl.Segmenter only once per keystroke.
 */
export function countCharacterStats(text: string): { total: number; withoutSpaces: number } {
  if (!text || typeof text !== 'string') {
    return { total: 0, withoutSpaces: 0 };
  }

  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    try {
      const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
      let total = 0;
      let withoutSpaces = 0;
      for (const { segment } of segmenter.segment(text)) {
        total++;
        if (!/\s/.test(segment)) {
          withoutSpaces++;
        }
      }
      return { total, withoutSpaces };
    } catch {
      // Fallback below
    }
  }

  const chars = Array.from(text);
  return {
    total: chars.length,
    withoutSpaces: chars.filter((c) => !/\s/.test(c)).length,
  };
}

/**
 * Grapheme-aware character counting
 */
export function countCharacters(text: string): number {
  return countCharacterStats(text).total;
}

/**
 * Character count without any whitespace (spaces, tabs, newlines)
 */
export function countCharactersWithoutSpaces(text: string): number {
  return countCharacterStats(text).withoutSpaces;
}

/**
 * Count sentences handling:
 * 1. Indonesian currency / thousands separator dots like Rp2.500.000 or decimals 3.14
 * 2. Indonesian abbreviations / titles (Dr., Ir., S.Kom., dkk., dll., Budi S. Pratama)
 * 3. Numbered/lettered lists ("1. Pilih topik. 2. Riset keyword.") so markers are not split as standalone sentences
 */
export function countSentences(text: string): number {
  if (!text || typeof text !== 'string') return 0;
  const trimmed = text.trim();
  if (trimmed.length === 0) return 0;

  // Step 1: Protect digits separated by dot (e.g. 2.500.000 or 3.14)
  let protectedText = trimmed.replace(/(\d)\.(\d)/g, '$1__DOT__$2');

  // Step 2: Protect common abbreviations with trailing dots (e.g. Dr., Prof., S.Kom., dkk.)
  for (const abbr of COMMON_ABBREVIATIONS) {
    const pattern = new RegExp(`\\b${abbr.replace(/\./g, '\\.')}\\.(?=\\s|$)`, 'gi');
    protectedText = protectedText.replace(pattern, (match) => match.replace(/\./g, '__ABBR__'));
  }

  // Step 3: Protect single-letter initials like "Budi S. Pratama"
  protectedText = protectedText.replace(/\b([A-Z])\.(?=\s+[A-Z])/g, '$1__ABBR__');

  // Step 4: Split by sentence ending punctuation (. ! ?) followed by whitespace or end of string
  const rawSentences = protectedText
    .split(/(?<=[.!?])(?:\s+|$)/)
    .map((s) => s.replace(/__DOT__/g, '.').replace(/__ABBR__/g, '.').trim())
    .filter((s) => s.length > 0 && /[a-zA-Z0-9\u00C0-\u024F\u1E00-\u1EFF]/.test(s));

  // Step 5: Merge fragments that are only list markers ("1.", "23)", "a.", "B.") into next sentence
  const merged: string[] = [];
  for (let i = 0; i < rawSentences.length; i++) {
    const s = rawSentences[i];
    const isBareListMarker = /^\d{1,3}[.)]$/.test(s) || /^[a-zA-Z][.)]$/.test(s);
    if (isBareListMarker && i + 1 < rawSentences.length) {
      rawSentences[i + 1] = s + ' ' + rawSentences[i + 1];
      continue;
    }
    merged.push(s);
  }

  // If text has letters/numbers but no sentence split was created, return 1
  if (merged.length === 0 && /[a-zA-Z0-9\u00C0-\u024F\u1E00-\u1EFF]/.test(trimmed)) {
    return 1;
  }

  return merged.length;
}

/**
 * Count paragraphs separated by blank lines (double newlines) or single newline fallback
 */
export function countParagraphs(text: string): number {
  if (!text || typeof text !== 'string') return 0;
  const trimmed = text.trim();
  if (trimmed.length === 0) return 0;

  const hasBlankLineBreak = /\n\s*\n/.test(trimmed);
  if (hasBlankLineBreak) {
    return trimmed
      .split(/\n\s*\n+/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0).length;
  }

  // Fallback: if there are single newlines without blank lines, count each non-empty line as a paragraph
  const lines = trimmed
    .split(/\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  return lines.length > 0 ? lines.length : 1;
}

/**
 * Calculate reading time based on 200 words per minute
 * Uses Math.round for natural, non-jarring transitions
 */
export function calculateReadingTime(wordCount: number): { text: string; minutes: number } {
  if (wordCount <= 0) {
    return { text: '0 menit', minutes: 0 };
  }
  const rawMinutes = wordCount / 200;
  if (rawMinutes < 1) {
    return { text: '< 1 menit', minutes: 0.5 };
  }
  const minutes = Math.round(rawMinutes);
  return { text: `${minutes} menit`, minutes };
}

/**
 * Escape regex special characters
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Calculate keyword occurrences and density percentage
 * Supports multi-word keywords (tolerant to multiple spaces / tabs / newlines in phrase),
 * case-insensitive, Unicode word boundary aware.
 */
export function calculateKeywordDensity(
  text: string,
  rawKeyword: string,
  totalWordCount: number
): KeywordDensityResult {
  const keyword = rawKeyword.trim();
  if (!keyword || !text || totalWordCount === 0) {
    return { keyword, occurrences: 0, density: 0 };
  }

  // Make whitespace between words in keyword flexible (\s+) to tolerate double spaces / linebreaks in text
  const escaped = escapeRegExp(keyword).replace(/\s+/g, '\\s+');
  // Match phrase with unicode word/punctuation boundaries
  const regex = new RegExp(`(?:^|(?<=[^\\p{L}\\p{N}]))${escaped}(?=[^\\p{L}\\p{N}]|$)`, 'giu');
  const matches = text.match(regex);
  const occurrences = matches ? matches.length : 0;

  // Formula: keywordOccurrences / totalWordCount * 100
  const density = totalWordCount > 0 ? (occurrences / totalWordCount) * 100 : 0;

  return {
    keyword,
    occurrences,
    density,
  };
}

/**
 * Extract Top Words (most frequent meaningful words) ignoring Indonesian stopwords
 * Preserves stable insertion order on ties
 */
export function getTopWords(
  text: string,
  totalWords: number,
  limit: number = 15,
  preTokenized?: string[]
): TopWordItem[] {
  if (!text || typeof text !== 'string' || totalWords === 0) {
    return [];
  }

  const tokens = preTokenized ?? tokenizeWords(text);
  const wordCounts = new Map<string, { count: number; firstIndex: number }>();

  let index = 0;
  for (const cleaned of tokens) {
    // Ignore short words (<2 chars), pure numbers, and Indonesian stopwords
    if (
      cleaned.length >= 2 &&
      !/^\d+$/.test(cleaned) &&
      !INDONESIAN_STOPWORDS.has(cleaned)
    ) {
      const existing = wordCounts.get(cleaned);
      if (existing) {
        existing.count += 1;
      } else {
        wordCounts.set(cleaned, { count: 1, firstIndex: index });
      }
    }
    index++;
  }

  const list: TopWordItem[] = Array.from(wordCounts.entries())
    .map(([word, data]) => ({
      word,
      count: data.count,
      percentage: totalWords > 0 ? (data.count / totalWords) * 100 : 0,
      firstIndex: data.firstIndex,
    }))
    .sort((a, b) => {
      // Primary: higher count
      if (b.count !== a.count) return b.count - a.count;
      // Secondary: stable order of first occurrence
      return a.firstIndex - b.firstIndex;
    })
    .slice(0, limit)
    .map(({ word, count, percentage }) => ({ word, count, percentage }));

  return list;
}

/**
 * Extract Top N-grams (consecutive n-word sequences, n=2 or n=3)
 * Does NOT filter stopwords so natural phrases like "yang lebih", "di dalam", etc. are preserved.
 * Filters out phrases made up entirely of pure digits.
 * Preserves stable insertion order on ties.
 */
export function getTopNGrams(
  text: string,
  n: number,
  totalWords: number,
  limit: number = 10,
  preTokenized?: string[]
): NGramItem[] {
  if (!text || typeof text !== 'string' || totalWords === 0 || n < 1) {
    return [];
  }

  const tokens = preTokenized ?? tokenizeWords(text);

  if (tokens.length < n) {
    return [];
  }

  const phraseCounts = new Map<string, { count: number; firstIndex: number }>();

  for (let i = 0; i <= tokens.length - n; i++) {
    const slice = tokens.slice(i, i + n);
    // Skip if ALL tokens in the n-gram are pure numbers (e.g. "500 000")
    if (slice.every((t) => /^\d+$/.test(t))) {
      continue;
    }

    const phrase = slice.join(' ');
    const existing = phraseCounts.get(phrase);
    if (existing) {
      existing.count += 1;
    } else {
      phraseCounts.set(phrase, { count: 1, firstIndex: i });
    }
  }

  const list: NGramItem[] = Array.from(phraseCounts.entries())
    .map(([phrase, data]) => ({
      phrase,
      count: data.count,
      percentage: totalWords > 0 ? (data.count / totalWords) * 100 : 0,
      firstIndex: data.firstIndex,
    }))
    .sort((a, b) => {
      // Primary: higher count
      if (b.count !== a.count) return b.count - a.count;
      // Secondary: stable order of first occurrence
      return a.firstIndex - b.firstIndex;
    })
    .slice(0, limit)
    .map(({ phrase, count, percentage }) => ({ phrase, count, percentage }));

  return list;
}

/**
 * Calculate Average Statistics
 */
export function calculateAverageWordsPerSentence(words: number, sentences: number): number {
  if (sentences <= 0 || words <= 0) return 0;
  return words / sentences;
}

export function calculateAverageWordsPerParagraph(words: number, paragraphs: number): number {
  if (paragraphs <= 0 || words <= 0) return 0;
  return words / paragraphs;
}

export function calculateAverageCharactersPerWord(charsNoSpaces: number, words: number): number {
  if (words <= 0 || charsNoSpaces <= 0) return 0;
  return charsNoSpaces / words;
}

/**
 * Master analyzer function
 */
export function analyzeText(text: string): TextStatistics {
  const wordCount = countWords(text);
  const { total: charCount, withoutSpaces: charCountNoSpaces } = countCharacterStats(text);
  const sentenceCount = countSentences(text);
  const paragraphCount = countParagraphs(text);
  const readingTime = calculateReadingTime(wordCount);

  // Tokenize once and share across unique words, top words, and n-grams
  const tokens = tokenizeWords(text);
  const uniqueWordCount = countUniqueWords(text, tokens);

  const avgWordsPerSentence = calculateAverageWordsPerSentence(wordCount, sentenceCount);
  const avgWordsPerParagraph = calculateAverageWordsPerParagraph(wordCount, paragraphCount);
  const avgCharsPerWord = calculateAverageCharactersPerWord(charCountNoSpaces, wordCount);

  const topWords = getTopWords(text, wordCount, 10, tokens);
  const topBigrams = getTopNGrams(text, 2, wordCount, 10, tokens);
  const topTrigrams = getTopNGrams(text, 3, wordCount, 10, tokens);

  return {
    wordCount,
    uniqueWordCount,
    charCount,
    charCountNoSpaces,
    sentenceCount,
    paragraphCount,
    readingTimeText: readingTime.text,
    readingTimeMinutes: readingTime.minutes,
    avgWordsPerSentence,
    avgWordsPerParagraph,
    avgCharsPerWord,
    topWords,
    topBigrams,
    topTrigrams,
  };
}
