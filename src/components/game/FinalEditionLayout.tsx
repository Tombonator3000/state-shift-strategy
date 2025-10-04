import CardImage from '@/components/game/CardImage';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
  NEWSPAPER_META_CLASS,
  NEWSPAPER_SECTION_HEADING_CLASS,
  NewspaperSection,
  type NewspaperTone,
  getNewspaperBadgeClass,
} from './newspaperLayout';
import type { GameOverReport, FinalEditionEventHighlight, MVPReport } from '@/types/finalEdition';
import {
  getFactionDisplayName,
  getOppositionDisplayName,
  getOutcomeSummary,
  getPlayerOutcomeLabel,
  getVictoryConditionLabel,
} from '@/utils/finalEdition';

interface FinalEditionLayoutProps {
  report: GameOverReport;
}

const formatVictoryHeadline = (report: GameOverReport): string => {
  if (report.winner === 'draw') {
    return 'DEADLOCK! BOTH SIDES CLAIM VICTORY';
  }
  if (report.winner === 'truth') {
    return report.victoryType === 'truth'
      ? 'TRUTH SURGE SHATTERS COVER-UP'
      : report.victoryType === 'states'
        ? 'DISCLOSURE FORCES SWEEP ACROSS THE MAP'
        : report.victoryType === 'ip'
          ? 'TRUTH OPERATIVES FLOOD THE AIRWAVES'
          : 'SECRET AGENDA EXPOSED TO THE WORLD';
  }
  return report.victoryType === 'truth'
    ? 'NARRATIVE LOCKDOWN SUPPRESSES TRUTH'
    : report.victoryType === 'states'
      ? 'GOVERNMENT RECAPTURES THE HEARTLAND'
      : report.victoryType === 'ip'
        ? 'COUNTER-NARRATIVE BLITZ OUTSPENDS RESISTANCE'
        : 'SHADOW BUREAU EXECUTES CLASSIFIED PLAN';
};

const formatVictorySubhead = (report: GameOverReport): string => {
  const rounds = report.rounds > 0 ? `${report.rounds} rounds` : 'a lightning opener';
  const truth = `${Math.round(report.finalTruth)}% truth`; 
  if (report.winner === 'draw') {
    return `Stalemate declared after ${rounds}; truth settles at ${truth}.`;
  }
  const victor = report.winner === 'truth' ? 'Truth Network' : 'Shadow Government';
  const method = report.victoryType === 'truth'
    ? 'truth meter swing'
    : report.victoryType === 'states'
      ? 'territorial control'
      : report.victoryType === 'ip'
        ? 'broadcast dominance'
        : 'covert agenda reveal';
  return `${victor} closes the season via ${method} after ${rounds}; monitors register ${truth}.`;
};

interface AgendaPresentation {
  badgeLabel: string;
  headline: string;
  operationName?: string;
  issueTheme?: string;
  pullQuote?: string;
  statusLabel: string;
  progressLabel: string;
  progress: number;
  target: number;
  completed: boolean;
  revealed: boolean;
}

const presentAgenda = (agenda?: GameOverReport['playerSecretAgenda']): AgendaPresentation | null => {
  if (!agenda) {
    return null;
  }

  const statusLabel = agenda.completed ? 'Completed' : 'In Progress';
  const progressLabel = `${agenda.progress}/${agenda.target}`;
  const headline = agenda.headline || agenda.title;

  return {
    badgeLabel: `${headline} — ${statusLabel} (${progressLabel})`,
    headline,
    operationName: agenda.operationName,
    issueTheme: agenda.issueTheme,
    pullQuote: agenda.pullQuote,
    statusLabel,
    progressLabel,
    progress: agenda.progress,
    target: agenda.target,
    completed: agenda.completed,
    revealed: agenda.revealed,
  };
};

const formatAgendaNarrative = (
  agenda: AgendaPresentation,
  owner: 'player' | 'ai',
): string => {
  const actor = owner === 'player' ? 'Operatives' : 'Opposition strategists';
  const operationLine = agenda.operationName
    ? `Operation ${agenda.operationName} drove the "${agenda.headline}" agenda.`
    : `The "${agenda.headline}" agenda set the operation in motion.`;
  const themeLine = agenda.issueTheme
    ? `The plan weaponized the ${agenda.issueTheme} storyline to sway the board.`
    : '';
  const statusLine = agenda.completed
    ? `${actor} completed the mission after securing ${agenda.progress}/${agenda.target} objectives.`
    : `${actor} left the mission unfinished at ${agenda.progress}/${agenda.target} objectives when the season closed.`;
  const revealLine = agenda.revealed
    ? 'Field teams confirmed the covert plan during play, exposing its moving parts.'
    : 'Post-match decrypts finally exposed the covert plan to analysts.';

  return [operationLine, themeLine, statusLine, revealLine].filter(Boolean).join(' ');
};

const renderImpactBadges = (event: FinalEditionEventHighlight) => {
  const segments: string[] = [];
  if (event.truthDelta) {
    const sign = event.truthDelta > 0 ? '+' : '';
    segments.push(`${sign}${event.truthDelta} Truth`);
  }
  if (event.ipDelta) {
    const sign = event.ipDelta > 0 ? '+' : '';
    segments.push(`${sign}${event.ipDelta} IP`);
  }
  if (event.stateName) {
    segments.push(event.stateName);
  }
  return segments.join(' · ');
};

const CardArt = ({
  cardId,
  className = '',
  showPlaceholder = false,
}: {
  cardId?: string;
  className?: string;
  showPlaceholder?: boolean;
}) => {
  if (!cardId && !showPlaceholder) {
    return null;
  }

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-md border border-newspaper-border/60 bg-newspaper-header/20',
        className,
      )}
    >
      {cardId ? (
        <CardImage cardId={cardId} fit="contain" className="aspect-[63/88] w-full" />
      ) : (
        <div className="flex aspect-[63/88] w-full items-center justify-center px-3 text-center text-[10px] font-semibold uppercase tracking-[0.28em] text-newspaper-text/50">
          Archival footage pending clearance.
        </div>
      )}
    </div>
  );
};

const FinalEditionLayout = ({ report }: FinalEditionLayoutProps) => {
  const headline = formatVictoryHeadline(report);
  const subhead = formatVictorySubhead(report);
  const playerAgenda = presentAgenda(report.playerSecretAgenda);
  const aiAgenda = presentAgenda(report.aiSecretAgenda);
  const agendaBriefings = [
    { label: 'Operative Agenda', owner: 'player' as const, agenda: playerAgenda },
    { label: 'Opposition Agenda', owner: 'ai' as const, agenda: aiAgenda },
  ].filter((entry): entry is { label: string; owner: 'player' | 'ai'; agenda: AgendaPresentation } => Boolean(entry.agenda));
  const eventHighlights = report.topEvents.slice(0, 3);
  const comboHighlights = report.comboHighlights.slice(0, 3);
  const sightings = report.sightings.slice(-4);
  const playerOutcome = getPlayerOutcomeLabel(report);
  const victoryConditionLabel = getVictoryConditionLabel(report.victoryType);
  const playerFactionLabel = getFactionDisplayName(report.playerFaction);
  const oppositionLabel = getOppositionDisplayName(report.playerFaction);
  const outcomeSummary = getOutcomeSummary(report);
  const influenceSummary = `${playerFactionLabel} ${Math.round(report.ipPlayer)} · ${oppositionLabel} ${Math.round(report.ipAI)}`;
  const editionDate = new Date(report.recordedAt).toLocaleDateString();
  const showExtraStamp = report.victoryType === 'agenda' && report.winner !== 'draw';

  const tone: NewspaperTone = playerOutcome === 'Victory' ? 'victory' : 'default';
  const badgeClass = getNewspaperBadgeClass(tone);
  const sectionHeadingClass = cn(
    NEWSPAPER_SECTION_HEADING_CLASS,
    tone === 'victory' ? 'text-victory-foreground/75' : undefined,
  );
  const metaClass = cn(NEWSPAPER_META_CLASS, tone === 'victory' ? 'text-victory-foreground/70' : undefined);
  const accentHeadlineClass =
    tone === 'victory'
      ? 'text-victory-accent drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)]'
      : 'text-newspaper-headline';
  const primaryBodyClass = tone === 'victory' ? 'text-victory-foreground/85' : 'text-newspaper-text/80';
  const mutedBodyClass = tone === 'victory' ? 'text-victory-foreground/75' : 'text-newspaper-text/70';
  const subtleBodyClass = tone === 'victory' ? 'text-victory-foreground/65' : 'text-newspaper-text/60';
  const statLabelClass = tone === 'victory' ? 'text-victory-foreground/75' : 'text-newspaper-text/70';
  const statTileClass =
    tone === 'victory'
      ? 'rounded border border-victory-foreground/35 bg-gradient-to-br from-victory-start/82 via-victory-mid/78 to-victory-end/82 p-3 text-victory-foreground shadow-[0_12px_30px_rgba(0,0,0,0.35)]'
      : 'rounded border border-dashed border-newspaper-border/60 bg-newspaper-bg/70 p-3';
  const statValueClass =
    tone === 'victory'
      ? 'mt-1 text-2xl font-black tracking-tight text-victory-accent drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)]'
      : 'mt-1 text-2xl font-black tracking-tight text-newspaper-headline';
  const highlightCardClass =
    tone === 'victory'
      ? 'rounded-md border border-victory-foreground/30 bg-gradient-to-br from-victory-start/80 via-victory-mid/74 to-victory-end/80 text-victory-foreground shadow-[0_16px_36px_rgba(0,0,0,0.35)]'
      : 'rounded-md border border-newspaper-border/70 bg-white/75 text-newspaper-text shadow-sm';
  const dashedPanelClass =
    tone === 'victory'
      ? 'rounded-md border border-dashed border-victory-foreground/40 bg-victory-foreground/10 p-3 shadow-[0_10px_28px_rgba(0,0,0,0.3)]'
      : 'rounded-md border border-dashed border-newspaper-border/60 bg-newspaper-bg/70 p-3';
  const progressTrackClass = tone === 'victory' ? 'mt-2 h-1.5 bg-victory-foreground/20' : 'mt-2 h-1.5 bg-newspaper-header/30';

  const renderMvpPanel = (label: string, mvp?: MVPReport | null) => {
    if (!mvp) {
      return null;
    }
    return (
      <NewspaperSection tone={tone} className="h-full space-y-4 p-5">
        <div className="flex items-center justify-between">
          <h4 className={sectionHeadingClass}>{label}</h4>
          <Badge className={cn(badgeClass, 'rounded-full px-3 py-0.5 tracking-[0.3em] text-[11px]')}>
            {mvp.impactLabel}
          </Badge>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row">
          <CardArt
            cardId={mvp.cardId}
            showPlaceholder
            className={cn('sm:w-32', tone === 'victory' ? 'border-victory-foreground/40 bg-victory-foreground/10' : undefined)}
          />
          <div className="flex-1 space-y-3">
            <div>
              <h3 className={cn('text-xl font-black uppercase tracking-[0.12em]', accentHeadlineClass)}>{mvp.cardName}</h3>
              <p className={cn('mt-1 text-sm', primaryBodyClass)}>{mvp.highlight}</p>
            </div>
            <div
              className={cn(
                'grid gap-2 text-xs font-semibold uppercase tracking-[0.2em] sm:grid-cols-2',
                mutedBodyClass,
              )}
            >
              <div>Truth Delta: {Math.round(mvp.truthDelta)}%</div>
              <div>
                IP Swing: {mvp.ipDelta >= 0 ? '+' : ''}
                {Math.round(mvp.ipDelta)}
              </div>
              <div>States Captured: {mvp.capturedStates.length > 0 ? mvp.capturedStates.join(', ') : '—'}</div>
              <div>Damage: {Math.round(mvp.damageDealt)}</div>
            </div>
          </div>
        </div>
      </NewspaperSection>
    );
  };

  return (
    <div className={cn('space-y-6', tone === 'victory' ? 'text-victory-foreground' : 'text-newspaper-text')}>
      <NewspaperSection tone={tone} className="relative overflow-hidden px-6 py-6 sm:px-8">
        {showExtraStamp ? (
          <div className="stamp stamp--breaking absolute left-6 top-5">EXTRA</div>
        ) : null}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className={metaClass}>Final Edition • {editionDate}</div>
          <div
            className={cn(
              'flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.35em]',
              tone === 'victory' ? 'text-victory-foreground/80' : 'text-newspaper-text/70',
            )}
          >
            {playerOutcome !== 'Stalemate' ? (
              <Badge className={cn(badgeClass, 'rounded-full px-3 py-1')}>
                {playerOutcome}
              </Badge>
            ) : null}
            <Badge className={cn(badgeClass, 'rounded-full px-3 py-1')}>
              {victoryConditionLabel}
            </Badge>
            <Badge className={cn(badgeClass, 'rounded-full px-3 py-1')}>
              {playerFactionLabel}
            </Badge>
          </div>
        </div>
        <h1 className={cn('mt-3 text-3xl font-black uppercase tracking-[0.12em] sm:text-4xl', accentHeadlineClass)}>
          {headline}
        </h1>
        <p className={cn('mt-2 text-lg font-semibold italic', primaryBodyClass)}>{subhead}</p>
        <p className={cn('mt-3 text-xs font-semibold uppercase tracking-[0.4em]', subtleBodyClass)}>{outcomeSummary}</p>
        <div
          className={cn(
            'mt-5 grid gap-3 text-xs font-semibold uppercase tracking-[0.3em] sm:grid-cols-4',
            mutedBodyClass,
          )}
        >
          <div className={statTileClass}>
            <div className={statLabelClass}>Rounds</div>
            <div className={statValueClass}>
              {report.rounds > 0 ? report.rounds : '—'}
            </div>
          </div>
          <div className={statTileClass}>
            <div className={statLabelClass}>Truth Meter</div>
            <div className={statValueClass}>{Math.round(report.finalTruth)}%</div>
          </div>
          <div className={statTileClass}>
            <div className={statLabelClass}>State Control</div>
            <div className={statValueClass}>
              Truth {report.statesTruth} · Gov {report.statesGov}
            </div>
          </div>
          <div className={statTileClass}>
            <div className={statLabelClass}>Influence Points</div>
            <div className={statValueClass}>{influenceSummary}</div>
          </div>
        </div>
      </NewspaperSection>

      <section className="grid gap-4 md:grid-cols-2">
        {renderMvpPanel('MVP Play', report.mvp)}
        {renderMvpPanel('Runner-Up', report.runnerUp)}
      </section>

      <NewspaperSection tone={tone} className="p-5">
        <div className="flex items-center justify-between">
          <h2 className={sectionHeadingClass}>Key Events</h2>
          <Badge className={cn(badgeClass, 'rounded-full px-3 py-0.5 text-[11px] tracking-[0.3em]')}>
            {eventHighlights.length}
          </Badge>
        </div>
        <div className="mt-4 space-y-4">
          {eventHighlights.map(event => {
            const arcSummary = event.arcSummary;
            const arcStatusLabel = arcSummary
              ? arcSummary.status === 'finale'
                ? 'Finale'
                : arcSummary.status === 'cliffhanger'
                  ? 'Cliffhanger'
                  : 'Advance'
              : null;
            const arcStatusClass = arcSummary
              ? arcSummary.status === 'finale'
                ? 'border-secret-red text-secret-red'
                : arcSummary.status === 'cliffhanger'
                  ? tone === 'victory'
                    ? 'border-victory-foreground/60 text-victory-accent'
                    : 'border-newspaper-border text-newspaper-headline'
                  : tone === 'victory'
                    ? 'border-dashed border-victory-foreground/40 text-victory-foreground/75'
                    : 'border-dashed border-newspaper-border/70 text-newspaper-text/70'
              : '';

            return (
              <div key={event.id} className={cn(highlightCardClass, 'p-4')}>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <CardArt
                    cardId={event.cardId}
                    className={cn('sm:w-28', tone === 'victory' ? 'border-victory-foreground/40 bg-victory-foreground/10' : undefined)}
                  />
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className={cn('text-lg font-black uppercase tracking-[0.12em]', accentHeadlineClass)}>
                        {event.headline}
                      </h3>
                      <Badge
                        variant="outline"
                        className={cn(badgeClass, 'rounded-full px-3 py-0.5 text-[10px] tracking-[0.3em]')}
                      >
                        {event.faction.toUpperCase()} · {event.rarity.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <p className={cn('text-sm', primaryBodyClass)}>{event.summary}</p>
                      {event.kicker ? (
                        <p className={cn('text-xs italic', subtleBodyClass)}>{event.kicker}</p>
                      ) : null}
                      <div className={cn('text-xs font-semibold uppercase tracking-[0.25em]', subtleBodyClass)}>
                        {renderImpactBadges(event)}
                      </div>
                    </div>
                    {arcSummary ? (
                      <div className={cn(dashedPanelClass, 'space-y-2')}>
                        <div
                          className={cn(
                            'flex flex-wrap items-center justify-between gap-2 text-[10px] font-semibold uppercase tracking-[0.28em]',
                            mutedBodyClass,
                          )}
                        >
                          <span>Campaign Arc</span>
                          <div className="flex items-center gap-2">
                            <span>
                              Chapter {arcSummary.chapter}/{arcSummary.totalChapters}
                            </span>
                            {arcStatusLabel ? (
                              <span className={cn('rounded-full border px-2 py-0.5', arcStatusClass)}>
                                {arcStatusLabel}
                              </span>
                            ) : null}
                          </div>
                        </div>
                        <p className={cn('text-sm font-semibold', accentHeadlineClass)}>{arcSummary.arcName}</p>
                        <Progress value={arcSummary.progressPercent} className={progressTrackClass} />
                        <p className={cn('text-xs italic', subtleBodyClass)}>{arcSummary.tagline}</p>
                        {arcSummary.events.length ? (
                          <ul className={cn('mt-2 space-y-1 text-xs', mutedBodyClass)}>
                            {arcSummary.events.slice(0, 2).map(arcEvent => (
                              <li key={arcEvent.id}>
                                <span className={cn('font-semibold', accentHeadlineClass)}>{arcEvent.headline}</span>
                                <span className={cn('block italic', subtleBodyClass)}>{arcEvent.subhead}</span>
                              </li>
                            ))}
                            {arcSummary.events.length > 2 ? (
                              <li className={cn('text-[10px] uppercase tracking-[0.28em]', subtleBodyClass)}>…</li>
                            ) : null}
                          </ul>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
          {eventHighlights.length === 0 ? (
            <p className={cn('text-sm', mutedBodyClass)}>No notable events logged this match.</p>
          ) : null}
        </div>
      </NewspaperSection>

      <section className="grid gap-4 md:grid-cols-2">
        <NewspaperSection tone={tone} className="p-5">
          <h2 className={sectionHeadingClass}>Combo Highlights</h2>
          <div className="mt-4 space-y-3">
            {comboHighlights.map(combo => (
              <div key={combo.id} className={cn(highlightCardClass, 'p-3')}>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <CardArt
                    cardId={combo.cardId}
                    className={cn('sm:w-24', tone === 'victory' ? 'border-victory-foreground/40 bg-victory-foreground/10' : undefined)}
                  />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className={cn('text-sm font-black uppercase tracking-[0.16em]', accentHeadlineClass)}>
                        {combo.name}
                      </h3>
                      <Badge
                        variant="outline"
                        className={cn(badgeClass, 'rounded-full px-3 py-0.5 text-[10px] tracking-[0.3em]')}
                      >
                        {combo.rewardLabel}
                      </Badge>
                    </div>
                    <p className={cn('text-xs font-semibold uppercase tracking-[0.3em]', subtleBodyClass)}>
                      Turn {combo.turn} · {combo.ownerLabel}
                    </p>
                    {combo.description ? (
                      <p className={cn('text-sm', primaryBodyClass)}>{combo.description}</p>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
            {comboHighlights.length === 0 ? (
              <p className={cn('text-sm', mutedBodyClass)}>No combo sequences documented.</p>
            ) : null}
          </div>
        </NewspaperSection>

        <NewspaperSection tone={tone} className="p-5">
          <h2 className={sectionHeadingClass}>Paranormal Sightings</h2>
          <div className="mt-4 space-y-3">
            {sightings.map(sighting => (
              <div key={sighting.id} className={cn(highlightCardClass, 'p-3')}>
                <div className="flex items-center justify-between gap-2">
                  <h3 className={cn('text-sm font-black uppercase tracking-[0.16em]', accentHeadlineClass)}>
                    {sighting.headline}
                  </h3>
                  <Badge
                    variant="outline"
                    className={cn(badgeClass, 'rounded-full px-3 py-0.5 text-[10px] tracking-[0.3em]')}
                  >
                    {sighting.category.toUpperCase()}
                  </Badge>
                </div>
                <p className={cn('mt-1 text-sm', primaryBodyClass)}>{sighting.subtext}</p>
                {sighting.metadata?.stateName ? (
                  <p className={cn('mt-1 text-xs font-semibold uppercase tracking-[0.3em]', subtleBodyClass)}>
                    {sighting.metadata.stateName}
                  </p>
                ) : null}
              </div>
            ))}
            {sightings.length === 0 ? (
              <p className={cn('text-sm', mutedBodyClass)}>No anomalous activity logged for this run.</p>
            ) : null}
          </div>
        </NewspaperSection>
      </section>

      <NewspaperSection tone={tone} className="p-5">
        <h2 className={sectionHeadingClass}>After-Action Notes</h2>
        <div className={cn('mt-3 flex flex-wrap gap-3 text-xs', mutedBodyClass)}>
          {report.legendaryUsed.length > 0 ? (
            <Badge variant="outline" className={cn(badgeClass, 'rounded-full px-3 py-0.5 text-[10px] tracking-[0.3em]')}>
              Legendary Deployments: {report.legendaryUsed.join(', ')}
            </Badge>
          ) : (
            <Badge variant="outline" className={cn(badgeClass, 'rounded-full px-3 py-0.5 text-[10px] tracking-[0.3em]')}>
              No legendary cards deployed
            </Badge>
          )}
          {playerAgenda ? (
            <Badge variant="outline" className={cn(badgeClass, 'rounded-full px-3 py-0.5 text-[10px] tracking-[0.3em]')}>
              Operative Agenda: {playerAgenda.badgeLabel}
            </Badge>
          ) : null}
          {aiAgenda ? (
            <Badge variant="outline" className={cn(badgeClass, 'rounded-full px-3 py-0.5 text-[10px] tracking-[0.3em]')}>
              Opposition Agenda: {aiAgenda.badgeLabel}
            </Badge>
          ) : null}
        </div>
        {agendaBriefings.length > 0 ? (
          <div className="mt-6 space-y-4">
            <h3 className={sectionHeadingClass}>Hidden Agenda Debrief</h3>
            {agendaBriefings.map(({ agenda, label, owner }) => (
              <article key={owner} className={cn(dashedPanelClass, 'p-4 space-y-3')}>
                <div
                  className={cn(
                    'flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em]',
                    mutedBodyClass,
                  )}
                >
                  <span className={accentHeadlineClass}>{label}</span>
                  <Badge
                    variant="outline"
                    className={cn(badgeClass, 'rounded-full px-3 py-0.5 text-[10px] tracking-[0.3em]')}
                  >
                    {agenda.statusLabel}
                  </Badge>
                  <span className={subtleBodyClass}>Progress {agenda.progressLabel}</span>
                </div>
                <p className={cn('text-sm', primaryBodyClass)}>{formatAgendaNarrative(agenda, owner)}</p>
                {agenda.pullQuote ? (
                  <blockquote
                    className={cn('mt-3 border-l-2 pl-3 text-sm italic', subtleBodyClass, tone === 'victory' ? 'border-victory-foreground/40' : 'border-newspaper-border/60')}
                  >
                    “{agenda.pullQuote}”
                  </blockquote>
                ) : null}
              </article>
            ))}
          </div>
        ) : null}
      </NewspaperSection>
    </div>
  );
};

export default FinalEditionLayout;
