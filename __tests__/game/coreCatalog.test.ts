import { describe, expect, it } from 'bun:test';
import { readdirSync } from 'node:fs';
import { CARD_DATABASE_CORE, CORE_CARD_SOURCES } from '@/data/core';
import { getCoreCards, loadCardPool } from '@/data/cardDatabase';
import { validateCardMVP } from '@/mvp/validator';

describe('real core card catalog', () => {
  it('registers every active core source and excludes the archive', () => {
    const files = readdirSync(new URL('../../src/data/core/', import.meta.url))
      .filter(name => name.endsWith('.ts') && name !== 'index.ts' && !name.startsWith('_')).sort();
    expect(Object.keys(CORE_CARD_SOURCES).sort()).toEqual(files);
  });

  it('loads the 400 base, 20 special and 4 comeback cards with distinct IDs', () => {
    expect(CARD_DATABASE_CORE.length).toBe(424);
    expect(new Set(CARD_DATABASE_CORE.map(card => card.id)).size).toBe(424);
    expect(CARD_DATABASE_CORE.filter(card => card.faction === 'truth').length).toBe(212);
    expect(CARD_DATABASE_CORE.filter(card => card.faction === 'government').length).toBe(212);
  });

  it('uses the real normalized pool, without the six-card fallback', async () => {
    const pool = await loadCardPool();
    expect(pool.length).toBe(424);
    expect(getCoreCards().map(card => card.id)).toEqual(pool.map(card => card.id));
    expect(pool.some(card => card.id === 'truth-media-mvp')).toBe(false);
    const invalid = pool.filter(card => !validateCardMVP(card).ok).map(card => card.id);
    expect(invalid).toEqual([]);
  });
});
