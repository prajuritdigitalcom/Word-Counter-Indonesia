import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Minus,
  CheckCircle2,
  Copy,
  Check,
  RotateCcw,
  Trash2,
  AlertTriangle,
  Loader2,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  FileCheck,
  Undo2,
} from 'lucide-react';
import { HumanizerMode, HumanizerResult } from '../lib/humanizer/types';
import { MAX_HUMANIZER_PASSES } from '../lib/humanizer/config';

interface HumanizerResultSectionProps {
  result: HumanizerResult | null;
  isProcessing: boolean;
  currentStepMessage: string;
  processingError: string | null;
  mode: HumanizerMode;
  onModeChange: (newMode: HumanizerMode) => void;
  onSecondPass: () => void;
  onUseAsInput: () => void;
  canUndoInput: boolean;
  onUndoInput: () => void;
  onClearResult: () => void;
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const HumanizerResultSection: React.FC<HumanizerResultSectionProps> = ({
  result,
  isProcessing,
  currentStepMessage,
  processingError,
  mode,
  onModeChange,
  onSecondPass,
  onUseAsInput,
  canUndoInput,
  onUndoInput,
  onClearResult,
  onShowToast,
}) => {
  const [copiedText, setCopiedText] = useState(false);
  const [copiedStats, setCopiedStats] = useState(false);
  const [showCategoryDetails, setShowCategoryDetails] = useState(false);

  // If there is an ongoing processing or an error, we show the processing container
  if (isProcessing) {
    return (
      <section
        aria-label="Proses Humanizer"
        className="bg-white rounded-xl border border-[#fe4c6f]/30 shadow-sm p-6 sm:p-8 text-center space-y-4 animate-in fade-in duration-200"
      >
        <div className="w-12 h-12 rounded-2xl bg-[#fe4c6f]/10 text-[#fe4c6f] flex items-center justify-center mx-auto animate-pulse">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-800">
            Sedang Menjalankan Humanizer
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            {currentStepMessage || 'Menyunting teks berdasarkan sinyal pola AI...'}
          </p>
        </div>
        <div className="max-w-md mx-auto bg-slate-50 rounded-lg p-3 text-xs text-slate-500 text-left border border-slate-200">
          <div className="flex items-center gap-2 text-slate-600 font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5 text-[#fe4c6f]" />
            <span>Tahapan Pipeline:</span>
          </div>
          <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-500">
            <li>Analisis data stilistika teks sumber</li>
            <li>Pembuatan instruksi editorial berbasis kategori aktif</li>
            <li>Penyuntingan kontekstual Gemini (Preservasi Fakta & Keyword)</li>
            <li>Pemeriksaan ulang skor & perbandingan indikator</li>
          </ul>
        </div>
      </section>
    );
  }

  if (processingError && !result) {
    return (
      <section
        aria-label="Error Humanizer"
        className="bg-rose-50 rounded-xl border border-rose-200 p-5 space-y-3"
      >
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1 flex-1">
            <h3 className="text-sm font-bold text-rose-900">
              Gagal Menjalankan Humanizer
            </h3>
            <p className="text-xs text-rose-700 leading-relaxed">
              {processingError}
            </p>
          </div>
        </div>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClearResult}
            className="text-xs font-semibold text-rose-700 hover:text-rose-900 underline cursor-pointer"
          >
            Tutup Pesan
          </button>
        </div>
      </section>
    );
  }

  if (!result) return null;

  const {
    rewrittenText,
    beforeAnalysis,
    afterAnalysis,
    scoreDelta,
    improved,
    changes,
    warnings,
    categoryComparisons,
    passCount,
  } = result;

  const rewrittenWords = rewrittenText.trim().split(/\s+/).filter(Boolean).length;
  const rewrittenChars = rewrittenText.length;

  const handleCopyText = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(rewrittenText);
      } else {
        const ta = document.createElement('textarea');
        ta.value = rewrittenText;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopiedText(true);
      onShowToast('Teks hasil Humanizer berhasil disalin.', 'success');
      setTimeout(() => setCopiedText(false), 2000);
    } catch {
      onShowToast('Gagal menyalin teks secara otomatis.', 'error');
    }
  };

  const handleCopyStats = async () => {
    const summary = `📊 RINGKASAN HASIL HUMANIZER
Teks Asli: ${beforeAnalysis.wordCount} kata (Skor Pola AI: ${beforeAnalysis.score}/100 - ${beforeAnalysis.labelText || 'Rendah'})
Teks Hasil: ${afterAnalysis.wordCount} kata (Skor Pola AI: ${afterAnalysis.score}/100 - ${afterAnalysis.labelText || 'Rendah'})
Delta Penurunan: ${scoreDelta > 0 ? `Turun ${scoreDelta} poin` : scoreDelta < 0 ? `Naik ${Math.abs(scoreDelta)} poin` : 'Tidak berubah'}
Mode: ${mode.toUpperCase()} (Pass ${passCount}/${MAX_HUMANIZER_PASSES})`;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(summary);
      } else {
        const ta = document.createElement('textarea');
        ta.value = summary;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopiedStats(true);
      onShowToast('Statistik perbandingan berhasil disalin.', 'success');
      setTimeout(() => setCopiedStats(false), 2000);
    } catch {
      onShowToast('Gagal menyalin statistik.', 'error');
    }
  };

  return (
    <section
      aria-label="Hasil Humanizer"
      className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden space-y-0 animate-in fade-in duration-200"
    >
      {/* Section Header */}
      <div className="px-5 py-4 bg-slate-50/80 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#fe4c6f]/10 text-[#fe4c6f] flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <h2 className="text-base font-bold text-slate-900">
              Hasil Humanizer
            </h2>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
              Pass {passCount}/{MAX_HUMANIZER_PASSES}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Versi hasil perbaikan berdasarkan sinyal Pola Tulisan AI yang terdeteksi.
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-1.5 self-start sm:self-center bg-white p-1 rounded-lg border border-slate-200">
          <span className="text-[11px] font-medium text-slate-400 px-1.5">Mode:</span>
          {(['natural', 'balanced', 'strong'] as HumanizerMode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => onModeChange(m)}
              className={`text-xs px-2.5 py-1 rounded-md font-semibold capitalize transition-all cursor-pointer ${
                mode === m
                  ? 'bg-[#fe4c6f] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-6">
        {/* Error warning if present */}
        {processingError && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{processingError}</span>
          </div>
        )}

        {/* Quality Gate Warnings */}
        {warnings && warnings.length > 0 && (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
            <div className="font-semibold flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Catatan Pemeriksaan Integritas Teks:</span>
            </div>
            <ul className="list-disc list-inside space-y-0.5 text-amber-800 text-[11px] pl-1">
              {warnings.map((w, idx) => (
                <li key={idx}>{w}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Comparison Card (Before vs After) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/70 border border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            {/* Box Sebelum */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1.5 text-center">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Sebelum
              </div>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
                  {beforeAnalysis.score}
                </span>
                <span className="text-xs text-slate-400 font-medium">/ 100</span>
              </div>
              <div className="text-xs font-medium text-slate-600">
                {beforeAnalysis.labelText || 'Terdeteksi'}
              </div>
            </div>

            {/* Delta Indicator Tengah */}
            <div className="text-center space-y-2 py-1">
              <div className="flex items-center justify-center gap-2">
                <div className="hidden md:block w-8 h-px bg-slate-300" />
                <div
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-2xs ${
                    improved
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : scoreDelta === 0
                      ? 'bg-slate-200 text-slate-700'
                      : 'bg-rose-100 text-rose-800 border border-rose-200'
                  }`}
                >
                  {improved ? (
                    <>
                      <TrendingDown className="w-3.5 h-3.5" />
                      <span>Pola AI Turun {scoreDelta} Poin</span>
                    </>
                  ) : scoreDelta === 0 ? (
                    <>
                      <Minus className="w-3.5 h-3.5" />
                      <span>Skor Tidak Berubah</span>
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>Skor Naik {Math.abs(scoreDelta)} Poin</span>
                    </>
                  )}
                </div>
                <div className="hidden md:block w-8 h-px bg-slate-300" />
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">
                {improved
                  ? 'Pola tulisan AI berhasil dikurangi secara signifikan.'
                  : 'Hasil belum mengalami penurunan optimal. Anda dapat mencoba mode Strong.'}
              </p>
            </div>

            {/* Box Sesudah */}
            <div className="bg-white p-4 rounded-xl border border-[#fe4c6f]/30 shadow-2xs space-y-1.5 text-center">
              <div className="text-xs font-semibold text-[#fe4c6f] uppercase tracking-wider">
                Sesudah (Humanized)
              </div>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-2xl sm:text-3xl font-extrabold text-[#fe4c6f] font-mono">
                  {afterAnalysis.score}
                </span>
                <span className="text-xs text-slate-400 font-medium">/ 100</span>
              </div>
              <div className="text-xs font-medium text-slate-700">
                {afterAnalysis.labelText || 'Rendah'}
              </div>
            </div>
          </div>
        </div>

        {/* Apa Yang Diperbaiki? */}
        {changes.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-emerald-600" />
              <span>Apa yang diperbaiki?</span>
            </h3>
            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200">
              <ul className="space-y-1.5 text-xs text-slate-700">
                {changes.map((ch, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{ch}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Collapsible: Detail Perbandingan Per Kategori Sinyal */}
        {categoryComparisons.length > 0 && (
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowCategoryDetails(!showCategoryDetails)}
              className="w-full px-4 py-2.5 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-xs font-bold text-slate-700 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                <span>Lihat Perbandingan Per Kategori Sinyal ({categoryComparisons.length})</span>
              </div>
              {showCategoryDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showCategoryDetails && (
              <div className="p-4 bg-white border-t border-slate-200 divide-y divide-slate-100 text-xs">
                {categoryComparisons.map((cat) => (
                  <div key={cat.id} className="py-2 flex items-center justify-between gap-2">
                    <span className="text-slate-700 font-medium">{cat.name}</span>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[11px]">
                        <span>{cat.beforeScore}%</span>
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                        <span className={cat.improved ? 'text-emerald-600 font-bold' : 'text-slate-700'}>
                          {cat.afterScore}%
                        </span>
                      </div>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                          cat.improved
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {cat.improved ? 'Membaik' : cat.afterContribution}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Text Area Output Display */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Teks Hasil Penyuntingan:</span>
            <span>
              {rewrittenWords} kata • {rewrittenChars} karakter
            </span>
          </div>

          <div className="relative">
            <textarea
              readOnly
              value={rewrittenText}
              rows={8}
              className="w-full p-4 sm:p-5 text-sm leading-relaxed bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#fe4c6f] font-normal text-slate-800 resize-y"
              aria-label="Teks Hasil Humanizer"
            />
          </div>
        </div>

        {/* Action Buttons Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex flex-wrap items-center gap-2">
            {/* Salin Hasil */}
            <button
              type="button"
              onClick={handleCopyText}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#fe4c6f] hover:bg-[#e03a5c] text-white text-xs sm:text-sm font-semibold transition-all shadow-xs cursor-pointer active:scale-95"
            >
              {copiedText ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedText ? 'Tersalin!' : 'Salin Hasil'}</span>
            </button>

            {/* Salin Statistik */}
            <button
              type="button"
              onClick={handleCopyStats}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
            >
              {copiedStats ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>Salin Statistik</span>
            </button>

            {/* Gunakan sebagai Input */}
            <button
              type="button"
              onClick={onUseAsInput}
              title="Gantikan teks di editor utama dengan hasil ini"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
            >
              <span>Gunakan sebagai Input</span>
            </button>

            {/* Undo Replace Input if active */}
            {canUndoInput && (
              <button
                type="button"
                onClick={onUndoInput}
                title="Kembalikan teks editor utama ke teks asli sebelum diganti"
                className="inline-flex items-center gap-1 px-2.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-semibold transition-colors cursor-pointer"
              >
                <Undo2 className="w-3.5 h-3.5" />
                <span>Undo Input</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Lakukan Perbaikan Lagi (Pass 2) */}
            {passCount < MAX_HUMANIZER_PASSES && (
              <button
                type="button"
                onClick={onSecondPass}
                disabled={isProcessing}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 border border-[#fe4c6f]/40 text-[#fe4c6f] text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Lakukan Perbaikan Lagi</span>
              </button>
            )}

            {/* Hapus Hasil */}
            <button
              type="button"
              onClick={onClearResult}
              title="Hapus hasil Humanizer"
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors border border-transparent hover:border-rose-100 cursor-pointer"
              aria-label="Hapus hasil Humanizer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Disclaimer / Product boundary */}
        <div className="pt-2 text-[11px] text-slate-400 text-left leading-relaxed">
          Penyuntingan meningkatkan keluwesan dan variasi bahasa tanpa menjamin lolos semua alat deteksi.
        </div>
      </div>
    </section>
  );
};
