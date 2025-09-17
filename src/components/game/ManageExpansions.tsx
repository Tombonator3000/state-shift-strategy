import { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { GameCard } from '@/rules/mvp';
import { getCoreCards } from '@/data/cardDatabase';
import { normalizeFaction } from '@/data/mvpAnalysisUtils';
import { EXPANSION_MANIFEST } from '@/data/expansions';
import {
  getEnabledExpansionIdsSnapshot,
  getExpansionCardsSnapshot,
  subscribeToExpansionChanges,
} from '@/data/expansions/state';

interface ManageExpansionsProps {
  onClose: () => void;
}

interface StatBlock {
  totalCards: number;
  types: Array<[string, number]>;
  factions: { truth: number; government: number; neutral: number };
  rarities: Array<[string, number]>;
}

const computeStats = (cards: GameCard[]): StatBlock => {
  const typeCounts = new Map<string, number>();
  const rarityCounts = new Map<string, number>();
  const factions = { truth: 0, government: 0, neutral: 0 };

  cards.forEach(card => {
    typeCounts.set(card.type, (typeCounts.get(card.type) ?? 0) + 1);
    const faction = normalizeFaction(card.faction);
    factions[faction] += 1;
    if (card.rarity) {
      rarityCounts.set(card.rarity, (rarityCounts.get(card.rarity) ?? 0) + 1);
    }
  });

  return {
    totalCards: cards.length,
    types: Array.from(typeCounts.entries()),
    factions,
    rarities: Array.from(rarityCounts.entries()),
  };
};

const groupCardsByExpansion = (cards: GameCard[]): Map<string, number> => {
  const counts = new Map<string, number>();
  cards.forEach(card => {
    if (!card.extId) return;
    counts.set(card.extId, (counts.get(card.extId) ?? 0) + 1);
  });
  return counts;
};

const ManageExpansions = ({ onClose }: ManageExpansionsProps) => {
  const [coreCards] = useState<GameCard[]>(() => getCoreCards());
  const [expansionState, setExpansionState] = useState(() => ({
    ids: getEnabledExpansionIdsSnapshot(),
    cards: getExpansionCardsSnapshot(),
  }));

  useEffect(() => {
    const unsubscribe = subscribeToExpansionChanges(payload => {
      setExpansionState(payload);
    });
    return () => unsubscribe();
  }, []);

  const coreStats = useMemo(() => computeStats(coreCards), [coreCards]);
  const expansionStats = useMemo(
    () => computeStats(expansionState.cards),
    [expansionState.cards],
  );
  const combinedStats = useMemo(
    () => computeStats([...coreCards, ...expansionState.cards]),
    [coreCards, expansionState.cards],
  );

  const cardsByExpansion = useMemo(
    () => groupCardsByExpansion(expansionState.cards),
    [expansionState.cards],
  );

  const expansionDetails = useMemo(
    () =>
      EXPANSION_MANIFEST.map(pack => ({
        id: pack.id,
        title: pack.title,
        enabled: expansionState.ids.includes(pack.id),
        count: cardsByExpansion.get(pack.id) ?? 0,
      })),
    [cardsByExpansion, expansionState.ids],
  );

  const typeKeys = useMemo(() => {
    const keys = new Set<string>();
    coreStats.types.forEach(([type]) => keys.add(type));
    expansionStats.types.forEach(([type]) => keys.add(type));
    return Array.from(keys).sort();
  }, [coreStats.types, expansionStats.types]);

  const rarityKeys = useMemo(() => {
    const keys = new Set<string>();
    coreStats.rarities.forEach(([rarity]) => keys.add(rarity));
    expansionStats.rarities.forEach(([rarity]) => keys.add(rarity));
    return Array.from(keys).sort();
  }, [coreStats.rarities, expansionStats.rarities]);

  const coreTypeMap = useMemo(() => new Map(coreStats.types), [coreStats.types]);
  const expansionTypeMap = useMemo(
    () => new Map(expansionStats.types),
    [expansionStats.types],
  );
  const coreRarityMap = useMemo(() => new Map(coreStats.rarities), [coreStats.rarities]);
  const expansionRarityMap = useMemo(
    () => new Map(expansionStats.rarities),
    [expansionStats.rarities],
  );

  const activeExpansionNames = expansionDetails
    .filter(detail => detail.enabled && detail.count > 0)
    .map(detail => detail.title)
    .join(', ');

  return (
    <div className="min-h-screen bg-newspaper-bg flex items-center justify-center p-8 relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute bg-newspaper-text h-6"
            style={{
              width: `${Math.random() * 300 + 100}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              transform: `rotate(${Math.random() * 4 - 2}deg)`
            }}
          />
        ))}
      </div>

      <Card className="max-w-4xl w-full p-8 bg-newspaper-bg border-4 border-newspaper-text animate-redacted-reveal relative" style={{ fontFamily: 'serif' }}>
        <div className="absolute top-4 right-4 text-red-600 font-mono text-xs transform rotate-12 border-2 border-red-600 p-2">
          TOP SECRET
        </div>
        <div className="absolute bottom-4 left-4 text-red-600 font-mono text-xs transform -rotate-12 border-2 border-red-600 p-2">
          EYES ONLY
        </div>

        <Button
          onClick={onClose}
          variant="outline"
          className="absolute top-4 left-4 border-newspaper-text text-newspaper-text hover:bg-newspaper-text/10"
        >
          ← BACK TO BASE
        </Button>

        <div className="text-center mb-8 mt-8">
          <h1 className="text-4xl font-bold text-newspaper-text mb-2">
            EXPANSION CONTROL ROOM
          </h1>
          <p className="text-sm text-newspaper-text/80">
            Review the core inventory and MVP-approved expansion packs.
          </p>
          <p className="text-xs text-newspaper-text/60 mt-2">
            Toggle packs via Options → Expansion Content. Only ATTACK, MEDIA and ZONE cards that pass the MVP whitelist are enabled.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-4 border-2 border-newspaper-text bg-newspaper-bg">
            <div className="text-xs uppercase text-newspaper-text/70">Core Set</div>
            <div className="text-2xl font-bold text-newspaper-text">{coreStats.totalCards}</div>
            <div className="text-xs text-newspaper-text/60">Recovered MVP-ready cards</div>
          </Card>
          <Card className="p-4 border-2 border-newspaper-text bg-newspaper-bg">
            <div className="text-xs uppercase text-newspaper-text/70">Expansions</div>
            <div className="text-2xl font-bold text-newspaper-text">{expansionStats.totalCards}</div>
            <div className="text-xs text-newspaper-text/60">
              {activeExpansionNames ? `Active packs: ${activeExpansionNames}` : 'No expansion packs enabled'}
            </div>
          </Card>
          <Card className="p-4 border-2 border-newspaper-text bg-newspaper-bg">
            <div className="text-xs uppercase text-newspaper-text/70">Total Pool</div>
            <div className="text-2xl font-bold text-newspaper-text">{combinedStats.totalCards}</div>
            <div className="text-xs text-newspaper-text/60">Core + expansions feeding deck builders</div>
          </Card>
        </div>

        <Card className="mt-6 p-6 border-2 border-newspaper-text bg-newspaper-bg">
          <h2 className="font-bold text-xl text-newspaper-text mb-4">Expansion Packs</h2>
          <div className="space-y-3 text-sm text-newspaper-text">
            {expansionDetails.map(detail => (
              <div key={detail.id} className="flex flex-col gap-1 border border-dashed border-newspaper-text/30 p-3 rounded">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{detail.title}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{detail.count} cards</Badge>
                    <Badge
                      variant={detail.enabled ? 'default' : 'outline'}
                      className={detail.enabled ? 'bg-green-700 hover:bg-green-600 border-green-700' : ''}
                    >
                      {detail.enabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                </div>
                <div className="text-xs text-newspaper-text/70">
                  {detail.enabled
                    ? 'Included in MVP deck construction.'
                    : 'Toggle on from Options to add these cards.'}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="grid gap-6 md:grid-cols-2 mt-6">
          <Card className="p-6 border-2 border-newspaper-text bg-newspaper-bg">
            <h2 className="font-bold text-xl text-newspaper-text mb-4">Faction Breakdown</h2>
            <div className="grid gap-4 md:grid-cols-2 text-sm text-newspaper-text">
              <div>
                <div className="text-xs uppercase text-newspaper-text/60 mb-2">Core</div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Truth Seekers</span>
                    <Badge variant="outline">{coreStats.factions.truth}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Government</span>
                    <Badge variant="outline">{coreStats.factions.government}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Neutral</span>
                    <Badge variant="outline">{coreStats.factions.neutral}</Badge>
                  </div>
                </div>
              </div>
              <div>
                <div className="text-xs uppercase text-newspaper-text/60 mb-2">Expansions</div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Truth Seekers</span>
                    <Badge variant="outline">{expansionStats.factions.truth}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Government</span>
                    <Badge variant="outline">{expansionStats.factions.government}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Neutral</span>
                    <Badge variant="outline">{expansionStats.factions.neutral}</Badge>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-2 border-newspaper-text bg-newspaper-bg">
            <h2 className="font-bold text-xl text-newspaper-text mb-4">Type Inventory</h2>
            <div className="space-y-3 text-sm text-newspaper-text">
              {typeKeys.map(type => (
                <div key={type} className="flex items-center justify-between">
                  <span className="uppercase">{type}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Core {coreTypeMap.get(type) ?? 0}</Badge>
                    <Badge variant="outline">Exp {expansionTypeMap.get(type) ?? 0}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card className="mt-6 p-6 border-2 border-newspaper-text bg-newspaper-bg">
          <h2 className="font-bold text-xl text-newspaper-text mb-4">Rarity Spread</h2>
          <div className="space-y-3 text-sm text-newspaper-text">
            {rarityKeys.length === 0 && <div>No rarities assigned yet.</div>}
            {rarityKeys.map(rarity => (
              <div key={rarity} className="flex items-center justify-between">
                <span className="uppercase font-semibold">{rarity}</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Core {coreRarityMap.get(rarity) ?? 0}</Badge>
                  <Badge variant="outline">Exp {expansionRarityMap.get(rarity) ?? 0}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="mt-6 text-sm text-newspaper-text/80 space-y-2">
          <p>Total MVP-ready cards: {combinedStats.totalCards}</p>
          <p>
            Expansion selections persist locally. Deck builders draw from the combined pool once packs are enabled.
          </p>
          <p>
            Keep new content within the MVP whitelist—ATTACK, MEDIA, and ZONE templates with baseline costs—to stay compatible with automated validation.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default ManageExpansions;
