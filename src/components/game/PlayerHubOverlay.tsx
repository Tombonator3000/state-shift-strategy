import { useState } from 'react';
import clsx from 'clsx';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Trophy, Library, GraduationCap, Newspaper, X, MapPin, FileSearch2 } from 'lucide-react';
import { AchievementsSection } from './AchievementPanel';
import { CardCollectionContent } from './CardCollection';
import { TutorialSection } from './TutorialOverlay';
import PressArchivePanel from './PressArchivePanel';
import type { ArchivedEdition } from '@/hooks/usePressArchive';
import StateIntelBoard from './StateIntelBoard';
import PlayerHubMapView from './PlayerHubMapView';
import type { StateEventBonusSummary, StateParanormalHotspotSummary } from '@/hooks/gameStateTypes';
import EvidenceArchivePanel from './EvidenceArchivePanel';
import type { IntelArchiveEntry } from '@/hooks/useIntelArchive';
import '@/styles/playerHub.css';

interface PlayerHubOverlayProps {
  onClose: () => void;
  onStartTutorial?: (sequenceId: string) => void;
  pressIssues: ArchivedEdition[];
  onOpenEdition: (issue: ArchivedEdition) => void;
  onDeleteEdition: (id: string) => void;
  stateIntel?: PlayerStateIntel;
  intelArchive: IntelArchiveEntry[];
  onDeleteIntel: (id: string) => void;
  onClearIntel?: () => void;
  faction: 'truth' | 'government';
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
    paranormalHotspotHistory: StateParanormalHotspotSummary[];
  }>;
  eventHistory: Array<{
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

type HubTab = 'achievements' | 'cards' | 'tutorials' | 'press' | 'evidence' | 'intel';

const PlayerHubOverlay = ({
  onClose,
  onStartTutorial,
  pressIssues,
  onOpenEdition,
  onDeleteEdition,
  stateIntel,
  intelArchive,
  onDeleteIntel,
  onClearIntel,
  faction,
}: PlayerHubOverlayProps) => {
  const [activeTab, setActiveTab] = useState<HubTab>(() => {
    if (pressIssues.length > 0) {
      return 'press';
    }

    if (intelArchive.length > 0) {
      return 'evidence';
    }

    if (stateIntel && stateIntel.recentEvents.length > 0) {
      return 'intel';
    }

    return 'achievements';
  });

  const isTruth = faction === 'truth';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <Card
        className={clsx(
          'player-hub-card relative flex h-[90vh] w-full max-w-7xl flex-col overflow-hidden',
          isTruth
            ? 'player-hub-truth border border-amber-900/40 bg-[rgba(252,245,232,0.97)] text-stone-900 shadow-[0_35px_120px_rgba(124,45,18,0.25)]'
            : 'player-hub-government border border-emerald-500/30 bg-slate-950/95 text-slate-100 shadow-[0_0_80px_rgba(16,185,129,0.25)]',
        )}
      >
        <div className="player-hub-background pointer-events-none absolute inset-0">
          {isTruth ? (
            <>
              <div className="player-hub-truth__paper" />
              <div className="player-hub-truth__grain" />
              <div className="player-hub-truth__thread player-hub-truth__thread--one" />
              <div className="player-hub-truth__thread player-hub-truth__thread--two" />
              <div className="player-hub-truth__tape player-hub-truth__tape--one" />
              <div className="player-hub-truth__tape player-hub-truth__tape--two" />
            </>
          ) : (
            <>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.22),_transparent_55%)] opacity-60" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(56,189,248,0.18),_transparent_60%)] opacity-50" />
              <div
                className="absolute inset-0 opacity-35 mix-blend-screen"
                style={{ backgroundImage: 'linear-gradient(135deg, rgba(56,189,248,0.16), transparent 45%, rgba(16,185,129,0.12))' }}
              />
            </>
          )}
        </div>

        <div
          className={clsx(
            'player-hub-header relative border-b px-6 py-5 backdrop-blur',
            isTruth
              ? 'border-rose-900/40 bg-gradient-to-r from-amber-100 via-rose-50 to-amber-200/80 text-stone-900'
              : 'border-emerald-500/20 bg-gradient-to-r from-emerald-900/40 via-slate-950 to-slate-950/90 text-emerald-100',
          )}
        >
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="space-y-2">
              <Badge
                className={clsx(
                  'player-hub-badge border font-mono text-[11px] uppercase tracking-[0.35em]',
                  isTruth
                    ? 'border-rose-800/60 bg-rose-100/90 text-rose-900 shadow-[0_6px_18px_rgba(124,45,18,0.18)]'
                    : 'border-emerald-400/60 bg-emerald-500/15 text-emerald-200',
                )}
              >
                Operator Uplink
              </Badge>
              <h2
                className={clsx(
                  'font-mono text-2xl font-semibold uppercase tracking-[0.2em]',
                  isTruth ? 'text-rose-900 drop-shadow-[0_1px_0_rgba(255,255,255,0.65)]' : 'text-emerald-100',
                )}
              >
                AGENT DOSSIER HUB
              </h2>
              <p
                className={clsx(
                  'max-w-2xl text-sm',
                  isTruth ? 'text-stone-700' : 'text-emerald-100/70',
                )}
              >
                Review your progress, browse unlocked cards, and continue your training across the network.
              </p>
            </div>
            <Button
              onClick={onClose}
              variant="outline"
              size="sm"
              className={clsx(
                'player-hub-close-btn transition',
                isTruth
                  ? 'border-rose-800/40 bg-rose-100/70 text-rose-900 shadow-sm hover:bg-rose-200/80 hover:text-rose-900'
                  : 'border-emerald-400/40 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/20 hover:text-emerald-100',
              )}
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
            <TabsList
              className={clsx(
                'player-hub-tablist grid w-full grid-cols-6 gap-2 rounded-lg border p-1 backdrop-blur',
                isTruth
                  ? 'border-rose-900/40 bg-[rgba(255,255,255,0.86)] shadow-[inset_0_15px_40px_rgba(124,45,18,0.12)]'
                  : 'border-emerald-500/20 bg-slate-900/70',
              )}
            >
              <TabsTrigger
                value="achievements"
                className={clsx(
                  'flex items-center justify-center gap-2 rounded-md border border-transparent px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.32em] transition',
                  isTruth
                    ? 'text-stone-500 data-[state=active]:border-rose-900/60 data-[state=active]:bg-amber-100/90 data-[state=active]:text-rose-900 data-[state=active]:shadow-[inset_0_4px_18px_rgba(124,45,18,0.18)]'
                    : 'text-slate-400 data-[state=active]:border-emerald-400/60 data-[state=active]:bg-emerald-500/15 data-[state=active]:text-emerald-200',
                )}
              >
                <Trophy className="h-4 w-4" />
                Achievements
              </TabsTrigger>
              <TabsTrigger
                value="cards"
                className={clsx(
                  'flex items-center justify-center gap-2 rounded-md border border-transparent px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.32em] transition',
                  isTruth
                    ? 'text-stone-500 data-[state=active]:border-rose-900/60 data-[state=active]:bg-amber-100/90 data-[state=active]:text-rose-900 data-[state=active]:shadow-[inset_0_4px_18px_rgba(124,45,18,0.18)]'
                    : 'text-slate-400 data-[state=active]:border-emerald-400/60 data-[state=active]:bg-emerald-500/15 data-[state=active]:text-emerald-200',
                )}
              >
                <Library className="h-4 w-4" />
                Card Collection
              </TabsTrigger>
              <TabsTrigger
                value="tutorials"
                className={clsx(
                  'flex items-center justify-center gap-2 rounded-md border border-transparent px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.32em] transition',
                  isTruth
                    ? 'text-stone-500 data-[state=active]:border-rose-900/60 data-[state=active]:bg-amber-100/90 data-[state=active]:text-rose-900 data-[state=active]:shadow-[inset_0_4px_18px_rgba(124,45,18,0.18)]'
                    : 'text-slate-400 data-[state=active]:border-emerald-400/60 data-[state=active]:bg-emerald-500/15 data-[state=active]:text-emerald-200',
                )}
              >
                <GraduationCap className="h-4 w-4" />
                Shadow Academy
              </TabsTrigger>
              <TabsTrigger
                value="press"
                className={clsx(
                  'flex items-center justify-center gap-2 rounded-md border border-transparent px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.32em] transition',
                  isTruth
                    ? 'text-stone-500 data-[state=active]:border-rose-900/60 data-[state=active]:bg-amber-100/90 data-[state=active]:text-rose-900 data-[state=active]:shadow-[inset_0_4px_18px_rgba(124,45,18,0.18)]'
                    : 'text-slate-400 data-[state=active]:border-emerald-400/60 data-[state=active]:bg-emerald-500/15 data-[state=active]:text-emerald-200',
                )}
              >
                <Newspaper className="h-4 w-4" />
                Press Archive
              </TabsTrigger>
              <TabsTrigger
                value="evidence"
                className={clsx(
                  'flex items-center justify-center gap-2 rounded-md border border-transparent px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.32em] transition',
                  isTruth
                    ? 'text-stone-500 data-[state=active]:border-rose-900/60 data-[state=active]:bg-amber-100/90 data-[state=active]:text-rose-900 data-[state=active]:shadow-[inset_0_4px_18px_rgba(124,45,18,0.18)]'
                    : 'text-slate-400 data-[state=active]:border-emerald-400/60 data-[state=active]:bg-emerald-500/15 data-[state=active]:text-emerald-200',
                )}
              >
                <FileSearch2 className="h-4 w-4" />
                Evidence
              </TabsTrigger>
              <TabsTrigger
                value="intel"
                className={clsx(
                  'flex items-center justify-center gap-2 rounded-md border border-transparent px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.32em] transition',
                  isTruth
                    ? 'text-stone-500 data-[state=active]:border-rose-900/60 data-[state=active]:bg-amber-100/90 data-[state=active]:text-rose-900 data-[state=active]:shadow-[inset_0_4px_18px_rgba(124,45,18,0.18)]'
                    : 'text-slate-400 data-[state=active]:border-emerald-400/60 data-[state=active]:bg-emerald-500/15 data-[state=active]:text-emerald-200',
                )}
              >
                <MapPin className="h-4 w-4" />
                Field Intel
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="relative flex-1 overflow-hidden px-6 pb-6 pt-4">
            <div
              className={clsx(
                'player-hub-panel relative flex h-full flex-col overflow-hidden rounded-2xl border',
                isTruth
                  ? 'border-rose-900/30 bg-[rgba(255,250,240,0.88)] shadow-[0_35px_80px_rgba(124,45,18,0.18)]'
                  : 'border-emerald-500/25 bg-slate-950/80 shadow-[0_0_45px_rgba(16,185,129,0.15)]',
              )}
            >
              <div className="pointer-events-none absolute inset-0 opacity-45">
                {isTruth ? (
                  <>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(252,211,77,0.25),_transparent_60%)]" />
                    <div className="absolute inset-0 bg-[linear-gradient(160deg,_rgba(244,114,182,0.18),_transparent_55%)]" />
                  </>
                ) : (
                  <>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),_transparent_55%)]" />
                    <div className="absolute inset-0 bg-[linear-gradient(160deg,_rgba(56,189,248,0.12),_transparent_60%)]" />
                  </>
                )}
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
              <TabsContent value="evidence" className="relative h-full overflow-hidden p-6 focus-visible:outline-none">
                <EvidenceArchivePanel
                  entries={intelArchive}
                  onDelete={onDeleteIntel}
                  onClear={onClearIntel}
                  className="h-full"
                />
              </TabsContent>
              <TabsContent value="intel" className="relative h-full overflow-hidden p-6 focus-visible:outline-none">
                <div className="flex h-full flex-col gap-4 xl:grid xl:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
                  <PlayerHubMapView
                    intel={stateIntel}
                    faction={faction}
                    className="h-full min-h-[320px]"
                  />
                  <div className="min-h-0 overflow-hidden">
                    <StateIntelBoard intel={stateIntel} />
                  </div>
                </div>
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </Card>
    </div>
  );
};

export default PlayerHubOverlay;
