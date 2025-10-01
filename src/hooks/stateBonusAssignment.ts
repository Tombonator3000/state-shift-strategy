import { buildEditionEvents } from './eventEdition';
import type { GameState } from './gameStateTypes';
import type { AssignStateBonusesResult } from '@/game/stateBonuses';
import { applyTruthDelta } from '@/utils/truth';

export const applyStateBonusAssignmentToState = (
  baseState: GameState,
  assignment: AssignStateBonusesResult,
): GameState => {
  const assignmentLogs = assignment.logs.filter(log => !log.includes('activates '));
  let nextState: GameState = {
    ...baseState,
    log:
      assignmentLogs.length > 0
        ? [...baseState.log, ...assignmentLogs]
        : [...baseState.log],
  };

  if (assignment.playerTruthDelta !== 0) {
    nextState = applyTruthDelta(nextState, assignment.playerTruthDelta, 'human');
  }

  if (assignment.aiTruthDelta !== 0) {
    nextState = applyTruthDelta(nextState, assignment.aiTruthDelta, 'ai');
  }

  if (assignment.playerIpDelta !== 0) {
    const ipDelta = assignment.playerIpDelta;
    nextState = {
      ...nextState,
      ip: Math.max(0, Math.round(nextState.ip + ipDelta)),
      log: [
        ...nextState.log,
        `State bonuses adjusted player IP by ${ipDelta >= 0 ? '+' : ''}${ipDelta}`,
      ],
    };
  }

  if (assignment.aiIpDelta !== 0) {
    const aiIpDelta = assignment.aiIpDelta;
    nextState = {
      ...nextState,
      aiIP: Math.max(0, Math.round(nextState.aiIP + aiIpDelta)),
      log: [
        ...nextState.log,
        `State bonuses adjusted AI IP by ${aiIpDelta >= 0 ? '+' : ''}${aiIpDelta}`,
      ],
    };
  }

  const activationLogs: string[] = [];
  const updatedStates = nextState.states.map(state => {
    const bonus = assignment.bonuses[state.abbreviation] ?? null;
    const hasController = state.owner === 'player' || state.owner === 'ai';
    const roundEvents = hasController ? assignment.roundEvents[state.abbreviation] ?? [] : [];
    const pressureEntry = assignment.pressureAdjustments[state.abbreviation];
    const playerPressureDelta = pressureEntry?.player ?? 0;
    const aiPressureDelta = pressureEntry?.ai ?? 0;

    const previousBonus = state.activeStateBonus ?? null;
    if (bonus) {
      const bonusChanged = !previousBonus || previousBonus.id !== bonus.id;
      if (bonusChanged) {
        const icon = bonus.icon ?? '⭐️';
        activationLogs.push(`${icon} ${state.name} activates ${bonus.label}`);
      }
    }

    if (playerPressureDelta === 0 && aiPressureDelta === 0) {
      return {
        ...state,
        activeStateBonus: bonus,
        roundEvents,
      };
    }

    const playerFactionPressureKey: 'pressurePlayer' | 'pressureAi' =
      nextState.faction === 'truth' ? 'pressurePlayer' : 'pressureAi';
    const aiFactionPressureKey =
      playerFactionPressureKey === 'pressurePlayer' ? 'pressureAi' : 'pressurePlayer';

    let updatedPressurePlayer = state.pressurePlayer ?? 0;
    let updatedPressureAi = state.pressureAi ?? 0;

    if (playerPressureDelta !== 0 && state.owner === 'player') {
      if (playerFactionPressureKey === 'pressurePlayer') {
        updatedPressurePlayer = Math.max(0, updatedPressurePlayer + playerPressureDelta);
      } else {
        updatedPressureAi = Math.max(0, updatedPressureAi + playerPressureDelta);
      }
    }

    if (aiPressureDelta !== 0 && state.owner === 'ai') {
      if (aiFactionPressureKey === 'pressurePlayer') {
        updatedPressurePlayer = Math.max(0, updatedPressurePlayer + aiPressureDelta);
      } else {
        updatedPressureAi = Math.max(0, updatedPressureAi + aiPressureDelta);
      }
    }

    const updatedPressure = Math.max(updatedPressurePlayer, updatedPressureAi);

    return {
      ...state,
      pressurePlayer: updatedPressurePlayer,
      pressureAi: updatedPressureAi,
      pressure: updatedPressure,
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

  if (activationLogs.length > 0) {
    nextState = {
      ...nextState,
      log: [...nextState.log, ...activationLogs],
    };
  }

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

