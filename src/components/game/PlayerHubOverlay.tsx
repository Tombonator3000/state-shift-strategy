import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Trophy, Library, GraduationCap, Newspaper, X, MapPin } from 'lucide-react';
import { AchievementsSection } from './AchievementPanel';
import { CardCollectionContent } from './CardCollection';
import { TutorialSection } from './TutorialOverlay';
import PressArchivePanel from './PressArchivePanel';
import type { ArchivedEdition } from '@/hooks/usePressArchive';
import StateIntelBoard from './StateIntelBoard';
import type { StateEventBonusSummary } from '@/hooks/gameStateTypes';

interface PlayerHubOverlayProps {
  onClose: () => void;
  onStartTutorial?: (sequenceId: string) => void;
  pressIssues: ArchivedEdition[];
  onOpenEdition: (issue: ArchivedEdition) => void;
  onDeleteEdition: (id: string) => void;
  stateIntel?: PlayerStateIntel;
}

export interface PlayerStateIntel {
  generatedAtTurn: number;
  round: number;
  totals: {
    player: number;
    ai: number;
    neutral: number;
    contested: number;
  };
  states: Array<{
    id: string;
    name: string;
    abbreviation: string;
    owner: 'player' | 'ai' | 'neutral';
    contested: boolean;
    pressure: number;
    defense: number;
    pressurePlayer: number;
    pressureAi: number;
    stateEventHistory: StateEventBonusSummary[];
  }>;
  recentEvents: Array<{
    stateId: string;
    stateName: string;
    abbreviation: string;
    owner: 'player' | 'ai' | 'neutral';
    contested: boolean;
    pressure: number;
    defense: number;
    pressurePlayer: number;
    pressureAi: number;
    event: StateEventBonusSummary;
  }>;
}

type HubTab = 'achievements' | 'cards' | 'tutorials' | 'press' | 'intel';

const PlayerHubOverlay = ({
  onClose,
  onStartTutorial,
  pressIssues,
  onOpenEdition,
  onDeleteEdition,
  stateIntel,
}: PlayerHubOverlayProps) => {
  const [activeTab, setActiveTab] = useState<HubTab>(() => {
    if (pressIssues.length > 0) {
      return 'press';
    }

    if (stateIntel && stateIntel.recentEvents.length > 0) {
      return 'intel';
    }

    return 'achievements';
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <Card className="relative flex h-[90vh] w-full max-w-7xl flex-col overflow-hidden border border-emerald-500/30 bg-slate-950/95 text-slate-100 shadow-[0_0_80px_rgba(16,185,129,0.25)]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 opacity-60 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.22),_transparent_55%)]" />
          <div className="absolute inset-0 opacity-50 bg-[radial-gradient(circle_at_bottom,_rgba(56,189,248,0.18),_transparent_60%)]" />
          <div
            className="absolute inset-0 opacity-35 mix-blend-screen"
            style={{ backgroundImage: 'linear-gradient(135deg, rgba(56,189,248,0.16), transparent 45%, rgba(16,185,129,0.12))' }}
          />
        </div>

        <div className="relative border-b border-emerald-500/20 bg-gradient-to-r from-emerald-900/40 via-slate-950 to-slate-950/90 px-6 py-5 backdrop-blur">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="space-y-2">
              <Badge className="border border-emerald-400/60 bg-emerald-500/15 font-mono text-[11px] uppercase tracking-[0.35em] text-emerald-200">
                Operator Uplink
              </Badge>
              <h2 className="font-mono text-2xl font-semibold uppercase tracking-[0.2em] text-emerald-100">
                AGENT DOSSIER HUB
              </h2>
              <p className="max-w-2xl text-sm text-emerald-100/70">
                Review your progress, browse unlocked cards, and continue your training across the network.
              </p>
            </div>
            <Button
              onClick={onClose}
              variant="outline"
              size="sm"
              className="border-emerald-400/40 bg-emerald-500/10 text-emerald-200 transition hover:bg-emerald-500/20 hover:text-emerald-100"
            >
              <X size={16} className="mr-1" />
              Close
            </Button>
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={value => setActiveTab(value as HubTab)}
          className="relative flex flex-1 flex-col overflow-hidden"
        >
          <div className="relative px-6 pt-6">
            <TabsList className="grid w-full grid-cols-5 gap-2 rounded-lg border border-emerald-500/20 bg-slate-900/70 p-1 backdrop-blur">
              <TabsTrigger
                value="achievements"
                className="flex items-center justify-center gap-2 rounded-md border border-transparent px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-400 transition data-[state=active]:border-emerald-400/60 data-[state=active]:bg-emerald-500/15 data-[state=active]:text-emerald-200"
              >
                <Trophy className="h-4 w-4" />
                Achievements
              </TabsTrigger>
              <TabsTrigger
                value="cards"
                className="flex items-center justify-center gap-2 rounded-md border border-transparent px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-400 transition data-[state=active]:border-emerald-400/60 data-[state=active]:bg-emerald-500/15 data-[state=active]:text-emerald-200"
              >
                <Library className="h-4 w-4" />
                Card Collection
              </TabsTrigger>
              <TabsTrigger
                value="tutorials"
                className="flex items-center justify-center gap-2 rounded-md border border-transparent px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-400 transition data-[state=active]:border-emerald-400/60 data-[state=active]:bg-emerald-500/15 data-[state=active]:text-emerald-200"
              >
                <GraduationCap className="h-4 w-4" />
                Shadow Academy
              </TabsTrigger>
              <TabsTrigger
                value="press"
                className="flex items-center justify-center gap-2 rounded-md border border-transparent px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-400 transition data-[state=active]:border-emerald-400/60 data-[state=active]:bg-emerald-500/15 data-[state=active]:text-emerald-200"
              >
                <Newspaper className="h-4 w-4" />
                Press Archive
              </TabsTrigger>
              <TabsTrigger
                value="intel"
                className="flex items-center justify-center gap-2 rounded-md border border-transparent px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-400 transition data-[state=active]:border-emerald-400/60 data-[state=active]:bg-emerald-500/15 data-[state=active]:text-emerald-200"
              >
                <MapPin className="h-4 w-4" />
                Field Intel
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="relative flex-1 overflow-hidden px-6 pb-6 pt-4">
            <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-emerald-500/25 bg-slate-950/80 shadow-[0_0_45px_rgba(16,185,129,0.15)]">
              <div className="pointer-events-none absolute inset-0 opacity-45">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),_transparent_55%)]" />
                <div className="absolute inset-0 bg-[linear-gradient(160deg,_rgba(56,189,248,0.12),_transparent_60%)]" />
              </div>

              <TabsContent value="achievements" className="relative h-full overflow-hidden p-6 focus-visible:outline-none">
                <AchievementsSection className="h-full" />
              </TabsContent>

              <TabsContent value="cards" className="relative h-full overflow-hidden p-6 focus-visible:outline-none">
                <CardCollectionContent
                  isActive={activeTab === 'cards'}
                  className="h-full"
                />
              </TabsContent>

              <TabsContent value="tutorials" className="relative h-full overflow-hidden p-6 focus-visible:outline-none">
                <TutorialSection
                  isActive={activeTab === 'tutorials'}
                  onStartTutorial={onStartTutorial}
                  onClose={onClose}
                  className="h-full"
                />
              </TabsContent>

              <TabsContent value="press" className="relative h-full overflow-hidden p-6 focus-visible:outline-none">
                <PressArchivePanel
                  issues={pressIssues}
                  onOpen={onOpenEdition}
                  onDelete={onDeleteEdition}
                  className="h-full"
                />
              </TabsContent>
              <TabsContent value="intel" className="relative h-full overflow-hidden p-6 focus-visible:outline-none">
                <StateIntelBoard intel={stateIntel} />
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </Card>
    </div>
  );
};

export default PlayerHubOverlay;
