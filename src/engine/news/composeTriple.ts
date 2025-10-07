import type { ArticleBlock as ExtraArticleBlock } from '@/news/headlineEngine';

import {
  getComboBankIfReady,
  getTripleBankIfReady,
  type ComboRule,
  type TripleTemplateBank,
  type TripleTemplateRule,
} from './newsPools';

export interface NewsCardLite {
  id: string;
  name: string;
  faction: 'truth' | 'government';
  type: 'MEDIA' | 'ATTACK' | 'ZONE' | string;
  tags: string[];
}

interface ComposeContext {
  played: NewsCardLite[];
  opponent: NewsCardLite[];
  bank: TripleTemplateBank;
  rng: () => number;
  mix: 'truth' | 'government' | 'mixed';
}

interface PlaceholderContext {
  names: string[];
  types: string[];
  thirdType: string;
  bank: TripleTemplateBank;
  rng: () => number;
}

const MAX_NAME_LENGTH = 40;

const shortenName = (name: string): string => {
  const trimmed = name.trim();
  if (trimmed.length <= MAX_NAME_LENGTH) {
    return trimmed;
  }
  return `${trimmed.slice(0, MAX_NAME_LENGTH - 1).trimEnd()}…`;
};

const hashSeed = (input: string): number => {
  let h = 1779033703 ^ input.length;
  for (let i = 0; i < input.length; i += 1) {
    h = Math.imul(h ^ input.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  h ^= h >>> 16;
  return h >>> 0;
};

const mulberry32 = (seed: number): (() => number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const pick = <T,>(pool: readonly T[], rng: () => number, fallback: T): T => {
  if (!pool.length) {
    return fallback;
  }
  const index = Math.floor(rng() * pool.length) % pool.length;
  return pool[index] ?? fallback;
};

const cleanLines = (lines: string[]): string[] => {
  const seen = new Set<string>();
  const results: string[] = [];
  for (const raw of lines) {
    if (typeof raw !== 'string') {
      continue;
    }
    const value = raw.replace(/\s+/g, ' ').trim();
    if (!value || seen.has(value)) {
      continue;
    }
    seen.add(value);
    results.push(value);
  }
  return results;
};

const determineMix = (played: NewsCardLite[]): 'truth' | 'government' | 'mixed' => {
  const truthOnly = played.every(card => card.faction === 'truth');
  const governmentOnly = played.every(card => card.faction === 'government');
  if (truthOnly) {
    return 'truth';
  }
  if (governmentOnly) {
    return 'government';
  }
  return 'mixed';
};

const determineTone = (
  hint: 'truth' | 'government' | 'mixed' | undefined,
  mix: 'truth' | 'government' | 'mixed',
): ExtraArticleBlock['tone'] => {
  if (hint === 'truth') {
    return 'truth';
  }
  if (hint === 'government') {
    return 'government';
  }
  if (hint === 'mixed') {
    return 'draw';
  }
  if (mix === 'truth') {
    return 'truth';
  }
  if (mix === 'government') {
    return 'government';
  }
  return 'draw';
};

const dominantTypeLabel = (types: string[]): string => {
  if (!types.length) {
    return 'MEDIA';
  }
  const counts = new Map<string, number>();
  for (const type of types) {
    counts.set(type, (counts.get(type) ?? 0) + 1);
  }
  const [type] = Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0] ?? [];
  return type ?? types[0] ?? 'MEDIA';
};

const buildPlaceholderContext = (
  played: NewsCardLite[],
  bank: TripleTemplateBank,
  rng: () => number,
): PlaceholderContext => {
  const names = played.map(card => shortenName(card.name));
  const types = played.map(card => card.type);
  const typeCounts = new Map<string, number>();
  for (const type of types) {
    typeCounts.set(type, (typeCounts.get(type) ?? 0) + 1);
  }
  const rankedTypes = Array.from(typeCounts.entries()).sort((a, b) => b[1] - a[1]);
  const dominantType = rankedTypes[0]?.[0] ?? (types[0] ?? 'MEDIA');
  const thirdType = types[2] ?? dominantType;

  return {
    names,
    types,
    thirdType,
    bank,
    rng,
  } satisfies PlaceholderContext;
};

const applyPlaceholders = (value: string, context: PlaceholderContext): string => {
  if (!value) {
    return '';
  }
  const { names, types, thirdType, bank, rng } = context;
  const lexicon = bank.lexicon ?? {};
  const fallbackLexiconEntry = (key: string): string => {
    const pool = lexicon[key];
    if (!Array.isArray(pool) || pool.length === 0) {
      return key;
    }
    return pick(pool, rng, pool[0] ?? key);
  };

  return value.replace(/\{([A-Za-z0-9_]+)\}/g, (match, rawKey) => {
    const key = String(rawKey ?? '').trim();
    if (!key) {
      return match;
    }
    if (key === 'N1') {
      return names[0] ?? '';
    }
    if (key === 'N2') {
      return names[1] ?? names[0] ?? '';
    }
    if (key === 'N3') {
      return names[2] ?? names[1] ?? names[0] ?? '';
    }
    if (key === 'T1') {
      return types[0] ?? dominantTypeLabel(types);
    }
    if (key === 'T2') {
      return types[1] ?? dominantTypeLabel(types);
    }
    if (key === 'T3') {
      return thirdType ?? dominantTypeLabel(types);
    }
    if (key === 'style') {
      return bank.defaults.imageStyle;
    }
    const lower = key.toLowerCase();
    if (lower in lexicon) {
      return fallbackLexiconEntry(lower);
    }
    return match;
  });
};

const renderFormat = (format: string, replacements: Record<string, string>): string => {
  const substituted = format.replace(/\{([A-Z]+)\}/g, (match, rawKey) => {
    const key = String(rawKey ?? '').trim();
    if (!key) {
      return '';
    }
    return replacements[key] ?? '';
  });
  return substituted
    .replace(/\s+—\s*$/u, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+—\s+/g, ' — ')
    .trim();
};

const limitBody = (lines: string[], max: number): string[] => lines.slice(0, Math.max(1, max));

const collectMatchCount = (cards: NewsCardLite[], ids: Set<string>, tags: Set<string>): number => {
  if (!ids.size && !tags.size) {
    return 0;
  }
  const matched = new Set<string>();
  for (const card of cards) {
    if (ids.has(card.id)) {
      matched.add(card.id);
      continue;
    }
    for (const tag of card.tags) {
      if (tags.has(tag)) {
        matched.add(card.id);
        break;
      }
    }
  }
  return matched.size;
};

const matchComboRule = (
  rule: ComboRule,
  played: NewsCardLite[],
  opponent: NewsCardLite[],
): boolean => {
  const minCards = rule.when.minCards ?? 2;
  const idSet = new Set(rule.when.anyIds ?? []);
  const tagSet = new Set(rule.when.anyTags ?? []);
  const matchCount = collectMatchCount(played, idSet, tagSet);
  if (matchCount < minCards) {
    return false;
  }

  if (rule.when.factions.length > 0) {
    const allowed = new Set(rule.when.factions);
    if (!played.every(card => allowed.has(card.faction))) {
      return false;
    }
  }

  if (rule.when.opponentIds.length > 0) {
    const opponentSet = new Set(rule.when.opponentIds);
    const hasMatch = opponent.some(card => opponentSet.has(card.id));
    if (!hasMatch) {
      return false;
    }
  }

  if (rule.when.requiresStateEvent) {
    return false;
  }

  return true;
};

const matchTemplateRule = (
  rule: TripleTemplateRule,
  context: ComposeContext,
): boolean => {
  const { played, opponent } = context;
  const { match } = rule;
  if (!match) {
    return true;
  }

  if (match.tagsAny && match.tagsAny.length > 0) {
    const tagSet = new Set(match.tagsAny);
    const tagMatches = collectMatchCount(played, new Set(), tagSet);
    const required = match.minCount ?? 1;
    if (tagMatches < required) {
      return false;
    }
  }

  const allCards = [...played, ...opponent];
  if (match.truthIdsAny && match.truthIdsAny.length > 0) {
    const truthIds = new Set(match.truthIdsAny);
    const hasTruth = allCards.some(card => card.faction === 'truth' && truthIds.has(card.id));
    if (!hasTruth) {
      return false;
    }
  }
  if (match.govIdsAny && match.govIdsAny.length > 0) {
    const govIds = new Set(match.govIdsAny);
    const hasGov = allCards.some(card => card.faction === 'government' && govIds.has(card.id));
    if (!hasGov) {
      return false;
    }
  }
  if (match.govTagsAny && match.govTagsAny.length > 0) {
    const tagSet = new Set(match.govTagsAny);
    const hasGovTag = allCards.some(card => {
      if (card.faction !== 'government') {
        return false;
      }
      return card.tags.some(tag => tagSet.has(tag));
    });
    if (!hasGovTag) {
      return false;
    }
  }

  if (match.types && match.types.length > 0) {
    const expected = [...match.types];
    const actual = played.map(card => card.type);
    if (expected.length !== actual.length) {
      return false;
    }
    const expectedSorted = [...expected].sort();
    const actualSorted = [...actual].sort();
    for (let i = 0; i < expectedSorted.length; i += 1) {
      if (expectedSorted[i] !== actualSorted[i]) {
        return false;
      }
    }
  }

  if (match.factions && match.factions.length > 0) {
    if (match.factions.length !== played.length) {
      return false;
    }
    for (let i = 0; i < match.factions.length; i += 1) {
      if (match.factions[i] !== played[i]?.faction) {
        return false;
      }
    }
  }

  if (match.typesAnyCount) {
    const counts = new Map<string, number>();
    for (const card of played) {
      counts.set(card.type, (counts.get(card.type) ?? 0) + 1);
    }
    for (const [type, required] of Object.entries(match.typesAnyCount)) {
      const value = counts.get(type) ?? 0;
      if (value < required) {
        return false;
      }
    }
  }

  return true;
};

const buildArticleFromCombo = (
  rule: ComboRule,
  context: ComposeContext,
  placeholders: PlaceholderContext,
): ExtraArticleBlock => {
  const { bank, mix, rng } = context;
  const tone = determineTone(resolveComboTone(rule), mix);
  const kickerPoolKey = tone === 'truth' ? 'truth' : tone === 'government' ? 'government' : 'mixed';
  const kicker = pick(bank.rendering.kickers[kickerPoolKey] ?? [], rng, 'EXTRA EXTRA');
  const stinger = pick(bank.rendering.stingers ?? [], rng, 'SOURCE: “THIS IS FINE”');

  const rawHeadline = applyPlaceholders(rule.headline, placeholders);
  const rawSubhead = applyPlaceholders(rule.subhead ?? '', placeholders);
  const body = limitBody(applyBodyPlaceholders(rule.body ?? [], placeholders), bank.defaults.maxBodyParas);
  const imagePrompt = applyPlaceholders(rule.imagePrompt ?? '', placeholders);
  const dek = rawSubhead;
  const bullets = body;

  return {
    tone,
    hed: rawHeadline,
    dek,
    bullets,
    byline: rule.byline ?? bank.defaults.byline,
    source: 'Source: Composite Wire',
    body,
    imagePrompt: imagePrompt || undefined,
    kicker,
    stinger,
    comboId: rule.comboId,
  } satisfies ExtraArticleBlock;
};

const resolveComboTone = (rule: ComboRule): 'truth' | 'government' | 'mixed' | undefined => {
  const tags = rule.tags.map(tag => tag.toLowerCase());
  if (tags.includes('truth-combo')) {
    return 'truth';
  }
  if (tags.includes('government-combo')) {
    return 'government';
  }
  if (tags.includes('truth-vs-gov')) {
    return 'mixed';
  }
  return undefined;
};

const applyBodyPlaceholders = (body: string[], context: PlaceholderContext): string[] => {
  return cleanLines(body.map(line => applyPlaceholders(line, context)));
};

const buildArticleFromTemplate = (
  rule: TripleTemplateRule,
  bucketId: string,
  context: ComposeContext,
  placeholders: PlaceholderContext,
): ExtraArticleBlock => {
  const { bank, mix, rng } = context;
  const tone = determineTone(rule.factionHint, mix);
  const toneKey = tone === 'truth' ? 'truth' : tone === 'government' ? 'government' : 'mixed';
  const kicker = pick(bank.rendering.kickers[toneKey] ?? [], rng, 'EXTRA EXTRA');
  const stinger = pick(bank.rendering.stingers ?? [], rng, 'UPSETTING TO PRINTERS');
  const main = applyPlaceholders(rule.headline, placeholders);
  const sub = applyPlaceholders(rule.subhead ?? '', placeholders);
  const body = limitBody(applyBodyPlaceholders(rule.body ?? [], placeholders), bank.defaults.maxBodyParas);
  const imagePrompt = applyPlaceholders(rule.imagePrompt ?? '', placeholders);

  const hed = renderFormat(bank.rendering.headlineFormat, {
    KICKER: kicker,
    MAIN: main,
    STINGER: stinger,
  });
  const dek = renderFormat(bank.rendering.subheadFormat, {
    SUBA: sub,
    SUBB: '',
  });

  return {
    tone,
    hed,
    dek,
    bullets: body,
    byline: bank.defaults.byline,
    source: 'Source: Composite Wire',
    body,
    imagePrompt: imagePrompt || undefined,
    kicker,
    stinger,
    templateId: `${bucketId}:${rule.id}`,
  } satisfies ExtraArticleBlock;
};

const selectComboMatch = (
  combos: ComboRule[],
  played: NewsCardLite[],
  opponent: NewsCardLite[],
): ComboRule | null => {
  let firstMatch: ComboRule | null = null;
  for (const combo of combos) {
    if (!matchComboRule(combo, played, opponent)) {
      continue;
    }
    if (!firstMatch) {
      firstMatch = combo;
    }
    if (combo.exclusive) {
      return combo;
    }
  }
  return firstMatch;
};

const selectTemplateRule = (
  bank: TripleTemplateBank,
  context: ComposeContext,
): { bucketId: string; rule: TripleTemplateRule } | null => {
  const { priority, templates } = bank;
  const buckets = priority.length ? priority : Object.keys(templates);
  for (const bucketId of buckets) {
    const rules = templates[bucketId];
    if (!Array.isArray(rules) || !rules.length) {
      continue;
    }
    for (const rule of rules) {
      if (matchTemplateRule(rule, context)) {
        return { bucketId, rule };
      }
    }
  }
  const genericRules = templates.generic ?? [];
  if (genericRules.length) {
    return { bucketId: 'generic', rule: genericRules[0]! };
  }
  return null;
};

export function composeTripleHeadline(
  played: NewsCardLite[],
  opponentPlayed: NewsCardLite[] | null,
  opts?: { seed?: number },
): ExtraArticleBlock | null {
  if (!Array.isArray(played) || played.length !== 3) {
    return null;
  }

  const bank = getTripleBankIfReady();
  if (!bank) {
    return null;
  }

  const combos = getComboBankIfReady();
  const opponent = Array.isArray(opponentPlayed) ? opponentPlayed.slice(0, 3) : [];
  const mix = determineMix(played);
  const baseSeed = typeof opts?.seed === 'number' ? opts.seed : hashSeed(played.map(card => card.id).join('+'));
  const rng = mulberry32(baseSeed);
  const placeholders = buildPlaceholderContext(played, bank, rng);
  const context: ComposeContext = { played, opponent, bank, rng, mix };

  if (combos && combos.length > 0) {
    const combo = selectComboMatch(combos, played, opponent);
    if (combo) {
      return buildArticleFromCombo(combo, context, placeholders);
    }
  }

  const selected = selectTemplateRule(bank, context);
  if (!selected) {
    return null;
  }

  return buildArticleFromTemplate(selected.rule, selected.bucketId, context, placeholders);
}
