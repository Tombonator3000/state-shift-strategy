import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Newspaper, Trophy, Sparkles } from 'lucide-react';
import EndCredits from '@/components/game/EndCredits';
import FinalEditionLayout from '@/components/game/FinalEditionLayout';
import GameOverEditionLayout from '@/components/game/GameOverEditionLayout';
import type { GameOverReport } from '@/types/finalEdition';
import { getVictoryConditionLabel } from '@/utils/finalEdition';

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-6">
      <GameOverEditionLayout
        bannerLabel={bannerLabel}
        bannerIcon={isVictory ? <Trophy className="h-6 w-6" /> : <Sparkles className="h-6 w-6" />}
        kicker={victoryDetail}
        metaLine={`Final Campaign Report • ${editionDate}`}
        tagline={tagline}
        onClose={onClose}
        footer={(
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap justify-center gap-2 md:justify-start">
              <Button
                onClick={onViewFinalEdition}
                className="border border-newspaper-border bg-newspaper-bg/90 text-newspaper-text transition hover:bg-white/80 hover:text-newspaper-headline"
              >
                <Newspaper className="mr-2 h-4 w-4" />
                Read Final Newspaper
              </Button>
              {onArchive && (
                <Button
                  onClick={onArchive}
                  disabled={isArchived}
                  variant="outline"
                  className="border border-dashed border-newspaper-border/70 bg-newspaper-bg/70 text-newspaper-text transition hover:bg-white/80 hover:text-newspaper-headline disabled:opacity-60"
                >
                  {isArchived ? 'Archived' : 'Archive to Player Hub'}
                </Button>
              )}
            </div>
            <div className="flex flex-wrap justify-center gap-2 md:justify-end">
              <Button
                variant="ghost"
                className="text-newspaper-text/80 transition hover:text-newspaper-text"
                onClick={() => setShowCredits(true)}
              >
                Roll Credits
              </Button>
              <Button
                variant="secondary"
                className="border border-newspaper-border bg-newspaper-bg/90 text-newspaper-text transition hover:bg-white/80 hover:text-newspaper-headline"
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
