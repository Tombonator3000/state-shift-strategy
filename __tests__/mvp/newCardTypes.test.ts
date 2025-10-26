import { canPlay, endTurn, playCard } from '@/mvp/engine';
import type { Card, GameState } from '@/mvp/validator';

const createBaseState = (): GameState => ({
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
  },
  pressureByState: {},
  stateDefense: {},
  playsThisTurn: 0,
  turnPlays: [],
  log: [],
  headlineLog: [],
  extraExtraFeed: [],
  turnBuffer: [],
  traps: [],
  persistentEffects: [],
  winner: null,
  victoryType: null,
  finalEdition: null,
  tabloidRelicsRuntime: null,
});

describe('Hybrid cards', () => {
  it('recalculates cost based on hybrid conditions and records metadata', () => {
    const state = createBaseState();
    state.truth = 70;
    state.players.P1.ip = 6;

    const hybridCard: Card = {
      id: 'hybrid-001',
      name: 'Directive Flex',
      type: 'HYBRID',
      faction: 'truth',
      rarity: 'rare',
      cost: 5,
      effects: { truthDelta: 2 },
      hybridConfig: {
        baseCost: 5,
        conditions: [
          { type: 'truth', operator: '>=', value: 60, costModifier: -2, label: 'Truth discount' },
          {
            type: 'states_controlled',
            operator: '<',
            value: 1,
            costModifier: -1,
            label: 'Desperation rate',
          },
        ],
      },
    };

    state.players.P1.hand = [hybridCard];

    const eligibility = canPlay(state, hybridCard);
    expect(eligibility.ok).toBe(true);
    expect(eligibility.cost).toBe(2);

    const played = playCard(state, hybridCard.id);
    const playEntry = played.turnPlays.find(entry => entry.stage === 'play');

    expect(played.players.P1.ip).toBe(4);
    expect(played.truth).toBe(72);
    expect(playEntry?.metadata).toMatchObject({ hybridCost: 2 });
    expect(playEntry?.metadata?.hybridConditions).toEqual([
      'Truth discount',
      'Desperation rate',
    ]);
  });
});

describe('Trap cards', () => {
  it('defers resolution until the trigger fires and clears after activation', () => {
    const state = createBaseState();
    const trapCard: Card = {
      id: 'trap-001',
      name: 'Tripwire Memo',
      type: 'TRAP',
      faction: 'truth',
      rarity: 'uncommon',
      cost: 3,
      effects: {},
      trapConfig: {
        triggerOn: 'opponent_attack',
        effects: { ipDelta: { opponent: -2 } },
        label: 'Snare',
        revealMessage: 'Trap sprung! Countermeasures deployed.',
      },
    };

    state.players.P1.hand = [trapCard];

    const afterTrap = playCard(state, trapCard.id);
    expect(afterTrap.traps).toHaveLength(1);
    expect(afterTrap.players.P1.ip).toBe(7);
    expect(afterTrap.players.P2.ip).toBe(10);

    const attackCard: Card = {
      id: 'attack-001',
      name: 'Direct Assault',
      type: 'ATTACK',
      faction: 'government',
      rarity: 'common',
      cost: 2,
      effects: { ipDelta: { opponent: 3 } },
    };

    const trapTriggeredState = {
      ...afterTrap,
      currentPlayer: 'P2' as const,
      playsThisTurn: 0,
      players: {
        ...afterTrap.players,
        P2: { ...afterTrap.players.P2, hand: [attackCard], ip: 10 },
      },
    } satisfies GameState;

    const afterAttack = playCard(trapTriggeredState, attackCard.id);

    expect(afterAttack.traps).toHaveLength(0);
    expect(afterAttack.players.P2.ip).toBe(6);
    expect(afterAttack.players.P1.ip).toBe(4);
    expect(afterAttack.log.some(entry => entry.includes('Trap sprung!'))).toBe(true);
  });
});

describe('Persistent cards', () => {
  it('ticks each owner turn and resolves on-expire effects', () => {
    const state = createBaseState();
    state.players.P1.ip = 8;

    const persistentCard: Card = {
      id: 'persistent-001',
      name: 'Lingering Broadcast',
      type: 'PERSISTENT',
      faction: 'truth',
      rarity: 'rare',
      cost: 3,
      effects: {},
      persistentConfig: {
        duration: 2,
        perTurnEffect: { truthDelta: 1 },
        onExpire: { ipDelta: { self: 2 } },
        label: 'Signal Echo',
      },
    };

    state.players.P1.hand = [persistentCard];

    const afterPlay = playCard(state, persistentCard.id);
    expect(afterPlay.persistentEffects).toHaveLength(1);
    expect(afterPlay.persistentEffects[0]?.remaining).toBe(2);
    expect(afterPlay.players.P1.ip).toBe(5);
    expect(afterPlay.truth).toBe(50);

    const afterP1End = endTurn(afterPlay, []).state;
    expect(afterP1End.truth).toBe(50);
    expect(afterP1End.persistentEffects[0]?.remaining).toBe(2);

    const afterP2End = endTurn(afterP1End, []).state;
    expect(afterP2End.truth).toBe(51);
    expect(afterP2End.persistentEffects[0]?.remaining).toBe(1);

    const afterCycle = endTurn(afterP2End, []).state;
    const afterFinalTick = endTurn(afterCycle, []).state;

    expect(afterFinalTick.truth).toBe(52);
    expect(afterFinalTick.players.P1.ip).toBe(7);
    expect(afterFinalTick.persistentEffects).toHaveLength(0);
    expect(afterFinalTick.log.some(entry => entry.includes('Signal Echo: expired'))).toBe(true);
  });
});
