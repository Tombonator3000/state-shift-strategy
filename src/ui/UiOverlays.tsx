import React from "react";

type AnyCard = {
  id: string;
  name: string;
  faction?: string;
  type?: string;
  rarity?: string;
  cost?: number;
  flavor?: string;
  effects?: any;
};

type Toast = { id: number; text: string; slot: "truth" | "ip-left" | "ip-right" };

declare global {
  interface Window {
    uiShowOpponentCard?: (card: AnyCard) => void;
    uiToastTruth?: (delta: number) => void;
    uiToastIp?: (playerId: "P1" | "P2", delta: number) => void;
    uiFlashState?: (stateId: string, by: "P1" | "P2") => void; // placeholder for future prompts
  }
}

export default function UiOverlays() {
  const [revealCard, setRevealCard] = React.useState<AnyCard | null>(null);
  const revealTimer = React.useRef<number | null>(null);

  const [toasts, setToasts] = React.useState<Toast[]>([]);

  React.useEffect(() => {
    window.uiShowOpponentCard = (card: AnyCard) => {
      try {
        if (revealTimer.current) {
          window.clearTimeout(revealTimer.current);
        }
      } catch {
        // no-op
      }
      setRevealCard(card);
      revealTimer.current = window.setTimeout(() => setRevealCard(null), 1400);
    };

    window.uiToastTruth = (delta: number) => {
      const id = Date.now() + Math.random();
      setToasts((t) => [
        ...t,
        { id, text: `${delta > 0 ? "+" : ""}${delta}% Truth`, slot: "truth" },
      ]);
      window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 900);
    };

    window.uiToastIp = (playerId: "P1" | "P2", delta: number) => {
      const id = Date.now() + Math.random();
      const slot = playerId === "P1" ? "ip-left" : "ip-right";
      setToasts((t) => [
        ...t,
        { id, text: `${delta > 0 ? "+" : ""}${delta} IP`, slot },
      ]);
      window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 900);
    };

    window.uiFlashState = (stateId: string, by: "P1" | "P2") => {
      const el =
        document.querySelector(`[data-state="${stateId}"]`) ||
        document.getElementById(`state-${stateId}`) ||
        document.querySelector(`[data-usps="${stateId}"]`);

      if (el) {
        el.classList.add("capture-glow");
        window.setTimeout(() => el.classList.remove("capture-glow"), 900);
      } else {
        const id = Date.now() + Math.random();
        const text = `Captured ${stateId}`;
        setToasts((t) => [...t, { id, text, slot: "truth" }]);
        window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 1100);
      }
    };

    return () => {
      delete window.uiShowOpponentCard;
      delete window.uiToastTruth;
      delete window.uiToastIp;
      delete window.uiFlashState;
    };
  }, []);

  function renderEffects(card: AnyCard) {
    const eff = card?.effects || {};
    if (card?.type === "ATTACK" && eff?.ipDelta?.opponent) {
      const d = eff.ipDelta.opponent;
      const disc = eff.discardOpponent ? ` · discard ${eff.discardOpponent}` : "";
      return `Opponent −${d} IP${disc}`;
    }
    if (card?.type === "MEDIA" && typeof eff?.truthDelta === "number") {
      const d = eff.truthDelta;
      return `Truth ${d > 0 ? "+" : ""}${d}%`;
    }
    if (card?.type === "ZONE" && typeof eff?.pressureDelta === "number") {
      return `+${eff.pressureDelta} Pressure (targeted)`;
    }
    return "";
  }

  return (
    <>
      {/* CARD REVEAL OVERLAY */}
      <div className="pointer-events-none fixed inset-0 z-[999] flex items-center justify-center">
        {revealCard && (
          <div className="pointer-events-auto max-w-md w-[92%] sm:w-[420px] bg-white text-black shadow-2xl border-4 border-black p-4">
            <div className="text-xs tracking-widest font-bold bg-black text-white px-2 py-1 inline-block mb-2">
              BREAKING
            </div>
            <div className="text-2xl font-black leading-tight mb-2">{revealCard.name}</div>
            {revealCard.flavor && (
              <div className="text-sm italic opacity-80 mb-3">“{revealCard.flavor}”</div>
            )}
            <div className="text-sm font-semibold">{renderEffects(revealCard)}</div>
          </div>
        )}
      </div>

      {/* SIMPLE TOASTS */}
      {/* Truth → top center */}
      <div className="fixed top-3 left-1/2 -translate-x-1/2 z-[998] space-y-2">
        {toasts
          .filter((t) => t.slot === "truth")
          .map((t) => (
            <div key={t.id} className="px-3 py-1 bg-black text-white text-sm shadow">
              {t.text}
            </div>
          ))}
      </div>
      {/* IP left (P1) */}
      <div className="fixed top-16 left-3 z-[998] space-y-2">
        {toasts
          .filter((t) => t.slot === "ip-left")
          .map((t) => (
            <div key={t.id} className="px-3 py-1 bg-black text-white text-sm shadow">
              {t.text}
            </div>
          ))}
      </div>
      {/* IP right (P2) */}
      <div className="fixed top-16 right-3 z-[998] space-y-2">
        {toasts
          .filter((t) => t.slot === "ip-right")
          .map((t) => (
            <div key={t.id} className="px-3 py-1 bg-black text-white text-sm shadow">
              {t.text}
            </div>
          ))}
      </div>
    </>
  );
}
