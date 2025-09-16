// MVP Core Card Database - Auto-generated
// 3 types only: ATTACK, MEDIA, ZONE
// Fixed costs and baseline effects

import type { MVPCard } from '@/types/mvp-types';

export const MVP_CORE_CARDS: MVPCard[] = [
  // TRUTH FACTION - ATTACK CARDS
  {
    id: "TRUTH-ATK-001",
    name: "Investigative Strike",
    faction: "truth",
    type: "ATTACK",
    rarity: "common",
    cost: 2,
    effects: { ipDelta: { opponent: 1 } },
    flavor: "One question can bring down empires."
  },
  {
    id: "TRUTH-ATK-002", 
    name: "Leaked Classified Documents",
    faction: "truth",
    type: "ATTACK",
    rarity: "uncommon",
    cost: 3,
    effects: { ipDelta: { opponent: 2 } },
    flavor: "The truth has a way of surfacing."
  },
  {
    id: "TRUTH-ATK-003",
    name: "Whistleblower Testimony",
    faction: "truth",
    type: "ATTACK",
    rarity: "rare",
    cost: 4,
    effects: { ipDelta: { opponent: 3 }, discardOpponent: 1 },
    flavor: "One voice can silence the machine."
  },
  {
    id: "TRUTH-ATK-004",
    name: "Mass Document Leak",
    faction: "truth", 
    type: "ATTACK",
    rarity: "legendary",
    cost: 5,
    effects: { ipDelta: { opponent: 4 }, discardOpponent: 2 },
    flavor: "When the floodgates open, nothing stays hidden."
  },

  // TRUTH FACTION - MEDIA CARDS
  {
    id: "TRUTH-MED-001",
    name: "Citizen Journalist Report",
    faction: "truth",
    type: "MEDIA", 
    rarity: "common",
    cost: 3,
    effects: { truthDelta: 1 },
    flavor: "The smartphone is mightier than the sword."
  },
  {
    id: "TRUTH-MED-002",
    name: "Viral UFO Footage",
    faction: "truth",
    type: "MEDIA",
    rarity: "common", 
    cost: 3,
    effects: { truthDelta: 1 },
    flavor: "#NoFilter #DefinitelyReal"
  },
  {
    id: "TRUTH-MED-003",
    name: "Cryptid Selfie Goes Mainstream",
    faction: "truth",
    type: "MEDIA",
    rarity: "uncommon",
    cost: 4,
    effects: { truthDelta: 2 },
    flavor: "Bigfoot has better camera skills than expected."
  },
  {
    id: "TRUTH-MED-004",
    name: "Elvis Spotted at Diner",
    faction: "truth",
    type: "MEDIA",
    rarity: "uncommon",
    cost: 4,
    effects: { truthDelta: 2 },
    flavor: "The King recommends the midnight pancakes."
  },
  {
    id: "TRUTH-MED-005",
    name: "Tabloid Thunder Special Edition",
    faction: "truth",
    type: "MEDIA",
    rarity: "rare",
    cost: 5,
    effects: { truthDelta: 3 },
    flavor: "Ink smudges reveal more than black bars."
  },
  {
    id: "TRUTH-MED-006",
    name: "Mothership Livestream",
    faction: "truth",
    type: "MEDIA",
    rarity: "rare",
    cost: 5,
    effects: { truthDelta: 3 },
    flavor: "Chat: 'first!'"
  },
  {
    id: "TRUTH-MED-007",
    name: "Truth Network Broadcast",
    faction: "truth",
    type: "MEDIA",
    rarity: "legendary",
    cost: 6,
    effects: { truthDelta: 4 },
    flavor: "Broadcasting truth to the masses."
  },
  {
    id: "TRUTH-MED-008",
    name: "Global Awakening Signal",
    faction: "truth",
    type: "MEDIA",
    rarity: "legendary", 
    cost: 6,
    effects: { truthDelta: 4 },
    flavor: "The signal that changes everything."
  },

  // TRUTH FACTION - ZONE CARDS
  {
    id: "TRUTH-ZON-001",
    name: "Bigfoot Campground",
    faction: "truth",
    type: "ZONE",
    rarity: "common",
    cost: 4,
    effects: { pressureDelta: 1 },
    flavor: "Please don't feed the senator."
  },
  {
    id: "TRUTH-ZON-002",
    name: "Ghost Hunter Motel",
    faction: "truth",
    type: "ZONE",
    rarity: "common",
    cost: 4,
    effects: { pressureDelta: 1 },
    flavor: "Room service knocks itself."
  },
  {
    id: "TRUTH-ZON-003",
    name: "Haunted Walmart",
    faction: "truth",
    type: "ZONE",
    rarity: "uncommon",
    cost: 5,
    effects: { pressureDelta: 2 },
    flavor: "Rollback prices on cursed dolls."
  },
  {
    id: "TRUTH-ZON-004",
    name: "Elvis Shrine in Vegas",
    faction: "truth",
    type: "ZONE",
    rarity: "uncommon",
    cost: 5,
    effects: { pressureDelta: 2 },
    flavor: "Burning love, steady income."
  },
  {
    id: "TRUTH-ZON-005",
    name: "Cornfield Abduction Site",
    faction: "truth",
    type: "ZONE",
    rarity: "rare",
    cost: 6,
    effects: { pressureDelta: 3 },
    flavor: "Free tractor rides included."
  },
  {
    id: "TRUTH-ZON-006",
    name: "Tabloid Printing Warehouse",
    faction: "truth",
    type: "ZONE",
    rarity: "rare",
    cost: 6,
    effects: { pressureDelta: 3 },
    flavor: "Ink stains reveal hidden messages."
  },
  {
    id: "TRUTH-ZON-007",
    name: "Truth Broadcast Tower",
    faction: "truth",
    type: "ZONE",
    rarity: "legendary",
    cost: 7,
    effects: { pressureDelta: 4 },
    flavor: "The signal reaches every home."
  },
  {
    id: "TRUTH-ZON-008",
    name: "Underground Truth Network",
    faction: "truth",
    type: "ZONE",
    rarity: "legendary",
    cost: 7,
    effects: { pressureDelta: 4 },
    flavor: "Spreading truth through secret channels."
  },

  // GOVERNMENT FACTION - ATTACK CARDS
  {
    id: "GOV-ATK-001",
    name: "Black Helicopters",
    faction: "government",
    type: "ATTACK",
    rarity: "common",
    cost: 2,
    effects: { ipDelta: { opponent: 1 } },
    flavor: "You can hear them when it's too late."
  },
  {
    id: "GOV-ATK-002",
    name: "Men in Black Squad",
    faction: "government",
    type: "ATTACK", 
    rarity: "common",
    cost: 2,
    effects: { ipDelta: { opponent: 1 } },
    flavor: "Nobody remembers the encounter… and that's the point."
  },
  {
    id: "GOV-ATK-003",
    name: "Honeytrap Asset",
    faction: "government",
    type: "ATTACK",
    rarity: "uncommon",
    cost: 3,
    effects: { ipDelta: { opponent: 2 } },
    flavor: "Sign here. Smile there."
  },
  {
    id: "GOV-ATK-004",
    name: "Sealed Indictment",
    faction: "government",
    type: "ATTACK",
    rarity: "uncommon",
    cost: 3,
    effects: { ipDelta: { opponent: 2 } },
    flavor: "Allegedly mandatory."
  },
  {
    id: "GOV-ATK-005",
    name: "Krycek Double Agent",
    faction: "government",
    type: "ATTACK",
    rarity: "rare",
    cost: 4,
    effects: { ipDelta: { opponent: 3 }, discardOpponent: 1 },
    flavor: "He works for everyone. And no one."
  },
  {
    id: "GOV-ATK-006",
    name: "Alien Autopsy Cover-Up",
    faction: "government",
    type: "ATTACK",
    rarity: "rare",
    cost: 4,
    effects: { ipDelta: { opponent: 3 }, discardOpponent: 1 },
    flavor: "Grainy VHS footage? Totally fake. Trust us."
  },
  {
    id: "GOV-ATK-007",
    name: "Deep State Purge",
    faction: "government",
    type: "ATTACK",
    rarity: "legendary",
    cost: 5,
    effects: { ipDelta: { opponent: 4 }, discardOpponent: 2 },
    flavor: "Cleaning house, one truth-teller at a time."
  },
  {
    id: "GOV-ATK-008",
    name: "Total Information Awareness",
    faction: "government",
    type: "ATTACK",
    rarity: "legendary",
    cost: 5,
    effects: { ipDelta: { opponent: 4 }, discardOpponent: 2 },
    flavor: "We know everything. We always have."
  },

  // GOVERNMENT FACTION - MEDIA CARDS
  {
    id: "GOV-MED-001",
    name: "Crisis Actor Auditions",
    faction: "government",
    type: "MEDIA",
    rarity: "common",
    cost: 3,
    effects: { truthDelta: -1 },
    flavor: "Please cry on lines two and three."
  },
  {
    id: "GOV-MED-002",
    name: "Mind Control Fluoride",
    faction: "government",
    type: "MEDIA",
    rarity: "common",
    cost: 3,
    effects: { truthDelta: -1 },
    flavor: "It's in the water. Drink up."
  },
  {
    id: "GOV-MED-003",
    name: "Routine Training Exercise",
    faction: "government",
    type: "MEDIA",
    rarity: "uncommon",
    cost: 4,
    effects: { truthDelta: -2 },
    flavor: "Nothing to see here. Please remain calm."
  },
  {
    id: "GOV-MED-004",
    name: "Patriot Act Reloaded",
    faction: "government",
    type: "MEDIA",
    rarity: "uncommon",
    cost: 4,
    effects: { truthDelta: -2 },
    flavor: "For your safety. Definitely not ours."
  },
  {
    id: "GOV-MED-005",
    name: "Operation Mockingbird 2.0",
    faction: "government",
    type: "MEDIA",
    rarity: "rare",
    cost: 5,
    effects: { truthDelta: -3 },
    flavor: "Sponsored by your friendly neighborhood network."
  },
  {
    id: "GOV-MED-006",
    name: "Emergency Broadcast Override",
    faction: "government",
    type: "MEDIA",
    rarity: "rare",
    cost: 5,
    effects: { truthDelta: -3 },
    flavor: "Your regularly scheduled reality will return shortly."
  },
  {
    id: "GOV-MED-007",
    name: "Total Media Blackout",
    faction: "government",
    type: "MEDIA",
    rarity: "legendary",
    cost: 6,
    effects: { truthDelta: -4 },
    flavor: "When all channels sing the same song."
  },
  {
    id: "GOV-MED-008",
    name: "Cigarette Whisperer",
    faction: "government",
    type: "MEDIA",
    rarity: "legendary",
    cost: 6,
    effects: { truthDelta: -4 },
    flavor: "His smoke breaks last decades."
  },

  // GOVERNMENT FACTION - ZONE CARDS
  {
    id: "GOV-ZON-001",
    name: "Classified Briefing Room",
    faction: "government",
    type: "ZONE",
    rarity: "common",
    cost: 4,
    effects: { pressureDelta: 1 },
    flavor: "No windows, two clocks, three alarms."
  },
  {
    id: "GOV-ZON-002",
    name: "Underground Archive",
    faction: "government",
    type: "ZONE",
    rarity: "common",
    cost: 4,
    effects: { pressureDelta: 1 },
    flavor: "Microfilm never dies."
  },
  {
    id: "GOV-ZON-003",
    name: "Roswell Storage Hangar",
    faction: "government",
    type: "ZONE",
    rarity: "uncommon",
    cost: 5,
    effects: { pressureDelta: 2 },
    flavor: "Crates labeled 'Weather Balloon' (wink)."
  },
  {
    id: "GOV-ZON-004",
    name: "Black Site Expansion",
    faction: "government",
    type: "ZONE",
    rarity: "uncommon",
    cost: 5,
    effects: { pressureDelta: 2 },
    flavor: "You'll never find it on Google Maps."
  },
  {
    id: "GOV-ZON-005",
    name: "Weather Control Division",
    faction: "government",
    type: "ZONE",
    rarity: "rare",
    cost: 6,
    effects: { pressureDelta: 3 },
    flavor: "Forecast: 100% chance of plausible deniability."
  },
  {
    id: "GOV-ZON-006",
    name: "Denver Airport Bunker",
    faction: "government",
    type: "ZONE",
    rarity: "rare",
    cost: 6,
    effects: { pressureDelta: 3 },
    flavor: "Art, tunnels, and a lot of keycards."
  },
  {
    id: "GOV-ZON-007",
    name: "FOIA Shredder Complex",
    faction: "government",
    type: "ZONE",
    rarity: "legendary",
    cost: 7,
    effects: { pressureDelta: 4 },
    flavor: "The shredder is always hungry."
  },
  {
    id: "GOV-ZON-008",
    name: "Redaction Vault",
    faction: "government",
    type: "ZONE",
    rarity: "legendary",
    cost: 7,
    effects: { pressureDelta: 4 },
    flavor: "█████████ everywhere."
  }
];

export default MVP_CORE_CARDS;