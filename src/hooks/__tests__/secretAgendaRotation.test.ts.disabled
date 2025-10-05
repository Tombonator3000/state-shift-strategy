import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { getAgendasByFaction } from '@/data/agendaDatabase';
import { createDefaultCombinationEffects } from '@/data/stateCombinations';
import type { GameState } from '../gameStateTypes';
import { assignSecretAgendaToState, updateSecretAgendaProgress } from '../useGameState';

const createTestState = (): GameState => ({
  faction: 'truth',
  phase: 'action',
  turn: 1,
  round: 1,
  currentPlayer: 'human',
  aiDifficulty: 'easy',
  truth: 50,
  ip: 10,
  aiIP: 10,
  hand: [],
  aiHand: [],
  isGameOver: false,
  deck: [],
  aiDeck: [],
  cardsPlayedThisTurn: 0,
  cardsPlayedThisRound: [],
  playHistory: [],
  turnPlays: [],
  comboTruthDeltaThisRound: 0,
  controlledStates: [],
  aiControlledStates: [],
  states: [],
  currentEvents: [],
  pendingEditionEvents: [],
  eventManager: undefined,
  showNewspaper: false,
  log: [],
  agendaIssue: { id: 'ufo', label: 'Test Issue', description: 'Testing', tags: [] },
  agendaIssueCounters: {},
  agendaRoundCounters: {},
  completedSecretAgendaIds: [],
  completedAiSecretAgendaIds: [],
  secretAgenda: undefined,
  aiSecretAgenda: undefined,
  secretAgendaDifficulty: null,
  secretAgendasEnabled: true,
  animating: false,
  aiTurnInProgress: false,
  selectedCard: null,
  targetState: null,
  aiStrategist: undefined,
  pendingCardDraw: undefined,
  newCards: undefined,
  showNewCardsPresentation: false,
  drawMode: 'standard',
  cardDrawState: { cardsPlayedLastTurn: 0, lastTurnWithoutPlay: false },
  stateCombinationBonusIP: 0,
  activeStateCombinationIds: [],
  stateCombinationEffects: createDefaultCombinationEffects(),
  truthAbove80Streak: 0,
  truthBelow20Streak: 0,
  timeBasedGoalCounters: {},
  paranormalHotspots: {},
  activeHotspot: null,
  stateRoundSeed: 0,
  lastStateBonusRound: 0,
  stateRoundEvents: {},
  activeCampaignArcs: [],
  pendingArcEvents: [],
});

const originalRandom = Math.random;

beforeEach(() => {
  Math.random = () => 0;
});

afterEach(() => {
  Math.random = originalRandom;
});

describe('secret agenda rotation', () => {
  test('completing agendas rotates through unique IDs until pools are exhausted', () => {
    const truthPoolSize = getAgendasByFaction('truth').length;
    const governmentPoolSize = getAgendasByFaction('government').length;

    let state = assignSecretAgendaToState(createTestState(), { factionAgendaId: null });

    const iterations = Math.max(truthPoolSize, governmentPoolSize) + 2;

    for (let step = 0; step < iterations; step += 1) {
      const currentPlayerAgenda = state.secretAgenda;
      const currentAiAgenda = state.aiSecretAgenda;

      expect(currentPlayerAgenda).toBeDefined();
      expect(currentAiAgenda).toBeDefined();

      if (!currentPlayerAgenda || !currentAiAgenda) {
        break;
      }

      const preparedState: GameState = {
        ...state,
        secretAgenda: {
          ...currentPlayerAgenda,
          progress: currentPlayerAgenda.target,
          completed: false,
          revealed: true,
          checkProgress: () => ({
            progress: currentPlayerAgenda.target,
            stageId: currentPlayerAgenda.stages?.[0]?.id ?? 'stage-final',
          }),
        },
        aiSecretAgenda: {
          ...currentAiAgenda,
          progress: currentAiAgenda.target,
          completed: false,
          revealed: true,
          checkProgress: () => ({
            progress: currentAiAgenda.target,
            stageId: currentAiAgenda.stages?.[0]?.id ?? 'stage-final',
          }),
        },
      };

      state = updateSecretAgendaProgress(preparedState);

      expect(state.completedSecretAgendaIds).toContain(currentPlayerAgenda.id);
      expect(state.completedAiSecretAgendaIds).toContain(currentAiAgenda.id);

      if (state.completedSecretAgendaIds.length < truthPoolSize) {
        expect(state.secretAgenda?.id).toBeDefined();
        if (state.secretAgenda) {
          expect(state.completedSecretAgendaIds).not.toContain(state.secretAgenda.id);
        }
      }

      if (state.completedAiSecretAgendaIds.length < governmentPoolSize) {
        expect(state.aiSecretAgenda?.id).toBeDefined();
        if (state.aiSecretAgenda) {
          expect(state.completedAiSecretAgendaIds).not.toContain(state.aiSecretAgenda.id);
        }
      }
    }
  });
});
