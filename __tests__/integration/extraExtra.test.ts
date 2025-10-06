import { beforeEach, describe, expect, it, mock } from 'bun:test';
import type { Card, GameState } from '../../src/mvp/validator';
import type { TurnLog, PlayedLite } from '../../src/news/headlineEngine';

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

const getPoolsMock = mock.fn(() => stubPools);
const getPoolsIfReadyMock = mock.fn(() => stubPools);

mock.module('@/news/newsPools', () => ({
  getPools: getPoolsMock,
  getPoolsIfReady: getPoolsIfReadyMock,
}));

mock.module('@/engine/applyEffects-mvp', () => ({
  applyEffectsMvp: (state: GameState) => state,
}));

mock.module('@/game/comboEngine', () => ({
  applyComboRewards: (state: GameState) => state,
  evaluateCombos: () => ({ results: [], totalReward: {}, logs: [] }),
  getComboSettings: () => ({ enabled: false, fxEnabled: false, comboToggles: {}, maxCombosPerTurn: 0 }),
  formatComboReward: () => '',
}));

const loadMvpEngine = () => import('../../src/mvp/engine');
const loadHeadlineEngine = () => import('../../src/news/headlineEngine');

beforeEach(() => {
  getPoolsMock.mockReset();
  getPoolsIfReadyMock.mockReset();
  getPoolsMock.mockImplementation(() => stubPools);
  getPoolsIfReadyMock.mockImplementation(() => stubPools);
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
    const evaluation = evaluateExtraExtra(state.turnBuffer);
    expect(evaluation.trigger).toBe(true);
    const focusLog: TurnLog = { ...pendingLog, plays: evaluation.focusPlays };
    const totals = summarize([focusLog]);
    const expectedArticle = generateExtraExtra('mvp:P1:1', [focusLog], totals);

    const { state: endedState } = endTurn(state, []);

    expect(endedState.extraExtraFeed).toEqual([expectedArticle]);
    expect(endedState.headlineLog).toEqual([
      'Turn 1 recap: Truth plays 3, Government plays 0',
    ]);
    expect(endedState.truth).toBe(53);
    expect(endedState.extraExtraFeed[0]?.tone).toBe('truth');
  });

  it('falls back to a placeholder headline when pools are unavailable', async () => {
    const warnMock = mock.method(console, 'warn');
    getPoolsIfReadyMock.mockImplementation(() => null);
    getPoolsMock.mockImplementation(() => {
      throw new Error('getPools should not be called when pools are unavailable');
    });

    try {
      const { playCard, endTurn } = await loadMvpEngine();
      const { summarize, generateExtraExtra, evaluateExtraExtra } = await loadHeadlineEngine();

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
      const evaluation = evaluateExtraExtra(state.turnBuffer);
      expect(evaluation.trigger).toBe(true);
      const focusLog: TurnLog = { ...pendingLog, plays: evaluation.focusPlays };
      const totals = summarize([focusLog]);
      const expectedArticle = generateExtraExtra('mvp:P1:1', [focusLog], totals);

      const { state: endedState } = endTurn(state, []);

      expect(endedState.extraExtraFeed).toEqual([expectedArticle]);
      expect(endedState.extraExtraFeed[0]?.hed).toContain('[WIRE DELAY]');
      expect(endedState.headlineLog).toEqual([
        'Turn 1 recap: Truth plays 3, Government plays 0',
      ]);
      expect(endedState.truth).toBe(53);
      expect(warnMock.mock.calls.length).toBeGreaterThan(0);
    } finally {
      warnMock.mockRestore();
    }
  });

  it('awards extra extra to the faction with the highest-value triple play', async () => {
    const { endTurn } = await loadMvpEngine();
    const { summarize, generateExtraExtra, evaluateExtraExtra } = await loadHeadlineEngine();

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

    const evaluation = evaluateExtraExtra(plays);
    expect(evaluation.trigger).toBe(true);
    expect(evaluation.winningFaction).toBe('government');

    const focusLog: TurnLog = { ...pendingLog, plays: evaluation.focusPlays };
    const totals = summarize([focusLog]);
    const expectedArticle = generateExtraExtra('mvp:P1:1', [focusLog], totals);

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

    const { state: endedState } = endTurn(state, []);

    expect(endedState.extraExtraFeed).toEqual([expectedArticle]);
    expect(endedState.extraExtraFeed[0]?.tone).toBe('government');
    expect(endedState.truth).toBe(47);
    expect(endedState.headlineLog).toEqual([
      'Turn 1 recap: Truth plays 3, Government plays 3',
    ]);
  });
});
