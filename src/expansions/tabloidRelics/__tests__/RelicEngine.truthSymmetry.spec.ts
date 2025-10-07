import { beforeEach, describe, expect, it } from 'bun:test';

import { RelicEngine } from '../RelicEngine';
import type { RelicHostState, TabloidRelicRuntimeState } from '../RelicTypes';
import { hydrateExpansionFeatures } from '@/data/expansions/features';

const createRuntime = (): TabloidRelicRuntimeState => ({
  entries: [
    {
      uid: 'truth-beacon',
      ruleId: 'truth-beacon',
      label: 'Truth Beacon',
      rarity: 'rare',
      summary: 'Broadcasts a truth charge every round.',
      duration: 3,
      remaining: 3,
      status: 'queued',
      triggeredOnRound: 1,
      effects: { truthPerRound: 3 },
    },
    {
      uid: 'shadow-pylon',
      ruleId: 'shadow-pylon',
      label: 'Shadow Pylon',
      rarity: 'uncommon',
      summary: 'Secondary relic used to confirm mirrored totals.',
      duration: 2,
      remaining: 2,
      status: 'queued',
      triggeredOnRound: 2,
      effects: { truthPerRound: 2 },
    },
  ],
  lastIssueRound: 2,
  selectionHistory: [],
});

const createHostState = (faction: 'truth' | 'government'): RelicHostState => ({
  faction,
  truth: 42,
  ip: 8,
  aiIP: 2,
  round: 5,
  turn: 10,
  tabloidRelicsRuntime: createRuntime(),
});

beforeEach(() => {
  hydrateExpansionFeatures({ editors: false, tabloidRelics: true });
});

describe('RelicEngine.applyRoundStart relic upkeep polarity', () => {
  it('grants mirrored truth swings for opposing factions', () => {
    const truthResult = RelicEngine.applyRoundStart({ state: createHostState('truth') });
    const governmentResult = RelicEngine.applyRoundStart({ state: createHostState('government') });

    expect(truthResult.truthDelta).toBe(5);
    expect(governmentResult.truthDelta).toBe(-5);
    expect(truthResult.truth).toBe(47);
    expect(governmentResult.truth).toBe(37);
  });
});
