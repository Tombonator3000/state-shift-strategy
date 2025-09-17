import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CARD_DATABASE } from '@/data/cardDatabase';
import { normalizeFaction } from '@/data/mvpAnalysisUtils';

interface ManageExpansionsProps {
  onClose: () => void;
}

const ManageExpansions = ({ onClose }: ManageExpansionsProps) => {
  const stats = useMemo(() => {
    const totals = {
      types: new Map<string, number>(),
      factions: { truth: 0, government: 0, neutral: 0 },
      rarities: new Map<string, number>(),
    };

    CARD_DATABASE.forEach(card => {
      totals.types.set(card.type, (totals.types.get(card.type) ?? 0) + 1);
      const faction = normalizeFaction(card.faction);
      totals.factions[faction] += 1;
      if (card.rarity) {
        totals.rarities.set(card.rarity, (totals.rarities.get(card.rarity) ?? 0) + 1);
      }
    });

    return {
      totalCards: CARD_DATABASE.length,
      types: Array.from(totals.types.entries()),
      factions: totals.factions,
      rarities: Array.from(totals.rarities.entries()),
    };
  }, []);

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
            CORE SET OVERVIEW
          </h1>
          <p className="text-sm text-newspaper-text/80">
            Extension loading is paused for the MVP sprint. Review core inventory below.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-6 border-2 border-newspaper-text bg-newspaper-bg">
            <h2 className="font-bold text-xl text-newspaper-text mb-4">Faction Breakdown</h2>
            <div className="space-y-3 text-sm text-newspaper-text">
              <div className="flex items-center justify-between">
                <span>Truth Seekers</span>
                <Badge variant="outline">{stats.factions.truth}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Government</span>
                <Badge variant="outline">{stats.factions.government}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Neutral</span>
                <Badge variant="outline">{stats.factions.neutral}</Badge>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-2 border-newspaper-text bg-newspaper-bg">
            <h2 className="font-bold text-xl text-newspaper-text mb-4">Type Inventory</h2>
            <div className="space-y-3 text-sm text-newspaper-text">
              {stats.types.map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="uppercase">{type}</span>
                  <Badge variant="outline">{count}</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card className="mt-6 p-6 border-2 border-newspaper-text bg-newspaper-bg">
          <h2 className="font-bold text-xl text-newspaper-text mb-4">Rarity Spread</h2>
          <div className="grid gap-4 md:grid-cols-4 text-sm text-newspaper-text">
            {stats.rarities.length === 0 && <div>No rarities assigned yet.</div>}
            {stats.rarities.map(([rarity, count]) => (
              <div key={rarity} className="flex flex-col items-center gap-1">
                <span className="uppercase font-semibold">{rarity}</span>
                <Badge variant="outline">{count}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <div className="mt-6 text-sm text-newspaper-text/80 space-y-2">
          <p>Total MVP-ready cards: {stats.totalCards}</p>
          <p>
            Want to prototype new content? Tag it as core and run balancing from the dashboard.
          </p>
          <p>
            Extension toggles will return after the MVP launch window when additional mechanics are revalidated.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default ManageExpansions;
