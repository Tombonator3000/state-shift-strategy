// Visual Effects Integration Utilities
// Centralized system for triggering coordinated visual effects

export interface EffectPosition {
  x: number;
  y: number;
}

export class VisualEffectsCoordinator {
  // Trigger particle effect at specific position
  static triggerParticleEffect(
    type:
      | 'deploy'
      | 'capture'
      | 'counter'
      | 'victory'
      | 'synergy'
      | 'bigwin'
      | 'stateloss'
      | 'chain'
      | 'stateevent'
      | 'flash'
      | 'broadcast'
      | 'cryptid'
      | 'ectoplasm'
      | 'surveillanceRedaction'
      | 'corkboardPins'
      | 'hotspotFlare',
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
    effectType: 'synergy' | 'bigwin' | 'chain' | 'corkboardPins' = 'synergy',
    comboName?: string,
    numberType: 'synergy' | 'combo' | 'chain' =
      effectType === 'chain' ? 'chain' : effectType === 'bigwin' ? 'combo' : 'synergy'
  ): void {
    window.dispatchEvent(new CustomEvent('synergyActivation', {
      detail: {
        bonusIP,
        x: position.x,
        y: position.y,
        effectType,
        numberType,
        comboName
      }
    }));
  }

  // Trigger floating number display
  static showFloatingNumber(
    value: number,
    type: 'ip' | 'truth' | 'damage' | 'synergy' | 'combo' | 'chain',
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
    window.dispatchEvent(new CustomEvent('cryptidSighting', {
      detail: {
        ...detail,
        position: { ...detail.position }
      }
    }));
  }

  static triggerParanormalHotspot(detail: {
    position: EffectPosition;
    stateId: string;
    stateName: string;
    label: string;
    icon?: string;
    source: 'truth' | 'government' | 'neutral';
    defenseBoost: number;
    truthReward: number;
  }): void {
    window.dispatchEvent(new CustomEvent('paranormalHotspot', {
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

  private static resolveStateElementByValue(value: unknown): Element | null {
    if (typeof document === 'undefined' || typeof value !== 'string') {
      return null;
    }

    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }

    const candidates = new Set<string>([trimmed]);
    const upper = trimmed.toUpperCase();
    if (upper !== trimmed) {
      candidates.add(upper);
    }

    const selectors = ['data-state-id', 'data-state', 'data-state-abbr'];

    for (const candidate of candidates) {
      for (const attribute of selectors) {
        const element = document.querySelector<HTMLElement>(`[${attribute}="${candidate}"]`);
        if (element) {
          return element;
        }
      }
    }

    return null;
  }

  static resolveStateElement(params: {
    stateId?: string | null;
    stateAbbreviation?: string | null;
  }): Element | null {
    const { stateId, stateAbbreviation } = params;

    const elementFromId = this.resolveStateElementByValue(stateId ?? undefined);
    if (elementFromId) {
      return elementFromId;
    }

    return this.resolveStateElementByValue(stateAbbreviation ?? undefined);
  }

  static getStateCenterPosition(params: {
    stateId?: string | null;
    stateAbbreviation?: string | null;
  }): EffectPosition | null {
    const element = this.resolveStateElement(params);
    return element ? this.getElementCenter(element) : null;
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