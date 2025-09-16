import React from "react";
import type { GameCard } from '@/types/cardTypes';
import { useClashManager } from '@/hooks/useClashManager';

interface ClashArenaProps {
  isOpen: boolean;
  attackCard?: GameCard;
  defenseCard?: GameCard;
  expiresAt?: number;
  windowMs: number;
  hand: GameCard[];
  playerIP: number;
  onPlayDefensive: (cardId: string) => void;
  onResolveClash: () => void;
  onCloseWindow: () => void;
}

function CardView({ card, side, placeholder }: { card?: GameCard; side: "attacker" | "defender"; placeholder?: string }) {
  return (
    <div className={`rounded-2xl border p-3 min-h-[220px] bg-zinc-900/70 ${side === "attacker" ? "border-red-500/60" : "border-blue-500/60"}`}>
      {card ? (
        <div>
          <div className="text-sm opacity-70">{card.type}</div>
          <div className="text-xl font-bold">{card.name}</div>
          <div className="text-xs mt-2 opacity-80">Cost: {card.cost}</div>
          <div className="text-xs mt-1 opacity-60 max-w-[200px] truncate">{card.flavorTruth || card.text}</div>
        </div>
      ) : (
        <div className="text-zinc-500 italic">{placeholder ?? "Waiting..."}</div>
      )}
    </div>
  );
}

export function ClashArenaIntegrated({ 
  isOpen, 
  attackCard, 
  defenseCard, 
  expiresAt, 
  windowMs, 
  hand, 
  playerIP, 
  onPlayDefensive, 
  onResolveClash, 
  onCloseWindow 
}: ClashArenaProps) {
  const { msLeft } = useClashManager({
    clashOpen: isOpen,
    expiresAt,
    windowMs,
    hand,
    playerIP,
    onPlayDefensive,
    onResolveClash,
    onCloseWindow
  });

  if (!isOpen) return null;

  const pct = Math.max(0, Math.min(100, ((msLeft / windowMs) * 100) | 0));
  const secondsLeft = Math.ceil(msLeft / 1000);

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black/60 backdrop-blur-sm">
      <div className="w-[min(1100px,95vw)] bg-zinc-950/95 rounded-3xl p-5 border border-zinc-700 shadow-2xl">
        
        {/* Header */}
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold text-red-400">⚔️ CLASH ARENA ⚔️</h2>
          <p className="text-sm text-zinc-400">Defender has {secondsLeft}s to respond</p>
        </div>

        {/* Timer */}
        <div className="h-2 bg-zinc-800 rounded mb-4 overflow-hidden" aria-label={`Defensive window: ${secondsLeft}s`}>
          <div className="h-full bg-red-500 transition-all duration-100" style={{ width: `${pct}%` }} />
        </div>

        {/* Cards against each other */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
          <div>
            <div className="text-center text-red-400 font-semibold mb-2">ATTACKER</div>
            <CardView card={attackCard} side="attacker" />
          </div>
          
          <div className="text-4xl font-black select-none text-zinc-400">VS</div>
          
          <div>
            <div className="text-center text-blue-400 font-semibold mb-2">DEFENDER</div>
            <CardView card={defenseCard} side="defender" placeholder="Play DEFENSIVE [D]" />
          </div>
        </div>

        {/* Instructions */}
        <div className="text-center mt-4 text-sm text-zinc-400">
          {!defenseCard && (
            <>
              <p>Click a DEFENSIVE card in your hand or press <kbd className="bg-zinc-800 px-2 py-1 rounded text-blue-400">D</kbd></p>
              <p className="text-xs mt-1">Defensive cards are highlighted in blue</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}