import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAudioContext } from '@/contexts/AudioContext';
import { DRAW_MODE_CONFIGS, type DrawMode } from '@/data/cardDrawingSystem';
import { useUiTheme, type UiTheme } from '@/hooks/useTheme';
import type { Difficulty } from '@/ai';
import { getDifficulty, setDifficultyFromLabel } from '@/state/settings';
import { COMBO_DEFINITIONS, DEFAULT_COMBO_SETTINGS } from '@/game/combo.config';
import { formatComboReward, getComboSettings, setComboSettings } from '@/game/comboEngine';
import type { ComboCategory, ComboSettings } from '@/game/combo.types';
import { Badge } from '@/components/ui/badge';
import { DEFAULT_UI_SCALE, coerceUiScale, parseUiScale } from '@/lib/ui-scale';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import '@/styles/tabloid.css';

const SETTINGS_STORAGE_KEY = 'gameSettings';

type DifficultyLabel =
  | 'EASY - Intelligence Leak'
  | 'NORMAL - Classified'
  | 'HARD - Top Secret'
  | 'TOP SECRET+ - Meta-Cheating';

const DIFFICULTY_LABELS: Record<Difficulty, DifficultyLabel> = {
  EASY: 'EASY - Intelligence Leak',
  NORMAL: 'NORMAL - Classified',
  HARD: 'HARD - Top Secret',
  TOP_SECRET_PLUS: 'TOP SECRET+ - Meta-Cheating',
};

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
const DIFFICULTY_OPTIONS: DifficultyLabel[] = [
  DIFFICULTY_LABELS.EASY,
  DIFFICULTY_LABELS.NORMAL,
  DIFFICULTY_LABELS.HARD,
  DIFFICULTY_LABELS.TOP_SECRET_PLUS,
];

const CATEGORY_LABELS: Record<ComboCategory, string> = {
  sequence: 'Sequence Chains',
  count: 'Play Volume',
  threshold: 'Threshold Targets',
  state: 'State Operations',
  hybrid: 'Hybrid Conditions',
};

const CATEGORY_ORDER: ComboCategory[] = ['sequence', 'count', 'threshold', 'state', 'hybrid'];

const resolveStoredDifficultyLabel = (value: unknown): DifficultyLabel => {
  if (typeof value === 'string') {
    if (DIFFICULTY_LABEL_SET.has(value as DifficultyLabel)) {
      return value as DifficultyLabel;
    }

    const normalized = LEGACY_DIFFICULTY_LABELS[value.toLowerCase()];
    if (normalized) {
      return normalized;
    }
  }

  try {
    return DIFFICULTY_LABELS[getDifficulty()];
  } catch {
    return DIFFICULTY_LABELS.NORMAL;
  }
};

interface OptionsProps {
  onClose: () => void;
  onBackToMainMenu?: () => void;
  onSaveGame?: () => boolean;
}

interface GameSettings {
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
  secretAgendasEnabled: boolean;
  drawMode: 'standard' | 'classic' | 'momentum' | 'catchup' | 'fast';
  uiTheme: 'tabloid_bw' | 'government_classic';
  paranormalEffectsEnabled: boolean;
  mapVfxEnabled: boolean;
  uiScale: number;
}

const Options = ({ onClose, onBackToMainMenu, onSaveGame }: OptionsProps) => {
  const audio = useAudioContext();
  const [uiTheme, setUiTheme] = useUiTheme();
  const { volume: audioMasterVolume } = audio.config;
  type MusicCollectionKey = keyof typeof audio.availableTracks;
  const [selectedMusicCollection, setSelectedMusicCollection] = useState<MusicCollectionKey>(
    audio.currentMusicType,
  );
  const [selectedTrackIndex, setSelectedTrackIndex] = useState<number>(0);
  const isTabloid = uiTheme === 'tabloid_bw';

  const resolveInitialState = (): { settings: GameSettings; combo: ComboSettings } => {
    const defaultDifficulty = (() => {
      try {
        return DIFFICULTY_LABELS[getDifficulty()];
      } catch {
        return DIFFICULTY_LABELS.NORMAL;
      }
    })();

    const baseSettings: GameSettings = {
      masterVolume: Math.round(audio.config.volume * 100),
      musicVolume: Math.round(audio.config.musicVolume * 100),
      sfxVolume: Math.round(audio.config.sfxVolume * 100),
      enableAnimations: true,
      autoEndTurn: false,
      fastMode: false,
      showTooltips: true,
      enableKeyboardShortcuts: true,
      difficulty: defaultDifficulty,
      screenShake: true,
      confirmActions: true,
      secretAgendasEnabled: true,
      drawMode: 'standard',
      uiTheme,
      paranormalEffectsEnabled: true,
      mapVfxEnabled: true,
      uiScale: DEFAULT_UI_SCALE,
    };

    const stored = typeof localStorage !== 'undefined'
      ? localStorage.getItem(SETTINGS_STORAGE_KEY)
      : null;

    if (stored) {
      try {
        const parsed = JSON.parse(stored) as (Partial<GameSettings> & { comboSettings?: ComboSettings }) | null;
        const { comboSettings: storedComboSettings, ...rest } = parsed ?? {};
        const difficultyLabel = resolveStoredDifficultyLabel(rest?.difficulty);
        const mergedSettings: GameSettings = {
          ...baseSettings,
          ...rest,
          difficulty: difficultyLabel,
          uiScale: parseUiScale(rest?.uiScale, baseSettings.uiScale),
          secretAgendasEnabled: typeof rest.secretAgendasEnabled === 'boolean'
            ? rest.secretAgendasEnabled
            : baseSettings.secretAgendasEnabled,
          mapVfxEnabled: typeof rest.mapVfxEnabled === 'boolean'
            ? rest.mapVfxEnabled
            : baseSettings.mapVfxEnabled,
        };

        if (typeof document !== 'undefined') {
          document.documentElement.style.setProperty('--ui-scale', mergedSettings.uiScale.toString());
        }

        setDifficultyFromLabel(mergedSettings.difficulty);

        const combo = storedComboSettings
          ? setComboSettings({
              ...storedComboSettings,
              comboToggles: {
                ...DEFAULT_COMBO_SETTINGS.comboToggles,
                ...(storedComboSettings.comboToggles ?? {}),
              },
            })
          : setComboSettings({
              ...DEFAULT_COMBO_SETTINGS,
              comboToggles: { ...DEFAULT_COMBO_SETTINGS.comboToggles },
            });

        return { settings: mergedSettings, combo };
      } catch (error) {
        console.error('Failed to parse saved settings:', error);
      }
    }

    setDifficultyFromLabel(baseSettings.difficulty);
    const combo = setComboSettings({
      ...getComboSettings(),
      comboToggles: { ...DEFAULT_COMBO_SETTINGS.comboToggles },
    });

    return { settings: baseSettings, combo };
  };

  const initialStateRef = useRef<{ settings: GameSettings; combo: ComboSettings }>();
  if (!initialStateRef.current) {
    initialStateRef.current = resolveInitialState();
  }

  const [settings, setSettings] = useState<GameSettings>(initialStateRef.current.settings);
  const [comboSettingsState, setComboSettingsState] = useState<ComboSettings>(initialStateRef.current.combo);
  const masterVolumeUpdateSource = useRef<'settings' | null>(null);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    document.documentElement.style.setProperty('--ui-scale', settings.uiScale.toString());
  }, [settings.uiScale]);

  useEffect(() => {
    if (masterVolumeUpdateSource.current !== 'settings') {
      return;
    }

    const currentAudioVolume = Math.round(audioMasterVolume * 100);
    if (currentAudioVolume !== settings.masterVolume) {
      console.log('🎵 Options: Syncing volume from', currentAudioVolume, 'to', settings.masterVolume);
      audio.setVolume(settings.masterVolume / 100);
    }

    masterVolumeUpdateSource.current = null;
  }, [settings.masterVolume, audio, audioMasterVolume]);

  useEffect(() => {
    const currentSfxVolume = Math.round(audio.config.sfxVolume * 100);
    if (currentSfxVolume !== settings.sfxVolume) {
      console.log('🎵 Options: Syncing SFX volume from', currentSfxVolume, 'to', settings.sfxVolume);
      audio.setSfxVolume(settings.sfxVolume / 100);
    }
  }, [settings.sfxVolume, audio]);

  useEffect(() => {
    const currentMusicVolume = Math.round(audio.config.musicVolume * 100);
    if (currentMusicVolume !== settings.musicVolume) {
      console.log('🎵 Options: Syncing music volume from', currentMusicVolume, 'to', settings.musicVolume);
      audio.setMusicVolume(settings.musicVolume / 100);
    }
  }, [settings.musicVolume, audio]);

  useEffect(() => {
    const tracks = audio.availableTracks[selectedMusicCollection];
    if (tracks && tracks.length > 0) {
      const found = tracks.find(track => track.index === selectedTrackIndex);
      if (!found) {
        setSelectedTrackIndex(tracks[0].index);
      }
      return;
    }

    const fallbackEntry = (Object.entries(audio.availableTracks) as Array<[
      MusicCollectionKey,
      typeof audio.availableTracks[MusicCollectionKey],
    ]>).find(([, list]) => list.length > 0);

    if (fallbackEntry) {
      const [collection, list] = fallbackEntry;
      if (collection !== selectedMusicCollection) {
        setSelectedMusicCollection(collection);
      }
      setSelectedTrackIndex(list[0].index);
    }
  }, [audio.availableTracks, selectedMusicCollection, selectedTrackIndex]);

  useEffect(() => {
    const currentName = audio.currentTrackName?.toLowerCase();
    if (!currentName) {
      return;
    }

    for (const [collection, tracks] of Object.entries(audio.availableTracks) as Array<[
      MusicCollectionKey,
      typeof audio.availableTracks[MusicCollectionKey],
    ]>) {
      const match = tracks.find(track => track.src.split('/').pop()?.toLowerCase() === currentName);
      if (match) {
        if (collection !== selectedMusicCollection) {
          setSelectedMusicCollection(collection);
        }
        if (match.index !== selectedTrackIndex) {
          setSelectedTrackIndex(match.index);
        }
        break;
      }
    }
  }, [audio.currentTrackName, audio.availableTracks, selectedMusicCollection, selectedTrackIndex]);

  useEffect(() => {
    if (audio.currentTrackName) {
      return;
    }

    if (audio.availableTracks[audio.currentMusicType]?.length) {
      setSelectedMusicCollection(audio.currentMusicType);
    }
  }, [audio.currentMusicType, audio.currentTrackName, audio.availableTracks]);

  const persistSettings = useCallback((nextSettings: GameSettings, nextComboSettings: ComboSettings) => {
    if (typeof localStorage === 'undefined') {
      return;
    }

    try {
      localStorage.setItem(
        SETTINGS_STORAGE_KEY,
        JSON.stringify({ ...nextSettings, comboSettings: nextComboSettings }),
      );
    } catch (error) {
      console.error('Failed to persist settings:', error);
    }
  }, []);

  const updateSettings = (newSettings: Partial<GameSettings>) => {
    const normalizedSettings: Partial<GameSettings> = { ...newSettings };
    if (typeof newSettings.uiScale === 'number') {
      normalizedSettings.uiScale = coerceUiScale(newSettings.uiScale);
    }

    if (typeof newSettings.masterVolume === 'number') {
      masterVolumeUpdateSource.current = 'settings';
    }

    setSettings(prev => {
      const updated = { ...prev, ...normalizedSettings };
      if (newSettings.difficulty) {
        setDifficultyFromLabel(newSettings.difficulty);
      }
      persistSettings(updated, comboSettingsState);
      return updated;
    });
  };

  const handleMasterVolumeChange = (volume: number) => {
    const clampedVolume = Math.min(1, Math.max(0, volume));
    const percentValue = Math.round(clampedVolume * 100);

    masterVolumeUpdateSource.current = 'settings';
    updateSettings({ masterVolume: percentValue });
    audio.setVolume(clampedVolume);
  };

  useEffect(() => {
    if (masterVolumeUpdateSource.current === 'settings') {
      return;
    }

    const currentAudioVolume = Math.round(audioMasterVolume * 100);
    if (currentAudioVolume === settings.masterVolume) {
      return;
    }

    setSettings(prev => {
      if (prev.masterVolume === currentAudioVolume) {
        return prev;
      }

      const updated = { ...prev, masterVolume: currentAudioVolume };
      persistSettings(updated, comboSettingsState);
      return updated;
    });
  }, [audioMasterVolume, comboSettingsState, persistSettings, settings.masterVolume]);

  const applyComboSettings = (update: Partial<ComboSettings>) => {
    const normalized: Partial<ComboSettings> = { ...update };
    if (update.comboToggles) {
      normalized.comboToggles = { ...update.comboToggles };
    }
    const merged = setComboSettings(normalized);
    setComboSettingsState(merged);
    persistSettings(settings, merged);
  };

  const resetToDefaults = () => {
    const defaultSettings: GameSettings = {
      masterVolume: 80,
      musicVolume: 12,
      sfxVolume: 80,
      enableAnimations: true,
      autoEndTurn: false,
      fastMode: false,
      showTooltips: true,
      enableKeyboardShortcuts: true,
      difficulty: DIFFICULTY_LABELS.NORMAL,
      screenShake: true,
      confirmActions: true,
      secretAgendasEnabled: true,
      drawMode: 'standard',
      uiTheme: 'tabloid_bw',
      paranormalEffectsEnabled: true,
      mapVfxEnabled: true,
      uiScale: DEFAULT_UI_SCALE,
    };

    const defaultCombos = setComboSettings({
      ...DEFAULT_COMBO_SETTINGS,
      comboToggles: { ...DEFAULT_COMBO_SETTINGS.comboToggles },
    });

    masterVolumeUpdateSource.current = 'settings';
    setSettings(defaultSettings);
    setComboSettingsState(defaultCombos);
    setDifficultyFromLabel(defaultSettings.difficulty);
    setUiTheme('tabloid_bw');
    persistSettings(defaultSettings, defaultCombos);
    audio.setVolume(defaultSettings.masterVolume / 100);
    audio.setMusicVolume(defaultSettings.musicVolume / 100);
    audio.setSfxVolume(defaultSettings.sfxVolume / 100);
  };

  const handleSaveGame = () => {
    const success = onSaveGame?.();
    if (success) {
      const savedIndicator = document.createElement('div');
      savedIndicator.textContent = '✓ GAME SAVED';
      savedIndicator.className = 'fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded z-[60] animate-fade-in';
      document.body.appendChild(savedIndicator);
      setTimeout(() => savedIndicator.remove(), 2000);
    } else {
      const errorIndicator = document.createElement('div');
      errorIndicator.textContent = '❌ SAVE FAILED';
      errorIndicator.className = 'fixed top-4 right-4 bg-red-600 text-white px-4 py-2 rounded z-[60] animate-fade-in';
      document.body.appendChild(errorIndicator);
      setTimeout(() => errorIndicator.remove(), 2000);
    }
  };

  const collectionEntries = useMemo(
    () =>
      Object.entries(audio.availableTracks) as Array<[
        MusicCollectionKey,
        typeof audio.availableTracks[MusicCollectionKey],
      ]>,
    [audio.availableTracks],
  );

  const selectedCollectionTracks = audio.availableTracks[selectedMusicCollection] ?? [];

  const currentTrackLabel = useMemo(() => {
    if (!audio.currentTrackName) {
      return 'No track selected';
    }

    const normalized = audio.currentTrackName.toLowerCase();
    for (const [, tracks] of collectionEntries) {
      const match = tracks.find(track => track.src.split('/').pop()?.toLowerCase() === normalized);
      if (match) {
        return match.label;
      }
    }

    return audio.currentTrackName
      .replace(/\.mp3$/i, '')
      .replace(/[-_]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }, [audio.currentTrackName, collectionEntries]);

  const isAudioReady = audio.tracksLoaded && audio.audioContextUnlocked;

  const comboGroups = useMemo(() => {
    const grouped = new Map<ComboCategory, Array<{
      id: string;
      name: string;
      description: string;
      reward: string;
      fxText?: string;
      cap?: number;
      priority: number;
    }>>();

    for (const def of COMBO_DEFINITIONS) {
      const rewardText = formatComboReward(def.reward).replace(/[()]/g, '').trim();
      const entry = {
        id: def.id,
        name: def.name,
        description: def.description,
        reward: rewardText,
        fxText: def.fxText,
        cap: def.cap,
        priority: def.priority,
      };

      const bucket = grouped.get(def.category) ?? [];
      bucket.push(entry);
      grouped.set(def.category, bucket);
    }

    for (const bucket of grouped.values()) {
      bucket.sort((a, b) => b.priority - a.priority);
    }

    return CATEGORY_ORDER
      .filter(category => grouped.has(category))
      .map(category => ({
        category,
        label: CATEGORY_LABELS[category],
        combos: grouped.get(category) ?? [],
      }));
  }, []);

  const panelCardClass = isTabloid
    ? 'rounded-none border-[3px] border-black bg-[var(--paper)]/95 shadow-[8px_8px_0_rgba(0,0,0,0.25)] p-6 text-black'
    : 'p-6 border-2 border-newspaper-text bg-newspaper-bg';

  const sectionTitleClass = isTabloid
    ? 'font-tabloid text-2xl uppercase tracking-[0.3em] text-black mb-4 flex items-center gap-2'
    : 'font-bold text-xl text-newspaper-text mb-4 flex items-center';

  const strapLabelClass = isTabloid
    ? 'text-[11px] font-black uppercase tracking-[0.4em] text-black/60'
    : 'text-[11px] font-mono uppercase tracking-[0.2em] text-newspaper-text/60';

  const sliderLabelClass = isTabloid
    ? 'text-sm font-black uppercase tracking-[0.2em] text-black mb-2 block'
    : 'text-sm font-medium text-newspaper-text mb-2 block';

  const infoTextClass = isTabloid
    ? 'text-xs text-black/70 font-semibold uppercase tracking-[0.2em]'
    : 'text-xs text-newspaper-text/70';

  const toggleRowClass = isTabloid
    ? 'flex items-center justify-between border border-black/10 bg-white/70 px-4 py-3'
    : 'flex items-center justify-between';

  const toggleLabelClass = isTabloid
    ? 'text-xs font-black uppercase tracking-[0.2em] text-black'
    : 'text-sm font-medium text-newspaper-text';

  const formLabelClass = isTabloid
    ? 'text-xs font-black uppercase tracking-[0.25em] text-black mb-2 block'
    : 'text-sm font-medium text-newspaper-text mb-2 block';

  const buttonBaseClass = isTabloid
    ? 'rounded-none border-2 border-black uppercase font-black tracking-[0.25em] shadow-[6px_6px_0_rgba(0,0,0,0.4)] transition-transform hover:-translate-x-[2px] hover:-translate-y-[2px] active:translate-x-[1px] active:translate-y-[1px]'
    : '';

  const outlineButtonClass = isTabloid
    ? `${buttonBaseClass} bg-[var(--paper)] text-black`
    : '';

  const filledButtonClass = isTabloid
    ? `${buttonBaseClass} bg-black text-[var(--paper)] hover:bg-black/90`
    : '';

  return (
    <div
      className={cn(
        'min-h-screen flex justify-center relative overflow-hidden',
        isTabloid ? 'tabloid-bg items-start px-4 py-8 sm:px-10' : 'bg-newspaper-bg items-center p-8',
      )}
    >
      {isTabloid ? (
        <div className="pointer-events-none absolute inset-0 opacity-20 bg-[radial-gradient(circle,rgba(0,0,0,0.25)_1px,transparent_1px)] [background-size:14px_14px]" />
      ) : (
        <div className="absolute inset-0 opacity-5">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="absolute bg-newspaper-text h-6"
              style={{
                width: `${Math.random() * 300 + 100}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                transform: `rotate(${Math.random() * 4 - 2}deg)`
              }}
            />
          ))}
        </div>
      )}

      <Card
        className={cn(
          'w-full relative',
          isTabloid
            ? 'max-w-5xl rounded-none border-[6px] border-black bg-[var(--paper)] shadow-[12px_12px_0_rgba(0,0,0,0.35)] overflow-hidden text-black'
            : 'max-w-4xl p-8 bg-newspaper-bg border-4 border-newspaper-text animate-redacted-reveal',
        )}
        style={isTabloid ? undefined : { fontFamily: 'serif' }}
      >
        <div
          className={cn(
            'absolute top-4 right-4 text-red-600 font-mono text-xs transform rotate-12 border-2 border-red-600 p-2',
            isTabloid &&
              'bg-black text-[var(--paper)] border-black font-tabloid tracking-[0.4em] uppercase rotate-6 shadow-[4px_4px_0_rgba(0,0,0,0.4)]',
          )}
        >
          TOP SECRET
        </div>
        <div
          className={cn(
            'absolute bottom-4 left-4 text-red-600 font-mono text-xs transform -rotate-12 border-2 border-red-600 p-2',
            isTabloid &&
              'bg-black text-[var(--paper)] border-black font-tabloid tracking-[0.4em] uppercase -rotate-6 shadow-[4px_4px_0_rgba(0,0,0,0.4)]',
          )}
        >
          EYES ONLY
        </div>

        <Button
          onClick={onClose}
          variant="outline"
          className={cn(
            'absolute top-4 left-4',
            isTabloid
              ? `${outlineButtonClass} text-xs px-4 py-2 bg-[var(--paper)] hover:bg-white`
              : 'border-newspaper-text text-newspaper-text hover:bg-newspaper-text/10',
          )}
        >
          ← BACK
        </Button>

        <header
          className={cn(
            'text-center',
            isTabloid ? 'px-6 sm:px-10 pt-12 pb-6' : 'mb-8 mt-8',
          )}
        >
          <div
            className={cn(
              'inline-block',
              isTabloid && 'border-[3px] border-black bg-white px-6 py-4 shadow-[8px_8px_0_rgba(0,0,0,0.35)]',
            )}
          >
            <h1
              className={cn(
                'mb-2',
                isTabloid
                  ? 'font-tabloid text-4xl sm:text-5xl uppercase tracking-[0.35em] text-black'
                  : 'text-4xl font-bold text-newspaper-text mb-4',
              )}
            >
              CLASSIFIED OPTIONS
            </h1>
            <p
              className={cn(
                'text-sm',
                isTabloid
                  ? 'font-black uppercase tracking-[0.3em] text-black/70'
                  : 'text-newspaper-text/80 mb-4',
              )}
            >
              Configure your conspiracy experience
            </p>
          </div>
        </header>

        <div
          className={cn(
            'grid md:grid-cols-2',
            isTabloid ? 'gap-6 px-6 sm:px-10' : 'gap-8',
          )}
        >
          <Card className={cn(panelCardClass)}>
            <h3 className={sectionTitleClass}>🔊 AUDIO SURVEILLANCE</h3>

            <div className="space-y-6">
              <div>
                <label className={sliderLabelClass}>
                  Master Volume: {settings.masterVolume}%
                </label>
                <Slider
                  value={[settings.masterVolume]}
                  onValueChange={([value]) => handleMasterVolumeChange(value / 100)}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>

              <div>
                <label className={sliderLabelClass}>
                  Music Volume: {settings.musicVolume}%
                </label>
                <Slider
                  value={[settings.musicVolume]}
                  onValueChange={([value]) => {
                    audio.setMusicVolume(value / 100);
                    updateSettings({ musicVolume: value });
                  }}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>

              <div>
                <label className={sliderLabelClass}>
                  Sound Effects: {settings.sfxVolume}%
                </label>
                <Slider
                  value={[settings.sfxVolume]}
                  onValueChange={([value]) => {
                    audio.setSfxVolume(value / 100);
                    updateSettings({ sfxVolume: value });
                  }}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>

              <div
                className={cn(
                  'border-t border-newspaper-text/20 pt-4 space-y-4',
                  isTabloid && 'border-black/30 pt-6',
                )}
              >
                <div className={cn('grid gap-3 md:grid-cols-3', isTabloid && 'gap-4')}>
                  <div
                    className={cn(
                      'border border-newspaper-text/30 bg-white/80 p-3 shadow-sm flex items-center justify-between',
                      isTabloid && 'border-black bg-white shadow-[4px_4px_0_rgba(0,0,0,0.3)] px-4 py-3',
                    )}
                  >
                    <div>
                      <div className={strapLabelClass}>Music Channel</div>
                      <div className={cn('text-lg font-bold', isTabloid ? 'text-black' : 'text-newspaper-text')}>
                        {audio.config.musicEnabled ? 'ONLINE' : 'OFFLINE'}
                      </div>
                    </div>
                    <Switch
                      checked={audio.config.musicEnabled}
                      onCheckedChange={() => audio.toggleMusic()}
                    />
                  </div>
                  <div
                    className={cn(
                      'border border-newspaper-text/30 bg-white/80 p-3 shadow-sm flex items-center justify-between',
                      isTabloid && 'border-black bg-white shadow-[4px_4px_0_rgba(0,0,0,0.3)] px-4 py-3',
                    )}
                  >
                    <div>
                      <div className={strapLabelClass}>SFX Channel</div>
                      <div className={cn('text-lg font-bold', isTabloid ? 'text-black' : 'text-newspaper-text')}>
                        {audio.config.sfxEnabled ? 'READY' : 'DISABLED'}
                      </div>
                    </div>
                    <Switch
                      checked={audio.config.sfxEnabled}
                      onCheckedChange={() => audio.toggleSFX()}
                    />
                  </div>
                  <div
                    className={cn(
                      'border border-newspaper-text/30 bg-white/80 p-3 shadow-sm flex items-center justify-between',
                      isTabloid && 'border-black bg-white shadow-[4px_4px_0_rgba(0,0,0,0.3)] px-4 py-3',
                    )}
                  >
                    <div>
                      <div className={strapLabelClass}>Master Mute</div>
                      <div className={cn('text-lg font-bold', isTabloid ? 'text-black' : 'text-newspaper-text')}>
                        {audio.config.muted ? 'SILENCED' : 'ACTIVE'}
                      </div>
                    </div>
                    <Switch
                      checked={audio.config.muted}
                      onCheckedChange={() => audio.toggleMute()}
                    />
                  </div>
                </div>

                <div
                  className={cn(
                    'border border-newspaper-text/30 bg-white/80 p-4 shadow-sm space-y-4',
                    isTabloid && 'border-black bg-white shadow-[6px_6px_0_rgba(0,0,0,0.3)]',
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className={strapLabelClass}>
                        Currently Broadcasting
                      </div>
                      <div className={cn('text-lg font-bold', isTabloid ? 'text-black' : 'text-newspaper-text')}>
                        {currentTrackLabel}
                      </div>
                      <div className={cn('text-[11px]', isTabloid ? 'font-black uppercase tracking-[0.3em] text-black/50' : 'font-mono text-newspaper-text/60')}>
                        Status: {audio.audioStatus}
                      </div>
                    </div>
                    <Badge
                      variant={audio.isPlaying ? 'default' : 'secondary'}
                      className={cn(
                        'font-mono tracking-[0.2em] uppercase',
                        isTabloid &&
                          'rounded-none border-2 border-black bg-black text-[var(--paper)] px-3 py-1 shadow-[3px_3px_0_rgba(0,0,0,0.35)] font-black',
                      )}
                    >
                      {audio.isPlaying ? 'LIVE' : 'STANDBY'}
                    </Badge>
                  </div>

                  <div className={cn('grid gap-3 md:grid-cols-2', isTabloid && 'gap-4')}>
                    <div>
                      <div className={cn(strapLabelClass, 'mb-1')}>
                        Music Collection
                      </div>
                      <Select
                        value={selectedMusicCollection}
                        onValueChange={value => setSelectedMusicCollection(value as MusicCollectionKey)}
                        disabled={!collectionEntries.some(([, tracks]) => tracks.length > 0)}
                      >
                        <SelectTrigger
                          className={cn(
                            'font-mono uppercase tracking-[0.2em] text-xs',
                            isTabloid
                              ? 'border-[3px] border-black bg-white text-black rounded-none shadow-[3px_3px_0_rgba(0,0,0,0.35)]'
                              : 'border-2 border-newspaper-text bg-newspaper-bg text-newspaper-text',
                          )}
                        >
                          <SelectValue placeholder="Select playlist" />
                        </SelectTrigger>
                        <SelectContent
                          className={cn(
                            'text-newspaper-text',
                            isTabloid && 'bg-[var(--paper)] text-black border-2 border-black rounded-none shadow-[4px_4px_0_rgba(0,0,0,0.25)]',
                          )}
                        >
                          {collectionEntries.map(([collection, tracks]) => (
                            <SelectItem
                              key={collection}
                              value={collection}
                              disabled={tracks.length === 0}
                              className="font-mono uppercase tracking-[0.2em] text-xs"
                            >
                              {collection.replace(/_/g, ' ')} ({tracks.length})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <div className={cn(strapLabelClass, 'mb-1')}>
                        Track Selection
                      </div>
                      <Select
                        value={String(selectedTrackIndex)}
                        onValueChange={value => {
                          const parsed = Number(value);
                          if (!Number.isNaN(parsed)) {
                            setSelectedTrackIndex(parsed);
                            audio.selectTrack(selectedMusicCollection, parsed);
                          }
                        }}
                        disabled={selectedCollectionTracks.length === 0}
                      >
                        <SelectTrigger
                          className={cn(
                            'font-mono uppercase tracking-[0.2em] text-xs',
                            isTabloid
                              ? 'border-[3px] border-black bg-white text-black rounded-none shadow-[3px_3px_0_rgba(0,0,0,0.35)]'
                              : 'border-2 border-newspaper-text bg-newspaper-bg text-newspaper-text',
                          )}
                        >
                          <SelectValue placeholder="Select track" />
                        </SelectTrigger>
                        <SelectContent
                          className={cn(
                            'text-newspaper-text',
                            isTabloid && 'bg-[var(--paper)] text-black border-2 border-black rounded-none shadow-[4px_4px_0_rgba(0,0,0,0.25)]',
                          )}
                        >
                          {selectedCollectionTracks.map(track => (
                            <SelectItem
                              key={track.index}
                              value={String(track.index)}
                              className="font-mono uppercase tracking-[0.2em] text-xs"
                            >
                              {track.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className={cn('flex flex-wrap gap-2', isTabloid && 'gap-3')}>
                    <Button
                      onClick={() => audio.playMusic(selectedMusicCollection)}
                      className={cn(
                        isTabloid
                          ? `${filledButtonClass} px-6 py-2 text-xs`
                          : 'bg-government-blue text-white hover:bg-government-blue/80 font-mono uppercase tracking-[0.2em]',
                      )}
                      disabled={!isAudioReady}
                    >
                      ▶︎ Play
                    </Button>
                    <Button
                      onClick={() => audio.pauseMusic()}
                      variant="outline"
                      className={cn(
                        isTabloid
                          ? `${outlineButtonClass} px-6 py-2 text-xs`
                          : 'border-newspaper-text text-newspaper-text font-mono uppercase tracking-[0.2em]',
                      )}
                      disabled={!audio.isPlaying}
                    >
                      ❚❚ Pause
                    </Button>
                    <Button
                      onClick={() => audio.stopMusic()}
                      variant="outline"
                      className={cn(
                        isTabloid
                          ? `${outlineButtonClass} px-6 py-2 text-xs`
                          : 'border-newspaper-text text-newspaper-text font-mono uppercase tracking-[0.2em]',
                      )}
                    >
                      ■ Stop
                    </Button>
                    <Button
                      onClick={() => audio.testSFX()}
                      variant="outline"
                      className={cn(
                        isTabloid
                          ? `${outlineButtonClass} px-6 py-2 text-xs`
                          : 'border-newspaper-text text-newspaper-text font-mono uppercase tracking-[0.2em]',
                      )}
                    >
                      🔊 Test SFX
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className={cn(panelCardClass)}>
            <h3 className={sectionTitleClass}>⚙️ OPERATION PARAMETERS</h3>

            <div className={cn('space-y-4', isTabloid && 'space-y-5')}>
              <div className={toggleRowClass}>
                <label className={toggleLabelClass}>Enable Animations</label>
                <Switch
                  checked={settings.enableAnimations}
                  onCheckedChange={checked => updateSettings({ enableAnimations: checked })}
                />
              </div>

              <div className={toggleRowClass}>
                <label className={toggleLabelClass}>Auto Go To Press</label>
                <Switch
                  checked={settings.autoEndTurn}
                  onCheckedChange={checked => updateSettings({ autoEndTurn: checked })}
                />
              </div>

              <div className={toggleRowClass}>
                <label className={toggleLabelClass}>Fast Mode</label>
                <Switch checked={settings.fastMode} onCheckedChange={checked => updateSettings({ fastMode: checked })} />
              </div>

              <div className={toggleRowClass}>
                <label className={toggleLabelClass}>Show Tooltips</label>
                <Switch
                  checked={settings.showTooltips}
                  onCheckedChange={checked => updateSettings({ showTooltips: checked })}
                />
              </div>

              <div className={toggleRowClass}>
                <label className={toggleLabelClass}>Keyboard Shortcuts</label>
                <Switch
                  checked={settings.enableKeyboardShortcuts}
                  onCheckedChange={checked => updateSettings({ enableKeyboardShortcuts: checked })}
                />
              </div>

              <div className={toggleRowClass}>
                <label className={toggleLabelClass}>Screen Shake Effects</label>
                <Switch
                  checked={settings.screenShake}
                  onCheckedChange={checked => updateSettings({ screenShake: checked })}
                />
              </div>

              <div className={toggleRowClass}>
                <label className={toggleLabelClass}>Paranormal Overlays &amp; Sightings</label>
                <Switch
                  checked={settings.paranormalEffectsEnabled}
                  onCheckedChange={checked => updateSettings({ paranormalEffectsEnabled: checked })}
                />
              </div>

              <div className={toggleRowClass}>
                <label className={toggleLabelClass}>Map Visual Effects</label>
                <Switch
                  checked={settings.mapVfxEnabled}
                  onCheckedChange={checked => updateSettings({ mapVfxEnabled: checked })}
                />
              </div>

              <div className={cn(isTabloid && 'border border-black/10 bg-white/70 px-4 py-4 space-y-3')}>
                <div className={cn('flex items-center justify-between mb-2', isTabloid && 'mb-3')}>
                  <label className={toggleLabelClass}>Interface Scale</label>
                  <span
                    className={cn(
                      'text-xs font-mono tracking-[0.2em] text-newspaper-text',
                      isTabloid && 'font-black text-black tracking-[0.25em] uppercase',
                    )}
                  >
                    {Math.round(settings.uiScale * 100)}%
                  </span>
                </div>
                <Slider
                  value={[settings.uiScale]}
                  min={0.75}
                  max={1.5}
                  step={0.05}
                  onValueChange={([value]) => {
                    if (typeof value === 'number') {
                      updateSettings({ uiScale: value });
                    }
                  }}
                />
              </div>

              <div className={toggleRowClass}>
                <label className={toggleLabelClass}>Confirm Destructive Actions</label>
                <Switch
                  checked={settings.confirmActions}
                  onCheckedChange={checked => updateSettings({ confirmActions: checked })}
                />
              </div>

              <div className={cn(toggleRowClass, isTabloid && 'gap-4 flex-wrap md:flex-nowrap')}>
                <div className={cn('flex-1', isTabloid && 'space-y-1')}>
                  <label className={toggleLabelClass}>Enable Secret Agendas</label>
                  <p className={infoTextClass}>
                    Assigns a random agenda to both factions at the start of a new campaign.
                  </p>
                </div>
                <Switch
                  checked={settings.secretAgendasEnabled}
                  onCheckedChange={checked => updateSettings({ secretAgendasEnabled: checked })}
                />
              </div>

              <div className={cn(isTabloid && 'border border-black/10 bg-white/70 px-4 py-4 space-y-2')}>
                <label className={formLabelClass}>Difficulty Level</label>
                <select
                  value={settings.difficulty}
                  onChange={event => updateSettings({ difficulty: event.target.value as DifficultyLabel })}
                  className={cn(
                    'w-full p-2',
                    isTabloid
                      ? 'border-[3px] border-black bg-white text-black uppercase tracking-[0.25em] text-xs font-black rounded-none shadow-[4px_4px_0_rgba(0,0,0,0.35)]'
                      : 'border border-newspaper-text bg-newspaper-bg text-newspaper-text rounded',
                  )}
                >
                  {DIFFICULTY_OPTIONS.map(option => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div className={cn(isTabloid && 'border border-black/10 bg-white/70 px-4 py-4 space-y-2')}>
                <label className={formLabelClass}>Card Draw Mode</label>
                <select
                  value={settings.drawMode}
                  onChange={event => updateSettings({ drawMode: event.target.value as DrawMode })}
                  className={cn(
                    'w-full p-2 mb-2',
                    isTabloid
                      ? 'border-[3px] border-black bg-white text-black uppercase tracking-[0.25em] text-xs font-black rounded-none shadow-[4px_4px_0_rgba(0,0,0,0.35)]'
                      : 'border border-newspaper-text bg-newspaper-bg text-newspaper-text rounded',
                  )}
                >
                  {Object.entries(DRAW_MODE_CONFIGS).map(([key, config]) => (
                    <option key={key} value={key}>
                      {config.name.toUpperCase()} - {config.description}
                    </option>
                  ))}
                </select>
                <div
                  className={cn(
                    'text-xs text-newspaper-text/70 space-y-1',
                    isTabloid && 'text-black/70 font-semibold uppercase tracking-[0.12em] space-y-2',
                  )}
                >
                  {(DRAW_MODE_CONFIGS[settings.drawMode] || DRAW_MODE_CONFIGS.standard).specialRules.map((rule, index) => (
                    <div key={index}>• {rule}</div>
                  ))}
                </div>
              </div>

              <div className={cn(isTabloid && 'border border-black/10 bg-white/70 px-4 py-4 space-y-2')}>
                <label className={formLabelClass}>UI Theme</label>
                <select
                  value={uiTheme}
                  onChange={event => {
                    const newTheme = event.target.value as UiTheme;
                    setUiTheme(newTheme);
                    updateSettings({ uiTheme: newTheme });
                  }}
                  className={cn(
                    'w-full p-2',
                    isTabloid
                      ? 'border-[3px] border-black bg-white text-black uppercase tracking-[0.25em] text-xs font-black rounded-none shadow-[4px_4px_0_rgba(0,0,0,0.35)]'
                      : 'border border-newspaper-text bg-newspaper-bg text-newspaper-text rounded',
                  )}
                >
                  <option value="tabloid_bw">TABLOID (Black &amp; White)</option>
                  <option value="government_classic">GOVERNMENT CLASSIC (Legacy Layout)</option>
                </select>
                <div className={cn('text-xs text-newspaper-text/70 mt-1', isTabloid && 'text-black/70 font-semibold uppercase tracking-[0.15em]')}>
                  Changes the visual appearance of menus and screens
                </div>
              </div>
            </div>
          </Card>

          <Card className={cn(panelCardClass, 'md:col-span-2')}>
            <h3 className={sectionTitleClass}>⚡ COMBO PROTOCOLS</h3>
            <p
              className={cn(
                'text-sm text-newspaper-text/80 mb-4',
                isTabloid && 'text-black/70 font-semibold uppercase tracking-[0.12em]',
              )}
            >
              Configure the combo engine, visual FX, and per-combo authorisations for this profile.
            </p>

            <div className={cn('flex flex-col gap-4 md:flex-row md:items-center md:justify-between', isTabloid && 'gap-6')}>
              <div className={cn('flex items-center gap-3', isTabloid && 'border border-black/10 bg-white/70 px-4 py-3')}>
                <Switch
                  checked={comboSettingsState.enabled}
                  onCheckedChange={checked => applyComboSettings({ enabled: checked })}
                />
                <span className={cn('text-sm text-newspaper-text font-medium', isTabloid && 'text-xs font-black uppercase tracking-[0.2em] text-black')}>
                  Enable combo engine
                </span>
              </div>

              <div className={cn('flex items-center gap-3', isTabloid && 'border border-black/10 bg-white/70 px-4 py-3')}>
                <Switch
                  checked={comboSettingsState.fxEnabled}
                  onCheckedChange={checked => applyComboSettings({ fxEnabled: checked })}
                  disabled={!comboSettingsState.enabled}
                />
                <span className={cn('text-sm text-newspaper-text font-medium', isTabloid && 'text-xs font-black uppercase tracking-[0.2em] text-black')}>
                  FX notifications ({comboSettingsState.fxEnabled ? 'on' : 'off'})
                </span>
              </div>
            </div>

            <div className="mt-4">
              <label className={formLabelClass}>
                Max combos per turn: {comboSettingsState.maxCombosPerTurn}
              </label>
              <Slider
                value={[comboSettingsState.maxCombosPerTurn]}
                onValueChange={([value]) => applyComboSettings({ maxCombosPerTurn: value })}
                min={1}
                max={5}
                step={1}
                className="w-full"
                disabled={!comboSettingsState.enabled}
              />
            </div>

            <ScrollArea className="mt-4 h-64 pr-2">
              <div className={cn('space-y-4', isTabloid && 'space-y-5')}>
                {comboGroups.map(group => (
                  <div key={group.category}>
                    <div
                      className={cn(
                        'text-xs font-semibold uppercase tracking-wide text-newspaper-text/70',
                        isTabloid && 'text-black/70 tracking-[0.25em] font-black',
                      )}
                    >
                      {group.label}
                    </div>
                    <div className={cn('mt-2 space-y-3', isTabloid && 'space-y-4')}>
                      {group.combos.map(combo => {
                        const enabled = comboSettingsState.comboToggles[combo.id] ?? true;
                        const rewardLabel = combo.reward;
                        return (
                          <div
                            key={combo.id}
                            className={cn(
                              'rounded-md border border-newspaper-text/40 bg-white/70 p-3 shadow-sm',
                              isTabloid && 'rounded-none border-black bg-white shadow-[4px_4px_0_rgba(0,0,0,0.25)]',
                            )}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className={cn('font-semibold text-newspaper-text', isTabloid && 'text-black uppercase tracking-[0.08em]')}>
                                  {combo.name}
                                </div>
                                <div className={cn('text-xs text-newspaper-text/70', isTabloid && 'text-black/70 uppercase tracking-[0.06em]')}>
                                  {combo.description}
                                </div>
                                {rewardLabel ? (
                                  <div className={cn('mt-1 text-xs font-semibold text-newspaper-text/80', isTabloid && 'text-black/80 uppercase tracking-[0.06em]')}>
                                    Reward: {rewardLabel}
                                    {typeof combo.cap === 'number' ? ` (cap ${combo.cap})` : ''}
                                  </div>
                                ) : null}
                                {combo.fxText ? (
                                  <div className={cn('text-[11px] italic text-newspaper-text/60', isTabloid && 'text-black/60 uppercase tracking-[0.05em] not-italic font-semibold')}>
                                    FX: {combo.fxText}
                                  </div>
                                ) : null}
                              </div>
                              <Switch
                                checked={enabled}
                                onCheckedChange={checked =>
                                  applyComboSettings({ comboToggles: { [combo.id]: checked } })
                                }
                                disabled={!comboSettingsState.enabled}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </Card>
        </div>

        <div className={cn(isTabloid && 'px-6 sm:px-10')}>
          <Card className={cn(panelCardClass, 'mt-6')}>
          <h3 className={sectionTitleClass}>🎮 MISSION CONTROL</h3>
          <div className={cn('grid md:grid-cols-4 gap-4', isTabloid && 'gap-6')}>
            {onSaveGame && (
              <Button
                onClick={handleSaveGame}
                className={cn(
                  isTabloid
                    ? `${buttonBaseClass} bg-[#14532d] text-white hover:bg-[#166534] px-6 py-3 text-xs`
                    : 'bg-green-700 hover:bg-green-600 text-white border-green-600',
                )}
              >
                💾 SAVE GAME
              </Button>
            )}
            <Button
              onClick={resetToDefaults}
              variant="outline"
              className={cn(
                isTabloid
                  ? `${buttonBaseClass} bg-[#fef08a] text-black hover:bg-[#fde68a] px-6 py-3 text-xs`
                  : 'border-yellow-600 text-yellow-600 hover:bg-yellow-600/10',
              )}
            >
              🔄 RESET DEFAULTS
            </Button>
            {onBackToMainMenu && (
              <Button
                onClick={() => {
                  if (settings.confirmActions) {
                    if (confirm('Return to main menu? Unsaved progress will be lost.')) {
                      onBackToMainMenu();
                    }
                  } else {
                    onBackToMainMenu();
                  }
                }}
                variant="outline"
                className={cn(
                  isTabloid
                    ? `${buttonBaseClass} bg-[#fee2e2] text-[#991b1b] hover:bg-[#fecaca] px-6 py-3 text-xs`
                    : 'border-red-600 text-red-600 hover:bg-red-600/10',
                )}
              >
                🏠 MAIN MENU
              </Button>
            )}
            <Button
              onClick={() => {
                const exportPayload = { ...settings, comboSettings: comboSettingsState };
                navigator.clipboard?.writeText(JSON.stringify(exportPayload, null, 2));
                const exportIndicator = document.createElement('div');
                exportIndicator.textContent = '📋 Settings copied to clipboard';
                exportIndicator.className = 'fixed top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded z-[60] animate-fade-in';
                document.body.appendChild(exportIndicator);
                setTimeout(() => exportIndicator.remove(), 2000);
              }}
              variant="outline"
              className={cn(
                isTabloid
                  ? `${buttonBaseClass} bg-[#bfdbfe] text-[#1d4ed8] hover:bg-[#bfdbfe]/80 px-6 py-3 text-xs`
                  : 'border-blue-600 text-blue-600 hover:bg-blue-600/10',
              )}
            >
              📤 EXPORT
            </Button>
          </div>
        </Card>

          <Card className={cn(panelCardClass, 'mt-6')}>
          <h3 className={sectionTitleClass}>⌨️ COVERT OPERATIONS MANUAL</h3>
          <div className={cn('grid md:grid-cols-2 gap-4 text-sm text-newspaper-text', isTabloid && 'gap-6 text-black font-black uppercase tracking-[0.15em]')}>
            <div className={cn(isTabloid && 'space-y-2')}>
              <div className={cn('font-mono', isTabloid && 'font-black text-black tracking-[0.2em] uppercase')}>SPACE - Go To Press</div>
              <div className={cn('font-mono', isTabloid && 'font-black text-black tracking-[0.2em] uppercase')}>T - Select Card</div>
              <div className={cn('font-mono', isTabloid && 'font-black text-black tracking-[0.2em] uppercase')}>U - View Upgrades</div>
              <div className={cn('font-mono', isTabloid && 'font-black text-black tracking-[0.2em] uppercase')}>S - View Statistics</div>
            </div>
            <div className={cn(isTabloid && 'space-y-2')}>
              <div className={cn('font-mono', isTabloid && 'font-black text-black tracking-[0.2em] uppercase')}>Q - Quick Save</div>
              <div className={cn('font-mono', isTabloid && 'font-black text-black tracking-[0.2em] uppercase')}>L - Quick Load</div>
              <div className={cn('font-mono', isTabloid && 'font-black text-black tracking-[0.2em] uppercase')}>ESC - Pause/Menu</div>
              <div className={cn('font-mono', isTabloid && 'font-black text-black tracking-[0.2em] uppercase')}>F11 - Fullscreen</div>
            </div>
          </div>
        </Card>

          <div
            className={cn(
              'mt-8 text-center text-xs text-newspaper-text/60',
              isTabloid && 'text-black font-black uppercase tracking-[0.2em] space-y-2',
            )}
          >
          <div className={cn('mb-2', isTabloid && 'mb-0')}>CONFIDENTIAL: Settings are automatically saved</div>
          <div>Changes take effect immediately</div>
          <div className={cn('mt-2 text-red-600 font-bold', isTabloid && 'text-black bg-yellow-200 inline-block px-3 py-1 border-2 border-black shadow-[4px_4px_0_rgba(0,0,0,0.25)]')}>
            [CLASSIFIED] - Security Clearance: ULTRA BLACK
          </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Options;
