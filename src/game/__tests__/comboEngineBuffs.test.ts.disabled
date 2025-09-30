import { beforeEach, describe, expect, it } from 'bun:test';

import { applyEffectsMvp } from '@/engine/applyEffects-mvp';
import { applyComboRewards, evaluateCombos, setComboSettings } from '@/game/comboEngine';
import { COMBO_DEFINITIONS, DEFAULT_COMBO_SETTINGS } from '@/game/combo.config';
import type { ComboOptions, TurnPlay } from '@/game/combo.types';
import type { Card, GameState, PlayerId, PlayerState } from '@/mvp/validator';

type MutableGameState = GameState & { players: Record<PlayerId, PlayerState> };

const basePlayer = (id: PlayerId): PlayerState => ({
  id,
  faction: id === 'P1' ? 'truth' : 'government',
  deck: [],
  hand: [],
  discard: [],
  ip: 10,
  states: [],
});

const createState = (plays: TurnPlay[]): MutableGameState => ({
  turn: 1,
  currentPlayer: 'P1',
  truth: 50,
  players: {
    P1: { ...basePlayer('P1') },
    P2: { ...basePlayer('P2') },
  },
  pressureByState: {},
  stateDefense: {},
  playsThisTurn: plays.length,
  turnPlays: plays,
  log: [],
});

let sequence = 0;

const makePlay = (cardType: TurnPlay['cardType'], cost: number): TurnPlay => {
  sequence += 1;
  return {
    sequence,
    stage: 'resolve',
    owner: 'P1',
    cardId: `card-${sequence}`,
    cardName: `${cardType}-${sequence}`,
    cardType,
    cardRarity: 'common',
    cost,
  } satisfies TurnPlay;
};

const enableOnly = (ids: string[]): ComboOptions => {
  const toggles = Object.fromEntries(COMBO_DEFINITIONS.map(def => [def.id, ids.includes(def.id)]));
  return {
    enabled: true,
    fxEnabled: false,
    maxCombosPerTurn: DEFAULT_COMBO_SETTINGS.maxCombosPerTurn,
    comboToggles: toggles,
  };
};

const attackCard: Card = {
  id: 'attack-card',
  name: 'Test Strike',
  type: 'ATTACK',
  faction: 'truth',
  rarity: 'common',
  cost: 2,
  effects: { ipDelta: { opponent: 3 } },
};

describe('comboEngine next attack multiplier rewards', () => {
  beforeEach(() => {
    sequence = 0;
    setComboSettings({
      ...DEFAULT_COMBO_SETTINGS,
      comboToggles: { ...DEFAULT_COMBO_SETTINGS.comboToggles },
    });
  });

  it('stores the next attack multiplier on the player when the combo triggers', () => {
    const plays: TurnPlay[] = [
      makePlay('ATTACK', 3),
      makePlay('ATTACK', 3),
      makePlay('ATTACK', 3),
    ];
    const state = createState(plays);

    const evaluation = evaluateCombos(state, 'P1', enableOnly(['sequence_attack_blitz']));
    applyComboRewards(state, 'P1', evaluation);

    expect(state.players.P1.nextAttackMultiplier).toBe(2);
    expect(state.log).toContain('Attack Blitz primes your next strike for double damage.');
  });

  it('multiplies the next attack damage and clears the buff afterwards', () => {
    const plays: TurnPlay[] = [
      makePlay('ATTACK', 3),
      makePlay('ATTACK', 3),
      makePlay('ATTACK', 3),
    ];
    const state = createState(plays);

    const evaluation = evaluateCombos(state, 'P1', enableOnly(['sequence_attack_blitz']));
    applyComboRewards(state, 'P1', evaluation);

    expect(state.players.P2.ip).toBe(10);

    applyEffectsMvp(state, 'P1', attackCard);

    expect(state.players.P2.ip).toBe(4);
    expect(state.players.P1.nextAttackMultiplier).toBeUndefined();
    expect(state.log[state.log.length - 1]).toContain('combo x2');
  });

  it('does not stack the attack multiplier beyond the highest pending reward', () => {
    const plays: TurnPlay[] = [
      makePlay('ATTACK', 3),
      makePlay('ATTACK', 3),
      makePlay('ATTACK', 3),
    ];
    const state = createState(plays);

    const evaluation = evaluateCombos(state, 'P1', enableOnly(['sequence_attack_blitz']));
    applyComboRewards(state, 'P1', evaluation);

    const secondEvaluation = evaluateCombos(state, 'P1', enableOnly(['sequence_attack_blitz']));
    applyComboRewards(state, 'P1', secondEvaluation);

    expect(state.players.P1.nextAttackMultiplier).toBe(2);
  });
});
