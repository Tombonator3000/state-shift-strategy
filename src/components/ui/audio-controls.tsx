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
  Settings
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
  onVolumeChange: (volume: number) => void;
  onToggleMute: () => void;
  onToggleMusic: () => void;
  onToggleSFX: () => void;
}

export const AudioControls: React.FC<AudioControlsProps> = ({
  volume,
  muted,
  musicEnabled,
  sfxEnabled,
  onVolumeChange,
  onToggleMute,
  onToggleMusic,
  onToggleSFX
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
      <PopoverContent className="w-80 p-4">
        <Card className="p-4 space-y-4">
          <div className="text-sm font-semibold text-foreground mb-3">Audio Settings</div>
          
          {/* Master Volume */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Master Volume</span>
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
              step={5}
              className="w-full"
              disabled={muted}
            />
          </div>

          {/* Music Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Background Music</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleMusic}
              className="h-8 w-16 text-xs"
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

          {/* SFX Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Sound Effects</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleSFX}
              className="h-8 w-16 text-xs"
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

          <div className="text-xs text-muted-foreground pt-2 border-t">
            Audio files not included - add your own audio files to /public/audio/
          </div>
        </Card>
      </PopoverContent>
    </Popover>
  );
};