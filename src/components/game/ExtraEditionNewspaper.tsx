import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Archive } from 'lucide-react';
import FinalEditionLayout from '@/components/game/FinalEditionLayout';
import type { GameOverReport } from '@/types/finalEdition';

interface ExtraEditionNewspaperProps {
  report: GameOverReport;
  onClose: () => void;
  onArchive?: () => void;
  isArchived?: boolean;
}

const ExtraEditionNewspaper = ({ report, onClose, onArchive, isArchived = false }: ExtraEditionNewspaperProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(56,189,248,0.15),_transparent_60%)]" aria-hidden />
      <Card className="relative z-10 flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden border border-emerald-500/40 bg-slate-950/95 shadow-[0_0_65px_rgba(56,189,248,0.25)]">
        <div className="flex items-center justify-between gap-4 border-b border-emerald-500/20 bg-slate-950/90 px-6 py-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.32em] text-emerald-300/80">Extra Edition</p>
            <h2 className="mt-1 text-2xl font-semibold text-emerald-100">Breakdown of Final Operations</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-emerald-200 hover:text-emerald-100"
            onClick={onClose}
            aria-label="Close extra edition"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <FinalEditionLayout report={report} />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-emerald-500/20 bg-slate-950/90 px-6 py-4">
          <div className="text-xs font-mono uppercase tracking-[0.32em] text-emerald-200/70">
            Vol. Final • {new Date(report.recordedAt).toLocaleString()}
          </div>
          {onArchive && (
            <Button
              onClick={onArchive}
              disabled={isArchived}
              className="bg-emerald-500/20 text-emerald-100 hover:bg-emerald-500/30 disabled:opacity-60"
            >
              <Archive className="mr-2 h-4 w-4" />
              {isArchived ? 'Already Archived' : 'Archive to Player Hub'}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ExtraEditionNewspaper;
