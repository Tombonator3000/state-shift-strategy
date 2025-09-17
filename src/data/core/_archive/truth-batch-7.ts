// Truth Batch 7 - v2.1E Compliant Cards
// TRUTH-151 to TRUTH-200

import type { GameCard } from '../../types/cardTypes';

export const CORE_BATCH_TRUTH_7: GameCard[] = [
  {
    id: "TRUTH-151",
    faction: "truth",
    name: "Elvis Volunteers at Animal Shelter",
    type: "MEDIA",
    rarity: "uncommon",
    cost: 9,
    text: "+6% Truth. Gain +1 IP.",
    flavorTruth: "Hound dogs approved.",
    flavorGov: "Hound dogs approved.",
    target: { scope: "global", count: 0 },
    effects: { truthDelta: 6, ipDelta: { self: 1 } }
  },
  {
    id: "TRUTH-152",
    faction: "truth",
    name: "Bat Boy Hosts the Evening News",
    type: "MEDIA",
    rarity: "rare",
    cost: 14,
    text: "+9% Truth.",
    flavorTruth: "Top story: screamingly credible.",
    flavorGov: "Top story: screamingly credible.",
    target: { scope: "global", count: 0 },
    effects: { truthDelta: 9 }
  },
  {
    id: "TRUTH-153",
    faction: "truth",
    name: "Florida Man's Meteor Fragment",
    type: "MEDIA",
    rarity: "common",
    cost: 5,
    text: "+4% Truth. Draw 1.",
    flavorTruth: "Hot rock, hotter takes.",
    flavorGov: "Hot rock, hotter takes.",
    target: { scope: "global", count: 0 },
    effects: { truthDelta: 4, draw: 1 }
  },
  {
    id: "TRUTH-154",
    faction: "truth",
    name: "Pastor Rex Declares Open Files Week",
    type: "MEDIA",
    rarity: "uncommon",
    cost: 10,
    text: "+7% Truth. If Truth ≥ 60%, gain +1 IP.",
    flavorTruth: "Bring your own highlighter.",
    flavorGov: "Bring your own highlighter.",
    target: { scope: "global", count: 0 },
    effects: { 
      truthDelta: 7,
      conditional: {
        ifTruthAtLeast: 60,
        then: { ipDelta: { self: 1 } }
      }
    }
  },
  {
    id: "TRUTH-155",
    faction: "truth",
    name: "Agent Smitherson Leaves a Voicemail",
    type: "MEDIA",
    rarity: "rare",
    cost: 13,
    text: "+8% Truth. Opponent discards 1 card.",
    flavorTruth: "'Do not call back.' *Beep.*",
    flavorGov: "'Do not call back.' *Beep.*",
    target: { scope: "global", count: 0 },
    effects: { truthDelta: 8, discardOpponent: 1 }
  },
  {
    id: "TRUTH-156",
    faction: "truth",
    name: "Crowd Spots Triangle Craft",
    type: "MEDIA",
    rarity: "common",
    cost: 6,
    text: "+5% Truth.",
    flavorTruth: "Geometry class finally pays off.",
    flavorGov: "Geometry class finally pays off.",
    target: { scope: "global", count: 0 },
    effects: { truthDelta: 5 }
  },
  {
    id: "TRUTH-157",
    faction: "truth",
    name: "Elvis Charity Telethon",
    type: "MEDIA",
    rarity: "uncommon",
    cost: 9,
    text: "+6% Truth. Opponent -1 IP.",
    flavorTruth: "All donations tax-deductible from reality.",
    flavorGov: "All donations tax-deductible from reality.",
    target: { scope: "global", count: 0 },
    effects: { truthDelta: 6, ipDelta: { opponent: -1 } }
  },
  {
    id: "TRUTH-158",
    faction: "truth",
    name: "UFO Traffic Cam Compilation",
    type: "MEDIA",
    rarity: "common",
    cost: 6,
    text: "+5% Truth.",
    flavorTruth: "Please merge truthfully.",
    flavorGov: "Please merge truthfully.",
    target: { scope: "global", count: 0 },
    effects: { truthDelta: 5 }
  },
  {
    id: "TRUTH-159",
    faction: "truth",
    name: "Bat Boy Op-Ed: 'I Was There'",
    type: "MEDIA",
    rarity: "uncommon",
    cost: 9,
    text: "+6% Truth. If you control 1+ zones, draw 1.",
    flavorTruth: "Has the receipts, keeps the screams.",
    flavorGov: "Has the receipts, keeps the screams.",
    target: { scope: "global", count: 0 },
    effects: { 
      truthDelta: 6,
      conditional: {
        ifZonesControlledAtLeast: 1,
        then: { draw: 1 }
      }
    }
  },
  {
    id: "TRUTH-160",
    faction: "truth",
    name: "Grandma's Séance Transcript",
    type: "MEDIA",
    rarity: "common",
    cost: 5,
    text: "+4% Truth.",
    flavorTruth: "Meeting minutes by planchette.",
    flavorGov: "Meeting minutes by planchette.",
    target: { scope: "global", count: 0 },
    effects: { truthDelta: 4 }
  },
  {
    id: "TRUTH-161",
    faction: "truth",
    name: "Elvis Delivers FOIA Request",
    type: "MEDIA",
    rarity: "rare",
    cost: 14,
    text: "+9% Truth. Draw 1.",
    flavorTruth: "Return address: The Heartbreak Hotel.",
    flavorGov: "Return address: The Heartbreak Hotel.",
    target: { scope: "global", count: 0 },
    effects: { truthDelta: 9, draw: 1 }
  },
  {
    id: "TRUTH-162",
    faction: "truth",
    name: "MIB Parking Ticket Goes Viral",
    type: "MEDIA",
    rarity: "uncommon",
    cost: 9,
    text: "+6% Truth. Draw 1.",
    flavorTruth: "Violation: obvious saucer.",
    flavorGov: "Violation: obvious saucer.",
    target: { scope: "global", count: 0 },
    effects: { truthDelta: 6, draw: 1 }
  },
  {
    id: "TRUTH-163",
    faction: "truth",
    name: "Florida Man's Paranormal BBQ",
    type: "MEDIA",
    rarity: "common",
    cost: 6,
    text: "+5% Truth.",
    flavorTruth: "Ribs and revelations.",
    flavorGov: "Ribs and revelations.",
    target: { scope: "global", count: 0 },
    effects: { truthDelta: 5 }
  },
  {
    id: "TRUTH-164",
    faction: "truth",
    name: "Bat Boy Wins Journalism Award",
    type: "MEDIA",
    rarity: "rare",
    cost: 13,
    text: "+8% Truth. Opponent -2 IP.",
    flavorTruth: "Accepted with a polite shriek.",
    flavorGov: "Accepted with a polite shriek.",
    target: { scope: "global", count: 0 },
    effects: { truthDelta: 8, ipDelta: { opponent: -2 } }
  },
  {
    id: "TRUTH-165",
    faction: "truth",
    name: "Elvis Bus Tour to Area 51",
    type: "MEDIA",
    rarity: "uncommon",
    cost: 10,
    text: "+7% Truth. If Truth ≥ 50%, gain +1 IP.",
    flavorTruth: "No cameras, only camcorders.",
    flavorGov: "No cameras, only camcorders.",
    target: { scope: "global", count: 0 },
    effects: { 
      truthDelta: 7,
      conditional: {
        ifTruthAtLeast: 50,
        then: { ipDelta: { self: 1 } }
      }
    }
  },
  {
    id: "TRUTH-166",
    faction: "truth",
    name: "Community Leak Drop",
    type: "MEDIA",
    rarity: "common",
    cost: 6,
    text: "+5% Truth.",
    flavorTruth: "The cloud is just a sky hard drive.",
    flavorGov: "The cloud is just a sky hard drive.",
    target: { scope: "global", count: 0 },
    effects: { truthDelta: 5 }
  },
  {
    id: "TRUTH-167",
    faction: "truth",
    name: "Paranormal Bake Sale",
    type: "MEDIA",
    rarity: "common",
    cost: 5,
    text: "+4% Truth. Gain +1 IP.",
    flavorTruth: "Cupcakes with classified sprinkles.",
    flavorGov: "Cupcakes with classified sprinkles.",
    target: { scope: "global", count: 0 },
    effects: { truthDelta: 4, ipDelta: { self: 1 } }
  },
  {
    id: "TRUTH-168",
    faction: "truth",
    name: "Elvis Hologram Town Hall",
    type: "MEDIA",
    rarity: "uncommon",
    cost: 10,
    text: "+7% Truth.",
    flavorTruth: "Questions answered, hips simulated.",
    flavorGov: "Questions answered, hips simulated.",
    target: { scope: "global", count: 0 },
    effects: { truthDelta: 7 }
  },
  {
    id: "TRUTH-169",
    faction: "truth",
    name: "Blurry Angel Over Courthouse",
    type: "MEDIA",
    rarity: "common",
    cost: 6,
    text: "+5% Truth.",
    flavorTruth: "Attached wings, unattached verdict.",
    flavorGov: "Attached wings, unattached verdict.",
    target: { scope: "global", count: 0 },
    effects: { truthDelta: 5 }
  },
  {
    id: "TRUTH-170",
    faction: "truth",
    name: "Agent Smitherson Misplaces Briefcase",
    type: "MEDIA",
    rarity: "rare",
    cost: 14,
    text: "+9% Truth. Opponent discards 1 card.",
    flavorTruth: "Contents: oops, everything.",
    flavorGov: "Contents: oops, everything.",
    target: { scope: "global", count: 0 },
    effects: { truthDelta: 9, discardOpponent: 1 }
  },
  {
    id: "TRUTH-171",
    faction: "truth",
    name: "Crowdfunded Telescope Network",
    type: "MEDIA",
    rarity: "uncommon",
    cost: 9,
    text: "+6% Truth. Draw 1, then discard 1.",
    flavorTruth: "Eyes everywhere, budget nowhere.",
    flavorGov: "Eyes everywhere, budget nowhere.",
    target: { scope: "global", count: 0 },
    effects: { truthDelta: 6, draw: 1, discardOpponent: 1 }
  },
  {
    id: "TRUTH-172",
    faction: "truth",
    name: "Tabloid 'Truth or Dare' Special",
    type: "MEDIA",
    rarity: "uncommon",
    cost: 9,
    text: "+6% Truth. If you control 1+ zones, gain +1 IP.",
    flavorTruth: "Dares accepted by democracy.",
    flavorGov: "Dares accepted by democracy.",
    target: { scope: "global", count: 0 },
    effects: { 
      truthDelta: 6,
      conditional: {
        ifZonesControlledAtLeast: 1,
        then: { ipDelta: { self: 1 } }
      }
    }
  },
  {
    id: "TRUTH-173",
    faction: "truth",
    name: "Elvis Roadhouse",
    type: "ZONE",
    rarity: "uncommon",
    cost: 13,
    text: "+2 Zone Defense. Gain 2 IP when played.",
    flavorTruth: "Open late, secrets later.",
    flavorGov: "Open late, secrets later.",
    target: { scope: "state", count: 1 },
    effects: { zoneDefense: 2, ipDelta: { self: 2 } }
  },
  {
    id: "TRUTH-174",
    faction: "truth",
    name: "Bat Boy Youth Center",
    type: "ZONE",
    rarity: "uncommon",
    cost: 12,
    text: "+2 Zone Defense. Draw 1 when played.",
    flavorTruth: "Homework: screaming practice.",
    flavorGov: "Homework: screaming practice.",
    target: { scope: "state", count: 1 },
    effects: { zoneDefense: 2, draw: 1 }
  },
  {
    id: "TRUTH-175",
    faction: "truth",
    name: "Haunted Subway Platform",
    type: "ZONE",
    rarity: "uncommon",
    cost: 12,
    text: "+2 Zone Defense. +3% Truth when played.",
    flavorTruth: "Next arrival: transparency.",
    flavorGov: "Next arrival: transparency.",
    target: { scope: "state", count: 1 },
    effects: { zoneDefense: 2, truthDelta: 3 }
  },
  {
    id: "TRUTH-176",
    faction: "truth",
    name: "Community Print Shop",
    type: "ZONE",
    rarity: "uncommon",
    cost: 13,
    text: "+2 Zone Defense. Gain 1 IP when played.",
    flavorTruth: "Ink smudges improve credibility.",
    flavorGov: "Ink smudges improve credibility.",
    target: { scope: "state", count: 1 },
    effects: { zoneDefense: 2, ipDelta: { self: 1 } }
  },
  {
    id: "TRUTH-177",
    faction: "truth",
    name: "Lake Monster Boardwalk",
    type: "ZONE",
    rarity: "rare",
    cost: 18,
    text: "+4 Zone Defense.",
    flavorTruth: "Souvenir shops sell periscopes.",
    flavorGov: "Souvenir shops sell periscopes.",
    target: { scope: "state", count: 1 },
    effects: { zoneDefense: 4 }
  },
  {
    id: "TRUTH-178",
    faction: "truth",
    name: "Paranormal Podcast Studio",
    type: "ZONE",
    rarity: "uncommon",
    cost: 13,
    text: "+2 Zone Defense. Gain 1 IP and +1% Truth when played.",
    flavorTruth: "Recorded live in an undisclosed basement.",
    flavorGov: "Recorded live in an undisclosed basement.",
    target: { scope: "state", count: 1 },
    effects: { zoneDefense: 2, ipDelta: { self: 1 }, truthDelta: 1 }
  },
  {
    id: "TRUTH-179",
    faction: "truth",
    name: "Conspiracy Flea Market",
    type: "ZONE",
    rarity: "uncommon",
    cost: 12,
    text: "+2 Zone Defense. Draw 1 and gain 1 IP when played.",
    flavorTruth: "Gently used evidence.",
    flavorGov: "Gently used evidence.",
    target: { scope: "state", count: 1 },
    effects: { zoneDefense: 2, draw: 1, ipDelta: { self: 1 } }
  },
  {
    id: "TRUTH-180",
    faction: "truth",
    name: "Ghost-Lit Lighthouse",
    type: "ZONE",
    rarity: "uncommon",
    cost: 12,
    text: "+2 Zone Defense.",
    flavorTruth: "Beam bends around secrets.",
    flavorGov: "Beam bends around secrets.",
    target: { scope: "state", count: 1 },
    effects: { zoneDefense: 2 }
  },
  {
    id: "TRUTH-181",
    faction: "truth",
    name: "Elvis Chapel of Revelations",
    type: "ZONE",
    rarity: "rare",
    cost: 17,
    text: "+3 Zone Defense. +6% Truth when played.",
    flavorTruth: "Choir hums suspiciously familiar melodies.",
    flavorGov: "Choir hums suspiciously familiar melodies.",
    target: { scope: "state", count: 1 },
    effects: { zoneDefense: 3, truthDelta: 6 }
  },
  {
    id: "TRUTH-182",
    faction: "truth",
    name: "Bat Boy Archives",
    type: "ZONE",
    rarity: "uncommon",
    cost: 13,
    text: "+2 Zone Defense. Gain 1 IP when played.",
    flavorTruth: "Files arranged by shriek pitch.",
    flavorGov: "Files arranged by shriek pitch.",
    target: { scope: "state", count: 1 },
    effects: { zoneDefense: 2, ipDelta: { self: 1 } }
  },
  {
    id: "TRUTH-183",
    faction: "truth",
    name: "Open Mic Press Briefing",
    type: "ATTACK",
    rarity: "uncommon",
    cost: 3,
    text: "Draw 1 card.",
    flavor: "Mic check, lie wreck.",
    flavorTruth: "Mic check, lie wreck.",
    flavorGov: "Mic check, lie wreck.",
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
    id: "TRUTH-184",
    faction: "truth",
    name: "Neighborhood Drone Surge",
    type: "ATTACK",
    rarity: "uncommon",
    cost: 3,
    text: "Target state: +1 Pressure. Draw 1.",
    flavor: "Eyes in the sky, pies on the porch.",
    flavorTruth: "Eyes in the sky, pies on the porch.",
    flavorGov: "Eyes in the sky, pies on the porch.",
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
    id: "TRUTH-185",
    faction: "truth",
    name: "Leaks to Local Paper",
    type: "ATTACK",
    rarity: "uncommon",
    cost: 3,
    text: "Opponent discards 1 card.",
    flavor: "Ink beats intimidation.",
    flavorTruth: "Ink beats intimidation.",
    flavorGov: "Ink beats intimidation.",
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
    id: "TRUTH-186",
    faction: "truth",
    name: "Citizen Audit",
    type: "ATTACK",
    rarity: "rare",
    cost: 4,
    text: "Opponent -3 IP. If Truth ≥ 60%, opponent -5 IP instead.",
    flavor: "Receipts stapled to reality.",
    flavorTruth: "Receipts stapled to reality.",
    flavorGov: "Receipts stapled to reality.",
    target: {
      count: 0,
      scope: "global"
    },
    effects: {
      ipDelta: {
        opponent: 3
      },
      conditional: {
        ifTruthAtLeast: 60,
        then: {
          ipDelta: {
            opponent: 5
          }
        }
      }
    }
  },
  {
    id: "TRUTH-187",
    faction: "truth",
    name: "Midnight Signal Boost",
    type: "ATTACK",
    rarity: "uncommon",
    cost: 3,
    text: "+4% Truth. Opponent -1 IP.",
    flavor: "Static speaks volumes.",
    flavorTruth: "Static speaks volumes.",
    flavorGov: "Static speaks volumes.",
    target: {
      count: 0,
      scope: "global"
    },
    effects: {
      truthDelta: 4,
      ipDelta: {
        opponent: 2
      }
    }
  },
  {
    id: "TRUTH-188",
    faction: "truth",
    name: "Counter-Spin Workshop",
    type: "ATTACK",
    rarity: "uncommon",
    cost: 3,
    text: "Gain +1 IP.",
    flavor: "Spin class for facts.",
    flavorTruth: "Spin class for facts.",
    flavorGov: "Spin class for facts.",
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
    id: "TRUTH-189",
    faction: "truth",
    name: "FOIA Blitz Marathon",
    type: "ATTACK",
    rarity: "rare",
    cost: 4,
    text: "Draw 2. Opponent -2 IP.",
    flavor: "Paper cuts to the narrative.",
    flavorTruth: "Paper cuts to the narrative.",
    flavorGov: "Paper cuts to the narrative.",
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
    id: "TRUTH-190",
    faction: "truth",
    name: "Flash Mob Fact-Check",
    type: "ATTACK",
    rarity: "uncommon",
    cost: 3,
    text: "Target state: reduce its Defense by 1. Draw 1.",
    flavor: "Synchronised citations.",
    flavorTruth: "Synchronised citations.",
    flavorGov: "Synchronised citations.",
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
    id: "TRUTH-191",
    faction: "truth",
    name: "Mothman Siren",
    type: "ATTACK",
    rarity: "uncommon",
    cost: 3,
    text: "Target state: +1 Pressure.",
    flavor: "Wings over weak points.",
    flavorTruth: "Wings over weak points.",
    flavorGov: "Wings over weak points.",
    target: {
      count: 1,
      scope: "state"
    },
    effects: {
      ipDelta: {
        opponent: 2
      },
      pressureDelta: 1
    }
  },
  {
    id: "TRUTH-192",
    faction: "truth",
    name: "Copier Jam of Destiny",
    type: "DEFENSIVE",
    rarity: "common",
    cost: 6,
    text: "Gain 2 IP.",
    flavorTruth: "Paper wins this round.",
    flavorGov: "Paper wins this round.",
    target: { scope: "global", count: 0 },
    effects: { ipDelta: { self: 2 } }
  },
  {
    id: "TRUTH-193",
    faction: "truth",
    name: "Neighborhood Witness Net",
    type: "DEFENSIVE",
    rarity: "uncommon",
    cost: 7,
    text: "Opponent -2 IP.",
    flavorTruth: "We saw that coming.",
    flavorGov: "We saw that coming.",
    target: { scope: "global", count: 0 },
    effects: { ipDelta: { opponent: -2 } }
  },
  {
    id: "TRUTH-194",
    faction: "truth",
    name: "Courthouse Candlelight Vigil",
    type: "DEFENSIVE",
    rarity: "uncommon",
    cost: 8,
    text: "Gain 2 IP. +1% Truth.",
    flavorTruth: "Light pierces ledger lines.",
    flavorGov: "Light pierces ledger lines.",
    target: { scope: "global", count: 0 },
    effects: { ipDelta: { self: 2 }, truthDelta: 1 }
  },
  {
    id: "TRUTH-195",
    faction: "truth",
    name: "Ghost Jury Nullification",
    type: "DEFENSIVE",
    rarity: "rare",
    cost: 10,
    text: "Gain 4 IP.",
    flavorTruth: "Overruled by the afterlife.",
    flavorGov: "Overruled by the afterlife.",
    target: { scope: "global", count: 0 },
    effects: { ipDelta: { self: 4 } }
  },
  {
    id: "TRUTH-196",
    faction: "truth",
    name: "Open Source Investigators",
    type: "DEFENSIVE",
    rarity: "uncommon",
    cost: 10,
    text: "Draw 1. If you control 1+ zones, draw 1 more.",
    flavorTruth: "Threads that pull threads.",
    flavorGov: "Threads that pull threads.",
    target: { scope: "global", count: 0 },
    effects: { 
      draw: 1,
      conditional: {
        ifZonesControlledAtLeast: 1,
        then: { draw: 1 }
      }
    }
  },
  {
    id: "TRUTH-197",
    faction: "truth",
    name: "Tabloid Freedom Fund",
    type: "DEFENSIVE",
    rarity: "uncommon",
    cost: 9,
    text: "Gain 3 IP.",
    flavorTruth: "Small bills fund big stories.",
    flavorGov: "Small bills fund big stories.",
    target: { scope: "global", count: 0 },
    effects: { ipDelta: { self: 3 } }
  },
  {
    id: "TRUTH-198",
    faction: "truth",
    name: "Community Wi-Fi of Truth",
    type: "DEFENSIVE",
    rarity: "uncommon",
    cost: 8,
    text: "+3% Truth. Gain 1 IP.",
    flavorTruth: "Password: OpenEverything.",
    flavorGov: "Password: OpenEverything.",
    target: { scope: "global", count: 0 },
    effects: { truthDelta: 3, ipDelta: { self: 1 } }
  },
  {
    id: "TRUTH-199",
    faction: "truth",
    name: "Elvis Time Capsule",
    type: "DEFENSIVE",
    rarity: "rare",
    cost: 12,
    text: "+6% Truth. Gain 2 IP.",
    flavorTruth: "Contents: one sequined future.",
    flavorGov: "Contents: one sequined future.",
    target: { scope: "global", count: 0 },
    effects: { truthDelta: 6, ipDelta: { self: 2 } }
  },
  {
    id: "TRUTH-200",
    faction: "truth",
    name: "The Final Disclosure",
    type: "MEDIA",
    rarity: "legendary",
    cost: 35,
    text: "+20% Truth. Draw 2 cards.",
    flavorTruth: "The last page of the last secret file.",
    flavorGov: "The last page of the last secret file.",
    target: { scope: "global", count: 0 },
    effects: { truthDelta: 20, draw: 2 }
  }
];