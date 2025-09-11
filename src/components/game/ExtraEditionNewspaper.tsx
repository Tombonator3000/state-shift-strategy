import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface GameOverReport {
  winner: "government" | "truth" | "draw";
  rounds: number;
  finalTruth: number;
  ipPlayer: number;
  ipAI: number;
  statesGov: number;
  statesTruth: number;
  agenda?: { side: "government" | "truth"; name: string; success: boolean };
  topPlays?: string[];
  legendaryUsed?: string[];
  funniestEvent?: string;
  mvpCard?: string;
  durationSec?: number;
}

interface ExtraEditionNewspaperProps {
  report: GameOverReport;
  onClose: () => void;
}

const ExtraEditionNewspaper = ({ report, onClose }: ExtraEditionNewspaperProps) => {
  const [glitching, setGlitching] = useState(false);

  // Glitch effect on masthead
  useEffect(() => {
    const shouldGlitch = Math.random() < 0.15;
    if (shouldGlitch) {
      setGlitching(true);
      setTimeout(() => setGlitching(false), 1500);
    }
  }, []);

  // Generate headlines based on winner
  const generateHeadlines = () => {
    const { winner, finalTruth, statesGov, statesTruth, rounds, legendaryUsed, mvpCard } = report;
    const headlines: string[] = [];

    if (winner === "truth") {
      headlines.push(`SHEEPLE AWAKE! Truth Hits ${finalTruth}% — Government in Disarray!`);
      headlines.push(`Bat Boy Endorses New Regime; Ratings Soar!`);
      if (finalTruth >= 90) headlines.push(`Elvira Declares Victory: 'Leaks Never Sleep!'`);
      if (statesTruth >= 10) headlines.push(`Corn Empire Falls; Popcorn Prices Plunge!`);
    } else if (winner === "government") {
      headlines.push(`ORDER RESTORED! Narrative Lockdown at ${finalTruth}%`);
      headlines.push(`Men in Black Erase All Evidence; Nothing to See Here`);
      if (statesGov >= 10) headlines.push(`Containment Complete: ${statesGov} States Secured`);
      headlines.push(`Candy Confiscation Act Passes — Kids Furious`);
    } else {
      headlines.push(`STALEMATE! Round ${rounds} Ends in Confusion`);
      headlines.push(`Both Sides Claim Victory; Reality Unclear`);
    }

    // Add universal headlines
    headlines.push(`Round ${rounds} Shock: ${statesGov}-${statesTruth} State Split`);
    if (legendaryUsed && legendaryUsed.length > 0) {
      headlines.push(`Legendary Play of the Night: ${legendaryUsed[0]}`);
    }
    if (mvpCard) {
      headlines.push(`MVP Card: "${mvpCard}" Changes Everything`);
    }
    headlines.push(`Florida Man ${getRandomFloridaAntic()} During Count — Officials Shrug`);

    return headlines.slice(0, 4); // Take first 4
  };

  const getRandomFloridaAntic = () => {
    const antics = [
      "Wrestles Alligator",
      "Steals Ice Cream Truck",
      "Builds UFO Landing Pad",
      "Marries Pet Iguana",
      "Declares Independence",
      "Opens Portal to Ohio"
    ];
    return antics[Math.floor(Math.random() * antics.length)];
  };

  const getFakeAds = () => [
    "Buy 2 Tinfoil Hats, Get 3rd Free!",
    "Pastor Rex Miracle Tape — Sees Through Redactions!",
    "Crystal Wi-Fi Chakras — Boosts Truth Meter!",
    "Area 51 Tours — Family Discount (Bring Snacks)"
  ].slice(0, 2);

  const headlines = generateHeadlines();
  const fakeAds = getFakeAds();

  return (
    <div 
      className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 animate-fade-in cursor-pointer"
      onClick={onClose}
      role="dialog"
      aria-label="Game Over — Extra Edition"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
          onClose();
        }
      }}
    >
      <Card className="bg-newspaper-bg text-newspaper-text p-8 max-w-4xl max-h-[90vh] overflow-y-auto border-8 border-truth-red transform animate-[newspaper-spin_0.8s_ease-out] shadow-2xl">
        {/* Header */}
        <div className="text-center border-b-4 border-newspaper-text pb-6 mb-6">
          <h1 className={`text-6xl font-black tracking-wider mb-2 ${glitching ? 'animate-pulse text-truth-red' : ''}`}>
            EXTRA EDITION
          </h1>
          <div className="text-lg font-mono opacity-80">
            THE PARANOID TIMES • FINAL REPORT • {new Date().toLocaleDateString()}
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
                      In a shocking turn of events, the {report.winner === 'draw' ? 'battle ended in complete chaos' : `${report.winner === 'government' ? 'Government' : 'Truth Seekers'} have emerged victorious`} after {report.rounds} intense rounds of shadow operations.
                    </p>
                    <p className="mt-2">
                      Sources close to the situation report unprecedented levels of {report.winner === 'truth' ? 'awakening' : 'containment'} across the continental United States.
                    </p>
                  </div>
                )}
                {index > 0 && (
                  <div className="w-full h-16 bg-gray-300 flex items-center justify-center text-xs opacity-60 mt-2">
                    📰 [Classified Photo]
                  </div>
                )}
              </article>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Box Score */}
            <div className="bg-black/20 p-4 rounded">
              <h3 className="text-lg font-bold mb-3 text-truth-red text-center">📊 FINAL SCORE</h3>
              <div className="space-y-2 text-sm font-mono">
                <div className="flex justify-between">
                  <span>Rounds:</span>
                  <span className="font-bold">{report.rounds}</span>
                </div>
                <div className="flex justify-between">
                  <span>Final Truth:</span>
                  <span className="font-bold">{report.finalTruth}%</span>
                </div>
                <div className="flex justify-between">
                  <span>States:</span>
                  <span className="font-bold">Gov {report.statesGov} — Truth {report.statesTruth}</span>
                </div>
                <div className="flex justify-between">
                  <span>Player IP:</span>
                  <span className="font-bold">{report.ipPlayer}</span>
                </div>
                <div className="flex justify-between">
                  <span>AI IP:</span>
                  <span className="font-bold">{report.ipAI}</span>
                </div>
                {report.mvpCard && (
                  <div className="border-t border-newspaper-text/20 pt-2 mt-2">
                    <div className="text-center">
                      <div className="text-xs opacity-80">MVP CARD</div>
                      <div className="font-bold text-government-blue">{report.mvpCard}</div>
                    </div>
                  </div>
                )}
                {report.agenda && (
                  <div className="border-t border-newspaper-text/20 pt-2 mt-2">
                    <div className="text-center">
                      <div className="text-xs opacity-80">SECRET AGENDA</div>
                      <div className={`font-bold ${report.agenda.success ? 'text-green-400' : 'text-red-400'}`}>
                        {report.agenda.name}
                      </div>
                      <div className="text-xs">
                        {report.agenda.success ? '✅ SUCCESS' : '❌ FAILED'}
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
                {report.winner === 'truth' 
                  ? "The lizard people have been exposed! Democracy is saved!"
                  : report.winner === 'government'
                  ? "Nothing to see here, citizen. Move along."
                  : "Both sides are controlled by Big Pretzel. Wake up!"}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t-4 border-newspaper-text pt-6 mt-8 text-center">
          <div className="text-sm opacity-60 mb-4">
            © 2024 The Paranoid Times • All Conspiracies Reserved • "Trust No One (Except Us)"
          </div>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="bg-truth-red hover:bg-truth-red/80 text-white font-bold text-lg px-8 py-3"
          >
            Return to Main Menu
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ExtraEditionNewspaper;