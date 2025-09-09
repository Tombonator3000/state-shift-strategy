import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface HowToPlayProps {
  onBack: () => void;
}

const HowToPlay = ({ onBack }: HowToPlayProps) => {
  return (
    <div className="min-h-screen bg-government-dark text-foreground p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 text-center">
          <h1 className="text-4xl font-bold text-secret-red mb-2">
            How to Play — Shadow Government
          </h1>
          <p className="text-muted-foreground">
            A satirical cat-and-mouse battle for power, truth, and very suspicious doves. 
            Learn the rules quickly, play smart, and let the "newspaper" summarize the chaos after each round.
          </p>
        </div>

        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="space-y-6">
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
              <p className="text-sm mb-4">
                Shadow Government is a turn-based strategy card game for two parties: Government (Deep State) and Truth Seekers. 
                You collect IP (Influence Points), manipulate Truth, and fight for control over the USA map. 
                Cards provide direct effects, lasting benefits, or pressure states toward your side.
              </p>
              <p className="text-sm">
                After each round, a newspaper overlay rolls in with headlines, ads, and events – which any respectable 
                truth seeker naturally takes with a grain of salt.
              </p>
            </Card>

            <Card className="p-6 bg-card border-secret-red/20">
              <h2 className="text-2xl font-bold text-secret-red mb-4">3) How to Win</h2>
              <p className="text-sm mb-2">You win immediately when one of these happens:</p>
              <ul className="space-y-2 text-sm">
                <li>• Control 10 states</li>
                <li>• Reach 200 IP</li>
                <li>• Truth Victory:
                  <ul className="ml-4 mt-1 space-y-1">
                    <li>- Playing Truth: Truth ≥ 90%</li>
                    <li>- Playing Government: Truth ≤ 10%</li>
                  </ul>
                </li>
                <li>• Complete Secret Agenda (Drawn at start. Typically "Own D.C. + 2 neighbors" or similar)</li>
              </ul>
            </Card>

            <Card className="p-6 bg-card border-secret-red/20">
              <h2 className="text-2xl font-bold text-secret-red mb-4">4) Setup and Starting Bonuses</h2>
              <ul className="space-y-2 text-sm">
                <li>• Baseline Truth: 50%</li>
                <li>• Choose Government: you start with +10 IP and Truth is set to 40–50%</li>
                <li>• Choose Truth: Truth starts at 60%; you get one extra card draw at first deal</li>
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
                    <li>• Target if card requires it (state/player/global). Click a state on map for state targets</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-secret-red">Reaction Window</h3>
                  <ul className="space-y-1 text-sm ml-4">
                    <li>• When you hit opponent with ATTACK/MEDIA, defender can play one DEFENSIVE/INSTANT</li>
                    <li>• Then attacker can respond with one INSTANT</li>
                    <li>• LIFO: Last card played resolves first. Stop when no one responds</li>
                  </ul>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-card border-secret-red/20">
              <h2 className="text-2xl font-bold text-secret-red mb-4">6) Card Types and Targeting</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <strong className="text-secret-red">MEDIA</strong> – Moves Truth up/down
                  <br />
                  <em>Moon Landing Hoax: +15% Truth in your favor. If you own D.C., get +5 extra on such cards.</em>
                </div>
                
                <div>
                  <strong className="text-secret-red">ZONE</strong> – Adds Press to chosen state
                  <br />
                  <em>Local Influence: +1 Press to chosen state.</em>
                </div>
                
                <div>
                  <strong className="text-secret-red">ATTACK</strong> – Hits opponent's IP/cards/economy
                  <br />
                  <em>Leaked Documents: opponent −8 IP.</em>
                </div>
                
                <div>
                  <strong className="text-secret-red">TECH</strong> – Advanced tools/one-time power
                  <br />
                  <em>California gives −2 IP on TECH.</em>
                </div>
                
                <div>
                  <strong className="text-secret-red">DEVELOPMENT</strong> – Lasting bonuses
                  <br />
                  <em>e.g. +1 IP/turn, max 3 active</em>
                </div>
                
                <div>
                  <strong className="text-secret-red">DEFENSIVE</strong> – Shields and counters
                  <br />
                  <em>Bunker: immune to attacks this round. [REDACTED]: counter next enemy card.</em>
                </div>
                
                <div>
                  <strong className="text-secret-red">INSTANT</strong> – Immediate response playable in reaction window
                  <br />
                  <em>Crisis Actors: enemy skips one card action.</em>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-card border-secret-red/20">
              <h2 className="text-2xl font-bold text-secret-red mb-4">7) Map & States</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <strong className="text-secret-red">Defense:</strong> Each state has 2/3/4 defense
                  <ul className="ml-4 space-y-1">
                    <li>• Most are 2</li>
                    <li>• CA/NY/TX/FL/PA/IL (etc.) are 3</li>
                    <li>• DC/AK/HI are 4</li>
                  </ul>
                </div>
                
                <div>
                  <strong className="text-secret-red">Special Bonuses:</strong>
                  <ul className="ml-4 space-y-1">
                    <li>• Texas: +2 IP per round (economy)</li>
                    <li>• New York: −2 IP on MEDIA</li>
                    <li>• California: −2 IP on TECH</li>
                    <li>• D.C.: +5 on Truth manipulation</li>
                  </ul>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-card border-secret-red/20">
              <h2 className="text-2xl font-bold text-secret-red mb-4">Tips</h2>
              <ul className="space-y-2 text-sm">
                <li>• Secure an economic base: Texas, plus 2–3 mid-states with defense 2 gives steady IP</li>
                <li>• Synchronize MEDIA cards with D.C. for big truth swings</li>
                <li>• Pressure wide border states to open multiple fronts</li>
                <li>• Keep one defensive card in pocket when you suspect a big attack</li>
              </ul>
            </Card>
          </div>
        </ScrollArea>

        <div className="mt-6 text-center">
          <Button onClick={onBack} className="bg-secret-red hover:bg-secret-red/80">
            Back to Menu
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HowToPlay;