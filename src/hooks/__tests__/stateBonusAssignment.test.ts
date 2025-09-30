import { describe, expect, test } from 'bun:test';
import type { GameState } from '../gameStateTypes';
import type { AssignStateBonusesResult } from '@/game/stateBonuses';
import { applyStateBonusAssignmentToState } from '../stateBonusAssignment';

const createBaseGameState = (faction: 'truth' | 'government'): GameState => ({
  faction,
  phase: 'newspaper',
  turn: 2,
  round: 3,
  currentPlayer: 'human',
  aiDifficulty: 'easy',
  truth: 50,
  ip: 42,
  aiIP: 30,
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
  states: [
    {
      id: '48',
      name: 'Texas',
      abbreviation: 'TX',
      baseIP: 0,
      baseDefense: 0,
      defense: 0,
      pressure: faction === 'truth' ? 3 : 0,
      pressurePlayer: faction === 'truth' ? 3 : 0,
      pressureAi: faction === 'truth' ? 0 : 3,
      contested: false,
      owner: 'player',
      stateEventHistory: [],
      roundEvents: [],
    },
  ],
  currentEvents: [],
  pendingEditionEvents: [],
  showNewspaper: false,
  log: ['Initial log'],
  agendaIssue: {
    id: 'agenda:test',
    label: 'Agenda Test',
    stateId: null,
    owner: 'human',
    phase: 'inactive',
    progress: 0,
    target: 0,
  },
  agendaIssueCounters: {},
  agendaRoundCounters: {},
  animating: false,
  aiTurnInProgress: false,
  selectedCard: null,
  targetState: null,
  drawMode: 'standard',
  cardDrawState: { cardsPlayedLastTurn: 0, lastTurnWithoutPlay: false },
  stateCombinationBonusIP: 0,
  activeStateCombinationIds: [],
  stateCombinationEffects: {},
  truthAbove80Streak: 0,
  truthBelow20Streak: 0,
  timeBasedGoalCounters: {},
  paranormalHotspots: {},
  stateRoundSeed: 123,
  lastStateBonusRound: 1,
  stateRoundEvents: {},
  activeCampaignArcs: [],
  pendingArcEvents: [],
});

const createAssignment = (): AssignStateBonusesResult => ({
  bonuses: {
    TX: {
      source: 'state-themed',
      id: 'bonus:tx',
      stateId: '48',
      stateName: 'Texas',
      stateAbbreviation: 'TX',
      round: 3,
      label: 'Mystery Subsidy',
      summary: 'Economic incentives flow freely.',
      headline: 'State coffers swell',
      truthDelta: -2,
      ipDelta: 4,
      pressureDelta: 1,
    },
  },
  roundEvents: {
    TX: [
      {
        source: 'state-themed',
        id: 'event:tx',
        stateId: '48',
        stateName: 'Texas',
        stateAbbreviation: 'TX',
        round: 3,
        headline: 'Investigative Lead',
        summary: 'Agents pursue promising intel.',
        truthDelta: -1,
        ipDelta: 2,
        pressureDelta: 1,
      },
    ],
  },
  logs: ['⭐️ Texas activates Mystery Subsidy'],
  truthDelta: -2,
  ipDelta: 4,
  pressureAdjustments: { TX: 1 },
  newspaperEvents: [],
  debug: { seed: 99, rolls: [] },
});

describe('applyStateBonusAssignmentToState', () => {
  test('applies logged adjustments for the truth faction without flipping signs', () => {
    const baseState = createBaseGameState('truth');
    const assignment = createAssignment();

    const updated = applyStateBonusAssignmentToState(baseState, assignment);

    expect(updated.truth).toBe(48);
    expect(updated.ip).toBe(46);
    expect(updated.lastStateBonusRound).toBe(baseState.round);
    expect(updated.stateRoundEvents['TX']).toEqual(assignment.roundEvents['TX']);

    const state = updated.states[0];
    expect(state.pressurePlayer).toBe(4);
    expect(state.pressureAi).toBe(0);
    expect(state.pressure).toBe(4);
    expect(state.activeStateBonus?.id).toBe('bonus:tx');

    expect(updated.log).toContain('⭐️ Texas activates Mystery Subsidy');
    expect(updated.log.some(entry => entry.startsWith('Truth manipulation'))).toBe(true);
    expect(updated.log.at(-1)).toBe('State bonuses adjusted IP by +4');

    // original state remains unchanged
    expect(baseState.truth).toBe(50);
    expect(baseState.ip).toBe(42);
    expect(baseState.states[0].pressurePlayer).toBe(3);
  });

  test('updates government faction using the same signed adjustments', () => {
    const baseState = createBaseGameState('government');
    const assignment = createAssignment();

    const updated = applyStateBonusAssignmentToState(baseState, assignment);

    expect(updated.truth).toBe(48);
    expect(updated.ip).toBe(46);

    const state = updated.states[0];
    expect(state.pressureAi).toBe(4);
    expect(state.pressurePlayer).toBe(0);
    expect(state.pressure).toBe(4);

    expect(updated.log.at(-1)).toBe('State bonuses adjusted IP by +4');
    expect(updated.log.some(entry => entry.startsWith('Truth manipulation'))).toBe(true);
  });
});

