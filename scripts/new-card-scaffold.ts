// bunx tsx scripts/new-card-scaffold.ts
import fs from "fs";
import path from "path";
import readline from "readline";

const COST = {
  ATTACK:{common:2,uncommon:3,rare:4,legendary:5},
  MEDIA: {common:3,uncommon:4,rare:5,legendary:6},
  ZONE:  {common:4,uncommon:5,rare:6,legendary:7}
} as const;

function tmpl({id,name,faction,type,rarity}:{id:string;name:string;faction:string;type:"ATTACK"|"MEDIA"|"ZONE";rarity:"common"|"uncommon"|"rare"|"legendary"}) {
  const effects = type==="ATTACK" ? `effects:{ ipDelta:{opponent:${({common:1,uncommon:2,rare:3,legendary:4})[rarity]} } }`
                 : type==="MEDIA" ? `effects:{ truthDelta:${({common:1,uncommon:2,rare:3,legendary:4})[rarity]} }`
                 :                   `effects:{ pressureDelta:${({common:1,uncommon:2,rare:3,legendary:4})[rarity]} }`;
  return `{
  id:"${id}",
  name:"${name}",
  faction:"${faction}",
  type:"${type}",
  rarity:"${rarity}",
  cost:${COST[type][rarity]},
  text:"${type} card",
  flavorTruth:"Truth flavor text",
  flavorGov:"Government flavor text",
  ${effects}
}`;
}

(async()=>{
  const rl = readline.createInterface({input:process.stdin, output:process.stdout});
  const ask = (q:string)=>new Promise<string>(res=>rl.question(q,res));
  
  const id=await ask("id: "); 
  const name=await ask("name: ");
  const faction=(await ask("faction (truth/government): ")).toLowerCase()==="government"?"government":"truth";
  const type=(await ask("type (ATTACK/MEDIA/ZONE): ")).toUpperCase() as any;
  const rarity=(await ask("rarity (common/uncommon/rare/legendary): ")).toLowerCase() as any;
  rl.close();

  const line = tmpl({id,name,faction,type,rarity});
  const p = path.join("src","data","core","custom-cards.ts");
  
  if (!fs.existsSync(p)) {
    fs.writeFileSync(p, `export const CUSTOM_CARDS = [\n${line}\n];\n`);
  } else {
    fs.appendFileSync(p, `,\n${line}\n`);
  }
  
  console.log(`✓ Wrote card to ${p}`);
})();