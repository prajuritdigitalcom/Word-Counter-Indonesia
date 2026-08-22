/**
 * Quality Gate & Safety Validator for Humanizer Output
 * Ensures content integrity, keyword preservation, fact/number retention, and length bounds.
 */
import { HumanizerMode } from './types';

export interface QualityValidationResult {
  passed: boolean;
  warnings: string[];
  cleanText: string;
}

/**
 * Strips common LLM conversational wrappers or markdown code blocks
 */
export function cleanRawOutput(rawText: string): string {
  let text = rawText.trim();

  // Strip markdown code fences if model accidentally wrapped output in ```
  if (text.startsWith('```')) {
    text = text.replace(/^```(?:markdown|text|plain)?\s*\n/, '').replace(/\n```\s*$/, '');
  }

  // Strip leading conversational intros if present
  text = text.replace(/^(?:Tentu|Berikut|Ini|Hasil|Teks hasil)[^:\n]*:?\s*(?:\n\n|\n)/i, (match) => {
    // Only strip if it looks like a single-line intro followed by a blank line
    if (match.length < 120) {
      return '';
    }
    return match;
  });

  return text.trim();
}

/**
 * Validate rewritten text against original content
 */
export function validateHumanizerOutput(
  originalText: string,
  rawOutput: string,
  mode: HumanizerMode,
  targetKeyword?: string
): QualityValidationResult {
  const warnings: string[] = [];
  const cleanText = cleanRawOutput(rawOutput);

  // 1. Text existence check
  if (!cleanText || cleanText.length === 0) {
    return {
      passed: false,
      warnings: ['Gemini tidak menghasilkan teks output yang valid.'],
      cleanText: '',
    };
  }

  const origWords = originalText.trim().split(/\s+/).filter(Boolean);
  const outWords = cleanText.trim().split(/\s+/).filter(Boolean);

  const origWordCount = origWords.length;
  const outWordCount = outWords.length;

  // 2. Length check
  const minRatio = mode === 'strong' ? 0.70 : 0.80;
  const maxRatio = mode === 'strong' ? 1.35 : 1.25;

  if (outWordCount < origWordCount * minRatio) {
    warnings.push(
      `Panjang teks hasil (${outWordCount} kata) berkurang lebih dari yang disarankan dibandingkan teks asli (${origWordCount} kata).`
    );
  } else if (outWordCount > origWordCount * maxRatio) {
    warnings.push(
      `Panjang teks hasil (${outWordCount} kata) bertambah lebih panjang dibandingkan teks asli (${origWordCount} kata).`
    );
  }

  // 3. Keyword check (if provided)
  if (targetKeyword && targetKeyword.trim()) {
    const kwLower = targetKeyword.trim().toLowerCase();
    const cleanLower = cleanText.toLowerCase();
    if (!cleanLower.includes(kwLower)) {
      warnings.push(`Target keyword "${targetKeyword.trim()}" tidak ditemukan dalam teks hasil penyuntingan.`);
    }
  }

  // 4. Critical numbers preservation check
  const origNumbers = (originalText.match(/\b\d+(?:[.,]\d+)?%?\b/g) || []);
  if (origNumbers.length >= 3) {
    const outLower = cleanText.toLowerCase();
    let preservedCount = 0;
    for (const num of origNumbers) {
      if (outLower.includes(num.toLowerCase())) {
        preservedCount++;
      }
    }
    const preservationRatio = preservedCount / origNumbers.length;
    if (preservationRatio < 0.6) {
      warnings.push(
        'Beberapa angka atau data kuantitatif dari teks asli mungkin mengalami perubahan. Harap periksa kembali akurasi data.'
      );
    }
  }

  // 5. URL preservation check
  const origUrls = originalText.match(/https?:\/\/[^\s]+/g) || [];
  if (origUrls.length > 0) {
    for (const url of origUrls) {
      if (!cleanText.includes(url)) {
        warnings.push(`Tautan URL "${url}" tidak ditemukan pada teks hasil.`);
      }
    }
  }

  return {
    passed: true,
    warnings,
    cleanText,
  };
}
