import { useEffect, useRef } from "react";
import { EngineState, PlayerID, Card } from "@/engine/types";
import type { GameCard } from '@/types/cardTypes';

export function useClashWindow(engine: EngineState, resolveClash: () => void, closeClashWindow: () => void, playDefensiveCard: (cardId: string) => void) {
  const rafRef = useRef(0);
  const hardTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    // Start when Clash opens
    if (!engine.clash.open) return;

    // ✨ Hard safety timeout (fallback) 6s – whatever happens
    hardTimeoutRef.current = window.setTimeout(() => {
      if (!engine.clash.open) return;
      try {
        console.log("[Clash] Hard timeout - force resolving");
        closeClashWindow();
        resolveClash();
      } catch (e) { 
        console.error("[Clash] hard-timeout resolve error:", e); 
      }
    }, (engine.clash.windowMs ?? 4000) + 2000);

    const tick = () => {
      if (!engine.clash.open) return; // stop
      const now = Date.now();
      if ((engine.clash.expiresAt ?? 0) <= now) {
        // Timer out → close and resolve
        try {
          closeClashWindow();
          resolveClash();
        } catch (e) {
          console.error("[Clash] resolve error:", e);
        }
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      // ✨ Always clean up
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (hardTimeoutRef.current) window.clearTimeout(hardTimeoutRef.current);
      rafRef.current = 0;
      hardTimeoutRef.current = null;
    };
  }, [engine.clash.open, engine.clash.expiresAt, engine.clash.windowMs, resolveClash, closeClashWindow]);

  // Hotkey D for defender  
  useEffect(() => {
    if (!engine.clash.open || engine.clash.defender !== 'human') return;
    
    const handler = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== "d") return;
      
      // Find first playable defensive in hand
      const hand = (engine as any).hand || []; // Access hand from engine context
      const defensiveCard = hand.find((card: GameCard) => 
        card.type === "DEFENSIVE" && 
        (engine as any).ip >= card.cost // Check if player can afford it
      );
      
      if (defensiveCard) {
        playDefensiveCard(defensiveCard.id);
      }
    };
    
    window.addEventListener("keydown", handler, { passive: true });
    return () => window.removeEventListener("keydown", handler);
  }, [engine.clash.open, engine.clash.defender, playDefensiveCard]);

  return {
    // msLeft used in UI – robust against drift
    get msLeft() {
      return Math.max(0, (engine.clash.expiresAt ?? 0) - Date.now());
    }
  };
}