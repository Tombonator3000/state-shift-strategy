import { describe, expect, it } from 'bun:test';

import { applyEffectsMvp } from '@/engine/applyEffects-mvp';
import type { Card, GameState, PlayerId, PlayerState } from '@/mvp/validator';

const createPlayer = (id: PlayerId, faction: PlayerState['faction']): PlayerState => ({
  id,
  faction,
  deck: [],
  hand: [],
  discard: [],
  ip: 10,
  states: [],
});

const createGameState = (): GameState => ({
  turn: 1,
  currentPlayer: 'P1',
  truth: 50,
  players: {
    P1: createPlayer('P1', 'truth'),
    P2: createPlayer('P2', 'government'),
  },
  pressureByState: {},
  stateDefense: {},
  playsThisTurn: 0,
  turnPlays: [],
  log: [],
});

describe('MEDIA resolution (MVP)', () => {
  it('applies multipliers symmetrically for government plays', () => {
    const truthCard: Card = {
      id: 'truth-broadcast',
      name: 'Truth Broadcast',
      type: 'MEDIA',
      faction: 'truth',
      rarity: 'common',
      cost: 1,
      effects: { truthDelta: 4 },
    };

    const governmentCard: Card = {
      id: 'gov-broadcast',
      name: 'Government Broadcast',
      type: 'MEDIA',
      faction: 'government',
      rarity: 'common',
      cost: 1,
      effects: { truthDelta: 4 },
    };

    const multiplier = 1.75;
    const initialTruth = 50;

    const truthState = createGameState();
    applyEffectsMvp(truthState, 'P1', truthCard, undefined, { truthMultiplier: multiplier });
    const truthDelta = truthState.truth - initialTruth;

    const governmentState = createGameState();
    applyEffectsMvp(governmentState, 'P2', governmentCard, undefined, { truthMultiplier: multiplier });
    const governmentDelta = governmentState.truth - initialTruth;

    expect(truthDelta).toBeGreaterThan(0);
    expect(governmentDelta).toBeLessThan(0);
    expect(governmentDelta).toBe(-truthDelta);

    const bonusLog = governmentState.log.at(-1) ?? '';
    const baseDelta = -Math.abs(governmentCard.effects.truthDelta);
    const scaled = Math.round(Math.abs(baseDelta) * multiplier);
    const expectedDelta = baseDelta >= 0 ? scaled : -scaled;
    const expectedBonus = expectedDelta - baseDelta;

    expect(bonusLog).toContain(`amplifies MEDIA truth swing by ${expectedBonus}`);
    expect(bonusLog).toContain('(x1.75)');
  });
});
