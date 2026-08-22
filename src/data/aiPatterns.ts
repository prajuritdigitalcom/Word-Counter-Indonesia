/**
 * Data patterns and weights for Multi-Signal Stylometric AI Pattern Engine (v2.0.0)
 * Adapted specifically for Indonesian writing conventions & false-positive mitigation.
 */

export const ENGINE_VERSION = '2.0.0';

// 1. Generic AI Vocabulary & Overused Terms
export const GENERIC_VOCABULARY: string[] = [
  'penting',
  'optimal',
  'efektif',
  'signifikan',
  'berbagai',
  'tentunya',
  'secara umum',
  'dapat membantu',
  'memberikan manfaat',
  'meningkatkan kualitas',
  'perlu diperhatikan',
  'menjadi salah satu',
  'memegang peranan',
  'berkelanjutan',
  'komprehensif',
  'holistik',
  'fleksibilitas',
  'krusial',
  'strategis',
];

// 2. Common Formal Indonesian Phrases (Low Specificity - penalize/dampen score contribution)
export const COMMON_FORMAL_PHRASES: string[] = [
  'oleh karena itu',
  'selain itu',
  'dengan demikian',
  'namun demikian',
  'pada akhirnya',
  'secara keseluruhan',
  'sebagai kesimpulan',
  'di samping itu',
  'sehubungan dengan',
  'berdasarkan hal tersebut',
  'merujuk pada',
];

// 3. Cliché AI Fillers & Padding (Medium Specificity)
export const CLICHE_PHRASES: string[] = [
  'memainkan peran penting',
  'menjadi bukti',
  'kaya akan',
  'warisan yang kaya',
  'hal ini menunjukkan bahwa',
  'penting untuk dicatat bahwa',
  'dalam era digital saat ini',
  'tidak dapat dipungkiri bahwa',
  'seiring berjalannya waktu',
  'membuka pintu bagi',
  'tak terbantahkan bahwa',
  'menapaki era baru',
  'patut digarisbawahi bahwa',
  'merupakan pilar utama',
];

// 4. Paragraph Start Transitions
export const PARAGRAPH_START_TRANSITIONS: string[] = [
  'selain itu',
  'selanjutnya',
  'dengan demikian',
  'oleh karena itu',
  'di sisi lain',
  'lebih lanjut',
  'namun demikian',
  'di samping itu',
  'sebagai tambahan',
  'kendati demikian',
  'pada akhirnya',
  'secara keseluruhan',
];

// 5. Atribusi Samar (Vague Attribution)
export const VAGUE_ATTRIBUTION_PHRASES: string[] = [
  'banyak yang mengatakan',
  'banyak orang percaya bahwa',
  'para ahli menyebutkan',
  'para pakar meyakini',
  'studi menunjukkan',
  'penelitian membuktikan bahwa',
  'sebagian besar orang berpendapat',
  'banyak ahli sepakat',
];

// 6. High-Confidence AI Assistant Meta Phrases (High Specificity)
export const AI_ASSISTANT_META_PHRASES: string[] = [
  'tentu, berikut adalah',
  'tentu! berikut',
  'tentu, ini adalah',
  'semoga membantu',
  'semoga penjelasan ini membantu',
  'semoga informasi ini bermanfaat',
  'berikut adalah beberapa poin penting',
  'berikut beberapa poin penting',
  'perlu diingat bahwa',
  'sebagai model bahasa ai',
  'sebagai ai',
  'sebagai asisten',
  'sebagai asisten virtual',
  'saya akan membantu menjelaskan',
  'saya siap membantu',
  'jangan ragu untuk bertanya',
  'jika anda memiliki pertanyaan lebih lanjut',
  'apakah ada hal lain yang bisa saya bantu',
];

// 7. Human Naturalness / Informal Indonesian Markers
export const INFORMAL_MARKERS: string[] = [
  'kok',
  'dong',
  'nih',
  'sih',
  'nggak',
  'gak',
  'bisa saja',
  'gimana',
  'udah',
  'banget',
  'beneran',
  'cuman',
  'kayak',
  'aja',
  'deh',
];

// 8. Human First-Person Experience Markers
export const FIRST_PERSON_EXPERIENCE_MARKERS: string[] = [
  'saya mengalami',
  'menurut pengalaman saya',
  'ketika saya mencoba',
  'di tempat saya',
  'saya pribadi',
  'pengalaman kami',
  'saya sempat',
  'saya perhatikan saat',
  'pengamatan saya',
];

// 9. Standard Indonesian Function Words (Stopwords)
export const INDONESIAN_FUNCTION_WORDS: Set<string> = new Set([
  'yang',
  'dan',
  'untuk',
  'dengan',
  'dari',
  'pada',
  'dalam',
  'sebagai',
  'terhadap',
  'serta',
  'karena',
  'sehingga',
  'namun',
  'tetapi',
  'ke',
  'di',
  'atau',
  'jika',
  'agar',
  'oleh',
  'tentang',
]);

// Thresholds & Weights
export const MIN_WORDS_FOR_SCORING = 150;
export const MIN_CATEGORIES_FOR_HIGH_TIER = 3;

export const FEATURE_WEIGHTS = {
  lexical: 0.12,
  sentence: 0.16,
  paragraph: 0.08,
  repetition: 0.14,
  enumeration: 0.12,
  concreteness: 0.08,
  transition: 0.08,
  punctuation: 0.06,
  aiSpecificPhrase: 0.16,
  naturalnessPenalty: 0.10,
};

export const AI_DISCLAIMER_TEXT =
  'Indikator ini menunjukkan pola yang mirip tulisan AI, bukan bukti teks dibuat AI. Tulisan formal juga bisa memiliki pola serupa dan mendapat skor tinggi.';
