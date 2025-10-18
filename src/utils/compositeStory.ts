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

export const filterPlayableArticleIds = (ids: Array<string | null | undefined>): string[] =>
  ids
    .map(id => (typeof id === 'string' ? id.trim() : ''))
    .filter(id => id && id !== '0');
