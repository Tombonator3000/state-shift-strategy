// UI Component for displaying ongoing card effects
// Shows persistent effects that last multiple turns

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, Zap, Shield, TrendingUp } from 'lucide-react';
import type { OngoingEffect } from '@/types/cardEffects';
import { CardTextGenerator } from '@/systems/CardTextGenerator';

interface OngoingEffectsDisplayProps {
  effects: OngoingEffect[];
  compact?: boolean;
  className?: string;
}

const OngoingEffectsDisplay: React.FC<OngoingEffectsDisplayProps> = ({ 
  effects, 
  compact = false,
  className = '' 
}) => {
  if (effects.length === 0) {
    return null;
  }

  const getEffectIcon = (effect: OngoingEffect) => {
    if (effect.effects.damage) return <Zap className="w-3 h-3" />;
    if (effect.effects.zoneDefense) return <Shield className="w-3 h-3" />;
    if (effect.effects.incomeBonus) return <TrendingUp className="w-3 h-3" />;
    return <Clock className="w-3 h-3" />;
  };

  const getEffectColor = (effect: OngoingEffect) => {
    if (effect.appliedBy === 'player') return 'bg-primary/10 border-primary/20 text-primary';
    return 'bg-destructive/10 border-destructive/20 text-destructive';
  };

  const getDurationText = (effect: OngoingEffect) => {
    if (effect.duration === 'permanent') return 'Permanent';
    if (effect.duration === 'thisTurn') return 'This Turn';
    if (effect.duration === 'nextTurn') return 'Next Turn';
    if (effect.turnsRemaining) return `${effect.turnsRemaining} turns`;
    return '';
  };

  if (compact) {
    return (
      <div className={`flex flex-wrap gap-1 ${className}`}>
        {effects.map((effect, index) => (
          <Badge 
            key={`${effect.id}-${index}`}
            variant="outline" 
            className={`text-xs ${getEffectColor(effect)}`}
          >
            {getEffectIcon(effect)}
            <span className="ml-1">{effect.cardName}</span>
            {effect.turnsRemaining && (
              <span className="ml-1 opacity-75">({effect.turnsRemaining})</span>
            )}
          </Badge>
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
        <Clock className="w-4 h-4" />
        Ongoing Effects
      </div>
      
      <div className="space-y-1">
        {effects.map((effect, index) => (
          <Card key={`${effect.id}-${index}`} className={`${getEffectColor(effect)}`}>
            <CardContent className="p-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getEffectIcon(effect)}
                  <span className="text-sm font-medium">{effect.cardName}</span>
                  <Badge variant="secondary" className="text-xs">
                    {effect.appliedBy === 'player' ? 'Your' : 'AI'} Effect
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-xs opacity-75">
                    {getDurationText(effect)}
                  </span>
                </div>
              </div>
              
              <div className="text-xs mt-1 opacity-90">
                {CardTextGenerator.generateRulesText(effect.effects)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default OngoingEffectsDisplay;