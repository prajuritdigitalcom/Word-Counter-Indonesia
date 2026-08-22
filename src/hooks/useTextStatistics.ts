import { useState, useMemo, useEffect, useRef } from 'react';
import {
  analyzeText,
  calculateKeywordDensity,
  TextStatistics,
  KeywordDensityResult,
} from '../lib/textAnalyzer';
import { formatNumberID, formatPercentID } from '../lib/utils';

export function useTextStatistics(initialText: string = '', initialKeyword: string = '') {
  const [text, setText] = useState<string>(initialText);
  const [keyword, setKeyword] = useState<string>(initialKeyword);
  const [screenReaderAnnouncement, setScreenReaderAnnouncement] = useState<string>('');
  const debounceTimerRef = useRef<number | null>(null);

  // Realtime synchronous text analysis
  const statistics: TextStatistics = useMemo(() => {
    return analyzeText(text);
  }, [text]);

  // Realtime keyword density
  const keywordDensity: KeywordDensityResult = useMemo(() => {
    return calculateKeywordDensity(text, keyword, statistics.wordCount);
  }, [text, keyword, statistics.wordCount]);

  // Debounced announcement for screen readers (aria-live="polite")
  useEffect(() => {
    if (debounceTimerRef.current) {
      window.clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = window.setTimeout(() => {
      if (!text.trim()) {
        setScreenReaderAnnouncement('Teks kosong: 0 kata, 0 karakter');
      } else {
        setScreenReaderAnnouncement(
          `Statistik diperbarui: ${formatNumberID(statistics.wordCount)} kata, ${formatNumberID(
            statistics.charCount
          )} karakter, ${formatNumberID(statistics.sentenceCount)} kalimat, waktu baca ${
            statistics.readingTimeText
          }`
        );
      }
    }, 600);

    return () => {
      if (debounceTimerRef.current) {
        window.clearTimeout(debounceTimerRef.current);
      }
    };
  }, [text, statistics.wordCount, statistics.charCount, statistics.sentenceCount, statistics.readingTimeText]);

  const clearText = () => {
    if (text.length > 0) {
      setText('');
    }
  };

  const getFormattedSummaryForCopy = (): string => {
    const lines = [
      'Word Counter Indonesia',
      '',
      `Jumlah Kata: ${formatNumberID(statistics.wordCount)}`,
      `Karakter: ${formatNumberID(statistics.charCount)}`,
      `Karakter Tanpa Spasi: ${formatNumberID(statistics.charCountNoSpaces)}`,
      `Kalimat: ${formatNumberID(statistics.sentenceCount)}`,
      `Paragraf: ${formatNumberID(statistics.paragraphCount)}`,
      `Estimasi Waktu Baca: ${statistics.readingTimeText}`,
    ];

    if (keyword.trim().length > 0) {
      lines.push(`Keyword: ${keyword.trim()}`);
      lines.push(`Kemunculan Keyword: ${formatNumberID(keywordDensity.occurrences)}`);
      lines.push(`Keyword Density: ${formatPercentID(keywordDensity.density)}`);
    }

    return lines.join('\n');
  };

  return {
    text,
    setText,
    keyword,
    setKeyword,
    statistics,
    keywordDensity,
    screenReaderAnnouncement,
    clearText,
    getFormattedSummaryForCopy,
  };
}
