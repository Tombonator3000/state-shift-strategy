import type { WinnerResult } from "../hooks/useGameEngine";

export const WinnerBanner = ({ winner }: { winner: WinnerResult }) => {
  if (!winner.winner) return null;
  return (
    <div className="winner-banner">
      <strong>Winner:</strong> {winner.winner} · Reason: {winner.reason}
    </div>
  );
};
