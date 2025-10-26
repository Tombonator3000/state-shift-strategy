// Victory Conditions System for Shadow Government
// Handles all win/loss conditions with proper evaluation timing and tie-breaking

import { TRUTH_HIGH_THRESHOLD, TRUTH_LOW_THRESHOLD } from '@/constants/truthThresholds';

// GameCard interface for type safety
export interface GameCard {
  id: string;
  name: string;
  type: 'MEDIA' | 'ZONE' | 'ATTACK' | 'DEFENSIVE' | 'DEVELOPMENT' | 'LEGENDARY';
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  text: string;
  flavor?: string;
  cost: number;
  target?: {
    scope: string;
    restrict?: string[];
    requireTag?: string;
    type?: string;
    faction?: string;
    onlyIf?: any;
  };
  effects?: any;
  faction?: string;
}

export interface VictoryCondition {
  id: string;
  name: string;
  description: string;
  priority: number; // Lower number = higher priority for tie-breaking
  faction?: 'truth' | 'government' | 'both';
  checkCondition: (gameState: any) => boolean;
  getProgress: (gameState: any) => number; // 0-100%
}

export interface OvertimeConfig {
  maxTurns?: number;
  truthPivot?: number;
  truthTolerance?: number;
  territoryMargin?: number;
  defaultWinner?: 'truth' | 'government';
}

export interface OvertimeOutcome {
  winner: 'truth' | 'government';
  method: 'truth_momentum' | 'territory' | 'ip' | 'default';
}

const OVERTIME_CONDITION_ID = 'overtime_protocol';

const asNumber = (value: unknown): number | null => {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
};

const computeFactionControlledStates = (gameState: any, faction: 'truth' | 'government'): number => {
  const explicitArrays = gameState?.[`${faction}ControlledStates`];
  if (Array.isArray(explicitArrays)) {
    return explicitArrays.length;
  }

  const explicitCount = asNumber(gameState?.[`${faction}ControlledCount`]);
  if (explicitCount !== null) {
    return explicitCount;
  }

  const byFaction = gameState?.controlledStatesByFaction;
  if (byFaction && typeof byFaction === 'object') {
    const possibleArray = byFaction[faction];
    if (Array.isArray(possibleArray)) {
      return possibleArray.length;
    }
    const possibleNumber = asNumber(possibleArray);
    if (possibleNumber !== null) {
      return possibleNumber;
    }
  }

  const playerFaction: 'truth' | 'government' = gameState?.faction === 'government' ? 'government' : 'truth';
  const aiFaction: 'truth' | 'government' = playerFaction === 'truth' ? 'government' : 'truth';
  const playerControlled = Array.isArray(gameState?.controlledStates) ? gameState.controlledStates.length : 0;
  const aiControlled = Array.isArray(gameState?.aiControlledStates) ? gameState.aiControlledStates.length : 0;

  if (faction === playerFaction) {
    return playerControlled;
  }
  if (faction === aiFaction) {
    return aiControlled;
  }

  return 0;
};

const computeFactionIp = (gameState: any, faction: 'truth' | 'government'): number => {
  const direct = asNumber(gameState?.[`${faction}Ip`]);
  if (direct !== null) {
    return direct;
  }

  const directAlt = asNumber(gameState?.[`${faction}IP`]);
  if (directAlt !== null) {
    return directAlt;
  }

  const byFaction = gameState?.ipByFaction ?? gameState?.ipBySide;
  if (byFaction && typeof byFaction === 'object') {
    const possible = byFaction[faction];
    const possibleNumber = asNumber(possible);
    if (possibleNumber !== null) {
      return possibleNumber;
    }
  }

  const playerFaction: 'truth' | 'government' = gameState?.faction === 'government' ? 'government' : 'truth';
  const aiFaction: 'truth' | 'government' = playerFaction === 'truth' ? 'government' : 'truth';
  const playerIp = asNumber(gameState?.ip) ?? 0;
  const aiIp = asNumber(gameState?.aiIP) ?? 0;

  if (faction === playerFaction) {
    return playerIp;
  }
  if (faction === aiFaction) {
    return aiIp;
  }

  return 0;
};

const getOvertimeConfig = (gameState: any): OvertimeConfig => {
  const config = gameState?.overtimeConfig;
  if (config && typeof config === 'object') {
    return config as OvertimeConfig;
  }
  return {};
};

const computeTruthMomentum = (gameState: any, pivot: number): number => {
  const configured = asNumber(gameState?.truthMomentum);
  if (configured !== null) {
    return configured;
  }

  const history = Array.isArray(gameState?.truthHistory) ? gameState.truthHistory : null;
  if (history && history.length >= 2) {
    const first = history[0];
    const last = history[history.length - 1];
    if (asNumber(first) !== null && asNumber(last) !== null) {
      return (last as number) - (first as number);
    }
  }

  const startingTruth = asNumber(gameState?.startingTruth);
  if (startingTruth !== null) {
    const current = asNumber(gameState?.truth) ?? pivot;
    return current - startingTruth;
  }

  const current = asNumber(gameState?.truth) ?? pivot;
  return current - pivot;
};

export function evaluateOvertimeOutcome(gameState: any): OvertimeOutcome | null {
  const config = getOvertimeConfig(gameState);
  const rawTurn = asNumber(gameState?.turn);
  const rawMaxTurns = asNumber(gameState?.maxTurns) ?? asNumber(config.maxTurns);

  if (rawTurn === null || rawMaxTurns === null || rawMaxTurns <= 0 || rawTurn < rawMaxTurns) {
    return null;
  }

  const pivot = asNumber(config.truthPivot) ?? asNumber(gameState?.startingTruth) ?? 50;
  const tolerance = asNumber(config.truthTolerance) ?? 0;
  const margin = asNumber(config.territoryMargin) ?? 0;
  const momentum = computeTruthMomentum(gameState, pivot);

  if (momentum > tolerance) {
    return { winner: 'truth', method: 'truth_momentum' };
  }
  if (momentum < -tolerance) {
    return { winner: 'government', method: 'truth_momentum' };
  }

  const truthStates = computeFactionControlledStates(gameState, 'truth');
  const governmentStates = computeFactionControlledStates(gameState, 'government');
  const territoryDelta = truthStates - governmentStates;

  if (territoryDelta > margin) {
    return { winner: 'truth', method: 'territory' };
  }
  if (territoryDelta < -margin) {
    return { winner: 'government', method: 'territory' };
  }

  const truthIp = computeFactionIp(gameState, 'truth');
  const governmentIp = computeFactionIp(gameState, 'government');
  if (truthIp !== governmentIp) {
    return { winner: truthIp > governmentIp ? 'truth' : 'government', method: 'ip' };
  }

  const defaultWinner = config.defaultWinner === 'government' ? 'government' : 'truth';
  return { winner: defaultWinner, method: 'default' };
}

export interface VictoryResult {
  hasWinner: boolean;
  winner?: 'truth' | 'government';
  victoryType?: string;
  victoryCondition?: VictoryCondition;
  message: string;
  progress: Record<string, number>;
}

export interface VictoryModifier {
  conditionId: string;
  newThreshold?: number;
  newDescription?: string;
  source: string; // Extension name or source
}

// Base victory conditions with priority order for tie-breaking
export const BASE_VICTORY_CONDITIONS: VictoryCondition[] = [
  {
    id: OVERTIME_CONDITION_ID,
    name: 'Continuity Overtime Protocol',
    description: 'If the turn ceiling hits, the faction with fresher Truth momentum or broader territorial control hijacks the broadcast.',
    priority: 0,
    faction: 'both',
    checkCondition: (gameState: any) => evaluateOvertimeOutcome(gameState) !== null,
    getProgress: (gameState: any) => {
      const config = getOvertimeConfig(gameState);
      const maxTurns = asNumber(gameState?.maxTurns) ?? asNumber(config.maxTurns);
      const turn = asNumber(gameState?.turn) ?? 0;
      if (!maxTurns || maxTurns <= 0) {
        return 0;
      }
      return Math.max(0, Math.min(100, (turn / maxTurns) * 100));
    },
  },
  // Priority 1: Secret Agenda (highest priority)
  {
    id: 'secret_agenda',
    name: 'Secret Agenda',
    description: 'Complete your faction\'s secret agenda',
    priority: 1,
    faction: 'both',
    checkCondition: (gameState: any) => {
      return gameState.secretAgenda?.completed || false;
    },
    getProgress: (gameState: any) => {
      if (!gameState.secretAgenda) return 0;
      return gameState.secretAgenda.progress || 0;
    }
  },

  // Priority 2: Truth Thresholds
  {
    id: 'truth_high',
    name: 'Truth Awakening',
    description: `Truth ≥ ${TRUTH_HIGH_THRESHOLD}% (Truth Seekers)`,
    priority: 1,
    faction: 'truth',
    checkCondition: (gameState: any) => {
      return gameState.truth >= TRUTH_HIGH_THRESHOLD;
    },
    getProgress: (gameState: any) => {
      return Math.max(0, Math.min(100, gameState.truth));
    }
  },
  {
    id: 'truth_low',
    name: 'Information Suppression',
    description: `Truth ≤ ${TRUTH_LOW_THRESHOLD}% (Government)`,
    priority: 1,
    faction: 'government',
    checkCondition: (gameState: any) => {
      return gameState.truth <= TRUTH_LOW_THRESHOLD;
    },
    getProgress: (gameState: any) => {
      // For government, progress goes up as truth goes down
      return Math.max(0, Math.min(100, 100 - gameState.truth));
    }
  },

  // Priority 2: State Control
  {
    id: 'state_control',
    name: 'Territorial Control',
    description: 'Control 10 states',
    priority: 2,
    faction: 'both',
    checkCondition: (gameState: any) => {
      return gameState.controlledStates.length >= 10;
    },
    getProgress: (gameState: any) => {
      return Math.max(0, Math.min(100, (gameState.controlledStates.length / 10) * 100));
    }
  },

  // Priority 10: IP Victory (Demoted - Tie-breaker only)
  {
    id: 'ip_victory',
    name: 'Resource Dominance',
    description: 'Accumulate 200 IP (Rarely Achieved)',
    priority: 10,
    faction: 'both',
    checkCondition: (gameState: any) => {
      return gameState.ip >= 200;
    },
    getProgress: (gameState: any) => {
      return Math.max(0, Math.min(100, (gameState.ip / 200) * 100));
    }
  }
];

export class VictoryManager {
  private conditions: VictoryCondition[] = [];
  private modifiers: VictoryModifier[] = [];

  constructor(baseConditions: VictoryCondition[] = BASE_VICTORY_CONDITIONS) {
    this.conditions = [...baseConditions];
  }

  // Add expansion modifiers that can change victory conditions
  addModifier(modifier: VictoryModifier) {
    this.modifiers.push(modifier);
    this.applyModifiers();
  }

  // Remove modifiers (when disabling extensions)
  removeModifier(source: string) {
    this.modifiers = this.modifiers.filter(m => m.source !== source);
    this.applyModifiers();
  }

  // Apply all active modifiers to victory conditions
  private applyModifiers() {
    // Reset to base conditions
    this.conditions = [...BASE_VICTORY_CONDITIONS];

    // Apply each modifier
    this.modifiers.forEach(modifier => {
      const condition = this.conditions.find(c => c.id === modifier.conditionId);
      if (condition) {
        if (modifier.newThreshold !== undefined) {
          // Update the check condition with new threshold
          if (modifier.conditionId === 'truth_high') {
            condition.checkCondition = (gameState: any) => gameState.truth >= modifier.newThreshold!;
            condition.description = `Truth ≥ ${modifier.newThreshold}% (Truth Seekers)`;
          } else if (modifier.conditionId === 'truth_low') {
            condition.checkCondition = (gameState: any) => gameState.truth <= modifier.newThreshold!;
            condition.description = `Truth ≤ ${modifier.newThreshold}% (Government)`;
            condition.getProgress = (gameState: any) => Math.max(0, Math.min(100, 100 - gameState.truth));
          } else if (modifier.conditionId === 'ip_victory') {
            condition.checkCondition = (gameState: any) => gameState.ip >= modifier.newThreshold!;
            condition.description = `Accumulate ${modifier.newThreshold} IP`;
            condition.getProgress = (gameState: any) => Math.max(0, Math.min(100, (gameState.ip / modifier.newThreshold!) * 100));
          } else if (modifier.conditionId === 'state_control') {
            condition.checkCondition = (gameState: any) => gameState.controlledStates.length >= modifier.newThreshold!;
            condition.description = `Control ${modifier.newThreshold} states`;
            condition.getProgress = (gameState: any) => Math.max(0, Math.min(100, (gameState.controlledStates.length / modifier.newThreshold!) * 100));
          }
        }

        if (modifier.newDescription) {
          condition.description = modifier.newDescription;
        }
      }
    });
  }

  // Check for victory conditions (called at proper evaluation points)
  checkVictoryConditions(gameState: any): VictoryResult {
    const overtimeCondition = this.conditions.find(c => c.id === OVERTIME_CONDITION_ID);
    const overtimeOutcome = overtimeCondition ? evaluateOvertimeOutcome(gameState) : null;

    if (overtimeCondition && overtimeOutcome) {
      const reasonLabel = (() => {
        switch (overtimeOutcome.method) {
          case 'truth_momentum':
            return 'a Truth momentum surge';
          case 'territory':
            return 'superior territorial coverage';
          case 'ip':
            return 'resource supremacy';
          default:
            return 'continuity mandate fallback';
        }
      })();

      const factionLabel = overtimeOutcome.winner === 'truth' ? 'Truth Seekers' : 'Shadow Government';
      return {
        hasWinner: true,
        winner: overtimeOutcome.winner,
        victoryType: overtimeCondition.id,
        victoryCondition: overtimeCondition,
        message: `Continuity Overtime Protocol invoked — ${factionLabel} seize the feed via ${reasonLabel}.`,
        progress: this.getProgressSummary(gameState),
      };
    }

    // Get all conditions that are currently met
    const metConditions: Array<{ condition: VictoryCondition; winner: 'truth' | 'government' }> = [];

    this.conditions.forEach(condition => {
      if (condition.checkCondition(gameState)) {
        // Determine winner based on condition and current faction
        let winner: 'truth' | 'government';

        switch (condition.id) {
          case 'truth_high':
            winner = 'truth';
            break;
          case 'truth_low':
            winner = 'government';
            break;
          case 'secret_agenda':
          case 'ip_victory':
          case 'state_control':
            // These conditions favor the current player
            winner = gameState.faction === 'truth' ? 'truth' : 'government';
            break;
          default:
            winner = gameState.faction === 'truth' ? 'truth' : 'government';
        }

        metConditions.push({ condition, winner });
      }
    });

    // Check AI victory conditions separately
    const aiControlledStates = gameState.states?.filter((s: any) => s.owner === 'ai').length || 0;
    if (aiControlledStates >= 10) {
      const aiWinner = gameState.faction === 'government' ? 'truth' : 'government';
      metConditions.push({
        condition: this.conditions.find(c => c.id === 'state_control')!,
        winner: aiWinner
      });
    }

    // If no conditions are met, no victory
    if (metConditions.length === 0) {
      return {
        hasWinner: false,
        message: 'Game continues...',
        progress: this.getProgressSummary(gameState)
      };
    }

    // If multiple conditions are met, use tie-breaking priority
    metConditions.sort((a, b) => a.condition.priority - b.condition.priority);
    const winningCondition = metConditions[0];

    // Log the victory for debugging
    console.log('Victory Detected:', {
      condition: winningCondition.condition.id,
      winner: winningCondition.winner,
      priority: winningCondition.condition.priority,
      metConditions: metConditions.map(c => c.condition.id)
    });

    // Additional tie-breaker if same priority
    if (metConditions.length > 1 && metConditions[0].condition.priority === metConditions[1].condition.priority) {
      // Use deterministic tie-breaker based on game state
      const tiebreaker = this.resolveTie(gameState, metConditions);
      if (tiebreaker) {
        return {
          hasWinner: true,
          winner: tiebreaker.winner,
          victoryType: tiebreaker.condition.id,
          victoryCondition: tiebreaker.condition,
          message: `Victory via ${tiebreaker.condition.name} (tiebreaker: ${this.getTiebreakerReason(gameState)})`,
          progress: this.getProgressSummary(gameState)
        };
      }
    }

    return {
      hasWinner: true,
      winner: winningCondition.winner,
      victoryType: winningCondition.condition.id,
      victoryCondition: winningCondition.condition,
      message: `Victory via ${winningCondition.condition.name}!`,
      progress: this.getProgressSummary(gameState)
    };
  }

  // Resolve tie when multiple conditions of same priority are met
  private resolveTie(gameState: any, conditions: Array<{ condition: VictoryCondition; winner: 'truth' | 'government' }>): { condition: VictoryCondition; winner: 'truth' | 'government' } | null {
    // Tie-breaker order: Highest IP → Most states → Deterministic coin flip
    
    const playerIP = gameState.ip || 0;
    const aiIP = gameState.aiIP || 0;
    
    if (playerIP !== aiIP) {
      const winner = playerIP > aiIP ? gameState.faction : (gameState.faction === 'truth' ? 'government' : 'truth');
      return { condition: conditions[0].condition, winner };
    }

    const playerStates = gameState.controlledStates?.length || 0;
    const aiStates = gameState.states?.filter((s: any) => s.owner === 'ai').length || 0;
    
    if (playerStates !== aiStates) {
      const winner = playerStates > aiStates ? gameState.faction : (gameState.faction === 'truth' ? 'government' : 'truth');
      return { condition: conditions[0].condition, winner };
    }

    // Deterministic coin flip based on turn number
    const coinFlip = (gameState.turn || 1) % 2 === 0;
    const winner = coinFlip ? 'truth' : 'government';
    
    return { condition: conditions[0].condition, winner };
  }

  // Get reason for tiebreaker (for logging)
  private getTiebreakerReason(gameState: any): string {
    const playerIP = gameState.ip || 0;
    const aiIP = gameState.aiIP || 0;
    
    if (playerIP !== aiIP) {
      return `Higher IP (${Math.max(playerIP, aiIP)})`;
    }

    const playerStates = gameState.controlledStates?.length || 0;
    const aiStates = gameState.states?.filter((s: any) => s.owner === 'ai').length || 0;
    
    if (playerStates !== aiStates) {
      return `More states (${Math.max(playerStates, aiStates)})`;
    }

    return 'Deterministic coin flip';
  }

  // Get progress summary for UI display
  private getProgressSummary(gameState: any): Record<string, number> {
    const progress: Record<string, number> = {};
    
    this.conditions.forEach(condition => {
      progress[condition.id] = condition.getProgress(gameState);
    });

    return progress;
  }

  // Get all current victory conditions (including modified ones)
  getVictoryConditions(): VictoryCondition[] {
    return [...this.conditions];
  }

  // Get victory conditions for a specific faction
  getVictoryConditionsForFaction(faction: 'truth' | 'government'): VictoryCondition[] {
    return this.conditions.filter(c => c.faction === faction || c.faction === 'both');
  }

  // Check if game should end (for UI protection)
  shouldEndGame(gameState: any): boolean {
    return this.checkVictoryConditions(gameState).hasWinner;
  }
}

// Factory function for creating victory manager with extensions
export function createVictoryManager(activeExtensions: string[] = []): VictoryManager {
  const manager = new VictoryManager();

  // Apply extension modifiers
  activeExtensions.forEach(extensionId => {
    const modifiers = getExtensionVictoryModifiers(extensionId);
    modifiers.forEach(modifier => manager.addModifier(modifier));
  });

  return manager;
}

// Get victory modifiers from extensions
function getExtensionVictoryModifiers(extensionId: string): VictoryModifier[] {
  const modifiers: VictoryModifier[] = [];

  switch (extensionId) {
    case 'halloween_spooktacular':
      // Halloween extension might make Truth thresholds easier
      modifiers.push({
        conditionId: 'truth_high',
        newThreshold: 85, // Easier for Truth Seekers
        source: 'halloween_spooktacular'
      });
      modifiers.push({
        conditionId: 'truth_low',
        newThreshold: 15, // Harder for Government
        source: 'halloween_spooktacular'
      });
      break;
      
    case 'cryptids':
      // Cryptids extension might change state control requirements
      modifiers.push({
        conditionId: 'state_control',
        newThreshold: 12, // Need more states
        source: 'cryptids'
      });
      break;
      
    // Add more extension modifiers as needed
  }

  return modifiers;
}

export default VictoryManager;