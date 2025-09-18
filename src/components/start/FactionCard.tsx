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
        className="group flex h-full flex-col cursor-pointer select-none bg-[var(--paper)] print-border focus:outline-none focus:ring-4 focus:ring-black/60"
        aria-label={`${title} — select faction`}
      >
        <div className="relative flex-1 overflow-hidden bg-black/10">
          <span className="absolute top-2 left-2 z-10 badge text-[10px] leading-none bg-[var(--paper)]">EXCLUSIVE</span>
          <img
            src={imageSrc}
            alt={title}
            loading="eager"
            className="h-full w-full object-cover object-center transition-transform duration-200 group-hover:scale-[1.02]"
          />
        </div>
        <div className="px-3 py-3">
          <h3 className="font-[Anton] tracking-wide text-2xl sm:text-3xl md:text-4xl uppercase">{title}</h3>
          {caption ? (
            <p className="mt-1 text-sm text-[var(--ink-weak)] uppercase tracking-wide">{caption}</p>
          ) : null}
        </div>
      </article>
    );
  }
);

FactionCard.displayName = 'FactionCard';

export default FactionCard;
