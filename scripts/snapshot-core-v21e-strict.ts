// Run: bunx tsx scripts/snapshot-core-v21e-strict.ts
import fs from "fs";
import path from "path";
import { validateCanonicalEffects } from "../src/rules/validateEffects";

(async function main(){
  const mod = await import("../src/data/core/index.ts");
  const cards: any[] = (mod as any).CARD_DATABASE_CORE || [];

  const noncompliant = cards
    .map(c => ({ id:c.id, errs: validateCanonicalEffects(c.effects || {}, `${c.id}.effects`) }))
    .filter(x => x.errs.length>0);

  const dir = "src/data/exports";
  fs.mkdirSync(dir, { recursive:true });
  fs.writeFileSync(path.join(dir,"card-effects-core.strict.json"), JSON.stringify(cards,null,2));
  if (noncompliant.length) {
    fs.writeFileSync(path.join(dir,"card-effects-core.noncompliant.txt"),
      noncompliant.map(x=>`${x.id}\n${x.errs.map(e=>"  - "+e).join("\n")}`).join("\n"));
    console.warn(`⚠ Some core cards violate v2.1E-Strict. See ${dir}/card-effects-core.noncompliant.txt`);
  } else {
    console.log("✓ All core cards canonical (snapshot)");
  }
})();
