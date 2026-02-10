/**
 * TurnLockOverlay — shows "Waiting for [player]..." when it's not the
 * local player's turn in online multiplayer.
 *
 * The overlay is semi-transparent so the player can still view the board
 * and click locations for info (spectator mode), but blocks gameplay actions.
 */

interface TurnLockOverlayProps {
  /** Name of the player whose turn it is */
  currentPlayerName: string;
  /** Whether to show the overlay */
  visible: boolean;
}

export function TurnLockOverlay({ currentPlayerName, visible }: TurnLockOverlayProps) {
  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pointer-events-none"
      aria-live="polite"
    >
      <div className="mt-4 pointer-events-auto bg-black/80 backdrop-blur-sm border border-newspaper-text/30 px-6 py-3 font-mono text-sm text-white/90 shadow-lg flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
        <span>
          Waiting for <strong className="text-yellow-300">{currentPlayerName}</strong>...
        </span>
        <span className="text-white/40 text-xs">(spectator mode)</span>
      </div>
    </div>
  );
}
