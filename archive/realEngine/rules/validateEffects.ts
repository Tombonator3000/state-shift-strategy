import { CanonicalEffects } from "./v21e-strict";

const ALLOWED = new Set([
  "truthDelta","ipDelta","draw","discardOpponent","zoneDefense",
  "pressureDelta","pressureAllDelta","reaction","costModDelta",
  "ipIncomePerTurn","skipOpponentAction","conditional"
]);

export function validateCanonicalEffects(e:any, path="effects"):string[] {
  const errs:string[]=[];
  if (!e || typeof e!=="object" || Array.isArray(e)) return [`${path}: must be object`];

  for (const k of Object.keys(e)) if (!ALLOWED.has(k)) errs.push(`${path}.${k}: not allowed`);

  if ("truthDelta" in e && typeof e.truthDelta!=="number") errs.push(`${path}.truthDelta: number`);
  if ("ipDelta" in e) {
    if (typeof e.ipDelta!=="object") errs.push(`${path}.ipDelta: object`);
    else {
      if ("self" in e.ipDelta && !Number.isInteger(e.ipDelta.self)) errs.push(`${path}.ipDelta.self: int`);
      if ("opponent" in e.ipDelta && !Number.isInteger(e.ipDelta.opponent)) errs.push(`${path}.ipDelta.opponent: int`);
    }
  }
  if ("draw" in e && !Number.isInteger(e.draw)) errs.push(`${path}.draw: int`);
  if ("discardOpponent" in e && !Number.isInteger(e.discardOpponent)) errs.push(`${path}.discardOpponent: int`);
  if ("zoneDefense" in e && !Number.isInteger(e.zoneDefense)) errs.push(`${path}.zoneDefense: int`);
  if ("pressureDelta" in e && !Number.isInteger(e.pressureDelta)) errs.push(`${path}.pressureDelta: int`);
  if ("pressureAllDelta" in e && !Number.isInteger(e.pressureAllDelta)) errs.push(`${path}.pressureAllDelta: int`);

  if ("reaction" in e) {
    const r=e.reaction;
    if (!r || typeof r!=="object") errs.push(`${path}.reaction: object`);
    else {
      if ("block" in r && typeof r.block!=="boolean") errs.push(`${path}.reaction.block: boolean`);
      if ("immune" in r && typeof r.immune!=="boolean") errs.push(`${path}.reaction.immune: boolean`);
    }
  }

  if ("costModDelta" in e) {
    const c=e.costModDelta;
    if (!c || typeof c!=="object") errs.push(`${path}.costModDelta: object`);
    else {
      if ("zone" in c && !Number.isInteger(c.zone)) errs.push(`${path}.costModDelta.zone: int`);
      if ("media" in c && !Number.isInteger(c.media)) errs.push(`${path}.costModDelta.media: int`);
    }
  }

  if ("ipIncomePerTurn" in e && !Number.isInteger(e.ipIncomePerTurn)) errs.push(`${path}.ipIncomePerTurn: int`);
  if ("skipOpponentAction" in e && !Number.isInteger(e.skipOpponentAction)) errs.push(`${path}.skipOpponentAction: int`);

  if ("conditional" in e) {
    const c=e.conditional;
    if (!c || typeof c!=="object") errs.push(`${path}.conditional: object`);
    else {
      if ("ifTruthAtLeast" in c && typeof c.ifTruthAtLeast!=="number") errs.push(`${path}.conditional.ifTruthAtLeast: number`);
      if ("ifZonesControlledAtLeast" in c && !Number.isInteger(c.ifZonesControlledAtLeast)) errs.push(`${path}.conditional.ifZonesControlledAtLeast: int`);
      if ("ifTargetStateIs" in c && typeof c.ifTargetStateIs!=="string") errs.push(`${path}.conditional.ifTargetStateIs: string`);
      if ("then" in c) errs.push(...validateCanonicalEffects(c.then, `${path}.conditional.then`));
      if ("else" in c) errs.push(...validateCanonicalEffects(c.else, `${path}.conditional.else`));
    }
  }
  return errs;
}
