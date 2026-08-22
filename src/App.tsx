import React, { useState } from 'react';
import { Header } from './components/Header';
import { TextEditor } from './components/TextEditor';
import { StatisticsGrid } from './components/StatisticsGrid';
import { KeywordDensity } from './components/KeywordDensity';
import { AiPatternIndicator } from './components/AiPatternIndicator';
import { TextAnalysis } from './components/TextAnalysis';
import { SeoCheckSection } from './components/SeoCheckSection';
import { Footer } from './components/Footer';
import { Toast, ToastMessage } from './components/Toast';
import { useTextStatistics } from './hooks/useTextStatistics';
import { ChevronDown, ChevronUp, SlidersHorizontal } from 'lucide-react';

export default function App() {
  const {
    text,
    setText,
    keyword,
    setKeyword,
    statistics,
    keywordDensity,
    screenReaderAnnouncement,
    clearText,
    getFormattedSummaryForCopy,
  } = useTextStatistics();

  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({
      id: Date.now().toString(),
      type,
      message,
    });
  };

  const handleCopyStatistics = async () => {
    const summary = getFormattedSummaryForCopy();
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(summary);
        showToast('Statistik berhasil disalin.', 'success');
      } else {
        // Fallback for non-supported browsers or non-secure contexts
        const textArea = document.createElement('textarea');
        textArea.value = summary;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        if (successful) {
          showToast('Statistik berhasil disalin.', 'success');
        } else {
          showToast('Browser Anda tidak mendukung penyalinan otomatis.', 'error');
        }
      }
    } catch {
      showToast('Browser Anda tidak mendukung penyalinan otomatis.', 'error');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fbfbfc] text-slate-900 selection:bg-[#fe4c6f]/15 selection:text-[#fe4c6f]">
      {/* Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Header */}
      <Header />

      {/* Main Content Area: 2-Column Responsive Layout (75% / 25% on desktop) */}
      <main id="beranda" className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <h1 className="sr-only">Word Counter Indonesia - Hitung Kata Online Gratis</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* Kolom Kiri: 75% (~3/4) */}
          <div className="lg:col-span-3 space-y-6">
            {/* Main Tool: Headline & Textarea */}
            <section aria-label="Word Counter Editor">
              <TextEditor
                text={text}
                setText={setText}
                setKeyword={setKeyword}
                statistics={statistics}
                onClear={clearText}
                onCopyStatistics={handleCopyStatistics}
                onShowToast={showToast}
              />
            </section>

            {/* Collapsible: Analisis Lanjutan & SEO Content Check */}
            <section className="bg-white rounded-xl border border-slate-200 overflow-hidden" aria-label="Analisis Lanjutan">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full flex items-center justify-between px-4 sm:px-5 py-3.5 bg-slate-50/70 hover:bg-slate-100/70 text-left transition-colors cursor-pointer"
                aria-expanded={showAdvanced}
              >
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-slate-500" />
                  <span className="text-sm font-bold text-slate-800">
                    {showAdvanced ? 'Sembunyikan Analisis Lanjutan' : 'Tampilkan Analisis Lanjutan'}
                  </span>
                  <span className="text-xs text-slate-400 font-normal hidden sm:inline">
                    (Rata-rata struktur kalimat, paragraf, dan SEO check)
                  </span>
                </div>

                <div className="text-slate-400">
                  {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {showAdvanced && (
                <div className="p-4 sm:p-5 border-t border-slate-200 space-y-6 animate-in fade-in duration-150">
                  <TextAnalysis statistics={statistics} />
                  <SeoCheckSection
                    statistics={statistics}
                    keywordDensity={keywordDensity}
                    keyword={keyword}
                    setKeyword={setKeyword}
                  />
                </div>
              )}
            </section>
          </div>

          {/* Kolom Kanan: 25% (~1/4) - Sidebar Detail Statistik & Keyword Density */}
          <aside className="lg:col-span-1 lg:sticky lg:top-6 space-y-4" aria-label="Sidebar Informasi">
            <StatisticsGrid
              statistics={statistics}
              screenReaderAnnouncement={screenReaderAnnouncement}
            />

            {/* Keyword Density Panel (x1, x2, x3 n-grams) */}
            <KeywordDensity statistics={statistics} />

            {/* Indikator Pola Tulisan AI */}
            <AiPatternIndicator text={text} onShowToast={showToast} />
          </aside>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
