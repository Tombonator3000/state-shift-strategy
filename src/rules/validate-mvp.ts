// Simple MVP validation for build-time hard gate
export function validateMVP(card:any): string[] {
  const errs:string[]=[];
  const t=card.type, r=card.rarity, f=card.faction, e=card.effects||{};
  
  if (!["truth","government"].includes(f)) errs.push("faction");
  if (!["ATTACK","MEDIA","ZONE"].includes(t)) errs.push("type");
  if (!["common","uncommon","rare","legendary"].includes(r)) errs.push("rarity");

  if (t==="ATTACK"){
    const keys=Object.keys(e);
    if (!(e?.ipDelta?.opponent>0)) errs.push("ATTACK requires ipDelta.opponent>0");
    if (!keys.every(k=>["ipDelta","discardOpponent"].includes(k))) errs.push("ATTACK keys");
  }
  if (t==="MEDIA"){
    if (Object.keys(e).join(",")!=="truthDelta") errs.push("MEDIA only truthDelta");
    if (typeof e.truthDelta!=="number") errs.push("truthDelta number");
  }
  if (t==="ZONE"){
    if (Object.keys(e).join(",")!=="pressureDelta") errs.push("ZONE only pressureDelta");
    if (!(e?.pressureDelta>0)) errs.push("pressureDelta>0");
  }
  
  return errs;
}

// Database validation for scripts
export function validateMVPDatabase(cards: any[]): { cardId: string; error: string }[] {
  const allErrors: { cardId: string; error: string }[] = [];
  for (const card of cards) {
    const cardErrors = validateMVP(card);
    cardErrors.forEach(error => allErrors.push({ cardId: card.id, error }));
  }
  return allErrors;
}