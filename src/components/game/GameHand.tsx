import React from 'react';
import CardImage from './CardImage';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { GameCard } from '@/rules/mvp';

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
      case 'DEFENSIVE': return 'border-primary bg-primary/10';
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
            className={`relative p-0 cursor-pointer transition-all hover:scale-105 hover:-translate-y-2 ${getTypeColor(card.type)} ${
              disabled ? 'opacity-50' : ''
            } overflow-hidden animate-card-deal`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {/* TCG Card Layout */}
            <div className="relative">
              {/* Rarity stripe */}
              <div className={`absolute left-0 top-0 w-2 h-full ${getRarityColor(card.rarity)} z-10`}></div>
              
              {/* Cost pip */}
              <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black text-white text-xs font-bold flex items-center justify-center z-10">
                {card.cost}
              </div>
              
              {/* Card header */}
              <div className="p-3 pb-2 bg-gradient-to-r from-card to-card/80">
                <h4 className="font-bold text-sm font-mono text-center">{card.name}</h4>
              </div>
              
              {/* Art box placeholder */}
              <div className="h-24 border-y overflow-hidden">
                <CardImage cardId={card.id} className="w-full h-full" />
              </div>
              
              {/* Card content */}
              <div className="p-3">
                <div className="flex justify-center mb-2">
                  <Badge 
                    variant="outline" 
                    className={`text-xs font-mono ${card.type === 'MEDIA' ? 'bg-truth-red/20 border-truth-red text-truth-red' : 
                      card.type === 'ZONE' ? 'bg-government-blue/20 border-government-blue text-government-blue' :
                      card.type === 'ATTACK' ? 'bg-destructive/20 border-destructive text-destructive' :
                      'bg-accent/20 border-accent text-accent-foreground'}`}
                  >
                    [{card.type}]
                  </Badge>
                </div>
                
                <div className="text-xs text-center mb-3 min-h-8 flex items-center justify-center font-medium">
                  {card.text}
                </div>
                
                <div className="text-xs italic text-muted-foreground text-center mb-3 min-h-6 border-t pt-2">
                  "{card.flavor ?? card.flavorGov ?? card.flavorTruth}"
                </div>
                
                <Button
                  size="sm"
                  onClick={() => onPlayCard(card.id)}
                  disabled={disabled}
                  className="w-full text-xs animate-on-hover"
                >
                  Deploy Asset
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