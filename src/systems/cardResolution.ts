import { CardEffectProcessor } from './CardEffectProcessor';
import type { Card } from '@/types/cardEffects';
import type { GameCard } from '@/types/cardTypes';
import { setStateOccupation } from '@/data/usaStates';
import type { PlayerStats } from '@/data/achievementSystem';

type Faction = 'government' | 'truth';

type StateOwner = 'player' | 'ai' | 'neutral';

export interface AchievementTracker {
  stats: Pick<
    PlayerStats,
    |
      'total_states_controlled'
      | 'max_states_controlled_single_game'
      | 'max_ip_reached'
      | 'max_truth_reached'
      | 'min_truth_reached'
  >;
  updateStats: (updates: Partial<PlayerStats>) => void;
}

export interface StateForResolution {
  id: string;
  name: string;
  abbreviation: string;
  baseIP: number;
  defense: number;
  pressure: number;
  owner: StateOwner;
  specialBonus?: string;
  bonusValue?: number;
  occupierCardId?: string | null;
  occupierCardName?: string | null;
  occupierLabel?: string | null;
  occupierIcon?: string | null;
  occupierUpdatedAt?: number;
}

export interface GameSnapshot {
  truth: number;
  ip: number;
  aiIP: number;
  hand: GameCard[];
  aiHand: GameCard[];
  controlledStates: string[];
  aiControlledStates?: string[];
  round: number;
  turn: number;
  faction: Faction;
  states: StateForResolution[];
}

export interface CardPlayResolution {
  ip: number;
  aiIP: number;
  truth: number;
  states: StateForResolution[];
  controlledStates: string[];
  targetState: string | null;
  selectedCard: string | null;
  logEntries: string[];
  damageDealt: number;
}

const defaultAchievementTracker: AchievementTracker = {
  stats: {
    total_states_controlled: 0,
    max_states_controlled_single_game: 0,
    max_ip_reached: 0,
    max_truth_reached: 0,
    min_truth_reached: 100,
  },
  updateStats: () => {
    /* no-op */
  },
};

export function resolveCardEffects(
  gameState: GameSnapshot,
  card: GameCard,
  targetState: string | null,
  achievements: AchievementTracker = defaultAchievementTracker,
): CardPlayResolution {
  const logEntries: string[] = [];
  const newStates = gameState.states.map(state => ({ ...state }));
  let controlledStates = [...gameState.controlledStates];

  const processor = new CardEffectProcessor({
    truth: gameState.truth,
    ip: gameState.ip,
    aiIP: gameState.aiIP,
    hand: gameState.hand,
    aiHand: gameState.aiHand,
    controlledStates: gameState.controlledStates,
    aiControlledStates: gameState.aiControlledStates || [],
    round: gameState.round,
    turn: gameState.turn,
    faction: gameState.faction,
  });

  const effectResult = processor.processCard(card as Card, targetState ?? undefined);

  const ipAfterCost = Math.max(0, gameState.ip - card.cost);
  const truthAfterEffects = Math.max(0, Math.min(100, gameState.truth + effectResult.truthDelta));
  const playerIPAfterEffects = Math.max(0, ipAfterCost + effectResult.ipDelta.self);
  const damageDealt = effectResult.damage ?? 0;
  const aiIPAfterEffects = Math.max(
    0,
    gameState.aiIP + effectResult.ipDelta.opponent - damageDealt,
  );

  if (effectResult.cardsToDraw > 0) {
    logEntries.push(
      `Draw ${effectResult.cardsToDraw} card${effectResult.cardsToDraw !== 1 ? 's' : ''}`,
    );
  }

  logEntries.push(
    ...effectResult.logMessages.map(msg => `${card.name}: ${msg}`),
  );

  let nextTargetState: string | null = card.type === 'ZONE' ? targetState : null;
  let selectedCard: string | null = null;

  if (card.type === 'ZONE' && targetState && effectResult.pressureDelta) {
    const stateIndex = newStates.findIndex(state =>
      state.abbreviation === targetState ||
      state.id === targetState ||
      state.name === targetState,
    );

    if (stateIndex !== -1) {
      const previousState = newStates[stateIndex];
      const pressureGain = effectResult.pressureDelta;
      const updatedState: StateForResolution = {
        ...previousState,
        pressure: (previousState.pressure || 0) + pressureGain,
      };

      if (pressureGain > 0 && updatedState.pressure >= updatedState.defense) {
        updatedState.owner = 'player';
        setStateOccupation(updatedState, gameState.faction, { id: card.id, name: card.name }, false);

        if (!controlledStates.includes(updatedState.abbreviation)) {
          controlledStates = [...controlledStates, updatedState.abbreviation];
        }

        logEntries.push(
          `🚨 ${card.name} captured ${updatedState.name}! (+${pressureGain} pressure)`,
        );
        nextTargetState = null;

        achievements.updateStats({
          total_states_controlled: achievements.stats.total_states_controlled + 1,
          max_states_controlled_single_game: Math.max(
            achievements.stats.max_states_controlled_single_game,
            controlledStates.length,
          ),
        });
      } else if (pressureGain !== 0) {
        logEntries.push(
          `${card.name} added pressure to ${updatedState.name} (+${pressureGain}, ${updatedState.pressure}/${updatedState.defense})`,
        );
      }

      newStates[stateIndex] = updatedState;
    }
  }

  if (card.type === 'DEFENSIVE' && effectResult.zoneDefenseBonus < 0) {
    const playerStates = newStates.filter(
      state => state.owner === 'player' && (state.pressure || 0) > 0,
    );

    if (playerStates.length > 0) {
      const randomState = playerStates[Math.floor(Math.random() * playerStates.length)];
      const stateIndex = newStates.findIndex(state => state.id === randomState.id);
      const pressureReduction = Math.abs(effectResult.zoneDefenseBonus);
      const updatedState = {
        ...newStates[stateIndex],
        pressure: Math.max(0, (newStates[stateIndex].pressure || 0) - pressureReduction),
      };

      newStates[stateIndex] = updatedState;
      logEntries.push(`${card.name} reduced pressure on ${updatedState.name} (-${pressureReduction})`);
    }
  }

  achievements.updateStats({
    max_ip_reached: Math.max(achievements.stats.max_ip_reached, playerIPAfterEffects),
    max_truth_reached: Math.max(achievements.stats.max_truth_reached, truthAfterEffects),
    min_truth_reached: Math.min(achievements.stats.min_truth_reached, truthAfterEffects),
  });

  return {
    ip: playerIPAfterEffects,
    aiIP: aiIPAfterEffects,
    truth: truthAfterEffects,
    states: newStates,
    controlledStates,
    targetState: nextTargetState,
    selectedCard,
    logEntries,
    damageDealt,
  };
}
