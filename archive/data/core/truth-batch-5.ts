// Truth Batch 5 - v2.1E Compliant Cards  
// TRUTH-101 to TRUTH-125


import type { Card } from "../../types/mvpCard";

export const CORE_BATCH_TRUTH_5: Card[] = [
  {
    id: "TRUTH-101",
    name: "The Lone Gunmen",
    faction: "truth",
    type: "ATTACK",
    rarity: "common",
    cost: 2,
    effects: {
      ipDelta: { opponent: 1 }
    },
    flavor: "Three hackers, zero hygiene, one friend on the inside.",
  },
  {
    id: "TRUTH-102",
    name: "Open-Records Taskforce",
    faction: "truth",
    type: "ZONE",
    rarity: "rare",
    cost: 6,
    effects: {
      pressureDelta: 3
    },
    flavor: "If it's stamped 'secret', it's stapled to our to-do list.",
  },
  {
    id: "TRUTH-103",
    name: "Grassroots Press Co-Op",
    faction: "truth",
    type: "ZONE",
    rarity: "common",
    cost: 4,
    effects: {
      pressureDelta: 1
    },
    flavor: "Ink by the people, for the people.",
  },
  {
    id: "TRUTH-104",
    name: "Citizen Forensics Lab",
    faction: "truth",
    type: "ZONE",
    rarity: "uncommon",
    cost: 5,
    effects: {
      pressureDelta: 2
    },
    flavor: "Microscopes donated, miracles improvised.",
  },
  {
    id: "TRUTH-105",
    name: "Truth Meter Calibrator",
    faction: "truth",
    type: "ZONE",
    rarity: "legendary",
    cost: 7,
    effects: {
      pressureDelta: 4
    },
    flavor: "Batteries not included. Lies excluded.",
  },
  {
    id: "TRUTH-106",
    name: "Tinfoil Supply Chain",
    faction: "truth",
    type: "ZONE",
    rarity: "rare",
    cost: 6,
    effects: {
      pressureDelta: 3
    },
    flavor: "Industrial-grade hats for industrial-sized cover-ups.",
  },
  {
    id: "TRUTH-107",
    name: "Elvis Works the Night Shift",
    faction: "truth",
    type: "MEDIA",
    rarity: "legendary",
    cost: 6,
    effects: {
      truthDelta: 4
    },
    flavor: "Punches in with a glittery glove.",
  },
  {
    id: "TRUTH-108",
    name: "Bat Boy Delivers Breaking News",
    faction: "truth",
    type: "MEDIA",
    rarity: "legendary",
    cost: 6,
    effects: {
      truthDelta: 4
    },
    flavor: "Screams in AP style.",
  },
  {
    id: "TRUTH-109",
    name: "Pastor Rex Calls Out the Lizard Cabal",
    faction: "truth",
    type: "MEDIA",
    rarity: "legendary",
    cost: 6,
    effects: {
      truthDelta: 4
    },
    flavor: "Tail between their legs, allegedly.",
  },
  {
    id: "TRUTH-110",
    name: "Florida Man Finds Government Device",
    faction: "truth",
    type: "MEDIA",
    rarity: "legendary",
    cost: 6,
    effects: {
      truthDelta: 4
    },
    flavor: "He used it to open soda first.",
  },
  {
    id: "TRUTH-111",
    name: "MIB Slip Up on Live TV",
    faction: "truth",
    type: "MEDIA",
    rarity: "legendary",
    cost: 6,
    effects: {
      truthDelta: 4
    },
    flavor: "Blink and you'll still see it.",
  },
  {
    id: "TRUTH-112",
    name: "Elvis Joins a Book Club",
    faction: "truth",
    type: "MEDIA",
    rarity: "legendary",
    cost: 6,
    effects: {
      truthDelta: 4
    },
    flavor: "Reads only paperbacks—no fingerprints.",
  },
  {
    id: "TRUTH-113",
    name: "Agent Smitherson's Conscience",
    faction: "truth",
    type: "MEDIA",
    rarity: "legendary",
    cost: 6,
    effects: {
      truthDelta: 4
    },
    flavor: "He anonymously CC'd everyone.",
  },
  {
    id: "TRUTH-114",
    name: "Blurry Mothman Dashcam",
    faction: "truth",
    type: "MEDIA",
    rarity: "legendary",
    cost: 6,
    effects: {
      truthDelta: 4
    },
    flavor: "Wingspan: entire windshield.",
  },
  {
    id: "TRUTH-115",
    name: "Ghost Jury Finds the Truth",
    faction: "truth",
    type: "MEDIA",
    rarity: "legendary",
    cost: 6,
    effects: {
      truthDelta: 4
    },
    flavor: "Verdict echoes for eternity.",
  },
  {
    id: "TRUTH-116",
    name: "Elvis Edits the Front Page",
    faction: "truth",
    type: "MEDIA",
    rarity: "legendary",
    cost: 6,
    effects: {
      truthDelta: 4
    },
    flavor: "Headline: 'Love Me Tender, Tell Me Everything'.",
  },
  {
    id: "TRUTH-117",
    name: "Local Kid Interviews a Gray",
    faction: "truth",
    type: "MEDIA",
    rarity: "legendary",
    cost: 6,
    effects: {
      truthDelta: 4
    },
    flavor: "First question: favorite ice cream?",
  },
  {
    id: "TRUTH-118",
    name: "Bat Boy Launches a Zine",
    faction: "truth",
    type: "MEDIA",
    rarity: "legendary",
    cost: 6,
    effects: {
      truthDelta: 4
    },
    flavor: "Stapled with bravado.",
  },
  {
    id: "TRUTH-119",
    name: "Psychic Predicts File Drop",
    faction: "truth",
    type: "MEDIA",
    rarity: "legendary",
    cost: 6,
    effects: {
      truthDelta: 4
    },
    flavor: "Knew you'd play this.",
  },
  {
    id: "TRUTH-120",
    name: "Desert Billboards of Truth",
    faction: "truth",
    type: "ZONE",
    rarity: "uncommon",
    cost: 5,
    effects: {
      pressureDelta: 2
    },
    flavor: "Text too big to redact.",
  },
  {
    id: "TRUTH-121",
    name: "Bat Boy Community Center",
    faction: "truth",
    type: "ZONE",
    rarity: "uncommon",
    cost: 5,
    effects: {
      pressureDelta: 2
    },
    flavor: "After-school programs for aspiring screamers.",
  },
  {
    id: "TRUTH-122",
    name: "Elvis Roadside Chapel",
    faction: "truth",
    type: "ZONE",
    rarity: "uncommon",
    cost: 5,
    effects: {
      pressureDelta: 2
    },
    flavor: "Vows exchanged, lies annulled.",
  },
  {
    id: "TRUTH-123",
    name: "Skywatcher Ridge",
    faction: "truth",
    type: "ZONE",
    rarity: "uncommon",
    cost: 5,
    effects: {
      pressureDelta: 2
    },
    flavor: "Bring blankets, witness meteors and memos.",
  },
  {
    id: "TRUTH-124",
    name: "Conspiracy Coffee Roasters",
    faction: "truth",
    type: "ZONE",
    rarity: "uncommon",
    cost: 5,
    effects: {
      pressureDelta: 2
    },
    flavor: "Single-origin skepticism.",
  },
  {
    id: "TRUTH-125",
    name: "Haunted Library Stacks",
    faction: "truth",
    type: "ZONE",
    rarity: "rare",
    cost: 6,
    effects: {
      pressureDelta: 3
    },
    flavor: "Shhh… the books whisper back.",
  }
];
