export const DEFAULT_UI_SCALE = 1;
export const MIN_UI_SCALE = 0.75;
export const MAX_UI_SCALE = 1.5;

const normalizeUiScale = (value: number): number => {
  return Math.min(MAX_UI_SCALE, Math.max(MIN_UI_SCALE, value));
};

export const coerceUiScale = (value: number): number => {
  const normalizedValue = value > 10 ? value / 100 : value;
  return normalizeUiScale(normalizedValue);
};

export const parseUiScale = (value: unknown, fallback = DEFAULT_UI_SCALE): number => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return fallback;
  }

  return coerceUiScale(value);
};

export const tryParseUiScale = (value: unknown): number | null => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return null;
  }

  return coerceUiScale(value);
};
