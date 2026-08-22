/**
 * Verification test suite for Text Analyzer & Multi-Signal AI Pattern Engine (v2.1.0)
 */
import {
  countWords,
  countCharacters,
  countCharactersWithoutSpaces,
  countCharacterStats,
  countSentences,
  countParagraphs,
  calculateReadingTime,
  calculateKeywordDensity,
  analyzeText,
} from './textAnalyzer';
import { analyzeAiPatterns } from './aiPatternAnalyzer';
import { evaluateDataset } from './ai/evaluator';
import {
  HUMAN_FORMAL_SAMPLES,
  HUMAN_INFORMAL_SAMPLES,
  HUMAN_CODESWITCH_SAMPLES,
  HUMAN_SEO_BUSINESS_SAMPLES,
  AI_GENERIC_SAMPLES,
  AI_REALISTIC_SAMPLES,
  AI_SINGLE_PARAGRAPH_SAMPLES,
  AI_CONVERSATIONAL_SAMPLES,
  TEST_DETECTION_SAMPLES,
} from '../data/aiDetectionSamples';

export function runTests(): { passed: boolean; results: string[] } {
  const results: string[] = [];
  let allPassed = true;

  function assert(condition: boolean, testName: string, actual?: any, expected?: any) {
    if (condition) {
      results.push(`✅ [PASS] ${testName}`);
    } else {
      allPassed = false;
      results.push(`❌ [FAIL] ${testName} -> Expected: ${JSON.stringify(expected)}, Got: ${JSON.stringify(actual)}`);
    }
  }

  // Case 1: "Halo dunia."
  const c1Text = 'Halo dunia.';
  assert(countWords(c1Text) === 2, 'Case 1: Word count should be 2', countWords(c1Text), 2);
  assert(countSentences(c1Text) === 1, 'Case 1: Sentence count should be 1', countSentences(c1Text), 1);
  assert(countParagraphs(c1Text) === 1, 'Case 1: Paragraph count should be 1', countParagraphs(c1Text), 1);

  // Case 2: "Halo.\n\nDunia."
  const c2Text = 'Halo.\n\nDunia.';
  assert(countParagraphs(c2Text) === 2, 'Case 2: Paragraph count should be 2', countParagraphs(c2Text), 2);

  // Case 3: Multiple spaces "Saya   belajar\nSEO"
  const c3Text = 'Saya   belajar\nSEO';
  assert(countWords(c3Text) === 3, 'Case 3: Multiple spaces word count should be 3', countWords(c3Text), 3);

  // Case 4: Empty input
  const c4Text = '';
  assert(countWords(c4Text) === 0, 'Case 4: Empty words should be 0', countWords(c4Text), 0);
  assert(countCharacters(c4Text) === 0, 'Case 4: Empty chars should be 0', countCharacters(c4Text), 0);
  assert(countSentences(c4Text) === 0, 'Case 4: Empty sentences should be 0', countSentences(c4Text), 0);
  assert(countParagraphs(c4Text) === 0, 'Case 4: Empty paragraphs should be 0', countParagraphs(c4Text), 0);
  assert(calculateReadingTime(0).text === '0 menit', 'Case 4: Reading time 0 should be "0 menit"');

  // Case 5: Case-insensitive keyword "Sauna Kayu"
  const c5Text = 'Sauna Kayu adalah produk kayu. SAUNA KAYU cocok untuk rumah.';
  const c5Res = calculateKeywordDensity(c5Text, 'Sauna Kayu', countWords(c5Text));
  assert(c5Res.occurrences === 2, 'Case 5: Keyword occurrences should be 2', c5Res.occurrences, 2);

  // Case 6: Indonesian currency separator "Total penjualan mencapai Rp2.500.000 pada bulan ini."
  const c6Text = 'Total penjualan mencapai Rp2.500.000 pada bulan ini.';
  assert(countSentences(c6Text) === 1, 'Case 6: Currency dots should count as 1 sentence', countSentences(c6Text), 1);

  // Case 7: Emoji Grapheme counting "Halo 👋 dunia 🌏!"
  const c7Text = 'Halo 👋 dunia 🌏!';
  const c7Count = countCharacters(c7Text);
  assert(c7Count === 15, 'Case 7: Emoji grapheme count should be 15', c7Count, 15);

  // Case 8: Unique words counting
  const c8Text = 'Halo dunia halo SEMUA dunia';
  const c8Analysis = analyzeText(c8Text);
  assert(c8Analysis.uniqueWordCount === 3, 'Case 8: Unique word count should be 3', c8Analysis.uniqueWordCount, 3);

  // Case 9: N-gram extraction without stopword filtering
  const c9Text = 'teknologi yang lebih baik dengan sistem yang lebih cepat dan yang lebih handal';
  const c9Analysis = analyzeText(c9Text);
  assert(c9Analysis.topBigrams.length > 0, 'Case 9: Should extract bigrams', c9Analysis.topBigrams.length > 0, true);
  assert(c9Analysis.topBigrams[0].phrase === 'yang lebih', 'Case 9: Top bigram should be "yang lebih"', c9Analysis.topBigrams[0].phrase, 'yang lebih');
  assert(c9Analysis.topBigrams[0].count === 3, 'Case 9: "yang lebih" should appear 3 times', c9Analysis.topBigrams[0].count, 3);

  // K-1: Numbered and lettered lists sentence counting
  const k1Text = '1. Pilih topik yang relevan. 2. Riset kata kunci utama. 3. Susun outline artikel.';
  const k1Count = countSentences(k1Text);
  assert(k1Count === 3, 'K-1: Numbered list should count exactly 3 sentences', k1Count, 3);

  const k1LetterText = 'a. Tahap awal penulisan. b. Tahap editing naskah.';
  const k1LetterCount = countSentences(k1LetterText);
  assert(k1LetterCount === 2, 'K-1: Letter list should count exactly 2 sentences', k1LetterCount, 2);

  // K-2: Multi-word keyword with double spaces or linebreaks
  const k2Text = 'Kami menjual sauna kayu berkualitas. Produk sauna  kayu ini tahan lama.';
  const k2Res = calculateKeywordDensity(k2Text, 'sauna kayu', countWords(k2Text));
  assert(k2Res.occurrences === 2, 'K-2: Multi-word keyword with flexible spacing should match 2 occurrences', k2Res.occurrences, 2);

  // T-1: Reading time rounding with Math.round & sub-minute handling
  assert(calculateReadingTime(50).text === '< 1 menit', 'T-1: 50 words should be "< 1 menit"');
  assert(calculateReadingTime(200).text === '1 menit', 'T-1: 200 words should be "1 menit"');
  assert(calculateReadingTime(201).text === '1 menit', 'T-1: 201 words should round to "1 menit" (not jump to 2)');
  assert(calculateReadingTime(299).text === '1 menit', 'T-1: 299 words should be "1 menit"');
  assert(calculateReadingTime(300).text === '2 menit', 'T-1: 300 words should be "2 menit"');

  // T-2: Indonesian titles and abbreviations
  const t2TitleText = 'Dr. Andi menjelaskan hal itu dengan detail. Semua audiens paham.';
  const t2TitleCount = countSentences(t2TitleText);
  assert(t2TitleCount === 2, 'T-2: Title "Dr." should not break sentence', t2TitleCount, 2);

  const t2InitialText = 'Budi S. Pratama adalah penulis utama. Ia bekerja sebagai editor.';
  const t2InitialCount = countSentences(t2InitialText);
  assert(t2InitialCount === 2, 'T-2: Middle initial "S." should not break sentence', t2InitialCount, 2);

  // T-3: Single-pass character statistics
  const t3Stats = countCharacterStats('Hai 🇮🇩 dunia!');
  assert(t3Stats.total === 12, 'T-3: Flag emoji grapheme stats total', t3Stats.total, 12);
  assert(t3Stats.withoutSpaces === 10, 'T-3: Grapheme stats without spaces', t3Stats.withoutSpaces, 10);
  assert(countCharacters('Hai 🇮🇩 dunia!') === 12, 'T-3: countCharacters matches single-pass');
  assert(countCharactersWithoutSpaces('Hai 🇮🇩 dunia!') === 10, 'T-3: countCharactersWithoutSpaces matches single-pass');

  // R-1: Pure number n-grams skipped
  const r1Text = 'Harga produk Rp 500 000 per unit untuk 500 000 pengguna.';
  const r1Analysis = analyzeText(r1Text);
  const pureNumberBigram = r1Analysis.topBigrams.find((b) => b.phrase === '500 000');
  assert(!pureNumberBigram, 'R-1: Pure number phrases like "500 000" should be excluded from topBigrams');

  // R-4: Single-newline separated lines should count as 3 paragraphs
  const r4Text = 'Baris pertama\nBaris kedua\nBaris ketiga';
  assert(countParagraphs(r4Text) === 3, 'R-4: Single-newline separated lines should count as 3 paragraphs', countParagraphs(r4Text), 3);

  // ==========================================
  // --- AI Pattern Indicator v2.1.0 Tests ---
  // ==========================================

  // AI-1: Empty input
  const aiEmpty = analyzeAiPatterns('');
  assert(aiEmpty.status === 'empty' && aiEmpty.score === 0, 'AI-1: Empty input gives empty status and 0 score');

  // AI-2: Below 150 words threshold
  const shortText = 'Ini adalah teks pendek yang belum mencapai seratus lima puluh kata untuk dianalisis pola AI.';
  const aiShort = analyzeAiPatterns(shortText);
  assert(aiShort.status === 'tooShort' && aiShort.label === null, 'AI-2: Below 150 words returns status tooShort without label');

  // AI-3: Human Formal Writing - False Positive Resilience (< 40)
  const humanFormalResult = analyzeAiPatterns(HUMAN_FORMAL_SAMPLES[0].text);
  assert(
    humanFormalResult.status === 'scored' && humanFormalResult.score < 40,
    `AI-3: Human Formal text should have low/moderate score (< 40), got ${humanFormalResult.score}`,
    humanFormalResult.score,
    '< 40'
  );

  // AI-4: AI Generic Writing without Meta Phrases
  const aiGenericResult = analyzeAiPatterns(AI_GENERIC_SAMPLES[0].text);
  assert(
    aiGenericResult.status === 'scored' && aiGenericResult.score >= 50,
    `AI-4: Generic AI text should be detected via stylometry (score >= 50), got ${aiGenericResult.score}`,
    aiGenericResult.score,
    '>= 50'
  );

  // AI-5: AI Chatbot / Conversational Writing
  const aiChatbotResult = analyzeAiPatterns(AI_CONVERSATIONAL_SAMPLES[0].text);
  assert(
    aiChatbotResult.status === 'scored' && aiChatbotResult.score >= 50,
    `AI-5: Conversational AI with meta phrases should score high (>= 50), got ${aiChatbotResult.score}`,
    aiChatbotResult.score,
    '>= 50'
  );

  // AI-6: Human Informal Writing
  const humanInformalResult = analyzeAiPatterns(HUMAN_INFORMAL_SAMPLES[0].text);
  assert(
    humanInformalResult.status === 'scored' && humanInformalResult.score < 30,
    `AI-6: Human informal text should have low score (< 30), got ${humanInformalResult.score}`,
    humanInformalResult.score,
    '< 30'
  );

  // AI-7: Human Code-Switching
  const humanCodeSwitchResult = analyzeAiPatterns(HUMAN_CODESWITCH_SAMPLES[0].text);
  assert(
    humanCodeSwitchResult.status === 'scored' && humanCodeSwitchResult.score < 40,
    `AI-7: Human code-switching text should not be penalized (< 40), got ${humanCodeSwitchResult.score}`,
    humanCodeSwitchResult.score,
    '< 40'
  );

  // AI-N1: Human Narrative / Personal Reflections should remain in Low tier (< 25)
  const humanNarrativeSample = HUMAN_INFORMAL_SAMPLES.find((s) => s.id === 'hn-1');
  if (humanNarrativeSample) {
    const narrativeRes = analyzeAiPatterns(humanNarrativeSample.text);
    assert(
      narrativeRes.score < 25,
      `AI-N1: Human personal narrative should remain low (< 25), got ${narrativeRes.score}`,
      narrativeRes.score,
      '< 25'
    );
  }

  // AI-AR1: Realistic AI Writing (Non-caricature) should score >= 50
  const aiRealisticRes = analyzeAiPatterns(AI_REALISTIC_SAMPLES[0].text);
  assert(
    aiRealisticRes.score >= 50,
    `AI-AR1: Realistic AI writing should reach high tier (score >= 50), got ${aiRealisticRes.score}`,
    aiRealisticRes.score,
    '>= 50'
  );

  // AI-SP1: AI Single-Paragraph with strong signal should score >= 50
  const aiSingleParaRes = analyzeAiPatterns(AI_SINGLE_PARAGRAPH_SAMPLES[0].text);
  assert(
    aiSingleParaRes.score >= 50,
    `AI-SP1: AI 1-paragraph dense text should reach high tier (score >= 50), got ${aiSingleParaRes.score}`,
    aiSingleParaRes.score,
    '>= 50'
  );

  // AI-SEO1: Human SEO with repetitive focal keyword should not trigger false positive
  const humanSeoRes = analyzeAiPatterns(HUMAN_SEO_BUSINESS_SAMPLES[0].text, 'jasa service AC Surabaya');
  assert(
    humanSeoRes.score < 40,
    `AI-SEO1: Human localized SEO article should not be flagged as AI (< 40), got ${humanSeoRes.score}`,
    humanSeoRes.score,
    '< 40'
  );

  // AI-8: Evaluator Benchmark Metrics on Held-Out Test Split
  const evalMetrics = evaluateDataset(TEST_DETECTION_SAMPLES, 48);
  assert(
    evalMetrics.falsePositiveRate <= 0.15,
    `AI-8: False Positive Rate on held-out test split should be <= 15%, got ${(evalMetrics.falsePositiveRate * 100).toFixed(1)}%`,
    evalMetrics.falsePositiveRate,
    '<= 0.15'
  );
  assert(
    evalMetrics.recall >= 0.80,
    `AI-8: Recall on held-out test split should be >= 80%, got ${(evalMetrics.recall * 100).toFixed(1)}%`,
    evalMetrics.recall,
    '>= 0.80'
  );

  return { passed: allPassed, results };
}

// Auto-run if executed directly
const testRun = runTests();
console.log(testRun.results.join('\n'));
if (!testRun.passed) {
  process.exit(1);
}
