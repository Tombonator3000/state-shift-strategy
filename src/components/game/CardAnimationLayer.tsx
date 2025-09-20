import React, { useCallback, useEffect, useState } from 'react';
import { ParticleEffectType, ParticleSystem } from '@/components/effects/ParticleSystem';
import FloatingNumbers from '@/components/effects/FloatingNumbers';
import RedactionSweep from '@/components/effects/RedactionSweep';
import TabloidFlashOverlay from '@/components/effects/TabloidFlashOverlay';
import ConspiracyCorkboard from '@/components/effects/ConspiracyCorkboard';

interface CardAnimationLayerProps {
  children?: React.ReactNode;
}

const CardAnimationLayer: React.FC<CardAnimationLayerProps> = ({ children }) => {
  const [particleEffects, setParticleEffects] = useState<Array<{
    id: number;
    x: number;
    y: number;
    type: ParticleEffectType;
  }>>([]);

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

  const [truthFlash, setTruthFlash] = useState<{
    id: number;
    x: number;
    y: number;
  } | null>(null);

  const [corkboardOverlay, setCorkboardOverlay] = useState<{
    id: number;
    x: number;
    y: number;
    comboName?: string;
    bonusIP?: number;
  } | null>(null);

  const spawnParticleEffect = useCallback((type: ParticleEffectType, x: number, y: number) => {
    setParticleEffects(prev => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        type,
        x,
        y
      }
    ]);
  }, []);

  useEffect(() => {
    const handleCardDeployed = (event: CustomEvent<{ type: ParticleEffectType; x: number; y: number }>) => {
      if (!event?.detail) return;
      spawnParticleEffect(event.detail.type, event.detail.x, event.detail.y);
    };

    const handleStateCapture = (event: CustomEvent<{ x: number; y: number }>) => {
      if (!event?.detail) return;
      spawnParticleEffect('capture', event.detail.x, event.detail.y);
    };

    const handleStateLoss = (event: CustomEvent<{ x: number; y: number }>) => {
      if (!event?.detail) return;
      spawnParticleEffect('stateloss', event.detail.x, event.detail.y);
    };

    const handleSynergyActivation = (event: CustomEvent<{ bonusIP: number; numberType?: 'synergy' | 'combo' | 'chain'; effectType?: ParticleEffectType; x: number; y: number; comboName?: string }>) => {
      if (!event?.detail) return;
      const effectType = event.detail.effectType || 'synergy';
      const numberType = event.detail.numberType ?? 'synergy';
      spawnParticleEffect(effectType, event.detail.x, event.detail.y);

      // Also show floating number for synergy bonus
      setFloatingNumber({
        value: event.detail.bonusIP,
        type: numberType,
        x: event.detail.x,
        y: event.detail.y - 50
      });

      setCorkboardOverlay({
        id: Date.now(),
        x: event.detail.x,
        y: event.detail.y,
        comboName: event.detail.comboName,
        bonusIP: event.detail.bonusIP
      });
    };

    const handleGovernmentZoneTarget = (event: CustomEvent<{ active: boolean; x?: number; y?: number }>) => {
      if (!event?.detail) return;

      if (event.detail.active && typeof event.detail.x === 'number' && typeof event.detail.y === 'number') {
        spawnParticleEffect('counter', event.detail.x, event.detail.y);
      }
    };

    const handleFloatingNumber = (event: CustomEvent<{ value: number; type: 'ip' | 'truth' | 'damage' | 'synergy' | 'combo' | 'chain'; x: number; y: number }>) => {
      if (!event?.detail) return;
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

    const handleTruthFlash = (event: CustomEvent<{ x: number; y: number }>) => {
      if (!event?.detail) return;
      const { x, y } = event.detail;
      const prefersReducedMotion = typeof window !== 'undefined'
        && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (prefersReducedMotion) {
        return;
      }

      setTruthFlash({
        id: Date.now(),
        x,
        y
      });
      spawnParticleEffect('flash', x, y);
    };

    // Register event listeners
    window.addEventListener('cardDeployed', handleCardDeployed as EventListener);
    window.addEventListener('stateCapture', handleStateCapture as EventListener);
    window.addEventListener('stateLoss', handleStateLoss as EventListener);
    window.addEventListener('synergyActivation', handleSynergyActivation as EventListener);
    window.addEventListener('showFloatingNumber', handleFloatingNumber as EventListener);
    window.addEventListener('governmentRedaction', handleGovernmentRedaction as EventListener);
    window.addEventListener('truthFlash', handleTruthFlash as EventListener);
    window.addEventListener('governmentZoneTarget', handleGovernmentZoneTarget as EventListener);

    return () => {
      window.removeEventListener('cardDeployed', handleCardDeployed as EventListener);
      window.removeEventListener('stateCapture', handleStateCapture as EventListener);
      window.removeEventListener('stateLoss', handleStateLoss as EventListener);
      window.removeEventListener('synergyActivation', handleSynergyActivation as EventListener);
      window.removeEventListener('showFloatingNumber', handleFloatingNumber as EventListener);
      window.removeEventListener('governmentRedaction', handleGovernmentRedaction as EventListener);
      window.removeEventListener('truthFlash', handleTruthFlash as EventListener);
      window.removeEventListener('governmentZoneTarget', handleGovernmentZoneTarget as EventListener);
    };
  }, [spawnParticleEffect]);

  const handleParticleComplete = useCallback((id: number) => {
    setParticleEffects(prev => prev.filter(effect => effect.id !== id));
  }, []);

  const handleFloatingNumberComplete = () => {
    setFloatingNumber(null);
  };

  const handleRedactionComplete = () => {
    setRedactionSweep(null);
  };

  const handleTruthFlashComplete = useCallback(() => {
    setTruthFlash(null);
  }, []);

  const handleCorkboardComplete = useCallback(() => {
    setCorkboardOverlay(null);
  }, []);

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
        {corkboardOverlay && (
          <ConspiracyCorkboard
            key={corkboardOverlay.id}
            x={corkboardOverlay.x}
            y={corkboardOverlay.y}
            comboName={corkboardOverlay.comboName}
            bonusIP={corkboardOverlay.bonusIP}
            onComplete={handleCorkboardComplete}
          />
        )}
      </div>

      {/* Particle Effects */}
      {particleEffects.map(effect => (
        <ParticleSystem
          key={effect.id}
          active
          x={effect.x}
          y={effect.y}
          type={effect.type}
          onComplete={() => handleParticleComplete(effect.id)}
        />
      ))}

      {/* Truth Flash Overlay */}
      {truthFlash && (
        <TabloidFlashOverlay
          key={truthFlash.id}
          x={truthFlash.x}
          y={truthFlash.y}
          onComplete={handleTruthFlashComplete}
        />
      )}

      {/* Floating Numbers */}
      <FloatingNumbers
        trigger={floatingNumber}
      />
    </>
  );
};

export default CardAnimationLayer;