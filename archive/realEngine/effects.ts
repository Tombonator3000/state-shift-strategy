import { Context } from "./types";
import { normalizeEffects } from "./normalize";
import { addPressure, aliasToStateId } from "./statePressure";

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

function discardRandom(hand: any[], n: number): any[] {
  const moved: any[] = [];
  for (let i = 0; i < n && hand.length > 0; i++) {
    const idx = Math.floor(Math.random() * hand.length);
    moved.push(...hand.splice(idx, 1));
  }
  return moved;
}

export function applyEffects(ctx: Context, owner: "P1" | "P2", rawEffects: any, targetStateId?: string) {
  console.log(`[Engine] applyEffects for ${owner}:`, rawEffects);
  const eff = normalizeEffects(rawEffects);
  console.log(`[Engine] normalized effects:`, eff);
  
  const s = ctx.state;
  const you = s.players[owner];
  const opp = s.players[owner === "P1" ? "P2" : "P1"];

  console.log(`[Engine] Before effects - Truth: ${s.truth}, IP: ${you.ip}, Opp IP: ${opp.ip}`);

  // ---- flat v2.1E + normalized shorthand ----
  if (typeof eff.truthDelta === "number") {
    const oldTruth = s.truth;
    s.truth = clamp(s.truth + eff.truthDelta, 0, 100);
    console.log(`[Engine] Truth changed: ${oldTruth} -> ${s.truth} (delta: ${eff.truthDelta})`);
  }
  
  if (eff.ipDelta?.self) {
    const oldIP = you.ip;
    you.ip = Math.max(0, you.ip + eff.ipDelta.self);
    console.log(`[Engine] ${owner} IP changed: ${oldIP} -> ${you.ip} (delta: ${eff.ipDelta.self})`);
  }
  
  if (eff.ipDelta?.opponent) {
    const oldOppIP = opp.ip;
    opp.ip = Math.max(0, opp.ip + eff.ipDelta.opponent);
    console.log(`[Engine] Opponent IP changed: ${oldOppIP} -> ${opp.ip} (delta: ${eff.ipDelta.opponent})`);
  }

  if (eff.draw) {
    console.log(`[Engine] Drawing ${eff.draw} cards for ${owner}`);
    for (let i = 0; i < eff.draw; i++) {
      const c = you.deck.shift();
      if (c) {
        you.hand.push(c);
        console.log(`[Engine] Drew card: ${c.name}`);
      }
    }
  }
  
  if ((eff.discardOpponent || 0) > 0) {
    console.log(`[Engine] Forcing opponent to discard ${eff.discardOpponent} cards`);
    const moved = discardRandom(opp.hand, eff.discardOpponent);
    opp.discard.push(...moved);
  }

  if ((eff.discardRandom || 0) > 0) {
    console.log(`[Engine] ${owner} discarding ${eff.discardRandom} random cards`);
    const moved = discardRandom(you.hand, eff.discardRandom);
    you.discard.push(...moved);
  }

  // Pressure (liste-basert)
  if (eff.pressureOps?.length) {
    for (const p of eff.pressureOps) {
      if (p.scope === "all") {
        for (const sid of Object.keys(s.pressureByState)) addPressure(ctx, owner, sid, p.amount);
      } else if (targetStateId) {
        addPressure(ctx, owner, targetStateId, p.amount);
      }
    }
  }

  // Pressure (flatt v2.1E): alltid til valgt stat
  const flatPressure = typeof (rawEffects?.pressureDelta) === "number" ? rawEffects.pressureDelta : (eff as any).pressureDelta;
  if (typeof flatPressure === "number" && targetStateId) {
    addPressure(ctx, owner, targetStateId, Number(flatPressure));
  }
  
  if (eff.zoneDefense) {
    you.zoneDefenseBonus += eff.zoneDefense;
  }

  if (eff.conditional) {
    const cond = eff.conditional;
    let ok = true;
    if (cond.ifTruthAtLeast !== undefined) ok &&= s.truth >= cond.ifTruthAtLeast;
    if (cond.ifZonesControlledAtLeast !== undefined) ok &&= you.zones.length >= cond.ifZonesControlledAtLeast;
    if (cond.ifTargetStateIs !== undefined) {
      const wanted = aliasToStateId(ctx, String(cond.ifTargetStateIs));
      const chosen = aliasToStateId(ctx, targetStateId);
      ok &&= !!wanted && !!chosen && wanted === chosen;
    }
    applyEffects(ctx, owner, ok ? cond.then : (cond.else || {}), targetStateId);
  }

  // ---- flags (one-time and persistent) ----
  if (eff.flags?.bonusDraw) {
    for (let i = 0; i < eff.flags.bonusDraw; i++) {
      const c = you.deck.shift();
      if (c) you.hand.push(c);
    }
  }
  
  if ((eff.flags?.forceDiscard || 0) > 0) {
    const moved = discardRandom(opp.hand, eff.flags.forceDiscard!);
    opp.discard.push(...moved);
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