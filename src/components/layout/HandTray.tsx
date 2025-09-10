import React, { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import CardEffectTooltip from '@/components/game/CardEffectTooltip';
import { 
  ChevronLeft, 
  ChevronRight, 
  Hand, 
  Zap,
  Target
} from 'lucide-react';

interface HandTrayProps {
  cards: any[];
  selectedCard?: string | null;
  onCardSelect?: (cardId: string) => void;
  onCardPlay?: (cardId: string) => void;
  onCardHover?: (card: any) => void;
  disabled?: boolean;
  maxCardsVisible?: number;
}

const HandTray: React.FC<HandTrayProps> = ({
  cards = [],
  selectedCard,
  onCardSelect,
  onCardPlay,
  onCardHover,
  disabled = false,
  maxCardsVisible = 8
}) => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [hoveredCard, setHoveredCard] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Calculate visible cards based on scroll position
  const totalCards = cards.length;
  const canScrollLeft = scrollPosition > 0;
  const canScrollRight = scrollPosition + maxCardsVisible < totalCards;
  const visibleCards = cards.slice(scrollPosition, scrollPosition + maxCardsVisible);

  const scrollLeft = () => {
    setScrollPosition(Math.max(0, scrollPosition - 1));
  };

  const scrollRight = () => {
    setScrollPosition(Math.min(totalCards - maxCardsVisible, scrollPosition + 1));
  };

  const handleCardClick = (card: any) => {
    if (disabled) return;
    
    if (selectedCard === card.id) {
      // Double-click to play
      onCardPlay?.(card.id);
    } else {
      // Single click to select
      onCardSelect?.(card.id);
    }
  };

  const handleCardHover = (card: any) => {
    setHoveredCard(card);
    onCardHover?.(card);
  };

  return (
    <div className="h-28 bg-newspaper-bg border-t-2 border-newspaper-border flex items-center px-4 relative">
      {/* Hand Icon & Info */}
      <div className="flex items-center gap-2 mr-4 flex-shrink-0">
        <Hand className="w-4 h-4 text-newspaper-text" />
        <div className="text-newspaper-text font-mono text-xs">
          <div className="font-bold">HAND</div>
          <div className="text-xs opacity-80">{cards.length} cards</div>
        </div>
      </div>

      {/* Scroll Left Button */}
      {canScrollLeft && (
        <Button
          variant="ghost"
          size="sm"
          onClick={scrollLeft}
          className="flex-shrink-0 mr-2 h-8 w-8 p-0 text-newspaper-text hover:bg-newspaper-text/20"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
      )}

      {/* Cards Container */}
      <div 
        ref={scrollRef}
        className="flex-1 flex items-center gap-2 overflow-hidden"
      >
        {visibleCards.map((card, index) => {
          const isSelected = selectedCard === card.id;
          const canAfford = true; // TODO: Check if player can afford card
          
          return (
            <div
              key={card.id}
              className={`relative flex-shrink-0 cursor-pointer transition-all duration-200 ${
                isSelected 
                  ? 'transform -translate-y-2 scale-110 z-10' 
                  : 'hover:transform hover:-translate-y-1 hover:scale-105'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => handleCardClick(card)}
              onMouseEnter={() => handleCardHover(card)}
              onMouseLeave={() => setHoveredCard(null)}
              data-card-id={card.id}
            >
              <Card className={`w-16 h-20 p-2 border-2 text-xs transition-colors ${
                isSelected 
                  ? 'border-blue-400 bg-blue-50 shadow-lg' 
                  : canAfford 
                    ? 'border-gray-300 bg-white hover:border-gray-400' 
                    : 'border-red-300 bg-red-50 opacity-70'
              }`}>
                <div className="text-center h-full flex flex-col justify-between">
                  {/* Card Name */}
                  <div className="font-mono font-bold text-xs leading-tight truncate">
                    {card.name}
                  </div>
                  
                  {/* Card Type Icon */}
                  <div className="flex items-center justify-center">
                    {card.type === 'ZONE' && <Target className="w-3 h-3 text-orange-500" />}
                    {card.type === 'ACTION' && <Zap className="w-3 h-3 text-purple-500" />}
                    {card.type === 'ASSET' && <div className="w-3 h-3 bg-green-500 rounded" />}
                  </div>
                  
                  {/* Cost */}
                  <div className="font-mono font-bold text-xs">
                    {card.cost}
                  </div>
                </div>

                {/* Rarity indicator */}
                {card.rarity && card.rarity !== 'common' && (
                  <div className="absolute -top-1 -right-1">
                    <Badge 
                      variant="outline"
                      className={`text-xs p-0 w-4 h-4 flex items-center justify-center border-0 ${
                        card.rarity === 'legendary' ? 'bg-yellow-400 text-black' :
                        card.rarity === 'rare' ? 'bg-blue-400 text-white' :
                        'bg-green-400 text-white'
                      }`}
                    >
                      {card.rarity === 'legendary' ? '★' : 
                       card.rarity === 'rare' ? '♦' : '●'}
                    </Badge>
                  </div>
                )}

                {/* Selected indicator */}
                {isSelected && (
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                  </div>
                )}
              </Card>
            </div>
          );
        })}

        {/* Empty state */}
        {cards.length === 0 && (
          <div className="flex-1 text-center text-newspaper-text/60 text-sm font-mono italic">
            No cards in hand
          </div>
        )}
      </div>

      {/* Scroll Right Button */}
      {canScrollRight && (
        <Button
          variant="ghost"
          size="sm"
          onClick={scrollRight}
          className="flex-shrink-0 ml-2 h-8 w-8 p-0 text-newspaper-text hover:bg-newspaper-text/20"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      )}

      {/* Cards Counter */}
      {totalCards > maxCardsVisible && (
        <div className="ml-4 flex-shrink-0 text-newspaper-text font-mono text-xs">
          <div className="text-center">
            <div className="font-bold">
              {scrollPosition + 1}-{Math.min(scrollPosition + maxCardsVisible, totalCards)}
            </div>
            <div className="text-xs opacity-80">
              of {totalCards}
            </div>
          </div>
        </div>
      )}

      {/* Hover Tooltip */}
      {hoveredCard && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50 pointer-events-none">
          <CardEffectTooltip card={hoveredCard} faction="truth" />
        </div>
      )}

      {/* Instructions */}
      {!disabled && selectedCard && (
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-newspaper-text text-newspaper-bg px-2 py-1 rounded text-xs font-mono">
          Click again to play • Right-click for details
        </div>
      )}
    </div>
  );
};

export default HandTray;