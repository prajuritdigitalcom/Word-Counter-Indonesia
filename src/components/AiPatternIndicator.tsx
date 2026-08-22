import React, { useState, useEffect, useMemo } from 'react';
import { ChevronDown, ChevronUp, Info, HelpCircle } from 'lucide-react';
import { analyzeAiPatterns, AiPatternResult } from '../lib/aiPatternAnalyzer';
import { AI_DISCLAIMER_TEXT, MIN_WORDS_FOR_SCORING } from '../data/aiPatterns';

interface AiPatternIndicatorProps {
  text: string;
  targetKeyword?: string;
}

export const AiPatternIndicator: React.FC<AiPatternIndicatorProps> = ({ text, targetKeyword }) => {
  const [debouncedText, setDebouncedText] = useState<string>(text);
  const [isOpen, setIsOpen] = useState<boolean>(true);

  // Debounce analysis by 600ms to preserve UI responsiveness on large inputs
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedText(text);
    }, 600);

    return () => {
      window.clearTimeout(timer);
    };
  }, [text]);

  const analysis: AiPatternResult = useMemo(() => {
    return analyzeAiPatterns(debouncedText, targetKeyword);
  }, [debouncedText, targetKeyword]);

  return (
    <div className="w-full bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
      {/* Header with Title and Collapse Chevron */}
      <div className="px-4 sm:px-5 py-3 border-b border-slate-100 bg-white">
        <div className="flex items-center justify-between gap-2">
          <div className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
            <span>Indikator Pola Tulisan AI</span>
            <span className="text-[10px] font-mono text-slate-400 font-normal">v{analysis.engineVersion}</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
              aria-label={isOpen ? 'Tutup rincian pola AI' : 'Buka rincian pola AI'}
              aria-expanded={isOpen}
            >
              {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Body */}
      <div className="p-4 sm:p-5 space-y-4">
        {/* Empty State */}
        {analysis.status === 'empty' && (
          <div className="text-center py-5 text-slate-400 text-xs leading-relaxed">
            <p>Masukkan teks artikel terlebih dahulu untuk melihat indikator pola AI.</p>
          </div>
        )}

        {/* Short Text State (< 150 words) */}
        {analysis.status === 'tooShort' && (
          <div className="py-3 px-3.5 rounded-lg bg-slate-50 border border-slate-200/80 text-slate-600 text-xs leading-relaxed">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-slate-700">
                  Teks belum mencapai batas minimum ({analysis.wordCount} / {MIN_WORDS_FOR_SCORING} kata)
                </p>
                <p className="text-[11px] text-slate-500">
                  Fitur ini dioptimalkan untuk artikel atau tulisan panjang (≥150 kata) guna membaca variasi struktur kalimat, ritme, dan kekonkretan teks.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Scored State */}
        {analysis.status === 'scored' && (
          <>
            {/* Score & Verdict: Qualitative label is visually dominant */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-white border border-slate-200 text-slate-800 shadow-2xs">
                  {analysis.labelText}
                </span>

                <span className="text-xs font-medium text-slate-500 tabular-nums">
                  Kemiripan Pola: <strong className="text-slate-800">{analysis.score}</strong>/100
                </span>
              </div>

              {/* Progress Bar Gauge */}
              <div className="w-full bg-slate-200/80 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    analysis.label === 'tinggi'
                      ? 'bg-amber-500'
                      : analysis.label === 'sedang'
                      ? 'bg-sky-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.max(analysis.score, 4)}%` }}
                />
              </div>
            </div>

            {/* Collapsible Category Breakdown Details */}
            {isOpen && (
              <div className="space-y-3 pt-1 border-t border-slate-100">
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <h3 className="text-xs font-bold text-slate-700">Rincian Sinyal & Kontribusi</h3>
                  {analysis.confidence && (
                    <div
                      className="inline-flex items-center gap-1 text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded cursor-help"
                      title={analysis.confidenceDetail || `Tingkat keyakinan sampel statistik: ${analysis.confidence}`}
                    >
                      <span>Keyakinan:</span>
                      <span className="font-semibold capitalize text-slate-700">{analysis.confidence}</span>
                      <HelpCircle className="w-3 h-3 text-slate-400" />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  {analysis.categories.map((cat) => (
                    <div key={cat.id} className="text-xs space-y-1 bg-white p-2.5 rounded-lg border border-slate-100">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-slate-800">{cat.name}</span>
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                            cat.contribution === 'Tinggi'
                              ? 'bg-amber-100 text-amber-800'
                              : cat.contribution === 'Sedang'
                              ? 'bg-sky-100 text-sky-800'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          Kontribusi: {cat.contribution}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500 leading-snug">{cat.detail}</p>

                      {cat.matches.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5 pt-1 border-t border-slate-50">
                          {cat.matches.slice(0, 3).map((m) => (
                            <span
                              key={m.phrase}
                              className="inline-flex items-center gap-1 text-[10px] bg-slate-50 border border-slate-200/70 text-slate-600 px-1.5 py-0.5 rounded"
                            >
                              <span>"{m.phrase}"</span>
                              <span className="font-mono text-slate-400">({m.count}x)</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Permanent Mandatory Disclaimer (Always Visible, Never Hidden) */}
        <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 leading-relaxed bg-slate-50/50 -mx-4 -mb-4 sm:-mx-5 sm:-mb-5 p-3.5 border-b-0 rounded-b-xl">
          <div className="flex items-start gap-1.5">
            <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
            <div className="space-y-1 text-slate-500">
              <p className="font-medium text-slate-600">Catatan Penting:</p>
              <p>{AI_DISCLAIMER_TEXT}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
