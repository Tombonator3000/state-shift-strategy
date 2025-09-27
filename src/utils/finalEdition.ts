import type { GameOverReport } from '@/types/finalEdition';

export const getFactionDisplayName = (faction: 'truth' | 'government'): string => {
  return faction === 'truth' ? 'Truth Network' : 'Shadow Government';
};

export const getOppositionDisplayName = (playerFaction: 'truth' | 'government'): string => {
  return getFactionDisplayName(playerFaction === 'truth' ? 'government' : 'truth');
};

export const getVictoryConditionLabel = (
  victoryType: GameOverReport['victoryType'],
): string => {
  switch (victoryType) {
    case 'truth':
      return 'Truth Threshold';
    case 'states':
      return 'State Sweep';
    case 'ip':
      return 'IP Race';
    case 'agenda':
      return 'Secret Agenda';
    case 'draw':
    default:
      return 'Final Edition';
  }
};

export const getPlayerOutcomeLabel = (
  report: GameOverReport,
): 'Victory' | 'Defeat' | 'Stalemate' => {
  if (report.winner === 'draw') {
    return 'Stalemate';
  }

  return report.winner === report.playerFaction ? 'Victory' : 'Defeat';
};

export const getOutcomeSummary = (report: GameOverReport): string => {
  if (report.winner === 'draw') {
    return 'Stalemate';
  }

  const victorLabel = getFactionDisplayName(report.winner);
  const condition = getVictoryConditionLabel(report.victoryType);
  return `${victorLabel} · ${condition}`;
};
