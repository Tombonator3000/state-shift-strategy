import { afterAll, beforeEach, describe, expect, it, mock } from 'bun:test';
import * as actualFrontendNewsPools from '../../src/news/newsPools';
import type { Card, GameState } from '../../src/mvp/validator';
import type { TurnLog, PlayedLite } from '../../src/news/types';
import type * as ApplyEffectsModule from '../../src/engine/applyEffects-mvp';
import type * as ComboEngineModule from '../../src/game/comboEngine';

// The preload (bunfig.toml -> __tests__/__setup__/preload.ts) stashes the
// genuine modules on globalThis BEFORE any test file installs bun:test module
// mocks. We pull them back here so our delegating mock can fall through to the
// real implementations once the toggle flips off — without that, mock.module
// pollution from this file would silently neutralise applyEffectsMvp /
// comboEngine in every later test file.
const TEST_REAL_MODULES = (globalThis as typeof globalThis & {
  __TEST_REAL_MODULES__?: { applyEffectsMvp: typeof ApplyEffectsModule; comboEngine: typeof ComboEngineModule };
}).__TEST_REAL_MODULES__;

if (!TEST_REAL_MODULES) {
  throw new Error('Test preload did not stash real modules. Check bunfig.toml preload setup.');
}

const realApplyEffectsMvp = TEST_REAL_MODULES.applyEffectsMvp;
const realComboEngine = TEST_REAL_MODULES.comboEngine;

const stubPools = {
  mastheads: ['Test Masthead'],
  ads: ['Ad A', 'Ad B', 'Ad C'],
  subheads: {
    generic: ['Generic Sub'],
    attack: ['Attack Sub'],
    media: ['Media Sub'],
    zone: ['Zone Sub'],
  },
  bylines: ['Byline'],
  sources: ['Source'],
  attackVerbs: ['EXPOSE'],
  mediaVerbs: ['AMPLIFIES'],
  zoneVerbs: ['SURGES'],
  weather: ['Calm Skies'],
} as const;

const createMockFn = <Args extends unknown[], Return>(
  implementation: (...args: Args) => Return,
) => {
  const fn = ((...args: Args) => {
    fn.mock.calls.push(args);
    return fn.mock.impl(...args);
  }) as ((...args: Args) => Return) & {
    mock: { calls: Args[]; impl: (...innerArgs: Args) => Return };
    mockImplementation: (impl: (...innerArgs: Args) => Return) => void;
    mockReset: () => void;
  };

  fn.mock = { calls: [] as Args[], impl: implementation };
  fn.mockImplementation = (impl: (...innerArgs: Args) => Return) => {
    fn.mock.impl = impl;
  };
  fn.mockReset = () => {
    fn.mock.calls = [];
    fn.mock.impl = implementation;
  };

  return fn;
};

const getPoolsMock = createMockFn(() => stubPools);
const getPoolsIfReadyMock = createMockFn(() => stubPools);

mock.module('@/news/newsPools', () => ({
  ...actualFrontendNewsPools,
  getPools: getPoolsMock,
  getPoolsIfReady: getPoolsIfReadyMock,
}));

// bun:test's `mock.module` registrations persist for the entire test process —
// re-mocking with the original module from `afterAll` does not re-trigger
// resolution in test files that have already been evaluated. To avoid
// polluting other test files (notably src/mvp/__tests__/engine.editors.test.ts
// and __tests__/game/newCardTypes.test.ts) we install a controllable bypass:
// the mock factory delegates to the real module (captured by the bun:test
// preload) unless the toggle is enabled, and the toggle is only enabled while
// this file's tests are running.
let useApplyEffectsStub = false;
let useComboEngineStub = false;

mock.module('@/engine/applyEffects-mvp', () => ({
  ...realApplyEffectsMvp,
  applyEffectsMvp: (...args: Parameters<typeof realApplyEffectsMvp.applyEffectsMvp>) =>
    useApplyEffectsStub ? args[0] : realApplyEffectsMvp.applyEffectsMvp(...args),
  tickPersistentEffects: (...args: Parameters<typeof realApplyEffectsMvp.tickPersistentEffects>) =>
    useApplyEffectsStub ? undefined : realApplyEffectsMvp.tickPersistentEffects(...args),
}));

mock.module('@/game/comboEngine', () => ({
  ...realComboEngine,
  applyComboRewards: (...args: Parameters<typeof realComboEngine.applyComboRewards>) =>
    useComboEngineStub ? args[0] : realComboEngine.applyComboRewards(...args),
  evaluateCombos: (...args: Parameters<typeof realComboEngine.evaluateCombos>) =>
    useComboEngineStub ? { results: [], totalReward: {}, logs: [] } : realComboEngine.evaluateCombos(...args),
  getComboSettings: (...args: Parameters<typeof realComboEngine.getComboSettings>) =>
    useComboEngineStub
      ? { enabled: false, fxEnabled: false, comboToggles: {}, maxCombosPerTurn: 0 }
      : realComboEngine.getComboSettings(...args),
  formatComboReward: (...args: Parameters<typeof realComboEngine.formatComboReward>) =>
    useComboEngineStub ? '' : realComboEngine.formatComboReward(...args),
}));

afterAll(() => {
  useApplyEffectsStub = false;
  useComboEngineStub = false;
});

const loadMvpEngine = () => import('../../src/mvp/engine');
const loadHeadlineEngine = () => import('../../src/news/headlineEngine');
const loadCompositeUtils = () => import('../../src/utils/compositeStory');
const loadCompositeComposer = () => import('../../src/systems/news/absurdComposer');

beforeEach(() => {
  getPoolsMock.mockReset();
  getPoolsIfReadyMock.mockReset();
  getPoolsMock.mockImplementation(() => stubPools);
  getPoolsIfReadyMock.mockImplementation(() => stubPools);
  useApplyEffectsStub = true;
  useComboEngineStub = true;
});

const createCard = (id: string, faction: 'truth' | 'government', truthDelta: number): Card => ({
  id,
  name: `Card ${id}`,
  type: 'MEDIA',
  faction,
  rarity: 'common',
  cost: 0,
  text: '',
  effects: { truthDelta },
});

describe('extra extra integration', () => {
  it('appends a headline + subhead after three plays in a turn', async () => {
    const { playCard, endTurn } = await loadMvpEngine();
    const { summarize, generateExtraExtra, evaluateExtraExtra } = await loadHeadlineEngine();
    const { computeCompositeStorySeed, resolveCompositeFaction, filterPlayableArticleIds } = await loadCompositeUtils();
    const { composeCompositeStory } = await loadCompositeComposer();

    const cards = [
      createCard('alpha', 'truth', 2),
      createCard('bravo', 'truth', 2),
      createCard('charlie', 'truth', 2),
    ];

    let state: GameState = {
      turn: 1,
      currentPlayer: 'P1',
      truth: 50,
      players: {
        P1: {
          id: 'P1',
          faction: 'truth',
          deck: [],
          hand: [...cards],
          discard: [],
          ip: 0,
          states: [],
        },
        P2: {
          id: 'P2',
          faction: 'government',
          deck: [],
          hand: [],
          discard: [],
          ip: 0,
          states: [],
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
      finalEdition: null,
      tabloidRelicsRuntime: null,
    };

    for (const card of cards) {
      state = playCard(state, card.id);
    }

    const pendingLog: TurnLog = {
      round: state.turn,
      turn: state.turn,
      plays: state.turnBuffer,
    };
    const evaluation = evaluateExtraExtra(state.turnBuffer, { seed: 'mvp:P1:1' });
    expect(evaluation.trigger).toBe(true);
    const focusLog: TurnLog = { ...pendingLog, plays: evaluation.focusPlays };
    const totals = summarize([focusLog]);
    const expectedArticle = generateExtraExtra('mvp:P1:1', [focusLog], totals, evaluation);

    const playedArticleIds = filterPlayableArticleIds(state.turnBuffer.map(play => play.id));
    const storySeed = computeCompositeStorySeed({
      baseSeed: 0,
      round: state.turn,
      turn: state.turn,
      actor: 'human',
      ids: playedArticleIds,
    });
    const faction = resolveCompositeFaction('truth', 'human');
    const expectedStory = composeCompositeStory(playedArticleIds, faction, storySeed);

    const { state: endedState } = endTurn(state, []);

    expect(endedState.extraExtraFeed).toEqual([
      { kind: 'composite', data: expectedStory },
      { kind: 'article', data: expectedArticle },
    ]);
    expect(endedState.headlineLog).toEqual([expectedStory]);
    expect(endedState.truth).toBe(53);
    expect(endedState.extraExtraFeed[1]?.data.tone).toBe(expectedArticle.tone);
  });

  it('falls back to a placeholder headline when pools are unavailable', async () => {
    const originalWarn = console.warn;
    const warnings: unknown[][] = [];
    console.warn = (...args: unknown[]) => {
      warnings.push(args);
    };
    getPoolsIfReadyMock.mockImplementation(() => null);
    getPoolsMock.mockImplementation(() => {
      throw new Error('getPools should not be called when pools are unavailable');
    });

    try {
      const { playCard, endTurn } = await loadMvpEngine();
      const { summarize, generateExtraExtra, evaluateExtraExtra } = await loadHeadlineEngine();
      const { computeCompositeStorySeed, resolveCompositeFaction, filterPlayableArticleIds } = await loadCompositeUtils();
      const { composeCompositeStory } = await loadCompositeComposer();

      const cards = [
        createCard('delta', 'truth', 2),
        createCard('echo', 'truth', 2),
        createCard('foxtrot', 'truth', 2),
      ];

      let state: GameState = {
        turn: 1,
        currentPlayer: 'P1',
        truth: 50,
        players: {
          P1: {
            id: 'P1',
            faction: 'truth',
            deck: [],
            hand: [...cards],
            discard: [],
            ip: 0,
            states: [],
          },
          P2: {
            id: 'P2',
            faction: 'government',
            deck: [],
            hand: [],
            discard: [],
            ip: 0,
            states: [],
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
        finalEdition: null,
        tabloidRelicsRuntime: null,
      };

      for (const card of cards) {
        state = playCard(state, card.id);
      }

      const pendingLog: TurnLog = {
        round: state.turn,
        turn: state.turn,
        plays: state.turnBuffer,
      };
      const evaluation = evaluateExtraExtra(state.turnBuffer, { seed: 'mvp:P1:1' });
      expect(evaluation.trigger).toBe(true);
      const focusLog: TurnLog = { ...pendingLog, plays: evaluation.focusPlays };
      const totals = summarize([focusLog]);
      const expectedArticle = generateExtraExtra('mvp:P1:1', [focusLog], totals, evaluation);

      const playedArticleIds = filterPlayableArticleIds(state.turnBuffer.map(play => play.id));
      const storySeed = computeCompositeStorySeed({
        baseSeed: 0,
        round: state.turn,
        turn: state.turn,
        actor: 'human',
        ids: playedArticleIds,
      });
      const faction = resolveCompositeFaction('truth', 'human');
      const expectedStory = composeCompositeStory(playedArticleIds, faction, storySeed);

      const { state: endedState } = endTurn(state, []);

      expect(endedState.extraExtraFeed).toEqual([
        { kind: 'composite', data: expectedStory },
        { kind: 'article', data: expectedArticle },
      ]);
      expect(endedState.extraExtraFeed[1]?.data.hed).toContain('[WIRE DELAY]');
      expect(endedState.headlineLog).toEqual([expectedStory]);
      expect(endedState.truth).toBe(53);
      expect(warnings.length).toBeGreaterThan(0);
    } finally {
      console.warn = originalWarn;
    }
  });

  it('awards extra extra to the faction with the highest-value triple play', async () => {
    const { endTurn } = await loadMvpEngine();
    const { summarize, generateExtraExtra, evaluateExtraExtra } = await loadHeadlineEngine();
    const { computeCompositeStorySeed, resolveCompositeFaction, filterPlayableArticleIds } = await loadCompositeUtils();
    const { composeCompositeStory } = await loadCompositeComposer();

    const plays: PlayedLite[] = [
      { id: 't1', name: 'Truth Pulse', type: 'MEDIA', faction: 'truth', truth: 2 },
      { id: 'g1', name: 'Gov Silence', type: 'MEDIA', faction: 'government', truth: -4 },
      { id: 't2', name: 'Truth Echo', type: 'MEDIA', faction: 'truth', truth: 1 },
      { id: 'g2', name: 'Gov Clampdown', type: 'MEDIA', faction: 'government', truth: -3 },
      { id: 't3', name: 'Truth Finale', type: 'MEDIA', faction: 'truth', truth: 3 },
      { id: 'g3', name: 'Gov Sweep', type: 'MEDIA', faction: 'government', truth: -5 },
    ];

    const pendingLog: TurnLog = {
      round: 1,
      turn: 1,
      plays,
    };

    const evaluation = evaluateExtraExtra(plays, { seed: 'mvp:P1:1' });
    expect(evaluation.trigger).toBe(true);
    expect(evaluation.winningFaction).toBe('government');

    const focusLog: TurnLog = { ...pendingLog, plays: evaluation.focusPlays };
    const totals = summarize([focusLog]);
    const expectedArticle = generateExtraExtra('mvp:P1:1', [focusLog], totals, evaluation);

    const state: GameState = {
      turn: 1,
      currentPlayer: 'P1',
      truth: 50,
      players: {
        P1: {
          id: 'P1',
          faction: 'truth',
          deck: [],
          hand: [],
          discard: [],
          ip: 0,
          states: [],
        },
        P2: {
          id: 'P2',
          faction: 'government',
          deck: [],
          hand: [],
          discard: [],
          ip: 0,
          states: [],
        },
      },
      pressureByState: {},
      stateDefense: {},
      playsThisTurn: 0,
      turnPlays: [],
      log: [],
      headlineLog: [],
      extraExtraFeed: [],
      turnBuffer: plays,
      winner: null,
      victoryType: null,
      finalEdition: null,
      tabloidRelicsRuntime: null,
    };

    const playedArticleIds = filterPlayableArticleIds(state.turnBuffer.map(play => play.id));
    const storySeed = computeCompositeStorySeed({
      baseSeed: 0,
      round: state.turn,
      turn: state.turn,
      actor: 'human',
      ids: playedArticleIds,
    });
    const faction = resolveCompositeFaction('truth', 'human');
    const expectedStory = composeCompositeStory(playedArticleIds, faction, storySeed);

    const { state: endedState } = endTurn(state, []);

    expect(endedState.extraExtraFeed).toEqual([
      { kind: 'composite', data: expectedStory },
      { kind: 'article', data: expectedArticle },
    ]);
    expect(endedState.extraExtraFeed[1]?.data.tone).toBe(expectedArticle.tone);
    expect(endedState.truth).toBe(47);
    expect(endedState.headlineLog).toEqual([expectedStory]);
  });
});
