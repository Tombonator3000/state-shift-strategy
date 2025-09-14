import { Context } from "./types";
import { normalizeEffects } from "./normalize";

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

export function applyEffects(ctx: Context, owner: "P1" | "P2", rawEffects: any, targetStateId?: string) {
  const eff = normalizeEffects(rawEffects);
  const s = ctx.state;
  const you = s.players[owner];
  const opp = s.players[owner === "P1" ? "P2" : "P1"];

  // ---- flat v2.1E + normalized shorthand ----
  if (typeof eff.truthDelta === "number") {
    s.truth = clamp(s.truth + eff.truthDelta, 0, 100);
  }
  
  if (eff.ipDelta?.self) {
    you.ip = Math.max(0, you.ip + eff.ipDelta.self);
  }
  
  if (eff.ipDelta?.opponent) {
    opp.ip = Math.max(0, opp.ip + eff.ipDelta.opponent);
  }

  if (eff.draw) {
    for (let i = 0; i < eff.draw; i++) {
      const c = you.deck.shift();
      if (c) you.hand.push(c);
    }
  }
  
  if (eff.discardOpponent) {
    for (let i = 0; i < eff.discardOpponent; i++) {
      const c = opp.hand.shift();
      if (c) opp.discard.push(c);
    }
  }

  if (typeof eff.pressureDelta === "number") {
    you.pressureTotal = (you.pressureTotal || 0) + eff.pressureDelta;
  }
  
  if (eff.zoneDefense) {
    you.zoneDefenseBonus += eff.zoneDefense;
  }

  if (eff.conditional) {
    const cond = eff.conditional;
    let ok = true;
    if (cond.ifTruthAtLeast !== undefined) ok &&= s.truth >= cond.ifTruthAtLeast;
    if (cond.ifZonesControlledAtLeast !== undefined) ok &&= you.zones.length >= cond.ifZonesControlledAtLeast;
    if (cond.ifTargetStateIs !== undefined) ok &&= (targetStateId && targetStateId === cond.ifTargetStateIs);
    applyEffects(ctx, owner, ok ? cond.then : (cond.else || {}), targetStateId);
  }

  // ---- flags (one-time and persistent) ----
  if (eff.flags?.bonusDraw) {
    for (let i = 0; i < eff.flags.bonusDraw; i++) {
      const c = you.deck.shift();
      if (c) you.hand.push(c);
    }
  }
  
  if (eff.flags?.forceDiscard) {
    for (let i = 0; i < eff.flags.forceDiscard; i++) {
      const c = opp.hand.shift();
      if (c) opp.discard.push(c);
    }
  }

  if (eff.flags?.zoneCostReduction) {
    you.costMods = you.costMods || {};
    you.costMods.zone = (you.costMods.zone || 0) - eff.flags.zoneCostReduction;
  }
  
  if (eff.development?.mediaCost) {
    you.costMods = you.costMods || {};
    you.costMods.media = (you.costMods.media || 0) + eff.development.mediaCost;
  }
  
  if (eff.development?.income) {
    you.passiveIncome = (you.passiveIncome || 0) + eff.development.income;
  }

  // turn flags for reaction
  if (eff.flags?.immune) {
    ctx.turnFlags = { 
      ...(ctx.turnFlags || {}), 
      [owner]: { 
        ...(ctx.turnFlags?.[owner] || {}), 
        immune: true 
      } 
    };
  }
  
  if (eff.flags?.blockAttack || eff.duration === "thisTurn") {
    ctx.turnFlags = { 
      ...(ctx.turnFlags || {}), 
      [owner]: { 
        ...(ctx.turnFlags?.[owner] || {}), 
        blockAttack: true 
      } 
    };
  }

  // global flag for AI
  if (eff.flags?.skipActionAI) {
    s.skipAIActionNext = true;
  }
}