import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Trophy,
  Library,
  GraduationCap,
  Newspaper,
  X,
  MapPin,
  FileSearch2,
  Target,
  BookOpen,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
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
import ParapediaPanel from './parapedia/ParapediaPanel';

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

type HubTab =
  | 'parapedia'
  | 'achievements'
  | 'agendas'
  | 'cards'
  | 'tutorials'
  | 'press'
  | 'evidence'
  | 'intel';

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
  const isTruth = faction === 'truth';

  const [activeTab, setActiveTab] = useState<HubTab>(() => {
    if (faction === 'truth') {
      return 'parapedia';
    }

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

  const agendaStatusTone: Record<AgendaMoment['status'], string> = {
    advance: 'border-[var(--dossier-accent)] bg-[var(--dossier-accent-soft)] text-[var(--dossier-ink)]',
    setback: 'border-[#b7423f] bg-[#f5d4d1] text-[#5b1c15]',
    complete: 'border-[#336f3a] bg-[#d1ead4] text-[#1f4b24]',
  };

  const agendaStatusLabel: Record<'all' | AgendaMoment['status'], string> = {
    all: 'All',
    advance: 'Advance',
    setback: 'Setback',
    complete: 'Complete',
  };

  const resolveMomentTimestamp = (timestamp: number | undefined): string => {
    if (!timestamp) {
      return 'Unknown Time';
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

  const agendaDifficultyTone: Record<AgendaDefinition['difficulty'], string> = {
    easy: 'border-[#336f3a] bg-[#d1ead4] text-[#1f4b24]',
    medium: 'border-[#b1691b] bg-[#f6e2c5] text-[#633a09]',
    hard: 'border-[#a12a3a] bg-[#f6cdd6] text-[#5c111d]',
    legendary: 'border-[#3c3a8f] bg-[#dcd8f7] text-[#242064]',
  };

  const dateline = useMemo(() => {
    try {
      return new Intl.DateTimeFormat(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(new Date());
    } catch {
      return new Date().toLocaleDateString();
    }
  }, []);

  const volumeNumber = useMemo(
    () => 208 + completedAgendaIds.length * 3 + (currentAgenda ? 1 : 0),
    [completedAgendaIds.length, currentAgenda],
  );

  const tabDetails = useMemo(
    (): Record<HubTab, { kicker: string; headline: string; dek: string }> => ({
      parapedia: {
        kicker: 'FILE-PEDIA',
        headline: 'ParaPedia',
        dek: 'Crowdsourced dossier of Truth Bureau counter-narratives and exposed artifacts.',
      },
      achievements: {
        kicker: 'FILE-ACH',
        headline: 'Achievements',
        dek: 'Recorded accomplishments and commendations',
      },
      agendas: {
        kicker: 'FILE-OPS',
        headline: 'Operations',
        dek: 'Active and completed operational objectives',
      },
      cards: {
        kicker: 'FILE-INV',
        headline: 'Card Inventory',
        dek: 'Catalogued asset and resource records',
      },
      tutorials: {
        kicker: 'FILE-TRN',
        headline: 'Training',
        dek: 'Instructional materials and protocols',
      },
      press: {
        kicker: 'FILE-PRS',
        headline: 'Press Archive',
        dek: 'Published intelligence reports',
      },
      evidence: {
        kicker: 'FILE-EVD',
        headline: 'Evidence',
        dek: 'Collected intelligence and artifacts',
      },
      intel: {
        kicker: 'FILE-MAP',
        headline: 'Intel Map',
        dek: 'Geographical intelligence overview',
      },
    }),
    [],
  );

  const tabOrder = useMemo(() => {
    const baseOrder: HubTab[] = ['parapedia', 'achievements', 'agendas', 'cards', 'tutorials', 'press', 'evidence', 'intel'];
    return baseOrder;
  }, []);

  const folderIcons = useMemo<Record<HubTab, LucideIcon>>(
    () => ({
      parapedia: BookOpen,
      achievements: Trophy,
      agendas: Target,
      cards: Library,
      tutorials: GraduationCap,
      press: Newspaper,
      evidence: FileSearch2,
      intel: MapPin,
    }),
    [],
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <Card
        className={clsx(
          'player-hub-card player-hub-dossier relative flex max-w-7xl h-[90vh] w-full flex-col overflow-hidden',
          isTruth ? 'player-hub-truth' : 'player-hub-government',
        )}
      >
        <div className="player-hub-background" />

        <div className="dossier-container">
          <header className="dossier-header">
            <div className="dossier-header__title">
              {faction === 'truth' ? 'TRUTH ARCHIVE' : 'OFFICIAL RECORDS'}
            </div>
            <div className="dossier-header__classification">
              <span>⚠ CLASSIFIED</span>
              <span>{dateline}</span>
              <Button
                onClick={onClose}
                variant="ghost"
                size="sm"
                className="text-[var(--dossier-paper)] hover:text-white"
              >
                <X size={16} />
              </Button>
            </div>
          </header>

          <div className="dossier-folder-nav">
            {tabOrder.map(tabKey => {
              const detail = tabDetails[tabKey];
              const FolderIcon = folderIcons[tabKey];

              return (
                <button
                  key={tabKey}
                  onClick={() => setActiveTab(tabKey)}
                  className="dossier-folder"
                  data-active={activeTab === tabKey}
                >
                  <div className="flex items-center gap-2">
                    <FolderIcon size={16} />
                    <span className="dossier-folder__label">{detail.headline}</span>
                  </div>
                  <div className="dossier-folder__code">{detail.kicker}</div>
                </button>
              );
            })}
          </div>

          <div className="dossier-content">
            <div className="dossier-stamp">{faction === 'truth' ? 'LEAKED' : 'CLEARED'}</div>

            <div className="classification-bar">
              {faction === 'truth' ? 'UNAUTHORIZED ACCESS' : 'AUTHORIZED PERSONNEL ONLY'}
            </div>

            <div className="file-metadata">
              <div className="file-metadata__item">
                <div className="file-metadata__label">File Date</div>
                <div className="file-metadata__value">{dateline}</div>
              </div>
              <div className="file-metadata__item">
                <div className="file-metadata__label">Case #</div>
                <div className="file-metadata__value">VOL-{volumeNumber.toString().padStart(3, '0')}</div>
              </div>
              <div className="file-metadata__item">
                <div className="file-metadata__label">Division</div>
                <div className="file-metadata__value">{faction === 'truth' ? 'Truth Bureau' : 'Official Records'}</div>
              </div>
            </div>

            {activeTab === 'parapedia' && (
              <div className="dossier-section">
                <div className="dossier-file-header">
                  <div className="dossier-file-title">{tabDetails.parapedia.headline}</div>
                  <div className="dossier-file-code">{tabDetails.parapedia.kicker}</div>
                </div>
                <p className="mb-6 text-sm text-[var(--dossier-muted)]">{tabDetails.parapedia.dek}</p>
                <div className="redacted-block h-2 mb-6" />
                <ParapediaPanel
                  faction={faction}
                  intelArchive={intelArchive}
                  pressIssues={pressIssues}
                  agendaMoments={agendaMoments}
                />
              </div>
            )}

            {/* Achievements Tab */}
            {activeTab === 'achievements' && (
              <div className="dossier-section">
                <div className="dossier-file-header">
                  <div className="dossier-file-title">{tabDetails.achievements.headline}</div>
                  <div className="dossier-file-code">{tabDetails.achievements.kicker}</div>
                </div>
                <p className="mb-6 text-sm text-[var(--dossier-muted)]">{tabDetails.achievements.dek}</p>
                <div className="redacted-block h-2 mb-6" />
                <AchievementsSection className="h-full" variant="broadsheet" />
              </div>
            )}

            {/* Agendas Tab */}
            {activeTab === 'agendas' && (
              <div className="dossier-section">
                <div className="dossier-file-header">
                  <div className="dossier-file-title">{tabDetails.agendas.headline}</div>
                  <div className="dossier-file-code">{tabDetails.agendas.kicker}</div>
                </div>
                <p className="mb-6 text-sm text-[var(--dossier-muted)]">{tabDetails.agendas.dek}</p>
                <div className="redacted-block h-2 mb-6" />
                
                {agendasEnabled ? (
                  <div className="grid gap-6 lg:grid-cols-5">
                    <div className="space-y-4 lg:col-span-3">
                      {/* Current Agenda */}
                      <div className="dossier-card">
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                          <div>
                            <p className="font-typewriter text-[10px] uppercase tracking-[0.3em] text-[var(--dossier-muted)]">
                              Active Operation
                            </p>
                            <h3 className="font-mono text-xl uppercase tracking-wider mt-1">
                              {currentAgenda?.title ?? <span className="redacted-line">████████████████</span>}
                            </h3>
                          </div>
                          {currentAgenda?.difficulty && (
                            <Badge
                              variant="outline"
                              className={clsx(
                                'font-typewriter text-[11px] uppercase tracking-[0.3em]',
                                agendaDifficultyTone[currentAgenda.difficulty],
                              )}
                            >
                              {currentAgenda.difficulty}
                            </Badge>
                          )}
                        </div>
                        {currentAgenda ? (
                          <SecretAgendaCard agenda={currentAgenda} isPlayer={faction === 'truth'} />
                        ) : (
                          <p className="font-mono text-xs uppercase text-[var(--dossier-muted)]">
                            No active operation assigned
                          </p>
                        )}
                      </div>

                      {/* Agenda History */}
                      <div className="dossier-card">
                        <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
                          <h4 className="font-mono text-sm uppercase tracking-wider">Operation Log</h4>
                          <div className="flex flex-wrap items-center gap-2">
                            {(Object.keys(agendaStatusLabel) as Array<'all' | AgendaMoment['status']>).map(statusKey => (
                              <button
                                key={statusKey}
                                type="button"
                                onClick={() => setAgendaFilter(statusKey)}
                                className={clsx(
                                  'rounded border px-2 py-1 text-[10px] font-mono uppercase tracking-wider transition',
                                  agendaFilter === statusKey
                                    ? 'border-[var(--dossier-accent)] bg-[var(--dossier-accent)] text-white'
                                    : 'border-[var(--dossier-border)] text-[var(--dossier-muted)] hover:bg-[var(--dossier-paper-dark)]',
                                )}
                              >
                                {agendaStatusLabel[statusKey]}
                              </button>
                            ))}
                          </div>
                        </header>
                        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                          {filteredAgendaHistory.length === 0 ? (
                            <p className="font-mono text-xs uppercase text-[var(--dossier-muted)]">
                              No operations recorded - <span className="redacted-line">████████</span>
                            </p>
                          ) : (
                            filteredAgendaHistory.map(moment => (
                              <article
                                key={moment.id}
                                className="border border-[var(--dossier-border)] bg-white/30 p-3 space-y-2"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--dossier-muted)]">
                                    {resolveMomentTimestamp((moment as any).recordedAt)}
                                  </span>
                                  <Badge
                                    variant="outline"
                                    className={clsx(
                                      'text-[10px] font-mono uppercase tracking-wider',
                                      agendaStatusTone[moment.status],
                                    )}
                                  >
                                    {moment.status}
                                  </Badge>
                                </div>
                                <h5 className="font-mono text-sm uppercase tracking-wide">
                                  {(moment as any).title || 'Classified'}
                                </h5>
                                <p className="text-sm text-[var(--dossier-text)]">
                                  {(moment as any).description || 'Details redacted'}
                                </p>
                              </article>
                            ))
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Completed Agendas Sidebar */}
                    <aside className="dossier-card lg:col-span-2">
                      <h4 className="font-mono text-sm uppercase tracking-wider mb-4">Completed Operations</h4>
                      {completedAgendas.length === 0 ? (
                        <p className="font-mono text-xs uppercase text-[var(--dossier-muted)]">
                          No operations completed
                        </p>
                      ) : (
                        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                          {completedAgendas.map(agenda => (
                            <div
                              key={agenda.id}
                              className="border border-[var(--dossier-border)] bg-white/30 p-3 space-y-2"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-mono text-sm uppercase tracking-wide">
                                  {agenda.title}
                                </span>
                                <span className="font-mono text-[10px] uppercase text-[var(--dossier-muted)]">
                                  {agenda.category}
                                </span>
                              </div>
                              <p className="text-xs text-[var(--dossier-muted)]">
                                {agenda.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </aside>
                  </div>
                ) : (
                  <div className="dossier-card text-center py-12">
                    <p className="font-mono text-sm uppercase tracking-wider text-[var(--dossier-muted)]">
                      Operations system <span className="redacted-line">████████</span> locked
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Cards Tab */}
            {activeTab === 'cards' && (
              <div className="dossier-section">
                <div className="dossier-file-header">
                  <div className="dossier-file-title">{tabDetails.cards.headline}</div>
                  <div className="dossier-file-code">{tabDetails.cards.kicker}</div>
                </div>
                <p className="mb-6 text-sm text-[var(--dossier-muted)]">{tabDetails.cards.dek}</p>
                <div className="redacted-block h-2 mb-6" />
                <CardCollectionContent className="h-full" isActive={activeTab === 'cards'} variant="broadsheet" />
              </div>
            )}

            {/* Tutorials Tab */}
            {activeTab === 'tutorials' && (
              <div className="dossier-section">
                <div className="dossier-file-header">
                  <div className="dossier-file-title">{tabDetails.tutorials.headline}</div>
                  <div className="dossier-file-code">{tabDetails.tutorials.kicker}</div>
                </div>
                <p className="mb-6 text-sm text-[var(--dossier-muted)]">{tabDetails.tutorials.dek}</p>
                <div className="redacted-block h-2 mb-6" />
                <TutorialSection
                  className="h-full"
                  onClose={onClose}
                  onStartTutorial={onStartTutorial}
                  showCloseButton={false}
                  isActive={activeTab === 'tutorials'}
                  variant="broadsheet"
                />
              </div>
            )}

            {/* Press Tab */}
            {activeTab === 'press' && (
              <div className="dossier-section">
                <div className="dossier-file-header">
                  <div className="dossier-file-title">{tabDetails.press.headline}</div>
                  <div className="dossier-file-code">{tabDetails.press.kicker}</div>
                </div>
                <p className="mb-6 text-sm text-[var(--dossier-muted)]">{tabDetails.press.dek}</p>
                <div className="redacted-block h-2 mb-6" />
                <PressArchivePanel
                  className="h-full"
                  issues={pressIssues}
                  onOpen={onOpenEdition}
                  onDelete={onDeleteEdition}
                  variant="broadsheet"
                />
              </div>
            )}

            {/* Evidence Tab */}
            {activeTab === 'evidence' && (
              <div className="dossier-section">
                <div className="dossier-file-header">
                  <div className="dossier-file-title">{tabDetails.evidence.headline}</div>
                  <div className="dossier-file-code">{tabDetails.evidence.kicker}</div>
                </div>
                <p className="mb-6 text-sm text-[var(--dossier-muted)]">{tabDetails.evidence.dek}</p>
                <div className="redacted-block h-2 mb-6" />
                <EvidenceArchivePanel
                  className="h-full"
                  entries={intelArchive}
                  onDelete={onDeleteIntel}
                  onClear={onClearIntel}
                  variant="broadsheet"
                />
              </div>
            )}

            {/* Intel Tab */}
            {activeTab === 'intel' && (
              <div className="dossier-section">
                <div className="dossier-file-header">
                  <div className="dossier-file-title">{tabDetails.intel.headline}</div>
                  <div className="dossier-file-code">{tabDetails.intel.kicker}</div>
                </div>
                <p className="mb-6 text-sm text-[var(--dossier-muted)]">{tabDetails.intel.dek}</p>
                <div className="redacted-block h-2 mb-6" />
                <div className="grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
                  <div className="dossier-card">
                    <h3 className="font-mono text-lg uppercase tracking-wider mb-4">Territorial Overview</h3>
                    <PlayerHubMapView intel={stateIntel} faction={faction} className="h-full min-h-[400px]" />
                  </div>
                  <div className="dossier-card">
                    <StateIntelBoard intel={stateIntel} variant="broadsheet" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PlayerHubOverlay;
