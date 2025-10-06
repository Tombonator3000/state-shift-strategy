import { type CSSProperties } from 'react';
import { AlertTriangle, Shield, Target, Activity, MapPin } from 'lucide-react';
import clsx from 'clsx';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import styles from './StateIntelBoard.module.css';
import type { PlayerStateIntel } from './PlayerHubOverlay';

interface StateIntelBoardProps {
  intel?: PlayerStateIntel;
  variant?: 'default' | 'broadsheet';
}

const ownerLabels: Record<PlayerStateIntel['states'][number]['owner'], string> = {
  player: 'Operative Control',
  ai: 'Opposition Control',
  neutral: 'Unaligned',
};

const ownerBadgeStyles: Record<PlayerStateIntel['states'][number]['owner'], string> = {
  player: 'bg-emerald-500/20 text-emerald-100 border border-emerald-400/40',
  ai: 'bg-rose-500/20 text-rose-100 border border-rose-400/40',
  neutral: 'bg-slate-500/20 text-slate-200 border border-slate-400/30',
};

const factionBadgeStyles: Record<'truth' | 'government', string> = {
  truth: 'bg-sky-500/20 text-sky-100 border border-sky-400/40',
  government: 'bg-amber-500/20 text-amber-100 border border-amber-400/40',
};

const broadsheetOwnerBadge: Record<PlayerStateIntel['states'][number]['owner'], string> = {
  player: 'border-[#336f3a] bg-[#d1ead4] text-[#1f4b24]',
  ai: 'border-[#a12a3a] bg-[#f6cdd6] text-[#5c111d]',
  neutral: 'border-[var(--broadsheet-rule)] bg-white/80 text-[var(--broadsheet-muted)]',
};

const broadsheetFactionBadge: Record<'truth' | 'government', string> = {
  truth: 'border-[var(--broadsheet-accent)] bg-[var(--broadsheet-accent-soft)] text-[var(--broadsheet-ink)]',
  government: 'border-[#b1691b] bg-[#f6e2c5] text-[#633a09]',
};

const rotations = [-2.8, -0.6, 1.6, -1.2, 2.4];
const threadAngles = [-6, 3, -2, 4];

const StateIntelBoard = ({ intel, variant = 'default' }: StateIntelBoardProps) => {
  const totals = intel?.totals ?? { player: 0, ai: 0, neutral: 0, contested: 0 };
  const contestedStates = (intel?.states ?? []).filter(state => state.contested);
  const featuredContested = contestedStates.slice(0, 5);
  const recentEvents = intel?.recentEvents ?? [];
  const hasEvents = recentEvents.length > 0;

  if (variant === 'broadsheet') {
    return (
      <div className="flex h-full flex-col gap-6 text-[var(--broadsheet-ink)]">
        <header className="rounded-xl border border-[var(--broadsheet-rule)] bg-[rgba(255,255,255,0.9)] px-5 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-typewriter text-[11px] uppercase tracking-[0.42em] text-[var(--broadsheet-kicker)]">Field Wires</p>
              <h3 className="font-broadsheetSans text-2xl uppercase tracking-[0.16em]">Hotline Atlas</h3>
            </div>
            <Activity className="h-6 w-6 text-[var(--broadsheet-accent)]" aria-hidden />
          </div>
        </header>

        <div className="grid flex-1 grid-cols-1 gap-6 lg:grid-cols-7">
          <section className="flex flex-col gap-5 rounded-xl border border-[var(--broadsheet-rule)] bg-[rgba(255,255,255,0.86)] p-5 shadow-sm lg:col-span-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-[var(--broadsheet-rule)] bg-white/90 p-4 shadow-sm">
                <p className="font-typewriter text-[10px] uppercase tracking-[0.32em] text-[var(--broadsheet-muted)]">Player Control</p>
                <p className="font-broadsheetSans text-2xl text-[var(--broadsheet-ink)]">{totals.player}</p>
                <p className="font-broadsheet text-[13px] text-[var(--broadsheet-muted)]">Strongholds</p>
              </div>
              <div className="rounded-lg border border-[var(--broadsheet-rule)] bg-white/90 p-4 shadow-sm">
                <p className="font-typewriter text-[10px] uppercase tracking-[0.32em] text-[var(--broadsheet-muted)]">Opposition</p>
                <p className="font-broadsheetSans text-2xl text-[var(--broadsheet-ink)]">{totals.ai}</p>
                <p className="font-broadsheet text-[13px] text-[var(--broadsheet-muted)]">Occupied States</p>
              </div>
              <div className="rounded-lg border border-[var(--broadsheet-rule)] bg-white/90 p-4 shadow-sm">
                <p className="font-typewriter text-[10px] uppercase tracking-[0.32em] text-[var(--broadsheet-muted)]">Neutral</p>
                <p className="font-broadsheetSans text-2xl text-[var(--broadsheet-ink)]">{totals.neutral}</p>
                <p className="font-broadsheet text-[13px] text-[var(--broadsheet-muted)]">In Flux</p>
              </div>
              <div className="rounded-lg border border-[var(--broadsheet-rule)] bg-white/90 p-4 shadow-sm">
                <p className="font-typewriter text-[10px] uppercase tracking-[0.32em] text-[var(--broadsheet-muted)]">Contested</p>
                <p className="font-broadsheetSans text-2xl text-[var(--broadsheet-ink)]">{totals.contested}</p>
                <p className="font-broadsheet text-[13px] text-[var(--broadsheet-muted)]">Hot Zones</p>
              </div>
            </div>

            <div className="rounded-lg border border-[var(--broadsheet-rule)] bg-white/90 p-4 font-typewriter text-[10px] uppercase tracking-[0.32em] text-[var(--broadsheet-muted)]">
              <div className="flex items-center justify-between">
                <span>Generated Turn</span>
                <span className="font-broadsheetSans text-xl text-[var(--broadsheet-ink)]">{intel?.generatedAtTurn ?? '—'}</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span>Round</span>
                <span className="font-broadsheetSans text-xl text-[var(--broadsheet-ink)]">{intel?.round ?? '—'}</span>
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-4 rounded-xl border border-[var(--broadsheet-rule)] bg-[rgba(255,255,255,0.86)] p-5 shadow-sm lg:col-span-2">
            <header className="flex items-center justify-between">
              <div>
                <p className="font-typewriter text-[10px] uppercase tracking-[0.32em] text-[var(--broadsheet-muted)]">Hot Zones</p>
                <h4 className="font-broadsheetSans text-xl uppercase tracking-[0.14em]">Active States</h4>
              </div>
              <Target className="h-5 w-5 text-[var(--broadsheet-accent)]" aria-hidden />
            </header>

            <div className="space-y-3">
              {featuredContested.length > 0 ? (
                featuredContested.map(state => (
                  <div
                    key={state.id}
                    className="rounded-lg border border-[var(--broadsheet-rule)] bg-white/85 p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-typewriter text-[10px] uppercase tracking-[0.32em] text-[var(--broadsheet-muted)]">
                          {state.abbreviation}
                        </p>
                        <h5 className="font-broadsheetSans text-lg uppercase tracking-[0.12em] text-[var(--broadsheet-ink)]">{state.name}</h5>
                      </div>
                      <span
                        className={clsx(
                          'rounded-full border px-3 py-1 font-typewriter text-[10px] uppercase tracking-[0.28em]',
                          broadsheetOwnerBadge[state.owner],
                        )}
                      >
                        {ownerLabels[state.owner]}
                      </span>
                    </div>

                    <dl className="mt-3 grid grid-cols-2 gap-3 font-broadsheet text-[14px] text-[var(--broadsheet-muted)]">
                      <div>
                        <dt className="font-typewriter text-[10px] uppercase tracking-[0.28em] text-[var(--broadsheet-muted)]">Pressure</dt>
                        <dd className="mt-1 flex items-center gap-2">
                          <span className="text-[#a12a3a]">{state.pressureAi}</span>
                          <span className="text-[var(--broadsheet-muted)]">vs</span>
                          <span className="text-[#336f3a]">{state.pressurePlayer}</span>
                        </dd>
                      </div>
                      <div>
                        <dt className="font-typewriter text-[10px] uppercase tracking-[0.28em] text-[var(--broadsheet-muted)]">Defense</dt>
                        <dd className="mt-1 text-[var(--broadsheet-ink)]">{state.defense}</dd>
                      </div>
                    </dl>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-[var(--broadsheet-rule)] bg-white/80 p-6 text-center">
                  <Shield className="h-6 w-6 text-[var(--broadsheet-muted)]" aria-hidden />
                  <p className="font-broadsheetSans text-sm uppercase tracking-[0.18em] text-[var(--broadsheet-muted)]">No contested states logged.</p>
                </div>
              )}
            </div>
          </section>

          <section className="flex h-full flex-col rounded-xl border border-[var(--broadsheet-rule)] bg-[rgba(255,255,255,0.86)] p-5 shadow-sm lg:col-span-3">
            <header className="flex items-center justify-between">
              <div>
                <p className="font-typewriter text-[10px] uppercase tracking-[0.32em] text-[var(--broadsheet-muted)]">Incident Board</p>
                <h4 className="font-broadsheetSans text-xl uppercase tracking-[0.14em]">Field Reports</h4>
              </div>
              <AlertTriangle className="h-5 w-5 text-[var(--broadsheet-accent)]" aria-hidden />
            </header>

            <ScrollArea className="mt-4 flex-1 pr-3">
              <div className="space-y-4">
                {hasEvents ? (
                  recentEvents.map((entry, index) => {
                    const pressureDelta = (entry.pressurePlayer ?? 0) - (entry.pressureAi ?? 0);
                    const pressureTone = pressureDelta > 0
                      ? 'text-[#336f3a]'
                      : pressureDelta < 0
                        ? 'text-[#a12a3a]'
                        : 'text-[var(--broadsheet-muted)]';

                    return (
                      <article
                        key={`${entry.stateId}-${entry.event.eventId}-${index}`}
                        className="rounded-lg border border-[var(--broadsheet-rule)] bg-white/85 p-4 shadow-sm"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="font-typewriter text-[10px] uppercase tracking-[0.32em] text-[var(--broadsheet-muted)]">
                              Turn {entry.event.triggeredOnTurn} · Round {intel?.round ?? '—'}
                            </p>
                            <h5 className="font-broadsheetSans text-xl uppercase tracking-[0.14em] text-[var(--broadsheet-ink)]">
                              {entry.event.label}
                            </h5>
                          </div>
                          <span
                            className={clsx(
                              'rounded-full border px-3 py-1 font-typewriter text-[10px] uppercase tracking-[0.28em]',
                              broadsheetFactionBadge[entry.event.faction],
                            )}
                          >
                            {entry.event.faction === 'truth' ? 'Truth Ops' : 'Government Ops'}
                          </span>
                        </div>

                        {entry.event.description && (
                          <p className="mt-3 font-broadsheet text-[15px] leading-relaxed text-[var(--broadsheet-muted)]">
                            {entry.event.description}
                          </p>
                        )}

                        {Array.isArray(entry.event.effectSummary) && entry.event.effectSummary.length > 0 && (
                          <ul className="mt-3 list-disc space-y-1 pl-5 font-broadsheet text-[14px] text-[var(--broadsheet-muted)]">
                            {entry.event.effectSummary.map((summary, idx) => (
                              <li key={idx}>{summary}</li>
                            ))}
                          </ul>
                        )}

                        <footer className="mt-4 flex flex-wrap items-center justify-between gap-3 font-typewriter text-[10px] uppercase tracking-[0.3em] text-[var(--broadsheet-muted)]">
                          <span className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-[var(--broadsheet-accent)]" aria-hidden />
                            {entry.stateName ?? entry.abbreviation ?? entry.stateId}
                          </span>
                          <span className={clsx('flex items-center gap-2', pressureTone)}>
                            <span>Defense {entry.defense ?? '—'}</span>
                            <span>Pressure Δ {pressureDelta > 0 ? `+${pressureDelta}` : pressureDelta}</span>
                          </span>
                        </footer>
                      </article>
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-[var(--broadsheet-rule)] bg-white/80 p-6 text-center">
                    <p className="font-broadsheetSans text-sm uppercase tracking-[0.18em] text-[var(--broadsheet-muted)]">No field events recorded yet.</p>
                    <p className="font-broadsheet text-[14px] leading-relaxed text-[var(--broadsheet-muted)]">
                      Run operations to generate intel—dispatches will pin here once intercepted.
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.board}>
      <div className={styles.ringLine} aria-hidden />
      <div className={styles.diagonalLine} aria-hidden />

      <section className={styles.summaryCard}>
        <header className={styles.sectionHeader}>
          <Activity className="h-4 w-4" />
          <span>Command Overview</span>
        </header>
        <div className={styles.summaryGrid}>
          <div className={styles.summaryStat}>
            <Badge className="border border-emerald-400/50 bg-emerald-500/20 text-emerald-100">Player</Badge>
            <strong>{totals.player}</strong>
            <span>Strongholds</span>
          </div>
          <div className={styles.summaryStat}>
            <Badge className="border border-rose-400/50 bg-rose-500/20 text-rose-100">AI</Badge>
            <strong>{totals.ai}</strong>
            <span>Occupied States</span>
          </div>
          <div className={styles.summaryStat}>
            <Badge className="border border-slate-400/50 bg-slate-500/20 text-slate-100">Neutral</Badge>
            <strong>{totals.neutral}</strong>
            <span>In Flux</span>
          </div>
          <div className={styles.summaryStat}>
            <Badge className="border border-amber-400/60 bg-amber-500/20 text-amber-100">Contested</Badge>
            <strong>{totals.contested}</strong>
            <span>Hot Zones</span>
          </div>
        </div>
        <footer className={styles.summaryFooter}>
          Turn {intel?.generatedAtTurn ?? '—'} &middot; Round {intel?.round ?? '—'}
        </footer>
      </section>

      <section className={styles.contestedColumn}>
        <header className={styles.sectionHeader}>
          <Target className="h-4 w-4" />
          <span>Active Hot Zones</span>
        </header>
        <div className={styles.contestedList}>
          {featuredContested.length > 0 ? (
            featuredContested.map(state => (
              <div key={state.id} className={styles.contestedCard}>
                <span className={styles.tape} aria-hidden />
                <div className="flex items-center justify-between">
                  <p className="font-mono text-xs uppercase tracking-[0.32em] text-slate-600">
                    {state.abbreviation}
                  </p>
                  <Badge className={cn('font-mono text-[10px] uppercase tracking-[0.32em]', ownerBadgeStyles[state.owner])}>
                    {ownerLabels[state.owner]}
                  </Badge>
                </div>
                <h3 className="mt-2 font-serif text-lg text-slate-900">{state.name}</h3>
                <dl className={styles.contestedMeta}>
                  <div>
                    <dt>Pressure</dt>
                    <dd>
                      <span className="text-rose-500">{state.pressureAi}</span>
                      <span className="mx-1 text-slate-500">vs</span>
                      <span className="text-emerald-500">{state.pressurePlayer}</span>
                    </dd>
                  </div>
                  <div>
                    <dt>Defense</dt>
                    <dd>{state.defense}</dd>
                  </div>
                </dl>
              </div>
            ))
          ) : (
            <div className={styles.placeholderCard}>
              <Shield className="h-5 w-5 text-slate-500" />
              <p>No contested regions logged.</p>
            </div>
          )}
        </div>
      </section>

      <section className={styles.eventsPanel}>
        <header className={styles.sectionHeader}>
          <AlertTriangle className="h-4 w-4" />
          <span>Incident Board</span>
        </header>
        <ScrollArea className={styles.eventsScroll}>
          <div className={styles.eventStack}>
            {hasEvents ? (
              recentEvents.map((entry, index) => {
                const rotation = rotations[index % rotations.length];
                const threadAngle = threadAngles[index % threadAngles.length];
                const style = {
                  '--rotation': `${rotation}deg`,
                  '--thread-angle': `${threadAngle}deg`,
                } as CSSProperties;
                return (
                  <article key={`${entry.stateId}-${entry.event.eventId}-${index}`} className={styles.eventCard} style={style}>
                    <span className={styles.thread} aria-hidden />
                    <header className={styles.eventHeader}>
                      <div>
                        <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-slate-500">
                          {entry.abbreviation} &bull; Turn {entry.event.triggeredOnTurn}
                        </p>
                        <h3 className="text-xl font-serif text-slate-900">{entry.event.label}</h3>
                      </div>
                      <Badge
                        className={cn(
                          'font-mono text-[10px] uppercase tracking-[0.32em]',
                          factionBadgeStyles[entry.event.faction],
                        )}
                      >
                        {entry.event.faction === 'truth' ? 'Truth Ops' : 'Government Ops'}
                      </Badge>
                    </header>
                    {entry.event.description && (
                      <p className="mt-3 text-sm leading-relaxed text-slate-700">
                        {entry.event.description}
                      </p>
                    )}
                    {Array.isArray(entry.event.effectSummary) && entry.event.effectSummary.length > 0 && (
                      <ul className={styles.effectList}>
                        {entry.event.effectSummary.map((summary, idx) => (
                          <li key={idx}>
                            <span className="text-slate-600">{summary}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    <footer className={styles.eventFooter}>
                      <span className="font-mono text-xs uppercase tracking-[0.32em] text-slate-500">
                        {entry.stateName}
                      </span>
                      <span className="text-xs text-slate-500">
                        Defense {entry.defense} · Pressure Δ {entry.pressurePlayer - entry.pressureAi}
                      </span>
                    </footer>
                  </article>
                );
              })
            ) : (
              <div className={styles.emptyBoard}>
                <span className={styles.tape} aria-hidden />
                <p className="font-serif text-lg text-slate-900">No field events recorded yet.</p>
                <p className="text-sm text-slate-600">
                  Run operations to generate intel—reports will be pinned here with full dossiers.
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </section>
    </div>
  );
};

export default StateIntelBoard;
