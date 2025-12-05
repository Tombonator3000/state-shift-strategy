/**
 * SmartNarrativeComposer - Intelligent multi-card story generation
 *
 * Creates coherent newspaper articles when multiple cards are played together,
 * combining their themes, factions, and effects into unified narratives.
 */

import type { Card } from '@/types';

export interface CardPlayContext {
  card: Card;
  player: 'human' | 'ai';
  truthDelta?: number;
  ipDelta?: number;
  pressureDelta?: number;
  targetState?: string;
  capturedStates?: string[];
}

export interface NarrativeOutput {
  headline: string;
  subhead: string;
  body: string[];
  byline: string;
  tone: 'truth' | 'government' | 'mixed';
  imagePrompt: string;
  tags: string[];
}

// ============================================================================
// WORD BANKS FOR DYNAMIC COMPOSITION
// ============================================================================

const TRUTH_ACTION_VERBS = {
  primary: [
    'EXPOSES', 'UNMASKS', 'REVEALS', 'BLOWS LID OFF', 'BROADCASTS',
    'LEAKS', 'DOCUMENTS', 'STREAMS LIVE', 'CAPTURES ON FILM', 'WITNESSES'
  ],
  secondary: [
    'CONFIRMS', 'CORROBORATES', 'AMPLIFIES', 'SPREADS', 'VALIDATES',
    'ESCALATES', 'PROVES', 'DEMONSTRATES', 'VERIFIES', 'AUTHENTICATES'
  ],
  consequence: [
    'OFFICIALS SCRAMBLE', 'COVER-UP CRUMBLES', 'DENIAL FAILS',
    'WITNESSES MULTIPLY', 'FOOTAGE GOES VIRAL', 'TRUTH METER SPIKES',
    'REALITY SHIFTS', 'NARRATIVE COLLAPSES', 'SPIN DOCTORS PANIC'
  ]
};

const GOV_ACTION_VERBS = {
  primary: [
    'CONTAINS', 'CLASSIFIES', 'REDIRECTS', 'NEUTRALIZES', 'DOWNPLAYS',
    'SEALS', 'ARCHIVES', 'PROCESSES', 'MANAGES', 'COORDINATES'
  ],
  secondary: [
    'REINFORCES', 'STABILIZES', 'IMPLEMENTS', 'DEPLOYS', 'ACTIVATES',
    'MOBILIZES', 'INITIATES', 'EXECUTES', 'ADMINISTERS', 'FACILITATES'
  ],
  consequence: [
    'SITUATION NORMALIZED', 'NOTHING TO SEE HERE', 'ALL ACCORDING TO PROTOCOL',
    'MATTER RESOLVED', 'INQUIRY CONCLUDED', 'RECORDS SEALED',
    'PRESS BRIEFING POSTPONED', 'ROUTINE OPERATION COMPLETE'
  ]
};

const THEME_KEYWORDS: Record<string, string[]> = {
  ufo: ['saucer', 'lights in sky', 'unidentified craft', 'aerial phenomenon', 'mothership'],
  alien: ['grey entities', 'extraterrestrial', 'visitors', 'beings', 'specimens'],
  cryptid: ['creature', 'beast', 'entity', 'specimen', 'anomaly'],
  bigfoot: ['sasquatch', 'forest giant', 'hairy biped', 'woodland entity'],
  mothman: ['winged omen', 'red eyes', 'bridge harbinger', 'prophetic entity'],
  ghost: ['spirit', 'ectoplasm', 'apparition', 'poltergeist', 'haunting'],
  elvis: ['the King', 'rhinestone pilot', 'velvet visitor', 'jumpsuit sighting'],
  'florida-man': ['swamp oracle', 'gator whisperer', 'everglades operative'],
  coverup: ['redaction', 'classified folder', 'sealed records', 'black bars'],
  bureaucracy: ['forms in triplicate', 'processing queue', 'interdepartmental memo'],
  disclosure: ['leaked documents', 'whistleblower', 'FOIA dump', 'exposed files'],
  media: ['broadcast', 'signal', 'transmission', 'channel', 'feed'],
  attack: ['strike', 'operation', 'raid', 'offensive', 'mission'],
  zone: ['territory', 'region', 'district', 'sector', 'perimeter']
};

const CONNECTORS = {
  causal: ['AS', 'WHILE', 'JUST AS', 'MOMENTS BEFORE', 'SECONDS AFTER'],
  additive: ['AND', 'PLUS', 'ALONGSIDE', 'COMBINED WITH', 'TOGETHER WITH'],
  contrast: ['BUT', 'YET', 'HOWEVER', 'DESPITE', 'ALTHOUGH'],
  sequential: ['THEN', 'NEXT', 'FOLLOWING', 'SUBSEQUENTLY', 'THEREAFTER']
};

const SUBHEAD_TEMPLATES = {
  truth: [
    'Multiple witnesses corroborate {theme1} claims as {theme2} evidence surfaces',
    'Officials deny {theme1} connection to {theme2} despite mounting evidence',
    'Amateur footage captures {theme1} moments before {theme2} incident',
    'Truth meter spikes as {theme1} and {theme2} converge in unprecedented event',
    'Eyewitnesses describe {theme1} phenomena coinciding with {theme2} activity'
  ],
  government: [
    'Multi-agency coordination ensures {theme1} and {theme2} matters remain classified',
    'Spokesperson cites {theme1} as unrelated to {theme2} investigations',
    'Security protocols activated following {theme1} and {theme2} developments',
    'Press credentials revoked after {theme1} questions trigger {theme2} review',
    'Administrative procedures normalize {theme1} while {theme2} files archived'
  ],
  mixed: [
    'Conflicting reports emerge as {theme1} clashes with {theme2} narrative',
    'Dueling press conferences address {theme1} and {theme2} simultaneously',
    'Citizens document {theme1} while officials redirect to {theme2}',
    'Truth and containment collide over {theme1} and {theme2} revelations',
    'Spin meets substance as {theme1} and {theme2} dominate headlines'
  ]
};

const BODY_SENTENCE_TEMPLATES = {
  opening: {
    truth: [
      'Tonight\'s unprecedented convergence began when {card1} triggered a cascade of revelations.',
      'Multiple sources confirm that {card1} set off a chain reaction of disclosures.',
      'The evening\'s events started with {card1}, quickly escalating beyond official containment.',
      'Witnesses report {card1} as the catalyst for what followed.',
      'Amateur investigators traced the night\'s chaos back to {card1}.'
    ],
    government: [
      'A coordinated response was initiated following developments related to {card1}.',
      'Official channels activated standard protocols after {card1} was logged.',
      'Multi-departmental resources were deployed in response to {card1}.',
      'The administration\'s measured response to {card1} proceeded as scheduled.',
      'Briefings were updated to reflect the {card1} situation.'
    ]
  },
  middle: {
    truth: [
      'The situation intensified when {card2} added credibility to earlier claims.',
      'Footage of {card2} circulated rapidly, corroborating eyewitness accounts.',
      '{card2} provided the smoking gun that skeptics had demanded.',
      'Social media erupted as {card2} validated citizen journalism.',
      'The {card2} development connected dots that officials had insisted were unrelated.'
    ],
    government: [
      'Additional measures were implemented once {card2} entered the equation.',
      'Resource allocation was adjusted to address {card2} variables.',
      '{card2} necessitated expanded talking points across all channels.',
      'The {card2} factor was incorporated into revised public guidance.',
      'Contingency plans for {card2} scenarios were activated seamlessly.'
    ]
  },
  climax: {
    truth: [
      'Everything changed when {card3} delivered undeniable proof.',
      'The {card3} revelation forced even mainstream outlets to acknowledge the pattern.',
      '{card3} sealed the narrative, leaving no room for official denial.',
      'By the time {card3} hit the wires, the cover story was already unraveling.',
      'The triple-point convergence peaked with {card3}, overwhelming damage control.'
    ],
    government: [
      'The {card3} component allowed for comprehensive narrative synchronization.',
      'With {card3} addressed, the official position achieved optimal clarity.',
      '{card3} implementation completed the planned operational arc.',
      'The inclusion of {card3} ensured consistent messaging across all briefings.',
      'Final coordination involving {card3} brought the matter to scheduled resolution.'
    ]
  },
  closing: {
    truth: [
      'Citizens are advised to trust their eyes and back up all footage.',
      'More revelations expected as the truth continues to leak through official walls.',
      'The paranoid were proven right again—stay tuned and stay skeptical.',
      'Tonight\'s events mark a turning point. The old narratives are crumbling.',
      'Experts predict this is only the beginning. Reality has entered the chat.'
    ],
    government: [
      'Citizens are reminded that official channels remain the authoritative source.',
      'Further updates will be provided through approved media partners.',
      'The matter is considered resolved pending routine follow-up procedures.',
      'Public cooperation in maintaining operational security is appreciated.',
      'Normal activities may resume. Thank you for your patience and compliance.'
    ]
  }
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const pick = <T>(arr: readonly T[], seed: string): T => {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return arr[Math.abs(hash) % arr.length];
};

const pickRandom = <T>(arr: readonly T[]): T => {
  return arr[Math.floor(Math.random() * arr.length)];
};

const extractTags = (card: Card): string[] => {
  const tags: string[] = [];

  // Get explicit tags if available
  if ('tags' in card && Array.isArray((card as any).tags)) {
    tags.push(...(card as any).tags);
  }

  // Extract implicit tags from card name
  const nameLower = card.name.toLowerCase();
  for (const [keyword] of Object.entries(THEME_KEYWORDS)) {
    if (nameLower.includes(keyword.replace('-', ' ')) || nameLower.includes(keyword)) {
      tags.push(keyword);
    }
  }

  // Add type as tag
  tags.push(card.type.toLowerCase());

  // Add faction as tag
  tags.push(card.faction.toLowerCase().includes('gov') ? 'government' : 'truth');

  return [...new Set(tags)];
};

const getThemeWord = (tag: string, seed: string): string => {
  const pool = THEME_KEYWORDS[tag] ?? THEME_KEYWORDS[tag.toLowerCase()] ?? ['phenomenon'];
  return pick(pool, seed);
};

const determineTone = (cards: CardPlayContext[]): 'truth' | 'government' | 'mixed' => {
  const factions = cards.map(c => {
    const f = c.card.faction.toLowerCase();
    return f.includes('gov') ? 'government' : 'truth';
  });

  const truthCount = factions.filter(f => f === 'truth').length;
  const govCount = factions.filter(f => f === 'government').length;

  if (truthCount === cards.length) return 'truth';
  if (govCount === cards.length) return 'government';
  return 'mixed';
};

const getMostRelevantTags = (cards: CardPlayContext[]): string[] => {
  const tagCounts = new Map<string, number>();

  for (const ctx of cards) {
    const tags = extractTags(ctx.card);
    for (const tag of tags) {
      if (tag !== 'truth' && tag !== 'government' && tag !== 'attack' && tag !== 'media' && tag !== 'zone') {
        tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
      }
    }
  }

  return Array.from(tagCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([tag]) => tag);
};

// ============================================================================
// HEADLINE GENERATION
// ============================================================================

function generateHeadline(cards: CardPlayContext[], tone: 'truth' | 'government' | 'mixed'): string {
  const seed = cards.map(c => c.card.id).join('|');
  const names = cards.map(c => c.card.name.toUpperCase());
  const types = cards.map(c => c.card.type);

  if (tone === 'truth') {
    const mainVerb = pick(TRUTH_ACTION_VERBS.primary, seed + 'main');
    const connector = pick(CONNECTORS.causal, seed + 'conn');
    const consequence = pick(TRUTH_ACTION_VERBS.consequence, seed + 'conseq');

    if (cards.length === 2) {
      return `${names[0]} ${mainVerb} ${connector} ${names[1]} ${pick(TRUTH_ACTION_VERBS.secondary, seed + 'sec')} — ${consequence}`;
    } else if (cards.length === 3) {
      const secondVerb = pick(TRUTH_ACTION_VERBS.secondary, seed + 'sec');
      return `${names[0]} ${mainVerb} • ${names[1]} ${secondVerb} • ${names[2]} ${pick(TRUTH_ACTION_VERBS.secondary, seed + 'third')} — ${consequence}`;
    }

    return `${names.join(' + ')}: ${mainVerb} — ${consequence}`;
  }

  if (tone === 'government') {
    const mainVerb = pick(GOV_ACTION_VERBS.primary, seed + 'main');
    const consequence = pick(GOV_ACTION_VERBS.consequence, seed + 'conseq');

    if (cards.length === 2) {
      return `${names[0]} ${mainVerb} • ${names[1]} ${pick(GOV_ACTION_VERBS.secondary, seed + 'sec')} — ${consequence}`;
    } else if (cards.length === 3) {
      return `TRIPLE PROTOCOL: ${names[0]} • ${names[1]} • ${names[2]} — ${consequence}`;
    }

    return `ADMINISTRATIVE NOTICE: ${names.join(' • ')} — ${consequence}`;
  }

  // Mixed tone - narrative clash
  const truthCards = cards.filter(c => !c.card.faction.toLowerCase().includes('gov'));
  const govCards = cards.filter(c => c.card.faction.toLowerCase().includes('gov'));

  const truthName = truthCards[0]?.card.name.toUpperCase() ?? 'DISCLOSURE';
  const govName = govCards[0]?.card.name.toUpperCase() ?? 'CONTAINMENT';

  const clashVerbs = ['VS', 'CLASHES WITH', 'BATTLES', 'CONFRONTS', 'CHALLENGES'];
  const clash = pick(clashVerbs, seed + 'clash');

  return `${truthName} ${clash} ${govName} — DUELING NARRATIVES ROCK THE NATION`;
}

// ============================================================================
// SUBHEAD GENERATION
// ============================================================================

function generateSubhead(cards: CardPlayContext[], tone: 'truth' | 'government' | 'mixed'): string {
  const seed = cards.map(c => c.card.id).join('|');
  const relevantTags = getMostRelevantTags(cards);

  const theme1 = relevantTags[0] ? getThemeWord(relevantTags[0], seed + 'th1') : 'phenomena';
  const theme2 = relevantTags[1] ? getThemeWord(relevantTags[1], seed + 'th2') : 'incidents';

  const templates = SUBHEAD_TEMPLATES[tone];
  const template = pick(templates, seed + 'subhead');

  return template
    .replace('{theme1}', theme1)
    .replace('{theme2}', theme2);
}

// ============================================================================
// BODY GENERATION
// ============================================================================

function generateBody(cards: CardPlayContext[], tone: 'truth' | 'government' | 'mixed'): string[] {
  const seed = cards.map(c => c.card.id).join('|');
  const toneKey = tone === 'mixed' ? (Math.random() > 0.5 ? 'truth' : 'government') : tone;

  const paragraphs: string[] = [];

  // Opening paragraph
  const openingTemplate = pick(BODY_SENTENCE_TEMPLATES.opening[toneKey], seed + 'open');
  paragraphs.push(openingTemplate.replace('{card1}', cards[0]?.card.name ?? 'the first play'));

  // Middle paragraph(s)
  if (cards.length >= 2) {
    const middleTemplate = pick(BODY_SENTENCE_TEMPLATES.middle[toneKey], seed + 'mid');
    paragraphs.push(middleTemplate.replace('{card2}', cards[1]?.card.name ?? 'subsequent developments'));
  }

  // Climax paragraph
  if (cards.length >= 3) {
    const climaxTemplate = pick(BODY_SENTENCE_TEMPLATES.climax[toneKey], seed + 'climax');
    paragraphs.push(climaxTemplate.replace('{card3}', cards[2]?.card.name ?? 'the final revelation'));
  }

  // Add effect descriptions
  const effectDescriptions = generateEffectDescriptions(cards, tone);
  if (effectDescriptions) {
    paragraphs.push(effectDescriptions);
  }

  // Closing paragraph
  const closingTemplate = pick(BODY_SENTENCE_TEMPLATES.closing[toneKey], seed + 'close');
  paragraphs.push(closingTemplate);

  return paragraphs;
}

function generateEffectDescriptions(cards: CardPlayContext[], tone: 'truth' | 'government' | 'mixed'): string | null {
  const effects: string[] = [];

  let totalTruth = 0;
  let totalIP = 0;
  let totalPressure = 0;
  const capturedStates: string[] = [];
  const targetedStates: string[] = [];

  for (const ctx of cards) {
    if (ctx.truthDelta) totalTruth += ctx.truthDelta;
    if (ctx.ipDelta) totalIP += ctx.ipDelta;
    if (ctx.pressureDelta) totalPressure += ctx.pressureDelta;
    if (ctx.capturedStates) capturedStates.push(...ctx.capturedStates);
    if (ctx.targetState) targetedStates.push(ctx.targetState);
  }

  if (tone === 'truth' || tone === 'mixed') {
    if (totalTruth > 0) {
      effects.push(`The truth meter surged ${totalTruth > 5 ? 'dramatically' : 'noticeably'} by ${Math.abs(totalTruth)} points`);
    }
    if (totalIP !== 0) {
      effects.push(`resource allocation ${totalIP > 0 ? 'favored disclosure' : 'drained containment budgets'} by ${Math.abs(totalIP)} IP`);
    }
    if (capturedStates.length > 0) {
      effects.push(`${capturedStates.join(' and ')} ${capturedStates.length > 1 ? 'have' : 'has'} flipped to the truth column`);
    }
  } else {
    if (totalTruth < 0) {
      effects.push(`Public awareness metrics were normalized by ${Math.abs(totalTruth)} points`);
    }
    if (totalIP !== 0) {
      effects.push(`operational budgets ${totalIP > 0 ? 'expanded' : 'optimized'} by ${Math.abs(totalIP)} IP`);
    }
    if (targetedStates.length > 0) {
      effects.push(`containment efforts focused on ${targetedStates.slice(0, 2).join(' and ')}`);
    }
  }

  if (effects.length === 0) return null;

  return `Analysts report ${effects.join('; ')}.`;
}

// ============================================================================
// IMAGE PROMPT GENERATION
// ============================================================================

function generateImagePrompt(cards: CardPlayContext[], tone: 'truth' | 'government' | 'mixed'): string {
  const relevantTags = getMostRelevantTags(cards);
  const seed = cards.map(c => c.card.id).join('|');

  const baseStyle = 'grainy 1990s black and white photo, halftone newspaper style, slightly out of focus';

  const elements: string[] = [];

  // Add theme-specific elements
  for (const tag of relevantTags.slice(0, 2)) {
    const themeElements: Record<string, string[]> = {
      ufo: ['hovering disc', 'beam of light', 'night sky'],
      alien: ['shadowy figures', 'examination room', 'surgical equipment'],
      cryptid: ['forest edge', 'blurry silhouette', 'amateur photographer'],
      bigfoot: ['pine trees', 'large footprint', 'motion blur'],
      mothman: ['bridge structure', 'red glowing eyes', 'wing shadow'],
      ghost: ['transparent figure', 'old building', 'cold mist'],
      elvis: ['sequined costume glimpse', 'diner neon', 'classic car'],
      'florida-man': ['swamp background', 'alligator', 'hand-painted sign'],
      coverup: ['shredded documents', 'classified stamps', 'men in suits'],
      disclosure: ['stacks of files', 'whistle', 'photocopier']
    };

    if (themeElements[tag]) {
      elements.push(pick(themeElements[tag], seed + tag));
    }
  }

  // Add tone-specific atmosphere
  if (tone === 'truth') {
    elements.push('dramatic flash photography', 'civilian witnesses', 'amateur camera shake');
  } else if (tone === 'government') {
    elements.push('harsh fluorescent lighting', 'official podium', 'sunglasses indoors');
  } else {
    elements.push('split composition', 'contrasting light sources', 'chaotic scene');
  }

  return `${baseStyle}, ${elements.join(', ')}`;
}

// ============================================================================
// MAIN EXPORT FUNCTION
// ============================================================================

/**
 * Generate a smart narrative article from multiple played cards
 */
export function composeSmartNarrative(
  cards: CardPlayContext[],
  options?: {
    forceNarrative?: boolean;
  }
): NarrativeOutput | null {
  if (!cards || cards.length < 2) {
    return null;
  }

  const tone = determineTone(cards);
  const seed = cards.map(c => c.card.id).join('|');

  const bylines = {
    truth: [
      'By: Anonymous Insider',
      'By: Citizen Journalist Network',
      'By: Night Desk Truth Squad',
      'By: Leaked Source Collective',
      'By: Amateur Investigation Unit'
    ],
    government: [
      'By: Official Spokesperson',
      'By: Public Affairs Division',
      'By: Approved Media Liaison',
      'By: Communications Bureau',
      'By: Press Pool (Vetted)'
    ],
    mixed: [
      'By: Conflicting Sources',
      'By: Dueling Desks',
      'By: Composite Wire Service',
      'By: Multiple Contributors',
      'By: Split Editorial Board'
    ]
  };

  return {
    headline: generateHeadline(cards, tone),
    subhead: generateSubhead(cards, tone),
    body: generateBody(cards, tone),
    byline: pick(bylines[tone], seed + 'byline'),
    tone,
    imagePrompt: generateImagePrompt(cards, tone),
    tags: [...getMostRelevantTags(cards), `${cards.length}-card-combo`, tone]
  };
}

/**
 * Check if cards form a notable thematic combination
 */
export function detectThematicCombo(cards: CardPlayContext[]): {
  hasCombo: boolean;
  comboName: string | null;
  bonusTags: string[];
} {
  const allTags = cards.flatMap(c => extractTags(c.card));
  const tagSet = new Set(allTags);

  // Famous combos
  const combos: Array<{ name: string; requires: string[]; bonus: string[] }> = [
    { name: 'Elvis-UFO Encounter', requires: ['elvis', 'ufo'], bonus: ['diner', 'tabloid-gold'] },
    { name: 'Cryptid Summit', requires: ['bigfoot', 'mothman'], bonus: ['forest', 'prophecy'] },
    { name: 'Bat Boy Bigfoot Alliance', requires: ['bat-boy', 'bigfoot'], bonus: ['creature-feature', 'summit'] },
    { name: 'Florida Chaos', requires: ['florida-man', 'cryptid'], bonus: ['swamp', 'viral'] },
    { name: 'Ghost Hunter Special', requires: ['ghost', 'disclosure'], bonus: ['paranormal', 'evidence'] },
    { name: 'Cover-up Exposed', requires: ['coverup', 'disclosure'], bonus: ['scandal', 'breaking'] },
    { name: 'Alien Contact', requires: ['alien', 'ufo'], bonus: ['first-contact', 'historic'] },
    { name: 'Men in Black vs Truth', requires: ['coverup', 'truth'], bonus: ['clash', 'dramatic'] }
  ];

  for (const combo of combos) {
    if (combo.requires.every(tag => tagSet.has(tag))) {
      return {
        hasCombo: true,
        comboName: combo.name,
        bonusTags: combo.bonus
      };
    }
  }

  return {
    hasCombo: false,
    comboName: null,
    bonusTags: []
  };
}
