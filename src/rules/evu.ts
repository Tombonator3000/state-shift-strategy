import type { CanonicalEffects } from "./v21e-strict";
import { EVU, COST_ALPHA, COST_BASE } from "./unified-policy";

export function evuOf(e: CanonicalEffects): number {
  let v = 0;
  if (e.pressureDelta)      v += e.pressureDelta * EVU.pressure;
  if (e.truthDelta)         v += e.truthDelta * EVU.truthPct;
  if (e.ipDelta?.self)      v += e.ipDelta.self * EVU.ipSelf;
  if (e.ipDelta?.opponent)  v += Math.abs(e.ipDelta.opponent) * EVU.ipOpp;
  if (e.draw)               v += e.draw * EVU.draw;
  if (e.discardOpponent)    v += e.discardOpponent * EVU.discard;
  if (e.zoneDefense)        v += e.zoneDefense * EVU.zoneDef;
  if (e.reaction?.block)    v += EVU.reactBlock;
  if (e.reaction?.immune)   v += EVU.reactImmune;
  if (e.skipOpponentAction) v += e.skipOpponentAction * EVU.skipOpp;
  if (e.pressureAllDelta)   v += e.pressureAllDelta * EVU.pressureAll;

  // conditional rabatt (kun toppnivå: enkel og konservativ)
  if (e.conditional) {
    const thenV = evuOf(e.conditional.then || {});
    const elseV = evuOf(e.conditional.else || {});
    const base = Math.max(thenV, elseV);
    let discount = 0;
    if (e.conditional.ifTargetStateIs !== undefined) discount += 0.25;
    if (
      e.conditional.ifTruthAtLeast !== undefined ||
      e.conditional.ifZonesControlledAtLeast !== undefined
    ) {
      discount += 0.15;
    }
    v += base * (1 - Math.min(0.4, discount)); // maks 40% rabatt
  }

  return v;
}

export function priceIP(type: "ATTACK"|"DEFENSIVE"|"MEDIA"|"ZONE", evu: number): number {
  const ip = Math.round(COST_BASE[type] + COST_ALPHA * evu);
  return Math.max(0, ip);
}
