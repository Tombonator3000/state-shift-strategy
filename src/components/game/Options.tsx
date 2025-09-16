import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useAudioContext } from "@/contexts/AudioContext";
import { useUiTheme } from "@/hooks/useTheme";
import { useEffect, useState } from "react";

interface OptionsProps {
  onClose: () => void;
}

interface ShowcaseSettings {
  masterVolume: number;
  enableAnimations: boolean;
  showTooltips: boolean;
  uiTheme: "tabloid_bw" | "government_classic";
}

const STORAGE_KEY = "showcase-ui-settings";

const Options = ({ onClose }: OptionsProps) => {
  const audio = useAudioContext();
  const [uiTheme, setUiTheme] = useUiTheme();
  const [settings, setSettings] = useState<ShowcaseSettings>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as ShowcaseSettings;
        return parsed;
      } catch (error) {
        console.warn("Failed to parse stored settings", error);
      }
    }

    return {
      masterVolume: Math.round(audio.config.volume * 100),
      enableAnimations: true,
      showTooltips: true,
      uiTheme: uiTheme ?? "tabloid_bw"
    };
  });

  useEffect(() => {
    audio.setVolume(settings.masterVolume / 100);
  }, [settings.masterVolume, audio]);

  useEffect(() => {
    setUiTheme(settings.uiTheme);
  }, [settings.uiTheme, setUiTheme]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6">
      <Card className="w-full max-w-xl space-y-6 bg-newspaper-bg p-8 text-newspaper-text shadow-2xl">
        <header className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Showcase Options</h2>
            <p className="text-sm text-newspaper-text/70">
              Configure audio and display preferences for the UI-only demo.
            </p>
          </div>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </header>

        <section className="space-y-5">
          <div>
            <Label className="text-xs uppercase tracking-wide">Master Volume</Label>
            <div className="mt-3 flex items-center gap-4">
              <Slider
                max={100}
                step={1}
                value={[settings.masterVolume]}
                onValueChange={([value]) => setSettings(prev => ({ ...prev, masterVolume: value }))}
                className="flex-1"
              />
              <span className="w-12 text-right font-mono text-sm">{settings.masterVolume}%</span>
            </div>
          </div>

          <div className="flex items-center justify-between rounded border border-newspaper-text/30 bg-newspaper-bg/40 p-4">
            <div>
              <h3 className="text-sm font-semibold">Enable Animations</h3>
              <p className="text-xs text-newspaper-text/70">Toggle subtle card motion and interface transitions.</p>
            </div>
            <Switch
              checked={settings.enableAnimations}
              onCheckedChange={(value) => setSettings(prev => ({ ...prev, enableAnimations: value }))}
            />
          </div>

          <div className="flex items-center justify-between rounded border border-newspaper-text/30 bg-newspaper-bg/40 p-4">
            <div>
              <h3 className="text-sm font-semibold">Show Tooltips</h3>
              <p className="text-xs text-newspaper-text/70">Keep contextual hints visible while exploring the UI.</p>
            </div>
            <Switch
              checked={settings.showTooltips}
              onCheckedChange={(value) => setSettings(prev => ({ ...prev, showTooltips: value }))}
            />
          </div>

          <div className="rounded border border-newspaper-text/30 bg-newspaper-bg/40 p-4">
            <h3 className="text-sm font-semibold">Interface Theme</h3>
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              <Button
                variant={settings.uiTheme === "tabloid_bw" ? "default" : "outline"}
                onClick={() => setSettings(prev => ({ ...prev, uiTheme: "tabloid_bw" }))}
              >
                Tabloid Noir
              </Button>
              <Button
                variant={settings.uiTheme === "government_classic" ? "default" : "outline"}
                onClick={() => setSettings(prev => ({ ...prev, uiTheme: "government_classic" }))}
              >
                Government Briefing
              </Button>
            </div>
          </div>
        </section>

        <footer className="flex justify-end">
          <Button onClick={onClose}>Return</Button>
        </footer>
      </Card>
    </div>
  );
};

export default Options;
