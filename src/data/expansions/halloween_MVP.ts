import type { GameCard } from '@/rules/mvp';

const cards: GameCard[] = [
  {
    "id": "hallo-gov-graveyard-flyer-protocol-001",
    "name": "Graveyard Flyer Protocol",
    "type": "ATTACK",
    "faction": "government",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "halloween",
    "text": "Opponent −1 IP.",
    "flavor": "Someone left the portal open again."
  },
  {
    "id": "hallo-gov-spider-scare-incident-002",
    "name": "Spider Scare Incident",
    "type": "ATTACK",
    "faction": "government",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "halloween",
    "text": "Opponent −1 IP.",
    "flavor": "Bring a flashlight and plausible deniability."
  },
  {
    "id": "hallo-gov-cauldron-whispers-incident-003",
    "name": "Cauldron Whispers Incident",
    "type": "ATTACK",
    "faction": "government",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "halloween",
    "text": "Opponent −1 IP.",
    "flavor": "All treats, suspicious tricks."
  },
  {
    "id": "hallo-gov-ouija-shuffle-incident-004",
    "name": "Ouija Shuffle Incident",
    "type": "MEDIA",
    "faction": "government",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": -1
    },
    "extId": "halloween",
    "text": "−1% Truth.",
    "flavor": "Approved by the Council of Shadows."
  },
  {
    "id": "hallo-gov-report-of-the-fog-machine-005",
    "name": "Report of the Fog Machine",
    "type": "ATTACK",
    "faction": "government",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "halloween",
    "text": "Opponent −1 IP.",
    "flavor": "Someone left the portal open again."
  },
  {
    "id": "hallo-gov-dracula-shuffle-protocol-006",
    "name": "Dracula Shuffle Protocol",
    "type": "MEDIA",
    "faction": "government",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": -1
    },
    "extId": "halloween",
    "text": "−1% Truth.",
    "flavor": "Do not taunt the poltergeist."
  },
  {
    "id": "hallo-gov-wolfman-shenanigans-007",
    "name": "Wolfman Shenanigans",
    "type": "MEDIA",
    "faction": "government",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": -1
    },
    "extId": "halloween",
    "text": "−1% Truth.",
    "flavor": "Rated PG‑Paranoid."
  },
  {
    "id": "hallo-gov-press-release-of-the-full-moon-008",
    "name": "Press Release of the Full Moon",
    "type": "MEDIA",
    "faction": "government",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": -1
    },
    "extId": "halloween",
    "text": "−1% Truth.",
    "flavor": "Whispers from the cornfield."
  },
  {
    "id": "hallo-gov-scare-of-the-midnight-009",
    "name": "Scare of the Midnight",
    "type": "ATTACK",
    "faction": "government",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "halloween",
    "text": "Opponent −1 IP.",
    "flavor": "Batteries not included."
  },
  {
    "id": "hallo-gov-bat-boy-shuffle-protocol-010",
    "name": "Bat Boy Shuffle Protocol",
    "type": "ZONE",
    "faction": "government",
    "rarity": "common",
    "cost": 4,
    "effects": {
      "pressureDelta": 1
    },
    "extId": "halloween",
    "text": "+1 Pressure in a chosen state.",
    "flavor": "Red eyes in the rear-view mirror.",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "hallo-gov-skeleton-press-release-files-011",
    "name": "Skeleton Press Release Files",
    "type": "ATTACK",
    "faction": "government",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "halloween",
    "text": "Opponent −1 IP.",
    "flavor": "Approved by the Council of Shadows."
  },
  {
    "id": "hallo-gov-trick-or-treat-pamphlet-files-012",
    "name": "Trick-or-Treat Pamphlet Files",
    "type": "MEDIA",
    "faction": "government",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": -1
    },
    "extId": "halloween",
    "text": "−1% Truth.",
    "flavor": "Whispers from the cornfield."
  },
  {
    "id": "hallo-gov-haunted-rally-protocol-013",
    "name": "Haunted Rally Protocol",
    "type": "ATTACK",
    "faction": "government",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "halloween",
    "text": "Opponent −1 IP.",
    "flavor": "Bring a flashlight and plausible deniability."
  },
  {
    "id": "hallo-gov-raven-flyer-protocol-014",
    "name": "Raven Flyer Protocol",
    "type": "MEDIA",
    "faction": "government",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": -1
    },
    "extId": "halloween",
    "text": "−1% Truth.",
    "flavor": "They came for the candy, stayed for the cover‑up."
  },
  {
    "id": "hallo-gov-poltergeist-alert-protocol-015",
    "name": "Poltergeist Alert Protocol",
    "type": "ATTACK",
    "faction": "government",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "halloween",
    "text": "Opponent −1 IP.",
    "flavor": "Mind the ectoplasm."
  },
  {
    "id": "hallo-gov-scarecrow-shenanigans-incident-016",
    "name": "Scarecrow Shenanigans Incident",
    "type": "MEDIA",
    "faction": "government",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": -1
    },
    "extId": "halloween",
    "text": "−1% Truth.",
    "flavor": "‘It was just the wind,’ said the intern."
  },
  {
    "id": "hallo-gov-scare-of-the-ghost-017",
    "name": "Scare of the Ghost",
    "type": "MEDIA",
    "faction": "government",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": -1
    },
    "extId": "halloween",
    "text": "−1% Truth.",
    "flavor": "Smells like fog machine and fear."
  },
  {
    "id": "hallo-gov-banshee-shenanigans-incident-018",
    "name": "Banshee Shenanigans Incident",
    "type": "ATTACK",
    "faction": "government",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "halloween",
    "text": "Opponent −1 IP.",
    "flavor": "The veil is thin tonight."
  },
  {
    "id": "hallo-gov-wolfman-pamphlet-incident-019",
    "name": "Wolfman Pamphlet Incident",
    "type": "ATTACK",
    "faction": "government",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "halloween",
    "text": "Opponent −1 IP.",
    "flavor": "Someone left the portal open again."
  },
  {
    "id": "hallo-gov-bat-boy-shuffle-020",
    "name": "Bat Boy Shuffle",
    "type": "ATTACK",
    "faction": "government",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "halloween",
    "text": "Opponent −1 IP.",
    "flavor": "‘It was just the wind,’ said the intern."
  },
  {
    "id": "hallo-gov-moonlight-scare-files-021",
    "name": "Moonlight Scare Files",
    "type": "ZONE",
    "faction": "government",
    "rarity": "common",
    "cost": 4,
    "effects": {
      "pressureDelta": 1
    },
    "extId": "halloween",
    "text": "+1 Pressure in a chosen state.",
    "flavor": "‘It was just the wind,’ said the intern.",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "hallo-gov-shuffle-of-the-mummy-022",
    "name": "Shuffle of the Mummy",
    "type": "ATTACK",
    "faction": "government",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "halloween",
    "text": "Opponent −1 IP.",
    "flavor": "The veil is thin tonight."
  },
  {
    "id": "hallo-gov-haunted-mansion-whispers-023",
    "name": "Haunted Mansion Whispers",
    "type": "ATTACK",
    "faction": "government",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "halloween",
    "text": "Opponent −1 IP.",
    "flavor": "We can neither confirm nor deny the howling."
  },
  {
    "id": "hallo-gov-raven-scare-024",
    "name": "Raven Scare",
    "type": "MEDIA",
    "faction": "government",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": -1
    },
    "extId": "halloween",
    "text": "−1% Truth.",
    "flavor": "Mind the ectoplasm."
  },
  {
    "id": "hallo-gov-frankenstein-pamphlet-initiative-025",
    "name": "Frankenstein Pamphlet Initiative",
    "type": "ZONE",
    "faction": "government",
    "rarity": "common",
    "cost": 4,
    "effects": {
      "pressureDelta": 1
    },
    "extId": "halloween",
    "text": "+1 Pressure in a chosen state.",
    "flavor": "Red eyes in the rear-view mirror.",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "hallo-gov-shenanigans-of-the-cauldron-026",
    "name": "Shenanigans of the Cauldron",
    "type": "MEDIA",
    "faction": "government",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": -1
    },
    "extId": "halloween",
    "text": "−1% Truth.",
    "flavor": "Bring a flashlight and plausible deniability."
  },
  {
    "id": "hallo-gov-headless-horseman-pamphlet-files-027",
    "name": "Headless Horseman Pamphlet Files",
    "type": "ATTACK",
    "faction": "government",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "halloween",
    "text": "Opponent −1 IP.",
    "flavor": "Licensed spooktacular."
  },
  {
    "id": "hallo-gov-ouija-scare-protocol-028",
    "name": "Ouija Scare Protocol",
    "type": "MEDIA",
    "faction": "government",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": -1
    },
    "extId": "halloween",
    "text": "−1% Truth.",
    "flavor": "Try not to scream on camera."
  },
  {
    "id": "hallo-gov-skeleton-flyer-files-029",
    "name": "Skeleton Flyer Files",
    "type": "ATTACK",
    "faction": "government",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "halloween",
    "text": "Opponent −1 IP.",
    "flavor": "Whispers from the cornfield."
  },
  {
    "id": "hallo-gov-brief-of-the-skeleton-030",
    "name": "Brief of the Skeleton",
    "type": "MEDIA",
    "faction": "government",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": -1
    },
    "extId": "halloween",
    "text": "−1% Truth.",
    "flavor": "They came for the candy, stayed for the cover‑up."
  },
  {
    "id": "hallo-gov-frankenstein-flyer-incident-031",
    "name": "Frankenstein Flyer Incident",
    "type": "MEDIA",
    "faction": "government",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": -1
    },
    "extId": "halloween",
    "text": "−1% Truth.",
    "flavor": "They came for the candy, stayed for the cover‑up."
  },
  {
    "id": "hallo-gov-coven-scare-032",
    "name": "Coven Scare",
    "type": "ZONE",
    "faction": "government",
    "rarity": "common",
    "cost": 4,
    "effects": {
      "pressureDelta": 1
    },
    "extId": "halloween",
    "text": "+1 Pressure in a chosen state.",
    "flavor": "The crypt Wi‑Fi is excellent.",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "hallo-gov-poltergeist-flyer-033",
    "name": "Poltergeist Flyer",
    "type": "ATTACK",
    "faction": "government",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "halloween",
    "text": "Opponent −1 IP.",
    "flavor": "Someone left the portal open again."
  },
  {
    "id": "hallo-gov-fog-machine-rally-034",
    "name": "Fog Machine Rally",
    "type": "MEDIA",
    "faction": "government",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": -1
    },
    "extId": "halloween",
    "text": "−1% Truth.",
    "flavor": "Mind the ectoplasm."
  },
  {
    "id": "hallo-gov-ghoul-alert-protocol-035",
    "name": "Ghoul Alert Protocol",
    "type": "MEDIA",
    "faction": "government",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": -1
    },
    "extId": "halloween",
    "text": "−1% Truth.",
    "flavor": "Licensed spooktacular."
  },
  {
    "id": "hallo-gov-cobweb-scare-036",
    "name": "Cobweb Scare",
    "type": "ZONE",
    "faction": "government",
    "rarity": "common",
    "cost": 4,
    "effects": {
      "pressureDelta": 1
    },
    "extId": "halloween",
    "text": "+1 Pressure in a chosen state.",
    "flavor": "The veil is thin tonight.",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "hallo-gov-seance-alert-initiative-037",
    "name": "Seance Alert Initiative",
    "type": "ZONE",
    "faction": "government",
    "rarity": "common",
    "cost": 4,
    "effects": {
      "pressureDelta": 1
    },
    "extId": "halloween",
    "text": "+1 Pressure in a chosen state.",
    "flavor": "Bring a flashlight and plausible deniability.",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "hallo-gov-ghost-alert-initiative-038",
    "name": "Ghost Alert Initiative",
    "type": "MEDIA",
    "faction": "government",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": -1
    },
    "extId": "halloween",
    "text": "−1% Truth.",
    "flavor": "Red eyes in the rear-view mirror."
  },
  {
    "id": "hallo-gov-poltergeist-report-initiative-039",
    "name": "Poltergeist Report Initiative",
    "type": "MEDIA",
    "faction": "government",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": -1
    },
    "extId": "halloween",
    "text": "−1% Truth.",
    "flavor": "Mind the ectoplasm."
  },
  {
    "id": "hallo-gov-alert-of-the-haunted-mansion-040",
    "name": "Alert of the Haunted Mansion",
    "type": "ATTACK",
    "faction": "government",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "halloween",
    "text": "Opponent −1 IP.",
    "flavor": "Try not to scream on camera."
  },
  {
    "id": "hallo-gov-ghost-flyer-protocol-041",
    "name": "Ghost Flyer Protocol",
    "type": "ZONE",
    "faction": "government",
    "rarity": "common",
    "cost": 4,
    "effects": {
      "pressureDelta": 1
    },
    "extId": "halloween",
    "text": "+1 Pressure in a chosen state.",
    "flavor": "Try not to scream on camera.",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "hallo-gov-jack-o-lantern-alert-042",
    "name": "Jack-o-Lantern Alert",
    "type": "MEDIA",
    "faction": "government",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": -1
    },
    "extId": "halloween",
    "text": "−1% Truth.",
    "flavor": "Keep garlic handy."
  },
  {
    "id": "hallo-gov-seance-shenanigans-043",
    "name": "Seance Shenanigans",
    "type": "ATTACK",
    "faction": "government",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "halloween",
    "text": "Opponent −1 IP.",
    "flavor": "Whispers from the cornfield."
  },
  {
    "id": "hallo-gov-zombie-pamphlet-incident-044",
    "name": "Zombie Pamphlet Incident",
    "type": "ATTACK",
    "faction": "government",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "halloween",
    "text": "Opponent −1 IP.",
    "flavor": "Bring a flashlight and plausible deniability."
  },
  {
    "id": "hallo-gov-crypt-rumor-protocol-045",
    "name": "Crypt Rumor Protocol",
    "type": "ATTACK",
    "faction": "government",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "halloween",
    "text": "Opponent −1 IP.",
    "flavor": "Sticky with sugar and secrets."
  },
  {
    "id": "hallo-gov-skeleton-whispers-initiative-046",
    "name": "Skeleton Whispers Initiative",
    "type": "MEDIA",
    "faction": "government",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": -1
    },
    "extId": "halloween",
    "text": "−1% Truth.",
    "flavor": "Keep garlic handy."
  },
  {
    "id": "hallo-gov-report-of-the-moonlight-047",
    "name": "Report of the Moonlight",
    "type": "MEDIA",
    "faction": "government",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": -1
    },
    "extId": "halloween",
    "text": "−1% Truth.",
    "flavor": "The crypt Wi‑Fi is excellent."
  },
  {
    "id": "hallo-gov-ectoplasm-brief-files-048",
    "name": "Ectoplasm Brief Files",
    "type": "ATTACK",
    "faction": "government",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "halloween",
    "text": "Opponent −1 IP.",
    "flavor": "‘It was just the wind,’ said the intern."
  },
  {
    "id": "hallo-gov-cobweb-report-files-049",
    "name": "Cobweb Report Files",
    "type": "MEDIA",
    "faction": "government",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": -1
    },
    "extId": "halloween",
    "text": "−1% Truth.",
    "flavor": "Someone left the portal open again."
  },
  {
    "id": "hallo-gov-cobweb-alert-protocol-050",
    "name": "Cobweb Alert Protocol",
    "type": "MEDIA",
    "faction": "government",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": -1
    },
    "extId": "halloween",
    "text": "−1% Truth.",
    "flavor": "Bring a flashlight and plausible deniability."
  },
  {
    "id": "hallo-gov-omen-pamphlet-files-051",
    "name": "Omen Pamphlet Files",
    "type": "ZONE",
    "faction": "government",
    "rarity": "common",
    "cost": 4,
    "effects": {
      "pressureDelta": 1
    },
    "extId": "halloween",
    "text": "+1 Pressure in a chosen state.",
    "flavor": "They came for the candy, stayed for the cover‑up.",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "hallo-gov-ghost-scare-files-052",
    "name": "Ghost Scare Files",
    "type": "ATTACK",
    "faction": "government",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "halloween",
    "text": "Opponent −1 IP.",
    "flavor": "The veil is thin tonight."
  },
  {
    "id": "hallo-gov-frankenstein-pamphlet-protocol-053",
    "name": "Frankenstein Pamphlet Protocol",
    "type": "ATTACK",
    "faction": "government",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "halloween",
    "text": "Opponent −1 IP.",
    "flavor": "Mind the ectoplasm."
  },
  {
    "id": "hallo-gov-cobweb-whispers-054",
    "name": "Cobweb Whispers",
    "type": "ATTACK",
    "faction": "government",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "halloween",
    "text": "Opponent −1 IP.",
    "flavor": "Do not feed after midnight."
  },
  {
    "id": "hallo-gov-full-moon-press-release-incident-055",
    "name": "Full Moon Press Release Incident",
    "type": "MEDIA",
    "faction": "government",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": -1
    },
    "extId": "halloween",
    "text": "−1% Truth.",
    "flavor": "Sticky with sugar and secrets."
  },
  {
    "id": "hallo-gov-shuffle-of-the-haunted-056",
    "name": "Shuffle of the Haunted",
    "type": "ATTACK",
    "faction": "government",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "halloween",
    "text": "Opponent −1 IP.",
    "flavor": "Someone left the portal open again."
  },
  {
    "id": "hallo-gov-cobweb-shenanigans-incident-057",
    "name": "Cobweb Shenanigans Incident",
    "type": "ATTACK",
    "faction": "government",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "halloween",
    "text": "Opponent −1 IP.",
    "flavor": "Approved by the Council of Shadows."
  },
  {
    "id": "hallo-gov-witch-shenanigans-058",
    "name": "Witch Shenanigans",
    "type": "ZONE",
    "faction": "government",
    "rarity": "common",
    "cost": 4,
    "effects": {
      "pressureDelta": 1
    },
    "extId": "halloween",
    "text": "+1 Pressure in a chosen state.",
    "flavor": "This is fine. Probably.",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "hallo-gov-zombie-rally-files-059",
    "name": "Zombie Rally Files",
    "type": "ZONE",
    "faction": "government",
    "rarity": "common",
    "cost": 4,
    "effects": {
      "pressureDelta": 1
    },
    "extId": "halloween",
    "text": "+1 Pressure in a chosen state.",
    "flavor": "Red eyes in the rear-view mirror.",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "hallo-gov-dracula-shenanigans-060",
    "name": "Dracula Shenanigans",
    "type": "MEDIA",
    "faction": "government",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": -1
    },
    "extId": "halloween",
    "text": "−1% Truth.",
    "flavor": "Licensed spooktacular."
  },
  {
    "id": "hallo-gov-ouija-rumor-061",
    "name": "Ouija Rumor",
    "type": "ATTACK",
    "faction": "government",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "halloween",
    "text": "Opponent −1 IP.",
    "flavor": "This is fine. Probably."
  },
  {
    "id": "hallo-gov-skeleton-rally-protocol-062",
    "name": "Skeleton Rally Protocol",
    "type": "ATTACK",
    "faction": "government",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "halloween",
    "text": "Opponent −1 IP.",
    "flavor": "Haunting sponsored by a totally normal NGO."
  },
  {
    "id": "hallo-gov-spider-shuffle-063",
    "name": "Spider Shuffle",
    "type": "ATTACK",
    "faction": "government",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "halloween",
    "text": "Opponent −1 IP.",
    "flavor": "Approved by the Council of Shadows."
  },
  {
    "id": "hallo-gov-candy-corn-whispers-064",
    "name": "Candy Corn Whispers",
    "type": "ATTACK",
    "faction": "government",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "halloween",
    "text": "Opponent −1 IP.",
    "flavor": "This is fine. Probably."
  },
  {
    "id": "hallo-gov-moonlight-scare-initiative-065",
    "name": "Moonlight Scare Initiative",
    "type": "MEDIA",
    "faction": "government",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": -1
    },
    "extId": "halloween",
    "text": "−1% Truth.",
    "flavor": "All treats, suspicious tricks."
  },
  {
    "id": "hallo-gov-jack-o-lantern-rally-incident-066",
    "name": "Jack-o-Lantern Rally Incident",
    "type": "MEDIA",
    "faction": "government",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": -1
    },
    "extId": "halloween",
    "text": "−1% Truth.",
    "flavor": "Do not taunt the poltergeist."
  },
  {
    "id": "hallo-gov-full-moon-shenanigans-067",
    "name": "Full Moon Shenanigans",
    "type": "ATTACK",
    "faction": "government",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "halloween",
    "text": "Opponent −1 IP.",
    "flavor": "This is fine. Probably."
  },
  {
    "id": "hallo-gov-wolfman-flyer-protocol-068",
    "name": "Wolfman Flyer Protocol",
    "type": "ATTACK",
    "faction": "government",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "halloween",
    "text": "Opponent −1 IP.",
    "flavor": "This is fine. Probably."
  },
  {
    "id": "hallo-gov-brief-of-the-midnight-069",
    "name": "Brief of the Midnight",
    "type": "ATTACK",
    "faction": "government",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "halloween",
    "text": "Opponent −1 IP.",
    "flavor": "Haunting sponsored by a totally normal NGO."
  },
  {
    "id": "hallo-gov-witch-press-release-incident-070",
    "name": "Witch Press Release Incident",
    "type": "ATTACK",
    "faction": "government",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "halloween",
    "text": "Opponent −1 IP.",
    "flavor": "Sticky with sugar and secrets."
  },
  {
    "id": "hallo-gov-ghoul-sweep-initiative-001",
    "name": "Ghoul Sweep Initiative",
    "type": "ATTACK",
    "faction": "government",
    "rarity": "uncommon",
    "cost": 3,
    "effects": {
      "ipDelta": {
        "opponent": 2
      }
    },
    "extId": "halloween",
    "text": "Opponent −2 IP.",
    "flavor": "Bring a flashlight and plausible deniability."
  },
  {
    "id": "hallo-gov-bat-boy-operation-protocol-002",
    "name": "Bat Boy Operation Protocol",
    "type": "MEDIA",
    "faction": "government",
    "rarity": "uncommon",
    "cost": 4,
    "effects": {
      "truthDelta": -2
    },
    "extId": "halloween",
    "text": "−2% Truth.",
    "flavor": "This is fine. Probably."
  },
  {
    "id": "hallo-gov-broadcast-of-the-seance-003",
    "name": "Broadcast of the Seance",
    "type": "MEDIA",
    "faction": "government",
    "rarity": "uncommon",
    "cost": 4,
    "effects": {
      "truthDelta": -2
    },
    "extId": "halloween",
    "text": "−2% Truth.",
    "flavor": "Whispers from the cornfield."
  },
  {
    "id": "hallo-gov-spooky-hayride-operation-initiative-004",
    "name": "Spooky Hayride Operation Initiative",
    "type": "ATTACK",
    "faction": "government",
    "rarity": "uncommon",
    "cost": 3,
    "effects": {
      "ipDelta": {
        "opponent": 2
      }
    },
    "extId": "halloween",
    "text": "Opponent −2 IP.",
    "flavor": "All treats, suspicious tricks."
  },
  {
    "id": "hallo-gov-ploy-of-the-headless-horseman-005",
    "name": "Ploy of the Headless Horseman",
    "type": "ATTACK",
    "faction": "government",
    "rarity": "uncommon",
    "cost": 3,
    "effects": {
      "ipDelta": {
        "opponent": 2
      }
    },
    "extId": "halloween",
    "text": "Opponent −2 IP.",
    "flavor": "Smells like fog machine and fear."
  },
  {
    "id": "hallo-gov-jack-o-lantern-stakeout-006",
    "name": "Jack-o-Lantern Stakeout",
    "type": "ATTACK",
    "faction": "government",
    "rarity": "uncommon",
    "cost": 3,
    "effects": {
      "ipDelta": {
        "opponent": 2
      }
    },
    "extId": "halloween",
    "text": "Opponent −2 IP.",
    "flavor": "Licensed spooktacular."
  },
  {
    "id": "hallo-gov-poltergeist-murmur-network-incident-007",
    "name": "Poltergeist Murmur Network Incident",
    "type": "MEDIA",
    "faction": "government",
    "rarity": "uncommon",
    "cost": 4,
    "effects": {
      "truthDelta": -2
    },
    "extId": "halloween",
    "text": "−2% Truth.",
    "flavor": "Rated PG‑Paranoid."
  },
  {
    "id": "hallo-gov-moonlight-expedition-incident-008",
    "name": "Moonlight Expedition Incident",
    "type": "MEDIA",
    "faction": "government",
    "rarity": "uncommon",
    "cost": 4,
    "effects": {
      "truthDelta": -2
    },
    "extId": "halloween",
    "text": "−2% Truth.",
    "flavor": "They came for the candy, stayed for the cover‑up."
  },
  {
    "id": "hallo-gov-seance-broadcast-incident-009",
    "name": "Seance Broadcast Incident",
    "type": "MEDIA",
    "faction": "government",
    "rarity": "uncommon",
    "cost": 4,
    "effects": {
      "truthDelta": -2
    },
    "extId": "halloween",
    "text": "−2% Truth.",
    "flavor": "Licensed spooktacular."
  },
  {
    "id": "hallo-gov-midnight-ploy-protocol-010",
    "name": "Midnight Ploy Protocol",
    "type": "MEDIA",
    "faction": "government",
    "rarity": "uncommon",
    "cost": 4,
    "effects": {
      "truthDelta": -2
    },
    "extId": "halloween",
    "text": "−2% Truth.",
    "flavor": "Do not feed after midnight."
  },
  {
    "id": "hallo-gov-banshee-investigation-files-011",
    "name": "Banshee Investigation Files",
    "type": "MEDIA",
    "faction": "government",
    "rarity": "uncommon",
    "cost": 4,
    "effects": {
      "truthDelta": -2
    },
    "extId": "halloween",
    "text": "−2% Truth.",
    "flavor": "Smells like fog machine and fear."
  },
  {
    "id": "hallo-gov-poltergeist-expedition-012",
    "name": "Poltergeist Expedition",
    "type": "ATTACK",
    "faction": "government",
    "rarity": "uncommon",
    "cost": 3,
    "effects": {
      "ipDelta": {
        "opponent": 2
      }
    },
    "extId": "halloween",
    "text": "Opponent −2 IP.",
    "flavor": "Try not to scream on camera."
  },
  {
    "id": "hallo-gov-graveyard-expedition-initiative-013",
    "name": "Graveyard Expedition Initiative",
    "type": "ZONE",
    "faction": "government",
    "rarity": "uncommon",
    "cost": 5,
    "effects": {
      "pressureDelta": 2
    },
    "extId": "halloween",
    "text": "+2 Pressure in a chosen state.",
    "flavor": "Sticky with sugar and secrets.",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "hallo-gov-zombie-murmur-network-files-014",
    "name": "Zombie Murmur Network Files",
    "type": "ZONE",
    "faction": "government",
    "rarity": "uncommon",
    "cost": 5,
    "effects": {
      "pressureDelta": 2
    },
    "extId": "halloween",
    "text": "+2 Pressure in a chosen state.",
    "flavor": "Rated PG‑Paranoid.",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "hallo-gov-haunted-mansion-ploy-protocol-015",
    "name": "Haunted Mansion Ploy Protocol",
    "type": "MEDIA",
    "faction": "government",
    "rarity": "uncommon",
    "cost": 4,
    "effects": {
      "truthDelta": -2
    },
    "extId": "halloween",
    "text": "−2% Truth.",
    "flavor": "This is fine. Probably."
  },
  {
    "id": "hallo-gov-headless-horseman-investigation-initiative-016",
    "name": "Headless Horseman Investigation Initiative",
    "type": "ZONE",
    "faction": "government",
    "rarity": "uncommon",
    "cost": 5,
    "effects": {
      "pressureDelta": 2
    },
    "extId": "halloween",
    "text": "+2 Pressure in a chosen state.",
    "flavor": "Mind the ectoplasm.",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "hallo-gov-headless-horseman-gambit-017",
    "name": "Headless Horseman Gambit",
    "type": "MEDIA",
    "faction": "government",
    "rarity": "uncommon",
    "cost": 4,
    "effects": {
      "truthDelta": -2
    },
    "extId": "halloween",
    "text": "−2% Truth.",
    "flavor": "Licensed spooktacular."
  },
  {
    "id": "hallo-gov-candy-corn-expedition-protocol-018",
    "name": "Candy Corn Expedition Protocol",
    "type": "MEDIA",
    "faction": "government",
    "rarity": "uncommon",
    "cost": 4,
    "effects": {
      "truthDelta": -2
    },
    "extId": "halloween",
    "text": "−2% Truth.",
    "flavor": "This is fine. Probably."
  },
  {
    "id": "hallo-gov-banshee-broadcast-initiative-019",
    "name": "Banshee Broadcast Initiative",
    "type": "ZONE",
    "faction": "government",
    "rarity": "uncommon",
    "cost": 5,
    "effects": {
      "pressureDelta": 2
    },
    "extId": "halloween",
    "text": "+2 Pressure in a chosen state.",
    "flavor": "They came for the candy, stayed for the cover‑up.",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "hallo-gov-spider-gambit-protocol-020",
    "name": "Spider Gambit Protocol",
    "type": "MEDIA",
    "faction": "government",
    "rarity": "uncommon",
    "cost": 4,
    "effects": {
      "truthDelta": -2
    },
    "extId": "halloween",
    "text": "−2% Truth.",
    "flavor": "Batteries not included."
  },
  {
    "id": "hallo-gov-revelation-of-the-graveyard-001",
    "name": "Revelation of the Graveyard",
    "type": "MEDIA",
    "faction": "government",
    "rarity": "rare",
    "cost": 5,
    "effects": {
      "truthDelta": -3
    },
    "extId": "halloween",
    "text": "−3% Truth.",
    "flavor": "They came for the candy, stayed for the cover‑up."
  },
  {
    "id": "hallo-gov-raven-revelation-initiative-002",
    "name": "Raven Revelation Initiative",
    "type": "MEDIA",
    "faction": "government",
    "rarity": "rare",
    "cost": 5,
    "effects": {
      "truthDelta": -3
    },
    "extId": "halloween",
    "text": "−3% Truth.",
    "flavor": "The crypt Wi‑Fi is excellent."
  },
  {
    "id": "hallo-gov-containment-of-the-cauldron-003",
    "name": "Containment of the Cauldron",
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
    "extId": "halloween",
    "text": "Opponent −3 IP, discard 1.",
    "flavor": "Try not to scream on camera."
  },
  {
    "id": "hallo-gov-banshee-prime-directive-files-004",
    "name": "Banshee Prime Directive Files",
    "type": "MEDIA",
    "faction": "government",
    "rarity": "rare",
    "cost": 5,
    "effects": {
      "truthDelta": -3
    },
    "extId": "halloween",
    "text": "−3% Truth.",
    "flavor": "Try not to scream on camera."
  },
  {
    "id": "hallo-gov-seance-containment-files-005",
    "name": "Seance Containment Files",
    "type": "MEDIA",
    "faction": "government",
    "rarity": "rare",
    "cost": 5,
    "effects": {
      "truthDelta": -3
    },
    "extId": "halloween",
    "text": "−3% Truth.",
    "flavor": "Rated PG‑Paranoid."
  },
  {
    "id": "hallo-gov-raven-project-protocol-006",
    "name": "Raven Project Protocol",
    "type": "MEDIA",
    "faction": "government",
    "rarity": "rare",
    "cost": 5,
    "effects": {
      "truthDelta": -3
    },
    "extId": "halloween",
    "text": "−3% Truth.",
    "flavor": "Filed under ‘Seasonal Anomalies’."
  },
  {
    "id": "hallo-gov-moonlight-deep-cover-007",
    "name": "Moonlight Deep Cover",
    "type": "MEDIA",
    "faction": "government",
    "rarity": "rare",
    "cost": 5,
    "effects": {
      "truthDelta": -3
    },
    "extId": "halloween",
    "text": "−3% Truth.",
    "flavor": "Someone left the portal open again."
  },
  {
    "id": "hallo-truth-full-moon-pamphlet-initiative-001",
    "name": "Full Moon Pamphlet Initiative",
    "type": "MEDIA",
    "faction": "truth",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": 1
    },
    "extId": "halloween",
    "text": "+1% Truth.",
    "flavor": "Do not taunt the poltergeist."
  },
  {
    "id": "hallo-truth-trick-or-treat-press-release-incident-002",
    "name": "Trick-or-Treat Press Release Incident",
    "type": "MEDIA",
    "faction": "truth",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": 1
    },
    "extId": "halloween",
    "text": "+1% Truth.",
    "flavor": "Try not to scream on camera."
  },
  {
    "id": "hallo-truth-seance-scare-protocol-003",
    "name": "Seance Scare Protocol",
    "type": "ATTACK",
    "faction": "truth",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "halloween",
    "text": "Opponent −1 IP.",
    "flavor": "Try not to scream on camera."
  },
  {
    "id": "hallo-truth-banshee-shuffle-004",
    "name": "Banshee Shuffle",
    "type": "ATTACK",
    "faction": "truth",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "halloween",
    "text": "Opponent −1 IP.",
    "flavor": "They came for the candy, stayed for the cover‑up."
  },
  {
    "id": "hallo-truth-candy-corn-shuffle-protocol-005",
    "name": "Candy Corn Shuffle Protocol",
    "type": "MEDIA",
    "faction": "truth",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": 1
    },
    "extId": "halloween",
    "text": "+1% Truth.",
    "flavor": "Mind the ectoplasm."
  },
  {
    "id": "hallo-truth-scare-of-the-coven-006",
    "name": "Scare of the Coven",
    "type": "MEDIA",
    "faction": "truth",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": 1
    },
    "extId": "halloween",
    "text": "+1% Truth.",
    "flavor": "Mind the ectoplasm."
  },
  {
    "id": "hallo-truth-spooky-hayride-pamphlet-files-007",
    "name": "Spooky Hayride Pamphlet Files",
    "type": "ZONE",
    "faction": "truth",
    "rarity": "common",
    "cost": 4,
    "effects": {
      "pressureDelta": 1
    },
    "extId": "halloween",
    "text": "+1 Pressure in a chosen state.",
    "flavor": "The veil is thin tonight.",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "hallo-truth-ouija-shenanigans-files-008",
    "name": "Ouija Shenanigans Files",
    "type": "MEDIA",
    "faction": "truth",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": 1
    },
    "extId": "halloween",
    "text": "+1% Truth.",
    "flavor": "They came for the candy, stayed for the cover‑up."
  },
  {
    "id": "hallo-truth-black-cat-shenanigans-files-009",
    "name": "Black Cat Shenanigans Files",
    "type": "MEDIA",
    "faction": "truth",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": 1
    },
    "extId": "halloween",
    "text": "+1% Truth.",
    "flavor": "Licensed spooktacular."
  },
  {
    "id": "hallo-truth-candy-corn-rumor-010",
    "name": "Candy Corn Rumor",
    "type": "ATTACK",
    "faction": "truth",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "halloween",
    "text": "Opponent −1 IP.",
    "flavor": "Someone left the portal open again."
  },
  {
    "id": "hallo-truth-rumor-of-the-witch-011",
    "name": "Rumor of the Witch",
    "type": "ZONE",
    "faction": "truth",
    "rarity": "common",
    "cost": 4,
    "effects": {
      "pressureDelta": 1
    },
    "extId": "halloween",
    "text": "+1 Pressure in a chosen state.",
    "flavor": "Red eyes in the rear-view mirror.",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "hallo-truth-jack-o-lantern-press-release-protocol-012",
    "name": "Jack-o-Lantern Press Release Protocol",
    "type": "ZONE",
    "faction": "truth",
    "rarity": "common",
    "cost": 4,
    "effects": {
      "pressureDelta": 1
    },
    "extId": "halloween",
    "text": "+1 Pressure in a chosen state.",
    "flavor": "Sticky with sugar and secrets.",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "hallo-truth-witch-report-013",
    "name": "Witch Report",
    "type": "ATTACK",
    "faction": "truth",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "halloween",
    "text": "Opponent −1 IP.",
    "flavor": "Red eyes in the rear-view mirror."
  },
  {
    "id": "hallo-truth-ghost-brief-protocol-014",
    "name": "Ghost Brief Protocol",
    "type": "MEDIA",
    "faction": "truth",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": 1
    },
    "extId": "halloween",
    "text": "+1% Truth.",
    "flavor": "Someone left the portal open again."
  },
  {
    "id": "hallo-truth-raven-report-initiative-015",
    "name": "Raven Report Initiative",
    "type": "MEDIA",
    "faction": "truth",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": 1
    },
    "extId": "halloween",
    "text": "+1% Truth.",
    "flavor": "This is fine. Probably."
  },
  {
    "id": "hallo-truth-ghost-report-initiative-016",
    "name": "Ghost Report Initiative",
    "type": "MEDIA",
    "faction": "truth",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": 1
    },
    "extId": "halloween",
    "text": "+1% Truth.",
    "flavor": "They came for the candy, stayed for the cover‑up."
  },
  {
    "id": "hallo-truth-alert-of-the-ghost-017",
    "name": "Alert of the Ghost",
    "type": "MEDIA",
    "faction": "truth",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": 1
    },
    "extId": "halloween",
    "text": "+1% Truth.",
    "flavor": "We can neither confirm nor deny the howling."
  },
  {
    "id": "hallo-truth-zombie-press-release-incident-018",
    "name": "Zombie Press Release Incident",
    "type": "MEDIA",
    "faction": "truth",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": 1
    },
    "extId": "halloween",
    "text": "+1% Truth.",
    "flavor": "Licensed spooktacular."
  },
  {
    "id": "hallo-truth-cemetery-press-release-initiative-019",
    "name": "Cemetery Press Release Initiative",
    "type": "MEDIA",
    "faction": "truth",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": 1
    },
    "extId": "halloween",
    "text": "+1% Truth.",
    "flavor": "Rated PG‑Paranoid."
  },
  {
    "id": "hallo-truth-rally-of-the-dracula-020",
    "name": "Rally of the Dracula",
    "type": "MEDIA",
    "faction": "truth",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": 1
    },
    "extId": "halloween",
    "text": "+1% Truth.",
    "flavor": "Filed under ‘Seasonal Anomalies’."
  },
  {
    "id": "hallo-truth-seance-alert-incident-021",
    "name": "Seance Alert Incident",
    "type": "MEDIA",
    "faction": "truth",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": 1
    },
    "extId": "halloween",
    "text": "+1% Truth.",
    "flavor": "Smells like fog machine and fear."
  },
  {
    "id": "hallo-truth-cauldron-shuffle-protocol-022",
    "name": "Cauldron Shuffle Protocol",
    "type": "MEDIA",
    "faction": "truth",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": 1
    },
    "extId": "halloween",
    "text": "+1% Truth.",
    "flavor": "Sticky with sugar and secrets."
  },
  {
    "id": "hallo-truth-poltergeist-scare-files-023",
    "name": "Poltergeist Scare Files",
    "type": "ATTACK",
    "faction": "truth",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "halloween",
    "text": "Opponent −1 IP.",
    "flavor": "Try not to scream on camera."
  },
  {
    "id": "hallo-truth-coven-shenanigans-024",
    "name": "Coven Shenanigans",
    "type": "ATTACK",
    "faction": "truth",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "halloween",
    "text": "Opponent −1 IP.",
    "flavor": "Red eyes in the rear-view mirror."
  },
  {
    "id": "hallo-truth-whispers-of-the-skeleton-025",
    "name": "Whispers of the Skeleton",
    "type": "ZONE",
    "faction": "truth",
    "rarity": "common",
    "cost": 4,
    "effects": {
      "pressureDelta": 1
    },
    "extId": "halloween",
    "text": "+1 Pressure in a chosen state.",
    "flavor": "Do not taunt the poltergeist.",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "hallo-truth-midnight-shuffle-026",
    "name": "Midnight Shuffle",
    "type": "ZONE",
    "faction": "truth",
    "rarity": "common",
    "cost": 4,
    "effects": {
      "pressureDelta": 1
    },
    "extId": "halloween",
    "text": "+1 Pressure in a chosen state.",
    "flavor": "Sticky with sugar and secrets.",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "hallo-truth-trick-or-treat-brief-incident-027",
    "name": "Trick-or-Treat Brief Incident",
    "type": "ATTACK",
    "faction": "truth",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "halloween",
    "text": "Opponent −1 IP.",
    "flavor": "Whispers from the cornfield."
  },
  {
    "id": "hallo-truth-crypt-press-release-protocol-028",
    "name": "Crypt Press Release Protocol",
    "type": "MEDIA",
    "faction": "truth",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": 1
    },
    "extId": "halloween",
    "text": "+1% Truth.",
    "flavor": "We can neither confirm nor deny the howling."
  },
  {
    "id": "hallo-truth-raven-press-release-029",
    "name": "Raven Press Release",
    "type": "ZONE",
    "faction": "truth",
    "rarity": "common",
    "cost": 4,
    "effects": {
      "pressureDelta": 1
    },
    "extId": "halloween",
    "text": "+1 Pressure in a chosen state.",
    "flavor": "Try not to scream on camera.",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "hallo-truth-witch-shuffle-incident-030",
    "name": "Witch Shuffle Incident",
    "type": "MEDIA",
    "faction": "truth",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": 1
    },
    "extId": "halloween",
    "text": "+1% Truth.",
    "flavor": "Approved by the Council of Shadows."
  },
  {
    "id": "hallo-truth-ghoul-pamphlet-initiative-031",
    "name": "Ghoul Pamphlet Initiative",
    "type": "ZONE",
    "faction": "truth",
    "rarity": "common",
    "cost": 4,
    "effects": {
      "pressureDelta": 1
    },
    "extId": "halloween",
    "text": "+1 Pressure in a chosen state.",
    "flavor": "The crypt Wi‑Fi is excellent.",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "hallo-truth-crypt-pamphlet-032",
    "name": "Crypt Pamphlet",
    "type": "ATTACK",
    "faction": "truth",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "halloween",
    "text": "Opponent −1 IP.",
    "flavor": "All treats, suspicious tricks."
  },
  {
    "id": "hallo-truth-headless-horseman-rally-incident-033",
    "name": "Headless Horseman Rally Incident",
    "type": "MEDIA",
    "faction": "truth",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": 1
    },
    "extId": "halloween",
    "text": "+1% Truth.",
    "flavor": "Red eyes in the rear-view mirror."
  },
  {
    "id": "hallo-truth-headless-horseman-brief-034",
    "name": "Headless Horseman Brief",
    "type": "ATTACK",
    "faction": "truth",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "halloween",
    "text": "Opponent −1 IP.",
    "flavor": "Smells like fog machine and fear."
  },
  {
    "id": "hallo-truth-jack-o-lantern-shuffle-incident-035",
    "name": "Jack-o-Lantern Shuffle Incident",
    "type": "MEDIA",
    "faction": "truth",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": 1
    },
    "extId": "halloween",
    "text": "+1% Truth.",
    "flavor": "Whispers from the cornfield."
  },
  {
    "id": "hallo-truth-cobweb-alert-protocol-036",
    "name": "Cobweb Alert Protocol",
    "type": "MEDIA",
    "faction": "truth",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": 1
    },
    "extId": "halloween",
    "text": "+1% Truth.",
    "flavor": "Someone left the portal open again."
  },
  {
    "id": "hallo-truth-rally-of-the-cauldron-037",
    "name": "Rally of the Cauldron",
    "type": "MEDIA",
    "faction": "truth",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": 1
    },
    "extId": "halloween",
    "text": "+1% Truth.",
    "flavor": "Mind the ectoplasm."
  },
  {
    "id": "hallo-truth-scare-of-the-zombie-038",
    "name": "Scare of the Zombie",
    "type": "MEDIA",
    "faction": "truth",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": 1
    },
    "extId": "halloween",
    "text": "+1% Truth.",
    "flavor": "Batteries not included."
  },
  {
    "id": "hallo-truth-haunted-mansion-flyer-protocol-039",
    "name": "Haunted Mansion Flyer Protocol",
    "type": "ZONE",
    "faction": "truth",
    "rarity": "common",
    "cost": 4,
    "effects": {
      "pressureDelta": 1
    },
    "extId": "halloween",
    "text": "+1 Pressure in a chosen state.",
    "flavor": "Red eyes in the rear-view mirror.",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "hallo-truth-shuffle-of-the-spooky-hayride-040",
    "name": "Shuffle of the Spooky Hayride",
    "type": "ATTACK",
    "faction": "truth",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "halloween",
    "text": "Opponent −1 IP.",
    "flavor": "Haunting sponsored by a totally normal NGO."
  },
  {
    "id": "hallo-truth-cauldron-brief-files-041",
    "name": "Cauldron Brief Files",
    "type": "MEDIA",
    "faction": "truth",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": 1
    },
    "extId": "halloween",
    "text": "+1% Truth.",
    "flavor": "Smells like fog machine and fear."
  },
  {
    "id": "hallo-truth-moonlight-report-042",
    "name": "Moonlight Report",
    "type": "ATTACK",
    "faction": "truth",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "halloween",
    "text": "Opponent −1 IP.",
    "flavor": "Try not to scream on camera."
  },
  {
    "id": "hallo-truth-haunted-mansion-alert-initiative-043",
    "name": "Haunted Mansion Alert Initiative",
    "type": "ATTACK",
    "faction": "truth",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "halloween",
    "text": "Opponent −1 IP.",
    "flavor": "Mind the ectoplasm."
  },
  {
    "id": "hallo-truth-banshee-shuffle-protocol-044",
    "name": "Banshee Shuffle Protocol",
    "type": "ZONE",
    "faction": "truth",
    "rarity": "common",
    "cost": 4,
    "effects": {
      "pressureDelta": 1
    },
    "extId": "halloween",
    "text": "+1 Pressure in a chosen state.",
    "flavor": "We can neither confirm nor deny the howling.",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "hallo-truth-ouija-rally-initiative-045",
    "name": "Ouija Rally Initiative",
    "type": "ATTACK",
    "faction": "truth",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "halloween",
    "text": "Opponent −1 IP.",
    "flavor": "All treats, suspicious tricks."
  },
  {
    "id": "hallo-truth-banshee-shenanigans-files-046",
    "name": "Banshee Shenanigans Files",
    "type": "MEDIA",
    "faction": "truth",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": 1
    },
    "extId": "halloween",
    "text": "+1% Truth.",
    "flavor": "They came for the candy, stayed for the cover‑up."
  },
  {
    "id": "hallo-truth-frankenstein-brief-incident-047",
    "name": "Frankenstein Brief Incident",
    "type": "ZONE",
    "faction": "truth",
    "rarity": "common",
    "cost": 4,
    "effects": {
      "pressureDelta": 1
    },
    "extId": "halloween",
    "text": "+1 Pressure in a chosen state.",
    "flavor": "Licensed spooktacular.",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "hallo-truth-poltergeist-whispers-files-048",
    "name": "Poltergeist Whispers Files",
    "type": "MEDIA",
    "faction": "truth",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": 1
    },
    "extId": "halloween",
    "text": "+1% Truth.",
    "flavor": "Keep garlic handy."
  },
  {
    "id": "hallo-truth-candy-corn-shuffle-incident-049",
    "name": "Candy Corn Shuffle Incident",
    "type": "MEDIA",
    "faction": "truth",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": 1
    },
    "extId": "halloween",
    "text": "+1% Truth.",
    "flavor": "This is fine. Probably."
  },
  {
    "id": "hallo-truth-spider-shenanigans-protocol-050",
    "name": "Spider Shenanigans Protocol",
    "type": "ZONE",
    "faction": "truth",
    "rarity": "common",
    "cost": 4,
    "effects": {
      "pressureDelta": 1
    },
    "extId": "halloween",
    "text": "+1 Pressure in a chosen state.",
    "flavor": "They came for the candy, stayed for the cover‑up.",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "hallo-truth-haunted-press-release-051",
    "name": "Haunted Press Release",
    "type": "MEDIA",
    "faction": "truth",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": 1
    },
    "extId": "halloween",
    "text": "+1% Truth.",
    "flavor": "Filed under ‘Seasonal Anomalies’."
  },
  {
    "id": "hallo-truth-ouija-flyer-052",
    "name": "Ouija Flyer",
    "type": "MEDIA",
    "faction": "truth",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": 1
    },
    "extId": "halloween",
    "text": "+1% Truth.",
    "flavor": "Batteries not included."
  },
  {
    "id": "hallo-truth-shuffle-of-the-dracula-053",
    "name": "Shuffle of the Dracula",
    "type": "ATTACK",
    "faction": "truth",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "halloween",
    "text": "Opponent −1 IP.",
    "flavor": "Whispers from the cornfield."
  },
  {
    "id": "hallo-truth-ghost-report-protocol-054",
    "name": "Ghost Report Protocol",
    "type": "ATTACK",
    "faction": "truth",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "halloween",
    "text": "Opponent −1 IP.",
    "flavor": "We can neither confirm nor deny the howling."
  },
  {
    "id": "hallo-truth-pamphlet-of-the-raven-055",
    "name": "Pamphlet of the Raven",
    "type": "MEDIA",
    "faction": "truth",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": 1
    },
    "extId": "halloween",
    "text": "+1% Truth.",
    "flavor": "Haunting sponsored by a totally normal NGO."
  },
  {
    "id": "hallo-truth-seance-shuffle-incident-056",
    "name": "Seance Shuffle Incident",
    "type": "ATTACK",
    "faction": "truth",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "halloween",
    "text": "Opponent −1 IP.",
    "flavor": "Red eyes in the rear-view mirror."
  },
  {
    "id": "hallo-truth-pumpkin-rally-initiative-057",
    "name": "Pumpkin Rally Initiative",
    "type": "MEDIA",
    "faction": "truth",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": 1
    },
    "extId": "halloween",
    "text": "+1% Truth.",
    "flavor": "Keep garlic handy."
  },
  {
    "id": "hallo-truth-black-cat-press-release-protocol-058",
    "name": "Black Cat Press Release Protocol",
    "type": "MEDIA",
    "faction": "truth",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": 1
    },
    "extId": "halloween",
    "text": "+1% Truth.",
    "flavor": "Red eyes in the rear-view mirror."
  },
  {
    "id": "hallo-truth-cemetery-rumor-initiative-059",
    "name": "Cemetery Rumor Initiative",
    "type": "MEDIA",
    "faction": "truth",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": 1
    },
    "extId": "halloween",
    "text": "+1% Truth.",
    "flavor": "Try not to scream on camera."
  },
  {
    "id": "hallo-truth-midnight-flyer-protocol-060",
    "name": "Midnight Flyer Protocol",
    "type": "ATTACK",
    "faction": "truth",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "halloween",
    "text": "Opponent −1 IP.",
    "flavor": "Red eyes in the rear-view mirror."
  },
  {
    "id": "hallo-truth-ghost-press-release-files-061",
    "name": "Ghost Press Release Files",
    "type": "MEDIA",
    "faction": "truth",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": 1
    },
    "extId": "halloween",
    "text": "+1% Truth.",
    "flavor": "Rated PG‑Paranoid."
  },
  {
    "id": "hallo-truth-pamphlet-of-the-ouija-062",
    "name": "Pamphlet of the Ouija",
    "type": "ZONE",
    "faction": "truth",
    "rarity": "common",
    "cost": 4,
    "effects": {
      "pressureDelta": 1
    },
    "extId": "halloween",
    "text": "+1 Pressure in a chosen state.",
    "flavor": "Filed under ‘Seasonal Anomalies’.",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "hallo-truth-frankenstein-pamphlet-063",
    "name": "Frankenstein Pamphlet",
    "type": "ZONE",
    "faction": "truth",
    "rarity": "common",
    "cost": 4,
    "effects": {
      "pressureDelta": 1
    },
    "extId": "halloween",
    "text": "+1 Pressure in a chosen state.",
    "flavor": "Whispers from the cornfield.",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "hallo-truth-ectoplasm-whispers-incident-064",
    "name": "Ectoplasm Whispers Incident",
    "type": "ATTACK",
    "faction": "truth",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "halloween",
    "text": "Opponent −1 IP.",
    "flavor": "Keep garlic handy."
  },
  {
    "id": "hallo-truth-crypt-flyer-initiative-065",
    "name": "Crypt Flyer Initiative",
    "type": "MEDIA",
    "faction": "truth",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": 1
    },
    "extId": "halloween",
    "text": "+1% Truth.",
    "flavor": "Do not feed after midnight."
  },
  {
    "id": "hallo-truth-full-moon-brief-incident-066",
    "name": "Full Moon Brief Incident",
    "type": "ZONE",
    "faction": "truth",
    "rarity": "common",
    "cost": 4,
    "effects": {
      "pressureDelta": 1
    },
    "extId": "halloween",
    "text": "+1 Pressure in a chosen state.",
    "flavor": "Red eyes in the rear-view mirror.",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "hallo-truth-spooky-hayride-rally-protocol-067",
    "name": "Spooky Hayride Rally Protocol",
    "type": "MEDIA",
    "faction": "truth",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": 1
    },
    "extId": "halloween",
    "text": "+1% Truth.",
    "flavor": "Someone left the portal open again."
  },
  {
    "id": "hallo-truth-alert-of-the-skeleton-068",
    "name": "Alert of the Skeleton",
    "type": "MEDIA",
    "faction": "truth",
    "rarity": "common",
    "cost": 3,
    "effects": {
      "truthDelta": 1
    },
    "extId": "halloween",
    "text": "+1% Truth.",
    "flavor": "Mind the ectoplasm."
  },
  {
    "id": "hallo-truth-headless-horseman-whispers-protocol-069",
    "name": "Headless Horseman Whispers Protocol",
    "type": "ATTACK",
    "faction": "truth",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "halloween",
    "text": "Opponent −1 IP.",
    "flavor": "The crypt Wi‑Fi is excellent."
  },
  {
    "id": "hallo-truth-candy-corn-press-release-initiative-070",
    "name": "Candy Corn Press Release Initiative",
    "type": "ATTACK",
    "faction": "truth",
    "rarity": "common",
    "cost": 2,
    "effects": {
      "ipDelta": {
        "opponent": 1
      }
    },
    "extId": "halloween",
    "text": "Opponent −1 IP.",
    "flavor": "Filed under ‘Seasonal Anomalies’."
  },
  {
    "id": "hallo-truth-graveyard-murmur-network-protocol-001",
    "name": "Graveyard Murmur Network Protocol",
    "type": "ATTACK",
    "faction": "truth",
    "rarity": "uncommon",
    "cost": 3,
    "effects": {
      "ipDelta": {
        "opponent": 2
      }
    },
    "extId": "halloween",
    "text": "Opponent −2 IP.",
    "flavor": "Keep garlic handy."
  },
  {
    "id": "hallo-truth-poltergeist-broadcast-files-002",
    "name": "Poltergeist Broadcast Files",
    "type": "ATTACK",
    "faction": "truth",
    "rarity": "uncommon",
    "cost": 3,
    "effects": {
      "ipDelta": {
        "opponent": 2
      }
    },
    "extId": "halloween",
    "text": "Opponent −2 IP.",
    "flavor": "Whispers from the cornfield."
  },
  {
    "id": "hallo-truth-haunted-mansion-operation-003",
    "name": "Haunted Mansion Operation",
    "type": "ATTACK",
    "faction": "truth",
    "rarity": "uncommon",
    "cost": 3,
    "effects": {
      "ipDelta": {
        "opponent": 2
      }
    },
    "extId": "halloween",
    "text": "Opponent −2 IP.",
    "flavor": "Licensed spooktacular."
  },
  {
    "id": "hallo-truth-spider-expedition-incident-004",
    "name": "Spider Expedition Incident",
    "type": "ATTACK",
    "faction": "truth",
    "rarity": "uncommon",
    "cost": 3,
    "effects": {
      "ipDelta": {
        "opponent": 2
      }
    },
    "extId": "halloween",
    "text": "Opponent −2 IP.",
    "flavor": "Batteries not included."
  },
  {
    "id": "hallo-truth-haunted-mansion-expedition-protocol-005",
    "name": "Haunted Mansion Expedition Protocol",
    "type": "MEDIA",
    "faction": "truth",
    "rarity": "uncommon",
    "cost": 4,
    "effects": {
      "truthDelta": 2
    },
    "extId": "halloween",
    "text": "+2% Truth.",
    "flavor": "Bring a flashlight and plausible deniability."
  },
  {
    "id": "hallo-truth-seance-sweep-006",
    "name": "Seance Sweep",
    "type": "MEDIA",
    "faction": "truth",
    "rarity": "uncommon",
    "cost": 4,
    "effects": {
      "truthDelta": 2
    },
    "extId": "halloween",
    "text": "+2% Truth.",
    "flavor": "The crypt Wi‑Fi is excellent."
  },
  {
    "id": "hallo-truth-trick-or-treat-ploy-007",
    "name": "Trick-or-Treat Ploy",
    "type": "MEDIA",
    "faction": "truth",
    "rarity": "uncommon",
    "cost": 4,
    "effects": {
      "truthDelta": 2
    },
    "extId": "halloween",
    "text": "+2% Truth.",
    "flavor": "Batteries not included."
  },
  {
    "id": "hallo-truth-graveyard-gambit-protocol-008",
    "name": "Graveyard Gambit Protocol",
    "type": "ATTACK",
    "faction": "truth",
    "rarity": "uncommon",
    "cost": 3,
    "effects": {
      "ipDelta": {
        "opponent": 2
      }
    },
    "extId": "halloween",
    "text": "Opponent −2 IP.",
    "flavor": "Bring a flashlight and plausible deniability."
  },
  {
    "id": "hallo-truth-cobweb-ploy-incident-009",
    "name": "Cobweb Ploy Incident",
    "type": "MEDIA",
    "faction": "truth",
    "rarity": "uncommon",
    "cost": 4,
    "effects": {
      "truthDelta": 2
    },
    "extId": "halloween",
    "text": "+2% Truth.",
    "flavor": "Do not feed after midnight."
  },
  {
    "id": "hallo-truth-cauldron-gambit-protocol-010",
    "name": "Cauldron Gambit Protocol",
    "type": "ZONE",
    "faction": "truth",
    "rarity": "uncommon",
    "cost": 5,
    "effects": {
      "pressureDelta": 2
    },
    "extId": "halloween",
    "text": "+2 Pressure in a chosen state.",
    "flavor": "Mind the ectoplasm.",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "hallo-truth-witch-operation-files-011",
    "name": "Witch Operation Files",
    "type": "ATTACK",
    "faction": "truth",
    "rarity": "uncommon",
    "cost": 3,
    "effects": {
      "ipDelta": {
        "opponent": 2
      }
    },
    "extId": "halloween",
    "text": "Opponent −2 IP.",
    "flavor": "The crypt Wi‑Fi is excellent."
  },
  {
    "id": "hallo-truth-seance-sweep-012",
    "name": "Seance Sweep",
    "type": "ZONE",
    "faction": "truth",
    "rarity": "uncommon",
    "cost": 5,
    "effects": {
      "pressureDelta": 2
    },
    "extId": "halloween",
    "text": "+2 Pressure in a chosen state.",
    "flavor": "Whispers from the cornfield.",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "hallo-truth-zombie-murmur-network-013",
    "name": "Zombie Murmur Network",
    "type": "MEDIA",
    "faction": "truth",
    "rarity": "uncommon",
    "cost": 4,
    "effects": {
      "truthDelta": 2
    },
    "extId": "halloween",
    "text": "+2% Truth.",
    "flavor": "Licensed spooktacular."
  },
  {
    "id": "hallo-truth-moonlight-operation-initiative-014",
    "name": "Moonlight Operation Initiative",
    "type": "ZONE",
    "faction": "truth",
    "rarity": "uncommon",
    "cost": 5,
    "effects": {
      "pressureDelta": 2
    },
    "extId": "halloween",
    "text": "+2 Pressure in a chosen state.",
    "flavor": "Rated PG‑Paranoid.",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "hallo-truth-jack-o-lantern-broadcast-initiative-015",
    "name": "Jack-o-Lantern Broadcast Initiative",
    "type": "MEDIA",
    "faction": "truth",
    "rarity": "uncommon",
    "cost": 4,
    "effects": {
      "truthDelta": 2
    },
    "extId": "halloween",
    "text": "+2% Truth.",
    "flavor": "They came for the candy, stayed for the cover‑up."
  },
  {
    "id": "hallo-truth-ghoul-operation-initiative-016",
    "name": "Ghoul Operation Initiative",
    "type": "MEDIA",
    "faction": "truth",
    "rarity": "uncommon",
    "cost": 4,
    "effects": {
      "truthDelta": 2
    },
    "extId": "halloween",
    "text": "+2% Truth.",
    "flavor": "Keep garlic handy."
  },
  {
    "id": "hallo-truth-operation-of-the-mummy-017",
    "name": "Operation of the Mummy",
    "type": "ATTACK",
    "faction": "truth",
    "rarity": "uncommon",
    "cost": 3,
    "effects": {
      "ipDelta": {
        "opponent": 2
      }
    },
    "extId": "halloween",
    "text": "Opponent −2 IP.",
    "flavor": "Rated PG‑Paranoid."
  },
  {
    "id": "hallo-truth-poltergeist-murmur-network-incident-018",
    "name": "Poltergeist Murmur Network Incident",
    "type": "MEDIA",
    "faction": "truth",
    "rarity": "uncommon",
    "cost": 4,
    "effects": {
      "truthDelta": 2
    },
    "extId": "halloween",
    "text": "+2% Truth.",
    "flavor": "Someone left the portal open again."
  },
  {
    "id": "hallo-truth-cobweb-ploy-initiative-019",
    "name": "Cobweb Ploy Initiative",
    "type": "MEDIA",
    "faction": "truth",
    "rarity": "uncommon",
    "cost": 4,
    "effects": {
      "truthDelta": 2
    },
    "extId": "halloween",
    "text": "+2% Truth.",
    "flavor": "This is fine. Probably."
  },
  {
    "id": "hallo-truth-headless-horseman-expedition-files-020",
    "name": "Headless Horseman Expedition Files",
    "type": "MEDIA",
    "faction": "truth",
    "rarity": "uncommon",
    "cost": 4,
    "effects": {
      "truthDelta": 2
    },
    "extId": "halloween",
    "text": "+2% Truth.",
    "flavor": "Filed under ‘Seasonal Anomalies’."
  },
  {
    "id": "hallo-truth-mummy-sanction-001",
    "name": "Mummy Sanction",
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
    "extId": "halloween",
    "text": "Opponent −3 IP, discard 1.",
    "flavor": "Do not taunt the poltergeist."
  },
  {
    "id": "hallo-truth-frankenstein-project-incident-002",
    "name": "Frankenstein Project Incident",
    "type": "MEDIA",
    "faction": "truth",
    "rarity": "rare",
    "cost": 5,
    "effects": {
      "truthDelta": 3
    },
    "extId": "halloween",
    "text": "+3% Truth.",
    "flavor": "This is fine. Probably."
  },
  {
    "id": "hallo-truth-zombie-deep-cover-files-003",
    "name": "Zombie Deep Cover Files",
    "type": "MEDIA",
    "faction": "truth",
    "rarity": "rare",
    "cost": 5,
    "effects": {
      "truthDelta": 3
    },
    "extId": "halloween",
    "text": "+3% Truth.",
    "flavor": "Whispers from the cornfield."
  },
  {
    "id": "hallo-truth-cauldron-grand-ritual-protocol-004",
    "name": "Cauldron Grand Ritual Protocol",
    "type": "ZONE",
    "faction": "truth",
    "rarity": "rare",
    "cost": 6,
    "effects": {
      "pressureDelta": 3
    },
    "extId": "halloween",
    "text": "+3 Pressure in a chosen state.",
    "flavor": "‘It was just the wind,’ said the intern.",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "hallo-truth-spooky-hayride-revelation-005",
    "name": "Spooky Hayride Revelation",
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
    "extId": "halloween",
    "text": "Opponent −3 IP, discard 1.",
    "flavor": "Try not to scream on camera."
  },
  {
    "id": "hallo-truth-ghoul-project-incident-006",
    "name": "Ghoul Project Incident",
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
    "extId": "halloween",
    "text": "Opponent −3 IP, discard 1.",
    "flavor": "Red eyes in the rear-view mirror."
  },
  {
    "id": "hallo-truth-cemetery-deep-cover-protocol-007",
    "name": "Cemetery Deep Cover Protocol",
    "type": "MEDIA",
    "faction": "truth",
    "rarity": "rare",
    "cost": 5,
    "effects": {
      "truthDelta": 3
    },
    "extId": "halloween",
    "text": "+3% Truth.",
    "flavor": "Do not feed after midnight."
  },
  {
    "id": "hallo-gov-operation-pumpkin-spice-legendary",
    "name": "Operation Pumpkin Spice",
    "type": "MEDIA",
    "faction": "government",
    "rarity": "legendary",
    "cost": 6,
    "effects": {
      "truthDelta": -4
    },
    "extId": "halloween",
    "text": "−4% Truth.",
    "flavor": "Approved by the Starbucks Council of Shadows."
  },
  {
    "id": "hallo-gov-containment-protocol-dracula-legendary",
    "name": "Containment Protocol: Dracula",
    "type": "MEDIA",
    "faction": "government",
    "rarity": "rare",
    "cost": 5,
    "effects": {
      "truthDelta": -3
    },
    "extId": "halloween",
    "text": "−3% Truth.",
    "flavor": "Stake, garlic, plausible deniability."
  },
  {
    "id": "hallo-gov-the-skeleton-army-rises-legendary",
    "name": "The Skeleton Army Rises",
    "type": "ZONE",
    "faction": "government",
    "rarity": "rare",
    "cost": 6,
    "effects": {
      "pressureDelta": 3
    },
    "extId": "halloween",
    "text": "+3 Pressure in a chosen state.",
    "flavor": "From the boneyard to the ballot box.",
    "target": {
      "scope": "state",
      "count": 1
    }
  },
  {
    "id": "hallo-truth-elvira-mistress-of-the-leaks-legendary",
    "name": "Elvira, Mistress of the Leaks",
    "type": "MEDIA",
    "faction": "truth",
    "rarity": "legendary",
    "cost": 6,
    "effects": {
      "truthDelta": 4
    },
    "extId": "halloween",
    "text": "+4% Truth.",
    "flavor": "Late-night camp, early-morning chaos."
  },
  {
    "id": "hallo-truth-bat-boy-s-rebellion-legendary",
    "name": "Bat Boy’s Rebellion",
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
    "extId": "halloween",
    "text": "Opponent −4 IP, discard 2.",
    "flavor": "Finally escaped the tabloids — and he’s pissed."
  },
  {
    "id": "hallo-truth-candy-apocalypse-legendary",
    "name": "Candy Apocalypse",
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
    "extId": "halloween",
    "text": "Opponent −3 IP, discard 1.",
    "flavor": "Too much sugar unleashes the truth."
  }
];

export default cards;
