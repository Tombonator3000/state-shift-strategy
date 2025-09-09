import type { GameCard } from '@/components/game/GameHand';
import { extensionManager } from './extensionSystem';

// Complete Shadow Government Card Database (200 cards)
export const CARD_DATABASE: GameCard[] = [
  // MEDIA CARDS (60 cards, cost 4)
  // Commons (42 cards)
  {
    id: 'media_001',
    name: 'Cable News Spin',
    type: 'MEDIA',
    rarity: 'common',
    text: 'Truth -10',
    flavorGov: 'Tonight\'s top story: nothing to worry about.',
    flavorTruth: 'You call this journalism?',
    cost: 4
  },
  {
    id: 'media_002',
    name: 'Leaked Memo',
    type: 'MEDIA',
    rarity: 'common',
    text: 'Truth +10',
    flavorGov: 'This document is classified... oops.',
    flavorTruth: 'Proof at last!',
    cost: 4
  },
  {
    id: 'media_003',
    name: 'Anonymous Blog Post',
    type: 'MEDIA',
    rarity: 'common',
    text: 'Truth +10',
    flavorGov: 'Just internet nonsense.',
    flavorTruth: 'Wake up sheeple!',
    cost: 4
  },
  {
    id: 'media_004',
    name: 'Late Night Talk Show',
    type: 'MEDIA',
    rarity: 'common',
    text: 'Truth -10',
    flavorGov: 'Keep them laughing, not thinking.',
    flavorTruth: 'Controlled comedy hour.',
    cost: 4
  },
  {
    id: 'media_005',
    name: 'Press Conference',
    type: 'MEDIA',
    rarity: 'common',
    text: 'Truth -10',
    flavorGov: 'We deny everything.',
    flavorTruth: 'They\'re lying to your face.',
    cost: 4
  },
  {
    id: 'media_006',
    name: 'Conspiracy Podcast',
    type: 'MEDIA',
    rarity: 'common',
    text: 'Truth +10',
    flavorGov: 'Just fringe entertainment.',
    flavorTruth: 'They can\'t censor the truth here!',
    cost: 4
  },
  {
    id: 'media_007',
    name: 'Photoshop Hoax',
    type: 'MEDIA',
    rarity: 'common',
    text: 'Truth -10',
    flavorGov: 'Release the blurry UFO again.',
    flavorTruth: 'Fake to hide the real one!',
    cost: 4
  },
  {
    id: 'media_008',
    name: 'Tabloid Headline',
    type: 'MEDIA',
    rarity: 'common',
    text: 'Truth +10',
    flavorGov: 'Distract with Batboy again.',
    flavorTruth: 'Hidden truths in satire.',
    cost: 4
  },
  {
    id: 'media_009',
    name: 'Censored Report',
    type: 'MEDIA',
    rarity: 'common',
    text: 'Truth -10',
    flavorGov: '█████████ redacted ██████.',
    flavorTruth: 'They\'re hiding it all!',
    cost: 4
  },
  {
    id: 'media_010',
    name: 'YouTube Rant',
    type: 'MEDIA',
    rarity: 'common',
    text: 'Truth +10',
    flavorGov: 'Demonetized in 3...2...1.',
    flavorTruth: 'Finally someone speaking out.',
    cost: 4
  },
  {
    id: 'media_011',
    name: 'Blurry Bigfoot Photo',
    type: 'MEDIA',
    rarity: 'common',
    text: 'Truth +10',
    flavorGov: 'Just shadows and pareidolia.',
    flavorTruth: 'Look at those footprints!',
    cost: 4
  },
  {
    id: 'media_012',
    name: 'Weather Balloon Excuse',
    type: 'MEDIA',
    rarity: 'common',
    text: 'Truth -10',
    flavorGov: 'Completely normal meteorological activity.',
    flavorTruth: 'That\'s no balloon!',
    cost: 4
  },
  {
    id: 'media_013',
    name: 'Fact Check Article',
    type: 'MEDIA',
    rarity: 'common',
    text: 'Truth -10',
    flavorGov: 'Independent verification.',
    flavorTruth: 'Who fact-checks the fact-checkers?',
    cost: 4
  },
  {
    id: 'media_014',
    name: 'Twitter Whistleblower',
    type: 'MEDIA',
    rarity: 'common',
    text: 'Truth +10',
    flavorGov: 'Account suspended for misinformation.',
    flavorTruth: 'They tried to silence the truth!',
    cost: 4
  },
  {
    id: 'media_015',
    name: 'Government PSA',
    type: 'MEDIA',
    rarity: 'common',
    text: 'Truth -10',
    flavorGov: 'For your safety and security.',
    flavorTruth: 'Propaganda in disguise.',
    cost: 4
  },
  // ... continuing with more commons
  {
    id: 'media_016',
    name: 'Meme Campaign',
    type: 'MEDIA',
    rarity: 'common',
    text: 'Truth +10',
    flavorGov: 'Weaponized humor.',
    flavorTruth: 'The people\'s voice!',
    cost: 4
  },
  {
    id: 'media_017',
    name: 'Documentary Expose',
    type: 'MEDIA',
    rarity: 'common',
    text: 'Truth +10',
    flavorGov: 'Banned from mainstream platforms.',
    flavorTruth: 'Hidden camera reveals all!',
    cost: 4
  },
  {
    id: 'media_018',
    name: 'Expert Testimony',
    type: 'MEDIA',
    rarity: 'common',
    text: 'Truth -10',
    flavorGov: 'Our scientist says it\'s safe.',
    flavorTruth: 'Follow the money trail.',
    cost: 4
  },
  {
    id: 'media_019',
    name: 'Leaked Audio',
    type: 'MEDIA',
    rarity: 'common',
    text: 'Truth +10',
    flavorGov: 'Taken out of context.',
    flavorTruth: 'They said the quiet part out loud!',
    cost: 4
  },
  {
    id: 'media_020',
    name: 'Crisis Actor Claims',
    type: 'MEDIA',
    rarity: 'common',
    text: 'Truth +10',
    flavorGov: 'Harmful conspiracy theories.',
    flavorTruth: 'Same faces, different events!',
    cost: 4
  },
  // More commons (21-42)
  {
    id: 'media_021',
    name: 'Staged Interview',
    type: 'MEDIA',
    rarity: 'common',
    text: 'Truth -10',
    flavorGov: 'Carefully crafted narrative.',
    flavorTruth: 'Scripted responses obvious.',
    cost: 4
  },
  {
    id: 'media_022',
    name: 'Whistleblower Protection',
    type: 'MEDIA',
    rarity: 'common',
    text: 'Truth +10',
    flavorGov: 'National security threat.',
    flavorTruth: 'Heroes need our support!',
    cost: 4
  },
  {
    id: 'media_023',
    name: 'Conspiracy Theory Label',
    type: 'MEDIA',
    rarity: 'common',
    text: 'Truth -10',
    flavorGov: 'Discredit through association.',
    flavorTruth: 'They use this to silence truth!',
    cost: 4
  },
  {
    id: 'media_024',
    name: 'Alternative News Site',
    type: 'MEDIA',
    rarity: 'common',
    text: 'Truth +10',
    flavorGov: 'Unregulated misinformation.',
    flavorTruth: 'Real journalism lives here!',
    cost: 4
  },
  {
    id: 'media_025',
    name: 'AI Deepfake Denial',
    type: 'MEDIA',
    rarity: 'common',
    text: 'Truth -10',
    flavorGov: 'Advanced technology solutions.',
    flavorTruth: 'They can fake anything now!',
    cost: 4
  },
  // Adding more to reach 42 commons
  {
    id: 'media_026',
    name: 'Forum Post Evidence',
    type: 'MEDIA',
    rarity: 'common',
    text: 'Truth +10',
    flavorGov: 'Anonymous internet claims.',
    flavorTruth: 'Digital breadcrumbs lead to truth!',
    cost: 4
  },
  {
    id: 'media_027',
    name: 'Celebrity Endorsement',
    type: 'MEDIA',
    rarity: 'common',
    text: 'Truth -10',
    flavorGov: 'Influential public figures.',
    flavorTruth: 'Bought and paid for.',
    cost: 4
  },
  {
    id: 'media_028',
    name: 'Classified Leak',
    type: 'MEDIA',
    rarity: 'common',
    text: 'Truth +10',
    flavorGov: 'Security breach contained.',
    flavorTruth: 'The documents don\'t lie!',
    cost: 4
  },
  {
    id: 'media_029',
    name: 'Social Media Ban',
    type: 'MEDIA',
    rarity: 'common',
    text: 'Truth -10',
    flavorGov: 'Community guidelines enforcement.',
    flavorTruth: 'Censorship in action!',
    cost: 4
  },
  {
    id: 'media_030',
    name: 'Streisand Effect',
    type: 'MEDIA',
    rarity: 'common',
    text: 'Truth +10',
    flavorGov: 'Attempted suppression backfired.',
    flavorTruth: 'The more they hide, the more we seek!',
    cost: 4
  },
  {
    id: 'media_031',
    name: 'Official Statement',
    type: 'MEDIA',
    rarity: 'common',
    text: 'Truth -10',
    flavorGov: 'Authoritative source.',
    flavorTruth: 'Politicians lie professionally.',
    cost: 4
  },
  {
    id: 'media_032',
    name: 'Investigative Report',
    type: 'MEDIA',
    rarity: 'common',
    text: 'Truth +10',
    flavorGov: 'Rogue journalist overreach.',
    flavorTruth: 'Finally, real investigation!',
    cost: 4
  },
  {
    id: 'media_033',
    name: 'Damage Control',
    type: 'MEDIA',
    rarity: 'common',
    text: 'Truth -10',
    flavorGov: 'Crisis management activated.',
    flavorTruth: 'They\'re scrambling to cover up!',
    cost: 4
  },
  {
    id: 'media_034',
    name: 'Data Dump',
    type: 'MEDIA',
    rarity: 'common',
    text: 'Truth +10',
    flavorGov: 'Information overload strategy.',
    flavorTruth: 'Truth hidden in the noise!',
    cost: 4
  },
  {
    id: 'media_035',
    name: 'Think Tank Study',
    type: 'MEDIA',
    rarity: 'common',
    text: 'Truth -10',
    flavorGov: 'Independent research confirms.',
    flavorTruth: 'Who funds these "experts"?',
    cost: 4
  },
  {
    id: 'media_036',
    name: 'Citizen Journalist',
    type: 'MEDIA',
    rarity: 'common',
    text: 'Truth +10',
    flavorGov: 'Untrained amateur reporting.',
    flavorTruth: 'Boots on the ground truth!',
    cost: 4
  },
  {
    id: 'media_037',
    name: 'Gaslighting Campaign',
    type: 'MEDIA',
    rarity: 'common',
    text: 'Truth -10',
    flavorGov: 'Reality management protocol.',
    flavorTruth: 'They\'re making us doubt ourselves!',
    cost: 4
  },
  {
    id: 'media_038',
    name: 'FOIA Request',
    type: 'MEDIA',
    rarity: 'common',
    text: 'Truth +10',
    flavorGov: 'Heavily redacted for security.',
    flavorTruth: 'What are they hiding?',
    cost: 4
  },
  {
    id: 'media_039',
    name: 'Planted Story',
    type: 'MEDIA',
    rarity: 'common',
    text: 'Truth -10',
    flavorGov: 'Strategic information placement.',
    flavorTruth: 'Too convenient to be coincidence!',
    cost: 4
  },
  {
    id: 'media_040',
    name: 'Anonymous Tip',
    type: 'MEDIA',
    rarity: 'common',
    text: 'Truth +10',
    flavorGov: 'Unverified source.',
    flavorTruth: 'Someone on the inside is talking!',
    cost: 4
  },
  {
    id: 'media_041',
    name: 'Viral Video',
    type: 'MEDIA',
    rarity: 'common',
    text: 'Truth +10',
    flavorGov: 'Debunked by experts.',
    flavorTruth: 'The people have eyes!',
    cost: 4
  },
  {
    id: 'media_042',
    name: 'Memory Hole',
    type: 'MEDIA',
    rarity: 'common',
    text: 'Truth -10',
    flavorGov: 'Story buried successfully.',
    flavorTruth: 'They\'re erasing history!',
    cost: 4
  },

  // MEDIA Uncommons (12 cards) - BALANCED COSTS
  {
    id: 'media_043',
    name: 'Secret Email Dump',
    type: 'MEDIA',
    rarity: 'uncommon',
    text: 'Truth +20',
    flavorGov: 'National security risk.',
    flavorTruth: 'Undeniable evidence!',
    cost: 6
  },
  {
    id: 'media_044',
    name: '24/7 News Cycle',
    type: 'MEDIA',
    rarity: 'uncommon',
    text: 'Truth -20',
    flavorGov: 'Flood the zone with nonsense.',
    flavorTruth: 'Propaganda overload!',
    cost: 6
  },
  {
    id: 'media_045',
    name: 'Coordinated Blackout',
    type: 'MEDIA',
    rarity: 'uncommon',
    text: 'Truth -20',
    flavorGov: 'All networks on message.',
    flavorTruth: 'Suspiciously synchronized silence!',
    cost: 6
  },
  {
    id: 'media_046',
    name: 'Wikileaks Release',
    type: 'MEDIA',
    rarity: 'uncommon',
    text: 'Truth +20',
    flavorGov: 'Diplomatic embarrassment.',
    flavorTruth: 'Transparency in action!',
    cost: 4
  },
  {
    id: 'media_047',
    name: 'Operation Mockingbird',
    type: 'MEDIA',
    rarity: 'uncommon',
    text: 'Truth -20',
    flavorGov: 'Media assets activated.',
    flavorTruth: 'The press is compromised!',
    cost: 4
  },
  {
    id: 'media_048',
    name: 'Banned Documentary',
    type: 'MEDIA',
    rarity: 'uncommon',
    text: 'Truth +20',
    flavorGov: 'Too dangerous for public viewing.',
    flavorTruth: 'They don\'t want you to see this!',
    cost: 4
  },
  {
    id: 'media_049',
    name: 'Astroturfing Campaign',
    type: 'MEDIA',
    rarity: 'uncommon',
    text: 'Truth -20',
    flavorGov: 'Manufactured grassroots movement.',
    flavorTruth: 'Fake outrage from paid actors!',
    cost: 4
  },
  {
    id: 'media_050',
    name: 'Insider Confession',
    type: 'MEDIA',
    rarity: 'uncommon',
    text: 'Truth +20',
    flavorGov: 'Disgruntled former employee.',
    flavorTruth: 'Conscience finally won!',
    cost: 4
  },
  {
    id: 'media_051',
    name: 'Information Warfare',
    type: 'MEDIA',
    rarity: 'uncommon',
    text: 'Truth -20',
    flavorGov: 'Psychological operations active.',
    flavorTruth: 'They\'re weaponizing our minds!',
    cost: 4
  },
  {
    id: 'media_052',
    name: 'Truth Bomb',
    type: 'MEDIA',
    rarity: 'uncommon',
    text: 'Truth +20',
    flavorGov: 'Containment protocol failed.',
    flavorTruth: 'Reality explosion imminent!',
    cost: 4
  },
  {
    id: 'media_053',
    name: 'Controlled Opposition',
    type: 'MEDIA',
    rarity: 'uncommon',
    text: 'Truth -20',
    flavorGov: 'False resistance managed.',
    flavorTruth: 'Even our rebels are fake!',
    cost: 4
  },
  {
    id: 'media_054',
    name: 'Deathbed Confession',
    type: 'MEDIA',
    rarity: 'uncommon',
    text: 'Truth +20',
    flavorGov: 'Ramblings of a dying man.',
    flavorTruth: 'Final words carry weight!',
    cost: 4
  },

  // MEDIA Rares (5 cards) - BALANCED COSTS
  {
    id: 'media_055',
    name: 'Viral Hashtag Campaign',
    type: 'MEDIA',
    rarity: 'rare',
    text: 'Truth +30',
    flavorGov: 'Astroturf movement successful.',
    flavorTruth: 'Organic uprising!',
    cost: 8
  },
  {
    id: 'media_056',
    name: 'Deepfake Broadcast',
    type: 'MEDIA',
    rarity: 'rare',
    text: 'Truth -30',
    flavorGov: 'Perfect copy, perfect lie.',
    flavorTruth: 'Something is off with their eyes.',
    cost: 8
  },
  {
    id: 'media_057',
    name: 'Mass Awakening Event',
    type: 'MEDIA',
    rarity: 'rare',
    text: 'Truth +30',
    flavorGov: 'Containment breach detected.',
    flavorTruth: 'The people are waking up!',
    cost: 8
  },
  {
    id: 'media_058',
    name: 'Total Media Control',
    type: 'MEDIA',
    rarity: 'rare',
    text: 'Truth -30',
    flavorGov: 'All channels synchronized.',
    flavorTruth: 'They own every station!',
    cost: 8
  },
  {
    id: 'media_059',
    name: 'The Pentagon Papers 2.0',
    type: 'MEDIA',
    rarity: 'rare',
    text: 'Truth +30',
    flavorGov: 'This leak is catastrophic.',
    flavorTruth: 'History repeats with digital receipts!',
    cost: 8
  },

  // MEDIA Legendary (2 cards) - BALANCED COSTS
  {
    id: 'media_060',
    name: 'Moon Landing Re-Debate',
    type: 'MEDIA',
    rarity: 'legendary',
    text: 'Truth +50 or -50 (coin flip)',
    flavorGov: 'We staged it well enough.',
    flavorTruth: 'The shadows prove everything!',
    cost: 12
  },
  {
    id: 'media_061',
    name: 'Disclosure Event',
    type: 'MEDIA',
    rarity: 'legendary',
    text: 'Truth +60',
    flavorGov: 'Wasn\'t supposed to happen yet!',
    flavorTruth: 'Finally, the UFO files are open!',
    cost: 15
  },

  // ZONE CARDS (60 cards, cost 5)
  // Commons (42 cards)
  {
    id: 'zone_001',
    name: 'Black Helicopter Patrol',
    type: 'ZONE',
    rarity: 'common',
    text: '+1 Pressure to chosen state',
    flavorGov: 'Routine exercises.',
    flavorTruth: 'They\'re circling us again!',
    cost: 5
  },
  {
    id: 'zone_002',
    name: 'Cornfield Abduction',
    type: 'ZONE',
    rarity: 'common',
    text: '+1 Pressure to chosen state',
    flavorGov: 'Rural pranksters at it again.',
    flavorTruth: 'They took Uncle Bob!',
    cost: 5
  },
  {
    id: 'zone_003',
    name: 'Haunted Walmart',
    type: 'ZONE',
    rarity: 'common',
    text: '+1 Pressure to chosen state',
    flavorGov: 'Retail expansion successful.',
    flavorTruth: 'Ghost shoppers prove it\'s cursed!',
    cost: 5
  },
  {
    id: 'zone_004',
    name: 'FEMA Camp Setup',
    type: 'ZONE',
    rarity: 'common',
    text: '+1 Pressure to chosen state',
    flavorGov: 'Emergency preparedness facility.',
    flavorTruth: 'Concentration camps in disguise!',
    cost: 5
  },
  {
    id: 'zone_005',
    name: 'Chemtrail Grid',
    type: 'ZONE',
    rarity: 'common',
    text: '+1 Pressure to chosen state',
    flavorGov: 'Weather modification testing.',
    flavorTruth: 'They\'re poisoning the sky!',
    cost: 5
  },
  {
    id: 'zone_006',
    name: 'Cell Tower Installation',
    type: 'ZONE',
    rarity: 'common',
    text: '+1 Pressure to chosen state',
    flavorGov: 'Improved connectivity.',
    flavorTruth: 'Mind control antenna deployed!',
    cost: 5
  },
  {
    id: 'zone_007',
    name: 'Secret Underground Base',
    type: 'ZONE',
    rarity: 'common',
    text: '+1 Pressure to chosen state',
    flavorGov: 'Geological survey station.',
    flavorTruth: 'They\'re building underneath us!',
    cost: 5
  },
  {
    id: 'zone_008',
    name: 'Surveillance Network',
    type: 'ZONE',
    rarity: 'common',
    text: '+1 Pressure to chosen state',
    flavorGov: 'Public safety monitoring.',
    flavorTruth: 'Big Brother is watching!',
    cost: 5
  },
  {
    id: 'zone_009',
    name: 'Crop Circle Appearance',
    type: 'ZONE',
    rarity: 'common',
    text: '+1 Pressure to chosen state',
    flavorGov: 'Artistic hoax.',
    flavorTruth: 'Alien landing pad!',
    cost: 5
  },
  {
    id: 'zone_010',
    name: 'Mysterious Military Exercise',
    type: 'ZONE',
    rarity: 'common',
    text: '+1 Pressure to chosen state',
    flavorGov: 'Training operation.',
    flavorTruth: 'Practice run for martial law!',
    cost: 5
  },
  // More zone commons (11-42)
  {
    id: 'zone_011',
    name: 'Bigfoot Sighting',
    type: 'ZONE',
    rarity: 'common',
    text: '+1 Pressure to chosen state',
    flavorGov: 'Local folklore entertainment.',
    flavorTruth: 'Cryptid territory confirmed!',
    cost: 5
  },
  {
    id: 'zone_012',
    name: 'Weather Station Anomaly',
    type: 'ZONE',
    rarity: 'common',
    text: '+1 Pressure to chosen state',
    flavorGov: 'Equipment malfunction.',
    flavorTruth: 'HAARP is active!',
    cost: 5
  },
  {
    id: 'zone_013',
    name: 'Abandoned Government Facility',
    type: 'ZONE',
    rarity: 'common',
    text: '+1 Pressure to chosen state',
    flavorGov: 'Decommissioned site.',
    flavorTruth: 'What did they leave behind?',
    cost: 5
  },
  {
    id: 'zone_014',
    name: 'UFO Landing Site',
    type: 'ZONE',
    rarity: 'common',
    text: '+1 Pressure to chosen state',
    flavorGov: 'Swamp gas reflection.',
    flavorTruth: 'Scorch marks don\'t lie!',
    cost: 5
  },
  {
    id: 'zone_015',
    name: 'Cattle Mutilation',
    type: 'ZONE',
    rarity: 'common',
    text: '+1 Pressure to chosen state',
    flavorGov: 'Predator attack.',
    flavorTruth: 'Surgical precision, no predator!',
    cost: 5
  },
  {
    id: 'zone_016',
    name: 'Illuminati Lodge',
    type: 'ZONE',
    rarity: 'common',
    text: '+1 Pressure to chosen state',
    flavorGov: 'Historical society meeting.',
    flavorTruth: 'Secret society headquarters!',
    cost: 5
  },
  {
    id: 'zone_017',
    name: 'Masonic Temple',
    type: 'ZONE',
    rarity: 'common',
    text: '+1 Pressure to chosen state',
    flavorGov: 'Charitable organization.',
    flavorTruth: 'Ancient rituals performed here!',
    cost: 5
  },
  {
    id: 'zone_018',
    name: 'Shadow Figure Sightings',
    type: 'ZONE',
    rarity: 'common',
    text: '+1 Pressure to chosen state',
    flavorGov: 'Mass hallucination.',
    flavorTruth: 'Interdimensional beings!',
    cost: 5
  },
  {
    id: 'zone_019',
    name: 'Fracking Operation',
    type: 'ZONE',
    rarity: 'common',
    text: '+1 Pressure to chosen state',
    flavorGov: 'Energy independence.',
    flavorTruth: 'Waking the sleeping giants below!',
    cost: 5
  },
  {
    id: 'zone_020',
    name: 'Bohemian Grove Gathering',
    type: 'ZONE',
    rarity: 'common',
    text: '+1 Pressure to chosen state',
    flavorGov: 'Elite networking retreat.',
    flavorTruth: 'Occult rituals in the woods!',
    cost: 5
  },
  {
    id: 'zone_021',
    name: 'GPS Jamming Zone',
    type: 'ZONE',
    rarity: 'common',
    text: '+1 Pressure to chosen state',
    flavorGov: 'Equipment testing area.',
    flavorTruth: 'They don\'t want us to navigate!',
    cost: 5
  },
  {
    id: 'zone_022',
    name: 'Vaccine Distribution Center',
    type: 'ZONE',
    rarity: 'common',
    text: '+1 Pressure to chosen state',
    flavorGov: 'Public health initiative.',
    flavorTruth: 'Mass medication program!',
    cost: 5
  },
  {
    id: 'zone_023',
    name: 'Data Collection Hub',
    type: 'ZONE',
    rarity: 'common',
    text: '+1 Pressure to chosen state',
    flavorGov: 'Cloud computing center.',
    flavorTruth: 'Digital surveillance headquarters!',
    cost: 5
  },
  {
    id: 'zone_024',
    name: 'Homeless Encampment Raid',
    type: 'ZONE',
    rarity: 'common',
    text: '+1 Pressure to chosen state',
    flavorGov: 'Public safety cleanup.',
    flavorTruth: 'Clearing potential witnesses!',
    cost: 5
  },
  {
    id: 'zone_025',
    name: 'Tesla Coil Installation',
    type: 'ZONE',
    rarity: 'common',
    text: '+1 Pressure to chosen state',
    flavorGov: 'Wireless energy research.',
    flavorTruth: 'Free energy suppression!',
    cost: 5
  },
  {
    id: 'zone_026',
    name: 'Pyramid Discovery',
    type: 'ZONE',
    rarity: 'common',
    text: '+1 Pressure to chosen state',
    flavorGov: 'Archaeological find.',
    flavorTruth: 'Ancient power source activated!',
    cost: 5
  },
  {
    id: 'zone_027',
    name: 'Mind Control Testing',
    type: 'ZONE',
    rarity: 'common',
    text: '+1 Pressure to chosen state',
    flavorGov: 'Psychological research.',
    flavorTruth: 'MK-Ultra never ended!',
    cost: 5
  },
  {
    id: 'zone_028',
    name: 'Fluoride Plant',
    type: 'ZONE',
    rarity: 'common',
    text: '+1 Pressure to chosen state',
    flavorGov: 'Dental health improvement.',
    flavorTruth: 'Calcifying our pineal glands!',
    cost: 5
  },
  {
    id: 'zone_029',
    name: 'Smart City Pilot',
    type: 'ZONE',
    rarity: 'common',
    text: '+1 Pressure to chosen state',
    flavorGov: 'Urban innovation project.',
    flavorTruth: 'Total digital control grid!',
    cost: 5
  },
  {
    id: 'zone_030',
    name: 'Drone Surveillance',
    type: 'ZONE',
    rarity: 'common',
    text: '+1 Pressure to chosen state',
    flavorGov: 'Automated monitoring.',
    flavorTruth: 'Mechanical eyes everywhere!',
    cost: 5
  },
  {
    id: 'zone_031',
    name: 'Seed Bank Facility',
    type: 'ZONE',
    rarity: 'common',
    text: '+1 Pressure to chosen state',
    flavorGov: 'Agricultural preservation.',
    flavorTruth: 'Post-apocalypse food control!',
    cost: 5
  },
  {
    id: 'zone_032',
    name: 'Quantum Computer Lab',
    type: 'ZONE',
    rarity: 'common',
    text: '+1 Pressure to chosen state',
    flavorGov: 'Next-gen computing.',
    flavorTruth: 'Reality manipulation machine!',
    cost: 5
  },
  {
    id: 'zone_033',
    name: 'Alien Artifact Storage',
    type: 'ZONE',
    rarity: 'common',
    text: '+1 Pressure to chosen state',
    flavorGov: 'Meteorite collection.',
    flavorTruth: 'ET technology warehouse!',
    cost: 5
  },
  {
    id: 'zone_034',
    name: 'Electromagnetic Pulse Test',
    type: 'ZONE',
    rarity: 'common',
    text: '+1 Pressure to chosen state',
    flavorGov: 'Infrastructure hardening.',
    flavorTruth: 'Preparing for electronic warfare!',
    cost: 5
  },
  {
    id: 'zone_035',
    name: 'Genetic Engineering Lab',
    type: 'ZONE',
    rarity: 'common',
    text: '+1 Pressure to chosen state',
    flavorGov: 'Medical advancement.',
    flavorTruth: 'Creating super soldiers!',
    cost: 5
  },
  {
    id: 'zone_036',
    name: 'Time Travel Experiment',
    type: 'ZONE',
    rarity: 'common',
    text: '+1 Pressure to chosen state',
    flavorGov: 'Theoretical physics.',
    flavorTruth: 'They\'re changing history!',
    cost: 5
  },
  {
    id: 'zone_037',
    name: 'Interdimensional Portal',
    type: 'ZONE',
    rarity: 'common',
    text: '+1 Pressure to chosen state',
    flavorGov: 'Particle accelerator.',
    flavorTruth: 'Gateway to other worlds!',
    cost: 5
  },
  {
    id: 'zone_038',
    name: 'Reptilian Shapeshifter Base',
    type: 'ZONE',
    rarity: 'common',
    text: '+1 Pressure to chosen state',
    flavorGov: 'Zoological research station.',
    flavorTruth: 'The lizard people are real!',
    cost: 5
  },
  {
    id: 'zone_039',
    name: 'Hollow Earth Entrance',
    type: 'ZONE',
    rarity: 'common',
    text: '+1 Pressure to chosen state',
    flavorGov: 'Cave system mapping.',
    flavorTruth: 'Portal to inner Earth!',
    cost: 5
  },
  {
    id: 'zone_040',
    name: 'Atlantis Ruins',
    type: 'ZONE',
    rarity: 'common',
    text: '+1 Pressure to chosen state',
    flavorGov: 'Underwater archaeology.',
    flavorTruth: 'Lost civilization found!',
    cost: 5
  },
  {
    id: 'zone_041',
    name: 'MIB Headquarters',
    type: 'ZONE',
    rarity: 'common',
    text: '+1 Pressure to chosen state',
    flavorGov: 'Federal office building.',
    flavorTruth: 'Men in Black command center!',
    cost: 5
  },
  {
    id: 'zone_042',
    name: 'Phantom Social Security',
    type: 'ZONE',
    rarity: 'common',
    text: '+1 Pressure to chosen state',
    flavorGov: 'Administrative efficiency.',
    flavorTruth: 'Creating ghost citizens!',
    cost: 5
  },

  // ZONE Uncommons (12 cards)
  {
    id: 'zone_043',
    name: 'Area 51 Security Perimeter',
    type: 'ZONE',
    rarity: 'uncommon',
    text: '+2 Pressure if Nevada',
    flavorGov: 'You saw nothing.',
    flavorTruth: 'Aliens inside!',
    cost: 5
  },
  {
    id: 'zone_044',
    name: 'Denver Airport Secrets',
    type: 'ZONE',
    rarity: 'uncommon',
    text: '+2 Pressure if Colorado',
    flavorGov: 'Artistic interpretation.',
    flavorTruth: 'Those murals tell the truth!',
    cost: 5
  },
  {
    id: 'zone_045',
    name: 'Bermuda Triangle Portal',
    type: 'ZONE',
    rarity: 'uncommon',
    text: '+2 Pressure if Florida',
    flavorGov: 'Magnetic anomaly.',
    flavorTruth: 'Ships and planes disappear here!',
    cost: 5
  },
  {
    id: 'zone_046',
    name: 'HAARP Weather Control',
    type: 'ZONE',
    rarity: 'uncommon',
    text: '+2 Pressure if Alaska',
    flavorGov: 'Ionospheric research.',
    flavorTruth: 'Weather weapon activated!',
    cost: 5
  },
  {
    id: 'zone_047',
    name: 'Dulce Base Operations',
    type: 'ZONE',
    rarity: 'uncommon',
    text: '+2 Pressure if New Mexico',
    flavorGov: 'Military installation.',
    flavorTruth: 'Human-alien hybrid lab!',
    cost: 5
  },
  {
    id: 'zone_048',
    name: 'CERN Dimension Breach',
    type: 'ZONE',
    rarity: 'uncommon',
    text: '+3 Pressure to any state',
    flavorGov: 'International cooperation.',
    flavorTruth: 'They opened a portal to hell!',
    cost: 5
  },
  {
    id: 'zone_049',
    name: 'Mount Rushmore Bunker',
    type: 'ZONE',
    rarity: 'uncommon',
    text: '+2 Pressure if South Dakota',
    flavorGov: 'Tourist attraction maintenance.',
    flavorTruth: 'Secret chamber behind the faces!',
    cost: 5
  },
  {
    id: 'zone_050',
    name: 'Cheyenne Mountain Complex',
    type: 'ZONE',
    rarity: 'uncommon',
    text: '+2 Pressure if Colorado',
    flavorGov: 'NORAD operations center.',
    flavorTruth: 'Stargate command is real!',
    cost: 5
  },
  {
    id: 'zone_051',
    name: 'Project Blue Beam Array',
    type: 'ZONE',
    rarity: 'uncommon',
    text: '+3 Pressure to any state',
    flavorGov: 'Holographic testing.',
    flavorTruth: 'Fake alien invasion prep!',
    cost: 5
  },
  {
    id: 'zone_052',
    name: 'Antarctic Research Station',
    type: 'ZONE',
    rarity: 'uncommon',
    text: '+3 Pressure to any coastal state',
    flavorGov: 'Climate research.',
    flavorTruth: 'Nazi base under the ice!',
    cost: 5
  },
  {
    id: 'zone_053',
    name: 'Silicon Valley Mind Lab',
    type: 'ZONE',
    rarity: 'uncommon',
    text: '+2 Pressure if California',
    flavorGov: 'Tech innovation hub.',
    flavorTruth: 'Digital consciousness prison!',
    cost: 5
  },
  {
    id: 'zone_054',
    name: 'Yellowstone Caldera Tap',
    type: 'ZONE',
    rarity: 'uncommon',
    text: '+2 Pressure if Wyoming',
    flavorGov: 'Geothermal monitoring.',
    flavorTruth: 'Supervolcano trigger installed!',
    cost: 5
  },

  // ZONE Rares (5 cards)
  {
    id: 'zone_055',
    name: 'Underground Bunker Network',
    type: 'ZONE',
    rarity: 'rare',
    text: '+2 Pressure anywhere',
    flavorGov: 'For continuity of government.',
    flavorTruth: 'Secret tunnels confirmed.',
    cost: 5
  },
  {
    id: 'zone_056',
    name: 'Global Surveillance Grid',
    type: 'ZONE',
    rarity: 'rare',
    text: '+1 Pressure to all states',
    flavorGov: 'Comprehensive monitoring network.',
    flavorTruth: 'They\'re watching everyone!',
    cost: 5
  },
  {
    id: 'zone_057',
    name: 'Dimensional Anchor Point',
    type: 'ZONE',
    rarity: 'rare',
    text: 'Capture any neutral state',
    flavorGov: 'Reality stabilization field.',
    flavorTruth: 'Interdimensional control node!',
    cost: 5
  },
  {
    id: 'zone_058',
    name: 'Reptilian Command Center',
    type: 'ZONE',
    rarity: 'rare',
    text: 'Capture Washington DC if possible',
    flavorGov: 'Executive coordination facility.',
    flavorTruth: 'The lizard people\'s nest!',
    cost: 5
  },
  {
    id: 'zone_059',
    name: 'New World Order Staging',
    type: 'ZONE',
    rarity: 'rare',
    text: '+3 Pressure, opponent -10 IP',
    flavorGov: 'Global governance preparation.',
    flavorTruth: 'One world government assembly!',
    cost: 5
  },

  // ZONE Legendary (2 cards)
  {
    id: 'zone_060',
    name: 'The Lost City Under Denver Airport',
    type: 'ZONE',
    rarity: 'legendary',
    text: 'Instantly capture Colorado',
    flavorGov: 'Smooth operation.',
    flavorTruth: 'We told you about the murals!',
    cost: 5
  },
  {
    id: 'zone_061',
    name: 'Hollow Earth Entrance',
    type: 'ZONE',
    rarity: 'legendary',
    text: 'Instantly capture one random Hard state',
    flavorGov: 'Don\'t dig too deep.',
    flavorTruth: 'They live below us!',
    cost: 5
  },

  // ATTACK CARDS (50 cards, cost 6)
  // Commons (35 cards)
  {
    id: 'attack_001',
    name: 'IRS Audit',
    type: 'ATTACK',
    rarity: 'common',
    text: 'Opponent -5 IP',
    flavorGov: 'Routine tax compliance.',
    flavorTruth: 'Weaponized bureaucracy!',
    cost: 6
  },
  {
    id: 'attack_002',
    name: 'Internet Blackout',
    type: 'ATTACK',
    rarity: 'common',
    text: 'Opponent loses 1 income this round',
    flavorGov: 'Network maintenance.',
    flavorTruth: 'They\'re silencing us!',
    cost: 6
  },
  {
    id: 'attack_003',
    name: 'Power Grid Failure',
    type: 'ATTACK',
    rarity: 'common',
    text: 'Opponent -5 IP',
    flavorGov: 'Infrastructure aging.',
    flavorTruth: 'Systematic sabotage!',
    cost: 6
  },
  {
    id: 'attack_004',
    name: 'Hacked Servers',
    type: 'ATTACK',
    rarity: 'common',
    text: 'Opponent discards 1 card',
    flavorGov: 'Cybersecurity exercise.',
    flavorTruth: 'They\'re stealing our data!',
    cost: 6
  },
  {
    id: 'attack_005',
    name: 'Cancel Culture Storm',
    type: 'ATTACK',
    rarity: 'common',
    text: 'Opponent -5 IP',
    flavorGov: 'Social accountability.',
    flavorTruth: 'Mob rule activated!',
    cost: 6
  },
  {
    id: 'attack_006',
    name: 'Data Leak',
    type: 'ATTACK',
    rarity: 'common',
    text: 'Opponent discards 1 card',
    flavorGov: 'Security breach contained.',
    flavorTruth: 'Your secrets are out!',
    cost: 6
  },
  {
    id: 'attack_007',
    name: 'FBI Raid',
    type: 'ATTACK',
    rarity: 'common',
    text: 'Opponent -5 IP, discard 1 card',
    flavorGov: 'Legal search warrant.',
    flavorTruth: 'Gestapo tactics!',
    cost: 6
  },
  {
    id: 'attack_008',
    name: 'Bot Swarm',
    type: 'ATTACK',
    rarity: 'common',
    text: 'Opponent -5 IP',
    flavorGov: 'Automated responses.',
    flavorTruth: 'Fake account army!',
    cost: 6
  },
  {
    id: 'attack_009',
    name: 'Economic Sanctions',
    type: 'ATTACK',
    rarity: 'common',
    text: 'Opponent loses 1 income this round',
    flavorGov: 'Diplomatic pressure.',
    flavorTruth: 'Financial warfare!',
    cost: 6
  },
  {
    id: 'attack_010',
    name: 'False Flag Operation',
    type: 'ATTACK',
    rarity: 'common',
    text: 'Opponent -5 IP',
    flavorGov: 'National security response.',
    flavorTruth: 'They did it themselves!',
    cost: 6
  },
  {
    id: 'attack_011',
    name: 'Media Assassination',
    type: 'ATTACK',
    rarity: 'common',
    text: 'Opponent discards 1 card',
    flavorGov: 'Character defamation.',
    flavorTruth: 'Destroying reputations!',
    cost: 6
  },
  {
    id: 'attack_012',
    name: 'Supply Chain Disruption',
    type: 'ATTACK',
    rarity: 'common',
    text: 'Opponent -5 IP',
    flavorGov: 'Global logistics issue.',
    flavorTruth: 'Orchestrated shortages!',
    cost: 6
  },
  {
    id: 'attack_013',
    name: 'Social Credit Punishment',
    type: 'ATTACK',
    rarity: 'common',
    text: 'Opponent loses 1 income this round',
    flavorGov: 'Behavior modification.',
    flavorTruth: 'Totalitarian control system!',
    cost: 6
  },
  {
    id: 'attack_014',
    name: 'Satellite Interference',
    type: 'ATTACK',
    rarity: 'common',
    text: 'Opponent discards 1 card',
    flavorGov: 'Technical difficulties.',
    flavorTruth: 'Space-based warfare!',
    cost: 6
  },
  {
    id: 'attack_015',
    name: 'Drone Strike',
    type: 'ATTACK',
    rarity: 'common',
    text: 'Opponent -5 IP',
    flavorGov: 'Precision targeting.',
    flavorTruth: 'Killer robots overhead!',
    cost: 6
  },
  {
    id: 'attack_016',
    name: 'Psyop Campaign',
    type: 'ATTACK',
    rarity: 'common',
    text: 'Opponent discards 1 card',
    flavorGov: 'Psychological operations.',
    flavorTruth: 'Mind control propaganda!',
    cost: 6
  },
  {
    id: 'attack_017',
    name: 'Bank Account Freeze',
    type: 'ATTACK',
    rarity: 'common',
    text: 'Opponent -5 IP',
    flavorGov: 'Financial regulations.',
    flavorTruth: 'Economic imprisonment!',
    cost: 6
  },
  {
    id: 'attack_018',
    name: 'Honeypot Trap',
    type: 'ATTACK',
    rarity: 'common',
    text: 'Opponent discards 1 card',
    flavorGov: 'Intelligence gathering.',
    flavorTruth: 'They set us up!',
    cost: 6
  },
  {
    id: 'attack_019',
    name: 'Vaccine Mandate',
    type: 'ATTACK',
    rarity: 'common',
    text: 'Opponent -5 IP',
    flavorGov: 'Public health measure.',
    flavorTruth: 'Forced medical compliance!',
    cost: 6
  },
  {
    id: 'attack_020',
    name: 'Travel Restrictions',
    type: 'ATTACK',
    rarity: 'common',
    text: 'Opponent loses 1 income this round',
    flavorGov: 'Safety protocols.',
    flavorTruth: 'Freedom of movement denied!',
    cost: 6
  },
  {
    id: 'attack_021',
    name: 'Blackmail Campaign',
    type: 'ATTACK',
    rarity: 'common',
    text: 'Opponent discards 1 card',
    flavorGov: 'Leverage acquisition.',
    flavorTruth: 'They have dirt on everyone!',
    cost: 6
  },
  {
    id: 'attack_022',
    name: 'Engineered Crisis',
    type: 'ATTACK',
    rarity: 'common',
    text: 'Opponent -5 IP',
    flavorGov: 'Opportunity from chaos.',
    flavorTruth: 'Problem-reaction-solution!',
    cost: 6
  },
  {
    id: 'attack_023',
    name: 'Coordinated Takedown',
    type: 'ATTACK',
    rarity: 'common',
    text: 'Opponent discards 1 card',
    flavorGov: 'Multi-platform enforcement.',
    flavorTruth: 'Censorship conspiracy!',
    cost: 6
  },
  {
    id: 'attack_024',
    name: 'Deep State Activation',
    type: 'ATTACK',
    rarity: 'common',
    text: 'Opponent -5 IP',
    flavorGov: 'Career bureaucrats mobilized.',
    flavorTruth: 'Shadow government revealed!',
    cost: 6
  },
  {
    id: 'attack_025',
    name: 'Astroturfing Mob',
    type: 'ATTACK',
    rarity: 'common',
    text: 'Opponent discards 1 card',
    flavorGov: 'Grassroots movement.',
    flavorTruth: 'Paid protesters everywhere!',
    cost: 6
  },
  {
    id: 'attack_026',
    name: 'Digital Currency Control',
    type: 'ATTACK',
    rarity: 'common',
    text: 'Opponent loses 1 income this round',
    flavorGov: 'Modernizing payments.',
    flavorTruth: 'Cash is freedom!',
    cost: 6
  },
  {
    id: 'attack_027',
    name: 'Manufactured Shortage',
    type: 'ATTACK',
    rarity: 'common',
    text: 'Opponent -5 IP',
    flavorGov: 'Market dynamics.',
    flavorTruth: 'Artificial scarcity!',
    cost: 6
  },
  {
    id: 'attack_028',
    name: 'Character Assassination',
    type: 'ATTACK',
    rarity: 'common',
    text: 'Opponent discards 1 card',
    flavorGov: 'Reputation management.',
    flavorTruth: 'Destroying truth-tellers!',
    cost: 6
  },
  {
    id: 'attack_029',
    name: 'Regulatory Capture',
    type: 'ATTACK',
    rarity: 'common',
    text: 'Opponent -5 IP',
    flavorGov: 'Industry oversight.',
    flavorTruth: 'Foxes guarding henhouses!',
    cost: 6
  },
  {
    id: 'attack_030',
    name: 'Information Overload',
    type: 'ATTACK',
    rarity: 'common',
    text: 'Opponent discards 1 card',
    flavorGov: 'Comprehensive disclosure.',
    flavorTruth: 'Hiding truth in noise!',
    cost: 6
  },
  {
    id: 'attack_031',
    name: 'Targeted Harassment',
    type: 'ATTACK',
    rarity: 'common',
    text: 'Opponent -5 IP',
    flavorGov: 'Community policing.',
    flavorTruth: 'Gang stalking tactics!',
    cost: 6
  },
  {
    id: 'attack_032',
    name: 'Professional Destruction',
    type: 'ATTACK',
    rarity: 'common',
    text: 'Opponent loses 1 income this round',
    flavorGov: 'Career consequences.',
    flavorTruth: 'Destroying livelihoods!',
    cost: 6
  },
  {
    id: 'attack_033',
    name: 'Legal Lawfare',
    type: 'ATTACK',
    rarity: 'common',
    text: 'Opponent -5 IP',
    flavorGov: 'Justice system utilization.',
    flavorTruth: 'Weaponized litigation!',
    cost: 6
  },
  {
    id: 'attack_034',
    name: 'Mind Control Signal',
    type: 'ATTACK',
    rarity: 'common',
    text: 'Opponent discards 1 card',
    flavorGov: 'Telecommunications upgrade.',
    flavorTruth: '5G brainwave manipulation!',
    cost: 6
  },
  {
    id: 'attack_035',
    name: 'Weather Weapon',
    type: 'ATTACK',
    rarity: 'common',
    text: 'Opponent -5 IP',
    flavorGov: 'Natural disaster relief.',
    flavorTruth: 'HAARP hurricane deployment!',
    cost: 6
  },

  // ATTACK Uncommons (10 cards)
  {
    id: 'attack_036',
    name: 'Meme Warfare',
    type: 'ATTACK',
    rarity: 'uncommon',
    text: 'Opponent discards 1 random card',
    flavorGov: 'Deploy distraction cats.',
    flavorTruth: 'Our memes are stronger.',
    cost: 6
  },
  {
    id: 'attack_037',
    name: 'Project Mockingbird',
    type: 'ATTACK',
    rarity: 'uncommon',
    text: 'Opponent -10 IP',
    flavorGov: 'Media coordination protocol.',
    flavorTruth: 'Journalists are CIA assets!',
    cost: 6
  },
  {
    id: 'attack_038',
    name: 'False Memory Implant',
    type: 'ATTACK',
    rarity: 'uncommon',
    text: 'Opponent discards 2 cards',
    flavorGov: 'Therapeutic intervention.',
    flavorTruth: 'They\'re rewriting our minds!',
    cost: 6
  },
  {
    id: 'attack_039',
    name: 'Targeted Individual Program',
    type: 'ATTACK',
    rarity: 'uncommon',
    text: 'Opponent -10 IP, loses 1 income',
    flavorGov: 'Behavioral monitoring study.',
    flavorTruth: 'Electronic torture system!',
    cost: 6
  },
  {
    id: 'attack_040',
    name: 'Operation Chaos',
    type: 'ATTACK',
    rarity: 'uncommon',
    text: 'Opponent loses 1 state randomly',
    flavorGov: 'Controlled destabilization.',
    flavorTruth: 'Creating disorder on purpose!',
    cost: 6
  },
  {
    id: 'attack_041',
    name: 'MK-Ultra Activation',
    type: 'ATTACK',
    rarity: 'uncommon',
    text: 'Opponent discards 2 cards',
    flavorGov: 'Sleeper agent protocols.',
    flavorTruth: 'Mind-controlled assassins!',
    cost: 6
  },
  {
    id: 'attack_042',
    name: 'Electromagnetic Pulse',
    type: 'ATTACK',
    rarity: 'uncommon',
    text: 'Opponent -10 IP',
    flavorGov: 'Infrastructure hardening test.',
    flavorTruth: 'Electronic warfare attack!',
    cost: 6
  },
  {
    id: 'attack_043',
    name: 'Subliminal Programming',
    type: 'ATTACK',
    rarity: 'uncommon',
    text: 'Opponent discards 2 cards',
    flavorGov: 'Advertising effectiveness study.',
    flavorTruth: 'Hidden messages in media!',
    cost: 6
  },
  {
    id: 'attack_044',
    name: 'Social Engineering Attack',
    type: 'ATTACK',
    rarity: 'uncommon',
    text: 'Opponent -10 IP, discards 1 card',
    flavorGov: 'Psychological influence tactics.',
    flavorTruth: 'Manipulating human behavior!',
    cost: 6
  },
  {
    id: 'attack_045',
    name: 'Controlled Opposition Reveal',
    type: 'ATTACK',
    rarity: 'uncommon',
    text: 'Opponent loses 1 income, discards 1 card',
    flavorGov: 'Asset exposure calculated.',
    flavorTruth: 'Even our leaders are fake!',
    cost: 6
  },

  // ATTACK Rares (4 cards)
  {
    id: 'attack_046',
    name: 'Directed Energy Attack',
    type: 'ATTACK',
    rarity: 'rare',
    text: 'Opponent -10 IP and discard 1',
    flavorGov: 'Satellite test successful.',
    flavorTruth: 'Microwave guns on rooftops!',
    cost: 6
  },
  {
    id: 'attack_047',
    name: 'Mass Mind Control Event',
    type: 'ATTACK',
    rarity: 'rare',
    text: 'Opponent discards 3 cards',
    flavorGov: 'Public opinion synchronized.',
    flavorTruth: 'Collective consciousness hijacked!',
    cost: 6
  },
  {
    id: 'attack_048',
    name: 'Digital Assassination',
    type: 'ATTACK',
    rarity: 'rare',
    text: 'Opponent -15 IP, lose 1 income',
    flavorGov: 'Identity erasure complete.',
    flavorTruth: 'Deleted from existence!',
    cost: 6
  },
  {
    id: 'attack_049',
    name: 'Revelation of the Method',
    type: 'ATTACK',
    rarity: 'rare',
    text: 'Opponent loses 2 states randomly',
    flavorGov: 'Predictive programming success.',
    flavorTruth: 'They told us what they\'d do!',
    cost: 6
  },

  // ATTACK Legendary (1 card)
  {
    id: 'attack_050',
    name: 'Project Blue Beam',
    type: 'ATTACK',
    rarity: 'legendary',
    text: 'Create illusion: force opponent to lose 1 state instantly',
    flavorGov: 'Convincing show.',
    flavorTruth: 'They\'re faking the apocalypse!',
    cost: 6
  },

  // DEFENSIVE CARDS (30 cards, cost 3)
  // Commons (21 cards)
  {
    id: 'defense_001',
    name: 'Tinfoil Hat',
    type: 'DEFENSIVE',
    rarity: 'common',
    text: 'Block 1 Attack',
    flavorGov: 'Ridiculous fashion.',
    flavorTruth: 'Essential headgear.',
    cost: 3
  },
  {
    id: 'defense_002',
    name: 'Firewall',
    type: 'DEFENSIVE',
    rarity: 'common',
    text: 'Block 1 IP attack',
    flavorGov: 'Secure systems.',
    flavorTruth: 'VPN enabled.',
    cost: 3
  },
  {
    id: 'defense_003',
    name: 'Faraday Cage',
    type: 'DEFENSIVE',
    rarity: 'common',
    text: 'Block 1 Attack',
    flavorGov: 'Electromagnetic shielding.',
    flavorTruth: 'Signal-proof sanctuary.',
    cost: 3
  },
  {
    id: 'defense_004',
    name: 'Burner Phone',
    type: 'DEFENSIVE',
    rarity: 'common',
    text: 'Block 1 discard attack',
    flavorGov: 'Disposable communications.',
    flavorTruth: 'They can\'t track this.',
    cost: 3
  },
  {
    id: 'defense_005',
    name: 'Safe House',
    type: 'DEFENSIVE',
    rarity: 'common',
    text: 'Block 1 Attack',
    flavorGov: 'Secure location.',
    flavorTruth: 'Off-grid hideout.',
    cost: 3
  },
  {
    id: 'defense_006',
    name: 'Dead Man\'s Switch',
    type: 'DEFENSIVE',
    rarity: 'common',
    text: 'Block 1 Attack',
    flavorGov: 'Insurance policy.',
    flavorTruth: 'Truth will come out!',
    cost: 3
  },
  {
    id: 'defense_007',
    name: 'Encrypted Communications',
    type: 'DEFENSIVE',
    rarity: 'common',
    text: 'Block 1 discard attack',
    flavorGov: 'Secure channels.',
    flavorTruth: 'They can\'t crack this code.',
    cost: 3
  },
  {
    id: 'defense_008',
    name: 'Anonymous Proxy',
    type: 'DEFENSIVE',
    rarity: 'common',
    text: 'Block 1 Attack',
    flavorGov: 'Digital anonymity.',
    flavorTruth: 'Hidden identity online.',
    cost: 3
  },
  {
    id: 'defense_009',
    name: 'Loyal Bodyguard',
    type: 'DEFENSIVE',
    rarity: 'common',
    text: 'Block 1 Attack',
    flavorGov: 'Personal protection.',
    flavorTruth: 'Someone we can trust.',
    cost: 3
  },
  {
    id: 'defense_010',
    name: 'Emergency Broadcast',
    type: 'DEFENSIVE',
    rarity: 'common',
    text: 'Block 1 Attack, draw 1 card',
    flavorGov: 'Public alert system.',
    flavorTruth: 'Getting word out fast!',
    cost: 3
  },
  {
    id: 'defense_011',
    name: 'Legal Immunity',
    type: 'DEFENSIVE',
    rarity: 'common',
    text: 'Block 1 Attack',
    flavorGov: 'Official protection.',
    flavorTruth: 'Whistleblower status.',
    cost: 3
  },
  {
    id: 'defense_012',
    name: 'Public Sympathy',
    type: 'DEFENSIVE',
    rarity: 'common',
    text: 'Block 1 Attack',
    flavorGov: 'Damage control activated.',
    flavorTruth: 'The people are with us!',
    cost: 3
  },
  {
    id: 'defense_013',
    name: 'Backup Server',
    type: 'DEFENSIVE',
    rarity: 'common',
    text: 'Block 1 discard attack',
    flavorGov: 'Redundant systems.',
    flavorTruth: 'Data preserved elsewhere.',
    cost: 3
  },
  {
    id: 'defense_014',
    name: 'Foreign Asylum',
    type: 'DEFENSIVE',
    rarity: 'common',
    text: 'Block 1 Attack',
    flavorGov: 'Diplomatic complications.',
    flavorTruth: 'Safe haven found.',
    cost: 3
  },
  {
    id: 'defense_015',
    name: 'Crowd Funding',
    type: 'DEFENSIVE',
    rarity: 'common',
    text: 'Block 1 IP attack',
    flavorGov: 'Public money laundering.',
    flavorTruth: 'Strength in numbers!',
    cost: 3
  },
  {
    id: 'defense_016',
    name: 'Martyrdom Threat',
    type: 'DEFENSIVE',
    rarity: 'common',
    text: 'Block 1 Attack',
    flavorGov: 'Calculated risk assessment.',
    flavorTruth: 'Death would prove everything!',
    cost: 3
  },
  {
    id: 'defense_017',
    name: 'Media Attention',
    type: 'DEFENSIVE',
    rarity: 'common',
    text: 'Block 1 Attack',
    flavorGov: 'Unwanted spotlight.',
    flavorTruth: 'Publicity is protection!',
    cost: 3
  },
  {
    id: 'defense_018',
    name: 'Plausible Deniability',
    type: 'DEFENSIVE',
    rarity: 'common',
    text: 'Block 1 Attack',
    flavorGov: 'Official cover story.',
    flavorTruth: 'They can\'t prove anything.',
    cost: 3
  },
  {
    id: 'defense_019',
    name: 'Digital Redundancy',
    type: 'DEFENSIVE',
    rarity: 'common',
    text: 'Block 1 discard attack',
    flavorGov: 'Multiple backups.',
    flavorTruth: 'Truth backed up everywhere!',
    cost: 3
  },
  {
    id: 'defense_020',
    name: 'Underground Network',
    type: 'DEFENSIVE',
    rarity: 'common',
    text: 'Block 1 Attack',
    flavorGov: 'Cells activated.',
    flavorTruth: 'Resistance is organized!',
    cost: 3
  },
  {
    id: 'defense_021',
    name: 'Counter-Intelligence',
    type: 'DEFENSIVE',
    rarity: 'common',
    text: 'Block 1 Attack',
    flavorGov: 'Our security is impenetrable.',
    flavorTruth: 'We saw that coming!',
    cost: 3
  },

  // DEFENSIVE Uncommons (6 cards)
  {
    id: 'defense_022',
    name: 'Counter-Surveillance',
    type: 'DEFENSIVE',
    rarity: 'uncommon',
    text: 'Block 1 Attack, draw 1 card',
    flavorGov: 'Eyes everywhere.',
    flavorTruth: 'They can\'t see us now.',
    cost: 3
  },
  {
    id: 'defense_023',
    name: 'Information Compartmentalization',
    type: 'DEFENSIVE',
    rarity: 'uncommon',
    text: 'Block 2 discard attacks',
    flavorGov: 'Need-to-know basis.',
    flavorTruth: 'Secrets within secrets.',
    cost: 3
  },
  {
    id: 'defense_024',
    name: 'Double Agent',
    type: 'DEFENSIVE',
    rarity: 'uncommon',
    text: 'Block 1 Attack, +5 IP',
    flavorGov: 'Asset still useful.',
    flavorTruth: 'Playing both sides.',
    cost: 3
  },
  {
    id: 'defense_025',
    name: 'Conspiracy of Silence',
    type: 'DEFENSIVE',
    rarity: 'uncommon',
    text: 'Block all attacks this turn',
    flavorGov: 'Omerta activated.',
    flavorTruth: 'Nobody talks.',
    cost: 3
  },
  {
    id: 'defense_026',
    name: 'Quantum Encryption',
    type: 'DEFENSIVE',
    rarity: 'uncommon',
    text: 'Block 2 attacks, draw 1 card',
    flavorGov: 'Unbreakable codes.',
    flavorTruth: 'Physics-level security!',
    cost: 3
  },
  {
    id: 'defense_027',
    name: 'Distributed Network',
    type: 'DEFENSIVE',
    rarity: 'uncommon',
    text: 'Block 2 attacks',
    flavorGov: 'Decentralized operations.',
    flavorTruth: 'Can\'t kill what has no head!',
    cost: 3
  },

  // DEFENSIVE Rares (2 cards)
  {
    id: 'defense_028',
    name: 'Underground Safehouse',
    type: 'DEFENSIVE',
    rarity: 'rare',
    text: 'Block 2 Attacks this turn',
    flavorGov: 'VIP secured.',
    flavorTruth: 'Basement HQ operational.',
    cost: 3
  },
  {
    id: 'defense_029',
    name: 'Mirror Shield Protocol',
    type: 'DEFENSIVE',
    rarity: 'rare',
    text: 'Block and reflect 1 Attack',
    flavorGov: 'Deflection successful.',
    flavorTruth: 'Your attack backfired!',
    cost: 3
  },

  // DEFENSIVE Legendary (1 card)
  {
    id: 'defense_030',
    name: 'Divine Prophecy',
    type: 'DEFENSIVE',
    rarity: 'legendary',
    text: 'Block and reflect 1 Attack',
    flavorGov: 'Religious cover story.',
    flavorTruth: 'Pastor Rex was right!',
    cost: 3
  }
];

// Helper functions for card management
export const getCardsByType = (type: GameCard['type']) => 
  CARD_DATABASE.filter(card => card.type === type);

export const getCardsByRarity = (rarity: GameCard['rarity']) => 
  CARD_DATABASE.filter(card => card.rarity === rarity);

export const getRandomCards = (count: number, filters?: {
  type?: GameCard['type'];
  rarity?: GameCard['rarity'];
}): GameCard[] => {
  let pool = CARD_DATABASE;
  
  if (filters?.type) {
    pool = pool.filter(card => card.type === filters.type);
  }
  
  if (filters?.rarity) {
    pool = pool.filter(card => card.rarity === filters.rarity);
  }
  
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

export const getCardById = (id: string): GameCard | undefined => 
  CARD_DATABASE.find(card => card.id === id);

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
    
    const cardsOfRarity = getCardsByRarity(rarity);
    if (cardsOfRarity.length > 0) {
      const randomCard = cardsOfRarity[Math.floor(Math.random() * cardsOfRarity.length)];
      deck.push(randomCard);
    }
  }
  
  return deck;
};