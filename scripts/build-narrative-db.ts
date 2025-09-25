import { mkdir, readFile, writeFile } from 'fs/promises';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';

type RawEffects = {
  truthDelta?: number;
  truth?: number;
  ipDelta?: { opponent?: number | null | undefined } | null;
  ipOpponent?: number;
  pressureDelta?: number;
};

type RawCard = {
  id: string;
  name: string;
  faction: string;
  type: string;
  rarity?: string;
  cost?: number;
  effects?: RawEffects | null;
  tags?: string[];
};

type ExpansionFile = {
  id: string;
  name: string;
  cards: RawCard[];
};

interface NarrativeEffectProfile {
  truthDelta?: number;
  ipOpponent?: number;
  pressureDelta?: number;
}

interface NarrativeCardRecord {
  id: string;
  name: string;
  faction: string;
  type: string;
  rarity?: string;
  cost?: number;
  setId: string;
  setName: string;
  tags?: string[];
  effects: NarrativeEffectProfile | null;
}

interface NarrativeDatabaseOutput {
  generatedAt: string;
  cardCount: number;
  sets: Record<string, { id: string; name: string; count: number }>;
  cards: Record<string, NarrativeCardRecord>;
}

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const readJson = async <T,>(relativePath: string): Promise<T> => {
  const filePath = resolve(ROOT, relativePath);
  const data = await readFile(filePath, 'utf8');
  return JSON.parse(data) as T;
};

const collectCoreCards = async (): Promise<NarrativeCardRecord[]> => {
  const truthCards = await readJson<RawCard[]>('src/data/core/core_truth_MVP_balanced.json');
  const governmentCards = await readJson<RawCard[]>('src/data/core/core_government_MVP_balanced.json');

  const decorate = (cards: RawCard[], setId: string, setName: string): NarrativeCardRecord[] => {
    return cards.map(card => ({
      id: card.id,
      name: card.name,
      faction: card.faction,
      type: card.type,
      rarity: card.rarity,
      cost: card.cost,
      setId,
      setName,
      tags: card.tags,
      effects: extractEffects(card.effects ?? null),
    }));
  };

  return [
    ...decorate(truthCards, 'core-truth', 'Core Truth Deck'),
    ...decorate(governmentCards, 'core-government', 'Core Government Deck'),
  ];
};

const collectExpansionCards = async (): Promise<NarrativeCardRecord[]> => {
  const index = await readJson<string[]>('public/extensions/index.json');
  const records: NarrativeCardRecord[] = [];
  for (const file of index) {
    const expansion = await readJson<ExpansionFile>(join('public/extensions', file));
    const setId = expansion.id ?? file.replace(/\.json$/i, '');
    const setName = expansion.name ?? setId;
    for (const card of expansion.cards ?? []) {
      records.push({
        id: card.id,
        name: card.name,
        faction: card.faction,
        type: card.type,
        rarity: card.rarity,
        cost: card.cost,
        setId,
        setName,
        tags: card.tags,
        effects: extractEffects(card.effects ?? null),
      });
    }
  }
  return records;
};

const extractEffects = (effects: RawEffects | null): NarrativeEffectProfile | null => {
  if (!effects) {
    return null;
  }
  const profile: NarrativeEffectProfile = {};
  if (typeof effects.truthDelta === 'number') {
    profile.truthDelta = effects.truthDelta;
  } else if (typeof effects.truth === 'number') {
    profile.truthDelta = effects.truth;
  }
  const ipCandidate = effects.ipOpponent ?? effects.ipDelta?.opponent;
  if (typeof ipCandidate === 'number') {
    profile.ipOpponent = ipCandidate;
  }
  if (typeof effects.pressureDelta === 'number') {
    profile.pressureDelta = effects.pressureDelta;
  }
  return Object.keys(profile).length ? profile : null;
};

const writeNarrativeDb = async (records: NarrativeCardRecord[]): Promise<void> => {
  const cards = [...records];
  cards.sort((a, b) => a.id.localeCompare(b.id));

  const sets: NarrativeDatabaseOutput['sets'] = {};
  for (const card of cards) {
    const entry = sets[card.setId] ?? { id: card.setId, name: card.setName, count: 0 };
    entry.count += 1;
    sets[card.setId] = entry;
  }

  const payload: NarrativeDatabaseOutput = {
    generatedAt: new Date().toISOString(),
    cardCount: cards.length,
    sets,
    cards: Object.fromEntries(cards.map(card => [card.id, card])),
  };

  const outputPath = resolve(ROOT, 'public/data/NarrativeDB.json');
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, JSON.stringify(payload, null, 2));

  console.log(`[NarrativeDB] Generated ${cards.length} cards across ${Object.keys(sets).length} sets.`);
};

async function main() {
  const coreCards = await collectCoreCards();
  const expansionCards = await collectExpansionCards();
  const combined = [...coreCards, ...expansionCards];

  const unique = new Map<string, NarrativeCardRecord>();
  for (const card of combined) {
    if (!card.id || unique.has(card.id)) {
      continue;
    }
    unique.set(card.id, card);
  }

  await writeNarrativeDb([...unique.values()]);
}

main().catch(error => {
  console.error('[NarrativeDB] build failed', error);
  process.exitCode = 1;
});
