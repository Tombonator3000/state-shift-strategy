import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { useAudioContext } from '@/contexts/AudioContext';
import { AudioGeneratorComponent } from './AudioGenerator';
import { SFX_KEYS } from '@/assets/audio/sfxManifest';

const sliderValue = (value: number) => Math.round(value * 100);

const toNormalized = (value: number) => Math.max(0, Math.min(1, value / 100));

const AudioQAControls = () => {
  const audio = useAudioContext();
  const [selectedSfx, setSelectedSfx] = useState<string>(SFX_KEYS[0] ?? 'click');

  const sfxKeys = useMemo(() => [...SFX_KEYS].sort((a, b) => a.localeCompare(b)), []);
  const { config, availableTracks } = audio;

  const handlePlaySelected = () => {
    audio.playSFX(selectedSfx);
  };

  return (
    <Card>
      <CardHeader className="space-y-2 border-b border-gray-800 bg-gray-900/60">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-white">
            Audio QA Controls
          </CardTitle>
          <Badge variant="outline" className="uppercase tracking-wide text-[11px] border-sky-500/40 text-sky-200">
            Sound lab
          </Badge>
        </div>
        <p className="text-xs text-slate-400">
          Audition SFX, validate music routing, and generate placeholder assets without leaving the briefing.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-slate-200">Sound Effect Palette</h4>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" onClick={audio.testSFX}>
                Random test
              </Button>
              <Button size="sm" onClick={handlePlaySelected}>
                Play {selectedSfx}
              </Button>
            </div>
          </div>
          <ScrollArea className="h-36 rounded border border-gray-800 bg-gray-950/60">
            <div className="divide-y divide-gray-900">
              {sfxKeys.map(key => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setSelectedSfx(key);
                    audio.playSFX(key);
                  }}
                  className={`flex w-full items-center justify-between px-3 py-2 text-sm transition hover:bg-gray-900/80 focus:outline-none focus-visible:bg-gray-900/80 ${
                    selectedSfx === key ? 'bg-gray-900/80 text-emerald-200' : 'text-slate-300'
                  }`}
                >
                  <span className="font-mono text-xs uppercase tracking-wide">{key}</span>
                  <Badge variant="outline" className="text-[10px] border-gray-700">
                    Tap to audition
                  </Badge>
                </button>
              ))}
            </div>
          </ScrollArea>
        </section>

        <section className="space-y-4">
          <h4 className="text-sm font-semibold text-slate-200">Mix Levels</h4>
          <div className="space-y-3">
            <div>
              <Label className="text-xs text-slate-400">Master Volume: {sliderValue(config.volume)}%</Label>
              <Slider
                value={[sliderValue(config.volume)]}
                onValueChange={([value]) => audio.setVolume(toNormalized(value))}
                max={100}
                min={0}
                step={1}
                className="mt-2"
              />
            </div>
            <div>
              <Label className="text-xs text-slate-400">Music Bus: {sliderValue(config.musicVolume)}%</Label>
              <Slider
                value={[sliderValue(config.musicVolume)]}
                onValueChange={([value]) => audio.setMusicVolume(toNormalized(value))}
                max={100}
                min={0}
                step={1}
                className="mt-2"
              />
            </div>
            <div>
              <Label className="text-xs text-slate-400">SFX Bus: {sliderValue(config.sfxVolume)}%</Label>
              <Slider
                value={[sliderValue(config.sfxVolume)]}
                onValueChange={([value]) => audio.setSfxVolume(toNormalized(value))}
                max={100}
                min={0}
                step={1}
                className="mt-2"
              />
            </div>
          </div>
        </section>

        <section className="space-y-2">
          <h4 className="text-sm font-semibold text-slate-200">Loaded Music Sets</h4>
          <div className="grid gap-2 text-xs text-slate-300">
            {Object.entries(availableTracks).map(([key, tracks]) => (
              <div key={key} className="flex items-center justify-between rounded border border-gray-800 bg-gray-950/60 px-3 py-2">
                <span className="font-mono uppercase tracking-wide">{key}</span>
                <span>{tracks.length} track{tracks.length === 1 ? '' : 's'}</span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <AudioGeneratorComponent />
        </section>
      </CardContent>
    </Card>
  );
};

export default AudioQAControls;
