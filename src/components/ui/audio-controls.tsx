import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { 
  Volume2, 
  VolumeX, 
  Music, 
  Music2, 
  Speaker, 
  Settings,
  Play,
  Pause,
  Square
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAudioManager } from '@/hooks/useAudioManager';

interface AudioControlsProps {
  // Legacy props for compatibility - will be ignored as we use the hook directly
  volume?: number;
  muted?: boolean;
  musicEnabled?: boolean;
  sfxEnabled?: boolean;
  onVolumeChange?: (volume: number) => void;
  onToggleMute?: () => void;
  onToggleMusic?: () => void;
  onToggleSFX?: () => void;
}

export const AudioControls: React.FC<AudioControlsProps> = () => {
  const audio = useAudioManager();
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
      <PopoverContent className="w-80 p-4">
        <Card className="p-4 space-y-4">
          <div className="text-sm font-semibold text-foreground mb-3">Audio Surveillance</div>
          
          {/* Master Volume */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Master Volume</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => audio.mute(!audio.settings.isMuted)}
                className="h-6 w-6 p-0"
              >
                {audio.settings.isMuted ? (
                  <VolumeX className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
            </div>
            <Slider
              value={[audio.settings.isMuted ? 0 : audio.settings.master * 100]}
              onValueChange={(values) => audio.setVolumes({ master: values[0] / 100 })}
              max={100}
              step={5}
              className="w-full"
              disabled={audio.settings.isMuted}
            />
          </div>

          {/* BGM Volume */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Background Music</span>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => audio.isPlaying ? audio.pauseBgm() : audio.resumeBgm()}
                  className="h-6 w-6 p-0"
                  disabled={!audio.currentTrackId}
                >
                  {audio.isPlaying ? (
                    <Pause className="h-3 w-3" />
                  ) : (
                    <Play className="h-3 w-3" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={audio.stopBgm}
                  className="h-6 w-6 p-0"
                  disabled={!audio.currentTrackId}
                >
                  <Square className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <Slider
              value={[audio.settings.bgm * 100]}
              onValueChange={(values) => audio.setVolumes({ bgm: values[0] / 100 })}
              max={100}
              step={5}
              className="w-full"
            />
          </div>

          {/* SFX Volume */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Sound Effects</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => audio.playSfx('click')}
                className="h-6 w-6 p-0"
              >
                <Speaker className="h-3 w-3" />
              </Button>
            </div>
            <Slider
              value={[audio.settings.sfx * 100]}
              onValueChange={(values) => audio.setVolumes({ sfx: values[0] / 100 })}
              max={100}
              step={5}
              className="w-full"
            />
          </div>

          {/* Status */}
          <div className="text-xs text-muted-foreground pt-2 border-t">
            {audio.canPlay ? (
              <>
                Scene: {audio.scene} | Track: {audio.currentTrackId || 'None'}
                {audio.isPlaying && ` | ${Math.floor(audio.position)}s`}
              </>
            ) : (
              'Tap anywhere to enable audio'
            )}
          </div>
        </Card>
      </PopoverContent>
    </Popover>
  );
};