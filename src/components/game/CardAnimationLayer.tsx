import React, { useEffect, useRef } from 'react';

interface CardAnimationLayerProps {
  children?: React.ReactNode;
}

const CardAnimationLayer: React.FC<CardAnimationLayerProps> = ({ children }) => {
  return (
    <>
      {/* Full-screen overlay for card animations */}
      <div 
        id="card-play-layer" 
        className="fixed inset-0 pointer-events-none z-[1600]"
        aria-hidden="true"
      >
        {children}
      </div>
      
      {/* Played cards pile in bottom right */}
      <div 
        id="played-pile" 
        className="fixed right-4 bottom-4 z-[400] grid grid-cols-3 gap-2"
        role="region" 
        aria-label="Played cards"
        aria-live="polite"
      />
    </>
  );
};

export default CardAnimationLayer;