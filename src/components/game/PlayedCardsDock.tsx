import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { GameCard } from '@/components/game/GameHand';

interface PlayedCard {
  card: GameCard;
  player: 'human' | 'ai';
}

interface PlayedCardsDockProps {
  playedCards: PlayedCard[];
}

const PlayedCardsDock: React.FC<PlayedCardsDockProps> = ({ playedCards }) => {
  const humanCards = playedCards.filter(pc => pc.player === 'human');
  const aiCards = playedCards.filter(pc => pc.player === 'ai');

  return (
    <div className="mt-4">
      <Card className="p-4 bg-card/50 border-border/50 backdrop-blur-sm">
        <h4 className="text-sm font-semibold text-muted-foreground mb-3 font-mono">
          CARDS IN PLAY THIS ROUND
        </h4>
        
        <div className="space-y-3">
          {/* Human Player Cards */}
          {humanCards.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="border-blue-500 text-blue-500 text-xs">
                  YOUR CARDS
                </Badge>
                <span className="text-xs text-muted-foreground">
                  ({humanCards.length}/3)
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {humanCards.map((playedCard, index) => (
                  <div
                    key={`human-${playedCard.card.id}-${index}`}
                    className="group relative"
                  >
                    <div className="w-16 h-24 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg border border-blue-400/30 shadow-lg p-2 animate-scale-in">
                      <div className="text-[8px] font-bold text-white mb-1 line-clamp-2 leading-tight">
                        {playedCard.card.name}
                      </div>
                      <div className="text-[6px] text-blue-200 mb-1">
                        {playedCard.card.type}
                      </div>
                      <div className="text-[6px] text-blue-100 line-clamp-3 leading-tight">
                        {playedCard.card.text}
                      </div>
                      <div className="absolute bottom-1 right-1 text-[8px] font-bold text-yellow-300">
                        {playedCard.card.cost}
                      </div>
                    </div>
                    
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                      <div className="bg-popover border border-border rounded-lg p-3 shadow-xl max-w-xs">
                        <div className="font-bold text-sm text-foreground mb-1">
                          {playedCard.card.name}
                        </div>
                        <div className="text-xs text-muted-foreground mb-2">
                          {playedCard.card.type} • Cost: {playedCard.card.cost}
                        </div>
                        <div className="text-xs text-foreground">
                          {playedCard.card.text}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Player Cards */}
          {aiCards.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="border-red-500 text-red-500 text-xs">
                  OPPONENT CARDS
                </Badge>
                <span className="text-xs text-muted-foreground">
                  ({aiCards.length}/3)
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {aiCards.map((playedCard, index) => (
                  <div
                    key={`ai-${playedCard.card.id}-${index}`}
                    className="group relative"
                  >
                    <div className="w-16 h-24 bg-gradient-to-br from-red-600 to-red-800 rounded-lg border border-red-400/30 shadow-lg p-2 animate-scale-in">
                      <div className="text-[8px] font-bold text-white mb-1 line-clamp-2 leading-tight">
                        {playedCard.card.name}
                      </div>
                      <div className="text-[6px] text-red-200 mb-1">
                        {playedCard.card.type}
                      </div>
                      <div className="text-[6px] text-red-100 line-clamp-3 leading-tight">
                        {playedCard.card.text}
                      </div>
                      <div className="absolute bottom-1 right-1 text-[8px] font-bold text-yellow-300">
                        {playedCard.card.cost}
                      </div>
                    </div>
                    
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                      <div className="bg-popover border border-border rounded-lg p-3 shadow-xl max-w-xs">
                        <div className="font-bold text-sm text-foreground mb-1">
                          {playedCard.card.name}
                        </div>
                        <div className="text-xs text-muted-foreground mb-2">
                          {playedCard.card.type} • Cost: {playedCard.card.cost}
                        </div>
                        <div className="text-xs text-foreground">
                          {playedCard.card.text}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {humanCards.length === 0 && aiCards.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <div className="text-sm">No cards played this round</div>
              <div className="text-xs mt-1">Cards will appear here when played</div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default PlayedCardsDock;