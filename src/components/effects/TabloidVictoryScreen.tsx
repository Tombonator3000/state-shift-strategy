import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Newspaper, Trophy, Sparkles } from 'lucide-react';
import EndCredits from '@/components/game/EndCredits';
import FinalEditionLayout from '@/components/game/FinalEditionLayout';
import GameOverEditionLayout from '@/components/game/GameOverEditionLayout';
import type { GameOverReport } from '@/types/finalEdition';
import { getVictoryConditionLabel } from '@/utils/finalEdition';
import { cn } from '@/lib/utils';

interface TabloidVictoryScreenProps {
  isVisible: boolean;
  report: GameOverReport | null;
  playerFaction: 'truth' | 'government';
  victoryType: 'states' | 'ip' | 'truth' | 'agenda' | null;
  onClose: () => void;
  onMainMenu: () => void;
  onViewFinalEdition: () => void;
  onArchive?: () => void;
  isArchived?: boolean;
}

const TabloidVictoryScreen = ({
  isVisible,
  report,
  playerFaction,
  victoryType,
  onClose,
  onMainMenu,
  onViewFinalEdition,
  onArchive,
  isArchived = false,
}: TabloidVictoryScreenProps) => {
  const [showCredits, setShowCredits] = useState(false);

  if (!isVisible || !report) {
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

  const isVictory = report.winner === report.playerFaction;
  const layoutVariant = isVictory ? 'victory' : 'default';
  const bannerLabel = report.winner === 'draw'
    ? 'Stalemate'
    : isVictory
      ? 'Victory'
      : 'Defeat';
  const victoryDetail = victoryType
    ? getVictoryConditionLabel(victoryType).toUpperCase()
    : report.victoryType
      ? getVictoryConditionLabel(report.victoryType).toUpperCase()
      : 'FINAL REPORT';
  const editionDate = new Date(report.recordedAt).toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  const tagline = [
    report.rounds > 0 ? `${report.rounds} rounds` : 'Lightning opener',
    `Truth ${Math.round(report.finalTruth)}%`,
  ].join(' • ');

  const readEditionButtonClass = isVictory
    ? 'border border-emerald-200/80 bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 text-emerald-950 font-semibold shadow-[0_18px_48px_rgba(16,185,129,0.35)] transition-colors hover:from-emerald-300 hover:via-emerald-400 hover:to-emerald-500 hover:text-emerald-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-200'
    : 'border border-newspaper-border bg-newspaper-bg/90 text-newspaper-text transition hover:bg-white/80 hover:text-newspaper-headline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-newspaper-border/60';

  const archiveButtonClass = isVictory
    ? 'border border-dashed border-emerald-200/70 bg-emerald-500/15 text-emerald-100 transition-colors hover:bg-emerald-400/20 hover:text-emerald-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-200 disabled:border-emerald-200/40 disabled:bg-emerald-500/10 disabled:text-emerald-100/60'
    : 'border border-dashed border-newspaper-border/70 bg-newspaper-bg/70 text-newspaper-text transition hover:bg-white/80 hover:text-newspaper-headline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-newspaper-border/60 disabled:opacity-60';

  const creditsButtonClass = isVictory
    ? 'text-emerald-100/80 transition hover:text-emerald-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-200'
    : 'text-newspaper-text/80 transition hover:text-newspaper-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-newspaper-border/60';

  const menuButtonClass = isVictory
    ? 'border border-emerald-200/80 bg-emerald-500/25 text-emerald-50 transition-colors hover:bg-emerald-400/30 hover:text-emerald-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-200'
    : 'border border-newspaper-border bg-newspaper-bg/90 text-newspaper-text transition hover:bg-white/80 hover:text-newspaper-headline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-newspaper-border/60';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-6">
      <GameOverEditionLayout
        bannerLabel={bannerLabel}
        bannerIcon={isVictory ? <Trophy className="h-6 w-6" /> : <Sparkles className="h-6 w-6" />}
        kicker={victoryDetail}
        metaLine={`Final Campaign Report • ${editionDate}`}
        tagline={tagline}
        onClose={onClose}
        variant={layoutVariant}
        footer={(
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap justify-center gap-2 md:justify-start">
              <Button
                onClick={onViewFinalEdition}
                className={cn(readEditionButtonClass)}
              >
                <Newspaper className="mr-2 h-4 w-4" />
                Read Final Newspaper
              </Button>
              {onArchive && (
                <Button
                  onClick={onArchive}
                  disabled={isArchived}
                  variant="outline"
                  className={cn(archiveButtonClass)}
                >
                  {isArchived ? 'Archived' : 'Archive to Player Hub'}
                </Button>
              )}
            </div>
            <div className="flex flex-wrap justify-center gap-2 md:justify-end">
              <Button
                variant="ghost"
                className={cn(creditsButtonClass)}
                onClick={() => setShowCredits(true)}
              >
                Roll Credits
              </Button>
              <Button
                variant="secondary"
                className={cn(menuButtonClass)}
                onClick={onMainMenu}
              >
                Return to Menu
              </Button>
            </div>
          </div>
        )}
      >
        <FinalEditionLayout report={report} />
      </GameOverEditionLayout>
    </div>
  );
};

export default TabloidVictoryScreen;
