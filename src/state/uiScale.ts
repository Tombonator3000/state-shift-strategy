export const GAME_SETTINGS_STORAGE_KEY = 'gameSettings';

export const UI_SCALE_OPTIONS = [100, 125, 150] as const;

export type UiScale = (typeof UI_SCALE_OPTIONS)[number];

export const DEFAULT_UI_SCALE: UiScale = 100;

export const isUiScale = (value: unknown): value is UiScale =>
  typeof value === 'number' && UI_SCALE_OPTIONS.some(option => option === value);

export const normalizeUiScale = (value: unknown, fallback: UiScale = DEFAULT_UI_SCALE): UiScale => {
  if (isUiScale(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number.parseInt(value, 10);
    if (isUiScale(parsed)) {
      return parsed;
    }
  }

  return fallback;
};

export const applyUiScale = (scale: UiScale) => {
  if (typeof document === 'undefined') {
    return;
  }

  const normalized = Math.max(50, Math.min(200, scale));
  document.documentElement.style.setProperty('--ui-scale', String(normalized / 100));
};

export const getStoredUiScale = (): UiScale => {
  if (typeof localStorage === 'undefined') {
    return DEFAULT_UI_SCALE;
  }

  try {
    const stored = localStorage.getItem(GAME_SETTINGS_STORAGE_KEY);
    if (!stored) {
      return DEFAULT_UI_SCALE;
    }

    const parsed = JSON.parse(stored) as { uiScale?: unknown } | null;
    return normalizeUiScale(parsed?.uiScale, DEFAULT_UI_SCALE);
  } catch (error) {
    console.warn('Failed to read stored UI scale:', error);
    return DEFAULT_UI_SCALE;
  }
};
