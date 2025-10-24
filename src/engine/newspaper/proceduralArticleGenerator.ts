/**
 * Procedural Article Generator
 * Generates funny, Weekly World News-style articles dynamically
 * based on card plays, game state, and tabloid templates
 */

import type { Card } from '@/types';

interface ArticleContext {
  card: Card;
  player: 'human' | 'ai';
  targetState?: string;
  truthDelta?: number;
  gameState?: {
    truth?: number;
    turn?: number;
    controlledStates?: string[];
  };
}

interface GeneratedArticle {
  headline: string;
  subhead: string;
  byline: string;
  body: string;
  imagePrompt: string;
  tags: string[];
}

// Word banks for procedural generation
const TRUTH_ACTION_VERBS = [
  'EXPOSES',
  'REVEALS',
  'LEAKS',
  'UNCOVERS',
  'DETONATES',
  'CRACKS OPEN',
  'BLOWS LID OFF',
  'SPILLS BEANS ON',
  'DRAGS INTO LIGHT',
  'BREAKS SILENCE ON',
  'LIVE-STREAMS',
  'CROSSFADES INTO',
  'TRUTH-BOMBS',
  'DEAD-DROPS',
  'WIRETAPS',
  'REMOTE-VIEWS',
  'FOIA-DUMPS',
  'BLAST-FAXES',
  'PROJECTOR-OVERLAYS',
  'BLACKLIGHTS',
  'THERMAL-SCANS',
  'ANONYMOUSLY FAXES',
  'PIRATE-STREAMS',
  'HALLWAY-WHISPERS ABOUT',
  'FLORIDA-MAN LIVETWEETS',
  'ELVIS SIDE-EYES',
  'BAT BOY SIGNATURES',
  'TIME-STAMPS',
  'HYPERLINKS',
  'MUTTERS THROUGH TIN-FOIL',
  'TAPES TO VENDING MACHINE',
];

const GOV_ACTION_VERBS = [
  'NEUTRALIZES',
  'CONTAINS',
  'CLASSIFIES',
  'REDACTS',
  'SUPPRESSES',
  'RECLASSIFIES',
  'ARCHIVES',
  'SEALS',
  'ENCRYPTS',
  'DISAPPEARS',
  'RETASKS',
  'DEPRIORITIZES',
  'DOCKETS',
  'ESCALATES TO SUBCOMMITTEE',
  'WET-INK STAMPS',
  'CARBON-COPIES',
  'OVERBRIEFS',
  'RECONVENES',
  'SHELVES',
  'FOIA-PROOFES',
  'PAPER-SHREDS',
  'MANDATORY-SEMINARS',
  'SPINS UP HOTLINE ABOUT',
  'MEMORANDUMIZES',
  'HUSHES',
  'TASK-FORCES INTO SUBMISSION',
  'COMMITTEE-CHAIRS',
  'REBOOTS',
  'RETAPES OVER',
  'SUBPOENA-PROOFS',
];

const GOV_EUPHEMISMS = [
  'routine administrative adjustment',
  'scheduled maintenance event',
  'standard protocol activation',
  'benign atmospheric phenomenon',
  'weather balloon test',
  'swamp gas incident',
  'technical glitch',
  'localized temporal anomaly',
  'authorized training exercise',
  'bureaucratic housekeeping',
  'nothing to see here situation',
  'heritage film restoration',
  'astronaut morale exercise',
  'gravity simulation drill',
  'paperwork harmonization sprint',
  'routine gator relocation',
  'federally sanctioned beach day',
  'telepathic hotline calibration',
  'chrononaut tourism feasibility study',
  'lunar rehearsal scenario',
  'authorized Elvis impersonator liaison',
  'bat acclimation outreach',
  'disaster weathervane focus group',
  'interagency vibes assessment',
  'routine pocket dimension audit',
  'classified swamp management symposium',
  'emergency memo reformatting',
  'supportive compliance follow-up',
  'authorized deja vu exercise',
  'unremarkable budgetary placeholder',
];

const LOCATIONS = [
  'Area 51',
  'Roswell',
  'Dulce Base',
  'Pine Gap',
  'Wright-Patterson AFB',
  'Groom Lake',
  'Montauk',
  'Denver Airport',
  'NORAD',
  'The Pentagon',
  'Nevada Test Site',
  'Hangar 18',
  'S-4 Facility',
  'Cheyenne Mountain',
  'Cape Canaveral Employee Lounge',
  'Everglades Surveillance Fanboat Dock',
  'St. Augustine Lighthouse Bunker',
  'Orlando Subterranean Monorail Stop 13',
  'Gulf Breeze Pier of Unmarked Vans',
  'Moon Landing Exhibit Storage Unit 47',
  'Las Vegas Elvis Doppelganger Academy',
  'Temporal Customs Annex (Arrivals)',
  'Bureau of Weather Balloon Procurement Basement',
  'Abandoned Saturn V Soundstage',
  'Florida Capitol Swamp Tunnel',
  'Mysterious Alligator Wrestling Civic Center',
  'Interstate Rest Stop Observatory',
];

const CRYPTIDS = [
  'Bigfoot',
  'Mothman',
  'Chupacabra',
  'Jersey Devil',
  'Wendigo',
  'Flatwoods Monster',
  'Dover Demon',
  'Lizard Man',
  'Goatman',
  'Fresno Nightcrawler',
  'Bat Boy',
  'Skunk Ape',
  'Swamp Ape',
  'Gulf Breeze Mermaid',
  'Chrono-Gator',
  'Panhandle Thunderbird',
  'Elvis Doppelganger of Unknown Origin',
  'Roswell Armadillo',
  'Moonbase Possum',
  'Quantum Jackalope',
  'Bayou Static Wraith',
  'Foam-Finger Sasquatch',
  'Telepathic Manatee',
  'Polaroid Phantom',
  'Everglades Glow Hare',
];

const CONSPIRACY_GROUPS = [
  'Shadow Government',
  'Deep State',
  'Majestic 12',
  'Illuminati',
  'Men in Black',
  'Black Helicopters Division',
  'Bilderberg Group',
  'Trilateral Commission',
  'Committee of 300',
  'Dulce Warriors',
  'Florida Man Mutual Aid Cabal',
  'Committee for Lunar Authenticity',
  'Psychic Switchboard Union Local 23',
  'Time Loop Tourism Board',
  'Elvis Witness Protection Choir',
  'Bat Boy Fan Club Chapter 666',
  'Department of Plausible Deniability Alumni',
  'Friends of Routine Atmospheric Phenomena',
  'Subterranean Bureau of Gator Diplomacy',
  'Chrononaut Retirees Association',
  'Federation of Unblinking Night Watchers',
  'Moonlight Advisory Panel for Stage Lighting',
  'Telepath Whisper Line Steering Committee',
  'Bureaucrats for Infinite Hold Music',
];

const DEFAULT_TRUTH_SUBJECTS = [...CRYPTIDS, ...LOCATIONS, ...CONSPIRACY_GROUPS];

const BYLINES_TRUTH = [
  'By: Anonymous Parking Garage Source',
  'By: Marcus Webb, Cryptid Correspondent',
  'By: Sarah Kim, Classified Documents Desk',
  'By: Danny Ortega, Late-Night Beat',
  'By: Jennifer Cross, Conspiracy Analysis',
  'By: Dr. Helena Frost (On The Run)',
  'By: Kent Briggs, Field Investigation',
  'By: The Paranoid Times News Bureau',
  'By: Agent X (Retired)',
  'By: Bunker Correspondent #47',
  'By: Lola Vega, Psychic Hotline Auditor',
  'By: Florida Man, Guest Columnist (Probationary)',
  'By: Prudence Hart, Time Loop Travel Blogger',
  'By: Meredith Quay, Lunar Stage Lighting Critic',
  'By: Elvis Impersonator #19, Embedded Reporter',
  'By: Bat Boy, Special Features Contributor',
  'By: Dee Ramirez, Chrononaut Ombudsperson',
  'By: Stella Cho, Bureau of Unruly Realities Desk',
  'By: K.C. Navarro, Moon Bounce Correspondent',
  'By: Temporary Alias "Redacted Owl"'
];

const BYLINES_GOV = [
  'By: Public Information Officer J. Morrison',
  'By: Department of Normalcy Communications',
  'By: Inter-Agency Compliance Board',
  'By: Office of Authorized Statements',
  'By: National Reassurance Bureau',
  'By: Committee for Citizen Calm',
  'By: Spokesperson TK-421',
  'By: Director of Nothing Happening',
  'By: Bureau of Standard Explanations',
  'By: Acting Deputy for Predictable Outcomes',
  'By: Lunar Narrative Continuity Office',
  'By: Chronology Integrity Taskforce',
  'By: Department of Telepathic Licensing',
  'By: Interim Elvis Oversight Commission',
  'By: Bureau of Floridian Affairs (Temporary Annex)',
  'By: Compliance Pod Gamma-6',
  'By: Extraordinary Claims Redress Unit',
  'By: Authorized Witness Alignment Program',
  'By: Senior Memorandum Harmonizer',
  'By: Committee for Routine Phenomena'
];

const WITNESSES = [
  'local resident who wishes to remain anonymous',
  'truck driver who saw "too much"',
  'former government employee with conscience problems',
  'conspiracy theorist who was unfortunately correct',
  'night shift Walmart employee',
  'pastor with apocalypse podcast',
  'retired Air Force colonel "off the record"',
  'amateur cryptozoologist with expensive camera equipment',
  'bored teenager with too much time online',
  'diner waitress working the graveyard shift',
  'Florida man in a souvenir space suit',
  'Elvis impersonator moonlighting as a notary',
  'Bat Boy posing as a mall Santa',
  'time-loop tourist on their third Wednesday',
  'psychic hotline operator with nosebleed',
  'bureaucrat who accidentally replied-all',
  'airport janitor with clearance envy',
  'storm chaser livestreaming from a hover fan boat',
  'cryptid-friendly park ranger with glitter on boots',
  'ex-Illuminati intern seeking better dental'
];

const SPECIFIC_DETAILS = [
  'exactly 3:47 AM',
  '17 minutes before dawn',
  'during the station identification',
  'while eating pancakes',
  'in the Frozen Foods aisle',
  'near the rest stop bathroom',
  'at the corner of Main and Conspiracy',
  'behind the suspicious warehouse',
  'underneath the overpass that hums',
  'beside the abandoned Radio Shack',
  'at a Florida rest stop marked "Official Business"',
  'on hold with the psychic hotline for precisely 11 minutes',
  'while Elvis karaoke echoed from the break room',
  'inside an allegedly unused lunar module simulator',
  'during an unscheduled time-loop orientation',
  'midway through a 47-page compliance webinar',
  'between Bat Boy autograph sessions',
  'under the bureaucratic emergency tarp',
  'during a gator-proofing drill',
  'in line at the chrononaut baggage carousel',
  'minutes before the sky turned static',
  'while the FOIA copier jammed for seventeen tries',
  'on the roof of a discount motel with satellite dishes',
  'as the vending machine dispensed classified memos',
  'while the truth meter hit 73% and rising',
  'in a conference room labeled "Definitely Not Lunar Set"',
  'during a mandatory deja vu debrief',
  'as an alligator wearing a badge saluted twice',
  'while the broadcast clock spun backwards',
  'in the subterranean gift shop after hours',
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickMultiple<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function generateTruthHeadline(context: ArticleContext): string {
  const theme = deriveTheme(context.card.tags);
  const verbPool = theme?.truthVerbs?.length ? theme.truthVerbs : TRUTH_ACTION_VERBS;
  const subjectPool = theme?.truthSubjects?.length ? theme.truthSubjects : DEFAULT_TRUTH_SUBJECTS;
  const verb = pick(verbPool);
  const cardName = context.card.name.toUpperCase();
  const subject = pick(subjectPool);
  
  const templates = [
    `${verb} ${subject}—${cardName} FILES LEAK NATIONWIDE`,
    `${cardName} ${verb} ${subject} CONNECTION • OFFICIALS PANIC`,
    `BREAKING: ${cardName} PROVES ${subject} EXISTS • GOVERNMENT SCRAMBLES`,
    `${subject} SCANDAL: ${cardName} DOCUMENTS GO VIRAL`,
    `${cardName} ${verb} • ${subject} COVERUP COLLAPSES`,
    `LEAKED: ${cardName} SHOWS ${subject} "VERY REAL" SAYS EXPERT`,
  ];
  
  return pick(templates);
}

function generateGovHeadline(context: ArticleContext): string {
  const theme = deriveTheme(context.card.tags);
  const verbPool = theme?.govVerbs?.length ? theme.govVerbs : GOV_ACTION_VERBS;
  const euphemismPool = theme?.govEuphemisms?.length ? theme.govEuphemisms : GOV_EUPHEMISMS;
  const verb = pick(verbPool);
  const euphemism = pick(euphemismPool);
  const cardName = context.card.name.toUpperCase();
  
  const templates = [
    `${cardName} DESIGNATED AS "${euphemism}"—NOTHING TO SEE HERE`,
    `OFFICIAL: ${cardName} MERELY ${euphemism}`,
    `${cardName} ${verb} • "${euphemism}" EXPLAINS ALL`,
    `INTERNAL MEMO: ${cardName} CLASSIFIED AS ${euphemism}`,
    `${cardName} INCIDENT RESOLVED—CITIZENS REMINDED TO REMAIN CALM`,
    `${verb}: ${cardName} DESIGNATED ${euphemism} PER PROTOCOL`,
  ];
  
  return pick(templates);
}

function generateTruthSubhead(context: ArticleContext): string {
  const theme = deriveTheme(context.card.tags);
  const witness = pick(WITNESSES);
  const detailPool = theme?.truthDetails?.length ? theme.truthDetails : SPECIFIC_DETAILS;
  const detail = pick(detailPool);
  
  const templates = [
    `Eyewitness reports "exactly what conspiracy theorists said"—${detail}`,
    `${witness} confirms: "It's worse than we thought"`,
    `Leaked documents show government knew ${detail}`,
    `Expert analysis: "This changes everything we weren't supposed to know"`,
    `Social media explodes as ${witness} posts evidence`,
    `Officials refuse comment; ${witness} won't stop talking`,
  ];
  
  return pick(templates);
}

function generateGovSubhead(context: ArticleContext): string {
  const theme = deriveTheme(context.card.tags);
  const euphemismPool = theme?.govEuphemisms?.length ? theme.govEuphemisms : GOV_EUPHEMISMS;
  const euphemism = pick(euphemismPool);
  
  const templates = [
    `Officials assure public this is completely normal ${euphemism}`,
    `Spokesperson: "Move along, definitely ${euphemism}"`,
    `Press briefing emphasizes "no cause for alarm or independent thought"`,
    `Citizens encouraged to trust official narrative, avoid social media`,
    `Statement released: "${euphemism}—case conclusively closed"`,
    `Department confirms this falls within acceptable parameters of ${euphemism}`,
  ];
  
  return pick(templates);
}

function generateTruthBody(context: ArticleContext): string {
  const theme = deriveTheme(context.card.tags);
  const cardName = context.card.name;
  const witness = pick(WITNESSES);
  const detailPool = theme?.truthDetails?.length ? theme.truthDetails : SPECIFIC_DETAILS;
  const subjectPool = theme?.truthSubjects?.length ? theme.truthSubjects : DEFAULT_TRUTH_SUBJECTS;
  const detail = pick(detailPool);
  const subject = pick(subjectPool);
  const expert = `Dr. ${pick(['Helena Frost', 'Marcus Webb', 'Patricia Chen', 'Raymond Foster'])}`;
  
  const truthValue = context.gameState?.truth || 50;
  const trend = truthValue > 50 ? 'surging' : 'climbing';
  
  const paragraphs = [
    `Leaked documents obtained ${detail} reveal explosive details about ${cardName}, confirming what conspiracy researchers have suspected for years: the connection to ${subject} is undeniable and extensively documented.`,
    
    `"I've spent twenty years investigating this," said ${expert}, an independent researcher who was recently asked to leave three different conferences. "The ${cardName} evidence doesn't just suggest a conspiracy—it proves one. The documentation is meticulous. Almost like they wanted to get caught."`,
    
    `A ${witness} first posted the materials online at ${detail}, leading to immediate viral spread across seventeen platforms before coordinated takedown attempts began. "I watched the downloads hit a million before my internet mysteriously cut out," the source said by phone from an undisclosed location. "They're scrambling."`,
    
    `Government response has been notably aggressive, with three press conferences scheduled, canceled, and rescheduled before officials settled on a brief emailed statement reading simply: "These reports are unsubstantiated and also classified."`,
    
    `Public awareness is ${trend}, with truth-seeking networks reporting ${Math.round(truthValue)}% of surveyed citizens now questioning official narratives. "The paradigm is shifting," noted researcher ${expert}. "People are ready to know what's behind ${cardName}."`,
  ];
  
  return paragraphs.join('\n\n');
}

function generateGovBody(context: ArticleContext): string {
  const theme = deriveTheme(context.card.tags);
  const cardName = context.card.name;
  const euphemismPool = theme?.govEuphemisms?.length ? theme.govEuphemisms : GOV_EUPHEMISMS;
  const euphemism = pick(euphemismPool);
  const euphemism2 = pick(euphemismPool);
  const detail = theme?.govDetails?.length ? pick(theme.govDetails) : '';
  const official = `${pick(['Director', 'Deputy Director', 'Coordinator', 'Administrator'])} ${pick(['Karen Walsh', 'Marcus Thompson', 'Donald Pierce', 'Patricia Ng'])}`;

  const paragraphs = [
    `The Department of Normalcy issued a comprehensive 847-page report today addressing public concerns about ${cardName}, conclusively determining it qualifies as a standard ${euphemism}${detail ? ` tied to ${detail}` : ''} requiring no further citizen attention.`,

    `"We appreciate community vigilance," stated ${official} at a mandatory press briefing. "However, speculation regarding ${cardName} serves no constructive purpose. Our analysis demonstrates this is textbook ${euphemism}, occurring approximately never and unlikely to repeat. All documentation supports this conclusion, which is why we've classified the documentation."`,

    `The report notably dedicates 347 pages to explaining why certain questions should not be asked, 289 pages to redacted appendices, and a final chapter titled "Why This Report Itself Should Not Raise Questions.${detail ? `" A sealed appendix further catalogues ${detail}."` : '"' }`,
    
    `Citizens who witnessed events related to ${cardName} are invited to attend voluntary memory alignment workshops at convenient government facilities. Attendance is optional but strongly encouraged. Light refreshments will be served. Names will not be taken down but will be remembered institutionally.`,
    
    `When pressed on inconsistencies between eyewitness accounts and official conclusions, ${official} clarified: "Eyewitnesses experience stress. Stress causes misperception. Misperception is itself a form of ${euphemism2}. The circle of explanation is logically complete. This press conference is now concluded. Please exit in an orderly fashion and avoid discussing what was said here."`,
  ];
  
  return paragraphs.join('\n\n');
}

function generateImagePrompt(context: ArticleContext): string {
  const isTruth = context.card.faction === 'truth';
  
  if (isTruth) {
    const subjects = [
      'Grainy surveillance photo showing anomalous figure, motion blur, amateur photography, newsprint quality',
      'Leaked government document with highlighter marks and coffee stains, photocopy aesthetic, classified stamps',
      'Blurry nighttime photo of mysterious lights, dark sky, witness perspective, vintage camera quality',
      'Cryptid sighting photograph, out of focus, dramatic composition, tabloid style',
      'Secret facility exterior, fence with warning signs, telephoto lens, grainy black and white',
      'Government official at tense press conference, uncomfortable body language, harsh lighting, newsprint',
    ];
    return pick(subjects);
  } else {
    const subjects = [
      'Sterile government press conference, podium with official seal, bureaucratic setting, formal photography',
      'Heavily redacted document, multiple classification stamps, censored text, official paperwork aesthetic',
      'Official government spokesperson in generic office, neutral expression, corporate photography',
      'Federal building exterior, American flags, nothing happening, calm authoritative image',
      'Scientific chart proving normalcy, graphs indicating routine status, sanitized infographic',
      'Official statement with government letterhead, typed memo, boring administrative aesthetic',
    ];
    return pick(subjects);
  }
}

const sanitizeTag = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }
  const dashed = trimmed.replace(/\s+/g, '-');
  const cleaned = dashed.replace(/[^a-z0-9-]/gi, '');
  const collapsed = cleaned.replace(/-{2,}/g, '-').replace(/^-+|-+$/g, '');
  return collapsed.toLowerCase();
};

const ensureHashTag = (value: string): string => {
  if (!value) {
    return value;
  }
  return value.startsWith('#') ? value : `#${value}`;
};

const normalizeCardTags = (tags: Card['tags']): string[] => {
  if (!Array.isArray(tags)) {
    return [];
  }

  const normalized: string[] = [];
  const seen = new Set<string>();

  for (const tag of tags) {
    if (typeof tag !== 'string') {
      continue;
    }
    const sanitized = sanitizeTag(tag);
    if (!sanitized) {
      continue;
    }
    const hashed = ensureHashTag(sanitized);
    if (hashed && !seen.has(hashed)) {
      seen.add(hashed);
      normalized.push(hashed);
    }
  }

  return normalized;
};

interface ThemeConfig {
  key: string;
  matchers: string[];
  truthVerbs?: string[];
  truthSubjects?: string[];
  truthDetails?: string[];
  govVerbs?: string[];
  govEuphemisms?: string[];
  govDetails?: string[];
}

const TAG_THEMES: ThemeConfig[] = [
  {
    key: 'cryptid',
    matchers: ['cryptid', 'cryptids', 'monster', 'beast'],
    truthVerbs: ['TRACKS', 'PHOTOGRAPHS', 'CATALOGS', 'DECRYPTS TRAIL OF'],
    truthSubjects: [
      'APPALACHIAN HOWLER',
      'BLACK HILLS SPECTER',
      'MOSS-COVERED FOOTPRINT DOSSIER',
      'GLOW-IN-THE-DARK CHUPAFILE',
    ],
    truthDetails: [
      'inside a misty pine barrens watchtower',
      'beneath the ranger outpost that hums at 3:17 AM',
      'after following bioluminescent tracks behind the diner',
      'during an unauthorized midnight stakeout in the swamp gas marsh',
    ],
    govVerbs: ['TRANQUILIZES', 'QUARANTINES', 'RELOCATES', 'TAGGED'],
    govEuphemisms: [
      'authorized wildlife mitigation protocol',
      'routine cryptozoological census',
      'standard fauna relocation',
      'controlled habitat enrichment activity',
    ],
    govDetails: [
      'a restricted wildlife containment perimeter behind the forestry lab',
      'an overnight relocation convoy with blackout tarps',
      'a tranquilizer report filed under agricultural sciences',
    ],
  },
  {
    key: 'broadcast',
    matchers: ['broadcast', 'signal', 'radio', 'airwave'],
    truthVerbs: ['HIJACKS', 'BEAMS', 'JAMS', 'OVERRIDES'],
    truthSubjects: [
      'NUMBERS STATION 77',
      'MOON-BOUNCE RELAY ARRAY',
      'SHORTWAVE NODE SIGMA',
      'SATELLITE UPLINK RABBIT-HOLE',
    ],
    truthDetails: [
      'over frequency 7.77 MHz',
      'from a decommissioned cold war transmitter',
      'after decoding a pirate radio burst at 2:03 AM',
      'inside the emergency broadcast bunker nobody admits exists',
    ],
    govVerbs: ['RECALIBRATES', 'SCRAMBLES', 'REPROGRAMS', 'SILENCES'],
    govEuphemisms: [
      'routine broadcast quality assurance',
      'authorized frequency harmonization',
      'scheduled transmission hygiene',
      'temporary signal normalization event',
    ],
    govDetails: [
      'a spectrum-management drill centered on frequency 7.77 MHz',
      'a benign signal scrub of the coastal relay dishes',
      'an uplink reboot carried out by anonymous contractors',
    ],
  },
  {
    key: 'operation',
    matchers: ['operation', 'operations', 'op', 'project', 'directive'],
    truthVerbs: ['BLOWS COVER ON', 'DECLASSIFIES', 'UNMASKS', 'DECRYPTS'],
    truthSubjects: [
      'OPERATION NIGHTLINGER',
      'PROJECT THUNDERGLASS',
      'DIRECTIVE RAVENVAULT',
      'OP MEMO BLUE VELVET',
    ],
    truthDetails: [
      'within a sealed war-room debrief',
      'during a 0400 hours emergency tabletop',
      'inside the sub-basement briefing vault',
      'after a courier dropped a mislabeled dossier in the lobby',
    ],
    govVerbs: ['DECOMMISSIONS', 'REASSIGNS', 'RENUMBERS', 'RETITLES'],
    govEuphemisms: [
      'strategic reclassification initiative',
      'legacy paperwork sunset',
      'authorized codename rotation',
      'internal continuity rehearsal',
    ],
    govDetails: [
      'a binder swap conducted in the windowless logistics wing',
      'an interagency tabletop exercise with no observers',
      'a schedule alignment meeting that allegedly never happened',
    ],
  },
  {
    key: 'moon-hoax',
    matchers: ['moon', 'lunar', 'apollo', 'moon-landing', 'moon-hoax'],
    truthVerbs: ['UNMASKS', 'BLACKLIGHTS', 'FLAG-TESTS', 'REWAXES'],
    truthSubjects: [
      'SEA OF TRANQUILITY PROP DEPARTMENT',
      'APOLLO 11 BACKUP FLAG FAN',
      'SECRET SOUNDSTAGE GLOW DUST',
      'MOON ROCK RENTAL RECEIPT BINDER',
    ],
    truthDetails: [
      'inside a warehouse-sized lunar backdrop closet',
      'while touring the "definitely not a set" hangar',
      'after Elvis compared lighting cues to Graceland',
      'when a Florida man tripped a zero-gravity breaker',
    ],
    govVerbs: ['RE-LAUNCHES', 'AIRBRUSHES', 'GRAVITY-CALIBRATES', 'FLAG-STRAIGHTENS'],
    govEuphemisms: [
      'lunar rehearsal scenario',
      'astronaut morale exercise',
      'heritage film restoration',
      'gravity simulation drill',
    ],
    govDetails: [
      'a hangar walkthrough hosted by the Lunar Narrative Continuity Office',
      'a midnight tarp inspection under rehearsal lighting',
      'a quiet re-synchronization of commemorative moon dust projectors',
    ],
  },
  {
    key: 'psychic-hotline',
    matchers: ['psychic', 'clairvoyant', 'telepath', 'remote-view', 'hotline'],
    truthVerbs: ['CHANNELS', 'REMOTE-VIEWS', 'AUTOMATIC-WRITES', 'DIALS INTO'],
    truthSubjects: [
      '1-900 PROPHECY DESK',
      'TELEPATHIC SWITCHBOARD 23',
      'CLANDESTINE CLAIRVOYANT CO-OP',
      'ASTRAL CUSTOMER SERVICE HUDDLE',
    ],
    truthDetails: [
      'during a surge of glowing rotary phones',
      'inside a strip mall call center that smells like ozone',
      'while Bat Boy held the line with perfect pitch humming',
      'in the middle of a remote viewing audit with no chairs',
    ],
    govVerbs: ['DISCONNECTS', 'SPAMS HOLD MUSIC ON', 'LICENSE-REVIEWS', 'SILENCES'],
    govEuphemisms: [
      'telepathic hotline calibration',
      'authorized clairvoyant compliance refresher',
      'predictive customer service symposium',
      'mental bandwidth rationing event',
    ],
    govDetails: [
      'a cubicle maze patrolled by the Department of Telepathic Licensing',
      'a white-noise cannon test inside the call center break room',
      'a memo blast that replaced intuition scripts with hold music',
    ],
  },
  {
    key: 'time-loop',
    matchers: ['time-loop', 'timeloop', 'chrononaut', 'temporal', 'time-tourism'],
    truthVerbs: ['REWINDS', 'LOOP-LEAKS', 'DEJA-VUS', 'STAMP COLLECTS'],
    truthSubjects: [
      'CHRONONAUT VISITOR CENTER',
      'TEMPORAL CUSTOMS QUEUE',
      'LOOPED SOUVENIR GIFT SHOP',
      'TOURIST ITINERARY FROM NEXT WEEK',
    ],
    truthDetails: [
      'after comparing three identical boarding passes',
      'while a tour guide introduced tomorrow twice',
      'inside Gate 47-B (now, later, always)',
      'during a deja vu orientation filmed on VHS',
    ],
    govVerbs: ['RESETS', 'DE-TIMETABLES', 'SYNCHRONIZES', 'MEMO-LOOPS'],
    govEuphemisms: [
      'chrononaut tourism feasibility study',
      'authorized deja vu exercise',
      'timeline punctuality refresher',
      'temporal boarding pass audit',
    ],
    govDetails: [
      'a queue consolidation plan drafted in three tense meetings at once',
      'a luggage screening that repeats until compliance is achieved',
      'a briefing that encourages visitors to forget the repeated briefing',
    ],
  },
];

const deriveTheme = (tags: Card['tags']): ThemeConfig | undefined => {
  const normalized = normalizeCardTags(tags).map(tag => tag.replace(/^#/, ''));
  const plainSanitized = Array.isArray(tags)
    ? tags
        .filter((tag): tag is string => typeof tag === 'string')
        .map(tag => sanitizeTag(tag))
        .filter(Boolean)
    : [];

  const searchable = new Set([...normalized, ...plainSanitized]);

  for (const theme of TAG_THEMES) {
    for (const candidate of searchable) {
      if (!candidate) {
        continue;
      }
      if (theme.matchers.some(matcher => candidate.includes(matcher))) {
        return theme;
      }
    }
  }

  return undefined;
};

function generateTags(context: ArticleContext): string[] {
  const isTruth = context.card.faction === 'truth';
  const cardType = context.card.type?.toLowerCase() || '';

  const baseTags = isTruth
    ? ['leaked', 'exposed', 'viral', 'conspiracy']
    : ['official', 'classified', 'dismissed', 'routine'];

  const typeTags = cardType.includes('attack')
    ? ['attack', 'scandal']
    : cardType.includes('media')
    ? ['media', 'coverage']
    : cardType.includes('zone')
    ? ['grassroots', 'local']
    : [];

  const prioritized = normalizeCardTags(context.card.tags);
  const result: string[] = [];
  const seen = new Set<string>();

  for (const tag of prioritized) {
    if (result.length >= 4) break;
    if (seen.has(tag)) continue;
    seen.add(tag);
    result.push(tag);
  }

  if (result.length < 4) {
    const fallbacks = [...typeTags, ...pickMultiple(baseTags, 2)];
    for (const tag of fallbacks) {
      if (result.length >= 4) {
        break;
      }
      if (seen.has(tag)) {
        continue;
      }
      seen.add(tag);
      result.push(tag);
    }
  }

  return result;
}

export function generateProceduralArticle(context: ArticleContext): GeneratedArticle {
  const isTruth = context.card.faction === 'truth';
  
  return {
    headline: isTruth ? generateTruthHeadline(context) : generateGovHeadline(context),
    subhead: isTruth ? generateTruthSubhead(context) : generateGovSubhead(context),
    byline: pick(isTruth ? BYLINES_TRUTH : BYLINES_GOV),
    body: isTruth ? generateTruthBody(context) : generateGovBody(context),
    imagePrompt: generateImagePrompt(context),
    tags: generateTags(context),
  };
}
