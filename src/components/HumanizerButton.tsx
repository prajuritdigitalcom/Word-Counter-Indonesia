import React from 'react';
import { Sparkles, Loader2, KeyRound } from 'lucide-react';
import { GeminiKeyState } from '../lib/humanizer/types';

interface HumanizerButtonProps {
  keyState: GeminiKeyState;
  isProcessing: boolean;
  onOpenModal: () => void;
  onRunHumanizer: () => void;
}

export const HumanizerButton: React.FC<HumanizerButtonProps> = ({
  keyState,
  isProcessing,
  onOpenModal,
  onRunHumanizer,
}) => {
  const isConfigured = keyState.configured;

  const handleClick = () => {
    if (isProcessing) return;
    if (!isConfigured) {
      onOpenModal();
    } else {
      onRunHumanizer();
    }
  };

  return (
    <div className="flex items-center gap-1.5">
      {/* Tombol Utama Humanizer */}
      <button
        type="button"
        onClick={handleClick}
        disabled={isProcessing}
        aria-label={
          isProcessing
            ? 'Sedang memproses Humanizer'
            : isConfigured
            ? 'Lakukan Humanizer'
            : 'Aktifkan Humanizer'
        }
        className={`inline-flex items-center justify-center gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all shadow-xs cursor-pointer select-none active:scale-95 disabled:cursor-not-allowed ${
          isProcessing
            ? 'bg-slate-100 text-slate-400 border border-slate-200'
            : isConfigured
            ? 'bg-[#fe4c6f] hover:bg-[#e03a5c] text-white hover:shadow-md hover:shadow-[#fe4c6f]/20'
            : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 hover:border-[#fe4c6f]/40 hover:text-[#fe4c6f]'
        }`}
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin text-[#fe4c6f]" />
            <span className="hidden xs:inline">Memproses...</span>
            <span className="xs:hidden">Proses...</span>
          </>
        ) : (
          <>
            <Sparkles
              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                isConfigured ? 'text-white' : 'text-[#fe4c6f]'
              }`}
            />
            {isConfigured ? (
              <>
                <span className="hidden sm:inline">Lakukan Humanizer</span>
                <span className="sm:hidden">Humanizer</span>
              </>
            ) : (
              <span>Humanizer</span>
            )}
          </>
        )}
      </button>

      {/* Tombol Cepat Pengaturan Key jika sudah configured */}
      {isConfigured && !isProcessing && (
        <button
          type="button"
          onClick={onOpenModal}
          title="Pengaturan Gemini API Key"
          aria-label="Pengaturan Gemini API Key"
          className="p-1.5 sm:p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200 cursor-pointer"
        >
          <KeyRound className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      )}
    </div>
  );
};
