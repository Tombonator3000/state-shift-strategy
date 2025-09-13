import React, { useEffect } from "react";
import type { GameCard } from '@/types/cardTypes';
import { useClashWindow } from '@/hooks/useClashWindow';

interface ClashArenaProps {
  isOpen: boolean;
  attackCard?: GameCard;
  defenseCard?: GameCard;
  attacker?: 'human' | 'ai';
  defender?: 'human' | 'ai';
  expiresAt?: number;
  windowMs: number;
  resolveClash: () => void;
  closeClashWindow: () => void;
  playDefensiveCard: (cardId: string) => void;
  hand: GameCard[];
  playerIP: number;
}

function CardView({ card, side, placeholder }: { card?: GameCard; side: "attacker" | "defender"; placeholder?: string }) {
  return (
    <div className={`rounded-2xl border px-3 py-2 min-h-[200px] sm:min-h-[240px] bg-[#111]/92
      ${side === "attacker" ? "border-[#d7263d]" : "border-[#3391ff]"}`}>
      {card ? (
        <div>
          <div className="text-[10px] tracking-wide uppercase opacity-70">{card.type}</div>
          <div className="text-lg sm:text-xl font-extrabold">{card.name}</div>
          <div className="text-[11px] mt-1 opacity-80">Cost: {card.cost}</div>
        </div>
      ) : (
        <div className="text-zinc-500 italic">{placeholder ?? "Waiting..."}</div>
      )}
    </div>
  );
}

export function ClashArena({ 
  isOpen, 
  attackCard, 
  defenseCard, 
  attacker,
  defender,
  expiresAt, 
  windowMs, 
  resolveClash, 
  closeClashWindow, 
  playDefensiveCard, 
  hand, 
  playerIP 
}: ClashArenaProps) {
  // Create engine-like state for the hook
  const engineState = {
    clash: {
      open: isOpen,
      attacker,
      defender,
      attackCard,
      defenseCard,
      expiresAt,
      windowMs
    }
  } as any;

  // Use the clash window hook for proper timer management
  const { msLeft } = useClashWindow(engineState, resolveClash, closeClashWindow, playDefensiveCard);
  
  // Add debugging
  useEffect(() => {
    if (isOpen) {
      console.log(`[Clash] Arena opened - msLeft: ${msLeft}, expiresAt: ${expiresAt}, now: ${Date.now()}`);
    }
  }, [isOpen, msLeft, expiresAt]);
  
  if (!isOpen) return null;

  const pct = Math.max(0, Math.min(100, (msLeft / windowMs) * 100));

  // ✨ Lock scroll/focus while Clash is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black/70 backdrop-blur-sm">
      <div className="w-[min(1100px,96vw)] rounded-3xl border border-zinc-700 shadow-2xl bg-gradient-to-b from-[#1b1a1a] to-[#0e0d0d] p-4 sm:p-6">
        {/* ✨ Tabloid header */}
        <div className="flex items-center justify-between mb-3">
          <div className="text-[13px] sm:text-sm font-black tracking-wider text-white bg-[#d7263d] px-3 py-1 rounded">
            CLASH ARENA
          </div>
          <div className="text-[11px] text-zinc-300">Defender has {Math.ceil(msLeft/1000)}s to respond</div>
        </div>

        {/* Timer */}
        <div className="h-2 rounded bg-zinc-800 overflow-hidden mb-4" aria-label={`Defensive window: ${Math.ceil(msLeft/1000)}s`}>
          <div className="h-full" style={{ width: `${pct}%`, background: "linear-gradient(90deg,#ff3b3b,#ff8a3b)" }} />
        </div>

        {/* Cards against each other */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-4">
          <div>
            <div className="text-[11px] font-bold text-[#ff6161] mb-1">ATTACKER</div>
            <CardView card={attackCard} side="attacker" />
          </div>
          <div className="text-3xl sm:text-4xl font-black select-none">VS</div>
          <div>
            <div className="text-[11px] font-bold text-[#7db7ff] mb-1">DEFENDER</div>
            <CardView card={defenseCard} side="defender" placeholder="Play DEFENSIVE [D]" />
          </div>
        </div>

        {/* Hint line */}
        <div className="mt-3 text-[11px] text-center text-zinc-300">
          Click a <span className="text-[#7db7ff] font-semibold">DEFENSIVE</span> card in your hand or press <kbd className="px-1 py-0.5 border rounded">D</kbd>
        </div>
      </div>
    </div>
  );
}