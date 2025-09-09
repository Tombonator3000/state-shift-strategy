import React from 'react';

interface CardPreviewOverlayProps {
  card: {
    id: string;
    name: string;
    type: 'ZONE' | 'INFLUENCE' | 'TRUTH';
    effect: string;
  } | null;
  targetStates?: string[];
}

const CardPreviewOverlay = ({ card, targetStates = [] }: CardPreviewOverlayProps) => {
  if (!card) return null;

  return (
    <div className="absolute inset-0 bg-black/20 pointer-events-none z-10">
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

      {/* Card preview tooltip */}
      <div className="absolute bottom-4 left-4 bg-newspaper-text text-newspaper-bg p-4 border-2 border-truth-red font-mono max-w-xs animate-fade-in">
        <div className="font-bold text-lg mb-2">{card.name}</div>
        <div className="text-sm mb-2">Type: {card.type}</div>
        <div className="text-xs opacity-90">{card.effect}</div>
        
        {card.type === 'ZONE' && (
          <div className="mt-2 text-xs text-truth-red">
            💥 Hover over states to see targeting preview
          </div>
        )}
      </div>
    </div>
  );
};

export default CardPreviewOverlay;