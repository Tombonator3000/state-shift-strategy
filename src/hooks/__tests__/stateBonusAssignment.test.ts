import { describe, expect, test } from 'bun:test';
import type { ActiveStateBonus, GameState } from '../gameStateTypes';
import { assignStateBonuses, type AssignStateBonusesResult } from '@/game/stateBonuses';
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
      paranormalHotspot: undefined,
      paranormalHotspotHistory: [],
      stateEventBonus: undefined,
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
      icon: '⭐️',
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
  logs: ['🗞️ Texas reports: Investigative Lead'],
  playerTruthDelta: -2,
  aiTruthDelta: 0,
  playerIpDelta: 4,
  aiIpDelta: 0,
  pressureAdjustments: { TX: { player: 1, ai: 0 } },
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

    expect(updated.log).toContain('🗞️ Texas reports: Investigative Lead');
    expect(updated.log).toContain('⭐️ Texas activates Mystery Subsidy');
    expect(updated.log.some(entry => entry.startsWith('Truth manipulation'))).toBe(true);
    expect(updated.log).toContain('State bonuses adjusted player IP by +4');

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

    expect(updated.log).toContain('State bonuses adjusted player IP by +4');
    expect(updated.log.some(entry => entry.startsWith('Truth manipulation'))).toBe(true);
  });

  test('retains active bonus across rounds without duplicate activation log', () => {
    const baseState = createBaseGameState('truth');
    const assignment = createAssignment();

    const afterRoundThree = applyStateBonusAssignmentToState(baseState, assignment);

    const activationLogsAfterFirst = afterRoundThree.log.filter(entry =>
      entry.includes('activates Mystery Subsidy'),
    );
    expect(activationLogsAfterFirst).toHaveLength(1);

    const nextRoundBase: GameState = {
      ...afterRoundThree,
      round: afterRoundThree.round + 1,
      lastStateBonusRound: afterRoundThree.lastStateBonusRound,
      log: [...afterRoundThree.log],
    };

    const followupAssignment: AssignStateBonusesResult = {
      ...assignment,
      bonuses: {
        TX: {
          ...assignment.bonuses.TX!,
          round: nextRoundBase.round,
        },
      },
      logs: [],
      roundEvents: { TX: [] },
      debug: { seed: 100, rolls: [] },
    };

    const afterRoundFour = applyStateBonusAssignmentToState(nextRoundBase, followupAssignment);

    const activationLogsAfterSecond = afterRoundFour.log.filter(entry =>
      entry.includes('activates Mystery Subsidy'),
    );
    expect(activationLogsAfterSecond).toHaveLength(1);

    expect(afterRoundFour.states[0].activeStateBonus?.id).toBe(
      afterRoundThree.states[0].activeStateBonus?.id,
    );

    const truthDelta = (followupAssignment.playerTruthDelta ?? 0) + (followupAssignment.aiTruthDelta ?? 0);
    const ipDelta = followupAssignment.playerIpDelta ?? 0;
    const pressureDelta = followupAssignment.pressureAdjustments.TX?.player ?? 0;

    expect(afterRoundFour.truth).toBe(afterRoundThree.truth + truthDelta);
    expect(afterRoundFour.ip).toBe(afterRoundThree.ip + ipDelta);
    expect(afterRoundFour.states[0].pressurePlayer).toBe(
      (afterRoundThree.states[0].pressurePlayer ?? 0) + pressureDelta,
    );
  });

  test('flips cached bonus truth delta when a government player takes control of a neutral state', () => {
    const neutralBonus: ActiveStateBonus = {
      source: 'state-themed',
      id: 'mountain_bonus_sasquatch_zoning_board',
      stateId: '56',
      stateName: 'Wyoming',
      stateAbbreviation: 'WY',
      round: 2,
      label: 'Sasquatch Zoning Board',
      summary: 'A towering “ranger” greenlights antenna farms for compliant operatives.',
      headline: 'FOREST COUNCIL MEETING INCLUDES VERY TALL “RANGER”',
      subhead: 'Minutes record no anomalies besides giant footprints.',
      icon: '🦶',
      truthDelta: 2,
      pressureDelta: 1,
    };

    const reassignment = assignStateBonuses({
      states: [
        {
          id: '56',
          abbreviation: 'WY',
          name: 'Wyoming',
          owner: 'player',
        },
      ],
      baseSeed: 101,
      round: 3,
      playerFaction: 'government',
      existingBonuses: { WY: neutralBonus },
    });

    const wyomingBonus = reassignment.bonuses.WY;
    expect(neutralBonus.truthDelta).toBeGreaterThan(0);
    expect(wyomingBonus?.id).toBe(neutralBonus.id);
    expect(wyomingBonus?.label).toBe(neutralBonus.label);
    expect(wyomingBonus?.truthDelta).toBe(-neutralBonus.truthDelta);
    expect(reassignment.playerTruthDelta).toBe(-neutralBonus.truthDelta);
  });

  test('applies AI-controlled adjustments to the correct pools', () => {
    const baseState: GameState = {
      ...createBaseGameState('truth'),
      states: [
        {
          id: '06',
          name: 'California',
          abbreviation: 'CA',
          baseIP: 0,
          baseDefense: 0,
          defense: 0,
          pressure: 2,
          pressurePlayer: 0,
          pressureAi: 2,
          contested: false,
          owner: 'ai',
          paranormalHotspot: undefined,
          paranormalHotspotHistory: [],
          stateEventBonus: undefined,
          stateEventHistory: [],
          roundEvents: [],
        },
      ],
    };

    const assignment: AssignStateBonusesResult = {
      bonuses: {
        CA: {
          source: 'state-themed',
          id: 'bonus:ca',
          stateId: '06',
          stateName: 'California',
          stateAbbreviation: 'CA',
          round: 3,
          label: 'Propaganda Windfall',
          summary: 'Narratives bend toward the establishment.',
          headline: 'Public sentiment shifts',
          icon: '🛰️',
          truthDelta: -3,
          ipDelta: 5,
          pressureDelta: 2,
        },
      },
      roundEvents: {
        CA: [
          {
            source: 'state-themed',
            id: 'event:ca',
            stateId: '06',
            stateName: 'California',
            stateAbbreviation: 'CA',
            round: 3,
            headline: 'Censorious Crackdown',
            summary: 'Authorities clamp down on dissent.',
            truthDelta: -2,
            ipDelta: 4,
            pressureDelta: 1,
          },
        ],
      },
      logs: ['🛰️ California activates Propaganda Windfall'],
      playerTruthDelta: 0,
      aiTruthDelta: -5,
      playerIpDelta: 0,
      aiIpDelta: 9,
      pressureAdjustments: { CA: { player: 0, ai: 3 } },
      newspaperEvents: [],
      debug: { seed: 77, rolls: [] },
    };

    const updated = applyStateBonusAssignmentToState(baseState, assignment);

    expect(updated.truth).toBe(baseState.truth - 5);
    expect(updated.ip).toBe(baseState.ip);
    expect(updated.aiIP).toBe(baseState.aiIP + 9);
    expect(updated.states[0].pressureAi).toBe(baseState.states[0].pressureAi + 3);
    expect(updated.states[0].pressurePlayer).toBe(baseState.states[0].pressurePlayer);
    expect(updated.log).toContain('State bonuses adjusted AI IP by +9');
  });
});

