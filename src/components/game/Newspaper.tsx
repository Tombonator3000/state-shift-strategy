import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface NewsEvent {
  id: string;
  headline: string;
  content: string;
  type: 'conspiracy' | 'government' | 'truth' | 'random';
}

interface NewspaperProps {
  events: NewsEvent[];
  onClose: () => void;
}

const Newspaper = ({ events, onClose }: NewspaperProps) => {
  const [glitching, setGlitching] = useState(false);

  // Trigger random glitch effect (5% chance)
  const triggerGlitch = () => {
    if (Math.random() < 0.05) {
      setGlitching(true);
      setTimeout(() => setGlitching(false), 200);
    }
  };

  const ads = [
    "TINFOIL HATS - 50% OFF! Protect your thoughts today!",
    "BUNKER SUPPLIES - Everything for the coming apocalypse",
    "TRUTH SERUM - 100% effective* (*Not FDA approved)",
    "SURVEILLANCE CAMERAS - Watch everyone, everywhere",
    "MIND CONTROL BLOCKERS - Stop them from reading your mind!"
  ];

  const randomAd = ads[Math.floor(Math.random() * ads.length)];

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <Card className={`max-w-4xl w-full max-h-[80vh] overflow-y-auto bg-newspaper-bg border-4 border-newspaper-border ${
        glitching ? 'animate-pulse filter hue-rotate-180' : ''
      }`}>
        {/* Header */}
        <div className="bg-newspaper-header p-4 border-b-4 border-double border-newspaper-border">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold font-serif text-newspaper-text">
                THE SHADOW TIMES
              </h1>
              <div className="text-sm font-mono">
                "All The News That's Fit To Leak" - Issue #{Math.floor(Math.random() * 9999)}
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="text-newspaper-text hover:bg-newspaper-text/10"
            >
              <X size={20} />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 grid md:grid-cols-3 gap-6">
          {/* Main Articles */}
          <div className="md:col-span-2 space-y-6">
            {events.map((event, index) => (
              <div key={event.id} className="border-b border-newspaper-border pb-4">
                <h2 
                  className="text-2xl font-bold mb-2 cursor-pointer hover:text-secret-red transition-colors font-serif"
                  onClick={triggerGlitch}
                >
                  {event.headline}
                </h2>
                <p className="text-newspaper-text leading-relaxed">
                  {event.content}
                </p>
                {index === 0 && (
                  <div className="mt-2 text-xs text-muted-foreground italic">
                    Continued on page A-{Math.floor(Math.random() * 20) + 1}...
                  </div>
                )}
              </div>
            ))}

            {/* Filler content */}
            <div className="border-b border-newspaper-border pb-4">
              <h3 className="text-lg font-bold mb-2 font-serif">
                LOCAL: Area Man Claims Pigeons Are Government Drones
              </h3>
              <p className="text-sm text-newspaper-text">
                ANYTOWN, USA - Local resident Bob Johnson, 47, has filed a 
                formal complaint with city hall claiming that all pigeons in 
                the downtown area are actually sophisticated surveillance drones...
              </p>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-2 font-serif">
                WEATHER: Chemtrail Forecast
              </h3>
              <p className="text-sm text-newspaper-text">
                Expect heavy chemtrail activity this weekend with a 70% chance 
                of mind control particles. Remember to wear your protective gear!
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Advertisement */}
            <Card className="p-4 bg-truth-red/10 border-2 border-truth-red">
              <h4 className="font-bold text-center mb-2 font-mono">ADVERTISEMENT</h4>
              <div className="text-center text-sm">
                {randomAd}
              </div>
            </Card>

            {/* Conspiracy Corner */}
            <Card className="p-4 bg-government-blue/10 border-2 border-government-blue">
              <h4 className="font-bold mb-2 font-mono">CONSPIRACY CORNER</h4>
              <div className="text-xs space-y-2">
                <div>• Bigfoot spotted at grocery store</div>
                <div>• UFO lands at McDonald's drive-thru</div>
                <div>• Elvis found working at DMV</div>
                <div>• Aliens infiltrate PTA meeting</div>
              </div>
            </Card>

            {/* Classified Ad */}
            <Card className="p-4 bg-black text-white border-2">
              <h4 className="font-bold mb-2 font-mono text-secret-red">[CLASSIFIED]</h4>
              <div className="text-xs font-mono">
                <div>SEEK█NG █NFORMA██N</div>
                <div>REG██DING ████████</div>
                <div>CO█TACT: [REDACTED]</div>
                <div className="mt-2 text-secret-red">
                  THIS AD NEVER EXISTED
                </div>
              </div>
            </Card>

            {/* Quick Stats */}
            <Card className="p-4">
              <h4 className="font-bold mb-2 font-mono">TRUTH-O-METER</h4>
              <div className="text-xs space-y-1">
                <div>Conspiracy Theories Proven: 73%</div>
                <div>Government Denials: 127%</div>
                <div>UFO Sightings Today: 42</div>
                <div>Bigfoot Encounters: 17</div>
              </div>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-newspaper-header p-2 border-t border-newspaper-border">
          <div className="text-center">
            <Button 
              onClick={onClose}
              className="bg-secret-red hover:bg-secret-red/80 text-white font-mono"
            >
              Continue Game
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Newspaper;