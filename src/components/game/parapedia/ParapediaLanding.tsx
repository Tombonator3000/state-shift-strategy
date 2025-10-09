import { useMemo } from 'react';
import { Sparkles, ScanSearch } from 'lucide-react';

import type { ArchivedEdition } from '@/hooks/usePressArchive';
import type { IntelArchiveEntry } from '@/hooks/useIntelArchive';
import type { ParapediaEntry } from '@/data/parapedia/paranormalAtlas';
import type { ParapediaLandingData } from '@/hooks/useParapediaEntries';

interface ParapediaLandingProps {
  faction: 'truth' | 'government';
  intelArchive: IntelArchiveEntry[];
  pressIssues: ArchivedEdition[];
  landingData: ParapediaLandingData;
  query: string;
  onQueryChange: (value: string) => void;
  selectedCategory: string;
  searchResults: ParapediaEntry[];
  onSelectEntry: (entry: ParapediaEntry) => void;
}

const ParapediaLanding = ({
  faction,
  intelArchive,
  pressIssues,
  landingData,
  query,
  onQueryChange,
  selectedCategory,
  searchResults,
  onSelectEntry,
}: ParapediaLandingProps) => {
  const stats = useMemo(
    () => [
      {
        label: 'Signals Flagged',
        value: intelArchive.length,
        description: 'Evidence Archive anomalies cross-referenced into ParaPedia.',
      },
      {
        label: 'Leaked Editions',
        value: pressIssues.length,
        description: 'Press Archive issues stitched into the counter-narrative.',
      },
      {
        label: 'Data Snapshot',
        value: landingData.totalEntries,
        description: `${landingData.totalStates} states currently indexed in the codex.`,
      },
    ],
    [intelArchive.length, landingData.totalEntries, landingData.totalStates, pressIssues.length]
  );

  return (
    <section className="dossier-card space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.36em] text-[var(--dossier-muted)]">
            Truth Bureau ParaPedia Node
          </p>
          <h3 className="font-mono text-2xl uppercase tracking-[0.22em] text-[var(--dossier-ink)]">Living Leak Codex</h3>
          <p className="mt-2 text-sm leading-relaxed text-[var(--dossier-text)]">
            ParaPedia braids every intercepted memo, cryptid sighting, and midnight whistle into a searchable conspiracy atlas.
            As soon as Truth operatives upload fresh intel, the codex pings related myths and flags the next weak seam in the
            Official Story.
          </p>
          <p className="mt-3 text-xs uppercase tracking-[0.24em] text-[var(--dossier-muted)]">
            {faction === 'truth'
              ? 'Authorized leaksters: keep feeding the archive until the cover story collapses.'
              : 'ShadowGov observers should not have access to this feed. Report this breach immediately.'}
          </p>
        </div>
        <Sparkles className="h-10 w-10 text-[var(--dossier-accent-muted)]" aria-hidden />
      </header>

      <div className="grid gap-3 md:grid-cols-3">
        {stats.map(({ label, value, description }) => (
          <article
            key={label}
            className="rounded border border-[var(--dossier-border)] bg-white/40 p-4 shadow-sm transition hover:border-[var(--dossier-accent)]"
          >
            <div className="flex items-center justify-between text-[var(--dossier-muted)]">
              <span className="font-mono text-[10px] uppercase tracking-[0.32em]">{label}</span>
              <ScanSearch className="h-4 w-4 text-[var(--dossier-accent-muted)]" aria-hidden />
            </div>
            <div className="mt-2 font-mono text-2xl font-semibold uppercase tracking-[0.16em] text-[var(--dossier-ink)]">
              {value.toString().padStart(2, '0')}
            </div>
            <p className="mt-1 text-xs leading-relaxed text-[var(--dossier-text)]">{description}</p>
          </article>
        ))}
      </div>

      <section className="space-y-4">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h4 className="font-mono text-sm uppercase tracking-wider text-[var(--dossier-ink)]">Search the Codex</h4>
            <p className="text-xs text-[var(--dossier-muted)]">
              Snapshot generated {landingData.generatedAt}. {landingData.datasetNotes}
            </p>
          </div>
        </header>

        <div className="relative">
          <label htmlFor="parapedia-search" className="sr-only">
            Search ParaPedia
          </label>
          <input
            id="parapedia-search"
            value={query}
            onChange={event => onQueryChange(event.target.value)}
            placeholder={`Search ${selectedCategory === 'all' ? 'all categories' : selectedCategory}`}
            className="w-full rounded border border-[var(--dossier-border)] bg-white/70 px-4 py-3 font-mono text-sm uppercase tracking-[0.24em] text-[var(--dossier-ink)] shadow focus:border-[var(--dossier-accent)] focus:outline-none"
          />
          <ScanSearch className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--dossier-muted)]" />
        </div>

        <div className="flex flex-wrap gap-4 text-[11px] uppercase tracking-[0.26em] text-[var(--dossier-muted)]">
          Trending:
          {landingData.trendingCategories.map(category => (
            <span key={category.category} className="rounded-full bg-white/60 px-3 py-1 font-mono">
              {category.category} × {category.count}
            </span>
          ))}
        </div>
      </section>

      {landingData.featuredQuotes.length > 0 && (
        <section className="rounded border border-dashed border-[var(--dossier-border)] bg-white/30 p-4 text-sm leading-relaxed text-[var(--dossier-text)]">
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--dossier-muted)]">Featured Field Notes</p>
          <ul className="mt-3 space-y-3">
            {landingData.featuredQuotes.map(quote => (
              <li key={quote.entryId}>
                <blockquote>
                  “{quote.quote}”
                  {quote.attribution ? <cite className="ml-2 text-[11px] uppercase text-[var(--dossier-muted)]">— {quote.attribution}</cite> : null}
                </blockquote>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="space-y-3">
        <header className="flex items-center justify-between">
          <h4 className="font-mono text-sm uppercase tracking-wider text-[var(--dossier-ink)]">Search Results</h4>
          <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-[var(--dossier-muted)]">
            {searchResults.length} indexed
          </span>
        </header>
        {searchResults.length === 0 ? (
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-[var(--dossier-muted)]">
            ParaPedia awaits new leaks matching that query.
          </p>
        ) : (
          <ul className="grid gap-3">
            {searchResults.map(entry => (
              <li key={entry.id}>
                <button
                  type="button"
                  onClick={() => onSelectEntry(entry)}
                  className="flex w-full flex-col rounded border border-[var(--dossier-border)] bg-white/50 p-4 text-left transition hover:border-[var(--dossier-accent)]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-[var(--dossier-muted)]">
                      {entry.category} • {entry.stateId}
                    </span>
                    <span className="text-[11px] uppercase tracking-[0.26em] text-[var(--dossier-accent-muted)]">
                      Signal {entry.signalLevel.toUpperCase()}
                    </span>
                  </div>
                  <h5 className="mt-2 font-mono text-base uppercase tracking-wide text-[var(--dossier-ink)]">{entry.name}</h5>
                  <p className="mt-1 text-sm leading-relaxed text-[var(--dossier-text)]">{entry.summary}</p>
                  <p className="mt-2 text-[11px] uppercase tracking-[0.22em] text-[var(--dossier-muted)]">
                    Tags: {entry.tags.join(', ')}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </section>
  );
};

export default ParapediaLanding;
