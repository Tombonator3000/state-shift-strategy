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

      <Card className="bg-newspaper-bg text-newspaper-text p-0 max-w-5xl max-h-[95vh] overflow-y-auto border-4 border-newspaper-border transform animate-[newspaper-spin_0.8s_ease-out] shadow-2xl font-serif">
        {/* Newspaper Header */}
        <div className="bg-newspaper-header p-6 border-b-8 border-newspaper-border relative">
          {/* Masthead */}
          <div className="text-center mb-4">
            <div className="text-xs font-bold tracking-widest mb-1 opacity-60">ESTABLISHED 1947 • CIRCULATION: CLASSIFIED</div>
            <h1 className="text-5xl font-black tracking-tighter font-serif mb-1" style={{fontFamily: 'serif'}}>
              THE WEEKLY PARANOID NEWS
            </h1>
            <div className="flex justify-between items-center text-xs font-bold border-t border-b border-newspaper-border py-1">
              <span>Vol. 77, No. {gameStats.rounds}</span>
              <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              <span>Price: YOUR SOUL</span>
            </div>
          </div>
          
          {/* Main Headline */}
          <div className="text-center py-4 border-y-4 border-newspaper-border bg-newspaper-bg/50">
            <div className={`text-7xl font-black tracking-tight font-serif leading-none ${
              isVictory ? 'text-newspaper-accent' : 'text-red-600'
            } ${glitching ? 'animate-pulse text-truth-red' : ''}`}>
              {isVictory ? 'VICTORY!' : 'DEFEAT!'}
            </div>
            <div className="text-2xl font-bold mt-2 tracking-wide">
              {isVictory ? 'SHADOW OPERATIVE SUCCEEDS' : 'CONSPIRACY EXPOSED'}
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="absolute top-2 right-2 text-newspaper-text hover:text-truth-red bg-white/80 hover:bg-white"
          >
            <X className="w-6 h-6" />
          </Button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-4 gap-6">
            {/* Main Article */}
            <div className="col-span-3">
              {headlines.map((headline, index) => (
                <article key={index} className={`${index === 0 ? 'mb-6' : 'mb-4'} ${index > 0 ? 'border-t border-newspaper-border pt-4' : ''}`}>
                  <h2 className={`font-black font-serif leading-tight mb-2 ${
                    index === 0 ? 'text-3xl' : index === 1 ? 'text-xl' : 'text-lg'
                  }`}>
                    {headline}
                  </h2>
                  {index === 0 && (
                    <div className="columns-2 gap-6 text-sm leading-relaxed text-justify">
                      <p className="mb-3">
                        <span className="float-left text-6xl font-black leading-none mr-2 mt-1">{isVictory ? 'I' : 'I'}</span>
                        n a {isVictory ? 'stunning victory that has shocked the intelligence community' : 'devastating defeat that will echo through classified corridors'}, 
                        the {playerFaction === 'truth' ? 'Truth Seekers resistance movement' : 'Government shadow operations'} have {isVictory ? 'emerged triumphant' : 'suffered catastrophic losses'} 
                        after {gameStats.rounds} rounds of intense psychological warfare.
                      </p>
                      <p className="mb-3">
                        Leaked sources from within the Pentagon report unprecedented {isVictory ? 'celebration in underground bunkers' : 'emergency protocols activated'} as 
                        the national truth awareness meter reached a critical {gameStats.finalTruth}% threshold. Military analysts confirm that influence networks have 
                        {isVictory ? ' successfully solidified control' : ' catastrophically crumbled'} across strategic nodes in the continental United States.
                      </p>
                      <p className="mb-3">
                        "This changes everything," whispered a high-ranking official who requested anonymity while adjusting their tin foil hat. 
                        "The simulation parameters have been permanently altered. We're not in Kansas anymore."
                      </p>
                      <p>
                        Emergency sessions have been called at locations that officially don't exist, while citizens remain blissfully unaware that their reality 
                        has been fundamentally restructured during their morning coffee.
                      </p>
                    </div>
                  )}
                  {index === 1 && (
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <div className="w-full h-20 bg-newspaper-header border border-newspaper-border flex items-center justify-center text-xs font-bold mb-2">
                          📸 CLASSIFIED SURVEILLANCE PHOTO
                        </div>
                        <p className="text-sm leading-relaxed text-justify">
                          Exclusive footage captured by our network of citizen journalists reveals the exact moment when 
                          the balance of power shifted. Government sources neither confirm nor deny the authenticity of these images.
                        </p>
                      </div>
                    </div>
                  )}
                  {index > 1 && (
                    <p className="text-sm opacity-80 italic">
                      Developing story... More classified details on page 7 (if you have proper clearance level).
                    </p>
                  )}
                </article>
              ))}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Final Intel Report */}
              <div className={`bg-newspaper-header/50 p-4 border-2 ${isVictory ? 'border-newspaper-accent' : 'border-red-500'}`}>
                <h3 className="text-lg font-black text-center mb-3 font-serif border-b border-newspaper-border pb-2">
                  📊 FINAL INTEL REPORT
                </h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between border-b border-newspaper-border/30 py-1">
                    <span className="font-bold">OPERATION STATUS:</span>
                    <span className={`font-black ${isVictory ? 'text-newspaper-accent' : 'text-red-600'}`}>
                      {isVictory ? 'SUCCESS' : 'COMPROMISED'}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-newspaper-border/30 py-1">
                    <span>Rounds Executed:</span>
                    <span className="font-bold">{gameStats.rounds}</span>
                  </div>
                  <div className="flex justify-between border-b border-newspaper-border/30 py-1">
                    <span>Truth Level:</span>
                    <span className="font-bold">{gameStats.finalTruth}%</span>
                  </div>
                  <div className="flex justify-between border-b border-newspaper-border/30 py-1">
                    <span>Your Network:</span>
                    <span className="font-bold">{gameStats.playerIP} IP</span>
                  </div>
                  <div className="flex justify-between border-b border-newspaper-border/30 py-1">
                    <span>Enemy Network:</span>
                    <span className="font-bold">{gameStats.aiIP} IP</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Territories:</span>
                    <span className="font-bold">{playerStates} vs {aiStates}</span>
                  </div>
                  {gameStats.mvpCard && (
                    <div className="border-t border-newspaper-border pt-2 mt-2 text-center">
                      <div className="text-xs font-bold opacity-80">ASSET OF THE DAY</div>
                      <div className="font-black text-government-blue text-sm">{gameStats.mvpCard}</div>
                    </div>
                  )}
                  {gameStats.agenda && (
                    <div className="border-t border-newspaper-border pt-2 mt-2 text-center">
                      <div className="text-xs font-bold opacity-80">SECRET MISSION</div>
                      <div className={`font-bold text-sm ${gameStats.agenda.complete ? 'text-newspaper-accent' : 'text-red-600'}`}>
                        {gameStats.agenda.name}
                      </div>
                      <div className="text-xs font-bold">
                        {gameStats.agenda.complete ? '✓ ACCOMPLISHED' : '✗ FAILED'}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Weather & Classified Ads */}
              <div className="bg-newspaper-header/30 p-3 border border-newspaper-border">
                <h4 className="font-black text-sm text-center mb-2 border-b border-newspaper-border pb-1">
                  TODAY'S WEATHER
                </h4>
                <div className="text-xs text-center">
                  <div>🌫️ Fog of War: Heavy</div>
                  <div>🔍 Visibility: Classified</div>
                  <div>🎭 Chance of Deception: 99%</div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-black text-sm text-center border-b border-newspaper-border pb-1">
                  📢 CLASSIFIED MARKETPLACE
                </h4>
                {fakeAds.map((ad, index) => (
                  <div key={index} className="bg-newspaper-header/20 p-2 text-xs text-center border border-newspaper-border/50">
                    {ad}
                  </div>
                ))}
              </div>

              {/* Conspiracy Corner */}
              <div className="bg-truth-red/10 p-3 border-2 border-truth-red/40">
                <h4 className="font-black text-sm text-center mb-2 text-truth-red border-b border-truth-red/30 pb-1">
                  🔻 DEEP STATE UPDATE
                </h4>
                <div className="text-xs italic text-center leading-relaxed">
                  {getConspiracyTheory()}
                </div>
              </div>

              {/* Stock Market Ticker */}
              <div className="bg-newspaper-header/30 p-2 border border-newspaper-border">
                <h4 className="font-black text-xs text-center mb-1">📈 SHADOW MARKETS</h4>
                <div className="text-xs space-y-1">
                  <div className="flex justify-between">
                    <span>Aluminum Foil:</span>
                    <span className="text-green-600">↗ +420%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Trust Index:</span>
                    <span className="text-red-600">↘ -{100 - gameStats.finalTruth}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Paranoia Futures:</span>
                    <span className="text-green-600">↗ +∞%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-newspaper-header border-t-4 border-newspaper-border p-4">
          <div className="flex justify-between items-center text-xs border-b border-newspaper-border pb-2 mb-3">
            <div>© 2024 The Weekly Paranoid News</div>
            <div>All Rights Reserved Under Alien Treaty 4B7</div>
            <div>Printed on Recycled Surveillance Reports</div>
          </div>
          <div className="text-center">
            <div className="text-xs mb-3 italic opacity-80">
              "Remember: They're Watching, But So Are We" • Established When Truth Mattered
            </div>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className={`font-bold text-lg px-8 py-3 ${
                isVictory 
                  ? 'bg-newspaper-accent hover:bg-newspaper-accent/80 text-white' 
                  : 'bg-red-600 hover:bg-red-700 text-white'
              } border-2 border-newspaper-border shadow-lg transform hover:scale-105 transition-all`}
            >
              📰 Return to Base Operations
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TabloidVictoryScreen;