import { Fragment, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useErrorSummary, type GameError } from './useErrorSummary';

const ERROR_ACCENTS: Record<GameError['type'], string> = {
  audio: 'text-sky-300 border-sky-500/30 bg-sky-500/10',
  network: 'text-amber-300 border-amber-500/30 bg-amber-500/10',
  state: 'text-purple-300 border-purple-500/30 bg-purple-500/10',
  ui: 'text-emerald-300 border-emerald-500/30 bg-emerald-500/10',
  critical: 'text-rose-300 border-rose-500/50 bg-rose-500/10',
};

const formatTimestamp = (timestamp: number): string => {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

const formatContext = (context: GameError['context']): string | null => {
  if (!context) {
    return null;
  }

  try {
    if (typeof context === 'string') {
      return context;
    }

    return JSON.stringify(context, null, 2);
  } catch (error) {
    console.error('Failed to stringify error context', error);
    return null;
  }
};

const renderSummaryBadges = (byType: Record<string, number>) => {
  const entries = Object.entries(byType);
  if (entries.length === 0) {
    return (
      <Badge variant="outline" className="border-gray-700 text-gray-400">
        No categorized errors yet
      </Badge>
    );
  }

  return entries.map(([type, count]) => (
    <Badge
      key={type}
      variant="outline"
      className={`uppercase tracking-wide text-[11px] border ${ERROR_ACCENTS[type as GameError['type']] ?? 'border-gray-700 text-gray-300'}`}
    >
      {type}: {count}
    </Badge>
  ));
};

interface ErrorLogPanelProps {
  className?: string;
}

const ErrorLogPanel = ({ className }: ErrorLogPanelProps) => {
  const { total, byType, recent, clearErrors, lastUpdated } = useErrorSummary(4000);

  const hasErrors = total > 0;

  const recentErrors = useMemo(
    () => [...recent].sort((a, b) => b.timestamp - a.timestamp),
    [recent],
  );

  return (
    <Card className={className}>
      <CardHeader className="space-y-2 border-b border-gray-800 bg-gray-900/60">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-white">
            Runtime Error Monitor
          </CardTitle>
          <Badge variant="outline" className="uppercase tracking-wide text-[11px] border-emerald-500/40 text-emerald-200">
            Live feed
          </Badge>
        </div>
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Total captured: {total}</span>
          <span>Updated: {formatTimestamp(lastUpdated)}</span>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          {renderSummaryBadges(byType)}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {hasErrors ? (
          <ScrollArea className="max-h-72">
            <div className="divide-y divide-gray-800">
              {recentErrors.map(error => {
                const context = formatContext(error.context);
                return (
                  <Fragment key={`${error.timestamp}-${error.code}`}>
                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={`border ${ERROR_ACCENTS[error.type]} uppercase tracking-wide text-[10px]`}
                          >
                            {error.type}
                          </Badge>
                          <span className="text-xs font-mono text-slate-400">{error.code}</span>
                        </div>
                        <span className="text-[11px] text-slate-500 font-mono">{formatTimestamp(error.timestamp)}</span>
                      </div>
                      <p className="text-sm text-slate-200 leading-relaxed">{error.message}</p>
                      {context && (
                        <pre className="rounded bg-gray-900/70 border border-gray-800 p-2 text-[11px] text-slate-400 overflow-x-auto">
                          {context}
                        </pre>
                      )}
                    </div>
                  </Fragment>
                );
              })}
            </div>
          </ScrollArea>
        ) : (
          <div className="p-6 text-center text-sm text-slate-400">
            No runtime issues captured yet. Trigger actions in briefing to populate this log.
          </div>
        )}
        <div className="border-t border-gray-800 p-4 flex items-center justify-between bg-gray-900/40">
          <span className="text-xs text-slate-500">Keeping the last 10 errors from the centralized handler.</span>
          <Button variant="outline" size="sm" onClick={clearErrors} disabled={!hasErrors}>
            Clear log
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ErrorLogPanel;
