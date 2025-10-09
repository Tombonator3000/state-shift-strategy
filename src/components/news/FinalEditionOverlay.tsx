import { useMemo, useState } from 'react';
import { Trophy, Sparkles, Newspaper } from 'lucide-react';

import { Button } from '@/components/ui/button';
import EndCredits from '@/components/game/EndCredits';
import GameOverEditionLayout from '@/components/game/GameOverEditionLayout';
import NewspaperFrontPage from '@/components/news/NewspaperFrontPage';
import NewspaperInsidePages from '@/components/news/NewspaperInsidePages';
import type { GameOverReport } from '@/types/finalEdition';
import type { FinalEdition } from '@/news/headlineEngine';
import { getVictoryConditionLabel } from '@/utils/finalEdition';
import { cn } from '@/lib/utils';

interface FinalEditionOverlayProps {
  isVisible: boolean;
  edition: FinalEdition | null;
  report: GameOverReport | null;
  playerFaction: 'truth' | 'government';
  victoryType: 'states' | 'ip' | 'truth' | 'agenda' | null;
  onContinue: () => void;
  onRestart: () => void;
  onViewFinalEdition: () => void;
  onArchive?: () => void;
  isArchived?: boolean;
}

const toneHeadlineClass: Record<FinalEdition['article']['tone'], string> = {
  truth: 'text-truth-red',
  government: 'text-government-blue',
  draw: 'text-newspaper-headline',
};

const toneBadgeClass: Record<FinalEdition['article']['tone'], string> = {
  truth: 'border-truth-red/60 bg-truth-red/10 text-truth-red',
  government: 'border-government-blue/60 bg-government-blue/10 text-government-blue',
  draw: 'border-newspaper-border/60 bg-newspaper-bg/70 text-newspaper-headline',
};

const dominantFactionLabel = (edition: FinalEdition): string => {
  switch (edition.dominantFaction) {
    case 'truth':
      return 'Truth Operatives Secure Headlines';
    case 'government':
      return 'Government Briefing Controls Narrative';
    default:
      return 'Gridlocked Media Duel Continues';
  }
};

const FinalEditionArticle = ({ edition, isVictory }: { edition: FinalEdition; isVictory: boolean }) => {
  const tone = edition.article.tone;
  const badgeClass = toneBadgeClass[tone];
  const headlineClass = isVictory
    ? 'text-victory-accent drop-shadow-[0_3px_16px_rgba(15,118,110,0.55)]'
    : toneHeadlineClass[tone];
  const bodyClass = isVictory ? 'text-emerald-50/85' : 'text-newspaper-text/80';
  const panelClass = isVictory
    ? 'border-emerald-300/50 bg-gradient-to-br from-emerald-500/25 via-emerald-600/20 to-emerald-700/25 text-emerald-50 shadow-[0_18px_48px_rgba(16,185,129,0.35)]'
    : 'border-newspaper-border/60 bg-white/80 text-newspaper-text shadow-sm';

  return (
    <article className={cn('flex h-full flex-col gap-4 rounded-2xl border p-4 transition-colors', panelClass)}>
      <header className="space-y-2">
        <div className={cn('inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.45em]', badgeClass)}>
          {dominantFactionLabel(edition)}
        </div>
        <h3 className={cn('font-headline text-3xl uppercase tracking-tight', headlineClass)}>{edition.article.hed}</h3>
        {edition.article.dek ? (
          <p className={cn('text-base italic', bodyClass)}>{edition.article.dek}</p>
        ) : null}
      </header>

      {edition.article.bullets.length > 0 ? (
        <ul className={cn('space-y-2 rounded-xl border px-4 py-3 text-sm leading-snug', isVictory ? 'border-emerald-300/40 bg-emerald-500/10 text-emerald-50/85' : 'border-newspaper-border/60 bg-newspaper-bg/70 text-newspaper-text/80')}>
          {edition.article.bullets.slice(0, 5).map((bullet, index) => (
            <li key={`${index}-${bullet.slice(0, 20)}`} className="list-disc pl-2">
              {bullet}
            </li>
          ))}
        </ul>
      ) : null}

      <footer className="grid gap-3 sm:grid-cols-2">
        <div className={cn('rounded-xl border px-4 py-3 text-xs uppercase tracking-[0.3em]', isVictory ? 'border-emerald-300/40 bg-emerald-500/10 text-emerald-100/80' : 'border-newspaper-border/50 bg-newspaper-bg/60 text-newspaper-text/70')}>
          <div>{edition.article.byline}</div>
          <div>{edition.article.source}</div>
        </div>
        <div className={cn('rounded-xl border px-4 py-3 text-sm leading-snug', isVictory ? 'border-emerald-300/40 bg-emerald-500/10 text-emerald-50/85' : 'border-newspaper-border/60 bg-newspaper-bg/70 text-newspaper-text/80')}>
          <div className="text-[10px] font-semibold uppercase tracking-[0.4em] opacity-80">Weather Bureau</div>
          <p className="mt-1 leading-snug">{edition.weather}</p>
        </div>
      </footer>

      {edition.ads.length > 0 ? (
        <div className={cn('rounded-xl border px-4 py-3 text-sm leading-snug', isVictory ? 'border-emerald-300/40 bg-emerald-500/10 text-emerald-50/80' : 'border-newspaper-border/60 bg-newspaper-bg/70 text-newspaper-text/80')}>
          <div className="text-[10px] font-semibold uppercase tracking-[0.4em] opacity-75">Classified Dispatch</div>
          <ul className="mt-2 space-y-1">
            {edition.ads.slice(0, 3).map((ad, index) => (
              <li key={`${index}-${ad.slice(0, 24)}`} className="flex items-start gap-2">
                <span className={cn('mt-1 h-1.5 w-1.5 shrink-0 rounded-full', isVictory ? 'bg-emerald-300/80' : 'bg-newspaper-headline/70')} />
                <span>{ad}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </article>
  );
};

const FinalEditionOverlay = ({
  isVisible,
  edition,
  report,
  playerFaction,
  victoryType,
  onContinue,
  onRestart,
  onViewFinalEdition,
  onArchive,
  isArchived = false,
}: FinalEditionOverlayProps) => {
  const [showCredits, setShowCredits] = useState(false);
  const [currentPage, setCurrentPage] = useState<'front' | 'mvp-breakdown' | 'key-events' | 'full-analysis'>('front');

  const derivedVictoryType = useMemo(() => {
    if (victoryType) {
      return getVictoryConditionLabel(victoryType).toUpperCase();
    }
    if (report?.victoryType) {
      return getVictoryConditionLabel(report.victoryType).toUpperCase();
    }
    return 'FINAL REPORT';
  }, [report, victoryType]);

  if (!isVisible || !edition || !report) {
    return null;
  }

  if (showCredits) {
    return (
      <EndCredits
        isVisible
        playerFaction={playerFaction}
        onClose={() => setShowCredits(false)}
      />
    );
  }

  const isDraw = report.winner === 'draw';
  const isVictory = report.winner === report.playerFaction;

  if (currentPage === 'front') {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/90 p-0">
        <NewspaperFrontPage
          report={report}
          onNavigateToPage={(page) => setCurrentPage(page as typeof currentPage)}
        />
        <div className="fixed bottom-0 left-0 right-0 flex flex-wrap justify-center gap-3 bg-black/90 p-4 backdrop-blur-sm">
          <Button onClick={onContinue} className="border border-white/80 bg-white font-semibold text-black hover:bg-white/90">
            Continue
          </Button>
          <Button onClick={onRestart} className="border border-white/60 bg-black/50 text-white hover:bg-black/70">
            Return to Menu
          </Button>
          {onArchive ? (
            <Button
              onClick={onArchive}
              disabled={isArchived}
              variant="outline"
              className="border-dashed"
            >
              {isArchived ? 'Archived' : 'Archive to Player Hub'}
            </Button>
          ) : null}
          <Button variant="ghost" className="text-white/80 hover:text-white" onClick={() => setShowCredits(true)}>
            Roll Credits
          </Button>
        </div>
      </div>
    );
  }

  // Inside pages view
  return (
    <div className="fixed inset-0 z-50 bg-slate-950">
      <NewspaperInsidePages
        report={report}
        currentPage={currentPage}
        onBackToFront={() => setCurrentPage('front')}
        isVictory={isVictory}
      />
      <div className="fixed bottom-0 left-0 right-0 flex flex-wrap justify-center gap-3 bg-black/95 p-4 backdrop-blur-sm">
        <Button onClick={() => setCurrentPage('front')} className="border border-white/80 bg-white font-semibold text-black hover:bg-white/90">
          Back to Front Page
        </Button>
        <Button onClick={onContinue} className="border border-white/60 bg-black/50 text-white hover:bg-black/70">
          Continue
        </Button>
        <Button onClick={onRestart} className="border border-white/60 bg-black/50 text-white hover:bg-black/70">
          Return to Menu
        </Button>
        {onArchive ? (
          <Button
            onClick={onArchive}
            disabled={isArchived}
            variant="outline"
            className="border-dashed text-white"
          >
            {isArchived ? 'Archived' : 'Archive to Player Hub'}
          </Button>
        ) : null}
        <Button variant="ghost" className="text-white/80 hover:text-white" onClick={() => setShowCredits(true)}>
          Roll Credits
        </Button>
      </div>
    </div>
  );
};


export default FinalEditionOverlay;

