import { getStateByAbbreviation, getStateById } from '@/data/usaStates';
import type { NewspaperData } from '@/lib/newspaperData';
import type { Card } from '@/types';
import { loadCardLexicon } from './CardLexicon';
import { loadArticleBank, type CardArticle } from '@/engine/news/articleBank';
import { substituteArticleVariables, type GameStateContext } from './articleVariables';
import { generateMainStory, type PlayedCardMeta, type GeneratedStory as MainGeneratedStory } from '@/engine/news/mainStory';
import { deriveFrontPageSubhead } from '@/engine/news/frontPageSubhead';
import { composeCardStory, composeComboStory, type CardStory, type ComboStory } from './StoryComposer';
import type { ComboSummary } from '@/game/combo.types';
import type { AgendaIssueId } from '@/data/agendaIssues';
import { applyTone, type ArticleTone } from './articleTones';

export interface PlayedCardInput {
  card: Card;
  player: 'human' | 'ai';
  targetState?: string | null;
  truthDelta?: number;
  capturedStates?: string[];
}

export interface NarrativeArticle extends CardStory {
  id: string;
  cardId: string;
  player: 'human' | 'ai';
  typeLabel: string;
  factionLabel: string;
  truthDeltaLabel: string | null;
  ipDeltaLabel: string | null;
  pressureDeltaLabel: string | null;
  stateLabel: string | null;
  capturedStates: string[];
}

export interface GeneratedStoryArticle {
  cardId: string;
  cardName: string;
  cardType: string;
  player: 'human' | 'ai';
  articleId: string | null;
  headline: string;
  subhead: string;
  byline: string;
  body: string[];
  tags: string[];
  imagePrompt: string | null;
  isFallback: boolean;
}

export interface FrontPagePackage {
  cards: PlayedCardMeta[];
  main: MainGeneratedStory | null;
  articles: GeneratedStoryArticle[];
  fallbackHeadline: string;
  fallbackSubhead: string;
  articleBankReady: boolean;
}

export interface NarrativeIssue {
  hero: NarrativeArticle | null;
  playerArticles: NarrativeArticle[];
  oppositionArticles: NarrativeArticle[];
  comboArticle: ComboStory | null;
  byline: string;
  sourceLine: string;
  stamps: { breaking: string | null; classified: string | null };
  supplements: { ads: string[]; conspiracies: string[]; weather: string };
  generatedStory: FrontPagePackage;
}

export interface NarrativeContext {
  truthDeltaTotal: number;
  capturedStates: string[];
  cardsPlayedByYou: Card[];
  cardsPlayedByOpp: Card[];
}

export interface IssueGeneratorGameStateSnapshot {
  statesControlled?: number;
  totalStates?: number;
  controlledStates?: string[];
  truth?: number;
  truthPercentage?: number;
  ip?: number;
  turn?: number;
  playerFaction?: 'truth' | 'government';
  cardsPlayedCount?: number;
  currentScore?: number;
}

export interface IssueGeneratorInput {
  dataset: NewspaperData;
  playedCards: PlayedCardInput[];
  eventsTruthDelta?: number;
  comboTruthDelta?: number;
  comboSummary?: ComboSummary | null;
  agendaIssueId?: AgendaIssueId;
  agendaIssueLabel?: string | null;
  gameState?: IssueGeneratorGameStateSnapshot;
}

const FALLBACK_ADS = ['All advertising temporarily redacted.'];
const FALLBACK_CONSPIRACIES = ['Rumors temporarily sealed in bunker storage.'];
const FALLBACK_WEATHER = 'Forecast withheld pending clearance.';
const FALLBACK_BYLINE = 'By: Anonymous Insider';
const FALLBACK_SOURCE = 'Source: Redacted Dossier';
const FALLBACK_FRONT_PAGE_HEADLINE = 'SPECIAL EDITION: PRINTING GREMLINS AT WORK';
const FALLBACK_FRONT_PAGE_SUBHEAD = 'Article vault temporarily unavailable — dispatch desk investigating.';

const pick = <T,>(arr: T[] | undefined, fallback: T): T => {
  if (Array.isArray(arr) && arr.length) {
    const index = Math.floor(Math.random() * arr.length);
    return arr[index] ?? fallback;
  }
  return fallback;
};

const pickOrNull = (arr: string[] | undefined): string | null => {
  if (Array.isArray(arr) && arr.length) {
    const index = Math.floor(Math.random() * arr.length);
    return arr[index] ?? null;
  }
  return null;
};

const shuffle = <T,>(input: T[]): T[] => {
  const arr = [...input];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const formatTruthDeltaLabel = (value: number | undefined | null): string | null => {
  if (typeof value !== 'number' || Number.isNaN(value) || value === 0) {
    return null;
  }
  const rounded = Math.abs(value) < 1 ? Math.round(value * 10) / 10 : Math.round(value);
  const sign = value > 0 ? '+' : '−';
  return `${sign}${Math.abs(rounded)}% Truth`;
};

const formatIpLabel = (value: number | undefined | null): string | null => {
  if (typeof value !== 'number' || Number.isNaN(value) || value === 0) {
    return null;
  }
  const sign = value > 0 ? '+' : '−';
  return `${sign}${Math.abs(value)} IP`;
};

const formatPressureLabel = (value: number | undefined | null): string | null => {
  if (typeof value !== 'number' || Number.isNaN(value) || value === 0) {
    return null;
  }
  const sign = value > 0 ? '+' : '−';
  return `${sign}${Math.abs(value)} Pressure`;
};

const normalizeCardType = (value: Card['type']): PlayedCardMeta['type'] | null => {
  const upper = String(value ?? '').toUpperCase();
  if (upper === 'ATTACK' || upper === 'MEDIA' || upper === 'ZONE') {
    return upper as PlayedCardMeta['type'];
  }
  if (upper.includes('ATTACK')) {
    return 'ATTACK';
  }
  if (upper.includes('MEDIA')) {
    return 'MEDIA';
  }
  if (upper.includes('ZONE')) {
    return 'ZONE';
  }
  return null;
};

const normalizeFaction = (value: Card['faction']): PlayedCardMeta['faction'] => {
  const upper = String(value ?? '').toUpperCase();
  return upper.includes('GOV') ? 'GOV' : 'TRUTH';
};

const resolveFaction = (value: Card['faction']): 'truth' | 'government' => {
  return normalizeFaction(value) === 'GOV' ? 'government' : 'truth';
};

const isCardShaped = (card: Card | null | undefined): card is Card => {
  if (!card || typeof card !== 'object') {
    return false;
  }
  const candidate = card as any;
  return (
    isNonEmptyString(candidate.id) &&
    isNonEmptyString(candidate.name) &&
    isNonEmptyString(candidate.type) &&
    isNonEmptyString(candidate.faction)
  );
};

const sanitizePlayedCards = (entries: PlayedCardInput[]): PlayedCardInput[] => {
  if (!entries.length) {
    return entries;
  }

  const valid: PlayedCardInput[] = [];
  let skipped = 0;

  for (const entry of entries) {
    const rawCard = entry.card ?? null;
    if (!isCardShaped(rawCard)) {
      skipped += 1;
      continue;
    }
    valid.push({ ...entry, card: rawCard });
  }

  if (skipped > 0 && typeof console !== 'undefined' && typeof console.warn === 'function') {
    console.warn(
      '[Newspaper] Ignored',
      skipped,
      skipped === 1 ? 'malformed played card while building the issue.' : 'malformed played cards while building the issue.',
    );
  }

  return valid;
};

const resolveStateName = (input?: string | null): string | null => {
  if (!input) {
    return null;
  }
  const trimmed = input.trim();
  if (!trimmed) {
    return null;
  }
  const byId = getStateById(trimmed);
  if (byId) {
    return byId.name;
  }
  const byAbbr = getStateByAbbreviation(trimmed.toUpperCase());
  if (byAbbr) {
    return byAbbr.name;
  }
  return trimmed;
};

const resolveCapturedStateNames = (states: string[] | undefined): string[] => {
  if (!Array.isArray(states)) {
    return [];
  }
  return states.map(resolveStateName).filter((name): name is string => Boolean(name));
};

export const buildRoundContext = (
  playerCards: PlayedCardInput[],
  opponentCards: PlayedCardInput[],
  eventsTruthDelta = 0,
  comboTruthDelta = 0,
): NarrativeContext => {
  const truthFromPlayer = playerCards.reduce((sum, entry) => sum + (entry.truthDelta ?? 0), 0);
  const truthFromOpponent = opponentCards.reduce((sum, entry) => sum + (entry.truthDelta ?? 0), 0);
  const capturedStates = playerCards.flatMap(entry => entry.capturedStates ?? []);

  return {
    truthDeltaTotal: truthFromPlayer + truthFromOpponent + eventsTruthDelta + comboTruthDelta,
    capturedStates,
    cardsPlayedByYou: playerCards.map(entry => entry.card),
    cardsPlayedByOpp: opponentCards.map(entry => entry.card),
  } satisfies NarrativeContext;
};

export const shouldStampBreaking = (ctx: NarrativeContext): boolean => {
  return Math.abs(ctx.truthDeltaTotal) >= 10 || ctx.capturedStates.length > 0;
};

const chooseHeroCard = (playerCards: PlayedCardInput[]): PlayedCardInput | null => {
  if (!playerCards.length) {
    return null;
  }
  const capture = playerCards.find(entry => (entry.capturedStates ?? []).length > 0);
  if (capture) {
    return capture;
  }
  const sorted = [...playerCards].sort(
    (a, b) => Math.abs((b.truthDelta ?? 0)) - Math.abs((a.truthDelta ?? 0)),
  );
  if (sorted.length && Math.abs(sorted[0].truthDelta ?? 0) > 0) {
    return sorted[0];
  }
  return playerCards[0];
};

const formatFactionLabel = (faction: string | undefined): string => {
  if (!faction) {
    return 'Unknown Faction';
  }
  const normalized = faction.toLowerCase();
  if (normalized === 'truth') {
    return 'Truth Network';
  }
  if (normalized === 'government') {
    return 'Government Machine';
  }
  return faction;
};

const mapCardToArticle = (
  entry: PlayedCardInput,
  story: CardStory,
  truthDelta: number | null,
  ipDelta: number | null,
  pressureDelta: number | null,
  targetName: string | null,
  capturedNames: string[],
): NarrativeArticle => {
  return {
    id: entry.card.id,
    cardId: entry.card.id,
    player: entry.player,
    headline: story.headline,
    deck: story.deck,
    paragraphs: story.paragraphs,
    tags: story.tags,
    artHint: story.artHint,
    debug: story.debug,
    typeLabel: `[${entry.card.type}]`,
    factionLabel: formatFactionLabel(entry.card.faction),
    truthDeltaLabel: formatTruthDeltaLabel(truthDelta),
    ipDeltaLabel: formatIpLabel(ipDelta),
    pressureDeltaLabel: formatPressureLabel(pressureDelta),
    stateLabel: targetName ? `Target: ${targetName}` : null,
    capturedStates: capturedNames,
  } satisfies NarrativeArticle;
};

const collectTags = (entry: PlayedCardInput, article: CardArticle | null): string[] => {
  const fromCard = Array.isArray((entry.card as { tags?: string[] }).tags)
    ? ((entry.card as { tags?: string[] }).tags as string[])
    : [];
  const fromArticle = Array.isArray(article?.tags) ? ((article?.tags as string[]) ?? []) : [];
  return [...fromCard, ...fromArticle].map(tag => tag.toLowerCase());
};

const determineTone = (entry: PlayedCardInput, article: CardArticle | null): ArticleTone => {
  if (article?.preferredTone) {
    return article.preferredTone;
  }

  const tags = collectTags(entry, article);
  if (tags.some(tag => tag.includes('classified') || tag.includes('redacted'))) {
    return 'CLASSIFIED_REDACTED';
  }

  const type = normalizeCardType(entry.card.type);
  const faction = resolveFaction(entry.card.faction);

  if (type === 'ATTACK') {
    return 'HARD_HITTING_EXPOSE';
  }
  if (type === 'ZONE') {
    return 'LOCAL_COLOR';
  }
  if (type === 'MEDIA') {
    return faction === 'government' ? 'STRAIGHT_NEWS' : 'TABLOID_SENSATIONAL';
  }

  return faction === 'government' ? 'STRAIGHT_NEWS' : 'TABLOID_SENSATIONAL';
};

const applyToneIfAvailable = (
  entry: PlayedCardInput,
  article: CardArticle | null,
): CardArticle | null => {
  if (!article) {
    return null;
  }
  const tone = determineTone(entry, article);
  return applyTone(article, tone);
};

const collectAds = (dataset: NewspaperData): string[] => {
  const pool = dataset.ads ?? [];
  if (!pool.length) {
    return FALLBACK_ADS;
  }
  const desired = pool.length < 3 ? pool.length : 3 + (Math.random() < 0.5 ? 0 : 1);
  return shuffle(pool).slice(0, desired);
};

const collectConspiracies = (dataset: NewspaperData): string[] => {
  const pool = dataset.conspiracyCorner ?? [];
  if (!pool.length) {
    return FALLBACK_CONSPIRACIES;
  }
  const shuffled = shuffle(pool);
  if (shuffled.length <= 4) {
    return shuffled;
  }
  const max = Math.min(shuffled.length, 6);
  const min = Math.min(shuffled.length, 4);
  const desired = min === max ? max : Math.floor(Math.random() * (max - min + 1)) + min;
  return shuffled.slice(0, desired);
};

const collectWeather = (dataset: NewspaperData): string => {
  const pool = dataset.weather ?? [];
  return pick(pool, FALLBACK_WEATHER);
};

const splitArticleBody = (body: CardArticle['body'] | undefined): string[] => {
  if (typeof body !== 'string') {
    return [];
  }

  return body
    .split(/\n+/)
    .map(paragraph => paragraph.trim())
    .filter(Boolean);
};

const buildGeneratedStoryArticle = (
  entry: PlayedCardInput,
  article: CardArticle | null,
  gameContext: GameStateContext,
): GeneratedStoryArticle => {
  const fallbackHeadline = `${entry.card.name.toUpperCase()} FILE UNDER INVESTIGATION`;
  const fallbackSubhead = 'Card record located without supporting copy — newsroom gremlins dispatched.';
  const fallbackBody = [
    `${entry.card.name} was played, but the archival article refused to print. Operators are reloading the matrix.`,
  ];

  const headline = article?.headline?.trim();
  const subhead = article?.subhead?.trim();
  const byline = article?.byline?.trim();
  const body = splitArticleBody(article?.body);
  const cardTags = Array.isArray((entry.card as { tags?: string[] }).tags)
    ? ((entry.card as { tags?: string[] }).tags as string[])
    : [];

  const resolveWithContext = (value: string): string => substituteArticleVariables(value, gameContext);

  const resolvedHeadline = resolveWithContext(
    headline && headline.length > 0 ? headline : fallbackHeadline,
  );
  const resolvedSubhead = resolveWithContext(subhead && subhead.length > 0 ? subhead : fallbackSubhead);
  const resolvedBody = (body.length ? body : fallbackBody).map(resolveWithContext);

  return {
    cardId: entry.card.id,
    cardName: entry.card.name,
    cardType: entry.card.type,
    player: entry.player,
    articleId: article?.id ?? null,
    headline: resolvedHeadline,
    subhead: resolvedSubhead,
    byline: byline && byline.length > 0 ? byline : FALLBACK_BYLINE,
    body: resolvedBody,
    tags: Array.isArray(article?.tags) ? article.tags : cardTags,
    imagePrompt: article?.imagePrompt ?? null,
    isFallback: !article,
  } satisfies GeneratedStoryArticle;
};

const clampPercentage = (value: number): number => {
  if (Number.isNaN(value)) {
    return 0;
  }
  if (value < 0) {
    return 0;
  }
  if (value > 100) {
    return 100;
  }
  return Math.round(value);
};

const deriveFactionFromCards = (cards: PlayedCardInput[]): 'truth' | 'government' => {
  const humanCard = cards.find(entry => entry.player === 'human');
  const faction = humanCard?.card?.faction;
  if (typeof faction === 'string' && faction.toLowerCase().includes('gov')) {
    return 'government';
  }
  return 'truth';
};

const buildGameStateContext = (
  input: IssueGeneratorInput,
  sanitizedCards: PlayedCardInput[],
  playerCards: PlayedCardInput[],
): GameStateContext => {
  const snapshot = input.gameState ?? {};
  const captured = Array.from(
    new Set(
      playerCards.flatMap(entry => resolveCapturedStateNames(entry.capturedStates)).filter(Boolean),
    ),
  );

  const statesControlled = typeof snapshot.statesControlled === 'number'
    ? snapshot.statesControlled
    : Array.isArray(snapshot.controlledStates)
      ? snapshot.controlledStates.length
      : 0;
  const totalStates = typeof snapshot.totalStates === 'number' && !Number.isNaN(snapshot.totalStates)
    ? snapshot.totalStates
    : 50;
  const truthValue = typeof snapshot.truthPercentage === 'number'
    ? snapshot.truthPercentage
    : typeof snapshot.truth === 'number'
      ? snapshot.truth
      : 0;
  const ipRemaining = typeof snapshot.ip === 'number' ? snapshot.ip : 0;
  const turnNumber = typeof snapshot.turn === 'number' ? snapshot.turn : 0;
  const playerFaction = snapshot.playerFaction ?? deriveFactionFromCards(playerCards.length ? playerCards : sanitizedCards);
  const cardsPlayedCount = typeof snapshot.cardsPlayedCount === 'number'
    ? snapshot.cardsPlayedCount
    : sanitizedCards.length;
  const currentScoreSource = typeof snapshot.currentScore === 'number'
    ? snapshot.currentScore
    : typeof snapshot.truth === 'number'
      ? snapshot.truth
      : truthValue;
  const currentScore = Number.isNaN(currentScoreSource)
    ? 0
    : Math.round(currentScoreSource);

  return {
    statesControlled: Math.max(0, statesControlled),
    totalStates: Math.max(1, totalStates),
    truthPercentage: clampPercentage(truthValue),
    ipRemaining: Math.max(0, Math.round(ipRemaining)),
    turnNumber: Math.max(0, Math.round(turnNumber)),
    capturedThisTurn: captured.length ? captured : ['no territories flipped'],
    playerFaction,
    cardsPlayedCount: Math.max(0, Math.round(cardsPlayedCount)),
    currentScore: Math.max(0, currentScore),
  } satisfies GameStateContext;
};

export async function generateIssue(input: IssueGeneratorInput): Promise<NarrativeIssue> {
  const lexicon = await loadCardLexicon();
  let articleBank: Awaited<ReturnType<typeof loadArticleBank>> | null = null;

  try {
    articleBank = await loadArticleBank();
  } catch (error) {
    console.error('Failed to load article bank for newspaper issue:', error);
    articleBank = null;
  }

  const sanitizedPlayedCards = sanitizePlayedCards(input.playedCards);

  const playerCards = sanitizedPlayedCards.filter(entry => entry.player === 'human');
  const opponentCards = sanitizedPlayedCards.filter(entry => entry.player === 'ai');

  const heroCard = chooseHeroCard(playerCards);

  type ArticleMeta = {
    entry: PlayedCardInput;
    article: NarrativeArticle;
    truthMagnitude: number;
    statusSignals: number;
    capturedCount: number;
    randomWeight: number;
  };

  const buildArticleMeta = (entry: PlayedCardInput): ArticleMeta => {
    const cardLexicon = lexicon[entry.card.id] ?? null;
    const targetName = resolveStateName(entry.targetState);
    const capturedNames = resolveCapturedStateNames(entry.capturedStates);
    const truth = entry.truthDelta ?? cardLexicon?.effects.truthDelta ?? null;
    const ip = cardLexicon?.effects.ipOpponent ?? null;
    const pressure = cardLexicon?.effects.pressureDelta ?? null;

    const story = composeCardStory({
      card: entry.card,
      lexicon: cardLexicon,
      player: entry.player,
      truthDelta: truth ?? undefined,
      ipDeltaOpponent: ip ?? undefined,
      pressureDelta: pressure ?? undefined,
      targetStateName: targetName ?? undefined,
      capturedStateNames: capturedNames,
      issueId: input.agendaIssueId,
    });
    const article = mapCardToArticle(entry, story, truth, ip, pressure, targetName, capturedNames);

    const truthMagnitude = typeof truth === 'number' && !Number.isNaN(truth) ? Math.abs(truth) : 0;
    const ipMagnitude = typeof ip === 'number' && !Number.isNaN(ip) ? Math.abs(ip) : 0;
    const pressureMagnitude = typeof pressure === 'number' && !Number.isNaN(pressure)
      ? Math.abs(pressure)
      : 0;
    const statusSignals =
      capturedNames.length +
      (targetName ? 1 : 0) +
      (ipMagnitude > 0 ? 1 : 0) +
      (pressureMagnitude > 0 ? 1 : 0);

    return {
      entry,
      article,
      truthMagnitude,
      statusSignals,
      capturedCount: capturedNames.length,
      randomWeight: Math.random(),
    } satisfies ArticleMeta;
  };

  const playerMetas = playerCards.map(buildArticleMeta);
  const oppositionMetas = opponentCards.map(buildArticleMeta);

  const playerArticles = playerMetas.map(meta => meta.article);
  const oppositionArticles = oppositionMetas.map(meta => meta.article);

  const heroMeta = heroCard
    ? playerMetas.find(meta => meta.entry.card.id === heroCard.card.id) ?? null
    : null;
  const heroArticle = heroMeta?.article ?? null;
  const heroCardId = heroMeta?.entry.card.id ?? null;
  const remainingPlayerArticles = heroArticle
    ? playerArticles.filter(article => article.cardId !== heroArticle.cardId)
    : playerArticles;

  const context = buildRoundContext(
    playerCards,
    opponentCards,
    input.eventsTruthDelta ?? 0,
    input.comboTruthDelta ?? 0,
  );

  const gameStateContext = buildGameStateContext(input, sanitizedPlayedCards, playerCards);

  const capturedStateNames = Array.from(
    new Set(playerCards.flatMap(entry => resolveCapturedStateNames(entry.capturedStates)).filter(Boolean)),
  );

  const breakingStamp = shouldStampBreaking(context)
    ? pickOrNull(input.dataset.stamps?.breaking)
    : null;

  const classifiedStamp = Math.random() < 0.3 ? pickOrNull(input.dataset.stamps?.classified) : null;

  const comboArticle = input.comboSummary ? composeComboStory(input.comboSummary) : null;

  const byline = pick(input.dataset.bylines, FALLBACK_BYLINE);
  const sourceLine = pick(input.dataset.sources, FALLBACK_SOURCE);

  const supplements = {
    ads: collectAds(input.dataset),
    conspiracies: collectConspiracies(input.dataset),
    weather: collectWeather(input.dataset),
  };

  const prioritizedMetas = [...playerMetas].sort((a, b) => {
    if (b.capturedCount !== a.capturedCount) {
      return b.capturedCount - a.capturedCount;
    }
    if (b.statusSignals !== a.statusSignals) {
      return b.statusSignals - a.statusSignals;
    }
    if (b.truthMagnitude !== a.truthMagnitude) {
      return b.truthMagnitude - a.truthMagnitude;
    }
    if (b.randomWeight !== a.randomWeight) {
      return b.randomWeight - a.randomWeight;
    }
    return 0;
  });

  const maxFrontPageArticles = heroCardId
    ? Math.min(3, Math.max(playerMetas.length - 1, 0))
    : Math.min(3, playerMetas.length);

  const frontPageSelection: ArticleMeta[] = [];

  for (const meta of prioritizedMetas) {
    if (heroCardId && meta.entry.card.id === heroCardId) {
      continue;
    }
    if (frontPageSelection.length >= maxFrontPageArticles) {
      break;
    }
    frontPageSelection.push(meta);
  }

  const selectedMetas = frontPageSelection;

  const selectedCards = selectedMetas.map(meta => meta.entry);
  const generatedArticles = selectedMetas.map(meta => {
    const entry = meta.entry;
    const rawArticle = articleBank?.getById?.(entry.card.id) ?? null;
    const tonedArticle = applyToneIfAvailable(entry, rawArticle);
    return buildGeneratedStoryArticle(entry, tonedArticle, gameStateContext);
  });

  const frontPageCards: PlayedCardMeta[] = selectedCards
    .map(entry => {
      const type = normalizeCardType(entry.card.type);
      if (!type) {
        return null;
      }
      return {
        id: entry.card.id,
        name: entry.card.name,
        type,
        faction: normalizeFaction(entry.card.faction),
      } satisfies PlayedCardMeta;
    })
    .filter((meta): meta is PlayedCardMeta => Boolean(meta));

  const mainStory: MainGeneratedStory | null = frontPageCards.length === 3
    ? generateMainStory(frontPageCards, id => articleBank?.getById?.(id) ?? null)
    : null;

  const articleBankReady = Boolean(articleBank?.hasArticles?.());
  const frontPageFaction = frontPageCards[0]?.faction === 'GOV' ? 'government' : 'truth';
  const truthDeltaLabel = formatTruthDeltaLabel(context.truthDeltaTotal);
  const comboOwnerLabel = input.comboSummary
    ? input.comboSummary.playerFaction === 'government'
      ? 'Directorate envoys'
      : 'Coalition operatives'
    : null;
  const fallbackSubhead = deriveFrontPageSubhead({
    datasetSubheads: input.dataset.subheads,
    fallback: FALLBACK_FRONT_PAGE_SUBHEAD,
    combo: comboArticle
      ? {
          deck: comboArticle.deck,
          tags: comboArticle.tags,
          magnitude: comboArticle.magnitude,
        }
      : null,
    comboOwnerLabel,
    capturedStates: capturedStateNames,
    truthDeltaLabel,
    agendaLabel: input.agendaIssueLabel ?? null,
    faction: frontPageFaction,
  });

  const generatedStory: FrontPagePackage = {
    cards: frontPageCards,
    main: mainStory,
    articles: generatedArticles,
    fallbackHeadline: FALLBACK_FRONT_PAGE_HEADLINE,
    fallbackSubhead,
    articleBankReady,
  } satisfies FrontPagePackage;

  return {
    hero: heroArticle ?? null,
    playerArticles: remainingPlayerArticles,
    oppositionArticles,
    comboArticle,
    byline,
    sourceLine,
    stamps: { breaking: breakingStamp, classified: classifiedStamp },
    supplements,
    generatedStory,
  } satisfies NarrativeIssue;
}
