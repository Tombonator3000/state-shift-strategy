import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Maximize2, Minimize2, Zap, Target, Megaphone } from 'lucide-react';
import { ExtensionCardBadge } from './ExtensionCardBadge';
import { isExtensionCard } from '@/data/extensionIntegration';
import type { GameCard, MVPCardType } from '@/rules/mvp';
import { MVP_CARD_TYPES } from '@/rules/mvp';
import { applyStateCombinationCostModifiers, type StateCombinationEffects } from '@/data/stateCombinations';

interface MinimizedHandProps {
  cards: GameCard[];
  selectedCard?: string;
  onSelectCard: (cardId: string) => void;
  onPlayCard: (cardId: string) => void;
  playerIP: number;
  isMaximized: boolean;
  onToggleMaximize: () => void;
  stateCombinationEffects: StateCombinationEffects;
}

const MinimizedHand = ({
  cards,
  selectedCard,
  onSelectCard,
  onPlayCard,
  playerIP,
  isMaximized,
  onToggleMaximize,
  stateCombinationEffects
}: MinimizedHandProps) => {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const normalizeCardType = (type: string): MVPCardType => {
    return MVP_CARD_TYPES.includes(type as MVPCardType) ? type as MVPCardType : 'MEDIA';
  };

  const getCardIcon = (type: string) => {
    const normalized = normalizeCardType(type);
    switch (normalized) {
      case 'MEDIA': return <Megaphone className="w-3 h-3" />;
      case 'ZONE': return <Target className="w-3 h-3" />;
      case 'ATTACK':
      default: return <Zap className="w-3 h-3" />;
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-400 bg-gray-100';
      case 'uncommon': return 'border-green-500 bg-green-50';
      case 'rare': return 'border-blue-500 bg-blue-50';
      case 'legendary': return 'border-orange-500 bg-orange-50';
      default: return 'border-gray-400 bg-gray-100';
    }
  };

  const getTypeColor = (type: string) => {
    const normalized = normalizeCardType(type);
    switch (normalized) {
      case 'MEDIA': return 'text-purple-600 bg-purple-100';
      case 'ZONE': return 'text-blue-600 bg-blue-100';
      case 'ATTACK':
      default: return 'text-red-600 bg-red-100';
    }
  };

  const getEffectiveCost = (card: GameCard) =>
    applyStateCombinationCostModifiers(
      card.cost,
      normalizeCardType(card.type),
      'human',
      stateCombinationEffects
    );

  const canAffordCard = (card: GameCard) => playerIP >= getEffectiveCost(card);

  if (isMaximized) {
    // Full-size hand display
    return (
      <div className="fixed bottom-4 left-4 right-4 bg-newspaper-bg/95 backdrop-blur border-2 border-newspaper-text p-4 rounded-lg z-40">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-newspaper-text font-mono">
            HAND ({cards.length}/5) • IP: {playerIP}
          </h3>
          <Button
            onClick={onToggleMaximize}
            variant="outline"
            size="sm"
            className="border-newspaper-text text-newspaper-text"
          >
            <Minimize2 className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {cards.map((card, index) => {
            const effectiveCost = getEffectiveCost(card);
            const canAfford = canAffordCard(card);
            const isDiscounted = effectiveCost !== card.cost;

            return (
            <Card
              key={card.id}
              className={`p-4 cursor-pointer transition-all hover:scale-105 border-2 ${
                selectedCard === card.id
                  ? 'border-government-blue bg-government-blue/10 shadow-lg'
                  : getRarityColor(card.rarity)
              } ${!canAfford ? 'opacity-50' : ''}`}
              onClick={() => canAfford && onSelectCard(card.id)}
              data-card-id={card.id}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge
                    variant="outline"
                    className={`text-xs ${getTypeColor(card.type)} border-current`}
                  >
                    {getCardIcon(card.type)}
                    <span className="ml-1">{normalizeCardType(card.type)}</span>
                  </Badge>
                  <Badge variant="outline" className="text-xs font-bold flex items-center gap-1">
                    {isDiscounted && (
                      <span className="line-through opacity-70">{card.cost}</span>
                    )}
                    <span>{effectiveCost} IP</span>
                  </Badge>
                </div>

                <h4 className="font-bold text-sm text-newspaper-text leading-tight">
                  {card.name}
                </h4>
                
                <p className="text-xs text-newspaper-text/70 leading-relaxed">
                  {card.text}
                </p>
                
                <div className="pt-2 border-t border-newspaper-text/20">
                  <p className="text-xs italic text-newspaper-text/60">
                    {card.flavor ?? card.flavorGov ?? card.flavorTruth}
                  </p>
                </div>
                
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    onPlayCard(card.id);
                  }}
                  disabled={!canAfford}
                  className="w-full text-xs bg-newspaper-text text-newspaper-bg hover:bg-newspaper-text/80 disabled:opacity-50"
                  size="sm"
                >
                  PLAY ({index + 1})
                </Button>
              </div>
            </Card>
            );
          })}
        </div>
      </div>
    );
  }

  // Minimized hand display
  return (
    <div className="fixed bottom-4 left-4 bg-newspaper-bg/95 backdrop-blur border-2 border-newspaper-text p-3 rounded-lg z-40 max-w-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-newspaper-text font-mono text-sm">
            HAND
          </h3>
          <Badge variant="outline" className="text-xs">
            {cards.length}/5
          </Badge>
          <Badge variant="outline" className="text-xs text-government-blue border-government-blue">
            {playerIP} IP
          </Badge>
        </div>
        
        <Button
          onClick={onToggleMaximize}
          variant="outline"
          size="sm"
          className="border-newspaper-text text-newspaper-text"
        >
          <Maximize2 className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="flex gap-1 flex-wrap">
        {cards.map((card, index) => {
          const effectiveCost = getEffectiveCost(card);
          const canAfford = canAffordCard(card);
          const isDiscounted = effectiveCost !== card.cost;

          return (
          <Tooltip key={card.id}>
            <TooltipTrigger asChild>
              <div
                className={`relative w-8 h-12 border-2 rounded cursor-pointer transition-all hover:scale-110 hover:z-10 ${
                  selectedCard === card.id
                    ? 'border-government-blue bg-government-blue/20'
                    : getRarityColor(card.rarity)
                } ${!canAfford ? 'opacity-50 grayscale' : ''}`}
                onClick={() => canAfford && onSelectCard(card.id)}
                onDoubleClick={() => canAfford && onPlayCard(card.id)}
                onMouseEnter={() => setHoveredCard(card.id)}
                 onMouseLeave={() => setHoveredCard(null)}
                 data-card-id={card.id}
               >
                 {/* Extension/Faction badge - replaces separate type and faction indicators */}
                 {isExtensionCard(card.id) ? (
                   <ExtensionCardBadge cardId={card.id} card={card} variant="overlay" />
                 ) : (
                   <div className={`absolute top-0.5 left-0.5 p-0.5 rounded ${getTypeColor(card.type)}`}>
                     {getCardIcon(card.type)}
                   </div>
                 )}

                 {/* Cost badge */}
                 <div className="absolute top-0.5 right-0.5 bg-newspaper-text text-newspaper-bg text-[10px] font-bold rounded px-1 leading-none py-0.5 flex items-center gap-0.5">
                   {isDiscounted && (
                     <span className="line-through opacity-70">{card.cost}</span>
                   )}
                   <span>{effectiveCost}</span>
                 </div>
                 
                 {/* Keyboard shortcut */}
                 <div className="absolute bottom-0.5 left-0.5 right-0.5 text-center text-xs font-mono font-bold text-newspaper-text/80">
                   {index + 1}
                 </div>
                
                {/* Selected indicator */}
                {selectedCard === card.id && (
                  <div className="absolute inset-0 border-2 border-government-blue rounded animate-pulse"></div>
                )}
              </div>
            </TooltipTrigger>
            
            <TooltipContent
              side="top"
              className="max-w-xs bg-newspaper-bg border-2 border-newspaper-text p-3"
            >
               <div className="space-y-2">
                 <div className="flex items-center justify-between gap-2">
                   <div className="flex items-center gap-1">
                      <Badge className={getTypeColor(card.type)}>
                        {getCardIcon(card.type)}
                        <span className="ml-1">{normalizeCardType(card.type)}</span>
                      </Badge>
                     <ExtensionCardBadge cardId={card.id} card={card} variant="inline" />
                   </div>
                   <Badge variant="outline" className="font-bold flex items-center gap-1">
                     {isDiscounted && (
                       <span className="line-through opacity-70">{card.cost}</span>
                     )}
                     <span>{effectiveCost} IP</span>
                   </Badge>
                 </div>
                
                <h4 className="font-bold text-newspaper-text">
                  {card.name}
                </h4>
                
                <p className="text-sm text-newspaper-text/80">
                  {card.text}
                </p>
                
                <div className="border-t border-newspaper-text/20 pt-2">
                  <p className="text-xs italic text-newspaper-text/60">
                    "{card.flavor ?? card.flavorGov ?? card.flavorTruth}"
                  </p>
                </div>
                
                <div className="flex items-center justify-between text-xs">
                  <span className="text-newspaper-text/60">
                    Rarity: {card.rarity}
                  </span>
                  <span className="font-mono text-newspaper-text/80">
                    Press {index + 1} to play
                  </span>
                </div>
                
                {!canAfford && (
                  <div className="text-red-600 text-xs font-bold">
                    Insufficient IP (Need {effectiveCost}, have {playerIP})
                  </div>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
          );
        })}
      </div>
      
      {cards.length === 0 && (
        <div className="text-center text-newspaper-text/60 text-sm font-mono py-2">
          No cards in hand
        </div>
      )}
    </div>
  );
};

export default MinimizedHand;