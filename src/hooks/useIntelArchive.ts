import { useCallback, useEffect, useState } from 'react';
import type { GameEvent } from '@/data/eventDatabase';

export interface IntelArchiveEntry {
  id: string;
  savedAt: number;
  stateId: string;
  stateName?: string;
  stateAbbreviation?: string;
  stateOwner: 'player' | 'ai' | 'neutral';
  contested: boolean;
  faction: 'truth' | 'government' | 'neutral';
  eventId: string;
  eventLabel: string;
  eventType: GameEvent['type'] | 'unknown';
  triggeredOnTurn: number;
  round: number;
  loreText: string;
  effectSummary?: string[];
}

export type IntelArchiveDraft = Omit<IntelArchiveEntry, 'id' | 'savedAt'> & {
  id?: string;
  savedAt?: number;
};

const STORAGE_KEY = 'shadowgov-intel-archive';
const MAX_ENTRIES = 36;

const normalizeEntry = (entry: Partial<IntelArchiveEntry>): IntelArchiveEntry | null => {
  if (!entry) {
    return null;
  }

  const stateId = typeof entry.stateId === 'string' && entry.stateId.trim().length > 0
    ? entry.stateId.trim()
    : entry.stateAbbreviation ?? entry.stateName;
  const eventId = typeof entry.eventId === 'string' && entry.eventId.trim().length > 0
    ? entry.eventId.trim()
    : undefined;
  const eventLabel = typeof entry.eventLabel === 'string' && entry.eventLabel.trim().length > 0
    ? entry.eventLabel.trim()
    : undefined;
  const loreText = typeof entry.loreText === 'string' && entry.loreText.trim().length > 0
    ? entry.loreText.trim()
    : undefined;
  const triggeredOnTurn = typeof entry.triggeredOnTurn === 'number' && Number.isFinite(entry.triggeredOnTurn)
    ? entry.triggeredOnTurn
    : undefined;
  const round = typeof entry.round === 'number' && Number.isFinite(entry.round)
    ? entry.round
    : undefined;

  if (!stateId || !eventId || !eventLabel || !loreText || !triggeredOnTurn || !round) {
    return null;
  }

  const faction = entry.faction === 'government' || entry.faction === 'truth'
    ? entry.faction
    : 'neutral';
  const owner = entry.stateOwner === 'player' || entry.stateOwner === 'ai'
    ? entry.stateOwner
    : 'neutral';
  const eventType = entry.eventType ?? 'unknown';

  const id = typeof entry.id === 'string' && entry.id.trim().length > 0
    ? entry.id.trim()
    : `${stateId}-${eventId}-${triggeredOnTurn}`;

  return {
    id,
    savedAt: typeof entry.savedAt === 'number' && Number.isFinite(entry.savedAt)
      ? entry.savedAt
      : Date.now(),
    stateId,
    stateName: entry.stateName ?? undefined,
    stateAbbreviation: entry.stateAbbreviation ?? undefined,
    stateOwner: owner,
    contested: Boolean(entry.contested),
    faction,
    eventId,
    eventLabel,
    eventType,
    triggeredOnTurn,
    round,
    loreText,
    effectSummary: Array.isArray(entry.effectSummary) && entry.effectSummary.length > 0
      ? entry.effectSummary.map(String)
      : undefined,
  } satisfies IntelArchiveEntry;
};

export const useIntelArchive = () => {
  const [entries, setEntries] = useState<IntelArchiveEntry[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return;
      }
      const parsed = JSON.parse(stored) as Array<Partial<IntelArchiveEntry>> | null;
      if (!Array.isArray(parsed)) {
        return;
      }
      const normalized = parsed
        .map(normalizeEntry)
        .filter((entry): entry is IntelArchiveEntry => entry !== null)
        .sort((a, b) => b.savedAt - a.savedAt);
      setEntries(normalized.slice(0, MAX_ENTRIES));
    } catch (error) {
      console.warn('Failed to load intel archive', error);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const payload = JSON.stringify(entries);
      window.localStorage.setItem(STORAGE_KEY, payload);
    } catch (error) {
      console.warn('Failed to persist intel archive', error);
    }
  }, [entries]);

  const archiveIntelEvents = useCallback((records: IntelArchiveDraft | IntelArchiveDraft[]) => {
    const payload = Array.isArray(records) ? records : [records];
    setEntries(prev => {
      const existing = [...prev];
      const now = Date.now();

      payload.forEach(record => {
        const normalized = normalizeEntry({
          ...record,
          savedAt: record.savedAt ?? now,
        });
        if (!normalized) {
          return;
        }
        const index = existing.findIndex(entry => entry.id === normalized.id);
        if (index >= 0) {
          existing[index] = normalized;
        } else {
          existing.unshift(normalized);
        }
      });

      existing.sort((a, b) => b.savedAt - a.savedAt);
      return existing.slice(0, MAX_ENTRIES);
    });
  }, []);

  const removeIntelFromArchive = useCallback((id: string) => {
    setEntries(prev => prev.filter(entry => entry.id !== id));
  }, []);

  const clearArchive = useCallback(() => {
    setEntries([]);
  }, []);

  return {
    entries,
    archiveIntelEvents,
    removeIntelFromArchive,
    clearArchive,
  };
};

export default useIntelArchive;
