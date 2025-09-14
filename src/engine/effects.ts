import { Context } from "./types";
import { normalizeEffects } from "./normalize";

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

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
  
  if (eff.discardOpponent) {
    console.log(`[Engine] Forcing opponent to discard ${eff.discardOpponent} cards`);
    for (let i = 0; i < eff.discardOpponent; i++) {
      const c = opp.hand.shift();
      if (c) {
        opp.discard.push(c);
        console.log(`[Engine] Opponent discarded: ${c.name}`);
      }
    }
  }
  
  if (eff.discardRandom) {
    console.log(`[Engine] ${owner} discarding ${eff.discardRandom} random cards`);
    for (let i = 0; i < eff.discardRandom; i++) {
      if (you.hand.length > 0) {
        const randomIndex = Math.floor(Math.random() * you.hand.length);
        const c = you.hand.splice(randomIndex, 1)[0];
        if (c) {
          you.discard.push(c);
          console.log(`[Engine] ${owner} randomly discarded: ${c.name}`);
        }
      }
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