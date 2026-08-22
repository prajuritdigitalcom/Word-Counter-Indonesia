import React from 'react';
import { CheckCircle2, AlertCircle, Info, Search } from 'lucide-react';
import { TextStatistics, KeywordDensityResult } from '../lib/textAnalyzer';
import { formatNumberID, formatPercentID } from '../lib/utils';

interface SeoCheckSectionProps {
  statistics: TextStatistics;
  keywordDensity: KeywordDensityResult;
  keyword: string;
  setKeyword: (val: string) => void;
}

export const SeoCheckSection: React.FC<SeoCheckSectionProps> = ({
  statistics,
  keywordDensity,
  keyword,
  setKeyword,
}) => {
  const { wordCount, avgWordsPerSentence, avgWordsPerParagraph } = statistics;

  const checks = [
    {
      id: 'length',
      title: 'Panjang Konten',
      status:
        wordCount >= 1000
          ? 'passed'
          : wordCount >= 500
          ? 'good'
          : wordCount > 0
          ? 'short'
          : 'empty',
      text:
        wordCount >= 1000
          ? `${formatNumberID(wordCount)} kata — Sangat memadai untuk artikel komprehensif.`
          : wordCount >= 500
          ? `${formatNumberID(wordCount)} kata — Memadai untuk standar artikel blog umum.`
          : wordCount > 0
          ? `${formatNumberID(wordCount)} kata — Format ringkas / konten pendek.`
          : 'Belum ada teks artikel untuk dianalisis.',
    },
    {
      id: 'sentence-length',
      title: 'Panjang Kalimat',
      status:
        avgWordsPerSentence > 0 && avgWordsPerSentence <= 22
          ? 'passed'
          : avgWordsPerSentence > 22
          ? 'warning'
          : 'empty',
      text:
        avgWordsPerSentence > 0 && avgWordsPerSentence <= 22
          ? `Rata-rata ${avgWordsPerSentence.toFixed(1)} kata/kalimat — Sangat mudah dibaca.`
          : avgWordsPerSentence > 22
          ? `Rata-rata ${avgWordsPerSentence.toFixed(1)} kata/kalimat — Pertimbangkan memecah beberapa kalimat panjang.`
          : 'Menunggu input teks.',
    },
    {
      id: 'paragraph-length',
      title: 'Panjang Paragraf',
      status:
        avgWordsPerParagraph > 0 && avgWordsPerParagraph <= 80
          ? 'passed'
          : avgWordsPerParagraph > 80
          ? 'warning'
          : 'empty',
      text:
        avgWordsPerParagraph > 0 && avgWordsPerParagraph <= 80
          ? `Rata-rata ${avgWordsPerParagraph.toFixed(1)} kata/paragraf — Nyaman dibaca di layar HP.`
          : avgWordsPerParagraph > 80
          ? `Rata-rata ${avgWordsPerParagraph.toFixed(1)} kata/paragraf — Paragraf agak panjang, disarankan menambah spasi baris.`
          : 'Menunggu input teks.',
    },
    {
      id: 'keyword-check',
      title: 'Keyword Target',
      status:
        keywordDensity.occurrences > 0 && keywordDensity.density <= 2.5 && keywordDensity.density >= 0.8
          ? 'passed'
          : keywordDensity.occurrences > 0 && keywordDensity.density > 2.5
          ? 'warning'
          : keywordDensity.keyword.trim().length > 0 && keywordDensity.occurrences === 0
          ? 'warning'
          : 'empty',
      text:
        keywordDensity.occurrences > 0 && keywordDensity.density <= 2.5 && keywordDensity.density >= 0.8
          ? `"${keywordDensity.keyword}" muncul ${keywordDensity.occurrences} kali (${formatPercentID(keywordDensity.density)}) — Kepadatan ideal.`
          : keywordDensity.occurrences > 0 && keywordDensity.density > 2.5
          ? `"${keywordDensity.keyword}" muncul ${keywordDensity.occurrences} kali (${formatPercentID(keywordDensity.density)}) — Batas wajar 1%–2,5%.`
          : keywordDensity.keyword.trim().length > 0 && keywordDensity.occurrences === 0
          ? `"${keywordDensity.keyword}" belum ditemukan dalam artikel.`
          : 'Masukkan keyword target di bawah untuk memantau kemunculannya.',
    },
  ];

  return (
    <div className="space-y-3 pt-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Pemeriksaan Struktur Konten (SEO Check)
        </h3>

        {/* Optional Manual Keyword Target Input for SEO check */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Target kata kunci SEO..."
            className="w-full pl-8 pr-3 py-1.5 text-xs text-slate-800 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-300 transition-all placeholder:text-slate-400"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      <div className="space-y-2">
        {checks.map((item) => (
          <div
            key={item.id}
            className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50/50 border border-slate-200/80 text-xs sm:text-sm"
          >
            {item.status === 'passed' || item.status === 'good' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : item.status === 'warning' ? (
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            ) : item.status === 'short' ? (
              <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            ) : (
              <div className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                <span className="w-1 h-1 rounded-full bg-slate-400" />
              </div>
            )}
            <div className="flex-1">
              <span className="font-semibold text-slate-700 mr-2">{item.title}:</span>
              <span className="text-slate-600 font-normal">{item.text}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
