import { getPerCardArticlesIfReady, type ArticleBlock as CardArticle } from '@/engine/news/newsPools';

import type {
  ArticleBlock,
  CardType,
  PlayedLite,
  TurnComposite,
  TurnCompositeMetrics,
  TurnLog,
  WeightedMetric,
} from './types';

export interface ComposeTurnOptions {
  seed?: string | number;
  articleCache?: Map<string, CardArticle> | null;
}

export const TURN_METRIC_WEIGHTS = Object.freeze({
  truth: 4,
  ip: 2,
  captures: 5,
  damage: 1,
} as const);

export const TURN_CARD_TYPE_BONUS: Readonly<Record<CardType, number>> = Object.freeze({
  ATTACK: 1.25,
  MEDIA: 0.75,
  ZONE: 1,
});

const DEFAULT_TYPE_BONUS = 0.5;

const sanitizeImpact = (value: number | undefined): number => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 0;
  }
  return Math.max(0, Math.abs(value));
};

const toWeightedMetric = (raw: number, weight: number): WeightedMetric => ({
  raw,
  weighted: Math.round(raw * weight * 100) / 100,
});

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

const cleanLines = (lines: string[]): string[] => {
  const seen = new Set<string>();
  const results: string[] = [];
  for (const raw of lines) {
    const value = String(raw ?? '').replace(/\s+/g, ' ').trim();
    if (!value || seen.has(value)) {
      continue;
    }
    seen.add(value);
    results.push(value);
  }
  return results;
};

interface CandidateMetrics {
  truth: number;
  ip: number;
  captures: number;
  damage: number;
  typeBonus: number;
  score: number;
}

interface Candidate {
  index: number;
  play: PlayedLite;
  article: CardArticle | null;
  metrics: CandidateMetrics;
}

const deriveTypeBonus = (type: CardType | string): number => {
  const key = (typeof type === 'string' ? type.toUpperCase() : '') as CardType;
  return TURN_CARD_TYPE_BONUS[key] ?? DEFAULT_TYPE_BONUS;
};

const computeCandidate = (play: PlayedLite, article: CardArticle | null, index: number): Candidate => {
  const truth = sanitizeImpact(play.truth);
  const ip = sanitizeImpact(play.ip);
  const captures = sanitizeImpact(play.captures);
  const damage = sanitizeImpact(play.damage);
  const typeBonus = deriveTypeBonus(play.type);

  const truthScore = truth * TURN_METRIC_WEIGHTS.truth;
  const ipScore = ip * TURN_METRIC_WEIGHTS.ip;
  const captureScore = captures * TURN_METRIC_WEIGHTS.captures;
  const damageScore = damage * TURN_METRIC_WEIGHTS.damage;
  const score = truthScore + ipScore + captureScore + damageScore + typeBonus;

  return {
    index,
    play,
    article,
    metrics: {
      truth,
      ip,
      captures,
      damage,
      typeBonus,
      score: Math.round(score * 100) / 100,
    },
  } satisfies Candidate;
};

const determineTone = (focus: Candidate[]): ArticleBlock['tone'] => {
  let truthCount = 0;
  let governmentCount = 0;
  for (const candidate of focus) {
    if (candidate.play.faction === 'truth') {
      truthCount += 1;
    } else if (candidate.play.faction === 'government') {
      governmentCount += 1;
    }
  }
  if (truthCount > governmentCount) {
    return 'truth';
  }
  if (governmentCount > truthCount) {
    return 'government';
  }
  return 'draw';
};

const buildFallbackHeadline = (focus: Candidate[]): string => {
  if (focus.length === 0) {
    return 'Archive quiet as agents regroup.';
  }
  const parts = focus.map(candidate => candidate.article?.headline?.trim() || candidate.play.name.trim());
  return cleanLines(parts).join(' + ') || 'Archive quiet as agents regroup.';
};

const selectImagePrompt = (focus: Candidate[]): string | undefined => {
  const sorted = [...focus].sort((a, b) => b.metrics.score - a.metrics.score || a.index - b.index);
  for (const candidate of sorted) {
    const prompt = candidate.article?.imagePrompt?.trim();
    if (prompt) {
      return prompt;
    }
  }
  return undefined;
};

const extractBody = (article: CardArticle | null): string[] => {
  if (!article?.body) {
    return [];
  }
  return cleanLines(article.body.split(/\n+/));
};

const buildMainArticle = (
  log: TurnLog,
  focus: Candidate[],
  tone: ArticleBlock['tone'],
): ArticleBlock => {
  const hed = buildFallbackHeadline(focus);
  const dekCandidate = focus.find(entry => entry.article?.subhead?.trim());
  const dek = dekCandidate?.article?.subhead?.trim() || 'Composite desk stitches the nightly briefing together.';
  const bylineCandidate = focus.find(entry => entry.article?.byline?.trim());
  const byline = bylineCandidate?.article?.byline?.trim() || 'By: Composite Desk';
  const source = 'Source: Composite Turn Desk';

  const bulletLines: string[] = [];
  for (const entry of focus) {
    const articleLine = entry.article?.subhead?.trim() || entry.article?.headline?.trim();
    if (articleLine) {
      bulletLines.push(articleLine);
      continue;
    }
    const typeLabel = entry.play.type.toLowerCase();
    bulletLines.push(`${entry.play.name} reports ${typeLabel} maneuvers in motion.`);
  }

  const bullets = cleanLines(bulletLines);
  const body = cleanLines(
    focus.flatMap(entry => extractBody(entry.article).map(line => `${entry.play.name}: ${line}`)),
  );

  const imagePrompt = selectImagePrompt(focus);

  return {
    tone,
    hed,
    dek,
    bullets: bullets.length ? bullets : ['Pressroom scribes condense the overnight maneuvers.'],
    byline,
    source,
    body: body.length ? body : undefined,
    imagePrompt,
    kicker: `Turn ${log.turn} Dispatch`,
  } satisfies ArticleBlock;
};

const buildRunnerUpArticle = (candidate: Candidate): ArticleBlock => {
  const tone: ArticleBlock['tone'] = candidate.article?.tone === 'truth'
    || candidate.article?.tone === 'government'
    ? candidate.article.tone
    : candidate.play.faction;
  const hed = candidate.article?.headline?.trim() || candidate.play.name;
  const dek = candidate.article?.subhead?.trim() || `${candidate.play.name} files a classified brief.`;
  const bullets = cleanLines(extractBody(candidate.article));
  const fallbackBullet = `${candidate.play.name} (${candidate.play.type}) impact score ${candidate.metrics.score.toFixed(1)}.`;

  return {
    tone,
    hed,
    dek,
    bullets: bullets.length ? bullets : [fallbackBullet],
    byline: candidate.article?.byline?.trim() || 'By: Field Desk',
    source: candidate.play.faction === 'truth' ? 'Source: Truth Wire' : 'Source: Official Communiqué',
    body: bullets.length ? bullets : undefined,
    imagePrompt: candidate.article?.imagePrompt?.trim() || undefined,
  } satisfies ArticleBlock;
};

const aggregateMetrics = (focus: Candidate[]): TurnCompositeMetrics => {
  const truthRaw = focus.reduce((total, entry) => total + entry.metrics.truth, 0);
  const ipRaw = focus.reduce((total, entry) => total + entry.metrics.ip, 0);
  const captureRaw = focus.reduce((total, entry) => total + entry.metrics.captures, 0);
  const damageRaw = focus.reduce((total, entry) => total + entry.metrics.damage, 0);
  const typeBonus = focus.reduce((total, entry) => total + entry.metrics.typeBonus, 0);

  const truth = toWeightedMetric(truthRaw, TURN_METRIC_WEIGHTS.truth);
  const ip = toWeightedMetric(ipRaw, TURN_METRIC_WEIGHTS.ip);
  const captures = toWeightedMetric(captureRaw, TURN_METRIC_WEIGHTS.captures);
  const damage = toWeightedMetric(damageRaw, TURN_METRIC_WEIGHTS.damage);

  const total = Math.round((truth.weighted + ip.weighted + captures.weighted + damage.weighted + typeBonus) * 100) / 100;

  return {
    cards: focus.length,
    truth,
    ip,
    captures,
    damage,
    typeBonus: Math.round(typeBonus * 100) / 100,
    total,
  } satisfies TurnCompositeMetrics;
};

export const composeTurn = (
  log: TurnLog,
  options: ComposeTurnOptions = {},
): TurnComposite | null => {
  if (!log.plays.length) {
    return null;
  }

  const articleCache = options.articleCache ?? getPerCardArticlesIfReady();
  const candidates: Candidate[] = log.plays.map((play, index) => {
    const article = articleCache?.get(play.id) ?? null;
    return computeCandidate(play, article, index);
  });

  const sorted = [...candidates].sort((a, b) => {
    if (b.metrics.score !== a.metrics.score) {
      return b.metrics.score - a.metrics.score;
    }
    return a.index - b.index;
  });

  const focus = sorted.slice(0, 3);
  const focusOrdered = [...focus].sort((a, b) => a.index - b.index);
  const tone = determineTone(focusOrdered);

  const mainArticle = buildMainArticle(log, focusOrdered, tone);
  const runnersUp = candidates
    .filter(candidate => !focus.includes(candidate))
    .sort((a, b) => a.index - b.index)
    .map(buildRunnerUpArticle);

  const metrics = aggregateMetrics(focusOrdered);
  const focusIds = focusOrdered.map(entry => entry.play.id).filter(Boolean);
  const signature = focusIds.length ? focusIds.join(',') : null;
  const seedInput = options.seed ?? `${log.round}:${log.turn}:${signature ?? 'none'}`;
  const seed = typeof seedInput === 'number' && Number.isFinite(seedInput)
    ? seedInput >>> 0
    : hashSeed(String(seedInput));

  return {
    round: log.round,
    turn: log.turn,
    plays: log.plays.map(play => ({ ...play })),
    focus: focusOrdered.map(entry => ({ ...entry.play })),
    tone,
    main: mainArticle,
    runnersUp,
    metrics,
    signature,
    seed,
  } satisfies TurnComposite;
};
