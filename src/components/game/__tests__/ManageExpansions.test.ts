import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import type { GameCard } from '@/rules/mvp';
import { summarizeExpansionCards } from '@/components/game/manageExpansions.helpers';
import { EXPANSION_MANIFEST } from '@/data/expansions';
import { updateEnabledExpansions } from '@/data/expansions/state';
import { DEFAULT_DISTRIBUTION_SETTINGS, weightedDistribution } from '@/data/weightedCardDistribution';

type ExpansionPackSnapshot = (typeof EXPANSION_MANIFEST)[number];

const cloneManifest = (manifest: ExpansionPackSnapshot[]): ExpansionPackSnapshot[] =>
  manifest.map(pack => ({
    ...pack,
    cards: pack.cards.map(card => ({ ...card })),
    metadata: pack.metadata ? { ...pack.metadata } : undefined,
  }));

describe('summarizeExpansionCards', () => {
  const originalManifest = cloneManifest(EXPANSION_MANIFEST);

  beforeEach(async () => {
    EXPANSION_MANIFEST.splice(0, EXPANSION_MANIFEST.length);
    await updateEnabledExpansions([]);
    weightedDistribution.updateSettings({
      ...DEFAULT_DISTRIBUTION_SETTINGS,
      setWeights: { ...DEFAULT_DISTRIBUTION_SETTINGS.setWeights },
    });
  });

  afterEach(async () => {
    EXPANSION_MANIFEST.splice(0, EXPANSION_MANIFEST.length, ...cloneManifest(originalManifest));
    await updateEnabledExpansions([]);
    weightedDistribution.updateSettings({
      ...DEFAULT_DISTRIBUTION_SETTINGS,
      setWeights: { ...DEFAULT_DISTRIBUTION_SETTINGS.setWeights },
    });
  });

  it('counts cards for expansions added after initial manifest load', () => {
    const cryptidsCard: GameCard = {
      id: 'cryptid-test',
      name: 'Mothman',
      type: 'ATTACK',
      faction: 'truth',
      rarity: 'common',
      cost: 2,
      extId: 'cryptids',
    };

    // Without a manifest entry the card should be ignored
    expect(summarizeExpansionCards([cryptidsCard])).toEqual({});

    EXPANSION_MANIFEST.push({
      id: 'cryptids',
      title: 'Cryptids',
      fileName: 'cryptids.json',
      cardCount: 1,
      cards: [cryptidsCard],
      metadata: { name: 'Cryptids' },
    });

    expect(summarizeExpansionCards([cryptidsCard])).toEqual({ cryptids: 1 });
  });

  it('allows weighted distribution to draw from enabled expansion packs', async () => {
    const cryptidsCards: GameCard[] = [
      {
        id: 'cryptid-alpha',
        name: 'Mothman',
        type: 'ATTACK',
        faction: 'truth',
        rarity: 'common',
        cost: 2,
        extId: 'cryptids',
      },
      {
        id: 'cryptid-beta',
        name: 'Jersey Devil',
        type: 'MEDIA',
        faction: 'truth',
        rarity: 'uncommon',
        cost: 3,
        extId: 'cryptids',
      },
    ];

    EXPANSION_MANIFEST.push({
      id: 'cryptids',
      title: 'Cryptids',
      fileName: 'cryptids.json',
      cardCount: cryptidsCards.length,
      cards: cryptidsCards,
      metadata: { name: 'Cryptids' },
    });

    await updateEnabledExpansions(['cryptids']);

    weightedDistribution.updateSettings({
      mode: 'expansion-only',
      duplicateLimit: 10,
      setWeights: { core: 0, cryptids: 1 },
    });

    const deck = weightedDistribution.generateWeightedDeck(6, 'truth');

    expect(deck.length).toBeGreaterThan(0);
    expect(deck.every(card => card.extId === 'cryptids')).toBe(true);
  });
});
