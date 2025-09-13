import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

interface StartScreenTabloidProps {
  onStartGame: () => void;
  onManageExpansions: () => void;
  onHowToPlay: () => void;
  onOptions: () => void;
  onCredits: () => void;
  onCardCollection: () => void;
  onLoadGame?: () => boolean;
  getSaveInfo?: () => any;
  audio?: any;
}

const StartScreenTabloid = ({ 
  onStartGame, 
  onManageExpansions, 
  onHowToPlay, 
  onOptions, 
  onCredits,
  onCardCollection,
  onLoadGame,
  getSaveInfo,
  audio
}: StartScreenTabloidProps) => {
  const [glitching, setGlitching] = useState(false);
  const [redactedText, setRedactedText] = useState('SHADOW GOVERNMENT');

  useEffect(() => {
    const glitchTexts = ['SHEEPLE TIMES', 'THE TRUTH DAILY', 'SHADOW GOVERNMENT', 'DEEP STATE WEEKLY'];
    
    const interval = setInterval(() => {
      if (Math.random() < 0.15) {
        setGlitching(true);
        setRedactedText(glitchTexts[Math.floor(Math.random() * glitchTexts.length)]);
        setTimeout(() => {
          setGlitching(false);
          setRedactedText('SHADOW GOVERNMENT');
        }, 1500);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const tabloidButtonClass = `
    w-full border-2 border-black bg-white text-black
    text-xl md:text-2xl font-extrabold uppercase tracking-wide
    px-4 py-3
    shadow-[6px_6px_0_#000] hover:shadow-[4px_4px_0_#000] active:shadow-[2px_2px_0_#000]
    transition-transform hover:translate-x-[1px] hover:translate-y-[1px]
    active:translate-x-[2px] active:translate-y-[2px]
    focus:outline-none focus:ring-4 focus:ring-gray-300
  `;

  return (
    <div className="min-h-screen bg-[var(--paper)] flex items-center justify-center p-4 md:p-8">
      <div className="max-w-[980px] mx-auto w-full">
        {/* Masthead */}
        <div className="border-4 border-black bg-white px-4 py-2 mb-3">
          <div className="flex items-center justify-between">
            <h1 className="font-black uppercase tracking-tight text-4xl md:text-6xl text-black">
              THE PARANOID TIMES
            </h1>
            <div className="bg-black text-white px-2 py-1 text-xs font-black uppercase tracking-wider">
              TIMES
            </div>
          </div>
          <div className="mt-2 bg-black text-white font-black uppercase text-xs md:text-sm px-2 py-1">
            MIND-BLOWING NEWS YOU WON'T BELIEVE!
          </div>
        </div>

        {/* Top Grid - Two Article Boxes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
          <div className="border-4 border-black bg-white p-2">
            <div className="aspect-[4/3] bg-[#e9e9e9] border-2 border-black mb-2"></div>
            <h2 className="font-black uppercase tracking-tight text-lg md:text-xl text-black text-center">
              A.I. CONTROL GRID<br/>EXPOSED
            </h2>
          </div>
          <div className="border-4 border-black bg-white p-2">
            <div className="aspect-[4/3] bg-[#e9e9e9] border-2 border-black mb-2"></div>
            <h2 className="font-black uppercase tracking-tight text-lg md:text-xl text-black text-center">
              BAT BOY<br/>SIGHTED IN C.
            </h2>
          </div>
        </div>

        {/* Giant Title Block */}
        <div className="border-4 border-black bg-white py-6 mt-4">
          <div className="flex items-center justify-center space-x-4">
            <div className="h-3 w-16 bg-[#dcdcdc]"></div>
            <div className="h-3 w-12 bg-[#dcdcdc]"></div>
            <div className="h-3 w-8 bg-[#dcdcdc]"></div>
          </div>
          <h1 className={`text-5xl md:text-7xl font-black uppercase tracking-tight text-center text-black my-4 ${glitching ? 'animate-pulse' : ''}`}>
            {redactedText}
          </h1>
          <div className="flex items-center justify-center space-x-4">
            <div className="h-3 w-8 bg-[#dcdcdc]"></div>
            <div className="h-3 w-12 bg-[#dcdcdc]"></div>
            <div className="h-3 w-16 bg-[#dcdcdc]"></div>
          </div>
        </div>

        {/* Buttons Section */}
        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,520px)_minmax(0,1fr)] gap-4 mt-4 items-start">
          {/* Left Column - Main Buttons */}
          <div className="space-y-4">
            <Button 
              onClick={() => {
                audio?.playSFX?.('click');
                onStartGame();
              }}
              className={tabloidButtonClass}
            >
              NEW GAME
            </Button>
            <Button 
              onClick={() => {
                audio?.playSFX?.('click');
                onManageExpansions();
              }}
              className={tabloidButtonClass}
            >
              MANAGE EXPANSIONS
            </Button>
            <Button 
              onClick={() => {
                audio?.playSFX?.('click');
                onHowToPlay();
              }}
              className={tabloidButtonClass}
            >
              HOW TO PLAY
            </Button>
            <Button 
              onClick={() => {
                audio?.playSFX?.('click');
                onOptions();
              }}
              className={tabloidButtonClass}
            >
              OPTIONS
            </Button>
          </div>

          {/* Right Column - Continue Faksimile */}
          <div className="border-4 border-black bg-white p-4 transform rotate-1">
            <div className="aspect-[4/3] bg-[#e9e9e9] border-2 border-black mb-2 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-black text-white px-3 py-2 font-black uppercase text-xl transform -rotate-12">
                  CONTINUE
                </div>
              </div>
            </div>
            <div className="space-y-1 text-[#ccc] text-xs">
              <div className="h-2 bg-[#e9e9e9] w-full"></div>
              <div className="h-2 bg-[#e9e9e9] w-3/4"></div>
              <div className="h-2 bg-[#e9e9e9] w-1/2"></div>
            </div>
            {getSaveInfo?.() && (
              <Button 
                onClick={() => {
                  audio?.playSFX?.('click');
                  if (onLoadGame) {
                    const success = onLoadGame();
                    if (success) {
                      const indicator = document.createElement('div');
                      indicator.textContent = '✓ GAME LOADED';
                      indicator.className = 'fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded z-[60] animate-fade-in';
                      document.body.appendChild(indicator);
                      setTimeout(() => indicator.remove(), 2000);
                    }
                  }
                }}
                className={`${tabloidButtonClass} mt-2 text-sm py-2`}
              >
                CONTINUE (Turn {getSaveInfo?.()?.turn})
              </Button>
            )}
          </div>
        </div>

        {/* Bottom Row - Secondary Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <Button 
            onClick={() => {
              audio?.playSFX?.('click');
              onCredits();
            }}
            className={tabloidButtonClass}
          >
            CREDITS
          </Button>
          <Button 
            onClick={() => {
              audio?.playSFX?.('click');
              onCardCollection();
            }}
            className={tabloidButtonClass}
          >
            📚 CARD COLLECTION
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StartScreenTabloid;