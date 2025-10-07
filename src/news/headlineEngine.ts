import { composeTripleHeadline, type ArticleBlock as TripleArticleBlock, type NewsCardLite } from '@/engine/news/composeTriple';
import { getPerCardArticlesIfReady } from '@/engine/news/newsPools';
import { getPools, getPoolsIfReady } from '@/news/newsPools';

const FALLBACK_DEK_POOL = [
  'Archive uplink pending. Full briefing to follow shortly.',
  'Wire desk files a placeholder while the reels warm up.',
];

const FALLBACK_BYLINES = [
  'By: Standby Desk',
  'By: Emergency Editor',
];

const FALLBACK_SOURCES = [
  'Source: Archive sync pending.',
  'Source: Classified spool offline.',
];

const FALLBACK_MASTHEADS = [
  'Paranoid Press — Wire Delay Edition',
  'The Interim Ledger',
];

const FALLBACK_WEATHER = [
  'Weather withheld pending clearance.',
  'Forecast delayed until archives respond.',
];

const FALLBACK_ADS = [
  'Placeholder classified: Archives reconnecting shortly.',
  'Advertisement suspended pending copy approval.',
  'Wire notice: Refresh for full classifieds.',
];

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

export interface ExtraExtraOutcome {
  trigger: boolean;
  winningFaction: 'truth' | 'government' | 'draw';
  focusPlays: PlayedLite[];
  truthDelta: number;
  winnerCards: NewsCardLite[] | null;
  opponentCards: NewsCardLite[] | null;
  composedMain: TripleArticleBlock | null;
  dispatches: ArticleBlock[];
  composeSeed: number | null;
  composeSignature: string | null;
}

const computePlayValue = (play: PlayedLite): number => {
  if (!play) {
    return 0;
  }

  const values: number[] = [];

  if (typeof play.truth === 'number' && Number.isFinite(play.truth)) {
    values.push(Math.abs(play.truth));
  }

  if (typeof play.ip === 'number' && Number.isFinite(play.ip)) {
    values.push(Math.abs(play.ip));
  }

  if (typeof play.captures === 'number' && Number.isFinite(play.captures)) {
    values.push(Math.abs(play.captures) * 2);
  }

  if (typeof play.damage === 'number' && Number.isFinite(play.damage)) {
    values.push(Math.abs(play.damage));
  }

  if (!values.length) {
    return 0;
  }

  return Math.max(...values);
};

const collectFactionTrio = (
  plays: PlayedLite[],
  faction: 'truth' | 'government',
): PlayedLite[] => {
  const result: PlayedLite[] = [];

  for (const play of plays) {
    if (play.faction !== faction) {
      continue;
    }

    result.push(play);

    if (result.length >= 3) {
      break;
    }
  }

  return result;
};

const collectDrawFocus = (plays: PlayedLite[]): PlayedLite[] => {
  const result: PlayedLite[] = [];
  let truthCount = 0;
  let governmentCount = 0;

  for (const play of plays) {
    if (play.faction === 'truth' && truthCount < 3) {
      result.push(play);
      truthCount += 1;
      continue;
    }

    if (play.faction === 'government' && governmentCount < 3) {
      result.push(play);
      governmentCount += 1;
    }

    if (truthCount >= 3 && governmentCount >= 3) {
      break;
    }
  }

  return result;
};

const highestFactionValue = (plays: PlayedLite[]): number => {
  if (!plays.length) {
    return 0;
  }

  return plays.reduce((max, play) => {
    const value = computePlayValue(play);
    return value > max ? value : max;
  }, 0);
};

export const evaluateExtraExtra = (
  plays: PlayedLite[],
  options?: { seed?: string | number },
): ExtraExtraOutcome => {
  const truthTrio = collectFactionTrio(plays, 'truth');
  const governmentTrio = collectFactionTrio(plays, 'government');

  const truthQualifies = truthTrio.length >= 3;
  const governmentQualifies = governmentTrio.length >= 3;

  if (!truthQualifies && !governmentQualifies) {
    return {
      trigger: false,
      winningFaction: 'draw',
      focusPlays: [],
      truthDelta: 0,
      winnerCards: null,
      opponentCards: null,
      composedMain: null,
      dispatches: [],
      composeSeed: null,
      composeSignature: null,
    };
  }

  const enrich = (base: {
    trigger: boolean;
    winningFaction: 'truth' | 'government' | 'draw';
    focusPlays: PlayedLite[];
    truthDelta: number;
  }): ExtraExtraOutcome => {
    if (!base.trigger) {
      return {
        ...base,
        winnerCards: null,
        opponentCards: null,
        composedMain: null,
        dispatches: [],
        composeSeed: null,
        composeSignature: null,
      } satisfies ExtraExtraOutcome;
    }

    const perCardArticles = getPerCardArticlesIfReady();

    const toNewsCard = (play: PlayedLite): NewsCardLite => {
      const entry = perCardArticles?.get(play.id);
      const tags = entry?.tags ?? [];
      return {
        id: play.id,
        name: play.name,
        faction: play.faction,
        type: play.type,
        tags: [...tags],
      } satisfies NewsCardLite;
    };

    const toDispatchArticle = (play: PlayedLite): ArticleBlock | null => {
      const entry = perCardArticles?.get(play.id);
      const hed = entry?.headline?.trim();
      if (!hed) {
        return null;
      }
      const dek = entry?.subhead?.trim() ?? '';
      const byline = entry?.byline?.trim() ?? 'By: Field Desk';
      const bodyLines = typeof entry?.body === 'string'
        ? entry!.body.split(/\n+/).map(line => line.trim()).filter(Boolean)
        : [];
      const article: ArticleBlock = {
        tone: entry?.tone ?? play.faction,
        hed,
        dek,
        bullets: [],
        byline,
        source: 'Source: Field Dispatch',
      } satisfies ArticleBlock;
      if (bodyLines.length) {
        article.body = bodyLines;
      }
      if (entry?.imagePrompt) {
        article.imagePrompt = entry.imagePrompt;
      }
      return article;
    };

    const truthCards = truthTrio.slice(0, 3).map(toNewsCard);
    const governmentCards = governmentTrio.slice(0, 3).map(toNewsCard);
    const truthHasTrio = truthCards.length === 3;
    const governmentHasTrio = governmentCards.length === 3;

    let winnerCards: NewsCardLite[] | null = null;
    let opponentCards: NewsCardLite[] | null = null;

    if (base.winningFaction === 'truth') {
      winnerCards = truthHasTrio ? truthCards : null;
      opponentCards = governmentHasTrio ? governmentCards : null;
    } else if (base.winningFaction === 'government') {
      winnerCards = governmentHasTrio ? governmentCards : null;
      opponentCards = truthHasTrio ? truthCards : null;
    } else {
      if (truthHasTrio) {
        winnerCards = truthCards;
        opponentCards = governmentHasTrio ? governmentCards : null;
      } else if (governmentHasTrio) {
        winnerCards = governmentCards;
        opponentCards = truthHasTrio ? truthCards : null;
      }
    }

    if ((!winnerCards || winnerCards.length !== 3) && base.focusPlays.length >= 3) {
      winnerCards = base.focusPlays.slice(0, 3).map(toNewsCard);
    }

    const composeSignature = winnerCards && winnerCards.length === 3
      ? winnerCards.map(card => card.id).join(',')
      : null;

    let composeSeed: number | null = null;
    let composedMain: TripleArticleBlock | null = null;

    if (winnerCards && winnerCards.length === 3) {
      const seedInput = options?.seed ?? composeSignature ?? '';
      composeSeed = typeof seedInput === 'number' ? seedInput : hashSeed(String(seedInput));
      const opponent = opponentCards && opponentCards.length ? opponentCards : null;
      composedMain = composeTripleHeadline(winnerCards, opponent, { seed: composeSeed }) ?? null;
    }

    const dispatches = base.focusPlays
      .map(toDispatchArticle)
      .filter((article): article is ArticleBlock => article != null);

    return {
      ...base,
      winnerCards,
      opponentCards,
      composedMain,
      dispatches,
      composeSeed,
      composeSignature,
    } satisfies ExtraExtraOutcome;
  };

  if (truthQualifies && !governmentQualifies) {
    return enrich({
      trigger: true,
      winningFaction: 'truth',
      focusPlays: truthTrio,
      truthDelta: 3,
    });
  }

  if (!truthQualifies && governmentQualifies) {
    return enrich({
      trigger: true,
      winningFaction: 'government',
      focusPlays: governmentTrio,
      truthDelta: -3,
    });
  }

  const truthValue = highestFactionValue(truthTrio);
  const governmentValue = highestFactionValue(governmentTrio);

  if (truthValue > governmentValue) {
    return enrich({
      trigger: true,
      winningFaction: 'truth',
      focusPlays: truthTrio,
      truthDelta: 3,
    });
  }

  if (governmentValue > truthValue) {
    return enrich({
      trigger: true,
      winningFaction: 'government',
      focusPlays: governmentTrio,
      truthDelta: -3,
    });
  }

  const focusPlays = collectDrawFocus(plays);

  return enrich({
    trigger: true,
    winningFaction: 'draw',
    focusPlays,
    truthDelta: 0,
  });
};

export interface ArticleBlock {
  tone: 'truth' | 'government' | 'draw';
  hed: string;
  dek: string;
  bullets: string[];
  byline: string;
  source: string;
  body?: string[];
  imagePrompt?: string;
  kicker?: string;
  stinger?: string;
  templateId?: string;
  comboId?: string;
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

const buildFallbackHed = (tone: ArticleBlock['tone'], totals: TurnTotals): string => {
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
  const subject = tone === 'truth' ? 'TRUTH WIRE' : tone === 'government' ? 'GOVERNMENT BULLETIN' : 'TABLOID DESK';

  const highlight = (() => {
    if (focus.captures > 0) {
      const label = focus.captures === 1 ? 'capture' : 'captures';
      return `${formatNumber(focus.captures)} ${label}`.toUpperCase();
    }
    if (focus.truth > 0) {
      return `TRUTH +${formatNumber(focus.truth)}%`;
    }
    if (focus.ip > 0) {
      return `IP +${formatNumber(focus.ip)}`;
    }
    if (focus.plays > 0) {
      return `${formatNumber(focus.plays)} PLAYS LOGGED`;
    }
    return 'NO MAJOR SHIFTS';
  })();

  return `[WIRE DELAY] ${subject} NOTES ${highlight}`;
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
  evaluation?: ExtraExtraOutcome,
): ArticleBlock => {
  const totals = totalsArg ?? summarize(turns);
  const tone = dominantFromTotals(totals);
  const rng = mulberry32(hashSeed(`extra:${seed}`));
  const pools = getPoolsIfReady();

  const applyComposedArticle = (article: ArticleBlock, composed: TripleArticleBlock): ArticleBlock => {
    const next: ArticleBlock = {
      ...article,
      tone: composed.tone,
      hed: composed.hed,
      dek: composed.dek,
      bullets: ensureBulletFallback([...composed.bullets], composed.tone),
      byline: composed.byline ?? article.byline,
      source: composed.source ?? article.source,
    } satisfies ArticleBlock;

    if (composed.body && composed.body.length) {
      next.body = [...composed.body];
    } else {
      next.body = undefined;
    }

    if (composed.imagePrompt) {
      next.imagePrompt = composed.imagePrompt;
    } else if (article.imagePrompt) {
      next.imagePrompt = article.imagePrompt;
    }

    if (composed.kicker) {
      next.kicker = composed.kicker;
    } else if (article.kicker) {
      next.kicker = article.kicker;
    }

    if (composed.stinger) {
      next.stinger = composed.stinger;
    } else if (article.stinger) {
      next.stinger = article.stinger;
    }

    if (composed.templateId) {
      next.templateId = composed.templateId;
    } else if (article.templateId) {
      next.templateId = article.templateId;
    }

    if (composed.comboId) {
      next.comboId = composed.comboId;
    } else if (article.comboId) {
      next.comboId = article.comboId;
    }

    return next;
  };

  const applyDispatchFallback = (fallback: ArticleBlock): ArticleBlock => {
    const copy: ArticleBlock = {
      ...fallback,
      bullets: ensureBulletFallback([...fallback.bullets], fallback.tone),
    } satisfies ArticleBlock;
    if (fallback.body) {
      copy.body = [...fallback.body];
    }
    return copy;
  };

  let article: ArticleBlock;

  if (!pools) {
    console.warn('generateExtraExtra: news pools not ready, using placeholder article.');
    const hed = buildFallbackHed(tone, totals);
    const dek = pick(FALLBACK_DEK_POOL, rng, FALLBACK_DEK_POOL[0]);
    const byline = pick(FALLBACK_BYLINES, rng, FALLBACK_BYLINES[0]);
    const source = pick(FALLBACK_SOURCES, rng, FALLBACK_SOURCES[0]);
    const bullets = buildBullets(turns, totals, tone, rng);
    article = {
      tone,
      hed,
      dek,
      bullets,
      byline,
      source,
    } satisfies ArticleBlock;
  } else {
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

    article = {
      tone,
      hed,
      dek,
      bullets,
      byline,
      source,
    } satisfies ArticleBlock;
  }

  if (pools && evaluation?.composedMain) {
    article = applyComposedArticle(article, evaluation.composedMain);
    if (typeof console !== 'undefined' && typeof console.debug === 'function') {
      const signature = evaluation.composeSignature ?? 'n/a';
      const marker = evaluation.composedMain.comboId ?? evaluation.composedMain.templateId ?? 'template';
      console.debug(`NEWS: triple-main ${signature} -> ${marker}`);
    }
  } else if (pools && evaluation?.dispatches?.length) {
    const fallback = evaluation.dispatches[0];
    article = applyDispatchFallback(fallback);
    if (typeof console !== 'undefined' && typeof console.info === 'function') {
      const signature = evaluation.composeSignature ?? 'n/a';
      console.info(`NEWS: triple-fallback ${signature} -> dispatch:${fallback.hed}`);
    }
  }

  article.bullets = ensureBulletFallback(article.bullets, article.tone);

  return article;
};

export const buildFinalEdition = (seed: string, turns: TurnLog[]): FinalEdition => {
  const totals = summarize(turns);
  const dominantFaction = dominantFromTotals(totals);
  const rng = mulberry32(hashSeed(`edition:${seed}`));
  const pools = getPoolsIfReady();

  if (!pools) {
    console.warn('buildFinalEdition: news pools not ready, using placeholder edition.');
    const masthead = pick(FALLBACK_MASTHEADS, rng, FALLBACK_MASTHEADS[0]);
    const weather = pick(FALLBACK_WEATHER, rng, FALLBACK_WEATHER[0]);
    const ads = pickMany(FALLBACK_ADS, Math.min(3, FALLBACK_ADS.length), rng);
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
  }

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

