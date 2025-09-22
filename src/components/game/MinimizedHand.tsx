import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Maximize2, Minimize2, Zap, Target, Megaphone, X } from 'lucide-react';
import { ExtensionCardBadge } from './ExtensionCardBadge';
import { isExtensionCard } from '@/data/extensionIntegration';
import type { GameCard, MVPCardType } from '@/rules/mvp';
import { MVP_CARD_TYPES } from '@/rules/mvp';

interface MinimizedHandProps {
  cards: GameCard[];
  selectedCard?: string | null;
  onSelectCard: (cardId: string) => void;
  onPlayCard: (cardId: string) => void;
  playerIP: number;
  isMaximized: boolean;
  onToggleMaximize: () => void;
  isOpen: boolean;
  onClose: () => void;
  disabled?: boolean;
  onCardHover?: (card: GameCard | null) => void;
}

const MinimizedHand = ({
  cards,
  selectedCard,
  onSelectCard,
  onPlayCard,
  playerIP,
  isMaximized,
  onToggleMaximize,
  isOpen,
  onClose,
  disabled,
  onCardHover
}: MinimizedHandProps) => {
  if (!isOpen) {
    return null;
  }

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

  const canAffordCard = (cost: number) => playerIP >= cost;

  const handleClose = () => {
    onCardHover?.(null);
    onClose();
  };

  const cardIsInteractive = (cost: number) => !disabled && canAffordCard(cost);

  if (isMaximized) {
    // Full-size hand display
    return (
      <div className="fixed bottom-4 left-4 right-4 z-40 rounded-lg border-2 border-newspaper-text bg-newspaper-bg/95 p-4 backdrop-blur">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-bold text-newspaper-text font-mono">
            HAND ({cards.length}/5) • IP: {playerIP}
          </h3>
          <div className="flex items-center gap-2">
            <Button
              onClick={onToggleMaximize}
              variant="outline"
              size="sm"
              className="border-newspaper-text text-newspaper-text"
            >
              <Minimize2 className="h-4 w-4" />
              <span className="sr-only">Collapse hand</span>
            </Button>
            <Button
              onClick={handleClose}
              variant="outline"
              size="sm"
              className="border-newspaper-text text-newspaper-text"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close hand</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
          {cards.map((card, index) => (
            <Card
              key={card.id}
              className={`cursor-pointer border-2 p-4 transition-all hover:scale-105 ${
                selectedCard === card.id
                  ? 'border-government-blue bg-government-blue/10 shadow-lg'
                  : getRarityColor(card.rarity)
              } ${cardIsInteractive(card.cost) ? '' : 'opacity-50'}`}
              onClick={() => cardIsInteractive(card.cost) && onSelectCard(card.id)}
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
                  <Badge variant="outline" className="text-xs font-bold">
                    {card.cost} IP
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
                    if (cardIsInteractive(card.cost)) {
                      onPlayCard(card.id);
                    }
                  }}
                  disabled={!cardIsInteractive(card.cost)}
                  className="w-full bg-newspaper-text text-xs text-newspaper-bg hover:bg-newspaper-text/80 disabled:opacity-50"
                  size="sm"
                >
                  PLAY ({index + 1})
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Minimized hand display
  return (
    <div className="fixed bottom-4 left-4 z-40 max-w-sm rounded-lg border-2 border-newspaper-text bg-newspaper-bg/95 p-3 backdrop-blur">
      <div className="mb-3 flex items-center justify-between">
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

        <div className="flex items-center gap-2">
          <Button
            onClick={onToggleMaximize}
            variant="outline"
            size="sm"
            className="border-newspaper-text text-newspaper-text"
          >
            <Maximize2 className="h-4 w-4" />
            <span className="sr-only">Expand hand</span>
          </Button>
          <Button
            onClick={handleClose}
            variant="outline"
            size="sm"
            className="border-newspaper-text text-newspaper-text"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close hand</span>
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1">
        {cards.map((card, index) => (
          <Tooltip key={card.id}>
            <TooltipTrigger asChild>
              <div
                className={`relative h-12 w-8 cursor-pointer rounded border-2 transition-all hover:z-10 hover:scale-110 ${
                  selectedCard === card.id
                    ? 'border-government-blue bg-government-blue/20'
                    : getRarityColor(card.rarity)
                } ${cardIsInteractive(card.cost) ? '' : 'opacity-50 grayscale'}`}
                onClick={() => cardIsInteractive(card.cost) && onSelectCard(card.id)}
                onDoubleClick={() => cardIsInteractive(card.cost) && onPlayCard(card.id)}
                onMouseEnter={() => onCardHover?.(card)}
                onMouseLeave={() => onCardHover?.(null)}
                data-card-id={card.id}
              >
                {/* Extension/Faction badge - replaces separate type and faction indicators */}
                {isExtensionCard(card.id) ? (
                  <ExtensionCardBadge cardId={card.id} card={card} variant="overlay" />
                ) : (
                  <div className={`absolute left-0.5 top-0.5 rounded p-0.5 ${getTypeColor(card.type)}`}>
                    {getCardIcon(card.type)}
                  </div>
                )}

                {/* Cost badge */}
                <div className="absolute right-0.5 top-0.5 rounded bg-newspaper-text px-1 py-0.5 text-xs font-bold leading-none text-newspaper-bg">
                  {card.cost}
                </div>

                {/* Keyboard shortcut */}
                <div className="absolute bottom-0.5 left-0.5 right-0.5 text-center font-mono text-xs font-bold text-newspaper-text/80">
                  {index + 1}
                </div>

                {/* Selected indicator */}
                {selectedCard === card.id && (
                  <div className="absolute inset-0 animate-pulse rounded border-2 border-government-blue" />
                )}
              </div>
            </TooltipTrigger>

            <TooltipContent
              side="top"
              className="max-w-xs border-2 border-newspaper-text bg-newspaper-bg p-3"
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
                  <Badge variant="outline" className="font-bold">
                    {card.cost} IP
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

                {!cardIsInteractive(card.cost) && !canAffordCard(card.cost) && (
                  <div className="text-xs font-bold text-red-600">
                    Insufficient IP (Need {card.cost}, have {playerIP})
                  </div>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        ))}
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