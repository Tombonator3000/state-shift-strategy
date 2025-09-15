import { CanonicalEffects } from "@/rules/v21e-strict";
import { Context } from "./types";

const clamp = (v:number,lo:number,hi:number)=>Math.max(lo,Math.min(hi,v));
const discardRandom = (arr: any[], n:number) => {
  const moved:any[]=[]; for(let i=0;i<n && arr.length;i++){ const idx=Math.floor(Math.random()*arr.length); moved.push(...arr.splice(idx,1)); } return moved;
};

export function applyCanonical(ctx: Context, owner:"P1"|"P2", e: CanonicalEffects, targetStateId?: string){
  const s=ctx.state, you=s.players[owner], opp=s.players[owner==="P1"?"P2":"P1"];

  if (e.truthDelta) s.truth = clamp(s.truth + e.truthDelta, 0, 100);
  if (e.ipDelta?.self)      you.ip = Math.max(0, you.ip + e.ipDelta.self);
  if (e.ipDelta?.opponent)  opp.ip = Math.max(0, opp.ip + e.ipDelta.opponent);

  if (e.draw) for (let i=0;i<e.draw;i++){ const c=you.deck.shift(); if (c) you.hand.push(c); }
  if (e.discardOpponent){ const moved=discardRandom(opp.hand, e.discardOpponent); opp.discard.push(...moved); }

  if (e.zoneDefense) you.zoneDefenseBonus += e.zoneDefense;

  if (e.pressureAllDelta){
    for (const sid of Object.keys(s.pressureByState)) {
      const rec = (s.pressureByState[sid] ||= { P1:0, P2:0 });
      rec[owner] = Math.max(0, rec[owner] + e.pressureAllDelta);
    }
  }
  if (e.pressureDelta && targetStateId){
    const rec = (s.pressureByState[targetStateId] ||= { P1:0, P2:0 });
    rec[owner] = Math.max(0, rec[owner] + e.pressureDelta);
  }

  if (e.costModDelta){
    you.costMods = you.costMods || {};
    if (typeof e.costModDelta.zone  === "number") you.costMods.zone  = (you.costMods.zone  || 0) + e.costModDelta.zone;
    if (typeof e.costModDelta.media === "number") you.costMods.media = (you.costMods.media || 0) + e.costModDelta.media;
  }
  if (e.ipIncomePerTurn) you.passiveIncome = (you.passiveIncome||0) + e.ipIncomePerTurn;

  if (e.skipOpponentAction){
    s.skipNextAction = s.skipNextAction || { P1:0, P2:0 } as any;
    const foe = owner==="P1"?"P2":"P1";
    s.skipNextAction[foe] = (s.skipNextAction[foe]||0) + e.skipOpponentAction;
  }

  if (e.conditional){
    const c = e.conditional; let ok = true;
    if (c.ifTruthAtLeast !== undefined) ok &&= s.truth >= c.ifTruthAtLeast;
    if (c.ifZonesControlledAtLeast !== undefined) ok &&= you.zones.length >= c.ifZonesControlledAtLeast;
    if (c.ifTargetStateIs !== undefined) ok &&= (String(c.ifTargetStateIs).toUpperCase() === String(targetStateId||"").toUpperCase());
    applyCanonical(ctx, owner, ok ? (c.then||{}) : (c.else||{}), targetStateId);
  }

  if (e.reaction?.immune || e.reaction?.block) {
    ctx.turnFlags = { ...(ctx.turnFlags||{}), [owner]: {
      ...(ctx.turnFlags?.[owner]||{}),
      immune: Boolean(e.reaction?.immune) || Boolean(ctx.turnFlags?.[owner]?.immune),
      blockAttack:  Boolean(e.reaction?.block)  || Boolean((ctx.turnFlags as any)?.[owner]?.blockAttack),
    }};
  }
}
