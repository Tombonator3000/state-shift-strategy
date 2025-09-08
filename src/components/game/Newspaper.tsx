import { useState, useEffect } from 'react';
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
  const [masthead, setMasthead] = useState('THE SHADOW TIMES');

  // Enhanced glitch system - 5% chance to glitch masthead
  useEffect(() => {
    const glitchTimer = setInterval(() => {
      if (Math.random() < 0.05) {
        setGlitching(true);
        const glitchMastheads = [
          'THE SHEEPLE DAILY',
          'CONSPIRACY WEEKLY', 
          'THE TRUTH GAZETTE',
          'WEEKLY WORLD LIES',
          'THE ILLUMINATI TIMES'
        ];
        setMasthead(glitchMastheads[Math.floor(Math.random() * glitchMastheads.length)]);
        
        setTimeout(() => {
          setGlitching(false);
          setMasthead('THE SHADOW TIMES');
        }, 300);
      }
    }, 2000);

    return () => clearInterval(glitchTimer);
  }, []);

  const ads = [
    "🛸 TINFOIL HATS - 50% OFF! Protect your thoughts from government mind rays!",
    "🏠 UNDERGROUND BUNKERS - Premium apocalypse survival accommodations. Wi-Fi included!",
    "💊 TRUTH SERUM - 100% effective* (*Not FDA approved, may cause existential crisis)",
    "📹 SURVEILLANCE CAMERAS - Watch everyone, everywhere, all the time. Now with night vision!",
    "🧠 MIND CONTROL BLOCKERS - Stop them from reading your thoughts! Batteries not included.",
    "👽 ALIEN DETECTION KIT - Spot shapeshifters in your neighborhood! Results not guaranteed.",
    "🔍 PASTOR REX'S END TIMES CALENDAR - Know exactly when the world ends! Updated daily!",
    "🦶 BIGFOOT TRACKING BOOTS - Follow the real story! Size 15+ only."
  ];

  const conspiracyCorner = [
    "• Elvis spotted buying groceries at Area 51 commissary",
    "• UFO lands at McDonald's drive-thru, orders McFlurry",
    "• Bigfoot declares candidacy for Florida Governor",
    "• Time traveler warns about Y2K bug... again",
    "• Lizard people infiltrate local PTA meeting",
    "• Chemtrails now available in new flavors",
    "• Florida Man discovers portal to alternate dimension",
    "• Birds confirmed to be government surveillance drones"
  ];

  const randomAd = ads[Math.floor(Math.random() * ads.length)];
  const selectedConspiracies = conspiracyCorner.slice(0, 4);

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 animate-fade-in">
      <Card className={`max-w-6xl w-full max-h-[90vh] overflow-y-auto bg-newspaper-bg border-4 border-newspaper-border transform transition-all duration-300 ${
        glitching ? 'animate-glitch filter hue-rotate-180' : 'animate-scale-in'
      }`}>
        {/* Header */}
        <div className="bg-newspaper-header p-6 border-b-4 border-double border-newspaper-border relative">
          {/* Vintage newspaper decorations */}
          <div className="absolute top-2 left-4 text-xs font-serif">Est. 1947</div>
          <div className="absolute top-2 right-4 text-xs font-serif">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <h1 className={`text-5xl font-bold font-serif text-newspaper-text text-center ${
                glitching ? 'animate-glitch' : ''
              }`}>
                {masthead}
              </h1>
              <div className="text-center text-sm font-serif italic text-newspaper-text/70 mt-2">
                "All The News That's Fit To Leak" - Issue #{Math.floor(Math.random() * 9999) + 1000}
              </div>
              <div className="text-center text-xs font-mono text-secret-red mt-1">
                [CLASSIFIED DISTRIBUTION - SECURITY CLEARANCE REQUIRED]
              </div>
            </div>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="absolute top-4 right-4 text-newspaper-text hover:bg-newspaper-text/10 text-xl font-mono"
            >
              ✕
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 grid lg:grid-cols-4 gap-8 bg-newspaper-bg">
          {/* Main Articles - Takes up 3 columns */}
          <div className="lg:col-span-3 space-y-8">
            {events.map((event, index) => (
              <article key={event.id} className="border-b-2 border-newspaper-border pb-6">
                <h2 className="text-3xl font-bold mb-4 font-serif text-newspaper-text hover:text-secret-red transition-colors cursor-pointer leading-tight">
                  {event.headline}
                </h2>
                
                {index === 0 && (
                  <div className="w-full h-32 bg-gray-300 mb-4 flex items-center justify-center text-gray-600 text-sm border-2 border-gray-400">
                    [PHOTO: CLASSIFIED BY ORDER OF █████████]
                  </div>
                )}
                
                <p className="text-newspaper-text leading-relaxed text-lg font-serif">
                  {event.content}
                </p>
                
                {index === 0 && (
                  <div className="mt-4 text-sm text-newspaper-text/70 italic">
                    Continued on page A-{Math.floor(Math.random() * 20) + 1}... 
                    <span className="text-secret-red ml-2">[REMAINDER REDACTED]</span>
                  </div>
                )}
                
                <div className="flex justify-between items-center mt-3 text-xs text-newspaper-text/60">
                  <span>By: Agent ████████</span>
                  <span>Source: {event.type === 'conspiracy' ? 'Anonymous Whistleblower' : 'Official Statement'}</span>
                </div>
              </article>
            ))}

            {/* Additional filler stories */}
            <article className="border-b border-newspaper-border pb-4">
              <h3 className="text-xl font-bold mb-3 font-serif text-newspaper-text">
                LOCAL: Area Man Claims All Pigeons Are Government Drones
              </h3>
              <p className="text-newspaper-text font-serif">
                ANYTOWN, USA - Local resident Bob Johnson, 47, has filed a formal complaint 
                with city hall claiming that all pigeons in the downtown area are actually 
                sophisticated surveillance drones operated by the Deep State. "They're 
                watching us," Johnson insists, pointing to a pigeon that appeared to be 
                staring directly at him. City officials declined to comment...
              </p>
            </article>

            <article className="border-b border-newspaper-border pb-4">
              <h3 className="text-xl font-bold mb-3 font-serif text-newspaper-text">
                WEATHER: Chemtrail Forecast Shows Heavy Mind Control Particles
              </h3>
              <p className="text-newspaper-text font-serif">
                Expect heavy chemtrail activity this weekend with a 70% chance of mind 
                control particles. The National Weather Service (which definitely can't 
                be trusted) predicts clear skies, but independent researchers using 
                tinfoil-enhanced equipment detect significant atmospheric manipulation. 
                Remember to wear your protective gear!
              </p>
            </article>
          </div>

          {/* Sidebar - Takes up 1 column */}
          <div className="space-y-6">
            {/* Advertisement */}
            <Card className="p-4 bg-yellow-500/90 text-black border-4 border-black transform -rotate-1 hover:rotate-0 transition-transform">
              <h4 className="font-bold text-center mb-3 font-mono text-lg">⚠️ ADVERTISEMENT ⚠️</h4>
              <div className="text-center text-sm font-mono">
                {randomAd}
              </div>
              <div className="text-center text-xs mt-2 italic">
                Call 1-800-WAKE-UP or visit TotallyNotAScam.com
              </div>
            </Card>

            {/* Conspiracy Corner */}
            <Card className="p-4 bg-red-900/20 border-4 border-secret-red relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-secret-red animate-pulse"></div>
              <h4 className="font-bold mb-3 font-mono text-secret-red text-center">
                📡 CONSPIRACY CORNER 📡
              </h4>
              <div className="text-xs space-y-2 font-mono">
                {selectedConspiracies.map((item, i) => (
                  <div key={i} className="text-newspaper-text animate-fade-in" style={{ animationDelay: `${i * 0.2}s` }}>
                    {item}
                  </div>
                ))}
              </div>
              <div className="text-xs text-center mt-3 text-secret-red font-bold">
                CITIZEN TIPS HOTLINE: 1-800-TRUTH-ME
              </div>
            </Card>

            {/* Classified Section */}
            <Card className="p-4 bg-black text-green-400 border-4 border-green-400 font-mono">
              <h4 className="font-bold mb-3 text-center text-secret-red">
                ████████ CLASSIFIED ████████
              </h4>
              <div className="text-xs space-y-2">
                <div>SEEKING ███████ REGARDING</div>
                <div>OPERATION: ████████████</div>
                <div>CONTACT: [REDACTED]</div>
                <div className="text-secret-red mt-3">
                  IF YOU CAN READ THIS,
                </div>
                <div className="text-secret-red">
                  YOU'RE ALREADY INVOLVED
                </div>
              </div>
            </Card>

            {/* Truth-O-Meter Stats */}
            <Card className="p-4 bg-government-blue/10 border-2 border-government-blue">
              <h4 className="font-bold mb-3 font-mono text-government-blue text-center">📊 TRUTH-O-METER™</h4>
              <div className="text-xs space-y-2 font-mono">
                <div className="flex justify-between">
                  <span>Conspiracy Theories Proven:</span>
                  <span className="text-truth-red font-bold">73%</span>
                </div>
                <div className="flex justify-between">
                  <span>Government Denials:</span>
                  <span className="text-government-blue font-bold">127%</span>
                </div>
                <div className="flex justify-between">
                  <span>UFO Sightings Today:</span>
                  <span className="text-yellow-500 font-bold">{Math.floor(Math.random() * 50) + 10}</span>
                </div>
                <div className="flex justify-between">
                  <span>Bigfoot Encounters:</span>
                  <span className="text-green-500 font-bold">{Math.floor(Math.random() * 20) + 5}</span>
                </div>
                <div className="flex justify-between">
                  <span>Florida Man Incidents:</span>
                  <span className="text-orange-500 font-bold">{Math.floor(Math.random() * 100) + 50}</span>
                </div>
              </div>
            </Card>

            {/* Mini Crossword */}
            <Card className="p-4 bg-newspaper-bg border-2 border-newspaper-border">
              <h4 className="font-bold mb-2 font-serif text-center">CONSPIRACY CROSSWORD</h4>
              <div className="grid grid-cols-5 gap-1 text-xs">
                {Array.from({length: 25}).map((_, i) => (
                  <div key={i} className={`w-6 h-6 border border-newspaper-border flex items-center justify-center text-xs ${
                    Math.random() > 0.7 ? 'bg-black' : 'bg-white'
                  }`}>
                    {Math.random() > 0.7 ? '' : String.fromCharCode(65 + Math.floor(Math.random() * 26))}
                  </div>
                ))}
              </div>
              <div className="text-xs mt-2 font-mono">
                1 Across: Government reptile (6)
              </div>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-newspaper-header p-4 border-t-2 border-newspaper-border">
          <div className="text-center space-y-2">
            <div className="text-xs font-serif text-newspaper-text/60">
              © {new Date().getFullYear()} The Shadow Times | All rights reserved by the Illuminati | 
              Printed with tears of whistleblowers
            </div>
            
            <Button 
              onClick={onClose}
              className="bg-secret-red hover:bg-secret-red/80 text-white font-mono text-lg px-8 py-3 animate-conspiracy-float"
            >
              📰 CONTINUE INVESTIGATION 📰
            </Button>
            
            <div className="text-xs font-mono text-secret-red">
              Remember: You never saw this newspaper. It doesn't exist.
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Newspaper;