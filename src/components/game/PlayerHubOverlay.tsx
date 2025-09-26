import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Library, GraduationCap, X } from 'lucide-react';
import { AchievementsSection } from './AchievementPanel';
import { CardCollectionContent } from './CardCollection';
import { TutorialSection } from './TutorialOverlay';

interface PlayerHubOverlayProps {
  onClose: () => void;
  onStartTutorial?: (sequenceId: string) => void;
}

type HubTab = 'achievements' | 'cards' | 'tutorials';

const PlayerHubOverlay = ({ onClose, onStartTutorial }: PlayerHubOverlayProps) => {
  const [activeTab, setActiveTab] = useState<HubTab>('achievements');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <Card className="flex h-[90vh] w-full max-w-7xl flex-col overflow-hidden border-gray-700 bg-gray-900">
        <div className="flex items-center justify-between border-b border-gray-700 p-4">
          <div>
            <h2 className="text-xl font-bold text-white">AGENT DOSSIER HUB</h2>
            <p className="text-sm text-gray-400">
              Review your progress, browse unlocked cards, and continue your training.
            </p>
          </div>
          <Button
            onClick={onClose}
            variant="outline"
            size="sm"
            className="border-gray-600 text-gray-400"
          >
            <X size={16} />
          </Button>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as HubTab)}
          className="flex h-full flex-col"
        >
          <TabsList className="grid w-full grid-cols-3 bg-gray-800">
            <TabsTrigger value="achievements" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Achievements
            </TabsTrigger>
            <TabsTrigger value="cards" className="flex items-center gap-2">
              <Library className="h-4 w-4" />
              Card Collection
            </TabsTrigger>
            <TabsTrigger value="tutorials" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Shadow Academy
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-hidden">
            <TabsContent value="achievements" className="h-full">
              <AchievementsSection className="h-full" />
            </TabsContent>
            <TabsContent value="cards" className="h-full">
              <CardCollectionContent
                isActive={activeTab === 'cards'}
                className="h-full"
              />
            </TabsContent>
            <TabsContent value="tutorials" className="h-full">
              <TutorialSection
                isActive={activeTab === 'tutorials'}
                onStartTutorial={onStartTutorial}
                onClose={onClose}
                className="h-full"
              />
            </TabsContent>
          </div>
        </Tabs>
      </Card>
    </div>
  );
};

export default PlayerHubOverlay;
