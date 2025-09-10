import React from 'react';

interface CardPreviewOverlayProps {
  card: ({
    id: string;
    name: string;
    type: string;
    text: string;
    cost: number;
    rarity?: string;
    _hoverPosition?: { x: number; y: number };
  }) | null;
  targetStates?: string[];
}

const CardPreviewOverlay = ({ card, targetStates = [] }: CardPreviewOverlayProps) => {
  if (!card) return null;

  const tooltipStyle = card._hoverPosition ? {
    position: 'fixed' as const,
    left: `${card._hoverPosition.x}px`,
    top: `${card._hoverPosition.y - 50}px`, // Center vertically with offset
    transform: 'translateY(-50%)',
    zIndex: 1000
  } : {
    position: 'absolute' as const,
    bottom: '1rem',
    left: '1rem'
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {/* Highlight potential target states */}
      {card.type === 'ZONE' && targetStates.map(stateId => (
        <div
          key={stateId}
          className="absolute animate-pulse"
          data-state-highlight={stateId}
          style={{
            filter: 'drop-shadow(0 0 20px rgba(239, 68, 68, 0.8))',
            border: '2px solid rgb(239, 68, 68)',
            borderRadius: '4px'
          }}
        />
      ))}

      {/* Card preview tooltip - positioned next to hovered card */}
      <div className="animate-fade-in" style={tooltipStyle}>
        <div className="bg-popover border border-border rounded-lg p-3 shadow-xl max-w-xs">
          <div className="font-bold text-sm text-foreground mb-1">
            {card.name}
          </div>
          <div className="text-xs text-muted-foreground mb-2">
            {card.type} • Cost: {card.cost}
          </div>
          <div className="text-xs text-foreground">
            {card.text}
          </div>
          
          {card.type === 'ZONE' && (
            <div className="mt-2 text-xs text-accent">
              🎯 Click on a neutral or enemy state to deploy
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CardPreviewOverlay;