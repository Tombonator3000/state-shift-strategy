import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initializeExpansions } from '@/data/expansions/state';

const SETTINGS_STORAGE_KEY = 'gameSettings';

const clampUiScale = (value: unknown): number | null => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return null;
  }

  return Math.min(1.5, Math.max(0.75, value));
};

const initializeUiScaleFromStorage = () => {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }

  const stored = window.localStorage?.getItem(SETTINGS_STORAGE_KEY);
  if (!stored) {
    return;
  }

  try {
    const parsed = JSON.parse(stored) as { uiScale?: unknown } | null;
    const clamped = clampUiScale(parsed?.uiScale);
    if (typeof clamped === 'number') {
      document.documentElement.style.setProperty('--ui-scale', clamped.toString());
    }
  } catch (error) {
    console.warn('[UI] Failed to parse stored UI scale', error);
  }
};

initializeUiScaleFromStorage();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

initializeExpansions()
  .catch(error => {
    console.warn('[EXPANSIONS] Initialization failed', error);
  })
  .finally(() => {
    createRoot(rootElement).render(<App />);
  });
