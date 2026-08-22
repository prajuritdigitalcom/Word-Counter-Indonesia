import React from 'react';
import { TextStatistics } from '../lib/textAnalyzer';
import { formatDecimalID } from '../lib/utils';

interface TextAnalysisProps {
  statistics: TextStatistics;
}

export const TextAnalysis: React.FC<TextAnalysisProps> = ({ statistics }) => {
  const analysisItems = [
    {
      title: 'Rata-rata Kata per Kalimat',
      value: formatDecimalID(statistics.avgWordsPerSentence, 1),
      unit: 'kata/kalimat',
      ideal: 'Ideal: 15–20 kata untuk keterbacaan umum.',
    },
    {
      title: 'Rata-rata Kata per Paragraf',
      value: formatDecimalID(statistics.avgWordsPerParagraph, 1),
      unit: 'kata/paragraf',
      ideal: 'Ideal: 40–80 kata agar tidak padat di HP.',
    },
    {
      title: 'Rata-rata Karakter per Kata',
      value: formatDecimalID(statistics.avgCharsPerWord, 1),
      unit: 'karakter/kata',
      ideal: 'Kompleksitas morfologi kosa kata teks.',
    },
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
        Rata-rata Struktur Penulisan
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {analysisItems.map((item) => (
          <div
            key={item.title}
            className="p-3.5 bg-slate-50/70 rounded-lg border border-slate-200/80 flex flex-col justify-between"
          >
            <div>
              <span className="text-xs text-slate-500 font-medium">{item.title}</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-xl font-bold text-slate-800">{item.value}</span>
                <span className="text-xs text-slate-400 font-normal">{item.unit}</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">{item.ideal}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
