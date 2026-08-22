/**
 * Unit & Integration Tests for Humanizer Module
 */
import { maskApiKey } from './keyStorage';
import { cleanRawOutput, validateHumanizerOutput } from './qualityGate';
import { buildHumanizerPrompt, extractTargetedInstructions } from './promptBuilder';
import { analyzeAiPatterns } from '../ai/analyzer';
import { DEFAULT_GEMINI_MODEL, FALLBACK_GEMINI_MODELS } from './config';
import { isModelUnavailableError, buildGeminiErrorMessage } from './keyVerification';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ [FAIL] ${message}`);
    process.exit(1);
  }
  console.log(`✅ [PASS] ${message}`);
}

console.log('=== RUNNING HUMANIZER UNIT TESTS ===');

// 1. API Key Masking
assert(maskApiKey('AIzaSyD8394017234907Kp') === 'AIza••••••7Kp', 'maskApiKey should correctly format prefix and suffix');
assert(maskApiKey('') === '••••••••', 'maskApiKey empty string fallback');
assert(maskApiKey('123') === '••••••••', 'maskApiKey short string fallback');

// 2. Clean Raw Output
const wrappedMarkdown = '```markdown\nIni adalah teks hasil penyuntingan yang bersih.\n```';
assert(cleanRawOutput(wrappedMarkdown) === 'Ini adalah teks hasil penyuntingan yang bersih.', 'cleanRawOutput strips markdown code block');

const wrappedIntro = 'Tentu, berikut adalah hasil perbaikannya:\n\nIni adalah isi artikel yang sudah disunting.';
assert(cleanRawOutput(wrappedIntro) === 'Ini adalah isi artikel yang sudah disunting.', 'cleanRawOutput strips conversational intro');

// 3. Quality Gate Validation
const origSample = `Pemerintah Kota Bandung pada tanggal 14 Maret 2025 merilis laporan audit terkait sistem transportasi terpadu. Berdasarkan data dari Dinas Perhubungan, sebanyak 42.500 penumpang harian memanfaatkan koridor utama Trans Metro Bandung. Anggaran subsidi sebesar Rp18,5 miliar dinilai tepat sasaran. Kunjungi portal resmi di https://bandung.go.id/transportasi untuk informasi rute lebih lanjut.`;

// Test valid output
const validRewritten = `Pada 14 Maret 2025, Pemerintah Kota Bandung mempublikasikan laporan audit mengenai efektivitas transportasi publik. Catatan Dinas Perhubungan menunjukkan sekitar 42.500 penumpang harian menaiki armada Trans Metro Bandung. Alokasi subsidi senilai Rp18,5 miliar dinyatakan telah sesuai sasaran. Informasi jadwal dan rute dapat diakses melalui https://bandung.go.id/transportasi.`;

const validCheck = validateHumanizerOutput(origSample, validRewritten, 'balanced', 'Bandung');
assert(validCheck.passed === true, 'Quality gate passes valid humanized text');
assert(validCheck.warnings.length === 0, 'No warnings for preserved keywords, numbers, and URLs');

// Test keyword missing warning
const kwMissingCheck = validateHumanizerOutput(origSample, validRewritten, 'balanced', 'Surabaya');
assert(kwMissingCheck.warnings.some((w) => w.includes('Surabaya')), 'Warns when target keyword is missing');

// Test URL missing warning
const urlMissingRewritten = `Pada 14 Maret 2025, Pemerintah Kota Bandung mempublikasikan laporan audit tanpa tautan rute.`;
const urlMissingCheck = validateHumanizerOutput(origSample, urlMissingRewritten, 'balanced');
assert(urlMissingCheck.warnings.some((w) => w.includes('https://bandung.go.id/transportasi')), 'Warns when original URL is missing');

// 4. Prompt Builder with AI Pattern Signals
const aiSample = `Bekerja dari rumah menawarkan fleksibilitas tinggi namun sering kali memudarkan batasan antara urusan profesional dan kehidupan pribadi. Tanpa struktur harian yang jelas, pekerja jarak jauh rentan mengalami kelelahan mental akibat jam kerja yang tidak teratur dan beban tugas yang menumpuk. Penerapan teknik time blocking dan penentuan jam kerja tetap menjadi fondasi penting untuk mempertahankan ritme kerja yang sehat, terarah, dan produktif di tengah dinamika kerja fleksibel saat ini.

Selain pengaturan jadwal, menciptakan ruang kerja yang terpisah di dalam rumah dapat membantu meningkatkan konsentrasi selama jam kerja berlangsung. Membatasi notifikasi media sosial dan menetapkan prioritas harian menggunakan matriks tugas juga membantu mengurangi distraksi digital yang sering menghambat penyelesaian tugas utama secara optimal. Penggunaan alat bantu produktitivas yang tepat tentunya dapat membantu mengelola jadwal harian dengan lebih efektif.

Komunikasi asinkron yang jelas dengan rekan satu tim turut memegang peranan krusial dalam kelancaran kolaborasi jarak jauh. Melalui dokumentasi kerja yang transparan, penyusunan laporan berkala, dan evaluasi rutin terhadap beban kerja, profesional remote dapat menjaga keseimbangan hidup tanpa mengorbankan kualitas hasil kerja yang diharapkan oleh perusahaan secara berkesinambungan.`;

const analysis = analyzeAiPatterns(aiSample, 'kerja');
const targetedInstructions = extractTargetedInstructions(analysis, 'balanced');
assert(targetedInstructions.length > 0, 'Targeted instructions extracted based on active signals');

const prompt = buildHumanizerPrompt(aiSample, analysis, { mode: 'balanced', targetKeyword: 'kerja' });
assert(prompt.systemInstruction.includes('editor tulisan profesional'), 'System instruction has professional editor persona');
assert(prompt.systemInstruction.includes('TARGET KEYWORD: Pastikan kata kunci utama "kerja"'), 'Prompt includes target keyword instruction');
assert(prompt.userPrompt.includes('DATA ANALISIS POLA TULISAN'), 'User prompt contains stylometric analysis payload');
assert(prompt.userPrompt.includes('Skor Pola AI'), 'User prompt contains AI pattern score');

// 5. Gemini 3.x Models & Fallback Architecture
assert(!DEFAULT_GEMINI_MODEL.startsWith('gemini-2.5'), 'DEFAULT_GEMINI_MODEL should not use deprecated/restricted 2.5 family');
assert(DEFAULT_GEMINI_MODEL === 'gemini-3.7-flash', 'DEFAULT_GEMINI_MODEL is gemini-3.7-flash');
assert(FALLBACK_GEMINI_MODELS.length >= 2, 'FALLBACK_GEMINI_MODELS contains multiple candidates');
assert(FALLBACK_GEMINI_MODELS.includes('gemini-3.5-flash'), 'FALLBACK_GEMINI_MODELS includes gemini-3.5-flash');
assert(FALLBACK_GEMINI_MODELS[0] === DEFAULT_GEMINI_MODEL, 'Fallback list dimulai dari model default/terbaru');
assert(FALLBACK_GEMINI_MODELS[FALLBACK_GEMINI_MODELS.length - 1] === 'gemini-3.1-flash-lite', 'Fallback chain diakhiri model lama yang terbukti stabil');

// 6. Error & Model Unavailability Parsing
const err404 = new Error('This model models/gemini-2.5-flash is no longer available to new users.');
assert(isModelUnavailableError(err404) === true, 'isModelUnavailableError detects "no longer available"');
assert(isModelUnavailableError(new Error('404 NOT_FOUND')) === true, 'isModelUnavailableError detects 404 NOT_FOUND');
assert(isModelUnavailableError(new Error('API_KEY_INVALID: 401')) === false, 'isModelUnavailableError does not trigger for 401');

const msgNoLonger = buildGeminiErrorMessage(err404, 'gemini-2.5-flash');
assert(msgNoLonger.includes('tidak tersedia dari pihak Google'), 'buildGeminiErrorMessage provides clear Indonesian explanation for unavailable models');

const errAuth = new Error('API_KEY_INVALID');
const msgAuth = buildGeminiErrorMessage(errAuth, 'gemini-3.1-flash-lite');
assert(msgAuth.includes('API Key tidak valid atau telah dicabut'), 'buildGeminiErrorMessage provides clear Indonesian message for invalid key');

const errQuota = new Error('RESOURCE_EXHAUSTED: quota exceeded 429');
const msgQuota = buildGeminiErrorMessage(errQuota, 'gemini-3.1-flash-lite');
assert(msgQuota.includes('kuota atau rate limit'), 'buildGeminiErrorMessage provides clear quota message');

console.log('=== ALL HUMANIZER UNIT TESTS PASSED ===');
