// bunx tsx scripts/validate-core-mvp.ts
import { validateMVP } from "../src/rules/validate-mvp";

(async()=>{
  try {
    const mod = await import("../src/data/core/index.ts");
    const cards:any[] = (mod as any).CARD_DATABASE_CORE || [];
    const errs:string[]=[];
    
    for (const c of cards){ 
      const e = validateMVP(c).map(x=>`${c.id}: ${x}`); 
      errs.push(...e);
    }
    
    if (errs.length){ 
      console.error("✖ MVP validation failed:\n"+errs.map(x=>" - "+x).join("\n")); 
      process.exit(1); 
    }
    
    console.log(`✓ MVP validation OK for ${cards.length} cards`);
  } catch (error) {
    console.error("❌ Validation script failed:", error);
    process.exit(1);
  }
})();