import { Card, Context } from "./types";

export function pickDefenseForAI(ctx: Context, owner:"P1"|"P2", incoming: Card): Card | null {
  const p = ctx.state.players[owner];
  const defs = p.hand.filter(c => c.type==="DEFENSIVE" && p.ip >= c.cost);
  if (!defs.length) return null;
  const score = (c:Card) => {
    const e = c.effects || {};
    const s1 = (e?.reaction?.block || e?.reaction?.immune) ? 5 : 0;
    const s2 = typeof e.discardOpponent === "number" ? 2 : 0;
    const s3 = typeof e.ipDelta?.self === "number" ? 1 : 0;
    return s1 + s2 + s3;
  };
  return defs.sort((a,b)=>score(b)-score(a))[0];
}
