/**
 * Key Storage & Masking Manager for Client-Side BYOK
 * Privacy & Security: Keys are strictly held in client-side memory or optional browser storage.
 * Never sent to Prajurit Digital servers, analytics, or logged.
 */
import { STORAGE_KEY_CONFIG, STORAGE_KEY_GEMINI } from './config';
import { GeminiKeyState } from './types';

/**
 * Mask an API key to display only prefix and suffix (e.g. AIza••••••7Kp)
 */
export function maskApiKey(key: string): string {
  if (!key || key.length < 8) {
    return '••••••••';
  }
  const prefix = key.slice(0, 4);
  const suffix = key.slice(-3);
  return `${prefix}••••••${suffix}`;
}

/**
 * Load stored API key and config from browser storage
 */
export function loadStoredApiKey(): { key: string | null; state: GeminiKeyState } {
  try {
    const storedConfig = localStorage.getItem(STORAGE_KEY_CONFIG);
    const parsedConfig = storedConfig ? JSON.parse(storedConfig) : null;
    const storedKey = localStorage.getItem(STORAGE_KEY_GEMINI);

    if (storedKey && storedKey.trim().length > 0) {
      return {
        key: storedKey.trim(),
        state: {
          configured: true,
          verifiedAt: parsedConfig?.verifiedAt,
          maskedKey: maskApiKey(storedKey.trim()),
          modelName: parsedConfig?.modelName,
          rememberInBrowser: true,
        },
      };
    }
  } catch {
    // Storage access might be restricted in some iframe or private modes
  }

  return {
    key: null,
    state: {
      configured: false,
      rememberInBrowser: true,
    },
  };
}

/**
 * Save verified API key and metadata
 */
export function saveApiKey(
  key: string,
  modelName: string,
  rememberInBrowser = true
): GeminiKeyState {
  const trimmedKey = key.trim();
  const state: GeminiKeyState = {
    configured: true,
    verifiedAt: Date.now(),
    maskedKey: maskApiKey(trimmedKey),
    modelName,
    rememberInBrowser,
  };

  try {
    if (rememberInBrowser) {
      localStorage.setItem(STORAGE_KEY_GEMINI, trimmedKey);
      localStorage.setItem(
        STORAGE_KEY_CONFIG,
        JSON.stringify({
          verifiedAt: state.verifiedAt,
          modelName: state.modelName,
        })
      );
    } else {
      localStorage.removeItem(STORAGE_KEY_GEMINI);
      localStorage.removeItem(STORAGE_KEY_CONFIG);
    }
  } catch {
    // Fail silently if localStorage is blocked
  }

  return state;
}

/**
 * Remove stored API key and clear configuration
 */
export function clearStoredApiKey(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_GEMINI);
    localStorage.removeItem(STORAGE_KEY_CONFIG);
  } catch {
    // Fail silently
  }
}
