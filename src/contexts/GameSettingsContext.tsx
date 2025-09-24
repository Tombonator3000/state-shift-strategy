import { createContext, useCallback, useContext, useMemo, useRef, useState, useEffect, type ReactNode } from 'react';
import { setComboSettings } from '@/game/comboEngine';
import { DEFAULT_COMBO_SETTINGS } from '@/game/combo.config';
import type { ComboSettings } from '@/game/combo.types';
import { setDifficultyFromLabel } from '@/state/settings';
import {
  DEFAULT_GAME_SETTINGS,
  SETTINGS_STORAGE_KEY,
  loadStoredGameSettings,
  type GameSettings,
} from '@/state/gameSettings';

interface GameSettingsContextValue {
  settings: GameSettings;
  comboSettings: ComboSettings;
  updateSettings: (update: Partial<GameSettings>) => void;
  updateComboSettings: (update: Partial<ComboSettings>) => ComboSettings;
  resetToDefaults: () => void;
}

const GameSettingsContext = createContext<GameSettingsContextValue | null>(null);

const persist = (settings: GameSettings, comboSettings: ComboSettings) => {
  if (typeof localStorage === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify({ ...settings, comboSettings }),
    );
  } catch (error) {
    console.error('Failed to persist game settings:', error);
  }
};

export const GameSettingsProvider = ({ children }: { children: ReactNode }) => {
  const initialData = useMemo(() => loadStoredGameSettings(), []);

  const [settings, setSettings] = useState<GameSettings>(initialData.settings);
  const [comboSettings, setComboSettingsState] = useState<ComboSettings>(() => {
    return setComboSettings(initialData.comboSettings ?? DEFAULT_COMBO_SETTINGS);
  });

  const settingsRef = useRef(settings);
  const comboRef = useRef(comboSettings);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    comboRef.current = comboSettings;
  }, [comboSettings]);

  useEffect(() => {
    setDifficultyFromLabel(settings.difficulty);
  }, [settings.difficulty]);

  useEffect(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('sg_ui_theme', settings.uiTheme);
    }
  }, [settings.uiTheme]);

  const updateSettings = useCallback((update: Partial<GameSettings>) => {
    setSettings(prev => {
      const next = { ...prev, ...update } as GameSettings;
      settingsRef.current = next;
      persist(next, comboRef.current);
      if (update.difficulty) {
        setDifficultyFromLabel(update.difficulty);
      }
      if (update.uiTheme && typeof localStorage !== 'undefined') {
        localStorage.setItem('sg_ui_theme', update.uiTheme);
      }
      return next;
    });
  }, []);

  const updateComboSettings = useCallback((update: Partial<ComboSettings>) => {
    const merged = setComboSettings(update);
    setComboSettingsState(merged);
    comboRef.current = merged;
    persist(settingsRef.current, merged);
    return merged;
  }, []);

  const resetToDefaults = useCallback(() => {
    const defaultSettings: GameSettings = { ...DEFAULT_GAME_SETTINGS };
    const defaultCombos = setComboSettings({
      ...DEFAULT_COMBO_SETTINGS,
      comboToggles: { ...DEFAULT_COMBO_SETTINGS.comboToggles },
    });

    setSettings(defaultSettings);
    setComboSettingsState(defaultCombos);
    settingsRef.current = defaultSettings;
    comboRef.current = defaultCombos;
    setDifficultyFromLabel(defaultSettings.difficulty);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('sg_ui_theme', defaultSettings.uiTheme);
    }
    persist(defaultSettings, defaultCombos);
  }, []);

  const value = useMemo<GameSettingsContextValue>(() => ({
    settings,
    comboSettings,
    updateSettings,
    updateComboSettings,
    resetToDefaults,
  }), [settings, comboSettings, updateSettings, updateComboSettings, resetToDefaults]);

  return (
    <GameSettingsContext.Provider value={value}>
      {children}
    </GameSettingsContext.Provider>
  );
};

export const useGameSettings = () => {
  const context = useContext(GameSettingsContext);
  if (!context) {
    throw new Error('useGameSettings must be used within a GameSettingsProvider');
  }
  return context;
};

export type { GameSettings } from '@/state/gameSettings';
