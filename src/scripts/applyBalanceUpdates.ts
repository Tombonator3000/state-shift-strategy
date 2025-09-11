// Comprehensive card balance update script
import fs from 'fs';
import path from 'path';

// Parse balance updates from user input
const balanceUpdates = `media_001 | Cable News Spin :: cost=7 ; rarity=uncommon
media_002 | Leaked Memo :: cost=7 ; rarity=uncommon
media_003 | Anonymous Blog Post :: cost=7 ; rarity=uncommon
media_004 | Late Night Talk Show :: cost=7 ; rarity=uncommon
media_005 | Press Conference :: cost=7 ; rarity=uncommon
media_006 | Conspiracy Podcast :: cost=7 ; rarity=uncommon
media_007 | Photoshop Hoax :: cost=7 ; rarity=uncommon
media_008 | Tabloid Headline :: cost=7 ; rarity=uncommon
media_009 | Censored Report :: cost=7 ; rarity=uncommon
media_010 | YouTube Rant :: cost=7 ; rarity=uncommon
media_011 | Blurry Bigfoot Photo :: cost=7 ; rarity=uncommon
media_012 | Weather Balloon Excuse :: cost=7 ; rarity=uncommon
media_013 | Fact Check Article :: cost=7 ; rarity=uncommon
media_014 | Twitter Whistleblower :: cost=7 ; rarity=uncommon
media_015 | Government PSA :: cost=7 ; rarity=uncommon
media_016 | Meme Campaign :: cost=7 ; rarity=uncommon
media_017 | Documentary Expose :: cost=7 ; rarity=uncommon
media_018 | Expert Testimony :: cost=7 ; rarity=uncommon
media_019 | Leaked Audio :: cost=7 ; rarity=uncommon
media_020 | Crisis Actor Claims :: cost=7 ; rarity=uncommon
media_021 | Staged Interview :: cost=7 ; rarity=uncommon
media_022 | Whistleblower Protection :: cost=7 ; rarity=uncommon
media_023 | Conspiracy Theory Label :: cost=7 ; rarity=uncommon
media_024 | Alternative News Site :: cost=7 ; rarity=uncommon
media_025 | AI Deepfake Denial :: cost=7 ; rarity=uncommon
media_026 | Forum Post Evidence :: cost=7 ; rarity=uncommon
media_027 | Celebrity Endorsement :: cost=7 ; rarity=uncommon
media_028 | Classified Leak :: cost=7 ; rarity=uncommon
media_029 | Social Media Ban :: cost=7 ; rarity=uncommon
media_030 | Streisand Effect :: cost=7 ; rarity=uncommon
media_031 | Official Statement :: cost=7 ; rarity=uncommon
media_032 | Investigative Report :: cost=7 ; rarity=uncommon
media_033 | Damage Control :: cost=7 ; rarity=uncommon
media_034 | Data Dump :: cost=7 ; rarity=uncommon
media_035 | Think Tank Study :: cost=7 ; rarity=uncommon
media_036 | Citizen Journalist :: cost=7 ; rarity=uncommon
media_037 | Gaslighting Campaign :: cost=7 ; rarity=uncommon
media_038 | FOIA Request :: cost=7 ; rarity=uncommon
media_039 | Planted Story :: cost=7 ; rarity=uncommon
media_040 | Anonymous Tip :: cost=7 ; rarity=uncommon
media_041 | Viral Video :: cost=7 ; rarity=uncommon
media_042 | Memory Hole :: cost=7 ; rarity=uncommon
media_043 | Secret Email Dump :: cost=9 ; rarity=rare
media_044 | 24/7 News Cycle :: cost=9 ; rarity=rare
media_045 | Coordinated Blackout :: cost=9 ; rarity=rare
media_046 | Wikileaks Release :: cost=7 ; rarity=rare
media_047 | Operation Mockingbird :: cost=7 ; rarity=rare
media_048 | Banned Documentary :: cost=7 ; rarity=rare
media_049 | Astroturfing Campaign :: cost=7 ; rarity=rare
media_050 | Insider Confession :: cost=7 ; rarity=rare
media_051 | Information Warfare :: cost=7 ; rarity=rare
media_052 | Truth Bomb :: cost=7 ; rarity=rare
media_053 | Controlled Opposition :: cost=7 ; rarity=rare
media_054 | Deathbed Confession :: cost=7 ; rarity=rare
media_055 | Viral Hashtag Campaign :: cost=11 ; rarity=legendary
media_056 | Deepfake Broadcast :: cost=11 ; rarity=legendary
media_057 | Mass Awakening Event :: cost=11 ; rarity=legendary
media_058 | Total Media Control :: cost=11 ; rarity=legendary
media_059 | The Pentagon Papers 2.0 :: cost=11 ; rarity=legendary
media_060 | Moon Landing Re-Debate :: cost=15 ; rarity=legendary
zone_001 | Black Helicopter Patrol :: cost=2 ; rarity=common
zone_002 | Cornfield Abduction :: cost=2 ; rarity=common
zone_003 | Haunted Walmart :: cost=2 ; rarity=common
zone_004 | FEMA Camp Setup :: cost=2 ; rarity=common
zone_005 | Chemtrail Grid :: cost=2 ; rarity=common
zone_006 | Cell Tower Installation :: cost=2 ; rarity=common
zone_007 | Secret Underground Base :: cost=2 ; rarity=common
zone_008 | Surveillance Network :: cost=2 ; rarity=common
zone_009 | Crop Circle Appearance :: cost=2 ; rarity=common
zone_010 | Mysterious Military Exercise :: cost=2 ; rarity=common
zone_011 | Bigfoot Sighting :: cost=2 ; rarity=common
zone_012 | Weather Station Anomaly :: cost=2 ; rarity=common
zone_013 | Abandoned Government Facility :: cost=2 ; rarity=common
zone_014 | UFO Landing Site :: cost=2 ; rarity=common
zone_015 | Cattle Mutilation :: cost=2 ; rarity=common
zone_016 | Illuminati Lodge :: cost=2 ; rarity=common
zone_017 | Masonic Temple :: cost=2 ; rarity=common
zone_018 | Shadow Figure Sightings :: cost=2 ; rarity=common
zone_019 | Fracking Operation :: cost=2 ; rarity=common
zone_020 | Bohemian Grove Gathering :: cost=2 ; rarity=common
zone_021 | GPS Jamming Zone :: cost=2 ; rarity=common
zone_022 | Vaccine Distribution Center :: cost=2 ; rarity=common
zone_023 | Data Collection Hub :: cost=2 ; rarity=common
zone_024 | Homeless Encampment Raid :: cost=2 ; rarity=common
zone_025 | Tesla Coil Installation :: cost=2 ; rarity=common
zone_026 | Pyramid Discovery :: cost=2 ; rarity=common
zone_027 | Mind Control Testing :: cost=2 ; rarity=common
zone_028 | Fluoride Plant :: cost=2 ; rarity=common
zone_029 | Smart City Pilot :: cost=2 ; rarity=common
zone_030 | Drone Surveillance :: cost=2 ; rarity=common
zone_031 | Seed Bank Facility :: cost=2 ; rarity=common
zone_032 | Quantum Computer Lab :: cost=2 ; rarity=common
zone_033 | Alien Artifact Storage :: cost=2 ; rarity=common
zone_034 | Electromagnetic Pulse Test :: cost=2 ; rarity=common
zone_035 | Genetic Engineering Lab :: cost=2 ; rarity=common
zone_036 | Time Travel Experiment :: cost=2 ; rarity=common
zone_037 | Interdimensional Portal :: cost=2 ; rarity=common
zone_038 | Reptilian Shapeshifter Base :: cost=2 ; rarity=common
zone_039 | Hollow Earth Entrance :: cost=2 ; rarity=common
zone_040 | Atlantis Ruins :: cost=2 ; rarity=common
zone_041 | MIB Headquarters :: cost=2 ; rarity=common
zone_042 | Phantom Social Security :: cost=2 ; rarity=common
zone_043 | Area 51 Security Perimeter :: cost=3 ; rarity=uncommon
zone_044 | Denver Airport Secrets :: cost=3 ; rarity=uncommon
zone_045 | Bermuda Triangle Portal :: cost=3 ; rarity=uncommon
zone_046 | HAARP Weather Control :: cost=3 ; rarity=uncommon
zone_047 | Dulce Base Operations :: cost=3 ; rarity=uncommon
zone_048 | CERN Dimension Breach :: cost=4 ; rarity=uncommon
zone_049 | Mount Rushmore Bunker :: cost=3 ; rarity=uncommon
zone_050 | Cheyenne Mountain Complex :: cost=3 ; rarity=uncommon
zone_051 | Project Blue Beam Array :: cost=4 ; rarity=uncommon
zone_052 | Antarctic Research Station :: cost=4 ; rarity=uncommon
zone_053 | Silicon Valley Mind Lab :: cost=3 ; rarity=uncommon
zone_054 | Yellowstone Caldera Tap :: cost=3 ; rarity=uncommon
zone_055 | Underground Bunker Network :: cost=3 ; rarity=rare
zone_056 | Global Surveillance Grid :: cost=2 ; rarity=rare
zone_057 | Dimensional Anchor Point :: cost=2 ; rarity=rare
zone_058 | Reptilian Command Center :: cost=2 ; rarity=rare
zone_059 | New World Order Staging :: cost=8 ; rarity=legendary
zone_060 | The Lost City Under Denver Airport :: cost=2 ; rarity=legendary
zone_061 | Hollow Earth Entrance :: cost=2 ; rarity=legendary
attack_002 | Internet Blackout :: cost=3 ; rarity=common
attack_004 | Hacked Servers :: cost=3 ; rarity=common
attack_006 | Data Leak :: cost=3 ; rarity=common
attack_007 | FBI Raid :: cost=7 ; rarity=common
attack_009 | Economic Sanctions :: cost=3 ; rarity=common
attack_011 | Media Assassination :: cost=3 ; rarity=common
attack_013 | Social Credit Punishment :: cost=3 ; rarity=common
attack_014 | Satellite Interference :: cost=3 ; rarity=common
attack_016 | Psyop Campaign :: cost=3 ; rarity=common
attack_018 | Honeypot Trap :: cost=3 ; rarity=common
attack_020 | Travel Restrictions :: cost=3 ; rarity=common
attack_021 | Blackmail Campaign :: cost=3 ; rarity=common
attack_023 | Coordinated Takedown :: cost=3 ; rarity=common
attack_025 | Astroturfing Mob :: cost=3 ; rarity=common
attack_026 | Digital Currency Control :: cost=3 ; rarity=common
attack_028 | Character Assassination :: cost=3 ; rarity=common
attack_030 | Information Overload :: cost=3 ; rarity=common
attack_032 | Professional Destruction :: cost=3 ; rarity=common
attack_034 | Mind Control Signal :: cost=3 ; rarity=common
attack_036 | Meme Warfare :: cost=3 ; rarity=uncommon
attack_037 | Project Mockingbird :: cost=9 ; rarity=uncommon
attack_038 | False Memory Implant :: cost=3 ; rarity=uncommon
attack_039 | Targeted Individual Program :: cost=9 ; rarity=uncommon
attack_040 | Operation Chaos :: cost=3 ; rarity=uncommon
attack_041 | MK-Ultra Activation :: cost=3 ; rarity=uncommon
attack_042 | Electromagnetic Pulse :: cost=9 ; rarity=uncommon
attack_043 | Subliminal Programming :: cost=3 ; rarity=uncommon
attack_044 | Social Engineering Attack :: cost=9 ; rarity=uncommon
attack_045 | Controlled Opposition Reveal :: cost=3 ; rarity=uncommon
attack_046 | Directed Energy Attack :: cost=9 ; rarity=rare
attack_047 | Mass Mind Control Event :: cost=3 ; rarity=rare
attack_048 | Digital Assassination :: cost=9 ; rarity=legendary
attack_049 | Revelation of the Method :: cost=3 ; rarity=rare
attack_050 | Project Blue Beam :: cost=3 ; rarity=legendary
defense_001 | Tinfoil Hat :: cost=2 ; rarity=common
defense_003 | Faraday Cage :: cost=2 ; rarity=common
defense_004 | Burner Phone :: cost=4 ; rarity=common
defense_005 | Safe House :: cost=2 ; rarity=common
defense_006 | Dead Man's Switch :: cost=2 ; rarity=common
defense_007 | Encrypted Communications :: cost=4 ; rarity=common
defense_008 | Anonymous Proxy :: cost=2 ; rarity=common
defense_009 | Loyal Bodyguard :: cost=2 ; rarity=common
defense_010 | Emergency Broadcast :: cost=4 ; rarity=common
defense_011 | Legal Immunity :: cost=2 ; rarity=common
defense_012 | Public Sympathy :: cost=2 ; rarity=common
defense_013 | Backup Server :: cost=4 ; rarity=common
defense_014 | Foreign Asylum :: cost=2 ; rarity=common
defense_016 | Martyrdom Threat :: cost=2 ; rarity=common
defense_017 | Media Attention :: cost=2 ; rarity=common
defense_018 | Plausible Deniability :: cost=2 ; rarity=common
defense_019 | Digital Redundancy :: cost=4 ; rarity=common
defense_020 | Underground Network :: cost=2 ; rarity=common
defense_021 | Counter-Intelligence :: cost=2 ; rarity=common
defense_025 | Conspiracy of Silence :: cost=2 ; rarity=uncommon
defense_027 | Distributed Network :: cost=2 ; rarity=uncommon
defense_028 | Underground Safehouse :: cost=2 ; rarity=rare
defense_029 | Mirror Shield Protocol :: cost=2 ; rarity=rare
defense_030 | Divine Prophecy :: cost=1 ; rarity=legendary
hallo-gov-spider-scare-incident-002 | Spider Scare Incident :: cost=1 ; rarity=common
hallo-gov-dracula-shuffle-protocol-006 | Dracula Shuffle Protocol :: cost=1 ; rarity=common
hallo-gov-wolfman-shenanigans-007 | Wolfman Shenanigans :: cost=2 ; rarity=common
hallo-gov-press-release-of-the-full-moon-008 | Press Release of the Full Moon :: cost=1 ; rarity=common
hallo-gov-bat-boy-shuffle-protocol-010 | Bat Boy Shuffle Protocol :: cost=2 ; rarity=common
hallo-gov-trick-or-treat-pamphlet-files-012 | Trick-or-Treat Pamphlet Files :: cost=2 ; rarity=common
hallo-gov-poltergeist-alert-protocol-015 | Poltergeist Alert Protocol :: cost=2 ; rarity=common
hallo-gov-scare-of-the-ghost-017 | Scare of the Ghost :: cost=2 ; rarity=common
hallo-gov-banshee-shenanigans-incident-018 | Banshee Shenanigans Incident :: cost=1 ; rarity=common
hallo-gov-wolfman-pamphlet-incident-019 | Wolfman Pamphlet Incident :: cost=1 ; rarity=common
hallo-gov-shuffle-of-the-mummy-022 | Shuffle of the Mummy :: cost=1 ; rarity=common
hallo-gov-haunted-mansion-whispers-023 | Haunted Mansion Whispers :: cost=1 ; rarity=common
hallo-gov-raven-scare-024 | Raven Scare :: cost=1 ; rarity=common
hallo-gov-frankenstein-pamphlet-initiative-025 | Frankenstein Pamphlet Initiative :: cost=2 ; rarity=common
hallo-gov-shenanigans-of-the-cauldron-026 | Shenanigans of the Cauldron :: cost=2 ; rarity=common
hallo-gov-headless-horseman-pamphlet-files-027 | Headless Horseman Pamphlet Files :: cost=1 ; rarity=common
hallo-gov-skeleton-flyer-files-029 | Skeleton Flyer Files :: cost=2 ; rarity=common
hallo-gov-brief-of-the-skeleton-030 | Brief of the Skeleton :: cost=1 ; rarity=common
hallo-gov-frankenstein-flyer-incident-031 | Frankenstein Flyer Incident :: cost=1 ; rarity=common
hallo-gov-coven-scare-032 | Coven Scare :: cost=2 ; rarity=common
hallo-gov-cobweb-scare-036 | Cobweb Scare :: cost=2 ; rarity=common
hallo-gov-seance-alert-initiative-037 | Seance Alert Initiative :: cost=1 ; rarity=common
hallo-gov-poltergeist-report-initiative-039 | Poltergeist Report Initiative :: cost=1 ; rarity=common
hallo-gov-alert-of-the-haunted-mansion-040 | Alert of the Haunted Mansion :: cost=1 ; rarity=common
hallo-gov-ghost-flyer-protocol-041 | Ghost Flyer Protocol :: cost=2 ; rarity=common
hallo-gov-jack-o-lantern-alert-042 | Jack-o-Lantern Alert :: cost=2 ; rarity=common
hallo-gov-seance-shenanigans-043 | Seance Shenanigans :: cost=1 ; rarity=common
hallo-gov-zombie-pamphlet-incident-044 | Zombie Pamphlet Incident :: cost=1 ; rarity=common
hallo-gov-crypt-rumor-protocol-045 | Crypt Rumor Protocol :: cost=1 ; rarity=common
hallo-gov-skeleton-whispers-initiative-046 | Skeleton Whispers Initiative :: cost=2 ; rarity=common
hallo-gov-cobweb-alert-protocol-050 | Cobweb Alert Protocol :: cost=1 ; rarity=common
hallo-gov-full-moon-press-release-incident-055 | Full Moon Press Release Incident :: cost=2 ; rarity=common
hallo-gov-shuffle-of-the-haunted-056 | Shuffle of the Haunted :: cost=2 ; rarity=common
hallo-gov-cobweb-shenanigans-incident-057 | Cobweb Shenanigans Incident :: cost=2 ; rarity=common
hallo-gov-witch-shenanigans-058 | Witch Shenanigans :: cost=1 ; rarity=common
hallo-gov-zombie-rally-files-059 | Zombie Rally Files :: cost=2 ; rarity=common
hallo-gov-dracula-shenanigans-060 | Dracula Shenanigans :: cost=1 ; rarity=common
hallo-gov-ouija-rumor-061 | Ouija Rumor :: cost=2 ; rarity=common
hallo-gov-candy-corn-whispers-064 | Candy Corn Whispers :: cost=1 ; rarity=common
hallo-gov-moonlight-scare-initiative-065 | Moonlight Scare Initiative :: cost=2 ; rarity=common
hallo-gov-jack-o-lantern-rally-incident-066 | Jack-o-Lantern Rally Incident :: cost=2 ; rarity=common
hallo-gov-full-moon-shenanigans-067 | Full Moon Shenanigans :: cost=1 ; rarity=common
hallo-gov-wolfman-flyer-protocol-068 | Wolfman Flyer Protocol :: cost=1 ; rarity=common
hallo-gov-witch-press-release-incident-070 | Witch Press Release Incident :: cost=1 ; rarity=common
hallo-gov-ghoul-sweep-initiative-001 | Ghoul Sweep Initiative :: cost=3 ; rarity=uncommon
hallo-gov-bat-boy-operation-protocol-002 | Bat Boy Operation Protocol :: cost=2 ; rarity=uncommon
hallo-gov-broadcast-of-the-seance-003 | Broadcast of the Seance :: cost=1 ; rarity=uncommon
hallo-gov-spooky-hayride-operation-initiative-004 | Spooky Hayride Operation Initiative :: cost=3 ; rarity=uncommon
hallo-gov-ploy-of-the-headless-horseman-005 | Ploy of the Headless Horseman :: cost=3 ; rarity=uncommon
hallo-gov-jack-o-lantern-stakeout-006 | Jack-o-Lantern Stakeout :: cost=3 ; rarity=uncommon
hallo-gov-poltergeist-murmur-network-incident-007 | Poltergeist Murmur Network Incident :: cost=2 ; rarity=uncommon
hallo-gov-moonlight-expedition-incident-008 | Moonlight Expedition Incident :: cost=1 ; rarity=uncommon
hallo-gov-seance-broadcast-incident-009 | Seance Broadcast Incident :: cost=2 ; rarity=uncommon
hallo-gov-midnight-ploy-protocol-010 | Midnight Ploy Protocol :: cost=1 ; rarity=uncommon
hallo-gov-banshee-investigation-files-011 | Banshee Investigation Files :: cost=1 ; rarity=uncommon
hallo-gov-graveyard-expedition-initiative-013 | Graveyard Expedition Initiative :: cost=1 ; rarity=uncommon
hallo-gov-zombie-murmur-network-files-014 | Zombie Murmur Network Files :: cost=3 ; rarity=uncommon
hallo-gov-haunted-mansion-ploy-protocol-015 | Haunted Mansion Ploy Protocol :: cost=1 ; rarity=uncommon
hallo-gov-headless-horseman-gambit-017 | Headless Horseman Gambit :: cost=2 ; rarity=uncommon
hallo-gov-candy-corn-expedition-protocol-018 | Candy Corn Expedition Protocol :: cost=1 ; rarity=uncommon
hallo-gov-banshee-broadcast-initiative-019 | Banshee Broadcast Initiative :: cost=3 ; rarity=uncommon
hallo-gov-spider-gambit-protocol-020 | Spider Gambit Protocol :: cost=1 ; rarity=uncommon
hallo-gov-revelation-of-the-graveyard-001 | Revelation of the Graveyard :: cost=3 ; rarity=rare
hallo-gov-raven-revelation-initiative-002 | Raven Revelation Initiative :: cost=5 ; rarity=uncommon
hallo-gov-containment-of-the-cauldron-003 | Containment of the Cauldron :: cost=4 ; rarity=rare
hallo-gov-banshee-prime-directive-files-004 | Banshee Prime Directive Files :: cost=3 ; rarity=rare
hallo-gov-seance-containment-files-005 | Seance Containment Files :: cost=4 ; rarity=uncommon
hallo-gov-raven-project-protocol-006 | Raven Project Protocol :: cost=5 ; rarity=uncommon
hallo-gov-moonlight-deep-cover-007 | Moonlight Deep Cover :: cost=4 ; rarity=rare
hallo-truth-full-moon-pamphlet-initiative-001 | Full Moon Pamphlet Initiative :: cost=2 ; rarity=common
hallo-truth-banshee-shuffle-004 | Banshee Shuffle :: cost=1 ; rarity=common
hallo-truth-candy-corn-shuffle-protocol-005 | Candy Corn Shuffle Protocol :: cost=1 ; rarity=common
hallo-truth-scare-of-the-coven-006 | Scare of the Coven :: cost=1 ; rarity=common
hallo-truth-black-cat-shenanigans-files-009 | Black Cat Shenanigans Files :: cost=2 ; rarity=common
hallo-truth-candy-corn-rumor-010 | Candy Corn Rumor :: cost=2 ; rarity=common
hallo-truth-rumor-of-the-witch-011 | Rumor of the Witch :: cost=2 ; rarity=common
hallo-truth-jack-o-lantern-press-release-protocol-012 | Jack-o-Lantern Press Release Protocol :: cost=2 ; rarity=common
hallo-truth-ghost-brief-protocol-014 | Ghost Brief Protocol :: cost=1 ; rarity=common
hallo-truth-raven-report-initiative-015 | Raven Report Initiative :: cost=1 ; rarity=common
hallo-truth-alert-of-the-ghost-017 | Alert of the Ghost :: cost=1 ; rarity=common
hallo-truth-zombie-press-release-incident-018 | Zombie Press Release Incident :: cost=1 ; rarity=common
hallo-truth-cemetery-press-release-initiative-019 | Cemetery Press Release Initiative :: cost=1 ; rarity=common
hallo-truth-rally-of-the-dracula-020 | Rally of the Dracula :: cost=1 ; rarity=common
hallo-truth-cauldron-shuffle-protocol-022 | Cauldron Shuffle Protocol :: cost=2 ; rarity=common
hallo-truth-coven-shenanigans-024 | Coven Shenanigans :: cost=1 ; rarity=common
hallo-truth-trick-or-treat-brief-incident-027 | Trick-or-Treat Brief Incident :: cost=1 ; rarity=common
hallo-truth-raven-press-release-029 | Raven Press Release :: cost=1 ; rarity=common
hallo-truth-witch-shuffle-incident-030 | Witch Shuffle Incident :: cost=1 ; rarity=common
hallo-truth-ghoul-pamphlet-initiative-031 | Ghoul Pamphlet Initiative :: cost=1 ; rarity=common
hallo-truth-headless-horseman-rally-incident-033 | Headless Horseman Rally Incident :: cost=2 ; rarity=common
hallo-truth-jack-o-lantern-shuffle-incident-035 | Jack-o-Lantern Shuffle Incident :: cost=1 ; rarity=common
hallo-truth-cobweb-alert-protocol-036 | Cobweb Alert Protocol :: cost=1 ; rarity=common
hallo-truth-rally-of-the-cauldron-037 | Rally of the Cauldron :: cost=1 ; rarity=common
hallo-truth-haunted-mansion-flyer-protocol-039 | Haunted Mansion Flyer Protocol :: cost=2 ; rarity=common
hallo-truth-haunted-mansion-alert-initiative-043 | Haunted Mansion Alert Initiative :: cost=1 ; rarity=common
hallo-truth-banshee-shuffle-protocol-044 | Banshee Shuffle Protocol :: cost=2 ; rarity=common
hallo-truth-banshee-shenanigans-files-046 | Banshee Shenanigans Files :: cost=1 ; rarity=common
hallo-truth-frankenstein-brief-incident-047 | Frankenstein Brief Incident :: cost=1 ; rarity=common
hallo-truth-candy-corn-shuffle-incident-049 | Candy Corn Shuffle Incident :: cost=2 ; rarity=common
hallo-truth-spider-shenanigans-protocol-050 | Spider Shenanigans Protocol :: cost=2 ; rarity=common
hallo-truth-ouija-flyer-052 | Ouija Flyer :: cost=1 ; rarity=common
hallo-truth-shuffle-of-the-dracula-053 | Shuffle of the Dracula :: cost=1 ; rarity=common
hallo-truth-pamphlet-of-the-raven-055 | Pamphlet of the Raven :: cost=2 ; rarity=common
hallo-truth-black-cat-press-release-protocol-058 | Black Cat Press Release Protocol :: cost=2 ; rarity=common
hallo-truth-ghost-press-release-files-061 | Ghost Press Release Files :: cost=1 ; rarity=common
hallo-truth-pamphlet-of-the-ouija-062 | Pamphlet of the Ouija :: cost=2 ; rarity=common
hallo-truth-frankenstein-pamphlet-063 | Frankenstein Pamphlet :: cost=2 ; rarity=common
hallo-truth-spooky-hayride-rally-protocol-067 | Spooky Hayride Rally Protocol :: cost=1 ; rarity=common
hallo-truth-alert-of-the-skeleton-068 | Alert of the Skeleton :: cost=2 ; rarity=common
hallo-truth-headless-horseman-whispers-protocol-069 | Headless Horseman Whispers Protocol :: cost=2 ; rarity=common
hallo-truth-candy-corn-press-release-initiative-070 | Candy Corn Press Release Initiative :: cost=1 ; rarity=common
hallo-truth-graveyard-murmur-network-protocol-001 | Graveyard Murmur Network Protocol :: cost=3 ; rarity=uncommon
hallo-truth-poltergeist-broadcast-files-002 | Poltergeist Broadcast Files :: cost=1 ; rarity=uncommon
hallo-truth-spider-expedition-incident-004 | Spider Expedition Incident :: cost=3 ; rarity=uncommon
hallo-truth-haunted-mansion-expedition-protocol-005 | Haunted Mansion Expedition Protocol :: cost=1 ; rarity=uncommon
hallo-truth-seance-sweep-006 | Seance Sweep :: cost=2 ; rarity=uncommon
hallo-truth-trick-or-treat-ploy-007 | Trick-or-Treat Ploy :: cost=1 ; rarity=uncommon
hallo-truth-graveyard-gambit-protocol-008 | Graveyard Gambit Protocol :: cost=1 ; rarity=uncommon
hallo-truth-cobweb-ploy-incident-009 | Cobweb Ploy Incident :: cost=1 ; rarity=uncommon
hallo-truth-zombie-murmur-network-013 | Zombie Murmur Network :: cost=2 ; rarity=uncommon
hallo-truth-moonlight-operation-initiative-014 | Moonlight Operation Initiative :: cost=3 ; rarity=uncommon
hallo-truth-jack-o-lantern-broadcast-initiative-015 | Jack-o-Lantern Broadcast Initiative :: cost=2 ; rarity=uncommon
hallo-truth-ghoul-operation-initiative-016 | Ghoul Operation Initiative :: cost=2 ; rarity=uncommon
hallo-truth-operation-of-the-mummy-017 | Operation of the Mummy :: cost=3 ; rarity=uncommon
hallo-truth-poltergeist-murmur-network-incident-018 | Poltergeist Murmur Network Incident :: cost=2 ; rarity=uncommon
hallo-truth-cobweb-ploy-initiative-019 | Cobweb Ploy Initiative :: cost=1 ; rarity=uncommon
hallo-truth-headless-horseman-expedition-files-020 | Headless Horseman Expedition Files :: cost=1 ; rarity=uncommon
hallo-truth-mummy-sanction-001 | Mummy Sanction :: cost=4 ; rarity=rare
hallo-truth-frankenstein-project-incident-002 | Frankenstein Project Incident :: cost=5 ; rarity=uncommon
hallo-truth-zombie-deep-cover-files-003 | Zombie Deep Cover Files :: cost=4 ; rarity=uncommon
hallo-truth-cauldron-grand-ritual-protocol-004 | Cauldron Grand Ritual Protocol :: cost=3 ; rarity=rare
hallo-truth-spooky-hayride-revelation-005 | Spooky Hayride Revelation :: cost=5 ; rarity=rare
hallo-truth-ghoul-project-incident-006 | Ghoul Project Incident :: cost=5 ; rarity=rare
hallo-truth-cemetery-deep-cover-protocol-007 | Cemetery Deep Cover Protocol :: cost=3 ; rarity=rare
hallo-gov-operation-pumpkin-spice-legendary | Operation Pumpkin Spice :: cost=15 ; rarity=legendary
hallo-gov-containment-protocol-dracula-legendary | Containment Protocol: Dracula :: cost=8 ; rarity=rare
hallo-gov-the-skeleton-army-rises-legendary | The Skeleton Army Rises :: cost=10 ; rarity=rare
hallo-truth-elvira-mistress-of-the-leaks-legendary | Elvira, Mistress of the Leaks :: cost=14 ; rarity=legendary
hallo-truth-bat-boy-s-rebellion-legendary | Bat Boyâ€™s Rebellion :: cost=15 ; rarity=legendary
hallo-truth-candy-apocalypse-legendary | Candy Apocalypse :: cost=9 ; rarity=rare
gov_men_in_black_sweep | Men in Black Sweep :: cost=4 ; rarity=rare
gov_weather_machine_alpha | Weather Machine Alpha :: cost=7 ; rarity=uncommon
gov_project_grand_mandela | Project Grand Mandela :: cost=7 ; rarity=rare
gov_chemtrail_deployment | Chemtrail Deployment :: cost=6 ; rarity=uncommon
gov_area_51_security | Area 51 Security :: cost=5 ; rarity=common
gov_fake_alien_invasion | Fake Alien Invasion :: cost=10 ; rarity=legendary
gov_roswell_cover_story | Roswell Cover Story :: cost=7 ; rarity=uncommon
gov_disinformation_bureau | Disinformation Bureau :: cost=9 ; rarity=rare
gov_bigfoot_suit_factory | Bigfoot Suit Factory :: cost=6 ; rarity=uncommon
gov_project_blue_beam | Project Blue Beam :: cost=11 ; rarity=legendary
gov_mothman_relocation | Mothman Relocation Program :: cost=8 ; rarity=rare
gov_chupacabra_protocol | Chupacabra Protocol :: cost=7 ; rarity=uncommon
gov_cryptid_containment | Cryptid Containment Unit :: cost=5 ; rarity=common
gov_jersey_devil_task_force | Jersey Devil Task Force :: cost=5 ; rarity=common
gov_lake_monster_drainage | Lake Monster Drainage :: cost=7 ; rarity=uncommon
gov_men_in_beige | Men in Beige :: cost=5 ; rarity=common
gov_swamp_gas_generator | Swamp Gas Generator :: cost=6 ; rarity=uncommon
gov_deniability_protocols | Deniability Protocols :: cost=7 ; rarity=uncommon
gov_black_helicopters | Black Helicopters :: cost=8 ; rarity=rare
gov_cryptozoology_dept | Cryptozoology Department :: cost=2 ; rarity=uncommon
gov_flatwoods_incident | Flatwoods Incident :: cost=7 ; rarity=uncommon
gov_skunk_ape_safari | Skunk Ape Safari :: cost=5 ; rarity=common
gov_thunderbird_tracking | Thunderbird Tracking :: cost=6 ; rarity=uncommon
gov_shadow_people_census | Shadow People Census :: cost=7 ; rarity=uncommon
gov_hopkinsville_goblins | Hopkinsville Goblins :: cost=7 ; rarity=rare
gov_lizard_person_council | Lizard Person Council :: cost=10 ; rarity=legendary
gov_hollow_earth_drilling | Hollow Earth Drilling :: cost=9 ; rarity=rare
gov_time_travel_bureau | Time Travel Bureau :: cost=5 ; rarity=uncommon
gov_flying_saucer_hangar | Flying Saucer Hangar :: cost=8 ; rarity=rare
gov_interdimensional_gate | Interdimensional Gate :: cost=4 ; rarity=rare
gov_yeti_expedition_hoax | Yeti Expedition Hoax :: cost=7 ; rarity=uncommon
gov_skinwalker_ranch_buyout | Skinwalker Ranch Buyout :: cost=8 ; rarity=uncommon
gov_dover_demon_debunking | Dover Demon Debunking :: cost=6 ; rarity=uncommon
gov_alien_autopsy_studio | Alien Autopsy Studio :: cost=8 ; rarity=rare
gov_cattle_mutilation_labs | Cattle Mutilation Labs :: cost=7 ; rarity=uncommon
gov_crop_circle_artists | Crop Circle Artists Guild :: cost=6 ; rarity=uncommon
gov_phantom_airships | Phantom Airships :: cost=5 ; rarity=common
gov_washington_sea_serpent | Washington Sea Serpent :: cost=7 ; rarity=uncommon
gov_moon_eyed_people | Moon-Eyed People Census :: cost=6 ; rarity=uncommon
gov_giant_octopus_cover | Giant Octopus Cover-up :: cost=8 ; rarity=rare
gov_psychic_spying_program | Psychic Spying Program :: cost=3 ; rarity=uncommon
gov_invisible_aircraft | Invisible Aircraft Project :: cost=10 ; rarity=legendary
gov_missing_time_protocol | Missing Time Protocol :: cost=2 ; rarity=uncommon
gov_greys_employment | Greys Employment Program :: cost=3 ; rarity=uncommon
gov_reality_anchor_array | Reality Anchor Array :: cost=3 ; rarity=rare
gov_dimension_x_portal | Dimension X Portal :: cost=5 ; rarity=uncommon
gov_crypto_rehabilitation | Cryptid Rehabilitation Center :: cost=7 ; rarity=common
gov_mind_probe_study | Mind Probe Study :: cost=3 ; rarity=uncommon
gov_subliminal_broadcast | Subliminal Broadcast Network :: cost=8 ; rarity=rare
gov_fake_moon_landing_set | Fake Moon Landing Set :: cost=7 ; rarity=uncommon
gov_neuralyzer_deployment | Neuralyzer Deployment :: cost=1 ; rarity=uncommon
gov_shadow_government_hq | Shadow Government HQ :: cost=11 ; rarity=legendary
gov_operation_paperclip_2 | Operation Paperclip II :: cost=3 ; rarity=uncommon
gov_holographic_ufo | Holographic UFO Display :: cost=7 ; rarity=uncommon
gov_cryptid_breeding_program | Cryptid Breeding Program :: cost=9 ; rarity=rare
gov_false_flag_cryptid | False Flag Cryptid Attack :: cost=10 ; rarity=legendary
gov_extraterrestrial_treaty | Extraterrestrial Non-Disclosure Treaty :: cost=2 ; rarity=uncommon
gov_quantum_bigfoot | Quantum Bigfoot Experiment :: cost=3 ; rarity=rare
gov_interdimensional_customs | Interdimensional Customs :: cost=7 ; rarity=uncommon
gov_cosmic_horror_containment | Cosmic Horror Containment :: cost=4 ; rarity=rare
gov_reptilian_shapeshifter | Reptilian Shapeshifter Agent :: cost=4 ; rarity=uncommon
gov_memory_modification | Memory Modification Clinic :: cost=8 ; rarity=rare
gov_psy_ops_division | Psy-Ops Division :: cost=3 ; rarity=uncommon
gov_cryptid_witness_program | Cryptid Witness Protection :: cost=6 ; rarity=uncommon
gov_underground_bunker | Underground Bunker Network :: cost=4 ; rarity=uncommon
gov_orbital_mind_control | Orbital Mind Control Platform :: cost=5 ; rarity=uncommon
gov_temporal_loop_device | Temporal Loop Device :: cost=3 ; rarity=rare
gov_anomalous_materials | Anomalous Materials Division :: cost=9 ; rarity=uncommon
gov_phantom_helicopter | Phantom Helicopter Squadron :: cost=7 ; rarity=common
gov_reality_distortion_field | Reality Distortion Field :: cost=4 ; rarity=uncommon
gov_cryptid_dna_database | Cryptid DNA Database :: cost=8 ; rarity=rare
gov_phantom_satellites | Phantom Satellite Grid :: cost=9 ; rarity=rare
gov_consciousness_transfer | Consciousness Transfer Lab :: cost=5 ; rarity=uncommon
gov_multidimensional_embassy | Multidimensional Embassy :: cost=6 ; rarity=uncommon
truth_cryptid_field_research | Cryptid Field Research :: cost=6 ; rarity=uncommon
truth_ultra_disclosure_protocol | Ultra Disclosure Protocol :: cost=13 ; rarity=legendary
truth_bigfoot_expedition | Bigfoot Expedition :: cost=6 ; rarity=uncommon
truth_alien_abduction_support | Alien Abduction Support Group :: cost=7 ; rarity=uncommon
truth_ufo_hotline | UFO Hotline Network :: cost=6 ; rarity=uncommon
truth_mothman_prophecies | Mothman Prophecies :: cost=8 ; rarity=rare
truth_chupacabra_sighting | Chupacabra Sighting Report :: cost=5 ; rarity=uncommon
truth_lake_monster_sonar | Lake Monster Sonar Evidence :: cost=7 ; rarity=uncommon
truth_ancient_astronauts | Ancient Astronaut Theory :: cost=8 ; rarity=rare
truth_roswell_survivors | Roswell Survivor Testimony :: cost=7 ; rarity=rare
truth_area_51_infiltration | Area 51 Infiltration :: cost=10 ; rarity=legendary
truth_jersey_devil_hunt | Jersey Devil Hunt :: cost=5 ; rarity=common
truth_skunk_ape_footage | Skunk Ape Footage :: cost=6 ; rarity=uncommon
truth_beast_of_bray_road_tracking | Beast of Bray Road Tracking :: cost=7 ; rarity=uncommon
truth_phantom_kangaroo_network | Phantom Kangaroo Tracking Network :: cost=5 ; rarity=uncommon
truth_fouke_monster_evidence | Fouke Monster Evidence :: cost=7 ; rarity=uncommon
truth_thunderbird_sightings | Thunderbird Sightings Database :: cost=8 ; rarity=rare
truth_shadow_people_documentation | Shadow People Documentation :: cost=6 ; rarity=uncommon
truth_hopkinsville_goblins_testimony | Hopkinsville Goblins Testimony :: cost=7 ; rarity=uncommon
truth_lizard_people_exposÃ© | Lizard People ExposÃ© :: cost=9 ; rarity=legendary
truth_hollow_earth_expedition | Hollow Earth Expedition :: cost=9 ; rarity=rare
truth_time_traveler_interview | Time Traveler Interview :: cost=10 ; rarity=legendary
truth_ufo_crash_retrieval | UFO Crash Retrieval Team :: cost=4 ; rarity=uncommon
truth_interdimensional_portal | Interdimensional Portal Research :: cost=5 ; rarity=uncommon
truth_phantom_black_dog_network | Phantom Black Dog Network :: cost=5 ; rarity=uncommon
truth_yeti_hair_analysis | Yeti Hair Analysis :: cost=6 ; rarity=uncommon
truth_skinwalker_ranch_investigation | Skinwalker Ranch Investigation :: cost=8 ; rarity=rare
truth_dover_demon_testimony | Dover Demon Witness Testimony :: cost=6 ; rarity=uncommon
truth_alien_autopsy_leak | Real Alien Autopsy Leak :: cost=8 ; rarity=rare
truth_cattle_mutilation_pattern | Cattle Mutilation Pattern Analysis :: cost=7 ; rarity=uncommon
truth_crop_circle_decoder | Crop Circle Decoder Ring :: cost=6 ; rarity=uncommon
truth_phantom_airship_reports | 1897 Phantom Airship Reports :: cost=7 ; rarity=uncommon
truth_beast_of_bladenboro_hunt | Beast of Bladenboro Hunt :: cost=6 ; rarity=uncommon
truth_washington_sea_serpent_sonar | Washington Sea Serpent Sonar :: cost=7 ; rarity=uncommon
truth_moon_eyed_people_archaeology | Moon-Eyed People Archaeological Site :: cost=8 ; rarity=rare
truth_giant_octopus_encounter | Giant Pacific Octopus Encounter :: cost=8 ; rarity=rare
truth_remote_viewing_program | Remote Viewing Leak :: cost=7 ; rarity=rare
truth_invisible_aircraft_photos | Invisible Aircraft Photos :: cost=9 ; rarity=legendary
truth_missing_time_survivors | Missing Time Survivor Network :: cost=7 ; rarity=rare
truth_grey_alien_testimony | Grey Alien Eyewitness Testimony :: cost=8 ; rarity=rare
truth_reality_breach_detector | Reality Breach Detector :: cost=10 ; rarity=legendary
truth_paranormal_investigation_society | Paranormal Investigation Society :: cost=3 ; rarity=uncommon
truth_alien_implant_removal | Alien Implant Removal Clinic :: cost=7 ; rarity=rare
truth_consciousness_expansion | Consciousness Expansion Workshop :: cost=8 ; rarity=rare
truth_multidimensional_gateway | Multidimensional Gateway :: cost=11 ; rarity=legendary
truth_fake_moon_landing_evidence | Moon Landing Hoax Evidence :: cost=7 ; rarity=uncommon
truth_memory_recovery_session | Memory Recovery Session :: cost=7 ; rarity=rare
truth_shadow_government_infiltration | Shadow Government Infiltration :: cost=9 ; rarity=legendary
truth_operation_paperclip_files | Operation Paperclip Files :: cost=8 ; rarity=rare
truth_holographic_universe_theory | Holographic Universe Theory :: cost=4 ; rarity=uncommon
truth_cryptid_dna_evidence | Cryptid DNA Evidence Database :: cost=8 ; rarity=rare
truth_phantom_satellite_tracking | Phantom Satellite Tracking :: cost=8 ; rarity=rare
truth_consciousness_upload | Consciousness Upload Technology :: cost=5 ; rarity=uncommon
truth_multidimensional_broadcast | Multidimensional Broadcast Network :: cost=9 ; rarity=legendary
truth_crystal_wifi_chakras | Crystal Wi-Fi Chakra Network :: cost=3 ; rarity=uncommon
truth_late_night_am_radio | Late Night AM Radio :: cost=5 ; rarity=uncommon
truth_viral_thread_storm | Viral Thread Storm :: cost=7 ; rarity=rare
truth_bigfoot_field_ops | Bigfoot Field Operations :: cost=7 ; rarity=rare
truth_mothman_omens | Mothman Omen Network :: cost=4 ; rarity=uncommon
truth_essential_oils_mind_shield | Essential Oils Mind Shield :: cost=5 ; rarity=uncommon
truth_healing_crystal_array | Healing Crystal Array :: cost=6 ; rarity=uncommon
truth_long_youtube_videos | Really Long YouTube Videos :: cost=6 ; rarity=uncommon
truth_whistleblower_protection | Whistleblower Protection Network :: cost=7 ; rarity=rare
truth_anonymous_leak_platform | Anonymous Leak Platform :: cost=8 ; rarity=rare
truth_flat_earth_conference | Flat Earth Conference :: cost=7 ; rarity=uncommon
truth_chemtrail_detection_kit | Chemtrail Detection Kit :: cost=6 ; rarity=uncommon
truth_vaccine_truth_bombs | Vaccine Truth Bomb Campaign :: cost=7 ; rarity=rare`;

// Parse balance updates into a map
function parseBalanceUpdates(input: string): Map<string, { cost: number; rarity: string }> {
  const updates = new Map();
  const lines = input.trim().split('\n');
  
  for (const line of lines) {
    const match = line.match(/(.+?)\s+\|\s+(.+?)\s+::\s+cost=(\d+)\s+;\s+rarity=(.+)/);
    if (match) {
      const [, cardId, , cost, rarity] = match;
      updates.set(cardId.trim(), {
        cost: parseInt(cost),
        rarity: rarity.trim()
      });
    }
  }
  
  return updates;
}

console.log('Applying 460 card balance updates...');
const updates = parseBalanceUpdates(balanceUpdates);
console.log(`Parsed ${updates.size} card updates`);

export { updates };