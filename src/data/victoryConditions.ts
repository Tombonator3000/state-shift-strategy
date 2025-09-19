// Victory Conditions System for Shadow Government
// Handles all win/loss conditions with proper evaluation timing and tie-breaking

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
    description: 'Truth ≥ 90% (Truth Seekers)',
    priority: 2,
    faction: 'truth',
    checkCondition: (gameState: any) => {
      return gameState.truth >= 90;
    },
    getProgress: (gameState: any) => {
      return Math.max(0, Math.min(100, gameState.truth));
    }
  },
  {
    id: 'truth_low',
    name: 'Information Suppression',
    description: 'Truth ≤ 10% (Government)',
    priority: 2,
    faction: 'government',
    checkCondition: (gameState: any) => {
      return gameState.truth <= 10;
    },
    getProgress: (gameState: any) => {
      // For government, progress goes up as truth goes down
      return Math.max(0, Math.min(100, 100 - gameState.truth));
    }
  },

  // Priority 3: IP Victory
  {
    id: 'ip_victory',
    name: 'Resource Dominance',
    description: 'Accumulate 300 IP',
    priority: 3,
    faction: 'both',
    checkCondition: (gameState: any) => {
      return gameState.ip >= 300;
    },
    getProgress: (gameState: any) => {
      return Math.max(0, Math.min(100, (gameState.ip / 300) * 100));
    }
  },

  // Priority 4: State Control
  {
    id: 'state_control',
    name: 'Territorial Control',
    description: 'Control 10 states',
    priority: 4,
    faction: 'both',
    checkCondition: (gameState: any) => {
      return gameState.controlledStates.length >= 10;
    },
    getProgress: (gameState: any) => {
      return Math.max(0, Math.min(100, (gameState.controlledStates.length / 10) * 100));
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