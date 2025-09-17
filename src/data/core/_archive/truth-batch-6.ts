// Truth Batch 6 - v2.1E Compliant Cards
// TRUTH-126 to TRUTH-150

import type { GameCard } from '../../../types/cardTypes';

export const CORE_BATCH_TRUTH_6: GameCard[] = [
  {
    id: "TRUTH-126",
    faction: "truth",
    name: "Community Scanner Net",
    type: "ZONE",
    rarity: "uncommon",
    cost: 12,
    text: "+2 Zone Defense. +1% Truth when played.",
    flavorTruth: "Airwaves have nothing to hide.",
    flavorGov: "Airwaves have nothing to hide.",
    target: { scope: "state", count: 1 },
    effects: { zoneDefense: 2, truthDelta: 1 }
  },
  {
    id: "TRUTH-127",
    faction: "truth",
    name: "Cryptid Petting Zoo",
    type: "ZONE",
    rarity: "rare",
    cost: 18,
    text: "+4 Zone Defense.",
    flavorTruth: "Waiver includes claws and clauses.",
    flavorGov: "Waiver includes claws and clauses.",
    target: { scope: "state", count: 1 },
    effects: { zoneDefense: 4 }
  },
  {
    id: "TRUTH-128",
    faction: "truth",
    name: "College Radio Conspiracy Hour",
    type: "ZONE",
    rarity: "uncommon",
    cost: 13,
    text: "+2 Zone Defense. Gain 1 IP and +1% Truth when played.",
    flavorTruth: "Playlists of leaks and licks.",
    flavorGov: "Playlists of leaks and licks.",
    target: { scope: "state", count: 1 },
    effects: { zoneDefense: 2, ipDelta: { self: 1 }, truthDelta: 1 }
  },
  {
    id: "TRUTH-129",
    faction: "truth",
    name: "Elvis Tribute Casino Lounge",
    type: "ZONE",
    rarity: "rare",
    cost: 18,
    text: "+3 Zone Defense. Gain 2 IP when played.",
    flavorTruth: "House always wins—unless truth shows up.",
    flavorGov: "House always wins—unless truth shows up.",
    target: { scope: "state", count: 1 },
    effects: { zoneDefense: 3, ipDelta: { self: 2 } }
  },
  {
    id: "TRUTH-130",
    faction: "truth",
    name: "Public-Access TV Studio",
    type: "ZONE",
    rarity: "uncommon",
    cost: 12,
    text: "+2 Zone Defense. +3% Truth when played.",
    flavorTruth: "Tonight on 'Open Secrets': everything.",
    flavorGov: "Tonight on 'Open Secrets': everything.",
    target: { scope: "state", count: 1 },
    effects: { zoneDefense: 2, truthDelta: 3 }
  },
  {
    id: "TRUTH-131",
    faction: "truth",
    name: "Haunted National Park",
    type: "ZONE",
    rarity: "rare",
    cost: 17,
    text: "+4 Zone Defense.",
    flavorTruth: "Leave only footprints; hear many more.",
    flavorGov: "Leave only footprints; hear many more.",
    target: { scope: "state", count: 1 },
    effects: { zoneDefense: 4 }
  },
  {
    id: "TRUTH-132",
    faction: "truth",
    name: "Data Breach Whistle",
    type: "ATTACK",
    rarity: "uncommon",
    cost: 3,
    text: "Opponent discards 1 card.",
    flavor: "The loudest tiny whistle ever printed.",
    flavorTruth: "The loudest tiny whistle ever printed.",
    flavorGov: "The loudest tiny whistle ever printed.",
    target: {
      count: 0,
      scope: "global"
    },
    effects: {
      ipDelta: {
        opponent: 2
      },
      discardOpponent: 1
    }
  },
  {
    id: "TRUTH-133",
    faction: "truth",
    name: "Press Conference Ambush",
    type: "ATTACK",
    rarity: "uncommon",
    cost: 3,
    text: "Opponent -2 IP.",
    flavor: "First question, final answer.",
    flavorTruth: "First question, final answer.",
    flavorGov: "First question, final answer.",
    target: {
      count: 0,
      scope: "global"
    },
    effects: {
      ipDelta: {
        opponent: 2
      }
    }
  },
  {
    id: "TRUTH-134",
    faction: "truth",
    name: "FOIA Lightning Round",
    type: "ATTACK",
    rarity: "rare",
    cost: 4,
    text: "Draw 2. Opponent -2 IP.",
    flavor: "Redaction ink runs in the rain.",
    flavorTruth: "Redaction ink runs in the rain.",
    flavorGov: "Redaction ink runs in the rain.",
    target: {
      count: 0,
      scope: "global"
    },
    effects: {
      ipDelta: {
        opponent: 3
      },
      draw: 2
    }
  },
  {
    id: "TRUTH-135",
    faction: "truth",
    name: "Infiltrate the Briefing",
    type: "ATTACK",
    rarity: "uncommon",
    cost: 3,
    text: "Target state: reduce its Defense by 1. Draw 1.",
    flavor: "Credentials printed on recycled secrets.",
    flavorTruth: "Credentials printed on recycled secrets.",
    flavorGov: "Credentials printed on recycled secrets.",
    target: {
      count: 1,
      scope: "state"
    },
    effects: {
      ipDelta: {
        opponent: 2
      },
      draw: 1,
      pressureDelta: 1
    }
  },
  {
    id: "TRUTH-136",
    faction: "truth",
    name: "Crowdsourced Fact Storm",
    type: "ATTACK",
    rarity: "uncommon",
    cost: 3,
    text: "Gain +1 IP.",
    flavor: "1,000 comments, one conclusion.",
    flavorTruth: "1,000 comments, one conclusion.",
    flavorGov: "1,000 comments, one conclusion.",
    target: {
      count: 0,
      scope: "global"
    },
    effects: {
      ipDelta: {
        opponent: 2
      }
    }
  },
  {
    id: "TRUTH-137",
    faction: "truth",
    name: "Operation Spotlight",
    type: "ATTACK",
    rarity: "rare",
    cost: 4,
    text: "Opponent discards 1 card. +4% Truth.",
    flavor: "Stage lights melt alibis.",
    flavorTruth: "Stage lights melt alibis.",
    flavorGov: "Stage lights melt alibis.",
    target: {
      count: 0,
      scope: "global"
    },
    effects: {
      truthDelta: 4,
      ipDelta: {
        opponent: 3
      },
      discardOpponent: 1
    }
  },
  {
    id: "TRUTH-138",
    faction: "truth",
    name: "Emergency Broadcast Override",
    type: "ATTACK",
    rarity: "uncommon",
    cost: 3,
    text: "Draw 1 card.",
    flavor: "We interrupt your regularly scheduled denial.",
    flavorTruth: "We interrupt your regularly scheduled denial.",
    flavorGov: "We interrupt your regularly scheduled denial.",
    target: {
      count: 0,
      scope: "global"
    },
    effects: {
      ipDelta: {
        opponent: 2
      },
      draw: 1
    }
  },
  {
    id: "TRUTH-139",
    faction: "truth",
    name: "Street Reporter Blitz",
    type: "ATTACK",
    rarity: "uncommon",
    cost: 3,
    text: "Target state: +1 Pressure. +3% Truth.",
    flavor: "Microphones swarm like bees.",
    flavorTruth: "Microphones swarm like bees.",
    flavorGov: "Microphones swarm like bees.",
    target: {
      count: 1,
      scope: "state"
    },
    effects: {
      truthDelta: 3,
      ipDelta: {
        opponent: 2
      },
      pressureDelta: 1
    }
  },
  {
    id: "TRUTH-140",
    faction: "truth",
    name: "Subpoena Surprise",
    type: "ATTACK",
    rarity: "rare",
    cost: 4,
    text: "Opponent -3 IP. Draw 1.",
    flavor: "Signed by Judge Public Opinion.",
    flavorTruth: "Signed by Judge Public Opinion.",
    flavorGov: "Signed by Judge Public Opinion.",
    target: {
      count: 0,
      scope: "global"
    },
    effects: {
      ipDelta: {
        opponent: 3
      },
      draw: 1
    }
  },
  {
    id: "TRUTH-141",
    faction: "truth",
    name: "Elvis Press Pass",
    type: "ATTACK",
    rarity: "uncommon",
    cost: 3,
    text: "Opponent discards 1 card.",
    flavor: "Laminate of destiny.",
    flavorTruth: "Laminate of destiny.",
    flavorGov: "Laminate of destiny.",
    target: {
      count: 0,
      scope: "global"
    },
    effects: {
      ipDelta: {
        opponent: 2
      },
      discardOpponent: 1
    }
  },
  {
    id: "TRUTH-142",
    faction: "truth",
    name: "Flash-Truth Rally",
    type: "ATTACK",
    rarity: "uncommon",
    cost: 3,
    text: "+4% Truth. If you control 2+ zones, gain +1 IP.",
    flavor: "Chants harmonize with sirens.",
    flavorTruth: "Chants harmonize with sirens.",
    flavorGov: "Chants harmonize with sirens.",
    target: {
      count: 0,
      scope: "global"
    },
    effects: {
      truthDelta: 4,
      ipDelta: {
        opponent: 2
      },
      conditional: {
        ifZonesControlledAtLeast: 2,
        then: {
          ipDelta: {
            opponent: 2
          }
        }
      }
    }
  },
  {
    id: "TRUTH-143",
    faction: "truth",
    name: "Phone Tree Counterintel",
    type: "DEFENSIVE",
    rarity: "common",
    cost: 6,
    text: "Opponent -2 IP.",
    flavorTruth: "Ring once if it's a cover-up.",
    flavorGov: "Ring once if it's a cover-up.",
    target: { scope: "global", count: 0 },
    effects: { ipDelta: { opponent: -2 } }
  },
  {
    id: "TRUTH-144",
    faction: "truth",
    name: "Ghost Patrol",
    type: "DEFENSIVE",
    rarity: "uncommon",
    cost: 7,
    text: "Gain 2 IP. Draw 1.",
    flavorTruth: "Boo! Also, bookkeeping.",
    flavorGov: "Boo! Also, bookkeeping.",
    target: { scope: "global", count: 0 },
    effects: { ipDelta: { self: 2 }, draw: 1 }
  },
  {
    id: "TRUTH-145",
    faction: "truth",
    name: "Public Records Shield",
    type: "DEFENSIVE",
    rarity: "uncommon",
    cost: 7,
    text: "+3% Truth.",
    flavorTruth: "Stapled, stamped, safe.",
    flavorGov: "Stapled, stamped, safe.",
    target: { scope: "global", count: 0 },
    effects: { truthDelta: 3 }
  },
  {
    id: "TRUTH-146",
    faction: "truth",
    name: "Witness Hotline",
    type: "DEFENSIVE",
    rarity: "uncommon",
    cost: 8,
    text: "Gain +1 IP.",
    flavorTruth: "Press 1 to spill, press 2 to bill.",
    flavorGov: "Press 1 to spill, press 2 to bill.",
    target: { scope: "global", count: 0 },
    effects: { ipDelta: { self: 1 } }
  },
  {
    id: "TRUTH-147",
    faction: "truth",
    name: "Mothership Cover",
    type: "DEFENSIVE",
    rarity: "uncommon",
    cost: 8,
    text: "+4% Truth. Draw 1.",
    flavorTruth: "Umbrella policy: extraterrestrial.",
    flavorGov: "Umbrella policy: extraterrestrial.",
    target: { scope: "global", count: 0 },
    effects: { truthDelta: 4, draw: 1 }
  },
  {
    id: "TRUTH-148",
    faction: "truth",
    name: "Tabloid Legal Eagles",
    type: "DEFENSIVE",
    rarity: "rare",
    cost: 10,
    text: "Gain 4 IP.",
    flavorTruth: "Objection sustained, publicity gained.",
    flavorGov: "Objection sustained, publicity gained.",
    target: { scope: "global", count: 0 },
    effects: { ipDelta: { self: 4 } }
  },
  {
    id: "TRUTH-149",
    faction: "truth",
    name: "Bigfoot Senate Campaign",
    type: "MEDIA",
    rarity: "legendary",
    cost: 28,
    text: "+15% Truth. +2 Pressure in target state.",
    flavorTruth: "A platform of planks and footprints.",
    flavorGov: "A platform of planks and footprints.",
    target: { scope: "state", count: 1 },
    effects: { truthDelta: 15, pressureDelta: 2 }
  },
  {
    id: "TRUTH-150",
    faction: "truth",
    name: "Elvis: The Immortal King",
    type: "MEDIA",
    rarity: "legendary",
    cost: 30,
    text: "+12% Truth. +3 Pressure in target state.",
    flavorTruth: "Long live the King—and the headline.",
    flavorGov: "Long live the King—and the headline.",
    target: { scope: "state", count: 1 },
    effects: { truthDelta: 12, pressureDelta: 3 }
  }
];