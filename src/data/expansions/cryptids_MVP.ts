import type { GameCard } from '@/rules/mvp';

const cards: GameCard[] = [
  {
    "id": "CRY-TS-001",
    "name": "Cryptid Field Research",
    "type": "ZONE",
    "faction": "truth",
    "rarity": "uncommon",
    "cost": 5,
    "effects": {
      "pressureDelta": 2
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Cryptid looked straight into the lens.\"",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "CRY-TS-002",
    "name": "Ultra Disclosure Protocol",
    "type": "MEDIA",
    "faction": "truth",
    "rarity": "legendary",
    "cost": 6,
    "effects": {
      "truthDelta": 4
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Tabloid headline writes itself.\""
  },
  {
    "id": "CRY-TS-003",
    "name": "Bigfoot Expedition",
    "type": "ZONE",
    "faction": "truth",
    "rarity": "uncommon",
    "cost": 5,
    "effects": {
      "pressureDelta": 2
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Experts disagree; the crowd screams yes.\"",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "CRY-TS-004",
    "name": "Alien Abduction Support Group",
    "type": "ATTACK",
    "faction": "truth",
    "rarity": "uncommon",
    "cost": 3,
    "effects": {
      "ipDelta": {
        "opponent": 2
      }
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Alien looked straight into the lens.\""
  },
  {
    "id": "CRY-TS-005",
    "name": "UFO Hotline Network",
    "type": "MEDIA",
    "faction": "truth",
    "rarity": "uncommon",
    "cost": 4,
    "effects": {
      "truthDelta": 2
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: UFO looked straight into the lens.\""
  },
  {
    "id": "CRY-TS-006",
    "name": "Mothman Prophecies",
    "type": "ATTACK",
    "faction": "truth",
    "rarity": "rare",
    "cost": 4,
    "effects": {
      "ipDelta": {
        "opponent": 3
      },
      "discardOpponent": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Pixels enhanced: chills confirmed.\""
  },
  {
    "id": "CRY-TS-007",
    "name": "Chupacabra Sighting Report",
    "type": "ATTACK",
    "faction": "truth",
    "rarity": "uncommon",
    "cost": 3,
    "effects": {
      "ipDelta": {
        "opponent": 2
      }
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Chupacabra looked straight into the lens.\""
  },
  {
    "id": "CRY-TS-008",
    "name": "Lake Monster Sonar Evidence",
    "type": "ATTACK",
    "faction": "truth",
    "rarity": "uncommon",
    "cost": 3,
    "effects": {
      "ipDelta": {
        "opponent": 2
      }
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Experts disagree; the crowd screams yes.\""
  },
  {
    "id": "CRY-TS-009",
    "name": "Ancient Astronaut Theory",
    "type": "MEDIA",
    "faction": "truth",
    "rarity": "rare",
    "cost": 5,
    "effects": {
      "truthDelta": 3
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: We brought snacks and a camcorder.\""
  },
  {
    "id": "CRY-TS-010",
    "name": "Roswell Survivor Testimony",
    "type": "MEDIA",
    "faction": "truth",
    "rarity": "rare",
    "cost": 5,
    "effects": {
      "truthDelta": 3
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Roswell looked straight into the lens.\""
  },
  {
    "id": "CRY-TS-011",
    "name": "Area 51 Infiltration",
    "type": "ATTACK",
    "faction": "truth",
    "rarity": "legendary",
    "cost": 5,
    "effects": {
      "ipDelta": {
        "opponent": 4
      },
      "discardOpponent": 2
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Experts disagree; the crowd screams yes.\""
  },
  {
    "id": "CRY-TS-012",
    "name": "Jersey Devil Hunt",
    "type": "ATTACK",
    "faction": "truth",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Pixels enhanced: chills confirmed.\""
  },
  {
    "id": "CRY-TS-013",
    "name": "Skunk Ape Footage",
    "type": "MEDIA",
    "faction": "truth",
    "rarity": "uncommon",
    "cost": 4,
    "effects": {
      "truthDelta": 2
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Pixels enhanced: chills confirmed.\""
  },
  {
    "id": "CRY-TS-014",
    "name": "Beast of Bray Road Tracking",
    "type": "ATTACK",
    "faction": "truth",
    "rarity": "uncommon",
    "cost": 3,
    "effects": {
      "ipDelta": {
        "opponent": 2
      }
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Tabloid headline writes itself.\""
  },
  {
    "id": "CRY-TS-015",
    "name": "Phantom Kangaroo Tracking Network",
    "type": "ZONE",
    "faction": "truth",
    "rarity": "uncommon",
    "cost": 5,
    "effects": {
      "pressureDelta": 2
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Experts disagree; the crowd screams yes.\"",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "CRY-TS-016",
    "name": "Fouke Monster Evidence",
    "type": "ATTACK",
    "faction": "truth",
    "rarity": "uncommon",
    "cost": 3,
    "effects": {
      "ipDelta": {
        "opponent": 2
      }
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Tabloid headline writes itself.\""
  },
  {
    "id": "CRY-TS-017",
    "name": "Thunderbird Sightings Database",
    "type": "ATTACK",
    "faction": "truth",
    "rarity": "rare",
    "cost": 4,
    "effects": {
      "ipDelta": {
        "opponent": 3
      },
      "discardOpponent": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Experts disagree; the crowd screams yes.\""
  },
  {
    "id": "CRY-TS-018",
    "name": "Shadow People Documentation",
    "type": "ATTACK",
    "faction": "truth",
    "rarity": "uncommon",
    "cost": 3,
    "effects": {
      "ipDelta": {
        "opponent": 2
      }
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Tabloid headline writes itself.\""
  },
  {
    "id": "CRY-TS-019",
    "name": "Hopkinsville Goblins Testimony",
    "type": "MEDIA",
    "faction": "truth",
    "rarity": "uncommon",
    "cost": 4,
    "effects": {
      "truthDelta": 2
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Hopkinsville looked straight into the lens.\""
  },
  {
    "id": "CRY-TS-020",
    "name": "Lizard People Exposé",
    "type": "ATTACK",
    "faction": "truth",
    "rarity": "legendary",
    "cost": 5,
    "effects": {
      "ipDelta": {
        "opponent": 4
      },
      "discardOpponent": 2
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Lizard looked straight into the lens.\""
  },
  {
    "id": "CRY-TS-021",
    "name": "Hollow Earth Expedition",
    "type": "ZONE",
    "faction": "truth",
    "rarity": "rare",
    "cost": 6,
    "effects": {
      "pressureDelta": 3
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Tabloid headline writes itself.\"",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "CRY-TS-022",
    "name": "Time Traveler Interview",
    "type": "MEDIA",
    "faction": "truth",
    "rarity": "legendary",
    "cost": 6,
    "effects": {
      "truthDelta": 4
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Tabloid headline writes itself.\""
  },
  {
    "id": "CRY-TS-023",
    "name": "UFO Crash Retrieval Team",
    "type": "MEDIA",
    "faction": "truth",
    "rarity": "uncommon",
    "cost": 4,
    "effects": {
      "truthDelta": 2
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Pixels enhanced: chills confirmed.\""
  },
  {
    "id": "CRY-TS-024",
    "name": "Interdimensional Portal Research",
    "type": "MEDIA",
    "faction": "truth",
    "rarity": "uncommon",
    "cost": 4,
    "effects": {
      "truthDelta": 2
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Interdimensional looked straight into the lens.\""
  },
  {
    "id": "CRY-TS-025",
    "name": "Phantom Black Dog Network",
    "type": "ZONE",
    "faction": "truth",
    "rarity": "uncommon",
    "cost": 5,
    "effects": {
      "pressureDelta": 2
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Phantom looked straight into the lens.\"",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "CRY-TS-026",
    "name": "Yeti Hair Analysis",
    "type": "MEDIA",
    "faction": "truth",
    "rarity": "uncommon",
    "cost": 4,
    "effects": {
      "truthDelta": 2
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Tabloid headline writes itself.\""
  },
  {
    "id": "CRY-TS-027",
    "name": "Skinwalker Ranch Investigation",
    "type": "ATTACK",
    "faction": "truth",
    "rarity": "rare",
    "cost": 4,
    "effects": {
      "ipDelta": {
        "opponent": 3
      },
      "discardOpponent": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Tabloid headline writes itself.\""
  },
  {
    "id": "CRY-TS-028",
    "name": "Dover Demon Witness Testimony",
    "type": "MEDIA",
    "faction": "truth",
    "rarity": "uncommon",
    "cost": 4,
    "effects": {
      "truthDelta": 2
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Experts disagree; the crowd screams yes.\""
  },
  {
    "id": "CRY-TS-029",
    "name": "Real Alien Autopsy Leak",
    "type": "MEDIA",
    "faction": "truth",
    "rarity": "rare",
    "cost": 5,
    "effects": {
      "truthDelta": 3
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Real looked straight into the lens.\""
  },
  {
    "id": "CRY-TS-030",
    "name": "Cattle Mutilation Pattern Analysis",
    "type": "ZONE",
    "faction": "truth",
    "rarity": "uncommon",
    "cost": 5,
    "effects": {
      "pressureDelta": 2
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Tabloid headline writes itself.\"",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "CRY-TS-031",
    "name": "Crop Circle Decoder Ring",
    "type": "MEDIA",
    "faction": "truth",
    "rarity": "uncommon",
    "cost": 4,
    "effects": {
      "truthDelta": 2
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Experts disagree; the crowd screams yes.\""
  },
  {
    "id": "CRY-TS-032",
    "name": "1897 Phantom Airship Reports",
    "type": "MEDIA",
    "faction": "truth",
    "rarity": "uncommon",
    "cost": 4,
    "effects": {
      "truthDelta": 2
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Pixels enhanced: chills confirmed.\""
  },
  {
    "id": "CRY-TS-033",
    "name": "Beast of Bladenboro Hunt",
    "type": "ATTACK",
    "faction": "truth",
    "rarity": "uncommon",
    "cost": 3,
    "effects": {
      "ipDelta": {
        "opponent": 2
      }
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Pixels enhanced: chills confirmed.\""
  },
  {
    "id": "CRY-TS-034",
    "name": "Washington Sea Serpent Sonar",
    "type": "ZONE",
    "faction": "truth",
    "rarity": "uncommon",
    "cost": 5,
    "effects": {
      "pressureDelta": 2
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Experts disagree; the crowd screams yes.\"",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "CRY-TS-035",
    "name": "Moon-Eyed People Archaeological Site",
    "type": "ZONE",
    "faction": "truth",
    "rarity": "rare",
    "cost": 6,
    "effects": {
      "pressureDelta": 3
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Tabloid headline writes itself.\"",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "CRY-TS-036",
    "name": "Giant Pacific Octopus Encounter",
    "type": "ZONE",
    "faction": "truth",
    "rarity": "rare",
    "cost": 6,
    "effects": {
      "pressureDelta": 3
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Tabloid headline writes itself.\"",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "CRY-TS-037",
    "name": "Remote Viewing Leak",
    "type": "MEDIA",
    "faction": "truth",
    "rarity": "rare",
    "cost": 5,
    "effects": {
      "truthDelta": 3
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: We brought snacks and a camcorder.\""
  },
  {
    "id": "CRY-TS-038",
    "name": "Invisible Aircraft Photos",
    "type": "MEDIA",
    "faction": "truth",
    "rarity": "legendary",
    "cost": 6,
    "effects": {
      "truthDelta": 4
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: We brought snacks and a camcorder.\""
  },
  {
    "id": "CRY-TS-039",
    "name": "Missing Time Survivor Network",
    "type": "MEDIA",
    "faction": "truth",
    "rarity": "rare",
    "cost": 5,
    "effects": {
      "truthDelta": 3
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Experts disagree; the crowd screams yes.\""
  },
  {
    "id": "CRY-TS-040",
    "name": "Grey Alien Eyewitness Testimony",
    "type": "MEDIA",
    "faction": "truth",
    "rarity": "rare",
    "cost": 5,
    "effects": {
      "truthDelta": 3
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Pixels enhanced: chills confirmed.\""
  },
  {
    "id": "CRY-TS-041",
    "name": "Reality Breach Detector",
    "type": "MEDIA",
    "faction": "truth",
    "rarity": "legendary",
    "cost": 6,
    "effects": {
      "truthDelta": 4
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: We brought snacks and a camcorder.\""
  },
  {
    "id": "CRY-TS-042",
    "name": "Paranormal Investigation Society",
    "type": "MEDIA",
    "faction": "truth",
    "rarity": "uncommon",
    "cost": 4,
    "effects": {
      "truthDelta": 2
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Tabloid headline writes itself.\""
  },
  {
    "id": "CRY-TS-043",
    "name": "Alien Implant Removal Clinic",
    "type": "ZONE",
    "faction": "truth",
    "rarity": "rare",
    "cost": 6,
    "effects": {
      "pressureDelta": 3
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Experts disagree; the crowd screams yes.\"",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "CRY-TS-044",
    "name": "Consciousness Expansion Workshop",
    "type": "MEDIA",
    "faction": "truth",
    "rarity": "rare",
    "cost": 5,
    "effects": {
      "truthDelta": 3
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Tabloid headline writes itself.\""
  },
  {
    "id": "CRY-TS-045",
    "name": "Multidimensional Gateway",
    "type": "MEDIA",
    "faction": "truth",
    "rarity": "legendary",
    "cost": 6,
    "effects": {
      "truthDelta": 4
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Tabloid headline writes itself.\""
  },
  {
    "id": "CRY-TS-046",
    "name": "Moon Landing Hoax Evidence",
    "type": "MEDIA",
    "faction": "truth",
    "rarity": "uncommon",
    "cost": 4,
    "effects": {
      "truthDelta": 2
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Experts disagree; the crowd screams yes.\""
  },
  {
    "id": "CRY-TS-047",
    "name": "Memory Recovery Session",
    "type": "MEDIA",
    "faction": "truth",
    "rarity": "rare",
    "cost": 5,
    "effects": {
      "truthDelta": 3
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Tabloid headline writes itself.\""
  },
  {
    "id": "CRY-TS-048",
    "name": "Shadow Government Infiltration",
    "type": "ATTACK",
    "faction": "truth",
    "rarity": "legendary",
    "cost": 5,
    "effects": {
      "ipDelta": {
        "opponent": 4
      },
      "discardOpponent": 2
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Pixels enhanced: chills confirmed.\""
  },
  {
    "id": "CRY-TS-049",
    "name": "Operation Paperclip Files",
    "type": "MEDIA",
    "faction": "truth",
    "rarity": "rare",
    "cost": 5,
    "effects": {
      "truthDelta": 3
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Pixels enhanced: chills confirmed.\""
  },
  {
    "id": "CRY-TS-050",
    "name": "Holographic Universe Theory",
    "type": "MEDIA",
    "faction": "truth",
    "rarity": "uncommon",
    "cost": 4,
    "effects": {
      "truthDelta": 2
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Tabloid headline writes itself.\""
  },
  {
    "id": "CRY-TS-051",
    "name": "Cryptid DNA Evidence Database",
    "type": "MEDIA",
    "faction": "truth",
    "rarity": "rare",
    "cost": 5,
    "effects": {
      "truthDelta": 3
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Experts disagree; the crowd screams yes.\""
  },
  {
    "id": "CRY-TS-052",
    "name": "Phantom Satellite Tracking",
    "type": "MEDIA",
    "faction": "truth",
    "rarity": "rare",
    "cost": 5,
    "effects": {
      "truthDelta": 3
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: We brought snacks and a camcorder.\""
  },
  {
    "id": "CRY-TS-053",
    "name": "Consciousness Upload Technology",
    "type": "MEDIA",
    "faction": "truth",
    "rarity": "uncommon",
    "cost": 4,
    "effects": {
      "truthDelta": 2
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: We brought snacks and a camcorder.\""
  },
  {
    "id": "CRY-TS-054",
    "name": "Multidimensional Broadcast Network",
    "type": "ZONE",
    "faction": "truth",
    "rarity": "legendary",
    "cost": 7,
    "effects": {
      "pressureDelta": 4
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: We brought snacks and a camcorder.\"",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "CRY-TS-055",
    "name": "Crystal Wi-Fi Chakra Network",
    "type": "MEDIA",
    "faction": "truth",
    "rarity": "uncommon",
    "cost": 4,
    "effects": {
      "truthDelta": 2
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Tabloid headline writes itself.\""
  },
  {
    "id": "CRY-TS-056",
    "name": "Late Night AM Radio",
    "type": "MEDIA",
    "faction": "truth",
    "rarity": "uncommon",
    "cost": 4,
    "effects": {
      "truthDelta": 2
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Experts disagree; the crowd screams yes.\""
  },
  {
    "id": "CRY-TS-057",
    "name": "Viral Thread Storm",
    "type": "MEDIA",
    "faction": "truth",
    "rarity": "rare",
    "cost": 5,
    "effects": {
      "truthDelta": 3
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Pixels enhanced: chills confirmed.\""
  },
  {
    "id": "CRY-TS-058",
    "name": "Bigfoot Field Operations",
    "type": "ZONE",
    "faction": "truth",
    "rarity": "rare",
    "cost": 6,
    "effects": {
      "pressureDelta": 3
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Bigfoot looked straight into the lens.\"",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "CRY-TS-059",
    "name": "Mothman Omen Network",
    "type": "ATTACK",
    "faction": "truth",
    "rarity": "uncommon",
    "cost": 3,
    "effects": {
      "ipDelta": {
        "opponent": 2
      }
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Experts disagree; the crowd screams yes.\""
  },
  {
    "id": "CRY-TS-060",
    "name": "Essential Oils Mind Shield",
    "type": "MEDIA",
    "faction": "truth",
    "rarity": "uncommon",
    "cost": 4,
    "effects": {
      "truthDelta": 2
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Pixels enhanced: chills confirmed.\""
  },
  {
    "id": "CRY-TS-061",
    "name": "Healing Crystal Array",
    "type": "MEDIA",
    "faction": "truth",
    "rarity": "uncommon",
    "cost": 4,
    "effects": {
      "truthDelta": 2
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Healing looked straight into the lens.\""
  },
  {
    "id": "CRY-TS-062",
    "name": "Really Long YouTube Videos",
    "type": "MEDIA",
    "faction": "truth",
    "rarity": "uncommon",
    "cost": 4,
    "effects": {
      "truthDelta": 2
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Pixels enhanced: chills confirmed.\""
  },
  {
    "id": "CRY-TS-063",
    "name": "Whistleblower Protection Network",
    "type": "MEDIA",
    "faction": "truth",
    "rarity": "rare",
    "cost": 5,
    "effects": {
      "truthDelta": 3
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Pixels enhanced: chills confirmed.\""
  },
  {
    "id": "CRY-TS-064",
    "name": "Anonymous Leak Platform",
    "type": "MEDIA",
    "faction": "truth",
    "rarity": "rare",
    "cost": 5,
    "effects": {
      "truthDelta": 3
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Tabloid headline writes itself.\""
  },
  {
    "id": "CRY-TS-065",
    "name": "Flat Earth Conference",
    "type": "MEDIA",
    "faction": "truth",
    "rarity": "uncommon",
    "cost": 4,
    "effects": {
      "truthDelta": 2
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Flat looked straight into the lens.\""
  },
  {
    "id": "CRY-TS-066",
    "name": "Chemtrail Detection Kit",
    "type": "ZONE",
    "faction": "truth",
    "rarity": "uncommon",
    "cost": 5,
    "effects": {
      "pressureDelta": 2
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: We brought snacks and a camcorder.\"",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "CRY-TS-067",
    "name": "Vaccine Truth Bomb Campaign",
    "type": "ZONE",
    "faction": "truth",
    "rarity": "rare",
    "cost": 6,
    "effects": {
      "pressureDelta": 3
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Tabloid headline writes itself.\"",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "CRY-TS-068",
    "name": "Alabama Cryptid Mass Sighting",
    "type": "ATTACK",
    "faction": "truth",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: The locals swear alabama cryptid waved back.\""
  },
  {
    "id": "CRY-TS-069",
    "name": "Tizheruk Mass Sighting",
    "type": "ZONE",
    "faction": "truth",
    "rarity": "common",
    "cost": 4,
    "effects": {
      "pressureDelta": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: The locals swear tizheruk waved back.\"",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "CRY-TS-070",
    "name": "Thunderbird Mass Sighting",
    "type": "ATTACK",
    "faction": "truth",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: The locals swear thunderbird waved back.\""
  },
  {
    "id": "CRY-TS-071",
    "name": "Fouke Monster Mass Sighting",
    "type": "ATTACK",
    "faction": "truth",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: The locals swear fouke monster waved back.\""
  },
  {
    "id": "CRY-TS-072",
    "name": "Bigfoot Mass Sighting",
    "type": "ZONE",
    "faction": "truth",
    "rarity": "common",
    "cost": 4,
    "effects": {
      "pressureDelta": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: The locals swear bigfoot waved back.\"",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "CRY-TS-073",
    "name": "Colorado Cryptid Mass Sighting",
    "type": "ATTACK",
    "faction": "truth",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: The locals swear colorado cryptid waved back.\""
  },
  {
    "id": "CRY-TS-074",
    "name": "Connecticut Cryptid Mass Sighting",
    "type": "ATTACK",
    "faction": "truth",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: The locals swear connecticut cryptid waved back.\""
  },
  {
    "id": "CRY-TS-075",
    "name": "Delaware Cryptid Mass Sighting",
    "type": "ZONE",
    "faction": "truth",
    "rarity": "common",
    "cost": 4,
    "effects": {
      "pressureDelta": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: The locals swear delaware cryptid waved back.\"",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "CRY-TS-076",
    "name": "Skunk Ape Mass Sighting",
    "type": "ZONE",
    "faction": "truth",
    "rarity": "common",
    "cost": 4,
    "effects": {
      "pressureDelta": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: The locals swear skunk ape waved back.\"",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "CRY-TS-077",
    "name": "Georgia Cryptid Mass Sighting",
    "type": "ZONE",
    "faction": "truth",
    "rarity": "common",
    "cost": 4,
    "effects": {
      "pressureDelta": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: The locals swear georgia cryptid waved back.\"",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "CRY-TS-078",
    "name": "Hawaii Cryptid Mass Sighting",
    "type": "ZONE",
    "faction": "truth",
    "rarity": "common",
    "cost": 4,
    "effects": {
      "pressureDelta": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: The locals swear hawaii cryptid waved back.\"",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "CRY-TS-079",
    "name": "Idaho Cryptid Mass Sighting",
    "type": "ZONE",
    "faction": "truth",
    "rarity": "common",
    "cost": 4,
    "effects": {
      "pressureDelta": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: The locals swear idaho cryptid waved back.\"",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "CRY-TS-080",
    "name": "Enfield Horror Mass Sighting",
    "type": "ZONE",
    "faction": "truth",
    "rarity": "common",
    "cost": 4,
    "effects": {
      "pressureDelta": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: The locals swear enfield horror waved back.\"",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "CRY-TS-081",
    "name": "Indiana Cryptid Mass Sighting",
    "type": "ZONE",
    "faction": "truth",
    "rarity": "common",
    "cost": 4,
    "effects": {
      "pressureDelta": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: The locals swear indiana cryptid waved back.\"",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "CRY-TS-082",
    "name": "Iowa Cryptid Mass Sighting",
    "type": "ZONE",
    "faction": "truth",
    "rarity": "common",
    "cost": 4,
    "effects": {
      "pressureDelta": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: The locals swear iowa cryptid waved back.\"",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "CRY-TS-083",
    "name": "Kansas Cryptid Mass Sighting",
    "type": "ZONE",
    "faction": "truth",
    "rarity": "common",
    "cost": 4,
    "effects": {
      "pressureDelta": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: The locals swear kansas cryptid waved back.\"",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "CRY-TS-084",
    "name": "Kelly–Hopkinsville Goblins Mass Sighting",
    "type": "ZONE",
    "faction": "truth",
    "rarity": "common",
    "cost": 4,
    "effects": {
      "pressureDelta": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: The locals swear kelly–hopkinsville goblins waved back.\"",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "CRY-TS-085",
    "name": "Rougarou Mass Sighting",
    "type": "ZONE",
    "faction": "truth",
    "rarity": "common",
    "cost": 4,
    "effects": {
      "pressureDelta": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: The locals swear rougarou waved back.\"",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "CRY-TS-086",
    "name": "Maine Cryptid Mass Sighting",
    "type": "ZONE",
    "faction": "truth",
    "rarity": "common",
    "cost": 4,
    "effects": {
      "pressureDelta": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: The locals swear maine cryptid waved back.\"",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "CRY-TS-087",
    "name": "Snallygaster Mass Sighting",
    "type": "ZONE",
    "faction": "truth",
    "rarity": "common",
    "cost": 4,
    "effects": {
      "pressureDelta": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: The locals swear snallygaster waved back.\"",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "CRY-TS-088",
    "name": "Dover Demon Mass Sighting",
    "type": "ZONE",
    "faction": "truth",
    "rarity": "common",
    "cost": 4,
    "effects": {
      "pressureDelta": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: The locals swear dover demon waved back.\"",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "CRY-TS-089",
    "name": "Dogman Mass Sighting",
    "type": "ZONE",
    "faction": "truth",
    "rarity": "common",
    "cost": 4,
    "effects": {
      "pressureDelta": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: The locals swear dogman waved back.\"",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "CRY-TS-090",
    "name": "Wendigo Mass Sighting",
    "type": "ATTACK",
    "faction": "truth",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: The locals swear wendigo waved back.\""
  },
  {
    "id": "CRY-TS-091",
    "name": "Mississippi Cryptid Mass Sighting",
    "type": "ZONE",
    "faction": "truth",
    "rarity": "common",
    "cost": 4,
    "effects": {
      "pressureDelta": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: The locals swear mississippi cryptid waved back.\"",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "CRY-TS-092",
    "name": "Missouri Cryptid Mass Sighting",
    "type": "ZONE",
    "faction": "truth",
    "rarity": "common",
    "cost": 4,
    "effects": {
      "pressureDelta": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: The locals swear missouri cryptid waved back.\"",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "CRY-TS-093",
    "name": "Shunka Warakin Mass Sighting",
    "type": "ZONE",
    "faction": "truth",
    "rarity": "common",
    "cost": 4,
    "effects": {
      "pressureDelta": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: The locals swear shunka warakin waved back.\"",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "CRY-TS-094",
    "name": "Nebraska Cryptid Mass Sighting",
    "type": "ZONE",
    "faction": "truth",
    "rarity": "common",
    "cost": 4,
    "effects": {
      "pressureDelta": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: The locals swear nebraska cryptid waved back.\"",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "CRY-TS-095",
    "name": "Tahoe Tessie Mass Sighting",
    "type": "ZONE",
    "faction": "truth",
    "rarity": "common",
    "cost": 4,
    "effects": {
      "pressureDelta": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: The locals swear tahoe tessie waved back.\"",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "CRY-TS-096",
    "name": "Wood Devils Mass Sighting",
    "type": "ZONE",
    "faction": "truth",
    "rarity": "common",
    "cost": 4,
    "effects": {
      "pressureDelta": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: The locals swear wood devils waved back.\"",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "CRY-TS-097",
    "name": "Jersey Devil Mass Sighting",
    "type": "ATTACK",
    "faction": "truth",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: The locals swear jersey devil waved back.\""
  },
  {
    "id": "CRY-TS-098",
    "name": "Skinwalkers Mass Sighting",
    "type": "ATTACK",
    "faction": "truth",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: The locals swear skinwalkers waved back.\""
  },
  {
    "id": "CRY-TS-099",
    "name": "Montauk Monster Mass Sighting",
    "type": "ZONE",
    "faction": "truth",
    "rarity": "common",
    "cost": 4,
    "effects": {
      "pressureDelta": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: The locals swear montauk monster waved back.\"",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "CRY-TS-100",
    "name": "North Carolina Cryptid Mass Sighting",
    "type": "ZONE",
    "faction": "truth",
    "rarity": "common",
    "cost": 4,
    "effects": {
      "pressureDelta": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: The locals swear north carolina cryptid waved back.\"",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "CRY-TS-101",
    "name": "North Dakota Cryptid Mass Sighting",
    "type": "ZONE",
    "faction": "truth",
    "rarity": "common",
    "cost": 4,
    "effects": {
      "pressureDelta": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: The locals swear north dakota cryptid waved back.\"",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "CRY-TS-102",
    "name": "Loveland Frogman Mass Sighting",
    "type": "ZONE",
    "faction": "truth",
    "rarity": "common",
    "cost": 4,
    "effects": {
      "pressureDelta": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: The locals swear loveland frogman waved back.\"",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "CRY-TS-103",
    "name": "Oklahoma Cryptid Mass Sighting",
    "type": "ZONE",
    "faction": "truth",
    "rarity": "common",
    "cost": 4,
    "effects": {
      "pressureDelta": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: The locals swear oklahoma cryptid waved back.\"",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "CRY-TS-104",
    "name": "Bigfoot Mass Sighting",
    "type": "ZONE",
    "faction": "truth",
    "rarity": "common",
    "cost": 4,
    "effects": {
      "pressureDelta": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: The locals swear bigfoot waved back.\"",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "CRY-TS-105",
    "name": "Pennsylvania Cryptid Mass Sighting",
    "type": "ZONE",
    "faction": "truth",
    "rarity": "common",
    "cost": 4,
    "effects": {
      "pressureDelta": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: The locals swear pennsylvania cryptid waved back.\"",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "CRY-TS-106",
    "name": "Rhode Island Cryptid Mass Sighting",
    "type": "ZONE",
    "faction": "truth",
    "rarity": "common",
    "cost": 4,
    "effects": {
      "pressureDelta": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: The locals swear rhode island cryptid waved back.\"",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "CRY-TS-107",
    "name": "South Carolina Cryptid Mass Sighting",
    "type": "ZONE",
    "faction": "truth",
    "rarity": "common",
    "cost": 4,
    "effects": {
      "pressureDelta": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: The locals swear south carolina cryptid waved back.\"",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "CRY-TS-108",
    "name": "South Dakota Cryptid Mass Sighting",
    "type": "ZONE",
    "faction": "truth",
    "rarity": "common",
    "cost": 4,
    "effects": {
      "pressureDelta": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: The locals swear south dakota cryptid waved back.\"",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "CRY-TS-109",
    "name": "Tennessee Cryptid Mass Sighting",
    "type": "ZONE",
    "faction": "truth",
    "rarity": "common",
    "cost": 4,
    "effects": {
      "pressureDelta": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: The locals swear tennessee cryptid waved back.\"",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "CRY-TS-110",
    "name": "Chupacabra Mass Sighting",
    "type": "ATTACK",
    "faction": "truth",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: The locals swear chupacabra waved back.\""
  },
  {
    "id": "CRY-TS-111",
    "name": "Utah Cryptid Mass Sighting",
    "type": "ZONE",
    "faction": "truth",
    "rarity": "common",
    "cost": 4,
    "effects": {
      "pressureDelta": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: The locals swear utah cryptid waved back.\"",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "CRY-TS-112",
    "name": "Champ Mass Sighting",
    "type": "ZONE",
    "faction": "truth",
    "rarity": "common",
    "cost": 4,
    "effects": {
      "pressureDelta": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: The locals swear champ waved back.\"",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "CRY-TS-113",
    "name": "Virginia Cryptid Mass Sighting",
    "type": "ZONE",
    "faction": "truth",
    "rarity": "common",
    "cost": 4,
    "effects": {
      "pressureDelta": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: The locals swear virginia cryptid waved back.\"",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "CRY-TS-114",
    "name": "Bigfoot Mass Sighting",
    "type": "ZONE",
    "faction": "truth",
    "rarity": "common",
    "cost": 4,
    "effects": {
      "pressureDelta": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: The locals swear bigfoot waved back.\"",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "CRY-TS-115",
    "name": "Mothman Mass Sighting",
    "type": "ATTACK",
    "faction": "truth",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: The locals swear mothman waved back.\""
  },
  {
    "id": "CRY-TS-116",
    "name": "Beast of Bray Road Mass Sighting",
    "type": "ATTACK",
    "faction": "truth",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: The locals swear beast of bray road waved back.\""
  },
  {
    "id": "CRY-TS-117",
    "name": "Wyoming Cryptid Mass Sighting",
    "type": "ZONE",
    "faction": "truth",
    "rarity": "common",
    "cost": 4,
    "effects": {
      "pressureDelta": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: The locals swear wyoming cryptid waved back.\"",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "CRY-TS-118",
    "name": "Chupacabra Panic Wave",
    "type": "ATTACK",
    "faction": "truth",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Eyewitnesses report chills and grainy footage.\""
  },
  {
    "id": "CRY-TS-119",
    "name": "Tizheruk Panic Wave",
    "type": "ATTACK",
    "faction": "truth",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Eyewitnesses report chills and grainy footage.\""
  },
  {
    "id": "CRY-TS-120",
    "name": "Wendigo Watch Patrols",
    "type": "ATTACK",
    "faction": "truth",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Eyewitnesses report chills and grainy footage.\""
  },
  {
    "id": "CRY-TS-121",
    "name": "Loveland Frogman Watch Patrols",
    "type": "MEDIA",
    "faction": "truth",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Eyewitnesses report chills and grainy footage.\""
  },
  {
    "id": "CRY-TS-122",
    "name": "Bigfoot Panic Wave",
    "type": "ATTACK",
    "faction": "truth",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Eyewitnesses report chills and grainy footage.\""
  },
  {
    "id": "CRY-TS-123",
    "name": "Dogman Panic Wave",
    "type": "ATTACK",
    "faction": "truth",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Eyewitnesses report chills and grainy footage.\""
  },
  {
    "id": "CRY-TS-124",
    "name": "Rougarou Watch Patrols",
    "type": "MEDIA",
    "faction": "truth",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Eyewitnesses report chills and grainy footage.\""
  },
  {
    "id": "CRY-TS-125",
    "name": "Tahoe Tessie Panic Wave",
    "type": "ATTACK",
    "faction": "truth",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Eyewitnesses report chills and grainy footage.\""
  },
  {
    "id": "CRY-TS-126",
    "name": "Beast of Bray Road Watch Patrols",
    "type": "ATTACK",
    "faction": "truth",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Eyewitnesses report chills and grainy footage.\""
  },
  {
    "id": "CRY-TS-127",
    "name": "Wendigo Watch Patrols",
    "type": "ATTACK",
    "faction": "truth",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Eyewitnesses report chills and grainy footage.\""
  },
  {
    "id": "CRY-TS-128",
    "name": "Dover Demon Panic Wave",
    "type": "ATTACK",
    "faction": "truth",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Eyewitnesses report chills and grainy footage.\""
  },
  {
    "id": "CRY-TS-129",
    "name": "Tizheruk Watch Patrols",
    "type": "MEDIA",
    "faction": "truth",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Eyewitnesses report chills and grainy footage.\""
  },
  {
    "id": "CRY-TS-130",
    "name": "Fouke Monster Watch Patrols",
    "type": "MEDIA",
    "faction": "truth",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Eyewitnesses report chills and grainy footage.\""
  },
  {
    "id": "CRY-TS-131",
    "name": "Jersey Devil Panic Wave",
    "type": "ATTACK",
    "faction": "truth",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Eyewitnesses report chills and grainy footage.\""
  },
  {
    "id": "CRY-TS-132",
    "name": "Tizheruk Panic Wave",
    "type": "ATTACK",
    "faction": "truth",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Eyewitnesses report chills and grainy footage.\""
  },
  {
    "id": "CRY-TS-133",
    "name": "Tahoe Tessie Panic Wave",
    "type": "ATTACK",
    "faction": "truth",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Eyewitnesses report chills and grainy footage.\""
  },
  {
    "id": "CRY-TS-134",
    "name": "Fouke Monster Panic Wave",
    "type": "ATTACK",
    "faction": "truth",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Eyewitnesses report chills and grainy footage.\""
  },
  {
    "id": "CRY-TS-135",
    "name": "Snallygaster Watch Patrols",
    "type": "MEDIA",
    "faction": "truth",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Eyewitnesses report chills and grainy footage.\""
  },
  {
    "id": "CRY-TS-136",
    "name": "Chupacabra Panic Wave",
    "type": "ATTACK",
    "faction": "truth",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Eyewitnesses report chills and grainy footage.\""
  },
  {
    "id": "CRY-TS-137",
    "name": "Shunka Warakin Panic Wave",
    "type": "ATTACK",
    "faction": "truth",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Eyewitnesses report chills and grainy footage.\""
  },
  {
    "id": "CRY-TS-138",
    "name": "Tizheruk Panic Wave",
    "type": "ATTACK",
    "faction": "truth",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Eyewitnesses report chills and grainy footage.\""
  },
  {
    "id": "CRY-TS-139",
    "name": "Fouke Monster Panic Wave",
    "type": "ATTACK",
    "faction": "truth",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Eyewitnesses report chills and grainy footage.\""
  },
  {
    "id": "CRY-TS-140",
    "name": "Dover Demon Panic Wave",
    "type": "ATTACK",
    "faction": "truth",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Eyewitnesses report chills and grainy footage.\""
  },
  {
    "id": "CRY-TS-141",
    "name": "Shunka Warakin Panic Wave",
    "type": "ATTACK",
    "faction": "truth",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Eyewitnesses report chills and grainy footage.\""
  },
  {
    "id": "CRY-TS-142",
    "name": "Champ Watch Patrols",
    "type": "MEDIA",
    "faction": "truth",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Eyewitnesses report chills and grainy footage.\""
  },
  {
    "id": "CRY-TS-143",
    "name": "Loveland Frogman Watch Patrols",
    "type": "MEDIA",
    "faction": "truth",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Eyewitnesses report chills and grainy footage.\""
  },
  {
    "id": "CRY-TS-144",
    "name": "Montauk Monster Panic Wave",
    "type": "ATTACK",
    "faction": "truth",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Eyewitnesses report chills and grainy footage.\""
  },
  {
    "id": "CRY-TS-145",
    "name": "Dogman Panic Wave",
    "type": "ATTACK",
    "faction": "truth",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Eyewitnesses report chills and grainy footage.\""
  },
  {
    "id": "CRY-TS-146",
    "name": "Tizheruk Panic Wave",
    "type": "ATTACK",
    "faction": "truth",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Eyewitnesses report chills and grainy footage.\""
  },
  {
    "id": "CRY-TS-147",
    "name": "Dover Demon Panic Wave",
    "type": "ATTACK",
    "faction": "truth",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Eyewitnesses report chills and grainy footage.\""
  },
  {
    "id": "CRY-TS-148",
    "name": "Snallygaster Watch Patrols",
    "type": "MEDIA",
    "faction": "truth",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Eyewitnesses report chills and grainy footage.\""
  },
  {
    "id": "CRY-TS-149",
    "name": "Rougarou Panic Wave",
    "type": "ATTACK",
    "faction": "truth",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Eyewitnesses report chills and grainy footage.\""
  },
  {
    "id": "CRY-TS-150",
    "name": "Montauk Monster Panic Wave",
    "type": "ATTACK",
    "faction": "truth",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Eyewitnesses report chills and grainy footage.\""
  },
  {
    "id": "CRY-GV-001",
    "name": "Men in Black Sweep",
    "type": "ATTACK",
    "faction": "government",
    "rarity": "rare",
    "cost": 4,
    "effects": {
      "ipDelta": {
        "opponent": 3
      },
      "discardOpponent": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Situation normal—memo drafted and archived.\""
  },
  {
    "id": "CRY-GV-002",
    "name": "Weather Machine Alpha",
    "type": "ZONE",
    "faction": "government",
    "rarity": "uncommon",
    "cost": 5,
    "effects": {
      "pressureDelta": 2
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Situation normal—memo drafted and archived.\"",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "CRY-GV-003",
    "name": "Project Grand Mandela",
    "type": "MEDIA",
    "faction": "government",
    "rarity": "rare",
    "cost": 5,
    "effects": {
      "truthDelta": 3
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Awaiting lab results; likely weather and shadows.\""
  },
  {
    "id": "CRY-GV-004",
    "name": "Chemtrail Deployment",
    "type": "ZONE",
    "faction": "government",
    "rarity": "uncommon",
    "cost": 5,
    "effects": {
      "pressureDelta": 2
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Public guidance issued; no chemtrail detected.\"",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "CRY-GV-005",
    "name": "Area 51 Security",
    "type": "ZONE",
    "faction": "government",
    "rarity": "common",
    "cost": 4,
    "effects": {
      "pressureDelta": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Filed under routine wildlife misidentification.\"",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "CRY-GV-006",
    "name": "Fake Alien Invasion",
    "type": "ZONE",
    "faction": "government",
    "rarity": "legendary",
    "cost": 7,
    "effects": {
      "pressureDelta": 4
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Field note logged; further action unnecessary.\"",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "CRY-GV-007",
    "name": "Roswell Cover Story",
    "type": "MEDIA",
    "faction": "government",
    "rarity": "uncommon",
    "cost": 4,
    "effects": {
      "truthDelta": 2
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Public guidance issued; no roswell detected.\""
  },
  {
    "id": "CRY-GV-008",
    "name": "Disinformation Bureau",
    "type": "MEDIA",
    "faction": "government",
    "rarity": "rare",
    "cost": 5,
    "effects": {
      "truthDelta": 3
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Awaiting lab results; likely weather and shadows.\""
  },
  {
    "id": "CRY-GV-009",
    "name": "Bigfoot Suit Factory",
    "type": "ZONE",
    "faction": "government",
    "rarity": "uncommon",
    "cost": 5,
    "effects": {
      "pressureDelta": 2
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Field note logged; further action unnecessary.\"",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "CRY-GV-010",
    "name": "Project Blue Beam",
    "type": "ATTACK",
    "faction": "government",
    "rarity": "legendary",
    "cost": 5,
    "effects": {
      "ipDelta": {
        "opponent": 4
      },
      "discardOpponent": 2
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Filed under routine wildlife misidentification.\""
  },
  {
    "id": "CRY-GV-011",
    "name": "Mothman Relocation Program",
    "type": "ATTACK",
    "faction": "government",
    "rarity": "rare",
    "cost": 4,
    "effects": {
      "ipDelta": {
        "opponent": 3
      },
      "discardOpponent": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Awaiting lab results; likely weather and shadows.\""
  },
  {
    "id": "CRY-GV-012",
    "name": "Chupacabra Protocol",
    "type": "ATTACK",
    "faction": "government",
    "rarity": "uncommon",
    "cost": 3,
    "effects": {
      "ipDelta": {
        "opponent": 2
      }
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Filed under routine wildlife misidentification.\""
  },
  {
    "id": "CRY-GV-013",
    "name": "Cryptid Containment Unit",
    "type": "MEDIA",
    "faction": "government",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Awaiting lab results; likely weather and shadows.\""
  },
  {
    "id": "CRY-GV-014",
    "name": "Jersey Devil Task Force",
    "type": "ATTACK",
    "faction": "government",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Public guidance issued; no jersey devil detected.\""
  },
  {
    "id": "CRY-GV-015",
    "name": "Lake Monster Drainage",
    "type": "ATTACK",
    "faction": "government",
    "rarity": "uncommon",
    "cost": 3,
    "effects": {
      "ipDelta": {
        "opponent": 2
      }
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Public guidance issued; no lake detected.\""
  },
  {
    "id": "CRY-GV-016",
    "name": "Men in Beige",
    "type": "ATTACK",
    "faction": "government",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Filed under routine wildlife misidentification.\""
  },
  {
    "id": "CRY-GV-017",
    "name": "Swamp Gas Generator",
    "type": "ZONE",
    "faction": "government",
    "rarity": "uncommon",
    "cost": 5,
    "effects": {
      "pressureDelta": 2
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Situation normal—memo drafted and archived.\"",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "CRY-GV-018",
    "name": "Deniability Protocols",
    "type": "ZONE",
    "faction": "government",
    "rarity": "uncommon",
    "cost": 5,
    "effects": {
      "pressureDelta": 2
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Field note logged; further action unnecessary.\"",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "CRY-GV-019",
    "name": "Black Helicopters",
    "type": "ATTACK",
    "faction": "government",
    "rarity": "rare",
    "cost": 4,
    "effects": {
      "ipDelta": {
        "opponent": 3
      },
      "discardOpponent": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Public guidance issued; no black detected.\""
  },
  {
    "id": "CRY-GV-020",
    "name": "Cryptozoology Department",
    "type": "ZONE",
    "faction": "government",
    "rarity": "uncommon",
    "cost": 5,
    "effects": {
      "pressureDelta": 2
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Field note logged; further action unnecessary.\"",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "CRY-GV-021",
    "name": "Flatwoods Incident",
    "type": "ZONE",
    "faction": "government",
    "rarity": "uncommon",
    "cost": 5,
    "effects": {
      "pressureDelta": 2
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Awaiting lab results; likely weather and shadows.\"",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "CRY-GV-022",
    "name": "Skunk Ape Safari",
    "type": "ZONE",
    "faction": "government",
    "rarity": "common",
    "cost": 4,
    "effects": {
      "pressureDelta": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Field note logged; further action unnecessary.\"",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "CRY-GV-023",
    "name": "Thunderbird Tracking",
    "type": "ATTACK",
    "faction": "government",
    "rarity": "uncommon",
    "cost": 3,
    "effects": {
      "ipDelta": {
        "opponent": 2
      }
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Public guidance issued; no thunderbird detected.\""
  },
  {
    "id": "CRY-GV-024",
    "name": "Shadow People Census",
    "type": "ATTACK",
    "faction": "government",
    "rarity": "uncommon",
    "cost": 3,
    "effects": {
      "ipDelta": {
        "opponent": 2
      }
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Public guidance issued; no shadow detected.\""
  },
  {
    "id": "CRY-GV-025",
    "name": "Hopkinsville Goblins",
    "type": "ZONE",
    "faction": "government",
    "rarity": "rare",
    "cost": 6,
    "effects": {
      "pressureDelta": 3
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Situation normal—memo drafted and archived.\"",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "CRY-GV-026",
    "name": "Lizard Person Council",
    "type": "MEDIA",
    "faction": "government",
    "rarity": "legendary",
    "cost": 6,
    "effects": {
      "truthDelta": 4
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Situation normal—memo drafted and archived.\""
  },
  {
    "id": "CRY-GV-027",
    "name": "Hollow Earth Drilling",
    "type": "ZONE",
    "faction": "government",
    "rarity": "rare",
    "cost": 6,
    "effects": {
      "pressureDelta": 3
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Situation normal—memo drafted and archived.\"",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "CRY-GV-028",
    "name": "Time Travel Bureau",
    "type": "MEDIA",
    "faction": "government",
    "rarity": "uncommon",
    "cost": 4,
    "effects": {
      "truthDelta": 2
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Public guidance issued; no time detected.\""
  },
  {
    "id": "CRY-GV-029",
    "name": "Flying Saucer Hangar",
    "type": "ZONE",
    "faction": "government",
    "rarity": "rare",
    "cost": 6,
    "effects": {
      "pressureDelta": 3
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Filed under routine wildlife misidentification.\"",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "CRY-GV-030",
    "name": "Interdimensional Gate",
    "type": "ZONE",
    "faction": "government",
    "rarity": "rare",
    "cost": 6,
    "effects": {
      "pressureDelta": 3
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Filed under routine wildlife misidentification.\"",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "CRY-GV-031",
    "name": "Yeti Expedition Hoax",
    "type": "ZONE",
    "faction": "government",
    "rarity": "uncommon",
    "cost": 5,
    "effects": {
      "pressureDelta": 2
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Field note logged; further action unnecessary.\"",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "CRY-GV-032",
    "name": "Skinwalker Ranch Buyout",
    "type": "ATTACK",
    "faction": "government",
    "rarity": "uncommon",
    "cost": 3,
    "effects": {
      "ipDelta": {
        "opponent": 2
      }
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Field note logged; further action unnecessary.\""
  },
  {
    "id": "CRY-GV-033",
    "name": "Dover Demon Debunking",
    "type": "ZONE",
    "faction": "government",
    "rarity": "uncommon",
    "cost": 5,
    "effects": {
      "pressureDelta": 2
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Filed under routine wildlife misidentification.\"",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "CRY-GV-034",
    "name": "Alien Autopsy Studio",
    "type": "ZONE",
    "faction": "government",
    "rarity": "rare",
    "cost": 6,
    "effects": {
      "pressureDelta": 3
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Filed under routine wildlife misidentification.\"",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "CRY-GV-035",
    "name": "Cattle Mutilation Labs",
    "type": "ZONE",
    "faction": "government",
    "rarity": "uncommon",
    "cost": 5,
    "effects": {
      "pressureDelta": 2
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Filed under routine wildlife misidentification.\"",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "CRY-GV-036",
    "name": "Crop Circle Artists Guild",
    "type": "ZONE",
    "faction": "government",
    "rarity": "uncommon",
    "cost": 5,
    "effects": {
      "pressureDelta": 2
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Awaiting lab results; likely weather and shadows.\"",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "CRY-GV-037",
    "name": "Phantom Airships",
    "type": "ZONE",
    "faction": "government",
    "rarity": "common",
    "cost": 4,
    "effects": {
      "pressureDelta": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Field note logged; further action unnecessary.\"",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "CRY-GV-038",
    "name": "Washington Sea Serpent",
    "type": "ZONE",
    "faction": "government",
    "rarity": "uncommon",
    "cost": 5,
    "effects": {
      "pressureDelta": 2
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Awaiting lab results; likely weather and shadows.\"",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "CRY-GV-039",
    "name": "Moon-Eyed People Census",
    "type": "ZONE",
    "faction": "government",
    "rarity": "uncommon",
    "cost": 5,
    "effects": {
      "pressureDelta": 2
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Public guidance issued; no moon-eyed detected.\"",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "CRY-GV-040",
    "name": "Giant Octopus Cover-up",
    "type": "MEDIA",
    "faction": "government",
    "rarity": "rare",
    "cost": 5,
    "effects": {
      "truthDelta": 3
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Public guidance issued; no giant detected.\""
  },
  {
    "id": "CRY-GV-041",
    "name": "Psychic Spying Program",
    "type": "ZONE",
    "faction": "government",
    "rarity": "uncommon",
    "cost": 5,
    "effects": {
      "pressureDelta": 2
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Field note logged; further action unnecessary.\"",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "CRY-GV-042",
    "name": "Invisible Aircraft Project",
    "type": "MEDIA",
    "faction": "government",
    "rarity": "legendary",
    "cost": 6,
    "effects": {
      "truthDelta": 4
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Public guidance issued; no invisible detected.\""
  },
  {
    "id": "CRY-GV-043",
    "name": "Missing Time Protocol",
    "type": "ATTACK",
    "faction": "government",
    "rarity": "uncommon",
    "cost": 3,
    "effects": {
      "ipDelta": {
        "opponent": 2
      }
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Situation normal—memo drafted and archived.\""
  },
  {
    "id": "CRY-GV-044",
    "name": "Greys Employment Program",
    "type": "ZONE",
    "faction": "government",
    "rarity": "uncommon",
    "cost": 5,
    "effects": {
      "pressureDelta": 2
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Filed under routine wildlife misidentification.\"",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "CRY-GV-045",
    "name": "Reality Anchor Array",
    "type": "MEDIA",
    "faction": "government",
    "rarity": "rare",
    "cost": 5,
    "effects": {
      "truthDelta": 3
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Situation normal—memo drafted and archived.\""
  },
  {
    "id": "CRY-GV-046",
    "name": "Dimension X Portal",
    "type": "ZONE",
    "faction": "government",
    "rarity": "uncommon",
    "cost": 5,
    "effects": {
      "pressureDelta": 2
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Situation normal—memo drafted and archived.\"",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "CRY-GV-047",
    "name": "Cryptid Rehabilitation Center",
    "type": "ZONE",
    "faction": "government",
    "rarity": "common",
    "cost": 4,
    "effects": {
      "pressureDelta": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Situation normal—memo drafted and archived.\"",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "CRY-GV-048",
    "name": "Mind Probe Study",
    "type": "ATTACK",
    "faction": "government",
    "rarity": "uncommon",
    "cost": 3,
    "effects": {
      "ipDelta": {
        "opponent": 2
      }
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Filed under routine wildlife misidentification.\""
  },
  {
    "id": "CRY-GV-049",
    "name": "Subliminal Broadcast Network",
    "type": "ZONE",
    "faction": "government",
    "rarity": "rare",
    "cost": 6,
    "effects": {
      "pressureDelta": 3
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Situation normal—memo drafted and archived.\"",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "CRY-GV-050",
    "name": "Fake Moon Landing Set",
    "type": "ZONE",
    "faction": "government",
    "rarity": "uncommon",
    "cost": 5,
    "effects": {
      "pressureDelta": 2
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Filed under routine wildlife misidentification.\"",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "CRY-GV-051",
    "name": "Neuralyzer Deployment",
    "type": "MEDIA",
    "faction": "government",
    "rarity": "uncommon",
    "cost": 4,
    "effects": {
      "truthDelta": 2
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Public guidance issued; no neuralyzer detected.\""
  },
  {
    "id": "CRY-GV-052",
    "name": "Shadow Government HQ",
    "type": "ATTACK",
    "faction": "government",
    "rarity": "legendary",
    "cost": 5,
    "effects": {
      "ipDelta": {
        "opponent": 4
      },
      "discardOpponent": 2
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Field note logged; further action unnecessary.\""
  },
  {
    "id": "CRY-GV-053",
    "name": "Operation Paperclip II",
    "type": "MEDIA",
    "faction": "government",
    "rarity": "uncommon",
    "cost": 4,
    "effects": {
      "truthDelta": 2
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Public guidance issued; no operation detected.\""
  },
  {
    "id": "CRY-GV-054",
    "name": "Holographic UFO Display",
    "type": "MEDIA",
    "faction": "government",
    "rarity": "uncommon",
    "cost": 4,
    "effects": {
      "truthDelta": 2
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Public guidance issued; no holographic detected.\""
  },
  {
    "id": "CRY-GV-055",
    "name": "Cryptid Breeding Program",
    "type": "MEDIA",
    "faction": "government",
    "rarity": "rare",
    "cost": 5,
    "effects": {
      "truthDelta": 3
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Situation normal—memo drafted and archived.\""
  },
  {
    "id": "CRY-GV-056",
    "name": "False Flag Cryptid Attack",
    "type": "ATTACK",
    "faction": "government",
    "rarity": "legendary",
    "cost": 5,
    "effects": {
      "ipDelta": {
        "opponent": 4
      },
      "discardOpponent": 2
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Filed under routine wildlife misidentification.\""
  },
  {
    "id": "CRY-GV-057",
    "name": "Extraterrestrial Non-Disclosure Treaty",
    "type": "ZONE",
    "faction": "government",
    "rarity": "uncommon",
    "cost": 5,
    "effects": {
      "pressureDelta": 2
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Field note logged; further action unnecessary.\"",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "CRY-GV-058",
    "name": "Quantum Bigfoot Experiment",
    "type": "ZONE",
    "faction": "government",
    "rarity": "rare",
    "cost": 6,
    "effects": {
      "pressureDelta": 3
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Filed under routine wildlife misidentification.\"",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "CRY-GV-059",
    "name": "Interdimensional Customs",
    "type": "ZONE",
    "faction": "government",
    "rarity": "uncommon",
    "cost": 5,
    "effects": {
      "pressureDelta": 2
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Filed under routine wildlife misidentification.\"",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "CRY-GV-060",
    "name": "Cosmic Horror Containment",
    "type": "MEDIA",
    "faction": "government",
    "rarity": "rare",
    "cost": 5,
    "effects": {
      "truthDelta": 3
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Public guidance issued; no cosmic detected.\""
  },
  {
    "id": "CRY-GV-061",
    "name": "Reptilian Shapeshifter Agent",
    "type": "ATTACK",
    "faction": "government",
    "rarity": "uncommon",
    "cost": 3,
    "effects": {
      "ipDelta": {
        "opponent": 2
      }
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Situation normal—memo drafted and archived.\""
  },
  {
    "id": "CRY-GV-062",
    "name": "Memory Modification Clinic",
    "type": "ATTACK",
    "faction": "government",
    "rarity": "rare",
    "cost": 4,
    "effects": {
      "ipDelta": {
        "opponent": 3
      },
      "discardOpponent": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Situation normal—memo drafted and archived.\""
  },
  {
    "id": "CRY-GV-063",
    "name": "Psy-Ops Division",
    "type": "MEDIA",
    "faction": "government",
    "rarity": "uncommon",
    "cost": 4,
    "effects": {
      "truthDelta": 2
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Situation normal—memo drafted and archived.\""
  },
  {
    "id": "CRY-GV-064",
    "name": "Cryptid Witness Protection",
    "type": "MEDIA",
    "faction": "government",
    "rarity": "uncommon",
    "cost": 4,
    "effects": {
      "truthDelta": 2
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Public guidance issued; no cryptid detected.\""
  },
  {
    "id": "CRY-GV-065",
    "name": "Underground Bunker Network",
    "type": "ZONE",
    "faction": "government",
    "rarity": "uncommon",
    "cost": 5,
    "effects": {
      "pressureDelta": 2
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Filed under routine wildlife misidentification.\"",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "CRY-GV-066",
    "name": "Orbital Mind Control Platform",
    "type": "ZONE",
    "faction": "government",
    "rarity": "uncommon",
    "cost": 5,
    "effects": {
      "pressureDelta": 2
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Awaiting lab results; likely weather and shadows.\"",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "CRY-GV-067",
    "name": "Temporal Loop Device",
    "type": "MEDIA",
    "faction": "government",
    "rarity": "rare",
    "cost": 5,
    "effects": {
      "truthDelta": 3
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Awaiting lab results; likely weather and shadows.\""
  },
  {
    "id": "CRY-GV-068",
    "name": "Anomalous Materials Division",
    "type": "ZONE",
    "faction": "government",
    "rarity": "uncommon",
    "cost": 5,
    "effects": {
      "pressureDelta": 2
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Field note logged; further action unnecessary.\"",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "CRY-GV-069",
    "name": "Phantom Helicopter Squadron",
    "type": "ZONE",
    "faction": "government",
    "rarity": "common",
    "cost": 4,
    "effects": {
      "pressureDelta": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Public guidance issued; no phantom detected.\"",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "CRY-GV-070",
    "name": "Reality Distortion Field",
    "type": "ZONE",
    "faction": "government",
    "rarity": "uncommon",
    "cost": 5,
    "effects": {
      "pressureDelta": 2
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Awaiting lab results; likely weather and shadows.\"",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "CRY-GV-071",
    "name": "Cryptid DNA Database",
    "type": "ZONE",
    "faction": "government",
    "rarity": "rare",
    "cost": 6,
    "effects": {
      "pressureDelta": 3
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Filed under routine wildlife misidentification.\"",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "CRY-GV-072",
    "name": "Phantom Satellite Grid",
    "type": "ZONE",
    "faction": "government",
    "rarity": "rare",
    "cost": 6,
    "effects": {
      "pressureDelta": 3
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Field note logged; further action unnecessary.\"",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "CRY-GV-073",
    "name": "Consciousness Transfer Lab",
    "type": "ATTACK",
    "faction": "government",
    "rarity": "uncommon",
    "cost": 3,
    "effects": {
      "ipDelta": {
        "opponent": 2
      }
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Awaiting lab results; likely weather and shadows.\""
  },
  {
    "id": "CRY-GV-074",
    "name": "Multidimensional Embassy",
    "type": "ZONE",
    "faction": "government",
    "rarity": "uncommon",
    "cost": 5,
    "effects": {
      "pressureDelta": 2
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Filed under routine wildlife misidentification.\"",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "CRY-GV-075",
    "name": "Alabama Wildlife Advisory",
    "type": "MEDIA",
    "faction": "government",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Public bulletin: Do not feed the alabama cryptid.\""
  },
  {
    "id": "CRY-GV-076",
    "name": "Alaska Wildlife Advisory",
    "type": "MEDIA",
    "faction": "government",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Public bulletin: Do not feed the tizheruk.\""
  },
  {
    "id": "CRY-GV-077",
    "name": "Arizona Wildlife Advisory",
    "type": "ATTACK",
    "faction": "government",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Public bulletin: Do not feed the thunderbird.\""
  },
  {
    "id": "CRY-GV-078",
    "name": "Arkansas Wildlife Advisory",
    "type": "MEDIA",
    "faction": "government",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Public bulletin: Do not feed the fouke monster.\""
  },
  {
    "id": "CRY-GV-079",
    "name": "California Wildlife Advisory",
    "type": "ZONE",
    "faction": "government",
    "rarity": "common",
    "cost": 4,
    "effects": {
      "pressureDelta": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Public bulletin: Do not feed the bigfoot.\"",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "CRY-GV-080",
    "name": "Colorado Wildlife Advisory",
    "type": "ZONE",
    "faction": "government",
    "rarity": "common",
    "cost": 4,
    "effects": {
      "pressureDelta": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Public bulletin: Do not feed the colorado cryptid.\"",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "CRY-GV-081",
    "name": "Connecticut Wildlife Advisory",
    "type": "MEDIA",
    "faction": "government",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Public bulletin: Do not feed the connecticut cryptid.\""
  },
  {
    "id": "CRY-GV-082",
    "name": "Delaware Wildlife Advisory",
    "type": "MEDIA",
    "faction": "government",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Public bulletin: Do not feed the delaware cryptid.\""
  },
  {
    "id": "CRY-GV-083",
    "name": "Florida Wildlife Advisory",
    "type": "MEDIA",
    "faction": "government",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Public bulletin: Do not feed the skunk ape.\""
  },
  {
    "id": "CRY-GV-084",
    "name": "Georgia Wildlife Advisory",
    "type": "MEDIA",
    "faction": "government",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Public bulletin: Do not feed the georgia cryptid.\""
  },
  {
    "id": "CRY-GV-085",
    "name": "Hawaii Wildlife Advisory",
    "type": "MEDIA",
    "faction": "government",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Public bulletin: Do not feed the hawaii cryptid.\""
  },
  {
    "id": "CRY-GV-086",
    "name": "Idaho Wildlife Advisory",
    "type": "MEDIA",
    "faction": "government",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Public bulletin: Do not feed the idaho cryptid.\""
  },
  {
    "id": "CRY-GV-087",
    "name": "Illinois Wildlife Advisory",
    "type": "ZONE",
    "faction": "government",
    "rarity": "common",
    "cost": 4,
    "effects": {
      "pressureDelta": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Public bulletin: Do not feed the enfield horror.\"",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "CRY-GV-088",
    "name": "Indiana Wildlife Advisory",
    "type": "MEDIA",
    "faction": "government",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Public bulletin: Do not feed the indiana cryptid.\""
  },
  {
    "id": "CRY-GV-089",
    "name": "Iowa Wildlife Advisory",
    "type": "MEDIA",
    "faction": "government",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Public bulletin: Do not feed the iowa cryptid.\""
  },
  {
    "id": "CRY-GV-090",
    "name": "Kansas Wildlife Advisory",
    "type": "MEDIA",
    "faction": "government",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Public bulletin: Do not feed the kansas cryptid.\""
  },
  {
    "id": "CRY-GV-091",
    "name": "Kentucky Wildlife Advisory",
    "type": "MEDIA",
    "faction": "government",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Public bulletin: Do not feed the kelly–hopkinsville goblins.\""
  },
  {
    "id": "CRY-GV-092",
    "name": "Louisiana Wildlife Advisory",
    "type": "MEDIA",
    "faction": "government",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Public bulletin: Do not feed the rougarou.\""
  },
  {
    "id": "CRY-GV-093",
    "name": "Maine Wildlife Advisory",
    "type": "MEDIA",
    "faction": "government",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Public bulletin: Do not feed the maine cryptid.\""
  },
  {
    "id": "CRY-GV-094",
    "name": "Maryland Wildlife Advisory",
    "type": "MEDIA",
    "faction": "government",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Public bulletin: Do not feed the snallygaster.\""
  },
  {
    "id": "CRY-GV-095",
    "name": "Massachusetts Wildlife Advisory",
    "type": "MEDIA",
    "faction": "government",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Public bulletin: Do not feed the dover demon.\""
  },
  {
    "id": "CRY-GV-096",
    "name": "Michigan Wildlife Advisory",
    "type": "MEDIA",
    "faction": "government",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Public bulletin: Do not feed the dogman.\""
  },
  {
    "id": "CRY-GV-097",
    "name": "Minnesota Wildlife Advisory",
    "type": "ATTACK",
    "faction": "government",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Public bulletin: Do not feed the wendigo.\""
  },
  {
    "id": "CRY-GV-098",
    "name": "Mississippi Wildlife Advisory",
    "type": "MEDIA",
    "faction": "government",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Public bulletin: Do not feed the mississippi cryptid.\""
  },
  {
    "id": "CRY-GV-099",
    "name": "Missouri Wildlife Advisory",
    "type": "MEDIA",
    "faction": "government",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Public bulletin: Do not feed the missouri cryptid.\""
  },
  {
    "id": "CRY-GV-100",
    "name": "Montana Wildlife Advisory",
    "type": "MEDIA",
    "faction": "government",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Public bulletin: Do not feed the shunka warakin.\""
  },
  {
    "id": "CRY-GV-101",
    "name": "Nebraska Wildlife Advisory",
    "type": "MEDIA",
    "faction": "government",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Public bulletin: Do not feed the nebraska cryptid.\""
  },
  {
    "id": "CRY-GV-102",
    "name": "Nevada Wildlife Advisory",
    "type": "MEDIA",
    "faction": "government",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Public bulletin: Do not feed the tahoe tessie.\""
  },
  {
    "id": "CRY-GV-103",
    "name": "New Hampshire Wildlife Advisory",
    "type": "MEDIA",
    "faction": "government",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Public bulletin: Do not feed the wood devils.\""
  },
  {
    "id": "CRY-GV-104",
    "name": "New Jersey Wildlife Advisory",
    "type": "ATTACK",
    "faction": "government",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Public bulletin: Do not feed the jersey devil.\""
  },
  {
    "id": "CRY-GV-105",
    "name": "New Mexico Wildlife Advisory",
    "type": "ATTACK",
    "faction": "government",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Public bulletin: Do not feed the skinwalkers.\""
  },
  {
    "id": "CRY-GV-106",
    "name": "New York Wildlife Advisory",
    "type": "MEDIA",
    "faction": "government",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Public bulletin: Do not feed the montauk monster.\""
  },
  {
    "id": "CRY-GV-107",
    "name": "North Carolina Wildlife Advisory",
    "type": "MEDIA",
    "faction": "government",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Public bulletin: Do not feed the north carolina cryptid.\""
  },
  {
    "id": "CRY-GV-108",
    "name": "North Dakota Wildlife Advisory",
    "type": "MEDIA",
    "faction": "government",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Public bulletin: Do not feed the north dakota cryptid.\""
  },
  {
    "id": "CRY-GV-109",
    "name": "Ohio Wildlife Advisory",
    "type": "MEDIA",
    "faction": "government",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Public bulletin: Do not feed the loveland frogman.\""
  },
  {
    "id": "CRY-GV-110",
    "name": "Oklahoma Wildlife Advisory",
    "type": "MEDIA",
    "faction": "government",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Public bulletin: Do not feed the oklahoma cryptid.\""
  },
  {
    "id": "CRY-GV-111",
    "name": "Oregon Wildlife Advisory",
    "type": "MEDIA",
    "faction": "government",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Public bulletin: Do not feed the bigfoot.\""
  },
  {
    "id": "CRY-GV-112",
    "name": "Pennsylvania Wildlife Advisory",
    "type": "MEDIA",
    "faction": "government",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Public bulletin: Do not feed the pennsylvania cryptid.\""
  },
  {
    "id": "CRY-GV-113",
    "name": "Rhode Island Wildlife Advisory",
    "type": "MEDIA",
    "faction": "government",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Public bulletin: Do not feed the rhode island cryptid.\""
  },
  {
    "id": "CRY-GV-114",
    "name": "South Carolina Wildlife Advisory",
    "type": "MEDIA",
    "faction": "government",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Public bulletin: Do not feed the south carolina cryptid.\""
  },
  {
    "id": "CRY-GV-115",
    "name": "South Dakota Wildlife Advisory",
    "type": "MEDIA",
    "faction": "government",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Public bulletin: Do not feed the south dakota cryptid.\""
  },
  {
    "id": "CRY-GV-116",
    "name": "Tennessee Wildlife Advisory",
    "type": "MEDIA",
    "faction": "government",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Public bulletin: Do not feed the tennessee cryptid.\""
  },
  {
    "id": "CRY-GV-117",
    "name": "Texas Wildlife Advisory",
    "type": "ATTACK",
    "faction": "government",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Public bulletin: Do not feed the chupacabra.\""
  },
  {
    "id": "CRY-GV-118",
    "name": "Utah Wildlife Advisory",
    "type": "MEDIA",
    "faction": "government",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Public bulletin: Do not feed the utah cryptid.\""
  },
  {
    "id": "CRY-GV-119",
    "name": "Vermont Wildlife Advisory",
    "type": "MEDIA",
    "faction": "government",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Public bulletin: Do not feed the champ.\""
  },
  {
    "id": "CRY-GV-120",
    "name": "Virginia Wildlife Advisory",
    "type": "MEDIA",
    "faction": "government",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Public bulletin: Do not feed the virginia cryptid.\""
  },
  {
    "id": "CRY-GV-121",
    "name": "Washington Wildlife Advisory",
    "type": "MEDIA",
    "faction": "government",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Public bulletin: Do not feed the bigfoot.\""
  },
  {
    "id": "CRY-GV-122",
    "name": "West Virginia Wildlife Advisory",
    "type": "ATTACK",
    "faction": "government",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Public bulletin: Do not feed the mothman.\""
  },
  {
    "id": "CRY-GV-123",
    "name": "Wisconsin Wildlife Advisory",
    "type": "ATTACK",
    "faction": "government",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Public bulletin: Do not feed the beast of bray road.\""
  },
  {
    "id": "CRY-GV-124",
    "name": "Wyoming Wildlife Advisory",
    "type": "MEDIA",
    "faction": "government",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Public bulletin: Do not feed the wyoming cryptid.\""
  },
  {
    "id": "CRY-GV-125",
    "name": "Chupacabra Area Closure",
    "type": "ATTACK",
    "faction": "government",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Standard operating procedure, nothing to see.\""
  },
  {
    "id": "CRY-GV-126",
    "name": "Skunk Ape Area Closure",
    "type": "ZONE",
    "faction": "government",
    "rarity": "common",
    "cost": 4,
    "effects": {
      "pressureDelta": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Standard operating procedure, nothing to see.\"",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "CRY-GV-127",
    "name": "Snallygaster Perimeter Lockdown",
    "type": "MEDIA",
    "faction": "government",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Standard operating procedure, nothing to see.\""
  },
  {
    "id": "CRY-GV-128",
    "name": "Snallygaster Budget Audit",
    "type": "ATTACK",
    "faction": "government",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Standard operating procedure, nothing to see.\""
  },
  {
    "id": "CRY-GV-129",
    "name": "Bigfoot Area Closure",
    "type": "ZONE",
    "faction": "government",
    "rarity": "common",
    "cost": 4,
    "effects": {
      "pressureDelta": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Standard operating procedure, nothing to see.\"",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "CRY-GV-130",
    "name": "Thunderbird Area Closure",
    "type": "ATTACK",
    "faction": "government",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Standard operating procedure, nothing to see.\""
  },
  {
    "id": "CRY-GV-131",
    "name": "Montauk Monster Area Closure",
    "type": "ZONE",
    "faction": "government",
    "rarity": "common",
    "cost": 4,
    "effects": {
      "pressureDelta": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Standard operating procedure, nothing to see.\"",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "CRY-GV-132",
    "name": "Dogman Area Closure",
    "type": "ZONE",
    "faction": "government",
    "rarity": "common",
    "cost": 4,
    "effects": {
      "pressureDelta": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Standard operating procedure, nothing to see.\"",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "CRY-GV-133",
    "name": "Champ Budget Audit",
    "type": "ATTACK",
    "faction": "government",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Standard operating procedure, nothing to see.\""
  },
  {
    "id": "CRY-GV-134",
    "name": "Montauk Monster Area Closure",
    "type": "ZONE",
    "faction": "government",
    "rarity": "common",
    "cost": 4,
    "effects": {
      "pressureDelta": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Standard operating procedure, nothing to see.\"",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "CRY-GV-135",
    "name": "Dover Demon Area Closure",
    "type": "ZONE",
    "faction": "government",
    "rarity": "common",
    "cost": 4,
    "effects": {
      "pressureDelta": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Standard operating procedure, nothing to see.\"",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "CRY-GV-136",
    "name": "Tahoe Tessie Area Closure",
    "type": "ZONE",
    "faction": "government",
    "rarity": "common",
    "cost": 4,
    "effects": {
      "pressureDelta": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Standard operating procedure, nothing to see.\"",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "CRY-GV-137",
    "name": "Beast of Bray Road Budget Audit",
    "type": "ATTACK",
    "faction": "government",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Standard operating procedure, nothing to see.\""
  },
  {
    "id": "CRY-GV-138",
    "name": "Thunderbird Perimeter Lockdown",
    "type": "ATTACK",
    "faction": "government",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Standard operating procedure, nothing to see.\""
  },
  {
    "id": "CRY-GV-139",
    "name": "Rougarou Perimeter Lockdown",
    "type": "MEDIA",
    "faction": "government",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Standard operating procedure, nothing to see.\""
  },
  {
    "id": "CRY-GV-140",
    "name": "Jersey Devil Area Closure",
    "type": "ATTACK",
    "faction": "government",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Standard operating procedure, nothing to see.\""
  },
  {
    "id": "CRY-GV-141",
    "name": "Dogman Area Closure",
    "type": "ZONE",
    "faction": "government",
    "rarity": "common",
    "cost": 4,
    "effects": {
      "pressureDelta": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Standard operating procedure, nothing to see.\"",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "CRY-GV-142",
    "name": "Wendigo Perimeter Lockdown",
    "type": "ATTACK",
    "faction": "government",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Standard operating procedure, nothing to see.\""
  },
  {
    "id": "CRY-GV-143",
    "name": "Shunka Warakin Area Closure",
    "type": "ZONE",
    "faction": "government",
    "rarity": "common",
    "cost": 4,
    "effects": {
      "pressureDelta": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Standard operating procedure, nothing to see.\"",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "CRY-GV-144",
    "name": "Dover Demon Budget Audit",
    "type": "ATTACK",
    "faction": "government",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Standard operating procedure, nothing to see.\""
  },
  {
    "id": "CRY-GV-145",
    "name": "Thunderbird Perimeter Lockdown",
    "type": "ATTACK",
    "faction": "government",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Standard operating procedure, nothing to see.\""
  },
  {
    "id": "CRY-GV-146",
    "name": "Skunk Ape Area Closure",
    "type": "ZONE",
    "faction": "government",
    "rarity": "common",
    "cost": 4,
    "effects": {
      "pressureDelta": 1
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Standard operating procedure, nothing to see.\"",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "CRY-GV-147",
    "name": "Rougarou Budget Audit",
    "type": "ATTACK",
    "faction": "government",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Standard operating procedure, nothing to see.\""
  },
  {
    "id": "CRY-GV-148",
    "name": "Chupacabra Budget Audit",
    "type": "ATTACK",
    "faction": "government",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Standard operating procedure, nothing to see.\""
  },
  {
    "id": "CRY-GV-149",
    "name": "Dover Demon Budget Audit",
    "type": "ATTACK",
    "faction": "government",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Standard operating procedure, nothing to see.\""
  },
  {
    "id": "CRY-GV-150",
    "name": "Jersey Devil Perimeter Lockdown",
    "type": "ATTACK",
    "faction": "government",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "cryptids",
    "flavor": "\"CLASSIFIED INTELLIGENCE: Standard operating procedure, nothing to see.\""
  }
];

export default cards;
