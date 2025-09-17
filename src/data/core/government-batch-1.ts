import type { GameCard } from '@/rules/mvp';

export const governmentBatch1: GameCard[] = [
  {
    "id": "GOV-001",
    "name": "Routine Training Exercise",
    "faction": "government",
    "type": "MEDIA",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": -1
    },
    "flavorTruth": "Just another military exercise, nothing to see here.",
    "flavorGov": "Standard operational readiness training as scheduled."
  },
  {
    "id": "GOV-002",
    "name": "Redacted Press Briefing",
    "faction": "government",
    "type": "MEDIA",
    "rarity": "uncommon",
    "cost": 4,
    "effects": {
      "truthDelta": -2
    },
    "flavor": "The fewer words, the safer the world.",
    "flavorTruth": "What they're not telling you speaks volumes.",
    "flavorGov": "The fewer words, the safer the world."
  },
  {
    "id": "GOV-003",
    "name": "Continuity of Government Protocol",
    "faction": "government",
    "type": "ATTACK",
    "rarity": "uncommon",
    "cost": 3,
    "effects": {
      "ipDelta": {
        "opponent": 2
      }
    },
    "flavor": "Democracy is great. Backups are greater.",
    "flavorTruth": "When democracy fails, what takes its place?",
    "flavorGov": "Democracy is great. Backups are greater."
  },
  {
    "id": "GOV-004",
    "name": "Classified Briefing Room",
    "faction": "government",
    "type": "MEDIA",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": -1
    },
    "flavor": "No windows, two clocks, three alarms."
  },
  {
    "id": "GOV-005",
    "name": "FOIA Slow-Walk",
    "faction": "government",
    "type": "MEDIA",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": -1
    },
    "flavor": "Your transparency request is very important to us."
  },
  {
    "id": "GOV-006",
    "name": "Operation Mockingbird II",
    "faction": "government",
    "type": "MEDIA",
    "rarity": "rare",
    "cost": 5,
    "effects": {
      "truthDelta": -3
    },
    "flavor": "Tonight's top story was approved at noon."
  },
  {
    "id": "GOV-007",
    "name": "National Security Waiver",
    "faction": "government",
    "type": "ZONE",
    "rarity": "uncommon",
    "cost": 5,
    "effects": {
      "pressureDelta": 2
    },
    "flavor": "In the interest of national serenity."
  },
  {
    "id": "GOV-008",
    "name": "Budget Reprogramming",
    "faction": "government",
    "type": "ATTACK",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "flavor": "Line items are a state of mind."
  },
  {
    "id": "GOV-009",
    "name": "Men in Charcoal",
    "faction": "government",
    "type": "ATTACK",
    "rarity": "uncommon",
    "cost": 3,
    "effects": {
      "ipDelta": {
        "opponent": 2
      }
    },
    "flavor": "They don't need badges when they have clipboards."
  },
  {
    "id": "GOV-010",
    "name": "Compartmentalization",
    "faction": "government",
    "type": "ZONE",
    "rarity": "uncommon",
    "cost": 5,
    "effects": {
      "pressureDelta": 2
    },
    "flavor": "The left hand files the right hand."
  },
  {
    "id": "GOV-011",
    "name": "Intercept & Disrupt",
    "faction": "government",
    "type": "ATTACK",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "flavor": "Static is the sound of safety."
  },
  {
    "id": "GOV-012",
    "name": "Crisis Actor Auditions",
    "faction": "government",
    "type": "MEDIA",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": -1
    },
    "flavor": "Please cry on lines two and three."
  },
  {
    "id": "GOV-013",
    "name": "Roswell Storage Hangar",
    "faction": "government",
    "type": "ZONE",
    "rarity": "uncommon",
    "cost": 5,
    "effects": {
      "pressureDelta": 2
    },
    "flavor": "Crates labeled 'Weather Balloon' (wink)."
  },
  {
    "id": "GOV-014",
    "name": "Emergency Broadcast Override",
    "faction": "government",
    "type": "MEDIA",
    "rarity": "rare",
    "cost": 5,
    "effects": {
      "truthDelta": -3
    },
    "flavor": "Your regularly scheduled reality will return shortly."
  },
  {
    "id": "GOV-015",
    "name": "SIGINT Sweep",
    "faction": "government",
    "type": "ATTACK",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "flavor": "If it beeped, we kept it."
  },
  {
    "id": "GOV-016",
    "name": "Plausible Deniability",
    "faction": "government",
    "type": "ATTACK",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "flavor": "We can neither confirm nor deny that we denied."
  },
  {
    "id": "GOV-017",
    "name": "Underground Briefing Theater",
    "faction": "government",
    "type": "MEDIA",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": -1
    },
    "flavor": "Seats 12, alarms 13."
  },
  {
    "id": "GOV-018",
    "name": "Shell Company Carousel",
    "faction": "government",
    "type": "ZONE",
    "rarity": "uncommon",
    "cost": 5,
    "effects": {
      "pressureDelta": 2
    },
    "flavor": "Money laundering? Please, we dry-clean it."
  },
  {
    "id": "GOV-019",
    "name": "Counter-Meme Task Force",
    "faction": "government",
    "type": "MEDIA",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": -1
    },
    "flavor": "Clip art is a weapon system."
  },
  {
    "id": "GOV-020",
    "name": "Honeytrap Asset",
    "faction": "government",
    "type": "ATTACK",
    "rarity": "uncommon",
    "cost": 3,
    "effects": {
      "ipDelta": {
        "opponent": 2
      }
    },
    "flavor": "Sign here. Smile there."
  },
  {
    "id": "GOV-021",
    "name": "National Security Letter",
    "faction": "government",
    "type": "MEDIA",
    "rarity": "uncommon",
    "cost": 4,
    "effects": {
      "truthDelta": -2
    },
    "flavor": "Gag orders pair well with coffee."
  },
  {
    "id": "GOV-022",
    "name": "Ghost Budget Annex",
    "faction": "government",
    "type": "ATTACK",
    "rarity": "rare",
    "cost": 4,
    "effects": {
      "ipDelta": {
        "opponent": 3
      }
    },
    "flavor": "Zeroes are patriotic."
  },
  {
    "id": "GOV-023",
    "name": "Airport Backroom",
    "faction": "government",
    "type": "MEDIA",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": -1
    },
    "flavor": "Shoes off. Beliefs off."
  },
  {
    "id": "GOV-024",
    "name": "Cutout Courier",
    "faction": "government",
    "type": "ATTACK",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "flavor": "Trust the trench coat."
  },
  {
    "id": "GOV-025",
    "name": "Cigarette Whisperer",
    "faction": "government",
    "type": "MEDIA",
    "rarity": "rare",
    "cost": 5,
    "effects": {
      "truthDelta": -3
    },
    "flavor": "The smoke alarm is for show."
  },
  {
    "id": "GOV-026",
    "name": "Operation Paper Shuffle",
    "faction": "government",
    "type": "MEDIA",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": -1
    },
    "flavor": "Filed under 'Sometime'."
  },
  {
    "id": "GOV-027",
    "name": "Denver Airport Bunker",
    "faction": "government",
    "type": "ZONE",
    "rarity": "rare",
    "cost": 6,
    "effects": {
      "pressureDelta": 3
    },
    "flavor": "Art, tunnels, and a lot of keycards."
  },
  {
    "id": "GOV-028",
    "name": "Black Helicopters",
    "faction": "government",
    "type": "ATTACK",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "flavor": "You can hear them when it's too late."
  },
  {
    "id": "GOV-029",
    "name": "Declassification, Eventually",
    "faction": "government",
    "type": "MEDIA",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": -1
    },
    "flavor": "History will vindicate page 47."
  },
  {
    "id": "GOV-030",
    "name": "Fusion Center Grid",
    "faction": "government",
    "type": "ZONE",
    "rarity": "uncommon",
    "cost": 5,
    "effects": {
      "pressureDelta": 2
    },
    "flavor": "Interoperability is its own language."
  },
  {
    "id": "GOV-031",
    "name": "Sealed Indictment",
    "faction": "government",
    "type": "ATTACK",
    "rarity": "uncommon",
    "cost": 3,
    "effects": {
      "ipDelta": {
        "opponent": 2
      }
    },
    "flavor": "Allegedly mandatory."
  },
  {
    "id": "GOV-032",
    "name": "Telecom Compliance",
    "faction": "government",
    "type": "MEDIA",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": -1
    },
    "flavor": "Terms of service, revised."
  },
  {
    "id": "GOV-033",
    "name": "Desert Storage Yard",
    "faction": "government",
    "type": "ZONE",
    "rarity": "common",
    "cost": 4,
    "effects": {
      "pressureDelta": 1
    },
    "flavor": "Everything important is in row 51."
  },
  {
    "id": "GOV-034",
    "name": "Friendly Fact-Checker",
    "faction": "government",
    "type": "MEDIA",
    "rarity": "uncommon",
    "cost": 4,
    "effects": {
      "truthDelta": -2
    },
    "flavor": "Four Pinocchios wearing sunglasses."
  },
  {
    "id": "GOV-035",
    "name": "Strategic Briefcase",
    "faction": "government",
    "type": "ATTACK",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "flavor": "It's full of paper and power."
  },
  {
    "id": "GOV-036",
    "name": "Wilderness Listening Post",
    "faction": "government",
    "type": "ZONE",
    "rarity": "uncommon",
    "cost": 5,
    "effects": {
      "pressureDelta": 2
    },
    "flavor": "Owls aren't what they seem. Neither are antennas."
  },
  {
    "id": "GOV-037",
    "name": "Kryptek Asset",
    "faction": "government",
    "type": "ATTACK",
    "rarity": "rare",
    "cost": 4,
    "effects": {
      "ipDelta": {
        "opponent": 3
      },
      "discardOpponent": 1
    },
    "flavor": "A handshake you don't wash off."
  },
  {
    "id": "GOV-038",
    "name": "Compliance Audit",
    "faction": "government",
    "type": "ATTACK",
    "rarity": "uncommon",
    "cost": 3,
    "effects": {
      "ipDelta": {
        "opponent": 2
      }
    },
    "flavor": "Forms first, outrage later."
  },
  {
    "id": "GOV-039",
    "name": "Press Pool Lockdown",
    "faction": "government",
    "type": "MEDIA",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": -1
    },
    "flavor": "Coverage is a privilege."
  },
  {
    "id": "GOV-040",
    "name": "Security Theater",
    "faction": "government",
    "type": "MEDIA",
    "rarity": "uncommon",
    "cost": 4,
    "effects": {
      "truthDelta": -2
    },
    "flavor": "Now with 30% more beeping."
  },
  {
    "id": "GOV-041",
    "name": "Records Sealed by Court",
    "faction": "government",
    "type": "MEDIA",
    "rarity": "rare",
    "cost": 5,
    "effects": {
      "truthDelta": -3
    },
    "flavor": "Justice is blindfolded and ear-plugged."
  },
  {
    "id": "GOV-042",
    "name": "Harbor Dock Warehouse",
    "faction": "government",
    "type": "ZONE",
    "rarity": "common",
    "cost": 4,
    "effects": {
      "pressureDelta": 1
    },
    "flavor": "Manifest says 'miscellaneous'."
  },
  {
    "id": "GOV-043",
    "name": "Psychological Operations Cell",
    "faction": "government",
    "type": "MEDIA",
    "rarity": "uncommon",
    "cost": 4,
    "effects": {
      "truthDelta": -2
    },
    "flavor": "We A/B test reality."
  },
  {
    "id": "GOV-044",
    "name": "Unmarked Evidence Locker",
    "faction": "government",
    "type": "ZONE",
    "rarity": "uncommon",
    "cost": 5,
    "effects": {
      "pressureDelta": 2
    },
    "flavor": "Keyholders unknown."
  },
  {
    "id": "GOV-045",
    "name": "Lizard Lobby Luncheon",
    "faction": "government",
    "type": "MEDIA",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": -1
    },
    "flavor": "The salad blinks first."
  },
  {
    "id": "GOV-046",
    "name": "Black Budget Skunkworks",
    "faction": "government",
    "type": "ATTACK",
    "rarity": "rare",
    "cost": 4,
    "effects": {
      "ipDelta": {
        "opponent": 3
      }
    },
    "flavor": "Innovation you'll never hear about."
  },
  {
    "id": "GOV-047",
    "name": "Mount Weather Complex",
    "faction": "government",
    "type": "ZONE",
    "rarity": "rare",
    "cost": 6,
    "effects": {
      "pressureDelta": 3
    },
    "flavor": "When the lights go out, these go on."
  },
  {
    "id": "GOV-048",
    "name": "Witness Relocation",
    "faction": "government",
    "type": "ATTACK",
    "rarity": "uncommon",
    "cost": 3,
    "effects": {
      "ipDelta": {
        "opponent": 2
      }
    },
    "flavor": "New name, same story—now quieter."
  },
  {
    "id": "GOV-049",
    "name": "Council Above the Ceiling",
    "faction": "government",
    "type": "MEDIA",
    "rarity": "legendary",
    "cost": 6,
    "effects": {
      "truthDelta": -4
    },
    "flavor": "Minutes not taken. Decisions irreversible."
  },
  {
    "id": "GOV-050",
    "name": "Executive Privilege Blanket",
    "faction": "government",
    "type": "MEDIA",
    "rarity": "rare",
    "cost": 5,
    "effects": {
      "truthDelta": -3
    },
    "flavor": "It's not a cover-up if it's a comforter."
  }
];
