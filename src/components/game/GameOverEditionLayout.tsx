import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GameOverEditionLayoutProps {
  bannerLabel: string;
  bannerIcon?: ReactNode;
  kicker: string;
  metaLine: string;
  tagline?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

const GameOverEditionLayout = ({
  bannerLabel,
  bannerIcon,
  kicker,
  metaLine,
  tagline,
  onClose,
  children,
  footer,
  className,
}: GameOverEditionLayoutProps) => {
  return (
    <div
      className={cn(
        'relative flex h-full max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-[1.5rem] border-4 border-newspaper-border bg-newspaper-bg text-newspaper-text shadow-2xl before:absolute before:-inset-6 before:-z-10 before:rounded-[2rem] before:bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.28),_transparent_70%)] before:opacity-80 before:blur-xl before:content-[""] after:pointer-events-none after:absolute after:-inset-12 after:-z-20 after:rounded-[2.75rem] after:bg-[radial-gradient(circle,_rgba(16,185,129,0.18),_transparent_75%)] after:opacity-80 after:blur-[90px] after:content-[""]',
        className,
      )}
    >
      <header className="relative border-b-4 border-double border-newspaper-border bg-newspaper-header/95 px-6 py-6">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close victory report"
          className="absolute right-4 top-4 rounded-full border-2 border-newspaper-text/40 bg-newspaper-bg/40 p-1 text-newspaper-text transition hover:bg-newspaper-bg"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="text-[11px] font-semibold uppercase tracking-[0.6em] text-newspaper-text/60">
            ShadowGov Press Bureau
          </span>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-newspaper-text/70">{kicker}</p>
          <div className="flex items-center gap-3">
            {bannerIcon ? <span className="text-newspaper-headline">{bannerIcon}</span> : null}
            <h2 className="text-3xl font-black uppercase tracking-[0.25em] text-newspaper-text sm:text-4xl">
              {bannerLabel}
            </h2>
          </div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-newspaper-text/60">{metaLine}</p>
          {tagline ? (
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-newspaper-text/50">{tagline}</p>
          ) : null}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto bg-slate-950/95 px-6 py-6">
        <div className="mx-auto max-w-4xl text-emerald-100">
          {children}
        </div>
      </main>

      {footer ? (
        <footer className="border-t-4 border-newspaper-border bg-newspaper-header/95 px-6 py-5 text-newspaper-text">
          {footer}
        </footer>
      ) : null}
    </div>
  );
};

export default GameOverEditionLayout;
