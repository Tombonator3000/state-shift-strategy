import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState, useRef } from 'react';

const HowToPlay = ({ onClose }: { onClose: () => void }) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(true);

  const scrollTo = (direction: 'up' | 'down') => {
    const scrollElement = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
    if (scrollElement) {
      const scrollAmount = 300;
      const currentScroll = scrollElement.scrollTop;
      const newScroll = direction === 'down' 
        ? currentScroll + scrollAmount 
        : currentScroll - scrollAmount;
      
      scrollElement.scrollTo({
        top: newScroll,
        behavior: 'smooth'
      });
    }
  };

  const handleScroll = (event: any) => {
    const scrollElement = event.target;
    const { scrollTop, scrollHeight, clientHeight } = scrollElement;
    
    setCanScrollUp(scrollTop > 0);
    setCanScrollDown(scrollTop < scrollHeight - clientHeight - 10);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-newspaper-bg border-4 border-secret-red max-w-4xl w-full max-h-[90vh] mx-4 relative">
        {/* Header */}
        <div className="p-6 border-b-2 border-secret-red bg-black text-center">
          <h1 className="text-4xl font-bold text-secret-red font-mono mb-2">
            HOW TO PLAY — SHADOW GOVERNMENT
          </h1>
          <p className="text-sm text-newspaper-text">
            A satirical cat-and-mouse battle for power, truth, and very suspicious pigeons. Learn the rules quickly, play smart, and let the "newspaper" summarize the chaos after each round.
          </p>
        </div>

        <ScrollArea 
          ref={scrollAreaRef}
          className="h-[calc(90vh-200px)] relative"
          onScrollCapture={handleScroll}
        >
          <div className="space-y-6 pr-4 p-6">
            <Card className="p-6 bg-card border-secret-red/20">
              <h2 className="text-2xl font-bold text-secret-red mb-4">Quick Start</h2>
              <ul className="space-y-2 text-sm">
                <li>• Draw a card at the start of your turn (max 7 in hand). Gain +5 IP plus state income.</li>
                <li>• Play up to 3 cards by paying IP (Influence Points). Choose targets if the card requires it.</li>
                <li>• Press Space to end your turn. There's a 25% chance for a random event.</li>
                <li>• Conquer states by building Press to their defense level.</li>
                <li>• Win by controlling 10 states, reaching 200 IP, Truth ≥ 90%/≤ 10%, or completing Secret Agenda.</li>
              </ul>
            </Card>

            <Card className="p-6 bg-card border-secret-red/20">
              <h2 className="text-2xl font-bold text-secret-red mb-4">1) Quick Overview</h2>
              <p className="text-sm">
                Shadow Government is a turn-based strategy card game for two parties: Government (Deep State) and Truth Seekers. You collect IP (Influence Points), manipulate Truth, and fight for control of the USA map. Cards give direct effects, lasting benefits, or press states toward your side. After each round, a newspaper overlay rolls in with headlines, ads, and events - which any respectable truth seeker naturally takes with a grain of salt.
              </p>
              <p className="text-sm mt-2">
                Your goal is to secure dominance: either through broad state control, massive resource advantage, total truth victory, or completing a secret agenda. Meanwhile, your opponent plays by exactly the same rules. Stand firm. Assume everyone lies - except you (of course).
              </p>
            </Card>

            <Card className="p-6 bg-card border-secret-red/20">
              <h2 className="text-2xl font-bold text-secret-red mb-4">2) How to Win</h2>
              <p className="text-sm mb-2">You win immediately when one of these happens:</p>
              <ul className="space-y-1 text-sm ml-4">
                <li>• Control 10 states</li>
                <li>• Reach 200 IP</li>
                <li>• Truth Victory:
                  <ul className="ml-4 mt-1">
                    <li>- Playing Truth: Truth ≥ 90%</li>
                    <li>- Playing Government: Truth ≤ 10%</li>
                  </ul>
                </li>
                <li>• Complete Secret Agenda (Drawn at start. Typically "Own D.C. + 2 neighbors" or similar)</li>
              </ul>
            </Card>

            <Card className="p-6 bg-card border-secret-red/20">
              <h2 className="text-2xl font-bold text-secret-red mb-4">3) Setup and Starting Bonuses</h2>
              <ul className="space-y-1 text-sm ml-4">
                <li>• Baseline Truth: 50%</li>
                <li>• Choose Government: you start with +10 IP and Truth is set to 40-50% (depending on variant)</li>
                <li>• Choose Truth: Truth starts at 60%; you get one extra card draw on first deal</li>
                <li>• Both sides start with 5 cards in hand (Truth can get 6 first round), hand limit 7</li>
              </ul>
            </Card>

            <Card className="p-6 bg-card border-secret-red/20">
              <h2 className="text-2xl font-bold text-secret-red mb-4">5) Turn Step-by-Step</h2>
              <p className="text-sm font-bold mb-2">TURN LOOP: Draw → Play up to 3 cards → Effects → 25% Event → End turn → Opponent</p>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-secret-red">Income</h3>
                  <ul className="space-y-1 text-sm ml-4">
                    <li>• Gain +5 IP base income</li>
                    <li>• State income: each state gives IP equal to its defense (2/3/4)</li>
                    <li>• Any developments (Development cards)</li>
                    <li>• Draw 1 card (not over 7 in hand)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-secret-red">Action</h3>
                  <ul className="space-y-1 text-sm ml-4">
                    <li>• Play up to 3 cards. Pay IP cost</li>
                    <li>• Target if card requires it (state/player/global). Click a state on the map for state targets</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-secret-red">Reaction Window</h3>
                  <ul className="space-y-1 text-sm ml-4">
                    <li>• When you hit opponent with ATTACK/MEDIA, defender can play one DEFENSIVE/INSTANT</li>
                    <li>• Then attacker can play one INSTANT in response</li>
                    <li>• LIFO: Last card out resolves first. Stop when no one plays response</li>
                  </ul>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-card border-secret-red/20">
              <h2 className="text-2xl font-bold text-secret-red mb-4">6) Card Types and Targeting</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <h3 className="font-semibold text-secret-red">MEDIA</h3>
                  <p>Moves Truth up/down. Example: Moon Landing Hoax: +15% Truth in your favor</p>
                </div>
                <div>
                  <h3 className="font-semibold text-secret-red">ZONE</h3>
                  <p>Places Press in chosen state. Example: Local Influence: +1 Press in selected state</p>
                </div>
                <div>
                  <h3 className="font-semibold text-secret-red">ATTACK</h3>
                  <p>Targets opponent's IP/cards/economy. Example: Leaked Documents: opponent −8 IP</p>
                </div>
                <div>
                  <h3 className="font-semibold text-secret-red">TECH</h3>
                  <p>Advanced tools/one-time power. California gives −2 IP on TECH</p>
                </div>
                <div>
                  <h3 className="font-semibold text-secret-red">DEVELOPMENT</h3>
                  <p>Lasting bonuses (e.g., +1 IP/turn, max 3 active)</p>
                </div>
                <div>
                  <h3 className="font-semibold text-secret-red">DEFENSIVE</h3>
                  <p>Shields and counters. Example: Bunker: immune to attacks this round</p>
                </div>
                <div>
                  <h3 className="font-semibold text-secret-red">INSTANT</h3>
                  <p>Immediate response playable in reaction window</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-card border-secret-red/20">
              <h2 className="text-2xl font-bold text-secret-red mb-4">7) Map & States</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <h3 className="font-semibold text-secret-red">Defense Levels</h3>
                  <ul className="ml-4">
                    <li>• Most states: 2 defense</li>
                    <li>• CA/NY/TX/FL/PA/IL (etc.): 3 defense</li>
                    <li>• DC/AK/HI: 4 defense</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-secret-red">State Bonuses</h3>
                  <ul className="ml-4">
                    <li>• Texas: +2 IP per turn (economy)</li>
                    <li>• New York: −2 IP on MEDIA cards</li>
                    <li>• California: −2 IP on TECH cards</li>
                    <li>• D.C.: +5 on Truth manipulation</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-secret-red">Conquest</h3>
                  <p>When your Press ≥ Defense in a state during Resolution, you take control. Both sides' Press resets to 0 there.</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-card border-secret-red/20">
              <h2 className="text-2xl font-bold text-secret-red mb-4">Tips</h2>
              <ul className="space-y-1 text-sm ml-4">
                <li>• Secure an economic base: Texas, plus 2-3 mid-states with defense 2 gives steady IP</li>
                <li>• Synchronize MEDIA cards with D.C. for big truth swings</li>
                <li>• Press broad border states to open multiple fronts</li>
                <li>• Keep one defensive card in reserve when you suspect a big attack</li>
              </ul>
            </Card>
          </div>
        </ScrollArea>

        {/* Scroll Buttons */}
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex flex-col gap-2 z-10">
          <Button
            size="sm"
            variant="outline"
            className={`h-8 w-8 p-0 bg-black/80 border-secret-red text-secret-red hover:bg-secret-red hover:text-black transition-all ${
              !canScrollUp ? 'opacity-30 cursor-not-allowed' : ''
            }`}
            onClick={() => scrollTo('up')}
            disabled={!canScrollUp}
          >
            <ChevronUp size={16} />
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            className={`h-8 w-8 p-0 bg-black/80 border-secret-red text-secret-red hover:bg-secret-red hover:text-black transition-all ${
              !canScrollDown ? 'opacity-30 cursor-not-allowed' : ''
            }`}
            onClick={() => scrollTo('down')}
            disabled={!canScrollDown}
          >
            <ChevronDown size={16} />
          </Button>
        </div>

        {/* Close Button */}
        <div className="absolute top-4 right-4">
          <Button 
            onClick={onClose}
            variant="outline"
            className="bg-black/80 border-secret-red text-secret-red hover:bg-secret-red hover:text-black"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HowToPlay;