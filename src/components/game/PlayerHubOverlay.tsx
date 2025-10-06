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

  const agendaStatusTone: Record<AgendaMoment['status'], string> = {
    advance: 'border-[var(--broadsheet-accent)] bg-[var(--broadsheet-accent-soft)] text-[var(--broadsheet-ink)]',
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
    (): Record<HubTab, { kicker: string; headline: string; dek: string; ticker: string; footer: string }> => ({
      achievements: {
        kicker: 'Scoop Filed',
        headline: 'Centerfold of Glory',
        dek: 'Hero mugshots, improbable stats, and “totally verified” testimonials.',
        ticker: 'Hero desk updates every rotation. Suspicious applause recorded.',
        footer: 'Send victory polaroids to the morgue editor before midnight.',
      },
      agendas: {
        kicker: 'Classified Cables',
        headline: 'Telegram Desk',
        dek: 'Stamped envelopes leaking orders, setbacks, and whispered triumphs.',
        ticker: 'Teleprinters jammed? Tap twice if the redaction lights flicker.',
        footer: 'Agenda desk accepts bribes in microfilm or hand-labeled coffee tins.',
      },
      cards: {
        kicker: 'Collector Insert',
        headline: 'Back-Page Archives',
        dek: 'Perforated card proofs with misaligned ink and contraband commentary.',
        ticker: 'Rumor: new card run smuggled in cereal boxes, watch the aisles.',
        footer: 'Clip-and-save corners so the archivist stops gnashing teeth.',
      },
      tutorials: {
        kicker: 'Correspondence Course',
        headline: 'Shadow Academy Lessons',
        dek: 'Typewritten mailers teaching rookies to disappear and reappear in print.',
        ticker: 'Night class enrollment up 23%. Faculty denies poltergeist assistance.',
        footer: 'Return homework with coffee stains for accelerated grading.',
      },
      press: {
        kicker: 'Newsstand Scoop',
        headline: 'Leaked Editions',
        dek: 'Stacked front pages liberated from shredders and “misplaced” trucks.',
        ticker: 'Paperboys report third moonlight delivery in as many nights.',
        footer: 'Tip the vendor in anomaly coupons for a bonus issue.',
      },
      evidence: {
        kicker: 'Supplement A',
        headline: 'Evidence Annex',
        dek: 'Clippings, diagrams, and gum-stuck memos the officials call gossip.',
        ticker: 'Evidence locker hum registered at 7.2 conspiracies per minute.',
        footer: 'Keep pushpins recycled; the corkboard groans already.',
      },
      intel: {
        kicker: 'Field Wires',
        headline: 'Hotline Atlas',
        dek: 'Live map of contested states, buzzing switchboards, and spectral sightings.',
        ticker: 'Switchboard warns: crosswinds of truth spotted over flyover country.',
        footer: 'Keep the hotline clear; ghosts insist on operator-assisted dialing.',
      },
    }),
    [faction],
  );

  const stampLabel = faction === 'truth' ? 'Leaked Proof' : 'Cleared Copy';

  const scribbleNote = useMemo(
    () =>
      faction === 'truth'
        ? `Stashed this layout in the abandoned pressroom. ${completedAgendas.length} dossiers cracked so far — ink your alibis.`
        : `Filed under “routine morale bulletin.” If ${completedAgendas.length} cases solved, remind interns to deny everything.`,
    [faction, completedAgendas.length],
  );

  const tickerItems = useMemo(() => {
    const items: string[] = [];
    items.push(`Vol. ${volumeNumber.toString().padStart(3, '0')} // ${dateline}`);
    items.push(tabDetails[activeTab].ticker);
    const signalCount = (stateIntel?.recentEvents.length ?? 0) + intelArchive.length;
    const agendaCount = completedAgendas.length + (currentAgenda ? 1 : 0);
    items.push(`${signalCount} wires buzzing // ${agendaCount} dossiers live`);
    return items;
  }, [volumeNumber, dateline, tabDetails, activeTab, stateIntel?.recentEvents.length, intelArchive.length, completedAgendas.length, currentAgenda]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <Card
        className={clsx(
          'player-hub-card player-hub-broadsheet relative flex h-[90vh] w-full max-w-7xl flex-col',
          isTruth ? 'player-hub-truth' : 'player-hub-government',
        )}
      >
        <div className="player-hub-background">
          <div className="broadsheet-paper" />
          <div className="broadsheet-halftone" />
          <div className="broadsheet-fibers" />
          <div className="broadsheet-fold" />
          <div className="broadsheet-margin-notes" />
        </div>

        <div className="broadsheet-shell">
          <header className="broadsheet-masthead">
            <div className="broadsheet-masthead__logo">
              <span>Paranoid Times Weekly</span>
              <span>{faction === 'truth' ? 'Truth Underground Bureau' : 'Office of Official Narratives'}</span>
            </div>
            <div className="broadsheet-masthead__edition">
              <span>{dateline}</span>
              <span>Volume {volumeNumber.toString().padStart(3, '0')}</span>
              <span>Edition #{Math.max(pressIssues.length, 1).toString().padStart(2, '0')}</span>
            </div>
            <div className="broadsheet-masthead__price">3.50 or one classified lead</div>
            <Button
              onClick={onClose}
              variant="outline"
              size="sm"
              className="broadsheet-masthead__close rounded-full border-[1.5px] border-[var(--broadsheet-accent)] bg-white/80 px-4 py-1 font-typewriter text-[11px] uppercase tracking-[0.28em] text-[var(--broadsheet-accent)] shadow-sm transition hover:bg-white"
            >
              <X size={14} className="mr-2" />
              Close Archive
            </Button>
          </header>

          <Tabs
            value={activeTab}
            onValueChange={value => setActiveTab(value as HubTab)}
            className="flex flex-1 flex-col"
          >
            <TabsList className="broadsheet-tablist">
              {(Object.keys(tabDetails) as HubTab[]).map(tabKey => {
                const detail = tabDetails[tabKey];
                return (
                  <TabsTrigger
                    key={tabKey}
                    value={tabKey}
                    className="broadsheet-tab flex w-full flex-col items-start gap-1 tracking-[0.28em] data-[state=inactive]:opacity-85"
                  >
                    <span className="kicker">{detail.kicker}</span>
                    <span>{detail.headline}</span>
                    <span className="dek">{detail.dek}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            <div className="broadsheet-content">
              <div className="broadsheet-stamp">{stampLabel}</div>
              <div className="broadsheet-columns" aria-hidden />
              <div className="broadsheet-content__ticker">
                {tickerItems.map((item, index) => (
                  <span key={`${item}-${index}`}>{item}</span>
                ))}
              </div>
              <div className="broadsheet-content__body">
                <TabsContent
                  value="achievements"
                  className="relative h-full focus-visible:outline-none data-[state=inactive]:hidden"
                >
                  <AchievementsSection className="h-full" variant="broadsheet" />
                </TabsContent>

                <TabsContent
                  value="agendas"
                  className="relative h-full focus-visible:outline-none data-[state=inactive]:hidden"
                >
                  <div className="flex h-full flex-col gap-6">
                    {agendasEnabled ? (
                      <>
                        <div className="grid gap-6 lg:grid-cols-5">
                          <div className="space-y-4 lg:col-span-3">
                            <div className="rounded-xl border border-[var(--broadsheet-rule)] bg-[rgba(255,255,255,0.86)] p-5 shadow-sm">
                              <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                  <p className="font-typewriter text-[10px] uppercase tracking-[0.42em] text-[var(--broadsheet-kicker)]">
                                    Active Agenda Telegram
                                  </p>
                                  <h3 className="font-broadsheetSans text-2xl uppercase tracking-[0.18em]">
                                    {currentAgenda?.title ?? 'Awaiting Assignment'}
                                  </h3>
                                </div>
                                {currentAgenda?.difficulty && (
                                  <Badge
                                    variant="outline"
                                    className={clsx(
                                      'font-typewriter text-[11px] uppercase tracking-[0.38em]',
                                      agendaDifficultyTone[currentAgenda.difficulty],
                                    )}
                                  >
                                    {currentAgenda.difficulty}
                                  </Badge>
                                )}
                              </div>
                              <div className="mt-4 border-t border-dashed border-[var(--broadsheet-rule)] pt-4">
                                {currentAgenda ? (
                                  <SecretAgendaCard agenda={currentAgenda} isPlayer={faction === 'truth'} />
                                ) : (
                                  <div className="font-typewriter text-xs uppercase tracking-[0.32em] text-[var(--broadsheet-muted)]">
                                    Bureaucrats misplaced the envelope again.
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="rounded-xl border border-[var(--broadsheet-rule)] bg-[rgba(255,255,255,0.82)] p-5">
                              <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
                                <div className="font-typewriter text-[11px] uppercase tracking-[0.38em] text-[var(--broadsheet-kicker)]">
                                  Cable Log
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                  {(Object.keys(agendaStatusLabel) as Array<'all' | AgendaMoment['status']>).map(statusKey => (
                                    <button
                                      key={statusKey}
                                      type="button"
                                      onClick={() => setAgendaFilter(statusKey)}
                                      className={clsx(
                                        'rounded-full border px-3 py-1 text-[11px] font-typewriter uppercase tracking-[0.32em] transition',
                                        agendaFilter === statusKey
                                          ? 'border-[var(--broadsheet-accent)] bg-[var(--broadsheet-accent-soft)] text-[var(--broadsheet-ink)]'
                                          : 'border-[var(--broadsheet-rule)] text-[var(--broadsheet-muted)] hover:bg-white/70',
                                      )}
                                    >
                                      {agendaStatusLabel[statusKey]}
                                    </button>
                                  ))}
                                </div>
                              </header>
                              <div className="space-y-4 overflow-y-auto pr-1">
                                {filteredAgendaHistory.length === 0 ? (
                                  <p className="font-typewriter text-xs uppercase tracking-[0.3em] text-[var(--broadsheet-muted)]">
                                    No cable traffic yet — suspiciously quiet.
                                  </p>
                                ) : (
                                  filteredAgendaHistory.map(moment => (
                                    <article
                                      key={moment.id}
                                      className="grid gap-3 rounded-lg border border-dashed border-[var(--broadsheet-rule)] bg-white/80 p-3 md:grid-cols-[180px,1fr]"
                                    >
                                      <div className="flex flex-col gap-2">
                                        <span className="font-typewriter text-[11px] uppercase tracking-[0.32em] text-[var(--broadsheet-muted)]">
                                          {resolveMomentTimestamp(moment.timestamp)}
                                        </span>
                                        <span className="font-typewriter text-[11px] uppercase tracking-[0.32em] text-[var(--broadsheet-muted)]">
                                          Filed by {moment.actor ?? 'Unknown Bureau'}
                                        </span>
                                        <span
                                          className={clsx(
                                            'inline-flex items-center justify-center rounded-full border px-3 py-1 text-[11px] font-typewriter uppercase tracking-[0.32em]',
                                            agendaStatusTone[moment.status],
                                          )}
                                        >
                                          {moment.status.toUpperCase()}
                                        </span>
                                      </div>
                                      <div className="space-y-2">
                                        <h4 className="font-broadsheetSans text-lg uppercase tracking-[0.14em]">
                                          {moment.title}
                                        </h4>
                                        <p className="font-broadsheet text-[15px] leading-relaxed text-[var(--broadsheet-ink)]">
                                          {moment.description}
                                        </p>
                                        {moment.redaction && (
                                          <p className="font-typewriter text-xs uppercase tracking-[0.32em] text-[var(--broadsheet-muted)]">
                                            REDACTION NOTE: {moment.redaction}
                                          </p>
                                        )}
                                      </div>
                                    </article>
                                  ))
                                )}
                              </div>
                            </div>
                          </div>
                          <aside className="space-y-4 rounded-xl border border-[var(--broadsheet-rule)] bg-[rgba(255,255,255,0.82)] p-5">
                            <h4 className="font-broadsheetSans text-xl uppercase tracking-[0.16em]">Completed Dossiers</h4>
                            {completedAgendas.length === 0 ? (
                              <p className="font-typewriter text-xs uppercase tracking-[0.3em] text-[var(--broadsheet-muted)]">
                                Filing cabinet empty. That never happens.
                              </p>
                            ) : (
                              <div className="space-y-3">
                                {completedAgendas.map(agenda => (
                                  <div
                                    key={agenda.id}
                                    className="rounded-lg border border-dashed border-[var(--broadsheet-rule)] bg-white/80 p-3"
                                  >
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                      <span className="font-broadsheetSans text-sm uppercase tracking-[0.2em]">
                                        {agenda.title}
                                      </span>
                                      <span className="font-typewriter text-[11px] uppercase tracking-[0.32em] text-[var(--broadsheet-muted)]">
                                        {agenda.category}
                                      </span>
                                    </div>
                                    <p className="mt-1 font-broadsheet text-sm leading-relaxed text-[var(--broadsheet-muted)]">
                                      {agenda.description}
                                    </p>
                                    {agenda.headline && (
                                      <p className="mt-2 font-broadsheet text-[13px] italic text-[var(--broadsheet-ink)]">
                                        “{agenda.headline}”
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </aside>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-[var(--broadsheet-rule)] bg-[rgba(255,255,255,0.7)] p-6 text-center font-typewriter text-xs uppercase tracking-[0.32em] text-[var(--broadsheet-muted)]">
                        Agendas unlock later in the campaign. Keep the presses warm.
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent
                  value="cards"
                  className="relative h-full focus-visible:outline-none data-[state=inactive]:hidden"
                >
                  <CardCollectionContent className="h-full" isActive={activeTab === 'cards'} variant="broadsheet" />
                </TabsContent>

                <TabsContent
                  value="tutorials"
                  className="relative h-full focus-visible:outline-none data-[state=inactive]:hidden"
                >
                  <TutorialSection
                    className="h-full"
                    onClose={onClose}
                    onStartTutorial={onStartTutorial}
                    showCloseButton={false}
                    isActive={activeTab === 'tutorials'}
                    variant="broadsheet"
                  />
                </TabsContent>

                <TabsContent
                  value="press"
                  className="relative h-full focus-visible:outline-none data-[state=inactive]:hidden"
                >
                  <PressArchivePanel
                    className="h-full"
                    issues={pressIssues}
                    onOpen={onOpenEdition}
                    onDelete={onDeleteEdition}
                    variant="broadsheet"
                  />
                </TabsContent>

                <TabsContent
                  value="evidence"
                  className="relative h-full focus-visible:outline-none data-[state=inactive]:hidden"
                >
                  <EvidenceArchivePanel
                    className="h-full"
                    entries={intelArchive}
                    onDelete={onDeleteIntel}
                    onClear={onClearIntel}
                    variant="broadsheet"
                  />
                </TabsContent>

                <TabsContent
                  value="intel"
                  className="relative h-full focus-visible:outline-none data-[state=inactive]:hidden"
                >
                  <div className="flex h-full flex-col gap-6 xl:grid xl:grid-cols-[1.1fr,0.9fr]">
                    <div className="rounded-xl border border-[var(--broadsheet-rule)] bg-[rgba(255,255,255,0.86)] p-4 shadow-sm">
                      <h3 className="mb-3 font-broadsheetSans text-xl uppercase tracking-[0.18em]">Nationwide Hotline</h3>
                      <PlayerHubMapView intel={stateIntel} faction={faction} className="h-full min-h-[320px]" />
                    </div>
                    <div className="min-h-0 rounded-xl border border-[var(--broadsheet-rule)] bg-[rgba(255,255,255,0.82)] p-4">
                      <StateIntelBoard intel={stateIntel} variant="broadsheet" />
                    </div>
                  </div>
                </TabsContent>
              </div>
            </div>
          </Tabs>

          <footer className="broadsheet-footer-note">
            <span>Paranoid Times Syndicate — {faction === 'truth' ? 'Leakers Welcome' : 'Censored for Your Safety'}</span>
            <span>{activeTab === 'intel' ? 'Wire room humming — keep receivers calibrated.' : tabDetails[activeTab].footer}</span>
          </footer>
          <div className="broadsheet-chatter">{scribbleNote}</div>
        </div>
      </Card>
    </div>
  );
};


export default PlayerHubOverlay;
