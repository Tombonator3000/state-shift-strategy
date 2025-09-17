import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import CardImage from './CardImage';
import type { GameCard, MVPCardType } from '@/rules/mvp';
import { MVP_CARD_TYPES } from '@/rules/mvp';

interface NewCardsPresentationProps {
  cards: GameCard[];
  isVisible: boolean;
  onConfirm: () => void;
}

const normalizeCardType = (type: string): MVPCardType => {
  return MVP_CARD_TYPES.includes(type as MVPCardType) ? type as MVPCardType : 'MEDIA';
};

const NewCardsPresentation = ({ cards, isVisible, onConfirm }: NewCardsPresentationProps) => {
  if (!isVisible || cards.length === 0) return null;

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
    const normalized = normalizeCardType(type);
    switch (normalized) {
      case 'MEDIA': return 'border-truth-red bg-truth-red/10';
      case 'ZONE': return 'border-government-blue bg-government-blue/10';
      case 'ATTACK':
      default: return 'border-destructive bg-destructive/10';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto animate-scale-in">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-foreground font-mono mb-2">NEW CARDS ACQUIRED</h2>
          <p className="text-muted-foreground text-sm">
            These cards have been added to your hand
          </p>
        </div>

        <div className={`grid ${cards.length === 1 ? 'grid-cols-1 justify-center' : cards.length === 2 ? 'grid-cols-2' : 'grid-cols-3'} gap-4 mb-6`}>
          {cards.map((card, index) => (
            <Card 
              key={card.id} 
              className={`relative p-0 transition-all hover:scale-105 ${getTypeColor(card.type)} overflow-hidden animate-fade-in`}
              style={{ animationDelay: `${index * 0.2}s` }}
            >
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
              
              {/* Art box */}
              <div className="h-24 border-y overflow-hidden">
                <CardImage cardId={card.id} className="w-full h-full" />
              </div>
              
              {/* Card content */}
              <div className="p-3">
                <div className="flex justify-center mb-2">
                  <Badge
                    variant="outline"
                    className={`text-xs font-mono ${(() => {
                      const type = normalizeCardType(card.type);
                      if (type === 'MEDIA') return 'bg-truth-red/20 border-truth-red text-truth-red';
                      if (type === 'ZONE') return 'bg-government-blue/20 border-government-blue text-government-blue';
                      return 'bg-destructive/20 border-destructive text-destructive';
                    })()}`}
                  >
                    [{normalizeCardType(card.type)}]
                  </Badge>
                </div>
                
                <div className="text-xs text-center mb-3 min-h-8 flex items-center justify-center font-medium">
                  {card.text}
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button 
            onClick={onConfirm}
            className="px-8 py-2 bg-primary text-primary-foreground hover:bg-primary/90 font-mono"
          >
            Add to Hand
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NewCardsPresentation;