import React, { useEffect, useState } from 'react';
import { ParticleSystem } from '@/components/effects/ParticleSystem';
import FloatingNumbers from '@/components/effects/FloatingNumbers';
import RedactionSweep from '@/components/effects/RedactionSweep';

interface CardAnimationLayerProps {
  children?: React.ReactNode;
}

const CardAnimationLayer: React.FC<CardAnimationLayerProps> = ({ children }) => {
  const [particleEffect, setParticleEffect] = useState<{
    active: boolean;
    x: number;
    y: number;
    type: 'deploy' | 'capture' | 'counter' | 'victory' | 'synergy' | 'bigwin' | 'stateloss' | 'chain';
  }>({
    active: false,
    x: 0,
    y: 0,
    type: 'deploy'
  });

  const [floatingNumber, setFloatingNumber] = useState<{
    value: number;
    type: 'ip' | 'truth' | 'damage' | 'synergy' | 'combo' | 'chain';
    x?: number;
    y?: number;
  } | null>(null);

  const [redactionSweep, setRedactionSweep] = useState<{
    active: boolean;
    key: number;
  } | null>(null);

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

    const handleStateLoss = (event: CustomEvent) => {
      setParticleEffect({
        active: true,
        x: event.detail.x,
        y: event.detail.y,
        type: 'stateloss'
      });
    };

    const handleSynergyActivation = (event: CustomEvent) => {
      setParticleEffect({
        active: true,
        x: event.detail.x,
        y: event.detail.y,
        type: event.detail.effectType || 'synergy'
      });

      // Also show floating number for synergy bonus
      setFloatingNumber({
        value: event.detail.bonusIP,
        type: event.detail.numberType || 'synergy',
        x: event.detail.x,
        y: event.detail.y - 50
      });
    };

    const handleFloatingNumber = (event: CustomEvent) => {
      setFloatingNumber({
        value: event.detail.value,
        type: event.detail.type,
        x: event.detail.x,
        y: event.detail.y
      });
    };

    const handleGovernmentRedaction = () => {
      setRedactionSweep({
        active: true,
        key: Date.now()
      });
    };

    // Register event listeners
    window.addEventListener('cardDeployed', handleCardDeployed as EventListener);
    window.addEventListener('stateCapture', handleStateCapture as EventListener);
    window.addEventListener('stateLoss', handleStateLoss as EventListener);
    window.addEventListener('synergyActivation', handleSynergyActivation as EventListener);
    window.addEventListener('showFloatingNumber', handleFloatingNumber as EventListener);
    window.addEventListener('governmentRedaction', handleGovernmentRedaction as EventListener);

    return () => {
      window.removeEventListener('cardDeployed', handleCardDeployed as EventListener);
      window.removeEventListener('stateCapture', handleStateCapture as EventListener);
      window.removeEventListener('stateLoss', handleStateLoss as EventListener);
      window.removeEventListener('synergyActivation', handleSynergyActivation as EventListener);
      window.removeEventListener('showFloatingNumber', handleFloatingNumber as EventListener);
      window.removeEventListener('governmentRedaction', handleGovernmentRedaction as EventListener);
    };
  }, []);

  const handleParticleComplete = () => {
    setParticleEffect(prev => ({ ...prev, active: false }));
  };

  const handleFloatingNumberComplete = () => {
    setFloatingNumber(null);
  };

  const handleRedactionComplete = () => {
    setRedactionSweep(null);
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
        {redactionSweep?.active && (
          <RedactionSweep key={redactionSweep.key} onComplete={handleRedactionComplete} />
        )}
      </div>

      {/* Particle Effects */}
      <ParticleSystem
        active={particleEffect.active}
        x={particleEffect.x}
        y={particleEffect.y}
        type={particleEffect.type}
        onComplete={handleParticleComplete}
      />

      {/* Floating Numbers */}
      <FloatingNumbers 
        trigger={floatingNumber}
      />
    </>
  );
};

export default CardAnimationLayer;