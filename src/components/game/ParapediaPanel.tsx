import { useMemo } from 'react';
import { Sparkles, RadioReceiver, Newspaper, ScanSearch } from 'lucide-react';
import type { AgendaMoment, ArchivedEdition } from '@/hooks/usePressArchive';
import type { IntelArchiveEntry } from '@/hooks/useIntelArchive';

interface ParapediaPanelProps {
  faction: 'truth' | 'government';
  intelArchive: IntelArchiveEntry[];
  pressIssues: ArchivedEdition[];
  agendaMoments?: AgendaMoment[];
}

const ParapediaPanel = ({ faction, intelArchive, pressIssues, agendaMoments = [] }: ParapediaPanelProps) => {
  const recentAgendaMoments = useMemo(() => {
    return [...agendaMoments]
      .filter((moment): moment is AgendaMoment => Boolean(moment))
      .sort((a, b) => (b.recordedAt ?? 0) - (a.recordedAt ?? 0))
      .slice(0, 3);
  }, [agendaMoments]);

  const dateFormatter = useMemo(() => {
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

  const resolveTimestamp = (timestamp: number | undefined): string => {
    if (!timestamp) {
      return 'Unlogged';
    }

    if (dateFormatter) {
      try {
        return dateFormatter.format(new Date(timestamp));
      } catch {
        // fall through
      }
    }

    const date = new Date(timestamp);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hour = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${month}/${day} ${hour}:${minutes}`;
  };

  const stats = [
    {
      label: 'Signals Flagged',
      value: intelArchive.length,
      description: 'Evidence Archive anomalies cross-referenced into ParaPedia.',
      Icon: ScanSearch,
    },
    {
      label: 'Leaked Editions',
      value: pressIssues.length,
      description: 'Press Archive issues stitched into the counter-narrative.',
      Icon: Newspaper,
    },
    {
      label: 'Ops Logged',
      value: agendaMoments.length,
      description: 'Field operations feeding the living codex.',
      Icon: RadioReceiver,
    },
  ];

  return (
    <div className="grid gap-6 xl:grid-cols-[1.35fr,0.65fr]">
      <section className="dossier-card space-y-5">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.36em] text-[var(--dossier-muted)]">
              Truth Bureau ParaPedia Node
            </p>
            <h3 className="font-mono text-2xl uppercase tracking-[0.22em] text-[var(--dossier-ink)]">Living Leak Codex</h3>
          </div>
          <Sparkles className="h-8 w-8 text-[var(--dossier-accent-muted)]" aria-hidden />
        </header>

        <p className="text-sm leading-relaxed text-[var(--dossier-text)]">
          ParaPedia braids every intercepted memo, cryptid sighting, and midnight whistle into a searchable conspiracy atlas.
          As soon as Truth operatives upload fresh intel, the codex pings related myths and flags the next weak seam in the
          Official Story.
        </p>
        <p className="text-xs uppercase tracking-[0.24em] text-[var(--dossier-muted)]">
          {faction === 'truth'
            ? 'Authorized leaksters: keep feeding the archive until the cover story collapses.'
            : 'ShadowGov observers should not have access to this feed. Report this breach immediately.'}
        </p>

        <div className="grid gap-3 md:grid-cols-3">
          {stats.map(({ label, value, description, Icon }) => (
            <article
              key={label}
              className="rounded border border-[var(--dossier-border)] bg-white/40 p-4 shadow-sm transition hover:border-[var(--dossier-accent)]"
            >
              <div className="flex items-center justify-between text-[var(--dossier-muted)]">
                <span className="font-mono text-[10px] uppercase tracking-[0.32em]">{label}</span>
                <Icon className="h-4 w-4 text-[var(--dossier-accent-muted)]" aria-hidden />
              </div>
              <div className="mt-2 font-mono text-2xl font-semibold uppercase tracking-[0.16em] text-[var(--dossier-ink)]">
                {value.toString().padStart(2, '0')}
              </div>
              <p className="mt-1 text-xs leading-relaxed text-[var(--dossier-text)]">{description}</p>
            </article>
          ))}
        </div>

        <div className="rounded border border-dashed border-[var(--dossier-border)] bg-white/30 p-4 text-sm leading-relaxed text-[var(--dossier-text)]">
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--dossier-muted)]">
            Field Note
          </p>
          <p className="mt-2">
            Cross-links fire automatically when a leak touches a known anomaly. Pin sightings, attach recordings, and cite the
            tabloid spreads you liberated. ParaPedia will thread the rumor, source the evidence, and prep a briefing packet for
            the next operation.
          </p>
        </div>
      </section>

      <aside className="dossier-card space-y-4">
        <h4 className="font-mono text-sm uppercase tracking-wider text-[var(--dossier-ink)]">Latest cross-links</h4>
        {recentAgendaMoments.length === 0 ? (
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-[var(--dossier-muted)]">
            ParaPedia is awaiting a fresh operation log. Document a Truth advance to seed this reel.
          </p>
        ) : (
          <ul className="space-y-3">
            {recentAgendaMoments.map(moment => (
              <li
                key={moment.id}
                className="border border-[var(--dossier-border)] bg-white/40 p-3 shadow-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-[var(--dossier-muted)]">
                    {resolveTimestamp(moment.recordedAt)}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-[var(--dossier-accent-muted)]">
                    {moment.status}
                  </span>
                </div>
                <h5 className="mt-2 font-mono text-sm uppercase tracking-wide text-[var(--dossier-ink)]">
                  {(moment as any).title ?? 'Classified Operation'}
                </h5>
                <p className="mt-1 text-xs leading-relaxed text-[var(--dossier-text)]">
                  {(moment as any).description ?? 'Details remain redacted, but the codex pinned the signal for future Truth strikes.'}
                </p>
              </li>
            ))}
          </ul>
        )}
      </aside>
    </div>
  );
};

export default ParapediaPanel;
