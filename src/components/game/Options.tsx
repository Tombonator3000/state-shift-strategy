import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { AudioControls } from '@/components/ui/audio-controls';
import { useAudioContext } from '@/contexts/AudioContext';
import { useState, useEffect, useMemo } from 'react';
import { DRAW_MODE_CONFIGS, type DrawMode } from '@/data/cardDrawingSystem';
import { useUiTheme, type UiTheme } from '@/hooks/useTheme';
import type { Difficulty } from '@/ai';
import { getDifficulty, setDifficultyFromLabel } from '@/state/settings';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import type { GameCard } from '@/rules/mvp';
import { EXPANSION_MANIFEST } from '@/data/expansions';
import {
  getExpansionCardsSnapshot,
  getStoredExpansionIds,
  subscribeToExpansionChanges,
  updateEnabledExpansions,
} from '@/data/expansions/state';

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

const EXPANSION_ID_SET = new Set(EXPANSION_MANIFEST.map(pack => pack.id));

const summarizeExpansionCards = (cards: GameCard[]): Record<string, number> => {
  const counts: Record<string, number> = {};
  cards.forEach(card => {
    const extId = card.extId;
    if (!extId || !EXPANSION_ID_SET.has(extId)) {
      return;
    }
    counts[extId] = (counts[extId] ?? 0) + 1;
  });
  return counts;
};

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
}

const Options = ({ onClose, onBackToMainMenu, onSaveGame }: OptionsProps) => {
  const audio = useAudioContext();
  const [uiTheme, setUiTheme] = useUiTheme();
  const [enabledExpansions, setEnabledExpansions] = useState<string[]>(() => getStoredExpansionIds());
  const [expansionCounts, setExpansionCounts] = useState<Record<string, number>>(() =>
    summarizeExpansionCards(getExpansionCardsSnapshot()),
  );
  const [expansionLoading, setExpansionLoading] = useState(false);
  const [expansionError, setExpansionError] = useState<string | null>(null);

  const [settings, setSettings] = useState<GameSettings>(() => {
    // Initialize settings from audio system and localStorage
    const savedSettings = localStorage.getItem('gameSettings');
    const defaultDifficultyLabel = (() => {
      try {
        return DIFFICULTY_LABELS[getDifficulty()];
      } catch {
        return DIFFICULTY_LABELS.NORMAL;
      }
    })();

    const baseSettings: GameSettings = {
      masterVolume: Math.round(audio.config.volume * 100),
      musicVolume: 50,
      sfxVolume: 80,
      enableAnimations: true,
      autoEndTurn: false,
      fastMode: false,
      showTooltips: true,
      enableKeyboardShortcuts: true,
      difficulty: defaultDifficultyLabel,
      screenShake: true,
      confirmActions: true,
      drawMode: 'standard',
      uiTheme: uiTheme,
    };

    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        const difficultyLabel = resolveStoredDifficultyLabel(parsed?.difficulty);
        const mergedSettings = { ...baseSettings, ...parsed, difficulty: difficultyLabel };
        setDifficultyFromLabel(difficultyLabel);
        return mergedSettings;
      } catch (error) {
        console.error('Failed to parse saved settings:', error);
        setDifficultyFromLabel(baseSettings.difficulty);
      }
    } else {
      setDifficultyFromLabel(baseSettings.difficulty);
    }

    return baseSettings;
  });

  const expansionTotal = useMemo(
    () => Object.values(expansionCounts).reduce((sum, value) => sum + value, 0),
    [expansionCounts],
  );

  // Load settings from localStorage on component mount - remove to prevent re-initialization
  // Settings are now loaded in useState initializer above

  // Update audio volume when master volume changes - but avoid infinite loops
  useEffect(() => {
    const currentAudioVolume = Math.round(audio.config.volume * 100);
    if (currentAudioVolume !== settings.masterVolume) {
      console.log('🎵 Options: Syncing volume from', currentAudioVolume, 'to', settings.masterVolume);
      audio.setVolume(settings.masterVolume / 100);
    }
  }, [settings.masterVolume]); // Remove 'audio' from dependencies to prevent loops

  useEffect(() => {
    const unsubscribe = subscribeToExpansionChanges(({ ids, cards }) => {
      setEnabledExpansions(ids);
      setExpansionCounts(summarizeExpansionCards(cards));
    });
    return unsubscribe;
  }, []);

  // Save settings to localStorage whenever they change
  const updateSettings = (newSettings: Partial<GameSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    if (newSettings.difficulty) {
      setDifficultyFromLabel(newSettings.difficulty);
    }
    localStorage.setItem('gameSettings', JSON.stringify(updatedSettings));
  };

  const resetToDefaults = () => {
    const defaultSettings: GameSettings = {
      masterVolume: 70,
      musicVolume: 50,
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
    };
    setSettings(defaultSettings);
    setDifficultyFromLabel(defaultSettings.difficulty);
    localStorage.setItem('gameSettings', JSON.stringify(defaultSettings));
    setUiTheme('tabloid_bw');
  };

  const handleExpansionToggle = async (expansionId: string) => {
    setExpansionError(null);
    const nextIds = enabledExpansions.includes(expansionId)
      ? enabledExpansions.filter(id => id !== expansionId)
      : [...enabledExpansions, expansionId];
    setEnabledExpansions(nextIds);
    setExpansionLoading(true);
    try {
      const cards = await updateEnabledExpansions(nextIds);
      setExpansionCounts(summarizeExpansionCards(cards));
    } catch (error) {
      console.error('Failed to update expansions:', error);
      setExpansionError('Failed to update expansions. Please try again.');
    } finally {
      setExpansionLoading(false);
    }
  };

  const handleSaveGame = () => {
    const success = onSaveGame?.();
    if (success) {
      // Show confirmation
      const savedIndicator = document.createElement('div');
      savedIndicator.textContent = '✓ GAME SAVED';
      savedIndicator.className = 'fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded z-[60] animate-fade-in';
      document.body.appendChild(savedIndicator);
      setTimeout(() => savedIndicator.remove(), 2000);
    } else {
      // Show error
      const errorIndicator = document.createElement('div');
      errorIndicator.textContent = '❌ SAVE FAILED';
      errorIndicator.className = 'fixed top-4 right-4 bg-red-600 text-white px-4 py-2 rounded z-[60] animate-fade-in';
      document.body.appendChild(errorIndicator);
      setTimeout(() => errorIndicator.remove(), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-newspaper-bg flex items-center justify-center p-8 relative overflow-hidden">
      {/* Redacted background pattern */}
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

      <Card className="max-w-4xl w-full p-8 bg-newspaper-bg border-4 border-newspaper-text animate-redacted-reveal relative" style={{ fontFamily: 'serif' }}>
        {/* Classified stamps */}
        <div className="absolute top-4 right-4 text-red-600 font-mono text-xs transform rotate-12 border-2 border-red-600 p-2">
          TOP SECRET
        </div>
        <div className="absolute bottom-4 left-4 text-red-600 font-mono text-xs transform -rotate-12 border-2 border-red-600 p-2">
          EYES ONLY
        </div>

        {/* Back button */}
        <Button 
          onClick={onClose}
          variant="outline" 
          className="absolute top-4 left-4 border-newspaper-text text-newspaper-text hover:bg-newspaper-text/10"
        >
          ← BACK
        </Button>

        <div className="text-center mb-8 mt-8">
          <h1 className="text-4xl font-bold text-newspaper-text mb-4">
            CLASSIFIED OPTIONS
          </h1>
          <div className="text-sm text-newspaper-text/80 mb-4">
            Configure your conspiracy experience
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Audio Settings */}
          <Card className="p-6 border-2 border-newspaper-text bg-newspaper-bg">
            <h3 className="font-bold text-xl text-newspaper-text mb-4 flex items-center">
              🔊 AUDIO SURVEILLANCE
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-newspaper-text mb-2 block">
                  Master Volume: {settings.masterVolume}%
                </label>
                <Slider
                  value={[settings.masterVolume]}
                  onValueChange={([value]) => updateSettings({ masterVolume: value })}
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
                  onValueChange={([value]) => updateSettings({ sfxVolume: value })}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Enhanced Audio Controls */}
              <div className="border-t border-newspaper-text/20 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-newspaper-text">
                    Advanced Audio Controls
                  </label>
                  <AudioControls
                    volume={audio.config.volume}
                    muted={audio.config.muted}
                    musicEnabled={audio.config.musicEnabled}
                    sfxEnabled={audio.config.sfxEnabled}
                    isPlaying={audio.isPlaying}
                    currentTrackName={audio.currentTrackName}
                    audioStatus={audio.audioStatus}
                    tracksLoaded={audio.tracksLoaded}
                    audioContextUnlocked={audio.audioContextUnlocked}
                    onVolumeChange={audio.setVolume}
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

          {/* Gameplay Settings */}
          <Card className="p-6 border-2 border-newspaper-text bg-newspaper-bg">
            <h3 className="font-bold text-xl text-newspaper-text mb-4 flex items-center">
              ⚙️ OPERATION PARAMETERS
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-newspaper-text">
                  Enable Animations
                </label>
                <Switch
                  checked={settings.enableAnimations}
                  onCheckedChange={(checked) => updateSettings({ enableAnimations: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-newspaper-text">
                  Auto End Turn
                </label>
                <Switch
                  checked={settings.autoEndTurn}
                  onCheckedChange={(checked) => updateSettings({ autoEndTurn: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-newspaper-text">
                  Fast Mode
                </label>
                <Switch
                  checked={settings.fastMode}
                  onCheckedChange={(checked) => updateSettings({ fastMode: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-newspaper-text">
                  Show Tooltips
                </label>
                <Switch
                  checked={settings.showTooltips}
                  onCheckedChange={(checked) => updateSettings({ showTooltips: checked })}
                />
              </div>

               <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-newspaper-text">
                  Keyboard Shortcuts
                </label>
                <Switch
                  checked={settings.enableKeyboardShortcuts}
                  onCheckedChange={(checked) => updateSettings({ enableKeyboardShortcuts: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-newspaper-text">
                  Screen Shake Effects
                </label>
                <Switch
                  checked={settings.screenShake}
                  onCheckedChange={(checked) => updateSettings({ screenShake: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-newspaper-text">
                  Confirm Destructive Actions
                </label>
                <Switch
                  checked={settings.confirmActions}
                  onCheckedChange={(checked) => updateSettings({ confirmActions: checked })}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-newspaper-text mb-2 block">
                  Difficulty Level
                </label>
                <select
                  value={settings.difficulty}
                  onChange={(e) => updateSettings({ difficulty: e.target.value as DifficultyLabel })}
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
                <label className="text-sm font-medium text-newspaper-text mb-2 block">
                  Card Draw Mode
                </label>
                <select 
                  value={settings.drawMode}
                  onChange={(e) => updateSettings({ drawMode: e.target.value as DrawMode })}
                  className="w-full p-2 border border-newspaper-text bg-newspaper-bg text-newspaper-text rounded mb-2"
                >
                  {Object.entries(DRAW_MODE_CONFIGS).map(([key, config]) => (
                    <option key={key} value={key}>
                      {config.name.toUpperCase()} - {config.description}
                    </option>
                  ))}
                </select>
                <div className="text-xs text-newspaper-text/70 space-y-1">
                  {(DRAW_MODE_CONFIGS[settings.drawMode] || DRAW_MODE_CONFIGS.standard).specialRules.map((rule, i) => (
                    <div key={i}>• {rule}</div>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-newspaper-text mb-2 block">
                  UI Theme
                </label>
                <select 
                  value={uiTheme}
                  onChange={(e) => {
                    const newTheme = e.target.value as UiTheme;
                    setUiTheme(newTheme);
                    updateSettings({ uiTheme: newTheme });
                  }}
                  className="w-full p-2 border border-newspaper-text bg-newspaper-bg text-newspaper-text rounded"
                >
                  <option value="tabloid_bw">TABLOID (Black & White)</option>
                  <option value="government_classic">GOVERNMENT CLASSIC (Legacy Layout)</option>
                </select>
                <div className="text-xs text-newspaper-text/70 mt-1">
                  Changes the visual appearance of menus and screens
                </div>
              </div>
        </div>
      </Card>
    </div>

    <Card className="mt-6 p-6 border-2 border-newspaper-text bg-newspaper-bg">
      <h3 className="font-bold text-xl text-newspaper-text mb-4 flex items-center">
        🧪 EXPANSION CONTENT
      </h3>
      <div className="text-sm text-newspaper-text/80 mb-4">
        Enable MVP-safe expansion packs. Selections are stored locally and applied to new decks.
      </div>
      <div className="space-y-3">
        {EXPANSION_MANIFEST.map(pack => {
          const enabled = enabledExpansions.includes(pack.id);
          const cardCount = expansionCounts[pack.id] ?? 0;
          return (
            <div
              key={pack.id}
              className="flex items-center justify-between border border-newspaper-text/20 rounded px-3 py-2"
            >
              <div>
                <div className="font-semibold text-newspaper-text">{pack.title}</div>
                <div className="text-xs text-newspaper-text/70">
                  {enabled ? 'Active in deck construction.' : 'Disabled — excluded from decks.'}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline">{cardCount} cards</Badge>
                <Checkbox
                  checked={enabled}
                  onCheckedChange={() => handleExpansionToggle(pack.id)}
                  disabled={expansionLoading}
                  aria-label={`Toggle ${pack.title}`}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-3 text-xs text-newspaper-text/70 space-y-1">
        <div>Total expansion cards loaded: {expansionTotal}</div>
        {expansionError && <div className="text-red-600">{expansionError}</div>}
        {expansionLoading && <div>Updating expansion pool…</div>}
        <div>Only ATTACK, MEDIA, and ZONE cards that pass MVP validation are imported.</div>
      </div>
    </Card>

    {/* Game Actions */}
    <Card className="mt-6 p-6 border-2 border-newspaper-text bg-newspaper-bg">
      <h3 className="font-bold text-xl text-newspaper-text mb-4 flex items-center">
        🎮 MISSION CONTROL
      </h3>
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
                navigator.clipboard?.writeText(JSON.stringify(settings, null, 2));
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

        {/* Keyboard Shortcuts Reference */}
        <Card className="mt-6 p-6 border-2 border-newspaper-text bg-newspaper-bg">
          <h3 className="font-bold text-xl text-newspaper-text mb-4 flex items-center">
            ⌨️ COVERT OPERATIONS MANUAL
          </h3>
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

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-newspaper-text/60">
          <div className="mb-2">CONFIDENTIAL: Settings are automatically saved</div>
          <div>Changes take effect immediately</div>
          <div className="mt-2 text-red-600 font-bold">
            [CLASSIFIED] - Security Clearance: ULTRA BLACK
          </div>
        </div>
      </Card>
    </div>
  );
};

// Enhanced audio system with comprehensive controls
export default Options;