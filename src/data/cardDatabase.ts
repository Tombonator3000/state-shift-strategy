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
// Batch 4 (Truth Seekers 151-200): ✅ Complete
// Batch 5 (Government 1-50): ✅ Complete
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

  // ===== BATCH 4: TRUTH SEEKERS (151-200) =====
  // MEDIA (22)
  {
    id: "TS-151",
    faction: "Truth",
    name: "Elvis Volunteers at Animal Shelter",
    type: "MEDIA",
    rarity: "uncommon",
    cost: 9,
    text: "+6% Truth. Gain +1 IP.",
    flavor: "Hound dogs approved.",
    target: { scope: "global" },
    effects: { truthDelta: +6, ipDelta: { self: +1 } }
  },
  {
    id: "TS-152",
    faction: "Truth",
    name: "Bat Boy Hosts the Evening News",
    type: "MEDIA",
    rarity: "rare",
    cost: 14,
    text: "+9% Truth.",
    flavor: "Top story: screamingly credible.",
    target: { scope: "global" },
    effects: { truthDelta: +9 }
  },
  {
    id: "TS-153",
    faction: "Truth",
    name: "Florida Man's Meteor Fragment",
    type: "MEDIA",
    rarity: "common",
    cost: 5,
    text: "+4% Truth. Draw 1.",
    flavor: "Hot rock, hotter takes.",
    target: { scope: "global" },
    effects: { truthDelta: +4, draw: 1 }
  },
  {
    id: "TS-154",
    faction: "Truth",
    name: "Pastor Rex Declares Open Files Week",
    type: "MEDIA",
    rarity: "uncommon",
    cost: 10,
    text: "+7% Truth. If Truth ≥ 60%, gain +1 IP.",
    flavor: "Bring your own highlighter.",
    target: { scope: "global" },
    effects: { truthDelta: +7, conditional: { ifTruthAtLeast: 60, ipDelta: { self: +1 } } }
  },
  {
    id: "TS-155",
    faction: "Truth",
    name: "Agent Smitherson Leaves a Voicemail",
    type: "MEDIA",
    rarity: "rare",
    cost: 13,
    text: "+8% Truth. Opponent discards 1 card.",
    flavor: "'Do not call back.' *Beep.*",
    target: { scope: "opponent" },
    effects: { truthDelta: +8, discardOpponent: 1 }
  },
  {
    id: "TS-156",
    faction: "Truth",
    name: "Crowd Spots Triangle Craft",
    type: "MEDIA",
    rarity: "common",
    cost: 6,
    text: "+5% Truth.",
    flavor: "Geometry class finally pays off.",
    target: { scope: "global" },
    effects: { truthDelta: +5 }
  },
  {
    id: "TS-157",
    faction: "Truth",
    name: "Elvis Charity Telethon",
    type: "MEDIA",
    rarity: "uncommon",
    cost: 9,
    text: "+6% Truth. Opponent -1 IP.",
    flavor: "All donations tax-deductible from reality.",
    target: { scope: "opponent" },
    effects: { truthDelta: +6, ipDelta: { opponent: -1 } }
  },
  {
    id: "TS-158",
    faction: "Truth",
    name: "UFO Traffic Cam Compilation",
    type: "MEDIA",
    rarity: "common",
    cost: 6,
    text: "+5% Truth.",
    flavor: "Please merge truthfully.",
    target: { scope: "global" },
    effects: { truthDelta: +5 }
  },
  {
    id: "TS-159",
    faction: "Truth",
    name: "Bat Boy Op-Ed: 'I Was There'",
    type: "MEDIA",
    rarity: "uncommon",
    cost: 9,
    text: "+6% Truth. Draw 1 if you control any Zone.",
    flavor: "Has the receipts, keeps the screams.",
    target: { scope: "global" },
    effects: { truthDelta: +6, conditional: { ifControlAnyZone: true, draw: 1 } }
  },
  {
    id: "TS-160",
    faction: "Truth",
    name: "Grandma's Séance Transcript",
    type: "MEDIA",
    rarity: "common",
    cost: 5,
    text: "+4% Truth.",
    flavor: "Meeting minutes by planchette.",
    target: { scope: "global" },
    effects: { truthDelta: +4 }
  },
  {
    id: "TS-161",
    faction: "Truth",
    name: "Elvis Delivers FOIA Request",
    type: "MEDIA",
    rarity: "rare",
    cost: 14,
    text: "+9% Truth. Draw 1.",
    flavor: "Return address: The Heartbreak Hotel.",
    target: { scope: "global" },
    effects: { truthDelta: +9, draw: 1 }
  },
  {
    id: "TS-162",
    faction: "Truth",
    name: "MIB Parking Ticket Goes Viral",
    type: "MEDIA",
    rarity: "uncommon",
    cost: 9,
    text: "+6% Truth. Opponent reveals hand.",
    flavor: "Violation: obvious saucer.",
    target: { scope: "opponent" },
    effects: { truthDelta: +6, revealOpponentHand: true }
  },
  {
    id: "TS-163",
    faction: "Truth",
    name: "Florida Man's Paranormal BBQ",
    type: "MEDIA",
    rarity: "common",
    cost: 6,
    text: "+5% Truth.",
    flavor: "Ribs and revelations.",
    target: { scope: "global" },
    effects: { truthDelta: +5 }
  },
  {
    id: "TS-164",
    faction: "Truth",
    name: "Bat Boy Wins Journalism Award",
    type: "MEDIA",
    rarity: "rare",
    cost: 13,
    text: "+8% Truth. Opponent -2 IP.",
    flavor: "Accepted with a polite shriek.",
    target: { scope: "opponent" },
    effects: { truthDelta: +8, ipDelta: { opponent: -2 } }
  },
  {
    id: "TS-165",
    faction: "Truth",
    name: "Elvis Bus Tour to Area 51",
    type: "MEDIA",
    rarity: "uncommon",
    cost: 10,
    text: "+7% Truth. If you own any Nevada Zone, gain +1 IP.",
    flavor: "No cameras, only camcorders.",
    target: { scope: "global" },
    effects: { truthDelta: +7, conditional: { ifOwnsZoneInState: "Nevada", ipDelta: { self: +1 } } }
  },
  {
    id: "TS-166",
    faction: "Truth",
    name: "Community Leak Drop",
    type: "MEDIA",
    rarity: "common",
    cost: 6,
    text: "+5% Truth.",
    flavor: "The cloud is just a sky hard drive.",
    target: { scope: "global" },
    effects: { truthDelta: +5 }
  },
  {
    id: "TS-167",
    faction: "Truth",
    name: "Paranormal Bake Sale",
    type: "MEDIA",
    rarity: "common",
    cost: 5,
    text: "+4% Truth. Gain +1 IP.",
    flavor: "Cupcakes with classified sprinkles.",
    target: { scope: "global" },
    effects: { truthDelta: +4, ipDelta: { self: +1 } }
  },
  {
    id: "TS-168",
    faction: "Truth",
    name: "Elvis Hologram Town Hall",
    type: "MEDIA",
    rarity: "uncommon",
    cost: 10,
    text: "+7% Truth.",
    flavor: "Questions answered, hips simulated.",
    target: { scope: "global" },
    effects: { truthDelta: +7 }
  },
  {
    id: "TS-169",
    faction: "Truth",
    name: "Blurry Angel Over Courthouse",
    type: "MEDIA",
    rarity: "common",
    cost: 6,
    text: "+5% Truth.",
    flavor: "Attached wings, unattached verdict.",
    target: { scope: "global" },
    effects: { truthDelta: +5 }
  },
  {
    id: "TS-170",
    faction: "Truth",
    name: "Agent Smitherson Misplaces Briefcase",
    type: "MEDIA",
    rarity: "rare",
    cost: 14,
    text: "+9% Truth. Opponent discards 1 at random.",
    flavor: "Contents: oops, everything.",
    target: { scope: "opponent" },
    effects: { truthDelta: +9, discardOpponent: 1, random: true }
  },
  {
    id: "TS-171",
    faction: "Truth",
    name: "Crowdfunded Telescope Network",
    type: "MEDIA",
    rarity: "uncommon",
    cost: 9,
    text: "+6% Truth. Look at the top 3 of your deck; keep 1, discard 2.",
    flavor: "Eyes everywhere, budget nowhere.",
    target: { scope: "self" },
    effects: { truthDelta: +6, scryPick: { self: 3, keep: 1, discard: 2 } }
  },
  {
    id: "TS-172",
    faction: "Truth",
    name: "Tabloid 'Truth or Dare' Special",
    type: "MEDIA",
    rarity: "uncommon",
    cost: 9,
    text: "+6% Truth. If you control any Zone, gain +1 IP.",
    flavor: "Dares accepted by democracy.",
    target: { scope: "global" },
    effects: { truthDelta: +6, conditional: { ifControlAnyZone: true, ipDelta: { self: +1 } } }
  },

  // ZONE (10)
  {
    id: "TS-173",
    faction: "Truth",
    name: "Elvis Roadhouse",
    type: "ZONE",
    rarity: "uncommon",
    cost: 13,
    text: "Place in a state. If owned, +2 IP/turn.",
    flavor: "Open late, secrets later.",
    target: { scope: "state" },
    effects: { pressure: { state: "target", amount: 1 }, zone: { perTurn: { ip: { self: +2 } } } }
  },
  {
    id: "TS-174",
    faction: "Truth",
    name: "Bat Boy Youth Center",
    type: "ZONE",
    rarity: "uncommon",
    cost: 12,
    text: "Place in a state. If owned, draw +1/turn.",
    flavor: "Homework: screaming practice.",
    target: { scope: "state" },
    effects: { pressure: { state: "target", amount: 1 }, zone: { perTurn: { draw: 1 } } }
  },
  {
    id: "TS-175",
    faction: "Truth",
    name: "Haunted Subway Platform",
    type: "ZONE",
    rarity: "uncommon",
    cost: 12,
    text: "Place in a state. +1 Pressure. On capture: +3% Truth.",
    flavor: "Next arrival: transparency.",
    target: { scope: "state" },
    effects: { pressure: { state: "target", amount: 1 }, capture: { state: "target", onCapture: { truthDelta: +3 } } }
  },
  {
    id: "TS-176",
    faction: "Truth",
    name: "Community Print Shop",
    type: "ZONE",
    rarity: "uncommon",
    cost: 13,
    text: "Place in a state. MEDIA you play cost -1 IP (min 4).",
    flavor: "Ink smudges improve credibility.",
    target: { scope: "state" },
    effects: { pressure: { state: "target", amount: 1 }, zone: { aura: { mediaCostDelta: -1, mediaCostFloor: 4 } } }
  },
  {
    id: "TS-177",
    faction: "Truth",
    name: "Lake Monster Boardwalk",
    type: "ZONE",
    rarity: "rare",
    cost: 18,
    text: "Place in a state with water. Counts as +2 Pressure.",
    flavor: "Souvenir shops sell periscopes.",
    target: { scope: "state", requireTag: "coastal_or_lake" },
    effects: { pressure: { state: "target", amount: 2 } }
  },
  {
    id: "TS-178",
    faction: "Truth",
    name: "Paranormal Podcast Studio",
    type: "ZONE",
    rarity: "uncommon",
    cost: 13,
    text: "Place in a state. If owned, +1 IP/turn and +1% Truth/turn.",
    flavor: "Recorded live in an undisclosed basement.",
    target: { scope: "state" },
    effects: { pressure: { state: "target", amount: 1 }, zone: { perTurn: { ip: { self: +1 }, truthDelta: +1 } } }
  },
  {
    id: "TS-179",
    faction: "Truth",
    name: "Conspiracy Flea Market",
    type: "ZONE",
    rarity: "uncommon",
    cost: 12,
    text: "Place in a state. On capture: draw 1. If owned, +1 IP/turn.",
    flavor: "Gently used evidence.",
    target: { scope: "state" },
    effects: { pressure: { state: "target", amount: 1 }, capture: { state: "target", onCapture: { draw: 1 } }, zone: { perTurn: { ip: { self: +1 } } } }
  },
  {
    id: "TS-180",
    faction: "Truth",
    name: "Ghost-Lit Lighthouse",
    type: "ZONE",
    rarity: "uncommon",
    cost: 12,
    text: "Place in a coastal state. +1 Pressure.",
    flavor: "Beam bends around secrets.",
    target: { scope: "state", requireTag: "coastal" },
    effects: { pressure: { state: "target", amount: 1 } }
  },
  {
    id: "TS-181",
    faction: "Truth",
    name: "Elvis Chapel of Revelations",
    type: "ZONE",
    rarity: "rare",
    cost: 17,
    text: "Place in a state. On capture: +6% Truth.",
    flavor: "Choir hums suspiciously familiar melodies.",
    target: { scope: "state" },
    effects: { pressure: { state: "target", amount: 1 }, capture: { state: "target", onCapture: { truthDelta: +6 } } }
  },
  {
    id: "TS-182",
    faction: "Truth",
    name: "Bat Boy Archives",
    type: "ZONE",
    rarity: "uncommon",
    cost: 13,
    text: "Place in a state. If owned, your ATTACK cards cost -1 (min 4).",
    flavor: "Files arranged by shriek pitch.",
    target: { scope: "state" },
    effects: { pressure: { state: "target", amount: 1 }, zone: { aura: { attackCostDelta: -1, attackCostFloor: 4 } } }
  },

  // ATTACK / OPS (9)
  {
    id: "TS-183",
    faction: "Truth",
    name: "Open Mic Press Briefing",
    type: "ATTACK",
    rarity: "uncommon",
    cost: 10,
    text: "Cancel a Government MEDIA. Draw 1.",
    flavor: "Mic check, lie wreck.",
    target: { scope: "stack", type: "MEDIA", faction: "Government" },
    effects: { cancel: { type: "MEDIA", faction: "Government" }, draw: 1 }
  },
  {
    id: "TS-184",
    faction: "Truth",
    name: "Neighborhood Drone Surge",
    type: "ATTACK",
    rarity: "uncommon",
    cost: 10,
    text: "Target state: +1 Pressure this turn. Scry 2.",
    flavor: "Eyes in the sky, pies on the porch.",
    target: { scope: "state" },
    effects: { pressure: { state: "target", amount: 1, duration: "turn" }, scry: 2 }
  },
  {
    id: "TS-185",
    faction: "Truth",
    name: "Leaks to Local Paper",
    type: "ATTACK",
    rarity: "uncommon",
    cost: 9,
    text: "Opponent reveals hand. Discard 1 ATTACK from it.",
    flavor: "Ink beats intimidation.",
    target: { scope: "opponent" },
    effects: { revealOpponentHand: true, discardOpponentType: { type: "ATTACK", amount: 1 } }
  },
  {
    id: "TS-186",
    faction: "Truth",
    name: "Citizen Audit",
    type: "ATTACK",
    rarity: "rare",
    cost: 12,
    text: "Opponent -3 IP. If they have ≥10 IP, they lose -5 IP instead.",
    flavor: "Receipts stapled to reality.",
    target: { scope: "opponent" },
    effects: { ipDelta: { opponent: -3 }, conditional: { ifOpponentIpAtLeast: 10, ipDelta: { opponent: -5 } } }
  },
  {
    id: "TS-187",
    faction: "Truth",
    name: "Midnight Signal Boost",
    type: "ATTACK",
    rarity: "uncommon",
    cost: 9,
    text: "+4% Truth. Opponent skips next draw.",
    flavor: "Static speaks volumes.",
    target: { scope: "opponent" },
    effects: { truthDelta: +4, skipNextDraw: { opponent: true } }
  },
  {
    id: "TS-188",
    faction: "Truth",
    name: "Counter-Spin Workshop",
    type: "ATTACK",
    rarity: "uncommon",
    cost: 9,
    text: "Cancel a Government MEDIA that reduces Truth. Gain +1 IP.",
    flavor: "Spin class for facts.",
    target: { scope: "stack", type: "MEDIA", faction: "Government" },
    effects: { cancel: { type: "MEDIA", faction: "Government", onlyIf: { reducesTruth: true } }, ipDelta: { self: +1 } }
  },
  {
    id: "TS-189",
    faction: "Truth",
    name: "FOIA Blitz Marathon",
    type: "ATTACK",
    rarity: "rare",
    cost: 12,
    text: "Draw 2. Opponent -2 IP.",
    flavor: "Paper cuts to the narrative.",
    target: { scope: "opponent" },
    effects: { draw: 2, ipDelta: { opponent: -2 } }
  },
  {
    id: "TS-190",
    faction: "Truth",
    name: "Flash Mob Fact-Check",
    type: "ATTACK",
    rarity: "uncommon",
    cost: 10,
    text: "Target state: -1 Defense this turn. Draw 1.",
    flavor: "Synchronised citations.",
    target: { scope: "state" },
    effects: { defenseDelta: { state: "target", amount: -1, duration: "turn" }, draw: 1 }
  },
  {
    id: "TS-191",
    faction: "Truth",
    name: "Mothman Siren",
    type: "ATTACK",
    rarity: "uncommon",
    cost: 10,
    text: "Cancel a Government ZONE capture this turn.",
    flavor: "Wings over weak points.",
    target: { scope: "state" },
    effects: { cancelCapture: { faction: "Government", duration: "turn" } }
  },

  // DEFENSIVE (4)
  {
    id: "TS-192",
    faction: "Truth",
    name: "Copier Jam of Destiny",
    type: "DEFENSIVE",
    rarity: "common",
    cost: 6,
    text: "Prevent the next effect that would make you discard this turn.",
    flavor: "Paper wins this round.",
    target: { scope: "self" },
    effects: { cancelIncomingDiscard: true }
  },
  {
    id: "TS-193",
    faction: "Truth",
    name: "Neighborhood Witness Net",
    type: "DEFENSIVE",
    rarity: "uncommon",
    cost: 7,
    text: "Cancel a Government ATTACK.",
    flavor: "We saw that coming.",
    target: { scope: "stack", type: "ATTACK", faction: "Government" },
    effects: { cancel: { type: "ATTACK", faction: "Government" } }
  },
  {
    id: "TS-194",
    faction: "Truth",
    name: "Courthouse Candlelight Vigil",
    type: "DEFENSIVE",
    rarity: "uncommon",
    cost: 8,
    text: "Prevent up to 2 IP loss to you this turn. +1% Truth.",
    flavor: "Light pierces ledger lines.",
    target: { scope: "self" },
    effects: { protectIpLossUpTo: { amount: 2, duration: "turn" }, truthDelta: +1 }
  },
  {
    id: "TS-195",
    faction: "Truth",
    name: "Ghost Jury Nullification",
    type: "DEFENSIVE",
    rarity: "rare",
    cost: 10,
    text: "Cancel an effect that would remove your Zone.",
    flavor: "Overruled by the afterlife.",
    target: { scope: "state" },
    effects: { cancelZoneRemoval: true }
  },

  // DEVELOPMENT (3)
  {
    id: "TS-196",
    faction: "Truth",
    name: "Open Source Investigators",
    type: "DEVELOPMENT",
    rarity: "uncommon",
    cost: 10,
    text: "At start of your turn: draw +1 if you control any Zone.",
    flavor: "Threads that pull threads.",
    target: { scope: "self" },
    effects: { ongoing: { ifControlAnyZone: true, perTurn: { draw: 1 } } }
  },
  {
    id: "TS-197",
    faction: "Truth",
    name: "Community Legal Hotline",
    type: "DEVELOPMENT",
    rarity: "uncommon",
    cost: 10,
    text: "Your ATTACK and DEFENSIVE cards cost -1 (min 4).",
    flavor: "Pro bono; anti baloney.",
    target: { scope: "self" },
    effects: { ongoing: { attackCostDelta: -1, defensiveCostDelta: -1, floor: 4 } }
  },
  {
    id: "TS-198",
    faction: "Truth",
    name: "Citizen Signal Repeaters",
    type: "DEVELOPMENT",
    rarity: "rare",
    cost: 12,
    text: "At start of your turn: +1 IP and +1% Truth.",
    flavor: "Boosters for both bandwidth and belief.",
    target: { scope: "self" },
    effects: { ongoing: { perTurn: { ip: { self: +1 }, truthDelta: +1 } } }
  },

  // LEGENDARY (2)
  {
    id: "TS-199",
    faction: "Truth",
    name: "Alien Disclosure Day",
    type: "LEGENDARY",
    rarity: "legendary",
    cost: 27,
    text: "+15% Truth. This round, your MEDIA gain +1% Truth and cost -1 IP (min 4).",
    flavor: "Today's forecast: raining receipts.",
    target: { scope: "global" },
    effects: { truthDelta: +15, roundModifier: { mediaTruthBonus: +1, mediaCostDelta: -1, mediaCostFloor: 4 } }
  },
  {
    id: "TS-200",
    faction: "Truth",
    name: "The Great Awakening",
    type: "LEGENDARY",
    rarity: "legendary",
    cost: 30,
    text: "+12% Truth. Opponent discards their hand. Draw 2.",
    flavor: "Eyes open, jaws drop, files fall.",
    target: { scope: "opponent" },
    effects: { truthDelta: +12, discardOpponentAll: true, draw: 2 }
  },
  
  // ===== BATCH 5: GOVERNMENT (1-50) =====
  {
    id: "GOV-001",
    faction: "Government",
    name: "Routine Training Exercise",
    type: "MEDIA",
    rarity: "common",
    cost: 6,
    text: "Issue a bland bulletin that reframes today's headlines as drills. Reduce global Truth and gain minor IP.",
    flavor: "Nothing to see here. Please remain calm.",
    target: { scope: "global" },
    effects: { truthDelta: -4, ipDelta: { self: +2 } }
  },
  {
    id: "GOV-002",
    faction: "Government",
    name: "Redacted Press Briefing",
    type: "MEDIA",
    rarity: "uncommon",
    cost: 8,
    text: "Flood the feed with black bars. Reduce Truth; opponent discards a Media card at random.",
    flavor: "The fewer words, the safer the world.",
    target: { scope: "opponent" },
    effects: { truthDelta: -5, discardOpponent: 1, discardType: "MEDIA", random: true }
  },
  {
    id: "GOV-003",
    faction: "Government",
    name: "Continuity of Government Protocol",
    type: "DEVELOPMENT",
    rarity: "uncommon",
    cost: 10,
    text: "Set up shadow command lines. Gain IP now and more each round.",
    flavor: "Democracy is great. Backups are greater.",
    target: { scope: "self" },
    effects: { ipDelta: { self: +4 }, ongoing: { perTurn: { ip: { self: +2 } }, duration: 3 } }
  },
  {
    id: "GOV-004",
    faction: "Government",
    name: "Classified Briefing Room",
    type: "ZONE",
    rarity: "common",
    cost: 7,
    text: "Establish a secure Zone in a State. +2 Defense there; Truth checks in that state are harder.",
    flavor: "No windows, two clocks, three alarms.",
    target: { scope: "state" },
    effects: { pressure: { state: "target", amount: 1 }, zone: { defense: +2, aura: { truthCheckPenalty: -1 } } }
  },
  {
    id: "GOV-005",
    faction: "Government",
    name: "FOIA Slow-Walk",
    type: "DEFENSIVE",
    rarity: "common",
    cost: 5,
    text: "Delay release. Cancel a Truth MEDIA card targeting global/state this round.",
    flavor: "Your transparency request is very important to us.",
    target: { scope: "stack", type: "MEDIA", faction: "Truth" },
    effects: { cancel: { type: "MEDIA", faction: "Truth" } }
  },
  {
    id: "GOV-006",
    faction: "Government",
    name: "Operation Mockingbird II",
    type: "MEDIA",
    rarity: "rare",
    cost: 12,
    text: "Coordinate friendly anchors. Reduce Truth; draw 1.",
    flavor: "Tonight's top story was approved at noon.",
    target: { scope: "global" },
    effects: { truthDelta: -7, draw: 1 }
  },
  {
    id: "GOV-007",
    faction: "Government",
    name: "National Security Waiver",
    type: "DEFENSIVE",
    rarity: "uncommon",
    cost: 9,
    text: "Impose a security carve-out. Prevent Zone capture in one state this round; gain small IP.",
    flavor: "In the interest of national serenity.",
    target: { scope: "state" },
    effects: { preventCapture: { state: "target", duration: "round" }, ipDelta: { self: +2 } }
  },
  {
    id: "GOV-008",
    faction: "Government",
    name: "Budget Reprogramming",
    type: "DEVELOPMENT",
    rarity: "common",
    cost: 6,
    text: "Quietly shuffle funds. Gain IP; opponent loses IP.",
    flavor: "Line items are a state of mind.",
    target: { scope: "global" },
    effects: { ipDelta: { self: +3, opponent: -2 } }
  },
  {
    id: "GOV-009",
    faction: "Government",
    name: "Men in Charcoal",
    type: "ATTACK",
    rarity: "uncommon",
    cost: 9,
    text: "An unmarked sedan visit. Drain opponent IP and peek at their hand.",
    flavor: "They don't need badges when they have clipboards.",
    target: { scope: "opponent" },
    effects: { ipDelta: { opponent: -4 }, revealOpponentHand: true }
  },
  {
    id: "GOV-010",
    faction: "Government",
    name: "Compartmentalization",
    type: "DEVELOPMENT",
    rarity: "uncommon",
    cost: 8,
    text: "Silo the truth. Your Zones gain +1 Defense for 2 rounds.",
    flavor: "The left hand files the right hand.",
    target: { scope: "self" },
    effects: { ongoing: { zoneDefenseBonus: +1, duration: 2 } }
  },
  {
    id: "GOV-011",
    faction: "Government",
    name: "Intercept & Disrupt",
    type: "ATTACK",
    rarity: "common",
    cost: 7,
    text: "Jam channels. Opponent skips next draw; reduce Truth slightly.",
    flavor: "Static is the sound of safety.",
    target: { scope: "opponent" },
    effects: { skipNextDraw: { opponent: 1 }, truthDelta: -3 }
  },
  {
    id: "GOV-012",
    faction: "Government",
    name: "Crisis Actor Auditions",
    type: "MEDIA",
    rarity: "common",
    cost: 6,
    text: "Seed incredulity. Reduce Truth; gain IP if a Truth MEDIA was played this round.",
    flavor: "Please cry on lines two and three.",
    target: { scope: "global" },
    effects: { truthDelta: -4, conditional: { ifTruthMediaPlayedThisRound: { ipDelta: { self: +2 } } } }
  },
  {
    id: "GOV-013",
    faction: "Government",
    name: "Roswell Storage Hangar",
    type: "ZONE",
    rarity: "uncommon",
    cost: 9,
    text: "Found it, filed it, forgot it. Establish a Zone with +3 Defense; Truth checks here suffer −1.",
    flavor: "Crates labeled 'Weather Balloon' (wink).",
    target: { scope: "state" },
    effects: { pressure: { state: "target", amount: 1 }, zone: { defense: +3, aura: { truthCheckPenalty: -1 } } }
  },
  {
    id: "GOV-014",
    faction: "Government",
    name: "Emergency Broadcast Override",
    type: "MEDIA",
    rarity: "rare",
    cost: 13,
    text: "Hijack the air. Reduce global Truth and draw 2.",
    flavor: "Your regularly scheduled reality will return shortly.",
    target: { scope: "global" },
    effects: { truthDelta: -8, draw: 2 }
  },
  {
    id: "GOV-015",
    faction: "Government",
    name: "SIGINT Sweep",
    type: "DEVELOPMENT",
    rarity: "common",
    cost: 6,
    text: "Harvest everything. Gain IP now and next round.",
    flavor: "If it beeped, we kept it.",
    target: { scope: "self" },
    effects: { ipDelta: { self: +3 }, ongoing: { perTurn: { ip: { self: +2 } }, duration: 1 } }
  },
  {
    id: "GOV-016",
    faction: "Government",
    name: "Plausible Deniability",
    type: "DEFENSIVE",
    rarity: "common",
    cost: 5,
    text: "When targeted by an Attack, cancel it and reduce Truth a bit.",
    flavor: "We can neither confirm nor deny that we denied.",
    target: { scope: "self" },
    effects: { cancel: { type: "ATTACK", targeting: "self" }, truthDelta: -2 }
  },
  {
    id: "GOV-017",
    faction: "Government",
    name: "Underground Briefing Theater",
    type: "ZONE",
    rarity: "common",
    cost: 7,
    text: "Create a subterranean Zone. +2 Defense; draw 1 when established.",
    flavor: "Seats 12, alarms 13.",
    target: { scope: "state" },
    effects: { pressure: { state: "target", amount: 1 }, zone: { defense: +2, onCreate: { draw: 1 } } }
  },
  {
    id: "GOV-018",
    faction: "Government",
    name: "Shell Company Carousel",
    type: "DEVELOPMENT",
    rarity: "uncommon",
    cost: 9,
    text: "Spin the ledger. Gain IP; if you control ≥2 Zones, gain extra.",
    flavor: "Money laundering? Please, we dry-clean it.",
    target: { scope: "self" },
    effects: { ipDelta: { self: +4 }, conditional: { ifControlZonesAtLeast: 2, ipDelta: { self: +3 } } }
  },
  {
    id: "GOV-019",
    faction: "Government",
    name: "Counter-Meme Task Force",
    type: "MEDIA",
    rarity: "common",
    cost: 6,
    text: "Deploy debunk macros. Reduce Truth and increase Pressure in a state.",
    flavor: "Clip art is a weapon system.",
    target: { scope: "state" },
    effects: { truthDelta: -4, pressure: { state: "target", amount: 2 } }
  },
  {
    id: "GOV-020",
    faction: "Government",
    name: "Honeytrap Asset",
    type: "ATTACK",
    rarity: "uncommon",
    cost: 8,
    text: "Lure, leak, leverage. Drain IP; reveal opponent hand.",
    flavor: "Sign here. Smile there.",
    target: { scope: "opponent" },
    effects: { ipDelta: { opponent: -4 }, revealOpponentHand: true }
  },
  {
    id: "GOV-021",
    faction: "Government",
    name: "National Security Letter",
    type: "DEFENSIVE",
    rarity: "uncommon",
    cost: 8,
    text: "Silence a source. Cancel a Truth ATTACK; opponent discards 1.",
    flavor: "Gag orders pair well with coffee.",
    target: { scope: "stack", type: "ATTACK", faction: "Truth" },
    effects: { cancel: { type: "ATTACK", faction: "Truth" }, discardOpponent: 1 }
  },
  {
    id: "GOV-022",
    faction: "Government",
    name: "Ghost Budget Annex",
    type: "DEVELOPMENT",
    rarity: "rare",
    cost: 12,
    text: "Hidden appropriations. Gain a large IP burst.",
    flavor: "Zeroes are patriotic.",
    target: { scope: "self" },
    effects: { ipDelta: { self: +8 } }
  },
  {
    id: "GOV-023",
    faction: "Government",
    name: "Airport Backroom",
    type: "ZONE",
    rarity: "common",
    cost: 7,
    text: "Set up a 'secondary screening' zone. +2 Defense; opponent skips next draw if they try to capture here.",
    flavor: "Shoes off. Beliefs off.",
    target: { scope: "state" },
    effects: { pressure: { state: "target", amount: 1 }, zone: { defense: +2, trap: { onCaptureAttempt: { skipNextDraw: { opponent: 1 } } } } }
  },
  {
    id: "GOV-024",
    faction: "Government",
    name: "Cutout Courier",
    type: "DEVELOPMENT",
    rarity: "common",
    cost: 5,
    text: "Move messages by hand. Draw 1; gain 2 IP.",
    flavor: "Trust the trench coat.",
    target: { scope: "self" },
    effects: { draw: 1, ipDelta: { self: +2 } }
  },
  {
    id: "GOV-025",
    faction: "Government",
    name: "Cigarette Whisperer",
    type: "MEDIA",
    rarity: "rare",
    cost: 11,
    text: "An unnamed official shapes the narrative. Reduce Truth significantly.",
    flavor: "The smoke alarm is for show.",
    target: { scope: "global" },
    effects: { truthDelta: -8 }
  },
  {
    id: "GOV-026",
    faction: "Government",
    name: "Operation Paper Shuffle",
    type: "DEFENSIVE",
    rarity: "common",
    cost: 6,
    text: "Bury the file. Increase Defense on one of your Zones this round; reduce Truth slightly.",
    flavor: "Filed under 'Sometime'.",
    target: { scope: "zone" },
    effects: { defenseDelta: { zone: "target", amount: +2, duration: "round" }, truthDelta: -2 }
  },
  {
    id: "GOV-027",
    faction: "Government",
    name: "Denver Airport Bunker",
    type: "ZONE",
    rarity: "rare",
    cost: 12,
    text: "Activate subterranean murals. +4 Defense; per turn gain +1 IP while controlled.",
    flavor: "Art, tunnels, and a lot of keycards.",
    target: { scope: "state" },
    effects: { pressure: { state: "target", amount: 1 }, zone: { defense: +4, perTurn: { ip: { self: +1 } } } }
  },
  {
    id: "GOV-028",
    faction: "Government",
    name: "Black Helicopters",
    type: "ATTACK",
    rarity: "common",
    cost: 7,
    text: "Chop the night air. Drain IP and reduce Truth slightly.",
    flavor: "You can hear them when it's too late.",
    target: { scope: "opponent" },
    effects: { ipDelta: { opponent: -3 }, truthDelta: -3 }
  },
  {
    id: "GOV-029",
    faction: "Government",
    name: "Declassification, Eventually",
    type: "MEDIA",
    rarity: "common",
    cost: 5,
    text: "Promise transparency tomorrow. Reduce Truth today.",
    flavor: "History will vindicate page 47.",
    target: { scope: "global" },
    effects: { truthDelta: -4 }
  },
  {
    id: "GOV-030",
    faction: "Government",
    name: "Fusion Center Grid",
    type: "DEVELOPMENT",
    rarity: "uncommon",
    cost: 9,
    text: "Link agencies. Your next two Attacks cost −1 IP and draw 1 after play.",
    flavor: "Interoperability is its own language.",
    target: { scope: "self" },
    effects: { buffNextCards: { type: "ATTACK", count: 2, costModifier: -1, onPlay: { draw: 1 } } }
  },
  {
    id: "GOV-031",
    faction: "Government",
    name: "Sealed Indictment",
    type: "ATTACK",
    rarity: "uncommon",
    cost: 8,
    text: "Serve papers in the dark. Opponent discards 2; lose 1 more if they control a Zone.",
    flavor: "Allegedly mandatory.",
    target: { scope: "opponent" },
    effects: { discardOpponent: 2, conditional: { ifOpponentControlsZonesAtLeast: 1, ipDelta: { opponent: -1 } } }
  },
  {
    id: "GOV-032",
    faction: "Government",
    name: "Telecom Compliance",
    type: "DEVELOPMENT",
    rarity: "common",
    cost: 6,
    text: "Handshake with carriers. Gain IP; next Truth MEDIA against you costs +1 IP.",
    flavor: "Terms of service, revised.",
    target: { scope: "self" },
    effects: { ipDelta: { self: +3 }, debuffOpponentNext: { type: "MEDIA", faction: "Truth", costModifier: +1 } }
  },
  {
    id: "GOV-033",
    faction: "Government",
    name: "Desert Storage Yard",
    type: "ZONE",
    rarity: "common",
    cost: 7,
    text: "Miles of crates at sunset. +2 Defense; opponent Truth checks here −1.",
    flavor: "Everything important is in row 51.",
    target: { scope: "state" },
    effects: { pressure: { state: "target", amount: 1 }, zone: { defense: +2, aura: { truthCheckPenalty: -1 } } }
  },
  {
    id: "GOV-034",
    faction: "Government",
    name: "Friendly Fact-Checker",
    type: "MEDIA",
    rarity: "uncommon",
    cost: 8,
    text: "Rate claims 'Missing Context'. Reduce Truth; if a Truth card was canceled this round, gain IP.",
    flavor: "Four Pinocchios wearing sunglasses.",
    target: { scope: "global" },
    effects: { truthDelta: -5, conditional: { ifTruthCardCanceledThisRound: { ipDelta: { self: +3 } } } }
  },
  {
    id: "GOV-035",
    faction: "Government",
    name: "Strategic Briefcase",
    type: "DEFENSIVE",
    rarity: "common",
    cost: 5,
    text: "Play when targeted. Cancel an opponent Attack and draw 1.",
    flavor: "It's full of paper and power.",
    target: { scope: "self" },
    effects: { cancel: { type: "ATTACK", faction: "opponent" }, draw: 1 }
  },
  {
    id: "GOV-036",
    faction: "Government",
    name: "Wilderness Listening Post",
    type: "ZONE",
    rarity: "uncommon",
    cost: 9,
    text: "Pines, dishes, and deniability. +3 Defense; per turn, reduce local Truth by 1%.",
    flavor: "Owls aren't what they seem. Neither are antennas.",
    target: { scope: "state" },
    effects: { pressure: { state: "target", amount: 1 }, zone: { defense: +3, perTurn: { truthDelta: -1 } } }
  },
  {
    id: "GOV-037",
    faction: "Government",
    name: "Kryptek Asset",
    type: "ATTACK",
    rarity: "rare",
    cost: 12,
    text: "Your double-agent strikes. Drain IP and cancel a random Truth card in hand (non-Legendary).",
    flavor: "A handshake you don't wash off.",
    target: { scope: "opponent" },
    effects: { ipDelta: { opponent: -5 }, randomCancelInHand: { faction: "Truth", excludeRarity: "legendary", count: 1 } }
  },
  {
    id: "GOV-038",
    faction: "Government",
    name: "Compliance Audit",
    type: "DEFENSIVE",
    rarity: "uncommon",
    cost: 8,
    text: "Target a state. Opponent Attacks against that state cost +2 IP this round.",
    flavor: "Forms first, outrage later.",
    target: { scope: "state" },
    effects: { taxOpponentPlays: { type: "ATTACK", scope: "targetState", costModifier: +2, duration: "round" } }
  },
  {
    id: "GOV-039",
    faction: "Government",
    name: "Press Pool Lockdown",
    type: "MEDIA",
    rarity: "common",
    cost: 6,
    text: "Rope off the narrative. Reduce Truth and opponent skips next draw if they played Media this round.",
    flavor: "Coverage is a privilege.",
    target: { scope: "opponent" },
    effects: { truthDelta: -4, conditional: { ifOpponentPlayedType: "MEDIA", skipNextDraw: { opponent: 1 } } }
  },
  {
    id: "GOV-040",
    faction: "Government",
    name: "Security Theater",
    type: "MEDIA",
    rarity: "uncommon",
    cost: 8,
    text: "Make a big show of safety. Reduce Truth; gain +1 Pressure in two states.",
    flavor: "Now with 30% more beeping.",
    target: { scope: "state" },
    effects: { truthDelta: -5, multiStateEffect: { count: 2, pressure: { amount: 1 } } }
  },
  {
    id: "GOV-041",
    faction: "Government",
    name: "Records Sealed by Court",
    type: "DEFENSIVE",
    rarity: "rare",
    cost: 11,
    text: "Global order. Cancel the next two Truth MEDIA plays this round.",
    flavor: "Justice is blindfolded and ear-plugged.",
    target: { scope: "global" },
    effects: { cancel: { type: "MEDIA", faction: "Truth", count: 2, duration: "round" } }
  },
  {
    id: "GOV-042",
    faction: "Government",
    name: "Harbor Dock Warehouse",
    type: "ZONE",
    rarity: "common",
    cost: 7,
    text: "Crates arrive at night. +2 Defense; if you control 3+ Zones, gain 2 IP.",
    flavor: "Manifest says 'miscellaneous'.",
    target: { scope: "state" },
    effects: { pressure: { state: "target", amount: 1 }, zone: { defense: +2 }, conditional: { ifControlZonesAtLeast: 3, ipDelta: { self: +2 } } }
  },
  {
    id: "GOV-043",
    faction: "Government",
    name: "Psychological Operations Cell",
    type: "DEVELOPMENT",
    rarity: "uncommon",
    cost: 9,
    text: "Calibrate narratives. Your next MEDIA reduces +2% extra Truth.",
    flavor: "We A/B test reality.",
    target: { scope: "self" },
    effects: { buffNextCards: { type: "MEDIA", count: 1, truthDeltaModifier: -2 } }
  },
  {
    id: "GOV-044",
    faction: "Government",
    name: "Unmarked Evidence Locker",
    type: "ZONE",
    rarity: "uncommon",
    cost: 9,
    text: "Things go in. Stories stop out. +3 Defense; opponent discards 1 when attempting capture.",
    flavor: "Keyholders unknown.",
    target: { scope: "state" },
    effects: { pressure: { state: "target", amount: 1 }, zone: { defense: +3, trap: { onCaptureAttempt: { discardOpponent: 1 } } } }
  },
  {
    id: "GOV-045",
    faction: "Government",
    name: "Lizard Lobby Luncheon",
    type: "MEDIA",
    rarity: "common",
    cost: 5,
    text: "Serve conspiracy canapé. Reduce Truth slightly; gain 1 IP.",
    flavor: "The salad blinks first.",
    target: { scope: "global" },
    effects: { truthDelta: -3, ipDelta: { self: +1 } }
  },
  {
    id: "GOV-046",
    faction: "Government",
    name: "Black Budget Skunkworks",
    type: "DEVELOPMENT",
    rarity: "rare",
    cost: 12,
    text: "Prototype secrecy. Gain 6 IP; your Attacks cost −1 next round.",
    flavor: "Innovation you'll never hear about.",
    target: { scope: "self" },
    effects: { ipDelta: { self: +6 }, roundModifier: { attackCostDelta: -1 } }
  },
  {
    id: "GOV-047",
    faction: "Government",
    name: "Mount Weather Complex",
    type: "ZONE",
    rarity: "rare",
    cost: 13,
    text: "Command from the mountain. +4 Defense; while controlled, your Media reduce +1% extra Truth.",
    flavor: "When the lights go out, these go on.",
    target: { scope: "state" },
    effects: { pressure: { state: "target", amount: 1 }, zone: { defense: +4, aura: { mediaTruthBonus: -1 } } }
  },
  {
    id: "GOV-048",
    faction: "Government",
    name: "Witness Relocation",
    type: "DEFENSIVE",
    rarity: "uncommon",
    cost: 9,
    text: "Move the mouth. Cancel a Truth ATTACK; reduce Truth by 3%.",
    flavor: "New name, same story—now quieter.",
    target: { scope: "stack", type: "ATTACK", faction: "Truth" },
    effects: { cancel: { type: "ATTACK", faction: "Truth" }, truthDelta: -3 }
  },
  {
    id: "GOV-049",
    faction: "Government",
    name: "Council Above the Ceiling",
    type: "LEGENDARY",
    rarity: "legendary",
    cost: 28,
    text: "Pull unseen levers. Reduce global Truth massively; steal a Zone if your Pressure ≥ its Defense.",
    flavor: "Minutes not taken. Decisions irreversible.",
    target: { scope: "global" },
    effects: { truthDelta: -15, conditional: { stealZoneIf: { pressureAtLeastDefense: true } } }
  },
  {
    id: "GOV-050",
    faction: "Government",
    name: "Executive Privilege Blanket",
    type: "MEDIA",
    rarity: "rare",
    cost: 11,
    text: "Throw the blanket over everything. Reduce Truth and opponent loses 3 IP.",
    flavor: "It's not a cover-up if it's a comforter.",
    target: { scope: "global" },
    effects: { truthDelta: -8, ipDelta: { opponent: -3 } }
  },
  // Government Batch 2 Cards (GOV-051 to GOV-100)
  {
    id: "GOV-051",
    faction: "Government",
    name: "Men in Black Squad",
    type: "ATTACK",
    rarity: "uncommon",
    cost: 9,
    text: "Deploy shadowy agents. Suppress one Truth card in play until end of round; opponent loses 2 IP.",
    flavor: "Nobody remembers the encounter… and that's the point.",
    target: { scope: "opponent" },
    effects: { cancel: { type: "any", scope: "Truth", timing: "thisRound", count: 1 }, ipDelta: { opponent: -2 } }
  },
  {
    id: "GOV-052",
    faction: "Government",
    name: "Weather Control Division",
    type: "ZONE",
    rarity: "uncommon",
    cost: 9,
    text: "Target a State. Establish a Zone that prevents Truth bonuses here. +2 Defense.",
    flavor: "Forecast: 100% chance of plausible deniability.",
    target: { scope: "state" },
    effects: { pressure: { state: "target", amount: 1 }, zone: { defenseDelta: 2, aura: { blockTruthBonus: true } } }
  },
  {
    id: "GOV-053",
    faction: "Government",
    name: "Cigarette Whisperer",
    type: "MEDIA",
    rarity: "rare",
    cost: 12,
    text: "An unnamed official reshapes the narrative. Reduce Truth by 8%.",
    flavor: "His smoke breaks last decades.",
    target: { scope: "global" },
    effects: { truthDelta: -8 }
  },
  {
    id: "GOV-054",
    faction: "Government",
    name: "Operation Mockingbird 2.0",
    type: "MEDIA",
    rarity: "uncommon",
    cost: 10,
    text: "Flood the networks. Truth player discards a Media card at random and Truth falls.",
    flavor: "Sponsored by your friendly neighborhood broadcast network.",
    target: { scope: "opponent" },
    effects: { discardOpponent: { type: "MEDIA", amount: 1 }, truthDelta: -5 }
  },
  {
    id: "GOV-055",
    faction: "Government",
    name: "National Security Red Tape",
    type: "DEFENSIVE",
    rarity: "common",
    cost: 6,
    text: "Block one play. Opponent cannot replay it until next round.",
    flavor: "Forms must be filed in triplicate, notarized, and burned.",
    target: { scope: "opponent" },
    effects: { cancel: { type: "any", scope: "opponent", timing: "thisRound" }, debuffOpponentNext: { replayDelay: 1 } }
  },
  {
    id: "GOV-056",
    faction: "Government",
    name: "Shadow Budget",
    type: "DEVELOPMENT",
    rarity: "common",
    cost: 8,
    text: "Gain 4 IP now and +1 IP each turn for 2 rounds.",
    flavor: "Somewhere, in an Excel sheet nobody is allowed to open.",
    target: { scope: "self" },
    effects: { ipDelta: { self: +4 }, ongoing: { perTurn: { ip: { self: +1 } }, duration: 2 } }
  },
  {
    id: "GOV-057",
    faction: "Government",
    name: "Alien Autopsy Cover-Up",
    type: "ATTACK",
    rarity: "rare",
    cost: 11,
    text: "Remove one active Truth Zone permanently; opponent loses 2 IP.",
    flavor: "Grainy VHS footage? Totally fake. Trust us.",
    target: { scope: "state" },
    effects: { destroyZone: { faction: "Truth" }, ipDelta: { opponent: -2 } }
  },
  {
    id: "GOV-058",
    faction: "Government",
    name: "Black Site Expansion",
    type: "ZONE",
    rarity: "uncommon",
    cost: 9,
    text: "Establish a detention Zone. +3 Defense; opponent discards 1 if they attempt capture here.",
    flavor: "You'll never find it on Google Maps.",
    target: { scope: "state" },
    effects: { pressure: { state: "target", amount: 1 }, zone: { defenseDelta: 3, trap: { whenAttemptCaptureByOpponent: { discardOpponent: { amount: 1 } } } } }
  },
  {
    id: "GOV-059",
    faction: "Government",
    name: "Patriot Act Reloaded",
    type: "MEDIA",
    rarity: "uncommon",
    cost: 10,
    text: "Increase costs for Truth cards. All Truth cards cost +1 IP this round.",
    flavor: "For your safety. Definitely not ours.",
    target: { scope: "global" },
    effects: { debuffOpponentNext: { type: "any", scope: "Truth", costModifier: 1 } }
  },
  {
    id: "GOV-060",
    faction: "Government",
    name: "Mind Control Fluoride",
    type: "MEDIA",
    rarity: "common",
    cost: 8,
    text: "Truth player skips their draw step next round. Reduce Truth by 3%.",
    flavor: "It's in the water. Drink up.",
    target: { scope: "opponent" },
    effects: { skipNextDraw: { opponent: 1 }, truthDelta: -3 }
  },
  {
    id: "GOV-061",
    faction: "Government",
    name: "Department of Denials",
    type: "DEVELOPMENT",
    rarity: "common",
    cost: 7,
    text: "Negate one active Truth Development. Gain 2 IP.",
    flavor: '"We can neither confirm nor deny…"',
    target: { scope: "opponent" },
    effects: { destroyDevelopment: { faction: "Truth" }, ipDelta: { self: +2 } }
  },
  {
    id: "GOV-062",
    faction: "Government",
    name: "Krycek the Double Agent",
    type: "ATTACK",
    rarity: "rare",
    cost: 12,
    text: "Steal one random card from opponent's hand. Opponent loses 3 IP.",
    flavor: "He works for everyone. And no one.",
    target: { scope: "opponent" },
    effects: { stealCardFromOpponent: 1, ipDelta: { opponent: -3 } }
  },
  {
    id: "GOV-063",
    faction: "Government",
    name: "Eternal Committee Hearing",
    type: "DEFENSIVE",
    rarity: "common",
    cost: 7,
    text: "Delay one Truth card for 2 rounds.",
    flavor: "Please hold. Your conspiracy is important to us.",
    target: { scope: "opponent" },
    effects: { delayOpponentCard: { duration: 2 } }
  },
  {
    id: "GOV-064",
    faction: "Government",
    name: "Big Brother Surveillance",
    type: "ZONE",
    rarity: "common",
    cost: 8,
    text: "Zone: Each turn you may look at opponent's hand. +2 Defense.",
    flavor: "Your camera is on.",
    target: { scope: "state" },
    effects: { pressure: { state: "target", amount: 1 }, zone: { defenseDelta: 2, perTurn: { revealOpponentHand: true } } }
  },
  {
    id: "GOV-065",
    faction: "Government",
    name: "Agent Smitherson Cameo",
    type: "DEFENSIVE",
    rarity: "uncommon",
    cost: 8,
    text: "Cancel a random Truth card played this round (50% chance).",
    flavor: "Always in the background, always adjusting his tie.",
    target: { scope: "opponent" },
    effects: { randomCancelInPlay: { faction: "Truth", chancePercent: 50 } }
  },
  {
    id: "GOV-066",
    faction: "Government",
    name: "Underground Archive",
    type: "ZONE",
    rarity: "common",
    cost: 7,
    text: "Store secrets. +2 Defense; draw 1 when established.",
    flavor: "Microfilm never dies.",
    target: { scope: "state" },
    effects: { pressure: { state: "target", amount: 1 }, zone: { defenseDelta: 2 }, onCreate: { draw: 1 } }
  },
  {
    id: "GOV-067",
    faction: "Government",
    name: "Spin Control Office",
    type: "DEVELOPMENT",
    rarity: "uncommon",
    cost: 9,
    text: "Your Media cards reduce +2% more Truth this round.",
    flavor: "The narrative never rests.",
    target: { scope: "self" },
    effects: { buffNextCards: { type: "MEDIA", count: 2, truthDeltaModifier: -2 } }
  },
  {
    id: "GOV-068",
    faction: "Government",
    name: "Crash Retrieval Zone",
    type: "ZONE",
    rarity: "uncommon",
    cost: 9,
    text: "Set up cordons. +3 Defense; opponent loses 1 IP when attempting capture.",
    flavor: "Shiny wreckage becomes classified instantly.",
    target: { scope: "state" },
    effects: { pressure: { state: "target", amount: 1 }, zone: { defenseDelta: 3, trap: { whenAttemptCaptureByOpponent: { ipDelta: { opponent: -1 } } } } }
  },
  {
    id: "GOV-069",
    faction: "Government",
    name: "Closed Session",
    type: "MEDIA",
    rarity: "common",
    cost: 6,
    text: "Reduce Truth by 4%. Opponent discards 1 if they played Media this round.",
    flavor: "All cameras off, all lies on.",
    target: { scope: "global" },
    effects: { truthDelta: -4, conditional: { ifOpponentPlayed: { type: "MEDIA", discardOpponent: { amount: 1 } } } }
  },
  {
    id: "GOV-070",
    faction: "Government",
    name: "Psych Ops Lab",
    type: "ZONE",
    rarity: "uncommon",
    cost: 10,
    text: "Establish lab. +3 Defense. Each round, reduce local Truth by 1%.",
    flavor: "Testing slogans on rats and voters alike.",
    target: { scope: "state" },
    effects: { pressure: { state: "target", amount: 1 }, zone: { defenseDelta: 3, perTurn: { localTruthDelta: -1 } } }
  },
  {
    id: "GOV-071",
    faction: "Government",
    name: "Red Phone Network",
    type: "DEVELOPMENT",
    rarity: "rare",
    cost: 12,
    text: "Emergency line. Draw 2 each time you play a Defensive card.",
    flavor: "One ring controls all.",
    target: { scope: "self" },
    effects: { ongoing: { triggerOn: { playCard: "DEFENSIVE" }, then: { draw: 2 }, duration: 3 } }
  },
  {
    id: "GOV-072",
    faction: "Government",
    name: "Containment Zone",
    type: "ZONE",
    rarity: "common",
    cost: 8,
    text: "Seal off a state. +2 Defense; prevent Pressure gain for opponent this round.",
    flavor: "Cones, tape, and classified tape.",
    target: { scope: "state" },
    effects: { pressure: { state: "target", amount: 1 }, zone: { defenseDelta: 2, aura: { preventOpponentPressure: true } } }
  },
  {
    id: "GOV-073",
    faction: "Government",
    name: "Obfuscation Bureau",
    type: "DEVELOPMENT",
    rarity: "common",
    cost: 7,
    text: "Whenever you reduce Truth, gain +1 IP.",
    flavor: "The truth hurts, but pays well.",
    target: { scope: "self" },
    effects: { ongoing: { triggerOn: { truthDeltaNegative: true }, then: { ipDelta: { self: +1 } }, duration: 3 } }
  },
  {
    id: "GOV-074",
    faction: "Government",
    name: "FOIA Shredder Room",
    type: "ZONE",
    rarity: "common",
    cost: 8,
    text: "Every Truth discard costs them 1 extra IP while this Zone is active.",
    flavor: "The shredder is always hungry.",
    target: { scope: "state" },
    effects: { pressure: { state: "target", amount: 1 }, zone: { aura: { taxOpponentDiscards: 1 } } }
  },
  {
    id: "GOV-075",
    faction: "Government",
    name: "National Guard Rollout",
    type: "DEFENSIVE",
    rarity: "common",
    cost: 6,
    text: "Cancel a Truth Zone capture this round.",
    flavor: "Nothing to see, nothing to seize.",
    target: { scope: "state" },
    effects: { preventCapture: true }
  },
  {
    id: "GOV-076",
    faction: "Government",
    name: "Redaction Vault",
    type: "ZONE",
    rarity: "rare",
    cost: 12,
    text: "Massive archive Zone. +4 Defense; Truth cards cost +1 IP globally while active.",
    flavor: "█████████ everywhere.",
    target: { scope: "state" },
    effects: { pressure: { state: "target", amount: 1 }, zone: { defenseDelta: 4, aura: { truthCardsCostModifier: 1 } } }
  },
  {
    id: "GOV-077",
    faction: "Government",
    name: "Satellite Uplink",
    type: "ZONE",
    rarity: "uncommon",
    cost: 9,
    text: "Spy Zone. +3 Defense; per turn gain 1 IP.",
    flavor: "Every ping is patriotism.",
    target: { scope: "state" },
    effects: { pressure: { state: "target", amount: 1 }, zone: { defenseDelta: 3, perTurn: { ip: { self: +1 } } } }
  },
  {
    id: "GOV-078",
    faction: "Government",
    name: "Political Lobby",
    type: "DEVELOPMENT",
    rarity: "uncommon",
    cost: 10,
    text: "Your Attacks drain +1 IP.",
    flavor: "Bribes are the sincerest form of flattery.",
    target: { scope: "self" },
    effects: { ongoing: { buffAttacks: { ipDeltaOpponentModifier: -1 }, duration: 3 } }
  },
  {
    id: "GOV-079",
    faction: "Government",
    name: "Crisis Management Zone",
    type: "ZONE",
    rarity: "common",
    cost: 8,
    text: "Zone: +2 Defense; when opponent plays Media, reduce Truth by 1%.",
    flavor: "Every crisis needs a committee.",
    target: { scope: "state" },
    effects: { pressure: { state: "target", amount: 1 }, zone: { defenseDelta: 2, trap: { whenOpponentPlay: { type: "MEDIA", truthDelta: -1 } } } }
  },
  {
    id: "GOV-080",
    faction: "Government",
    name: "Continuity Bunker",
    type: "ZONE",
    rarity: "rare",
    cost: 13,
    text: "If you control this Zone, prevent global Truth increases greater than +5%.",
    flavor: "Built for a rainy doomsday.",
    target: { scope: "state" },
    effects: { pressure: { state: "target", amount: 1 }, zone: { defenseDelta: 4, aura: { clampTruthIncrease: 5 } } }
  },
  {
    id: "GOV-081",
    faction: "Government",
    name: "Spin Doctors' Lounge",
    type: "DEVELOPMENT",
    rarity: "rare",
    cost: 12,
    text: "Whenever you play Media, gain 2 IP.",
    flavor: "Prescription: more headlines.",
    target: { scope: "self" },
    effects: { ongoing: { triggerOn: { playCard: "MEDIA" }, then: { ipDelta: { self: +2 } }, duration: 3 } }
  },
  {
    id: "GOV-082",
    faction: "Government",
    name: "Federal PsyOps Center",
    type: "ZONE",
    rarity: "rare",
    cost: 12,
    text: "Each round, opponent loses 1 IP. +3 Defense.",
    flavor: "Their nightmares are our research notes.",
    target: { scope: "state" },
    effects: { pressure: { state: "target", amount: 1 }, zone: { defenseDelta: 3, perTurn: { ip: { opponent: -1 } } } }
  },
  {
    id: "GOV-083",
    faction: "Government",
    name: "Temporal Containment Lab",
    type: "ZONE",
    rarity: "uncommon",
    cost: 9,
    text: "Strange experiments. +3 Defense; opponent skips next draw when attempting capture.",
    flavor: "We filed time under Pending.",
    target: { scope: "state" },
    effects: { pressure: { state: "target", amount: 1 }, zone: { defenseDelta: 3, trap: { whenAttemptCaptureByOpponent: { skipNextDraw: { opponent: 1 } } } } }
  },
  {
    id: "GOV-084",
    faction: "Government",
    name: "Council of the Unseen",
    type: "LEGENDARY",
    rarity: "legendary",
    cost: 28,
    text: "Reduce Truth by 15%. Steal 1 Zone if your Pressure ≥ Defense.",
    flavor: "Minutes vanish, so do freedoms.",
    target: { scope: "global" },
    effects: { truthDelta: -15, conditional: { stealZoneIf: { pressureAtLeastDefense: true } } }
  },
  {
    id: "GOV-085",
    faction: "Government",
    name: "Front Organization",
    type: "DEVELOPMENT",
    rarity: "common",
    cost: 7,
    text: "Play: Gain 3 IP. Ongoing: +1 Defense to your weakest Zone.",
    flavor: "Looks legit, smells classified.",
    target: { scope: "self" },
    effects: { ipDelta: { self: +3 }, ongoing: { buffWeakestZoneDefense: 1, duration: 2 } }
  },
  {
    id: "GOV-086",
    faction: "Government",
    name: "Controlled Media Outlet",
    type: "ZONE",
    rarity: "common",
    cost: 8,
    text: "Zone: +2 Defense. Each time opponent plays Media, they lose 1 IP.",
    flavor: "Your news, their loss.",
    target: { scope: "state" },
    effects: { pressure: { state: "target", amount: 1 }, zone: { defenseDelta: 2, trap: { whenOpponentPlay: { type: "MEDIA", ipDelta: { opponent: -1 } } } } }
  },
  {
    id: "GOV-087",
    faction: "Government",
    name: "Surplus MRAP Parade",
    type: "DEFENSIVE",
    rarity: "uncommon",
    cost: 9,
    text: "Target state gets +3 Defense this round; reduce Truth slightly.",
    flavor: "Intimidation is a safety feature.",
    target: { scope: "state" },
    effects: { defenseDelta: { amount: 3, duration: 1 }, truthDelta: -2 }
  },
  {
    id: "GOV-088",
    faction: "Government",
    name: "Continuity Servers",
    type: "DEVELOPMENT",
    rarity: "uncommon",
    cost: 9,
    text: "Your next two DEFENSIVE cards cost −1 IP and draw 1 on play.",
    flavor: "Backups for backups.",
    target: { scope: "self" },
    effects: { buffNextCards: { type: "DEFENSIVE", count: 2, costModifier: -1, onPlay: { draw: 1 } } }
  },
  {
    id: "GOV-089",
    faction: "Government",
    name: "Airport Media Pen",
    type: "ZONE",
    rarity: "common",
    cost: 8,
    text: "Zone: +2 Defense. When opponent tries to capture, reduce global Truth by 1%.",
    flavor: "Roped-off narratives.",
    target: { scope: "state" },
    effects: { pressure: { state: "target", amount: 1 }, zone: { defenseDelta: 2, trap: { whenAttemptCaptureByOpponent: { truthDelta: -1 } } } }
  },
  {
    id: "GOV-090",
    faction: "Government",
    name: "Compliance Audit",
    type: "DEFENSIVE",
    rarity: "uncommon",
    cost: 8,
    text: "Opponent Attacks targeting this state cost +2 IP this round.",
    flavor: "Forms first, outrage later.",
    target: { scope: "state" },
    effects: { taxOpponentPlays: { type: "ATTACK", scope: "targetState", costModifier: 2, duration: 1 } }
  },
  {
    id: "GOV-091",
    faction: "Government",
    name: "Continuity Signal Test",
    type: "MEDIA",
    rarity: "uncommon",
    cost: 8,
    text: "Reduce Truth; if you control 3+ Zones, reduce an extra 2%.",
    flavor: "This is only a drill. Or is it?",
    target: { scope: "global" },
    effects: { truthDelta: -4, conditional: { ifZonesControlledAtLeast: { count: 3, truthDelta: -2 } } }
  },
  {
    id: "GOV-092",
    faction: "Government",
    name: "Perimeter Cameras",
    type: "ZONE",
    rarity: "common",
    cost: 7,
    text: "Zone: +2 Defense. When created, gain 2 IP.",
    flavor: "The red light means 'welcome'.",
    target: { scope: "state" },
    effects: { pressure: { state: "target", amount: 1 }, zone: { defenseDelta: 2 }, onCreate: { ipDelta: { self: +2 } } }
  },
  {
    id: "GOV-093",
    faction: "Government",
    name: "Leaker's New Job",
    type: "ATTACK",
    rarity: "common",
    cost: 8,
    text: "Drain 3 IP; if opponent revealed their hand this round, drain +1 IP.",
    flavor: "Promotion to 'Elsewhere'.",
    target: { scope: "opponent" },
    effects: { ipDelta: { opponent: -3 }, conditional: { ifOpponentHandRevealedThisRound: { ipDelta: { opponent: -1 } } } }
  },
  {
    id: "GOV-094",
    faction: "Government",
    name: "Data Fusion Hub",
    type: "ZONE",
    rarity: "uncommon",
    cost: 9,
    text: "Zone: +3 Defense. Your next ATTACK this round costs −1 IP.",
    flavor: "Interoperability is when everyone watches you together.",
    target: { scope: "state" },
    effects: { pressure: { state: "target", amount: 1 }, zone: { defenseDelta: 3 }, onCreate: { buffNextCards: { type: "ATTACK", count: 1, costModifier: -1 } } }
  },
  {
    id: "GOV-095",
    faction: "Government",
    name: "Dry-Labbed Results",
    type: "MEDIA",
    rarity: "common",
    cost: 6,
    text: "Release supportive 'studies'. Reduce Truth; draw 1.",
    flavor: "Peer review by peers we hired.",
    target: { scope: "global" },
    effects: { truthDelta: -3, draw: 1 }
  },
  {
    id: "GOV-096",
    faction: "Government",
    name: "Wilderness Listening Post",
    type: "ZONE",
    rarity: "uncommon",
    cost: 9,
    text: "Zone: +3 Defense. Each turn, local Truth −1%.",
    flavor: "Owls aren't what they seem. Neither are antennas.",
    target: { scope: "state" },
    effects: { pressure: { state: "target", amount: 1 }, zone: { defenseDelta: 3, perTurn: { localTruthDelta: -1 } } }
  },
  {
    id: "GOV-097",
    faction: "Government",
    name: "National Security Letter",
    type: "DEFENSIVE",
    rarity: "uncommon",
    cost: 8,
    text: "Cancel a Truth ATTACK; opponent discards 1.",
    flavor: "Gag orders pair well with coffee.",
    target: { scope: "opponent" },
    effects: { cancel: { type: "ATTACK", scope: "Truth", timing: "instant" }, discardOpponent: { amount: 1 } }
  },
  {
    id: "GOV-098",
    faction: "Government",
    name: "Asset Laundering",
    type: "DEVELOPMENT",
    rarity: "common",
    cost: 8,
    text: "Gain 3 IP now. If you control 2+ Zones, gain +2 IP.",
    flavor: "We dry-clean money and reputations.",
    target: { scope: "self" },
    effects: { ipDelta: { self: +3 }, conditional: { ifZonesControlledAtLeast: { count: 2, ipDelta: { self: +2 } } } }
  },
  {
    id: "GOV-099",
    faction: "Government",
    name: "Harbor Dock Warehouse",
    type: "ZONE",
    rarity: "common",
    cost: 8,
    text: "Zone: +2 Defense. If you control 3+ Zones, gain +2 IP when created.",
    flavor: "Manifest says 'miscellaneous'.",
    target: { scope: "state" },
    effects: { pressure: { state: "target", amount: 1 }, zone: { defenseDelta: 2 }, conditional: { ifZonesControlledAtLeast: { count: 3, onCreate: { ipDelta: { self: +2 } } } } }
  },
  {
    id: "GOV-100",
    faction: "Government",
    name: "Architects of Forgetting",
    type: "LEGENDARY",
    rarity: "legendary",
    cost: 27,
    text: "Reduce Truth by 14%. Until end of round, Truth MEDIA are canceled on play (first two).",
    flavor: "They don't erase the past—only your access to it.",
    target: { scope: "global" },
    effects: { truthDelta: -14, cancel: { type: "MEDIA", scope: "Truth", timing: "thisRound", count: 2 } }
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
