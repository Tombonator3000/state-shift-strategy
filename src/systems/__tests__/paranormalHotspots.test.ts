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

const makeRng = (...values: number[]) => {
  let index = 0;
  const last = values.length > 0 ? values[values.length - 1] : 0;
  return () => {
    const value = index < values.length ? values[index] : last;
    index += 1;
    return value;
  };
};

describe('HotspotDirector spawn simulation', () => {
  it('honors spawn rate gating and surfaces catalog metadata', () => {
    const director = new HotspotDirector();
    const gameState = createGameState();
    gameState.states = gameState.states
      .filter(state => state.abbreviation === 'CA') as unknown as GameState['states'];

    const catalogEntry = hotspotsCatalog.hotspots.find(entry => entry.id === 'baseline:ca:silicon-seance');
    const rng = makeRng(0.5, 0.01, 0.2);

    expect(director.rollForSpawn(1, gameState, { rng, enabledExpansions: [] })).toBeNull();

    const candidate = director.rollForSpawn(2, gameState, { rng, enabledExpansions: [] });
    expect(candidate).not.toBeNull();
    expect(candidate?.name).toBe(catalogEntry?.name);
    expect(candidate?.summary).toBe(catalogEntry?.summary ?? catalogEntry?.location);
    expect(candidate?.kind).toBe('normal');
    expect(candidate?.icon).toBe('👻');
    expect(candidate?.truthRewardHint ?? 0).toBeGreaterThan(0);
    expect(candidate?.tags).toContain('auto-spawn');
    expect(candidate?.weightBreakdown).toMatchObject({
      base: expect.any(Number),
      catalog: expect.any(Number),
      type: expect.any(Number),
    });
  });

  it('requires enabled expansions for gated catalog entries and applies themed icons', () => {
    const director = new HotspotDirector();
    const cryptidGameState = createGameState();
    cryptidGameState.states = cryptidGameState.states
      .filter(state => state.abbreviation === 'WA') as unknown as GameState['states'];

    const blocked = director.rollForSpawn(1, cryptidGameState, {
      rng: makeRng(0.01),
      enabledExpansions: [],
    });
    expect(blocked).toBeNull();

    const cryptidCandidate = director.rollForSpawn(2, cryptidGameState, {
      rng: makeRng(0.01, 0.2),
      enabledExpansions: ['cryptids'],
    });

    expect(cryptidCandidate).not.toBeNull();
    expect(cryptidCandidate?.tags ?? []).toContain('cryptid-home');
    expect(cryptidCandidate?.icon).toBe('🦶');
    expect(cryptidCandidate?.kind).toBe('cryptid');

    const halloweenConfig = JSON.parse(JSON.stringify(hotspotsConfig)) as typeof hotspotsConfig;
    halloweenConfig.spawn.expansionModifiers = {
      ...halloweenConfig.spawn.expansionModifiers,
      halloween: {
        multiplier: 1.15,
        stateWeights: { TX: 2 },
      },
    };

    const emptyCryptids = { cryptids: [] } as { cryptids: [] };
    const halloweenCatalog = {
      ...hotspotsCatalog,
      hotspots: hotspotsCatalog.hotspots.filter(
        entry => entry.expansionTag === 'halloween' && entry.stateAbbreviation === 'MA',
      ),
    } as typeof hotspotsCatalog;
    const themedDirector = new HotspotDirector(halloweenCatalog, halloweenConfig, emptyCryptids);
    const halloweenGameState = createGameState();
    halloweenGameState.states = halloweenGameState.states
      .filter(state => state.abbreviation === 'MA') as unknown as GameState['states'];

    const halloweenCandidate = themedDirector.rollForSpawn(1, halloweenGameState, {
      rng: makeRng(0.01, 0.2),
      enabledExpansions: ['halloween'],
    });

    expect(halloweenCandidate).not.toBeNull();
    expect(halloweenCandidate?.tags ?? []).toContain('expansion:halloween');
    expect(halloweenCandidate?.icon?.codePointAt(0)).toBe('🎃'.codePointAt(0));
    expect(halloweenCandidate?.kind).toBe('ghost');
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
      kind: 'normal',
      location: 'Washington',
      summary: 'Washington sensors flare.',
      intensity: 6,
      status: 'spawning',
      tags: ['auto-spawn', 'expansion:cryptids', 'cryptid-home'],
      stateId: '53',
      stateName: 'Washington',
      stateAbbreviation: 'WA',
      totalWeight: 2.15,
      weightBreakdown: { base: 1.4, catalog: 0.2, type: 0, expansion: 0.5, cryptid: 0.25 },
      truthDelta: 0,
      truthRewardHint: 5,
    };

    const article = director.buildHotspotExtraArticle(sampleHotspot);
    expect(article.badgeClassName)
      .toBe('bg-slate-950/80 border-slate-500/60 text-slate-200');
    expect(article).toMatchInlineSnapshot(`
      {
        "badgeClassName": "bg-slate-950/80 border-slate-500/60 text-slate-200",
        "badgeLabel": "NORMAL • WASHINGTON",
        "blurb": "Sensorene melder NORMAL-anomali over WASHINGTON. Intensitet 6.",
        "headline": "WASHINGTON PHENOMENON",
        "id": "auto:WA:42:123456789",
        "intensity": 6,
        "kind": "normal",
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
