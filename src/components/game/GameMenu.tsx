import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import Credits from './Credits';

interface GameMenuProps {
  onStartGame: (faction: 'government' | 'truth') => void;
}

const GameMenu = ({ onStartGame }: GameMenuProps) => {
  const [glitching, setGlitching] = useState(false);
  const [redactedText, setRedactedText] = useState('SHADOW GOVERNMENT');
  const [showCredits, setShowCredits] = useState(false);

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

  if (showCredits) {
    return <Credits onClose={() => setShowCredits(false)} />;
  }

  return (
    <div className="min-h-screen bg-newspaper-bg flex items-center justify-center p-8 relative overflow-hidden">
      {/* Redacted background pattern */}
      <div className="absolute inset-0 opacity-5">
        {Array.from({ length: 30 }).map((_, i) => (
          <div 
            key={i}
            className="absolute bg-newspaper-text h-6"
            style={{
              width: `${Math.random() * 300 + 100}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              transform: `rotate(${Math.random() * 4 - 2}deg)`
            }}
          />
        ))}
      </div>

      <Card className="max-w-4xl w-full p-8 bg-newspaper-bg border-4 border-newspaper-text animate-redacted-reveal relative" style={{ fontFamily: 'serif' }}>
        {/* Classified stamps */}
        <div className="absolute top-4 right-4 text-newspaper-text font-mono text-xs transform rotate-12 border-2 border-newspaper-text p-2">
          TOP SECRET
        </div>
        <div className="absolute bottom-4 left-4 text-newspaper-text font-mono text-xs transform -rotate-12 border-2 border-newspaper-text p-2">
          EYES ONLY
        </div>

        <div className="text-center mb-8">
          <h1 className={`text-5xl font-bold text-newspaper-text mb-2 ${glitching ? 'animate-glitch' : ''}`}>
            {redactedText}
          </h1>
          <div className="text-xl font-medium text-newspaper-text/80 mb-2">
            ULTIMATE HUMOR EDITION
          </div>
          <div className="text-sm font-italic text-newspaper-text/60 mb-4">
            "Where conspiracy theories go to become policy"
          </div>
          <div className="text-sm text-newspaper-text/80">
            Control the narrative. Manipulate the truth.
          </div>
          <div className="text-sm text-newspaper-text/80">
            Convince people birds are real (or aren't).
          </div>
          <div className="text-lg font-bold text-secret-red mt-4">
            NOW WITH 420% MORE SATIRE!
          </div>
        </div>

        <div className="space-y-6">
          <div className="text-center space-y-2 mb-6">
            <div className="text-sm font-mono text-newspaper-text">Record: 8W / 0L</div>
            <div className="text-sm font-mono text-newspaper-text">Win Streak: 8</div>
            <div className="text-xs font-mono text-newspaper-text/60 mt-4">
              HOTKEYS:
            </div>
            <div className="text-xs font-mono text-newspaper-text/60">
              Space = End Turn | T = Select Card
            </div>
            <div className="text-xs font-mono text-newspaper-text/60">
              U = Upgrades | S = Stats | Q/L = Save/Load
            </div>
          </div>

          {/* Menu Options */}
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <Button 
              onClick={() => onStartGame('government')}
              className="w-full py-4 text-lg bg-newspaper-text text-newspaper-bg hover:bg-newspaper-text/80"
            >
              NEW GAME
            </Button>
            <Button 
              variant="outline" 
              className="w-full py-4 text-lg border-2 border-newspaper-text text-newspaper-text hover:bg-newspaper-text/10" 
              disabled
            >
              MANAGE EXPANSIONS
            </Button>
            <Button 
              variant="outline" 
              className="w-full py-4 text-lg border-2 border-newspaper-text text-newspaper-text hover:bg-newspaper-text/10" 
              disabled
            >
              HOW TO PLAY
            </Button>
            <Button 
              variant="outline" 
              className="w-full py-4 text-lg border-2 border-newspaper-text text-newspaper-text hover:bg-newspaper-text/10" 
              disabled
            >
              CONTINUE
            </Button>
            <Button 
              onClick={() => setShowCredits(true)}
              variant="outline" 
              className="w-full py-4 text-lg border-2 border-newspaper-text text-newspaper-text hover:bg-newspaper-text/10"
            >
              CREDITS
            </Button>
            <Button 
              variant="outline" 
              className="w-full py-4 text-lg border-2 border-newspaper-text text-newspaper-text hover:bg-newspaper-text/10" 
              disabled
            >
              OPTIONS
            </Button>
          </div>

          {/* Faction Selection */}
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-6 border-2 border-newspaper-text hover:border-newspaper-text transition-all hover:scale-105 cursor-pointer group bg-newspaper-bg">
              <div className="flex items-center mb-4">
                <div className="text-3xl mr-3 animate-conspiracy-float">🦎</div>
                <h3 className="font-bold text-xl text-government-blue">
                  DEEP STATE
                </h3>
              </div>
              
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span>Start Truth:</span>
                  <span className="text-government-blue font-bold">40%</span>
                </div>
                <div className="flex justify-between">
                  <span>Bonus IP:</span>
                  <span className="text-government-blue font-bold">+10</span>
                </div>
                <div className="text-xs text-newspaper-text/60 mt-2">
                  Access to Lizard People
                </div>
              </div>
              
              <div className="bg-newspaper-text/10 p-3 mb-4 text-xs italic text-newspaper-text">
                "Control the narrative with black helicopters, weather machines, and surprisingly comfortable underground bunkers."
              </div>
              
              <Button 
                onClick={() => onStartGame('government')}
                className="w-full bg-government-blue hover:bg-government-blue/80 text-white group-hover:animate-pulse"
              >
                Join the Shadow Cabinet
              </Button>
            </Card>

            <Card className="p-6 border-2 border-newspaper-text hover:border-newspaper-text transition-all hover:scale-105 cursor-pointer group bg-newspaper-bg">
              <div className="flex items-center mb-4">
                <div className="text-3xl mr-3 animate-conspiracy-float" style={{ animationDelay: '1s' }}>👁️</div>
                <h3 className="font-bold text-xl text-truth-red">
                  TRUTH SEEKERS
                </h3>
              </div>
              
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span>Start Truth:</span>
                  <span className="text-truth-red font-bold">60%</span>
                </div>
                <div className="flex justify-between">
                  <span>Bonus Truth:</span>
                  <span className="text-truth-red font-bold">+10%</span>
                </div>
                <div className="text-xs text-newspaper-text/60 mt-2">
                  Tinfoil Hat Immunity
                </div>
              </div>
              
              <div className="bg-newspaper-text/10 p-3 mb-4 text-xs italic text-newspaper-text">
                "Wake up the sheeple with essential oils, healing crystals, and really long YouTube videos."
              </div>
              
              <Button 
                onClick={() => onStartGame('truth')}
                className="w-full bg-truth-red hover:bg-truth-red/80 text-white group-hover:animate-pulse"
              >
                Expose the Conspiracy
              </Button>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-newspaper-text/60">
          <div className="mb-2">WARNING: This game contains satirical content</div>
          <div>Any resemblance to actual conspiracies is purely coincidental</div>
          <div className="mt-2 text-newspaper-text">
            [REDACTED] - Classification Level: FOR YOUR EYES ONLY
          </div>
        </div>
      </Card>
    </div>
  );
};

export default GameMenu;