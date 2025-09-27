import { Activity, Clock, Newspaper, Target, Trash2, Trophy } from 'lucide-react';
import clsx from 'clsx';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { ArchivedEdition } from '@/hooks/usePressArchive';
import {
  getFactionDisplayName,
  getOppositionDisplayName,
  getOutcomeSummary,
  getPlayerOutcomeLabel,
  getVictoryConditionLabel,
} from '@/utils/finalEdition';

interface PressArchivePanelProps {
  issues: ArchivedEdition[];
  onOpen: (issue: ArchivedEdition) => void;
  onDelete: (id: string) => void;
  className?: string;
}

const formatTimestamp = (timestamp: number): string => {
  try {
    return new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(timestamp));
  } catch {
    const date = new Date(timestamp);
    return `${date.toLocaleDateString()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }
};

const PressArchivePanel = ({ issues, onOpen, onDelete, className }: PressArchivePanelProps) => {
  return (
    <div className={clsx('flex h-full flex-col', className)}>
      <div className="relative mb-4 flex items-center justify-between rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.32em] text-emerald-200/80">Press Archive</p>
          <h3 className="font-mono text-lg font-semibold uppercase tracking-[0.2em] text-emerald-100">Captured Editions</h3>
        </div>
        <Newspaper className="h-6 w-6 text-emerald-300" aria-hidden />
      </div>

      {issues.length === 0 ? (
        <Card className="flex flex-1 flex-col items-center justify-center border border-dashed border-emerald-500/40 bg-emerald-500/5 p-8 text-center">
          <Newspaper className="mb-3 h-10 w-10 text-emerald-300/70" aria-hidden />
          <h4 className="font-mono text-sm uppercase tracking-[0.28em] text-emerald-200/70">No editions archived</h4>
          <p className="mt-2 max-w-sm text-sm text-emerald-100/70">
            Finish a match and press <span className="font-semibold">“Archive to Player Hub”</span> on the victory screen to preserve the final newspaper here.
          </p>
        </Card>
      ) : (
        <ScrollArea className="flex-1 pr-2">
          <div className="space-y-3 pb-4">
            {issues.map(issue => {
              const { report } = issue;
              const mvpName = report.mvp?.cardName ?? report.runnerUp?.cardName ?? 'Unsung Hero';
              const playerOutcome = getPlayerOutcomeLabel(report);
              const victoryLabel = getVictoryConditionLabel(report.victoryType);
              const playerLabel = getFactionDisplayName(report.playerFaction);
              const opponentLabel = getOppositionDisplayName(report.playerFaction);
              const outcomeSummary = getOutcomeSummary(report);
              return (
                <Card
                  key={issue.id}
                  className="relative overflow-hidden border border-emerald-500/30 bg-slate-950/80 p-4 shadow-[0_0_25px_rgba(16,185,129,0.12)]"
                >
                  <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.35),_transparent_60%)]" />
                    <div className="relative flex flex-col gap-3">
                      <div className="flex flex-col gap-1">
                        <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-emerald-300/70">{formatTimestamp(issue.savedAt)}</p>
                        <h4 className="font-mono text-lg font-semibold uppercase tracking-[0.2em] text-emerald-100">
                          {issue.title}
                        </h4>
                      </div>
                      <div className="grid gap-3 text-sm text-emerald-100/80 md:grid-cols-2">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-emerald-300" aria-hidden />
                          <span>
                            {report.rounds > 0 ? `${report.rounds} rounds` : 'Opening Gambit'} · Truth {Math.round(report.finalTruth)}%
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Trophy className="h-4 w-4 text-emerald-300" aria-hidden />
                          <span>{mvpName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-emerald-300" aria-hidden />
                          <span>{playerOutcome} · {victoryLabel}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4 text-emerald-300" aria-hidden />
                          <span>{playerLabel} {Math.round(report.ipPlayer)} · {opponentLabel} {Math.round(report.ipAI)}</span>
                        </div>
                        <div className="flex items-center gap-2 md:col-span-2">
                          <span className="font-mono text-xs uppercase tracking-[0.28em] text-emerald-200/70">Legendary</span>
                          <span>{report.legendaryUsed.length > 0 ? report.legendaryUsed.join(', ') : 'None reported'}</span>
                        </div>
                      </div>
                      <p className="text-xs font-mono uppercase tracking-[0.28em] text-emerald-200/60">{outcomeSummary}</p>
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-emerald-500/40 bg-emerald-500/10 text-emerald-100 hover:bg-emerald-500/20"
                        onClick={() => onOpen(issue)}
                      >
                        Read Edition
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-emerald-200/70 hover:text-emerald-100"
                        onClick={() => onDelete(issue.id)}
                      >
                        <Trash2 className="mr-1 h-4 w-4" aria-hidden />
                        Remove
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};

export default PressArchivePanel;
