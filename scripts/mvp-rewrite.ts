// bunx tsx scripts/mvp-rewrite.ts
import fs from "fs";
import path from "path";

const COST = {
  ATTACK:   { common:2, uncommon:3, rare:4, legendary:5 },
  MEDIA:    { common:3, uncommon:4, rare:5, legendary:6 },
  ZONE:     { common:4, uncommon:5, rare:6, legendary:7 },
} as const;

const BASE = {
  ATTACK:   { common:{ipDelta:{opponent:1}}, uncommon:{ipDelta:{opponent:2}}, rare:{ipDelta:{opponent:3}}, legendary:{ipDelta:{opponent:4}} },
  MEDIA:    { common:{truthDelta:1}, uncommon:{truthDelta:2}, rare:{truthDelta:3}, legendary:{truthDelta:4} },
  ZONE:     { common:{pressureDelta:1}, uncommon:{pressureDelta:2}, rare:{pressureDelta:3}, legendary:{pressureDelta:4} },
} as const;

const TYPES = new Set(["ATTACK","MEDIA","ZONE"]);
const RAR  = new Set(["common","uncommon","rare","legendary"]);

function toFaction(x:string){ return (x||"").toLowerCase()==="government"?"government":"truth"; }
function toType(x:string){
  const t = String(x||"").toUpperCase();
  if (t==="DEFENSIVE") return "MEDIA";        // konverter
  if (TYPES.has(t as any)) return t;
  return "MEDIA"; // trygg default
}
function toRarity(x:string){ const r=(x||"").toLowerCase(); return RAR.has(r as any)?r:"common"; }

(async () => {
  try {
    const legacy = await import("../src/data/core_legacy/index.ts").catch(()=>({CARD_DATABASE_CORE:[]}));
    const cards:any[] = (legacy as any).CARD_DATABASE_CORE || [];
    
    if (cards.length === 0) {
      console.log("⚠️  No cards found in core_legacy, trying current core...");
      const current = await import("../src/data/core/index.ts").catch(()=>({CARD_DATABASE_CORE:[]}));
      cards.push(...((current as any).CARD_DATABASE_CORE || []));
    }
    
    const out:any[] = [];
    const report:string[] = [];

    for (const c of cards){
      const rarity = toRarity(c.rarity);
      const type   = toType(c.type);
      const faction= toFaction(c.faction);

      let effects:any = BASE[type as "ATTACK"|"MEDIA"|"ZONE"][rarity as keyof typeof BASE["ATTACK"]];
      // ATTACK: bevar discardOpponent (0..2) som "krydder"
      if (type==="ATTACK"){
        const disc = Math.max(0, Math.min(2, Number(c?.effects?.discardOpponent||0)));
        effects = disc ? { ...effects, discardOpponent: disc } : effects;
      }

      const nc = {
        id: c.id, 
        name: c.name, 
        faction, 
        type, 
        rarity,
        cost: COST[type as "ATTACK"][rarity as "common"],
        effects, 
        text: c.text || `${type} card`,
        flavorTruth: c.flavorTruth || c.flavor || "Truth flavor text",
        flavorGov: c.flavorGov || c.flavor || "Government flavor text",
        artId: c.artId, 
        tags: c.tags
      };
      out.push(nc);

      // rapport
      const dropped = Object.keys(c.effects||{}).filter(k=>{
        if (type==="ATTACK") return !["ipDelta","discardOpponent"].includes(k);
        if (type==="MEDIA")  return k!=="truthDelta";
        if (type==="ZONE")   return k!=="pressureDelta";
        return true;
      });
      if (dropped.length) report.push(`${c.id}: dropped [${dropped.join(", ")}] -> ${type}.${rarity}`);
      else report.push(`${c.id}: OK -> ${type}.${rarity}`);
    }

    const header = `// AUTO-GENERATED (MVP rewrite)\nexport const CARD_DATABASE_CORE = ${JSON.stringify(out, null, 2)} as const;\n\nexport type { MVPCard as CoreCard } from "@/types/mvp-types";\n`;
    fs.mkdirSync(path.join("src","data","core"),{recursive:true});
    fs.writeFileSync(path.join("src","data","core","index.ts"), header);
    fs.writeFileSync(path.join("src","data","core","rewrite-report.txt"), report.join("\n"));
    console.log(`✓ Rewrote ${out.length} cards to MVP. See src/data/core/rewrite-report.txt`);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
})();