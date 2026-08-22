/**
 * Real API Key Verification Service using Google GenAI SDK
 * Tests the provided API key with an actual lightweight model request.
 * Includes automatic model fallback loop across Gemini 3.x candidate models.
 */
import { GoogleGenAI } from '@google/genai';
import { DEFAULT_GEMINI_MODEL, FALLBACK_GEMINI_MODELS } from './config';

export interface KeyVerificationResult {
  success: boolean;
  modelName: string;
  errorMessage?: string;
}

/**
 * Helper to determine if an error indicates model unavailability (404, not found, discontinued for new users, unsupported parameter/argument)
 */
export function isModelUnavailableError(err: unknown): boolean {
  const s = String(err).toLowerCase();
  return (
    s.includes('404') ||
    s.includes('not_found') ||
    s.includes('not found') ||
    s.includes('no longer available') ||
    s.includes('unsupported model') ||
    s.includes('is not found for api version') ||
    s.includes('invalid_argument') ||
    s.includes('is not supported') ||
    s.includes('unknown name')
  );
}

/**
 * User-friendly Indonesian error message builder for Gemini API errors
 */
export function buildGeminiErrorMessage(err: unknown, modelName: string): string {
  const s = String(err).toLowerCase();

  if (s.includes('no longer available')) {
    return `Model AI (${modelName}) sedang tidak tersedia dari pihak Google saat ini. Tim kami sudah diberi tahu. Silakan coba lagi beberapa saat lagi.`;
  }
  if (
    s.includes('api_key_invalid') ||
    s.includes('api key not valid') ||
    s.includes('401') ||
    s.includes('unauthenticated')
  ) {
    return 'API Key tidak valid atau telah dicabut. Periksa kembali key Anda dari Google AI Studio.';
  }
  if (
    s.includes('permission_denied') ||
    s.includes('403') ||
    s.includes('access not configured')
  ) {
    return 'API Key ditolak oleh Gemini. Periksa permission dan akses project Google AI Studio Anda.';
  }
  if (
    s.includes('resource_exhausted') ||
    s.includes('429') ||
    s.includes('quota') ||
    s.includes('rate limit')
  ) {
    return 'API Key valid, namun kuota atau rate limit project Anda saat ini sedang habis atau dibatasi.';
  }
  if (
    s.includes('failed to fetch') ||
    s.includes('network') ||
    s.includes('econnrefused') ||
    s.includes('timeout')
  ) {
    return 'Tidak dapat menghubungi server Gemini API. Periksa koneksi internet Anda atau pemblokir iklan/firewall.';
  }
  if (s.includes('not found') || s.includes('404')) {
    return `Model ${modelName} tidak dapat diakses dengan API Key ini.`;
  }

  return 'Gagal memproses permintaan ke Gemini API karena sebab yang tidak dikenali (kemungkinan bukan masalah API Key). Coba lagi beberapa saat lagi; jika terus berlanjut, laporkan ke tim kami.';
}

/**
 * Verify a Gemini API key with a real lightweight request, automatically trying fallback models
 */
export async function verifyGeminiApiKey(
  apiKey: string,
  modelName: string = DEFAULT_GEMINI_MODEL
): Promise<KeyVerificationResult> {
  const trimmedKey = apiKey.trim();

  // Preliminary format sanity checks
  if (!trimmedKey) {
    return {
      success: false,
      modelName,
      errorMessage: 'API Key tidak boleh kosong.',
    };
  }

  if (trimmedKey.length < 20) {
    return {
      success: false,
      modelName,
      errorMessage: 'Format API Key terlalu pendek atau tidak valid.',
    };
  }

  const ai = new GoogleGenAI({ apiKey: trimmedKey });
  const candidates = [modelName, ...FALLBACK_GEMINI_MODELS.filter((m) => m !== modelName)];

  let lastError: unknown = null;
  let lastAttemptedModel = modelName;

  for (const candidate of candidates) {
    lastAttemptedModel = candidate;
    try {
      // Lightweight verification request (token test to verify connection)
      const response = await ai.models.generateContent({
        model: candidate,
        contents: 'Halo',
        config: {
          maxOutputTokens: 5,
        },
      });

      if (response) {
        return {
          success: true,
          modelName: candidate,
        };
      }
    } catch (err: unknown) {
      lastError = err;
      if (isModelUnavailableError(err)) {
        // Coba model berikutnya di daftar fallback
        continue;
      }
      // Error lain (seperti API key invalid, 401, quota habis 429) tidak perlu retry model lain
      break;
    }
  }

  return {
    success: false,
    modelName: lastAttemptedModel,
    errorMessage: buildGeminiErrorMessage(lastError, lastAttemptedModel),
  };
}
