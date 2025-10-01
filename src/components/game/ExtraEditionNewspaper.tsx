import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Archive } from 'lucide-react';
import FinalEditionLayout from '@/components/game/FinalEditionLayout';
import { cn } from '@/lib/utils';
import {
  NEWSPAPER_BODY_CLASS,
  NEWSPAPER_CARD_CLASS,
  NEWSPAPER_HEADER_CLASS,
  NEWSPAPER_META_CLASS,
} from '@/components/game/newspaperLayout';
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
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(15,118,110,0.12),_transparent_60%)]" aria-hidden />
      <Card className={cn(NEWSPAPER_CARD_CLASS, 'relative z-10')}>
        <div className={`${NEWSPAPER_HEADER_CLASS} flex items-center justify-between gap-4`}>
          <div>
            <p className={NEWSPAPER_META_CLASS}>Extra Edition</p>
            <h2 className="mt-1 text-2xl font-black uppercase tracking-[0.18em] text-newspaper-headline">
              Breakdown of Final Operations
            </h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full border-2 border-newspaper-text/40 bg-newspaper-bg/40 text-newspaper-text transition hover:bg-newspaper-bg"
            onClick={onClose}
            aria-label="Close extra edition"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className={NEWSPAPER_BODY_CLASS}>
          <FinalEditionLayout report={report} />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t-4 border-newspaper-border bg-newspaper-header/90 px-6 py-4 text-newspaper-text">
          <div className={NEWSPAPER_META_CLASS}>
            Vol. Final • {new Date(report.recordedAt).toLocaleString()}
          </div>
          {onArchive && (
            <Button
              onClick={onArchive}
              disabled={isArchived}
              className="border border-dashed border-newspaper-border/70 bg-newspaper-bg/70 text-newspaper-text transition hover:bg-white/80 hover:text-newspaper-headline disabled:opacity-60"
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
