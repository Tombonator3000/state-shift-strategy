import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, TrendingUp, MapPin } from 'lucide-react';
import type { GameCard } from '@/rules/mvp';
import { checkStateBonuses } from '@/game/stateBonuses';
import { TWO_CARD_COMBOS } from '@/game/twoCardCombos';

export interface StrategyInsights {
  comboPairs: Array<{ cards: string[]; comboName: string }>;
  stateBonuses: Array<{ cardName: string; bonus: string }>;
  suggestions: string[];
}

export interface StrategyHelperProps {
  hand: GameCard[];
  targetStateId?: string | null;
  className?: string;
}

export function useStrategyInsights(hand: GameCard[], targetStateId?: string | null): StrategyInsights {
  return useMemo(() => {
    const result: StrategyInsights = {
      comboPairs: [],
      stateBonuses: [],
      suggestions: [],
    };

    for (const combo of TWO_CARD_COMBOS) {
      if (combo.trigger.kind !== 'hybrid') continue;

      const matchingCards: string[] = [];
      for (const trigger of combo.trigger.triggers) {
        if (trigger.kind === 'card' && trigger.nameIncludesAny) {
          const matches = hand.filter(card =>
            trigger.nameIncludesAny?.some(pattern =>
              card.name.toLowerCase().includes(pattern.toLowerCase())
            )
          );
          if (matches.length > 0) {
            matchingCards.push(matches[0].name);
          }
        }
      }

      if (matchingCards.length >= 2) {
        result.comboPairs.push({
          cards: matchingCards.slice(0, 2),
          comboName: combo.name,
        });
      }
    }

    if (targetStateId) {
      hand.forEach(card => {
        const bonus = checkStateBonuses(
          card.name,
          card.tags || [],
          card.id,
          targetStateId,
          card.stateBonuses,
        );
        if (bonus) {
          result.stateBonuses.push({
            cardName: card.name,
            bonus: bonus.label,
          });
        }
      });
    }

    if (result.comboPairs.length > 0) {
      result.suggestions.push(
        `Play ${result.comboPairs[0].cards.join(' + ')} for ${result.comboPairs[0].comboName} combo!`
      );
    }

    if (result.stateBonuses.length > 0) {
      result.suggestions.push(
        `${result.stateBonuses[0].cardName} gets bonus in this state!`
      );
    }

    const mediaCards = hand.filter(c => c.type === 'MEDIA').length;
    const zoneCards = hand.filter(c => c.type === 'ZONE').length;
    const attackCards = hand.filter(c => c.type === 'ATTACK').length;

    if (mediaCards >= 2) {
      result.suggestions.push('Multiple MEDIA cards available - consider truth swing strategy');
    }
    if (zoneCards >= 2) {
      result.suggestions.push('Stack ZONE cards on key states for capture pressure');
    }
    if (attackCards >= 2) {
      result.suggestions.push('ATTACK combo available - disrupt opponent momentum');
    }

    return result;
  }, [hand, targetStateId]);
}

/**
 * Strategy helper that highlights synergies, combos, and bonuses
 */
export function StrategyHelper({ hand, targetStateId, className }: StrategyHelperProps) {
  const insights = useStrategyInsights(hand, targetStateId);

  if (insights.suggestions.length === 0) {
    return null;
  }

  return (
    <Card className={className}>
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-yellow-500" />
          <h3 className="font-semibold text-sm">Strategy Insights</h3>
        </div>

        {insights.comboPairs.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              <span>Combo Available</span>
            </div>
            {insights.comboPairs.map((combo, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {combo.comboName}: {combo.cards.join(' + ')}
              </Badge>
            ))}
          </div>
        )}

        {insights.stateBonuses.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span>State Bonuses</span>
            </div>
            {insights.stateBonuses.map((bonus, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {bonus.cardName}: {bonus.bonus}
              </Badge>
            ))}
          </div>
        )}

        <div className="space-y-1">
          {insights.suggestions.map((suggestion, idx) => (
            <p key={idx} className="text-xs text-muted-foreground leading-relaxed">
              • {suggestion}
            </p>
          ))}
        </div>
      </div>
    </Card>
  );
}
