import React from "react";
import { Card, EngineState } from "@/engine/types";
import { useClashWindow } from "@/hooks/useClashWindow";

function CardView({ card, side, placeholder }: { card?: Card; side: "attacker" | "defender"; placeholder?: string }) {
  return (
    <div className={`rounded-2xl border p-3 min-h-[220px] bg-zinc-900/70 ${side === "attacker" ? "border-red-500/60" : "border-blue-500/60"}`}>
      {card ? (
        <div>
          <div className="text-sm opacity-70">{card.type}</div>
          <div className="text-xl font-bold">{card.name}</div>
          <div className="text-xs mt-2 opacity-80">Cost: {card.cost}</div>
          {/* Optional: effect summary */}
        </div>
      ) : (
        <div className="text-zinc-500 italic">{placeholder ?? "Waiting..."}</div>
      )}
    </div>
  );
}

export function ClashArena({ engine }: { engine: EngineState }) {
  const { clash } = engine;
  const { msLeft } = useClashWindow(engine);
  if (!clash.open) return null;

  const pct = Math.max(0, Math.min(100, ((msLeft / clash.windowMs) * 100) | 0));

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black/60 backdrop-blur-sm">
      <div className="w-[min(1100px,95vw)] bg-zinc-950/95 rounded-3xl p-5 border border-zinc-700 shadow-2xl">
        {/* Timer */}
        <div className="h-2 bg-zinc-800 rounded mb-4 overflow-hidden" aria-label={`Defensive window: ${Math.ceil(msLeft / 1000)}s`}>
          <div className="h-full bg-red-500 transition-all" style={{ width: `${pct}%` }} />
        </div>

        {/* Cards against each other */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
          <CardView card={clash.attackCard} side="attacker" />
          <div className="text-4xl font-black select-none">VS</div>
          <CardView card={clash.defenseCard} side="defender" placeholder="Play DEFENSIVE [D]" />
        </div>

        {/* Result banner rendered by engine after resolve (can be shown via toast/log) */}
      </div>
    </div>
  );
}