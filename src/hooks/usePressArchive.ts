import { useCallback, useEffect, useState } from 'react';
import type { GameOverReport } from '@/types/finalEdition';
import { getFactionDisplayName, getVictoryConditionLabel } from '@/utils/finalEdition';

export interface ArchivedEdition {
  id: string;
  savedAt: number;
  title: string;
  report: GameOverReport;
}

const STORAGE_KEY = 'shadowgov-press-archive';
const MAX_ENTRIES = 12;

const deriveTitle = (report: GameOverReport): string => {
  const outcome = report.winner === 'draw'
    ? 'Stalemate'
    : `${getFactionDisplayName(report.winner)} Victory`;
  const condition = getVictoryConditionLabel(report.victoryType);
  const roundLabel = report.rounds > 0 ? `Round ${report.rounds}` : 'Prologue';
  return `${outcome} · ${condition} · ${roundLabel}`;
};

export const usePressArchive = () => {
  const [issues, setIssues] = useState<ArchivedEdition[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return;
      }
      const parsed = JSON.parse(stored) as ArchivedEdition[] | null;
      if (!Array.isArray(parsed)) {
        return;
      }
      const normalized = parsed
        .filter(entry => entry && entry.report)
        .map(entry => ({
          ...entry,
          id: entry.id ?? `edition-${entry.report.recordedAt}`,
          title: entry.title ?? deriveTitle(entry.report),
          savedAt: entry.savedAt ?? entry.report.recordedAt ?? Date.now(),
        }))
        .sort((a, b) => (b.savedAt ?? b.report.recordedAt ?? 0) - (a.savedAt ?? a.report.recordedAt ?? 0));
      setIssues(normalized);
    } catch (error) {
      console.warn('Failed to load press archive', error);
    }
  }, []);

  useEffect(() => {
    try {
      const payload = JSON.stringify(issues);
      localStorage.setItem(STORAGE_KEY, payload);
    } catch (error) {
      console.warn('Failed to persist press archive', error);
    }
  }, [issues]);

  const archiveEdition = useCallback((report: GameOverReport) => {
    setIssues(prev => {
      const id = `edition-${report.recordedAt}`;
      const title = deriveTitle(report);
      const existingIndex = prev.findIndex(entry => entry.id === id);
      const nextEntry: ArchivedEdition = {
        id,
        savedAt: Date.now(),
        title,
        report,
      };

      if (existingIndex >= 0) {
        const copy = [...prev];
        copy[existingIndex] = nextEntry;
        return copy;
      }

      return [nextEntry, ...prev].slice(0, MAX_ENTRIES);
    });
  }, []);

  const removeEditionFromArchive = useCallback((id: string) => {
    setIssues(prev => prev.filter(entry => entry.id !== id));
  }, []);

  const clearArchive = useCallback(() => {
    setIssues([]);
  }, []);

  return {
    issues,
    archiveEdition,
    removeEditionFromArchive,
    clearArchive,
  };
};
