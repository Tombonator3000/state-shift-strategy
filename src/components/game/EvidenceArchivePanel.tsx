import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { Archive, Filter, Flag, Layers, MapPin, RotateCcw, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import type { IntelArchiveEntry } from '@/hooks/useIntelArchive';

interface EvidenceArchivePanelProps {
  entries: IntelArchiveEntry[];
  onDelete: (id: string) => void;
  onClear?: () => void;
  className?: string;
  variant?: 'default' | 'broadsheet';
}

const FILTER_ALL = 'all';

const formatTurnLabel = (turn: number, round: number): string => {
  if (!Number.isFinite(turn) || !Number.isFinite(round)) {
    return 'Unknown turn';
  }
  return `Round ${round}, Turn ${turn}`;
};

const EvidenceArchivePanel = ({ entries, onDelete, onClear, className, variant = 'default' }: EvidenceArchivePanelProps) => {
  const [stateFilter, setStateFilter] = useState<string>(FILTER_ALL);
  const [factionFilter, setFactionFilter] = useState<string>(FILTER_ALL);
  const [typeFilter, setTypeFilter] = useState<string>(FILTER_ALL);

  const { stateOptions, factionOptions, typeOptions, filteredEntries } = useMemo(() => {
    const states = new Map<string, string>();
    const factions = new Map<string, string>();
    const types = new Map<string, string>();

    const normalizedEntries = [...entries].sort((a, b) => b.savedAt - a.savedAt);

    normalizedEntries.forEach(entry => {
      const stateKey = entry.stateId ?? entry.stateAbbreviation ?? entry.stateName ?? entry.id;
      const stateLabel = entry.stateName
        ? `${entry.stateName}${entry.stateAbbreviation ? ` (${entry.stateAbbreviation})` : ''}`
        : stateKey;
      if (stateKey) {
        states.set(stateKey, stateLabel);
      }
      const factionKey = entry.faction;
      if (factionKey) {
        factions.set(factionKey, factionKey === 'truth' ? 'Truth Network' : factionKey === 'government' ? 'Government' : 'Unknown');
      }
      const eventType = entry.eventType ?? 'unknown';
      types.set(eventType, eventType.charAt(0).toUpperCase() + eventType.slice(1));
    });

    const filtered = normalizedEntries.filter(entry => {
      const stateKey = entry.stateId ?? entry.stateAbbreviation ?? entry.stateName ?? entry.id;
      const matchesState = stateFilter === FILTER_ALL || stateKey === stateFilter;
      const matchesFaction = factionFilter === FILTER_ALL || entry.faction === factionFilter;
      const matchesType = typeFilter === FILTER_ALL || (entry.eventType ?? 'unknown') === typeFilter;
      return matchesState && matchesFaction && matchesType;
    });

    const toOptionObjects = (entries: Array<[string, string]>) =>
      entries
        .filter(([value]) => Boolean(value))
        .map(([value, label]) => ({ value, label }));

    return {
      stateOptions: [
        { value: FILTER_ALL, label: 'All States' },
        ...toOptionObjects(Array.from(states.entries()).sort((a, b) => a[1].localeCompare(b[1]))),
      ],
      factionOptions: [
        { value: FILTER_ALL, label: 'All Factions' },
        ...toOptionObjects(Array.from(factions.entries()).sort((a, b) => a[1].localeCompare(b[1]))),
      ],
      typeOptions: [
        { value: FILTER_ALL, label: 'All Types' },
        ...toOptionObjects(Array.from(types.entries()).sort((a, b) => a[1].localeCompare(b[1]))),
      ],
      filteredEntries: filtered,
    };
  }, [entries, factionFilter, stateFilter, typeFilter]);

  const hasEntries = entries.length > 0;
  const hasFilteredResults = filteredEntries.length > 0;

  const handleResetFilters = () => {
    setStateFilter(FILTER_ALL);
    setFactionFilter(FILTER_ALL);
    setTypeFilter(FILTER_ALL);
  };

  const handleClearArchive = () => {
    onClear?.();
  };

  if (variant === 'broadsheet') {
    return (
      <div className={clsx('flex h-full flex-col gap-6 text-[var(--broadsheet-ink)]', className)}>
        <header className="rounded-xl border border-[var(--broadsheet-rule)] bg-[rgba(255,255,255,0.9)] px-5 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-typewriter text-[11px] uppercase tracking-[0.42em] text-[var(--broadsheet-kicker)]">Supplement A</p>
              <h3 className="font-broadsheetSans text-2xl uppercase tracking-[0.16em]">Evidence Annex</h3>
            </div>
            <Layers className="h-6 w-6 text-[var(--broadsheet-accent)]" aria-hidden />
          </div>
        </header>

        <div className="flex flex-col gap-3 rounded-xl border border-[var(--broadsheet-rule)] bg-[rgba(255,255,255,0.86)] p-4 shadow-sm md:flex-row">
          <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-3">
            <Select value={stateFilter} onValueChange={setStateFilter}>
              <SelectTrigger className="rounded-lg border border-[var(--broadsheet-rule)] bg-white/90 px-4 py-2 font-typewriter text-[11px] uppercase tracking-[0.28em] text-[var(--broadsheet-ink)]">
                <SelectValue placeholder="State" />
              </SelectTrigger>
              <SelectContent className="border border-[var(--broadsheet-rule)] bg-[rgba(255,255,255,0.95)] text-[var(--broadsheet-ink)]">
                {stateOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={factionFilter} onValueChange={setFactionFilter}>
              <SelectTrigger className="rounded-lg border border-[var(--broadsheet-rule)] bg-white/90 px-4 py-2 font-typewriter text-[11px] uppercase tracking-[0.28em] text-[var(--broadsheet-ink)]">
                <SelectValue placeholder="Faction" />
              </SelectTrigger>
              <SelectContent className="border border-[var(--broadsheet-rule)] bg-[rgba(255,255,255,0.95)] text-[var(--broadsheet-ink)]">
                {factionOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="rounded-lg border border-[var(--broadsheet-rule)] bg-white/90 px-4 py-2 font-typewriter text-[11px] uppercase tracking-[0.28em] text-[var(--broadsheet-ink)]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent className="border border-[var(--broadsheet-rule)] bg-[rgba(255,255,255,0.95)] text-[var(--broadsheet-ink)]">
                {typeOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-end gap-2">
            <Button
              onClick={handleResetFilters}
              variant="outline"
              size="sm"
              className="rounded-full border border-[var(--broadsheet-rule)] bg-white/85 px-4 py-1 font-typewriter text-[11px] uppercase tracking-[0.3em] text-[var(--broadsheet-ink)] hover:border-[var(--broadsheet-accent)]"
            >
              <RotateCcw className="mr-2 h-4 w-4" aria-hidden />
              Reset Filters
            </Button>
            {onClear && (
              <Button
                onClick={handleClearArchive}
                variant="outline"
                size="sm"
                className="rounded-full border border-red-600/60 bg-[rgba(248,113,113,0.2)] px-4 py-1 font-typewriter text-[11px] uppercase tracking-[0.3em] text-red-900 hover:border-red-600 hover:bg-[rgba(239,68,68,0.25)]"
              >
                <Trash2 className="mr-2 h-4 w-4" aria-hidden />
                Clear Archive
              </Button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          {filteredEntries.length === 0 ? (
            <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-[var(--broadsheet-rule)] bg-white/80 p-6 text-center font-broadsheet text-[15px] text-[var(--broadsheet-muted)]">
              No evidence logged with current filters.
            </div>
          ) : (
            <ScrollArea className="h-full pr-2">
              <div className="space-y-3">
                {filteredEntries.map(entry => (
                  <article
                    key={entry.id}
                    className="rounded-xl border border-[var(--broadsheet-rule)] bg-[rgba(255,255,255,0.86)] p-4 shadow-sm transition hover:border-[var(--broadsheet-accent)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.12)]"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-typewriter text-[10px] uppercase tracking-[0.32em] text-[var(--broadsheet-muted)]">
                          {entry.stateName ?? entry.stateAbbreviation ?? entry.stateId ?? 'Unknown location'}
                        </p>
                        <h4 className="font-broadsheetSans text-lg uppercase tracking-[0.14em]">{entry.eventLabel}</h4>
                      </div>
                      <span className="rounded-full border border-[var(--broadsheet-rule)] px-3 py-1 font-typewriter text-[10px] uppercase tracking-[0.28em] text-[var(--broadsheet-muted)]">
                        {formatTurnLabel(entry.triggeredOnTurn, entry.round)}
                      </span>
                    </div>

                    <p className="mt-2 whitespace-pre-wrap font-broadsheet text-[15px] leading-relaxed text-[var(--broadsheet-muted)]">
                      {entry.loreText}
                    </p>

                    {Array.isArray(entry.effectSummary) && entry.effectSummary.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2 font-typewriter text-[10px] uppercase tracking-[0.28em] text-[var(--broadsheet-muted)]">
                        {entry.effectSummary.map(effect => (
                          <span
                            key={effect}
                            className="rounded-full border border-[var(--broadsheet-rule)] bg-white/80 px-3 py-1"
                          >
                            {effect}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="mt-3 flex flex-wrap items-center gap-3 font-typewriter text-[10px] uppercase tracking-[0.3em] text-[var(--broadsheet-muted)]">
                      <span className="flex items-center gap-1">
                        <Flag className="h-4 w-4 text-[var(--broadsheet-accent)]" />
                        {entry.faction === 'truth'
                          ? 'Truth Network'
                          : entry.faction === 'government'
                            ? 'Government'
                            : 'Unknown faction'}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-[var(--broadsheet-accent)]" />
                        {(entry.eventType ?? 'unknown').charAt(0).toUpperCase() + (entry.eventType ?? 'unknown').slice(1)}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="font-typewriter text-[11px] uppercase tracking-[0.3em] text-[var(--broadsheet-muted)] hover:text-[var(--broadsheet-accent)]"
                        onClick={() => onDelete(entry.id)}
                      >
                        <Trash2 className="mr-1 h-4 w-4" aria-hidden />
                        Remove
                      </Button>
                    </div>
                  </article>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={clsx('flex h-full flex-col', className)}>
      <div className="relative mb-4 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.32em] text-emerald-200/80">Intel Archive</p>
          <h3 className="font-mono text-lg font-semibold uppercase tracking-[0.2em] text-emerald-100">Evidence Locker</h3>
        </div>
        <Archive className="h-6 w-6 text-emerald-300" aria-hidden />
      </div>

      {hasEntries ? (
        <>
          <Card className="mb-4 border border-emerald-500/30 bg-slate-950/80 p-4">
            <div className="mb-3 flex items-center gap-2 text-emerald-200/80">
              <Filter className="h-4 w-4" aria-hidden />
              <span className="font-mono text-[11px] uppercase tracking-[0.3em]">Filter Findings</span>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.24em] text-emerald-200/70">
                  State
                </label>
                <Select value={stateFilter} onValueChange={setStateFilter}>
                  <SelectTrigger className="border-emerald-500/40 bg-emerald-500/5 text-emerald-100">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={FILTER_ALL}>All States</SelectItem>
                    {stateOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.24em] text-emerald-200/70">
                  Faction
                </label>
                <Select value={factionFilter} onValueChange={setFactionFilter}>
                  <SelectTrigger className="border-emerald-500/40 bg-emerald-500/5 text-emerald-100">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={FILTER_ALL}>All Factions</SelectItem>
                    {factionOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.24em] text-emerald-200/70">
                  Event Type
                </label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="border-emerald-500/40 bg-emerald-500/5 text-emerald-100">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={FILTER_ALL}>All Types</SelectItem>
                    {typeOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-emerald-200/70 hover:text-emerald-100"
                onClick={handleResetFilters}
              >
                <RotateCcw className="mr-1 h-4 w-4" aria-hidden />
                Reset Filters
              </Button>
              {onClear && (
                <Button
                  variant="destructive"
                  size="sm"
                  className="bg-red-700/80 text-red-50 hover:bg-red-700"
                  onClick={handleClearArchive}
                >
                  <Trash2 className="mr-1 h-4 w-4" aria-hidden />
                  Clear Archive
                </Button>
              )}
            </div>
          </Card>

          {hasFilteredResults ? (
            <ScrollArea className="flex-1 pr-2">
              <div className="space-y-3 pb-4">
                {filteredEntries.map(entry => (
                  <Card
                    key={entry.id}
                    className="relative overflow-hidden border border-emerald-500/30 bg-slate-950/85 p-4"
                  >
                    <div className="pointer-events-none absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.35),_transparent_65%)]" />
                    <div className="relative flex flex-col gap-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-emerald-300/70">
                            {formatTurnLabel(entry.triggeredOnTurn, entry.round)}
                          </p>
                          <h4 className="font-mono text-lg font-semibold uppercase tracking-[0.18em] text-emerald-100">
                            {entry.eventLabel}
                          </h4>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-emerald-200/70 hover:text-emerald-100"
                          onClick={() => onDelete(entry.id)}
                        >
                          <Trash2 className="mr-1 h-4 w-4" aria-hidden />
                          Remove
                        </Button>
                      </div>
                      <div className="grid gap-3 text-sm text-emerald-100/80 md:grid-cols-3">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-emerald-300" aria-hidden />
                          <span>
                            {entry.stateName ?? entry.stateAbbreviation ?? entry.stateId}
                            {entry.stateAbbreviation && entry.stateName ? ` (${entry.stateAbbreviation})` : ''}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Flag className="h-4 w-4 text-emerald-300" aria-hidden />
                          <span className="capitalize">{entry.faction}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Layers className="h-4 w-4 text-emerald-300" aria-hidden />
                          <span className="capitalize">{entry.eventType ?? 'Unknown'}</span>
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed text-emerald-100/80 whitespace-pre-wrap">
                        {entry.loreText}
                      </p>
                      {entry.effectSummary && entry.effectSummary.length > 0 && (
                        <div className="flex flex-wrap gap-2 text-[11px] font-mono uppercase tracking-[0.24em] text-emerald-200/70">
                          {entry.effectSummary.map(effect => (
                            <span
                              key={effect}
                              className="rounded border border-emerald-500/40 bg-emerald-500/10 px-2 py-1"
                            >
                              {effect}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <Card className="flex flex-1 flex-col items-center justify-center border border-dashed border-emerald-500/40 bg-emerald-500/5 p-8 text-center">
              <MapPin className="mb-3 h-10 w-10 text-emerald-300/70" aria-hidden />
              <h4 className="font-mono text-sm uppercase tracking-[0.28em] text-emerald-200/70">No matches</h4>
              <p className="mt-2 max-w-sm text-sm text-emerald-100/70">
                Adjust the filters to surface archived state intel from previous operations.
              </p>
            </Card>
          )}
        </>
      ) : (
        <Card className="flex flex-1 flex-col items-center justify-center border border-dashed border-emerald-500/40 bg-emerald-500/5 p-8 text-center">
          <Archive className="mb-3 h-10 w-10 text-emerald-300/70" aria-hidden />
          <h4 className="font-mono text-sm uppercase tracking-[0.28em] text-emerald-200/70">No evidence logged</h4>
          <p className="mt-2 max-w-sm text-sm text-emerald-100/70">
            Complete a match to catalogue intelligence reports from state events in your archive.
          </p>
        </Card>
      )}
    </div>
  );
};

export default EvidenceArchivePanel;
