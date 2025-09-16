import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { StateCombinationManager } from '@/data/stateCombinations';

interface EnhancedHUDProps {
  currentPlayer: 'human' | 'ai';
  phase: string;
  turn: number;
  playerIP: number;
  aiIP: number;
  truthMeter: number;
  controlledStates: {
    player: string[];
    ai: string[];
    neutral: string[];
  };
  combinationManager?: StateCombinationManager;
  className?: string;
}

const EnhancedHUD: React.FC<EnhancedHUDProps> = ({
  currentPlayer,
  phase,
  turn,
  playerIP,
  aiIP,
  truthMeter,
  controlledStates,
  combinationManager,
  className
}) => {
  const playerStateCount = controlledStates.player.length;
  const aiStateCount = controlledStates.ai.length;
  const neutralStateCount = controlledStates.neutral.length;
  const totalStates = playerStateCount + aiStateCount + neutralStateCount;
  
  const playerControl = Math.round((playerStateCount / totalStates) * 100);
  const aiControl = Math.round((aiStateCount / totalStates) * 100);
  
  const activeCombinations = combinationManager?.getActiveCombinations() || [];
  const combinationBonus = combinationManager?.getTotalBonusIP() || 0;

  const getPhaseDisplay = (phase: string) => {
    switch (phase) {
      case 'player_turn': return { text: 'YOUR TURN', color: 'text-primary' };
      case 'ai_turn': return { text: 'AI THINKING', color: 'text-destructive' };
      case 'newspaper': return { text: 'NEWS CYCLE', color: 'text-warning' };
      case 'event': return { text: 'BREAKING NEWS', color: 'text-accent' };
      default: return { text: phase.toUpperCase(), color: 'text-muted-foreground' };
    }
  };

  const phaseInfo = getPhaseDisplay(phase);
  const truthPercentage = Math.max(0, Math.min(100, truthMeter));

  return (
    <TooltipProvider>
      <Card className={`p-4 bg-card/95 backdrop-blur-sm border-border space-y-4 ${className}`}>
        {/* Turn & Phase Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="font-mono text-xs">
              TURN {turn}
            </Badge>
            <div className={`font-bold text-sm font-mono ${phaseInfo.color}`}>
              {phaseInfo.text}
            </div>
          </div>
          
          {currentPlayer === 'human' && phase === 'player_turn' && (
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          )}
        </div>

        {/* Control Statistics */}
        <div className="grid grid-cols-2 gap-4">
          {/* Player Control */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-foreground">TRUTH SEEKERS</span>
                  <span className="text-xs font-mono text-primary font-bold">
                    {playerStateCount}/50
                  </span>
                </div>
                <Progress value={playerControl} className="h-2 bg-muted">
                  <div 
                    className="h-full bg-primary transition-all duration-500 rounded-full"
                    style={{ width: `${playerControl}%` }}
                  />
                </Progress>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Control</span>
                  <span className="font-mono text-primary">{playerControl}%</span>
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent className="enhanced-tooltip">
              <div className="space-y-1">
                <div className="font-bold">Territory Control</div>
                <div className="text-xs">States: {controlledStates.player.join(', ') || 'None'}</div>
                <div className="text-xs">IP Generation: {playerIP}/turn</div>
                {combinationBonus > 0 && (
                  <div className="text-xs text-success">Synergy Bonus: +{combinationBonus} IP</div>
                )}
              </div>
            </TooltipContent>
          </Tooltip>

          {/* AI Control */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-foreground">GOVERNMENT</span>
                  <span className="text-xs font-mono text-destructive font-bold">
                    {aiStateCount}/50
                  </span>
                </div>
                <Progress value={aiControl} className="h-2 bg-muted">
                  <div 
                    className="h-full bg-destructive transition-all duration-500 rounded-full"
                    style={{ width: `${aiControl}%` }}
                  />
                </Progress>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Control</span>
                  <span className="font-mono text-destructive">{aiControl}%</span>
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent className="enhanced-tooltip">
              <div className="space-y-1">
                <div className="font-bold">Government Control</div>
                <div className="text-xs">States: {controlledStates.ai.join(', ') || 'None'}</div>
                <div className="text-xs">AI Strength: {aiStateCount} territories</div>
              </div>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Truth Meter */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-foreground">TRUTH METER</span>
                <span className="text-xs font-mono font-bold">
                  {truthPercentage}%
                </span>
              </div>
              <Progress value={truthPercentage} className="h-3 bg-muted">
                <div 
                  className={`h-full transition-all duration-700 rounded-full ${
                    truthPercentage >= 70 ? 'bg-success' :
                    truthPercentage >= 30 ? 'bg-warning' : 'bg-destructive'
                  }`}
                  style={{ width: `${truthPercentage}%` }}
                />
              </Progress>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Cover-up</span>
                <span>Exposed</span>
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent className="enhanced-tooltip">
            <div className="space-y-1">
              <div className="font-bold">Public Awareness</div>
              <div className="text-xs">
                {truthPercentage >= 70 ? 'The truth is spreading!' :
                 truthPercentage >= 30 ? 'Growing suspicion among the public' :
                 'The cover-up is working'}
              </div>
              <div className="text-xs text-muted-foreground">
                Higher truth meter helps Truth Seekers win
              </div>
            </div>
          </TooltipContent>
        </Tooltip>

        {/* Resource Display */}
        <div className="grid grid-cols-2 gap-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="text-center p-2 bg-primary/10 rounded-lg border border-primary/20">
                <div className="text-lg font-bold font-mono text-primary">{playerIP}</div>
                <div className="text-xs text-muted-foreground">INFLUENCE POINTS</div>
              </div>
            </TooltipTrigger>
            <TooltipContent className="enhanced-tooltip">
              <div className="space-y-1">
                <div className="font-bold">Your Resources</div>
                <div className="text-xs">Base IP: {playerIP - combinationBonus}/turn</div>
                {combinationBonus > 0 && (
                  <div className="text-xs text-success">Synergy: +{combinationBonus}/turn</div>
                )}
                <div className="text-xs text-muted-foreground">Use IP to deploy cards</div>
              </div>
            </TooltipContent>
          </Tooltip>

          <div className="text-center p-2 bg-muted/10 rounded-lg border border-muted/20">
            <div className="text-lg font-bold font-mono text-muted-foreground">{neutralStateCount}</div>
            <div className="text-xs text-muted-foreground">NEUTRAL STATES</div>
          </div>
        </div>

        {/* Active Synergies */}
        {activeCombinations.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-mono text-muted-foreground uppercase tracking-wide">
              ACTIVE SYNERGIES ({activeCombinations.length})
            </div>
            <div className="flex flex-wrap gap-1">
              {activeCombinations.slice(0, 3).map((combo) => (
                <Tooltip key={combo.id}>
                  <TooltipTrigger asChild>
                    <Badge 
                      variant="outline" 
                      className="text-xs bg-success/20 text-success border-success/50 synergy-unlock"
                    >
                      {combo.name}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent className="enhanced-tooltip">
                    <div className="space-y-1 max-w-48">
                      <div className="font-bold">{combo.name}</div>
                      <div className="text-xs">{combo.description}</div>
                      <div className="text-xs text-success">+{combo.bonusIP} IP/turn</div>
                      {combo.bonusEffect && (
                        <div className="text-xs text-accent italic">{combo.bonusEffect}</div>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              ))}
              {activeCombinations.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{activeCombinations.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}
      </Card>
    </TooltipProvider>
  );
};

export default EnhancedHUD;