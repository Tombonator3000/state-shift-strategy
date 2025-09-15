import { DRAW_MODE, FIXED_DRAW_PER_TURN, MAX_PLAYS_PER_TURN } from "@/rules/config";
import { Context } from "./types";

export function startTurn(ctx: Context) {
  const me = ctx.state.currentPlayer;
  const p = ctx.state.players[me];
  if (DRAW_MODE === "drawToFive") {
    while (p.hand.length < 5) {
      const c = p.deck.shift();
      if (c) p.hand.push(c); else break;
    }
  } else {
    for (let i = 0; i < FIXED_DRAW_PER_TURN; i++) {
      const c = p.deck.shift();
      if (c) p.hand.push(c);
    }
  }
  ctx.turnFlags = {};
}

export function canPlayMoreThisTurn(ctx: Context, playsThisTurn: number) {
  return playsThisTurn < MAX_PLAYS_PER_TURN;
}

export function endTurn(ctx: Context){
  // passiv inntekt
  for (const pid of ["P1","P2"] as const) {
    const p = ctx.state.players[pid];
    if (p.passiveIncome) p.ip += p.passiveIncome;
  }
  // reaction-flags ryddes per tur
  ctx.turnFlags = {};
  // bytt spiller
  const me = ctx.state.currentPlayer;
  ctx.state.currentPlayer = me === "P1" ? "P2" : "P1";
  ctx.state.turn += 1;

  // skip neste handling hvis aktiv
  const cur = ctx.state.currentPlayer;
  const left = ctx.state.skipNextAction?.[cur] || 0;
  if (left > 0) {
    ctx.state.skipNextAction![cur] = left - 1;
    // markér turn som auto-skipped i UI-logg om ønskelig
  }
}
