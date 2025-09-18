import { forwardRef, KeyboardEvent } from 'react';

export type FactionCardProps = {
  faction: 'government' | 'truth';
  title: string;
  imageSrc: string;
  onSelect: () => void;
  caption?: string;
};

const FactionCard = forwardRef<HTMLDivElement, FactionCardProps>(
  ({ faction, title, imageSrc, onSelect, caption }, ref) => {
    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onSelect();
      }
    };

    return (
      <article
        ref={ref}
        role="button"
        tabIndex={0}
        data-faction-card={faction}
        onClick={onSelect}
        onKeyDown={handleKeyDown}
        className="print-border bg-[var(--paper)] flex flex-col h-full overflow-hidden cursor-pointer transition-transform duration-200 hover:-translate-y-1 focus:outline-none focus-visible:ring-4 focus-visible:ring-black/50"
        aria-label={`Start as ${title}`}
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <img src={imageSrc} alt={title} className="h-full w-full object-cover" />
          <span className="badge absolute top-3 left-3 bg-[var(--paper)] text-[var(--ink)] text-sm tracking-[0.08em]">
            EXCLUSIVE
          </span>
        </div>
        <div className="flex flex-col gap-1 px-4 py-5 bg-[var(--paper)]">
          <h3 className="font-['Anton',sans-serif] text-3xl sm:text-4xl tracking-[0.06em] uppercase">
            {title}
          </h3>
          {caption ? (
            <p className="font-['Bebas Neue',sans-serif] text-lg sm:text-xl uppercase tracking-[0.08em] text-[var(--ink-weak)]">
              {caption}
            </p>
          ) : null}
        </div>
      </article>
    );
  }
);

FactionCard.displayName = 'FactionCard';

export default FactionCard;
