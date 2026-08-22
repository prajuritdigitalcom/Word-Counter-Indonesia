import React from 'react';
import { TextStatistics } from '../lib/textAnalyzer';
import { formatNumberID } from '../lib/utils';

interface StatisticsGridProps {
  statistics: TextStatistics;
  screenReaderAnnouncement: string;
}

export const StatisticsGrid: React.FC<StatisticsGridProps> = ({
  statistics,
  screenReaderAnnouncement,
}) => {
  const detailItems = [
    { label: 'Kata', value: formatNumberID(statistics.wordCount) },
    { label: 'Karakter', value: formatNumberID(statistics.charCount) },
    { label: 'Karakter Tanpa Spasi', value: formatNumberID(statistics.charCountNoSpaces) },
    { label: 'Kata Unik', value: formatNumberID(statistics.uniqueWordCount) },
    { label: 'Jumlah Kalimat', value: formatNumberID(statistics.sentenceCount) },
    { label: 'Jumlah Paragraf', value: formatNumberID(statistics.paragraphCount) },
    { label: 'Estimasi Waktu Baca', value: statistics.readingTimeText },
  ];

  return (
    <div className="w-full bg-white border border-slate-200 rounded-xl p-4 sm:p-5">
      {/* Hidden screen reader live region */}
      <div
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {screenReaderAnnouncement}
      </div>

      {/* Header */}
      <h2 className="text-sm font-bold text-slate-800 pb-2 border-b border-slate-100">
        Detail Teks
      </h2>

      {/* Vertical detail list */}
      <div className="divide-y divide-slate-100">
        {detailItems.map((item) => (
          <div key={item.label} className="flex items-center justify-between py-2.5">
            <span className="text-sm text-slate-600 font-medium">{item.label}</span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 font-semibold text-sm tabular-nums">
              {item.value}
            </span>
          </div>
        ))}
      </div>

      {/* Footnote */}
      <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-400 leading-tight">
        <span>Kecepatan baca standar: 200 kata/menit</span>
      </div>
    </div>
  );
};
