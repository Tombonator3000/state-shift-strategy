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
    <div className="h-full flex flex-col">
      <div className="flex-1 p-2 overflow-y-auto">
        <h4 className="text-xs font-semibold text-newspaper-text mb-2 font-mono">
          CARDS IN PLAY THIS ROUND
        </h4>
        
        <div className="flex gap-4">
          {/* Human Player Cards */}
          <div className="flex-1">
            {humanCards.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="border-truth-red text-truth-red text-[10px] px-1 py-0">
                    YOUR CARDS
                  </Badge>
                  <span className="text-[10px] text-newspaper-text/70">
                    ({humanCards.length}/3)
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {humanCards.map((playedCard, index) => (
                    <div
                      key={`human-${playedCard.card.id}-${index}`}
                      className="group relative"
                    >
                      <div className="w-12 h-16 bg-gradient-to-br from-truth-red to-red-800 rounded border border-truth-red/30 shadow-sm p-1 animate-scale-in">
                        <div className="text-[6px] font-bold text-white mb-1 line-clamp-1 leading-tight">
                          {playedCard.card.name}
                        </div>
                        <div className="text-[5px] text-red-200">
                          {playedCard.card.type}
                        </div>
                        <div className="absolute bottom-0.5 right-0.5 text-[6px] font-bold text-yellow-300">
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
          </div>

          {/* AI Player Cards */}
          <div className="flex-1">
            {aiCards.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="border-government-blue text-government-blue text-[10px] px-1 py-0">
                    OPPONENT CARDS
                  </Badge>
                  <span className="text-[10px] text-newspaper-text/70">
                    ({aiCards.length}/3)
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {aiCards.map((playedCard, index) => (
                    <div
                      key={`ai-${playedCard.card.id}-${index}`}
                      className="group relative"
                    >
                      <div className="w-12 h-16 bg-gradient-to-br from-government-blue to-blue-800 rounded border border-government-blue/30 shadow-sm p-1 animate-scale-in">
                        <div className="text-[6px] font-bold text-white mb-1 line-clamp-1 leading-tight">
                          {playedCard.card.name}
                        </div>
                        <div className="text-[5px] text-blue-200">
                          {playedCard.card.type}
                        </div>
                        <div className="absolute bottom-0.5 right-0.5 text-[6px] font-bold text-yellow-300">
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
          </div>

          {/* Empty state */}
          {humanCards.length === 0 && aiCards.length === 0 && (
            <div className="flex-1 text-center py-2 text-newspaper-text/50">
              <div className="text-xs">No cards played this round</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlayedCardsDock;