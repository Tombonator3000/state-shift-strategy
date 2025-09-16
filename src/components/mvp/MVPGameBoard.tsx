// MVP Game Board - Simplified 3-type card interface
// Clean UI for streamlined gameplay

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useMVPGame } from '@/hooks/useMVPGame';
import type { MVPCard } from '@/types/mvp-types';
import { toast } from 'sonner';

// Card component
interface MVPCardProps {
  card: MVPCard;
  isSelected: boolean;
  canPlay: boolean;
  onClick: () => void;
  onPlay?: () => void;
}

function MVPCardComponent({ card, isSelected, canPlay, onClick, onPlay }: MVPCardProps) {
  const getBorderClass = () => {
    if (isSelected) return 'border-2 border-primary';
    if (canPlay) return 'border border-green-500 hover:border-green-400';
    return 'border border-muted-foreground/20 opacity-60';
  };

  const getTypeColor = () => {
    switch (card.type) {
      case 'ATTACK': return 'bg-red-500';
      case 'MEDIA': return 'bg-blue-500';
      case 'ZONE': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getEffectText = () => {
    switch (card.type) {
      case 'ATTACK':
        const attackEffects = card.effects as any;
        let text = `−${attackEffects.ipDelta.opponent} IP`;
        if (attackEffects.discardOpponent) {
          text += `, discard ${attackEffects.discardOpponent}`;
        }
        return text;
        
      case 'MEDIA':
        const mediaEffects = card.effects as any;
        const delta = mediaEffects.truthDelta;
        return `${delta > 0 ? '+' : ''}${delta}% Truth`;
        
      case 'ZONE':
        const zoneEffects = card.effects as any;
        return `+${zoneEffects.pressureDelta} Pressure`;
        
      default:
        return '';
    }
  };

  return (
    <Card 
      className={`cursor-pointer transition-all ${getBorderClass()}`}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-sm font-semibold leading-tight">
            {card.name}
          </CardTitle>
          <Badge className={`${getTypeColor()} text-white text-xs`}>
            {card.cost}
          </Badge>
        </div>
        <div className="flex gap-1">
          <Badge variant="outline" className="text-xs">
            {card.type}
          </Badge>
          <Badge variant="outline" className="text-xs capitalize">
            {card.rarity}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-xs font-medium text-primary mb-1">
          {getEffectText()}
        </div>
        <p className="text-xs text-muted-foreground italic">
          {card.flavorTruth}
        </p>
        {onPlay && canPlay && (
          <Button 
            size="sm" 
            className="w-full mt-2"
            onClick={(e) => {
              e.stopPropagation();
              onPlay();
            }}
          >
            Play
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// State selector component
interface StateSelectorProps {
  selectedState: string | null;
  onSelect: (stateId: string) => void;
  pressureData: Record<string, { P1: number; P2: number }>;
  stateDefense: Record<string, number>;
}

function StateSelector({ selectedState, onSelect, pressureData, stateDefense }: StateSelectorProps) {
  const importantStates = ['CA', 'TX', 'NY', 'FL', 'PA', 'IL', 'OH', 'GA'];
  
  return (
    <div className="grid grid-cols-4 gap-2">
      {importantStates.map(stateId => {
        const pressure = pressureData[stateId];
        const defense = stateDefense[stateId] || 2;
        
        return (
          <Button
            key={stateId}
            variant={selectedState === stateId ? "default" : "outline"}
            size="sm"
            onClick={() => onSelect(stateId)}
            className="flex flex-col h-auto p-2"
          >
            <div className="font-bold">{stateId}</div>
            <div className="text-xs">
              Def: {defense}
            </div>
            {pressure && (
              <div className="text-xs">
                P1:{pressure.P1} P2:{pressure.P2}
              </div>
            )}
          </Button>
        );
      })}
    </div>
  );
}

// Main game board
export function MVPGameBoard() {
  const {
    gameState,
    currentPlayer,
    currentPlayerData,
    opponentData,
    winner,
    gameLog,
    selectedCard,
    selectedState,
    startNewGame,
    selectCard,
    selectState,
    playCard,
    canPlayCard,
    discardCards,
    endTurn,
    startTurn,
    playsRemaining,
    canEndTurn,
    getStateDefense,
    getStatePressure
  } = useMVPGame();

  // Initialize game on first render
  React.useEffect(() => {
    if (gameState.turn === 1 && gameState.playsThisTurn === 0) {
      startTurn();
    }
  }, []);

  const handlePlayCard = () => {
    if (!selectedCard) return;
    
    const targetStateId = selectedCard.type === 'ZONE' ? selectedState : undefined;
    const result = playCard(selectedCard, targetStateId);
    
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  const handleCardClick = (card: MVPCard) => {
    selectCard(selectedCard?.id === card.id ? null : card);
  };

  const canPlaySelected = selectedCard ? canPlayCard(selectedCard, selectedState || undefined).success : false;

  if (winner) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-center">Game Over!</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-4">
              <strong>{winner.winner}</strong> wins!
            </p>
            <p className="text-muted-foreground mb-4">{winner.reason}</p>
            <Button onClick={startNewGame}>New Game</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-7xl mx-auto">
      {/* Game Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Paranoid Times MVP</h1>
          <Button onClick={startNewGame} variant="outline">
            New Game
          </Button>
        </div>
        
        {/* Game Status */}
        <div className="grid grid-cols-4 gap-4 mb-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Turn</div>
              <div className="text-2xl font-bold">{gameState.turn}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Truth</div>
              <div className="text-2xl font-bold">{gameState.truth}%</div>
              <Progress value={gameState.truth} className="mt-1" />
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Current Player</div>
              <div className="text-lg font-bold capitalize">
                {currentPlayer} ({currentPlayerData.faction})
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Plays Left</div>
              <div className="text-2xl font-bold">{playsRemaining}</div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left Panel - Player Info */}
        <div className="col-span-3">
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Your Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>IP: <strong>{currentPlayerData.ip}</strong></div>
                <div>Hand: <strong>{currentPlayerData.hand.length}</strong></div>
                <div>Deck: <strong>{currentPlayerData.deck.length}</strong></div>
                <div>States: <strong>{currentPlayerData.states.length}</strong></div>
                <div>Free Discards: <strong>{currentPlayerData.freeDiscardsLeft}</strong></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Opponent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>IP: <strong>{opponentData.ip}</strong></div>
                <div>Hand: <strong>{opponentData.hand.length}</strong></div>
                <div>States: <strong>{opponentData.states.length}</strong></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Center Panel - Main Game Area */}
        <div className="col-span-6">
          {/* Selected Card & Actions */}
          {selectedCard && (
            <Card className="mb-4">
              <CardHeader>
                <CardTitle>Selected Card</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <MVPCardComponent
                    card={selectedCard}
                    isSelected={true}
                    canPlay={canPlaySelected}
                    onClick={() => {}}
                  />
                </div>
                
                {selectedCard.type === 'ZONE' && (
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">Select Target State:</h4>
                    <StateSelector
                      selectedState={selectedState}
                      onSelect={selectState}
                      pressureData={gameState.pressureByState}
                      stateDefense={gameState.stateDefense}
                    />
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Button 
                    onClick={handlePlayCard}
                    disabled={!canPlaySelected || (selectedCard.type === 'ZONE' && !selectedState)}
                    className="flex-1"
                  >
                    Play Card
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => selectCard(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Your Hand */}
          <Card>
            <CardHeader>
              <CardTitle>Your Hand ({currentPlayerData.hand.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {currentPlayerData.hand.map(card => (
                  <MVPCardComponent
                    key={card.id}
                    card={card}
                    isSelected={selectedCard?.id === card.id}
                    canPlay={canPlayCard(card, selectedState || undefined).success}
                    onClick={() => handleCardClick(card)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Game Log & Controls */}
        <div className="col-span-3">
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={endTurn}
                disabled={!canEndTurn}
                className="w-full mb-2"
              >
                End Turn
              </Button>
              
              {currentPlayerData.hand.length > 5 && (
                <Button 
                  variant="outline"
                  onClick={() => {
                    // Simple discard - remove last card
                    const lastCard = currentPlayerData.hand[currentPlayerData.hand.length - 1];
                    if (lastCard) {
                      discardCards([lastCard.id]);
                      toast.info('Discarded 1 card');
                    }
                  }}
                  className="w-full"
                >
                  Discard Card
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Game Log</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {gameLog.slice(-10).map((entry, idx) => (
                  <div key={idx} className="text-xs text-muted-foreground">
                    {entry}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}