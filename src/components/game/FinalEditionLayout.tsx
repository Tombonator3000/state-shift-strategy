import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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

const formatAgendaSummary = (agenda?: GameOverReport['playerSecretAgenda']) => {
  if (!agenda) {
    return null;
  }
  const status = agenda.completed ? 'Completed' : 'In Progress';
  return `${agenda.headline || agenda.title} — ${status} (${agenda.progress}/${agenda.target})`;
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

const renderMvpPanel = (label: string, mvp?: MVPReport | null) => {
  if (!mvp) {
    return null;
  }
  return (
    <div className="rounded-xl border border-slate-700/60 bg-slate-900/70 p-4">
      <div className="flex items-center justify-between">
        <h4 className="font-mono text-xs uppercase tracking-[0.32em] text-emerald-300/80">{label}</h4>
        <Badge className="border-emerald-500/40 bg-emerald-500/10 text-emerald-200">{mvp.impactLabel}</Badge>
      </div>
      <h3 className="mt-2 text-xl font-semibold text-emerald-100">{mvp.cardName}</h3>
      <p className="mt-1 text-sm text-emerald-100/80">{mvp.highlight}</p>
      <div className="mt-3 grid gap-2 text-xs text-emerald-200/70 sm:grid-cols-2">
        <div>Truth Delta: {Math.round(mvp.truthDelta)}%</div>
        <div>IP Swing: {mvp.ipDelta >= 0 ? '+' : ''}{Math.round(mvp.ipDelta)}</div>
        <div>States Captured: {mvp.capturedStates.length > 0 ? mvp.capturedStates.join(', ') : '—'}</div>
        <div>Damage: {Math.round(mvp.damageDealt)}</div>
      </div>
    </div>
  );
};

const FinalEditionLayout = ({ report }: FinalEditionLayoutProps) => {
  const headline = formatVictoryHeadline(report);
  const subhead = formatVictorySubhead(report);
  const playerAgenda = formatAgendaSummary(report.playerSecretAgenda);
  const aiAgenda = formatAgendaSummary(report.aiSecretAgenda);
  const eventHighlights = report.topEvents.slice(0, 3);
  const comboHighlights = report.comboHighlights.slice(0, 3);
  const sightings = report.sightings.slice(-4);
  const playerOutcome = getPlayerOutcomeLabel(report);
  const victoryConditionLabel = getVictoryConditionLabel(report.victoryType);
  const playerFactionLabel = getFactionDisplayName(report.playerFaction);
  const oppositionLabel = getOppositionDisplayName(report.playerFaction);
  const outcomeSummary = getOutcomeSummary(report);
  const influenceSummary = `${playerFactionLabel} ${Math.round(report.ipPlayer)} · ${oppositionLabel} ${Math.round(report.ipAI)}`;

  return (
    <div className="flex flex-col gap-6">
      <header className="rounded-2xl border border-emerald-500/30 bg-slate-950/90 p-6 shadow-[0_0_35px_rgba(16,185,129,0.2)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="font-mono text-xs uppercase tracking-[0.32em] text-emerald-300/80">
            Final Edition • {new Date(report.recordedAt).toLocaleDateString()}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {playerOutcome !== 'Stalemate' && (
              <Badge className="border-emerald-500/40 bg-emerald-500/15 text-emerald-100">
                {playerOutcome}
              </Badge>
            )}
            <Badge className="border-emerald-500/40 bg-emerald-500/10 text-emerald-200">
              {victoryConditionLabel}
            </Badge>
            <Badge className="border-emerald-500/40 bg-emerald-500/10 text-emerald-200">
              {playerFactionLabel}
            </Badge>
          </div>
        </div>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-emerald-100 sm:text-4xl">{headline}</h1>
        <p className="mt-2 text-sm text-emerald-100/80">{subhead}</p>
        <p className="mt-2 text-xs uppercase tracking-[0.28em] text-emerald-200/70">{outcomeSummary}</p>
        <div className="mt-4 grid gap-3 text-xs uppercase tracking-[0.28em] text-emerald-200/70 sm:grid-cols-4">
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3">
            <div className="text-emerald-200/70">Rounds</div>
            <div className="mt-1 text-emerald-100 text-lg font-semibold tracking-normal">{report.rounds > 0 ? report.rounds : '—'}</div>
          </div>
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3">
            <div className="text-emerald-200/70">Truth Meter</div>
            <div className="mt-1 text-emerald-100 text-lg font-semibold tracking-normal">{Math.round(report.finalTruth)}%</div>
          </div>
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3">
            <div className="text-emerald-200/70">State Control</div>
            <div className="mt-1 text-emerald-100 text-lg font-semibold tracking-normal">Truth {report.statesTruth} · Gov {report.statesGov}</div>
          </div>
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3">
            <div className="text-emerald-200/70">Influence Points</div>
            <div className="mt-1 text-emerald-100 text-lg font-semibold tracking-normal">{influenceSummary}</div>
          </div>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        {renderMvpPanel('MVP Play', report.mvp)}
        {renderMvpPanel('Runner-Up', report.runnerUp)}
      </section>

      <section className="rounded-2xl border border-slate-700/50 bg-slate-950/80 p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-mono text-sm uppercase tracking-[0.32em] text-emerald-200/80">Key Events</h2>
          <Badge className="border-emerald-500/40 bg-emerald-500/10 text-emerald-200">{eventHighlights.length}</Badge>
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
                ? 'border-emerald-400/80 text-emerald-100'
                : arcSummary.status === 'cliffhanger'
                  ? 'border-emerald-400/60 text-emerald-100/80'
                  : 'border-emerald-400/40 text-emerald-100/70'
              : '';

            return (
              <div key={event.id} className="rounded-lg border border-slate-700/40 bg-slate-900/70 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-lg font-semibold text-emerald-100">{event.headline}</h3>
                  <Badge variant="outline" className="border-emerald-500/40 text-emerald-200">
                    {event.faction.toUpperCase()} · {event.rarity.toUpperCase()}
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-emerald-100/80">{event.summary}</p>
                {event.kicker && <p className="mt-2 text-xs italic text-emerald-200/70">{event.kicker}</p>}
                <div className="mt-3 text-xs text-emerald-200/70">{renderImpactBadges(event)}</div>
                {arcSummary ? (
                  <div className="mt-4 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-emerald-200/70">
                      <span>Campaign Arc</span>
                      <div className="flex items-center gap-2">
                        <span>Chapter {arcSummary.chapter}/{arcSummary.totalChapters}</span>
                        {arcStatusLabel ? (
                          <span className={`rounded-full border px-2 py-0.5 ${arcStatusClass}`}>
                            {arcStatusLabel}
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <p className="mt-1 text-sm font-semibold text-emerald-100">{arcSummary.arcName}</p>
                    <Progress value={arcSummary.progressPercent} className="mt-2 h-1.5 bg-emerald-500/20" />
                    <p className="mt-2 text-xs italic text-emerald-200/70">{arcSummary.tagline}</p>
                    {arcSummary.events.length ? (
                      <ul className="mt-2 space-y-1 text-xs text-emerald-200/70">
                        {arcSummary.events.slice(0, 2).map(arcEvent => (
                          <li key={arcEvent.id}>
                            <span className="font-semibold text-emerald-100/90">{arcEvent.headline}</span>
                            <span className="block italic text-emerald-200/60">{arcEvent.subhead}</span>
                          </li>
                        ))}
                        {arcSummary.events.length > 2 ? (
                          <li className="text-[10px] uppercase tracking-[0.28em] text-emerald-200/60">…</li>
                        ) : null}
                      </ul>
                    ) : null}
                  </div>
                ) : null}
              </div>
            );
          })}
          {eventHighlights.length === 0 && (
            <p className="text-sm text-emerald-100/70">No notable events logged this match.</p>
          )}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-700/50 bg-slate-950/80 p-5">
          <h2 className="font-mono text-sm uppercase tracking-[0.32em] text-emerald-200/80">Combo Highlights</h2>
          <div className="mt-4 space-y-3">
            {comboHighlights.map(combo => (
              <div key={combo.id} className="rounded-lg border border-slate-700/40 bg-slate-900/70 p-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-emerald-100">{combo.name}</h3>
                  <Badge variant="outline" className="border-emerald-500/40 text-emerald-200">{combo.rewardLabel}</Badge>
                </div>
                <p className="mt-1 text-xs text-emerald-200/70">Turn {combo.turn} · {combo.ownerLabel}</p>
                {combo.description && <p className="mt-2 text-sm text-emerald-100/80">{combo.description}</p>}
              </div>
            ))}
            {comboHighlights.length === 0 && (
              <p className="text-sm text-emerald-100/70">No combo sequences documented.</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-700/50 bg-slate-950/80 p-5">
          <h2 className="font-mono text-sm uppercase tracking-[0.32em] text-emerald-200/80">Paranormal Sightings</h2>
          <div className="mt-4 space-y-3">
            {sightings.map(sighting => (
              <div key={sighting.id} className="rounded-lg border border-slate-700/40 bg-slate-900/70 p-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-emerald-100">{sighting.headline}</h3>
                  <Badge variant="outline" className="border-emerald-500/40 text-emerald-200">{sighting.category.toUpperCase()}</Badge>
                </div>
                <p className="mt-1 text-sm text-emerald-100/80">{sighting.subtext}</p>
                {sighting.metadata?.stateName && (
                  <p className="mt-1 text-xs text-emerald-200/70">{sighting.metadata.stateName}</p>
                )}
              </div>
            ))}
            {sightings.length === 0 && (
              <p className="text-sm text-emerald-100/70">No anomalous activity logged for this run.</p>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-700/50 bg-slate-950/80 p-5">
        <h2 className="font-mono text-sm uppercase tracking-[0.32em] text-emerald-200/80">After-Action Notes</h2>
        <div className="mt-3 flex flex-wrap gap-3 text-xs text-emerald-200/70">
          {report.legendaryUsed.length > 0 ? (
            <Badge variant="outline" className="border-emerald-500/40 text-emerald-200">
              Legendary Deployments: {report.legendaryUsed.join(', ')}
            </Badge>
          ) : (
            <Badge variant="outline" className="border-emerald-500/40 text-emerald-200">No legendary cards deployed</Badge>
          )}
          {playerAgenda && (
            <Badge variant="outline" className="border-emerald-500/40 text-emerald-200">Operative Agenda: {playerAgenda}</Badge>
          )}
          {aiAgenda && (
            <Badge variant="outline" className="border-emerald-500/40 text-emerald-200">Opposition Agenda: {aiAgenda}</Badge>
          )}
        </div>
      </section>
    </div>
  );
};

export default FinalEditionLayout;
