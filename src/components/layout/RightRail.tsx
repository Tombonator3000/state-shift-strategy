import React, { useState } from 'react';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import ContextualHelp from '@/components/game/ContextualHelp';
import { 
  Bot, 
  HelpCircle, 
  Eye,
  Target
} from 'lucide-react';

interface RightRailProps {
  gameState: any;
}

const RightRail: React.FC<RightRailProps> = ({ gameState }) => {
  const [openSection, setOpenSection] = useState<string>('ai-intel');

  return (
    <div className="w-72 h-full flex flex-col">
      <Accordion 
        type="single" 
        collapsible 
        value={openSection} 
        onValueChange={setOpenSection}
        className="w-full"
      >
        {/* AI Intelligence */}
        <AccordionItem value="ai-intel" className="border-b border-newspaper-border">
          <AccordionTrigger className="px-3 py-2 text-newspaper-text hover:bg-newspaper-text/10">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-red-400" />
              <span className="font-mono text-xs font-bold">AI INTELLIGENCE</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-3 pb-3">
            <div className="bg-newspaper-text text-newspaper-bg p-3 border border-newspaper-border">
              <div className="text-xs font-mono space-y-2">
                <div className="flex items-center justify-between">
                  <span>Hand Size:</span>
                  <Badge variant="outline">{gameState.aiHand.length}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Available IP:</span>
                  <Badge variant="outline">{gameState.aiIP}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>States Controlled:</span>
                  <Badge variant="outline">
                    {gameState.states.filter((s: any) => s.owner === 'ai').length}
                  </Badge>
                </div>
                
                <div className="border-t border-newspaper-bg/30 pt-2 mt-2">
                  <div className="text-xs">
                    <div className="font-bold mb-1">Strategy Assessment:</div>
                    <div className="text-newspaper-bg/80">
                      {gameState.aiStrategist?.getStrategicAssessment(gameState) || 'Analyzing situation...'}
                    </div>
                  </div>
                </div>

                {gameState.phase === 'ai_turn' && (
                  <div className="border-t border-newspaper-bg/30 pt-2 mt-2">
                    <div className="text-yellow-400 animate-pulse">
                      🤖 AI is thinking...
                    </div>
                  </div>
                )}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Help & Tutorial */}
        <AccordionItem value="help" className="border-b border-newspaper-border">
          <AccordionTrigger className="px-3 py-2 text-newspaper-text hover:bg-newspaper-text/10">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-green-400" />
              <span className="font-mono text-xs font-bold">HELP & GUIDANCE</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-3 pb-3">
            <ContextualHelp 
              gamePhase={gameState.phase}
              currentPlayer={gameState.currentPlayer === 'player' ? 'human' : 'ai'}
              selectedCard={gameState.selectedCard}
              playerIP={gameState.ip}
              controlledStates={gameState.controlledStates.length}
            />
            
            <div className="mt-3 bg-newspaper-text text-newspaper-bg p-3 border border-newspaper-border">
              <div className="text-xs font-mono space-y-2">
                <div className="font-bold">Quick Tips:</div>
                <div>• Click cards to select them</div>
                <div>• Zone cards target states</div>
                <div>• Build synergy combos</div>
                <div>• Watch your IP carefully</div>
                <div>• End turn when ready</div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Game Statistics */}
        <AccordionItem value="stats" className="border-b border-newspaper-border">
          <AccordionTrigger className="px-3 py-2 text-newspaper-text hover:bg-newspaper-text/10">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-purple-400" />
              <span className="font-mono text-xs font-bold">GAME STATISTICS</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-3 pb-3">
            <div className="bg-newspaper-text text-newspaper-bg p-3 border border-newspaper-border">
              <div className="text-xs font-mono space-y-2">
                <div className="flex items-center justify-between">
                  <span>Cards Played:</span>
                  <Badge variant="outline">{gameState.cardsPlayedThisTurn}/3</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Total Rounds:</span>
                  <Badge variant="outline">{gameState.round}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Truth Level:</span>
                  <Badge 
                    variant="outline"
                    className={gameState.truth >= 70 ? 'text-green-400' : 
                              gameState.truth >= 40 ? 'text-yellow-400' : 'text-red-400'}
                  >
                    {gameState.truth}%
                  </Badge>
                </div>
                
                {gameState.cardsPlayedThisRound?.length > 0 && (
                  <div className="border-t border-newspaper-bg/30 pt-2 mt-2">
                    <div className="font-bold mb-1">Recent Activity:</div>
                    {gameState.cardsPlayedThisRound.slice(-3).map((play: any, i: number) => (
                      <div key={i} className="text-xs text-newspaper-bg/80">
                        • {play.card?.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default RightRail;