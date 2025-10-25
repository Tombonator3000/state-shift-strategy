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

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

type ParagraphTemplate<Ctx> = (context: Ctx) => string;

const normalizeSegment = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }
  const withoutQuotes = trimmed
    .replace(/^["'`“”\[\]()>•-]+/g, '')
    .replace(/["'`“”\[\]()<>{}:;]+$/g, '');
  return withoutQuotes.replace(/\s+/g, ' ').toLowerCase();
};

const extractSentenceTokens = (paragraph: string): string[] => {
  const matches = paragraph.match(/[^.!?\n]+[.!?]/g);
  if (matches && matches.length > 0) {
    return matches.map(normalizeSegment).filter(Boolean);
  }

  return paragraph
    .split(/\n+/)
    .map(normalizeSegment)
    .filter(Boolean);
};

const normalizeParagraph = (paragraph: string): string => paragraph.replace(/\s+/g, ' ').trim().toLowerCase();

function pickDistinct<T>(arr: T[], avoid: T[]): T {
  const filtered = arr.filter(item => !avoid.includes(item));
  if (filtered.length === 0) {
    return pick(arr);
  }
  return pick(filtered);
}

function pickUniqueParagraph<Ctx>(
  templates: ParagraphTemplate<Ctx>[],
  context: Ctx,
  seenParagraphs: Set<string>,
  seenSentences: Set<string>,
): string | null {
  for (const template of shuffle(templates)) {
    const paragraph = template(context).trim();
    if (!paragraph) {
      continue;
    }

    const normalizedParagraph = normalizeParagraph(paragraph);
    if (seenParagraphs.has(normalizedParagraph)) {
      continue;
    }

    const sentences = extractSentenceTokens(paragraph);
    if (sentences.some(sentence => seenSentences.has(sentence))) {
      continue;
    }

    seenParagraphs.add(normalizedParagraph);
    for (const sentence of sentences) {
      seenSentences.add(sentence);
    }
    return paragraph;
  }

  for (const template of templates) {
    const paragraph = template(context).trim();
    if (!paragraph) {
      continue;
    }
    const normalizedParagraph = normalizeParagraph(paragraph);
    if (!seenParagraphs.has(normalizedParagraph)) {
      seenParagraphs.add(normalizedParagraph);
      for (const sentence of extractSentenceTokens(paragraph)) {
        seenSentences.add(sentence);
      }
      return paragraph;
    }
  }

  return null;
}

function maybePickEmbellishment<Ctx>(
  templates: ParagraphTemplate<Ctx>[],
  context: Ctx,
  seenParagraphs: Set<string>,
  seenSentences: Set<string>,
  probability: number,
): string | null {
  if (Math.random() >= probability) {
    return null;
  }
  return pickUniqueParagraph(templates, context, seenParagraphs, seenSentences);
}

const formatStateList = (states?: string[]): string | null => {
  if (!states || states.length === 0) {
    return null;
  }

  const unique = Array.from(
    new Set(
      states
        .map(state => (typeof state === 'string' ? state.trim() : ''))
        .filter((state): state is string => Boolean(state)),
    ),
  );

  if (unique.length === 0) {
    return null;
  }

  const upper = unique.map(state => state.toUpperCase());

  if (upper.length === 1) {
    return upper[0];
  }

  if (upper.length === 2) {
    return `${upper[0]} & ${upper[1]}`;
  }

  return `${upper[0]}, ${upper[1]} +${upper.length - 2} MORE`;
};

const formatTurnLabel = (turn?: number): string | null => {
  if (typeof turn !== 'number' || !Number.isFinite(turn)) {
    return null;
  }
  return `Turn ${turn}`;
};

const formatTruthDeltaHeadline = (truthDelta?: number): string | null => {
  if (typeof truthDelta !== 'number' || Number.isNaN(truthDelta)) {
    return null;
  }

  if (truthDelta === 0) {
    return 'TRUTH INDEX HOLDS';
  }

  return truthDelta > 0 ? `TRUTH INDEX +${truthDelta}` : `TRUTH INDEX ${truthDelta}`;
};

const buildTruthHeadlineSuffix = (context: ArticleContext): string => {
  const segments: string[] = [];

  const truthDeltaFragment = formatTruthDeltaHeadline(context.truthDelta);
  if (truthDeltaFragment) {
    segments.push(truthDeltaFragment);
  }

  if (context.targetState) {
    segments.push(context.targetState.toUpperCase());
  }

  const turnFragment = formatTurnLabel(context.gameState?.turn)?.toUpperCase();
  if (turnFragment) {
    segments.push(turnFragment);
  }

  const controlledFragment = formatStateList(context.gameState?.controlledStates);
  if (controlledFragment) {
    segments.push(`CELLS HOLD ${controlledFragment}`);
  }

  return segments.length > 0 ? ` — ${segments.join(' • ')}` : '';
};

const buildGovHeadlineSuffix = (context: ArticleContext): string => {
  const segments: string[] = [];

  const turnFragment = formatTurnLabel(context.gameState?.turn)?.toUpperCase();
  if (turnFragment) {
    segments.push(`${turnFragment} BULLETIN`);
  }

  if (context.targetState) {
    segments.push(`${context.targetState.toUpperCase()} REASSURED`);
  }

  const calmIndexFragment = formatTruthDeltaHeadline(context.truthDelta)?.replace(
    'TRUTH INDEX',
    'CALM INDEX',
  );
  if (calmIndexFragment) {
    segments.push(calmIndexFragment);
  }

  const coverageFragment = formatStateList(context.gameState?.controlledStates);
  if (coverageFragment) {
    segments.push(`COVERAGE ${coverageFragment}`);
  }

  return segments.length > 0 ? ` — ${segments.join(' • ')}` : '';
};

const buildTruthSubheadContext = (context: ArticleContext): string | null => {
  const fragments: string[] = [];

  const truthDeltaFragment = formatTruthDeltaHeadline(context.truthDelta)?.replace(
    'TRUTH INDEX',
    'truth index',
  );
  if (truthDeltaFragment) {
    fragments.push(truthDeltaFragment.toLowerCase());
  }

  if (context.targetState) {
    fragments.push(`spikes in ${context.targetState}`);
  }

  const turnFragment = formatTurnLabel(context.gameState?.turn);
  if (turnFragment) {
    fragments.push(`on ${turnFragment.toLowerCase()}`);
  }

  const controlledFragment = formatStateList(context.gameState?.controlledStates);
  if (controlledFragment) {
    fragments.push(`cells holding ${controlledFragment}`);
  }

  return fragments.length > 0 ? fragments.join(' • ') : null;
};

const buildGovSubheadContext = (context: ArticleContext): string | null => {
  const fragments: string[] = [];

  const turnFragment = formatTurnLabel(context.gameState?.turn);
  if (turnFragment) {
    fragments.push(`${turnFragment.toLowerCase()} briefing`);
  }

  if (context.targetState) {
    fragments.push(`${context.targetState} remains compliant`);
  }

  const calmIndexFragment = formatTruthDeltaHeadline(context.truthDelta)?.replace(
    'TRUTH INDEX',
    'calm index',
  );
  if (calmIndexFragment) {
    fragments.push(calmIndexFragment.toLowerCase());
  }

  const coverageFragment = formatStateList(context.gameState?.controlledStates);
  if (coverageFragment) {
    fragments.push(`coverage extends to ${coverageFragment.toLowerCase()}`);
  }

  return fragments.length > 0 ? fragments.join(' • ') : null;
};

function generateTruthHeadline(context: ArticleContext): string {
  const theme = deriveTheme(context.card.tags);
  const verbPool = theme?.truthVerbs?.length ? theme.truthVerbs : TRUTH_ACTION_VERBS;
  const subjectPool = theme?.truthSubjects?.length ? theme.truthSubjects : DEFAULT_TRUTH_SUBJECTS;
  const verb = pick(verbPool);
  const cardName = context.card.name.toUpperCase();
  const subject = pick(subjectPool);
  const contextSuffix = buildTruthHeadlineSuffix(context);

  const templates = [
    `${verb} ${subject}—${cardName} FILES LEAK NATIONWIDE${contextSuffix}`,
    `${cardName} ${verb} ${subject} CONNECTION • OFFICIALS PANIC${contextSuffix}`,
    `BREAKING: ${cardName} PROVES ${subject} EXISTS • GOVERNMENT SCRAMBLES${contextSuffix}`,
    `${subject} SCANDAL: ${cardName} DOCUMENTS GO VIRAL${contextSuffix}`,
    `${cardName} ${verb} • ${subject} COVERUP COLLAPSES${contextSuffix}`,
    `LEAKED: ${cardName} SHOWS ${subject} "VERY REAL" SAYS EXPERT${contextSuffix}`,
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
  const contextSuffix = buildGovHeadlineSuffix(context);

  const templates = [
    `${cardName} DESIGNATED AS "${euphemism}"—NOTHING TO SEE HERE${contextSuffix}`,
    `OFFICIAL: ${cardName} MERELY ${euphemism}${contextSuffix}`,
    `${cardName} ${verb} • "${euphemism}" EXPLAINS ALL${contextSuffix}`,
    `INTERNAL MEMO: ${cardName} CLASSIFIED AS ${euphemism}${contextSuffix}`,
    `${cardName} INCIDENT RESOLVED—CITIZENS REMINDED TO REMAIN CALM${contextSuffix}`,
    `${verb}: ${cardName} DESIGNATED ${euphemism} PER PROTOCOL${contextSuffix}`,
  ];

  return pick(templates);
}

function generateTruthSubhead(context: ArticleContext): string {
  const theme = deriveTheme(context.card.tags);
  const witness = pick(WITNESSES);
  const detailPool = theme?.truthDetails?.length ? theme.truthDetails : SPECIFIC_DETAILS;
  const detail = pick(detailPool);
  const contextFragment = buildTruthSubheadContext(context);

  const templates = [
    `Eyewitness reports "exactly what conspiracy theorists said"—${detail}`,
    `${witness} confirms: "It's worse than we thought"`,
    `Leaked documents show government knew ${detail}`,
    `Expert analysis: "This changes everything we weren't supposed to know"`,
    `Social media explodes as ${witness} posts evidence`,
    `Officials refuse comment; ${witness} won't stop talking`,
  ];
  
  const base = pick(templates);
  return contextFragment ? `${base} — ${contextFragment}` : base;
}

function generateGovSubhead(context: ArticleContext): string {
  const theme = deriveTheme(context.card.tags);
  const euphemismPool = theme?.govEuphemisms?.length ? theme.govEuphemisms : GOV_EUPHEMISMS;
  const euphemism = pick(euphemismPool);
  const contextFragment = buildGovSubheadContext(context);

  const templates = [
    `Officials assure public this is completely normal ${euphemism}`,
    `Spokesperson: "Move along, definitely ${euphemism}"`,
    `Press briefing emphasizes "no cause for alarm or independent thought"`,
    `Citizens encouraged to trust official narrative, avoid social media`,
    `Statement released: "${euphemism}—case conclusively closed"`,
    `Department confirms this falls within acceptable parameters of ${euphemism}`,
  ];

  const base = pick(templates);
  return contextFragment ? `${base} — ${contextFragment}` : base;
}

interface TruthBodyContextData {
  cardName: string;
  subject: string;
  detailPrimary: string;
  detailSecondary: string;
  location: string;
  alternateLocation: string;
  witness: string;
  secondaryWitness: string;
  quoteWitness: string;
  expert: string;
  factionLabel: string;
  opposingFaction: string;
  targetState: string;
  truthDelta: number;
  truthDeltaLabel: string;
  truthValue: number;
  truthPercent: number;
  truthTrend: string;
  turn?: number;
  turnLabel?: string | null;
  controlledSummary?: string | null;
  controlledDescriptor: string;
  rumorLines: string[];
  footnoteId: string;
}

function generateTruthBody(context: ArticleContext): string {
  const theme = deriveTheme(context.card.tags);
  const cardName = context.card.name;
  const detailPool = theme?.truthDetails?.length ? theme.truthDetails : SPECIFIC_DETAILS;
  const subjectPool = theme?.truthSubjects?.length ? theme.truthSubjects : DEFAULT_TRUTH_SUBJECTS;
  const detailPrimary = pick(detailPool);
  const detailSecondary = pickDistinct(detailPool, [detailPrimary]);
  const subject = pick(subjectPool);
  const location = pick(LOCATIONS);
  const alternateLocation = pickDistinct(LOCATIONS, [location]);
  const witness = pick(WITNESSES);
  const secondaryWitness = pickDistinct(WITNESSES, [witness]);
  const quoteWitness = pickDistinct(WITNESSES, [witness, secondaryWitness]);
  const expert = `Dr. ${pick(['Helena Frost', 'Marcus Webb', 'Patricia Chen', 'Raymond Foster', 'Nikhil Reyes'])}`;
  const factionLabel = pick([
    'Truthline Observers',
    'Paranoid Times Field Bureau',
    'Citizen Signal Corps',
    'Counter-Narrative Cartographers',
  ]);
  const opposingFaction = pick([
    'Containment Bureau',
    'Department of Normalcy',
    'Official Story Taskforce',
    'Continuity Stabilization Wing',
  ]);
  const targetState = context.targetState || 'the broadcast grid';
  const truthValue = context.gameState?.truth ?? 50;
  const truthPercent = Math.round(truthValue);
  const truthTrend = truthValue >= 65 ? 'surging' : truthValue >= 50 ? 'climbing' : 'rebuilding';
  const truthDelta = context.truthDelta ?? 0;
  const truthDeltaLabel =
    truthDelta === 0
      ? 'steady truth current humming through the network'
      : truthDelta > 0
      ? `+${truthDelta} truth surge rattling officials`
      : `${truthDelta} truth dip that only sharpened resolve`;
  const turn = context.gameState?.turn;
  const turnLabel = formatTurnLabel(turn);
  const controlledSummary = formatStateList(context.gameState?.controlledStates);
  const controlledDescriptor = controlledSummary
    ? `cells across ${controlledSummary}`
    : 'the independent broadcast grid';
  const footnoteId = `${turn ?? '??'}-${Math.abs(truthDelta) || '0'}`;

  const truthContext: TruthBodyContextData = {
    cardName,
    subject,
    detailPrimary,
    detailSecondary,
    location,
    alternateLocation,
    witness,
    secondaryWitness,
    quoteWitness,
    expert,
    factionLabel,
    opposingFaction,
    targetState,
    truthDelta,
    truthDeltaLabel,
    truthValue,
    truthPercent,
    truthTrend,
    turn,
    turnLabel,
    controlledSummary,
    controlledDescriptor,
    rumorLines: [],
    footnoteId,
  };

  const truthRumorFactories: Array<(ctx: TruthBodyContextData) => string> = [
    ctx => `rumor ping: ${ctx.detailPrimary} download shows ${ctx.subject} signatures climbing ${ctx.truthPercent}%`,
    ctx =>
      `rumor ping: ${ctx.targetState} scanners report ${ctx.truthDeltaLabel} ${
        ctx.turnLabel ? `during ${ctx.turnLabel.toLowerCase()}` : 'tonight'
      }`,
    ctx => `rumor ping: ${ctx.opposingFaction} scrub team rerouted packets through ${ctx.alternateLocation}`,
    ctx => `rumor ping: ${ctx.secondaryWitness} logged duplicate memos at ${ctx.location}`,
    ctx => `rumor ping: ${ctx.cardName} metadata pings align with ${ctx.factionLabel} field notes`,
    ctx =>
      ctx.controlledSummary
        ? `rumor ping: cells across ${ctx.controlledSummary} synced uplinks`
        : `rumor ping: independent relays synced uplinks`,
  ];

  const seededRumors = pickMultiple(truthRumorFactories, Math.min(3, truthRumorFactories.length)).map(factory =>
    factory(truthContext),
  );
  const uniqueRumors = Array.from(new Set(seededRumors));
  for (const factory of truthRumorFactories) {
    if (uniqueRumors.length >= 3) {
      break;
    }
    const rumor = factory(truthContext);
    if (!uniqueRumors.includes(rumor)) {
      uniqueRumors.push(rumor);
    }
  }
  truthContext.rumorLines = uniqueRumors.slice(0, 3);

  const hookTemplates: ParagraphTemplate<TruthBodyContextData>[] = [
    ctx =>
      `${ctx.turnLabel ? `${ctx.turnLabel} encrypted drop` : 'Encrypted drop'} from ${ctx.detailPrimary} hit ${ctx.factionLabel}'s secure board while alarms glitched over ${ctx.location}. The leak names ${ctx.cardName} as the keystone linking ${ctx.subject} to ${ctx.targetState}.`,
    ctx =>
      `${ctx.witness} broadcast from ${ctx.location} declaring ${ctx.cardName} is not rumor but rehearsal footage for ${ctx.subject}. Files timestamped ${ctx.detailPrimary} show ${ctx.opposingFaction} denial stamps already peeling as ${ctx.turnLabel ? ctx.turnLabel.toLowerCase() : 'night shift'} monitors flashed red.`,
    ctx =>
      `${ctx.factionLabel} trackers woke to ${ctx.cardName} dossiers spiraling out of ${ctx.targetState}. Every page references ${ctx.subject} in handwriting matching ${ctx.secondaryWitness}'s earlier testimony while ${ctx.controlledDescriptor} pulsed green.`,
    ctx =>
      `Signal techs traced ${ctx.cardName} chatter to ${ctx.alternateLocation}, where ${ctx.witness} captured midnight sirens before the feed cut ${ctx.detailPrimary}. The subject line simply read: ${ctx.subject}, annotated ${ctx.truthDeltaLabel}.`,
  ];

  const midStoryTemplates: ParagraphTemplate<TruthBodyContextData>[] = [
    ctx =>
      `Field archivists from ${ctx.factionLabel} reconstructed the timeline, confirming ${ctx.cardName} entered circulation ${ctx.detailSecondary}. ${ctx.secondaryWitness} logged the upload while ${ctx.opposingFaction} routed everyone through a "routine" drill.`,
    ctx =>
      `${ctx.expert} told the Paranoid Times that ${ctx.cardName} carries a resonance identical to previous ${ctx.subject} sightings. "We mapped the harmonics across ${ctx.location}; it is literally humming the truth," the expert insisted.`,
    ctx =>
      `Witness nodes in ${ctx.targetState} cross-checked the dossier and found margin scribbles referencing ${ctx.detailSecondary}. The handwriting matches a prior ${ctx.opposingFaction} memo accidentally faxed to ${ctx.factionLabel}.`,
  ];

  const twistTemplates: ParagraphTemplate<TruthBodyContextData>[] = [
    ctx =>
      `Mid-story twist: ${ctx.secondaryWitness} intercepted a counter-briefing from ${ctx.opposingFaction} claiming ${ctx.cardName} is a ${ctx.subject} "creative writing exercise." Metadata shows the file compiled ${ctx.detailSecondary}, nine minutes before the leak surfaced.`,
    ctx =>
      `${ctx.factionLabel} analysts discovered a mirrored annex under ${ctx.alternateLocation}; inside were rehearsal tapes labeled ${ctx.cardName}. One frame shows ${ctx.cardName} stamped "Destroy after turn ${ctx.turn ?? '??'}"—but the footage survived.`,
    ctx =>
      `A courier disguised as ${ctx.quoteWitness} delivered a suitcase of negatives to ${ctx.targetState}. Each photo shows ${ctx.cardName} staged beside ${ctx.subject} equipment while ${ctx.opposingFaction} logos blur in the background.`,
  ];

  const reactionTemplates: ParagraphTemplate<TruthBodyContextData>[] = [
    ctx =>
      `${ctx.turnLabel ? `${ctx.turnLabel} dashboards` : `${ctx.factionLabel} dashboards`} now register ${ctx.truthPercent}% belief spikes across ${ctx.controlledSummary ?? 'the independent broadcast grid'}, marking a ${ctx.truthDeltaLabel}. "The paradigm tilt is measurable," ${ctx.expert} reported.`,
    ctx =>
      `Citizens occupying ${ctx.controlledSummary ?? 'autonomous watchposts'} uploaded synchronized chants spelling ${ctx.cardName}. ${ctx.witness} described the moment: "${ctx.turnLabel ? `${ctx.turnLabel.toLowerCase()} feeds` : 'The static'} cleared and every radio repeated ${ctx.subject}."`,
    ctx =>
      `Truthline moderators issued a caution that ${ctx.opposingFaction} is staging calm-down tours through ${ctx.location}. Volunteers responded by projecting ${ctx.cardName} timelines on courthouse walls anyway.`,
  ];

  const kickerTemplates: ParagraphTemplate<TruthBodyContextData>[] = [
    ctx =>
      `[FOOTNOTE ${ctx.footnoteId}]: ${ctx.cardName} audit trails remain mirrored across ${ctx.targetState}; scrub attempts traced back to ${ctx.opposingFaction} node ${ctx.alternateLocation}.`,
    ctx =>
      `[FOOTNOTE ${ctx.footnoteId}]: ${ctx.subject} references recur every ${ctx.truthValue.toFixed(1)} minutes in ${ctx.cardName} logs. Archivists archived the archive in triplicate.`,
    ctx =>
      `[FOOTNOTE ${ctx.footnoteId}]: ${ctx.factionLabel} tags this anomaly "Do Not Forget" until ${ctx.turn ?? 'the timeline resets'}.`,
  ];

  const truthQuoteTemplates: Array<ParagraphTemplate<TruthBodyContextData>> = [
    ctx => `> "${ctx.cardName} hums louder whenever ${ctx.subject} is mentioned," whispered ${ctx.quoteWitness}.`,
    ctx => `> "They told us ${ctx.targetState} was quiet. Then the monitors spelled ${ctx.cardName}," confessed ${ctx.quoteWitness}.`,
    ctx => `> "${ctx.opposingFaction} asked me to forget ${ctx.detailPrimary}. I recorded everything," ${ctx.quoteWitness} added.`,
  ];

  const truthAsideTemplates: Array<ParagraphTemplate<TruthBodyContextData>> = [
    ctx => `[REDACTED ASIDE: ${ctx.opposingFaction} quietly requisitioned ${ctx.cardName} props from ${ctx.location}. Return date: never.]`,
    ctx => `[REDACTED ASIDE: ${ctx.factionLabel} flagged ${ctx.subject} for emergency teach-ins across ${ctx.targetState}. Attendance optional, but bring foil.]`,
    ctx => `[REDACTED ASIDE: ${ctx.detailSecondary} remains under investigation; ${ctx.expert} insists the timestamp loops every ${ctx.truthValue.toFixed(1)} minutes.]`,
  ];

  const rumorListTemplate: ParagraphTemplate<TruthBodyContextData> = ctx =>
    `Rumor Mill Pings:\n${ctx.rumorLines.map(line => `- ${line}`).join('\n')}`;

  const embellishmentTemplates: ParagraphTemplate<TruthBodyContextData>[] = [
    ...truthQuoteTemplates,
    ...truthAsideTemplates,
    rumorListTemplate,
  ];

  const seenParagraphs = new Set<string>();
  const seenSentences = new Set<string>();
  const paragraphs: string[] = [];

  const pushFrom = (templates: ParagraphTemplate<TruthBodyContextData>[]) => {
    const paragraph = pickUniqueParagraph(templates, truthContext, seenParagraphs, seenSentences);
    if (paragraph) {
      paragraphs.push(paragraph);
    }
  };

  pushFrom(hookTemplates);
  pushFrom(midStoryTemplates);

  const embellishmentMid = maybePickEmbellishment(
    embellishmentTemplates,
    truthContext,
    seenParagraphs,
    seenSentences,
    0.7,
  );
  if (embellishmentMid) {
    paragraphs.push(embellishmentMid);
  }

  pushFrom(twistTemplates);
  pushFrom(reactionTemplates);

  const embellishmentLate = maybePickEmbellishment(
    embellishmentTemplates,
    truthContext,
    seenParagraphs,
    seenSentences,
    0.4,
  );
  if (embellishmentLate) {
    paragraphs.push(embellishmentLate);
  }

  const kicker = pickUniqueParagraph(kickerTemplates, truthContext, seenParagraphs, seenSentences);
  if (kicker) {
    paragraphs.push(kicker);
  }

  return paragraphs.join('\n\n');
}

interface GovBodyContextData {
  cardName: string;
  euphemismPrimary: string;
  euphemismSecondary: string;
  euphemismTertiary: string;
  detailPrimary: string;
  detailSecondary: string;
  location: string;
  alternateLocation: string;
  official: string;
  deputy: string;
  agencyLabel: string;
  factionName: string;
  targetState: string;
  witness: string;
  truthValue: number;
  truthPercent: number;
  truthDelta: number;
  truthDeltaLabel: string;
  complianceProgram: string;
  rumorLines: string[];
  footnoteId: string;
  turn?: number;
  turnLabel?: string | null;
  controlledSummary?: string | null;
  controlledDescriptor: string;
}

function generateGovBody(context: ArticleContext): string {
  const theme = deriveTheme(context.card.tags);
  const cardName = context.card.name;
  const euphemismPool = theme?.govEuphemisms?.length ? theme.govEuphemisms : GOV_EUPHEMISMS;
  const euphemismPrimary = pick(euphemismPool);
  const euphemismSecondary = pickDistinct(euphemismPool, [euphemismPrimary]);
  const euphemismTertiary = pickDistinct(euphemismPool, [euphemismPrimary, euphemismSecondary]);
  const fallbackGovDetails = [
    'a compliance rehearsal still underway',
    'an unrelated atmospheric paperwork exercise',
    'a controlled rumor fatigue drill',
    'a voluntary calmness symposium',
  ];
  const govDetailPool = theme?.govDetails?.length ? theme.govDetails : fallbackGovDetails;
  const detailPrimary = pick(govDetailPool);
  const detailSecondary = pickDistinct(govDetailPool, [detailPrimary]);
  const location = pick(LOCATIONS);
  const alternateLocation = pickDistinct(LOCATIONS, [location]);
  const official = `${pick(['Director', 'Deputy Director', 'Coordinator', 'Administrator', 'Assistant Undersecretary'])} ${pick([
    'Karen Walsh',
    'Marcus Thompson',
    'Donald Pierce',
    'Patricia Ng',
    'Rosa Valdez',
  ])}`;
  const deputy = `${pick(['Acting Liaison', 'Senior Compliance Officer', 'Briefing Coach', 'Deputy Narrator'])} ${pick([
    'Elaine Brooks',
    'Victor Lang',
    'Holly Tran',
    'Samuel Ortiz',
  ])}`;
  const agencyLabel = pick([
    'Department of Normalcy',
    'Containment Bureau',
    'Office of Plausible Events',
    'Continuity Stabilization Wing',
  ]);
  const factionName = context.card.faction ? context.card.faction.toUpperCase() : 'GOVERNMENT';
  const targetState = context.targetState || 'all relevant jurisdictions';
  const witness = pick(WITNESSES);
  const truthValue = context.gameState?.truth ?? 50;
  const truthPercent = Math.round(truthValue);
  const truthDelta = context.truthDelta ?? 0;
  const truthDeltaLabel =
    truthDelta === 0
      ? 'no measurable deviation in public calm index'
      : truthDelta > 0
      ? `containment drift of +${truthDelta}`
      : `containment improvement of ${truthDelta}`;
  const complianceProgram = pick([
    'mandatory calmness webinar',
    'voluntary memory realignment',
    'preventative rumor fatigue clinic',
    'authorized narrative meditation session',
  ]);
  const turn = context.gameState?.turn;
  const turnLabel = formatTurnLabel(turn);
  const controlledSummary = formatStateList(context.gameState?.controlledStates);
  const controlledDescriptor = controlledSummary
    ? `coverage across ${controlledSummary}`
    : 'all authorized jurisdictions';
  const footnoteId = `${turn ?? '??'}-${cardName.replace(/\s+/g, '').slice(0, 4).toUpperCase() || 'CARD'}`;

  const govContext: GovBodyContextData = {
    cardName,
    euphemismPrimary,
    euphemismSecondary,
    euphemismTertiary,
    detailPrimary,
    detailSecondary,
    location,
    alternateLocation,
    official,
    deputy,
    agencyLabel,
    factionName,
    targetState,
    witness,
    truthValue,
    truthPercent,
    truthDelta,
    truthDeltaLabel,
    complianceProgram,
    rumorLines: [],
    footnoteId,
    turn,
    turnLabel,
    controlledSummary,
    controlledDescriptor,
  };

  const govRumorFactories: Array<(ctx: GovBodyContextData) => string> = [
    ctx => `clarification memo: ${ctx.agencyLabel} recorded ${ctx.truthDeltaLabel}`,
    ctx =>
      `clarification memo: ${ctx.complianceProgram} scheduled at ${ctx.location} for ${ctx.turnLabel ? ctx.turnLabel.toLowerCase() : 'ongoing'} attendance`,
    ctx => `clarification memo: ${ctx.deputy} filed ${ctx.cardName} under ${ctx.euphemismSecondary}`,
    ctx => `clarification memo: chatter about ${ctx.cardName} redirected to ${ctx.alternateLocation}`,
    ctx =>
      `clarification memo: ${ctx.factionName} monitors guarantee ${ctx.targetState} remains routine across ${ctx.controlledSummary ?? 'all sectors'}`,
    ctx =>
      ctx.turnLabel
        ? `clarification memo: ${ctx.turnLabel} status board shows ${ctx.controlledDescriptor}`
        : `clarification memo: status board shows ${ctx.controlledDescriptor}`,
  ];

  const seededClarifications = pickMultiple(
    govRumorFactories,
    Math.min(3, govRumorFactories.length),
  ).map(factory => factory(govContext));
  const uniqueClarifications = Array.from(new Set(seededClarifications));
  for (const factory of govRumorFactories) {
    if (uniqueClarifications.length >= 3) {
      break;
    }
    const item = factory(govContext);
    if (!uniqueClarifications.includes(item)) {
      uniqueClarifications.push(item);
    }
  }
  govContext.rumorLines = uniqueClarifications.slice(0, 3);

  const hookTemplates: ParagraphTemplate<GovBodyContextData>[] = [
    ctx =>
      `${ctx.turnLabel ? `${ctx.turnLabel} bulletin` : 'Bulletin'} from ${ctx.agencyLabel} assures ${ctx.targetState} residents that ${ctx.cardName} qualifies as ${ctx.euphemismPrimary}. ${ctx.official} thanked citizens for their enthusiasm and reminded them to recycle speculation responsibly across ${ctx.controlledSummary ?? 'authorized jurisdictions'}.`,
    ctx =>
      `In a ${ctx.turnLabel ? ctx.turnLabel.toLowerCase() : 'dawn'} briefing, ${ctx.agencyLabel} labeled ${ctx.cardName} a textbook case of ${ctx.euphemismPrimary}, complete with commemorative binder clips. ${ctx.deputy} described the situation as "professionally boring."`,
    ctx =>
      `Press liaisons for ${ctx.factionName} distributed talking points declaring ${ctx.cardName} "well within ${ctx.euphemismPrimary} tolerances." Flyers were posted across ${ctx.location} before sunrise to reassure ${ctx.controlledDescriptor}.`,
  ];

  const midStoryTemplates: ParagraphTemplate<GovBodyContextData>[] = [
    ctx =>
      `Official documentation cites ${ctx.detailPrimary} as the only noteworthy development. "It sounds dramatic, but in practice it's ${ctx.euphemismSecondary}," ${ctx.official} repeated while unveiling a pie chart showing nothing.`,
    ctx =>
      `${ctx.agencyLabel} archivists condensed 312 pages of public inquiries into a single footnote marked ${ctx.euphemismSecondary}. The filing was witnessed by ${ctx.deputy}, who encouraged citizens to attend ${ctx.complianceProgram}.`,
    ctx =>
      `A classified addendum references ${ctx.detailSecondary}, but the text is entirely black bars. "Redaction is a form of reassurance," explained ${ctx.official} while nodding at the empty screens.`,
  ];

  const twistTemplates: ParagraphTemplate<GovBodyContextData>[] = [
    ctx =>
      `Mid-story twist: rumor monitors detected ${ctx.witness} repeating "${ctx.cardName}" near ${ctx.alternateLocation}. Agents promptly issued ${ctx.euphemismTertiary} pamphlets and escorted the witness to a guided calm walk.`,
    ctx =>
      `An anonymous memo alleged ${ctx.cardName} interfaces with ${ctx.targetState}. ${ctx.agencyLabel} traced the memo to an overcaffeinated intern and filed it under ${ctx.euphemismTertiary}.`,
    ctx =>
      `${ctx.deputy} confirmed that surveillance footage showing ${ctx.cardName} at ${ctx.location} was actually rehearsal for ${ctx.detailPrimary}. The video has been looped over calming elevator music for public review.`,
  ];

  const reactionTemplates: ParagraphTemplate<GovBodyContextData>[] = [
    ctx =>
      `${ctx.turnLabel ? `${ctx.turnLabel} community check` : 'Community management teams'} report ${ctx.truthPercent}% of citizens remain serenely informed. "The remaining ${100 - ctx.truthPercent}% are enrolled in ${ctx.complianceProgram}," ${ctx.official} noted with a reassuring smile.`,
    ctx =>
      `${ctx.agencyLabel} deployed portable suggestion boxes across ${ctx.targetState} and ${ctx.controlledDescriptor} for anyone experiencing "unauthorized curiosity" about ${ctx.cardName}. Submissions will be answered within five to seven fiscal quarters.`,
    ctx =>
      `Public calm alerts read ${ctx.truthDeltaLabel}; still, ${ctx.deputy} reminded everyone that repeating ${ctx.cardName} three times voids your complimentary tote bag before ${ctx.controlledSummary ?? 'routine monitors'} cycle to ${ctx.turnLabel ? ctx.turnLabel.toLowerCase() : 'the next'} shift.`,
  ];

  const kickerTemplates: ParagraphTemplate<GovBodyContextData>[] = [
    ctx =>
      `[AUTHORIZED FOOTNOTE ${ctx.footnoteId}]: ${ctx.cardName} remains cataloged as ${ctx.euphemismPrimary}. Unscheduled curiosity should be logged with ${ctx.agencyLabel}.`,
    ctx =>
      `[AUTHORIZED FOOTNOTE ${ctx.footnoteId}]: ${ctx.factionName} retains discretion to update terminology to ${ctx.euphemismSecondary} pending further calmness.`,
    ctx =>
      `[AUTHORIZED FOOTNOTE ${ctx.footnoteId}]: Citizens referencing ${ctx.detailPrimary} must first attend ${ctx.complianceProgram}.`,
  ];

  const quoteTemplates: Array<ParagraphTemplate<GovBodyContextData>> = [
    ctx => `> "Everything about ${ctx.cardName} is gloriously ${ctx.euphemismPrimary}," promised ${ctx.official}.`,
    ctx => `> "We adore public enthusiasm, but please RSVP for ${ctx.complianceProgram} first," sighed ${ctx.deputy}.`,
    ctx => `> "Rumors are just data that forgot to attend orientation," explained ${ctx.official}.`,
  ];

  const asideTemplates: Array<ParagraphTemplate<GovBodyContextData>> = [
    ctx => `[REDACTED ADDENDUM: ${ctx.agencyLabel} purchased additional shredders for ${ctx.detailSecondary}.]`,
    ctx => `[REDACTED ADDENDUM: ${ctx.factionName} analysts found the ${ctx.witness} account "spirited" but ultimately ${ctx.euphemismTertiary}.]`,
    ctx => `[REDACTED ADDENDUM: Audio from ${ctx.location} now plays whale sounds to discourage speculation.]`,
  ];

  const clarificationTemplate: ParagraphTemplate<GovBodyContextData> = ctx =>
    `Authorized Clarifications:\n${ctx.rumorLines.map(line => `- ${line}`).join('\n')}`;

  const embellishmentTemplates: ParagraphTemplate<GovBodyContextData>[] = [
    ...quoteTemplates,
    ...asideTemplates,
    clarificationTemplate,
  ];

  const seenParagraphs = new Set<string>();
  const seenSentences = new Set<string>();
  const paragraphs: string[] = [];

  const pushFrom = (templates: ParagraphTemplate<GovBodyContextData>[]) => {
    const paragraph = pickUniqueParagraph(templates, govContext, seenParagraphs, seenSentences);
    if (paragraph) {
      paragraphs.push(paragraph);
    }
  };

  pushFrom(hookTemplates);
  pushFrom(midStoryTemplates);

  const embellishmentMid = maybePickEmbellishment(
    embellishmentTemplates,
    govContext,
    seenParagraphs,
    seenSentences,
    0.6,
  );
  if (embellishmentMid) {
    paragraphs.push(embellishmentMid);
  }

  pushFrom(twistTemplates);
  pushFrom(reactionTemplates);

  const embellishmentLate = maybePickEmbellishment(
    embellishmentTemplates,
    govContext,
    seenParagraphs,
    seenSentences,
    0.35,
  );
  if (embellishmentLate) {
    paragraphs.push(embellishmentLate);
  }

  const kicker = pickUniqueParagraph(kickerTemplates, govContext, seenParagraphs, seenSentences);
  if (kicker) {
    paragraphs.push(kicker);
  }

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

const buildContextTags = (context: ArticleContext): string[] => {
  const tags: string[] = [];

  const pushTag = (raw?: string | null) => {
    if (!raw) {
      return;
    }
    const sanitized = sanitizeTag(raw);
    if (!sanitized) {
      return;
    }
    const hashed = ensureHashTag(sanitized);
    if (hashed) {
      tags.push(hashed);
    }
  };

  if (context.targetState) {
    pushTag(`state-${context.targetState}`);
  }

  const turn = context.gameState?.turn;
  if (typeof turn === 'number' && Number.isFinite(turn)) {
    pushTag(`turn-${turn}`);
  }

  const truthDelta = context.truthDelta;
  if (typeof truthDelta === 'number' && !Number.isNaN(truthDelta)) {
    if (truthDelta === 0) {
      pushTag('truth-hold');
    } else if (truthDelta > 0) {
      pushTag(`truth-surge-${truthDelta}`);
    } else {
      pushTag(`truth-dip-${Math.abs(truthDelta)}`);
    }
  }

  const controlledStates = Array.from(
    new Set(
      (context.gameState?.controlledStates || [])
        .map(state => (typeof state === 'string' ? state.trim() : ''))
        .filter((state): state is string => Boolean(state)),
    ),
  );

  for (const state of controlledStates.slice(0, 2)) {
    pushTag(`cell-${state}`);
  }

  if (controlledStates.length > 2) {
    pushTag(`cell-network-${controlledStates.length}`);
  }

  return tags;
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

  const contextTags = buildContextTags(context);
  const prioritized = [...contextTags, ...normalizeCardTags(context.card.tags)];
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
