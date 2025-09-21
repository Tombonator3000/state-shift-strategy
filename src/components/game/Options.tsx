import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AudioControls } from '@/components/ui/audio-controls';
import { useAudioContext } from '@/contexts/AudioContext';
import { DRAW_MODE_CONFIGS, type DrawMode } from '@/data/cardDrawingSystem';
import { useUiTheme, type UiTheme } from '@/hooks/useTheme';
import type { Difficulty } from '@/ai';
import { getDifficulty, setDifficultyFromLabel } from '@/state/settings';
import { COMBO_DEFINITIONS, DEFAULT_COMBO_SETTINGS } from '@/game/combo.config';
import { formatComboReward, getComboSettings, setComboSettings } from '@/game/comboEngine';
import type { ComboCategory, ComboSettings } from '@/game/combo.types';

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
  drawMode: 'standard' | 'classic' | 'momentum' | 'catchup' | 'fast';
  uiTheme: 'tabloid_bw' | 'government_classic';
  paranormalEffectsEnabled: boolean;
}

const Options = ({ onClose, onBackToMainMenu, onSaveGame }: OptionsProps) => {
  const audio = useAudioContext();
  const [uiTheme, setUiTheme] = useUiTheme();
  const { volume: audioMasterVolume } = audio.config;

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
      drawMode: 'standard',
      uiTheme,
      paranormalEffectsEnabled: false,
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
        };

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
    if (typeof newSettings.masterVolume === 'number') {
      masterVolumeUpdateSource.current = 'settings';
    }

    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
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
      paranormalEffectsEnabled: false,
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

  return (
    <div className="min-h-screen bg-newspaper-bg flex items-center justify-center p-8 relative overflow-hidden">
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

      <Card
        className="max-w-4xl w-full p-8 bg-newspaper-bg border-4 border-newspaper-text animate-redacted-reveal relative"
        style={{ fontFamily: 'serif' }}
      >
        <div className="absolute top-4 right-4 text-red-600 font-mono text-xs transform rotate-12 border-2 border-red-600 p-2">
          TOP SECRET
        </div>
        <div className="absolute bottom-4 left-4 text-red-600 font-mono text-xs transform -rotate-12 border-2 border-red-600 p-2">
          EYES ONLY
        </div>

        <Button
          onClick={onClose}
          variant="outline"
          className="absolute top-4 left-4 border-newspaper-text text-newspaper-text hover:bg-newspaper-text/10"
        >
          ← BACK
        </Button>

        <div className="text-center mb-8 mt-8">
          <h1 className="text-4xl font-bold text-newspaper-text mb-4">CLASSIFIED OPTIONS</h1>
          <div className="text-sm text-newspaper-text/80 mb-4">Configure your conspiracy experience</div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="p-6 border-2 border-newspaper-text bg-newspaper-bg">
            <h3 className="font-bold text-xl text-newspaper-text mb-4 flex items-center">🔊 AUDIO SURVEILLANCE</h3>

            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-newspaper-text mb-2 block">
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
                <label className="text-sm font-medium text-newspaper-text mb-2 block">
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
                <label className="text-sm font-medium text-newspaper-text mb-2 block">
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

              <div className="border-t border-newspaper-text/20 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-newspaper-text">Advanced Audio Controls</label>
                  <AudioControls
                    volume={settings.masterVolume / 100}
                    musicVolume={audio.config.musicVolume}
                    muted={audio.config.muted}
                    musicEnabled={audio.config.musicEnabled}
                    sfxEnabled={audio.config.sfxEnabled}
                    isPlaying={audio.isPlaying}
                    currentTrackName={audio.currentTrackName}
                    audioStatus={audio.audioStatus}
                    tracksLoaded={audio.tracksLoaded}
                    audioContextUnlocked={audio.audioContextUnlocked}
                    onVolumeChange={handleMasterVolumeChange}
                    onMusicVolumeChange={audio.setMusicVolume}
                    onToggleMute={audio.toggleMute}
                    onToggleMusic={audio.toggleMusic}
                    onToggleSFX={audio.toggleSFX}
                    onPlayMusic={() => {
                      console.log('🎵 Play button clicked');
                      audio.playMusic();
                    }}
                    onPauseMusic={() => {
                      console.log('🎵 Pause button clicked');
                      audio.pauseMusic();
                    }}
                    onStopMusic={() => {
                      console.log('🎵 Stop button clicked');
                      audio.stopMusic();
                    }}
                    onTestSFX={() => {
                      console.log('🎵 Test SFX button clicked');
                      audio.testSFX();
                    }}
                  />
                </div>
                <div className="text-xs text-newspaper-text/70">
                  Use the settings icon above for play/pause/stop controls, SFX testing, and real-time audio debugging.
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-2 border-newspaper-text bg-newspaper-bg">
            <h3 className="font-bold text-xl text-newspaper-text mb-4 flex items-center">⚙️ OPERATION PARAMETERS</h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-newspaper-text">Enable Animations</label>
                <Switch
                  checked={settings.enableAnimations}
                  onCheckedChange={checked => updateSettings({ enableAnimations: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-newspaper-text">Auto End Turn</label>
                <Switch
                  checked={settings.autoEndTurn}
                  onCheckedChange={checked => updateSettings({ autoEndTurn: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-newspaper-text">Fast Mode</label>
                <Switch checked={settings.fastMode} onCheckedChange={checked => updateSettings({ fastMode: checked })} />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-newspaper-text">Show Tooltips</label>
                <Switch
                  checked={settings.showTooltips}
                  onCheckedChange={checked => updateSettings({ showTooltips: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-newspaper-text">Keyboard Shortcuts</label>
                <Switch
                  checked={settings.enableKeyboardShortcuts}
                  onCheckedChange={checked => updateSettings({ enableKeyboardShortcuts: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-newspaper-text">Screen Shake Effects</label>
                <Switch
                  checked={settings.screenShake}
                  onCheckedChange={checked => updateSettings({ screenShake: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-newspaper-text">Paranormal Overlays &amp; Sightings</label>
                <Switch
                  checked={settings.paranormalEffectsEnabled}
                  onCheckedChange={checked => updateSettings({ paranormalEffectsEnabled: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-newspaper-text">Confirm Destructive Actions</label>
                <Switch
                  checked={settings.confirmActions}
                  onCheckedChange={checked => updateSettings({ confirmActions: checked })}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-newspaper-text mb-2 block">Difficulty Level</label>
                <select
                  value={settings.difficulty}
                  onChange={event => updateSettings({ difficulty: event.target.value as DifficultyLabel })}
                  className="w-full p-2 border border-newspaper-text bg-newspaper-bg text-newspaper-text rounded"
                >
                  {DIFFICULTY_OPTIONS.map(option => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-newspaper-text mb-2 block">Card Draw Mode</label>
                <select
                  value={settings.drawMode}
                  onChange={event => updateSettings({ drawMode: event.target.value as DrawMode })}
                  className="w-full p-2 border border-newspaper-text bg-newspaper-bg text-newspaper-text rounded mb-2"
                >
                  {Object.entries(DRAW_MODE_CONFIGS).map(([key, config]) => (
                    <option key={key} value={key}>
                      {config.name.toUpperCase()} - {config.description}
                    </option>
                  ))}
                </select>
                <div className="text-xs text-newspaper-text/70 space-y-1">
                  {(DRAW_MODE_CONFIGS[settings.drawMode] || DRAW_MODE_CONFIGS.standard).specialRules.map((rule, index) => (
                    <div key={index}>• {rule}</div>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-newspaper-text mb-2 block">UI Theme</label>
                <select
                  value={uiTheme}
                  onChange={event => {
                    const newTheme = event.target.value as UiTheme;
                    setUiTheme(newTheme);
                    updateSettings({ uiTheme: newTheme });
                  }}
                  className="w-full p-2 border border-newspaper-text bg-newspaper-bg text-newspaper-text rounded"
                >
                  <option value="tabloid_bw">TABLOID (Black &amp; White)</option>
                  <option value="government_classic">GOVERNMENT CLASSIC (Legacy Layout)</option>
                </select>
                <div className="text-xs text-newspaper-text/70 mt-1">Changes the visual appearance of menus and screens</div>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-2 border-newspaper-text bg-newspaper-bg md:col-span-2">
            <h3 className="font-bold text-xl text-newspaper-text mb-2 flex items-center">⚡ COMBO PROTOCOLS</h3>
            <p className="text-sm text-newspaper-text/80 mb-4">
              Configure the combo engine, visual FX, and per-combo authorisations for this profile.
            </p>

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <Switch
                  checked={comboSettingsState.enabled}
                  onCheckedChange={checked => applyComboSettings({ enabled: checked })}
                />
                <span className="text-sm text-newspaper-text font-medium">Enable combo engine</span>
              </div>

              <div className="flex items-center gap-3">
                <Switch
                  checked={comboSettingsState.fxEnabled}
                  onCheckedChange={checked => applyComboSettings({ fxEnabled: checked })}
                  disabled={!comboSettingsState.enabled}
                />
                <span className="text-sm text-newspaper-text font-medium">
                  FX notifications ({comboSettingsState.fxEnabled ? 'on' : 'off'})
                </span>
              </div>
            </div>

            <div className="mt-4">
              <label className="text-sm font-medium text-newspaper-text mb-2 block">
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
              <div className="space-y-4">
                {comboGroups.map(group => (
                  <div key={group.category}>
                    <div className="text-xs font-semibold uppercase tracking-wide text-newspaper-text/70">
                      {group.label}
                    </div>
                    <div className="mt-2 space-y-3">
                      {group.combos.map(combo => {
                        const enabled = comboSettingsState.comboToggles[combo.id] ?? true;
                        const rewardLabel = combo.reward;
                        return (
                          <div
                            key={combo.id}
                            className="rounded-md border border-newspaper-text/40 bg-white/70 p-3 shadow-sm"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className="font-semibold text-newspaper-text">{combo.name}</div>
                                <div className="text-xs text-newspaper-text/70">{combo.description}</div>
                                {rewardLabel ? (
                                  <div className="mt-1 text-xs font-semibold text-newspaper-text/80">
                                    Reward: {rewardLabel}
                                    {typeof combo.cap === 'number' ? ` (cap ${combo.cap})` : ''}
                                  </div>
                                ) : null}
                                {combo.fxText ? (
                                  <div className="text-[11px] italic text-newspaper-text/60">FX: {combo.fxText}</div>
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

        <Card className="mt-6 p-6 border-2 border-newspaper-text bg-newspaper-bg">
          <h3 className="font-bold text-xl text-newspaper-text mb-4 flex items-center">🎮 MISSION CONTROL</h3>
          <div className="grid md:grid-cols-4 gap-4">
            {onSaveGame && (
              <Button
                onClick={handleSaveGame}
                className="bg-green-700 hover:bg-green-600 text-white border-green-600"
              >
                💾 SAVE GAME
              </Button>
            )}
            <Button
              onClick={resetToDefaults}
              variant="outline"
              className="border-yellow-600 text-yellow-600 hover:bg-yellow-600/10"
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
                className="border-red-600 text-red-600 hover:bg-red-600/10"
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
              className="border-blue-600 text-blue-600 hover:bg-blue-600/10"
            >
              📤 EXPORT
            </Button>
          </div>
        </Card>

        <Card className="mt-6 p-6 border-2 border-newspaper-text bg-newspaper-bg">
          <h3 className="font-bold text-xl text-newspaper-text mb-4 flex items-center">⌨️ COVERT OPERATIONS MANUAL</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-newspaper-text">
            <div>
              <div className="font-mono">SPACE - End Turn</div>
              <div className="font-mono">T - Select Card</div>
              <div className="font-mono">U - View Upgrades</div>
              <div className="font-mono">S - View Statistics</div>
            </div>
            <div>
              <div className="font-mono">Q - Quick Save</div>
              <div className="font-mono">L - Quick Load</div>
              <div className="font-mono">ESC - Pause/Menu</div>
              <div className="font-mono">F11 - Fullscreen</div>
            </div>
          </div>
        </Card>

        <div className="mt-8 text-center text-xs text-newspaper-text/60">
          <div className="mb-2">CONFIDENTIAL: Settings are automatically saved</div>
          <div>Changes take effect immediately</div>
          <div className="mt-2 text-red-600 font-bold">[CLASSIFIED] - Security Clearance: ULTRA BLACK</div>
        </div>
      </Card>
    </div>
  );
};

export default Options;
