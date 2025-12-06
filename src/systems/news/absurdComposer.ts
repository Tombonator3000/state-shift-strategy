import articleDatabase from '@/public/data/paranoid_times_card_articles_ALL.json';
import type { CompositeSourceReference, CompositeStory } from '@/types/news';

type ArticleFaction = 'truth' | 'government';

export interface ArticleRecord {
  id: string;
  faction: ArticleFaction;
  tags: string[];
  headline: string;
  subhead: string;
  byline: string;
  body: string;
  imagePrompt?: string;
}

interface ArticleDatabaseFile {
  articles: ArticleRecord[];
}

const database = articleDatabase as ArticleDatabaseFile;
const defaultPool = database.articles ?? [];

const SUBJECT_PRIORITY = ['florida-man', 'ufo', 'bigfoot', 'ghost'] as const;

const DEFAULT_TAG = 'mystery';
const SECONDARY_FALLBACK = 'backchannel static';
const BYLINE: CompositeStory['byline'] = 'Composite Desk';

const TRUTH_CONNECTORS = ['uncovers', 'broadcasts', 'amplifies', 'decrypts'] as const;
const GOVERNMENT_CONNECTORS = ['suppresses', 'redacts', 'obscures', 'counterspins'] as const;

// Combo headline templates that combine two article headlines
const TRUTH_COMBO_HEADLINE_PATTERNS = [
  '{headline1} — MEANWHILE, {headline2}',
  '{headline1} AS {headline2}',
  'DOUBLE EXPOSURE: {headline1} LINKS TO {headline2}',
  '{headline1}; COALITION CONFIRMS {headline2}',
  'TRUTHLINE SPECIAL: {headline1} SPARKS {headline2}',
] as const;

const GOVERNMENT_COMBO_HEADLINE_PATTERNS = [
  '{headline1} — OFFICIALS DENY {headline2}',
  '{headline1} AS BUREAU SUPPRESSES {headline2}',
  'CLASSIFIED MEMO: {headline1} OVERSHADOWS {headline2}',
  '{headline1}; DIRECTORATE INVESTIGATING {headline2}',
  'CONTAINMENT SPECIAL: {headline1} DISTRACTS FROM {headline2}',
] as const;

// Fallback to template-based when no articles have headlines
const TRUTH_HEADLINE_PATTERNS = [
  'Truthline observers {connector} {subject} {qualifier}',
  'Underground bulletin {connector} {subject} {qualifier}',
  'Community monitors {connector} {subject} {qualifier}',
] as const;

const GOVERNMENT_HEADLINE_PATTERNS = [
  'Containment office {connector} {subject} {qualifier}',
  'Directorate memo {connector} {subject} {qualifier}',
  'Command bureau {connector} {subject} {qualifier}',
] as const;

const TRUTH_QUALIFIERS = ['broadcast log', 'timeline', 'signal chain', 'field memo'] as const;
const GOVERNMENT_QUALIFIERS = ['containment brief', 'curfew directive', 'denial file', 'spin cycle'] as const;

const TRUTH_SUBHEAD_PATTERNS = [
  'Encrypted tipsters race to {connector} every {subject} whisper before it vanishes.',
  'Neighborhood scouts {connector} {subject} breadcrumbs into tonight\'s dossier.',
  'Pirate transmitters {connector} {subject} traffic so cells stay ahead of curfew.',
] as const;

const GOVERNMENT_SUBHEAD_PATTERNS = [
  'Press office scrambles to {connector} all {subject} chatter from the nightly brief.',
  'Containment memos order staff to {connector} {subject} talk before dawn.',
  'Internal auditors vow to {connector} {subject} sightings from civilian channels.',
] as const;

const TRUTH_BODY_OPENERS = [
  'Volunteer signal-sweepers {connector} {subject} whispers as {secondary} lookouts feed coordinates through cracked scanners.',
  'Basement analysts {connector} {subject} loops, spinning the anomaly into shareable proof before officials notice.',
  'Truthline couriers {connector} {subject} rumors, relaying each flicker across midnight rooftops.',
] as const;

const GOVERNMENT_BODY_OPENERS = [
  'Command analysts {connector} {subject} chatter and reroute {secondary} witnesses into compliance interviews.',
  'Containment ushers {connector} {subject} reports, filing each to the denial archives before sunrise.',
  'Agency handlers {connector} {subject} claims, reclassifying the anomaly as harmless weather balloons.',
] as const;

const TRUTH_BODY_CLOSERS = [
  'Composite Desk urges readers to log sightings at the encrypted tipline before the static resets the grid.',
  'Neighborhood stewards remind allies to stockpile zines and keep the pirate antennas humming.',
  'Archivists plead for fresh snapshots so the pattern survives the nightly scrubbing.',
] as const;

const GOVERNMENT_BODY_CLOSERS = [
  'Briefing instructs loyal citizens to stay calm, respect curfew, and recycle any suspicious pamphlets.',
  'Officials insist the incident remains classified routine maintenance and that further inquiry is discouraged.',
  'Administrators warn that unauthorized reproductions of tonight\'s memo invite immediate review.',
] as const;

const createTemplateFormatter = (replacements: Record<string, string>) =>
  (template: string): string =>
    template.replace(/\{(\w+)\}/g, (_, key: string) => replacements[key] ?? '');

const formatSubject = (tag: string): string =>
  tag
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase());

const collectTagStats = (articles: ArticleRecord[]): Map<string, number> => {
  const stats = new Map<string, number>();
  for (const article of articles) {
    for (const tag of article.tags ?? []) {
      stats.set(tag, (stats.get(tag) ?? 0) + 1);
    }
  }
  return stats;
};

const determinePrimarySubject = (stats: Map<string, number>): string => {
  for (const tag of SUBJECT_PRIORITY) {
    if ((stats.get(tag) ?? 0) > 0) {
      return tag;
    }
  }

  let fallbackTag: string | null = null;
  let highestCount = -1;

  for (const [tag, count] of stats.entries()) {
    if (count > highestCount) {
      highestCount = count;
      fallbackTag = tag;
    } else if (count === highestCount && fallbackTag && tag < fallbackTag) {
      fallbackTag = tag;
    }
  }

  return fallbackTag ?? DEFAULT_TAG;
};

const buildTagList = (stats: Map<string, number>, primary: string): string[] => {
  if (stats.size === 0) {
    return [DEFAULT_TAG];
  }

  const entries = Array.from(stats.entries());
  entries.sort((a, b) => {
    if (a[0] === primary) return -1;
    if (b[0] === primary) return 1;

    if (a[1] !== b[1]) {
      return b[1] - a[1];
    }

    return a[0].localeCompare(b[0]);
  });

  const ordered = entries.map(([tag]) => tag);
  if (!ordered.includes(primary)) {
    ordered.unshift(primary);
  }
  return Array.from(new Set(ordered));
};

const chooseImagePrompt = (
  articles: ArticleRecord[],
  tags: string[],
): string | undefined => {
  const prioritizedTags: string[] = [
    ...SUBJECT_PRIORITY.filter(tag => tags.includes(tag)),
    ...tags.filter(tag => !(SUBJECT_PRIORITY as readonly string[]).includes(tag)),
  ];

  for (const tag of prioritizedTags) {
    const match = articles.find(article => article.imagePrompt && article.tags.includes(tag));
    if (match?.imagePrompt) {
      return match.imagePrompt;
    }
  }

  return articles.find(article => article.imagePrompt)?.imagePrompt;
};

const computeSeedFromIds = (seed: number, ids: string[]): number => {
  const sorted = [...ids].sort();
  let hash = 0x811c9dc5;
  for (const id of sorted) {
    for (let i = 0; i < id.length; i += 1) {
      hash ^= id.charCodeAt(i);
      hash = Math.imul(hash, 0x01000193);
      hash >>>= 0;
    }
  }

  return (hash + seed) >>> 0;
};

const createMulberry32 = (seed: number) => {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const pick = <T>(rng: () => number, items: readonly T[], fallback: T): T => {
  if (items.length === 0) {
    return fallback;
  }
  const index = Math.floor(rng() * items.length);
  return items[index] ?? fallback;
};

const buildSourceReferences = (articles: ArticleRecord[]): CompositeSourceReference[] =>
  articles.map(article => ({
    id: article.id,
    headline: article.headline,
    subhead: article.subhead,
  }));

const buildSourceParagraph = (
  faction: ArticleFaction,
  subjectLabel: string,
  sources: CompositeSourceReference[],
): string => {
  if (sources.length === 0) {
    return faction === 'truth'
      ? `Composite Desk notes tonight's {subject} briefing drew from open mics and whispered tip codes.`.replace(
          '{subject}',
          subjectLabel,
        )
      : `Officials insist the {subject} dossier sources remain classified and should not inspire speculation.`.replace(
          '{subject}',
          subjectLabel,
        );
  }

  if (sources.length === 1) {
    return `Source ledger spotlights "${sources[0].headline}" as the clearest trailhead for the ${subjectLabel.toLowerCase()} pattern.`;
  }

  const [first, second, ...rest] = sources;
  const others = rest.length > 0 ? ` plus ${rest.length} more archived briefs` : '';
  return `Composite archive cross-references "${first.headline}" and "${second.headline}"${others} to map the ${subjectLabel.toLowerCase()} vector.`;
};

const buildStoryBody = (
  faction: ArticleFaction,
  connector: string,
  subjectLabel: string,
  secondaryLabel: string,
  sources: CompositeSourceReference[],
  rng: () => number,
): string[] => {
  const openerTemplates =
    faction === 'truth' ? TRUTH_BODY_OPENERS : GOVERNMENT_BODY_OPENERS;
  const closerTemplates =
    faction === 'truth' ? TRUTH_BODY_CLOSERS : GOVERNMENT_BODY_CLOSERS;

  const format = createTemplateFormatter({
    connector,
    subject: subjectLabel,
    secondary: secondaryLabel,
  });

  const opener = format(pick(rng, openerTemplates, openerTemplates[0]));
  const sourceParagraph = buildSourceParagraph(faction, subjectLabel, sources);
  const closer = pick(rng, closerTemplates, closerTemplates[0]);

  return [opener, sourceParagraph, closer];
};

/**
 * Build headline using actual article headlines when available
 * Combines headlines from played cards for a more authentic tabloid feel
 */
const buildCompositeHeadline = (
  articles: ArticleRecord[],
  faction: ArticleFaction,
  rng: () => number,
  fallbackHeadline: string,
): string => {
  // Filter articles that have good headlines (not empty)
  const articlesWithHeadlines = articles.filter(
    article => article.headline && article.headline.trim().length > 5
  );

  if (articlesWithHeadlines.length === 0) {
    return fallbackHeadline;
  }

  // If we have just one article with a headline, use it directly
  if (articlesWithHeadlines.length === 1) {
    return articlesWithHeadlines[0].headline;
  }

  // Combine two headlines for a dramatic composite effect
  const comboTemplates = faction === 'truth'
    ? TRUTH_COMBO_HEADLINE_PATTERNS
    : GOVERNMENT_COMBO_HEADLINE_PATTERNS;

  const template = pick(rng, comboTemplates, comboTemplates[0]);

  // Pick the two most interesting headlines (shuffle for variety)
  const shuffled = [...articlesWithHeadlines].sort(() => rng() - 0.5);
  const headline1 = shuffled[0].headline.replace(/!+$/, ''); // Remove trailing exclamation marks for combo
  const headline2 = shuffled[1]?.headline.replace(/!+$/, '') ?? shuffled[0].headline;

  return template
    .replace('{headline1}', headline1)
    .replace('{headline2}', headline2);
};

/**
 * Build subhead using actual article subheads when available
 */
const buildCompositeSubhead = (
  articles: ArticleRecord[],
  fallbackSubhead: string,
  rng: () => number,
): string => {
  const articlesWithSubheads = articles.filter(
    article => article.subhead && article.subhead.trim().length > 10
  );

  if (articlesWithSubheads.length === 0) {
    return fallbackSubhead;
  }

  // Pick a random subhead from available articles
  return pick(rng, articlesWithSubheads, articlesWithSubheads[0]).subhead;
};

/**
 * Build body using actual article content when available
 * Weaves together excerpts from multiple card articles
 */
const buildEnrichedBody = (
  articles: ArticleRecord[],
  faction: ArticleFaction,
  connector: string,
  subjectLabel: string,
  secondaryLabel: string,
  sources: CompositeSourceReference[],
  rng: () => number,
): string[] => {
  const articlesWithBody = articles.filter(
    article => article.body && article.body.trim().length > 20
  );

  // If no articles have body content, fall back to template-based
  if (articlesWithBody.length === 0) {
    return buildStoryBody(faction, connector, subjectLabel, secondaryLabel, sources, rng);
  }

  const paragraphs: string[] = [];

  // Use the first article's body as the opener (take first sentence or two)
  const primaryBody = articlesWithBody[0].body;
  const primarySentences = primaryBody.split(/\.\s+/).filter(s => s.trim().length > 10);
  if (primarySentences.length > 0) {
    paragraphs.push(primarySentences.slice(0, 2).join('. ') + '.');
  }

  // Add the source paragraph
  const sourceParagraph = buildSourceParagraph(faction, subjectLabel, sources);
  paragraphs.push(sourceParagraph);

  // Add content from additional articles if available
  if (articlesWithBody.length > 1) {
    const secondaryBody = articlesWithBody[1].body;
    const secondarySentences = secondaryBody.split(/\.\s+/).filter(s => s.trim().length > 10);
    if (secondarySentences.length > 0) {
      paragraphs.push(secondarySentences.slice(0, 2).join('. ') + '.');
    }
  }

  // Add a closing line from the template system
  const closerTemplates =
    faction === 'truth' ? TRUTH_BODY_CLOSERS : GOVERNMENT_BODY_CLOSERS;
  paragraphs.push(pick(rng, closerTemplates, closerTemplates[0]));

  return paragraphs;
};

const composeFromArticles = (
  articles: ArticleRecord[],
  faction: ArticleFaction,
  playedArticleIds: string[],
  seed: number,
): CompositeStory => {
  const tagStats = collectTagStats(articles);
  const primarySubject = determinePrimarySubject(tagStats);
  const tags = buildTagList(tagStats, primarySubject);
  const subjectLabel = formatSubject(primarySubject);
  const secondaryTag = tags.find(tag => tag !== primarySubject);
  const secondaryLabel = secondaryTag ? formatSubject(secondaryTag) : SECONDARY_FALLBACK;
  const sources = buildSourceReferences(articles);

  const computedSeed = computeSeedFromIds(seed, playedArticleIds);
  const rng = createMulberry32(computedSeed);

  const connectors = faction === 'truth' ? TRUTH_CONNECTORS : GOVERNMENT_CONNECTORS;
  const connector = pick(rng, connectors, connectors[0]);

  // Build template-based fallback headline (used if no article headlines available)
  const headlineTemplates =
    faction === 'truth' ? TRUTH_HEADLINE_PATTERNS : GOVERNMENT_HEADLINE_PATTERNS;
  const qualifierBases = faction === 'truth' ? TRUTH_QUALIFIERS : GOVERNMENT_QUALIFIERS;

  const qualifierBase = pick(rng, qualifierBases, qualifierBases[0]);
  const qualifier = secondaryTag
    ? `${qualifierBase} on ${formatSubject(secondaryTag)}`
    : `${qualifierBase} dossier`;

  const headlineFormat = createTemplateFormatter({
    connector,
    subject: subjectLabel,
    qualifier,
  });
  const fallbackHeadline = headlineFormat(pick(rng, headlineTemplates, headlineTemplates[0]));

  // Use actual article headlines when available
  const headline = buildCompositeHeadline(articles, faction, rng, fallbackHeadline);

  // Build template-based fallback subhead
  const subheadTemplates =
    faction === 'truth' ? TRUTH_SUBHEAD_PATTERNS : GOVERNMENT_SUBHEAD_PATTERNS;
  const subheadFormat = createTemplateFormatter({
    connector,
    subject: subjectLabel,
  });
  const fallbackSubhead = subheadFormat(pick(rng, subheadTemplates, subheadTemplates[0]));

  // Use actual article subheads when available
  const subhead = buildCompositeSubhead(articles, fallbackSubhead, rng);

  const imagePrompt = chooseImagePrompt(articles, tags);

  // Use enriched body that pulls from actual article content
  const body = buildEnrichedBody(articles, faction, connector, subjectLabel, secondaryLabel, sources, rng);

  return {
    tone: faction,
    tags,
    headline,
    subhead,
    byline: BYLINE,
    body,
    imagePrompt,
    sources,
  };
};

export const createComposerWithPool = (pool: ArticleRecord[] = defaultPool) => {
  const lookup = new Map(pool.map(article => [article.id, article]));
  return (playedArticleIds: string[], faction: ArticleFaction, rngSeed: number): CompositeStory => {
    const articles = playedArticleIds
      .map(id => lookup.get(id))
      .filter((article): article is ArticleRecord => Boolean(article));

    if (articles.length === 0) {
      return composeFromArticles([], faction, playedArticleIds, rngSeed);
    }

    const orderedArticles = [...articles].sort((a, b) => a.id.localeCompare(b.id));
    return composeFromArticles(orderedArticles, faction, playedArticleIds, rngSeed);
  };
};

export const composeCompositeStory = (
  playedArticleIds: string[],
  faction: ArticleFaction,
  rngSeed: number,
): CompositeStory => {
  const composer = createComposerWithPool();
  return composer(playedArticleIds, faction, rngSeed);
};
