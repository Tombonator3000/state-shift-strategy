import type { Difficulty } from '@/ai';
import type { DrawMode } from '@/data/cardDrawingSystem';
import type { UiTheme } from '@/hooks/useTheme';
import type { ComboSettings } from '@/game/combo.types';
import { DEFAULT_COMBO_SETTINGS } from '@/game/combo.config';

export const SETTINGS_STORAGE_KEY = 'gameSettings';

export type DifficultyLabel =
  | 'EASY - Intelligence Leak'
  | 'NORMAL - Classified'
  | 'HARD - Top Secret'
  | 'TOP SECRET+ - Meta-Cheating';

export const DIFFICULTY_LABELS: Record<Difficulty, DifficultyLabel> = {
  EASY: 'EASY - Intelligence Leak',
  NORMAL: 'NORMAL - Classified',
  HARD: 'HARD - Top Secret',
  TOP_SECRET_PLUS: 'TOP SECRET+ - Meta-Cheating',
};

export const DIFFICULTY_OPTIONS: DifficultyLabel[] = [
  DIFFICULTY_LABELS.EASY,
  DIFFICULTY_LABELS.NORMAL,
  DIFFICULTY_LABELS.HARD,
  DIFFICULTY_LABELS.TOP_SECRET_PLUS,
];

const LEGACY_DIFFICULTY_LABELS: Record<string, DifficultyLabel> = {
  easy: DIFFICULTY_LABELS.EASY,
  'easy - intelligence leak': DIFFICULTY_LABELS.EASY,
  normal: DIFFICULTY_LABELS.NORMAL,
  medium: DIFFICULTY_LABELS.NORMAL,
  'normal - classified': DIFFICULTY_LABELS.NORMAL,
  hard: DIFFICULTY_LABELS.HARD,
  'hard - top secret': DIFFICULTY_LABELS.HARD,
  legendary: DIFFICULTY_LABELS.TOP_SECRET_PLUS,
  top_secret_plus: DIFFICULTY_LABELS.TOP_SECRET_PLUS,
  'top secret+ - meta-cheating': DIFFICULTY_LABELS.TOP_SECRET_PLUS,
};

const DIFFICULTY_LABEL_SET = new Set<DifficultyLabel>(Object.values(DIFFICULTY_LABELS));

export interface GameSettings {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  enableAnimations: boolean;
  autoEndTurn: boolean;
  fastMode: boolean;
  showTooltips: boolean;
  enableKeyboardShortcuts: boolean;
  difficulty: DifficultyLabel;
  screenShake: boolean;
  confirmActions: boolean;
  drawMode: DrawMode;
  uiTheme: UiTheme;
  paranormalEffectsEnabled: boolean;
}

export const DEFAULT_GAME_SETTINGS: GameSettings = {
  masterVolume: 80,
  musicVolume: 20,
  sfxVolume: 80,
  enableAnimations: true,
  autoEndTurn: false,
  fastMode: false,
  showTooltips: true,
  enableKeyboardShortcuts: true,
  difficulty: DIFFICULTY_LABELS.NORMAL,
  screenShake: true,
  confirmActions: true,
  drawMode: 'standard',
  uiTheme: 'tabloid_bw',
  paranormalEffectsEnabled: true,
};

export const normalizeComboSettings = (stored?: ComboSettings | null): ComboSettings => {
  const base = {
    ...DEFAULT_COMBO_SETTINGS,
    comboToggles: { ...DEFAULT_COMBO_SETTINGS.comboToggles },
  } satisfies ComboSettings;

  if (!stored) {
    return base;
  }

  return {
    ...base,
    ...stored,
    comboToggles: {
      ...base.comboToggles,
      ...(stored.comboToggles ?? {}),
    },
  } satisfies ComboSettings;
};

export const resolveStoredDifficultyLabel = (value: unknown): DifficultyLabel => {
  if (typeof value === 'string') {
    if (DIFFICULTY_LABEL_SET.has(value as DifficultyLabel)) {
      return value as DifficultyLabel;
    }

    const normalized = LEGACY_DIFFICULTY_LABELS[value.toLowerCase()];
    if (normalized) {
      return normalized;
    }
  }

  return DIFFICULTY_LABELS.NORMAL;
};

export const loadStoredGameSettings = (): {
  settings: GameSettings;
  comboSettings: ComboSettings;
} => {
  const baseSettings: GameSettings = { ...DEFAULT_GAME_SETTINGS };
  let comboSettings = normalizeComboSettings();

  if (typeof localStorage !== 'undefined') {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as (Partial<GameSettings> & { comboSettings?: ComboSettings }) | null;
        if (parsed) {
          const difficulty = resolveStoredDifficultyLabel(parsed.difficulty);
          Object.assign(baseSettings, parsed, { difficulty });
          comboSettings = normalizeComboSettings(parsed.comboSettings);
        }
      } catch (error) {
        console.warn('Failed to parse stored game settings:', error);
      }
    }
  }

  return { settings: baseSettings, comboSettings };
};
