/**
 * SmartNarrativeComposer - Intelligent multi-card story generation
 *
 * Creates coherent newspaper articles when multiple cards are played together,
 * combining their themes, factions, and effects into unified narratives.
 *
 * Now enhanced to pull from existing card articles to create richer,
 * interconnected newspaper stories based on played card combinations.
 */

import type { Card } from '@/types';
import { getArticleForCard, type CardArticle } from '@/data/cardArticles/articleDatabase';

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
    'CATCHES', 'PHOTOGRAPHS', 'LIVE-STREAMS', 'FAXES PROOF OF',
    'BLURTS OUT LOCATION OF', 'ACCIDENTALLY REVEALS', 'POSTS COORDINATES TO',
    'DRUNK-TEXTS EVIDENCE OF', 'SHOUTS AT 3 AM ABOUT', 'GRAFFITIS TRUTH ABOUT'
  ],
  secondary: [
    'BRINGS CASSEROLE TO', 'HIGH-FIVES', 'SHARES LUNCH WITH',
    'CONFIRMS SUSPICIONS ABOUT', 'NOTARIZES CLAIMS ABOUT', 'CARPOOLS WITH',
    'ACCIDENTALLY CC\'S PRESS ON', 'BUMPER-STICKERS TRUTH ABOUT'
  ],
  consequence: [
    '"HOLY MOLY" SAYS WITNESS', 'DINER PATRONS APPLAUD', 'ANONYMOUS SOURCE DROPS MIC',
    'GRANDMOTHER FAINTS TWICE', 'BINGO NIGHT CANCELED', 'POTLUCK RUINED',
    'LOCAL SHERIFF "NEEDS A MINUTE"', 'CAT REFUSES TO COMMENT',
    'MAYOR LOCKS SELF IN BATHROOM', 'CHURCH BELLS RING UNPROMPTED'
  ]
};

const GOV_ACTION_VERBS = {
  primary: [
    'POLITELY IGNORES', 'FILES UNDER "MISCELLANEOUS"', 'SCHEDULES MEETING ABOUT',
    'FORMS COMMITTEE TO INVESTIGATE', 'SENDS STRONGLY-WORDED MEMO REGARDING',
    'LOSES PAPERWORK ON', 'RECLASSIFIES AS "BIRD"', 'BLAMES WEATHER BALLOON FOR'
  ],
  secondary: [
    'STAPLES DISCLAIMER TO', 'ASSIGNS INTERN TO', 'CREATES POWERPOINT ABOUT',
    'SCHEDULES FOLLOW-UP MEETING ON', 'DISTRIBUTES PAMPHLET EXPLAINING AWAY',
    'HOLDS PRESS CONFERENCE DENYING', 'PUTS ON HOLD INDEFINITELY'
  ],
  consequence: [
    '"DEFINITELY SWAMP GAS" INSISTS SPOKESMAN', 'PRESS BRIEFING ENDS IN TEARS',
    'INTERN PROMOTED TO FALL GUY', 'SHREDDER WORKING OVERTIME',
    'BUDGET MYSTERIOUSLY INCREASED', 'COFFEE MACHINE UNPLUGGED "FOR SAFETY"',
    'ALL WITNESSES OFFERED "VACATION"', 'WEBSITE CONVENIENTLY CRASHES',
    'SPOKESPERSON DEVELOPS SUDDEN COUGH', 'FILE CABINET CATCHES FIRE (UNRELATED)'
  ]
};

const THEME_KEYWORDS: Record<string, string[]> = {
  ufo: ['flying pie tin', 'suspicious frisbee', 'glowing hubcap', 'cosmic pizza delivery', 'discount flying saucer'],
  alien: ['grey accountant', 'space tourist', 'interstellar census-taker', 'cosmic Uber driver', 'E.T.\'s weird cousin'],
  cryptid: ['mystery meat on legs', 'forest bachelor', 'woodland dropout', 'nature\'s mistake', 'evolutionary typo'],
  bigfoot: ['forest hobo', '8-foot bachelor', 'nature\'s bouncer', 'woodland Chewbacca', 'hiking trail influencer'],
  mothman: ['bridge goth', 'winged drama queen', 'prophecy pigeon', 'doom butterfly', 'omen with benefits'],
  ghost: ['transparent freeloader', 'see-through squatter', 'spectral roommate', 'afterlife loiterer', 'dead guy with grudge'],
  elvis: ['sequined legend', 'velvet survivor', 'jumpsuit philosopher', 'peanut butter mystic', 'undead crooner'],
  'florida-man': ['swamp scholar', 'gator diplomat', 'hurricane whisperer', 'retirement home escapee', 'bath salts sommelier'],
  coverup: ['black marker festival', 'redaction party', 'paper funeral', 'truth shredding', 'fact incinerator'],
  bureaucracy: ['form 47-B nightmare', 'paperwork purgatory', 'stamp collector\'s fever dream', 'meeting about meetings'],
  disclosure: ['truth grenade', 'fact bomb', 'honesty nuke', 'accountability missile', 'transparency torpedo'],
  media: ['static prophecy', 'signal scramble', 'frequency fiasco', 'broadcast bonanza', 'antenna awakening'],
  attack: ['information assault', 'truth offensive', 'fact raid', 'reality strike', 'narrative nuke'],
  zone: ['weird hotspot', 'strange district', 'anomaly acres', 'conspiracy corner', 'oddity zone']
};

const CONNECTORS = {
  causal: ['AS', 'WHILE', 'JUST AS', 'MOMENTS BEFORE', 'SECONDS AFTER'],
  additive: ['AND', 'PLUS', 'ALONGSIDE', 'COMBINED WITH', 'TOGETHER WITH'],
  contrast: ['BUT', 'YET', 'HOWEVER', 'DESPITE', 'ALTHOUGH'],
  sequential: ['THEN', 'NEXT', 'FOLLOWING', 'SUBSEQUENTLY', 'THEREAFTER']
};

// ============================================================================
// ARTICLE-ENRICHED CONTEXT
// ============================================================================

interface EnrichedCardContext extends CardPlayContext {
  article: CardArticle | null;
}

/**
 * Enrich card play contexts with their pre-written articles
 */
const enrichWithArticles = (cards: CardPlayContext[]): EnrichedCardContext[] => {
  return cards.map(ctx => ({
    ...ctx,
    article: getArticleForCard(ctx.card.id),
  }));
};

/**
 * Extract follow-up hooks from all card articles for story continuity
 */
const collectFollowUpHooks = (enriched: EnrichedCardContext[]): string[] => {
  const hooks: string[] = [];
  for (const ctx of enriched) {
    if (ctx.article?.followUpHooks?.length) {
      hooks.push(...ctx.article.followUpHooks);
    }
  }
  return hooks;
};

/**
 * Get all states mentioned across card articles
 */
const collectMentionedStates = (enriched: EnrichedCardContext[]): string[] => {
  const states = new Set<string>();
  for (const ctx of enriched) {
    if (ctx.article?.statesMentioned?.length) {
      for (const state of ctx.article.statesMentioned) {
        states.add(state);
      }
    }
    if (ctx.targetState) {
      states.add(ctx.targetState);
    }
  }
  return Array.from(states);
};

/**
 * Get recurring characters from card articles
 */
const collectRecurringCharacters = (enriched: EnrichedCardContext[]): string[] => {
  const characters = new Set<string>();
  for (const ctx of enriched) {
    if (ctx.article?.recurringCharacter) {
      characters.add(ctx.article.recurringCharacter);
    }
  }
  return Array.from(characters);
};

/**
 * Extract key phrases from article headlines for combination
 */
const extractHeadlinePhrases = (enriched: EnrichedCardContext[]): string[] => {
  const phrases: string[] = [];
  for (const ctx of enriched) {
    if (ctx.article?.headline) {
      // Extract the most dramatic phrase from the headline
      const headline = ctx.article.headline;
      // Split on common headline separators
      const parts = headline.split(/[—–:;]/);
      if (parts.length > 0) {
        phrases.push(parts[0].trim());
      }
    }
  }
  return phrases;
};

/**
 * Extract byline sources for crediting combined stories
 */
const extractBylineSources = (enriched: EnrichedCardContext[]): string[] => {
  const sources: string[] = [];
  for (const ctx of enriched) {
    if (ctx.article?.byline) {
      // Extract the reporter name from "By: Name, Desk"
      const match = ctx.article.byline.match(/By[:\s]+([^,]+)/i);
      if (match) {
        sources.push(match[1].trim());
      }
    }
  }
  return sources;
};

const SUBHEAD_TEMPLATES = {
  truth: [
    '"I knew it!" screams man who has said that about everything since 1987',
    'Walmart parking lot witness: "It was definitely real, I was only on my third energy drink"',
    'Local conspiracy theorist vindicated, refuses to stop saying "I told you so"',
    'Anonymous source provides {theme1} evidence; demands payment in beef jerky',
    'Grainy footage shows {theme1} near {theme2}; experts agree it\'s "probably not a cat"',
    '{theme1} truther community celebrates; still can\'t agree on literally anything else',
    'Denny\'s night manager confirms {theme1} sighting: "I\'ve seen weirder at 3 AM"',
    'Retired mailman breaks 47-year silence on {theme1}; wife "not surprised, he talks to birds"'
  ],
  government: [
    'Spokesperson accidentally uses air quotes around "definitely normal"',
    'Press release contains 47 uses of the word "routine" in 3 paragraphs',
    'Official statement: "We are confident that {theme1} is just {theme2}, somehow"',
    'Government website updated; new 404 error suspiciously detailed',
    'Pentagon spokeswoman sighs audibly 17 times during briefing on {theme1}',
    'Internal memo leaked: "Whoever filed {theme1} under \'swamp gas\' is getting promoted"',
    'Press pool offered complimentary memory-erasing pamphlets after {theme1} briefing',
    'Officials deny {theme1} connection to {theme2}; provide no alternative explanation'
  ],
  mixed: [
    'Witnesses describe {theme1}; government describes "completely different {theme2}"',
    'Truth seekers and officials agree on one thing: they don\'t agree on anything',
    '{theme1} believers and {theme2} deniers hold competing rallies in same parking lot',
    'Local news covers both sides; manages to confuse everyone equally',
    'Government issues denial; denial needs its own denial by 3 PM',
    'Narrative so confused that both sides accidentally argue same point twice'
  ]
};

const BODY_SENTENCE_TEMPLATES = {
  opening: {
    truth: [
      'The evening took a turn when a local man, who asked to remain anonymous but wore a name tag reading "Gary," witnessed {card1} near the Waffle House on Route 9.',
      'It all started at approximately 3:47 AM when {card1} emerged from circumstances that can only be described as "deeply suspicious" by everyone present.',
      'Sources confirm the incident began when someone\'s cousin\'s neighbor\'s psychic predicted {card1} would happen, and wouldn\'t you know it.',
      'A partially-retired cryptozoologist with "impeccable vibes" first documented {card1} while waiting for his burrito at a gas station.',
      'The chain of events was set in motion when {card1} materialized in front of 23 witnesses, all of whom immediately began arguing about what they saw.'
    ],
    government: [
      'The Department of Definitely Real Explanations issued a 47-page response to {card1}, citing "atmospheric conditions" 312 times.',
      'Officials were quick to categorize {card1} as a "standard occurrence" despite no one being able to find it in any standard.',
      'A hastily assembled committee convened at 2 AM to address {card1}. Coffee consumption described as "aggressive."',
      'Government spokesperson cleared throat nervously 14 times before explaining that {card1} was "basically a bird."',
      'The official response to {card1} was delayed by 6 hours due to the paper shredder being "mysteriously overworked."'
    ]
  },
  middle: {
    truth: [
      'Things escalated when {card2} was confirmed by a retired Air Force pilot who "just couldn\'t take the lying anymore, Brenda."',
      'The {card2} evidence was corroborated by 47 separate blurry photographs, a voice memo, and one very detailed crayon drawing.',
      '{card2} arrived just as skeptics were preparing their "I told you it was nothing" tweets, forcing mass deletion.',
      'A second witness emerged to describe {card2}, adding that they "weren\'t even drunk this time" and their "dog also saw it."',
      'The situation intensified when local podcaster confirmed {card2} from his basement studio slash mom\'s laundry room.'
    ],
    government: [
      'Following {card2}, officials upgraded the situation from "nothing" to "definitely still nothing, but now with more paperwork."',
      'The {card2} development prompted an emergency meeting that was immediately downgraded to a "casual chat" for optics.',
      'Additional resources were allocated to {card2} containment, mostly consisting of "very stern looks" and extra staples.',
      'Agency representatives practiced their {card2} denial in front of mirrors for approximately 4 hours before the presser.',
      'The {card2} file was relocated three times in one hour, each time to a filing cabinet with a more ambiguous label.'
    ]
  },
  climax: {
    truth: [
      'The situation reached peak chaos when {card3} was broadcast live on seven different streaming platforms, two of which were supposed to be cooking shows.',
      '{card3} delivered the final blow when it appeared on camera just as the government spokesperson was saying "this kind of thing never happens."',
      'By the time {card3} occurred, the coverup had more holes than a cheese-themed doily at a mouse convention.',
      'The {card3} confirmation came via a fax machine that had been unplugged since 1997, raising additional questions.',
      '{card3} sealed the deal when it was independently verified by a grandmother, her book club, and one very judgmental parrot.'
    ],
    government: [
      'With {card3} now public, officials released a statement noting that all previous statements were "directionally accurate in spirit."',
      'The {card3} situation was resolved via emergency PowerPoint, which sources describe as "23 slides of increasingly desperate clip art."',
      'Following {card3}, the official narrative achieved what analysts call "complete and utter narrative spaghetti."',
      '{card3} prompted the spokesperson to invent an entirely new euphemism: "alternative spatial conditions."',
      'The final briefing on {card3} concluded with the phrase "we\'ll get back to you" repeated seven times in varying tones.'
    ]
  },
  closing: {
    truth: [
      'Witnesses are advised to screenshot everything, trust no one, and maybe call their mothers because she was right about the government.',
      'More information expected as soon as someone\'s cousin finishes uploading the footage over their spotty rural WiFi.',
      'Experts unanimously agree that this changes everything, except for what they disagree on, which is also everything.',
      'Citizens are encouraged to remain vigilant, stock up on tinfoil, and update their emergency podcast subscriptions.',
      'The truth, it seems, is not only out there—it\'s in the Denny\'s parking lot and it wants to talk to the manager.'
    ],
    government: [
      'Citizens are reminded that normalcy is mandatory and questioning is available by appointment only, between 2-3 PM on alternate Thursdays.',
      'Further information will be provided once it has been properly "contextualized" by the Department of Careful Wording.',
      'The matter is considered closed. Any lingering questions should be directed to the nearest suggestion box (shredder).',
      'Officials thank the public for their "enthusiastic compliance" and remind everyone that curiosity killed the cat, and the cat\'s file is classified.',
      'Refreshments were served. The incident never happened. Have a pleasant evening.'
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

// Weekly World News-style headline templates that combine cards in absurd ways
const WWN_HEADLINE_TEMPLATES = {
  truth2: [
    '{name1} SPOTTED HAVING LUNCH WITH {name2} — WAFFLE HOUSE EMPLOYEES "NOT SURPRISED"',
    '{name1} CONFIRMS {name2} IS REAL: "I HAVE THE RECEIPTS AND A POLAROID"',
    'BREAKING: {name1} AND {name2} SEEN CARPOOLING TO SECRET LOCATION',
    '{name1} BRINGS {name2} TO THANKSGIVING DINNER — GRANDMA "HANDLING IT WELL"',
    '{name1} REVEALS {name2} CONNECTION: DINER PATRONS DEMAND ANSWERS, PIE',
    'LOCAL MAN WITNESSES {name1} AND {name2} — WAS "ONLY ON THIRD ENERGY DRINK"',
    '{name1} INTRODUCES {name2} TO BOOK CLUB — TUESDAY MEETINGS "FOREVER CHANGED"',
    '{name1} & {name2} CAUGHT ON TRAIL CAM — BOTH MAKING "QUESTIONABLE FASHION CHOICES"'
  ],
  truth3: [
    '{name1}, {name2}, AND {name3} HOLD SUMMIT AT IHOP — SYRUP TREATY EXPECTED',
    'TRIPLE THREAT: {name1} LINKS {name2} TO {name3} — "IT ALL MAKES SENSE NOW," CLAIMS MAN',
    '{name1} • {name2} • {name3}: CONSPIRACY BINGO CARD NOW COMPLETE',
    'WITNESSES REPORT {name1}, {name2}, AND {name3} "ALL IN THE SAME PARKING LOT"',
    '{name1} CONFIRMS {name2} KNEW ABOUT {name3} — PODCAST HOSTS VINDICATED',
    'THE TRIFECTA: {name1} MEETS {name2} RE: {name3} — WORLD "NOT READY"'
  ],
  gov2: [
    '{name1} INCIDENT "RESOLVED" — {name2} JUST SWAMP GAS, SAYS VERY TIRED SPOKESMAN',
    'OFFICIALS: {name1} AND {name2} "COMPLETELY UNRELATED" — FILE CABINET DISAGREES',
    '{name1} INVESTIGATION CLOSED; {name2} BLAMED ON "ATMOSPHERIC PAPERWORK"',
    'MEMO: {name1} NOW CLASSIFIED AS "{name2}" — INTERN RESPONSIBLE PROMOTED',
    '{name1} PRESS BRIEFING INTERRUPTED BY {name2} — COFFEE BREAK EXTENDED INDEFINITELY',
    'PENTAGON: {name1} IS "{name2}, BUT NORMAL" — AIR QUOTES USED 47 TIMES'
  ],
  gov3: [
    'TRIPLE DENIAL: {name1}, {name2}, {name3} ALL "ROUTINE" — DEFINITION OF ROUTINE EXPANDED',
    '{name1} + {name2} + {name3} = "NOTHING TO SEE HERE," SAYS SWEATING OFFICIAL',
    'COMMITTEE FORMED TO EXPLAIN {name1}, {name2}, AND {name3} — MEETING SCHEDULED FOR NEVER',
    'CLASSIFIED UPDATE: {name1}, {name2}, {name3} NOW OFFICIALLY "BIRDS"'
  ],
  mixed: [
    '{truth} VS {gov}: PARKING LOT SHOWDOWN DRAWS CROWD, LAWN CHAIRS',
    '{truth} CLASHES WITH {gov} — BOTH CLAIM OTHER STARTED IT',
    'CHAOS: {truth} EXPOSES {gov} — GOVERNMENT RESPONSE: "NUH-UH"',
    '{truth} AND {gov} IN STANDOFF — DENNY\'S BOOTH REMAINS TENSE',
    '{truth} CONTRADICTS {gov}: LOCAL NEWS "EQUALLY CONFUSED BY BOTH"'
  ]
};

// Article-enriched headline templates that combine actual card article headlines
const ARTICLE_COMBO_HEADLINE_TEMPLATES = {
  connection: [
    'EXCLUSIVE: {phrase1} LINKED TO {phrase2}',
    'BOMBSHELL: {phrase1} — NOW CONNECTED TO {phrase2}',
    'DEVELOPING: {phrase1} AS {phrase2}',
    'INVESTIGATION REVEALS: {phrase1} AND {phrase2}',
  ],
  state_focus: [
    '{state} ROCKED AS {phrase1}',
    'CHAOS IN {state}: {phrase1} WHILE {phrase2}',
    '{state} AUTHORITIES BAFFLED: {phrase1}',
    'EXCLUSIVE FROM {state}: {phrase1}',
  ],
  character_link: [
    '{character} CONFIRMS: {phrase1}',
    '{character} BREAKS SILENCE ON {phrase1}',
    'SOURCES SAY {character} WITNESSED {phrase1}',
    '{character} "NOT SURPRISED" BY {phrase1}',
  ],
};

// Templates for weaving article content into combined body paragraphs
const ARTICLE_WEAVE_TEMPLATES = {
  opener: [
    'In a stunning development that connects {card1} to {card2}, sources confirm that events are now "spiraling in ways nobody predicted."',
    'What started with {card1} has now expanded to include {card2}, leaving investigators scrambling to connect the dots.',
    'The connection between {card1} and {card2} became undeniable when witnesses came forward with corroborating accounts.',
    'Multiple sources have confirmed a link between {card1} and the {card2} situation, with implications that reach far beyond initial reports.',
  ],
  hookWeave: [
    'Meanwhile, {hook} — a development that experts say "changes everything we thought we knew."',
    'In a related twist, {hook}. Officials declined to comment on the timing.',
    'Sources close to the investigation revealed that {hook}, though the full significance remains unclear.',
    'Adding to the intrigue: {hook}. Local witnesses are "not even surprised anymore."',
  ],
  stateReference: [
    'The situation in {state} has taken a dramatic turn as these events converged.',
    'Residents of {state} are bracing for impact as the story unfolds across their region.',
    '{state} authorities were unavailable for comment, though an intern was spotted shredding documents.',
    'The {state} connection adds another layer to an already byzantine situation.',
  ],
  characterQuote: [
    '"{character}" emerged as a key figure, reportedly seen at multiple locations connected to the events.',
    'When reached for comment, {character} only replied: "I told you so. I\'ve been telling everyone so."',
    'Sources say {character} has been "unusually quiet" since the news broke — which regulars say is "extremely suspicious."',
  ],
  closer: [
    'The full implications of these connected events remain unclear, but one thing is certain: someone owes someone else an apology.',
    'Experts advise the public to "stay vigilant" and "maybe start that podcast you\'ve been thinking about."',
    'More details are expected as authorities sort through what one official called "the most complicated filing cabinet situation in years."',
    'Citizens are encouraged to screenshot everything, trust their instincts, and update their conspiracy boards accordingly.',
  ],
};

function generateHeadline(cards: CardPlayContext[], tone: 'truth' | 'government' | 'mixed'): string {
  const seed = cards.map(c => c.card.id).join('|');
  const names = cards.map(c => c.card.name.toUpperCase());

  if (tone === 'truth') {
    if (cards.length === 2) {
      const template = pick(WWN_HEADLINE_TEMPLATES.truth2, seed);
      return template.replace('{name1}', names[0]).replace('{name2}', names[1]);
    } else if (cards.length === 3) {
      const template = pick(WWN_HEADLINE_TEMPLATES.truth3, seed);
      return template
        .replace('{name1}', names[0])
        .replace('{name2}', names[1])
        .replace('{name3}', names[2]);
    }
    const consequence = pick(TRUTH_ACTION_VERBS.consequence, seed + 'conseq');
    return `${names.join(' & ')}: ${consequence}`;
  }

  if (tone === 'government') {
    if (cards.length === 2) {
      const template = pick(WWN_HEADLINE_TEMPLATES.gov2, seed);
      return template.replace('{name1}', names[0]).replace('{name2}', names[1]);
    } else if (cards.length === 3) {
      const template = pick(WWN_HEADLINE_TEMPLATES.gov3, seed);
      return template
        .replace('{name1}', names[0])
        .replace('{name2}', names[1])
        .replace('{name3}', names[2]);
    }
    const consequence = pick(GOV_ACTION_VERBS.consequence, seed + 'conseq');
    return `OFFICIAL NOTICE: ${names.join(' • ')} — ${consequence}`;
  }

  // Mixed tone - truth vs government clash
  const truthCards = cards.filter(c => !c.card.faction.toLowerCase().includes('gov'));
  const govCards = cards.filter(c => c.card.faction.toLowerCase().includes('gov'));

  const truthName = truthCards[0]?.card.name.toUpperCase() ?? 'DISCLOSURE';
  const govName = govCards[0]?.card.name.toUpperCase() ?? 'CONTAINMENT';

  const template = pick(WWN_HEADLINE_TEMPLATES.mixed, seed);
  return template.replace('{truth}', truthName).replace('{gov}', govName);
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
// ARTICLE-ENRICHED GENERATION
// ============================================================================

/**
 * Generate a headline that combines actual article content from played cards
 */
function generateArticleEnrichedHeadline(
  enriched: EnrichedCardContext[],
  tone: 'truth' | 'government' | 'mixed'
): string | null {
  const seed = enriched.map(c => c.card.id).join('|');
  const phrases = extractHeadlinePhrases(enriched);
  const states = collectMentionedStates(enriched);
  const characters = collectRecurringCharacters(enriched);

  // Need at least 2 article phrases to create an enriched headline
  if (phrases.length < 2) {
    return null;
  }

  // Try state-focused headline if we have states
  if (states.length > 0 && phrases.length >= 1) {
    const template = pick(ARTICLE_COMBO_HEADLINE_TEMPLATES.state_focus, seed + 'state');
    return template
      .replace('{state}', states[0].toUpperCase())
      .replace('{phrase1}', phrases[0])
      .replace('{phrase2}', phrases[1] ?? '');
  }

  // Try character-linked headline if we have a recurring character
  if (characters.length > 0 && phrases.length >= 1) {
    const template = pick(ARTICLE_COMBO_HEADLINE_TEMPLATES.character_link, seed + 'char');
    return template
      .replace('{character}', characters[0].toUpperCase())
      .replace('{phrase1}', phrases[0]);
  }

  // Default to connection headline
  const template = pick(ARTICLE_COMBO_HEADLINE_TEMPLATES.connection, seed + 'conn');
  return template
    .replace('{phrase1}', phrases[0])
    .replace('{phrase2}', phrases[1] ?? phrases[0]);
}

/**
 * Generate body paragraphs that weave together actual article content
 */
function generateArticleEnrichedBody(
  enriched: EnrichedCardContext[],
  tone: 'truth' | 'government' | 'mixed'
): string[] | null {
  const seed = enriched.map(c => c.card.id).join('|');
  const hooks = collectFollowUpHooks(enriched);
  const states = collectMentionedStates(enriched);
  const characters = collectRecurringCharacters(enriched);

  // Need at least some article content to enrich
  if (hooks.length === 0 && states.length === 0 && characters.length === 0) {
    return null;
  }

  const paragraphs: string[] = [];

  // Opening - connect the cards
  const card1 = enriched[0]?.card.name ?? 'the first development';
  const card2 = enriched[1]?.card.name ?? 'subsequent events';
  const openingTemplate = pick(ARTICLE_WEAVE_TEMPLATES.opener, seed + 'open');
  paragraphs.push(
    openingTemplate
      .replace('{card1}', card1)
      .replace('{card2}', card2)
  );

  // Add state reference if available
  if (states.length > 0) {
    const stateTemplate = pick(ARTICLE_WEAVE_TEMPLATES.stateReference, seed + 'state');
    paragraphs.push(stateTemplate.replace('{state}', states[0]));
  }

  // Weave in follow-up hooks from the articles (these create continuity!)
  for (let i = 0; i < Math.min(hooks.length, 2); i++) {
    const hookTemplate = pick(ARTICLE_WEAVE_TEMPLATES.hookWeave, seed + `hook${i}`);
    paragraphs.push(hookTemplate.replace('{hook}', hooks[i].toLowerCase()));
  }

  // Add character reference if available
  if (characters.length > 0) {
    const charTemplate = pick(ARTICLE_WEAVE_TEMPLATES.characterQuote, seed + 'char');
    paragraphs.push(charTemplate.replace('{character}', characters[0]));
  }

  // Closing
  const closingTemplate = pick(ARTICLE_WEAVE_TEMPLATES.closer, seed + 'close');
  paragraphs.push(closingTemplate);

  return paragraphs;
}

/**
 * Generate a byline that credits article sources
 */
function generateArticleEnrichedByline(
  enriched: EnrichedCardContext[],
  tone: 'truth' | 'government' | 'mixed'
): string | null {
  const sources = extractBylineSources(enriched);

  if (sources.length === 0) {
    return null;
  }

  if (sources.length === 1) {
    return `By: ${sources[0]}, Multi-Beat Correspondent`;
  }

  if (sources.length === 2) {
    return `By: ${sources[0]} and ${sources[1]}, Joint Investigation`;
  }

  return `By: ${sources[0]} et al., Cross-Desk Collaboration`;
}

/**
 * Generate subhead from article content
 */
function generateArticleEnrichedSubhead(
  enriched: EnrichedCardContext[],
  tone: 'truth' | 'government' | 'mixed'
): string | null {
  const seed = enriched.map(c => c.card.id).join('|');

  // Try to use an article's subhead directly, with a twist
  for (const ctx of enriched) {
    if (ctx.article?.subhead) {
      const modifiers = [
        'Meanwhile, in related news:',
        'Sources confirm:',
        'Developing story:',
        'Update:',
        'Breaking:',
      ];
      return `${pick(modifiers, seed + 'mod')} ${ctx.article.subhead}`;
    }
  }

  return null;
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
 *
 * Enhanced to pull from existing card articles when available,
 * combining their content into cohesive multi-card narratives.
 */
export function composeSmartNarrative(
  cards: CardPlayContext[],
  options?: {
    forceNarrative?: boolean;
    preferArticleContent?: boolean;
  }
): NarrativeOutput | null {
  if (!cards || cards.length < 2) {
    return null;
  }

  const tone = determineTone(cards);
  const seed = cards.map(c => c.card.id).join('|');

  // Enrich cards with their pre-written articles
  const enriched = enrichWithArticles(cards);

  // Check if we have article content to work with
  const hasArticleContent = enriched.some(ctx => ctx.article !== null);

  const fallbackBylines = {
    truth: [
      'By: Gary (Real Name Withheld By Request, But It\'s Gary)',
      'By: A Guy Who "Just Knows Things"',
      'By: Night Shift Denny\'s Correspondent',
      'By: Someone\'s Uncle Who Works At The Government',
      'By: Retired Postman With "Impeccable Vibes"',
      'By: Anonymous Source (His Name Is Probably Dave)',
      'By: Conspiracy Corner, Your Mom\'s Basement Branch',
      'By: Local Podcaster, Episode 847: "We Were Right"'
    ],
    government: [
      'By: Spokesperson Who Practiced This In The Mirror',
      'By: Department Of Plausible Deniability',
      'By: The Intern Who Drew The Short Straw',
      'By: Committee For Explaining Things (Badly)',
      'By: Bureau Of "That\'s Classified, Next Question"',
      'By: Official Narrative Maintenance Division',
      'By: Approved Media Liaison (Coffee IV Drip)',
      'By: Public Affairs (Send Help)'
    ],
    mixed: [
      'By: Two Reporters Who Can\'t Agree On Anything',
      'By: Editorial Board (Currently Arguing)',
      'By: Sources Who Disagree About What "Sources" Means',
      'By: Joint Chaos Task Force',
      'By: Confused Wire Service Amalgamation',
      'By: Multiple Contributors (Don\'t Get Them Started)'
    ]
  };

  // Try article-enriched generation first if we have article content
  if (hasArticleContent) {
    const enrichedHeadline = generateArticleEnrichedHeadline(enriched, tone);
    const enrichedSubhead = generateArticleEnrichedSubhead(enriched, tone);
    const enrichedBody = generateArticleEnrichedBody(enriched, tone);
    const enrichedByline = generateArticleEnrichedByline(enriched, tone);

    // Use enriched content if available, fall back to template-based
    const headline = enrichedHeadline ?? generateHeadline(cards, tone);
    const subhead = enrichedSubhead ?? generateSubhead(cards, tone);
    const body = enrichedBody ?? generateBody(cards, tone);
    const byline = enrichedByline ?? pick(fallbackBylines[tone], seed + 'byline');

    // Collect additional tags from articles
    const articleTags: string[] = [];
    for (const ctx of enriched) {
      if (ctx.article?.tags) {
        articleTags.push(...ctx.article.tags);
      }
    }

    return {
      headline,
      subhead,
      body,
      byline,
      tone,
      imagePrompt: generateImagePrompt(cards, tone),
      tags: [...new Set([...getMostRelevantTags(cards), ...articleTags, `${cards.length}-card-combo`, tone])]
    };
  }

  // Fall back to template-based generation
  return {
    headline: generateHeadline(cards, tone),
    subhead: generateSubhead(cards, tone),
    body: generateBody(cards, tone),
    byline: pick(fallbackBylines[tone], seed + 'byline'),
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
