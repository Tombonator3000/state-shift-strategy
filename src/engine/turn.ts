import { Context } from "./types";

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
