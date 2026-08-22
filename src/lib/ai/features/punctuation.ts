/**
 * Punctuation & Formatting Stylometric Feature Extractor (Section 5 & Section 32)
 * Separates imported em-dash (—) signals from standard Indonesian hyphenation.
 */
import { PreparedTextContext, AiPatternCategoryResult, AiPatternMatch } from '../types';

export function extractPunctuationFeature(ctx: PreparedTextContext): {
  categoryResult: AiPatternCategoryResult;
  score: number;
} {
  const { rawText, wordCount } = ctx;
  if (wordCount === 0) {
    return {
      categoryResult: {
        id: 'punctuation',
        name: 'Tanda Baca & Format Markdown',
        detail: 'Tidak ada teks untuk dianalisis',
        contribution: 'Rendah',
        matches: [],
        rawScore: 0,
      },
      score: 0,
    };
  }

  const factor = 1000 / wordCount;
  const matches: AiPatternMatch[] = [];

  // 1. Em Dash (—) (U+2014) - Imported punctuation style in Indonesian (Section 32)
  const emDashMatches = rawText.match(/\u2014|--/g) || [];
  const emDashDensity = emDashMatches.length * factor; // per 1k words
  if (emDashMatches.length > 0) {
    matches.push({ phrase: 'Em dash (—)', count: emDashMatches.length });
  }

  // 2. Markdown formatting elements
  const bulletLines = (rawText.match(/^[ \t]*[-*•]\s+/gm) || []).length;
  const boldMatches = (rawText.match(/\*\*[^*]+\*\*/g) || []).length;
  const headerLines = (rawText.match(/^[ \t]*#{1,6}\s+/gm) || []).length;

  if (bulletLines > 0) matches.push({ phrase: 'Daftar butir (bullet point)', count: bulletLines });
  if (boldMatches > 0) matches.push({ phrase: 'Format tebal (**bold**)', count: boldMatches });
  if (headerLines > 0) matches.push({ phrase: 'Header (# / ##)', count: headerLines });

  // 3. Semicolons & colons
  const semicolonMatches = (rawText.match(/;/g) || []).length;
  const colonMatches = (rawText.match(/:/g) || []).length;

  // Scoring contributions
  // High em-dash in Indonesian (> 2.5 per 1k words) is a notable stylistic trait of LLMs
  const emDashScore = emDashDensity > 1.5 ? Math.min((emDashDensity - 1.5) / 4.0, 1) : 0;

  // Markdown formatting density
  const totalFormatting = bulletLines + boldMatches + headerLines;
  const formatDensity = totalFormatting * factor;
  const formatScore = formatDensity > 6.0 ? Math.min((formatDensity - 6.0) / 12.0, 1) : 0;

  const rawScore = Math.min(emDashScore * 0.5 + formatScore * 0.5, 1);
  const contribution = rawScore > 0.6 ? 'Tinggi' : rawScore > 0.25 ? 'Sedang' : 'Rendah';

  const detail =
    matches.length > 0
      ? `${matches.length} karakteristik tanda baca/format (${emDashMatches.length} em-dash, ${totalFormatting} format markdown)`
      : 'Penggunaan tanda baca dan format standar';

  return {
    categoryResult: {
      id: 'punctuation',
      name: 'Tanda Baca & Format Markdown',
      detail,
      contribution,
      matches,
      rawScore,
    },
    score: rawScore,
  };
}
