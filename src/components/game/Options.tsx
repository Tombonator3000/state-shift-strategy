import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { AudioControls } from '@/components/ui/audio-controls';
import { useAudioContext } from '@/contexts/AudioContext';
import { useState, useEffect } from 'react';
import { DRAW_MODE_CONFIGS, type DrawMode } from '@/data/cardDrawingSystem';

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
  difficulty: 'easy' | 'normal' | 'hard';
  screenShake: boolean;
  confirmActions: boolean;
  drawMode: 'standard' | 'classic' | 'momentum' | 'catchup' | 'fast';
}

const Options = ({ onClose, onBackToMainMenu, onSaveGame }: OptionsProps) => {
  const audio = useAudioContext();

  const [settings, setSettings] = useState<GameSettings>(() => {
    // Initialize settings from audio system and localStorage
    const savedSettings = localStorage.getItem('gameSettings');
    const baseSettings = {
      masterVolume: Math.round(audio.config.volume * 100),
      musicVolume: 50,
      sfxVolume: 80,
      enableAnimations: true,
      autoEndTurn: false,
      fastMode: false,
      showTooltips: true,
      enableKeyboardShortcuts: true,
      difficulty: 'normal' as const,
      screenShake: true,
      confirmActions: true,
      drawMode: 'standard' as const,
    };
    
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        return { ...baseSettings, ...parsed };
      } catch (error) {
        console.error('Failed to parse saved settings:', error);
      }
    }
    
    return baseSettings;
  });

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

  // Save settings to localStorage whenever they change
  const updateSettings = (newSettings: Partial<GameSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
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
      difficulty: 'normal',
      screenShake: true,
      confirmActions: true,
      drawMode: 'standard',
    };
    setSettings(defaultSettings);
    localStorage.setItem('gameSettings', JSON.stringify(defaultSettings));
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
                  Background Music: {settings.musicVolume}%
                </label>
                <Slider
                  value={[settings.musicVolume]}
                  onValueChange={([value]) => updateSettings({ musicVolume: value })}
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
                  onChange={(e) => updateSettings({ difficulty: e.target.value as 'easy' | 'normal' | 'hard' })}
                  className="w-full p-2 border border-newspaper-text bg-newspaper-bg text-newspaper-text rounded"
                >
                  <option value="easy">EASY - Intelligence Leak</option>
                  <option value="normal">NORMAL - Classified</option>
                  <option value="hard">HARD - Top Secret</option>
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
            </div>
          </Card>
        </div>

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