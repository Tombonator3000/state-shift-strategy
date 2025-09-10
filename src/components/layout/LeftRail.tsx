import React, { useState } from 'react';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import SecretAgenda from '@/components/game/SecretAgenda';
import AIStatus from '@/components/game/AIStatus';
import { 
  Target, 
  Shield, 
  Bot, 
  FileText,
  Trophy,
  Zap,
  Eye
} from 'lucide-react';

interface LeftRailProps {
  gameState: any;
}

const LeftRail: React.FC<LeftRailProps> = ({ gameState }) => {
  const [openSection, setOpenSection] = useState<string>('victory');

  return (
    <div className="w-72 h-full flex flex-col">
      <Accordion 
        type="single" 
        collapsible 
        value={openSection} 
        onValueChange={setOpenSection}
        className="w-full"
      >
        {/* Victory Conditions */}
        <AccordionItem value="victory" className="border-b border-newspaper-border">
          <AccordionTrigger className="px-3 py-2 text-newspaper-text hover:bg-newspaper-text/10">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-400" />
              <span className="font-mono text-xs font-bold">VICTORY CONDITIONS</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-3 pb-3">
            <div className="bg-newspaper-text text-newspaper-bg p-3 border border-newspaper-border">
              <div className="text-xs space-y-2 font-mono">
                <div className="flex items-center justify-between">
                  <span>Control 10 states</span>
                  <Badge variant="outline" className="text-xs">
                    {gameState.controlledStates.length}/10
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Reach 200 IP</span>
                  <Badge variant="outline" className="text-xs">
                    {gameState.ip}/200
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Truth ≥90%</span>
                  <Badge variant="outline" className="text-xs">
                    {gameState.truth}%
                  </Badge>
                </div>
                
                {gameState.agenda && (
                  <div className="border-t border-newspaper-bg/30 pt-2 mt-2">
                    <div className="flex items-center justify-between">
                      <span>Secret Agenda</span>
                      <Badge 
                        variant="outline" 
                        className={gameState.agenda.complete ? 'text-green-400' : 'text-yellow-400'}
                      >
                        {gameState.agenda.complete ? 'COMPLETE' : 'IN PROGRESS'}
                      </Badge>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Player Secret Agenda */}
        <AccordionItem value="agenda" className="border-b border-newspaper-border">
          <AccordionTrigger className="px-3 py-2 text-newspaper-text hover:bg-newspaper-text/10">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-400" />
              <span className="font-mono text-xs font-bold">SECRET AGENDA</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-3 pb-3">
            <SecretAgenda agenda={gameState.secretAgenda} isPlayer={true} />
          </AccordionContent>
        </AccordionItem>

        {/* AI Status & Objective */}
        <AccordionItem value="ai-objective" className="border-b border-newspaper-border">
          <AccordionTrigger className="px-3 py-2 text-newspaper-text hover:bg-newspaper-text/10">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-red-400" />
              <span className="font-mono text-xs font-bold">AI OBJECTIVE</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-3 pb-3">
            <AIStatus 
              difficulty={gameState.aiDifficulty}
              personalityName={gameState.aiStrategist?.personality.name}
              isThinking={gameState.phase === 'ai_turn'}
              currentPlayer={gameState.currentPlayer}
              aiControlledStates={gameState.states.filter(s => s.owner === 'ai').length}
              assessmentText={gameState.aiStrategist?.getStrategicAssessment(gameState)}
            />
            <div className="mt-3">
              <SecretAgenda 
                agenda={{
                  ...gameState.aiSecretAgenda,
                  progress: gameState.aiSecretAgenda.progress,
                  completed: gameState.aiSecretAgenda.completed,
                  revealed: gameState.aiSecretAgenda.revealed
                }} 
                isPlayer={false} 
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Classified Intel */}
        <AccordionItem value="intel" className="border-b border-newspaper-border">
          <AccordionTrigger className="px-3 py-2 text-newspaper-text hover:bg-newspaper-text/10">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-yellow-400" />
              <span className="font-mono text-xs font-bold">CLASSIFIED INTEL</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-3 pb-3">
            <div className="bg-newspaper-bg border-2 border-newspaper-border p-2 max-h-64 overflow-y-auto">
              <div className="text-xs space-y-1">
                {gameState.log.map((entry: string, i: number) => (
                  <div key={i} className="text-newspaper-text/80 animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                    <span className="font-mono text-yellow-400">▲</span> {entry}
                  </div>
                ))}
                {gameState.log.length === 0 && (
                  <div className="text-newspaper-text/60 italic">No classified intel yet...</div>
                )}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default LeftRail;