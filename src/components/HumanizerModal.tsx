import React, { useState } from 'react';
import {
  X,
  Key,
  ShieldCheck,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Trash2,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { GeminiKeyState } from '../lib/humanizer/types';
import { DEFAULT_GEMINI_MODEL } from '../lib/humanizer/config';

interface HumanizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  keyState: GeminiKeyState;
  isVerifying: boolean;
  verificationError: string | null;
  onVerifyAndSave: (apiKey: string, rememberInBrowser: boolean) => Promise<boolean>;
  onRemoveKey: () => void;
}

export const HumanizerModal: React.FC<HumanizerModalProps> = ({
  isOpen,
  onClose,
  keyState,
  isVerifying,
  verificationError,
  onVerifyAndSave,
  onRemoveKey,
}) => {
  const [inputKey, setInputKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [rememberInBrowser, setRememberInBrowser] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isEditingExisting, setIsEditingExisting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputKey.trim() || isVerifying) return;

    setIsSuccess(false);
    const success = await onVerifyAndSave(inputKey, rememberInBrowser);
    if (success) {
      setIsSuccess(true);
      setIsEditingExisting(false);
      setInputKey('');
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1200);
    }
  };

  const handleRemove = () => {
    onRemoveKey();
    setIsEditingExisting(true);
    setInputKey('');
  };

  const isConfigured = keyState.configured && !isEditingExisting;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="humanizer-modal-title"
    >
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden text-slate-800 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#fe4c6f]/20 border border-[#fe4c6f]/40 flex items-center justify-center text-[#fe4c6f]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 id="humanizer-modal-title" className="text-base font-bold tracking-tight">
                {isConfigured ? 'Pengaturan Gemini API Key' : 'Aktifkan Humanizer'}
              </h2>
              <p className="text-xs text-slate-300">
                Gunakan API Key Gemini pribadi (BYOK) secara aman dari browser
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors cursor-pointer"
            aria-label="Tutup modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Status jika sudah terhubung */}
          {isConfigured ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-sm space-y-1">
                  <div className="font-semibold flex items-center gap-2">
                    <span>API Key Terhubung</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-100 text-emerald-800">
                      Aktif
                    </span>
                  </div>
                  <p className="text-xs text-emerald-700">
                    API Key tersimpan: <span className="font-mono font-semibold">{keyState.maskedKey}</span>
                  </p>
                  <p className="text-[11px] text-emerald-600">
                    Model: <span className="font-mono">{keyState.modelName || DEFAULT_GEMINI_MODEL}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingExisting(true)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-colors cursor-pointer"
                >
                  Ganti API Key
                </button>
                <button
                  type="button"
                  onClick={handleRemove}
                  className="py-2.5 px-4 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Hapus Key</span>
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="text-xs text-slate-600 leading-relaxed">
                Humanizer menggunakan Gemini API dengan API Key milik Anda sendiri.
                Key digunakan langsung dari browser Anda dan <strong>tidak pernah dikirim ke server Prajurit Digital</strong>.
              </div>

              {/* Input API Key */}
              <div className="space-y-1.5">
                <label htmlFor="gemini-api-key" className="block text-xs font-bold text-slate-700">
                  Masukkan Gemini API Key
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Key className="w-4 h-4" />
                  </div>
                  <input
                    id="gemini-api-key"
                    type={showKey ? 'text' : 'password'}
                    value={inputKey}
                    onChange={(e) => setInputKey(e.target.value)}
                    placeholder="AIzaSy..."
                    required
                    autoComplete="off"
                    spellCheck="false"
                    className="w-full pl-9 pr-10 py-2.5 text-sm font-mono border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#fe4c6f] focus:border-transparent bg-white text-slate-900 placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    aria-label={showKey ? 'Sembunyikan API key' : 'Tampilkan API key'}
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Checkbox Save */}
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberInBrowser}
                  onChange={(e) => setRememberInBrowser(e.target.checked)}
                  className="rounded border-slate-300 text-[#fe4c6f] focus:ring-[#fe4c6f] w-4 h-4"
                />
                <span className="text-xs text-slate-600">
                  Simpan API Key di browser ini (localStorage)
                </span>
              </label>

              {/* Verification Error Box */}
              {verificationError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="flex-1 leading-relaxed">
                    <strong>Verifikasi Gagal:</strong> {verificationError}
                  </div>
                </div>
              )}

              {/* Verification Success Box */}
              {isSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>API Key berhasil diverifikasi dan disimpan!</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!inputKey.trim() || isVerifying}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#fe4c6f] hover:bg-[#e03a5c] disabled:opacity-50 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer disabled:cursor-not-allowed"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Memeriksa Key...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Cek & Simpan Key</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Security & BYOK Disclosure Notices */}
          <div className="pt-4 border-t border-slate-100 space-y-2.5 text-[11px] text-slate-500 leading-relaxed">
            <div className="flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <p>
                <strong>Catatan Keamanan & Privasi:</strong> API Key milik Anda digunakan langsung dari browser untuk koneksi ke Google Gemini API. Prajurit Digital tidak pernah menyimpan, menerima, atau mencatat API Key maupun isi teks artikel Anda di server kami.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p>
                Penyimpanan di browser lokal bukan jaminan keamanan absolut dari ekstensi pihak ketiga. Gunakan API Key dengan pembatasan project yang sesuai. Pemakaian Gemini menggunakan kuota/billing Google Cloud akun Anda sendiri.
              </p>
            </div>
            <div className="pt-1">
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#fe4c6f] hover:underline font-medium inline-flex items-center gap-1 text-xs"
              >
                <span>Dapatkan Gemini API Key gratis di Google AI Studio</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
