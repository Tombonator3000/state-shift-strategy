import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';

interface ResponsiveOptionsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  
  // Audio settings
  masterVolume: number;
  onMasterVolumeChange: (value: number) => void;
  musicVolume: number;
  onMusicVolumeChange: (value: number) => void;
  sfxVolume: number;
  onSfxVolumeChange: (value: number) => void;
  
  // UI settings
  uiScale: number;
  onUIScaleChange: (value: number) => void;
  theme: string;
  onThemeChange: (value: string) => void;
  
  // Game settings
  autoSave: boolean;
  onAutoSaveChange: (value: boolean) => void;
  hapticFeedback: boolean;
  onHapticFeedbackChange: (value: boolean) => void;
}

const ResponsiveOptions: React.FC<ResponsiveOptionsProps> = ({
  open,
  onOpenChange,
  masterVolume,
  onMasterVolumeChange,
  musicVolume,
  onMusicVolumeChange,
  sfxVolume,
  onSfxVolumeChange,
  uiScale,
  onUIScaleChange,
  theme,
  onThemeChange,
  autoSave,
  onAutoSaveChange,
  hapticFeedback,
  onHapticFeedbackChange
}) => {
  const isMobile = useIsMobile();

  const content = (
    <div className="space-y-6 p-4">
      {/* Audio Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold uppercase border-b-2 border-black pb-2">Audio Settings</h3>
        
        <div className="space-y-3">
          <div>
            <Label className="font-bold">Master Volume</Label>
            <div className="mt-2">
              <Slider
                value={[masterVolume]}
                onValueChange={(value) => onMasterVolumeChange(value[0])}
                max={100}
                step={1}
                className="w-full touch-none"
                style={{ minHeight: '44px' }}
              />
              <div className="text-sm text-gray-600 mt-1">{masterVolume}%</div>
            </div>
          </div>
          
          <div>
            <Label className="font-bold">Music Volume</Label>
            <div className="mt-2">
              <Slider
                value={[musicVolume]}
                onValueChange={(value) => onMusicVolumeChange(value[0])}
                max={100}
                step={1}
                className="w-full touch-none"
                style={{ minHeight: '44px' }}
              />
              <div className="text-sm text-gray-600 mt-1">{musicVolume}%</div>
            </div>
          </div>
          
          <div>
            <Label className="font-bold">Sound Effects Volume</Label>
            <div className="mt-2">
              <Slider
                value={[sfxVolume]}
                onValueChange={(value) => onSfxVolumeChange(value[0])}
                max={100}
                step={1}
                className="w-full touch-none"
                style={{ minHeight: '44px' }}
              />
              <div className="text-sm text-gray-600 mt-1">{sfxVolume}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* UI Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold uppercase border-b-2 border-black pb-2">Interface Settings</h3>
        
        <div className="space-y-3">
          <div>
            <Label className="font-bold">UI Scale</Label>
            <div className="mt-2">
              <Slider
                value={[uiScale]}
                onValueChange={(value) => onUIScaleChange(value[0])}
                min={0.8}
                max={1.5}
                step={0.1}
                className="w-full touch-none"
                style={{ minHeight: '44px' }}
              />
              <div className="text-sm text-gray-600 mt-1">{Math.round(uiScale * 100)}%</div>
            </div>
          </div>
          
          <div>
            <Label className="font-bold">UI Theme</Label>
            <Select value={theme} onValueChange={onThemeChange}>
              <SelectTrigger className="w-full min-h-[44px] mt-2">
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tabloid_bw">Tabloid (Black & White)</SelectItem>
                <SelectItem value="government_classic">Government Classic (Legacy)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Game Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold uppercase border-b-2 border-black pb-2">Game Settings</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="font-bold">Auto Save</Label>
            <Switch
              checked={autoSave}
              onCheckedChange={onAutoSaveChange}
              className="touch-none"
              style={{ minWidth: '44px', minHeight: '24px' }}
            />
          </div>
          
          {isMobile && (
            <div className="flex items-center justify-between">
              <Label className="font-bold">Haptic Feedback</Label>
              <Switch
                checked={hapticFeedback}
                onCheckedChange={onHapticFeedbackChange}
                className="touch-none"
                style={{ minWidth: '44px', minHeight: '24px' }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Close Button for Mobile */}
      {isMobile && (
        <Button 
          onClick={() => onOpenChange(false)}
          className="w-full min-h-[56px] font-bold"
        >
          Close Settings
        </Button>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader className="border-b-2 border-black">
            <DrawerTitle className="font-black text-xl uppercase">
              SECRET SETTINGS EXPOSED!
            </DrawerTitle>
          </DrawerHeader>
          <div className="overflow-y-auto">
            {content}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b-2 border-black pb-4">
          <DialogTitle className="font-black text-2xl uppercase">
            SECRET SETTINGS EXPOSED!
          </DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
};

export default ResponsiveOptions;