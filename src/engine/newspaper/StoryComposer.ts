import type { Card } from '@/types';
import type { CardLexiconEntry } from './CardLexicon';
import {
  bodyGov,
  bodyTruth,
  connectors,
  deltaPhrases,
  playerLabels,
  statePhrases,
  subheads,
  tagInserts,
  verbs,
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

const pickDeltaTemplate = (
  value: number,
  bank: Record<'positive' | 'negative' | 'neutral', string[]>,
): string => {
  const bucket = value > 0 ? 'positive' : value < 0 ? 'negative' : 'neutral';
  const pool = bank[bucket] ?? bank.neutral;
  return pick(pool, pool[0] ?? 'Metrics refuse to clarify their feelings');
};

const applyDeltaTemplate = (template: string, value: number): string => {
  const abs = Math.abs(value);
  const signed = value === 0 ? '±0' : `${value > 0 ? '+' : '−'}${abs}`;
  return template.replaceAll('{value}', signed).replaceAll('{abs}', abs.toString());
};

const buildEffectSentence = (
  card: Card,
  truthDelta?: Maybe<number>,
  ipDeltaOpponent?: Maybe<number>,
  pressureDelta?: Maybe<number>,
): string => {
  const segments: string[] = [];
  if (typeof truthDelta === 'number' && Number.isFinite(truthDelta)) {
    const template = pickDeltaTemplate(truthDelta, deltaPhrases.truth);
    segments.push(applyDeltaTemplate(template, truthDelta));
  }
  if (typeof ipDeltaOpponent === 'number' && Number.isFinite(ipDeltaOpponent)) {
    const template = pickDeltaTemplate(ipDeltaOpponent, deltaPhrases.ip);
    const label = card.faction === 'government' || card.faction === 'Government' ? 'IP recovery' : 'IP drain';
    segments.push(`${applyDeltaTemplate(template, ipDeltaOpponent)} signaling ${label}`);
  }
  if (typeof pressureDelta === 'number' && Number.isFinite(pressureDelta)) {
    const template = pickDeltaTemplate(pressureDelta, deltaPhrases.pressure);
    segments.push(applyDeltaTemplate(template, pressureDelta));
  }

  if (!segments.length) {
    const fallback = deltaPhrases.summary;
    return pick(fallback, fallback[0] ?? 'Analysts report phantom metrics ricocheting through the dashboards.');
  }

  const lead = pick(connectors.leadIns, connectors.leadIns[0] ?? 'Analysts log');
  const coda = pick(connectors.codas, connectors.codas[0] ?? 'before the graphs burst into flame.');
  let sentence = `${lead} ${segments[0]}`;
  for (let index = 1; index < segments.length; index += 1) {
    const join = pick(connectors.joiners, connectors.joiners[0] ?? 'and');
    sentence = `${sentence} ${join} ${segments[index]}`;
  }
  return ensureSentence(`${sentence} ${coda}`);
};

const buildTargetSentence = (
  targetStateName?: Maybe<string>,
  capturedStates?: string[],
): string | null => {
  const captures = (capturedStates ?? []).filter(Boolean);
  if (captures.length) {
    if (captures.length === 1) {
      const template = pick(statePhrases.capturedSingle, statePhrases.capturedSingle[0] ?? '{state} flips loudly.');
      return ensureSentence(template.replaceAll('{state}', captures[0] ?? 'the state'));
    }
    const list = captures.length === 2
      ? `${captures[0]} and ${captures[1]}`
      : `${captures.slice(0, -1).join(', ')} and ${captures[captures.length - 1]}`;
    const template = pick(
      statePhrases.capturedMultiple,
      statePhrases.capturedMultiple[0] ?? 'Cartographers scramble as {list} all flip in unison.',
    );
    return ensureSentence(template.replaceAll('{list}', list));
  }
  if (targetStateName) {
    const template = pick(statePhrases.target, statePhrases.target[0] ?? 'Dispatch from {state} reports unusual commotion.');
    return ensureSentence(template.replaceAll('{state}', targetStateName));
  }
  return null;
};

const buildTagSentence = (tags: string[]): string => {
  for (const tag of tags) {
    const options = tagInserts[tag];
    if (options && options.length) {
      return pick(options, options[0]);
    }
  }
  const fallback = tagInserts.default ?? [];
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
  const toneKey = (card.type === 'ATTACK' || card.type === 'MEDIA' || card.type === 'ZONE' || card.type === 'DEFENSIVE'
    ? card.type
    : 'MEDIA') as Card['type'];
  const verbPool = verbs.headline[toneKey] ?? verbs.headline.MEDIA;
  const headline = `${card.name.toUpperCase()} ${pick(verbPool, verbPool[0])}!`;

  const faction = (card.faction ?? 'truth').toString();
  const factionPool = subheads.truth && faction.toLowerCase().includes('truth')
    ? subheads.truth
    : subheads.government;
  const typePool = toneKey === 'ATTACK' || toneKey === 'MEDIA' || toneKey === 'ZONE'
    ? subheads.type[toneKey]
    : [];
  const deckCandidates = [...factionPool, ...typePool, ...subheads.generic];
  const deck = pick(deckCandidates, deckCandidates[0] ?? 'Officials refuse to elaborate.');

  const truth = input.truthDelta ?? lexicon?.effects.truthDelta ?? null;
  const ip = input.ipDeltaOpponent ?? lexicon?.effects.ipOpponent ?? null;
  const pressure = input.pressureDelta ?? lexicon?.effects.pressureDelta ?? null;
  const captured = input.capturedStateNames ?? [];

  const effectSentence = buildEffectSentence(card, truth, ip, pressure);
  const targetSentence = buildTargetSentence(input.targetStateName, captured);

  const playerLabel = playerLabels[player] ?? 'Operative team';
  const launchVerbs = verbs.launch;
  const opener = `${playerLabel} ${pick(launchVerbs, launchVerbs[0])} ${card.name.toLowerCase()} straight into the narrative jetstream.`;

  const truthFaction = faction.toLowerCase().includes('truth');
  const bodySource = truthFaction ? bodyTruth : bodyGov;
  const toneBankKey = toneKey === 'ATTACK' || toneKey === 'MEDIA' || toneKey === 'ZONE' ? toneKey : 'NEUTRAL';
  const toneBank = bodySource[toneBankKey] ?? bodySource.NEUTRAL;
  const neutralBank = bodySource.NEUTRAL;

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
