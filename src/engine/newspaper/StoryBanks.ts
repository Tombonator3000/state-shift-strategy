import type { Card } from '@/types';

const buildSentences = (
  subjects: string[],
  verbs: string[],
  objects: string[],
  codas: string[],
  desired = 140,
): string[] => {
  const results: string[] = [];
  for (const subject of subjects) {
    for (const verb of verbs) {
      for (const object of objects) {
        for (const coda of codas) {
          results.push(`${subject} ${verb} ${object}${coda}.`);
          if (results.length >= desired) {
            return results;
          }
        }
      }
    }
  }
  return results;
};

const ATTACK_SUBJECTS = [
  'Shadow courier',
  'Rogue archivist',
  'Sleepless analyst',
  'Wire-tapped intern',
  'Basement operative',
  'Courier drone',
  'Budget insurgent',
  'Foil-lined whistleblower',
  'Sardonic aide',
  'Leak-hungry reporter',
  'Unpaid informant',
  'Midnight fact-checker',
];

const ATTACK_VERBS = [
  'torches',
  'shreds',
  'intercepts',
  'ambushes',
  'detonates',
  'short-circuits',
  'overloads',
  'scrambles',
  'jams',
  'unmasks',
  'punctures',
  'steamrolls',
];

const ATTACK_OBJECTS = [
  'the agency firewall',
  'a classified whiteboard',
  'morale briefings',
  'the bureaucratic sandbag line',
  'security talking points',
  'a secret handshake',
  'their optimism index',
  'a smug spreadsheet',
  'backup generators',
  'shredded memos',
  'deflection playbooks',
  'quarterly audits',
];

const ATTACK_CODAS = [
  ' before the coffee cools',
  ' while alarms gossip softly',
  ' as fluorescent lights flicker',
  ' during an unsanctioned fire drill',
  ' in a shower of redacted confetti',
  ' moments after curfew',
  ' while management drafts denials',
  ' beneath the hum of secret vents',
  ' during a mandatory trust fall',
  ' with cameras rolling in night vision',
  ' while the opposition refreshes dashboards',
  ' amid panicked photocopiers',
];

const MEDIA_SUBJECTS = [
  'Signal pirate',
  'Neon pundit',
  'Anonymous host',
  'Conspiracy vlogger',
  'Satellite intern',
  'Studio gremlin',
  'Algorithm wrangler',
  'Ratings shaman',
  'Narrative sculptor',
  'Overcaffeinated producer',
  'Laser pointer journalist',
  'Broadcast renegade',
];

const MEDIA_VERBS = [
  'loops',
  'boosts',
  'elevates',
  'fries',
  'reroutes',
  'dubs',
  'auto-tunes',
  'beams',
  'syndicates',
  'remixes',
  'hyperlinks',
  'supersizes',
];

const MEDIA_OBJECTS = [
  'the national feed',
  'late-night monologues',
  'mid-scroll attention spans',
  'focus group results',
  'emergency crawl text',
  'conspiracy playlists',
  'holographic chyrons',
  'meme stock tickers',
  'hushed podcasts',
  'truth-meter graphics',
  'studio teleprompters',
  'dorm-room watch parties',
];

const MEDIA_CODAS = [
  ' while viewers screenshot wildly',
  ' as pundits practice outrage faces',
  ' before the sponsor reads finish',
  ' while chat moderators hallucinate rules',
  ' during a glitch-art cold open',
  ' while fact-checkers rehearse sighs',
  ' as broadcasters juggle breaking banners',
  ' mid-call with the censors',
  ' as interns tape foil to antennas',
  ' while subscribers spam emojis',
  ' during a surprise ratings audit',
  ' while algorithms chase their tails',
];

const ZONE_SUBJECTS = [
  'Clip-board phalanx',
  'Parade marshal',
  'Door-knock envoy',
  'Precinct fixer',
  'Rally hype squad',
  'Parking lot oracle',
  'County tactician',
  'Logistics conjurer',
  'Volunteer swarm',
  'Canvass bard',
  'Foldable table general',
  'Field mythographer',
];

const ZONE_VERBS = [
  'surges through',
  'rewires',
  'floods',
  'rewrites',
  'barricades',
  'enchants',
  'map-bombs',
  'commandeers',
  'overfills',
  'sonic-booms',
  'monograms',
  'sublets',
];

const ZONE_OBJECTS = [
  'swing-state diners',
  'mall food courts',
  'community bulletin boards',
  'county clerk lobbies',
  'zoning hearings',
  'parking garage command posts',
  'folding chair stockpiles',
  'backroom coffee urns',
  'sleep-deprived staging areas',
  'town square rumor mills',
  'bus depot megaphones',
  'overbooked meeting halls',
];

const ZONE_CODAS = [
  ' until curfews evaporate',
  ' while traffic cones applaud',
  ' as residents livestream from balconies',
  ' during a weather advisory override',
  ' with marching band reverberations',
  ' while election officials find folding tables',
  ' as precinct captains whisper code words',
  ' while fog machines malfunction',
  ' amid emergency snack deployments',
  ' while megaphones harmonize badly',
  ' during a midnight pep rally',
  ' as drones sketch logos in contrails',
];

const NEUTRAL_SUBJECTS = [
  'Chronicle intern',
  'Suspicious pigeon',
  'Budget telepath',
  'Anonymous juror',
  'Desk plant',
  'Mysterious scheduler',
  'Archivist phantom',
  'Fax machine gremlin',
  'Coffee cart truth-seeker',
  'Wormhole stenographer',
  'Lobby historian',
  'Tin-foil tailor',
];

const NEUTRAL_VERBS = [
  'notes',
  'annotates',
  'documents',
  'cross-references',
  'spins',
  'foreshadows',
  'teases',
  'leaves clues for',
  'stage-manages',
  'bookmarks',
  'files under',
  'whispers about',
];

const NEUTRAL_OBJECTS = [
  'low-level anomalies',
  'overlapping conspiracies',
  'memos with teeth marks',
  'time-stamped coincidences',
  'rumors in escrow',
  'budget line riddles',
  'interoffice portents',
  'oracle voicemails',
  'precognitive sticky notes',
  'holographic water coolers',
  'paranoid crossword puzzles',
  'revolving door schematics',
];

const NEUTRAL_CODAS = [
  ' because the vibes demanded it',
  ' before the glitch resets again',
  ' for posterity and plausible deniability',
  ' while the jukebox plays backwards',
  ' mid-meeting with spectral auditors',
  ' while the break room whispers',
  ' between suspicious thunderclaps',
  ' amid rumors of a secret annex',
  ' while the elevator refuses floor thirteen',
  ' during a mandatory vibes check',
  ' because the stars filed a FOIA',
  ' under limited cosmic supervision',
];

export const STORY_BANKS: Record<'ATTACK' | 'MEDIA' | 'ZONE' | 'NEUTRAL', string[]> = {
  ATTACK: buildSentences(ATTACK_SUBJECTS, ATTACK_VERBS, ATTACK_OBJECTS, ATTACK_CODAS, 160),
  MEDIA: buildSentences(MEDIA_SUBJECTS, MEDIA_VERBS, MEDIA_OBJECTS, MEDIA_CODAS, 160),
  ZONE: buildSentences(ZONE_SUBJECTS, ZONE_VERBS, ZONE_OBJECTS, ZONE_CODAS, 160),
  NEUTRAL: buildSentences(NEUTRAL_SUBJECTS, NEUTRAL_VERBS, NEUTRAL_OBJECTS, NEUTRAL_CODAS, 160),
};

export const HEADLINE_VERBS: Record<Card['type'], string[]> = {
  ATTACK: [
    'BURNS COVER STORY',
    'CRASHES SECURITY DRILL',
    'TORPEDOES CONTROL ROOM',
    'POPS REDACTION BUBBLE',
    'SHREDS SMOKE SCREEN',
    'RIPS OPEN OPERATIONS',
    'DERAILS BUREAU PLAN',
    'IGNITES PANIC INDEX',
  ],
  MEDIA: [
    'OVERRIDES PRIME TIME',
    'HIJACKS NEWS CYCLE',
    'DROWNS GOVERNMENT SPIN',
    'VIRALIZES LEAKED CLIP',
    'JAMS OFFICIAL SIGNAL',
    'LOOPS EVIDENCE ON AIR',
    'BAPTIZES AUDIENCE IN STATIC',
    'PUMPS FEEDS WITH GLITCHES',
  ],
  ZONE: [
    'SEIZES STREET LEVEL',
    'OVERRUNS PRECINCT',
    'SURGES PAST ROADBLOCKS',
    'FORTIFIES STATE LINES',
    'ELEVATES GROUND GAME',
    'ENCIRCLES SKEPTIC ZONE',
    'FLOODS DISTRICT HQ',
    'ANCHORS FIELD NETWORK',
  ],
};

export const SUBHEAD_BANKS: {
  faction: Record<string, string[]>;
  type: Record<Card['type'], string[]>;
  generic: string[];
} = {
  faction: {
    truth: [
      'Operatives swear the evidence hummed back.',
      'Truth syndicate claims charts have gone feral.',
      'Witnesses report tinfoil confetti raining indoors.',
      'Insiders pass around glow-in-the-dark affidavits.',
    ],
    government: [
      'Agency spokesperson restarts the denial generator.',
      'Containment desk insists panic is recreational.',
      'Official channels cite “scheduled secrecy maintenance.”',
      'Briefing room plants rustle ominously but stay mum.',
    ],
  },
  type: {
    ATTACK: [
      'Collateral paperwork still smoking.',
      'Security badges demagnetized in the fray.',
      'Counter-spin department reports dizziness.',
      'Anonymous aide whispers “We lost the script.”',
    ],
    MEDIA: [
      'Ratings surge faster than the censors can sprint.',
      'Comment sections overflow with encrypted winks.',
      'Studio control boards emit suspicious jazz.',
      'Livestream chat coins twelve new conspiracy emojis.',
    ],
    ZONE: [
      'Ground teams unfurl maps wider than the avenue.',
      'Parade route barricades now considered souvenirs.',
      'Clipboard brigades capture every table in sight.',
      'District mascots allegedly join the chant.',
    ],
  },
  generic: [
    'Sources deny the denial is a denial.',
    'Experts rate the situation “spicy with a hint of déjà vu.”',
    'Memos warn of narrative turbulence through the weekend.',
    'Official coffee machines enter silent protest mode.',
    'Desk lamps blink Morse code for “duck.”',
    'Security corridors now BYO tinfoil.',
  ],
};

export const TAG_INJECTIONS: Record<string, string[]> = {
  '#CryptidWatch': [
    'Cryptid spotters cross-reference footprints with budget leaks.',
    'Night vision reveals antlered silhouettes signing autographs.',
    'Experts debate if the roar was a yeti or a loose HVAC vent.',
  ],
  '#PumpkinSpicePanic': [
    'Seasonal lattes now require paranormal waivers.',
    'Jack-o’-lantern lighting crews demand hazard pay in candy corn.',
    'Capes and cloaks sold out before sunrise—again.',
  ],
  '#ContactProtocol': [
    'Radar techs swear the blip winked at them in Morse.',
    'Beam team requisitions extra sunglasses for post-contact glare.',
    'Phone banks reroute calls from “space unknown” to voicemail.',
  ],
  '#MonsterMashup': [
    'Emergency DJ asked to remix the wails into a dance beat.',
    'Fog machine union issues cease-and-desist on dramatic entrances.',
    'Silver bullet budget hearings moved to the moonlight shift.',
  ],
  '#RedactedOps': [
    'Briefing packets arrive pre-shredded for convenience.',
    'Laser pointers identify six separate scapegoats.',
    'Elevator music replaced with ominous thudding bass.',
  ],
  '#FieldWorkFrenzy': [
    'Clipboards multiply faster than the copy room can count.',
    'Volunteers report sneakers squeaking in triumphant harmony.',
    'Traffic cones promoted to honorary colonels.',
  ],
  '#LeakSeason': [
    'Umbrellas deploy indoors as truth drips from fluorescent fixtures.',
    'Whistleblowers swap ponchos for VIP seats by the leak fountain.',
    'Collectors bid on limited-edition drip buckets stamped CLASSIFIED.',
  ],
  '#NarrativeContainment': [
    'Containment vans idle while agents tape stray rumors to clipboards.',
    'Firewall marshals shovel canned talking points into the breach.',
    'Spokespeople herd gossip into color-coded binders by flashlight.',
  ],
  '#TruthSignal': [
    'Ham radio clusters triangulate the freshest truth pings.',
    'Basement antennas hum in jubilation at the resonance spike.',
    'Fact scouts synchronize watches to the latest honesty flare.',
  ],
  '#ContainmentBureau': [
    'Briefers pin medals on the steadiest bureaucratic poker faces.',
    'Clipboard brigades salute the official silence without blinking.',
    'Budget czars remind staff the paperwork already won this round.',
  ],
  '#DirectAction': [
    'Boot prints smear across the incident command whiteboard.',
    'Emergency sirens harmonize with rapid-fire press releases.',
    'Operatives high-five over evidence crates still sparking.',
  ],
  '#BroadcastSpin': [
    'Studio gels melt under the rebuttal reel’s intensity.',
    'Teleprompters flash hazard warnings between every bullet point.',
    'Makeup crews contour panic into heroic resolve on air.',
  ],
  '#GroundSurge': [
    'Field kitchens ladle morale stew into collapsible mugs.',
    'Clipboard caravans annex every folding chair in sight.',
    'Marching orders echo down cul-de-sacs until porch lights salute.',
  ],
  '#ParanoidPress': [
    'Interns refresh the rumor CMS twice a heartbeat.',
    'Newsroom houseplants lean closer to catch the whisper net.',
    'Editors stockpile midnight toner for the next revelation.',
  ],
  default: [
    'Atmospheric sensors detect elevated levels of dramatic irony.',
    'Insiders suggest investing in metaphysical seatbelts.',
    'Plausible deniability filed for a stress leave.',
  ],
};

export const VERB_TABLES = {
  launch: ['rolls out', 'unleashes', 'deploys', 'lights up', 'scatters'],
  escalate: ['escalates', 'amplifies', 'magnifies', 'inflames', 'turbocharges'],
  scramble: ['scramble', 'spin up', 'recalibrate', 'panic-dial', 'reprogram'],
  reassure: ['promise calm', 'insist nothing is wrong', 'schedule optics', 'announce control', 'hand out talking points'],
};

export const PLAYER_LABELS: Record<'human' | 'ai', string> = {
  human: 'Operative network',
  ai: 'Opposition machine',
};
