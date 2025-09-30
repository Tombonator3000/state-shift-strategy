import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { Archive, Filter, Flag, Layers, MapPin, Trash2 } from 'lucide-react';
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
}

const FILTER_ALL = 'all';

const formatTurnLabel = (turn: number, round: number): string => {
  if (!Number.isFinite(turn) || !Number.isFinite(round)) {
    return 'Unknown turn';
  }
  return `Round ${round}, Turn ${turn}`;
};

const EvidenceArchivePanel = ({ entries, onDelete, onClear, className }: EvidenceArchivePanelProps) => {
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

    return {
      stateOptions: Array.from(states.entries()),
      factionOptions: Array.from(factions.entries()),
      typeOptions: Array.from(types.entries()),
      filteredEntries: filtered,
    };
  }, [entries, factionFilter, stateFilter, typeFilter]);

  const hasEntries = entries.length > 0;
  const hasFilteredResults = filteredEntries.length > 0;

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
                    {stateOptions.map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
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
                    {factionOptions.map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
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
                    {typeOptions.map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {onClear && (
              <div className="mt-4 flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-emerald-200/70 hover:text-emerald-100"
                  onClick={onClear}
                >
                  <Trash2 className="mr-1 h-4 w-4" aria-hidden />
                  Clear Archive
                </Button>
              </div>
            )}
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
