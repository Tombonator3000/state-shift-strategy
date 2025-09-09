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
        className="fixed inset-0 pointer-events-none z-[40]"
        aria-hidden="true"
      >
        {children}
      </div>
      
      {/* Played cards pile under map */}
      <div 
        id="played-pile" 
        className="absolute left-1/2 transform -translate-x-1/2 bottom-4 z-[400] grid grid-cols-5 gap-1"
        role="region" 
        aria-label="Played cards"
        aria-live="polite"
        style={{ width: 'min(600px, 90vw)' }}
      />
    </>
  );
};

export default CardAnimationLayer;