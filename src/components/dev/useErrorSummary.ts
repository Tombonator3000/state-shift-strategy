import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { errorHandler, type GameError } from '@/utils/errorHandler';

interface ErrorSummaryState {
  total: number;
  byType: Record<string, number>;
  recent: GameError[];
}

interface UseErrorSummaryResult extends ErrorSummaryState {
  lastUpdated: number;
  clearErrors: () => void;
  refresh: () => void;
}

const createSummary = (): ErrorSummaryState => {
  const summary = errorHandler.getErrorSummary();
  return {
    total: summary.total,
    byType: { ...summary.byType },
    recent: [...summary.recent],
  };
};

export const useErrorSummary = (pollIntervalMs: number = 4000): UseErrorSummaryResult => {
  const [summary, setSummary] = useState<ErrorSummaryState>(() => createSummary());
  const [lastUpdated, setLastUpdated] = useState<number>(() => Date.now());
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const refresh = useCallback(() => {
    setSummary(createSummary());
    setLastUpdated(Date.now());
  }, []);

  const clearErrors = useCallback(() => {
    errorHandler.clearErrors();
    refresh();
  }, [refresh]);

  useEffect(() => {
    refresh();

    intervalRef.current = setInterval(() => {
      refresh();
    }, pollIntervalMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [pollIntervalMs, refresh]);

  const memoizedSummary = useMemo(() => ({
    total: summary.total,
    byType: summary.byType,
    recent: summary.recent,
  }), [summary]);

  return {
    ...memoizedSummary,
    lastUpdated,
    clearErrors,
    refresh,
  };
};

export type { GameError } from '@/utils/errorHandler';
