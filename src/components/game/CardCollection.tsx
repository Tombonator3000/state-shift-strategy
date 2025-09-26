import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useCardCollection } from '@/hooks/useCardCollection';
import type { GameCard, MVPCardType } from '@/rules/mvp';
import { MVP_CARD_TYPES } from '@/rules/mvp';
import CardDetailOverlay from '@/components/game/CardDetailOverlay';

interface CardCollectionContentProps {
  isActive?: boolean;
  onClose?: () => void;
  className?: string;
}

export const CardCollectionContent = ({
  isActive = true,
  onClose,
  className,
}: CardCollectionContentProps) => {
  const { getDiscoveredCards, getCardStats, getCollectionStats } = useCardCollection();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterRarity, setFilterRarity] = useState<string>('all');
  const [selectedCard, setSelectedCard] = useState<GameCard | null>(null);

  useEffect(() => {
    if (!isActive) {
      setSelectedCard(null);
    }
  }, [isActive]);

  const stats = getCollectionStats();
  const discoveredCards = getDiscoveredCards();

  const normalizeCardType = (type: string): MVPCardType => {
    return MVP_CARD_TYPES.includes(type as MVPCardType) ? type as MVPCardType : 'MEDIA';
  };

  const filteredCards = discoveredCards.filter(card => {
    const matchesSearch = card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.text.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || normalizeCardType(card.type) === filterType;
    const matchesRarity = filterRarity === 'all' || card.rarity === filterRarity;

    return matchesSearch && matchesType && matchesRarity;
  });

  const getRarityClasses = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return 'border border-fuchsia-400/60 bg-fuchsia-500/10 text-fuchsia-200';
      case 'rare':
        return 'border border-sky-400/60 bg-sky-500/10 text-sky-200';
      case 'uncommon':
        return 'border border-emerald-400/60 bg-emerald-500/10 text-emerald-200';
      default:
        return 'border border-slate-500/60 bg-slate-900/60 text-slate-300';
    }
  };

  const CardItem = ({ card }: { card: GameCard }) => {
    const cardStats = getCardStats(card.id);

    return (
      <button
        type="button"
        onClick={() => setSelectedCard(card)}
        className="w-full text-left"
        aria-label={`View details for ${card.name}`}
      >
        <div className="group relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-slate-950/70 p-5 transition-all hover:border-emerald-400/40 hover:bg-slate-950/80 hover:shadow-[0_0_25px_rgba(16,185,129,0.25)]">
          <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-60">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.2),_transparent_60%)]" />
          </div>
          <div className="relative mb-3 flex flex-wrap items-start justify-between gap-3">
            <h3 className="text-lg font-semibold text-emerald-100">{card.name}</h3>
            <div className="flex flex-wrap gap-2">
              <Badge className={getRarityClasses(card.rarity)}>{card.rarity}</Badge>
              <Badge className="border border-slate-500/60 bg-slate-900/60 text-slate-300">
                {normalizeCardType(card.type)}
              </Badge>
            </div>
          </div>

          <p className="mb-3 text-sm text-slate-300">{card.text}</p>

          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-emerald-200/80">
            <span>Cost: {card.cost} IP</span>
            <span>Played: {cardStats.timesPlayed} times</span>
          </div>

          {(card.flavor ?? card.flavorGov ?? card.flavorTruth) && (
            <div className="mt-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs italic text-emerald-100/70">
              "{card.flavor ?? card.flavorGov ?? card.flavorTruth}"
            </div>
          )}
        </div>
      </button>
    );
  };

  return (
    <div className={`flex h-full flex-col gap-5 text-slate-200 ${className ?? ''}`}>
      <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-slate-950/85 px-5 py-4 shadow-[0_0_35px_rgba(16,185,129,0.2)]">
        <div className="pointer-events-none absolute inset-0 opacity-45">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(56,189,248,0.25),_transparent_60%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(135deg,_rgba(16,185,129,0.16),_transparent_50%,_rgba(56,189,248,0.14))]" />
        </div>
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="font-mono text-xs uppercase tracking-[0.35em] text-emerald-200/80">Card Intelligence</div>
            <h2 className="font-mono text-xl font-semibold uppercase tracking-[0.2em] text-emerald-100">CARD COLLECTION</h2>
            <p className="max-w-xl text-sm text-emerald-100/70">
              Browse discovered cards, filter by type or rarity, and review usage stats across the operation.
            </p>
          </div>
          {onClose && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              aria-label="Close card collection"
              className="border-emerald-400/30 bg-slate-950/60 text-slate-300 transition hover:bg-emerald-500/20 hover:text-emerald-100"
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 pb-2 sm:grid-cols-3">
        <div className="rounded-2xl border border-emerald-500/20 bg-slate-950/75 p-4 text-center shadow-[0_0_20px_rgba(16,185,129,0.15)]">
          <div className="text-2xl font-bold text-emerald-200">{stats.discoveredCards}</div>
          <div className="text-xs uppercase tracking-[0.3em] text-slate-400">Cards Discovered</div>
        </div>
        <div className="rounded-2xl border border-emerald-500/20 bg-slate-950/75 p-4 text-center shadow-[0_0_20px_rgba(16,185,129,0.15)]">
          <div className="text-2xl font-bold text-sky-200">{stats.totalPlays}</div>
          <div className="text-xs uppercase tracking-[0.3em] text-slate-400">Total Plays</div>
        </div>
        <div className="rounded-2xl border border-emerald-500/20 bg-slate-950/75 p-4 text-center shadow-[0_0_20px_rgba(16,185,129,0.15)]">
          <div className="text-2xl font-bold text-emerald-100">{stats.completionPercentage}%</div>
          <div className="text-xs uppercase tracking-[0.3em] text-slate-400">Complete</div>
        </div>
      </div>

      <Progress value={stats.completionPercentage} className="h-2 rounded-full bg-slate-900/60" />

      <div className="flex flex-col gap-4 sm:flex-row">
        <Input
          placeholder="Search cards..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 rounded-xl border border-emerald-500/30 bg-slate-950/70 px-4 py-2 text-slate-200 placeholder:text-slate-500 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/40"
        />
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full rounded-xl border border-emerald-500/30 bg-slate-950/70 px-4 py-2 text-slate-200 sm:w-40">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent className="border border-emerald-500/30 bg-slate-950/95 text-slate-200">
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="MEDIA">Media</SelectItem>
            <SelectItem value="ZONE">Zone</SelectItem>
            <SelectItem value="ATTACK">Attack</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterRarity} onValueChange={setFilterRarity}>
          <SelectTrigger className="w-full rounded-xl border border-emerald-500/30 bg-slate-950/70 px-4 py-2 text-slate-200 sm:w-40">
            <SelectValue placeholder="Rarity" />
          </SelectTrigger>
          <SelectContent className="border border-emerald-500/30 bg-slate-950/95 text-slate-200">
            <SelectItem value="all">All Rarities</SelectItem>
            <SelectItem value="common">Common</SelectItem>
            <SelectItem value="uncommon">Uncommon</SelectItem>
            <SelectItem value="rare">Rare</SelectItem>
            <SelectItem value="legendary">Legendary</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredCards.length === 0 ? (
          <div className="flex h-full items-center justify-center rounded-2xl border border-emerald-500/20 bg-slate-950/70 text-slate-400">
            {discoveredCards.length === 0
              ? 'Start playing to discover cards!'
              : 'No cards match your search criteria.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {filteredCards.map(card => (
              <CardItem key={card.id} card={card} />
            ))}
          </div>
        )}
      </div>

      {selectedCard && (
        <CardDetailOverlay
          card={selectedCard}
          canAfford={false}
          disabled
          onClose={() => setSelectedCard(null)}
          onPlayCard={() => setSelectedCard(null)}
        />
      )}
    </div>
  );
};

interface CardCollectionProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CardCollection = ({ open, onOpenChange }: CardCollectionProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-4xl flex-col border border-emerald-500/30 bg-slate-950/95 text-slate-100 shadow-[0_0_60px_rgba(16,185,129,0.25)]">
        <CardCollectionContent
          isActive={open}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CardCollection;
