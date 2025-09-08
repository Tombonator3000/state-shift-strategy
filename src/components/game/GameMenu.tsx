import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

interface GameMenuProps {
  onStartGame: (faction: 'government' | 'truth') => void;
}

const GameMenu = ({ onStartGame }: GameMenuProps) => {
  const [glitching, setGlitching] = useState(false);
  const [redactedText, setRedactedText] = useState('SHADOW GOVERNMENT');

  useEffect(() => {
    const glitchInterval = setInterval(() => {
      if (Math.random() < 0.1) { // 10% chance every 3 seconds
        setGlitching(true);
        const glitchTexts = ['SHEEPLE TIMES', 'THE TRUTH DAILY', 'CONSPIRACY NEWS', 'SHADOW GOVERNMENT'];
        setRedactedText(glitchTexts[Math.floor(Math.random() * glitchTexts.length)]);
        setTimeout(() => {
          setGlitching(false);
          setRedactedText('SHADOW GOVERNMENT');
        }, 200);
      }
    }, 3000);

    return () => clearInterval(glitchInterval);
  }, []);

  return (
    <div className="min-h-screen bg-government-dark flex items-center justify-center p-8 relative overflow-hidden">
      {/* Redacted background pattern */}
      <div className="absolute inset-0 opacity-10">
        {Array.from({ length: 20 }).map((_, i) => (
          <div 
            key={i}
            className="absolute bg-secret-red h-4"
            style={{
              width: `${Math.random() * 200 + 50}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              transform: `rotate(${Math.random() * 10 - 5}deg)`
            }}
          />
        ))}
      </div>

      <Card className="max-w-4xl w-full p-8 bg-card/90 border-2 border-secret-red/50 animate-redacted-reveal relative">
        {/* Classified stamps */}
        <div className="absolute top-4 right-4 text-secret-red font-mono text-xs transform rotate-12 border-2 border-secret-red p-2">
          TOP SECRET
        </div>
        <div className="absolute bottom-4 left-4 text-secret-red font-mono text-xs transform -rotate-12 border-2 border-secret-red p-2">
          EYES ONLY
        </div>

        <div className="text-center mb-8">
          <h1 className={`text-5xl font-bold font-mono text-secret-red mb-2 ${glitching ? 'animate-glitch' : ''}`}>
            {redactedText}
          </h1>
          <div className="text-sm font-mono text-muted-foreground mb-4">
            [CLASSIFIED DOSSIER - CLEARANCE LEVEL: ███████]
          </div>
          <div className="text-xs font-mono text-muted-foreground italic">
            "The truth is out there... but so are the lies"
          </div>
        </div>

        <div className="space-y-6">
          {/* Faction Selection */}
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-6 border-2 border-government-blue/50 hover:border-government-blue transition-all hover:scale-105 cursor-pointer group bg-government-blue/5">
              <div className="flex items-center mb-4">
                <div className="text-3xl mr-3 animate-conspiracy-float">🦎</div>
                <h3 className="font-bold text-xl text-government-blue font-mono">
                  DEEP STATE
                </h3>
              </div>
              
              <div className="space-y-2 text-sm mb-4 font-mono">
                <div className="flex justify-between">
                  <span>Start Truth:</span>
                  <span className="text-government-blue font-bold">40%</span>
                </div>
                <div className="flex justify-between">
                  <span>Bonus IP:</span>
                  <span className="text-government-blue font-bold">+10</span>
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  Access to Lizard People
                </div>
              </div>
              
              <div className="bg-government-blue/10 p-3 rounded mb-4 text-xs italic">
                "Control the narrative with black helicopters, weather machines, and surprisingly comfortable underground bunkers. The Illuminati has dental."
              </div>

              <div className="bg-yellow-500/90 text-black p-2 rounded mb-4 text-xs font-mono">
                <div className="font-bold text-center mb-1">PERKS</div>
                <div>+10 Starting IP</div>
                <div>+2 Income Bonus</div>
                <div>Access to Lizard People</div>
              </div>
              
              <Button 
                onClick={() => onStartGame('government')}
                className="w-full bg-government-blue hover:bg-government-blue/80 group-hover:animate-pulse"
              >
                Join the Shadow Cabinet
              </Button>
            </Card>

            <Card className="p-6 border-2 border-truth-red/50 hover:border-truth-red transition-all hover:scale-105 cursor-pointer group bg-truth-red/5">
              <div className="flex items-center mb-4">
                <div className="text-3xl mr-3 animate-conspiracy-float" style={{ animationDelay: '1s' }}>👁️</div>
                <h3 className="font-bold text-xl text-truth-red font-mono">
                  TRUTH SEEKERS
                </h3>
              </div>
              
              <div className="space-y-2 text-sm mb-4 font-mono">
                <div className="flex justify-between">
                  <span>Start Truth:</span>
                  <span className="text-truth-red font-bold">60%</span>
                </div>
                <div className="flex justify-between">
                  <span>Bonus Truth:</span>
                  <span className="text-truth-red font-bold">+10%</span>
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  Tinfoil Hat Immunity
                </div>
              </div>
              
              <div className="bg-truth-red/10 p-3 rounded mb-4 text-xs italic">
                "Wake up the sheeple with essential oils, healing crystals, and really long YouTube videos. Your aunt on Facebook was right all along."
              </div>

              <div className="bg-yellow-500/90 text-black p-2 rounded mb-4 text-xs font-mono">
                <div className="font-bold text-center mb-1">PERKS</div>
                <div>+10% Starting Truth</div>
                <div>+1 Card Draw Bonus</div>
                <div>Tinfoil Hat Immunity</div>
              </div>
              
              <Button 
                onClick={() => onStartGame('truth')}
                className="w-full bg-truth-red hover:bg-truth-red/80 group-hover:animate-pulse"
              >
                Expose the Conspiracy
              </Button>
            </Card>
          </div>

          {/* Menu Options */}
          <div className="border-t pt-6 space-y-3">
            <Button variant="outline" className="w-full" disabled>
              Continue Game
            </Button>
            <Button variant="outline" className="w-full" disabled>
              Manage Expansions
            </Button>
            <Button variant="outline" className="w-full" disabled>
              Options
            </Button>
            <Button variant="ghost" className="w-full" disabled>
              Credits
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs font-mono text-muted-foreground">
          <div className="mb-2">WARNING: This game contains satirical content</div>
          <div>Any resemblance to actual conspiracies is purely coincidental</div>
          <div className="mt-2 text-secret-red">
            [REDACTED] - Classification Level: FOR YOUR EYES ONLY
          </div>
        </div>
      </Card>
    </div>
  );
};

export default GameMenu;