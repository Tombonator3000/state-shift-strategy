import { createPortal } from "react-dom";
import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import clsx from "clsx";

interface FoldoutOverlayPanelProps {
  id: string;
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "[tabindex]:not([tabindex='-1'])"
].join(",");

export default function FoldoutOverlayPanel({
  id,
  title,
  children,
  defaultOpen = false,
}: FoldoutOverlayPanelProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [container, setContainer] = useState<HTMLElement | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const lastDesktopOpen = useRef(defaultOpen);
  const isOpenRef = useRef(isOpen);
  const panelRef = useRef<HTMLElement | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const bodyId = `${id}-panel`;
  const labelId = `${id}-label`;

  useEffect(() => {
    setContainer(document.getElementById("left-rail"));
  }, []);

  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(max-width: 768px)");

    const applyMatch = (matches: boolean) => {
      setIsMobile(matches);
      if (matches) {
        lastDesktopOpen.current = isOpenRef.current;
        setIsOpen(false);
      } else {
        setIsOpen(lastDesktopOpen.current ?? defaultOpen);
      }
    };

    applyMatch(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      applyMatch(event.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [defaultOpen]);

  useEffect(() => {
    if (!isMobile) {
      lastDesktopOpen.current = isOpen;
    }
  }, [isMobile, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const frame = window.requestAnimationFrame(() => {
      const focusable = getFocusableElements();
      if (focusable.length > 0) {
        focusable[0].focus();
      } else {
        bodyRef.current?.focus();
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, [isOpen]);

  const getFocusableElements = () => {
    if (!bodyRef.current) return [] as HTMLElement[];
    return Array.from(bodyRef.current.querySelectorAll<HTMLElement>(focusableSelector)).filter(
      element => !element.hasAttribute("disabled") && !element.getAttribute("aria-hidden") && element.tabIndex !== -1
    );
  };

  const closePanel = () => {
    setIsOpen(false);
    window.requestAnimationFrame(() => {
      toggleRef.current?.focus();
    });
  };

  const handleToggle = () => {
    setIsOpen(prev => {
      const next = !prev;
      if (!next) {
        window.requestAnimationFrame(() => {
          toggleRef.current?.focus();
        });
      }
      return next;
    });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!isOpen) return;

    if (event.key === "Escape") {
      event.preventDefault();
      closePanel();
      return;
    }

    if (event.key !== "Tab") return;

    const focusable = getFocusableElements();

    if (focusable.length === 0) {
      event.preventDefault();
      bodyRef.current?.focus();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement as HTMLElement | null;

    if (event.shiftKey) {
      if (active === first || active === bodyRef.current) {
        event.preventDefault();
        last.focus();
      }
    } else if (active === last) {
      event.preventDefault();
      first.focus();
    }
  };

  if (!container) return null;

  return createPortal(
    <section
      className={clsx("panel foldout", isOpen && "foldout--open")}
      aria-labelledby={labelId}
      data-foldout-id={id}
      onKeyDown={handleKeyDown}
      ref={panelRef}
    >
      <button
        ref={toggleRef}
        type="button"
        className="foldout__tab"
        onClick={handleToggle}
        aria-controls={bodyId}
        aria-expanded={isOpen}
        aria-label={isOpen ? `Collapse ${title}` : `Expand ${title}`}
      >
        <span className="sr-only">{isOpen ? `Collapse ${title}` : `Expand ${title}`}</span>
        <span aria-hidden className="foldout__tab-icon">{isOpen ? "‹" : "›"}</span>
      </button>
      <div
        id={bodyId}
        ref={bodyRef}
        className="foldout__body"
        role="region"
        aria-labelledby={labelId}
        tabIndex={-1}
      >
        <header className="foldout__header">
          <h2 id={labelId} className="foldout__title">
            {title}
          </h2>
        </header>
        <div className="foldout__content text-xs text-newspaper-text/90">
          {children}
        </div>
      </div>
    </section>,
    container
  );
}
