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
  tone: 'truth' | 'gov';
  usedCards: string[];
  debug?: { commonTags: string[]; subject: string; parts: string[]; templateId: string };
};

const MYTH = new Set(['alien', 'ufo', 'ghost', 'cryptid', 'bigfoot', 'mothman', 'bat-boy', 'elvis']);
const BAD = new Set(['attack', 'media', 'zone']);

const TRUTH_VERBS = {
  ATTACK: ['EXPOSES', 'BUSTS', 'LEAKS', 'BLOWS LID OFF', 'IGNITES'],
  MEDIA: ['GOES LIVE', 'BROADCASTS', 'TRENDING', 'LEAKS'],
  ZONE: ['MARCHES', 'SURGES', 'ERUPTS', 'HAUNTS', 'SWEEPS'],
} as const;

const GOV = {
  EUPH: ['Routine Incident', 'Administrative Test', 'Benign Anomaly', 'Training Exercise', 'Localized Phenomenon'],
  MEDIA: ['Briefing Concluded', 'Statement Issued', 'Update Filed'],
  ATTACK: ['Mitigation Successful', 'Containment Ongoing', 'Review Open'],
  ZONE: ['Perimeter Established', 'Access Normalized', 'Calm Restored'],
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
  const tone: 'truth' | 'gov' = played[0].faction === 'TRUTH' ? 'truth' : 'gov';
  const seed = played.map(card => card.id).join('|');
  const commonTags = intersectNonTechTags(articles);
  const subject = chooseSubject(articles, played);

  let headline = '';
  let subhead = '';
  let parts: string[] = [];

  if (tone === 'truth') {
    const [a, b, c] = played;
    const v1 = seedPick(TRUTH_VERBS[a.type], `${seed}a`);
    const v2 = seedPick(TRUTH_VERBS[b.type], `${seed}b`);
    const v3 = seedPick(TRUTH_VERBS[c.type], `${seed}c`);
    const n2 = b.name.toUpperCase();
    const n3 = c.name.toUpperCase();

    headline = `${subject} ${v1} AS ${n2} ${v2} — ${n3} ${v3}!`;
    subhead = clampLen(
      `Witnesses report escalating weirdness${commonTags.length ? ` (${commonTags.slice(0, 2).join(', ')})` : ''}. Officials baffled; snacks remain excellent.`,
    );
    parts = [v1, v2, v3];
  } else {
    const [a, b, c] = played;
    const euph = seedPick(GOV.EUPH, `${seed}e`);
    const p1 = seedPick(GOV[a.type], `${seed}1`);
    const p2 = seedPick(GOV[b.type], `${seed}2`);
    const p3 = seedPick(GOV[c.type], `${seed}3`);
    headline = `${subject}: ${euph}; ${p1}; ${p2 === p1 ? seedPick(GOV[b.type], `${seed}2x`) : p2}`;
    headline += headline.includes(p3) ? '' : `; ${p3}`;
    subhead = 'Transparency achieved via prudent opacity. Further questions will be taken later, retroactively.';
    parts = [euph, p1, p2, p3];
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
