import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import ParanormalHotspotOverlay from '@/components/effects/ParanormalHotspotOverlay';
import { useAudioContext } from '@/contexts/AudioContext';
import { areParanormalEffectsEnabled } from '@/state/settings';

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

  const [hotspotOverlay, setHotspotOverlay] = useState<{
    id: number;
    x: number;
    y: number;
    label: string;
    stateName: string;
    icon: string;
    source: 'truth' | 'government' | 'neutral';
    defenseBoost: number;
    truthReward: number;
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

  const [agendaStageOverlay, setAgendaStageOverlay] = useState<{
    id: number;
    title: string;
    stageLabel: string;
    status: 'advance' | 'setback' | 'complete';
    faction: 'truth' | 'government';
  } | null>(null);

  const agendaStageTimeoutRef = useRef<number | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const clearAgendaStageOverlay = useCallback(() => {
    if (agendaStageTimeoutRef.current && typeof window !== 'undefined') {
      window.clearTimeout(agendaStageTimeoutRef.current);
    }
    agendaStageTimeoutRef.current = null;
    setAgendaStageOverlay(null);
  }, []);

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

    const handleTruthMeltdownBroadcast = (event: CustomEvent<{
      position: { x: number; y: number };
      intensity: 'surge' | 'collapse';
      setList: string[];
      truthValue?: number;
      reducedMotion?: boolean;
    }>) => {
      if (!event?.detail) return;
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

    const handleParanormalHotspot = (event: CustomEvent<{
      position?: { x: number; y: number };
      label: string;
      stateName: string;
      stateId: string;
      icon?: string;
      source: 'truth' | 'government' | 'neutral';
      defenseBoost: number;
      truthReward: number;
    }>) => {
      if (!event?.detail) return;
      const { position, label, stateName, icon, source, defenseBoost, truthReward } = event.detail;
      const fallbackPosition = {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      };
      const resolvedPosition = position ?? fallbackPosition;

      spawnParticleEffect('flash', resolvedPosition.x, resolvedPosition.y);
      setHotspotOverlay({
        id: Date.now(),
        x: resolvedPosition.x,
        y: resolvedPosition.y,
        label,
        stateName,
        icon: icon ?? '👻',
        source,
        defenseBoost,
        truthReward,
      });

      if (areParanormalEffectsEnabled()) {
        audio?.playSFX?.('ufo-elvis');
      }
    };

    // New enhanced effect handlers
    const handleBreakingNews = (event: CustomEvent<{
      newsText: string;
      x: number;
      y: number;
    }>) => {
      if (!event?.detail) return;
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

    const handleAgendaStageShift = (event: CustomEvent<{
      agendaTitle?: string;
      stageLabel?: string;
      status?: 'advance' | 'setback' | 'complete';
      faction?: 'truth' | 'government';
    }>) => {
      const detail = event?.detail;
      if (!detail || !detail.stageLabel || !detail.status || !detail.faction) {
        return;
      }

      clearAgendaStageOverlay();

      const overlayId = Date.now();
      setAgendaStageOverlay({
        id: overlayId,
        title: detail.agendaTitle ?? 'Secret Agenda',
        stageLabel: detail.stageLabel,
        status: detail.status,
        faction: detail.faction,
      });

      spawnParticleEffect('flash', window.innerWidth / 2, window.innerHeight / 2);
      audio?.playSFX?.('typewriter');

      agendaStageTimeoutRef.current = window.setTimeout(() => {
        clearAgendaStageOverlay();
      }, 2200);
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
    window.addEventListener('truthMeltdownBroadcast', handleTruthMeltdownBroadcast as EventListener);
    window.addEventListener('cryptidSighting', handleCryptidSighting as EventListener);
    window.addEventListener('paranormalHotspot', handleParanormalHotspot as EventListener);

    // New enhanced effect listeners
    window.addEventListener('breakingNews', handleBreakingNews as EventListener);
    window.addEventListener('governmentSurveillance', handleGovernmentSurveillance as EventListener);
    window.addEventListener('typewriterReveal', handleTypewriterReveal as EventListener);
    window.addEventListener('staticInterference', handleStaticInterference as EventListener);
    window.addEventListener('evidenceGallery', handleEvidenceGallery as EventListener);
    window.addEventListener('agendaStageShift', handleAgendaStageShift as EventListener);

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
      window.removeEventListener('paranormalHotspot', handleParanormalHotspot as EventListener);
      
      // New enhanced effect listeners
      window.removeEventListener('breakingNews', handleBreakingNews as EventListener);
      window.removeEventListener('governmentSurveillance', handleGovernmentSurveillance as EventListener);
      window.removeEventListener('typewriterReveal', handleTypewriterReveal as EventListener);
      window.removeEventListener('staticInterference', handleStaticInterference as EventListener);
      window.removeEventListener('evidenceGallery', handleEvidenceGallery as EventListener);
      window.removeEventListener('agendaStageShift', handleAgendaStageShift as EventListener);
    };
  }, [spawnParticleEffect, audio, clearAgendaStageOverlay]);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return;
    }

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleMotionPreferenceChange = (event: MediaQueryListEvent | MediaQueryList) => {
      setPrefersReducedMotion(event.matches);
    };

    handleMotionPreferenceChange(motionQuery);

    const handleChange = (event: MediaQueryListEvent) => handleMotionPreferenceChange(event);

    if (typeof motionQuery.addEventListener === 'function') {
      motionQuery.addEventListener('change', handleChange);
      return () => {
        motionQuery.removeEventListener('change', handleChange);
      };
    }

    // Safari fallback
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore addListener is deprecated but still required for older engines
    motionQuery.addListener(handleChange);
    return () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore removeListener is deprecated but still required for older engines
      motionQuery.removeListener(handleChange);
    };
  }, []);

  useEffect(() => {
    return () => {
      clearAgendaStageOverlay();
    };
  }, [clearAgendaStageOverlay]);

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

  const handleHotspotComplete = useCallback(() => {
    setHotspotOverlay(null);
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

  const agendaStageVisuals = useMemo(() => {
    if (!agendaStageOverlay) {
      return null;
    }

    const factionBadge = agendaStageOverlay.faction === 'truth'
      ? 'border-emerald-300/50 bg-emerald-500/20 text-emerald-100'
      : 'border-amber-300/50 bg-amber-500/20 text-amber-100';
    const factionText = agendaStageOverlay.faction === 'truth'
      ? 'Truth Network Operations'
      : 'Government Operations Division';
    const accentText = agendaStageOverlay.faction === 'truth' ? 'text-emerald-100' : 'text-amber-100';

    const visuals = {
      gradient: 'from-slate-900/90 via-slate-900/80 to-black/95',
      frame: 'border-white/20 shadow-[0_0_40px_rgba(148,163,184,0.25)]',
      statusBadge: 'border border-slate-200/40 bg-slate-800/60 text-slate-100',
      classificationBadge: 'border border-slate-200/40 bg-black/60 text-slate-100',
      statusText: 'Stage Update',
      classificationText: 'Classified',
      factionBadge,
      factionText,
      accentText,
    };

    switch (agendaStageOverlay.status) {
      case 'advance':
        visuals.gradient = 'from-emerald-500/80 via-emerald-600/35 to-slate-950/90';
        visuals.frame = 'border-emerald-200/60 shadow-[0_0_45px_rgba(16,185,129,0.35)]';
        visuals.statusBadge = 'border border-emerald-300/60 bg-emerald-500/25 text-emerald-50';
        visuals.classificationBadge = 'border border-emerald-200/40 bg-black/55 text-emerald-100';
        visuals.statusText = 'Phase Advance';
        visuals.classificationText = 'Declassifying';
        break;
      case 'setback':
        visuals.gradient = 'from-amber-500/80 via-amber-700/35 to-slate-950/90';
        visuals.frame = 'border-amber-200/60 shadow-[0_0_45px_rgba(251,191,36,0.35)]';
        visuals.statusBadge = 'border border-amber-300/60 bg-amber-500/25 text-amber-100';
        visuals.classificationBadge = 'border border-amber-200/40 bg-black/55 text-amber-100';
        visuals.statusText = 'Phase Setback';
        visuals.classificationText = 'Redacted';
        break;
      case 'complete':
        visuals.gradient = 'from-purple-500/80 via-indigo-600/35 to-slate-950/90';
        visuals.frame = 'border-purple-200/60 shadow-[0_0_50px_rgba(165,180,252,0.4)]';
        visuals.statusBadge = 'border border-purple-300/60 bg-purple-500/25 text-purple-100';
        visuals.classificationBadge = 'border border-purple-200/40 bg-black/55 text-purple-100';
        visuals.statusText = 'Final Phase';
        visuals.classificationText = 'Unredacted';
        break;
      default:
        break;
    }

    return visuals;
  }, [agendaStageOverlay]);

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

        {hotspotOverlay && (
          <ParanormalHotspotOverlay
            key={hotspotOverlay.id}
            x={hotspotOverlay.x}
            y={hotspotOverlay.y}
            icon={hotspotOverlay.icon}
            label={hotspotOverlay.label}
            stateName={hotspotOverlay.stateName}
            source={hotspotOverlay.source}
            defenseBoost={hotspotOverlay.defenseBoost}
            truthReward={hotspotOverlay.truthReward}
            onComplete={handleHotspotComplete}
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

        {agendaStageOverlay && agendaStageVisuals && (
          <div className="absolute inset-0 z-[55] flex items-center justify-center">
            <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1.5px]" aria-hidden="true" />
            <div className="pointer-events-none relative w-full max-w-3xl px-6">
              <div
                key={agendaStageOverlay.id}
                className={`agenda-stage-overlay relative w-full overflow-hidden rounded-3xl border-2 px-10 py-9 text-center shadow-2xl ${agendaStageVisuals.frame} ${prefersReducedMotion ? 'agenda-stage-overlay--static' : ''}`}
              >
                <div
                  className={`absolute inset-0 -z-10 bg-gradient-to-br ${agendaStageVisuals.gradient}`}
                  aria-hidden="true"
                />
                {!prefersReducedMotion && <div className="agenda-stage-overlay__glint" aria-hidden="true" />}

                <div className="flex flex-col items-center gap-3 text-white">
                  <span
                    className={`inline-flex items-center justify-center rounded-full border px-5 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.45em] ${agendaStageVisuals.factionBadge}`}
                  >
                    {agendaStageVisuals.factionText.toUpperCase()}
                  </span>

                  <div className="text-xs uppercase tracking-[0.7em] text-white/70">
                    Agenda Stage Shift
                  </div>

                  <h3 className={`text-3xl font-semibold uppercase tracking-[0.25em] drop-shadow-lg ${agendaStageVisuals.accentText}`}>
                    {agendaStageOverlay.title}
                  </h3>

                  <p className="text-lg font-medium uppercase tracking-[0.2em] text-white/85">
                    {agendaStageOverlay.stageLabel}
                  </p>

                  <div className="mt-5 flex flex-wrap items-center justify-center gap-3 text-[0.62rem] font-semibold uppercase tracking-[0.45em]">
                    <span className={`rounded-full px-4 py-1 backdrop-blur-sm ${agendaStageVisuals.statusBadge}`}>
                      {agendaStageVisuals.statusText}
                    </span>
                    <span className={`rounded-full px-4 py-1 backdrop-blur-sm ${agendaStageVisuals.classificationBadge}`}>
                      {agendaStageVisuals.classificationText}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
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