/**
 * Humanizer Configuration Constants
 */
import { MIN_WORDS_FOR_SCORING } from '../../data/aiPatterns';

/**
 * Default Gemini model untuk humanisasi & penyuntingan teks.
 *
 * Per 22 Agustus 2026, lini model stabil (GA) Gemini 3.x dari yang TERBARU
 * ke yang PALING LAMA adalah:
 *   gemini-3.7-flash       -> terbaru & paling mumpuni (Stable)
 *   gemini-3.6-flash       -> satu seri di bawahnya (Stable)
 *   gemini-3.5-flash       -> dua seri di bawahnya (Stable)
 *   gemini-3.1-flash-lite  -> model lama yang sebelumnya jadi default di sini,
 *                             tetap Stable, dipakai sebagai jaring pengaman terakhir
 * Sumber: https://ai.google.dev/gemini-api/docs/models
 *
 * PENTING: jangan gunakan model keluarga "gemini-2.5-*" ATAU model berstatus
 * "Preview" (mis. gemini-3.1-pro-preview) sebagai default di sini. Sejak Juli
 * 2026 Google membatasi akses gemini-2.5-* hanya untuk API Key/project yang
 * sebelumnya sudah pernah memakainya — API Key BARU (persis kondisi mayoritas
 * pengguna BYOK aplikasi ini) akan selalu ditolak dengan error 404 "no longer
 * available to new users". Model Preview punya risiko akses berubah sewaktu-waktu
 * yang serupa. Selalu pakai model berstatus "Stable".
 * Lihat: https://discuss.ai.google.dev/t/gemini-2-5-pro-returns-no-longer-available-to-new-users-contradicts-official-deprecation-date-oct-16-2026/176380
 */
export const DEFAULT_GEMINI_MODEL = 'gemini-3.7-flash';

/**
 * Daftar model cadangan (fallback) yang dicoba berurutan apabila model utama
 * mengembalikan error "model not found / no longer available". Urutan sengaja
 * disusun MUNDUR SATU SERI setiap kali turun, dan diakhiri dengan model 3.1
 * Flash-Lite yang sudah lama terbukti stabil di produksi sebagai jaring
 * pengaman terakhir. Ini melindungi aplikasi dari insiden serupa di masa
 * depan tanpa perlu deploy ulang segera.
 */
export const FALLBACK_GEMINI_MODELS = [
  'gemini-3.7-flash',      // Utama: seri terbaru
  'gemini-3.6-flash',      // Fallback 1: mundur satu seri
  'gemini-3.5-flash',      // Fallback 2: mundur satu seri lagi
  'gemini-3.1-flash-lite', // Fallback 3: jaring pengaman terakhir (model lama yang terbukti stabil)
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
