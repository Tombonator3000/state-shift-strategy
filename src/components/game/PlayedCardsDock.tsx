import React, { useEffect, useMemo, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import CardImage from '@/components/game/CardImage';
import type { GameCard } from '@/types/cardTypes';
import { bindTrayInspectHandlers } from '@/bindings/trayInspect';
import { syncTrayRegistry, type InspectMeta } from '@/state/uiState';

interface PlayedCard {
  card: GameCard;
  player: 'human' | 'ai';
}

interface PlayedCardsDockProps {
  playedCards: PlayedCard[];
  round?: number;
}

const buildGuid = (card: GameCard, owner: 'human' | 'ai', index: number) => `${card.id}-${owner}-${index}`;

const PlayedCardsDock: React.FC<PlayedCardsDockProps> = ({ playedCards, round }) => {
  const humanCards = playedCards.filter(pc => pc.player === 'human');
  const aiCards = playedCards.filter(pc => pc.player === 'ai');
  const dockRef = useRef<HTMLDivElement>(null);

  const registryEntries = useMemo(() => {
    let humanIndex = 0;
    let aiIndex = 0;

    return playedCards.map(entry => {
      const index = entry.player === 'human' ? humanIndex++ : aiIndex++;
      const guid = buildGuid(entry.card, entry.player, index);
      const meta: InspectMeta = {
        playedBy: entry.player === 'human' ? 'You' : 'Opponent',
        round,
        summary: entry.card.text,
      };
      return { guid, card: entry.card, meta };
    });
  }, [playedCards, round]);

  useEffect(() => {
    syncTrayRegistry(registryEntries);
    const root = dockRef.current ?? (typeof document !== 'undefined' ? document : undefined);
    if (root) {
      bindTrayInspectHandlers(root);
    }
  }, [registryEntries]);

  useEffect(() => {
    return () => {
      syncTrayRegistry([]);
    };
  }, []);

  const getTypeColor = (type: string, isAI: boolean) => {
    const truthColors = {
      MEDIA: 'text-truth-red border-truth-red',
      ZONE: 'text-yellow-600 border-yellow-600',
      ATTACK: 'text-red-600 border-red-600',
      DEFENSIVE: 'text-blue-600 border-blue-600',
      TECH: 'text-purple-600 border-purple-600',
      DEVELOPMENT: 'text-green-600 border-green-600',
    } as const;

    const govColors = {
      MEDIA: 'text-government-blue border-government-blue',
      ZONE: 'text-yellow-600 border-yellow-600',
      ATTACK: 'text-red-600 border-red-600',
      DEFENSIVE: 'text-blue-600 border-blue-600',
      TECH: 'text-purple-600 border-purple-600',
      DEVELOPMENT: 'text-green-600 border-green-600',
    } as const;

    return isAI
      ? govColors[type as keyof typeof govColors] || 'text-government-blue border-government-blue'
      : truthColors[type as keyof typeof truthColors] || 'text-truth-red border-truth-red';
  };

  const getRarityBg = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return 'from-yellow-600/20 to-orange-600/20 border-yellow-500/30';
      case 'rare':
        return 'from-purple-600/20 to-blue-600/20 border-purple-500/30';
      case 'uncommon':
        return 'from-green-600/20 to-blue-600/20 border-green-500/30';
      default:
        return 'from-gray-600/20 to-gray-500/20 border-gray-500/30';
    }
  };

  const renderPlayedCard = (playedCard: PlayedCard, index: number, owner: 'human' | 'ai') => {
    const guid = buildGuid(playedCard.card, owner, index);
    const ariaLabel = `View details: ${playedCard.card.name} (${playedCard.card.type}, cost ${playedCard.card.cost} IP, ${String(playedCard.card.faction)})`;

    return (
      <button
        key={`${owner}-${playedCard.card.id}-${index}`}
        type="button"
        data-guid={guid}
        className={`card-mini ${owner === 'human' ? 'me' : 'opponent'} group relative p-0 bg-transparent border-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-warning focus-visible:ring-offset-2 focus-visible:ring-offset-newspaper-bg transition-transform`}
        aria-label={ariaLabel}
        title={ariaLabel}
      >
        <div
          className={`w-24 h-32 bg-gradient-to-b ${getRarityBg(playedCard.card.rarity)} border rounded shadow-sm animate-scale-in overflow-hidden`}
        >
          {/* Card header with newspaper styling */}
          <div className="bg-newspaper-text text-newspaper-bg text-center py-0.5 border-b">
            <div className="text-[6px] font-bold leading-none">PARANOID TIMES</div>
          </div>

          {/* Card name */}
          <div className="px-1 py-0.5 bg-gradient-to-r from-card to-card/80">
            <div className="text-[7px] font-bold text-center line-clamp-1 leading-tight">
              {playedCard.card.name}
            </div>
          </div>

          {/* Art area - smaller */}
          <div className="h-8 overflow-hidden border-y">
            <CardImage cardId={playedCard.card.id} className="w-full h-full object-cover" />
          </div>

          {/* Effect section */}
          <div className="px-1 py-0.5 flex-1">
            <div className="text-[5px] font-semibold mb-0.5">Effect</div>
            <div className="text-[4px] text-muted-foreground line-clamp-2 leading-tight">
              {playedCard.card.text}
            </div>
          </div>

          {/* Classified Intelligence section */}
          <div className={`${owner === 'ai' ? 'bg-government-blue/10 border-government-blue/20' : 'bg-truth-red/10 border-truth-red/20'} border-t px-1 py-0.5`}>
            <div className="text-[4px] font-bold text-muted-foreground mb-0.5">CLASSIFIED INTELLIGENCE</div>
            <div className="text-[4px] italic line-clamp-1 leading-tight">
              "{playedCard.card.flavor ?? playedCard.card.flavorGov ?? playedCard.card.flavorTruth}"
            </div>
          </div>

          {/* Card type and cost */}
          <div className="absolute top-5 left-0.5">
            <Badge variant="outline" className={`text-[5px] px-0.5 py-0 ${getTypeColor(playedCard.card.type, owner === 'ai')}`}>
              {playedCard.card.type}
            </Badge>
          </div>
          <div className={`absolute top-5 right-0.5 ${owner === 'ai' ? 'bg-government-blue text-white' : 'bg-primary text-primary-foreground'} text-[6px] font-bold px-1 py-0.5 rounded`}>
            {playedCard.card.cost}
          </div>
        </div>

        <span
          className="absolute right-1 bottom-1 text-[10px] opacity-0 transition-opacity duration-150 select-none pointer-events-none group-hover:opacity-100 group-focus-visible:opacity-100"
          aria-hidden="true"
        >
          🔍
        </span>

        {/* Enhanced tooltip on hover */}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
          <div className="bg-popover border border-border rounded-lg p-3 shadow-xl max-w-xs">
            <div className="font-bold text-sm text-foreground mb-1">{playedCard.card.name}</div>
            <div className="text-xs text-muted-foreground mb-2">
              {playedCard.card.type} • Cost: {playedCard.card.cost} IP
            </div>
            <div className="text-xs text-foreground mb-2">{playedCard.card.text}</div>
            <div className={`text-xs italic text-muted-foreground border-l-4 ${owner === 'ai' ? 'border-government-blue bg-government-blue/10' : 'border-truth-red bg-truth-red/10'} rounded-r border border-border/60 pl-2 pr-2 py-1`}>
              "{playedCard.card.flavor ?? playedCard.card.flavorGov ?? playedCard.card.flavorTruth}"
            </div>
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className="h-full flex flex-col tray" ref={dockRef}>
      <div className="flex-1 p-2 overflow-y-auto">
        <h4 className="text-xs font-semibold text-newspaper-text mb-2 font-mono">
          CARDS IN PLAY THIS ROUND
        </h4>

        <div className="flex gap-2">
          {/* Human Player Cards */}
          <div className="flex-1">
            {humanCards.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="border-truth-red text-truth-red text-[10px] px-1 py-0">
                    YOUR CARDS
                  </Badge>
                  <span className="text-[10px] text-newspaper-text/70">
                    ({humanCards.length}/3)
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {humanCards.map((playedCard, index) => renderPlayedCard(playedCard, index, 'human'))}
                </div>
              </div>
            )}
          </div>

          {/* AI Player Cards */}
          <div className="flex-1">
            {aiCards.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="border-government-blue text-government-blue text-[10px] px-1 py-0">
                    OPPONENT CARDS
                  </Badge>
                  <span className="text-[10px] text-newspaper-text/70">
                    ({aiCards.length}/3)
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {aiCards.map((playedCard, index) => renderPlayedCard(playedCard, index, 'ai'))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Empty state */}
        {humanCards.length === 0 && aiCards.length === 0 && (
          <div className="flex-1 text-center py-2 text-newspaper-text/50">
            <div className="text-xs">No cards played this round</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayedCardsDock;
