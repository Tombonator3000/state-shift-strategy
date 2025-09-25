import { useState, type ReactNode } from "react";
import clsx from "clsx";

interface FoldoutOverlayPanelProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  widthClassName?: string;
  variant?: "overlay" | "sidebar";
}

export default function FoldoutOverlayPanel({
  title,
  children,
  defaultOpen = false,
  widthClassName = "w-72",
  variant = "overlay",
}: FoldoutOverlayPanelProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const isOverlay = variant === "overlay";

  return (
    <div className="pointer-events-auto">
      <div
        className={clsx(
          "relative transition-all duration-300 ease-out",
          widthClassName,
          isOverlay
            ? (isOpen ? "translate-x-0" : "-translate-x-[calc(100%-3.75rem)]")
            : "translate-x-0"
        )}
      >
        <div
          className={clsx(
            "overflow-hidden rounded-2xl border border-newspaper-border/60 bg-newspaper-bg/40",
            "shadow-2xl backdrop-blur-lg transition-opacity duration-300",
            isOpen ? "opacity-100" : "opacity-80 hover:opacity-100"
          )}
        >
          <div className="flex items-center justify-between border-b border-newspaper-border/50 px-4 py-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-newspaper-text/70">
              {title}
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(prev => !prev)}
              aria-expanded={isOpen}
              aria-label={isOpen ? `Minimize ${title}` : `Expand ${title}`}
              className="rounded-full border border-newspaper-border/60 bg-newspaper-text/10 px-2 py-1 text-[10px] font-bold uppercase text-newspaper-text/80 shadow-sm transition hover:bg-newspaper-text/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-secret-red/60"
            >
              {isOpen ? "⟨" : "⟩"}
            </button>
          </div>
          <div className="px-4 py-3 text-xs text-newspaper-text/90">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
