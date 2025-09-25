import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Settings, FileText, Save, Upload, HelpCircle, Volume2, RotateCw, Home } from 'lucide-react';
import { AudioControls } from '@/components/ui/audio-controls';
import { useAudioContext } from '@/contexts/AudioContext';
import HowToPlay from './HowToPlay';
import ExpansionControl from '@/components/expansions/ExpansionControl';

interface InGameOptionsProps {
  onClose: () => void;
  onSaveGame?: () => boolean;
  onLoadGame?: () => boolean;
  onBackToMainMenu?: () => void;
  getSaveInfo?: () => any;
  gameStats?: {
    round: number;
    faction: string;
    ip: number;
    truth: number;
    controlledStates: number;
  };
}

const InGameOptions = ({ 
  onClose, 
  onSaveGame, 
  onLoadGame, 
  onBackToMainMenu, 
  getSaveInfo,
  gameStats 
}: InGameOptionsProps) => {
  const [activeTab, setActiveTab] = useState<'main' | 'howtoplay' | 'expansions'>('main');
  const audio = useAudioContext();

  if (activeTab === 'howtoplay') {
    return <HowToPlay onClose={() => setActiveTab('main')} />;
  }

  if (activeTab === 'expansions') {
    return <ExpansionControl onClose={() => setActiveTab('main')} />;
  }

  const handleSaveGame = () => {
    if (onSaveGame) {
      const success = onSaveGame();
      const indicator = document.createElement('div');
      indicator.textContent = success ? '✓ GAME SAVED' : '❌ SAVE FAILED';
      indicator.className = `fixed top-4 right-4 ${success ? 'bg-green-600' : 'bg-red-600'} text-white px-4 py-2 rounded z-[70] animate-fade-in`;
      document.body.appendChild(indicator);
      setTimeout(() => indicator.remove(), 2000);
    }
  };

  const handleLoadGame = () => {
    if (onLoadGame) {
      const success = onLoadGame();
      const indicator = document.createElement('div');
      indicator.textContent = success ? '✓ GAME LOADED' : '❌ LOAD FAILED';
      indicator.className = `fixed top-4 right-4 ${success ? 'bg-green-600' : 'bg-red-600'} text-white px-4 py-2 rounded z-[70] animate-fade-in`;
      document.body.appendChild(indicator);
      setTimeout(() => indicator.remove(), 2000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="max-w-4xl w-full max-h-[90vh] bg-newspaper-bg border-4 border-newspaper-text overflow-hidden">
        {/* Classified header pattern */}
        <div className="relative bg-newspaper-text/10 p-6 border-b-2 border-newspaper-text">
          <div className="absolute inset-0 opacity-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div 
                key={i}
                className="absolute bg-newspaper-text h-4"
                style={{
                  width: `${Math.random() * 200 + 50}px`,
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  transform: `rotate(${Math.random() * 4 - 2}deg)`
                }}
              />
            ))}
          </div>

          <div className="relative flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-newspaper-text font-mono">
                CLASSIFIED OPTIONS
              </h2>
              <p className="text-sm text-newspaper-text/70 font-mono mt-1">
                Security Clearance: FOR YOUR EYES ONLY
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {gameStats && (
                <div className="text-right text-xs font-mono text-newspaper-text/80">
                  <div>Round: {gameStats.round} | {gameStats.faction?.toUpperCase()}</div>
                  <div>IP: {gameStats.ip} | Truth: {Math.round(gameStats.truth)}%</div>
                  <div>States: {gameStats.controlledStates}/50</div>
                </div>
              )}
              <Button 
                variant="outline" 
                onClick={onClose}
                className="border-newspaper-text text-newspaper-text hover:bg-newspaper-text/10"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Top Secret stamps */}
          <div className="absolute top-2 right-20 text-red-600 font-mono text-xs transform rotate-12 border-2 border-red-600 p-1">
            TOP SECRET
          </div>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Game Controls */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button 
              onClick={handleSaveGame}
              className="flex items-center gap-2 bg-newspaper-text text-newspaper-bg hover:bg-newspaper-text/80"
            >
              <Save className="w-4 h-4" />
              Quick Save
            </Button>
            
            <Button 
              onClick={handleLoadGame}
              disabled={!getSaveInfo?.()}
              variant="outline"
              className="flex items-center gap-2 border-newspaper-text text-newspaper-text"
            >
              <Upload className="w-4 h-4" />
              {getSaveInfo?.() ? 'Quick Load' : 'No Save'}
            </Button>

            <Button 
              onClick={() => setActiveTab('howtoplay')}
              variant="outline"
              className="flex items-center gap-2 border-newspaper-text text-newspaper-text"
            >
              <HelpCircle className="w-4 h-4" />
              How to Play
            </Button>

            <Button 
              onClick={() => setActiveTab('expansions')}
              variant="outline"
              className="flex items-center gap-2 border-newspaper-text text-newspaper-text"
            >
              <Settings className="w-4 h-4" />
              Expansions
            </Button>

            <Button 
              onClick={onBackToMainMenu}
              variant="outline"
              className="flex items-center gap-2 border-red-600 text-red-600 hover:bg-red-600/10"
            >
              <Home className="w-4 h-4" />
              Main Menu
            </Button>

            <Button 
              onClick={onClose}
              className="flex items-center gap-2 bg-government-blue text-white hover:bg-government-blue/80"
            >
              <RotateCw className="w-4 h-4" />
              Resume Game
            </Button>
          </div>

          {/* Audio Controls Section */}
          <div className="border-2 border-newspaper-text/20 p-4 bg-newspaper-text/5">
            <h3 className="text-lg font-bold text-newspaper-text mb-4 font-mono flex items-center gap-2">
              <Volume2 className="w-5 h-5" />
              AUDIO SURVEILLANCE
            </h3>
            
            <AudioControls
              volume={audio.config.volume}
              musicVolume={audio.config.musicVolume}
              muted={audio.config.muted}
              musicEnabled={audio.config.musicEnabled}
              sfxEnabled={audio.config.sfxEnabled}
              isPlaying={audio.isPlaying}
              currentTrackName={audio.currentTrackName || 'None'}
              onVolumeChange={audio.setVolume}
              onMusicVolumeChange={audio.setMusicVolume}
              onToggleMute={audio.toggleMute}
              onToggleMusic={audio.toggleMusic}
              onToggleSFX={audio.toggleSFX}
              onPlayMusic={audio.playMusic}
              onPauseMusic={audio.pauseMusic}
              onResumeMusic={audio.resumeMusic}
              onStopMusic={audio.stopMusic}
              onTestSFX={() => audio.playSFX('click')}
              tracksLoaded={audio.tracksLoaded}
              audioContextUnlocked={audio.audioContextUnlocked}
              audioStatus={audio.tracksLoaded ? 'ready' : 'loading'}
            />
          </div>

          {/* Game Statistics */}
          {gameStats && (
            <div className="border-2 border-newspaper-text/20 p-4 bg-newspaper-text/5">
              <h3 className="text-lg font-bold text-newspaper-text mb-4 font-mono">
                OPERATIONAL STATUS
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm font-mono">
                <div>
                  <div className="text-newspaper-text/60">CURRENT ROUND</div>
                  <div className="text-xl font-bold text-newspaper-text">{gameStats.round}</div>
                </div>
                <div>
                  <div className="text-newspaper-text/60">FACTION</div>
                  <Badge variant="outline" className="font-mono">
                    {gameStats.faction?.toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <div className="text-newspaper-text/60">INFLUENCE</div>
                  <div className="text-xl font-bold text-government-blue">{gameStats.ip} IP</div>
                </div>
                <div>
                  <div className="text-newspaper-text/60">TRUTH LEVEL</div>
                  <div className="text-xl font-bold text-truth-red">{Math.round(gameStats.truth)}%</div>
                </div>
              </div>
            </div>
          )}

          {/* Keyboard shortcuts */}
          <div className="border-2 border-newspaper-text/20 p-4 bg-newspaper-text/5">
            <h3 className="text-lg font-bold text-newspaper-text mb-4 font-mono">
              COVERT OPERATIONS MANUAL
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm font-mono text-newspaper-text/80">
              <div>
                <div><kbd className="bg-newspaper-text/20 px-2 py-1 rounded">ESC</kbd> - Options Menu</div>
                <div><kbd className="bg-newspaper-text/20 px-2 py-1 rounded">SPACE</kbd> - Go To Press</div>
                <div><kbd className="bg-newspaper-text/20 px-2 py-1 rounded">1-9</kbd> - Play Card</div>
              </div>
              <div>
                <div><kbd className="bg-newspaper-text/20 px-2 py-1 rounded">S</kbd> - Quick Save</div>
                <div><kbd className="bg-newspaper-text/20 px-2 py-1 rounded">L</kbd> - Quick Load</div>
                <div><kbd className="bg-newspaper-text/20 px-2 py-1 rounded">H</kbd> - How to Play</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-newspaper-text/10 p-4 border-t-2 border-newspaper-text">
          <div className="text-center text-xs font-mono text-newspaper-text/60">
            <div>CLASSIFIED - Security Level: EYES ONLY</div>
            <div className="mt-1">Any attempt to distribute this information will result in [REDACTED]</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default InGameOptions;