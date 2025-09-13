import { useEffect, useMemo } from "react";
import type { GameCard } from '@/types/cardTypes';
import { findFirstDefensiveCard } from '@/utils/clashHelpers';

interface ClashManagerProps {
  clashOpen: boolean;
  expiresAt?: number;
  windowMs: number;
  hand: GameCard[];
  playerIP: number;
  onPlayDefensive: (cardId: string) => void;
  onResolveClash: () => void;
  onCloseWindow: () => void;
}

export function useClashManager({
  clashOpen,
  expiresAt,
  windowMs,
  hand,
  playerIP,
  onPlayDefensive,
  onResolveClash,
  onCloseWindow
}: ClashManagerProps) {
  const msLeft = useMemo(() => 
    Math.max(0, (expiresAt ?? 0) - Date.now()), 
    [expiresAt, clashOpen]
  );

  // Timer loop
  useEffect(() => {
    if (!clashOpen || !expiresAt) return;
    
    let raf = 0;
    const tick = () => {
      if (Date.now() >= expiresAt) {
        onResolveClash();
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [clashOpen, expiresAt, onResolveClash]);

  // Hotkey D for defender
  useEffect(() => {
    if (!clashOpen) return;
    
    const handler = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== "d") return;
      e.preventDefault();
      
      const defensiveCard = findFirstDefensiveCard(hand, playerIP);
      if (defensiveCard) {
        onPlayDefensive(defensiveCard.id);
      }
    };
    
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [clashOpen, hand, playerIP, onPlayDefensive]);

  return { msLeft };
}