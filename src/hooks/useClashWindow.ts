import { useEffect, useMemo } from "react";
import { EngineState, Card, PlayerID } from "@/engine/types";
import { resolveClash, closeReactionWindow } from "@/engine/reaction";

declare function firstPlayableDefensive(player: PlayerID): Card | undefined;
declare function playDefensive(player: PlayerID, card: Card): void;

export function useClashWindow(engine: EngineState) {
  const { clash, phase } = engine;
  const msLeft = useMemo(() => Math.max(0, (clash.expiresAt ?? 0) - Date.now()), [clash.expiresAt, phase]);

  // Timer loop
  useEffect(() => {
    if (!clash.open) return;
    let raf = 0;
    const tick = () => {
      if (!engine.clash.open) return;
      if (Date.now() >= (engine.clash.expiresAt ?? 0)) {
        closeReactionWindow(engine);
        resolveClash(engine);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [engine, clash.open, clash.expiresAt]);

  // Hotkey D for defender
  useEffect(() => {
    if (!clash.open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== "d") return;
      const def = firstPlayableDefensive(engine.clash.defender!);
      if (def) playDefensive(engine.clash.defender!, def);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [engine, clash.open, clash.defender]);

  return { msLeft };
}