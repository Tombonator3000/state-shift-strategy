import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface CreditsProps {
  onClose: () => void;
}

const Credits = ({ onClose }: CreditsProps) => {
  return (
    <div className="min-h-screen bg-newspaper-bg flex items-center justify-center p-8">
      <Card className="max-w-2xl w-full p-8 bg-newspaper-bg border-4 border-newspaper-border">
        <div className="text-center space-y-6">
          <h1 className="text-4xl font-bold text-newspaper-text" style={{ fontFamily: 'serif' }}>
            SHADOW GOVERNMENT CREDITS
          </h1>
          
          <div className="space-y-4 text-newspaper-text">
            <div className="text-xl font-bold">
              Created by The Truth Seekers
            </div>
            
            <div className="space-y-2 text-base">
              <div><strong>Game Design:</strong> Definitely Not The Illuminati</div>
              <div><strong>Programming:</strong> A Very Smart AI (Trust Us)</div>
              <div><strong>Humor Consultant:</strong> Your Conspiracy Theory Uncle</div>
              <div><strong>Quality Assurance:</strong> Actual Lizard People</div>
              <div><strong>Fact Checking:</strong> Nobody (Obviously)</div>
            </div>
            
            <div className="italic text-lg mt-6">
              Special Thanks:
            </div>
            <div className="space-y-1 text-base">
              <div>The Birds (Government Drones Division)</div>
              <div>Big Pharma (For the Snacks)</div>
              <div>The Real Area 51 Gift Shop</div>
              <div>Karen from Facebook</div>
            </div>
            
            <div className="mt-8 text-lg font-bold">
              Disclaimer:
            </div>
            <div className="text-base max-w-lg mx-auto">
              This game is satire. Any resemblance to actual shadow governments,
              living or dead, or actual conspiracies, proven or unproven,
              is purely coincidental. Probably.
            </div>
            
            <div className="mt-6 italic text-base">
              No reptilians were harmed in the making of this game.
            </div>
            
            <Button 
              onClick={onClose}
              className="mt-8 px-8 py-3 text-lg bg-newspaper-text text-newspaper-bg hover:bg-newspaper-text/80"
            >
              BACK
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Credits;