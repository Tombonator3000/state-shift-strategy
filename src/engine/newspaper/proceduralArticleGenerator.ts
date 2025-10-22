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
  'EXPOSES', 'REVEALS', 'LEAKS', 'UNCOVERS', 'DETONATES', 'CRACKS OPEN',
  'BLOWS LID OFF', 'SPILLS BEANS ON', 'DRAGS INTO LIGHT', 'BREAKS SILENCE ON'
];

const GOV_ACTION_VERBS = [
  'NEUTRALIZES', 'CONTAINS', 'CLASSIFIES', 'REDACTS', 'SUPPRESSES',
  'RECLASSIFIES', 'ARCHIVES', 'SEALS', 'ENCRYPTS', 'DISAPPEARS'
];

const GOV_EUPHEMISMS = [
  'routine administrative adjustment', 'scheduled maintenance event',
  'standard protocol activation', 'benign atmospheric phenomenon',
  'weather balloon test', 'swamp gas incident', 'technical glitch',
  'localized temporal anomaly', 'authorized training exercise',
  'bureaucratic housekeeping', 'nothing to see here situation'
];

const LOCATIONS = [
  'Area 51', 'Roswell', 'Dulce Base', 'Pine Gap', 'Wright-Patterson AFB',
  'Groom Lake', 'Montauk', 'Denver Airport', 'NORAD', 'The Pentagon',
  'Nevada Test Site', 'Hangar 18', 'S-4 Facility', 'Cheyenne Mountain'
];

const CRYPTIDS = [
  'Bigfoot', 'Mothman', 'Chupacabra', 'Jersey Devil', 'Wendigo',
  'Flatwoods Monster', 'Dover Demon', 'Lizard Man', 'Goatman',
  'Fresno Nightcrawler', 'Bat Boy', 'Skunk Ape'
];

const CONSPIRACY_GROUPS = [
  'Shadow Government', 'Deep State', 'Majestic 12', 'Illuminati',
  'Men in Black', 'Black Helicopters Division', 'Bilderberg Group',
  'Trilateral Commission', 'Committee of 300', 'Dulce Warriors'
];

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
  'By: Bunker Correspondent #47'
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
  'By: Bureau of Standard Explanations'
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
  'diner waitress working the graveyard shift'
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
  'beside the abandoned Radio Shack'
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickMultiple<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function generateTruthHeadline(context: ArticleContext): string {
  const verb = pick(TRUTH_ACTION_VERBS);
  const cardName = context.card.name.toUpperCase();
  const subject = pick([...CRYPTIDS, ...LOCATIONS, ...CONSPIRACY_GROUPS]);
  
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
  const verb = pick(GOV_ACTION_VERBS);
  const euphemism = pick(GOV_EUPHEMISMS);
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
  const witness = pick(WITNESSES);
  const detail = pick(SPECIFIC_DETAILS);
  
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
  const euphemism = pick(GOV_EUPHEMISMS);
  
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
  const cardName = context.card.name;
  const witness = pick(WITNESSES);
  const detail = pick(SPECIFIC_DETAILS);
  const subject = pick([...CRYPTIDS, ...LOCATIONS, ...CONSPIRACY_GROUPS]);
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
  const cardName = context.card.name;
  const euphemism = pick(GOV_EUPHEMISMS);
  const euphemism2 = pick(GOV_EUPHEMISMS);
  const official = `${pick(['Director', 'Deputy Director', 'Coordinator', 'Administrator'])} ${pick(['Karen Walsh', 'Marcus Thompson', 'Donald Pierce', 'Patricia Ng'])}`;
  
  const paragraphs = [
    `The Department of Normalcy issued a comprehensive 847-page report today addressing public concerns about ${cardName}, conclusively determining it qualifies as a standard ${euphemism} requiring no further citizen attention.`,
    
    `"We appreciate community vigilance," stated ${official} at a mandatory press briefing. "However, speculation regarding ${cardName} serves no constructive purpose. Our analysis demonstrates this is textbook ${euphemism}, occurring approximately never and unlikely to repeat. All documentation supports this conclusion, which is why we've classified the documentation."`,
    
    `The report notably dedicates 347 pages to explaining why certain questions should not be asked, 289 pages to redacted appendices, and a final chapter titled "Why This Report Itself Should Not Raise Questions."`,
    
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
  
  return [...pickMultiple(baseTags, 2), ...typeTags].slice(0, 4);
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
