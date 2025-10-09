import { beforeEach, describe, expect, it, mock } from 'bun:test';

mock.module('@/data/stateThemedPools', () => ({
  resolvePoolForState: () => ({
    bonuses: [
      {
        id: 'truth-signal',
        label: 'Truth Signal',
        summary: 'Amplifies local whistleblowers.',
        headline: 'Whistleblowers Flood the Phone Lines',
        subhead: 'Anonymous tips overwhelm censors.',
        icon: '📡',
        weight: 1,
        effect: { truthDelta: 4, ipDelta: 0, pressureDelta: 0 },
      },
    ],
    events: [],
  }),
}));

mock.module('@/data/eventDatabase', () => ({
  DEFAULT_EVENT_TRIGGER_CHANCE: 0,
}));

import { applyComboRewards } from '../comboEngine';
import { assignStateBonuses } from '../stateBonuses';
import type { ComboEvaluation } from '../combo.types';
import type { GameState } from '@/mvp/validator';

const createBaseState = (faction: 'truth' | 'government'): GameState => ({
  turn: 3,
  currentPlayer: 'P1',
  truth: 50,
  players: {
    P1: {
      id: 'P1',
      faction,
      deck: [],
      hand: [],
      discard: [],
      ip: 10,
      states: ['NY'],
    },
    P2: {
      id: 'P2',
      faction: faction === 'truth' ? 'government' : 'truth',
      deck: [],
      hand: [],
      discard: [],
      ip: 10,
      states: ['CA'],
    },
  },
  pressureByState: {},
  stateDefense: {},
  playsThisTurn: 0,
  turnPlays: [],
  log: [],
  headlineLog: [],
  extraExtraFeed: [],
  turnBuffer: [],
  winner: null,
  victoryType: null,
});

describe('comboEngine.applyComboRewards truth mirror enforcement', () => {
  let evaluation: ComboEvaluation;

  beforeEach(() => {
    evaluation = {
      results: [
        {
          definition: {
            id: 'mirror-messaging',
            name: 'Mirror Messaging',
            description: 'Truth/IP reward combo used for parity testing.',
            category: 'sequence',
            priority: 1,
            trigger: { kind: 'sequence', sequence: ['MEDIA'] },
            reward: { truth: 3 },
          },
          reward: { truth: 3 },
          appliedReward: { truth: 3 },
          details: { matchedPlays: [] },
        },
      ],
      totalReward: { truth: 3 },
      logs: ['Mirror Messaging Truth +3'],
    } satisfies ComboEvaluation;
  });

  it('raises global truth when the truth faction triggers a combo', () => {
    const state = createBaseState('truth');

    applyComboRewards(state, 'P1', evaluation);

    expect(state.truth).toBe(53);
    expect(state.log.at(-1)).toContain('Truth manipulation');
  });

  it('penalizes truth equally for government combo beneficiaries', () => {
    const state = createBaseState('government');

    applyComboRewards(state, 'P1', evaluation);

    expect(state.truth).toBe(47);
    expect(state.log.at(-1)).toContain('Truth manipulation');
  });
});

describe('assignStateBonuses faction polarity guardrail', () => {
  const sharedStates = [
    { id: 'ny', abbreviation: 'NY', name: 'New York', owner: 'player' as const },
  ];

  it('awards positive truth to truth-aligned territories', () => {
    const result = assignStateBonuses({
      states: sharedStates,
      baseSeed: 123,
      round: 4,
      playerFaction: 'truth',
      eventChance: 0,
    });

    expect(result.playerTruthDelta).toBe(4);
    expect(result.aiTruthDelta).toBe(0);
  });

  it('mirrors the assignment for government-controlled players', () => {
    const result = assignStateBonuses({
      states: sharedStates,
      baseSeed: 123,
      round: 4,
      playerFaction: 'government',
      eventChance: 0,
    });

    expect(result.playerTruthDelta).toBe(-4);
    expect(result.aiTruthDelta).toBe(0);
  });
});
