import { tryParseUiScale } from './ui-scale';
import { safeGetLocalStorageItem } from '@/utils/storage';

export function initializeUiScaleFromStorage(): void {
  if (typeof document === 'undefined') return;
  const stored = safeGetLocalStorageItem('gameSettings');
  if (!stored) return;

  try {
    const parsed: unknown = JSON.parse(stored);
    if (!parsed || typeof parsed !== 'object') return;
    const normalized = tryParseUiScale((parsed as { uiScale?: unknown }).uiScale);
    if (typeof normalized === 'number') {
      document.documentElement.style.setProperty('--ui-scale', normalized.toString());
    }
  } catch (error) {
    console.warn('[UI] Failed to parse stored UI scale', error);
  }
}
