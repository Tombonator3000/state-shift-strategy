import { X } from 'lucide-react';

import type { ParapediaEntry, ParapediaStateSummary } from '@/data/parapedia/paranormalAtlas';

interface ParapediaStateDetailProps {
  stateSummary: ParapediaStateSummary;
  entries: readonly ParapediaEntry[];
  onClose: () => void;
}

const ParapediaStateDetail = ({ stateSummary, entries, onClose }: ParapediaStateDetailProps) => {
  const timeline = entries
    .flatMap(entry => entry.timeline.map(event => ({ ...event, entryName: entry.name, category: entry.category })))
    .sort((a, b) => a.year - b.year);

  const references = entries.flatMap(entry =>
    entry.references.map(reference => ({
      ...reference,
      entryName: entry.name,
    }))
  );

  return (
    <aside className="dossier-card flex h-full flex-col gap-5">
      <header className="flex items-start justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[var(--dossier-muted)]">
            State dossier: {stateSummary.stateId}
          </p>
          <h4 className="font-mono text-xl uppercase tracking-[0.24em] text-[var(--dossier-ink)]">
            {stateSummary.name} — {stateSummary.region}
          </h4>
          <p className="mt-2 text-sm leading-relaxed text-[var(--dossier-text)]">{stateSummary.headline}</p>
          <p className="mt-2 text-xs uppercase tracking-[0.28em] text-[var(--dossier-muted)]">
            {stateSummary.anomaliesIndexed} anomalies logged • Trend {stateSummary.trend.toUpperCase()} • Updated{' '}
            {stateSummary.lastUpdated}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded border border-[var(--dossier-border)] bg-white/70 p-2 text-[var(--dossier-muted)] transition hover:border-[var(--dossier-accent)]"
          aria-label="Close state detail"
        >
          <X className="h-4 w-4" />
        </button>
      </header>

      <section>
        <h5 className="font-mono text-sm uppercase tracking-[0.3em] text-[var(--dossier-ink)]">Known Hotspots</h5>
        <ul className="mt-2 space-y-1 text-sm leading-relaxed text-[var(--dossier-text)]">
          {stateSummary.hotspots.map(hotspot => (
            <li key={hotspot} className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[var(--dossier-accent-muted)]" aria-hidden />
              <span>{hotspot}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs uppercase tracking-[0.26em] text-[var(--dossier-muted)]">{stateSummary.knownFor}</p>
      </section>

      <section className="flex-1 overflow-y-auto rounded border border-[var(--dossier-border)] bg-white/50 p-4">
        <h5 className="font-mono text-sm uppercase tracking-[0.3em] text-[var(--dossier-ink)]">Timeline</h5>
        {timeline.length === 0 ? (
          <p className="mt-2 font-mono text-xs uppercase tracking-[0.3em] text-[var(--dossier-muted)]">No logged events yet.</p>
        ) : (
          <ol className="mt-3 space-y-3">
            {timeline.map(event => (
              <li key={`${event.entryName}-${event.id}`} className="rounded border border-[var(--dossier-border)] bg-white/70 p-3">
                <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.3em] text-[var(--dossier-muted)]">
                  <span>{event.year}</span>
                  <span>{event.category}</span>
                </div>
                <p className="mt-1 font-mono text-xs uppercase tracking-[0.26em] text-[var(--dossier-ink)]">{event.entryName}</p>
                <p className="mt-1 text-sm leading-relaxed text-[var(--dossier-text)]">{event.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-[var(--dossier-muted)]">{event.description}</p>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="rounded border border-[var(--dossier-border)] bg-white/60 p-4">
        <h5 className="font-mono text-sm uppercase tracking-[0.3em] text-[var(--dossier-ink)]">Reference Files</h5>
        {references.length === 0 ? (
          <p className="mt-2 font-mono text-xs uppercase tracking-[0.3em] text-[var(--dossier-muted)]">References pending ingest.</p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm leading-relaxed text-[var(--dossier-text)]">
            {references.map(reference => (
              <li key={`${reference.entryName}-${reference.id}`}>
                <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--dossier-muted)]">
                  {reference.sourceType.toUpperCase()} • {reference.entryName}
                </p>
                <a
                  href={reference.url}
                  className="text-[var(--dossier-accent)] underline hover:text-[var(--dossier-accent-muted)]"
                  rel="noreferrer"
                  target="_blank"
                >
                  {reference.title}
                </a>
                <p className="text-xs leading-relaxed text-[var(--dossier-muted)]">{reference.summary}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </aside>
  );
};

export default ParapediaStateDetail;
