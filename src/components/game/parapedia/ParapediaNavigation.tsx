import type { ParapediaStateSummary } from '@/data/parapedia/paranormalAtlas';

interface ParapediaNavigationProps {
  categories: readonly string[];
  states: Readonly<Record<string, ParapediaStateSummary>>;
  selectedCategory: string;
  selectedState: string | null;
  onCategoryChange: (category: string) => void;
  onStateSelect: (stateId: string | null) => void;
}

const formatCategoryLabel = (category: string) => {
  return category.charAt(0).toUpperCase() + category.slice(1);
};

const ParapediaNavigation = ({
  categories,
  states,
  selectedCategory,
  selectedState,
  onCategoryChange,
  onStateSelect,
}: ParapediaNavigationProps) => {
  const categoryOptions = ['all', ...categories];

  return (
    <nav aria-label="ParaPedia filters" className="space-y-6">
      <section>
        <h4 className="font-mono text-[11px] uppercase tracking-[0.3em] text-[var(--dossier-muted)]">Categories</h4>
        <ul className="mt-3 grid gap-2">
          {categoryOptions.map(category => {
            const isActive = category === selectedCategory;
            return (
              <li key={category}>
                <button
                  type="button"
                  onClick={() => onCategoryChange(category)}
                  className={`w-full rounded border px-3 py-2 text-left font-mono text-xs uppercase tracking-[0.28em] transition ${
                    isActive
                      ? 'border-[var(--dossier-accent)] bg-[var(--dossier-accent-muted)]/20 text-[var(--dossier-ink)]'
                      : 'border-[var(--dossier-border)] bg-white/40 text-[var(--dossier-muted)] hover:border-[var(--dossier-accent-muted)]'
                  }`}
                >
                  {category === 'all' ? 'All Signals' : formatCategoryLabel(category)}
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <h4 className="font-mono text-[11px] uppercase tracking-[0.3em] text-[var(--dossier-muted)]">States</h4>
        <ul className="mt-3 max-h-64 space-y-2 overflow-y-auto pr-1">
          {Object.values(states).map(state => {
            const isActive = state.stateId === selectedState;
            return (
              <li key={state.stateId}>
                <button
                  type="button"
                  onClick={() => onStateSelect(isActive ? null : state.stateId)}
                  className={`w-full rounded border px-3 py-2 text-left transition ${
                    isActive
                      ? 'border-[var(--dossier-accent)] bg-[var(--dossier-accent-muted)]/30 text-[var(--dossier-ink)]'
                      : 'border-[var(--dossier-border)] bg-white/40 text-[var(--dossier-text)] hover:border-[var(--dossier-accent-muted)]'
                  }`}
                >
                  <span className="block font-mono text-[10px] uppercase tracking-[0.24em]">{state.stateId}</span>
                  <span className="text-xs leading-tight text-[var(--dossier-muted)]">{state.headline}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    </nav>
  );
};

export default ParapediaNavigation;
