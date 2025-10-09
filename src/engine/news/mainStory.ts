import type { CardArticle } from './articleBank';

export type PlayedCardMeta = {
  id: string;
  name: string;
  type: 'ATTACK' | 'MEDIA' | 'ZONE';
  faction: 'TRUTH' | 'GOV';
};

export type GeneratedStory = {
  headline: string;
  subhead?: string;
  tone: 'truth' | 'government';
  usedCards: string[];
  debug?: { commonTags: string[]; subject: string; parts: string[]; templateId: string };
};

const MYTH = new Set(['alien', 'ufo', 'ghost', 'cryptid', 'bigfoot', 'mothman', 'bat-boy', 'elvis']);
const BAD = new Set(['attack', 'media', 'zone']);

const TRUTH_VERBS = {
  ATTACK: ['EXPOSES', 'BUSTS', 'LEAKS', 'BLOWS LID OFF', 'IGNITES', 'BREAKS'],
  MEDIA: ['GOES VIRAL', 'BROADCASTS', 'TRENDING', 'LEAKS TO PUBLIC', 'STREAMS LIVE'],
  ZONE: ['ERUPTS IN', 'SWEEPS ACROSS', 'HAUNTS', 'OVERWHELMS', 'INVADES'],
} as const;

const TRUTH_CONNECTORS = [
  'WHILE', 'AS', 'JUST AS', 'AMID', 'DURING'
] as const;

const TRUTH_CLOSERS = [
  'OFFICIALS SCRAMBLE', 'COVER-UP CRUMBLES', 'CHAOS ENSUES', 
  'GOVERNMENT IN DENIAL', 'TRUTH SPREADS', 'REALITY UNRAVELS'
] as const;

const GOV = {
  EUPH: ['ROUTINE INCIDENT', 'ADMINISTRATIVE TEST', 'BENIGN ANOMALY', 'TRAINING EXERCISE', 'LOCALIZED PHENOMENON'],
  SUBJECT: ['MATTER', 'SITUATION', 'DEVELOPMENT', 'OCCURRENCE', 'EVENT'],
  STATUS: ['CONTAINED', 'RESOLVED', 'NORMALIZED', 'STABILIZED', 'CONCLUDED'],
  CLOSER: ['NOTHING TO SEE HERE', 'ALL ACCORDING TO PLAN', 'SITUATION NORMAL', 'NO CAUSE FOR ALARM'],
} as const;

function seedPick<T>(arr: readonly T[], seed: string): T {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
  }
  return arr[Math.abs(h) % arr.length];
}

function intersectNonTechTags(arts: (CardArticle | null)[]): string[] {
  const sets = arts.map(a => new Set((a?.tags ?? []).filter(t => !BAD.has(t))));
  if (!sets.length) return [];
  const out: string[] = [];
  sets[0].forEach(t => {
    if (sets.every(s => s.has(t))) out.push(t);
  });
  return out.sort();
}

function chooseSubject(arts: (CardArticle | null)[], metas: PlayedCardMeta[]): string {
  const common = intersectNonTechTags(arts);
  const myth = common.find(t => MYTH.has(t));
  if (myth) {
    const match = metas.find(x => x.name.toLowerCase().includes(myth.replace('-', ' ')));
    if (match) return match.faction === 'TRUTH' ? match.name.toUpperCase() : titleCase(match.name);
  }
  let best = 0;
  let score = -1;
  arts.forEach((article, index) => {
    const value = (article?.tags ?? []).reduce((total, tag) => total + (MYTH.has(tag) ? 1 : 0), 0);
    if (value > score) {
      score = value;
      best = index;
    }
  });
  const meta = metas[best];
  return meta.faction === 'TRUTH' ? meta.name.toUpperCase() : titleCase(meta.name);
}

function titleCase(s: string) {
  return s.replace(/\w\S*/g, word => word[0].toUpperCase() + word.slice(1).toLowerCase());
}
function clampLen(s: string, n = 160) {
  return s.length > n ? `${s.slice(0, n - 1)}…` : s;
}
function sanitize(s: string) {
  return s
    .replace(/\s*[|✦]+\s*/g, ' ')
    .replace(/\s+—\s+—/g, ' — ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export function generateMainStory(
  played: PlayedCardMeta[],
  lookup: (id: string) => CardArticle | null,
): GeneratedStory {
  if (played.length !== 3) throw new Error('generateMainStory expects exactly 3 cards.');
  const articles = played.map(card => lookup(card.id));
  const tone: 'truth' | 'government' = played[0].faction === 'TRUTH' ? 'truth' : 'government';
  const seed = played.map(card => card.id).join('|');
  const commonTags = intersectNonTechTags(articles);
  const subject = chooseSubject(articles, played);

  let headline = '';
  let subhead = '';
  let parts: string[] = [];

  if (tone === 'truth') {
    const [a, b, c] = played;
    const v1 = seedPick(TRUTH_VERBS[a.type], `${seed}a`);
    const connector = seedPick(TRUTH_CONNECTORS, `${seed}conn`);
    const closer = seedPick(TRUTH_CLOSERS, `${seed}close`);
    
    // Create a coherent narrative structure
    headline = `${subject.toUpperCase()} ${v1} ${connector} ${b.name.toUpperCase()} ${seedPick(TRUTH_VERBS[b.type], `${seed}b`)} — ${closer}`;
    
    const tagContext = commonTags.length ? ` involving ${commonTags.slice(0, 2).join(' and ')}` : '';
    subhead = clampLen(
      `Triple sighting reported${tagContext}. Witnesses describe escalating paranormal activity. Officials deny everything while clutching classified folders.`,
    );
    parts = [v1, connector, closer];
  } else {
    const euph = seedPick(GOV.EUPH, `${seed}e`);
    const subjectType = seedPick(GOV.SUBJECT, `${seed}subj`);
    const status = seedPick(GOV.STATUS, `${seed}stat`);
    const closer = seedPick(GOV.CLOSER, `${seed}close`);
    
    // Government-style bureaucratic headline
    headline = `${euph.toUpperCase()} IN ${subject.toUpperCase()} ${subjectType.toUpperCase()} — ${status.toUpperCase()}`;
    
    subhead = `Multi-department coordination ensures optimal transparency. ${closer}. Further inquiries will be addressed through proper channels after review.`;
    parts = [euph, status, closer];
  }

  headline = sanitize(headline);
  subhead = sanitize(subhead);

  return {
    headline,
    subhead,
    tone,
    usedCards: played.map(card => card.id),
    debug: { commonTags, subject, parts, templateId: tone === 'truth' ? 'T1' : 'G1' },
  } satisfies GeneratedStory;
}
