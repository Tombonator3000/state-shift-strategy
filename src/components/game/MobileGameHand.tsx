import React, { useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronLeft, ChevronRight, Eye, Zap, Target, Shield } from 'lucide-react';
import { useSwipeGestures } from '@/hooks/useSwipeGestures';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { useAudioContext } from '@/contexts/AudioContext';
import type { GameCard } from '@/types/cardTypes';
import CardDetailOverlay from './CardDetailOverlay';
import { ExtensionCardBadge } from './ExtensionCardBadge';
import type { PlayOutcome } from '@/engine/flow';

interface MobileGameHandProps {
  cards: GameCard[];
  onPlayCard: (cardId: string) => void | Promise<PlayOutcome | void>;
  onSelectCard?: (cardId: string) => void;
  selectedCard?: string | null;
  currentIP: number;
  disabled?: boolean;
  loadingCard?: string | null;
}

const MobileGameHand: React.FC<MobileGameHandProps> = ({
  cards,
  onPlayCard,
  onSelectCard,
  selectedCard,
  currentIP,
  disabled,
  loadingCard
}) => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [examinedCard, setExaminedCard] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const audio = useAudioContext();
  const { triggerHaptic } = useHapticFeedback();

  const canAffordCard = (card: GameCard) => currentIP >= card.cost;

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-400 bg-gray-50';
      case 'uncommon': return 'border-green-400 bg-green-50';
      case 'rare': return 'border-blue-400 bg-blue-50';
      case 'legendary': return 'border-yellow-400 bg-yellow-50 shadow-lg shadow-yellow-200';
      default: return 'border-gray-400 bg-gray-50';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ZONE': return <Target className="w-4 h-4" />;
      case 'ATTACK': return <Zap className="w-4 h-4" />;
      case 'DEFENSIVE': return <Shield className="w-4 h-4" />;
      default: return null;
    }
  };

  const scrollToCard = (index: number) => {
    if (scrollRef.current) {
      const cardWidth = 160; // Card width + gap
      scrollRef.current.scrollTo({
        left: index * cardWidth,
        behavior: 'smooth'
      });
    }
  };

  const handlePrevCard = () => {
    if (currentCardIndex > 0) {
      const newIndex = currentCardIndex - 1;
      setCurrentCardIndex(newIndex);
      scrollToCard(newIndex);
      triggerHaptic('selection');
    }
  };

  const handleNextCard = () => {
    if (currentCardIndex < cards.length - 1) {
      const newIndex = currentCardIndex + 1;
      setCurrentCardIndex(newIndex);
      scrollToCard(newIndex);
      triggerHaptic('selection');
    }
  };

  const swipeHandlers = useSwipeGestures({
    onSwipeLeft: handleNextCard,
    onSwipeRight: handlePrevCard,
    onSwipeUp: () => {
      if (cards[currentCardIndex]) {
        setExaminedCard(cards[currentCardIndex].id);
        triggerHaptic('medium');
      }
    }
  });

  const handleCardPlay = async (cardId: string) => {
    const card = cards.find(c => c.id === cardId);
    if (!card || !canAffordCard(card)) {
      triggerHaptic('error');
      return;
    }

    if (card.type === 'ZONE') {
      // For zone cards, select for targeting
      onSelectCard?.(cardId);
      triggerHaptic('medium');
    } else {
      // For other cards, play immediately
      await onPlayCard(cardId);
      triggerHaptic('success');
    }
  };

  if (cards.length === 0) {
    return (
      <div className="bg-white border-t-2 border-black p-4">
        <div className="text-center text-gray-500 py-8">
          <div className="text-sm font-bold uppercase">No Assets Available</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border-t-2 border-black">
      {/* Card Navigation Header */}
      <div className="flex items-center justify-between p-2 border-b border-gray-200">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevCard}
          disabled={currentCardIndex === 0}
          className="min-w-[44px] min-h-[44px]"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        
        <div className="text-center">
          <div className="text-xs font-bold uppercase tracking-wide">Your Hand</div>
          <div className="text-xs text-gray-500">
            {currentCardIndex + 1} of {cards.length}
          </div>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleNextCard}
          disabled={currentCardIndex === cards.length - 1}
          className="min-w-[44px] min-h-[44px]"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Horizontal Scrolling Cards */}
      <div 
        className="overflow-x-auto p-4"
        ref={scrollRef}
        {...swipeHandlers}
      >
        <div className="flex gap-3" style={{ width: `${cards.length * 160}px` }}>
          {cards.map((card, index) => {
            const isSelected = selectedCard === card.id;
            const isLoading = loadingCard === card.id;
            const canAfford = canAffordCard(card);
            const isCurrent = index === currentCardIndex;

            return (
              <Card
                key={card.id}
                className={`
                  flex-shrink-0 w-[150px] p-3 cursor-pointer transition-all duration-200
                  border-2 ${getRarityColor(card.rarity)}
                  ${isCurrent ? 'scale-105 shadow-lg ring-2 ring-blue-400' : 'scale-100'}
                  ${isSelected ? 'ring-2 ring-yellow-400 shadow-lg' : ''}
                  ${!canAfford ? 'opacity-60' : 'hover:scale-105'}
                  ${isLoading ? 'animate-pulse' : ''}
                `}
                onClick={() => {
                  setCurrentCardIndex(index);
                  audio.playSFX('click');
                  triggerHaptic('selection');
                }}
              >
                {/* Cost Badge */}
                <div className={`
                  absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center
                  text-xs font-bold border-2
                  ${canAfford ? 'bg-green-500 text-white border-green-600' : 'bg-red-500 text-white border-red-600'}
                `}>
                  {card.cost}
                </div>

                {/* Card Image Placeholder */}
                <div className="aspect-[3/4] bg-gray-200 border border-gray-300 rounded mb-2 flex items-center justify-center">
                  <div className="text-4xl">
                    {getTypeIcon(card.type)}
                  </div>
                </div>

                {/* Card Info */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <h3 className="font-bold text-xs truncate flex-1">{card.name}</h3>
                    <ExtensionCardBadge cardId={card.id} card={card} variant="inline" />
                  </div>
                  
                  <Badge variant="outline" className="text-xs">
                    {card.type}
                  </Badge>
                  
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {card.text}
                  </p>
                </div>

                {/* Selection indicator */}
                {isSelected && (
                  <div className="absolute top-2 left-2 w-3 h-3 rounded-full bg-yellow-400 animate-pulse" />
                )}
              </Card>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4 space-y-2">
        {cards[currentCardIndex] && (
          <>
            <Button
              onClick={() => setExaminedCard(cards[currentCardIndex].id)}
              variant="outline"
              className="w-full min-h-[44px] justify-start"
            >
              <Eye className="w-4 h-4 mr-2" />
              Examine Card
            </Button>
            
            <Button
              onClick={() => handleCardPlay(cards[currentCardIndex].id)}
              className="w-full min-h-[44px] font-bold"
              disabled={!canAffordCard(cards[currentCardIndex]) || disabled}
            >
              {cards[currentCardIndex].type === 'ZONE' ? 'Target & Deploy' : 'Deploy Card'}
            </Button>
          </>
        )}
      </div>

      {/* Card Detail Overlay */}
      {examinedCard && (
        <CardDetailOverlay
          card={cards.find(c => c.id === examinedCard) || null}
          canAfford={cards.find(c => c.id === examinedCard) ? canAffordCard(cards.find(c => c.id === examinedCard)!) : false}
          disabled={disabled}
          onClose={() => setExaminedCard(null)}
          onPlayCard={async () => {
            const card = cards.find(c => c.id === examinedCard);
            if (card) {
              await handleCardPlay(card.id);
              setExaminedCard(null);
            }
          }}
          swipeHandlers={swipeHandlers}
        />
      )}
    </div>
  );
};

export default MobileGameHand;