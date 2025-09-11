import type { GameCard } from '@/components/game/GameHand';
import { extensionManager } from './extensionSystem';

// NEW CORE CARD SET - 400 Cards Total
// Truth Seekers: 200 cards (Weekly World News parody - Bigfoot, Elvis, Bat Boy, UFOs, ghost-hunting grandmas)
// Government: 200 cards (X-Files/Men in Black parody - Illuminati, lizard people, psy-ops, Roswell cover-ups)
//
// 📦 BATCH INTEGRATION STATUS:
// Batch 1 (Truth Seekers 1-50): ✅ Complete
// Batch 2 (Truth Seekers 51-100): ✅ Complete  
// Batch 3 (Truth Seekers 101-150): ✅ Complete
// Batch 4 (Truth Seekers 151-200): ⏳ Pending
// Batch 5 (Government 1-50): ⏳ Pending
// Batch 6 (Government 51-100): ⏳ Pending
// Batch 7 (Government 101-150): ⏳ Pending
// Batch 8 (Government 151-200): ⏳ Pending
//
// ⚡ MIGRATION RULES:
// - Truth changes: max ±15% (Legendary only)
// - Legendary minimum cost: 25 IP  
// - Truth clamped 0-100, IP ≥ 0
// - Hand limit: 7 cards
// - Zone captures: Pressure ≥ Defense

export const CARD_DATABASE: GameCard[] = [
  // ===== BATCH 1: TRUTH SEEKERS (1-50) ===== 
  // MEDIA (18)
  {
    id: "TS-001",
    faction: "Truth",
    name: "Blurry Bigfoot Photo Goes Viral",
    type: "MEDIA",
    rarity: "common",
    cost: 6,
    text: "+5% Truth. Draw 1 card.",
    flavor: "Experts confirm: pixels don't lie.",
    target: { scope: "global" },
    effects: { truthDelta: +5, draw: 1 }
  },
  {
    id: "TS-002",
    faction: "Truth",
    name: "Elvis Spotted at 3 A.M. Diner",
    type: "MEDIA",
    rarity: "uncommon",
    cost: 8,
    text: "+6% Truth. Gain +1 IP.",
    flavor: "The King recommends the midnight pancakes.",
    target: { scope: "global" },
    effects: { truthDelta: +6, ipDelta: { self: +1 } }
  },
  {
    id: "TS-003",
    faction: "Truth",
    name: "Pastor Rex's Apocalypse Podcast",
    type: "MEDIA",
    rarity: "rare",
    cost: 12,
    text: "+8% Truth. If Truth ≥ 70%, gain +2 IP.",
    flavor: "Sponsored by Doomsday Beans™.",
    target: { scope: "global" },
    effects: { truthDelta: +8, conditional: { ifTruthAtLeast: 70, ipDelta: { self: +2 } } }
  },
  {
    id: "TS-004",
    faction: "Truth",
    name: "Bat Boy Endorses Transparency",
    type: "MEDIA",
    rarity: "uncommon",
    cost: 9,
    text: "+7% Truth.",
    flavor: "His platform: windows with no curtains.",
    target: { scope: "global" },
    effects: { truthDelta: +7 }
  },
  {
    id: "TS-005",
    faction: "Truth",
    name: "Alien Wedding Blocks Traffic",
    type: "MEDIA",
    rarity: "common",
    cost: 6,
    text: "+5% Truth. Opponent loses 1 IP.",
    flavor: "Rice thrown… immediately abducted.",
    target: { scope: "opponent" },
    effects: { truthDelta: +5, ipDelta: { opponent: -1 } }
  },
  {
    id: "TS-006",
    faction: "Truth",
    name: "Local Grandma Sees Two Ghosts",
    type: "MEDIA",
    rarity: "common",
    cost: 5,
    text: "+4% Truth.",
    flavor: "They politely asked for tea.",
    target: { scope: "global" },
    effects: { truthDelta: +4 }
  },
  {
    id: "TS-007",
    faction: "Truth",
    name: "UFO Over High School Football Game",
    type: "MEDIA",
    rarity: "uncommon",
    cost: 8,
    text: "+6% Truth. Draw 1 if you control any Zone.",
    flavor: "Halftime show beamed in from Andromeda.",
    target: { scope: "global" },
    effects: { truthDelta: +6, conditional: { ifControlAnyZone: true, draw: 1 } }
  },
  {
    id: "TS-008",
    faction: "Truth",
    name: "Cryptid Selfie Goes Mainstream",
    type: "MEDIA",
    rarity: "common",
    cost: 6,
    text: "+5% Truth.",
    flavor: "#NoFilter #DefinitelyReal",
    target: { scope: "global" },
    effects: { truthDelta: +5 }
  },
  {
    id: "TS-009",
    faction: "Truth",
    name: "Elvis Opens Community Garden",
    type: "MEDIA",
    rarity: "uncommon",
    cost: 9,
    text: "+6% Truth. Gain +1 IP.",
    flavor: "He composts the tabloids.",
    target: { scope: "global" },
    effects: { truthDelta: +6, ipDelta: { self: +1 } }
  },
  {
    id: "TS-010",
    faction: "Truth",
    name: "Tabloid Thunder Special Edition",
    type: "MEDIA",
    rarity: "rare",
    cost: 13,
    text: "+8% Truth. Opponent discards 1 card.",
    flavor: "Ink smudges reveal more than black bars.",
    target: { scope: "opponent" },
    effects: { truthDelta: +8, discardOpponent: 1 }
  },
  {
    id: "TS-011",
    faction: "Truth",
    name: "Mothership Livestream Crashes App",
    type: "MEDIA",
    rarity: "rare",
    cost: 14,
    text: "+9% Truth.",
    flavor: "Chat: 'first!'",
    target: { scope: "global" },
    effects: { truthDelta: +9 }
  },
  {
    id: "TS-012",
    faction: "Truth",
    name: "Florida Man Joins the Resistance",
    type: "MEDIA",
    rarity: "common",
    cost: 6,
    text: "+5% Truth. Gain +1 IP if you played a MEDIA this turn.",
    flavor: "He brought snacks. Questionable snacks.",
    target: { scope: "global" },
    effects: { truthDelta: +5, conditional: { ifPlayedTypeThisTurn: "MEDIA", ipDelta: { self: +1 } } }
  },
  {
    id: "TS-013",
    faction: "Truth",
    name: "Elvis Busks in Area 51 Parking Lot",
    type: "MEDIA",
    rarity: "uncommon",
    cost: 9,
    text: "+7% Truth. Opponent -1 IP.",
    flavor: "Tip jar shaped like a saucer.",
    target: { scope: "opponent" },
    effects: { truthDelta: +7, ipDelta: { opponent: -1 } }
  },
  {
    id: "TS-014",
    faction: "Truth",
    name: "Citizen Journalist Scoop",
    type: "MEDIA",
    rarity: "common",
    cost: 5,
    text: "+4% Truth. Draw 1 card.",
    flavor: "Phones are better than binoculars.",
    target: { scope: "global" },
    effects: { truthDelta: +4, draw: 1 }
  },
  {
    id: "TS-015",
    faction: "Truth",
    name: "Crop Circle Art Festival",
    type: "MEDIA",
    rarity: "uncommon",
    cost: 8,
    text: "+6% Truth.",
    flavor: "BYO tractor.",
    target: { scope: "global" },
    effects: { truthDelta: +6 }
  },
  {
    id: "TS-016",
    faction: "Truth",
    name: "Tabloid Whistleblower",
    type: "MEDIA",
    rarity: "rare",
    cost: 12,
    text: "+8% Truth. Look at opponent's hand.",
    flavor: "The squeak heard round the world.",
    target: { scope: "opponent" },
    effects: { truthDelta: +8, revealOpponentHand: true }
  },
  {
    id: "TS-017",
    faction: "Truth",
    name: "Bat Boy Meets Bigfoot",
    type: "MEDIA",
    rarity: "rare",
    cost: 14,
    text: "+9% Truth. If you control any Zone, draw 1.",
    flavor: "Historic handshake, very furry.",
    target: { scope: "global" },
    effects: { truthDelta: +9, conditional: { ifControlAnyZone: true, draw: 1 } }
  },
  {
    id: "TS-018",
    faction: "Truth",
    name: "Elvis the UFO Pilot",
    type: "MEDIA",
    rarity: "rare",
    cost: 15,
    text: "+10% Truth.",
    flavor: "Thank you, interstellar much.",
    target: { scope: "global" },
    effects: { truthDelta: +10 }
  },

  // ZONE (12)
  {
    id: "TS-019",
    faction: "Truth",
    name: "Haunted Walmart",
    type: "ZONE",
    rarity: "uncommon",
    cost: 12,
    text: "Place in a state. +1 Pressure there. If you own it, +1 IP/turn.",
    flavor: "Rollback prices on cursed dolls.",
    target: { scope: "state" },
    effects: { pressure: { state: "target", amount: 1 }, zone: { perTurn: { ip: { self: +1 } } } }
  },
  {
    id: "TS-020",
    faction: "Truth",
    name: "Cornfield Abduction Site",
    type: "ZONE",
    rarity: "rare",
    cost: 18,
    text: "Place in a state. Counts as +2 Pressure there.",
    flavor: "Free tractor rides included.",
    target: { scope: "state" },
    effects: { pressure: { state: "target", amount: 2 } }
  },
  {
    id: "TS-021",
    faction: "Truth",
    name: "Bigfoot Campground",
    type: "ZONE",
    rarity: "rare",
    cost: 17,
    text: "Place in a state. On capture: +6% Truth.",
    flavor: "Please don't feed the senator.",
    target: { scope: "state" },
    effects: { pressure: { state: "target", amount: 1 }, capture: { state: "target", onCapture: { truthDelta: +6 } } }
  },
  {
    id: "TS-022",
    faction: "Truth",
    name: "Elvis Shrine in Vegas",
    type: "ZONE",
    rarity: "uncommon",
    cost: 13,
    text: "Place in Nevada. If you own it, +2 IP/turn.",
    flavor: "Burning love, steady income.",
    target: { scope: "state", restrict: ["Nevada"] },
    effects: { pressure: { state: "target", amount: 1 }, zone: { perTurn: { ip: { self: +2 } } } }
  },
  {
    id: "TS-023",
    faction: "Truth",
    name: "Grandma's Haunted Basement",
    type: "ZONE",
    rarity: "uncommon",
    cost: 12,
    text: "Place in a state. On capture: +4% Truth.",
    flavor: "Knitting needles levitate on Tuesdays.",
    target: { scope: "state" },
    effects: { pressure: { state: "target", amount: 1 }, capture: { state: "target", onCapture: { truthDelta: +4 } } }
  },
  {
    id: "TS-024",
    faction: "Truth",
    name: "Tabloid Printing Warehouse",
    type: "ZONE",
    rarity: "uncommon",
    cost: 14,
    text: "Place in a state. If you own it, your MEDIA cost -1 IP.",
    flavor: "Ink stains reveal hidden messages.",
    target: { scope: "state" },
    effects: { pressure: { state: "target", amount: 1 }, zone: { aura: { mediaCostDelta: -1 } } }
  },
  {
    id: "TS-025",
    faction: "Truth",
    name: "Ghost Hunter Motel",
    type: "ZONE",
    rarity: "uncommon",
    cost: 12,
    text: "Place in a state. +1 Pressure there. Draw 1 on capture.",
    flavor: "Room service knocks itself.",
    target: { scope: "state" },
    effects: { pressure: { state: "target", amount: 1 }, capture: { state: "target", onCapture: { draw: 1 } } }
  },
  {
    id: "TS-026",
    faction: "Truth",
    name: "Community Radio Tower",
    type: "ZONE",
    rarity: "uncommon",
    cost: 12,
    text: "Place in a state. If you own it, +1 IP/turn and +1% Truth on your turn.",
    flavor: "Static carries secrets.",
    target: { scope: "state" },
    effects: { pressure: { state: "target", amount: 1 }, zone: { perTurn: { ip: { self: +1 }, truthDelta: +1 } } }
  },
  {
    id: "TS-027",
    faction: "Truth",
    name: "Conspiracy Bookstore",
    type: "ZONE",
    rarity: "rare",
    cost: 16,
    text: "Place in a state. If you own it, your draw +1 each turn.",
    flavor: "Stamped 'definitely not a front'.",
    target: { scope: "state" },
    effects: { pressure: { state: "target", amount: 1 }, zone: { perTurn: { draw: 1 } } }
  },
  {
    id: "TS-028",
    faction: "Truth",
    name: "Lake Monster Pier",
    type: "ZONE",
    rarity: "uncommon",
    cost: 13,
    text: "Place in a state with water. On capture: +5% Truth.",
    flavor: "No refunds on splash damage.",
    target: { scope: "state", requireTag: "coastal_or_lake" },
    effects: { pressure: { state: "target", amount: 1 }, capture: { state: "target", onCapture: { truthDelta: +5 } } }
  },
  {
    id: "TS-029",
    faction: "Truth",
    name: "Roadside Elvis Museum",
    type: "ZONE",
    rarity: "uncommon",
    cost: 12,
    text: "Place in a state. If you own it, +1 IP/turn. MEDIA you play named 'Elvis' cost -1.",
    flavor: "Wax figures hum suspiciously on Thursdays.",
    target: { scope: "state" },
    effects: { pressure: { state: "target", amount: 1 }, zone: { perTurn: { ip: { self: +1 } }, tagDiscount: { includes: "Elvis", mediaCostDelta: -1 } } }
  },
  {
    id: "TS-030",
    faction: "Truth",
    name: "Paranormal Fairgrounds",
    type: "ZONE",
    rarity: "rare",
    cost: 17,
    text: "Place in a state. Counts as +2 Pressure there.",
    flavor: "Tilt-a-Whirl screams back.",
    target: { scope: "state" },
    effects: { pressure: { state: "target", amount: 2 } }
  },

  // ATTACK / OPS (10)
  {
    id: "TS-031",
    faction: "Truth",
    name: "Tinfoil Hat Distribution Drive",
    type: "ATTACK",
    rarity: "common",
    cost: 5,
    text: "Cancel 1 Government MEDIA card.",
    flavor: "Family-pack protection.",
    target: { scope: "stack", type: "MEDIA", faction: "Government" },
    effects: { cancel: { type: "MEDIA", faction: "Government" } }
  },
  {
    id: "TS-032",
    faction: "Truth",
    name: "Midnight Radio Broadcast",
    type: "ATTACK",
    rarity: "uncommon",
    cost: 8,
    text: "Opponent -3 IP. Draw 1 card.",
    flavor: "AM band, PM truths.",
    target: { scope: "opponent" },
    effects: { ipDelta: { opponent: -3 }, draw: 1 }
  },
  {
    id: "TS-033",
    faction: "Truth",
    name: "Tabloid Exposé",
    type: "ATTACK",
    rarity: "uncommon",
    cost: 9,
    text: "Target state: -1 Defense this turn.",
    flavor: "Front page beats front line.",
    target: { scope: "state" },
    effects: { defenseDelta: { state: "target", amount: -1, duration: "turn" } }
  },
  {
    id: "TS-034",
    faction: "Truth",
    name: "Ghost Hunter Raid",
    type: "ATTACK",
    rarity: "uncommon",
    cost: 8,
    text: "Opponent discards 1 card at random.",
    flavor: "They ain't afraid of your hand size.",
    target: { scope: "opponent" },
    effects: { discardOpponent: 1, random: true }
  },
  {
    id: "TS-035",
    faction: "Truth",
    name: "UFOlogist Convention",
    type: "ATTACK",
    rarity: "rare",
    cost: 12,
    text: "+5% Truth. Opponent skips next draw.",
    flavor: "Keynote featuring laser pointer to Orion.",
    target: { scope: "opponent" },
    effects: { truthDelta: +5, skipNextDraw: { opponent: true } }
  },
  {
    id: "TS-036",
    faction: "Truth",
    name: "Citizen Tipline Surge",
    type: "ATTACK",
    rarity: "common",
    cost: 6,
    text: "Opponent reveals hand. You may discard one MEDIA from it.",
    flavor: "Hold, your call is very important to justice.",
    target: { scope: "opponent" },
    effects: { revealOpponentHand: true, discardOpponentType: { type: "MEDIA", amount: 1 } }
  },
  {
    id: "TS-037",
    faction: "Truth",
    name: "Phantom File Dump",
    type: "ATTACK",
    rarity: "rare",
    cost: 12,
    text: "Draw 2 cards. Opponent -2 IP.",
    flavor: "Uploaded by user 'ghost_admin'.",
    target: { scope: "opponent" },
    effects: { draw: 2, ipDelta: { opponent: -2 } }
  },
  {
    id: "TS-038",
    faction: "Truth",
    name: "Witness Parade",
    type: "ATTACK",
    rarity: "uncommon",
    cost: 9,
    text: "Target state: +1 Pressure this turn.",
    flavor: "Everybody saw something.",
    target: { scope: "state" },
    effects: { pressure: { state: "target", amount: 1, duration: "turn" } }
  },
  {
    id: "TS-039",
    faction: "Truth",
    name: "Freedom of Information Blitz",
    type: "ATTACK",
    rarity: "rare",
    cost: 13,
    text: "Look at top 3 of your deck. Keep 1, discard 2.",
    flavor: "Heavily unredacted, lightly folded.",
    target: { scope: "self" },
    effects: { scryPick: { self: 3, keep: 1, discard: 2 } }
  },
  {
    id: "TS-040",
    faction: "Truth",
    name: "Mothman Public Warning",
    type: "ATTACK",
    rarity: "uncommon",
    cost: 8,
    text: "Cancel a Government ATTACK.",
    flavor: "Those wings weren't for show.",
    target: { scope: "stack", type: "ATTACK", faction: "Government" },
    effects: { cancel: { type: "ATTACK", faction: "Government" } }
  },

  // DEFENSIVE (5)
  {
    id: "TS-041",
    faction: "Truth",
    name: "Alien Foil Shield",
    type: "DEFENSIVE",
    rarity: "common",
    cost: 5,
    text: "Block the next effect that would reduce Truth this turn.",
    flavor: "Cranial shine, divine design.",
    target: { scope: "self" },
    effects: { protectTruthReduction: { duration: "turn" } }
  },
  {
    id: "TS-042",
    faction: "Truth",
    name: "Community Watch",
    type: "DEFENSIVE",
    rarity: "uncommon",
    cost: 7,
    text: "Cancel a Government ZONE placement.",
    flavor: "Neighborhood eyes beat satellite spies.",
    target: { scope: "stack", type: "ZONE", faction: "Government" },
    effects: { cancel: { type: "ZONE", faction: "Government" } }
  },
  {
    id: "TS-043",
    faction: "Truth",
    name: "Paranoia Rally",
    type: "DEFENSIVE",
    rarity: "uncommon",
    cost: 7,
    text: "Prevent all Truth reduction this turn.",
    flavor: "Chant louder, doubt quieter.",
    target: { scope: "self" },
    effects: { protectTruthReduction: { duration: "turn", global: true } }
  },
  {
    id: "TS-044",
    faction: "Truth",
    name: "Ghostly Intervention",
    type: "DEFENSIVE",
    rarity: "rare",
    cost: 10,
    text: "When opponent makes you discard: cancel that discard.",
    flavor: "Invisible hands hold your hand.",
    target: { scope: "self" },
    effects: { cancelIncomingDiscard: true }
  },
  {
    id: "TS-045",
    faction: "Truth",
    name: "Mothership Umbrella",
    type: "DEFENSIVE",
    rarity: "uncommon",
    cost: 8,
    text: "Cancel a Government MEDIA that reduces Truth.",
    flavor: "Broadcast jammed by cosmic drizzle.",
    target: { scope: "stack", type: "MEDIA", faction: "Government" },
    effects: { cancel: { type: "MEDIA", faction: "Government", onlyIf: { reducesTruth: true } } }
  },

  // DEVELOPMENT / TECH (4)
  {
    id: "TS-046",
    faction: "Truth",
    name: "Citizen Journalism Network",
    type: "DEVELOPMENT",
    rarity: "rare",
    cost: 12,
    text: "At start of your turn: draw +1.",
    flavor: "Many eyes, fewer lies.",
    target: { scope: "self" },
    effects: { ongoing: { perTurn: { draw: 1 } } }
  },
  {
    id: "TS-047",
    faction: "Truth",
    name: "Tabloid Press Alliance",
    type: "DEVELOPMENT",
    rarity: "uncommon",
    cost: 10,
    text: "Your MEDIA cost -1 IP (min 4).",
    flavor: "Coupons clipped from reality.",
    target: { scope: "self" },
    effects: { ongoing: { mediaCostFloor: 4, mediaCostDelta: -1 } }
  },
  {
    id: "TS-048",
    faction: "Truth",
    name: "Bigfoot Merchandise Store",
    type: "DEVELOPMENT",
    rarity: "uncommon",
    cost: 10,
    text: "At start of your turn: +2 IP.",
    flavor: "Socks for enormous feet sell out instantly.",
    target: { scope: "self" },
    effects: { ongoing: { perTurn: { ip: { self: +2 } } } }
  },
  {
    id: "TS-049",
    faction: "Truth",
    name: "Elvis Pirate Radio",
    type: "DEVELOPMENT",
    rarity: "rare",
    cost: 12,
    text: "Your Truth increases from MEDIA are +1% (cap still applies).",
    flavor: "All shook up… and tuned in.",
    target: { scope: "self" },
    effects: { ongoing: { mediaTruthBonus: +1, truthCap: 100 } }
  },

  // LEGENDARY (1)
  {
    id: "TS-050",
    faction: "Truth",
    name: "Bat Boy Returns",
    type: "LEGENDARY",
    rarity: "legendary",
    cost: 30,
    text: "+12% Truth. This round, your ZONE cards cost -2 IP (min 8).",
    flavor: "Running for Senate (again).",
    target: { scope: "global" },
    effects: { truthDelta: +12, roundModifier: { zoneCostDelta: -2, floor: 8 } }
  },

  // ===== BATCH 2: TRUTH SEEKERS (51-100) =====
  // MEDIA (15)
  {
    id: "TS-051",
    faction: "Truth",
    name: "Florida Man Storms UFO Convention",
    type: "MEDIA",
    rarity: "common",
    cost: 6,
    text: "+5% Truth.",
    flavor: "Security was no match for flip-flops and fury.",
    target: { scope: "global" },
    effects: { truthDelta: +5 }
  },
  {
    id: "TS-052",
    faction: "Truth",
    name: "Bat Boy Runs for Mayor",
    type: "MEDIA",
    rarity: "uncommon",
    cost: 8,
    text: "+6% Truth. Gain +1 IP.",
    flavor: "Campaign slogan: 'More Screams, Less Taxes.'",
    target: { scope: "global" },
    effects: { truthDelta: +6, ipDelta: { self: +1 } }
  },
  {
    id: "TS-053",
    faction: "Truth",
    name: "Pastor Rex Predicts Elvis Resurrection",
    type: "MEDIA",
    rarity: "rare",
    cost: 14,
    text: "+9% Truth.",
    flavor: "Sunday service includes suspicious sequins.",
    target: { scope: "global" },
    effects: { truthDelta: +9 }
  },
  {
    id: "TS-054",
    faction: "Truth",
    name: "Tabloid Exposé: Alien Babysitter",
    type: "MEDIA",
    rarity: "common",
    cost: 5,
    text: "+4% Truth. Draw 1 card.",
    flavor: "Best at bedtime stories, worst at curfew.",
    target: { scope: "global" },
    effects: { truthDelta: +4, draw: 1 }
  },
  {
    id: "TS-055",
    faction: "Truth",
    name: "Elvis Sighted at Roswell Diner",
    type: "MEDIA",
    rarity: "uncommon",
    cost: 9,
    text: "+7% Truth.",
    flavor: "Thank you, fried much.",
    target: { scope: "global" },
    effects: { truthDelta: +7 }
  },
  {
    id: "TS-056",
    faction: "Truth",
    name: "Florida Man Publishes Blog",
    type: "MEDIA",
    rarity: "common",
    cost: 6,
    text: "+5% Truth. Opponent -1 IP.",
    flavor: "Powered entirely by gator energy drinks.",
    target: { scope: "opponent" },
    effects: { truthDelta: +5, ipDelta: { opponent: -1 } }
  },
  {
    id: "TS-057",
    faction: "Truth",
    name: "Haunted House Live Stream",
    type: "MEDIA",
    rarity: "common",
    cost: 5,
    text: "+4% Truth.",
    flavor: "Comment section full of ghosts.",
    target: { scope: "global" },
    effects: { truthDelta: +4 }
  },
  {
    id: "TS-058",
    faction: "Truth",
    name: "Local Reporter Exposes Deep State Donuts",
    type: "MEDIA",
    rarity: "uncommon",
    cost: 9,
    text: "+7% Truth. Draw 1.",
    flavor: "Sprinkles cover more than sugar.",
    target: { scope: "global" },
    effects: { truthDelta: +7, draw: 1 }
  },
  {
    id: "TS-059",
    faction: "Truth",
    name: "Bat Boy College Graduation",
    type: "MEDIA",
    rarity: "rare",
    cost: 13,
    text: "+8% Truth. Opponent discards 1 card.",
    flavor: "Major: Paranormal Political Science.",
    target: { scope: "opponent" },
    effects: { truthDelta: +8, discardOpponent: 1 }
  },
  {
    id: "TS-060",
    faction: "Truth",
    name: "Elvis Performs at County Fair",
    type: "MEDIA",
    rarity: "uncommon",
    cost: 9,
    text: "+6% Truth. Gain +1 IP.",
    flavor: "Corn dogs and hound dogs.",
    target: { scope: "global" },
    effects: { truthDelta: +6, ipDelta: { self: +1 } }
  },
  {
    id: "TS-061",
    faction: "Truth",
    name: "Florida Man's UFO TikTok",
    type: "MEDIA",
    rarity: "common",
    cost: 6,
    text: "+5% Truth.",
    flavor: "The aliens subscribed instantly.",
    target: { scope: "global" },
    effects: { truthDelta: +5 }
  },
  {
    id: "TS-062",
    faction: "Truth",
    name: "Pastor Rex Preaches Disclosure",
    type: "MEDIA",
    rarity: "uncommon",
    cost: 10,
    text: "+7% Truth. If above 60%, gain +1 IP.",
    flavor: "Hallelujah, the files are open.",
    target: { scope: "global" },
    effects: { truthDelta: +7, conditional: { ifTruthAtLeast: 60, ipDelta: { self: +1 } } }
  },
  {
    id: "TS-063",
    faction: "Truth",
    name: "Bat Boy Dating Show Scandal",
    type: "MEDIA",
    rarity: "uncommon",
    cost: 9,
    text: "+6% Truth.",
    flavor: "Final rose withheld for national security.",
    target: { scope: "global" },
    effects: { truthDelta: +6 }
  },
  {
    id: "TS-064",
    faction: "Truth",
    name: "Elvis on Mars Tabloid Scoop",
    type: "MEDIA",
    rarity: "rare",
    cost: 14,
    text: "+9% Truth. Draw 1.",
    flavor: "His space suit sparkles.",
    target: { scope: "global" },
    effects: { truthDelta: +9, draw: 1 }
  },
  {
    id: "TS-065",
    faction: "Truth",
    name: "Agent Smitherson's UFO Leak",
    type: "MEDIA",
    rarity: "rare",
    cost: 13,
    text: "+8% Truth. Opponent -2 IP.",
    flavor: "Turns out interns shouldn't have clearance.",
    target: { scope: "opponent" },
    effects: { truthDelta: +8, ipDelta: { opponent: -2 } }
  },

  // ZONE (20)
  {
    id: "TS-066",
    faction: "Truth",
    name: "Bat Boy Fan Club HQ",
    type: "ZONE",
    rarity: "uncommon",
    cost: 13,
    text: "Place in a state. If owned, +1 IP/turn.",
    flavor: "Membership includes free capes.",
    target: { scope: "state" },
    effects: { pressure: { state: "target", amount: 1 }, zone: { perTurn: { ip: { self: +1 } } } }
  },
  {
    id: "TS-067",
    faction: "Truth",
    name: "Elvis Shrine Gas Station",
    type: "ZONE",
    rarity: "uncommon",
    cost: 13,
    text: "Place in a state. If owned, +2 IP/turn.",
    flavor: "Fill up on miracles.",
    target: { scope: "state" },
    effects: { pressure: { state: "target", amount: 1 }, zone: { perTurn: { ip: { self: +2 } } } }
  },
  {
    id: "TS-068",
    faction: "Truth",
    name: "Florida Swamp Watchtower",
    type: "ZONE",
    rarity: "uncommon",
    cost: 12,
    text: "Place in Florida. +1 Pressure, +1% Truth on capture.",
    flavor: "Mosquitoes included.",
    target: { scope: "state", restrict: ["Florida"] },
    effects: { pressure: { state: "target", amount: 1 }, capture: { state: "target", onCapture: { truthDelta: +1 } } }
  },
  {
    id: "TS-069",
    faction: "Truth",
    name: "Haunted Trailer Park",
    type: "ZONE",
    rarity: "uncommon",
    cost: 12,
    text: "Place in a state. +1 Pressure.",
    flavor: "Ghosts pay rent in ectoplasm.",
    target: { scope: "state" },
    effects: { pressure: { state: "target", amount: 1 } }
  },
  {
    id: "TS-070",
    faction: "Truth",
    name: "Pastor Rex's Tent Revival",
    type: "ZONE",
    rarity: "rare",
    cost: 16,
    text: "Place in a state. On capture: +5% Truth.",
    flavor: "Hallelujah, the aliens are among us!",
    target: { scope: "state" },
    effects: { pressure: { state: "target", amount: 1 }, capture: { state: "target", onCapture: { truthDelta: +5 } } }
  },
  {
    id: "TS-071",
    faction: "Truth",
    name: "UFO Crash Carnival",
    type: "ZONE",
    rarity: "uncommon",
    cost: 14,
    text: "Place in a state. If owned, +1 draw/turn.",
    flavor: "Funnel cakes taste out of this world.",
    target: { scope: "state" },
    effects: { pressure: { state: "target", amount: 1 }, zone: { perTurn: { draw: 1 } } }
  },
  {
    id: "TS-072",
    faction: "Truth",
    name: "Elvis Museum Basement",
    type: "ZONE",
    rarity: "uncommon",
    cost: 12,
    text: "Place in a state. On capture: draw 1.",
    flavor: "Thank you, very hidden.",
    target: { scope: "state" },
    effects: { pressure: { state: "target", amount: 1 }, capture: { state: "target", onCapture: { draw: 1 } } }
  },
  {
    id: "TS-073",
    faction: "Truth",
    name: "Bigfoot Nature Reserve",
    type: "ZONE",
    rarity: "rare",
    cost: 18,
    text: "Place in a state. Counts as +2 Pressure.",
    flavor: "Tickets include blurry binoculars.",
    target: { scope: "state" },
    effects: { pressure: { state: "target", amount: 2 } }
  },
  {
    id: "TS-074",
    faction: "Truth",
    name: "Tabloid Printing Press",
    type: "ZONE",
    rarity: "uncommon",
    cost: 13,
    text: "Place in a state. MEDIA cost -1 IP while owned.",
    flavor: "Hot off the paranormal presses.",
    target: { scope: "state" },
    effects: { pressure: { state: "target", amount: 1 }, zone: { aura: { mediaCostDelta: -1 } } }
  },
  {
    id: "TS-075",
    faction: "Truth",
    name: "Haunted Amusement Park",
    type: "ZONE",
    rarity: "rare",
    cost: 17,
    text: "Place in a state. On capture: +6% Truth.",
    flavor: "Roller coasters scream back.",
    target: { scope: "state" },
    effects: { pressure: { state: "target", amount: 1 }, capture: { state: "target", onCapture: { truthDelta: +6 } } }
  },
  {
    id: "TS-076",
    faction: "Truth",
    name: "Florida Roadside Attraction",
    type: "ZONE",
    rarity: "uncommon",
    cost: 13,
    text: "Place in Florida. If owned, +2 IP/turn.",
    flavor: "Gator wrestling, Elvis impersonator optional.",
    target: { scope: "state", restrict: ["Florida"] },
    effects: { pressure: { state: "target", amount: 1 }, zone: { perTurn: { ip: { self: +2 } } } }
  },
  {
    id: "TS-077",
    faction: "Truth",
    name: "Ghost Town Saloon",
    type: "ZONE",
    rarity: "uncommon",
    cost: 12,
    text: "Place in a state. On capture: draw 1.",
    flavor: "Bartender vanished in 1893, still pouring.",
    target: { scope: "state" },
    effects: { pressure: { state: "target", amount: 1 }, capture: { state: "target", onCapture: { draw: 1 } } }
  },
  {
    id: "TS-078",
    faction: "Truth",
    name: "Weekly World Camp",
    type: "ZONE",
    rarity: "uncommon",
    cost: 14,
    text: "Place in a state. If owned, +1 IP/turn and +1% Truth/turn.",
    flavor: "Campers roast government lies.",
    target: { scope: "state" },
    effects: { pressure: { state: "target", amount: 1 }, zone: { perTurn: { ip: { self: +1 }, truthDelta: +1 } } }
  },
  {
    id: "TS-079",
    faction: "Truth",
    name: "UFO Gift Shop",
    type: "ZONE",
    rarity: "uncommon",
    cost: 13,
    text: "Place in a state. If owned, MEDIA cost -1 IP.",
    flavor: "Buy one saucer, get second half off.",
    target: { scope: "state" },
    effects: { pressure: { state: "target", amount: 1 }, zone: { aura: { mediaCostDelta: -1 } } }
  },
  {
    id: "TS-080",
    faction: "Truth",
    name: "Psychic Hotline Headquarters",
    type: "ZONE",
    rarity: "rare",
    cost: 16,
    text: "Place in a state. If owned, draw +1/turn.",
    flavor: "They knew you'd call.",
    target: { scope: "state" },
    effects: { pressure: { state: "target", amount: 1 }, zone: { perTurn: { draw: 1 } } }
  },
  {
    id: "TS-081",
    faction: "Truth",
    name: "Elvis Impersonator Colony",
    type: "ZONE",
    rarity: "rare",
    cost: 18,
    text: "Place in Nevada. Counts as +2 Pressure.",
    flavor: "Hunka hunka state control.",
    target: { scope: "state", restrict: ["Nevada"] },
    effects: { pressure: { state: "target", amount: 2 } }
  },
  {
    id: "TS-082",
    faction: "Truth",
    name: "Bat Boy Hideout",
    type: "ZONE",
    rarity: "uncommon",
    cost: 12,
    text: "Place in a state. On capture: +3% Truth.",
    flavor: "Keeps snacks and secrets.",
    target: { scope: "state" },
    effects: { pressure: { state: "target", amount: 1 }, capture: { state: "target", onCapture: { truthDelta: +3 } } }
  },
  {
    id: "TS-083",
    faction: "Truth",
    name: "Haunted Drive-In Theater",
    type: "ZONE",
    rarity: "uncommon",
    cost: 12,
    text: "Place in a state. +1 Pressure. If owned, +1 IP/turn.",
    flavor: "Movie reel screams louder than the crowd.",
    target: { scope: "state" },
    effects: { pressure: { state: "target", amount: 1 }, zone: { perTurn: { ip: { self: +1 } } } }
  },
  {
    id: "TS-084",
    faction: "Truth",
    name: "Conspiracy College Campus",
    type: "ZONE",
    rarity: "rare",
    cost: 17,
    text: "Place in a state. On capture: +6% Truth.",
    flavor: "Majors include Crop Circles and Elvisology.",
    target: { scope: "state" },
    effects: { pressure: { state: "target", amount: 1 }, capture: { state: "target", onCapture: { truthDelta: +6 } } }
  },
  {
    id: "TS-085",
    faction: "Truth",
    name: "Local Paranormal Newspaper",
    type: "ZONE",
    rarity: "uncommon",
    cost: 13,
    text: "Place in a state. MEDIA cost -1 IP.",
    flavor: "Breaking: government denies breaking.",
    target: { scope: "state" },
    effects: { pressure: { state: "target", amount: 1 }, zone: { aura: { mediaCostDelta: -1 } } }
  },

  // ATTACK / OPS (8)
  {
    id: "TS-086",
    faction: "Truth",
    name: "Expose Agent Smitherson",
    type: "ATTACK",
    rarity: "rare",
    cost: 13,
    text: "Opponent discards 2 cards.",
    flavor: "He's everywhere, yet always late for lunch.",
    target: { scope: "opponent" },
    effects: { discardOpponent: 2 }
  },
  {
    id: "TS-087",
    faction: "Truth",
    name: "Elvis Emergency Broadcast",
    type: "ATTACK",
    rarity: "uncommon",
    cost: 11,
    text: "Cancel a Government MEDIA. +4% Truth.",
    flavor: "Thank you, very interrupted.",
    target: { scope: "stack", type: "MEDIA", faction: "Government" },
    effects: { cancel: { type: "MEDIA", faction: "Government" }, truthDelta: +4 }
  },
  {
    id: "TS-088",
    faction: "Truth",
    name: "Freedom Rally Flash Mob",
    type: "ATTACK",
    rarity: "uncommon",
    cost: 9,
    text: "Target state: +1 Pressure this turn. Draw 1.",
    flavor: "Spontaneous choreography, suspiciously well-filmed.",
    target: { scope: "state" },
    effects: { pressure: { state: "target", amount: 1, duration: "turn" }, draw: 1 }
  },
  {
    id: "TS-089",
    faction: "Truth",
    name: "Bat Boy Town Hall",
    type: "ATTACK",
    rarity: "rare",
    cost: 12,
    text: "Opponent reveals hand. You may discard 1 ATTACK from it.",
    flavor: "Screams counted as public comment.",
    target: { scope: "opponent" },
    effects: { revealOpponentHand: true, discardOpponentType: { type: "ATTACK", amount: 1 } }
  },
  {
    id: "TS-090",
    faction: "Truth",
    name: "Journalist Sting Operation",
    type: "ATTACK",
    rarity: "uncommon",
    cost: 10,
    text: "Opponent -3 IP. If they have ≥10 IP, they lose -5 IP instead.",
    flavor: "Hidden camera, open secrets.",
    target: { scope: "opponent" },
    effects: { ipDelta: { opponent: -3 }, conditional: { ifOpponentIpAtLeast: 10, ipDelta: { opponent: -5 } } }
  },
  {
    id: "TS-091",
    faction: "Truth",
    name: "Crop Circle Press Trap",
    type: "ATTACK",
    rarity: "uncommon",
    cost: 10,
    text: "Cancel a Government ZONE capture this turn.",
    flavor: "Spiral into disappointment.",
    target: { scope: "state" },
    effects: { cancelCapture: { faction: "Government", duration: "turn" } }
  },
  {
    id: "TS-092",
    faction: "Truth",
    name: "Haunted Evidence Drop",
    type: "ATTACK",
    rarity: "rare",
    cost: 11,
    text: "Draw 2. This round, Government ATTACK cards cost +2 IP.",
    flavor: "Files float helpfully into your lap.",
    target: { scope: "global" },
    effects: { draw: 2, roundModifier: { govAttackCostDelta: +2 } }
  },
  {
    id: "TS-093",
    faction: "Truth",
    name: "Elvis Flash Mob Investigation",
    type: "ATTACK",
    rarity: "uncommon",
    cost: 9,
    text: "Nevada only: +1 Pressure. If you own it, gain +2 IP.",
    flavor: "Blue suede clues.",
    target: { scope: "state", restrict: ["Nevada"] },
    effects: { pressure: { state: "target", amount: 1 }, conditional: { ifOwnsState: true, ipDelta: { self: +2 } } }
  },

  // DEFENSIVE (5)
  {
    id: "TS-094",
    faction: "Truth",
    name: "Tabloid Fact-Checkers",
    type: "DEFENSIVE",
    rarity: "common",
    cost: 6,
    text: "Cancel a Government MEDIA that reduces Truth.",
    flavor: "Armed with markers and malice.",
    target: { scope: "stack", type: "MEDIA", faction: "Government" },
    effects: { cancel: { type: "MEDIA", faction: "Government", onlyIf: { reducesTruth: true } } }
  },
  {
    id: "TS-095",
    faction: "Truth",
    name: "Neighborhood Watch Drones",
    type: "DEFENSIVE",
    rarity: "uncommon",
    cost: 7,
    text: "Cancel a Government ATTACK.",
    flavor: "Tiny rotors, big boundaries.",
    target: { scope: "stack", type: "ATTACK", faction: "Government" },
    effects: { cancel: { type: "ATTACK", faction: "Government" } }
  },
  {
    id: "TS-096",
    faction: "Truth",
    name: "Witness Protection (Tabloid Edition)",
    type: "DEFENSIVE",
    rarity: "rare",
    cost: 10,
    text: "When opponent makes you discard, cancel it and draw 1.",
    flavor: "New identity, same sunglasses.",
    target: { scope: "self" },
    effects: { cancelIncomingDiscard: true, draw: 1 }
  },
  {
    id: "TS-097",
    faction: "Truth",
    name: "Community Legal Fund",
    type: "DEFENSIVE",
    rarity: "uncommon",
    cost: 8,
    text: "Prevent up to 2 IP loss to you this turn.",
    flavor: "Sue first, read later.",
    target: { scope: "self" },
    effects: { protectIpLossUpTo: { amount: 2, duration: "turn" } }
  },
  {
    id: "TS-098",
    faction: "Truth",
    name: "Grandma's Blessing",
    type: "DEFENSIVE",
    rarity: "uncommon",
    cost: 7,
    text: "Prevent the first Truth reduction this round. Then +1% Truth.",
    flavor: "Cookies of protection.",
    target: { scope: "self" },
    effects: { protectTruthReduction: { duration: "round", firstOnly: true }, truthDelta: +1 }
  },

  // DEVELOPMENT / TECH (2)
  {
    id: "TS-099",
    faction: "Truth",
    name: "Elvis Fan Network",
    type: "DEVELOPMENT",
    rarity: "rare",
    cost: 12,
    text: "Your MEDIA with 'Elvis' in the name get +1% Truth and cost -1 IP (min 4).",
    flavor: "Fan clubs double as research cells.",
    target: { scope: "self" },
    effects: { ongoing: { mediaNameTag: "Elvis", mediaTruthBonus: +1, mediaCostDelta: -1, mediaCostFloor: 4 } }
  },
  {
    id: "TS-100",
    faction: "Truth",
    name: "Bat Boy Street Team",
    type: "DEVELOPMENT",
    rarity: "rare",
    cost: 12,
    text: "At start of your turn: +1 IP. When you capture a state: draw 1.",
    flavor: "Posters go up faster than rumors.",
    target: { scope: "self" },
    effects: { ongoing: { perTurn: { ip: { self: +1 } }, onCaptureAny: { draw: 1 } } }
  },

  // ===== BATCH 3: TRUTH SEEKERS (101-150) ===== 
  // DEVELOPMENT (6)
  {
    id: "TS-101",
    faction: "Truth",
    name: "The Lone Gunmen",
    type: "DEVELOPMENT",
    rarity: "rare",
    cost: 13,
    text: "When this enters play, cancel 1 Government MEDIA. At start of your turn: draw 1. When you play a MEDIA: gain +1 IP.",
    flavor: "Three hackers, zero hygiene, one friend on the inside.",
    target: { scope: "self" },
    effects: {
      enterPlay: { cancel: { type: "MEDIA", faction: "Government" } },
      ongoing: {
        perTurn: { draw: 1 },
        onPlayType: { type: "MEDIA", ipDelta: { self: +1 } }
      }
    }
  },
  {
    id: "TS-102",
    faction: "Truth",
    name: "Open-Records Taskforce",
    type: "DEVELOPMENT",
    rarity: "uncommon",
    cost: 10,
    text: "Your ATTACK cards cost -1 IP (min 4).",
    flavor: "If it's stamped 'secret', it's stapled to our to-do list.",
    target: { scope: "self" },
    effects: { ongoing: { attackCostDelta: -1, attackCostFloor: 4 } }
  },
  {
    id: "TS-103",
    faction: "Truth",
    name: "Grassroots Press Co-Op",
    type: "DEVELOPMENT",
    rarity: "uncommon",
    cost: 10,
    text: "At start of your turn: +1 IP. MEDIA you play this turn get +1% Truth.",
    flavor: "Ink by the people, for the people.",
    target: { scope: "self" },
    effects: { ongoing: { perTurn: { ip: { self: +1 } }, mediaTruthBonusTurn: +1 } }
  },
  {
    id: "TS-104",
    faction: "Truth",
    name: "Citizen Forensics Lab",
    type: "DEVELOPMENT",
    rarity: "rare",
    cost: 12,
    text: "When you capture a state: +2 IP and draw 1.",
    flavor: "Microscopes donated, miracles improvised.",
    target: { scope: "self" },
    effects: { ongoing: { onCaptureAny: { ipDelta: { self: +2 }, draw: 1 } } }
  },
  {
    id: "TS-105",
    faction: "Truth",
    name: "Truth Meter Calibrator",
    type: "DEVELOPMENT",
    rarity: "uncommon",
    cost: 9,
    text: "The next time your Truth would be reduced this round, prevent up to 5%.",
    flavor: "Batteries not included. Lies excluded.",
    target: { scope: "self" },
    effects: { roundModifier: { preventTruthReductionUpTo: 5 } }
  },
  {
    id: "TS-106",
    faction: "Truth",
    name: "Tinfoil Supply Chain",
    type: "DEVELOPMENT",
    rarity: "uncommon",
    cost: 9,
    text: "Your DEFENSIVE cards cost -1 IP (min 4).",
    flavor: "Industrial-grade hats for industrial-sized cover-ups.",
    target: { scope: "self" },
    effects: { ongoing: { defensiveCostDelta: -1, defensiveCostFloor: 4 } }
  },

  // MEDIA (13)
  {
    id: "TS-107",
    faction: "Truth",
    name: "Elvis Works the Night Shift",
    type: "MEDIA",
    rarity: "uncommon",
    cost: 9,
    text: "+7% Truth.",
    flavor: "Punches in with a glittery glove.",
    target: { scope: "global" },
    effects: { truthDelta: +7 }
  },
  {
    id: "TS-108",
    faction: "Truth",
    name: "Bat Boy Delivers Breaking News",
    type: "MEDIA",
    rarity: "rare",
    cost: 13,
    text: "+8% Truth. Draw 1.",
    flavor: "Screams in AP style.",
    target: { scope: "global" },
    effects: { truthDelta: +8, draw: 1 }
  },
  {
    id: "TS-109",
    faction: "Truth",
    name: "Pastor Rex Calls Out the Lizard Cabal",
    type: "MEDIA",
    rarity: "uncommon",
    cost: 10,
    text: "+7% Truth. Opponent -1 IP.",
    flavor: "Tail between their legs, allegedly.",
    target: { scope: "opponent" },
    effects: { truthDelta: +7, ipDelta: { opponent: -1 } }
  },
  {
    id: "TS-110",
    faction: "Truth",
    name: "Florida Man Finds Government Device",
    type: "MEDIA",
    rarity: "common",
    cost: 6,
    text: "+5% Truth.",
    flavor: "He used it to open soda first.",
    target: { scope: "global" },
    effects: { truthDelta: +5 }
  },
  {
    id: "TS-111",
    faction: "Truth",
    name: "MIB Slip Up on Live TV",
    type: "MEDIA",
    rarity: "rare",
    cost: 14,
    text: "+9% Truth.",
    flavor: "Blink and you'll still see it.",
    target: { scope: "global" },
    effects: { truthDelta: +9 }
  },
  {
    id: "TS-112",
    faction: "Truth",
    name: "Elvis Joins a Book Club",
    type: "MEDIA",
    rarity: "uncommon",
    cost: 9,
    text: "+6% Truth. Gain +1 IP.",
    flavor: "Reads only paperbacks—no fingerprints.",
    target: { scope: "global" },
    effects: { truthDelta: +6, ipDelta: { self: +1 } }
  },
  {
    id: "TS-113",
    faction: "Truth",
    name: "Agent Smitherson's Conscience",
    type: "MEDIA",
    rarity: "rare",
    cost: 13,
    text: "+8% Truth. Opponent discards 1.",
    flavor: "He anonymously CC'd everyone.",
    target: { scope: "opponent" },
    effects: { truthDelta: +8, discardOpponent: 1 }
  },
  {
    id: "TS-114",
    faction: "Truth",
    name: "Blurry Mothman Dashcam",
    type: "MEDIA",
    rarity: "common",
    cost: 6,
    text: "+5% Truth.",
    flavor: "Wingspan: entire windshield.",
    target: { scope: "global" },
    effects: { truthDelta: +5 }
  },
  {
    id: "TS-115",
    faction: "Truth",
    name: "Ghost Jury Finds the Truth",
    type: "MEDIA",
    rarity: "uncommon",
    cost: 10,
    text: "+7% Truth. Draw 1 if you control any Zone.",
    flavor: "Verdict echoes for eternity.",
    target: { scope: "global" },
    effects: { truthDelta: +7, conditional: { ifControlAnyZone: true, draw: 1 } }
  },
  {
    id: "TS-116",
    faction: "Truth",
    name: "Elvis Edits the Front Page",
    type: "MEDIA",
    rarity: "rare",
    cost: 14,
    text: "+9% Truth. Opponent -2 IP.",
    flavor: "Headline: 'Love Me Tender, Tell Me Everything'.",
    target: { scope: "opponent" },
    effects: { truthDelta: +9, ipDelta: { opponent: -2 } }
  },
  {
    id: "TS-117",
    faction: "Truth",
    name: "Local Kid Interviews a Gray",
    type: "MEDIA",
    rarity: "common",
    cost: 5,
    text: "+4% Truth. Draw 1.",
    flavor: "First question: favorite ice cream?",
    target: { scope: "global" },
    effects: { truthDelta: +4, draw: 1 }
  },
  {
    id: "TS-118",
    faction: "Truth",
    name: "Bat Boy Launches a Zine",
    type: "MEDIA",
    rarity: "uncommon",
    cost: 9,
    text: "+6% Truth.",
    flavor: "Stapled with bravado.",
    target: { scope: "global" },
    effects: { truthDelta: +6 }
  },
  {
    id: "TS-119",
    faction: "Truth",
    name: "Psychic Predicts File Drop",
    type: "MEDIA",
    rarity: "uncommon",
    cost: 9,
    text: "+6% Truth. Look at opponent's hand.",
    flavor: "Knew you'd play this.",
    target: { scope: "opponent" },
    effects: { truthDelta: +6, revealOpponentHand: true }
  },

  // ZONE (12)
  {
    id: "TS-120",
    faction: "Truth",
    name: "Desert Billboards of Truth",
    type: "ZONE",
    rarity: "uncommon",
    cost: 12,
    text: "Place in a state. +1 Pressure. If owned, +1 IP/turn.",
    flavor: "Text too big to redact.",
    target: { scope: "state" },
    effects: { pressure: { state: "target", amount: 1 }, zone: { perTurn: { ip: { self: +1 } } } }
  },
  {
    id: "TS-121",
    faction: "Truth",
    name: "Bat Boy Community Center",
    type: "ZONE",
    rarity: "uncommon",
    cost: 13,
    text: "Place in a state. If owned, draw +1/turn.",
    flavor: "After-school programs for aspiring screamers.",
    target: { scope: "state" },
    effects: { pressure: { state: "target", amount: 1 }, zone: { perTurn: { draw: 1 } } }
  },
  {
    id: "TS-122",
    faction: "Truth",
    name: "Elvis Roadside Chapel",
    type: "ZONE",
    rarity: "uncommon",
    cost: 13,
    text: "Place in a state. On capture: +4% Truth.",
    flavor: "Vows exchanged, lies annulled.",
    target: { scope: "state" },
    effects: { pressure: { state: "target", amount: 1 }, capture: { state: "target", onCapture: { truthDelta: +4 } } }
  },
  {
    id: "TS-123",
    faction: "Truth",
    name: "Skywatcher Ridge",
    type: "ZONE",
    rarity: "uncommon",
    cost: 12,
    text: "Place in a state. +1 Pressure there.",
    flavor: "Bring blankets, witness meteors and memos.",
    target: { scope: "state" },
    effects: { pressure: { state: "target", amount: 1 } }
  },
  {
    id: "TS-124",
    faction: "Truth",
    name: "Conspiracy Coffee Roasters",
    type: "ZONE",
    rarity: "uncommon",
    cost: 13,
    text: "Place in a state. If owned, MEDIA cost -1 IP.",
    flavor: "Single-origin skepticism.",
    target: { scope: "state" },
    effects: { pressure: { state: "target", amount: 1 }, zone: { aura: { mediaCostDelta: -1 } } }
  },
  {
    id: "TS-125",
    faction: "Truth",
    name: "Haunted Library Stacks",
    type: "ZONE",
    rarity: "rare",
    cost: 17,
    text: "Place in a state. On capture: draw 2.",
    flavor: "Shhh… the books whisper back.",
    target: { scope: "state" },
    effects: { pressure: { state: "target", amount: 1 }, capture: { state: "target", onCapture: { draw: 2 } } }
  },
  {
    id: "TS-126",
    faction: "Truth",
    name: "Community Scanner Net",
    type: "ZONE",
    rarity: "uncommon",
    cost: 12,
    text: "Place in a state. If owned, +1% Truth/turn.",
    flavor: "Airwaves have nothing to hide.",
    target: { scope: "state" },
    effects: { pressure: { state: "target", amount: 1 }, zone: { perTurn: { truthDelta: +1 } } }
  },
  {
    id: "TS-127",
    faction: "Truth",
    name: "Cryptid Petting Zoo",
    type: "ZONE",
    rarity: "rare",
    cost: 18,
    text: "Place in a state. Counts as +2 Pressure.",
    flavor: "Waiver includes claws and clauses.",
    target: { scope: "state" },
    effects: { pressure: { state: "target", amount: 2 } }
  },
  {
    id: "TS-128",
    faction: "Truth",
    name: "College Radio Conspiracy Hour",
    type: "ZONE",
    rarity: "uncommon",
    cost: 13,
    text: "Place in a state. If owned, +1 IP/turn and your MEDIA get +1% Truth.",
    flavor: "Playlists of leaks and licks.",
    target: { scope: "state" },
    effects: { pressure: { state: "target", amount: 1 }, zone: { perTurn: { ip: { self: +1 } }, aura: { mediaTruthBonus: +1 } } }
  },
  {
    id: "TS-129",
    faction: "Truth",
    name: "Elvis Tribute Casino Lounge",
    type: "ZONE",
    rarity: "rare",
    cost: 18,
    text: "Place in Nevada. If owned, +2 IP/turn.",
    flavor: "House always wins—unless truth shows up.",
    target: { scope: "state", restrict: ["Nevada"] },
    effects: { pressure: { state: "target", amount: 1 }, zone: { perTurn: { ip: { self: +2 } } } }
  },
  {
    id: "TS-130",
    faction: "Truth",
    name: "Public-Access TV Studio",
    type: "ZONE",
    rarity: "uncommon",
    cost: 12,
    text: "Place in a state. On capture: +3% Truth.",
    flavor: "Tonight on 'Open Secrets': everything.",
    target: { scope: "state" },
    effects: { pressure: { state: "target", amount: 1 }, capture: { state: "target", onCapture: { truthDelta: +3 } } }
  },
  {
    id: "TS-131",
    faction: "Truth",
    name: "Haunted National Park",
    type: "ZONE",
    rarity: "rare",
    cost: 17,
    text: "Place in a state. Counts as +2 Pressure.",
    flavor: "Leave only footprints; hear many more.",
    target: { scope: "state" },
    effects: { pressure: { state: "target", amount: 2 } }
  },

  // ATTACK / OPS (11)
  {
    id: "TS-132",
    faction: "Truth",
    name: "Data Breach Whistle",
    type: "ATTACK",
    rarity: "uncommon",
    cost: 10,
    text: "Opponent reveals hand. Discard 1 MEDIA from it.",
    flavor: "The loudest tiny whistle ever printed.",
    target: { scope: "opponent" },
    effects: { revealOpponentHand: true, discardOpponentType: { type: "MEDIA", amount: 1 } }
  },
  {
    id: "TS-133",
    faction: "Truth",
    name: "Press Conference Ambush",
    type: "ATTACK",
    rarity: "uncommon",
    cost: 9,
    text: "Cancel a Government ATTACK.",
    flavor: "First question, final answer.",
    target: { scope: "stack", type: "ATTACK", faction: "Government" },
    effects: { cancel: { type: "ATTACK", faction: "Government" } }
  },
  {
    id: "TS-134",
    faction: "Truth",
    name: "FOIA Lightning Round",
    type: "ATTACK",
    rarity: "rare",
    cost: 12,
    text: "Draw 2. Opponent -2 IP.",
    flavor: "Redaction ink runs in the rain.",
    target: { scope: "opponent" },
    effects: { draw: 2, ipDelta: { opponent: -2 } }
  },
  {
    id: "TS-135",
    faction: "Truth",
    name: "Infiltrate the Briefing",
    type: "ATTACK",
    rarity: "uncommon",
    cost: 10,
    text: "Target state: -1 Defense this turn. Draw 1.",
    flavor: "Credentials printed on recycled secrets.",
    target: { scope: "state" },
    effects: { defenseDelta: { state: "target", amount: -1, duration: "turn" }, draw: 1 }
  },
  {
    id: "TS-136",
    faction: "Truth",
    name: "Crowdsourced Fact Storm",
    type: "ATTACK",
    rarity: "uncommon",
    cost: 9,
    text: "Cancel a Government MEDIA that reduces Truth. Gain +1 IP.",
    flavor: "1,000 comments, one conclusion.",
    target: { scope: "stack", type: "MEDIA", faction: "Government" },
    effects: { cancel: { type: "MEDIA", faction: "Government", onlyIf: { reducesTruth: true } }, ipDelta: { self: +1 } }
  },
  {
    id: "TS-137",
    faction: "Truth",
    name: "Operation Spotlight",
    type: "ATTACK",
    rarity: "rare",
    cost: 12,
    text: "Opponent discards 1 at random. +4% Truth.",
    flavor: "Stage lights melt alibis.",
    target: { scope: "opponent" },
    effects: { discardOpponent: 1, random: true, truthDelta: +4 }
  },
  {
    id: "TS-138",
    faction: "Truth",
    name: "Emergency Broadcast Override",
    type: "ATTACK",
    rarity: "uncommon",
    cost: 11,
    text: "Cancel a Government MEDIA. Draw 1.",
    flavor: "We interrupt your regularly scheduled denial.",
    target: { scope: "stack", type: "MEDIA", faction: "Government" },
    effects: { cancel: { type: "MEDIA", faction: "Government" }, draw: 1 }
  },
  {
    id: "TS-139",
    faction: "Truth",
    name: "Street Reporter Blitz",
    type: "ATTACK",
    rarity: "uncommon",
    cost: 9,
    text: "Target state: +1 Pressure this turn. If captured this turn, +3% Truth.",
    flavor: "Microphones swarm like bees.",
    target: { scope: "state" },
    effects: { pressure: { state: "target", amount: 1, duration: "turn" }, capture: { state: "target", onCapture: { truthDelta: +3 } } }
  },
  {
    id: "TS-140",
    faction: "Truth",
    name: "Subpoena Surprise",
    type: "ATTACK",
    rarity: "rare",
    cost: 12,
    text: "Opponent -3 IP. Reveal opponent's hand.",
    flavor: "Signed by Judge Public Opinion.",
    target: { scope: "opponent" },
    effects: { ipDelta: { opponent: -3 }, revealOpponentHand: true }
  },
  {
    id: "TS-141",
    faction: "Truth",
    name: "Elvis Press Pass",
    type: "ATTACK",
    rarity: "uncommon",
    cost: 10,
    text: "Cancel a Government ZONE placement this turn.",
    flavor: "Laminate of destiny.",
    target: { scope: "stack", type: "ZONE", faction: "Government" },
    effects: { cancel: { type: "ZONE", faction: "Government" } }
  },
  {
    id: "TS-142",
    faction: "Truth",
    name: "Flash-Truth Rally",
    type: "ATTACK",
    rarity: "uncommon",
    cost: 10,
    text: "Global: +4% Truth. If you control 2+ Zones, +1 IP.",
    flavor: "Chants harmonize with sirens.",
    target: { scope: "global" },
    effects: { truthDelta: +4, conditional: { ifControlZonesAtLeast: 2, ipDelta: { self: +1 } } }
  },

  // DEFENSIVE (6)
  {
    id: "TS-143",
    faction: "Truth",
    name: "Phone Tree Counterintel",
    type: "DEFENSIVE",
    rarity: "common",
    cost: 6,
    text: "Cancel a Government ATTACK.",
    flavor: "Ring once if it's a cover-up.",
    target: { scope: "stack", type: "ATTACK", faction: "Government" },
    effects: { cancel: { type: "ATTACK", faction: "Government" } }
  },
  {
    id: "TS-144",
    faction: "Truth",
    name: "Ghost Patrol",
    type: "DEFENSIVE",
    rarity: "uncommon",
    cost: 7,
    text: "Prevent up to 2 IP loss to you this turn. Draw 1.",
    flavor: "Boo! Also, bookkeeping.",
    target: { scope: "self" },
    effects: { protectIpLossUpTo: { amount: 2, duration: "turn" }, draw: 1 }
  },
  {
    id: "TS-145",
    faction: "Truth",
    name: "Public Records Shield",
    type: "DEFENSIVE",
    rarity: "uncommon",
    cost: 7,
    text: "Prevent the next Truth reduction this turn.",
    flavor: "Stapled, stamped, safe.",
    target: { scope: "self" },
    effects: { protectTruthReduction: { duration: "turn" } }
  },
  {
    id: "TS-146",
    faction: "Truth",
    name: "Witness Hotline",
    type: "DEFENSIVE",
    rarity: "uncommon",
    cost: 8,
    text: "When an opponent makes you discard: cancel it and gain +1 IP.",
    flavor: "Press 1 to spill, press 2 to bill.",
    target: { scope: "self" },
    effects: { cancelIncomingDiscard: true, ipDelta: { self: +1 } }
  },
  {
    id: "TS-147",
    faction: "Truth",
    name: "Mothership Cover",
    type: "DEFENSIVE",
    rarity: "uncommon",
    cost: 8,
    text: "Cancel a Government MEDIA that reduces Truth. Draw 1.",
    flavor: "Umbrella policy: extraterrestrial.",
    target: { scope: "stack", type: "MEDIA", faction: "Government" },
    effects: { cancel: { type: "MEDIA", faction: "Government", onlyIf: { reducesTruth: true } }, draw: 1 }
  },
  {
    id: "TS-148",
    faction: "Truth",
    name: "Tabloid Legal Eagles",
    type: "DEFENSIVE",
    rarity: "rare",
    cost: 10,
    text: "Cancel an effect that would remove your Zone.",
    flavor: "Objection sustained, publicity gained.",
    target: { scope: "state" },
    effects: { cancelZoneRemoval: true }
  },

  // LEGENDARY (2)
  {
    id: "TS-149",
    faction: "Truth",
    name: "Bigfoot Senate Campaign",
    type: "LEGENDARY",
    rarity: "legendary",
    cost: 28,
    text: "+15% Truth. Then, in a random state, +2 Pressure.",
    flavor: "A platform of planks and footprints.",
    target: { scope: "global" },
    effects: { truthDelta: +15, randomStateEffect: { pressure: 2 } }
  },
  {
    id: "TS-150",
    faction: "Truth",
    name: "Elvis: The Immortal King",
    type: "LEGENDARY",
    rarity: "legendary",
    cost: 30,
    text: "+12% Truth. Instantly capture Nevada if Pressure ≥ Defense there.",
    flavor: "Long live the King—and the headline.",
    target: { scope: "state" },
    effects: { truthDelta: +12, conditionalCapture: { state: "Nevada" } }
  }
];

// Helper functions for card management
export const getCardsByType = (type: GameCard['type']) => 
  CARD_DATABASE.filter(card => card.type === type);

export const getCardsByRarity = (rarity: GameCard['rarity']) => {
  const allCards = [...CARD_DATABASE, ...extensionManager.getAllExtensionCards()];
  return allCards.filter(card => card.rarity === rarity);
};

export const getRandomCards = (count: number, filters?: {
  type?: GameCard['type'];
  rarity?: GameCard['rarity'];
}): GameCard[] => {
  const allCards = [...CARD_DATABASE, ...extensionManager.getAllExtensionCards()];
  let pool = allCards;
  
  if (filters?.type) {
    pool = pool.filter(card => card.type === filters.type);
  }
  
  if (filters?.rarity) {
    pool = pool.filter(card => card.rarity === filters.rarity);
  }
  
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

export const getCardById = (id: string): GameCard | undefined => {
  const allCards = [...CARD_DATABASE, ...extensionManager.getAllExtensionCards()];
  return allCards.find(card => card.id === id);
};

// Rarity distribution for deck building
export const RARITY_WEIGHTS = {
  common: 0.70,
  uncommon: 0.20,
  rare: 0.08,
  legendary: 0.02
};

export const generateRandomDeck = (size: number = 40): GameCard[] => {
  const deck: GameCard[] = [];
  
  // Combine core cards with extension cards
  const allCards = [...CARD_DATABASE, ...extensionManager.getAllExtensionCards()];
  
  for (let i = 0; i < size; i++) {
    const rand = Math.random();
    let rarity: GameCard['rarity'];
    
    if (rand < RARITY_WEIGHTS.common) {
      rarity = 'common';
    } else if (rand < RARITY_WEIGHTS.common + RARITY_WEIGHTS.uncommon) {
      rarity = 'uncommon';
    } else if (rand < RARITY_WEIGHTS.common + RARITY_WEIGHTS.uncommon + RARITY_WEIGHTS.rare) {
      rarity = 'rare';
    } else {
      rarity = 'legendary';
    }
    
    const cardsOfRarity = allCards.filter(card => card.rarity === rarity);
    if (cardsOfRarity.length > 0) {
      const randomCard = cardsOfRarity[Math.floor(Math.random() * cardsOfRarity.length)];
      deck.push(randomCard);
    }
  }
  
  return deck;
};
