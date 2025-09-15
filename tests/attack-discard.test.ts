import { describe, it, expect } from 'vitest';
import { playCard } from '@/engine/flow';
import { Context, GameState, Card } from '@/engine/types';

function mkCtx(p1:Card[], p2:Card[]): Context {
  const s:GameState = {
    turn:1, truth:50, currentPlayer:'P1',
    players:{
      P1:{id:'P1', faction:'truth', deck:[], hand:[...p1], discard:[], ip:10, zones:[], zoneDefenseBonus:0},
      P2:{id:'P2', faction:'government', deck:[], hand:[...p2], discard:[], ip:10, zones:[], zoneDefenseBonus:0}
    },
    pressureByState:{},
  };
  return { state:s, log:()=>{} } as Context;
}

const TRUTH_031:Card = { id:'TRUTH-031', name:'Tinfoil Hat Distribution Drive', faction:'truth', type:'ATTACK', cost:2, effects:{ discardOpponent:1 } };
const TRUTH_036:Card = { id:'TRUTH-036', name:'Citizen Tipline Surge', faction:'truth', type:'ATTACK', cost:2, effects:{ discardOpponent:1 } };

describe('ATTACK discard resolves without reaction modal', () => {
  it('TRUTH-031 discards 1 from opponent', () => {
    const ctx = mkCtx([TRUTH_031], [{id:'X1',name:'A',faction:'government',type:'DEFENSIVE',cost:0,effects:{}},{id:'X2',name:'B',faction:'government',type:'DEFENSIVE',cost:0,effects:{}}]);
    const res = playCard(ctx, 'P1', TRUTH_031);
    expect(res).toBe('played');
    expect(ctx.state.players.P2.hand.length).toBe(1);
    expect(ctx.state.players.P2.discard.length).toBe(1);
  });

  it('TRUTH-036 discards 1 from opponent', () => {
    const ctx = mkCtx([TRUTH_036], [{id:'Y1',name:'C',faction:'government',type:'DEFENSIVE',cost:0,effects:{}},{id:'Y2',name:'D',faction:'government',type:'DEFENSIVE',cost:0,effects:{}}]);
    const res = playCard(ctx, 'P1', TRUTH_036);
    expect(res).toBe('played');
    expect(ctx.state.players.P2.hand.length).toBe(1);
    expect(ctx.state.players.P2.discard.length).toBe(1);
  });
});
