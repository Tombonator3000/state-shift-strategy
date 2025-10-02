import { describe, expect, it } from 'bun:test';

import type { GameState } from '@/hooks/gameStateTypes';
import { formatHotspotSpawnLog, getHotspotIdleLog } from '@/state/useGameLog';
import { USA_STATES } from '@/data/usaStates';

import hotspotsCatalog from '@/data/hotspots.catalog.json';
import hotspotsConfig from '@/data/hotspots.config.json';

import { HotspotDirector, resolveHotspot, type WeightedHotspotCandidate } from '../paranormalHotspots';

const createGameState = (): Pick<GameState, 'states' | 'paranormalHotspots'> => ({
  states: USA_STATES.map(state => ({
    id: state.abbreviation,
    name: state.name,
    abbreviation: state.abbreviation,
  })) as unknown as GameState['states'],
  paranormalHotspots: {},
});

const createRng = (seed: number) => {
  let value = seed % 2147483647;
  if (value <= 0) value += 2147483646;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
};

type SpawnRecord = { round: number; candidate: WeightedHotspotCandidate };

const simulateSpawns = (rounds: number, enabledExpansions: string[]): SpawnRecord[] => {
  const director = new HotspotDirector();
  const rng = createRng(42);
  const gameState = createGameState();
  const results: SpawnRecord[] = [];

  for (let round = 1; round <= rounds; round += 1) {
    const candidate = director.rollForSpawn(round, gameState, { rng, enabledExpansions });
    if (!candidate) {
      continue;
    }
    results.push({ round, candidate });
    gameState.paranormalHotspots = {};
  }

  return results;
};

const tallyByState = (records: SpawnRecord[]): Record<string, number> =>
  records.reduce<Record<string, number>>((acc, record) => {
    const key = record.candidate.stateAbbreviation;
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

describe('HotspotDirector spawn simulation', () => {
  it('respects per-round cap and expansion weighting across ≥50 rounds', () => {
    const rounds = 200;
    const baseRecords = simulateSpawns(rounds, []);
    const cryptidsRecords = simulateSpawns(rounds, ['cryptids']);
    const halloweenRecords = simulateSpawns(rounds, ['halloween']);

    expect(baseRecords.length).toBe(rounds);
    expect(new Set(baseRecords.map(record => record.round)).size).toBe(rounds);

    const baseCounts = tallyByState(baseRecords);
    const cryptidsCounts = tallyByState(cryptidsRecords);
    const halloweenCounts = tallyByState(halloweenRecords);

    const totalBaseSpawns = Object.values(baseCounts).reduce((sum, value) => sum + value, 0);
    expect(totalBaseSpawns).toBe(rounds);

    const targetedStates = ['WA', 'OR', 'WV', 'NJ', 'MT', 'NH', 'NM', 'AZ'];
    const baseTargetedTotal = targetedStates
      .reduce((sum, state) => sum + (baseCounts[state] ?? 0), 0);
    const cryptidsTargetedTotal = targetedStates
      .reduce((sum, state) => sum + (cryptidsCounts[state] ?? 0), 0);
    expect(cryptidsTargetedTotal).toBeGreaterThan(baseTargetedTotal);
    expect(targetedStates.some(state => (cryptidsCounts[state] ?? 0) > (baseCounts[state] ?? 0)))
      .toBe(true);

    expect(cryptidsRecords.some(record => record.candidate.tags.includes('expansion:cryptids')))
      .toBe(true);

    const waRecord = cryptidsRecords.find(record => record.candidate.stateAbbreviation === 'WA');
    expect(waRecord?.candidate.weightBreakdown?.cryptid ?? 0).toBeGreaterThan(0);
    expect(waRecord?.candidate.tags ?? []).toContain('cryptid-home');

    expect(halloweenCounts).toEqual(baseCounts);
    expect(halloweenRecords.every(record => !record.candidate.tags.includes('expansion:halloween')))
      .toBe(true);
  });

  it('assigns themed icons for cryptid and halloween expansion spawns', () => {
    const director = new HotspotDirector();
    const cryptidGameState = createGameState();
    cryptidGameState.states = cryptidGameState.states
      .filter(state => state.abbreviation === 'WA') as unknown as GameState['states'];

    const cryptidCandidate = director.rollForSpawn(1, cryptidGameState, {
      rng: () => 0,
      enabledExpansions: ['cryptids'],
    });

    expect(cryptidCandidate).not.toBeNull();
    expect(cryptidCandidate?.tags ?? []).toContain('cryptid-home');
    expect(cryptidCandidate?.icon).toBe('🦶');

    const halloweenConfig = JSON.parse(JSON.stringify(hotspotsConfig)) as typeof hotspotsConfig;
    halloweenConfig.spawn.expansionModifiers = {
      ...halloweenConfig.spawn.expansionModifiers,
      halloween: {
        multiplier: 1.15,
        stateWeights: { TX: 2 },
      },
    };

    const emptyCryptids = { cryptids: [] } as { cryptids: [] };
    const themedDirector = new HotspotDirector(hotspotsCatalog, halloweenConfig, emptyCryptids);
    const halloweenGameState = createGameState();
    halloweenGameState.states = halloweenGameState.states
      .filter(state => state.abbreviation === 'TX') as unknown as GameState['states'];

    const halloweenCandidate = themedDirector.rollForSpawn(1, halloweenGameState, {
      rng: () => 0,
      enabledExpansions: ['halloween'],
    });

    expect(halloweenCandidate).not.toBeNull();
    expect(halloweenCandidate?.tags ?? []).toContain('expansion:halloween');
    expect(halloweenCandidate?.icon).toBe('🎃');
  });
});

describe('Hotspot resolution truth deltas', () => {
  it('accumulates signed truth changes for opposing factions', () => {
    const sampleStates = ['WA', 'OR', 'NM', 'WV', 'NJ'];

    const truthTotals = Array.from({ length: 12 }, (_, index) => {
      const state = sampleStates[index % sampleStates.length];
      return resolveHotspot(state, 'truth', { enabledExpansions: ['cryptids'] }).truthDelta;
    }).reduce((sum, value) => sum + value, 0);
    expect(truthTotals).toBeGreaterThan(0);

    const governmentTotals = Array.from({ length: 12 }, (_, index) => {
      const state = sampleStates[index % sampleStates.length];
      return resolveHotspot(state, 'government', { enabledExpansions: ['cryptids'] }).truthDelta;
    }).reduce((sum, value) => sum + value, 0);
    expect(governmentTotals).toBeLessThan(0);
  });
});

describe('Hotspot presentation helpers', () => {
  it('uses configured badge styling and modern log copy', () => {
    const director = new HotspotDirector();
    const sampleHotspot: WeightedHotspotCandidate = {
      id: 'auto:WA:42:123456789',
      name: 'Washington Phenomenon',
      kind: 'phenomenon',
      location: 'Washington',
      intensity: 6,
      status: 'spawning',
      tags: ['auto-spawn', 'expansion:cryptids', 'cryptid-home'],
      stateId: '53',
      stateName: 'Washington',
      stateAbbreviation: 'WA',
      totalWeight: 2.15,
      weightBreakdown: { base: 1.4, expansion: 0.5, cryptid: 0.25 },
      truthDelta: 0,
    };

    const article = director.buildHotspotExtraArticle(sampleHotspot);
    expect(article.badgeClassName)
      .toBe('bg-purple-950/80 border-purple-400/70 text-purple-100');
    expect(article).toMatchInlineSnapshot(`
      {
        "badgeClassName": "bg-purple-950/80 border-purple-400/70 text-purple-100",
        "badgeLabel": "PHENOMENON • WASHINGTON",
        "blurb": "Sensorene melder PHENOMENON-anomali over WASHINGTON. Intensitet 6.",
        "headline": "WASHINGTON PHENOMENON",
        "id": "auto:WA:42:123456789",
        "intensity": 6,
        "kind": "phenomenon",
        "stateAbbreviation": "WA",
        "stateName": "Washington",
      }
    `);

    const logEntry = formatHotspotSpawnLog(article);
    expect(logEntry).toContain('🛸 HOTSPOT OPPDAGET: WASHINGTON.');
    expect(logEntry.toLowerCase()).not.toContain('no active hotspot detected');

    const idleLog = getHotspotIdleLog();
    expect(idleLog.toLowerCase()).not.toContain('no active hotspot detected');
    expect(idleLog).toContain('Ingen hotspot-signaler');
  });
});
