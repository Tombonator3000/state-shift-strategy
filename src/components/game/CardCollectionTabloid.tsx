import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useCardCollection } from '@/hooks/useCardCollection';
import type { GameCard } from '@/types/cardTypes';

interface CardCollectionTabloidProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CardCollectionTabloid = ({ open, onOpenChange }: CardCollectionTabloidProps) => {
  const { getDiscoveredCards, getCardStats, getCollectionStats } = useCardCollection();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterRarity, setFilterRarity] = useState<string>('all');
  
  const stats = getCollectionStats();
  const discoveredCards = getDiscoveredCards();
  
  // Filter cards based on search and filters
  const filteredCards = discoveredCards.filter(card => {
    const matchesSearch = card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         card.text.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || card.type === filterType;
    const matchesRarity = filterRarity === 'all' || card.rarity === filterRarity;
    
    return matchesSearch && matchesType && matchesRarity;
  });

  const CardItem = ({ card }: { card: GameCard }) => {
    const cardStats = getCardStats(card.id);
    
    return (
      <div className="border-2 border-black bg-white p-3 shadow-[2px_2px_0_#000] relative">
        {/* Rarity stamp */}
        {card.rarity === 'legendary' && (
          <div className="absolute -top-1 -right-1 bg-red-600 text-white px-1 py-0.5 text-[8px] font-black uppercase">
            RARE
          </div>
        )}
        {card.rarity === 'rare' && (
          <div className="absolute -top-1 -right-1 bg-black text-white px-1 py-0.5 text-[8px] font-black uppercase">
            SECRET
          </div>
        )}
        
        <div className="mb-2">
          <h3 className="font-black text-lg uppercase tracking-tight font-[Oswald,Impact,Arial-Black,system-ui,sans-serif]">
            {card.name}
          </h3>
          <div className="flex gap-1 mt-1">
            <div className="text-[10px] uppercase font-black px-1 py-0.5 bg-black text-white">
              {card.type}
            </div>
            <div className="text-[10px] uppercase font-black px-1 py-0.5 border border-black">
              {card.rarity}
            </div>
          </div>
        </div>
        
        <p className="text-xs mb-2 leading-tight">{card.text}</p>
        
        {/* Stats bar */}
        <div className="border-t border-black pt-2 mt-2">
          <div className="flex justify-between text-[10px] uppercase font-black">
            <span>Cost: {card.cost} IP</span>
            <span>Used: {cardStats.timesPlayed}x</span>
          </div>
        </div>
        
        {(card.flavor ?? card.flavorGov ?? card.flavorTruth) && (
          <div className="mt-2 p-2 bg-[#e9e9e9] border border-black text-[10px] italic">
            "{card.flavor ?? card.flavorGov ?? card.flavorTruth}"
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[95vh] bg-[var(--paper)] text-[var(--ink)] border-4 border-black p-0 overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Masthead */}
          <div className="border-b-4 border-black bg-white px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="text-3xl md:text-4xl font-black uppercase tracking-tight font-[Oswald,Impact,Arial-Black,system-ui,sans-serif]">
                TOP SECRET FILES REVEALED!
              </div>
              <Button 
                onClick={() => onOpenChange(false)}
                className="w-auto border-2 border-black bg-white text-black text-sm font-extrabold uppercase px-3 py-1 shadow-[2px_2px_0_#000] hover:shadow-[1px_1px_0_#000]"
              >
                CLOSE
              </Button>
            </div>
            <div className="mt-2 bg-black text-white font-black uppercase text-xs px-2 py-1 inline-block">
              CLASSIFIED CARD DATABASE EXPOSED!
            </div>
          </div>

          {/* Stats section */}
          <div className="border-b-2 border-black bg-white p-4">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="border-2 border-black p-2 text-center shadow-[2px_2px_0_#000]">
                <div className="text-2xl font-black uppercase">{stats.discoveredCards}</div>
                <div className="text-xs uppercase font-black">FILES FOUND</div>
              </div>
              <div className="border-2 border-black p-2 text-center shadow-[2px_2px_0_#000]">
                <div className="text-2xl font-black uppercase">{stats.totalPlays}</div>
                <div className="text-xs uppercase font-black">OPERATIONS</div>
              </div>
              <div className="border-2 border-black p-2 text-center shadow-[2px_2px_0_#000]">
                <div className="text-2xl font-black uppercase">{stats.completionPercentage}%</div>
                <div className="text-xs uppercase font-black">DECLASSIFIED</div>
              </div>
            </div>
            
            <div className="border-2 border-black bg-white p-2">
              <Progress 
                value={stats.completionPercentage} 
                className="h-3 bg-[#e9e9e9]"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="border-b-2 border-black bg-white p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                placeholder="SEARCH CLASSIFIED FILES..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-2 border-black bg-white text-black uppercase font-black text-xs"
              />
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="border-2 border-black bg-white text-black uppercase font-black text-xs">
                  <SelectValue placeholder="TYPE" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ALL TYPES</SelectItem>
                  <SelectItem value="MEDIA">MEDIA</SelectItem>
                  <SelectItem value="ZONE">ZONE</SelectItem>
                  <SelectItem value="ATTACK">ATTACK</SelectItem>
                  <SelectItem value="DEFENSIVE">DEFENSIVE</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterRarity} onValueChange={setFilterRarity}>
                <SelectTrigger className="border-2 border-black bg-white text-black uppercase font-black text-xs">
                  <SelectValue placeholder="CLEARANCE" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ALL LEVELS</SelectItem>
                  <SelectItem value="common">COMMON</SelectItem>
                  <SelectItem value="uncommon">UNCOMMON</SelectItem>
                  <SelectItem value="rare">RARE</SelectItem>
                  <SelectItem value="legendary">TOP SECRET</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="flex-1 overflow-y-auto p-4 bg-[var(--paper)]">
            {filteredCards.length === 0 ? (
              <div className="border-4 border-black bg-white p-8 text-center shadow-[4px_4px_0_#000]">
                <div className="text-2xl font-black uppercase mb-2">
                  {discoveredCards.length === 0 ? 
                    "NO FILES DECLASSIFIED YET!" : 
                    "NO MATCHING FILES FOUND!"
                  }
                </div>
                <div className="text-sm uppercase">
                  {discoveredCards.length === 0 ? 
                    "Start playing to uncover secret documents!" : 
                    "Try different search criteria, agent."
                  }
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredCards.map(card => (
                  <CardItem key={card.id} card={card} />
                ))}
              </div>
            )}
          </div>

          {/* Bottom fake ads */}
          <div className="border-t-2 border-black bg-white p-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div className="border border-black bg-white p-1 text-center text-[10px] uppercase font-black">
                CARD SLEEVES - PROTECT YOUR SECRETS!
              </div>
              <div className="border border-black bg-white p-1 text-center text-[10px] uppercase font-black">
                DECODER RINGS - CRACK ANY CODE!
              </div>
              <div className="border border-black bg-white p-1 text-center text-[10px] uppercase font-black">
                SHREDDERS - DESTROY THE EVIDENCE!
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CardCollectionTabloid;