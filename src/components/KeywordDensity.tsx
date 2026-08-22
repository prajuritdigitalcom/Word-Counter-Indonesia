import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { TextStatistics } from '../lib/textAnalyzer';

interface KeywordDensityProps {
  statistics: TextStatistics;
}

export const KeywordDensity: React.FC<KeywordDensityProps> = ({ statistics }) => {
  const [activeTab, setActiveTab] = useState<1 | 2 | 3>(1);
  const [isOpen, setIsOpen] = useState<boolean>(true);

  const { wordCount, topWords, topBigrams, topTrigrams } = statistics;

  // Determine active list items based on activeTab
  const getActiveItems = () => {
    if (activeTab === 1) {
      return topWords.map((item) => ({
        phrase: item.word.toLowerCase(),
        count: item.count,
        percentage: Math.round(item.percentage),
      }));
    }
    if (activeTab === 2) {
      return topBigrams.map((item) => ({
        phrase: item.phrase.toLowerCase(),
        count: item.count,
        percentage: Math.round(item.percentage),
      }));
    }
    return topTrigrams.map((item) => ({
      phrase: item.phrase.toLowerCase(),
      count: item.count,
      percentage: Math.round(item.percentage),
    }));
  };

  const activeItems = getActiveItems();

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Header with Title, x1/x2/x3 Text Links, and Collapse Chevron */}
      <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-slate-100 bg-white">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="text-sm font-bold text-slate-800">
            <span>Keyword Density</span>
          </div>

          {/* x1 / x2 / x3 text tabs */}
          <div className="flex items-center gap-2.5 text-xs font-semibold" role="tablist">
            {( [1, 2, 3] as const ).map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-0.5 transition-colors cursor-pointer ${
                    isActive
                      ? 'text-[#fe4c6f] border-b-2 border-[#fe4c6f] font-bold'
                      : 'text-slate-400 hover:text-slate-700'
                  }`}
                >
                  x{tab}
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="text-slate-400 hover:text-slate-600 p-1 rounded transition-colors focus:outline-none"
          aria-expanded={isOpen}
          aria-label={isOpen ? 'Tutup Keyword Density' : 'Buka Keyword Density'}
        >
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* List content */}
      {isOpen && (
        <div className="p-4 sm:p-5 animate-in fade-in duration-150">
          {wordCount === 0 ? (
            <p className="text-xs text-slate-400 py-3 text-center">
              Masukkan teks artikel terlebih dahulu untuk melihat frasa yang paling sering muncul.
            </p>
          ) : activeItems.length === 0 ? (
            <p className="text-xs text-slate-400 py-3 text-center">
              {activeTab === 1
                ? 'Tidak ada kata yang cukup panjang atau signifikan.'
                : `Tidak ada frasa ${activeTab} kata berulang.`}
            </p>
          ) : (
            <div className="space-y-2">
              {activeItems.map((item, index) => (
                <div
                  key={`${item.phrase}-${index}`}
                  className="flex items-center justify-between gap-3 text-xs sm:text-sm py-1 hover:bg-slate-50/60 px-1.5 rounded transition-colors"
                >
                  <span className="text-slate-700 font-normal truncate lowercase">
                    {item.phrase}
                  </span>
                  <span className="shrink-0 inline-flex items-center justify-center px-2.5 py-0.5 rounded-full bg-slate-800 text-white font-medium text-[11px] tracking-tight">
                    {item.count} ({item.percentage}%)
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
