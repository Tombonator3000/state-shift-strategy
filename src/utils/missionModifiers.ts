import type { CampaignMission } from '@/data/campaign';
import type { GameState } from '@/hooks/gameStateTypes';

/**
 * Apply mission starting conditions to game state
 */
export function applyMissionStartingConditions(
  gameState: GameState,
  mission: CampaignMission
): GameState {
  const conditions = mission.startingConditions;
  if (!conditions) return gameState;

  const updated = { ...gameState };

  if (conditions.playerIP !== undefined) {
    updated.ip = conditions.playerIP;
  }
  if (conditions.aiIP !== undefined) {
    updated.aiIP = conditions.aiIP;
  }
  if (conditions.startingTruth !== undefined) {
    updated.truth = conditions.startingTruth;
    updated.startingTruth = conditions.startingTruth;
  }

  // Apply starting controlled states
  if (conditions.playerStates) {
    updated.controlledStates = [...conditions.playerStates];
    conditions.playerStates.forEach(stateId => {
      const state = updated.states.find(s => s.id === stateId);
      if (state) {
        state.owner = 'player';
      }
    });
  }

  if (conditions.aiStates) {
    updated.aiControlledStates = [...conditions.aiStates];
    conditions.aiStates.forEach(stateId => {
      const state = updated.states.find(s => s.id === stateId);
      if (state) {
        state.owner = 'ai';
      }
    });
  }

  return updated;
}

/**
 * Apply mission modifiers to game state (fortified states, etc.)
 */
export function applyMissionModifiers(
  gameState: GameState,
  mission: CampaignMission
): GameState {
  if (!mission.modifiers || mission.modifiers.length === 0) {
    return gameState;
  }

  const updated = { ...gameState };

  for (const modifier of mission.modifiers) {
    switch (modifier.effect) {
      case 'globalDefenseBonus':
        // Add +2 defense to all states (Fortified States)
        updated.states = updated.states.map(state => ({
          ...state,
          defense: state.defense + 2,
          baseDefense: state.baseDefense + 2,
        }));
        break;

      case 'mediaBonusTruth':
        // This will be checked during card play
        // Store the modifier in matchContext for card resolution
        updated.matchContext = {
          ...updated.matchContext,
          mediaBonusTruth: true,
        };
        break;

      case 'truthCap':
        // Store truth cap in matchContext
        updated.matchContext = {
          ...updated.matchContext,
          truthCap: 70,
        };
        break;

      case 'startingIpDelta':
        // Already handled in starting conditions
        break;
    }
  }

  return updated;
}

/**
 * Check if victory conditions are met for campaign mission
 */
export function checkMissionVictory(
  gameState: GameState,
  mission: CampaignMission
): { victory: boolean; type: 'states' | 'truth' | 'ip' | 'agenda' | null } {
  const conditions = mission.victoryConditions;
  
  // Use standard victory conditions if none specified
  if (!conditions) {
    return { victory: false, type: null };
  }

  // Check states victory
  if (conditions.statesRequired !== undefined) {
    if (gameState.faction === 'truth') {
      if (gameState.controlledStates.length >= conditions.statesRequired) {
        return { victory: true, type: 'states' };
      }
    } else {
      if (gameState.aiControlledStates.length >= conditions.statesRequired) {
        return { victory: true, type: 'states' };
      }
    }
  }

  // Check truth high/low victory
  if (conditions.truthHigh !== undefined && gameState.truth >= conditions.truthHigh) {
    return { victory: true, type: 'truth' };
  }
  if (conditions.truthLow !== undefined && gameState.truth <= conditions.truthLow) {
    return { victory: true, type: 'truth' };
  }

  return { victory: false, type: null };
}

/**
 * Check if player has lost the mission
 */
export function checkMissionDefeat(
  gameState: GameState,
  mission: CampaignMission
): boolean {
  const conditions = mission.victoryConditions;
  if (!conditions) return false;

  // Check max turns defeat
  if (conditions.maxTurns && gameState.turn >= conditions.maxTurns) {
    return true;
  }

  // Check if AI achieved victory condition
  if (conditions.statesRequired !== undefined) {
    const aiStates = gameState.faction === 'truth' 
      ? gameState.aiControlledStates 
      : gameState.controlledStates;
    
    if (aiStates.length >= conditions.statesRequired) {
      return true;
    }
  }

  // Check truth conditions (opponent wins if they push truth to their goal)
  if (gameState.faction === 'truth') {
    if (conditions.truthLow !== undefined && gameState.truth <= conditions.truthLow) {
      return true;
    }
  } else {
    if (conditions.truthHigh !== undefined && gameState.truth >= conditions.truthHigh) {
      return true;
    }
  }

  return false;
}

/**
 * Apply truth cap modifier during game logic
 */
export function applyTruthCap(truth: number, gameState: GameState): number {
  const truthCap = gameState.matchContext?.truthCap as number | undefined;
  if (truthCap !== undefined && truth > truthCap) {
    return truthCap;
  }
  return truth;
}
