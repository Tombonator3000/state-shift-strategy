import { areParanormalEffectsEnabled } from '@/state/settings';
import { ComboThemeMap, type ComboKind } from '@/data/combos/themes';
import type { SynergyEffectIdentifier } from '@/utils/synergyEffects';
import type { ParticleEffectType } from '@/components/effects/ParticleSystem';

let glitchActive = false;

export const FXState = {
  isGlitchActive: () => glitchActive,
  __internalSetActive(active: boolean) {
    glitchActive = active;
  },
};

// Visual Effects Integration Utilities
// Centralized system for triggering coordinated visual effects

export interface EffectPosition {
  x: number;
  y: number;
}

const COMBO_MAGNITUDE_THRESHOLDS = {
  major: 4,
  mega: 8,
} as const;

const mulberry32 = (seed: number) => {
  let t = seed >>> 0;
  return () => {
    t += 0x6D2B79F5;
    let result = Math.imul(t ^ (t >>> 15), 1 | t);
    result ^= result + Math.imul(result ^ (result >>> 7), 61 | result);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
};

const resolveSeed = (turnNumber?: number, playerId?: 'human' | 'ai'): number => {
  const turnComponent = Number.isFinite(turnNumber) ? Math.max(0, Math.floor(turnNumber as number)) : 0;
  const playerComponent = playerId === 'human' ? 0x9E3779B1 : playerId === 'ai' ? 0x7F4A7C15 : 0x52DCE729;
  return (turnComponent * 0x85EBCA6B + playerComponent) >>> 0;
};

interface ComboGlitchPayload {
  combos?: string[];
  magnitude?: number;
  messages?: string[];
  comboKind?: ComboKind;
  themeId?: string;
  glitchMode?: 'off' | 'minimal' | 'full';
  position?: EffectPosition;
  ipGain?: number;
  truthGain?: number;
  totalReward?: number;
  uniqueTypes?: number;
  totalCards?: number;
  affectedStates?: string[];
  turnNumber?: number;
  playerId?: 'human' | 'ai';
  duckAudio?: boolean;
}

export async function playComboGlitchIfAny(payload: ComboGlitchPayload): Promise<void> {
  if (typeof window === 'undefined') {
    return;
  }

  const comboNames = Array.isArray(payload.combos)
    ? payload.combos.map(name => `${name}`.trim()).filter(name => name.length > 0)
    : [];
  const magnitude = typeof payload.magnitude === 'number' && !Number.isNaN(payload.magnitude)
    ? Math.abs(payload.magnitude)
    : 0;
  const hasCombos = comboNames.length > 0 && magnitude > 0;

  if (!hasCombos) {
    return;
  }

  const mode = payload.glitchMode ?? 'full';
  if (mode === 'off') {
    return;
  }

  FXState.__internalSetActive?.(true);

  const origin = payload.position ?? VisualEffectsCoordinator.getRandomCenterPosition(160);

  const durationMs = VisualEffectsCoordinator.triggerComboGlitch({
    position: origin,
    comboNames,
    magnitude,
    fxMessages: payload.messages,
    comboKind: payload.comboKind,
    themeId: payload.themeId,
    mode,
    ipGain: payload.ipGain,
    truthGain: payload.truthGain,
    totalReward: payload.totalReward ?? magnitude,
    uniqueTypes: payload.uniqueTypes,
    totalCards: payload.totalCards,
    affectedStates: payload.affectedStates,
    turnNumber: payload.turnNumber,
    playerId: payload.playerId,
    duckAudio: payload.duckAudio,
  });

  await new Promise<void>(resolve => {
    let settled = false;
    const handleComplete = () => {
      if (settled) {
        return;
      }
      settled = true;
      FXState.__internalSetActive?.(false);
      window.removeEventListener('comboGlitchComplete', handleComplete as EventListener);
      resolve();
    };

    window.addEventListener('comboGlitchComplete', handleComplete as EventListener, { once: true });

    const fallbackDuration = Number.isFinite(durationMs) && durationMs > 0 ? durationMs : 900;
    const fallback = window.setTimeout(handleComplete, fallbackDuration + 400);

    if (fallback) {
      window.addEventListener('comboGlitchComplete', () => window.clearTimeout(fallback), { once: true });
    }
  });
}

export class VisualEffectsCoordinator {
  // Trigger particle effect at specific position
  static triggerParticleEffect(
    type: ParticleEffectType,
    position: EffectPosition
  ): void {
    if (typeof window === 'undefined') {
      return;
    }
    window.dispatchEvent(new CustomEvent('cardDeployed', {
      detail: {
        type,
        x: position.x,
        y: position.y
      }
    }));
  }

  static triggerComboGlitch(detail: {
    position: EffectPosition;
    comboNames: string[];
    intensity?: 'minor' | 'major' | 'mega';
    magnitude?: number;
    fxMessages?: string[];
    comboKind?: ComboKind;
    themeId?: string;
    mode?: 'minimal' | 'full' | 'off';
    ipGain?: number;
    truthGain?: number;
    totalReward?: number;
    uniqueTypes?: number;
    totalCards?: number;
    affectedStates?: string[];
    turnNumber?: number;
    playerId?: 'human' | 'ai';
    duckAudio?: boolean;
  }): number {
    if (typeof window === 'undefined') {
      return 0;
    }

    const comboNames = Array.isArray(detail.comboNames)
      ? detail.comboNames.map(name => `${name}`.trim()).filter(name => name.length > 0)
      : [];
    const fxMessages = Array.isArray(detail.fxMessages)
      ? detail.fxMessages
        .filter((message): message is string => typeof message === 'string')
        .map(message => message.trim())
        .filter(message => message.length > 0)
      : [];
    const rawMagnitude = typeof detail.magnitude === 'number' && !Number.isNaN(detail.magnitude)
      ? Math.max(0, detail.magnitude)
      : 0;
    const totalReward = typeof detail.totalReward === 'number' && !Number.isNaN(detail.totalReward)
      ? Math.max(0, detail.totalReward)
      : rawMagnitude;
    const uniqueTypes = typeof detail.uniqueTypes === 'number' && Number.isFinite(detail.uniqueTypes)
      ? Math.max(0, Math.floor(detail.uniqueTypes))
      : 0;
    const baseIntensity = detail.intensity
      ?? ((uniqueTypes >= 3 || totalReward >= 6)
        ? 'mega'
        : totalReward >= 3
          ? 'major'
          : 'minor');
    const reducedMotion = typeof window.matchMedia === 'function'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const seed = resolveSeed(detail.turnNumber, detail.playerId);
    const rng = mulberry32(seed);
    const mode = detail.mode ?? 'full';

    let durationMs = mode === 'minimal'
      ? 600
      : baseIntensity === 'mega'
        ? Math.round(1800 + rng() * 400)
        : baseIntensity === 'major'
          ? Math.round(1300 + rng() * 300)
          : Math.round(900 + rng() * 300);

    if (reducedMotion) {
      durationMs = Math.min(durationMs, 900);
    }

    if (!reducedMotion && mode !== 'minimal') {
      const bursts = baseIntensity === 'mega'
        ? 3
        : baseIntensity === 'major'
          ? 2
          : 1;

      for (let i = 0; i < bursts; i += 1) {
        const delay = i * 90;
        if (delay === 0) {
          this.triggerParticleEffect('glitch', detail.position);
        } else {
          window.setTimeout(() => {
            this.triggerParticleEffect('glitch', detail.position);
          }, delay);
        }
      }
    }

    const totalCards = typeof detail.totalCards === 'number' && Number.isFinite(detail.totalCards)
      ? Math.max(0, Math.floor(detail.totalCards))
      : comboNames.length;
    const affectedStates = Array.isArray(detail.affectedStates)
      ? detail.affectedStates.filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
      : [];

    let resolvedThemeId = detail.themeId;
    if (!resolvedThemeId && detail.comboKind) {
      resolvedThemeId = ComboThemeMap[detail.comboKind]?.id;
    }

    window.dispatchEvent(new CustomEvent('comboGlitch', {
      detail: {
        x: detail.position.x,
        y: detail.position.y,
        comboNames,
        comboCount: comboNames.length,
        intensity: baseIntensity,
        magnitude: rawMagnitude,
        reducedMotion,
        fxMessages,
        messages: fxMessages,
        durationMs,
        comboKind: detail.comboKind,
        mode,
        themeId: resolvedThemeId,
        ipGain: detail.ipGain ?? 0,
        truthGain: detail.truthGain ?? 0,
        totalReward,
        uniqueTypes,
        totalCards,
        affectedStates,
        seed,
        duckAudio: detail.duckAudio ?? false,
      }
    }));

    return durationMs;
  }

  // Trigger full-screen government redaction sweep
  static triggerGovernmentRedaction(position: EffectPosition): void {
    window.dispatchEvent(new CustomEvent('governmentRedaction', {
      detail: {
        x: position.x,
        y: position.y
      }
    }));
  }

  // Trigger a tabloid flash burst
  static triggerTruthFlash(position: EffectPosition): void {
    window.dispatchEvent(new CustomEvent('truthFlash', {
      detail: {
        x: position.x,
        y: position.y
      }
    }));
  }

  // Trigger synergy activation effects
  static triggerSynergyActivation(
    bonusIP: number,
    position: EffectPosition,
    effectType: ('synergy' | 'bigwin' | 'chain' | SynergyEffectIdentifier) = 'synergy',
    comboName?: string
  ): void {
    window.dispatchEvent(new CustomEvent('synergyActivation', {
      detail: {
        bonusIP,
        x: position.x,
        y: position.y,
        effectType,
        numberType: effectType,
        comboName
      }
    }));
  }

  // Trigger floating number display
  static showFloatingNumber(
    value: number,
    type: 'ip' | 'truth' | 'damage' | 'synergy' | 'combo' | 'chain' | SynergyEffectIdentifier,
    position: EffectPosition
  ): void {
    window.dispatchEvent(new CustomEvent('showFloatingNumber', {
      detail: {
        value,
        type,
        x: position.x,
        y: position.y
      }
    }));
  }

  // Trigger state loss effects
  static triggerStateLoss(position: EffectPosition): void {
    window.dispatchEvent(new CustomEvent('stateLoss', {
      detail: {
        x: position.x,
        y: position.y
      }
    }));
  }

  // Trigger state event effects
  static triggerStateEvent(
    eventType: string,
    stateId: string, 
    position: EffectPosition
  ): void {
    window.dispatchEvent(new CustomEvent('stateEvent', {
      detail: {
        eventType,
        stateId,
        x: position.x,
        y: position.y
      }
    }));
  }

  // Trigger contested state effects
  static triggerContestedState(position: EffectPosition): void {
    window.dispatchEvent(new CustomEvent('contestedState', {
      detail: {
        x: position.x,
        y: position.y
      }
    }));
  }

  // Signal Government ZONE targeting overlays
  static triggerGovernmentZoneTarget(detail: {
    active: boolean;
    x?: number;
    y?: number;
    cardId?: string;
    cardName?: string;
    stateId?: string;
    mode?: 'select' | 'lock' | 'complete';
  }): void {
    window.dispatchEvent(new CustomEvent('governmentZoneTarget', { detail }));
  }

  static triggerTruthMeltdownBroadcast(detail: {
    position: EffectPosition;
    intensity: 'surge' | 'collapse';
    setList: string[];
    truthValue?: number;
    reducedMotion?: boolean;
    source?: 'truth' | 'government';
  }): void {
    if (!areParanormalEffectsEnabled()) {
      return;
    }

    window.dispatchEvent(new CustomEvent('truthMeltdownBroadcast', {
      detail: {
        ...detail,
        position: { ...detail.position }
      }
    }));
  }

  static triggerCryptidSighting(detail: {
    position: EffectPosition;
    stateId: string;
    stateName?: string;
    footageQuality: string;
    reducedMotion?: boolean;
  }): void {
    if (!areParanormalEffectsEnabled()) {
      return;
    }

    window.dispatchEvent(new CustomEvent('cryptidSighting', {
      detail: {
        ...detail,
        position: { ...detail.position }
      }
    }));
  }

  // Helper to get element center position
  static getElementCenter(element: Element): EffectPosition {
    const rect = element.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };
  }

  // Helper to get screen center position
  static getScreenCenter(): EffectPosition {
    return {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2
    };
  }

  // Helper to get random position around center
  static getRandomCenterPosition(spread: number = 100): EffectPosition {
    const center = this.getScreenCenter();
    return {
      x: center.x + (Math.random() - 0.5) * spread,
      y: center.y + (Math.random() - 0.5) * spread
    };
  }

  // === NEW ENHANCED TABLOID/X-FILES EFFECTS ===

  // Trigger breaking news ticker overlay
  static triggerBreakingNews(newsText: string, position: EffectPosition): void {
    if (!areParanormalEffectsEnabled()) {
      return;
    }

    window.dispatchEvent(new CustomEvent('breakingNews', {
      detail: {
        newsText,
        x: position.x,
        y: position.y
      }
    }));
  }

  // Trigger government surveillance overlay
  static triggerGovernmentSurveillance(
    targetName: string,
    threatLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CLASSIFIED',
    position: EffectPosition
  ): void {
    if (!areParanormalEffectsEnabled()) {
      return;
    }

    window.dispatchEvent(new CustomEvent('governmentSurveillance', {
      detail: {
        targetName,
        threatLevel,
        x: position.x,
        y: position.y
      }
    }));
  }

  // Trigger typewriter document reveal
  static triggerTypewriterReveal(
    documentTitle: string,
    documentContent: string[],
    classificationLevel: 'UNCLASSIFIED' | 'CONFIDENTIAL' | 'SECRET' | 'TOP SECRET',
    position: EffectPosition
  ): void {
    if (!areParanormalEffectsEnabled()) {
      return;
    }

    window.dispatchEvent(new CustomEvent('typewriterReveal', {
      detail: {
        documentTitle,
        documentContent,
        classificationLevel,
        x: position.x,
        y: position.y
      }
    }));
  }

  // Trigger static interference effect
  static triggerStaticInterference(
    intensity: 'light' | 'medium' | 'heavy' | 'signal-lost',
    message: string,
    position: EffectPosition
  ): void {
    if (!areParanormalEffectsEnabled()) {
      return;
    }

    window.dispatchEvent(new CustomEvent('staticInterference', {
      detail: {
        intensity,
        message,
        x: position.x,
        y: position.y
      }
    }));
  }

  // Trigger evidence photo gallery
  static triggerEvidenceGallery(
    caseTitle: string,
    photos: Array<{
      id: string;
      src: string;
      caption: string;
      timestamp: string;
      caseNumber: string;
    }> | undefined,
    position: EffectPosition
  ): void {
    if (!areParanormalEffectsEnabled()) {
      return;
    }

    window.dispatchEvent(new CustomEvent('evidenceGallery', {
      detail: {
        caseTitle,
        photos,
        x: position.x,
        y: position.y
      }
    }));
  }

  // Helper method to trigger contextual effects based on game events
  static triggerContextualEffect(
    eventType: 'media_blast' | 'government_crackdown' | 'conspiracy_revealed' | 'evidence_leaked' | 'surveillance_detected',
    cardName: string,
    position: EffectPosition
  ): void {
    if (!areParanormalEffectsEnabled()) {
      return;
    }

    switch (eventType) {
      case 'media_blast':
        this.triggerBreakingNews(
          `${cardName} EXPOSES GOVERNMENT SECRETS!`,
          position
        );
        break;
      
      case 'government_crackdown':
        this.triggerGovernmentSurveillance(
          cardName,
          'HIGH',
          position
        );
        break;
      
      case 'conspiracy_revealed':
        this.triggerTypewriterReveal(
          'CLASSIFIED INTELLIGENCE REPORT',
          [
            `SUBJECT: ${cardName}`,
            'THREAT ASSESSMENT: CONFIRMED',
            'RECOMMENDED ACTION: IMMEDIATE CONTAINMENT',
            'AUTHORIZATION: [REDACTED]'
          ],
          'TOP SECRET',
          position
        );
        break;
      
      case 'evidence_leaked':
        this.triggerEvidenceGallery(
          `LEAKED: ${cardName} FILES`,
          undefined, // Use default photos
          position
        );
        break;
      
      case 'surveillance_detected':
        this.triggerStaticInterference(
          'heavy',
          'SURVEILLANCE NETWORK COMPROMISED',
          position
        );
        break;
    }
  }
}