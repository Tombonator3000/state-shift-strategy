import CardImage from '@/components/game/CardImage';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { ExtraStamp } from '@/components/newspaper/ExtraStamp';
import {
  NEWSPAPER_META_CLASS,
  NEWSPAPER_SECTION_HEADING_CLASS,
  NewspaperSection,
  type NewspaperTone,
  getNewspaperBadgeClass,
} from './newspaperLayout';
import type { ArticleBlock } from '@/news/headlineEngine';
import type { GameOverReport, FinalEditionEventHighlight, MVPReport } from '@/types/finalEdition';
import {
  formatVictoryHeadline,
  formatVictorySubhead,
  getFactionDisplayName,
  getOppositionDisplayName,
  getOutcomeSummary,
  getPlayerOutcomeLabel,
  getVictoryConditionLabel,
} from '@/utils/finalEdition';
import type { MouseEvent } from 'react';

interface FinalEditionLayoutProps {
  report: GameOverReport;
}

const getBulletinLabel = (tone: ArticleBlock['tone']): string => {
  switch (tone) {
    case 'truth':
      return 'Truth Network Bulletin';
    case 'government':
      return 'Government Wire Advisory';
    default:
      return 'Breaking Desk Update';
  }
};

const getBulletinBadgeClass = (
  tone: ArticleBlock['tone'],
  editionTone: NewspaperTone,
): string => {
  if (tone === 'truth') {
    return 'border-truth-red/60 bg-truth-red/10 text-truth-red';
  }
  if (tone === 'government') {
    return 'border-government-blue/60 bg-government-blue/10 text-government-blue';
  }
  return editionTone === 'victory'
    ? 'border-victory-foreground/40 bg-victory-foreground/10 text-victory-foreground'
    : 'border-newspaper-border/60 bg-newspaper-bg/70 text-newspaper-text/70';
};

const getBulletinHeadlineClass = (
  tone: ArticleBlock['tone'],
  editionTone: NewspaperTone,
): string => {
  if (tone === 'truth') {
    return 'text-truth-red';
  }
  if (tone === 'government') {
    return 'text-government-blue';
  }
  return editionTone === 'victory' ? 'text-victory-accent' : 'text-newspaper-headline';
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

type CardArtVariant = 'default' | 'frontPage';

const CardArt = ({
  cardId,
  fallbackCardId,
  className = '',
  fit,
  showPlaceholder = false,
  variant = 'default',
}: {
  cardId?: string;
  fallbackCardId?: string;
  className?: string;
  fit?: 'cover' | 'contain';
  showPlaceholder?: boolean;
  variant?: CardArtVariant;
}) => {
  const resolvedCardId = cardId ?? fallbackCardId;

  if (!resolvedCardId && !showPlaceholder) {
    return null;
  }

  const baseVariantClass =
    variant === 'frontPage'
      ? 'flex h-full w-full items-stretch rounded-lg border-[6px] border-newspaper-border/80 bg-newspaper-header/25 shadow-[0_32px_60px_rgba(0,0,0,0.45)]'
      : 'aspect-[63/88] rounded-md border border-newspaper-border/60 bg-newspaper-header/20';

  const placeholderTypography =
    variant === 'frontPage'
      ? 'text-xs tracking-[0.38em]'
      : 'text-[10px] tracking-[0.28em]';

  return (
    <div className={cn('relative overflow-hidden', baseVariantClass, className)}>
      {resolvedCardId ? (
        <CardImage
          cardId={resolvedCardId}
          fit={fit ?? (variant === 'frontPage' ? 'cover' : 'contain')}
          className="h-full w-full"
        />
      ) : (
        <div
          className={cn(
            'flex h-full w-full items-center justify-center px-3 text-center font-semibold uppercase text-newspaper-text/50',
            placeholderTypography,
          )}
        >
          Archival footage pending clearance.
        </div>
      )}
    </div>
  );
};

const FinalEditionLayout = ({ report }: FinalEditionLayoutProps) => {
  const frontPage = report.frontPage;
  const fallbackHeadline = formatVictoryHeadline(report);
  const fallbackSubhead = formatVictorySubhead(report);
  const fallbackKicker = getOutcomeSummary(report);
  const sanitizeLine = (value: string | null | undefined): string | null => {
    if (!value) {
      return null;
    }
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  };
  const headline = sanitizeLine(frontPage?.hed) ?? fallbackHeadline;
  const subhead = sanitizeLine(frontPage?.dek) ?? fallbackSubhead;
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
  const kicker = sanitizeLine(frontPage?.kicker) ?? fallbackKicker;
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
  const bulletinArticles = report.extraExtraFeed.slice(-4).reverse();
  const latestExtraExtra = report.extraExtraFeed.length > 0 
    ? report.extraExtraFeed[report.extraExtraFeed.length - 1] 
    : null;
  const olderBulletins = latestExtraExtra ? bulletinArticles.slice(1) : bulletinArticles;
  const hasBulletins = olderBulletins.length > 0;
  const highlightCardClass =
    tone === 'victory'
      ? 'rounded-md border border-victory-foreground/30 bg-gradient-to-br from-victory-start/80 via-victory-mid/74 to-victory-end/80 text-victory-foreground shadow-[0_16px_36px_rgba(0,0,0,0.35)]'
      : 'rounded-md border border-newspaper-border/70 bg-white/75 text-newspaper-text shadow-sm';
  const dashedPanelClass =
    tone === 'victory'
      ? 'rounded-md border border-dashed border-victory-foreground/40 bg-victory-foreground/10 p-3 shadow-[0_10px_28px_rgba(0,0,0,0.3)]'
      : 'rounded-md border border-dashed border-newspaper-border/60 bg-newspaper-bg/70 p-3';
  const progressTrackClass = tone === 'victory' ? 'mt-2 h-1.5 bg-victory-foreground/20' : 'mt-2 h-1.5 bg-newspaper-header/30';
  const heroSkyClass =
    tone === 'victory'
      ? 'bg-gradient-to-br from-victory-start/85 via-victory-mid/78 to-victory-end/90'
      : 'bg-gradient-to-br from-newspaper-header/95 via-newspaper-bg/92 to-newspaper-header/95';
  const heroPrimaryBandClass = tone === 'victory' ? 'bg-victory-accent/90' : 'bg-newspaper-headline/90';
  const heroSecondaryBandClass = tone === 'victory' ? 'bg-victory-foreground/70' : 'bg-newspaper-border/70';
  const heroBadgeRowClass = cn(
    'flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.32em]',
    tone === 'victory' ? 'text-victory-foreground/85' : 'text-newspaper-text/70',
  );
  const heroHeadlineClass = cn(
    'text-5xl font-black uppercase leading-[0.92] tracking-[0.04em] drop-shadow-[0_6px_18px_rgba(0,0,0,0.45)] sm:text-6xl lg:text-7xl',
    accentHeadlineClass,
  );
  const heroSubheadClass = cn(
    'mt-2 max-w-xl text-2xl font-extrabold uppercase tracking-[0.14em] sm:text-4xl sm:tracking-[0.1em]',
    tone === 'victory' ? 'text-victory-foreground' : 'text-newspaper-headline',
  );
  const heroKickerClass = cn('mt-3 text-xs font-semibold uppercase tracking-[0.38em]', subtleBodyClass);
  const heroStatsGridClass = cn(
    'grid gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] sm:grid-cols-2 lg:grid-cols-4',
    mutedBodyClass,
  );
  const frontPageCardClass =
    tone === 'victory'
      ? 'border-victory-foreground/70 bg-victory-foreground/10 shadow-[0_42px_80px_rgba(0,0,0,0.45)]'
      : 'border-newspaper-border/80 bg-newspaper-header/15 shadow-[0_34px_70px_rgba(0,0,0,0.4)]';
  const frontPageJumpStripClass = cn(
    'flex flex-col gap-3 rounded-md border px-4 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between',
    tone === 'victory'
      ? 'border-victory-foreground/45 bg-victory-foreground/15 text-victory-foreground'
      : 'border-newspaper-border bg-newspaper-bg/80 text-newspaper-text/75',
  );
  const frontPageJumpLabelClass = cn(
    'font-mono text-[11px] font-black uppercase tracking-[0.38em]',
    tone === 'victory' ? 'text-victory-foreground' : 'text-newspaper-text/80',
  );
  const frontPageJumpButtonClass = cn(
    'rounded-full px-5 py-2 text-[10px] font-black uppercase tracking-[0.28em] shadow-[0_10px_22px_rgba(0,0,0,0.35)] transition-transform duration-200 ease-out hover:-translate-y-0.5 focus-visible:-translate-y-0.5',
    tone === 'victory'
      ? 'bg-victory-accent text-victory-foreground hover:bg-victory-accent/90 focus-visible:ring-victory-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-victory-mid'
      : 'bg-newspaper-headline text-newspaper-bg hover:bg-newspaper-headline/90 focus-visible:ring-newspaper-headline/60 focus-visible:ring-offset-2 focus-visible:ring-offset-newspaper-bg',
  );
  const frontPageJumpTargets = [
    { id: 'key-events', label: 'Key Events' },
    { id: 'combo-highlights', label: 'Combo Highlights' },
    { id: 'paranormal-sightings', label: 'Paranormal Sightings' },
    ...(hasBulletins ? [{ id: 'extra-extra-bulletins', label: 'Extra Extra Bulletins' }] : []),
    { id: 'after-action-notes', label: 'After-Action Notes' },
  ];
  const createJumpHandler = (targetId: string) => (event: MouseEvent<HTMLAnchorElement>) => {
    if (typeof document === 'undefined') {
      return;
    }

    const target = document.getElementById(targetId);
    if (!target) {
      return;
    }

    event.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

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
      <NewspaperSection tone={tone} className="relative overflow-hidden bg-transparent p-0">
        {latestExtraExtra && (
          <ExtraStamp 
            className="top-8 right-8 md:top-12 md:right-12" 
            size="lg" 
          />
        )}
        <div className={cn('relative isolate overflow-hidden', heroSkyClass)}>
          <div className={cn('pointer-events-none absolute inset-x-0 top-0 h-2', heroPrimaryBandClass)} />
          <div className={cn('pointer-events-none absolute inset-x-0 top-2 h-2', heroSecondaryBandClass)} />
          <div className={cn('pointer-events-none absolute inset-x-0 bottom-0 h-2', heroPrimaryBandClass)} />
          <div className={cn('pointer-events-none absolute inset-x-0 bottom-2 h-2', heroSecondaryBandClass)} />
          <div className="relative grid gap-8 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]">
            <div className="relative z-10 flex flex-col justify-between gap-8 px-6 py-8 sm:px-10 lg:px-12">
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className={cn(metaClass, 'tracking-[0.5em]')}>Final Edition • {editionDate}</div>
                  <div className={heroBadgeRowClass}>
                    {latestExtraExtra && (
                      <Badge className="bg-red-600 text-white border-red-600 rounded-full px-3 py-1 tracking-[0.32em]">
                        Breaking Combo News
                      </Badge>
                    )}
                    {playerOutcome !== 'Stalemate' ? (
                      <Badge className={cn(badgeClass, 'rounded-full px-3 py-1 tracking-[0.32em]')}>
                        {playerOutcome}
                      </Badge>
                    ) : null}
                    <Badge className={cn(badgeClass, 'rounded-full px-3 py-1 tracking-[0.32em]')}>
                      {victoryConditionLabel}
                    </Badge>
                    <Badge className={cn(badgeClass, 'rounded-full px-3 py-1 tracking-[0.32em]')}>
                      {playerFactionLabel}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-4">
                  {latestExtraExtra ? (
                    <>
                      <h1 className={heroHeadlineClass}>{latestExtraExtra.hed}</h1>
                      {latestExtraExtra.dek && (
                        <p className={heroSubheadClass}>{latestExtraExtra.dek}</p>
                      )}
                      {latestExtraExtra.bullets.length > 0 && (
                        <ul className="mt-6 space-y-2 text-lg font-semibold">
                          {latestExtraExtra.bullets.slice(0, 3).map((bullet, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-red-600">▸</span>
                              <span>{bullet}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </>
                  ) : (
                    <>
                      <h1 className={heroHeadlineClass}>{headline}</h1>
                      <p className={heroSubheadClass}>{subhead}</p>
                      <p className={heroKickerClass}>{kicker}</p>
                    </>
                  )}
                </div>
              </div>
              <div className={heroStatsGridClass}>
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
            </div>
            <div className="relative z-10 flex items-stretch justify-stretch">
              <CardArt
                cardId={report.mvp?.cardId ?? undefined}
                fallbackCardId={report.runnerUp?.cardId ?? undefined}
                showPlaceholder
                variant="frontPage"
                fit="cover"
                className={cn('h-full w-full min-h-[20rem] sm:min-h-[22rem] lg:min-h-[26rem]', frontPageCardClass)}
              />
            </div>
          </div>
        </div>
      </NewspaperSection>

      <nav aria-label="Front Page Jump" className={frontPageJumpStripClass}>
        <span className={frontPageJumpLabelClass}>Front Page Jump</span>
        <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-end">
          {frontPageJumpTargets.map(target => (
            <Button
              key={target.id}
              asChild
              className={frontPageJumpButtonClass}
            >
              <a href={`#${target.id}`} onClick={createJumpHandler(target.id)}>
                {target.label}
              </a>
            </Button>
          ))}
        </div>
      </nav>

      <section className="grid gap-4 md:grid-cols-2">
        {renderMvpPanel('MVP Play', report.mvp)}
        {renderMvpPanel('Runner-Up', report.runnerUp)}
      </section>

      <NewspaperSection tone={tone} id="key-events" className="p-5">
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
        <NewspaperSection tone={tone} id="combo-highlights" className="p-5">
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

        <NewspaperSection tone={tone} id="paranormal-sightings" className="p-5">
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

      {hasBulletins ? (
        <NewspaperSection tone={tone} id="extra-extra-bulletins" className="p-5">
          <div className="flex items-center justify-between">
            <h2 className={sectionHeadingClass}>Extra Extra Bulletins</h2>
            <Badge className={cn(badgeClass, 'rounded-full px-3 py-0.5 text-[11px] tracking-[0.3em]')}>
              {olderBulletins.length}
            </Badge>
          </div>
          <div className="mt-4 space-y-4">
            {olderBulletins.map((article, index) => {
              const badgeToneClass = getBulletinBadgeClass(article.tone, tone);
              const headlineToneClass = getBulletinHeadlineClass(article.tone, tone);
              return (
                <article key={`${article.hed}-${index}`} className={cn(highlightCardClass, 'p-4 space-y-3')}>
                  <div
                    className={cn(
                      'inline-flex items-center rounded-full border px-3 py-0.5 text-[10px] font-semibold uppercase tracking-[0.32em]',
                      badgeToneClass,
                    )}
                  >
                    {getBulletinLabel(article.tone)}
                  </div>
                  <header className="space-y-1">
                    <h3
                      className={cn(
                        'font-headline text-lg font-black uppercase tracking-[0.16em]',
                        headlineToneClass,
                      )}
                    >
                      {article.hed}
                    </h3>
                    {article.dek ? (
                      <p className={cn('text-sm italic', primaryBodyClass)}>{article.dek}</p>
                    ) : null}
                  </header>
                  {article.bullets.length > 0 ? (
                    <ul className={cn('space-y-1 text-[12px] leading-relaxed', mutedBodyClass)}>
                      {article.bullets.slice(0, 4).map((bullet, bulletIndex) => (
                        <li key={`${bulletIndex}-${bullet.slice(0, 24)}`} className="list-disc pl-4">
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  <footer className={cn('text-[10px] uppercase tracking-[0.32em]', subtleBodyClass)}>
                    <div>{article.byline}</div>
                    <div>{article.source}</div>
                  </footer>
                </article>
              );
            })}
          </div>
        </NewspaperSection>
      ) : null}

      <NewspaperSection tone={tone} id="after-action-notes" className="p-5">
        <h2 className={sectionHeadingClass}>After-Action Notes</h2>
        <div className={cn('mt-3 flex flex-wrap gap-3 text-xs', mutedBodyClass)}>
          {Array.isArray(report.legendaryUsed) && report.legendaryUsed.length > 0 ? (
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
