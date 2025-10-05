import { getPools } from '@/news/newsPools';

export type CardType = 'ATTACK' | 'MEDIA' | 'ZONE';

export interface PlayedLite {
  id: string;
  name: string;
  type: CardType;
  faction: 'truth' | 'government';
  truth?: number;
  ip?: number;
  captures?: number;
  damage?: number;
}

export interface FactionTotals {
  plays: number;
  attack: number;
  media: number;
  zone: number;
  truth: number;
  ip: number;
  captures: number;
  damage: number;
}

export interface TurnTotals {
  truth: FactionTotals;
  government: FactionTotals;
}

export interface TurnLog {
  round: number;
  turn: number;
  plays: PlayedLite[];
}

export interface ArticleBlock {
  tone: 'truth' | 'government' | 'draw';
  hed: string;
  dek: string;
  bullets: string[];
  byline: string;
  source: string;
}

export interface FinalEdition {
  seed: string;
  masthead: string;
  weather: string;
  ads: string[];
  totals: TurnTotals;
  dominantFaction: ArticleBlock['tone'];
  article: ArticleBlock;
}

const createEmptyTotals = (): FactionTotals => ({
  plays: 0,
  attack: 0,
  media: 0,
  zone: 0,
  truth: 0,
  ip: 0,
  captures: 0,
  damage: 0,
});

export const hashSeed = (input: string): number => {
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

export const mulberry32 = (seed: number): (() => number) => {
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

const pickMany = <T,>(pool: readonly T[], count: number, rng: () => number): T[] => {
  if (count <= 0 || pool.length === 0) {
    return [];
  }
  const available = [...pool];
  const results: T[] = [];
  for (let i = 0; i < count && available.length; i += 1) {
    const index = Math.floor(rng() * available.length) % available.length;
    const [value] = available.splice(index, 1);
    if (value !== undefined) {
      results.push(value);
    }
  }
  return results;
};

const describeType = (type: CardType, tone: ArticleBlock['tone']): string => {
  const truth: Record<CardType, string> = {
    ATTACK: 'tabloid stings',
    MEDIA: 'broadcast leaks',
    ZONE: 'street canvass storms',
  };
  const government: Record<CardType, string> = {
    ATTACK: 'containment strikes',
    MEDIA: 'press briefings',
    ZONE: 'perimeter lockdowns',
  };
  const neutral: Record<CardType, string> = {
    ATTACK: 'clashes',
    MEDIA: 'signal bursts',
    ZONE: 'field operations',
  };
  if (tone === 'truth') {
    return truth[type];
  }
  if (tone === 'government') {
    return government[type];
  }
  return neutral[type];
};

const getDominantType = (totals: TurnTotals, tone: ArticleBlock['tone']): CardType => {
  const aggregate = createEmptyTotals();
  const apply = (source: FactionTotals) => {
    aggregate.attack += source.attack;
    aggregate.media += source.media;
    aggregate.zone += source.zone;
  };

  if (tone === 'truth') {
    apply(totals.truth);
  } else if (tone === 'government') {
    apply(totals.government);
  } else {
    apply(totals.truth);
    apply(totals.government);
  }

  const counts: Array<{ type: CardType; value: number }> = [
    { type: 'ATTACK', value: aggregate.attack },
    { type: 'MEDIA', value: aggregate.media },
    { type: 'ZONE', value: aggregate.zone },
  ];

  counts.sort((a, b) => b.value - a.value);
  return counts[0]?.type ?? 'MEDIA';
};

const ensureBulletFallback = (bullets: string[], tone: ArticleBlock['tone']): string[] => {
  if (bullets.length > 0) {
    return bullets;
  }
  if (tone === 'truth') {
    return ['Conspiracy desk insists the scoop is extremely real and very dramatic.'];
  }
  if (tone === 'government') {
    return ['Memorandum filed: “Situation normal, please stop asking.”'];
  }
  return ['Both factions traded headlines until the presses jammed from confusion.'];
};

const formatNumber = (value: number): string => {
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
};

export const summarize = (turns: TurnLog[]): TurnTotals => {
  const totals: TurnTotals = {
    truth: createEmptyTotals(),
    government: createEmptyTotals(),
  };

  for (const turn of turns) {
    for (const play of turn.plays) {
      const bucket = totals[play.faction];
      bucket.plays += 1;
      if (play.type === 'ATTACK') bucket.attack += 1;
      if (play.type === 'MEDIA') bucket.media += 1;
      if (play.type === 'ZONE') bucket.zone += 1;
      if (typeof play.truth === 'number' && !Number.isNaN(play.truth)) {
        bucket.truth += Math.max(0, play.truth);
      }
      if (typeof play.ip === 'number' && !Number.isNaN(play.ip)) {
        bucket.ip += Math.max(0, play.ip);
      }
      if (typeof play.captures === 'number' && !Number.isNaN(play.captures)) {
        bucket.captures += Math.max(0, play.captures);
      }
      if (typeof play.damage === 'number' && !Number.isNaN(play.damage)) {
        bucket.damage += Math.max(0, play.damage);
      }
    }
  }

  return totals;
};

export const dominantFromTotals = (totals: TurnTotals): ArticleBlock['tone'] => {
  const score = (faction: FactionTotals): number => {
    const truthScore = faction.truth * 2;
    const captureScore = faction.captures * 3;
    const ipScore = faction.ip * 1.5;
    const damageScore = faction.damage * 0.5;
    const playScore = faction.plays * 0.25;
    return truthScore + captureScore + ipScore + damageScore + playScore;
  };

  const truthScore = score(totals.truth);
  const govScore = score(totals.government);
  const delta = truthScore - govScore;
  if (Math.abs(delta) < 0.5) {
    return 'draw';
  }
  return delta > 0 ? 'truth' : 'government';
};

export const buildBullets = (
  turns: TurnLog[],
  totals: TurnTotals,
  tone: ArticleBlock['tone'],
  rng: () => number,
): string[] => {
  const truthTotals = totals.truth;
  const govTotals = totals.government;
  const combined: FactionTotals = {
    plays: truthTotals.plays + govTotals.plays,
    attack: truthTotals.attack + govTotals.attack,
    media: truthTotals.media + govTotals.media,
    zone: truthTotals.zone + govTotals.zone,
    truth: truthTotals.truth + govTotals.truth,
    ip: truthTotals.ip + govTotals.ip,
    captures: truthTotals.captures + govTotals.captures,
    damage: truthTotals.damage + govTotals.damage,
  };

  const focus = tone === 'truth' ? truthTotals : tone === 'government' ? govTotals : combined;
  const dominantType = getDominantType(totals, tone);

  const available: string[] = [];

  if (focus.truth > 0) {
    if (tone === 'truth') {
      available.push(`Truth meter spiked +${formatNumber(focus.truth)}% thanks to sleepless operatives.`);
    } else if (tone === 'government') {
      available.push(`Containment teams shaved ${formatNumber(focus.truth)}% off public awareness.`);
    } else {
      available.push(`Truth swings landed at +${formatNumber(truthTotals.truth)}% vs +${formatNumber(govTotals.truth)}% suppression.`);
    }
  }

  if (focus.captures > 0) {
    if (tone === 'truth') {
      available.push(`${formatNumber(focus.captures)} state${focus.captures === 1 ? '' : 's'} flipped before sunrise.`);
    } else if (tone === 'government') {
      available.push(`${formatNumber(focus.captures)} sector${focus.captures === 1 ? '' : 's'} reclassified as “secure”.`);
    } else {
      available.push(`Territory chart shows ${formatNumber(combined.captures)} total captures split across the aisle.`);
    }
  }

  if (focus.ip > 0) {
    if (tone === 'truth') {
      available.push(`Crowdfund war chest ballooned by +${formatNumber(focus.ip)} IP.`);
    } else if (tone === 'government') {
      available.push(`Budget auditors reclaimed ${formatNumber(focus.ip)} IP from rogue channels.`);
    } else {
      available.push(`Resource swing: Truth +${formatNumber(truthTotals.ip)} IP vs Gov +${formatNumber(govTotals.ip)}.`);
    }
  }

  if (focus.damage > 0) {
    if (tone === 'truth') {
      available.push(`Saboteurs logged ${formatNumber(focus.damage)} structural hit${focus.damage === 1 ? '' : 's'}.`);
    } else if (tone === 'government') {
      available.push(`Security brief lists ${formatNumber(focus.damage)} damage incidents neutralized.`);
    } else {
      available.push(`Both sides traded ${formatNumber(combined.damage)} total damage pings.`);
    }
  }

  const typeDescription = describeType(dominantType, tone);
  if (typeDescription && (focus.attack + focus.media + focus.zone) > 0) {
    available.push(`Most common play: ${typeDescription} ruled the round.`);
  }

  const finalTurn = turns.length ? turns[turns.length - 1] : undefined;
  if (finalTurn && finalTurn.plays.length && tone !== 'draw') {
    const lastFaction = finalTurn.plays[finalTurn.plays.length - 1]?.faction;
    const lastType = finalTurn.plays[finalTurn.plays.length - 1]?.type;
    if (lastFaction && lastType && lastFaction === tone) {
      available.push(`Final push came on turn ${finalTurn.turn}: a ${describeType(lastType, tone)} closer.`);
    }
  }

  const filtered = available.filter(Boolean);
  if (filtered.length <= 3) {
    return ensureBulletFallback(filtered, tone);
  }

  const shuffled = filtered
    .map(line => ({ line, weight: rng() }))
    .sort((a, b) => a.weight - b.weight)
    .map(entry => entry.line);

  return ensureBulletFallback(shuffled.slice(0, 3), tone);
};

export const buildHed = (
  tone: ArticleBlock['tone'],
  totals: TurnTotals,
  rng: () => number,
): string => {
  const pools = getPools();
  const dominantType = getDominantType(totals, tone);
  const verbPool =
    dominantType === 'ATTACK' ? pools.attackVerbs : dominantType === 'MEDIA' ? pools.mediaVerbs : pools.zoneVerbs;
  const verb = pick(verbPool, rng, 'REPORTS');

  const focus = tone === 'truth'
    ? totals.truth
    : tone === 'government'
      ? totals.government
      : {
          plays: totals.truth.plays + totals.government.plays,
          attack: totals.truth.attack + totals.government.attack,
          media: totals.truth.media + totals.government.media,
          zone: totals.truth.zone + totals.government.zone,
          truth: totals.truth.truth + totals.government.truth,
          ip: totals.truth.ip + totals.government.ip,
          captures: totals.truth.captures + totals.government.captures,
          damage: totals.truth.damage + totals.government.damage,
        } satisfies FactionTotals;

  const significantCaptures = focus.captures >= 2;
  const significantTruth = focus.truth >= 3;
  const significantIp = focus.ip >= 5;

  const subject = (() => {
    if (tone === 'truth') {
      if (dominantType === 'MEDIA') return 'TRUTH NETWORK';
      if (dominantType === 'ZONE') return 'FIELD OPS';
      return 'OPERATIVES';
    }
    if (tone === 'government') {
      if (dominantType === 'MEDIA') return 'PRESS OFFICE';
      if (dominantType === 'ZONE') return 'PERIMETER BUREAU';
      return 'CONTAINMENT UNIT';
    }
    if (dominantType === 'MEDIA') return 'DUELING BROADCASTS';
    if (dominantType === 'ZONE') return 'STREET STANDOFF';
    return 'STANDOFF';
  })();

  const object = (() => {
    if (significantCaptures) {
      const label = focus.captures === 1 ? 'STATE' : 'STATES';
      return `${formatNumber(focus.captures)} ${label}`;
    }
    if (significantTruth) {
      return `TRUTH ${tone === 'government' ? 'SURGE' : `+${formatNumber(focus.truth)}%`}`;
    }
    if (significantIp) {
      return `IP ${tone === 'government' ? 'RECLAMATION' : `+${formatNumber(focus.ip)}`}`;
    }
    return tone === 'draw' ? 'GRIDLOCK' : 'GRID';
  })();

  if (tone === 'government') {
    return `${subject} FILES “${verb}” ${object}`;
  }
  if (tone === 'draw') {
    return `${subject} CALLS IT “${verb}” ${object}`;
  }
  return `${subject} ${verb} ${object}`;
};

export const generateExtraExtra = (
  seed: string,
  turns: TurnLog[],
  totalsArg?: TurnTotals,
): ArticleBlock => {
  const totals = totalsArg ?? summarize(turns);
  const tone = dominantFromTotals(totals);
  const rng = mulberry32(hashSeed(`extra:${seed}`));
  const pools = getPools();
  const dominantType = getDominantType(totals, tone);
  const typeKey = dominantType === 'ATTACK' ? 'attack' : dominantType === 'MEDIA' ? 'media' : 'zone';
  const subheadPool = [...pools.subheads.generic];
  if (typeKey && pools.subheads[typeKey]) {
    subheadPool.push(...pools.subheads[typeKey]);
  }
  const hed = buildHed(tone, totals, rng);
  const dek = pick(subheadPool, rng, 'Sources refuse to elaborate.');
  const byline = pick(pools.bylines, rng, 'By: Anonymous Insider');
  const source = pick(pools.sources, rng, 'Source: Redacted');
  const bullets = buildBullets(turns, totals, tone, rng);

  return {
    tone,
    hed,
    dek,
    bullets,
    byline,
    source,
  };
};

export const buildFinalEdition = (seed: string, turns: TurnLog[]): FinalEdition => {
  const totals = summarize(turns);
  const dominantFaction = dominantFromTotals(totals);
  const rng = mulberry32(hashSeed(`edition:${seed}`));
  const pools = getPools();
  const masthead = pick(pools.mastheads, rng, 'Paranoid Press');
  const weather = pick(pools.weather, rng, 'Forecast withheld pending clearance.');
  const ads = pickMany(pools.ads, 3, rng);
  const article = generateExtraExtra(seed, turns, totals);

  return {
    seed,
    masthead,
    weather,
    ads,
    totals,
    dominantFaction,
    article,
  };
};

