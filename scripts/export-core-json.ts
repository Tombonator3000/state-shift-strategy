import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { glob } from 'glob';
import type { GameCard } from '../src/types/cardTypes';
import { normalizeEffects } from '../src/engine/normalizeEffects';

// seeded rng based on mulberry32
function xmur3(str: string): () => number {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^= h >>> 16) >>> 0;
  };
}

function mulberry32(a: number): () => number {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(arr: T[], rng: () => number) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

async function collectCoreCards(): Promise<GameCard[]> {
  const files = await glob('src/data/core/**/*.{ts,tsx,js,json}');
  const cards: GameCard[] = [];

  for (const file of files) {
    const mod = await import(path.resolve(file));
    for (const key of Object.keys(mod)) {
      const val = (mod as any)[key];
      if (Array.isArray(val) && val.length && typeof val[0] === 'object' && 'id' in val[0]) {
        cards.push(...val);
      }
    }
    if (Array.isArray(mod?.cards)) {
      cards.push(...mod.cards);
    }
    if (Array.isArray(mod?.default)) {
      cards.push(...mod.default);
    }
  }

  return cards;
}

async function main() {
  const cards = await collectCoreCards();
  cards.forEach(c => {
    c.effects = normalizeEffects(c.effects as any);
  });

  const deck = cards.map(c => c.id);
  const seed = xmur3('core-deck')();
  const rng = mulberry32(seed);
  shuffle(deck, rng);

  const out = { cards, deck };
  const json = JSON.stringify(out, null, 2);
  fs.writeFileSync('src/data/core.json', json);
  fs.mkdirSync('public/data', { recursive: true });
  fs.writeFileSync('public/data/core.json', json);

  const hash = crypto.createHash('sha256').update(json).digest('base64');
  fs.writeFileSync('public/data/core.sha256', hash);

  console.log(`Exported ${cards.length} cards. Deck size: ${deck.length}. SHA256: ${hash}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
