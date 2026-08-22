/**
 * Humanizer Reverse Engine Execution Service
 * Orchestrates the full pipeline:
 * Input -> AI Pattern Analysis -> Dynamic Prompt -> Gemini Execution (with model fallback) -> Re-Analysis -> Comparison
 */
import { GoogleGenAI } from '@google/genai';
import { analyzeAiPatterns } from '../ai/analyzer';
import { DEFAULT_GEMINI_MODEL, FALLBACK_GEMINI_MODELS, MIN_HUMANIZER_WORD_COUNT } from './config';
import { isModelUnavailableError, buildGeminiErrorMessage } from './keyVerification';
import { buildHumanizerPrompt } from './promptBuilder';
import { validateHumanizerOutput } from './qualityGate';
import {
  CategoryComparison,
  HumanizerMode,
  HumanizerOptions,
  HumanizerResult,
} from './types';

/**
 * Generate editorial changes summary based on actual before/after category improvements
 */
function generateChangesSummary(
  comparisons: CategoryComparison[],
  scoreDelta: number,
  mode: HumanizerMode
): string[] {
  const changes: string[] = [];

  for (const comp of comparisons) {
    if (comp.improved) {
      switch (comp.id) {
        case 'aiSpecificPhrase':
          changes.push('Frasa klise dan template khas AI berhasil dihapus atau diganti dengan bahasa yang lebih natural.');
          break;
        case 'transition':
          changes.push('Penggunaan kata sambung dan transisi formal yang repetitif telah disederhanakan.');
          break;
        case 'sentence':
          changes.push('Panjang dan variasi struktur kalimat ditingkatkan agar ritme membaca lebih dinamis.');
          break;
        case 'repetition':
          changes.push('Pengulangan kata, frasa, dan pola pembuka kalimat berhasil dikurangi.');
          break;
        case 'enumeration':
          changes.push('Pola penyebutan tiga unsur mekanis telah disesuaikan agar lebih organik.');
          break;
        case 'concreteness':
          changes.push('Kekonkretan bahasa diperbaiki agar lebih membumi sesuai konteks.');
          break;
        case 'punctuation':
          changes.push('Dinamika tanda baca dan jeda klausa diselaraskan secara alami.');
          break;
        case 'paragraph':
          changes.push('Distribusi dan kepadatan paragraf diseimbangkan.');
          break;
      }
    }
  }

  if (changes.length === 0) {
    if (scoreDelta > 0) {
      changes.push('Aliran antarkalimat dan keluwesan diksi ditingkatkan.');
    } else {
      changes.push(`Penyuntingan teks telah dilakukan dengan intensitas mode ${mode}.`);
    }
  }

  return changes;
}

/**
 * Execute the Humanizer reverse pipeline
 */
export async function executeHumanizer(
  apiKey: string,
  originalText: string,
  options: HumanizerOptions,
  passCount = 1,
  onStepChange?: (stepName: string) => void
): Promise<HumanizerResult> {
  const trimmedText = originalText.trim();
  const words = trimmedText.split(/\s+/).filter(Boolean);

  if (words.length < MIN_HUMANIZER_WORD_COUNT) {
    throw new Error(
      `Teks terlalu pendek (${words.length} kata). Humanizer membutuhkan minimal ${MIN_HUMANIZER_WORD_COUNT} kata agar analisis pola AI dapat dievaluasi secara akurat.`
    );
  }

  // 1. Initial Analysis
  onStepChange?.('Menganalisis pola tulisan teks...');
  const beforeAnalysis = analyzeAiPatterns(trimmedText, options.targetKeyword);

  // 2. Build Targeted Dynamic Prompt
  onStepChange?.('Menyesuaikan instruksi editorial berdasarkan sinyal pola AI...');
  const promptData = buildHumanizerPrompt(trimmedText, beforeAnalysis, options);

  // 3. Request to Google Gemini with Automatic Fallback
  onStepChange?.('Memproses penyuntingan teks dengan Gemini...');
  const ai = new GoogleGenAI({ apiKey: apiKey.trim() });

  const candidates = [
    DEFAULT_GEMINI_MODEL,
    ...FALLBACK_GEMINI_MODELS.filter((m) => m !== DEFAULT_GEMINI_MODEL),
  ];

  let rawOutput = '';
  let lastError: unknown = null;
  let successModel = DEFAULT_GEMINI_MODEL;

  for (const candidate of candidates) {
    try {
      const response = await ai.models.generateContent({
        model: candidate,
        contents: promptData.userPrompt,
        config: {
          systemInstruction: promptData.systemInstruction,
          temperature: options.mode === 'strong' ? 0.75 : options.mode === 'natural' ? 0.45 : 0.6,
          topP: 0.95,
        },
      });

      rawOutput = response.text || '';
      if (rawOutput) {
        successModel = candidate;
        break;
      }
    } catch (err: unknown) {
      lastError = err;
      if (isModelUnavailableError(err)) {
        // Coba model fallback berikutnya
        continue;
      }
      // Error lain (401, 429, network, etc.) langsung tangani
      const errorMsg = buildGeminiErrorMessage(err, candidate);
      throw new Error(errorMsg);
    }
  }

  if (!rawOutput) {
    const finalMsg = lastError
      ? buildGeminiErrorMessage(lastError, successModel)
      : 'Gagal memproses dengan Gemini. Silakan coba beberapa saat lagi.';
    throw new Error(finalMsg);
  }

  // 4. Quality Gate & Safety Validation
  onStepChange?.('Memeriksa integritas teks hasil...');
  const quality = validateHumanizerOutput(
    trimmedText,
    rawOutput,
    options.mode,
    options.targetKeyword
  );

  if (!quality.passed || !quality.cleanText) {
    throw new Error(quality.warnings[0] || 'Gagal menghasilkan teks yang valid dari model.');
  }

  // 5. Re-Analysis of Rewritten Text
  onStepChange?.('Menganalisis ulang skor pola AI pada teks hasil...');
  const afterAnalysis = analyzeAiPatterns(quality.cleanText, options.targetKeyword);

  // 6. Build Category Comparisons
  const beforeCatMap = new Map(beforeAnalysis.categories.map((c) => [c.id, c]));
  const categoryComparisons: CategoryComparison[] = [];

  for (const afterCat of afterAnalysis.categories) {
    const beforeCat = beforeCatMap.get(afterCat.id);
    if (beforeCat && (beforeCat.applicable || afterCat.applicable)) {
      const beforeScoreNum = Math.round(beforeCat.rawScore * 100);
      const afterScoreNum = Math.round(afterCat.rawScore * 100);
      const improved = afterScoreNum < beforeScoreNum;

      categoryComparisons.push({
        id: afterCat.id,
        name: afterCat.name,
        beforeScore: beforeScoreNum,
        afterScore: afterScoreNum,
        beforeContribution: beforeCat.contribution,
        afterContribution: afterCat.contribution,
        improved,
      });
    }
  }

  const scoreDelta = beforeAnalysis.score - afterAnalysis.score;
  const improved = scoreDelta > 0;
  const changes = generateChangesSummary(categoryComparisons, scoreDelta, options.mode);

  return {
    originalText: trimmedText,
    rewrittenText: quality.cleanText,
    beforeAnalysis,
    afterAnalysis,
    scoreDelta,
    improved,
    changes,
    warnings: quality.warnings.length > 0 ? quality.warnings : undefined,
    categoryComparisons,
    passCount,
    mode: options.mode,
    timestamp: Date.now(),
  };
}
