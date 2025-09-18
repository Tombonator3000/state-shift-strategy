import React from 'react';

type ArticleButtonProps = {
  label: string;
  onClick: () => void;
  sub?: string;
};

export default function ArticleButton({ label, onClick, sub }: ArticleButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full print-border bg-[var(--paper)] px-4 py-3 md:py-4 text-left transition-colors hover:bg-black/5 active:translate-y-[1px] focus:outline-none focus-visible:ring-4 focus-visible:ring-black/60"
    >
      <div
        className="font-[Anton] uppercase leading-none tracking-wide"
        style={{ fontSize: 'clamp(16px, 2.6vh, 28px)' }}
      >
        {label}
      </div>
      {sub ? (
        <div
          className="mt-1 uppercase tracking-wide text-[var(--ink-weak)]"
          style={{ fontSize: 'clamp(10px, 1.6vh, 14px)' }}
        >
          {sub}
        </div>
      ) : null}
    </button>
  );
}
