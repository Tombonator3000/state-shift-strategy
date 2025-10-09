import { useMemo, useState } from 'react';
import type { AgendaMoment, ArchivedEdition } from '@/hooks/usePressArchive';
import type { IntelArchiveEntry } from '@/hooks/useIntelArchive';

import ParapediaLanding from './ParapediaLanding';
import ParapediaNavigation from './ParapediaNavigation';
import ParapediaStateDetail from './ParapediaStateDetail';
import { useParapediaEntries, useParapediaStatePayload } from '@/hooks/useParapediaEntries';

interface ParapediaPanelProps {
  faction: 'truth' | 'government';
  intelArchive: IntelArchiveEntry[];
  pressIssues: ArchivedEdition[];
  agendaMoments?: AgendaMoment[];
}

const sortAgendaMoments = (moments: AgendaMoment[]) => {
  return [...moments]
    .filter((moment): moment is AgendaMoment => Boolean(moment))
    .sort((a, b) => (b.recordedAt ?? 0) - (a.recordedAt ?? 0))
    .slice(0, 5);
};

const ParapediaPanel = ({ faction, intelArchive, pressIssues, agendaMoments = [] }: ParapediaPanelProps) => {
  const { landingData, categories, states, queryEntries } = useParapediaEntries();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [query, setQuery] = useState('');
  const [selectedState, setSelectedState] = useState<string | null>(null);

  const filters = useMemo(
    () => ({
      category: selectedCategory === 'all' ? undefined : selectedCategory,
      stateId: selectedState ?? undefined,
    }),
    [selectedCategory, selectedState]
  );

  const searchResults = useMemo(() => queryEntries(query, filters), [filters, query, queryEntries]);

  const statePayload = useParapediaStatePayload(selectedState);

  const resolvedAgendaMoments = useMemo(() => sortAgendaMoments(agendaMoments), [agendaMoments]);

  const handleCategoryChange = (nextCategory: string) => {
    setSelectedCategory(nextCategory);
    // Reset query when toggling categories to surface curated hits faster
    setQuery('');
  };

  const handleStateSelect = (stateId: string | null) => {
    setSelectedState(stateId);
  };

  const handleSelectEntry = (entryStateId: string) => {
    setSelectedState(entryStateId);
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.6fr,1.4fr,0.9fr]">
      <ParapediaNavigation
        categories={categories}
        states={states}
        selectedCategory={selectedCategory}
        selectedState={selectedState}
        onCategoryChange={handleCategoryChange}
        onStateSelect={handleStateSelect}
      />

      <ParapediaLanding
        faction={faction}
        intelArchive={intelArchive}
        pressIssues={pressIssues}
        landingData={landingData}
        query={query}
        onQueryChange={setQuery}
        selectedCategory={selectedCategory}
        searchResults={searchResults}
        onSelectEntry={entry => handleSelectEntry(entry.stateId)}
      />

      {statePayload ? (
        <ParapediaStateDetail stateSummary={statePayload.summary} entries={statePayload.entries} onClose={() => setSelectedState(null)} />
      ) : (
        <aside className="dossier-card space-y-4">
          <h4 className="font-mono text-sm uppercase tracking-wider text-[var(--dossier-ink)]">Latest Cross-links</h4>
          {resolvedAgendaMoments.length === 0 ? (
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-[var(--dossier-muted)]">
              ParaPedia is awaiting a fresh operation log. Document a Truth advance to seed this reel.
            </p>
          ) : (
            <ul className="space-y-3">
              {resolvedAgendaMoments.map(moment => (
                <li key={moment.id} className="rounded border border-[var(--dossier-border)] bg-white/40 p-3 shadow-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-[var(--dossier-muted)]">
                      {moment.recordedAt ? new Date(moment.recordedAt).toLocaleString() : 'Unlogged'}
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
      )}
    </div>
  );
};

export default ParapediaPanel;
