import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import CardEffectTooltip from '@/components/game/CardEffectTooltip';
import { 
  Zap, 
  Clock, 
  Target, 
  Eye,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface PlayedCard {
  card: any;
  player: 'player' | 'ai';
  timestamp: number;
  effects?: string[];
  targetState?: string;
}

interface PlayResolutionDockProps {
  playedCards: PlayedCard[];
  activeEffects: any[];
  resolutionStack: any[];
  selectedCard?: any;
  onCardSelect?: (card: any) => void;
  onClearDock?: () => void;
}

const PlayResolutionDock: React.FC<PlayResolutionDockProps> = ({
  playedCards = [],
  activeEffects = [],
  resolutionStack = [],
  selectedCard,
  onCardSelect,
  onClearDock
}) => {
  const [hoveredCard, setHoveredCard] = useState<any>(null);
  const [dockView, setDockView] = useState<'played' | 'effects' | 'stack'>('played');

  // Limit displayed cards to prevent overflow
  const recentCards = playedCards.slice(-6);
  const hasMoreCards = playedCards.length > 6;

  return (
    <div className="h-20 bg-newspaper-text border-t-2 border-newspaper-border flex items-center px-4 relative">
      {/* Dock Controls */}
      <div className="flex items-center gap-2 mr-4">
        <button
          onClick={() => setDockView('played')}
          className={`px-2 py-1 text-xs font-mono rounded ${
            dockView === 'played' 
              ? 'bg-newspaper-bg text-newspaper-text' 
              : 'text-newspaper-bg hover:bg-newspaper-bg/20'
          }`}
        >
          PLAYED ({playedCards.length})
        </button>
        <button
          onClick={() => setDockView('effects')}
          className={`px-2 py-1 text-xs font-mono rounded ${
            dockView === 'effects' 
              ? 'bg-newspaper-bg text-newspaper-text' 
              : 'text-newspaper-bg hover:bg-newspaper-bg/20'
          }`}
        >
          EFFECTS ({activeEffects.length})
        </button>
        <button
          onClick={() => setDockView('stack')}
          className={`px-2 py-1 text-xs font-mono rounded ${
            dockView === 'stack' 
              ? 'bg-newspaper-bg text-newspaper-text' 
              : 'text-newspaper-bg hover:bg-newspaper-bg/20'
          }`}
        >
          STACK ({resolutionStack.length})
        </button>
        
        {onClearDock && (playedCards.length > 0 || activeEffects.length > 0) && (
          <button
            onClick={onClearDock}
            className="ml-2 p-1 text-xs text-newspaper-bg hover:bg-newspaper-bg/20 rounded"
            title="Clear dock"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 flex items-center gap-2 overflow-x-hidden">
        {dockView === 'played' && (
          <>
            {hasMoreCards && (
              <div className="flex items-center text-newspaper-bg text-xs font-mono mr-2">
                <ChevronLeft className="w-3 h-3" />
                +{playedCards.length - 6} more
              </div>
            )}
            
            {recentCards.map((playedCard, index) => (
              <div
                key={index}
                className={`relative flex-shrink-0 cursor-pointer transition-all duration-200 ${
                  selectedCard?.id === playedCard.card.id
                    ? 'transform scale-110 z-10'
                    : 'hover:transform hover:scale-105'
                }`}
                onClick={() => onCardSelect?.(playedCard.card)}
                onMouseEnter={() => setHoveredCard(playedCard.card)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <Card className={`w-12 h-16 p-1 border text-xs ${
                  playedCard.player === 'player' 
                    ? 'border-blue-400 bg-blue-50' 
                    : 'border-red-400 bg-red-50'
                }`}>
                  <div className="text-center font-mono">
                    <div className="text-xs font-bold truncate">
                      {playedCard.card.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {playedCard.card.cost}
                    </div>
                  </div>
                </Card>
                
                {/* Player indicator */}
                <Badge 
                  variant="outline"
                  className={`absolute -top-1 -right-1 text-xs p-0 w-4 h-4 flex items-center justify-center ${
                    playedCard.player === 'player' ? 'border-blue-400 text-blue-400' : 'border-red-400 text-red-400'
                  }`}
                >
                  {playedCard.player === 'player' ? 'P' : 'AI'}
                </Badge>
              </div>
            ))}
            
            {playedCards.length === 0 && (
              <div className="text-newspaper-bg/60 text-xs font-mono italic">
                No cards played this turn
              </div>
            )}
          </>
        )}

        {dockView === 'effects' && (
          <div className="flex items-center gap-2 text-newspaper-bg text-xs font-mono">
            {activeEffects.length === 0 ? (
              <span className="italic opacity-60">No active effects</span>
            ) : (
              activeEffects.map((effect, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-1 bg-newspaper-bg/20 px-2 py-1 rounded"
                >
                  <Zap className="w-3 h-3 text-yellow-400" />
                  <span>{effect.name || 'Effect'}</span>
                  {effect.duration && (
                    <Clock className="w-3 h-3 text-gray-400" />
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {dockView === 'stack' && (
          <div className="flex items-center gap-2 text-newspaper-bg text-xs font-mono">
            {resolutionStack.length === 0 ? (
              <span className="italic opacity-60">Resolution stack empty</span>
            ) : (
              resolutionStack.map((item, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-1 bg-newspaper-bg/20 px-2 py-1 rounded"
                >
                  <Target className="w-3 h-3 text-green-400" />
                  <span>{item.name || 'Resolving...'}</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Selected Card Preview */}
      {selectedCard && (
        <div className="ml-4 flex-shrink-0 w-48">
          <div className="bg-newspaper-bg text-newspaper-text p-2 border border-newspaper-border rounded">
            <div className="text-xs font-mono">
              <div className="font-bold">{selectedCard.name}</div>
              <div className="text-xs mt-1 text-muted-foreground">
                {selectedCard.description}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hover tooltip */}
      {hoveredCard && (
        <div className="absolute bottom-full left-4 mb-2 z-50 pointer-events-none">
          <CardEffectTooltip card={hoveredCard} faction="truth" />
        </div>
      )}
    </div>
  );
};

export default PlayResolutionDock;