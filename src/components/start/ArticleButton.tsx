import { MouseEventHandler } from 'react';

export type ArticleButtonProps = {
  label: string;
  onClick: MouseEventHandler<HTMLButtonElement>;
  variant?: 'article' | 'ad';
  sub?: string;
};

const ArticleButton = ({ label, onClick, variant = 'article', sub }: ArticleButtonProps) => {
  const accentClasses =
    variant === 'ad'
      ? 'text-[var(--accent)] border-[var(--accent)]'
      : 'text-[var(--ink)] border-[var(--rule)]';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`print-border ${accentClasses} px-4 py-3 md:py-4 bg-[var(--paper)] hover:bg-black/5 active:translate-y-[1px] font-[800] tracking-[0.08em] text-xl md:text-2xl uppercase transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-black/40 flex flex-col gap-1 text-left`}
    >
      <span className="font-['Bebas Neue',sans-serif] leading-none">{label}</span>
      {sub ? (
        <span className="text-sm md:text-base font-sans tracking-normal uppercase text-[var(--ink-weak)]">{sub}</span>
      ) : null}
    </button>
  );
};

export default ArticleButton;
