import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Trophy, Library, GraduationCap, Newspaper, X, MapPin, FileSearch2, Target } from 'lucide-react';
import { AchievementsSection } from './AchievementPanel';
import { CardCollectionContent } from './CardCollection';
import { TutorialSection } from './TutorialOverlay';
import PressArchivePanel from './PressArchivePanel';
import type { AgendaMoment, ArchivedEdition } from '@/hooks/usePressArchive';
import StateIntelBoard from './StateIntelBoard';
import PlayerHubMapView from './PlayerHubMapView';
import type { StateEventBonusSummary, StateParanormalHotspotSummary } from '@/hooks/gameStateTypes';
import EvidenceArchivePanel from './EvidenceArchivePanel';
import type { IntelArchiveEntry } from '@/hooks/useIntelArchive';
import SecretAgendaCard from './SecretAgenda';
import { getAgendaById, type SecretAgenda as AgendaDefinition } from '@/data/agendaDatabase';
import type { GameState } from '@/hooks/gameStateTypes';
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
  agendasEnabled: boolean;
  currentAgenda?: GameState['secretAgenda'];
  completedAgendaIds: string[];
  agendaMoments?: AgendaMoment[];
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

type HubTab = 'achievements' | 'agendas' | 'cards' | 'tutorials' | 'press' | 'evidence' | 'intel';

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
  agendasEnabled,
  currentAgenda,
  completedAgendaIds,
  agendaMoments = [],
}: PlayerHubOverlayProps) => {
  const [activeTab, setActiveTab] = useState<HubTab>(() => {
    if (agendasEnabled && (currentAgenda || completedAgendaIds.length > 0)) {
      return 'agendas';
    }

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
  const [agendaFilter, setAgendaFilter] = useState<'all' | AgendaMoment['status']>('all');
  const completedAgendas = useMemo(
    () =>
      completedAgendaIds
        .map(id => getAgendaById(id))
        .filter((agenda): agenda is AgendaDefinition => Boolean(agenda)),
    [completedAgendaIds],
  );

  const agendaHistory = useMemo(
    () =>
      [...agendaMoments]
        .filter(Boolean)
        .sort((a, b) => (a.recordedAt ?? 0) - (b.recordedAt ?? 0)),
    [agendaMoments],
  );

  const filteredAgendaHistory = useMemo(() => {
    if (agendaFilter === 'all') {
      return agendaHistory;
    }
    return agendaHistory.filter(moment => moment.status === agendaFilter);
  }, [agendaHistory, agendaFilter]);

  const agendaMomentFormatter = useMemo(() => {
    try {
      return new Intl.DateTimeFormat(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return null;
    }
  }, []);

  const agendaStatusTone: Record<AgendaMoment['status'], { badge: string; bullet: string }> = {
    advance: {
      badge: 'border-sky-500/60 bg-sky-500/10 text-sky-700 dark:text-sky-200',
      bullet: 'border-sky-500 bg-sky-400',
    },
    setback: {
      badge: 'border-rose-500/60 bg-rose-500/10 text-rose-700 dark:text-rose-200',
      bullet: 'border-rose-500 bg-rose-400',
    },
    complete: {
      badge: 'border-emerald-500/60 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200',
      bullet: 'border-emerald-500 bg-emerald-400',
    },
  };

  const agendaStatusLabel: Record<'all' | AgendaMoment['status'], string> = {
    all: 'Alle',
    advance: 'Fremdrift',
    setback: 'Tilbakeslag',
    complete: 'Fullført',
  };

  const resolveMomentTimestamp = (timestamp: number | undefined): string => {
    if (!timestamp) {
      return 'Tidspunkt ukjent';
    }
    if (agendaMomentFormatter) {
      try {
        return agendaMomentFormatter.format(new Date(timestamp));
      } catch {
        // fall through to fallback formatting
      }
    }
    const date = new Date(timestamp);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${month}/${day} ${hours}:${minutes}`;
  };

  const difficultyTone: Record<AgendaDefinition['difficulty'], string> = {
    easy: 'border-emerald-500/30 bg-emerald-500/15 text-emerald-600',
    medium: 'border-amber-500/30 bg-amber-500/15 text-amber-700',
    hard: 'border-rose-500/30 bg-rose-500/15 text-rose-600',
    legendary: 'border-violet-500/30 bg-violet-500/15 text-violet-600',
  };

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
                'player-hub-tablist grid w-full grid-cols-7 gap-2 rounded-lg border p-1 backdrop-blur',
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
                value="agendas"
                className={clsx(
                  'flex items-center justify-center gap-2 rounded-md border border-transparent px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.32em] transition',
                  isTruth
                    ? 'text-stone-500 data-[state=active]:border-rose-900/60 data-[state=active]:bg-amber-100/90 data-[state=active]:text-rose-900 data-[state=active]:shadow-[inset_0_4px_18px_rgba(124,45,18,0.18)]'
                    : 'text-slate-400 data-[state=active]:border-emerald-400/60 data-[state=active]:bg-emerald-500/15 data-[state=active]:text-emerald-200',
                )}
              >
                <Target className="h-4 w-4" />
                Agendas
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

              <TabsContent value="agendas" className="relative h-full overflow-hidden p-6 focus-visible:outline-none">
                <div className="flex h-full flex-col gap-4">
                  {agendasEnabled ? (
                    <>
                      <Card
                        className={clsx(
                          'overflow-hidden border p-4 shadow-sm backdrop-blur',
                          isTruth
                            ? 'border-rose-900/30 bg-amber-50/80 text-stone-900'
                            : 'border-emerald-500/25 bg-slate-900/80 text-emerald-50',
                        )}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.32em] opacity-70">
                              Active Agenda
                            </p>
                            <h3 className="text-lg font-bold uppercase tracking-[0.12em]">
                              {currentAgenda?.title ?? 'No agenda assigned'}
                            </h3>
                          </div>
                          {currentAgenda?.difficulty && (
                            <Badge
                              variant="outline"
                              className={clsx(
                                'border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.32em]',
                                difficultyTone[currentAgenda.difficulty],
                              )}
                            >
                              {currentAgenda.difficulty}
                            </Badge>
                          )}
                        </div>
                        <div className="mt-4">
                          {currentAgenda ? (
                            <SecretAgendaCard agenda={currentAgenda} isPlayer={faction === 'truth'} />
                          ) : (
                            <div className="rounded border border-dashed border-current/40 bg-black/5 p-4 text-sm font-mono uppercase tracking-[0.2em] opacity-70">
                              Awaiting assignment...
                            </div>
                          )}
                        </div>
                      </Card>

                      <div className="flex-1 space-y-4 overflow-y-auto pr-1">
                        {completedAgendas.length > 0 ? (
                          <div className="grid gap-3 lg:grid-cols-2">
                            {completedAgendas.map(agenda => (
                              <Card
                                key={agenda.id}
                                className={clsx(
                                  'h-full border p-4 transition hover:shadow-md',
                                  isTruth
                                    ? 'border-rose-900/30 bg-rose-50/80 text-stone-900'
                                    : 'border-emerald-500/25 bg-slate-950/70 text-slate-100',
                                )}
                              >
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <Badge variant="secondary" className="bg-green-500/20 text-green-900 dark:text-green-200">
                                      Completed
                                    </Badge>
                                    <Badge
                                      variant="outline"
                                      className={clsx(
                                        'border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.32em]',
                                        difficultyTone[agenda.difficulty],
                                      )}
                                    >
                                      {agenda.difficulty}
                                    </Badge>
                                  </div>
                                  <Badge variant="outline" className="text-[10px] uppercase tracking-[0.2em]">
                                    {agenda.category}
                                  </Badge>
                                </div>
                                <div className="mt-3 space-y-2">
                                  <h4 className="text-base font-semibold uppercase tracking-[0.12em]">
                                    {agenda.title}
                                  </h4>
                                  <p className="text-sm text-muted-foreground">
                                    {agenda.description}
                                  </p>
                                  {agenda.issueTheme && (
                                    <p className="text-[11px] font-mono uppercase tracking-[0.25em] text-muted-foreground/80">
                                      Issue Focus: {agenda.issueTheme}
                                    </p>
                                  )}
                                  {agenda.headline && (
                                    <p className="text-xs italic text-muted-foreground/80">“{agenda.headline}”</p>
                                  )}
                                </div>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <Card
                            className={clsx(
                              'border border-dashed p-6 text-center text-sm uppercase tracking-[0.28em]',
                              isTruth
                                ? 'border-rose-900/30 bg-rose-50/60 text-rose-900/70'
                                : 'border-emerald-500/25 bg-slate-950/70 text-emerald-100/70',
                            )}
                          >
                            No completed agendas logged yet.
                          </Card>
                        )}

                        <Card
                          className={clsx(
                            'border p-4',
                            isTruth
                              ? 'border-rose-900/30 bg-rose-50/80 text-stone-900'
                              : 'border-emerald-500/25 bg-slate-950/70 text-slate-100',
                          )}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <p className="text-[10px] font-semibold uppercase tracking-[0.32em] opacity-70">
                                Agenda-Logg
                              </p>
                              <h3 className="text-lg font-bold uppercase tracking-[0.12em]">
                                Historikk og signaler
                              </h3>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {(['all', 'advance', 'setback', 'complete'] as const).map(filterValue => (
                                <button
                                  key={filterValue}
                                  type="button"
                                  onClick={() => setAgendaFilter(filterValue)}
                                  className={clsx(
                                    'rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] transition',
                                    agendaFilter === filterValue
                                      ? isTruth
                                        ? 'border-rose-900 bg-rose-200/40 text-rose-900 shadow-sm'
                                        : 'border-emerald-400 bg-emerald-500/20 text-emerald-50 shadow-sm'
                                      : isTruth
                                        ? 'border-transparent bg-amber-100/40 text-rose-900/70 hover:border-rose-900/30 hover:bg-amber-100/60'
                                        : 'border-transparent bg-slate-900/60 text-emerald-100/70 hover:border-emerald-500/30 hover:bg-slate-900/80',
                                  )}
                                >
                                  {agendaStatusLabel[filterValue]}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="mt-4">
                            {agendaHistory.length === 0 ? (
                              <div
                                className={clsx(
                                  'rounded border border-dashed p-4 text-center text-xs uppercase tracking-[0.28em] opacity-70',
                                  isTruth
                                    ? 'border-rose-900/30 bg-amber-100/40 text-rose-900/70'
                                    : 'border-emerald-500/25 bg-slate-950/60 text-emerald-100/70',
                                )}
                              >
                                Ingen agenda-historikk registrert ennå.
                              </div>
                            ) : filteredAgendaHistory.length === 0 ? (
                              <div
                                className={clsx(
                                  'rounded border border-dashed p-4 text-center text-xs uppercase tracking-[0.28em] opacity-70',
                                  isTruth
                                    ? 'border-rose-900/30 bg-amber-100/40 text-rose-900/70'
                                    : 'border-emerald-500/25 bg-slate-950/60 text-emerald-100/70',
                                )}
                              >
                                Ingen hendelser samsvarer med filteret.
                              </div>
                            ) : (
                              <div className="relative">
                                <div
                                  className={clsx(
                                    'absolute left-[0.65rem] top-2 bottom-2 w-px',
                                    isTruth ? 'bg-rose-900/30' : 'bg-emerald-500/30',
                                  )}
                                />
                                <div className="space-y-4">
                                  {filteredAgendaHistory.map(moment => {
                                    const progressLabel = `${moment.progress}/${moment.target}`;
                                    const factionLabel =
                                      moment.faction === 'truth' ? 'Truth Coalition' : 'Government Directorate';
                                    const actorLabel = moment.actor === 'player' ? 'Operatives' : 'Opposition Network';
                                    const tone = agendaStatusTone[moment.status];
                                    const statusLabel =
                                      moment.status === 'advance'
                                        ? 'Fremdrift'
                                        : moment.status === 'setback'
                                        ? 'Tilbakeslag'
                                        : 'Fullført';

                                    return (
                                      <div key={moment.id} className="relative pl-8">
                                        <span
                                          className={clsx(
                                            'absolute left-0 top-3 h-3 w-3 -translate-x-1/2 transform rounded-full border-2 shadow-sm',
                                            tone.bullet,
                                          )}
                                        />
                                        <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.28em]">
                                          <Badge variant="outline" className={clsx('px-2 py-0.5', tone.badge)}>
                                            {statusLabel}
                                          </Badge>
                                          <Badge
                                            variant="outline"
                                            className={clsx(
                                              'border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.28em]',
                                              isTruth
                                                ? 'border-rose-900/30 bg-amber-50/80 text-rose-900'
                                                : 'border-emerald-500/30 bg-slate-900/70 text-emerald-100',
                                            )}
                                          >
                                            Stage: {moment.stageLabel}
                                          </Badge>
                                          <Badge
                                            variant="outline"
                                            className={clsx(
                                              'border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.28em]',
                                              isTruth
                                                ? 'border-rose-900/30 bg-amber-50/80 text-rose-900'
                                                : 'border-emerald-500/30 bg-slate-900/70 text-emerald-100',
                                            )}
                                          >
                                            Fremdrift {progressLabel}
                                          </Badge>
                                        </div>
                                        <div className="mt-2 space-y-1">
                                          <h4 className="text-sm font-semibold uppercase tracking-[0.12em]">
                                            {moment.agendaTitle}
                                          </h4>
                                          {moment.stageDescription ? (
                                            <p className="text-xs text-muted-foreground">
                                              {moment.stageDescription}
                                            </p>
                                          ) : null}
                                          <div className="text-[11px] font-mono uppercase tracking-[0.25em] text-muted-foreground/80">
                                            Ansvarlig: {factionLabel} · {actorLabel}
                                          </div>
                                          <div className="text-[10px] uppercase tracking-[0.32em] text-muted-foreground/70">
                                            {resolveMomentTimestamp(moment.recordedAt)}
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        </Card>
                      </div>
                    </>
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-sm text-muted-foreground">
                      <Badge variant="outline" className="px-3 py-1 font-mono text-[10px] uppercase tracking-[0.3em]">
                        System Offline
                      </Badge>
                      <p>Secret agendas are disabled for this campaign.</p>
                    </div>
                  )}
                </div>
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
