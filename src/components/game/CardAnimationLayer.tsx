import React, { useCallback, useEffect, useState } from 'react';
import { ParticleEffectType, ParticleSystem } from '@/components/effects/ParticleSystem';
import FloatingNumbers from '@/components/effects/FloatingNumbers';
import RedactionSweep from '@/components/effects/RedactionSweep';
import TabloidFlashOverlay from '@/components/effects/TabloidFlashOverlay';
import ConspiracyCorkboard from '@/components/effects/ConspiracyCorkboard';
import UFOElvisBroadcast from '@/components/effects/UFOElvisBroadcast';
import BigfootTrailCam from '@/components/effects/BigfootTrailCam';
import BreakingNewsTicker from '@/components/effects/BreakingNewsTicker';
import GovernmentSurveillance from '@/components/effects/GovernmentSurveillance';
import TypewriterReveal from '@/components/effects/TypewriterReveal';
import StaticInterference from '@/components/effects/StaticInterference';
import EvidencePhotoGallery from '@/components/effects/EvidencePhotoGallery';
import ComboGlitchOverlay from '@/components/effects/ComboGlitchOverlay';
import { useAudioContext } from '@/contexts/AudioContext';
import { areParanormalEffectsEnabled } from '@/state/settings';
import {
  isSynergyEffectIdentifier,
  resolveParticleEffectType,
  type SynergyEffectIdentifier
} from '@/utils/synergyEffects';

const COMBO_GLITCH_DURATIONS: Record<'minor' | 'major' | 'mega', number> = {
  minor: 900,
  major: 1200,
  mega: 1500
};

const COMBO_GLITCH_SFX_DELAYS: Record<'minor' | 'major' | 'mega', number | null> = {
  minor: null,
  major: 140,
  mega: 220
};

type FloatingNumberType = 'ip' | 'truth' | 'damage' | 'synergy' | 'combo' | 'chain' | SynergyEffectIdentifier;

interface CardAnimationLayerProps {
  children?: React.ReactNode;
}

const CardAnimationLayer: React.FC<CardAnimationLayerProps> = ({ children }) => {
  const audio = useAudioContext();
  const [particleEffects, setParticleEffects] = useState<Array<{
    id: number;
    x: number;
    y: number;
    type: ParticleEffectType;
  }>>([]);

  const [floatingNumber, setFloatingNumber] = useState<{
    value: number;
    type: FloatingNumberType;
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
  const [comboGlitchOverlay, setComboGlitchOverlay] = useState<{
    id: number;
    x: number;
    y: number;
    comboNames: string[];
    intensity: 'minor' | 'major' | 'mega';
    magnitude: number;
    duration: number;
    reducedMotion?: boolean;
  } | null>(null);
  const [broadcastOverlay, setBroadcastOverlay] = useState<{
    id: number;
    x: number;
    y: number;
    intensity: 'surge' | 'collapse';
    setList: string[];
    truthValue?: number;
    reducedMotion?: boolean;
  } | null>(null);
  const [cryptidOverlay, setCryptidOverlay] = useState<{
    id: number;
    x: number;
    y: number;
    stateId: string;
    stateName?: string;
    footageQuality: string;
    reducedMotion?: boolean;
  } | null>(null);

  // New enhanced effect states
  const [breakingNewsOverlay, setBreakingNewsOverlay] = useState<{
    id: number;
    x: number;
    y: number;
    newsText: string;
  } | null>(null);

  const [surveillanceOverlay, setSurveillanceOverlay] = useState<{
    id: number;
    x: number;
    y: number;
    targetName: string;
    threatLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CLASSIFIED';
  } | null>(null);

  const [typewriterOverlay, setTypewriterOverlay] = useState<{
    id: number;
    x: number;
    y: number;
    documentTitle: string;
    documentContent: string[];
    classificationLevel: 'UNCLASSIFIED' | 'CONFIDENTIAL' | 'SECRET' | 'TOP SECRET';
  } | null>(null);

  const [staticOverlay, setStaticOverlay] = useState<{
    id: number;
    x: number;
    y: number;
    intensity: 'light' | 'medium' | 'heavy' | 'signal-lost';
    message: string;
  } | null>(null);

  const [evidenceOverlay, setEvidenceOverlay] = useState<{
    id: number;
    x: number;
    y: number;
    caseTitle: string;
    photos: Array<{
      id: string;
      src: string;
      caption: string;
      timestamp: string;
      caseNumber: string;
    }>;
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

    const handleSynergyActivation = (event: CustomEvent<{ bonusIP: number; numberType?: FloatingNumberType; effectType?: string; x: number; y: number; comboName?: string }>) => {
      if (!event?.detail) return;
      const rawEffectType = event.detail.effectType ?? event.detail.numberType ?? 'synergy';
      const particleType = resolveParticleEffectType(rawEffectType, 'synergy');
      const numberType: FloatingNumberType = isSynergyEffectIdentifier(rawEffectType)
        ? rawEffectType
        : event.detail.numberType ?? 'synergy';

      spawnParticleEffect(particleType, event.detail.x, event.detail.y);

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

    const handleTruthMeltdownBroadcast = (event: CustomEvent<{
      position: { x: number; y: number };
      intensity: 'surge' | 'collapse';
      setList: string[];
      truthValue?: number;
      reducedMotion?: boolean;
    }>) => {
      if (!event?.detail) return;
      if (!areParanormalEffectsEnabled()) {
        setBroadcastOverlay(null);
        return;
      }
      const { position, intensity, setList, truthValue, reducedMotion } = event.detail;
      if (position && !reducedMotion) {
        spawnParticleEffect('broadcast', position.x, position.y);
      }
      setBroadcastOverlay({
        id: Date.now(),
        x: position?.x ?? window.innerWidth / 2,
        y: position?.y ?? window.innerHeight / 2,
        intensity,
        setList,
        truthValue,
        reducedMotion,
      });
      if (areParanormalEffectsEnabled()) {
        audio?.playSFX?.('ufo-elvis');
      }
    };

    const handleCryptidSighting = (event: CustomEvent<{
      position: { x: number; y: number };
      stateId: string;
      stateName?: string;
      footageQuality: string;
      reducedMotion?: boolean;
      }>) => {
      if (!event?.detail) return;
      if (!areParanormalEffectsEnabled()) {
        setCryptidOverlay(null);
        return;
      }
      const { position, stateId, stateName, footageQuality, reducedMotion } = event.detail;
      if (position && !reducedMotion) {
        spawnParticleEffect('cryptid', position.x, position.y);
      }
      setCryptidOverlay({
        id: Date.now(),
        x: position?.x ?? window.innerWidth / 2,
        y: position?.y ?? window.innerHeight / 2,
        stateId,
        stateName,
        footageQuality,
        reducedMotion,
      });
      if (areParanormalEffectsEnabled()) {
        audio?.playSFX?.('cryptid-rumble');
      }
    };

    const handleComboGlitch = (event: CustomEvent<{
      x: number;
      y: number;
      comboNames?: string[];
      comboCount?: number;
      intensity?: 'minor' | 'major' | 'mega';
      magnitude?: number;
      reducedMotion?: boolean;
    }>) => {
      if (!event?.detail) return;

      const {
        x,
        y,
        comboNames = [],
        intensity,
        magnitude,
        reducedMotion,
      } = event.detail;

      const prefersReducedMotion = reducedMotion ?? (typeof window !== 'undefined'
        && typeof window.matchMedia === 'function'
        && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
      const resolvedIntensity = intensity ?? 'minor';

      if (!prefersReducedMotion) {
        audio?.playSFX?.('radio-static');
        const sfxDelay = COMBO_GLITCH_SFX_DELAYS[resolvedIntensity];
        if (typeof sfxDelay === 'number' && sfxDelay > 0) {
          window.setTimeout(() => {
            audio?.playSFX?.('radio-static');
          }, sfxDelay);
        }
      }

      const sanitizedMagnitude = typeof magnitude === 'number' && !Number.isNaN(magnitude)
        ? Math.max(0, magnitude)
        : 0;

      setComboGlitchOverlay({
        id: Date.now(),
        x,
        y,
        comboNames,
        intensity: resolvedIntensity,
        magnitude: sanitizedMagnitude,
        duration: COMBO_GLITCH_DURATIONS[resolvedIntensity],
        reducedMotion: prefersReducedMotion,
      });
    };

    // New enhanced effect handlers
    const handleBreakingNews = (event: CustomEvent<{
      newsText: string;
      x: number;
      y: number;
    }>) => {
      if (!event?.detail) return;
      if (!areParanormalEffectsEnabled()) {
        setBreakingNewsOverlay(null);
        return;
      }
      const { newsText, x, y } = event.detail;
      setBreakingNewsOverlay({
        id: Date.now(),
        x,
        y,
        newsText
      });
      spawnParticleEffect('flash', x, y);
      audio?.playSFX?.('newspaper');
    };

    const handleGovernmentSurveillance = (event: CustomEvent<{
      targetName: string;
      threatLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CLASSIFIED';
      x: number;
      y: number;
    }>) => {
      if (!event?.detail) return;
      if (!areParanormalEffectsEnabled()) {
        setSurveillanceOverlay(null);
        return;
      }
      const { targetName, threatLevel, x, y } = event.detail;
      setSurveillanceOverlay({
        id: Date.now(),
        x,
        y,
        targetName,
        threatLevel
      });
      spawnParticleEffect('counter', x, y);
      audio?.playSFX?.('click'); // Surveillance beep
    };

    const handleTypewriterReveal = (event: CustomEvent<{
      documentTitle: string;
      documentContent: string[];
      classificationLevel: 'UNCLASSIFIED' | 'CONFIDENTIAL' | 'SECRET' | 'TOP SECRET';
      x: number;
      y: number;
    }>) => {
      if (!event?.detail) return;
      if (!areParanormalEffectsEnabled()) {
        setTypewriterOverlay(null);
        return;
      }
      const { documentTitle, documentContent, classificationLevel, x, y } = event.detail;
      setTypewriterOverlay({
        id: Date.now(),
        x,
        y,
        documentTitle,
        documentContent,
        classificationLevel
      });
      audio?.playSFX?.('typewriter');
    };

    const handleStaticInterference = (event: CustomEvent<{
      intensity: 'light' | 'medium' | 'heavy' | 'signal-lost';
      message: string;
      x: number;
      y: number;
    }>) => {
      if (!event?.detail) return;
      if (!areParanormalEffectsEnabled()) {
        setStaticOverlay(null);
        return;
      }
      const { intensity, message, x, y } = event.detail;
      setStaticOverlay({
        id: Date.now(),
        x,
        y,
        intensity,
        message
      });
      spawnParticleEffect('broadcast', x, y);
      audio?.playSFX?.('radio-static');
    };

    const handleEvidenceGallery = (event: CustomEvent<{
      caseTitle: string;
      photos: Array<{
        id: string;
        src: string;
        caption: string;
        timestamp: string;
        caseNumber: string;
      }>;
      x: number;
      y: number;
    }>) => {
      if (!event?.detail) return;
      if (!areParanormalEffectsEnabled()) {
        setEvidenceOverlay(null);
        return;
      }
      const { caseTitle, photos, x, y } = event.detail;
      setEvidenceOverlay({
        id: Date.now(),
        x,
        y,
        caseTitle,
        photos
      });
      spawnParticleEffect('flash', x, y);
      audio?.playSFX?.('cardPlay');
    };

    const handleFloatingNumber = (event: CustomEvent<{ value: number; type: FloatingNumberType; x: number; y: number }>) => {
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
    window.addEventListener('truthMeltdownBroadcast', handleTruthMeltdownBroadcast as EventListener);
    window.addEventListener('cryptidSighting', handleCryptidSighting as EventListener);
    window.addEventListener('comboGlitch', handleComboGlitch as EventListener);

    // New enhanced effect listeners
    window.addEventListener('breakingNews', handleBreakingNews as EventListener);
    window.addEventListener('governmentSurveillance', handleGovernmentSurveillance as EventListener);
    window.addEventListener('typewriterReveal', handleTypewriterReveal as EventListener);
    window.addEventListener('staticInterference', handleStaticInterference as EventListener);
    window.addEventListener('evidenceGallery', handleEvidenceGallery as EventListener);

    return () => {
      window.removeEventListener('cardDeployed', handleCardDeployed as EventListener);
      window.removeEventListener('stateCapture', handleStateCapture as EventListener);
      window.removeEventListener('stateLoss', handleStateLoss as EventListener);
      window.removeEventListener('synergyActivation', handleSynergyActivation as EventListener);
      window.removeEventListener('showFloatingNumber', handleFloatingNumber as EventListener);
      window.removeEventListener('governmentRedaction', handleGovernmentRedaction as EventListener);
      window.removeEventListener('truthFlash', handleTruthFlash as EventListener);
      window.removeEventListener('governmentZoneTarget', handleGovernmentZoneTarget as EventListener);
      window.removeEventListener('truthMeltdownBroadcast', handleTruthMeltdownBroadcast as EventListener);
      window.removeEventListener('cryptidSighting', handleCryptidSighting as EventListener);
      window.removeEventListener('comboGlitch', handleComboGlitch as EventListener);

      // New enhanced effect listeners
      window.removeEventListener('breakingNews', handleBreakingNews as EventListener);
      window.removeEventListener('governmentSurveillance', handleGovernmentSurveillance as EventListener);
      window.removeEventListener('typewriterReveal', handleTypewriterReveal as EventListener);
      window.removeEventListener('staticInterference', handleStaticInterference as EventListener);
      window.removeEventListener('evidenceGallery', handleEvidenceGallery as EventListener);
    };
  }, [spawnParticleEffect, audio]);

  const clearParanormalOverlays = useCallback(() => {
    setBreakingNewsOverlay(null);
    setSurveillanceOverlay(null);
    setTypewriterOverlay(null);
    setStaticOverlay(null);
    setEvidenceOverlay(null);
    setBroadcastOverlay(null);
    setCryptidOverlay(null);
  }, []);

  useEffect(() => {
    const handleParanormalToggle = (event: Event) => {
      const detail = (event as CustomEvent<{ enabled?: boolean }>).detail;
      if (!detail?.enabled) {
        clearParanormalOverlays();
      }
    };

    const handleStorageSync = () => {
      if (!areParanormalEffectsEnabled()) {
        clearParanormalOverlays();
      }
    };

    if (!areParanormalEffectsEnabled()) {
      clearParanormalOverlays();
    }

    window.addEventListener('shadowgov:paranormal-effects-toggled', handleParanormalToggle);
    window.addEventListener('storage', handleStorageSync);

    return () => {
      window.removeEventListener('shadowgov:paranormal-effects-toggled', handleParanormalToggle);
      window.removeEventListener('storage', handleStorageSync);
    };
  }, [clearParanormalOverlays]);

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

  const handleBroadcastComplete = useCallback(() => {
    setBroadcastOverlay(null);
  }, []);

  const handleCryptidComplete = useCallback(() => {
    setCryptidOverlay(null);
  }, []);

  const handleComboGlitchComplete = useCallback(() => {
    setComboGlitchOverlay(null);
  }, []);

  // New enhanced effect completion handlers
  const handleBreakingNewsComplete = useCallback(() => {
    setBreakingNewsOverlay(null);
  }, []);

  const handleSurveillanceComplete = useCallback(() => {
    setSurveillanceOverlay(null);
  }, []);

  const handleTypewriterComplete = useCallback(() => {
    setTypewriterOverlay(null);
  }, []);

  const handleStaticComplete = useCallback(() => {
    setStaticOverlay(null);
  }, []);

  const handleEvidenceComplete = useCallback(() => {
    setEvidenceOverlay(null);
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
        {comboGlitchOverlay && (
          <ComboGlitchOverlay
            key={comboGlitchOverlay.id}
            x={comboGlitchOverlay.x}
            y={comboGlitchOverlay.y}
            comboNames={comboGlitchOverlay.comboNames}
            intensity={comboGlitchOverlay.intensity}
            magnitude={comboGlitchOverlay.magnitude}
            duration={comboGlitchOverlay.duration}
            reducedMotion={comboGlitchOverlay.reducedMotion}
            onComplete={handleComboGlitchComplete}
          />
        )}
        {broadcastOverlay && (
          <UFOElvisBroadcast
            key={broadcastOverlay.id}
            x={broadcastOverlay.x}
            y={broadcastOverlay.y}
            intensity={broadcastOverlay.intensity}
            setList={broadcastOverlay.setList}
            truthValue={broadcastOverlay.truthValue}
            reducedMotion={broadcastOverlay.reducedMotion}
            onComplete={handleBroadcastComplete}
          />
        )}
        {cryptidOverlay && (
          <BigfootTrailCam
            key={cryptidOverlay.id}
            x={cryptidOverlay.x}
            y={cryptidOverlay.y}
            stateName={cryptidOverlay.stateName}
            footageQuality={cryptidOverlay.footageQuality}
            reducedMotion={cryptidOverlay.reducedMotion}
            onComplete={handleCryptidComplete}
          />
        )}

        {/* New Enhanced Effects */}
        {breakingNewsOverlay && (
          <BreakingNewsTicker
            key={breakingNewsOverlay.id}
            x={breakingNewsOverlay.x}
            y={breakingNewsOverlay.y}
            newsText={breakingNewsOverlay.newsText}
            onComplete={handleBreakingNewsComplete}
          />
        )}

        {surveillanceOverlay && (
          <GovernmentSurveillance
            key={surveillanceOverlay.id}
            x={surveillanceOverlay.x}
            y={surveillanceOverlay.y}
            targetName={surveillanceOverlay.targetName}
            threatLevel={surveillanceOverlay.threatLevel}
            onComplete={handleSurveillanceComplete}
          />
        )}

        {typewriterOverlay && (
          <TypewriterReveal
            key={typewriterOverlay.id}
            x={typewriterOverlay.x}
            y={typewriterOverlay.y}
            documentTitle={typewriterOverlay.documentTitle}
            documentContent={typewriterOverlay.documentContent}
            classificationLevel={typewriterOverlay.classificationLevel}
            onComplete={handleTypewriterComplete}
          />
        )}

        {staticOverlay && (
          <StaticInterference
            key={staticOverlay.id}
            x={staticOverlay.x}
            y={staticOverlay.y}
            intensity={staticOverlay.intensity}
            message={staticOverlay.message}
            onComplete={handleStaticComplete}
          />
        )}

        {evidenceOverlay && (
          <EvidencePhotoGallery
            key={evidenceOverlay.id}
            x={evidenceOverlay.x}
            y={evidenceOverlay.y}
            caseTitle={evidenceOverlay.caseTitle}
            photos={evidenceOverlay.photos}
            onComplete={handleEvidenceComplete}
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