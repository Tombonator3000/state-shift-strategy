import { describe, expect, it, mock } from 'bun:test';

mock.module('@/data/hotspots.catalog.json', () => ({
  default: { hotspots: [] },
}));

mock.module('@/data/hotspots.config.json', () => ({
  default: {
    resolution: {
      truthRewards: {
        defaults: { base: 6, min: -10, max: 10 },
      },
    },
  },
}));

mock.module('@/data/cryptids.homestate.json', () => ({
  default: {},
}));

mock.module('@/data/usaStates', () => ({
  USA_STATES: [],
}));

mock.module('@/data/expansions/state', () => ({
  getEnabledExpansionIdsSnapshot: () => [],
}));

import { resolveHotspot as resolveParanormalHotspot } from '../paranormalHotspots';

describe('resolveParanormalHotspot mirrored truth rewards', () => {
  it('returns equal and opposite truth deltas for opposing factions', () => {
    const baseline = resolveParanormalHotspot('OR', 'truth', {
      fallbackTruthReward: 6,
      enabledExpansions: [],
    });
    const opposition = resolveParanormalHotspot('OR', 'government', {
      fallbackTruthReward: 6,
      enabledExpansions: [],
    });

    expect(baseline.truthDelta).toBe(6);
    expect(opposition.truthDelta).toBe(-6);
    expect(Math.abs(baseline.truthDelta)).toBe(Math.abs(opposition.truthDelta));
  });
});
