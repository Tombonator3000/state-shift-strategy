import { describe, expect, it } from 'vitest';
import { validateMvpCard } from '@/utils/validate-mvp';
import {
  ensureExpansionManifest,
  loadEnabledExpansions,
  type ExpansionPack,
} from '@/data/expansions';
import { pickCardMVP } from '@/data/weightedCardDistribution';

const getPack = (manifest: ExpansionPack[], id: string): ExpansionPack => {
  const pack = manifest.find(entry => entry.id === id);
  if (!pack) {
    throw new Error(`Missing expansion pack: ${id}`);
  }
  return pack;
};

describe('builtin expansion packs', () => {
  it('normalize to MVP-valid cards', async () => {
    const manifest = await ensureExpansionManifest();
    const truthPack = getPack(manifest, 'truth-new');
    const govPack = getPack(manifest, 'gov-new');

    for (const card of [...truthPack.cards, ...govPack.cards]) {
      const validation = validateMvpCard(card);
      expect(validation.ok).toBe(true);
    }
  });

  it('participate in random MVP draws when enabled', async () => {
    const manifest = await ensureExpansionManifest();
    const truthPack = getPack(manifest, 'truth-new');
    const govPack = getPack(manifest, 'gov-new');
    const expansionCards = await loadEnabledExpansions(['truth-new', 'gov-new']);

    expect(expansionCards.length).toBeGreaterThan(0);

    const truthIds = new Set(truthPack.cards.map(card => card.id));
    const govIds = new Set(govPack.cards.map(card => card.id));

    const truthLegendary = pickCardMVP(expansionCards, 'truth', 'MEDIA', 'legendary');
    expect(truthLegendary).toBeDefined();
    expect(truthLegendary && truthIds.has(truthLegendary.id)).toBe(true);

    const govRareZone = pickCardMVP(expansionCards, 'government', 'ZONE', 'rare');
    expect(govRareZone).toBeDefined();
    expect(govRareZone && govIds.has(govRareZone.id)).toBe(true);
  });
});
