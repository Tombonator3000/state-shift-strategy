// Run: bunx tsx scripts/validate-core-v21e-strict.ts
import { validateCanonicalEffects } from "../src/rules/validateEffects";

type Card = { id:string; name:string; type:string; faction?:string; cost:number; effects:any };

import("../src/data/core/index.ts").then(mod => {
  const cards: Card[] = (mod as any).CARD_DATABASE_CORE || [];
  if (!Array.isArray(cards) || cards.length===0) {
    console.error("✖ No cards found in CARD_DATABASE_CORE");
    process.exit(1);
  }

  const errs: string[] = [];
  for (const c of cards) {
    const e = c.effects;
    if (typeof e==="string" || Array.isArray(e)) {
      errs.push(`${c.id}.effects: must be canonical object (found string/array)`);
      continue;
    }
    errs.push(...validateCanonicalEffects(e, `${c.id}.effects`));
  }

  if (errs.length) {
    console.error("✖ v2.1E-Strict validation failed for core:");
    for (const e of errs) console.error(" -", e);
    process.exit(1);
  }
  console.log(`✓ v2.1E-Strict validation OK for ${cards.length} core cards`);
  process.exit(0);
});
