import { beforeEach, describe, expect, it, mock } from 'bun:test';
import type { Card, GameState } from '../../src/mvp/validator';
import type { TurnLog } from '../../src/news/headlineEngine';

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

const createCard = (id: string): Card => ({
  id,
  name: `Card ${id}`,
  type: 'MEDIA',
  faction: 'truth',
  rarity: 'common',
  cost: 0,
  text: '',
  effects: { truthDelta: 2 },
});

describe('extra extra integration', () => {
  it('appends a headline + subhead after three plays in a turn', async () => {
    const { playCard, endTurn } = await loadMvpEngine();
    const { summarize, generateExtraExtra } = await loadHeadlineEngine();

    const cards = [createCard('alpha'), createCard('bravo'), createCard('charlie')];

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
    const totals = summarize([pendingLog]);
    const expectedArticle = generateExtraExtra('mvp:P1:1', [pendingLog], totals);

    const { state: endedState } = endTurn(state, []);

    expect(endedState.extraExtraFeed).toEqual([expectedArticle]);
    expect(endedState.headlineLog).toEqual([
      'Turn 1 recap: Truth plays 3, Government plays 0',
    ]);
  });

  it('falls back to a placeholder headline when pools are unavailable', async () => {
    const warnMock = mock.method(console, 'warn');
    getPoolsIfReadyMock.mockImplementation(() => null);
    getPoolsMock.mockImplementation(() => {
      throw new Error('getPools should not be called when pools are unavailable');
    });

    try {
      const { playCard, endTurn } = await loadMvpEngine();
      const { summarize, generateExtraExtra } = await loadHeadlineEngine();

      const cards = [createCard('delta'), createCard('echo'), createCard('foxtrot')];

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
      const totals = summarize([pendingLog]);
      const expectedArticle = generateExtraExtra('mvp:P1:1', [pendingLog], totals);

      const { state: endedState } = endTurn(state, []);

      expect(endedState.extraExtraFeed).toEqual([expectedArticle]);
      expect(endedState.extraExtraFeed[0]?.hed).toContain('[WIRE DELAY]');
      expect(endedState.headlineLog).toEqual([
        'Turn 1 recap: Truth plays 3, Government plays 0',
      ]);
      expect(warnMock.mock.calls.length).toBeGreaterThan(0);
    } finally {
      warnMock.mockRestore();
    }
  });
});
