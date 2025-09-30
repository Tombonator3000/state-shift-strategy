import { buildEditionEvents } from './eventEdition';
import type { GameState } from './gameStateTypes';
import type { AssignStateBonusesResult } from '@/game/stateBonuses';
import { applyTruthDelta } from '@/utils/truth';

export const applyStateBonusAssignmentToState = (
  baseState: GameState,
  assignment: AssignStateBonusesResult,
): GameState => {
  let nextState: GameState = {
    ...baseState,
    log:
      assignment.logs.length > 0
        ? [...baseState.log, ...assignment.logs]
        : [...baseState.log],
  };

  if (assignment.truthDelta !== 0) {
    nextState = applyTruthDelta(nextState, assignment.truthDelta, 'human');
  }

  if (assignment.ipDelta !== 0) {
    const ipDelta = assignment.ipDelta;
    nextState = {
      ...nextState,
      ip: Math.max(0, Math.round(nextState.ip + ipDelta)),
      log: [
        ...nextState.log,
        `State bonuses adjusted IP by ${ipDelta >= 0 ? '+' : ''}${ipDelta}`,
      ],
    };
  }

  const pressureKey: 'pressurePlayer' | 'pressureAi' =
    nextState.faction === 'truth' ? 'pressurePlayer' : 'pressureAi';
  const rivalKey = pressureKey === 'pressurePlayer' ? 'pressureAi' : 'pressurePlayer';

  const updatedStates = nextState.states.map(state => {
    const bonus = assignment.bonuses[state.abbreviation] ?? null;
    const hasController = state.owner === 'player' || state.owner === 'ai';
    const roundEvents = hasController ? assignment.roundEvents[state.abbreviation] ?? [] : [];
    const pressureDelta = assignment.pressureAdjustments[state.abbreviation] ?? 0;

    if (pressureDelta === 0) {
      return {
        ...state,
        activeStateBonus: bonus,
        roundEvents,
      };
    }

    const updatedPressureOwner = Math.max(0, (state[pressureKey] ?? 0) + pressureDelta);
    const opponentPressure = Math.max(0, state[rivalKey] ?? 0);

    return {
      ...state,
      [pressureKey]: updatedPressureOwner,
      pressure: Math.max(updatedPressureOwner, opponentPressure),
      activeStateBonus: bonus,
      roundEvents,
    } as typeof state;
  });

  const stateRoundEvents = Object.fromEntries(
    updatedStates.map(state => [state.abbreviation, state.roundEvents ?? []]),
  );

  nextState = {
    ...nextState,
    states: updatedStates,
    stateRoundEvents,
    lastStateBonusRound: nextState.round,
  };

  if (assignment.newspaperEvents.length > 0) {
    nextState = {
      ...nextState,
      currentEvents: buildEditionEvents(
        { turn: nextState.turn, round: nextState.round, currentEvents: nextState.currentEvents },
        assignment.newspaperEvents,
      ),
    };
  }

  return nextState;
};

