import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Newspaper, Trophy, Sparkles } from 'lucide-react';
import EndCredits from '@/components/game/EndCredits';
import FinalEditionLayout from '@/components/game/FinalEditionLayout';
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.25),_transparent_60%)]" aria-hidden />
      <Card className="relative z-10 flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden border border-emerald-500/40 bg-slate-950/95 shadow-[0_0_65px_rgba(16,185,129,0.25)]">
        <div className="flex items-start justify-between gap-4 border-b border-emerald-500/20 bg-slate-950/90 px-6 py-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.32em] text-emerald-300/80">{victoryDetail}</p>
            <h2 className="mt-1 flex items-center gap-2 text-2xl font-semibold text-emerald-100">
              {isVictory ? <Trophy className="h-5 w-5 text-emerald-300" /> : <Sparkles className="h-5 w-5 text-emerald-300" />}
              {bannerLabel}
            </h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-emerald-200 hover:text-emerald-100"
            onClick={onClose}
            aria-label="Close victory report"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <FinalEditionLayout report={report} />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-emerald-500/20 bg-slate-950/90 px-6 py-4">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={onViewFinalEdition}
              className="bg-emerald-500/20 text-emerald-100 hover:bg-emerald-500/30"
            >
              <Newspaper className="mr-2 h-4 w-4" />
              Read Final Newspaper
            </Button>
            {onArchive && (
              <Button
                onClick={onArchive}
                disabled={isArchived}
                variant="outline"
                className="border-emerald-500/40 text-emerald-200 hover:bg-emerald-500/10 disabled:opacity-60"
              >
                {isArchived ? 'Archived' : 'Archive to Player Hub'}
              </Button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="ghost"
              className="text-emerald-200 hover:text-emerald-100"
              onClick={() => setShowCredits(true)}
            >
              Roll Credits
            </Button>
            <Button
              variant="secondary"
              className="bg-emerald-500/20 text-emerald-100 hover:bg-emerald-500/30"
              onClick={onMainMenu}
            >
              Return to Menu
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TabloidVictoryScreen;
