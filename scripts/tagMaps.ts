import * as path from 'node:path';

export type Card = {
  id?: string;
  name?: string;
  type?: 'ATTACK' | 'MEDIA' | 'ZONE' | string;
  faction?: 'TRUTH' | 'GOV' | string;
  tags?: string[];
  [k: string]: unknown;
};

export type DeckFile = string;

export type TagRule = {
  pattern: RegExp;
  tags: string[];
};

export const TARGET_FILES: DeckFile[] = [
  'src/data/core/core_truth_MVP_balanced.json',
  'src/data/core/core_government_MVP_balanced.json',
  'public/extensions/cryptids.json',
  'public/extensions/halloween_spooktacular_with_temp_image.json',
];

export const EXPANSION_HINT: Record<string, string[]> = {
  'cryptids.json': ['cryptid'],
  'halloween_spooktacular_with_temp_image.json': ['halloween'],
};

export const NAME_TAG_RULES: TagRule[] = [
  { pattern: /\bbigfoot\b|\bsasquatch\b/i, tags: ['cryptid', 'bigfoot'] },
  { pattern: /\bmothman\b/i, tags: ['cryptid', 'mothman'] },
  { pattern: /\bbat[\s-]?boy\b/i, tags: ['bat-boy', 'cryptid'] },
  { pattern: /\belvis\b/i, tags: ['elvis'] },
  { pattern: /\bufo\b/i, tags: ['ufo'] },
  { pattern: /\balien(s)?\b/i, tags: ['alien'] },
  { pattern: /\broswell\b/i, tags: ['roswell'] },
  { pattern: /\barea[\s-]?51\b/i, tags: ['area51'] },
  { pattern: /\bghost\b|\bhaunted\b|\bspirit\b/i, tags: ['ghost', 'haunted'] },
  { pattern: /\bflorida\b/i, tags: ['florida-man'] },
  { pattern: /\bblue[\s-]?beam\b/i, tags: ['blue-beam'] },
  { pattern: /\bmockingbird\b/i, tags: ['mockingbird'] },
  { pattern: /\bchemtrail(s)?\b/i, tags: ['chemtrail'] },
  { pattern: /\bmen in (black|charcoal)\b/i, tags: ['mib'] },
  {
    pattern: /\b(plaza|mall|swamp|woods|forest|lighthouse|stadium|cornfield|walmart|hangar|highway|park|tower)\b/i,
    tags: ['location'],
  },
  {
    pattern: /\b(press|report|files|memo|camera|leak|radio|tv|podcast|livestream|broadcast|tabloid)\b/i,
    tags: ['media'],
  },
  { pattern: /\b(protest|rally|march)\b/i, tags: ['protest'] },
];

export const COVERUP_BUREAUCRACY_PATTERN = /\b(report|files|memo|brief|bureau|ministry|department|project|operation)\b/i;

export const toKebab = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

export const uniqSort = (arr: string[]) => Array.from(new Set(arr.map(toKebab))).sort();

export const applyNameHeuristics = (name: string): string[] => {
  const tags: string[] = [];
  for (const rule of NAME_TAG_RULES) {
    if (rule.pattern.test(name)) {
      tags.push(...rule.tags);
    }
  }
  return tags;
};

export const inferFactionTag = (file: string, card: Card): string => {
  const faction = (card.faction || '').toUpperCase();
  if (faction === 'TRUTH' || /truth/i.test(file)) {
    return 'truth';
  }
  if (faction === 'GOV' || faction === 'GOVERNMENT' || /govern/i.test(file)) {
    return 'government';
  }
  return /ministry|department|bureau|protocol|official|brief/i.test(card.name || '') ? 'government' : 'truth';
};

export const inferTypeTag = (card: Card): string => {
  const t = (card.type || '').toUpperCase();
  if (t === 'ATTACK' || t === 'MEDIA' || t === 'ZONE') {
    return t.toLowerCase();
  }
  return 'zone';
};

export const resolveExpansionTags = (file: string): string[] => {
  const base = path.basename(file);
  return EXPANSION_HINT[base] ?? [];
};

