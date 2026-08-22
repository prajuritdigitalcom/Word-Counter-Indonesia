/**
 * Humanizer Configuration Constants
 */
import { MIN_WORDS_FOR_SCORING } from '../../data/aiPatterns';

/**
 * Default Gemini model untuk humanisasi & penyuntingan teks.
 * PENTING: jangan gunakan model keluarga "gemini-2.5-*" di sini.
 * Sejak Juli 2026 Google membatasi akses model tersebut hanya untuk
 * API Key/project yang sebelumnya sudah pernah memakainya — API Key BARU
 * (persis kondisi mayoritas pengguna BYOK aplikasi ini) akan selalu
 * ditolak dengan error 404 "no longer available to new users".
 * Lihat: https://discuss.ai.google.dev/t/gemini-2-5-pro-returns-no-longer-available-to-new-users-contradicts-official-deprecation-date-oct-16-2026/176380
 */
export const DEFAULT_GEMINI_MODEL = 'gemini-3.1-flash-lite';

/**
 * Daftar model cadangan (fallback) yang dicoba berurutan apabila model utama
 * mengembalikan error "model not found / no longer available". Ini melindungi
 * aplikasi dari insiden serupa di masa depan tanpa perlu deploy ulang segera.
 */
export const FALLBACK_GEMINI_MODELS = [
  'gemini-3.1-flash-lite',
  'gemini-3.5-flash',
  'gemini-3.6-flash',
];

/**
 * Minimum word count required for the humanizer engine (must match AI Pattern Engine minimum).
 */
export const MIN_HUMANIZER_WORD_COUNT = MIN_WORDS_FOR_SCORING; // 150 words

/**
 * LocalStorage key for client-side BYOK
 */
export const STORAGE_KEY_GEMINI = 'prajurit_digital_gemini_key_v1';
export const STORAGE_KEY_CONFIG = 'prajurit_digital_gemini_config_v1';

/**
 * Maximum passes allowed per user-initiated session (1 initial pass + 1 optional manual second pass)
 */
export const MAX_HUMANIZER_PASSES = 2;
