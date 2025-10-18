const hashCompositeSeed = (input: string): number => {
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

export interface CompositeSeedParams {
  baseSeed: number;
  round: number;
  turn: number;
  actor: 'human' | 'ai';
  ids: string[];
}

export const computeCompositeStorySeed = ({
  baseSeed,
  round,
  turn,
  actor,
  ids,
}: CompositeSeedParams): number => {
  const normalizedBase = Number.isFinite(baseSeed) ? baseSeed >>> 0 : 0;
  const sortedIds = [...ids].sort();
  const signature = sortedIds.length > 0 ? sortedIds.join(',') : 'none';
  const payload = `${normalizedBase}:${round}:${turn}:${actor}:${signature}`;
  return hashCompositeSeed(payload);
};

export const resolveCompositeFaction = (
  humanFaction: 'truth' | 'government',
  actor: 'human' | 'ai',
): 'truth' | 'government' => {
  if (actor === 'human') {
    return humanFaction;
  }
  return humanFaction === 'truth' ? 'government' : 'truth';
};

const CARD_ID_ALIASES: Record<string, string> = {
  'truth-media-mvp': 'TRUTH-001',
  'truth-attack-mvp': 'TRUTH-005',
  'truth-zone-mvp': 'TRUTH-007',
  'gov-media-mvp': 'GOV-001',
  'gov-attack-mvp': 'GOV-003',
  'gov-zone-mvp': 'GOV-007',
};

const normalizeCompositeArticleId = (rawId: string | null | undefined): string | null => {
  if (typeof rawId !== 'string') {
    return null;
  }

  const trimmed = rawId.trim();
  if (!trimmed || trimmed === '0') {
    return null;
  }

  const alias = CARD_ID_ALIASES[trimmed.toLowerCase()];
  if (alias) {
    return alias;
  }

  const hyphenNormalized = trimmed.replace(/_/g, '-');
  const upper = hyphenNormalized.toUpperCase();
  if (/^(TRUTH|GOV)-/.test(upper)) {
    return upper;
  }

  return hyphenNormalized;
};

export const filterPlayableArticleIds = (ids: Array<string | null | undefined>): string[] => {
  const seen = new Set<string>();
  const results: string[] = [];

  for (const rawId of ids) {
    const normalized = normalizeCompositeArticleId(rawId);
    if (!normalized || seen.has(normalized)) {
      continue;
    }
    seen.add(normalized);
    results.push(normalized);
  }

  return results;
};
