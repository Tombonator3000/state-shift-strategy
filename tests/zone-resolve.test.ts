import { describe, it, expect } from 'vitest';
import { playCard } from '@/engine/flow';
import { Card, Context, GameState } from '@/engine/types';

function mkCtx(card: Card): Context {
  const s: GameState = {
    turn: 1,
    truth: 50,
    currentPlayer: 'P1',
    players: {
      P1: {
        id: 'P1',
        faction: 'truth',
        deck: [],
        hand: [card],
        discard: [],
        ip: 10,
        zones: [],
        zoneDefenseBonus: 0
      },
      P2: {
        id: 'P2',
        faction: 'government',
        deck: [],
        hand: [],
        discard: [],
        ip: 10,
        zones: [],
        zoneDefenseBonus: 0
      }
    },
    pressureByState: {}
  };
  return { state: s, log: () => {} } as Context;
}

const ZONE_CARD: Card = {
  id: 'TRUTH-EX-Z-UNC-101',
  name: 'County Organizers’ Surge',
  faction: 'truth',
  type: 'ZONE',
  cost: 4,
  rarity: 'uncommon' as any,
  effects: { pressureDelta: 2 }
};

describe('ZONE play removes from hand, adds pressure, moves to discard', () => {
  it('plays on OH', () => {
    const ctx = mkCtx(ZONE_CARD);
    const res = playCard(ctx, 'P1', ZONE_CARD, 'OH');
    expect(res).toBe('played');
    expect(ctx.state.players.P1.hand.length).toBe(0);
    expect(ctx.state.players.P1.discard.length).toBe(1);
    expect(ctx.state.pressureByState['OH'].P1).toBe(2);
  });
});
