import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useCardCollection } from '@/hooks/useCardCollection';
import type { GameCard, MVPCardType } from '@/rules/mvp';
import { CARD_DATABASE } from '@/data/cardDatabase';
import { MVP_CARD_TYPES } from '@/rules/mvp';

interface CardCollectionProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CardCollection = ({ open, onOpenChange }: CardCollectionProps) => {
  const { getDiscoveredCards, getCardStats, getCollectionStats } = useCardCollection();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterRarity, setFilterRarity] = useState<string>('all');
  
  const stats = getCollectionStats();
  const discoveredCards = getDiscoveredCards();
  
  const normalizeCardType = (type: string): MVPCardType => {
    return MVP_CARD_TYPES.includes(type as MVPCardType) ? type as MVPCardType : 'MEDIA';
  };

  // Filter cards based on search and filters
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
      <div className="bg-card border border-border rounded-lg p-4 hover:bg-accent/50 transition-colors">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-bold text-lg text-foreground">{card.name}</h3>
          <div className="flex gap-2">
            <Badge variant={card.rarity === 'legendary' ? 'destructive' : 
                           card.rarity === 'rare' ? 'secondary' : 'outline'}>
              {card.rarity}
            </Badge>
            <Badge variant="outline">{normalizeCardType(card.type)}</Badge>
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground mb-3">{card.text}</p>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Cost: {card.cost} IP</span>
          <span>Played: {cardStats.timesPlayed} times</span>
        </div>
        
        {(card.flavor ?? card.flavorGov ?? card.flavorTruth) && (
          <div className="mt-2 p-2 bg-accent/30 rounded text-xs italic text-muted-foreground">
            "{card.flavor ?? card.flavorGov ?? card.flavorTruth}"
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-4">
            📚 Card Collection
            <div className="text-sm text-muted-foreground">
              {stats.discoveredCards}/{stats.totalCards} cards ({stats.completionPercentage}%)
            </div>
          </DialogTitle>
        </DialogHeader>
        
        {/* Collection Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4">
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
        
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <Input
            placeholder="Search cards..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-40">
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
            <SelectTrigger className="w-40">
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
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm('');
              setFilterType('all');
              setFilterRarity('all');
            }}
            className="flex-none whitespace-nowrap"
          >
            Reset filters
          </Button>
        </div>
        
        {/* Cards Grid */}
        <div className="flex-1 overflow-y-auto">
          {filteredCards.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {discoveredCards.length === 0 ? 
                "Start playing to discover cards!" : 
                "No cards match your search criteria."
              }
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCards.map(card => (
                <CardItem key={card.id} card={card} />
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CardCollection;