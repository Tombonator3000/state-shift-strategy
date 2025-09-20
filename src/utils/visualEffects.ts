// Visual Effects Integration Utilities
// Centralized system for triggering coordinated visual effects

export interface EffectPosition {
  x: number;
  y: number;
}

export class VisualEffectsCoordinator {
  // Trigger particle effect at specific position
  static triggerParticleEffect(
    type: 'deploy' | 'capture' | 'counter' | 'victory' | 'synergy' | 'bigwin' | 'stateloss' | 'chain' | 'stateevent' | 'contested' | 'flash' | 'broadcast' | 'cryptid',
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
    effectType: 'synergy' | 'bigwin' | 'chain' = 'synergy',
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
}