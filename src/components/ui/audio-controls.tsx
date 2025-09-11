import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { 
  Volume2, 
  VolumeX, 
  Music, 
  Music2, 
  Speaker, 
  Settings,
  Play,
  Pause,
  Square,
  TestTube,
  Activity,
  Info
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface AudioControlsProps {
  volume: number;
  muted: boolean;
  musicEnabled: boolean;
  sfxEnabled: boolean;
  isPlaying?: boolean;
  currentTrackName?: string;
  audioStatus?: string;
  tracksLoaded?: boolean;
  audioContextUnlocked?: boolean;
  onVolumeChange: (volume: number) => void;
  onToggleMute: () => void;
  onToggleMusic: () => void;
  onToggleSFX: () => void;
  onPlayMusic?: () => void;
  onPauseMusic?: () => void;
  onStopMusic?: () => void;
  onTestSFX?: () => void;
}

export const AudioControls: React.FC<AudioControlsProps> = ({
  volume,
  muted,
  musicEnabled,
  sfxEnabled,
  isPlaying = false,
  currentTrackName = '',
  audioStatus = 'Ready',
  tracksLoaded = false,
  audioContextUnlocked = false,
  onVolumeChange,
  onToggleMute,
  onToggleMusic,
  onToggleSFX,
  onPlayMusic,
  onPauseMusic,
  onStopMusic,
  onTestSFX
}) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-4">
        <Card className="p-4 space-y-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-semibold text-foreground">Enhanced Audio Control</div>
            <div className="flex gap-1">
              <Badge variant={tracksLoaded ? "default" : "destructive"} className="text-xs">
                {tracksLoaded ? "Tracks" : "Loading"}
              </Badge>
              <Badge variant={audioContextUnlocked ? "default" : "secondary"} className="text-xs">
                {audioContextUnlocked ? "Unlocked" : "Locked"}
              </Badge>
            </div>
          </div>

          {/* Real-time Status */}
          <div className="p-2 bg-muted rounded-md">
            <div className="flex items-center gap-2 text-xs">
              <Activity className="h-3 w-3" />
              <span className="font-mono">{audioStatus}</span>
            </div>
            {currentTrackName && (
              <div className="text-xs text-muted-foreground mt-1">
                🎵 {currentTrackName}
              </div>
            )}
          </div>
          
          {/* Master Volume */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Master Volume ({Math.round(volume * 100)}%)</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleMute}
                className="h-6 w-6 p-0"
              >
                {muted ? (
                  <VolumeX className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
            </div>
            <Slider
              value={[muted ? 0 : volume * 100]}
              onValueChange={(values) => onVolumeChange(values[0] / 100)}
              max={100}
              step={1}
              className="w-full"
              disabled={muted}
            />
          </div>

          {/* Music Controls */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Background Music</span>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleMusic}
                  className="h-6 w-12 text-xs"
                >
                  {musicEnabled ? (
                    <>
                      <Music className="h-3 w-3 mr-1" />
                      ON
                    </>
                  ) : (
                    <>
                      <Music2 className="h-3 w-3 mr-1 opacity-50" />
                      OFF
                    </>
                  )}
                </Button>
              </div>
            </div>
            
            {/* Playback Controls */}
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={onPlayMusic}
                disabled={!musicEnabled || !tracksLoaded}
                className="flex-1 h-8"
              >
                <Play className="h-3 w-3 mr-1" />
                Play
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={isPlaying ? onPauseMusic : onPlayMusic}
                disabled={!musicEnabled || !tracksLoaded}
                className="flex-1 h-8"
              >
                {isPlaying ? (
                  <>
                    <Pause className="h-3 w-3 mr-1" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-3 w-3 mr-1" />
                    Resume
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onStopMusic}
                disabled={!musicEnabled}
                className="flex-1 h-8"
              >
                <Square className="h-3 w-3 mr-1" />
                Stop
              </Button>
            </div>
          </div>

          {/* SFX Controls */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Sound Effects</span>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onTestSFX}
                  disabled={!sfxEnabled || !audioContextUnlocked}
                  className="h-6 text-xs"
                >
                  <TestTube className="h-3 w-3 mr-1" />
                  Test
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleSFX}
                  className="h-6 w-12 text-xs"
                >
                  {sfxEnabled ? (
                    <>
                      <Speaker className="h-3 w-3 mr-1" />
                      ON
                    </>
                  ) : (
                    <>
                      <VolumeX className="h-3 w-3 mr-1" />
                      OFF
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Debug Info */}
          <div className="pt-2 border-t space-y-1">
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <Info className="h-3 w-3" />
              Debug Information
            </div>
            <div className="text-xs font-mono space-y-1 text-muted-foreground">
              <div>Volume sync: Settings auto-saved</div>
              <div>Context: {audioContextUnlocked ? '✅ Ready' : '⏳ Waiting for user interaction'}</div>
              <div>Tracks: {tracksLoaded ? '✅ Loaded' : '⏳ Loading...'}</div>
              <div>Console: Check browser DevTools for 🎵 logs</div>
            </div>
          </div>
        </Card>
      </PopoverContent>
    </Popover>
  );
};