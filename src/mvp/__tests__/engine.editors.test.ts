import { startTurn, canPlay, playCard } from '@/mvp/engine';
import { applyEffectsMvp } from '@/engine/applyEffects-mvp';
import type { Card, GameState } from '@/mvp/validator';

type PartialState = Partial<GameState> & {
  players?: Partial<GameState['players']>;
};

const createCard = (overrides: Partial<Card>): Card => ({
  id: 'test-card',
  name: 'Test Card',
  type: 'MEDIA',
  faction: 'truth',
  rarity: 'common',
  cost: 0,
  text: '',
  effects: { truthDelta: 0, ipDelta: { opponent: 0 }, pressureDelta: 0 },
  ...overrides,
});

const createState = (overrides: PartialState = {}): GameState => {
  const basePlayers: GameState['players'] = {
    P1: {
      id: 'P1',
      faction: 'truth',
      deck: [],
      hand: [],
      discard: [],
      ip: 10,
      states: [],
      activeEditorId: null,
    },
    P2: {
      id: 'P2',
      faction: 'government',
      deck: [],
      hand: [],
      discard: [],
      ip: 10,
      states: [],
      activeEditorId: null,
    },
  };

  return {
    turn: 1,
    currentPlayer: 'P1',
    truth: 50,
    playsThisTurn: 0,
    turnPlays: [],
    turnBuffer: [],
    log: [],
    headlineLog: [],
    extraExtraFeed: [],
    winner: null,
    victoryType: null,
    finalEdition: null,
    pressureByState: {},
    stateDefense: {},
    tabloidRelicsRuntime: null,
    ...overrides,
    players: {
      P1: { ...basePlayers.P1, ...(overrides.players?.P1 ?? {}) },
      P2: { ...basePlayers.P2, ...(overrides.players?.P2 ?? {}) },
    },
  };
};

describe('editor runtime modifiers', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('applies Fox Muldrunk media truth bonus', () => {
    const mediaCard = createCard({
      id: 'media-1',
      type: 'MEDIA',
      cost: 2,
      effects: { truthDelta: 2 },
    });
    const state = createState({
      truth: 50,
      players: {
        P1: {
          hand: [mediaCard],
          activeEditorId: 'editor_muldrunk',
        },
      },
    });

    const beforeTruth = state.truth;
    applyEffectsMvp(state, 'P1', mediaCard);

    expect(state.truth - beforeTruth).toBe(3);
    expect(state.log.some(entry => entry.includes('Fox Muldrunk'))).toBe(true);
  });

  it('increases attack cost for Hunter S. Tabloid', () => {
    const attackCard = createCard({
      id: 'attack-1',
      name: 'Test Attack',
      type: 'ATTACK',
      cost: 3,
      effects: { ipDelta: { opponent: 3 } },
    });
    const baseState = createState({
      players: {
        P1: {
          hand: [attackCard],
          ip: 5,
          activeEditorId: 'editor_hunter',
        },
      },
    });

    const eligibility = canPlay(baseState, attackCard);
    expect(eligibility.ok).toBe(true);
    expect(eligibility.cost).toBe(4);

    const updated = playCard(baseState, attackCard.id);
    expect(updated.players.P1.ip).toBe(1);
  });

  it('triggers Florida Man discard chance at turn start', () => {
    const hand = [
      createCard({ id: 'c1', type: 'MEDIA', effects: { truthDelta: 1 } }),
      createCard({ id: 'c2', type: 'MEDIA', effects: { truthDelta: 1 } }),
    ];
    const state = createState({
      players: {
        P1: {
          hand,
          deck: [],
          discard: [],
          activeEditorId: 'editor_floridaman',
        },
      },
    });

    jest.spyOn(Math, 'random').mockReturnValue(0.05);

    const updated = startTurn(state);

    expect(updated.players.P1.hand.length).toBe(1);
    expect(updated.players.P1.discard.length).toBe(1);
    expect(updated.log.some(entry => entry.includes('Florida Man'))).toBe(true);
  });

  it('adds Agent Smitherson IP income bonus', () => {
    const state = createState({
      players: {
        P1: {
          hand: new Array<Card>(5).fill(
            createCard({ id: 'h1', type: 'MEDIA', effects: { truthDelta: 0 } }),
          ),
          deck: [],
          ip: 0,
          activeEditorId: 'editor_smitherson',
        },
      },
    });

    const updated = startTurn(state);
    expect(updated.players.P1.ip).toBe(6);
    expect(updated.log.some(entry => entry.includes('Agent Smitherson'))).toBe(true);
  });

  it('applies Bat Boy Jr. zone pressure bonus', () => {
    const zoneCard = createCard({
      id: 'zone-1',
      name: 'Test Zone',
      type: 'ZONE',
      cost: 4,
      effects: { pressureDelta: 1 },
      target: { scope: 'state', count: 1 },
    });
    const state = createState({
      players: {
        P1: {
          activeEditorId: 'editor_batboy',
        },
      },
      pressureByState: { CA: { P1: 0, P2: 0 } },
      stateDefense: { CA: 99 },
    });

    applyEffectsMvp(state, 'P1', zoneCard, 'CA');
    expect(state.pressureByState.CA.P1).toBe(2);
    expect(state.log.some(entry => entry.includes('Bat Boy Jr.'))).toBe(true);
  });
});
