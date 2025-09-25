import { getStateByAbbreviation, getStateById } from '@/data/usaStates';
import type { NewspaperData } from '@/lib/newspaperData';
import type { Card } from '@/types';
import { loadCardLexicon } from './CardLexicon';
import { composeCardStory, composeComboStory, type CardStory, type ComboStory } from './StoryComposer';
import type { ComboSummary } from '@/game/combo.types';

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

export interface NarrativeIssue {
  hero: NarrativeArticle | null;
  playerArticles: NarrativeArticle[];
  oppositionArticles: NarrativeArticle[];
  comboArticle: ComboStory | null;
  byline: string;
  sourceLine: string;
  stamps: { breaking: string | null; classified: string | null };
  supplements: { ads: string[]; conspiracies: string[]; weather: string };
}

export interface NarrativeContext {
  truthDeltaTotal: number;
  capturedStates: string[];
  cardsPlayedByYou: Card[];
  cardsPlayedByOpp: Card[];
}

export interface IssueGeneratorInput {
  dataset: NewspaperData;
  playedCards: PlayedCardInput[];
  eventsTruthDelta?: number;
  comboTruthDelta?: number;
  comboSummary?: ComboSummary | null;
}

const FALLBACK_ADS = ['All advertising temporarily redacted.'];
const FALLBACK_CONSPIRACIES = ['Rumors temporarily sealed in bunker storage.'];
const FALLBACK_WEATHER = 'Forecast withheld pending clearance.';
const FALLBACK_BYLINE = 'By: Anonymous Insider';
const FALLBACK_SOURCE = 'Source: Redacted Dossier';

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
    typeLabel: `[${entry.card.type}]`,
    factionLabel: formatFactionLabel(entry.card.faction),
    truthDeltaLabel: formatTruthDeltaLabel(truthDelta),
    ipDeltaLabel: formatIpLabel(ipDelta),
    pressureDeltaLabel: formatPressureLabel(pressureDelta),
    stateLabel: targetName ? `Target: ${targetName}` : null,
    capturedStates: capturedNames,
  } satisfies NarrativeArticle;
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

export async function generateIssue(input: IssueGeneratorInput): Promise<NarrativeIssue> {
  const lexicon = await loadCardLexicon();
  const playerCards = input.playedCards.filter(entry => entry.player === 'human');
  const opponentCards = input.playedCards.filter(entry => entry.player === 'ai');

  const heroCard = chooseHeroCard(playerCards);

  const mapEntry = (entry: PlayedCardInput): NarrativeArticle => {
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
    });

    return mapCardToArticle(entry, story, truth, ip, pressure, targetName, capturedNames);
  };

  const playerArticles = playerCards.map(mapEntry);
  const oppositionArticles = opponentCards.map(mapEntry);

  const heroArticle = heroCard ? playerArticles.find(article => article.cardId === heroCard.card.id) ?? null : null;
  const remainingPlayerArticles = heroArticle
    ? playerArticles.filter(article => article.cardId !== heroArticle.cardId)
    : playerArticles;

  const context = buildRoundContext(
    playerCards,
    opponentCards,
    input.eventsTruthDelta ?? 0,
    input.comboTruthDelta ?? 0,
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

  return {
    hero: heroArticle ?? null,
    playerArticles: remainingPlayerArticles,
    oppositionArticles,
    comboArticle,
    byline,
    sourceLine,
    stamps: { breaking: breakingStamp, classified: classifiedStamp },
    supplements,
  } satisfies NarrativeIssue;
}
