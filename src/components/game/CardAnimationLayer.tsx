import React, { useEffect, useRef, useState } from 'react';
import { ParticleSystem } from '@/components/effects/ParticleSystem';

interface CardAnimationLayerProps {
  children?: React.ReactNode;
}

const CardAnimationLayer: React.FC<CardAnimationLayerProps> = ({ children }) => {
  const [particleEffect, setParticleEffect] = useState<{
    active: boolean;
    x: number;
    y: number;
    type: 'deploy' | 'capture' | 'counter' | 'victory';
  }>({
    active: false,
    x: 0,
    y: 0,
    type: 'deploy'
  });

  useEffect(() => {
    const handleCardDeployed = (event: CustomEvent) => {
      setParticleEffect({
        active: true,
        x: event.detail.x,
        y: event.detail.y,
        type: event.detail.type
      });
    };

    const handleStateCapture = (event: CustomEvent) => {
      setParticleEffect({
        active: true,
        x: event.detail.x,
        y: event.detail.y,
        type: 'capture'
      });
    };

    window.addEventListener('cardDeployed', handleCardDeployed as EventListener);
    window.addEventListener('stateCapture', handleStateCapture as EventListener);

    return () => {
      window.removeEventListener('cardDeployed', handleCardDeployed as EventListener);
      window.removeEventListener('stateCapture', handleStateCapture as EventListener);
    };
  }, []);

  const handleParticleComplete = () => {
    setParticleEffect(prev => ({ ...prev, active: false }));
  };

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

      {/* Particle Effects */}
      <ParticleSystem
        active={particleEffect.active}
        x={particleEffect.x}
        y={particleEffect.y}
        type={particleEffect.type}
        onComplete={handleParticleComplete}
      />
    </>
  );
};

export default CardAnimationLayer;