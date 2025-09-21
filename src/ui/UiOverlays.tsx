import React from "react";
import { areUiNotificationsEnabled } from "@/state/settings";

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

type Toast = { id: number; text: string; slot: "truth" | "ip-left" | "ip-right" | "combo" };
type PendingDelta = { delta: number; timer: number };

const MAX_TOASTS_PER_SLOT = 3;
const DEFAULT_TOAST_LIFETIME = 900;
const COMBO_TOAST_LIFETIME = 1400;
const DELTA_BATCH_WINDOW = 180; // milliseconds

declare global {
  interface Window {
    uiShowOpponentCard?: (card: AnyCard) => void;
    uiToastTruth?: (delta: number) => void;
    uiToastIp?: (playerId: "P1" | "P2", delta: number) => void;
    uiFlashState?: (stateId: string, by: "P1" | "P2") => void; // placeholder for future prompts
    uiComboToast?: (message: string) => void;
  }
}

export default function UiOverlays() {
  const [revealCard, setRevealCard] = React.useState<AnyCard | null>(null);
  const revealTimer = React.useRef<number | null>(null);

  const [toasts, setToasts] = React.useState<Toast[]>([]);
  const pendingDeltas = React.useRef<Record<string, PendingDelta>>({});

  const addToast = React.useCallback(
    (slot: Toast["slot"], text: string, duration = DEFAULT_TOAST_LIFETIME) => {
      if (!areUiNotificationsEnabled()) {
        return;
      }

      const id = Date.now() + Math.random();
      setToasts((prev) => {
        const slotCount = prev.reduce(
          (count, toast) => count + (toast.slot === slot ? 1 : 0),
          0,
        );
        let trimmed = prev;
        if (slotCount >= MAX_TOASTS_PER_SLOT) {
          const removeIndex = prev.findIndex((toast) => toast.slot === slot);
          if (removeIndex !== -1) {
            trimmed = [...prev.slice(0, removeIndex), ...prev.slice(removeIndex + 1)];
          }
        } else {
          trimmed = [...prev];
        }
        return [...trimmed, { id, text, slot }];
      });

      window.setTimeout(() => {
        setToasts((current) => current.filter((toast) => toast.id !== id));
      }, duration);
    },
    [],
  );

  const flushPendingDelta = React.useCallback(
    (
      key: string,
      slot: Toast["slot"],
      formatter: (delta: number) => string,
      duration: number,
    ) => {
      const entry = pendingDeltas.current[key];
      if (!entry) {
        return;
      }
      const total = entry.delta;
      delete pendingDeltas.current[key];
      if (total !== 0) {
        addToast(slot, formatter(total), duration);
      }
    },
    [addToast],
  );

  const queueDeltaToast = React.useCallback(
    (
      key: string,
      slot: Toast["slot"],
      delta: number,
      formatter: (delta: number) => string,
      duration = DEFAULT_TOAST_LIFETIME,
    ) => {
      if (!areUiNotificationsEnabled()) {
        return;
      }

      if (!delta) {
        return;
      }

      const existing = pendingDeltas.current[key];
      if (existing) {
        existing.delta += delta;
        return;
      }

      const timer = window.setTimeout(() => {
        flushPendingDelta(key, slot, formatter, duration);
      }, DELTA_BATCH_WINDOW);
      pendingDeltas.current[key] = { delta, timer };
    },
    [flushPendingDelta],
  );

  React.useEffect(() => {
    if (!areUiNotificationsEnabled()) {
      return;
    }

    window.uiShowOpponentCard = (card: AnyCard) => {
      if (!areUiNotificationsEnabled()) {
        return;
      }
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
      if (!areUiNotificationsEnabled()) {
        return;
      }
      queueDeltaToast(
        "truth",
        "truth",
        delta,
        (total) => `${total > 0 ? "+" : ""}${total}% Truth`,
        DEFAULT_TOAST_LIFETIME,
      );
    };

    window.uiToastIp = (playerId: "P1" | "P2", delta: number) => {
      if (!areUiNotificationsEnabled()) {
        return;
      }
      const slot = playerId === "P1" ? "ip-left" : "ip-right";
      queueDeltaToast(
        `ip-${playerId}`,
        slot,
        delta,
        (total) => `${total > 0 ? "+" : ""}${total} IP`,
        DEFAULT_TOAST_LIFETIME,
      );
    };

    window.uiComboToast = (message: string) => {
      if (!areUiNotificationsEnabled()) {
        return;
      }
      addToast("combo", message, COMBO_TOAST_LIFETIME);
    };

    window.uiFlashState = (stateId: string, by: "P1" | "P2") => {
      if (!areUiNotificationsEnabled()) {
        return;
      }
      const el =
        document.querySelector(`[data-state-id="${stateId}"]`) ||
        document.querySelector(`[data-state="${stateId}"]`) ||
        document.getElementById(`state-${stateId}`) ||
        document.querySelector(`[data-usps="${stateId}"]`);

      if (el) {
        el.classList.add("capture-glow");
        window.setTimeout(() => el.classList.remove("capture-glow"), 900);
      } else {
        addToast("truth", `Captured ${stateId}`, 1100);
      }
    };

    return () => {
      delete window.uiShowOpponentCard;
      delete window.uiToastTruth;
      delete window.uiToastIp;
      delete window.uiFlashState;
      delete window.uiComboToast;
      Object.values(pendingDeltas.current).forEach((pending) => {
        window.clearTimeout(pending.timer);
      });
      pendingDeltas.current = {};
    };
  }, [addToast, queueDeltaToast]);

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
      {/* Combo notifications */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[998] space-y-2">
        {toasts
          .filter((t) => t.slot === "combo")
          .map((t) => (
            <div key={t.id} className="px-4 py-2 bg-black text-yellow-300 text-sm shadow-lg">
              {t.text}
            </div>
          ))}
      </div>
    </>
  );
}
