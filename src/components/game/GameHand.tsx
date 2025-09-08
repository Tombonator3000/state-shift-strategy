import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export interface GameCard {
  id: string;
  name: string;
  type: 'MEDIA' | 'ZONE' | 'ATTACK' | 'DEFENSIVE';
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  text: string;
  flavorGov: string;
  flavorTruth: string;
  cost: number;
  target?: string;
}

interface GameHandProps {
  cards: GameCard[];
  onPlayCard: (cardId: string) => void;
  disabled?: boolean;
}

const GameHand = ({ cards, onPlayCard, disabled }: GameHandProps) => {
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-500';
      case 'uncommon': return 'bg-green-500';
      case 'rare': return 'bg-blue-500';
      case 'legendary': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'MEDIA': return 'border-truth-red bg-truth-red/10';
      case 'ZONE': return 'border-government-blue bg-government-blue/10';
      case 'ATTACK': return 'border-destructive bg-destructive/10';
      case 'DEFENSIVE': return 'border-accent bg-accent/10';
      default: return 'border-muted bg-muted/10';
    }
  };

  return (
    <div className="space-y-2">
      <h3 className="font-bold text-sm font-mono">Hand ({cards.length}/5)</h3>
      
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {cards.map((card, index) => (
          <Card 
            key={card.id} 
            className={`p-3 cursor-pointer transition-all hover:scale-105 ${getTypeColor(card.type)} ${
              disabled ? 'opacity-50' : ''
            }`}
          >
            <div className="flex items-start justify-between">
              {/* Rarity stripe */}
              <div className={`w-1 h-full absolute left-0 top-0 ${getRarityColor(card.rarity)}`}></div>
              
              <div className="flex-1 ml-3">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-bold text-sm font-mono">{card.name}</h4>
                  <Badge variant="outline" className="text-xs">
                    {card.cost} IP
                  </Badge>
                </div>
                
                <Badge variant="secondary" className="text-xs mb-2">
                  {card.type}
                </Badge>
                
                <p className="text-xs text-muted-foreground mb-2">
                  {card.text}
                </p>
                
                <div className="text-xs italic text-muted-foreground mb-2">
                  "{card.flavorTruth}"
                </div>
                
                <Button
                  size="sm"
                  onClick={() => onPlayCard(card.id)}
                  disabled={disabled}
                  className="w-full"
                >
                  Play Card
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
      
      {cards.length === 0 && (
        <div className="text-center text-muted-foreground text-sm font-mono py-8">
          No cards in hand
        </div>
      )}
    </div>
  );
};

export default GameHand;