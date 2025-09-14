import { Card, Context } from "./types";

export function pickDefenseForAI(ctx: Context, owner: "P1" | "P2", incoming: Card): Card | null {
  const p = ctx.state.players[owner];
  const defs = p.hand.filter(c => c.type === "DEFENSIVE" && p.ip >= c.cost);
  
  if (!defs.length) return null;
  
  const score = (c: Card) => {
    const eff = c.effects || {};
    const effectStr = JSON.stringify(eff);
    
    // Prioritize cards that can block or provide immunity
    const s1 = /blockAttack|immune/.test(effectStr) ? 5 : 0;
    
    // Secondary: cards that discard opponent cards
    const s2 = effectStr.includes('"discardOpponent"') ? 2 : 0;
    
    // Tertiary: cards that give self IP
    const s3 = effectStr.includes('"ipDelta":{"self"') ? 1 : 0;
    
    return s1 + s2 + s3;
  };
  
  return defs.sort((a, b) => score(b) - score(a))[0];
}