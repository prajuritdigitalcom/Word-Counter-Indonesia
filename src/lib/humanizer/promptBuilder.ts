/**
 * Dynamic Prompt Builder for Humanizer Reverse Engine
 * Builds targeted, data-driven editorial instructions derived from active AI pattern signals.
 */
import { AiPatternResult } from '../ai/types';
import { HumanizerMode, HumanizerOptions } from './types';

export interface BuiltPrompt {
  systemInstruction: string;
  userPrompt: string;
  targetedInstructions: string[];
}

/**
 * Maps category results to specific targeted editorial instructions
 */
export function extractTargetedInstructions(
  analysis: AiPatternResult,
  mode: HumanizerMode
): string[] {
  const instructions: string[] = [];

  const categoryMap = new Map(analysis.categories.map((c) => [c.id, c]));

  // 1. AI-Specific Phrases
  const aiPhraseCat = categoryMap.get('aiSpecificPhrase');
  if (aiPhraseCat && (aiPhraseCat.contribution === 'Tinggi' || aiPhraseCat.contribution === 'Sedang')) {
    const detectedExamples = aiPhraseCat.matches.slice(0, 5).map((m) => `"${m.phrase}"`).join(', ');
    const exampleSnippet = detectedExamples ? ` (contoh terdeteksi dalam teks: ${detectedExamples})` : '';
    instructions.push(
      `Hapus atau ganti frasa template klise khas AI${exampleSnippet} menjadi kalimat yang lebih natural, lugas, dan mengalir.`
    );
  }

  // 2. Transitional Connectors
  const transitionCat = categoryMap.get('transition');
  if (transitionCat && (transitionCat.contribution === 'Tinggi' || transitionCat.contribution === 'Sedang')) {
    instructions.push(
      `Kurangi pemakaian kata transisi formal yang terlalu eksplisit dan berulang di awal kalimat/paragraf (seperti "Selain itu", "Dengan demikian", "Secara keseluruhan", "Oleh karena itu", "Di samping itu"). Hubungkan ide secara kohesif tanpa harus selalu menggunakan kata sambung formal.`
    );
  }

  // 3. Sentence Uniformity & Structure
  const sentenceCat = categoryMap.get('sentence');
  if (sentenceCat && (sentenceCat.contribution === 'Tinggi' || sentenceCat.contribution === 'Sedang')) {
    instructions.push(
      `Variasikan panjang dan ritme kalimat secara dinamis. Padukan kalimat pendek yang tegas dengan kalimat majemuk yang lebih mengalir, dan variasikan kata pertama pembuka kalimat agar tidak monoton.`
    );
  }

  // 4. Word & Phrase Repetition
  const repetitionCat = categoryMap.get('repetition');
  if (repetitionCat && (repetitionCat.contribution === 'Tinggi' || repetitionCat.contribution === 'Sedang')) {
    const repExamples = repetitionCat.matches.slice(0, 4).map((m) => `"${m.phrase}"`).join(', ');
    const repSnippet = repExamples ? ` (seperti pengulangan ${repExamples})` : '';
    instructions.push(
      `Kurangi pengulangan kata atau frasa yang muncul terlalu sering dalam jarak dekat${repSnippet}. Gunakan variasi struktur pembahasan yang segar.`
    );
  }

  // 5. Enumeration Triad Rhythm
  const enumerationCat = categoryMap.get('enumeration');
  if (enumerationCat && (enumerationCat.contribution === 'Tinggi' || enumerationCat.contribution === 'Sedang')) {
    instructions.push(
      `Kurangi pola penyebutan 3 kata sifat/kata kerja berurutan yang mekanis (contoh pola: "efektif, efisien, dan berkelanjutan"). Sederhanakan agar terasa lebih autentik.`
    );
  }

  // 6. Concreteness & Abstraction
  const concretenessCat = categoryMap.get('concreteness');
  if (concretenessCat && (concretenessCat.contribution === 'Tinggi' || concretenessCat.contribution === 'Sedang')) {
    instructions.push(
      `Gunakan diksi yang lebih membumi dan jelas. Pertahankan contoh konkret dan konteks nyata yang sudah ada pada teks asli tanpa menambahkan fakta fiktif.`
    );
  }

  // 7. Punctuation Rhythm
  const punctCat = categoryMap.get('punctuation');
  if (punctCat && (punctCat.contribution === 'Tinggi' || punctCat.contribution === 'Sedang')) {
    instructions.push(
      `Variasikan tanda baca dan jeda antarklausa agar ritme membaca terasa natural dan tidak kaku.`
    );
  }

  // 8. Paragraph Structure
  const paragraphCat = categoryMap.get('paragraph');
  if (paragraphCat && (paragraphCat.contribution === 'Tinggi' || paragraphCat.contribution === 'Sedang')) {
    instructions.push(
      `Variasikan kepadatan dan panjang paragraf agar tata letak tulisan memiliki dinamika yang baik.`
    );
  }

  // If no high signals were specifically identified but score is still noticeable
  if (instructions.length === 0) {
    instructions.push(
      `Tingkatkan variasi ritme kalimat dan haluskan aliran antargagasan agar tulisan terasa luwes dan autentik.`
    );
  }

  // Mode-specific adjustment
  if (mode === 'strong') {
    instructions.push(
      `Lakukan restrukturisasi kalimat secara menyeluruh dan berani merombak susunan klausa asalkan esensi informasi, akurasi fakta, dan nada dasar tulisan tetap terjaga utuh.`
    );
  } else if (mode === 'natural') {
    instructions.push(
      `Lakukan perbaikan secara halus dan minimalis, utamakan membenahi bagian-bagian yang paling kaku saja tanpa mengubah gaya penulisan utama.`
    );
  }

  return instructions;
}

/**
 * Builds the complete prompt payload for Gemini
 */
export function buildHumanizerPrompt(
  originalText: string,
  analysis: AiPatternResult,
  options: HumanizerOptions
): BuiltPrompt {
  const { mode, targetKeyword } = options;
  const targetedInstructions = extractTargetedInstructions(analysis, mode);

  const lengthRange =
    mode === 'strong' ? '85% hingga 115%' : '90% hingga 110%';

  const systemInstruction = `Anda adalah editor tulisan profesional Bahasa Indonesia yang bertugas menyunting teks agar memiliki gaya bahasa yang natural, luwes, dan mengalir seperti tulisan manusia asli tanpa kehilangan substansi.

Tugas Anda adalah melakukan perbaikan editorial stilistika berdasarkan sinyal pola penulisan yang terdeteksi.

ATURAN WAJIB PRESERVASI KONTEN (TIDAK BOLEH DILANGGAR):
1. Pertahankan semua fakta, data, angka, nama orang/tempat/merek/perusahaan, dan URL persis seperti sumber asli.
2. JANGAN menambahkan fakta fiktif baru, jangan mengarang data palsu, dan jangan membuat cerita pengalaman pribadi fiktif (misal: "Saya kemarin mencoba...", "Menurut pengalaman saya...") jika teks asli tidak memuatnya.
3. JANGAN melakukan spam sinonim mekanis (mengganti kata semata-mata dengan sinonim kaku seperti "penting" -> "krusial"). Perubahan harus pada struktur, ritme, dan keluwesan kalimat.
4. Pertahankan format penting seperti paragraf, poin daftar (bullet/numbered list), heading, jika ada.
5. Pertahankan nada (tone) tulisan asli (misal: jika teks asli adalah artikel formal jurnalisme/bisnis, pertahankan nada profesional formal; jangan diubah menjadi bahasa gaul/slang).
6. Target panjang hasil tulisan adalah sekitar ${lengthRange} dari jumlah kata teks asli.
${
  targetKeyword && targetKeyword.trim()
    ? `7. TARGET KEYWORD: Pastikan kata kunci utama "${targetKeyword.trim()}" tetap dipertahankan secara wajar dan natural di dalam teks.`
    : ''
}

KONTRAK OUTPUT:
Kembalikan HANYA teks hasil penyuntingan langsung. Jangan tambahkan kata pengantar (seperti "Berikut hasil perbaikannya:", "Tentu saja"), jangan tambahkan penjelasan perubahan, dan jangan bungkus dengan markdown code block (\`\`\`).`;

  // Summary of category signals for context
  const activeSignalsSummary = analysis.categories
    .filter((c) => c.applicable && (c.contribution === 'Tinggi' || c.contribution === 'Sedang'))
    .map((c) => `- ${c.name}: Kontribusi ${c.contribution} (Indikator: ${Math.round(c.rawScore * 100)}/100)`)
    .join('\n');

  const userPrompt = `Berikut adalah data analisis stilistika dan teks yang perlu Anda sunting:

---
DATA ANALISIS POLA TULISAN:
- Skor Pola AI Saat Ini: ${analysis.score}/100 (${analysis.labelText || 'Terdeteksi'})
- Mode Penyuntingan: ${mode.toUpperCase()}
- Sinyal Pola Utama yang Terdeteksi:
${activeSignalsSummary || '- Pola stilistika umum'}

INSTRUKSI EDITORIAL PRIORITAS:
${targetedInstructions.map((inst, idx) => `${idx + 1}. ${inst}`).join('\n')}

---
TEKS ASLI:
${originalText}
---

Silakan sunting teks di atas sesuai instruksi. Kembalikan HANYA teks hasil akhir.`;

  return {
    systemInstruction,
    userPrompt,
    targetedInstructions,
  };
}
