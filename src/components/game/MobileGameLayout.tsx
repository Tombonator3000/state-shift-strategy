import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Settings, Trophy, BookOpen, Users, List } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { VictoryConditions } from './VictoryConditions';
import AIStatus from './AIStatus';
import SecretAgenda from './SecretAgenda';

interface MobileGameLayoutProps {
  // Stats
  controlledStates: number;
  truth: number;
  ip: number;
  aiIP: number;
  
  // AI Data
  aiDifficulty: string;
  aiPersonalityName?: string;
  isAIThinking: boolean;
  currentPlayer: string;
  aiControlledStates: number;
  assessmentText?: string;
  aiHandSize: number;
  aiObjectiveProgress: number;
  
  // Agendas
  playerAgenda?: any;
  aiAgenda?: any;
  
  // Game log
  gameLog: string[];
  
  // Callbacks
  onShowInGameOptions: () => void;
  onShowAchievements: () => void;
  onShowCardCollection: () => void;
  onShowTutorial: () => void;
  
  children: React.ReactNode;
}

const MobileGameLayout: React.FC<MobileGameLayoutProps> = ({
  controlledStates,
  truth,
  ip,
  aiIP,
  aiDifficulty,
  aiPersonalityName,
  isAIThinking,
  currentPlayer,
  aiControlledStates,
  assessmentText,
  aiHandSize,
  aiObjectiveProgress,
  playerAgenda,
  aiAgenda,
  gameLog,
  onShowInGameOptions,
  onShowAchievements,
  onShowCardCollection,
  onShowTutorial,
  children
}) => {
  const isMobile = useIsMobile();
  const [leftDrawerOpen, setLeftDrawerOpen] = useState(false);
  const [rightDrawerOpen, setRightDrawerOpen] = useState(false);

  if (!isMobile) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col h-screen bg-[#f5f5f5]">
      {/* Mobile Top Bar */}
      <div className="flex items-center justify-between bg-white border-b-2 border-black p-2 min-h-[60px]">
        {/* Left Menu */}
        <Sheet open={leftDrawerOpen} onOpenChange={setLeftDrawerOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="min-w-[44px] min-h-[44px] p-2">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] p-0 bg-white">
            <div className="p-4 border-b-2 border-black">
              <h2 className="font-black text-lg uppercase">MISSION STATUS</h2>
            </div>
            <div className="p-4 space-y-4 overflow-y-auto">
              <VictoryConditions
                controlledStates={controlledStates}
                truth={truth}
                ip={ip}
                isMobile={true}
              />
              
              {playerAgenda && (
                <div className="border-2 border-black bg-white p-3">
                  <SecretAgenda agenda={playerAgenda} isPlayer={true} />
                </div>
              )}
              
              <div className="border-2 border-black bg-white p-3">
                <AIStatus 
                  difficulty={aiDifficulty as any}
                  personalityName={aiPersonalityName}
                  isThinking={isAIThinking}
                  currentPlayer={currentPlayer as any}
                  aiControlledStates={aiControlledStates}
                  assessmentText={assessmentText}
                  aiHandSize={aiHandSize}
                  aiObjectiveProgress={aiObjectiveProgress}
                />
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Stats Bar */}
        <div className="flex items-center gap-2 flex-1 px-2">
          <div className="flex items-center gap-1 bg-black text-white px-2 py-1 rounded text-xs font-bold">
            <span>Truth:</span>
            <span>{Math.round(truth)}%</span>
          </div>
          <div className="flex items-center gap-1 bg-black text-white px-2 py-1 rounded text-xs font-bold">
            <span>IP:</span>
            <span>{ip}</span>
          </div>
          <div className="flex items-center gap-1 bg-black text-white px-2 py-1 rounded text-xs font-bold">
            <span>States:</span>
            <span>{controlledStates}</span>
          </div>
        </div>

        {/* Right Menu */}
        <Sheet open={rightDrawerOpen} onOpenChange={setRightDrawerOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="min-w-[44px] min-h-[44px] p-2">
              <List className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] p-0 bg-white">
            <div className="p-4 border-b-2 border-black">
              <h2 className="font-black text-lg uppercase">INTEL LOG</h2>
            </div>
            <div className="p-4 space-y-4 overflow-y-auto">
              <div className="border-2 border-black bg-white p-3 max-h-[300px] overflow-y-auto">
                <div className="space-y-1">
                  {gameLog.slice(-20).map((entry, i) => (
                    <div key={i} className="text-xs text-black/80 animate-fade-in">
                      <span className="font-mono">▲</span> {entry}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Quick Actions */}
              <div className="space-y-2">
                <Button 
                  onClick={() => { onShowInGameOptions(); setRightDrawerOpen(false); }}
                  variant="outline" 
                  className="w-full justify-start min-h-[44px]"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
                <Button 
                  onClick={() => { onShowAchievements(); setRightDrawerOpen(false); }}
                  variant="outline" 
                  className="w-full justify-start min-h-[44px]"
                >
                  <Trophy className="w-4 h-4 mr-2" />
                  Achievements
                </Button>
                <Button 
                  onClick={() => { onShowCardCollection(); setRightDrawerOpen(false); }}
                  variant="outline" 
                  className="w-full justify-start min-h-[44px]"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Collection
                </Button>
                <Button 
                  onClick={() => { onShowTutorial(); setRightDrawerOpen(false); }}
                  variant="outline" 
                  className="w-full justify-start min-h-[44px]"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Tutorial
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
};

export default MobileGameLayout;