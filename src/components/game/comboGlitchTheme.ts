import type { ComboTheme } from '@/data/combos/themes';

const clamp01 = (value: number): number => {
  if (Number.isNaN(value)) {
    return 0;
  }
  if (value < 0) {
    return 0;
  }
  if (value > 1) {
    return 1;
  }
  return value;
};

const formatDuration = (value: number): string => {
  if (!Number.isFinite(value)) {
    return '0ms';
  }
  return `${Math.max(0, Math.round(value))}ms`;
};

export interface ApplyComboThemeOptions {
  root: HTMLElement;
  theme: ComboTheme;
  durationMs: number;
  jitterPx: number;
  blurPx: number;
  overlayAlpha: number;
  vignette: boolean;
  halftone: boolean;
  previousThemeId?: string | null;
}

export const applyComboThemeToRoot = ({
  root,
  theme,
  durationMs,
  jitterPx,
  blurPx,
  overlayAlpha,
  vignette,
  halftone,
  previousThemeId,
}: ApplyComboThemeOptions): void => {
  root.classList.add('combo-glitching');

  if (previousThemeId && previousThemeId !== theme.id) {
    root.classList.remove(previousThemeId);
  }

  root.classList.add(theme.id);

  root.style.setProperty('--combo-glitch-duration', formatDuration(durationMs));
  root.style.setProperty('--glitch-jitter', `${Math.max(0, Math.round(jitterPx))}px`);
  root.style.setProperty('--glitch-blur', `${Math.max(0, Math.round(blurPx))}px`);
  root.style.setProperty('--overlay-alpha', clamp01(overlayAlpha).toString());
  root.style.setProperty('--glitch-vignette', vignette ? '1' : '0');
  root.style.setProperty('--glitch-halftone', halftone ? '1' : '0');
};

export const clearComboThemeFromRoot = (root: HTMLElement, currentThemeId?: string | null): void => {
  root.classList.remove('combo-glitching');
  if (currentThemeId) {
    root.classList.remove(currentThemeId);
  }

  root.style.removeProperty('--combo-glitch-duration');
  root.style.removeProperty('--glitch-jitter');
  root.style.removeProperty('--glitch-blur');
  root.style.removeProperty('--overlay-alpha');
  root.style.removeProperty('--glitch-vignette');
  root.style.removeProperty('--glitch-halftone');
};
