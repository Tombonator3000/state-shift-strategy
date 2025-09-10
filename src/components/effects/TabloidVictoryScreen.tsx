import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface TabloidVictoryScreenProps {
  isVisible: boolean;
  isVictory: boolean;
  victoryType: 'states' | 'ip' | 'truth' | 'agenda' | null;
  playerFaction: 'truth' | 'government';
  gameStats: {
    rounds: number;
    finalTruth: number;
    playerIP: number;
    aiIP: number;
    playerStates: number;
    aiStates: number;
    mvpCard?: string;
    agenda?: { name: string; complete: boolean };
  };
  onClose: () => void;
}

const TabloidVictoryScreen = ({ 
  isVisible, 
  isVictory, 
  victoryType, 
  playerFaction, 
  gameStats, 
  onClose 
}: TabloidVictoryScreenProps) => {
  const [glitching, setGlitching] = useState(false);
  const [confetti, setConfetti] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);

  useEffect(() => {
    if (isVisible) {
      // Generate confetti particles
      const particles = Array.from({ length: 40 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 2000
      }));
      setConfetti(particles);

      // Glitch effect
      const shouldGlitch = Math.random() < 0.2;
      if (shouldGlitch) {
        setGlitching(true);
        setTimeout(() => setGlitching(false), 1500);
      }
    }
  }, [isVisible]);

  if (!isVisible) return null;

  const generateHeadlines = () => {
    const headlines: string[] = [];
    
    if (isVictory) {
      // Victory headlines based on type and faction
      switch (victoryType) {
        case 'truth':
          if (playerFaction === 'truth') {
            headlines.push(`TRUTH BOMB EXPLODES! Citizens Wake Up at ${gameStats.finalTruth}%!`);
            headlines.push(`Government Narrative SHATTERED — Conspiracy Theorists Vindicated!`);
          } else {
            headlines.push(`TRUTH SUPPRESSED! Disinformation Campaign Succeeds at ${gameStats.finalTruth}%!`);
            headlines.push(`Sheep Remain Asleep — Big Brother Smiles!`);
          }
          break;
        case 'states':
          headlines.push(`TERRITORIAL VICTORY! ${gameStats.playerStates} States Liberated!`);
          headlines.push(`Shadow Network Dominates Heartland — Corn Futures Soar!`);
          break;
        case 'ip':
          headlines.push(`INFLUENCE OVERFLOW! Power Level: ${gameStats.playerIP} IP!`);
          headlines.push(`Shadow Budget Exceeds Pentagon — Aliens Nervous!`);
          break;
        case 'agenda':
          headlines.push(`SECRET AGENDA COMPLETE! Mission: ${gameStats.agenda?.name}!`);
          headlines.push(`Classified Operation Success — Men in Black Celebrate!`);
          break;
      }
    } else {
      // Defeat headlines
      headlines.push(`CRUSHING DEFEAT! Opposition Claims Victory!`);
      headlines.push(`Conspiracy Network EXPOSED — Mass Arrests Expected!`);
      if (gameStats.finalTruth < 30) {
        headlines.push(`Truth Meter Flatlines at ${gameStats.finalTruth}% — Democracy Dies!`);
      } else if (gameStats.finalTruth > 70) {
        headlines.push(`Truth Overdose at ${gameStats.finalTruth}% — Society Collapses!`);
      }
    }

    // Universal headlines
    headlines.push(`Round ${gameStats.rounds} Shocker: ${gameStats.playerStates}-${gameStats.aiStates} State Split!`);
    if (gameStats.mvpCard) {
      headlines.push(`MVP Card "${gameStats.mvpCard}" Changes Everything!`);
    }
    headlines.push(`Florida Man ${getRandomFloridaAntic()} During Final Count!`);
    
    return headlines.slice(0, 4);
  };

  const getRandomFloridaAntic = () => {
    const antics = [
      "Builds Time Machine",
      "Adopts Alien Pet",
      "Declares War on Gravity",
      "Opens Dimension Portal",
      "Marries Pizza Slice",
      "Becomes Cryptid Mayor"
    ];
    return antics[Math.floor(Math.random() * antics.length)];
  };

  const getFakeAds = () => {
    const ads = [
      "Lizard People Dating App — Cold-Blooded Connections!",
      "Area 51 Escape Rooms — Bring Your Own Tin Foil!",
      "Bigfoot Photography Classes — Blurry Pics Guaranteed!",
      "Illuminati Membership Drive — Triangle Badges Included!"
    ];
    return ads.slice(0, 2);
  };

  const getConspiracyTheory = () => {
    if (isVictory) {
      return playerFaction === 'truth' 
        ? "The simulation is cracking! We're breaking through the matrix!"
        : "Order from chaos achieved. The plan proceeds as foretold.";
    } else {
      return "This was all part of the deeper conspiracy. Level 2 activated.";
    }
  };

  const headlines = generateHeadlines();
  const fakeAds = getFakeAds();
  const { playerStates, aiStates } = gameStats;

  return (
    <div 
      className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 animate-fade-in cursor-pointer"
      onClick={onClose}
      role="dialog"
      aria-label={isVictory ? "Victory - Extra Edition" : "Defeat - Extra Edition"}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
          onClose();
        }
      }}
    >
      {/* Confetti */}
      {isVictory && confetti.map(particle => (
        <div
          key={particle.id}
          className="absolute w-2 h-2 bg-truth-red animate-[confetti_3s_ease-out_infinite]"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animationDelay: `${particle.delay}ms`
          }}
        />
      ))}

      <Card className="bg-newspaper-bg text-newspaper-text p-8 max-w-4xl max-h-[90vh] overflow-y-auto border-8 border-truth-red transform animate-[newspaper-spin_0.8s_ease-out] shadow-2xl">
        {/* Header */}
        <div className="text-center border-b-4 border-newspaper-text pb-6 mb-6">
          <h1 className={`text-6xl font-black tracking-wider mb-2 animate-pulse ${
            isVictory ? 'text-green-400' : 'text-red-500'
          } ${glitching ? 'animate-pulse text-truth-red' : ''}`}>
            {isVictory ? '🏆 VICTORY!' : '💀 DEFEAT!'}
          </h1>
          <div className="text-2xl font-bold mb-2">
            {isVictory ? 'EXTRA EDITION' : 'FINAL EDITION'}
          </div>
          <div className="text-lg font-mono opacity-80">
            THE PARANOID TIMES • {new Date().toLocaleDateString()} • "TRUST NO ONE"
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="absolute top-4 right-4 text-newspaper-text hover:text-truth-red"
          >
            <X className="w-6 h-6" />
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-8">
          {/* Main Headlines */}
          <div className="col-span-2 space-y-6">
            {headlines.map((headline, index) => (
              <article key={index} className={`${index === 0 ? 'text-2xl font-black' : 'text-lg font-bold'} mb-4`}>
                <h2 className="mb-2 leading-tight">{headline}</h2>
                {index === 0 && (
                  <div className="text-sm font-normal opacity-80 leading-relaxed">
                    <p>
                      In a {isVictory ? 'stunning victory' : 'devastating defeat'}, the {playerFaction === 'truth' ? 'Truth Seekers' : 'Government'} have {isVictory ? 'emerged triumphant' : 'suffered catastrophic losses'} after {gameStats.rounds} rounds of intense shadow warfare.
                    </p>
                    <p className="mt-2">
                      Sources report unprecedented {isVictory ? 'celebration' : 'chaos'} as the truth meter reached {gameStats.finalTruth}% and influence networks {isVictory ? 'solidified' : 'crumbled'} across the continental United States.
                    </p>
                  </div>
                )}
                {index > 0 && (
                  <div className="w-full h-16 bg-gray-300 flex items-center justify-center text-xs opacity-60 mt-2">
                    📰 [{isVictory ? 'Celebration' : 'Classified'} Photo]
                  </div>
                )}
              </article>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Final Score */}
            <div className={`bg-black/20 p-4 rounded border-2 ${isVictory ? 'border-green-400' : 'border-red-500'}`}>
              <h3 className={`text-lg font-bold mb-3 text-center ${isVictory ? 'text-green-400' : 'text-red-500'}`}>
                📊 FINAL SCORE
              </h3>
              <div className="space-y-2 text-sm font-mono">
                <div className="flex justify-between">
                  <span>Result:</span>
                  <span className={`font-bold ${isVictory ? 'text-green-400' : 'text-red-500'}`}>
                    {isVictory ? 'VICTORY' : 'DEFEAT'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Rounds:</span>
                  <span className="font-bold">{gameStats.rounds}</span>
                </div>
                <div className="flex justify-between">
                  <span>Final Truth:</span>
                  <span className="font-bold">{gameStats.finalTruth}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Your IP:</span>
                  <span className="font-bold">{gameStats.playerIP}</span>
                </div>
                <div className="flex justify-between">
                  <span>AI IP:</span>
                  <span className="font-bold">{gameStats.aiIP}</span>
                </div>
                <div className="flex justify-between">
                  <span>States:</span>
                  <span className="font-bold">{playerStates} vs {aiStates}</span>
                </div>
                {gameStats.mvpCard && (
                  <div className="border-t border-newspaper-text/20 pt-2 mt-2">
                    <div className="text-center">
                      <div className="text-xs opacity-80">MVP CARD</div>
                      <div className="font-bold text-government-blue">{gameStats.mvpCard}</div>
                    </div>
                  </div>
                )}
                {gameStats.agenda && (
                  <div className="border-t border-newspaper-text/20 pt-2 mt-2">
                    <div className="text-center">
                      <div className="text-xs opacity-80">SECRET AGENDA</div>
                      <div className={`font-bold ${gameStats.agenda.complete ? 'text-green-400' : 'text-red-400'}`}>
                        {gameStats.agenda.name}
                      </div>
                      <div className="text-xs">
                        {gameStats.agenda.complete ? '✅ COMPLETE' : '❌ FAILED'}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Fake Ads */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-center text-government-blue">📢 CLASSIFIED ADS</h3>
              {fakeAds.map((ad, index) => (
                <div key={index} className="bg-government-blue/10 p-3 rounded text-center text-sm border border-government-blue/30">
                  {ad}
                </div>
              ))}
            </div>

            {/* Conspiracy Corner */}
            <div className="bg-truth-red/10 p-4 rounded border border-truth-red/30">
              <h3 className="text-lg font-bold mb-2 text-truth-red text-center">🕵️ CONSPIRACY CORNER</h3>
              <div className="text-sm italic text-center">
                {getConspiracyTheory()}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t-4 border-newspaper-text pt-6 mt-8 text-center">
          <div className="text-sm opacity-60 mb-4">
            © 2024 The Paranoid Times • All Conspiracies Reserved • "The Truth Is Out There (Somewhere)"
          </div>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className={`font-bold text-lg px-8 py-3 text-white ${
              isVictory 
                ? 'bg-green-500 hover:bg-green-600' 
                : 'bg-red-500 hover:bg-red-600'
            }`}
          >
            Return to Main Menu
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default TabloidVictoryScreen;