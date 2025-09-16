import type { CanonicalEffects } from "./v21e-strict";

type RarityKey = Lowercase<"Common" | "Uncommon" | "Rare" | "Legendary">;

// Rarity → EVU-budsjett (hvor mye effekt et kort kan ha)
export const RARITY_BUDGET: Record<RarityKey, number> = {
  common: 3,
  uncommon: 6,
  rare: 9,
  legendary: 14,
};

// Effektverdier (EVU)
export const EVU = {
  pressure: 1,            // +1 pressure (target)
  truthPct: 1.5,          // +1% truth
  ipSelf: 1,              // +1 IP til deg
  ipOpp: 1,               // -1 IP til opponent
  draw: 3,                // draw 1
  discard: 4,             // opponent discards 1 (random)
  zoneDef: 2,             // +1 zoneDefense
  reactBlock: 5,          // reaction.block
  reactImmune: 6,         // reaction.immune
  skipOpp: 7,             // skip opponent action (1)
  pressureAll: 12,        // +1 pressure all states (legendary only)
};

// Kostformel: IP = round(BaseType + α * EVU_total)
export const COST_BASE: Record<"ATTACK" | "DEFENSIVE" | "MEDIA" | "ZONE", number> = {
  ATTACK: 0,
  DEFENSIVE: 1,
  MEDIA: 2,
  ZONE: 3,
};
export const COST_ALPHA = 0.5;

// Type-spesifikk whitelist (kun disse feltene lov pr. type)
export const TYPE_WHITELIST: Record<"ATTACK" | "DEFENSIVE" | "MEDIA" | "ZONE", (keyof CanonicalEffects)[]> = {
  ATTACK: ["ipDelta", "discardOpponent", "truthDelta", "conditional", "reaction"],
  DEFENSIVE: ["ipDelta", "draw", "zoneDefense", "reaction", "conditional"],
  MEDIA: ["truthDelta", "draw", "costModDelta", "skipOpponentAction", "conditional"],
  ZONE: ["pressureDelta", "truthDelta", "pressureAllDelta", "conditional"],
};

// TEMPLATES per type × rarity  (STRIKT variant)
// NB: alle kart av samme type×rarity får samme "baseline" effekt.
// Unike korttekst er fortsatt lov (navn/art/quotes), men effekten standardiseres.
export const TEMPLATES: Record<
  "ATTACK" | "DEFENSIVE" | "MEDIA" | "ZONE",
  Record<RarityKey, CanonicalEffects>
> = {
  ATTACK: {
    common:    { discardOpponent: 1 },
    uncommon:  { discardOpponent: 1, ipDelta: { opponent: -1 } },
    rare:      { discardOpponent: 2 },
    legendary: { discardOpponent: 2, ipDelta: { opponent: -2 } },
  },
  DEFENSIVE: {
    common:    { draw: 1 },
    uncommon:  { draw: 1, ipDelta: { self: +1 } },
    rare:      { draw: 2 },
    legendary: { draw: 2, reaction: { block: true } },
  },
  MEDIA: {
    common:    { truthDelta: 2 },
    uncommon:  { truthDelta: 3 },
    rare:      { truthDelta: 4, draw: 1 },
    legendary: { truthDelta: 5, draw: 1, skipOpponentAction: 1 },
  },
  ZONE: {
    // <- DITT ØNSKE: Common=+1 push, Uncommon=+2, Rare=+3, Legendary=+4
    common:    { pressureDelta: 1 },
    uncommon:  { pressureDelta: 2 },
    rare:      { pressureDelta: 3 },
    legendary: { pressureDelta: 4, truthDelta: 1 }, // litt ekstra "wow"
  },
};

// Valg for omskriving
export const REWRITE_MODE: "strict" | "hybrid" = "strict";
// strict = bruk template 100% (overskriv effekter)
// hybrid = hvis kortet allerede matcher type-whitelist og passer budsjett → behold effekter, ellers bruk template
