import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { StateCombination, StateCombinationManager, aggregateStateCombinationEffects } from '@/data/stateCombinations';

interface StateCombinationsPanelProps {
  combinationManager: StateCombinationManager;
  controlledStates: string[];
  className?: string;
}

const StateCombinationsPanel: React.FC<StateCombinationsPanelProps> = ({
  combinationManager,
  controlledStates,
  className
}) => {
  const activeCombinations = combinationManager.getActiveCombinations();
  const potentialCombinations = combinationManager.getPotentialCombinations(controlledStates);
  const totalBonusIP = combinationManager.getTotalBonusIP();
  const aggregatedEffects = aggregateStateCombinationEffects(activeCombinations);

  const synergyStats = [
    aggregatedEffects.flatTurnIpBonus !== 0 && {
      label: 'Flat IP',
      value: `${aggregatedEffects.flatTurnIpBonus > 0 ? '+' : ''}${aggregatedEffects.flatTurnIpBonus}`,
    },
    aggregatedEffects.ipPerStateBonus !== 0 && {
      label: 'IP / State',
      value: `${aggregatedEffects.ipPerStateBonus > 0 ? '+' : ''}${aggregatedEffects.ipPerStateBonus}`,
    },
    aggregatedEffects.ipPerNeutralStateBonus !== 0 && {
      label: 'IP / Neutral',
      value: `${aggregatedEffects.ipPerNeutralStateBonus > 0 ? '+' : ''}${aggregatedEffects.ipPerNeutralStateBonus}`,
    },
    aggregatedEffects.mediaCostModifier !== 0 && {
      label: 'Media Cost',
      value: `${aggregatedEffects.mediaCostModifier > 0 ? '+' : ''}${aggregatedEffects.mediaCostModifier}`,
    },
    aggregatedEffects.extraCardDraw !== 0 && {
      label: 'Cards / Turn',
      value: `${aggregatedEffects.extraCardDraw > 0 ? '+' : ''}${aggregatedEffects.extraCardDraw}`,
    },
    aggregatedEffects.attackIpBonus !== 0 && {
      label: 'Attack IP',
      value: `+${aggregatedEffects.attackIpBonus}`,
    },
    aggregatedEffects.stateDefenseBonus !== 0 && {
      label: 'Defense',
      value: `+${aggregatedEffects.stateDefenseBonus}`,
    },
    aggregatedEffects.incomingPressureReduction !== 0 && {
      label: 'Pressure Shield',
      value: `-${aggregatedEffects.incomingPressureReduction}`,
    },
  ].filter(Boolean) as Array<{ label: string; value: string }>;

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'economic': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'military': return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'intelligence': return 'bg-purple-500/20 text-purple-400 border-purple-500/50';
      case 'cultural': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'energy': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'transport': return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
      default: return 'bg-muted/20 text-muted-foreground border-muted/50';
    }
  };

  return (
    <Card className={`p-4 bg-card/95 backdrop-blur-sm border-border ${className}`}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm font-mono text-foreground">
            STATE SYNERGIES
          </h3>
          {totalBonusIP > 0 && (
            <Badge variant="outline" className="bg-primary/20 text-primary border-primary/50">
              +{totalBonusIP} IP/turn
            </Badge>
          )}
        </div>

        {/* Active Combinations */}
        {activeCombinations.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-mono text-muted-foreground uppercase tracking-wide">
              ACTIVE SYNERGIES
            </h4>
            {synergyStats.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {synergyStats.map(stat => (
                  <div key={stat.label} className="flex items-center justify-between text-xs font-mono bg-muted/10 border border-muted/20 rounded px-2 py-1">
                    <span className="text-muted-foreground">{stat.label}</span>
                    <span className="text-primary font-semibold">{stat.value}</span>
                  </div>
                ))}
              </div>
            )}
            {activeCombinations.map((combo) => (
              <div
                key={combo.id}
                className="p-3 bg-primary/10 border border-primary/30 rounded-lg animate-fade-in"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                    <span className="font-bold text-sm text-primary">
                      {combo.name}
                    </span>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`text-xs px-2 py-0 ${getCategoryColor(combo.category)}`}
                  >
                    {combo.category.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  {combo.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-primary">
                    +{combo.bonusIP} IP
                  </span>
                  {combo.bonusEffect && (
                    <span className="text-xs text-accent max-w-32 truncate">
                      {combo.bonusEffect}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Potential Combinations */}
        {potentialCombinations.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-mono text-muted-foreground uppercase tracking-wide">
              POTENTIAL SYNERGIES
            </h4>
            <div className="max-h-40 overflow-y-auto space-y-2">
              {potentialCombinations.slice(0, 5).map((item) => (
                <div 
                  key={item.combination.id}
                  className="p-2 bg-muted/10 border border-muted/20 rounded-md hover:bg-muted/20 transition-colors"
                >
                  <div className="flex items-start justify-between mb-1">
                    <span className="font-medium text-xs text-foreground">
                      {item.combination.name}
                    </span>
                    <Badge 
                      variant="outline" 
                      className={`text-xs px-1 py-0 ${getCategoryColor(item.combination.category)}`}
                    >
                      +{item.combination.bonusIP}
                    </Badge>
                  </div>
                  <Progress 
                    value={item.progress} 
                    className="h-1.5 mb-1"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {item.progress}% complete
                    </span>
                    <span className="text-xs text-destructive">
                      Need: {item.missing.join(', ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {activeCombinations.length === 0 && potentialCombinations.length === 0 && (
          <div className="text-center py-6">
            <div className="text-xs text-muted-foreground font-mono">
              Control multiple states to unlock synergies
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default StateCombinationsPanel;