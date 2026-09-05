import { HotspotDirector } from '@/systems/paranormalHotspots';
import type { GameState } from '@/hooks/gameStateTypes';
import { USA_STATES } from '@/data/usaStates';

const createGameState = (): Pick<GameState, 'states' | 'paranormalHotspots'> => ({
  states: USA_STATES.map(state => ({
    id: state.id,
    name: state.name,
    abbreviation: state.abbreviation,
    defense: state.defense,
    baseDefense: state.defense,
    baseIP: state.baseIP,
    pressure: 0,
    pressurePlayer: 0,
    pressureAi: 0,
    owner: 'neutral',
    contested: false,
    stateEventHistory: [],
    roundEvents: [],
    paranormalHotspot: undefined,
    paranormalHotspotHistory: [],
  })),
  paranormalHotspots: {},
});

describe('HotspotDirector initialization', () => {
  it('hydrates caches and lifecycle timing', () => {
    const director = new HotspotDirector();
    director.initialize();
    const snapshot = director.getInitializationSnapshot();

    expect(snapshot.initialized).toBe(true);
    expect(snapshot.spawnRate).toBeGreaterThan(0);
    expect(snapshot.cryptidHomeCount).toBeGreaterThan(0);
    expect(snapshot.candidateCount).toBeGreaterThan(0);
    expect(snapshot.cachedWeightEntries).toBeGreaterThan(0);
    expect(snapshot.lifecycleIntervalMs).toBeGreaterThanOrEqual(750);

    director.teardown();
  });

  it('respects spawn rate gating when rolling for hotspots', () => {
    const director = new HotspotDirector();
    director.initialize();
    const snapshot = director.getInitializationSnapshot();
    const gameState = createGameState();

    const failRoll = director.rollForSpawn(1, gameState, {
      rng: () => snapshot.spawnRate,
    });
    expect(failRoll).toBeNull();

    const successRollValue = snapshot.spawnRate > 0
      ? Math.max(0, snapshot.spawnRate - 0.05)
      : 0;
    const successRoll = director.rollForSpawn(1, gameState, {
      rng: () => successRollValue,
    });

    if (snapshot.spawnRate > 0) {
      expect(successRoll).not.toBeNull();
    } else {
      expect(successRoll).toBeNull();
    }

    director.teardown();
  });
});
