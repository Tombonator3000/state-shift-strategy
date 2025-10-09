import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import FinalEditionLayout from '@/components/game/FinalEditionLayout';
import type { GameOverReport } from '@/types/finalEdition';
import { cn } from '@/lib/utils';

interface NewspaperInsidePagesProps {
  report: GameOverReport;
  currentPage: 'mvp-breakdown' | 'key-events' | 'full-analysis';
  onBackToFront: () => void;
  isVictory: boolean;
}

const NewspaperInsidePages = ({ report, currentPage, onBackToFront, isVictory }: NewspaperInsidePagesProps) => {
  const pageNumberMap = {
    'mvp-breakdown': 'PAGE 2-3',
    'key-events': 'PAGE 4-5',
    'full-analysis': 'PAGE 6-9',
  };

  const pageNumber = pageNumberMap[currentPage];
  const layoutVariant = isVictory ? 'victory' : 'default';
  
  const headerClass = isVictory
    ? 'border-emerald-300/50 bg-gradient-to-br from-emerald-500/25 via-emerald-600/20 to-emerald-700/25 text-emerald-50'
    : 'border-newspaper-border/60 bg-white/90 text-newspaper-text';

  const buttonClass = isVictory
    ? 'border-emerald-200/80 bg-emerald-500/25 text-emerald-50 hover:bg-emerald-400/30 hover:text-emerald-950'
    : 'border-newspaper-border bg-newspaper-bg/90 text-newspaper-text hover:bg-white/80 hover:text-newspaper-headline';

  return (
    <div className="newspaper-inside-pages space-y-4">
      <header className={cn('flex items-center justify-between rounded-xl border p-4 shadow-sm', headerClass)}>
        <Button
          onClick={onBackToFront}
          variant="ghost"
          size="sm"
          className={cn('gap-2', buttonClass)}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Front Page
        </Button>
        <div className="font-mono text-sm font-bold uppercase tracking-[0.3em]">
          {pageNumber}
        </div>
      </header>

      <div className="rounded-2xl border border-newspaper-border/60 bg-white/85 p-4 shadow-lg">
        <FinalEditionLayout report={report} />
      </div>
    </div>
  );
};

export default NewspaperInsidePages;
