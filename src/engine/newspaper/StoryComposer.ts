import type { Card } from '@/types';
import type { CardLexiconEntry } from './CardLexicon';
import {
  applyIssueSubheadOverlay,
  applyIssueVerbOverlay,
  getIssueHeroKicker,
  getIssueTags,
} from '@/data/agendaIssues';
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

const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const ensureConnectorSpacing = (value: string): string => {
  if (!value) {
    return value;
  }
  let result = value;
  for (const joiner of connectors.joiners) {
    const pattern = new RegExp(`\\s*${escapeRegExp(joiner)}`, 'gi');
    result = result.replace(pattern, match => {
      const trimmed = match.trim();
      return ` ${trimmed}`;
    });
  }
  return result.trim();
};

const normalizeBodySentence = (value: string): string => ensureSentence(ensureConnectorSpacing(value));

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

const selectRandomItems = <T,>(source: T[], count: number): T[] => {
  if (count <= 0 || source.length === 0) {
    return [];
  }
  const pool = [...source];
  const selected: T[] = [];
  while (pool.length && selected.length < count) {
    const index = Math.floor(Math.random() * pool.length);
    const [choice] = pool.splice(index, 1);
    if (choice !== undefined) {
      selected.push(choice);
    }
  }
  return selected;
};

const lowercaseFirst = (value: string): string => {
  if (!value) {
    return value;
  }
  return value.charAt(0).toLowerCase() + value.slice(1);
};

const fuseSentences = (base: string, extra: string): string => {
  if (!base) {
    return ensureSentence(extra);
  }
  if (!extra) {
    return ensureSentence(base);
  }
  const joiner = pick(connectors.joiners, connectors.joiners[0] ?? 'and');
  const baseTrimmed = base.replace(/\.+$/, '');
  const extraTrimmed = extra.trim().replace(/\.+$/, '');
  const fused = `${baseTrimmed} ${joiner} ${lowercaseFirst(extraTrimmed)}`;
  return ensureSentence(fused);
};

const gatherTagLines = (tags: string[], maxCount: number): string[] => {
  if (maxCount <= 0) {
    return [];
  }
  const seen = new Set<string>();
  const prioritized: string[] = [];
  for (const tag of tags) {
    const options = tagInserts[tag] ?? [];
    for (const option of options) {
      if (!seen.has(option)) {
        prioritized.push(option);
        seen.add(option);
      }
    }
  }
  const fallbackOptions = tagInserts.default ?? [];
  for (const option of fallbackOptions) {
    if (!seen.has(option)) {
      prioritized.push(option);
      seen.add(option);
    }
  }
  return selectRandomItems(prioritized, maxCount);
};

const collectEffectPhrases = (
  card: Card,
  truthDelta?: Maybe<number>,
  ipDeltaOpponent?: Maybe<number>,
  pressureDelta?: Maybe<number>,
): string[] => {
  const phrases: string[] = [];
  if (typeof truthDelta === 'number' && Number.isFinite(truthDelta)) {
    phrases.push(applyDeltaTemplate(pickDeltaTemplate(truthDelta, deltaPhrases.truth), truthDelta));
  }
  if (typeof ipDeltaOpponent === 'number' && Number.isFinite(ipDeltaOpponent)) {
    const template = pickDeltaTemplate(ipDeltaOpponent, deltaPhrases.ip);
    const label = card.faction === 'government' || card.faction === 'Government' ? 'toward containment ledgers' : 'toward the leak ledger';
    phrases.push(`${applyDeltaTemplate(template, ipDeltaOpponent)} ${label}`);
  }
  if (typeof pressureDelta === 'number' && Number.isFinite(pressureDelta)) {
    phrases.push(applyDeltaTemplate(pickDeltaTemplate(pressureDelta, deltaPhrases.pressure), pressureDelta));
  }
  if (!phrases.length) {
    const fallback = deltaPhrases.summary;
    phrases.push(pick(fallback, fallback[0] ?? 'Analysts report phantom metrics ricocheting through the dashboards.'));
  }
  return phrases;
};

const buildArtFallback = (card: Card, effects: { truth?: Maybe<number>; ip?: Maybe<number>; pressure?: Maybe<number> }): string => {
  const factionPalette =
    card.faction === 'truth' || card.faction === 'Truth'
      ? 'chaotic tabloid collage energy'
      : 'cold surveillance-room lighting';
  const toneDescription =
    card.type === 'ATTACK'
      ? 'caught mid-raid with motion blur typography'
      : card.type === 'MEDIA'
        ? 'broadcast monitors buzzing with glitch overlays'
        : card.type === 'ZONE'
          ? 'field maps strewn with string, flyers and coffee cups'
          : 'reinforced control center lined with emergency dossiers';
  const fragments: string[] = [];
  const truth = effects.truth;
  const ip = effects.ip;
  const pressure = effects.pressure;
  if (typeof truth === 'number' && Number.isFinite(truth) && truth !== 0) {
    fragments.push(`truth delta ${truth > 0 ? '+' : '−'}${Math.abs(truth)}`);
  }
  if (typeof ip === 'number' && Number.isFinite(ip) && ip !== 0) {
    fragments.push(`IP swing ${ip > 0 ? '+' : '−'}${Math.abs(ip)}`);
  }
  if (typeof pressure === 'number' && Number.isFinite(pressure) && pressure !== 0) {
    fragments.push(`pressure shift ${pressure > 0 ? '+' : '−'}${Math.abs(pressure)}`);
  }
  const effectLine = fragments.length
    ? `highlighted telemetry for ${fragments.join(', ')}`
    : 'subtle redacted numerology tucked into the margins';
  return `Illustrate "${card.name}" as a ${factionPalette} tableau ${toneDescription} with ${effectLine}.`;
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
  issueId?: string;
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
  const verbPoolBase = verbs.headline[toneKey] ?? verbs.headline.MEDIA;
  const verbPool = applyIssueVerbOverlay(verbPoolBase, input.issueId, toneKey);
  const verb = pick(verbPool, verbPool[0] ?? 'OVERRIDES PRIME TIME');
  const cardName = card.name.toUpperCase();
  const headline = toneKey === 'ATTACK'
    ? `${verb}: ${cardName}`
    : toneKey === 'MEDIA' || toneKey === 'ZONE'
      ? `${cardName} ${verb}`
      : `${verb}: ${cardName}`;

  const faction = (card.faction ?? 'truth').toString();
  const isTruthFaction = faction.toLowerCase().includes('truth');
  const baseFactionPool = isTruthFaction ? subheads.truth : subheads.government;
  const factionPool = applyIssueSubheadOverlay(
    baseFactionPool,
    input.issueId,
    isTruthFaction ? 'truth' : 'government',
  );

  const truth = input.truthDelta ?? lexicon?.effects.truthDelta ?? null;
  const ip = input.ipDeltaOpponent ?? lexicon?.effects.ipOpponent ?? null;
  const pressure = input.pressureDelta ?? lexicon?.effects.pressureDelta ?? null;
  const captured = input.capturedStateNames ?? [];

  const effectPhrases = collectEffectPhrases(card, truth, ip, pressure);
  const selectedEffects = selectRandomItems(effectPhrases, Math.min(2, Math.max(1, effectPhrases.length)));
  const deckParts: string[] = [
    ensureSentence(pick(factionPool, factionPool[0] ?? 'Sources insist it’s totally normal.')),
    ...selectedEffects.map(ensureSentence),
  ];
  const issueKicker = getIssueHeroKicker(input.issueId);
  if (issueKicker) {
    deckParts.unshift(ensureSentence(issueKicker));
  }
  const deckStateLine = buildTargetSentence(input.targetStateName, captured);
  if (deckStateLine) {
    deckParts.push(deckStateLine);
  }
  const deck = deckParts.join(' ').replace(/\s+/g, ' ').trim();

  const playerLabel = playerLabels[player] ?? 'Operative team';
  const launchVerbs = verbs.launch;
  const coda = pick(connectors.codas, connectors.codas[0] ?? 'before the dashboards sprout sparks.').replace(/\.+$/, '');
  const opener = ensureSentence(`${playerLabel} ${pick(launchVerbs, launchVerbs[0] ?? 'deploys')} ${card.name.toLowerCase()} ${coda}`);

  const bodySource = isTruthFaction ? bodyTruth : bodyGov;
  const toneBankKey = toneKey === 'ATTACK' || toneKey === 'MEDIA' || toneKey === 'ZONE' ? toneKey : 'NEUTRAL';
  const toneBank = (bodySource[toneBankKey] ?? bodySource.NEUTRAL) as string[];
  const neutralBank = bodySource.NEUTRAL;

  const baseSentenceCount = toneBank.length && Math.random() > 0.5 ? 4 : 3;
  const bodySentences: string[] = [];
  for (let index = 0; index < baseSentenceCount; index += 1) {
    const bank = index % 2 === 0 && toneBank.length ? toneBank : neutralBank;
    const choice = pick(bank, bank[0] ?? 'Sources refuse to cooperate with this paragraph.');
    bodySentences.push(normalizeBodySentence(choice));
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

  const factionValue = card.faction ? card.faction.toString().replace(/\s+/g, '') : '';
  const factionTag = factionValue
    ? `#Faction${factionValue.charAt(0).toUpperCase()}${factionValue.slice(1)}`
    : null;
  if (factionTag) {
    allowedTags.add(factionTag);
  }
  const typeTag = `#Type${card.type.charAt(0)}${card.type.slice(1).toLowerCase()}`;
  allowedTags.add(typeTag);
  const issueTags = getIssueTags(input.issueId);
  for (const tag of issueTags) {
    allowedTags.add(tag);
  }

  const gagLines = gatherTagLines(Array.from(allowedTags), 2);
  const bodyTargetSentence = card.type === 'ZONE' ? buildTargetSentence(input.targetStateName, captured) : null;
  const effectSentence = buildEffectSentence(card, truth, ip, pressure);
  const extras = [effectSentence, ...gagLines, bodyTargetSentence].filter((value): value is string => Boolean(value));

  for (let index = 0; index < extras.length && bodySentences.length; index += 1) {
    const slot = index % bodySentences.length;
    bodySentences[slot] = fuseSentences(bodySentences[slot], extras[index] ?? '');
  }

  const sentences: string[] = [opener, ...bodySentences];

  const tags = Array.from(allowedTags);
  if (!tags.length) {
    tags.push('#ParanoidPress');
  }

  const artHint = lexicon?.artHint ?? buildArtFallback(card, { truth, ip, pressure });

  return {
    headline,
    deck,
    paragraphs: chunkSentences(sentences.map(ensureSentence)),
    tags,
    artHint,
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

const formatList = (items: string[]): string => {
  if (!items.length) {
    return '';
  }
  if (items.length === 1) {
    return items[0] ?? '';
  }
  const start = items.slice(0, -1).join(', ');
  const end = items[items.length - 1] ?? '';
  return `${start} og ${end}`;
};

export function composeComboStory(summary: ComboSummary): ComboStory {
  const magnitude = summary.results.length;
  const topCombo = summary.results[0]?.definition;
  const reward = summary.totalReward;
  const truthDefined = typeof reward.truth === 'number' && Number.isFinite(reward.truth);
  const ipDefined = typeof reward.ip === 'number' && Number.isFinite(reward.ip);
  const truthTotal = truthDefined ? (reward.truth as number) : 0;
  const ipTotal = ipDefined ? (reward.ip as number) : 0;
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

  const headlineLabel = topCombo?.name ? topCombo.name.toUpperCase() : 'SYSTEM LINK';
  const headline = `COMBO: ${headlineLabel} UNFOLDS LIVE`;

  const rewardSegments: string[] = [];
  if (truthDefined) {
    rewardSegments.push(applyDeltaTemplate(pickDeltaTemplate(truthTotal, deltaPhrases.truth), truthTotal));
  }
  if (ipDefined) {
    rewardSegments.push(applyDeltaTemplate(pickDeltaTemplate(ipTotal, deltaPhrases.ip), ipTotal));
  }
  const magnitudeFragment = `Magnitude ${magnitude} registrert på konsoll`;
  const deckLead = rewardSegments.length
    ? rewardSegments.join(' & ')
    : pick(deltaPhrases.summary, deltaPhrases.summary[0] ?? 'Analysts report phantom metrics ricocheting through the dashboards.');
  const deck = ensureSentence(`${deckLead}${deckLead ? '; ' : ''}${magnitudeFragment}`);

  const sentences: string[] = [];
  const comboNames = summary.results.map(result => result.definition.name);
  const comboLead = comboNames.length
    ? `${formatList(comboNames.map(name => name ?? 'Uten navn'))}`
    : 'ukjente protokoller';
  sentences.push(
    `Magnitude ${magnitude} kjede tennes på tur ${summary.turn} idet ${comboLead} låser seg sammen.`,
  );

  const playsByType: Record<'ATTACK' | 'MEDIA' | 'ZONE', string[]> = {
    ATTACK: [],
    MEDIA: [],
    ZONE: [],
  };
  const targetStates = new Set<string>();

  for (const result of summary.results) {
    for (const play of result.details.matchedPlays) {
      if (play.cardType === 'ATTACK' || play.cardType === 'MEDIA' || play.cardType === 'ZONE') {
        if (play.cardName) {
          if (!playsByType[play.cardType].includes(play.cardName)) {
            playsByType[play.cardType].push(play.cardName);
          }
        }
      }
      if (play.targetStateId) {
        targetStates.add(play.targetStateId);
      }
    }
  }

  const attackSentence = playsByType.ATTACK.length
    ? `ATTACK-kortene ${formatList(playsByType.ATTACK)} driver lekkasje og avsløring gjennom hver lenke.`
    : 'Ingen ATTACK-kort er i spill, så lekkasjeplanen må improviseres i bakrommet.';
  sentences.push(attackSentence);

  const mediaSentence = playsByType.MEDIA.length
    ? `MEDIA-kortene ${formatList(playsByType.MEDIA)} pumper viralitet til konsollen.`
    : 'MEDIA-kanalene forblir dempet, og viraliteten må lånes fra ryktebørsen.';
  sentences.push(mediaSentence);

  const zoneTargets = Array.from(targetStates).slice(0, 3);
  const zoneTargetText = zoneTargets.length
    ? `mot målstat${zoneTargets.length > 1 ? 'er' : 'en'} ${formatList(zoneTargets)}`
    : 'over en tilslørt målstat';
  const zoneSentence = playsByType.ZONE.length
    ? `ZONE-kortene ${formatList(playsByType.ZONE)} sender feltbølgen ${zoneTargetText}.`
    : `Feltbølgen holder pusten ${zoneTargetText}.`;
  sentences.push(zoneSentence);

  const rewardWrap = rewardSegments.length
    ? `Konsollens logg noterer ${rewardSegments.join(' og ')}.`
    : 'Konsollens logg noterer at belønningene foreløpig er uplottet.';
  sentences.push(rewardWrap);

  if (sentences.length > 5) {
    sentences.splice(5);
  }

  const tags = ['#ComboWatch', `#Turn${summary.turn}`, '#NarrativeCascade'];
  const categoryTags = new Set<string>();
  for (const result of summary.results) {
    categoryTags.add(`#ComboCat${result.definition.category.charAt(0).toUpperCase()}${result.definition.category.slice(1)}`);
  }
  const typeTags = new Set<string>();
  (['ATTACK', 'MEDIA', 'ZONE'] as const).forEach(type => {
    if (playsByType[type].length) {
      typeTags.add(`#Type${type.charAt(0)}${type.slice(1).toLowerCase()}`);
    }
  });
  const uniqueTags = Array.from(new Set([...tags, ...categoryTags, ...typeTags, `#Magnitude${magnitude}`]));

  const summaryParts = summary.results.map(result => {
    const matchedNames = result.details.matchedPlays
      .map(play => (play.cardName ? `${play.cardName} (${play.cardType})` : null))
      .filter((value): value is string => Boolean(value));
    const cardsText = matchedNames.length ? formatList(matchedNames) : 'ukjente kort';
    return `${result.definition.name} (${result.definition.category}) via ${cardsText}`;
  });
  const summaryLine = summaryParts.length
    ? `Magnitude ${magnitude}: ${summaryParts.join(' • ')}`
    : `Magnitude ${magnitude}: Ingen kort registrert.`;

  return {
    headline,
    deck,
    paragraphs: chunkSentences(sentences.map(ensureSentence)),
    tags: uniqueTags,
    magnitude,
    summary: summaryLine,
  } satisfies ComboStory;
}
