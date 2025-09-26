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

  const CardItem = ({ card }: { card: GameCard }) => {
    const cardStats = getCardStats(card.id);

    return (
      <button
        type="button"
        onClick={() => setSelectedCard(card)}
        className="w-full text-left"
        aria-label={`View details for ${card.name}`}
      >
        <div className="rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/50">
          <div className="mb-2 flex items-start justify-between">
            <h3 className="text-lg font-bold text-foreground">{card.name}</h3>
            <div className="flex gap-2">
              <Badge variant={card.rarity === 'legendary' ? 'destructive'
                : card.rarity === 'rare' ? 'secondary' : 'outline'}>
                {card.rarity}
              </Badge>
              <Badge variant="outline">{normalizeCardType(card.type)}</Badge>
            </div>
          </div>

          <p className="mb-3 text-sm text-muted-foreground">{card.text}</p>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Cost: {card.cost} IP</span>
            <span>Played: {cardStats.timesPlayed} times</span>
          </div>

          {(card.flavor ?? card.flavorGov ?? card.flavorTruth) && (
            <div className="mt-2 rounded bg-accent/30 p-2 text-xs italic text-muted-foreground">
              "{card.flavor ?? card.flavorGov ?? card.flavorTruth}"
            </div>
          )}
        </div>
      </button>
    );
  };

  return (
    <div className={`flex h-full flex-col ${className ?? ''}`}>
      <div className="flex items-start justify-between gap-4 pb-4">
        <div>
          <h2 className="flex items-center gap-3 text-xl font-bold text-foreground">
            📚 Card Collection
            <span className="text-sm font-normal text-muted-foreground">
              {stats.discoveredCards}/{stats.totalCards} cards ({stats.completionPercentage}%)
            </span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Browse discovered cards, filter by type or rarity, and review usage stats.
          </p>
        </div>
        {onClose && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close card collection"
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 pb-4 sm:grid-cols-3">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">{stats.discoveredCards}</div>
          <div className="text-sm text-muted-foreground">Cards Discovered</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-secondary">{stats.totalPlays}</div>
          <div className="text-sm text-muted-foreground">Total Plays</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-accent">{stats.completionPercentage}%</div>
          <div className="text-sm text-muted-foreground">Complete</div>
        </div>
      </div>

      <Progress value={stats.completionPercentage} className="mb-4" />

      <div className="mb-4 flex flex-col gap-4 sm:flex-row">
        <Input
          placeholder="Search cards..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="MEDIA">Media</SelectItem>
            <SelectItem value="ZONE">Zone</SelectItem>
            <SelectItem value="ATTACK">Attack</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterRarity} onValueChange={setFilterRarity}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Rarity" />
          </SelectTrigger>
          <SelectContent>
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
          <div className="py-8 text-center text-muted-foreground">
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
      <DialogContent className="flex max-h-[90vh] max-w-4xl flex-col">
        <CardCollectionContent
          isActive={open}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CardCollection;