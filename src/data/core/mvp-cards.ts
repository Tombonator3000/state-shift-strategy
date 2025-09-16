// MVP Core Card Database - Generated from migration
// Only ATTACK, MEDIA, ZONE types with fixed costs and baseline effects

import type { MVPCard } from '@/types/mvp-types';

export const MVP_CORE_CARDS: MVPCard[] = [
  // ATTACK Cards
  {
    id: "MVP-A-001",
    name: "Black Bag Operation", 
    faction: "government",
    type: "ATTACK",
    rarity: "legendary", 
    cost: 5,
    effects: { ipDelta: { opponent: 4 }, discardOpponent: 2 },
    text: "Opponent loses 4 IP. Opponent discards 2 cards.",
    flavorTruth: "They came in the night, and now the evidence is gone.",
    flavorGov: "Sometimes the greater good requires uncomfortable measures."
  },
  {
    id: "MVP-A-002",
    name: "Disinformation Campaign",
    faction: "government", 
    type: "ATTACK",
    rarity: "common",
    cost: 2,
    effects: { ipDelta: { opponent: 1 } },
    text: "Opponent loses 1 IP.",
    flavorTruth: "Another lie spreads faster than truth.",
    flavorGov: "Strategic narrative management in action."
  },
  {
    id: "MVP-A-003",
    name: "Cyber Warfare Unit",
    faction: "government",
    type: "ATTACK", 
    rarity: "rare",
    cost: 4,
    effects: { ipDelta: { opponent: 3 }, discardOpponent: 1 },
    text: "Opponent loses 3 IP. Opponent discards 1 card.",
    flavorTruth: "They're inside our networks.",
    flavorGov: "Digital superiority established."
  },
  {
    id: "MVP-A-004", 
    name: "Intimidation Tactics",
    faction: "government",
    type: "ATTACK",
    rarity: "uncommon",
    cost: 3,
    effects: { ipDelta: { opponent: 2 } },
    text: "Opponent loses 2 IP.",
    flavorTruth: "Fear silences the brave.",
    flavorGov: "Order through strength."
  },
  {
    id: "MVP-A-005",
    name: "Truth Seeker Alliance",
    faction: "truth",
    type: "ATTACK",
    rarity: "uncommon", 
    cost: 3,
    effects: { ipDelta: { opponent: 2 } },
    text: "Opponent loses 2 IP.",
    flavorTruth: "United we expose their lies.",
    flavorGov: "Insurgent coordination detected."
  },
  
  // MEDIA Cards
  {
    id: "MVP-M-001",
    name: "Emergency Broadcast", 
    faction: "truth",
    type: "MEDIA",
    rarity: "rare",
    cost: 5,
    effects: { truthDelta: 3 },
    text: "+3% Truth.",
    flavorTruth: "The signal cuts through their interference.",
    flavorGov: "Unauthorized transmission detected on emergency channels."
  },
  {
    id: "MVP-M-002",
    name: "Social Media Manipulation",
    faction: "government",
    type: "MEDIA",
    rarity: "uncommon",
    cost: 4, 
    effects: { truthDelta: -2 },
    text: "-2% Truth.",
    flavorTruth: "The algorithm buries inconvenient truths.",
    flavorGov: "Public opinion successfully realigned."
  },
  {
    id: "MVP-M-003",
    name: "Leaked Documents",
    faction: "truth",
    type: "MEDIA",
    rarity: "legendary",
    cost: 6,
    effects: { truthDelta: 4 },
    text: "+4% Truth.",
    flavorTruth: "The people have a right to know.",
    flavorGov: "Critical security breach detected."
  },
  {
    id: "MVP-M-004",
    name: "Corporate News Spin",
    faction: "government", 
    type: "MEDIA",
    rarity: "common",
    cost: 3,
    effects: { truthDelta: -1 },
    text: "-1% Truth.",
    flavorTruth: "They own the narrative.", 
    flavorGov: "Message successfully distributed."
  },
  {
    id: "MVP-M-005",
    name: "Citizen Journalism",
    faction: "truth",
    type: "MEDIA",
    rarity: "common",
    cost: 3,
    effects: { truthDelta: 1 },
    text: "+1% Truth.",
    flavorTruth: "The truth finds a way.",
    flavorGov: "Amateur propaganda detected."
  },
  {
    id: "MVP-M-006",
    name: "State Television",
    faction: "government",
    type: "MEDIA", 
    rarity: "uncommon",
    cost: 4,
    effects: { truthDelta: -2 },
    text: "-2% Truth.",
    flavorTruth: "The official story, all day long.",
    flavorGov: "Maintaining public confidence."
  },
  
  // ZONE Cards
  {
    id: "MVP-Z-001",
    name: "Regional Sweep",
    faction: "truth",
    type: "ZONE",
    rarity: "uncommon",
    cost: 5,
    effects: { pressureDelta: 2 },
    text: "+2 Pressure on target state.",
    flavorTruth: "Grassroots organizing takes hold.",
    flavorGov: "Civil unrest detected in target region."
  },
  {
    id: "MVP-Z-002", 
    name: "Federal Intervention",
    faction: "government",
    type: "ZONE", 
    rarity: "legendary",
    cost: 7,
    effects: { pressureDelta: 4 },
    text: "+4 Pressure on target state.",
    flavorTruth: "The occupation begins.",
    flavorGov: "Restoring order to the region."
  },
  {
    id: "MVP-Z-003",
    name: "Community Outreach",
    faction: "truth",
    type: "ZONE",
    rarity: "common",
    cost: 4,
    effects: { pressureDelta: 1 },
    text: "+1 Pressure on target state.", 
    flavorTruth: "One conversation at a time.",
    flavorGov: "Subversive activity reported."
  },
  {
    id: "MVP-Z-004",
    name: "Police State Tactics",
    faction: "government",
    type: "ZONE",
    rarity: "rare",
    cost: 6,
    effects: { pressureDelta: 3 },
    text: "+3 Pressure on target state.",
    flavorTruth: "Fear grips the streets.",
    flavorGov: "Enhanced security measures deployed."
  },
  {
    id: "MVP-Z-005",
    name: "Underground Network",
    faction: "truth", 
    type: "ZONE",
    rarity: "rare",
    cost: 6,
    effects: { pressureDelta: 3 },
    text: "+3 Pressure on target state.",
    flavorTruth: "The resistance grows in shadows.",
    flavorGov: "Terrorist cell activity suspected."
  },
  {
    id: "MVP-Z-006",
    name: "Administrative Control",
    faction: "government",
    type: "ZONE",
    rarity: "common", 
    cost: 4,
    effects: { pressureDelta: 1 },
    text: "+1 Pressure on target state.",
    flavorTruth: "Bureaucracy strangles freedom.",
    flavorGov: "Regulatory oversight implemented."
  }
];

export default MVP_CORE_CARDS;