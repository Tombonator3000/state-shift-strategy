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
      summary: 'Test relic ensuring truth alignment.',
      duration: 3,
      remaining: 3,
      status: 'queued',
      triggeredOnRound: 1,
      effects: { truthPerRound: 4 },
    },
  ],
  lastIssueRound: 1,
  selectionHistory: [],
});

const createHostState = (faction: 'truth' | 'government'): RelicHostState => ({
  faction,
  truth: 50,
  ip: 12,
  aiIP: 3,
  round: 4,
  turn: 8,
  tabloidRelicsRuntime: createRuntime(),
});

beforeEach(() => {
  hydrateExpansionFeatures({ editors: false, tabloidRelics: true });
});

describe('RelicEngine.applyRoundStart truth polarity', () => {
  it('awards positive truth for truth faction hosts', () => {
    const state = createHostState('truth');

    const result = RelicEngine.applyRoundStart({ state });

    expect(result.truth).toBe(54);
    expect(result.truthDelta).toBe(4);
    expect(result.logEntries.some(entry => entry.includes('Truth +4'))).toBe(true);
    expect(result.logEntries.some(entry => entry.includes('net truth delta: +4'))).toBe(true);
  });

  it('applies an equal-magnitude penalty for government faction hosts', () => {
    const state = createHostState('government');

    const result = RelicEngine.applyRoundStart({ state });

    expect(result.truth).toBe(46);
    expect(result.truthDelta).toBe(-4);
    expect(result.logEntries.some(entry => entry.includes('Truth -4'))).toBe(true);
    expect(result.logEntries.some(entry => entry.includes('net truth delta: -4'))).toBe(true);
  });
});
