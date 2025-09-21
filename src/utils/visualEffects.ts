import { areParanormalEffectsEnabled } from '@/state/settings';
import type { SynergyEffectIdentifier } from '@/utils/synergyEffects';
import type { ParticleEffectType } from '@/components/effects/ParticleSystem';

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

export class VisualEffectsCoordinator {
  // Trigger particle effect at specific position
  static triggerParticleEffect(
    type: ParticleEffectType,
    position: EffectPosition
  ): void {
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
  }): void {
    if (typeof window === 'undefined') {
      return;
    }

    const comboNames = detail.comboNames ?? [];
    const magnitude = typeof detail.magnitude === 'number' && !Number.isNaN(detail.magnitude)
      ? Math.max(0, detail.magnitude)
      : undefined;
    const resolvedIntensity = detail.intensity
      ?? (typeof magnitude === 'number'
        ? magnitude >= COMBO_MAGNITUDE_THRESHOLDS.mega
          ? 'mega'
          : magnitude >= COMBO_MAGNITUDE_THRESHOLDS.major
            ? 'major'
            : 'minor'
        : comboNames.length >= 3
          ? 'mega'
          : comboNames.length === 2
            ? 'major'
            : 'minor');

    const reducedMotion = typeof window.matchMedia === 'function'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!reducedMotion) {
      const bursts = resolvedIntensity === 'mega'
        ? 3
        : resolvedIntensity === 'major'
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

    window.dispatchEvent(new CustomEvent('comboGlitch', {
      detail: {
        x: detail.position.x,
        y: detail.position.y,
        comboNames,
        comboCount: comboNames.length,
        intensity: resolvedIntensity,
        magnitude: magnitude ?? 0,
        reducedMotion,
      }
    }));
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