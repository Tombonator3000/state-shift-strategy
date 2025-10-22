/**
 * Article Enhancer
 * Takes existing static articles and makes them funnier and more varied
 * by injecting random details, exaggerations, and tabloid flourishes
 */

interface EnhancementContext {
  truth?: number;
  turn?: number;
  targetState?: string;
}

const INTENSIFIERS = [
  'SHOCKING', 'EXPLOSIVE', 'BOMBSHELL', 'UNPRECEDENTED', 'STUNNING',
  'MIND-BLOWING', 'JAW-DROPPING', 'EARTH-SHATTERING', 'GAME-CHANGING'
];

const TABLOID_FLOURISHES = [
  '—EXPERTS BAFFLED',
  '—GOVERNMENT SILENT',
  '—YOU WON\'T BELIEVE #7',
  '—SOURCES CONFIRM',
  '—OFFICIALS SCRAMBLE',
  '—CITIZENS DEMAND ANSWERS',
  '—COVERUP CRUMBLES',
  '—INSIDER LEAKS ALL',
  '—TRUTH EMERGES'
];

const SPECIFIC_NUMBERS = [
  '47', '23', '187', '666', '420', '137', '314', '42', '88', '144'
];

const TIME_DETAILS = [
  'at 3:47 AM', 'during the station identification', 'between commercials',
  'right after midnight', 'exactly at dawn', 'during the weather report',
  'while eating breakfast', 'at closing time', 'during rush hour'
];

const WITNESS_REACTIONS = [
  '"I knew it," said the witness',
  '"This changes everything," local resident noted',
  '"Called it," replied anonymous source',
  '"Told you so," muttered investigator',
  '"Finally," exclaimed truth-seeker',
  '"About damn time," researcher commented'
];

const GOV_EVASIONS = [
  'Officials declined to comment',
  'Spokesperson was "in a meeting"',
  'Press office voicemail full',
  'Statement promised "by next Tuesday"',
  'Department exists but office empty',
  'Contact number disconnected'
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function injectSpecificDetail(text: string): string {
  // Replace vague numbers with specific tabloid-style numbers
  text = text.replace(/\bseveral\b/gi, pick(SPECIFIC_NUMBERS));
  text = text.replace(/\bmany\b/gi, `${pick(SPECIFIC_NUMBERS)}`);
  text = text.replace(/\ba lot of\b/gi, `${pick(SPECIFIC_NUMBERS)}`);
  
  // Add specific times
  if (!text.includes('AM') && !text.includes('PM') && Math.random() > 0.5) {
    text = text.replace(/\btonight\b/gi, pick(TIME_DETAILS));
    text = text.replace(/\blast night\b/gi, pick(TIME_DETAILS));
  }
  
  return text;
}

export function enhanceHeadline(headline: string, isTruth: boolean): string {
  // Already sensational? Leave it
  if (INTENSIFIERS.some(i => headline.toUpperCase().includes(i))) {
    return headline;
  }
  
  // 50% chance to add flourish
  if (Math.random() > 0.5) {
    const flourish = pick(TABLOID_FLOURISHES);
    return `${headline}${flourish}`;
  }
  
  return headline;
}

export function enhanceSubhead(subhead: string, context: EnhancementContext): string {
  subhead = injectSpecificDetail(subhead);
  
  // Add truth meter reference if available
  if (context.truth !== undefined && Math.random() > 0.6) {
    const truthPercent = Math.round(context.truth);
    subhead = `${subhead} • Truth Index: ${truthPercent}%`;
  }
  
  return subhead;
}

export function enhanceBody(body: string, isTruth: boolean): string {
  let enhanced = injectSpecificDetail(body);
  
  // Inject witness reactions or government evasions randomly
  const reactions = isTruth ? WITNESS_REACTIONS : GOV_EVASIONS;
  if (Math.random() > 0.4 && !enhanced.includes('"')) {
    const paragraphs = enhanced.split('\n\n');
    if (paragraphs.length > 2) {
      // Insert reaction in middle paragraph
      const midIndex = Math.floor(paragraphs.length / 2);
      paragraphs[midIndex] = `${paragraphs[midIndex]} ${pick(reactions)}.`;
      enhanced = paragraphs.join('\n\n');
    }
  }
  
  // Add emphasis to key phrases
  enhanced = enhanced.replace(/\bunsurprisingly\b/gi, 'UNSURPRISINGLY');
  enhanced = enhanced.replace(/\bshockingly\b/gi, 'SHOCKINGLY');
  enhanced = enhanced.replace(/\bno comment\b/gi, '"NO COMMENT"');
  
  return enhanced;
}

export function enhanceArticle(
  article: { headline: string; subhead: string; body: string },
  isTruth: boolean,
  context: EnhancementContext = {}
): { headline: string; subhead: string; body: string } {
  return {
    headline: enhanceHeadline(article.headline, isTruth),
    subhead: enhanceSubhead(article.subhead, context),
    body: enhanceBody(article.body, isTruth),
  };
}
