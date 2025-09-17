import fs from 'fs';
import path from 'path';

// Local type definitions for ingestion to match MVP schema
export type Rarity = 'common' | 'uncommon' | 'rare' | 'legendary';
export type EffectsATTACK = { ipDelta: { opponent: number }; discardOpponent?: number };
export type EffectsMEDIA = { truthDelta: number };
export type EffectsZONE = { pressureDelta: number };
export type Effects = EffectsATTACK | EffectsMEDIA | EffectsZONE;

export type GameCard = {
  id: string;
  name: string;
  faction: 'truth' | 'government';
  type: 'ATTACK' | 'MEDIA' | 'ZONE';
  rarity: Rarity;
  cost: number;
  effects: Effects;
  flavor?: string;
};

type Faction = GameCard['faction'];

const ROOT = process.cwd();
const CORE_DIR = path.resolve(ROOT, 'src', 'data', 'core');

const TRUTH_SOURCE = path.join(CORE_DIR, 'core_truth_MVP_balanced.json');
const GOVERNMENT_SOURCE = path.join(CORE_DIR, 'core_government_MVP_balanced.json');
const IMPORT_PATH = '@/rules/mvp';
const CARDS_PER_BATCH = 50;
const EXPECTED_BATCHES = 4;

function readCards(filePath: string, expectedFaction: Faction): GameCard[] {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing source file: ${filePath}`);
  }

  const raw = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(raw) as GameCard[];

  if (!Array.isArray(data)) {
    throw new Error(`Invalid card payload in ${path.basename(filePath)}`);
  }

  if (data.length !== CARDS_PER_BATCH * EXPECTED_BATCHES) {
    throw new Error(
      `Unexpected card count in ${path.basename(filePath)}: expected ${CARDS_PER_BATCH * EXPECTED_BATCHES}, got ${data.length}`,
    );
  }

  const mismatched = data.filter((card) => card.faction !== expectedFaction);
  if (mismatched.length > 0) {
    throw new Error(
      `Faction mismatch in ${path.basename(filePath)}: expected all ${expectedFaction}, found ${mismatched.length} mismatches`,
    );
  }

  return data;
}

function chunkCards(cards: GameCard[]): GameCard[][] {
  const chunks: GameCard[][] = [];

  for (let i = 0; i < EXPECTED_BATCHES; i++) {
    const start = i * CARDS_PER_BATCH;
    const end = start + CARDS_PER_BATCH;
    const chunk = cards.slice(start, end);

    if (chunk.length !== CARDS_PER_BATCH) {
      throw new Error(`Chunk ${i + 1} has ${chunk.length} cards (expected ${CARDS_PER_BATCH})`);
    }

    chunks.push(chunk);
  }

  return chunks;
}

function writeBatchFile(prefix: Faction, batchIndex: number, cards: GameCard[]): void {
  const exportName = `${prefix}Batch${batchIndex + 1}`;
  const fileName = `${prefix}-batch-${batchIndex + 1}.ts`;
  const serializedCards = JSON.stringify(cards, null, 2);

  const contents = `import type { GameCard } from '${IMPORT_PATH}';\n\n` +
    `export const ${exportName}: GameCard[] = ${serializedCards};\n`;

  fs.writeFileSync(path.join(CORE_DIR, fileName), contents, 'utf8');
}

function writeBatches(cards: GameCard[], prefix: Faction): void {
  const chunks = chunkCards(cards);

  chunks.forEach((chunk, index) => {
    writeBatchFile(prefix, index, chunk);
  });
}

function main(): void {
  const truthCards = readCards(TRUTH_SOURCE, 'truth');
  const governmentCards = readCards(GOVERNMENT_SOURCE, 'government');

  writeBatches(truthCards, 'truth');
  writeBatches(governmentCards, 'government');

  console.log('[INGEST] Wrote 8 batch files to src/data/core/');
}

main();
