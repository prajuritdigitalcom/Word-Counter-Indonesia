/**
 * React Hook for Humanizer State Management
 * Follows the single-concern hook pattern matching useTextStatistics.ts
 */
import { useState, useEffect, useCallback } from 'react';
import {
  clearStoredApiKey,
  loadStoredApiKey,
  saveApiKey,
} from '../lib/humanizer/keyStorage';
import { verifyGeminiApiKey } from '../lib/humanizer/keyVerification';
import { executeHumanizer } from '../lib/humanizer/humanizerService';
import {
  GeminiKeyState,
  HumanizerMode,
  HumanizerResult,
} from '../lib/humanizer/types';
import {
  DEFAULT_GEMINI_MODEL,
  MAX_HUMANIZER_PASSES,
  MIN_HUMANIZER_WORD_COUNT,
} from '../lib/humanizer/config';

export function useHumanizer() {
  const [apiKey, setApiKey] = useState<string>('');
  const [keyState, setKeyState] = useState<GeminiKeyState>({ configured: false, rememberInBrowser: true });
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  const [mode, setMode] = useState<HumanizerMode>('balanced');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [currentStepMessage, setCurrentStepMessage] = useState<string>('');
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [result, setResult] = useState<HumanizerResult | null>(null);

  // Undo history support when user clicks "Gunakan sebagai Input"
  const [originalInputBeforeReplace, setOriginalInputBeforeReplace] = useState<string | null>(null);

  // Load key from storage on initial mount
  useEffect(() => {
    const loaded = loadStoredApiKey();
    if (loaded.key) {
      setApiKey(loaded.key);
      setKeyState(loaded.state);
    }
  }, []);

  /**
   * Verify and save Gemini API Key
   */
  const handleVerifyAndSaveKey = useCallback(
    async (inputKey: string, rememberInBrowser = true): Promise<boolean> => {
      setIsVerifying(true);
      setVerificationError(null);

      const verification = await verifyGeminiApiKey(inputKey, DEFAULT_GEMINI_MODEL);

      setIsVerifying(false);

      if (verification.success) {
        setApiKey(inputKey.trim());
        const newState = saveApiKey(inputKey, verification.modelName, rememberInBrowser);
        setKeyState(newState);
        return true;
      } else {
        setVerificationError(verification.errorMessage || 'Verifikasi API Key gagal.');
        return false;
      }
    },
    []
  );

  /**
   * Remove and clear API Key
   */
  const handleRemoveKey = useCallback(() => {
    clearStoredApiKey();
    setApiKey('');
    setKeyState({ configured: false, rememberInBrowser: true });
    setVerificationError(null);
  }, []);

  /**
   * Run Humanizer Pipeline
   */
  const runHumanizer = useCallback(
    async (text: string, keyword?: string): Promise<boolean> => {
      if (!apiKey || !keyState.configured) {
        setIsModalOpen(true);
        return false;
      }

      const trimmed = text.trim();
      const words = trimmed.split(/\s+/).filter(Boolean);

      if (words.length < MIN_HUMANIZER_WORD_COUNT) {
        setProcessingError(
          `Humanizer membutuhkan teks minimal ${MIN_HUMANIZER_WORD_COUNT} kata (teks Anda saat ini: ${words.length} kata).`
        );
        return false;
      }

      setIsProcessing(true);
      setProcessingError(null);
      setCurrentStepMessage('Memulai proses analisis...');

      try {
        const humanizerResult = await executeHumanizer(
          apiKey,
          trimmed,
          { mode, targetKeyword: keyword },
          1,
          (step) => setCurrentStepMessage(step)
        );

        setResult(humanizerResult);
        setIsProcessing(false);
        setCurrentStepMessage('');
        return true;
      } catch (err: unknown) {
        console.error('[Humanizer] Error saat menjalankan humanisasi (Pass 1):', err);
        setIsProcessing(false);
        setCurrentStepMessage('');
        const msg = err instanceof Error ? err.message : String(err);
        setProcessingError(msg);
        return false;
      }
    },
    [apiKey, keyState.configured, mode]
  );

  /**
   * Run manual second pass (max 2 passes per user request)
   */
  const runSecondPass = useCallback(
    async (keyword?: string): Promise<boolean> => {
      if (!result || !apiKey || isProcessing) return false;

      if (result.passCount >= MAX_HUMANIZER_PASSES) {
        setProcessingError('Batas maksimum 2 kali perbaikan per sesi telah tercapai.');
        return false;
      }

      setIsProcessing(true);
      setProcessingError(null);
      setCurrentStepMessage('Menjalankan perbaikan lanjutan (Pass 2)...');

      try {
        const secondPassResult = await executeHumanizer(
          apiKey,
          result.rewrittenText,
          { mode, targetKeyword: keyword },
          result.passCount + 1,
          (step) => setCurrentStepMessage(step)
        );

        // Retain initial beforeAnalysis to preserve full delta tracking
        setResult({
          ...secondPassResult,
          originalText: result.originalText,
          beforeAnalysis: result.beforeAnalysis,
          scoreDelta: result.beforeAnalysis.score - secondPassResult.afterAnalysis.score,
          improved: result.beforeAnalysis.score - secondPassResult.afterAnalysis.score > 0,
        });

        setIsProcessing(false);
        setCurrentStepMessage('');
        return true;
      } catch (err: unknown) {
        console.error('[Humanizer] Error saat menjalankan humanisasi (Pass 2):', err);
        setIsProcessing(false);
        setCurrentStepMessage('');
        const msg = err instanceof Error ? err.message : String(err);
        setProcessingError(msg);
        return false;
      }
    },
    [apiKey, result, isProcessing, mode]
  );

  /**
   * Use result text as main editor input with undo backup
   */
  const handleUseAsInput = useCallback(
    (
      currentText: string,
      setText: (newText: string) => void,
      onShowToast?: (msg: string, type: 'success' | 'error' | 'info') => void
    ) => {
      if (!result) return;
      setOriginalInputBeforeReplace(currentText);
      setText(result.rewrittenText);
      onShowToast?.('Teks hasil Humanizer telah diterapkan ke editor utama.', 'success');
    },
    [result]
  );

  /**
   * Undo replacing input text
   */
  const handleUndoInput = useCallback(
    (
      setText: (newText: string) => void,
      onShowToast?: (msg: string, type: 'success' | 'error' | 'info') => void
    ) => {
      if (originalInputBeforeReplace === null) return;
      setText(originalInputBeforeReplace);
      setOriginalInputBeforeReplace(null);
      onShowToast?.('Teks editor dikembalikan ke versi sebelumnya.', 'info');
    },
    [originalInputBeforeReplace]
  );

  const clearResult = useCallback(() => {
    setResult(null);
    setProcessingError(null);
  }, []);

  return {
    apiKey,
    keyState,
    isModalOpen,
    setIsModalOpen,
    isVerifying,
    verificationError,
    setVerificationError,
    verifyAndSaveKey: handleVerifyAndSaveKey,
    removeKey: handleRemoveKey,
    mode,
    setMode,
    isProcessing,
    currentStepMessage,
    processingError,
    result,
    canUndoInput: originalInputBeforeReplace !== null,
    runHumanizer,
    runSecondPass,
    handleUseAsInput,
    handleUndoInput,
    clearResult,
  };
}
