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
 * Mengambil HTTP status code dari error SDK secara andal (ApiError.status),
 * dengan fallback ke pencarian pola teks untuk error non-ApiError.
 */
export function extractStatusCode(err: unknown): number | undefined {
  if (err && typeof err === 'object') {
    const anyErr = err as { status?: unknown; code?: unknown };
    if (typeof anyErr.status === 'number') return anyErr.status;
    if (typeof anyErr.code === 'number') return anyErr.code;
  }
  const s = String(err);
  const match = s.match(/"code"\s*:\s*(\d{3})/i) || s.match(/"status"\s*:\s*(\d{3})/i) || s.match(/\b([45]\d{2})\b/);
  if (match && match[1]) {
    const parsed = parseInt(match[1], 10);
    if (!isNaN(parsed) && parsed >= 400 && parsed < 600) return parsed;
  }
  return undefined;
}

/**
 * Error transient di sisi server Google (bukan salah model/key), umumnya
 * pulih sendiri: 500 INTERNAL, 503 UNAVAILABLE (model overload), 504 timeout.
 */
export function isTransientServerError(err: unknown): boolean {
  const status = extractStatusCode(err);
  if (status === 500 || status === 502 || status === 503 || status === 504) return true;

  const s = String(err).toLowerCase();
  return (
    s.includes('"status":"internal"') ||
    s.includes('"status":"unavailable"') ||
    s.includes('internal error encountered') ||
    s.includes('overloaded') ||
    s.includes('deadline_exceeded') ||
    s.includes('server error')
  );
}

/**
 * Helper to determine if an error indicates model unavailability (404, not found, discontinued for new users, unsupported parameter/argument)
 */
export function isModelUnavailableError(err: unknown): boolean {
  // If it's a transient server error (500/503), do not classify as permanent model unavailable
  if (isTransientServerError(err)) return false;

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
  const status = extractStatusCode(err);
  const s = String(err).toLowerCase();

  // 1. Error transient di sisi server Google secara eksplisit
  if (isTransientServerError(err)) {
    return `Server Gemini (model ${modelName}) sedang mengalami gangguan sementara atau kelebihan permintaan dari pihak Google. Biasanya pulih sendiri dalam beberapa menit — silakan coba lagi.${status ? ` (Kode: ${status})` : ''}`;
  }

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

  // Fallback generik terakhir dengan kode status teknis
  const technicalDetail = status ? ` (Kode HTTP: ${status})` : '';
  return `Gagal memproses permintaan ke Gemini API karena sebab yang tidak dikenali (kemungkinan bukan masalah API Key)${technicalDetail}. Coba lagi beberapa saat lagi; jika terus berlanjut, laporkan ke tim kami.`;
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
      console.error(`[Humanizer] Verifikasi Gemini API error pada model "${candidate}":`, err);
      if (isModelUnavailableError(err) || isTransientServerError(err)) {
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
