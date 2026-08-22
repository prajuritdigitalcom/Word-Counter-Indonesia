import React, { useRef, useEffect } from 'react';
import { Trash2, Copy, ShieldCheck, Sparkles } from 'lucide-react';
import { SAMPLE_TEXT, SAMPLE_KEYWORD } from '../data/sampleText';
import { formatNumberID } from '../lib/utils';
import { TextStatistics } from '../lib/textAnalyzer';

interface TextEditorProps {
  text: string;
  setText: (val: string) => void;
  setKeyword: (val: string) => void;
  statistics: TextStatistics;
  onClear: () => void;
  onCopyStatistics: () => void;
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const TextEditor: React.FC<TextEditorProps> = ({
  text,
  setText,
  setKeyword,
  statistics,
  onClear,
  onCopyStatistics,
  onShowToast,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea height to fit content dynamically
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [text]);

  const handleLoadSample = () => {
    setText(SAMPLE_TEXT);
    setKeyword(SAMPLE_KEYWORD);
    onShowToast('Contoh teks artikel dimuat.', 'info');
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <div className="w-full space-y-3">
      {/* Top Headline & Minimal Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
        {/* Large Headline Word & Character Count (WordCounter style) */}
        <div className="flex items-baseline gap-2 sm:gap-3">
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {formatNumberID(statistics.wordCount)}
            </span>
            <span className="text-sm sm:text-base font-semibold text-slate-500">
              kata
            </span>
          </div>

          <span className="text-slate-300 font-light text-2xl sm:text-3xl">·</span>

          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {formatNumberID(statistics.charCount)}
            </span>
            <span className="text-sm sm:text-base font-semibold text-slate-500">
              karakter
            </span>
          </div>
        </div>

        {/* Minimal Toolbar */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          {text.length === 0 ? (
            <button
              type="button"
              onClick={handleLoadSample}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#fe4c6f]" />
              <span>Contoh Teks</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onClear}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
              aria-label="Hapus seluruh teks input"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus</span>
            </button>
          )}

          <button
            type="button"
            onClick={onCopyStatistics}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 active:scale-98 rounded-md transition-colors cursor-pointer border border-slate-200/80"
            aria-label="Salin data statistik teks ke clipboard"
          >
            <Copy className="w-3.5 h-3.5 text-slate-600" />
            <span>Salin Statistik</span>
          </button>
        </div>
      </div>

      {/* Main Textarea Container */}
      <div className="w-full bg-white rounded-xl border border-slate-200 focus-within:border-slate-400 focus-within:ring-1 focus-within:ring-slate-300 transition-all overflow-hidden">
        <textarea
          ref={textareaRef}
          id="main-textarea"
          name="text-content"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Tempel atau ketik teks Anda di sini..."
          className="w-full min-h-[260px] sm:min-h-[320px] p-4 sm:p-5 text-sm text-slate-800 placeholder:text-slate-400 bg-transparent border-0 focus:ring-0 focus:outline-none resize-none overflow-y-hidden leading-relaxed font-normal"
          aria-label="Tempel atau ketik teks artikel yang ingin dihitung"
          spellCheck="false"
        />

        {/* Quiet Privacy Footer */}
        <div className="flex items-center justify-between px-4 py-2 bg-slate-50/70 border-t border-slate-100 text-[11px] text-slate-400">
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
            <span>Privasi: diproses langsung di browser, tidak dikirim ke server.</span>
          </div>

          {text.length > 0 && (
            <span className="font-mono text-slate-400">
              {statistics.charCountNoSpaces.toLocaleString('id-ID')} tanpa spasi
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
