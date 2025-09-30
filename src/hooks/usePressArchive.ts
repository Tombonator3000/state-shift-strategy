import { useCallback, useEffect, useState } from 'react';
import type { GameOverReport } from '@/types/finalEdition';
import { getFactionDisplayName, getVictoryConditionLabel } from '@/utils/finalEdition';

export interface ArchivedEdition {
  id: string;
  savedAt: number;
  title: string;
  report: GameOverReport;
}

export interface AgendaMoment {
  id: string;
  agendaId: string;
  agendaTitle: string;
  stageId: string;
  stageLabel: string;
  stageDescription?: string;
  previousStageId?: string;
  previousStageLabel?: string;
  faction: 'truth' | 'government';
  actor: 'player' | 'opposition';
  status: 'advance' | 'setback' | 'complete';
  progress: number;
  target: number;
  recordedAt: number;
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
  const [agendaMoments, setAgendaMoments] = useState<AgendaMoment[]>([]);

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

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handler = (event: Event) => {
      const detail = (event as CustomEvent<AgendaMoment | null>).detail;
      if (!detail || typeof detail !== 'object') {
        return;
      }

      setAgendaMoments(prev => {
        if (prev.some(entry => entry.id === detail.id)) {
          return prev;
        }
        const MAX_ENTRIES = 12;
        const updated = [...prev, detail].sort((a, b) => (a.recordedAt ?? 0) - (b.recordedAt ?? 0));
        return updated.slice(-MAX_ENTRIES);
      });
    };

    window.addEventListener('agendaMoment', handler as EventListener);
    return () => window.removeEventListener('agendaMoment', handler as EventListener);
  }, []);

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

  const clearAgendaMoments = useCallback(() => {
    setAgendaMoments([]);
  }, []);

  return {
    issues,
    archiveEdition,
    removeEditionFromArchive,
    clearArchive,
    agendaMoments,
    clearAgendaMoments,
  };
};
