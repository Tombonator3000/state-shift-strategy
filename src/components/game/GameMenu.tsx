import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface GameMenuProps {
  onStartGame: (faction: 'government' | 'truth') => void;
}

const GameMenu = ({ onStartGame }: GameMenuProps) => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <Card className="max-w-2xl w-full p-8 bg-card/50 border-2">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold font-mono text-secret-red mb-2">
            SHADOW GOVERNMENT
          </h1>
          <div className="text-sm font-mono text-muted-foreground">
            [CLASSIFIED DOSSIER - CLEARANCE LEVEL: COSMIC]
          </div>
        </div>

        <div className="space-y-6">
          {/* Faction Selection */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6 border-2 border-government-blue/50 hover:border-government-blue transition-colors cursor-pointer">
              <h3 className="font-bold text-lg mb-3 text-government-blue font-mono">
                DEEP STATE
              </h3>
              <div className="space-y-2 text-sm mb-4">
                <div>• Start Truth: 40%</div>
                <div>• Bonus IP: +10</div>
                <div>• Objective: Suppress truth, maintain control</div>
              </div>
              <div className="text-xs italic text-muted-foreground mb-4">
                "The public doesn't need to know everything..."
              </div>
              <Button 
                onClick={() => onStartGame('government')}
                className="w-full bg-government-blue hover:bg-government-blue/80"
              >
                Join the Shadow Cabinet
              </Button>
            </Card>

            <Card className="p-6 border-2 border-truth-red/50 hover:border-truth-red transition-colors cursor-pointer">
              <h3 className="font-bold text-lg mb-3 text-truth-red font-mono">
                TRUTH SEEKERS
              </h3>
              <div className="space-y-2 text-sm mb-4">
                <div>• Start Truth: 60%</div>
                <div>• Bonus Truth: +10%</div>
                <div>• Extra card: +1</div>
              </div>
              <div className="text-xs italic text-muted-foreground mb-4">
                "The truth is out there, and we'll find it!"
              </div>
              <Button 
                onClick={() => onStartGame('truth')}
                className="w-full bg-truth-red hover:bg-truth-red/80"
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