import type { Card } from '@/types';
import type { CardLexiconEntry } from './CardLexicon';
import {
  HEADLINE_VERBS,
  PLAYER_LABELS,
  STORY_BANKS,
  SUBHEAD_BANKS,
  TAG_INJECTIONS,
  VERB_TABLES,
} from './StoryBanks';
import type { ComboSummary } from '@/game/combo.types';

type Maybe<T> = T | null | undefined;

const pick = <T,>(arr: T[], fallback: T): T => {
  if (!arr.length) {
    return fallback;
  }
  const index = Math.floor(Math.random() * arr.length);
  return arr[index] ?? fallback;
};

const formatSigned = (value: number, suffix: string, positiveSuffix = suffix): string => {
  if (value === 0) {
    return `±0 ${suffix}`;
  }
  const sign = value > 0 ? '+' : '−';
  const magnitude = Math.abs(value);
  const label = value > 0 ? positiveSuffix : suffix;
  return `${sign}${magnitude} ${label}`;
};

const chunkSentences = (sentences: string[]): string[] => {
  const paragraphs: string[] = [];
  for (let i = 0; i < sentences.length; i += 2) {
    const slice = sentences.slice(i, i + 2);
    paragraphs.push(slice.join(' '));
  }
  return paragraphs;
};

const ensureSentence = (value: string): string => {
  if (!value) {
    return value;
  }
  const trimmed = value.trim();
  if (!trimmed.endsWith('.')) {
    return `${trimmed}.`;
  }
  return trimmed;
};

const buildEffectSentence = (
  card: Card,
  truthDelta?: Maybe<number>,
  ipDeltaOpponent?: Maybe<number>,
  pressureDelta?: Maybe<number>,
): string => {
  const pieces: string[] = [];
  if (typeof truthDelta === 'number' && !Number.isNaN(truthDelta) && truthDelta !== 0) {
    pieces.push(formatSigned(truthDelta, 'Truth', 'Truth'));
  }
  if (typeof ipDeltaOpponent === 'number' && !Number.isNaN(ipDeltaOpponent) && ipDeltaOpponent !== 0) {
    const label = card.faction === 'government' || card.faction === 'Government' ? 'IP reclaimed' : 'IP drained';
    pieces.push(formatSigned(ipDeltaOpponent, 'IP', label));
  }
  if (typeof pressureDelta === 'number' && !Number.isNaN(pressureDelta) && pressureDelta !== 0) {
    pieces.push(formatSigned(pressureDelta, 'Pressure'));
  }

  if (!pieces.length) {
    return 'Analysts report phantom metrics ricocheting through the dashboards.';
  }

  return `Analysts log ${pieces.join(', ')} before the graphs burst into flame.`;
};

const buildTargetSentence = (
  targetStateName?: Maybe<string>,
  capturedStates?: string[],
): string | null => {
  const captures = (capturedStates ?? []).filter(Boolean);
  if (captures.length) {
    if (captures.length === 1) {
      return `Cartographers redraw the district map as ${captures[0]} flips overnight.`;
    }
    return `Cartographers scramble as ${captures.slice(0, -1).join(', ')} and ${captures[captures.length - 1]} all flip in unison.`;
  }
  if (targetStateName) {
    return `Local dispatch from ${targetStateName} reports sonic clipboards at every corner.`;
  }
  return null;
};

const buildTagSentence = (tags: string[]): string => {
  for (const tag of tags) {
    const options = TAG_INJECTIONS[tag];
    if (options && options.length) {
      return pick(options, options[0]);
    }
  }
  const fallback = TAG_INJECTIONS.default ?? [];
  return pick(fallback, fallback[0] ?? 'Atmospheric sensors detect elevated levels of dramatic irony.');
};

const normalizeCount = (value: Maybe<number>, fallback: number): number => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  return fallback;
};

export interface CardStoryInput {
  card: Card;
  lexicon: CardLexiconEntry | null;
  player: 'human' | 'ai';
  truthDelta?: Maybe<number>;
  ipDeltaOpponent?: Maybe<number>;
  pressureDelta?: Maybe<number>;
  targetStateName?: Maybe<string>;
  capturedStateNames?: string[];
}

export interface CardStory {
  headline: string;
  deck: string;
  paragraphs: string[];
  tags: string[];
  artHint: string;
}

export function composeCardStory(input: CardStoryInput): CardStory {
  const { card, lexicon, player } = input;
  const toneKey = card.type ?? 'MEDIA';
  const verbPool = HEADLINE_VERBS[toneKey] ?? HEADLINE_VERBS.MEDIA;
  const headline = `${card.name.toUpperCase()} ${pick(verbPool, verbPool[0])}!`;

  const faction = (card.faction ?? 'truth').toString();
  const factionPool = SUBHEAD_BANKS.faction[faction.toLowerCase()] ?? [];
  const typePool = SUBHEAD_BANKS.type[toneKey] ?? [];
  const deckCandidates = [...factionPool, ...typePool, ...SUBHEAD_BANKS.generic];
  const deck = pick(deckCandidates, deckCandidates[0] ?? 'Officials refuse to elaborate.');

  const truth = input.truthDelta ?? lexicon?.effects.truthDelta ?? null;
  const ip = input.ipDeltaOpponent ?? lexicon?.effects.ipOpponent ?? null;
  const pressure = input.pressureDelta ?? lexicon?.effects.pressureDelta ?? null;
  const captured = input.capturedStateNames ?? [];

  const effectSentence = buildEffectSentence(card, truth, ip, pressure);
  const targetSentence = buildTargetSentence(input.targetStateName, captured);

  const playerLabel = PLAYER_LABELS[player] ?? 'Operative team';
  const launchVerbs = VERB_TABLES.launch;
  const opener = `${playerLabel} ${pick(launchVerbs, launchVerbs[0])} ${card.name.toLowerCase()} straight into the narrative jetstream.`;

  const toneBank = STORY_BANKS[toneKey] ?? STORY_BANKS.NEUTRAL;
  const neutralBank = STORY_BANKS.NEUTRAL;

  const desiredSentenceCount = normalizeCount(Math.floor(Math.random() * 3) + 4, 4);
  const sentences: string[] = [ensureSentence(opener), ensureSentence(effectSentence)];
  if (targetSentence) {
    sentences.push(ensureSentence(targetSentence));
  }

  const allowedTags = new Set<string>();
  if (lexicon) {
    for (const tag of lexicon.gagTags) {
      allowedTags.add(tag);
    }
    for (const tag of lexicon.baseTags) {
      allowedTags.add(tag);
    }
  }

  while (sentences.length < desiredSentenceCount - 1) {
    const bank = sentences.length % 2 === 0 ? toneBank : neutralBank;
    const chosen = pick(bank, bank[0] ?? 'Sources refuse to cooperate with this paragraph.');
    sentences.push(chosen);
  }

  const tagSentence = buildTagSentence(Array.from(allowedTags));
  sentences.push(ensureSentence(tagSentence));

  if (sentences.length < desiredSentenceCount) {
    const padding = pick(neutralBank, neutralBank[0] ?? 'Editors refill emergency ink reserves.');
    sentences.push(ensureSentence(padding));
  }

  const tags = Array.from(allowedTags);
  if (!tags.length) {
    tags.push('#ParanoidPress');
  }

  return {
    headline,
    deck,
    paragraphs: chunkSentences(sentences),
    tags,
    artHint: lexicon?.artHint ?? `Illustrate ${card.name} with improvised paranoia.`,
  } satisfies CardStory;
}

export interface ComboStory {
  headline: string;
  deck: string;
  paragraphs: string[];
  tags: string[];
  magnitude: number;
  summary: string;
}

const formatComboReward = (value: number | undefined, label: string): string | null => {
  if (!value || Number.isNaN(value)) {
    return null;
  }
  return `${value > 0 ? '+' : '−'}${Math.abs(value)} ${label}`;
};

export function composeComboStory(summary: ComboSummary): ComboStory {
  const magnitude = summary.results.length;
  const topCombo = summary.results[0]?.definition;
  const reward = summary.totalReward;
  const truthLabel = formatComboReward(reward.truth, 'Truth');
  const ipLabel = formatComboReward(reward.ip, 'IP');
  const logs = summary.logs ?? [];
  const hasResults = magnitude > 0;

  if (!hasResults) {
    const headline = 'COMBO ENGINE STAYS ON STANDBY.';
    const latestLog = logs[logs.length - 1];
    const deck = latestLog
      ? `Ops flag a dry spell while the console mutters: "${latestLog}"`
      : 'Ops confirm the combo grid stays dark despite frantic button mashing.';
    const sentences: string[] = [
      `Combo console monitors turn ${summary.turn} but no definitions fire.`,
      'Technicians recalibrate sensors and blame countermeasures for the silence.',
    ];
    if (logs.length) {
      sentences.push(`Latest log entry archived for audit: "${latestLog}".`);
    }

    const summaryLine = logs.length ? logs.slice(-3).join(' • ') : 'No combos registered.';

    return {
      headline,
      deck: ensureSentence(deck),
      paragraphs: chunkSentences(sentences.map(ensureSentence)),
      tags: ['#ComboWatch', `#Turn${summary.turn}`, '#DryRun'],
      magnitude: 0,
      summary: summaryLine,
    } satisfies ComboStory;
  }

  const headVerb = magnitude > 1 ? 'CHAIN DETONATES' : 'COMBO TRIGGERS';
  const headline = topCombo
    ? `${topCombo.name.toUpperCase()} ${headVerb}!`
    : `COMBO ENGINE ${headVerb}!`;

  const rewardLine = [truthLabel, ipLabel].filter(Boolean).join(', ');
  const deck = rewardLine ? `Rewards ripple across the board (${rewardLine}).` : 'Combo meter spikes off the chart.';

  const sentences: string[] = [];
  sentences.push(
    `Combo console lights up as ${summary.results.length} definition${summary.results.length === 1 ? '' : 's'} chain together on turn ${summary.turn}.`,
  );

  for (const result of summary.results.slice(0, 3)) {
    const plays = result.details.matchedPlays.map(play => play.cardName).filter(Boolean);
    const playList = plays.length ? `${plays.slice(0, 3).join(', ')}${plays.length > 3 ? '…' : ''}` : 'classified maneuvers';
    const comboLine = `${result.definition.name} escalates via ${playList}.`;
    sentences.push(comboLine);
  }

  if (summary.results.length > 3) {
    sentences.push('Additional combo logs remain under review pending clearance.');
  }

  const tags = ['#ComboWatch', `#Turn${summary.turn}`, '#NarrativeCascade'];
  const summaryLine = summary.results
    .map(result => `${result.definition.name} (${result.definition.category})`)
    .join(' • ');

  return {
    headline,
    deck,
    paragraphs: chunkSentences(sentences.map(ensureSentence)),
    tags,
    magnitude,
    summary: summaryLine,
  } satisfies ComboStory;
}
