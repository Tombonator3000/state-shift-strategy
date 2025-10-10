import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HelpCircle, X, Lightbulb, Target, Zap, TrendingUp, MapPin } from 'lucide-react';
import type { GameCard } from '@/rules/mvp';
import { useStrategyInsights } from '@/components/gameplay/StrategyHelper';

interface HelpTip {
  id: string;
  title: string;
  content: string;
  category: 'beginner' | 'intermediate' | 'advanced';
  position: { x: number; y: number };
  trigger: 'hover' | 'click' | 'auto';
}

interface ContextualHelpProps {
  gamePhase: string;
  currentPlayer: 'human' | 'ai';
  selectedCard?: string;
  playerIP: number;
  controlledStates: number;
  hand: GameCard[];
  targetStateId?: string | null;
  onSuggestMove?: (suggestion: string) => void;
}

const ContextualHelp = ({
  gamePhase,
  currentPlayer,
  selectedCard,
  playerIP,
  controlledStates,
  hand,
  targetStateId,
  onSuggestMove
}: ContextualHelpProps) => {
  const [activeHelp, setActiveHelp] = useState<HelpTip | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Smart suggestions based on game state
  const getSmartSuggestions = () => {
    const suggestions = [];

    if (gamePhase === 'action' && currentPlayer === 'human') {
      if (playerIP < 3) {
        suggestions.push({
          type: 'warning',
          text: '💰 Low IP - consider playing cheaper cards or ending turn for income',
          action: () => onSuggestMove?.('Save IP for next turn')
        });
      }
      
      if (controlledStates === 0) {
        suggestions.push({
          type: 'tip',
          text: '🎯 Use ZONE cards to capture your first states',
          action: () => onSuggestMove?.('Play ZONE card on weak neutral states')
        });
      }

      if (selectedCard) {
        suggestions.push({
          type: 'info',
          text: '🎮 Card selected - click on map to target or play immediately',
          action: () => setActiveHelp(null)
        });
      }

      if (controlledStates >= 5 && playerIP > 10) {
        suggestions.push({
          type: 'success',
          text: '⚡ Strong position - consider aggressive expansion!',
          action: () => onSuggestMove?.('Play multiple ZONE cards this turn')
        });
      }
    }

    return suggestions;
  };

  // Tutorial hints for different phases
  const getTutorialHints = () => {
    const hints: Record<string, string> = {
      'income': '💰 Income Phase: Gaining IP based on controlled states',
      'action': '⚡ Action Phase: Play cards and capture states',
      'ai_turn': '🤖 AI Turn: Deep State is making their moves',
      'event': '📰 Event Phase: Random events affect the game',
      'newspaper': '📰 Breaking News: Review what happened this round'
    };

    return hints[gamePhase] || 'Game in progress...';
  };

  const suggestions = getSmartSuggestions();
  const strategyInsights = useStrategyInsights(hand, targetStateId);
  const hasStrategyInsights =
    strategyInsights.comboPairs.length > 0 ||
    strategyInsights.stateBonuses.length > 0 ||
    strategyInsights.suggestions.length > 0;

  return (
    <>
      {/* Floating Help Button */}
      <div className="fixed bottom-4 right-4 z-40">
        <Button
          variant="outline"
          size="sm"
          className="bg-newspaper-text text-newspaper-bg hover:bg-newspaper-text/80 shadow-lg"
          onClick={() => setShowSuggestions(!showSuggestions)}
        >
          <HelpCircle size={16} />
          <span className="ml-1">Help</span>
        </Button>
      </div>

      {/* Tutorial Hints Panel */}
      {showSuggestions && (
        <div className="fixed bottom-16 right-4 z-50 animate-fade-in">
          <Card className="p-4 max-w-xs bg-newspaper-text text-newspaper-bg border-2 border-truth-red shadow-xl">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-sm">📚 Smart Assistant</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSuggestions(false)}
                className="h-6 w-6 p-0 hover:bg-newspaper-bg/20"
              >
                <X size={12} />
              </Button>
            </div>

            {/* Current Phase Hint */}
            <div className="mb-3 p-2 bg-newspaper-bg/20 rounded text-xs">
              <div className="font-mono font-bold mb-1">CURRENT PHASE:</div>
              <div>{getTutorialHints()}</div>
            </div>

            {/* Smart Suggestions */}
            {suggestions.length > 0 && (
              <div className="space-y-2">
                <div className="font-bold text-xs">💡 SUGGESTIONS:</div>
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className={`p-2 rounded text-xs cursor-pointer transition-all hover:scale-105 ${
                      suggestion.type === 'warning' ? 'bg-destructive/20 border border-destructive/50' :
                      suggestion.type === 'success' ? 'bg-emerald-500/20 border border-emerald-500/50' :
                      suggestion.type === 'tip' ? 'bg-government-blue/20 border border-government-blue/50' :
                      'bg-truth-red/20 border border-truth-red/50'
                    }`}
                    onClick={suggestion.action}
                  >
                    {suggestion.text}
                  </div>
                ))}
              </div>
            )}

            {/* Strategy Insights */}
            {hasStrategyInsights && (
              <div className="mt-3 space-y-3 rounded border border-newspaper-bg/30 bg-newspaper-bg/10 p-3">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-truth-red" />
                  <h4 className="font-semibold text-xs uppercase tracking-[0.2em]">Strategy Insights</h4>
                </div>

                {strategyInsights.comboPairs.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-[0.65rem] font-semibold text-newspaper-bg/80">
                      <TrendingUp className="h-3 w-3" />
                      <span>Combo Opportunities</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {strategyInsights.comboPairs.map((combo, index) => (
                        <Badge key={index} variant="secondary" className="text-[0.6rem]">
                          {combo.comboName}: {combo.cards.join(' + ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {strategyInsights.stateBonuses.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-[0.65rem] font-semibold text-newspaper-bg/80">
                      <MapPin className="h-3 w-3" />
                      <span>State Bonuses</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {strategyInsights.stateBonuses.map((bonus, index) => (
                        <Badge key={index} variant="outline" className="text-[0.6rem]">
                          {bonus.cardName}: {bonus.bonus}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {strategyInsights.suggestions.length > 0 && (
                  <div className="space-y-1 text-[0.65rem] leading-relaxed text-newspaper-bg/80">
                    {strategyInsights.suggestions.map((insight, index) => (
                      <p key={index}>• {insight}</p>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Quick Tips */}
            <div className="mt-3 pt-2 border-t border-newspaper-bg/30">
              <div className="font-bold text-xs mb-2">🎯 QUICK TIPS:</div>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-1">
                  <Target size={10} />
                  <span>ZONE cards capture states</span>
                </div>
                <div className="flex items-center gap-1">
                  <Zap size={10} />
                  <span>INFLUENCE cards boost power</span>
                </div>
                <div className="flex items-center gap-1">
                  <Lightbulb size={10} />
                  <span>Control 10 states to win</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Contextual Tooltips */}
      {activeHelp && (
        <div 
          className="fixed z-50 animate-fade-in pointer-events-none"
          style={{ 
            left: `${activeHelp.position.x}px`, 
            top: `${activeHelp.position.y}px` 
          }}
        >
          <Card className="p-3 max-w-xs bg-newspaper-text text-newspaper-bg border-2 border-government-blue shadow-xl">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-bold text-sm">{activeHelp.title}</h4>
              <Badge variant="outline" className="text-xs">
                {activeHelp.category}
              </Badge>
            </div>
            <p className="text-xs">{activeHelp.content}</p>
          </Card>
        </div>
      )}
    </>
  );
};

export default ContextualHelp;