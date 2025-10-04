import * as fs from 'node:fs';
import * as path from 'node:path';

import {
  applyNameHeuristics,
  Card,
  COVERUP_BUREAUCRACY_PATTERN,
  DeckFile,
  inferFactionTag,
  inferTypeTag,
  resolveExpansionTags,
  TARGET_FILES,
  uniqSort,
} from './tagMaps';

type ProcessResult = {
  file: string;
  changed: boolean;
  count: number;
};

const mergeTags = (base: string[], extras: string[]) => uniqSort([...base, ...extras]);

const ensureMinimums = (tags: string[], factionTag: string, typeTag: string, expansionTags: string[]) =>
  uniqSort([...tags, factionTag, typeTag, ...expansionTags]);

export const processCard = (file: string, card: Card): Card => {
  const name = card.name || '';
  const existing = Array.isArray(card.tags) ? card.tags : [];
  const factionTag = inferFactionTag(file, card);
  const typeTag = inferTypeTag(card);
  const expansionTags = resolveExpansionTags(file);

  let tags = mergeTags(existing, applyNameHeuristics(name));

  const conflictingTag = factionTag === 'truth' ? 'government' : 'truth';
  tags = tags.filter((tag) => tag !== conflictingTag);

  if (COVERUP_BUREAUCRACY_PATTERN.test(name)) {
    tags = mergeTags(tags, ['bureaucracy', 'coverup']);
  }

  tags = ensureMinimums(tags, factionTag, typeTag, expansionTags);

  return { ...card, tags };
};

const loadJson = (p: string): unknown => JSON.parse(fs.readFileSync(p, 'utf-8'));

const saveJson = (p: string, data: unknown) => fs.writeFileSync(p, JSON.stringify(data, null, 2) + '\n');

const isCard = (value: unknown): value is Card => typeof value === 'object' && value !== null;

const isCardArray = (value: unknown): value is Card[] => Array.isArray(value) && value.every(isCard);

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

const processDeckFile = (file: DeckFile, checkOnly = false): ProcessResult => {
  const full = path.resolve(process.cwd(), file);
  if (!fs.existsSync(full)) {
    console.warn(`[skip] Not found: ${file}`);
    return { file, changed: false, count: 0 };
  }

  const data = loadJson(full);
  let changed = false;
  let count = 0;

  const mutateCard = (c: Card) => processCard(file, c);

  const before = JSON.stringify(data);

  if (isCardArray(data)) {
    for (let i = 0; i < data.length; i += 1) {
      data[i] = mutateCard(data[i]);
      count += 1;
    }
  } else if (isRecord(data)) {
    const record = data;
    const keys = ['cards', 'deck', 'data', 'list', 'items'];
    let touched = false;
    for (const key of keys) {
      const value = record[key];
      if (isCardArray(value)) {
        record[key] = value.map(mutateCard);
        count += value.length;
        touched = true;
      }
    }
    if (!touched) {
      for (const [key, value] of Object.entries(record)) {
        if (isCardArray(value)) {
          record[key] = value.map(mutateCard);
          count += value.length;
        }
      }
    }
  }

  const after = JSON.stringify(data);
  changed = before !== after;

  if (!checkOnly && changed) {
    saveJson(full, data);
  }

  return { file, changed, count };
};

export const runTagging = (checkOnly = false) => {
  const results = TARGET_FILES.map((f) => processDeckFile(f, checkOnly));
  const total = results.reduce((acc, result) => acc + result.count, 0);
  const changed = results.filter((r) => r.changed).map((r) => r.file);

  console.log(`Processed cards: ${total}`);
  if (checkOnly) {
    if (changed.length) {
      console.error(`Tagging differences detected in: ${changed.join(', ')}`);
      process.exitCode = 2;
    } else {
      console.log('All files already properly tagged.');
    }
  } else {
    console.log(changed.length ? `Updated: ${changed.join(', ')}` : 'No changes needed.');
  }

  return { results, changed };
};

const main = () => {
  const checkOnly = process.argv.includes('--check');
  runTagging(checkOnly);
};

if (process.argv[1]?.endsWith('tagCards.ts')) {
  main();
}

export { ensureMinimums, mergeTags, processDeckFile };

