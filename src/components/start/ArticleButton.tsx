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
      <div className="font-[Anton] text-xl md:text-3xl leading-none tracking-wide uppercase">{label}</div>
      {sub ? (
        <div className="mt-1 text-xs md:text-sm text-[var(--ink-weak)] uppercase tracking-wide">{sub}</div>
      ) : null}
    </button>
  );
}
