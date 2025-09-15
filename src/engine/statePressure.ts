import { Context } from "./types";

export function aliasToStateId(ctx: Context, s?: string): string | undefined {
  if (!s) return undefined;
  const key = s.trim().toLowerCase();
  const a = ctx.state.stateAliases || {};
  return a[s] || a[key] || a[s.toUpperCase()] || a[capitalizeWords(key)] || s; // fallbacks
}
function capitalizeWords(x: string) {
  return x.replace(/\b\w/g, c => c.toUpperCase());
}

export function addPressure(ctx: Context, owner: "P1" | "P2", stateId: string, amt: number) {
  const rec = (ctx.state.pressureByState[stateId] ||= { P1: 0, P2: 0 });
  rec[owner] = Math.max(0, (rec[owner] || 0) + amt);
  const player = ctx.state.players[owner];
  player.pressureTotal = Math.max(0, (player.pressureTotal || 0) + amt);
}
