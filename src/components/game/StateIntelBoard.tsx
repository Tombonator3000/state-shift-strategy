import { type CSSProperties } from 'react';
import { AlertTriangle, Shield, Target, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import styles from './StateIntelBoard.module.css';
import type { PlayerStateIntel } from './PlayerHubOverlay';

interface StateIntelBoardProps {
  intel?: PlayerStateIntel;
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

const rotations = [-2.8, -0.6, 1.6, -1.2, 2.4];
const threadAngles = [-6, 3, -2, 4];

const StateIntelBoard = ({ intel }: StateIntelBoardProps) => {
  const totals = intel?.totals ?? { player: 0, ai: 0, neutral: 0, contested: 0 };
  const contestedStates = (intel?.states ?? []).filter(state => state.contested).slice(0, 5);
  const recentEvents = intel?.recentEvents ?? [];
  const hasEvents = recentEvents.length > 0;

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
          {contestedStates.length > 0 ? (
            contestedStates.map(state => (
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
