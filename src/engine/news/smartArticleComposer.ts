/**
 * Smart Article Composer
 *
 * Intelligently composes newspaper articles from played cards by:
 * 1. Reading actual card article data (not just names)
 * 2. Extracting key themes and narrative elements
 * 3. Creating coherent, contextual headlines that reflect card mechanics
 * 4. Generating body paragraphs that weave together card stories
 */

import type { ArticleBlock } from '@/news/types';
import { getPerCardArticlesIfReady, type ArticleBlock as PerCardArticle } from './newsPools';

export interface PlayedCardData {
  id: string;
  name: string;
  faction: 'truth' | 'government';
  type: 'MEDIA' | 'ATTACK' | 'ZONE' | string;
  tags: string[];
}

interface CardArticleData {
  card: PlayedCardData;
  article: PerCardArticle | null;
}

interface CompositionContext {
  cards: CardArticleData[];
  faction: 'truth' | 'government' | 'mixed';
  dominantType: string;
  sharedTags: string[];
  rng: () => number;
}

// Thematic categories with associated keywords
const THEME_CATEGORIES: Record<string, string[]> = {
  'cryptid': ['bigfoot', 'mothman', 'jersey-devil', 'chupacabra', 'cryptid', 'creature', 'monster', 'bat-boy'],
  'ufo': ['ufo', 'alien', 'saucer', 'extraterrestrial', 'abduction', 'lights', 'spacecraft'],
  'elvis': ['elvis', 'graceland', 'king', 'jumpsuit', 'sighting'],
  'ghost': ['ghost', 'haunted', 'spirit', 'paranormal', 'poltergeist', 'spectral'],
  'conspiracy': ['coverup', 'conspiracy', 'classified', 'redacted', 'whistleblower', 'leak'],
  'media': ['broadcast', 'viral', 'stream', 'podcast', 'media', 'news'],
  'government': ['bureaucracy', 'official', 'containment', 'protocol', 'agency'],
  'zone': ['territory', 'state', 'region', 'local', 'grassroots', 'zone'],
};

// Headline templates organized by theme and faction
const SMART_HEADLINE_TEMPLATES: Record<string, Record<string, string[]>> = {
  cryptid: {
    truth: [
      'CRYPTID CONVERGENCE: {SUBJECT1} JOINS {SUBJECT2} IN {ACTION}',
      'MULTIPLE SIGHTINGS CONFIRM {SUBJECT1} AND {SUBJECT2} ACTIVE IN SAME REGION',
      '{ACTION}: {SUBJECT1} EVIDENCE CORROBORATES {SUBJECT2} REPORTS',
      'FIELD TEAMS DOCUMENT {SUBJECT1} WHILE {SUBJECT2} {ACTION}',
    ],
    government: [
      'WILDLIFE REPORT RECLASSIFIES {SUBJECT1} AND {SUBJECT2} AS "NORMAL FAUNA"',
      'CONTAINMENT PROTOCOLS ACTIVATED FOR {SUBJECT1} FOLLOWING {SUBJECT2} INCIDENT',
    ],
  },
  ufo: {
    truth: [
      'TRIPLE SIGHTING: {SUBJECT1} WITNESSES REPORT {SUBJECT2} DURING {ACTION}',
      'DISCLOSURE CASCADE: {SUBJECT1} CONFIRMS {SUBJECT2} CLAIMS',
      '{ACTION} REVEALS LINK BETWEEN {SUBJECT1} AND {SUBJECT2}',
      'AERIAL PHENOMENA SPIKE AS {SUBJECT1} AND {SUBJECT2} CONVERGE',
    ],
    government: [
      'WEATHER BALLOON EXPLAINS {SUBJECT1} AND {SUBJECT2}, OFFICIALS INSIST',
      'ROUTINE TEST ACCOUNTS FOR {SUBJECT1}; {SUBJECT2} REMAINS CLASSIFIED',
    ],
  },
  elvis: {
    truth: [
      'ELVIS SIGHTING COINCIDES WITH {SUBJECT1} DURING {ACTION}',
      'THE KING RETURNS: {SUBJECT1} AND {SUBJECT2} WITNESSES COMPARE NOTES',
      'GRACELAND CONNECTION: {SUBJECT1} LINKED TO {SUBJECT2} VIA {ACTION}',
    ],
    government: [
      'IMPERSONATOR EXPLAINS {SUBJECT1}; NO COMMENT ON {SUBJECT2}',
    ],
  },
  ghost: {
    truth: [
      'PARANORMAL TRIPLE THREAT: {SUBJECT1} MANIFESTATION ACCOMPANIES {SUBJECT2}',
      'SPECTRAL EVIDENCE PILES UP AS {SUBJECT1} AND {SUBJECT2} DOCUMENTED',
      'HAUNTING ESCALATES: {SUBJECT1} NOW JOINED BY {SUBJECT2}',
    ],
    government: [
      'ATMOSPHERIC ANOMALY EXPLAINS {SUBJECT1} AND {SUBJECT2}, SAYS BUREAU',
    ],
  },
  conspiracy: {
    truth: [
      'LEAKED: {SUBJECT1} DOCUMENTS REFERENCE {SUBJECT2} IN {ACTION}',
      'WHISTLEBLOWER LINKS {SUBJECT1} TO {SUBJECT2} COVERUP',
      'FOIA DUMP CONNECTS {SUBJECT1} AND {SUBJECT2} THROUGH {ACTION}',
      'CLASSIFIED: {SUBJECT1} OPERATION INVOLVED {SUBJECT2} ASSETS',
    ],
    government: [
      'ROUTINE ADMIN HANDLES {SUBJECT1}; {SUBJECT2} MATTER CLOSED',
      'AUTHORIZED REVIEW CLEARS {SUBJECT1} AND {SUBJECT2} OF CONCERNS',
    ],
  },
  media: {
    truth: [
      'VIRAL WAVE: {SUBJECT1} BROADCAST AMPLIFIED BY {SUBJECT2}',
      'CITIZEN JOURNALISM TRIUMPH: {SUBJECT1} AND {SUBJECT2} GO MAINSTREAM',
      'TRUTH SIGNAL BOOSTED AS {SUBJECT1} JOINS {SUBJECT2} COVERAGE',
    ],
    government: [
      'MISINFORMATION ALERT: {SUBJECT1} AND {SUBJECT2} CLAIMS DEBUNKED',
    ],
  },
  default: {
    truth: [
      'BREAKING: {SUBJECT1} AND {SUBJECT2} CONVERGE IN {ACTION}',
      'TRIPLE REVELATION: {SUBJECT1}, {SUBJECT2} EXPOSE {ACTION}',
      'TRUTH SURGE: {SUBJECT1} CONFIRMED ALONGSIDE {SUBJECT2}',
      'CITIZEN REPORT: {SUBJECT1} VALIDATES {SUBJECT2} DURING {ACTION}',
    ],
    government: [
      'SITUATION NORMAL: {SUBJECT1} AND {SUBJECT2} WITHIN PARAMETERS',
      'OFFICIAL GUIDANCE ON {SUBJECT1} AND {SUBJECT2}: REMAIN CALM',
      'COORDINATED RESPONSE TO {SUBJECT1} AND {SUBJECT2} PROCEEDS SMOOTHLY',
    ],
    mixed: [
      'DUELING NARRATIVES: {SUBJECT1} VS {SUBJECT2} IN {ACTION}',
      'SPIN CYCLE: {SUBJECT1} CLAIMS CLASH WITH {SUBJECT2} DENIALS',
      'INFORMATION WARFARE: {SUBJECT1} DROPS AS {SUBJECT2} SCRAMBLES',
    ],
  },
};

// Action phrases based on card types
const ACTION_PHRASES: Record<string, string[]> = {
  ATTACK: [
    'BOMBSHELL EXPOSÉ',
    'DEVASTATING LEAK',
    'DIRECT HIT ON NARRATIVE',
    'PRECISION DISCLOSURE',
    'SCANDAL ERUPTION',
    'DOCUMENT DUMP',
  ],
  MEDIA: [
    'VIRAL BROADCAST',
    'NATIONWIDE STREAM',
    'SIGNAL BOOST',
    'RATINGS EXPLOSION',
    'COVERAGE SURGE',
    'PRIME TIME REVEAL',
  ],
  ZONE: [
    'TERRITORIAL SHIFT',
    'GROUND GAME VICTORY',
    'LOCAL UPRISING',
    'GRASSROOTS WAVE',
    'REGIONAL TAKEOVER',
    'ZONE CAPTURE',
  ],
};

// Subhead templates
const SUBHEAD_TEMPLATES = {
  truth: [
    'Witnesses multiply as {card1} and {card2} shake official narrative',
    'Independent verification confirms {card1} claims while {card2} provides corroboration',
    '{card1} operatives report success as {card2} amplifies disclosure',
    'Truth meter spikes as {card1} combines with {card2} effects',
  ],
  government: [
    'Officials assure public {card1} and {card2} under control',
    'Routine protocols explain {card1}; {card2} matter referred to committee',
    'Spokesman: "{card1} and {card2} fall within normal parameters"',
    'Containment teams successfully manage {card1} following {card2} incident',
  ],
  mixed: [
    '{card1} revelations clash with {card2} denials in escalating standoff',
    'Competing claims: {card1} vs {card2} fight for headline dominance',
    'As {card1} goes public, {card2} attempts damage control',
  ],
};

// Body paragraph templates
const BODY_TEMPLATES = {
  truth: [
    'In a coordinated disclosure event, {card1} operatives deployed alongside {card2} assets, creating overlapping zones of truth that officials struggled to contain.',
    'Eyewitnesses report {card1} activity coinciding with {card2} manifestations, suggesting coordinated action between previously unconnected truth networks.',
    'Field analysts confirm the {card1} operation succeeded in amplifying {card2} effects, pushing the truth index into unprecedented territory.',
    'The triple-play combination of {card1}, {card2}, and {card3} represents the largest single-turn truth surge in recent memory.',
  ],
  government: [
    'Coordinated response teams activated {card1} protocols while {card2} measures ensured narrative continuity across all affected regions.',
    'Official spokespeople emphasized that {card1} and {card2} represent standard operating procedures requiring no public concern.',
    'The {card1} initiative successfully contained {card2} exposure, maintaining acceptable calm levels across monitored populations.',
  ],
  mixed: [
    'As {card1} truth operatives pushed disclosure, {card2} containment forces moved to suppress, creating a narrative battleground.',
    'The clash between {card1} and {card2} forces produced conflicting headlines, leaving citizens to determine which story rings true.',
  ],
};

/**
 * Extract primary theme from card tags
 */
function extractTheme(tags: string[]): string {
  const normalizedTags = tags.map(t => t.toLowerCase().replace(/^#/, ''));

  for (const [theme, keywords] of Object.entries(THEME_CATEGORIES)) {
    for (const tag of normalizedTags) {
      if (keywords.some(kw => tag.includes(kw))) {
        return theme;
      }
    }
  }
  return 'default';
}

/**
 * Extract subject/topic from card article or name
 */
function extractSubject(cardData: CardArticleData): string {
  const { card, article } = cardData;

  // Try to extract key subject from headline
  if (article?.headline) {
    // Extract first significant noun phrase (before any verb or separator)
    const headline = article.headline.toUpperCase();
    const patterns = [
      /^([A-Z][A-Z\s']+?)(?:\s+(?:SPOTTED|REVEALS|EXPOSES|CONFIRMS|REPORTS|HITS|BLOCKS|GOES|BREAKS|CLAIMS|LEAKED))/,
      /^([A-Z][A-Z\s']+?)(?:\s*[—–-])/,
      /^([A-Z][A-Z\s']+?)(?:\s+AT\s)/,
    ];

    for (const pattern of patterns) {
      const match = headline.match(pattern);
      if (match && match[1] && match[1].length > 3 && match[1].length < 40) {
        return match[1].trim();
      }
    }
  }

  // Fall back to card name
  return card.name.toUpperCase();
}

/**
 * Find shared tags between cards
 */
function findSharedTags(cards: CardArticleData[]): string[] {
  if (cards.length === 0) return [];

  const allTags = cards.map(c =>
    new Set([...c.card.tags, ...(c.article?.tags || [])].map(t => t.toLowerCase().replace(/^#/, '')))
  );

  const shared: string[] = [];
  const firstTags = allTags[0];

  for (const tag of firstTags) {
    if (allTags.every(tagSet => tagSet.has(tag))) {
      shared.push(tag);
    }
  }

  return shared;
}

/**
 * Determine dominant card type
 */
function getDominantType(cards: PlayedCardData[]): string {
  const counts = new Map<string, number>();
  for (const card of cards) {
    counts.set(card.type, (counts.get(card.type) || 0) + 1);
  }

  let dominant = 'MEDIA';
  let maxCount = 0;
  for (const [type, count] of counts) {
    if (count > maxCount) {
      maxCount = count;
      dominant = type;
    }
  }
  return dominant;
}

/**
 * Determine faction mix
 */
function determineFaction(cards: PlayedCardData[]): 'truth' | 'government' | 'mixed' {
  const truthCount = cards.filter(c => c.faction === 'truth').length;
  const govCount = cards.filter(c => c.faction === 'government').length;

  if (truthCount === cards.length) return 'truth';
  if (govCount === cards.length) return 'government';
  return 'mixed';
}

/**
 * Simple seeded RNG
 */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Pick random element from array
 */
function pick<T>(arr: readonly T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)] ?? arr[0];
}

/**
 * Compose a smart headline from card data
 */
function composeSmartHeadline(ctx: CompositionContext): string {
  const { cards, faction, dominantType, rng } = ctx;

  // Extract themes from all cards
  const themes = cards.map(c => extractTheme([...c.card.tags, ...(c.article?.tags || [])]));
  const primaryTheme = themes[0] || 'default';

  // Get subjects from each card
  const subjects = cards.map(c => extractSubject(c));

  // Get action phrase based on dominant type
  const actionPhrases = ACTION_PHRASES[dominantType] || ACTION_PHRASES.MEDIA;
  const action = pick(actionPhrases, rng);

  // Select template based on theme and faction
  const themeTemplates = SMART_HEADLINE_TEMPLATES[primaryTheme] || SMART_HEADLINE_TEMPLATES.default;
  const factionKey = faction === 'mixed' ? 'mixed' : faction;
  const templates = themeTemplates[factionKey] || themeTemplates.truth || SMART_HEADLINE_TEMPLATES.default.truth;

  let headline = pick(templates, rng);

  // Replace placeholders
  headline = headline
    .replace('{SUBJECT1}', subjects[0] || 'UNKNOWN')
    .replace('{SUBJECT2}', subjects[1] || subjects[0] || 'UNKNOWN')
    .replace('{SUBJECT3}', subjects[2] || subjects[1] || 'UNKNOWN')
    .replace('{ACTION}', action);

  return headline;
}

/**
 * Compose smart subhead from card data
 */
function composeSmartSubhead(ctx: CompositionContext): string {
  const { cards, faction, rng } = ctx;

  const templates = SUBHEAD_TEMPLATES[faction] || SUBHEAD_TEMPLATES.truth;
  let subhead = pick(templates, rng);

  // Use card names for subhead
  const cardNames = cards.map(c => c.card.name);

  subhead = subhead
    .replace('{card1}', cardNames[0] || 'Card 1')
    .replace('{card2}', cardNames[1] || cardNames[0] || 'Card 2')
    .replace('{card3}', cardNames[2] || cardNames[1] || 'Card 3');

  return subhead;
}

/**
 * Compose smart body paragraphs from card data
 */
function composeSmartBody(ctx: CompositionContext): string[] {
  const { cards, faction, rng } = ctx;
  const cardNames = cards.map(c => c.card.name);

  const templates = BODY_TEMPLATES[faction] || BODY_TEMPLATES.truth;
  const paragraphs: string[] = [];

  // Pick 2-3 paragraphs
  const numParagraphs = 2 + Math.floor(rng() * 2);
  const usedIndices = new Set<number>();

  for (let i = 0; i < numParagraphs && usedIndices.size < templates.length; i++) {
    let idx: number;
    do {
      idx = Math.floor(rng() * templates.length);
    } while (usedIndices.has(idx) && usedIndices.size < templates.length);

    usedIndices.add(idx);
    let para = templates[idx];

    para = para
      .replace('{card1}', cardNames[0] || 'the first card')
      .replace('{card2}', cardNames[1] || cardNames[0] || 'the second card')
      .replace('{card3}', cardNames[2] || cardNames[1] || 'the third card');

    paragraphs.push(para);
  }

  // Add a card-specific detail from one of the articles if available
  const articleWithBody = cards.find(c => c.article?.body);
  if (articleWithBody?.article?.body) {
    // Extract first sentence from one of the card articles
    const bodyText = articleWithBody.article.body;
    const firstSentence = bodyText.split(/[.!?]/)[0];
    if (firstSentence && firstSentence.length > 20 && firstSentence.length < 200) {
      paragraphs.push(`Related: ${firstSentence.trim()}.`);
    }
  }

  return paragraphs;
}

/**
 * Generate byline based on faction and theme
 */
function generateByline(ctx: CompositionContext): string {
  const { faction, rng } = ctx;

  const truthBylines = [
    'By: Composite Desk',
    'By: Night Desk Coalition',
    'By: Truth Network Wire',
    'By: Anonymous Insider Collective',
    'By: Field Correspondent Pool',
  ];

  const govBylines = [
    'By: Official Channels',
    'By: Public Information Office',
    'By: Authorized Communications Unit',
    'By: Approved Wire Service',
  ];

  const mixedBylines = [
    'By: Dueling Desks',
    'By: Conflicting Sources Bureau',
    'By: Editorial Compromise Unit',
  ];

  const bylines = faction === 'truth' ? truthBylines :
                  faction === 'government' ? govBylines : mixedBylines;

  return pick(bylines, rng);
}

/**
 * Main function: Compose a smart article from played cards
 */
export function composeSmartArticle(
  cards: PlayedCardData[],
  options?: { seed?: number }
): ArticleBlock | null {
  if (!cards || cards.length < 3) {
    console.warn('composeSmartArticle: Requires at least 3 cards');
    return null;
  }

  const articleBank = getPerCardArticlesIfReady();

  // Build card data with articles
  const cardDataList: CardArticleData[] = cards.slice(0, 3).map(card => ({
    card,
    article: articleBank?.get(card.id) || null,
  }));

  // Log what we're working with
  console.info('🎯 Smart Article Composer:', {
    cards: cardDataList.map(c => ({
      id: c.card.id,
      name: c.card.name,
      hasArticle: !!c.article,
      articleHeadline: c.article?.headline?.substring(0, 50),
    })),
  });

  // Build composition context
  const seed = options?.seed ?? Date.now();
  const rng = mulberry32(seed);

  const ctx: CompositionContext = {
    cards: cardDataList,
    faction: determineFaction(cards),
    dominantType: getDominantType(cards),
    sharedTags: findSharedTags(cardDataList),
    rng,
  };

  // Compose article components
  const headline = composeSmartHeadline(ctx);
  const subhead = composeSmartSubhead(ctx);
  const body = composeSmartBody(ctx);
  const byline = generateByline(ctx);

  console.info('📰 Smart Article Generated:', {
    headline: headline.substring(0, 60) + '...',
    faction: ctx.faction,
    theme: extractTheme([...cardDataList[0].card.tags]),
  });

  return {
    tone: ctx.faction === 'mixed' ? 'draw' : ctx.faction,
    hed: headline,
    dek: subhead,
    bullets: body,
    byline,
    source: 'Source: Composite Intelligence',
    body,
    kicker: ctx.faction === 'truth' ? 'CITIZEN SCOOP' :
            ctx.faction === 'government' ? 'OFFICIAL VERSION' : 'CONFLICTING REPORTS',
    stinger: 'DEVELOPING',
    templateId: `smart-compose:${ctx.faction}`,
  };
}

// Coherent composite headline templates that tell a story
const COMPOSITE_HEADLINE_TEMPLATES = {
  truth: {
    cryptid: [
      'TRIPLE CRYPTID CONVERGENCE ROCKS {REGION} — WITNESSES DEMAND ANSWERS',
      'CRYPTID SUMMIT: {SUBJECT1} SIGHTING CONFIRMS {SUBJECT2} REPORTS',
      'MONSTER PROOF MOUNTS: {SUBJECT1} AND {SUBJECT2} DOCUMENTED SAME NIGHT',
    ],
    ufo: [
      'UFO FLAP INTENSIFIES: {SUBJECT1} LINKED TO {SUBJECT2} INCIDENT',
      'EXTRATERRESTRIAL EVIDENCE SURGE: {SUBJECT1} CORROBORATES {SUBJECT2}',
      'LIGHTS IN THE SKY: {SUBJECT1} AND {SUBJECT2} WITNESSES UNITE',
    ],
    elvis: [
      'THE KING RETURNS: {SUBJECT1} WITNESSES CONFIRM ELVIS SIGHTING',
      'ELVIS SPOTTED DURING {SUBJECT1} EVENT — {SUBJECT2} WITNESSES CORROBORATE',
      'GRACELAND CONNECTION: {SUBJECT1} AND {SUBJECT2} TRACE BACK TO THE KING',
    ],
    ghost: [
      'PARANORMAL SURGE: {SUBJECT1} MANIFESTATION ACCOMPANIES {SUBJECT2}',
      'GHOST TRIPLE-HEADER: {SUBJECT1} AND {SUBJECT2} EVENTS LINKED',
      'SPECTRAL EVIDENCE MOUNTS: {SUBJECT1} CONFIRMS {SUBJECT2} HAUNTING',
    ],
    conspiracy: [
      'DISCLOSURE CASCADE: {SUBJECT1} DOCUMENTS REFERENCE {SUBJECT2}',
      'COVERUP COLLAPSES: {SUBJECT1} LEAK VALIDATES {SUBJECT2} CLAIMS',
      'WHISTLEBLOWER WAVE: {SUBJECT1} AND {SUBJECT2} CONNECT THE DOTS',
    ],
    media: [
      'BROADCAST BREAKTHROUGH: {SUBJECT1} SIGNAL BOOSTS {SUBJECT2}',
      'VIRAL TRUTH SURGE: {SUBJECT1} AND {SUBJECT2} DOMINATE FEEDS',
      'MEDIA BLITZ: {SUBJECT1} COVERAGE AMPLIFIES {SUBJECT2} STORY',
    ],
    default: [
      'TRUTH TRIANGLE: {SUBJECT1} AND {SUBJECT2} CONVERGE ON REVELATION',
      'DISCLOSURE TRIFECTA: {SUBJECT1} CONFIRMS {SUBJECT2} AS {SUBJECT3} BREAKS',
      'CITIZEN SCOOP TRIPLE: {SUBJECT1} AND {SUBJECT2} SHAKE OFFICIAL STORY',
      'EVIDENCE AVALANCHE: {SUBJECT1} AND {SUBJECT2} PILE ON PROOF',
    ],
  },
  government: {
    default: [
      'TRIPLE CONTAINMENT: {SUBJECT1} AND {SUBJECT2} PROTOCOLS ACTIVATED',
      'OFFICIAL RESPONSE: {SUBJECT1} AND {SUBJECT2} MATTERS UNDER REVIEW',
      'COORDINATED CALM: {SUBJECT1} AND {SUBJECT2} DESIGNATED ROUTINE',
      'NARRATIVE UNITY: {SUBJECT1} AND {SUBJECT2} EXPLAINED, CASE CLOSED',
    ],
  },
  mixed: {
    default: [
      'CLASH: {SUBJECT1} TRUTH MEETS {SUBJECT2} DENIAL',
      'NARRATIVE BATTLE: {SUBJECT1} REVELATIONS VS {SUBJECT2} SUPPRESSION',
      'DISCLOSURE VS COVERUP: {SUBJECT1} AND {SUBJECT2} FORCES COLLIDE',
      'INFORMATION WARFARE: {SUBJECT1} EXPOSED AS {SUBJECT2} SCRAMBLES',
    ],
  },
};

/**
 * Extract a clean, concise subject from a headline
 */
function extractCleanSubject(headline: string): string {
  const cleaned = headline
    .replace(/^(BREAKING:|LEAKED:|EXTRA EXTRA:|OFFICIAL:)\s*/i, '')
    .toUpperCase();

  // Try to get the main noun phrase (before any verb or separator)
  const patterns = [
    /^([A-Z][A-Z'\s]{2,30}?)(?:\s+(?:SPOTTED|REVEALS|EXPOSES|CONFIRMS|REPORTS|HITS|BLOCKS|GOES|BREAKS|CLAIMS|HOSTS|JOINS|MEETS|ISSUES|ENDORSES|PILOTS|HOVERS|LANDS))/,
    /^([A-Z][A-Z'\s]{2,25}?)(?:\s*[—–-])/,
    /^([A-Z][A-Z'\s]{2,25}?)(?:\s+AT\s)/,
  ];

  for (const pattern of patterns) {
    const match = cleaned.match(pattern);
    if (match && match[1]) {
      const subject = match[1].trim();
      // Clean up common words that shouldn't be subjects
      if (subject.length >= 4 && subject.length <= 30 &&
          !subject.match(/^(THE|A|AN|THIS|THAT|THESE|THOSE|LOCAL|BREAKING)\s*$/)) {
        return subject;
      }
    }
  }

  // Fall back to first 3-4 meaningful words
  const words = cleaned.split(/\s+/).filter(w => w.length > 2);
  return words.slice(0, 3).join(' ');
}

/**
 * Get the best geographic region mentioned in cards
 */
function extractRegion(cardArticles: (PerCardArticle | undefined)[]): string {
  for (const article of cardArticles) {
    if (article?.body) {
      // Look for state/region mentions
      const stateMatch = article.body.match(/\b(California|Texas|Florida|New Mexico|Nevada|Arizona|Ohio|Virginia|Tennessee|Georgia|Delaware|Washington|Nebraska|Idaho)\b/i);
      if (stateMatch) {
        return stateMatch[1].toUpperCase();
      }
    }
  }
  return 'MULTIPLE STATES';
}

/**
 * Try to compose using card-specific articles first, fall back to smart composition
 */
export function composeFromCardArticles(
  cards: PlayedCardData[],
  options?: { seed?: number }
): ArticleBlock | null {
  const articleBank = getPerCardArticlesIfReady();
  if (!articleBank || cards.length < 3) {
    return composeSmartArticle(cards, options);
  }

  // Check if all cards have specific articles
  const cardArticles = cards.slice(0, 3).map(card => articleBank.get(card.id));
  const allHaveArticles = cardArticles.every(a => a && a.headline);

  if (!allHaveArticles) {
    // Fall back to smart composition
    return composeSmartArticle(cards, options);
  }

  // All cards have articles - create a coherent composite
  const seed = options?.seed ?? Date.now();
  const rng = mulberry32(seed);
  const faction = determineFaction(cards);

  // Get articles with headlines
  const validArticles = cardArticles.filter((a): a is PerCardArticle => !!a?.headline);

  // Extract clean subjects from each headline
  const subjects = validArticles.map(a => extractCleanSubject(a.headline!));

  // Determine primary theme from card tags
  const allTags = cards.flatMap(c => c.tags);
  const theme = extractTheme(allTags);

  // Get region for geographic context
  const region = extractRegion(cardArticles);

  // Select appropriate headline template
  const factionTemplates = COMPOSITE_HEADLINE_TEMPLATES[faction] || COMPOSITE_HEADLINE_TEMPLATES.truth;
  const themeTemplates = factionTemplates[theme as keyof typeof factionTemplates] ||
                         factionTemplates.default ||
                         COMPOSITE_HEADLINE_TEMPLATES.truth.default;
  let headline = pick(themeTemplates, rng);

  // Fill in the template
  headline = headline
    .replace('{SUBJECT1}', subjects[0] || 'FIRST EVENT')
    .replace('{SUBJECT2}', subjects[1] || subjects[0] || 'SECOND EVENT')
    .replace('{SUBJECT3}', subjects[2] || subjects[1] || 'THIRD EVENT')
    .replace('{REGION}', region);

  // Create a coherent subhead that references the connection
  const subheadTemplates = [
    `${cards[0].name} operation coincides with ${cards[1].name} as sources confirm connection.`,
    `Witnesses report ${cards[0].name} activity during ${cards[1].name} manifestation.`,
    `Field teams document ${cards[0].name} alongside ${cards[1].name} in same region.`,
    `Independent sources link ${cards[0].name} to ${cards[1].name} in developing story.`,
  ];
  const subhead = pick(subheadTemplates, rng);

  // Create coherent body paragraphs
  const bodyParagraphs: string[] = [];

  // Opening paragraph that sets the scene
  const openingTemplates = [
    `In an unprecedented convergence of events, ${cards[0].name}, ${cards[1].name}, and ${cards[2].name} have all manifested within the same news cycle, forcing observers to reconsider the official narrative.`,
    `Tonight's triple-play combination of ${cards[0].name}, ${cards[1].name}, and ${cards[2].name} has sent the truth index into uncharted territory.`,
    `Multiple independent sources confirm the simultaneous occurrence of ${cards[0].name}, ${cards[1].name}, and ${cards[2].name}, creating what analysts call a "disclosure cascade."`,
  ];
  bodyParagraphs.push(pick(openingTemplates, rng));

  // Add relevant excerpts from actual card articles
  for (let i = 0; i < Math.min(2, validArticles.length); i++) {
    const article = validArticles[i];
    if (article?.body) {
      // Get first meaningful sentence
      const sentences = article.body.split(/[.!?]/).filter(s => s.trim().length > 30);
      if (sentences.length > 0) {
        const sentence = sentences[0].trim();
        bodyParagraphs.push(`${sentence}.`);
      }
    }
  }

  // Closing summary
  const closingTemplates = [
    `Analysts predict more developments at eleven. Refresh for updates as this story unfolds.`,
    `Citizens are advised to trust their instincts and verify through independent sources.`,
    `This represents the largest single-turn disclosure event in recent memory. Stay tuned.`,
  ];
  bodyParagraphs.push(pick(closingTemplates, rng));

  console.info('📰 Card Composite Generated:', {
    headline: headline.substring(0, 60) + '...',
    subjects,
    theme,
    faction,
  });

  return {
    tone: faction === 'mixed' ? 'draw' : faction,
    hed: headline,
    dek: subhead,
    bullets: bodyParagraphs,
    byline: 'By: Composite Desk',
    source: 'Source: Archive Cross-Reference',
    body: bodyParagraphs,
    kicker: faction === 'truth' ? 'EXTRA EXTRA' :
            faction === 'government' ? 'OFFICIAL VERSION' : 'CONFLICTING REPORTS',
    stinger: 'DEVELOPING',
    templateId: 'card-composite',
  };
}

export default composeSmartArticle;
