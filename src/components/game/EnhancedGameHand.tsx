import React, { useState } from 'react';
import CardImage from './CardImage';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GameCard } from '@/components/game/GameHand';
import { useAudio } from '@/hooks/useAudio';
import { toast } from '@/hooks/use-toast';
import { Loader2, Zap, Shield, Target, X, Eye } from 'lucide-react';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { useSwipeGestures } from '@/hooks/useSwipeGestures';
import { useIsMobile } from '@/hooks/use-mobile';
import { ExtensionCardBadge } from './ExtensionCardBadge';

interface EnhancedGameHandProps {
  cards: GameCard[];
  onPlayCard: (cardId: string) => void;
  disabled?: boolean;
  selectedCard?: string | null;
  onSelectCard?: (cardId: string) => void;
  maxCards?: number;
  currentIP: number;
  loadingCard?: string | null;
  onCardHover?: (card: GameCard | null) => void;
}

const EnhancedGameHand: React.FC<EnhancedGameHandProps> = ({ 
  cards, 
  onPlayCard, 
  disabled, 
  selectedCard,
  onSelectCard,
  maxCards = 7,
  currentIP,
  loadingCard,
  onCardHover
}) => {
  const [playingCard, setPlayingCard] = useState<string | null>(null);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const audio = useAudio();
  const { triggerHaptic } = useHapticFeedback();
  const isMobile = useIsMobile();

  const getRarityGlow = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'shadow-md';
      case 'uncommon': return 'shadow-md shadow-emerald-400/40';
      case 'rare': return 'shadow-lg shadow-blue-400/50';
      case 'legendary': return 'shadow-xl shadow-amber-400/60 animate-pulse';
      default: return 'shadow-md';
    }
  };

  const getRarityBorder = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-zinc-600';
      case 'uncommon': return 'border-emerald-400';
      case 'rare': return 'border-blue-400';
      case 'legendary': return 'border-amber-400';
      default: return 'border-zinc-600';
    }
  };

  const getRarityAccent = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-zinc-100 text-zinc-800';
      case 'uncommon': return 'bg-emerald-100 text-emerald-800';
      case 'rare': return 'bg-blue-100 text-blue-800';
      case 'legendary': return 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 font-bold';
      default: return 'bg-zinc-100 text-zinc-800';
    }
  };

  const getCardFaction = (card: GameCard) => {
    if (card.text.includes('Truth +')) return 'truth';
    if (card.text.includes('Truth -')) return 'government';
    return 'neutral';
  };

  const handlePlayCard = async (cardId: string) => {
    const card = cards.find(c => c.id === cardId);
    if (!card) return;
    
    if (!canAffordCard(card)) {
      audio.playSFX('lightClick');
      triggerHaptic('error');
      toast({
        title: "❌ Insufficient IP",
        description: `Need ${card.cost} IP to deploy "${card.name}". You have ${currentIP} IP.`,
        variant: "destructive",
      });
      return;
    }
    
    audio.playSFX('cardPlay');
    triggerHaptic('medium');
    setPlayingCard(cardId);
    
    toast({
      title: "🚀 Asset Deployed",
      description: `"${card.name}" is now active.`,
    });
    
    try {
      onPlayCard(cardId);
      triggerHaptic('success');
    } catch (error) {
      triggerHaptic('error');
      toast({
        title: "❌ Deployment Failed",
        description: "Asset deployment was interrupted. Try again.",
        variant: "destructive",
      });
    } finally {
      setPlayingCard(null);
    }
  };

  const canAffordCard = (card: GameCard) => currentIP >= card.cost;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-sm font-mono text-foreground">
          YOUR HAND
        </h3>
        <div className="text-xs font-mono text-muted-foreground">
          IP: {currentIP}
        </div>
      </div>
      
      {/* Hand cards */}
      <div className="space-y-1 relative">
        {cards.map((card, index) => {
          const isSelected = selectedCard === card.id;
          const isPlaying = playingCard === card.id;
          const isLoading = loadingCard === card.id;
          const isExpanded = expandedCard === card.id;
          const canAfford = canAffordCard(card);
          const faction = getCardFaction(card);
          
          return (
            <div key={`${card.id}-${index}`} className="relative">
              {/* Maximized Card Overlay */}
              {isExpanded && (
                <div 
                  className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999] p-4"
                  onClick={() => setExpandedCard(null)}
                >
                  <div 
                    className={`bg-card border-4 rounded-xl transform animate-scale-in flex flex-col w-full max-w-sm h-[85vh] ${
                      getRarityBorder(card.rarity)} ${getRarityGlow(card.rarity)} shadow-2xl`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex flex-col h-full p-6">
                      {/* Header with cost and close */}
                      <div className="flex justify-between items-center mb-4">
                        <div className={`rounded-full flex items-center justify-center font-bold w-16 h-16 text-2xl border-4 ${
                          canAfford ? 'bg-primary text-primary-foreground border-primary' : 'bg-destructive text-destructive-foreground border-destructive'
                        }`}>
                          {card.cost}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedCard(null)}
                          className="p-2"
                        >
                          <X className="w-6 h-6" />
                        </Button>
                      </div>
                      
                      {/* Title and type */}
                      <div className="text-center mb-4">
                        <h3 className="font-bold text-xl mb-3 text-foreground leading-tight">
                          {card.name}
                        </h3>
                        <Badge 
                          variant="outline" 
                          className={`text-sm px-4 py-2 ${
                            card.type === 'MEDIA' && faction === 'truth' ? 'bg-truth-red/20 border-truth-red text-truth-red' :
                            card.type === 'MEDIA' && faction === 'government' ? 'bg-government-blue/20 border-government-blue text-government-blue' :
                            card.type === 'ZONE' ? 'bg-warning/20 border-warning text-warning' :
                            card.type === 'ATTACK' ? 'bg-destructive/20 border-destructive text-destructive' :
                            'bg-muted/20 border-muted text-muted-foreground'
                          }`}
                        >
                          {card.type}
                        </Badge>
                      </div>
                      
                      {/* Scrollable content */}
                      <div className="flex-1 overflow-y-auto space-y-4">
                        {/* Card art */}
                        <div className="border-4 rounded-lg overflow-hidden h-32 bg-newspaper-text">
                          <CardImage cardId={card.id} className="w-full h-full" />
                        </div>
                        
                        {/* Effect section */}
                        <div>
                          <h4 className="text-sm font-bold mb-2 text-foreground">Effect</h4>
                          <p className="font-medium text-foreground bg-card/80 rounded-lg border-2 border-border p-4 text-center text-lg">
                            {card.text}
                          </p>
                          <div className="mt-3 text-sm text-center text-muted-foreground bg-accent/10 rounded-lg border border-accent/20 p-3">
                            {card.type === 'ATTACK' ? 'Deals IP damage.' : 
                             card.type === 'ZONE' ? 'Adds pressure to target state.' :
                             card.type === 'MEDIA' && faction === 'truth' ? 'Increases Truth meter.' :
                             card.type === 'MEDIA' && faction === 'government' ? 'Decreases Truth meter.' :
                             'Special strategic ability.'}
                          </div>
                        </div>
                        
                        {/* Flavor text */}
                        <div>
                          <h4 className="text-sm font-bold mb-2 text-muted-foreground">CLASSIFIED INTELLIGENCE</h4>
                          <div className="italic text-foreground border-l-4 border-truth-red bg-truth-red/10 rounded-r border border-truth-red/20 p-3 text-sm">
                            "{card.flavorTruth}"
                          </div>
                        </div>
                      </div>
                      
                      {/* Deploy button */}
                      <div className="pt-4 border-t-2 border-border">
                        <Button
                          onClick={() => {
                            if (!canAfford) {
                              triggerHaptic('error');
                              toast({
                                title: "❌ Insufficient IP",
                                description: `Need ${card.cost} IP to deploy "${card.name}".`,
                                variant: "destructive",
                              });
                              return;
                            }
                            
                            audio.playSFX('cardPlay');
                            triggerHaptic('medium');
                            
                            if (card.type === 'ZONE') {
                              onSelectCard?.(card.id);
                              setExpandedCard(null);
                              toast({
                                title: "🎯 Zone Targeting Active",
                                description: "Click on a neutral or enemy state to deploy!",
                              });
                            } else {
                              handlePlayCard(card.id);
                              setExpandedCard(null);
                            }
                          }}
                          className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/80 text-primary-foreground"
                          disabled={!canAfford}
                        >
                          <Zap className="w-6 h-6 mr-2" />
                          DEPLOY ASSET
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Minimized Card */}
              <div 
                data-card-id={card.id}
                className={`
                  enhanced-button card-hover-glow group relative cursor-pointer transition-all duration-300
                  bg-card border-2 rounded-lg flex items-center gap-2
                  ${isMobile ? 'p-4 min-h-[80px]' : 'p-2'}
                  ${isSelected ? 'ring-2 ring-warning scale-105 z-10 shadow-lg shadow-warning/50' : ''}
                  ${isPlaying || isLoading ? 'animate-pulse scale-105 z-50 ring-2 ring-primary shadow-lg shadow-primary/50' : 'hover:scale-[1.03] hover:shadow-md'}
                  ${!canAfford && !disabled ? 'opacity-60 saturate-50 cursor-not-allowed' : 'hover:bg-accent/20'}
                  ${getRarityBorder(card.rarity)}
                  ${getRarityGlow(card.rarity)}
                  active:scale-95 hover:-translate-y-0.5
                `}
                style={{ 
                  animationDelay: `${index * 0.05}s`,
                  transform: (isPlaying || isLoading) ? 'scale(1.05) translateY(-2px)' : undefined,
                  zIndex: (isPlaying || isLoading) ? 1000 : undefined
                }}
                onClick={(e) => {
                  e.preventDefault();
                  audio.playSFX('click');
                  triggerHaptic('selection');
                  
                  // Expand card to maximized state
                  if (expandedCard === card.id) {
                    setExpandedCard(null);
                  } else {
                    setExpandedCard(card.id);
                  }
                }}
                onMouseEnter={() => {
                  if (!isMobile) {
                    audio.playSFX('lightClick');
                    onCardHover?.(card);
                  }
                }}
                onMouseLeave={() => {
                  if (!isMobile) {
                    onCardHover?.(null);
                  }
                }}
              >
               {/* Enhanced loading/targeting overlay */}
               {(isLoading || isPlaying) && (
                 <div className="absolute inset-0 bg-primary/20 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center z-20">
                   <Loader2 className="w-5 h-5 animate-spin text-primary mb-1" />
                   <span className="text-xs font-mono text-primary font-bold">
                     {isPlaying ? 'DEPLOYING' : 'PROCESSING'}
                   </span>
                 </div>
               )}
               
               {/* Selection overlay for zone targeting */}
               {isSelected && !isLoading && !isPlaying && (
                 <div className="absolute inset-0 bg-warning/15 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center z-20 animate-pulse">
                   <Target className="w-6 h-6 text-warning mb-1 animate-bounce" />
                   <span className="text-xs font-mono text-warning font-bold">
                     {card.type === 'ZONE' ? 'SELECT TARGET' : 'READY TO DEPLOY'}
                   </span>
                 </div>
               )}
               
               {/* Enhanced Cost Badge */}
               <div className={`rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 border-2 transition-all duration-200 ${
                 isMobile ? 'w-12 h-12 text-sm' : 'w-8 h-8'
               } ${
                 canAfford ? 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/30' : 'bg-destructive text-destructive-foreground border-destructive shadow-md shadow-destructive/30 animate-pulse'
               }`}>
                 {card.cost}
               </div>
               
               {/* Card Name and Rarity */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`font-bold text-foreground truncate ${isMobile ? 'text-base' : 'text-sm'}`}>{card.name}</span>
                    <span className={`px-1.5 py-0.5 rounded-full ${isMobile ? 'text-xs' : 'text-xs'} ${getRarityAccent(card.rarity)}`}>
                      {card.rarity.toUpperCase()}
                    </span>
                    <ExtensionCardBadge cardId={card.id} />
                  </div>
                  <div className={`text-muted-foreground truncate max-w-[200px] ${isMobile ? 'text-sm' : 'text-xs'}`}>{card.text}</div>
                </div>
              
              {/* Enhanced Type Badge */}
              <Badge 
                variant="outline" 
                className={`text-xs px-2 py-1 flex-shrink-0 flex items-center gap-1 transition-all duration-200 ${
                  card.type === 'MEDIA' && faction === 'truth' ? 'bg-truth-red/20 border-truth-red text-truth-red shadow-sm' :
                  card.type === 'MEDIA' && faction === 'government' ? 'bg-government-blue/20 border-government-blue text-government-blue shadow-sm' :
                  card.type === 'ZONE' ? 'bg-warning/20 border-warning text-warning shadow-sm' :
                  card.type === 'ATTACK' ? 'bg-destructive/20 border-destructive text-destructive shadow-sm' :
                  'bg-muted/20 border-muted text-muted-foreground shadow-sm'
                }`}
              >
                {card.type === 'ZONE' && <Target className="w-3 h-3" />}
                {card.type === 'ATTACK' && <Zap className="w-3 h-3" />}
                {card.type === 'DEFENSIVE' && <Shield className="w-3 h-3" />}
                {card.type}
              </Badge>

                {/* Selection indicator for zone targeting */}
                {isSelected && card.type === 'ZONE' && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-warning text-warning-foreground text-xs font-bold flex items-center justify-center ring-2 ring-warning/50 animate-pulse">
                    🎯
                  </div>
                )}
                {/* Regular selection indicator */}
                {isSelected && card.type !== 'ZONE' && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-yellow-400 ring-2 ring-yellow-400/50" />
                )}
                
                {/* Extension badge overlay */}
                <ExtensionCardBadge cardId={card.id} variant="overlay" />
              </div>
            </div>
          );
        })}
      </div>
      
      {cards.length === 0 && (
        <div className="text-center text-muted-foreground text-sm font-mono py-8 border border-dashed border-muted rounded-lg">
          No assets available
        </div>
      )}
    </div>
  );
};

export default EnhancedGameHand;