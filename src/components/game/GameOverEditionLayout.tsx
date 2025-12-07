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
  variant?: 'default' | 'victory' | 'defeat' | 'stalemate';
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
  variant = 'default',
}: GameOverEditionLayoutProps) => {
  return (
    <div
      className={cn(
        'relative flex h-full max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-[1.5rem] border-4 shadow-2xl before:absolute before:-inset-6 before:-z-10 before:rounded-[2rem] before:blur-xl before:content-[""] after:pointer-events-none after:absolute after:-inset-12 after:-z-20 after:rounded-[2.75rem] after:blur-[90px] after:content-[""]',
        variant === 'victory' &&
          'border-emerald-400/50 bg-slate-950/95 text-emerald-50 shadow-[0_25px_120px_rgba(16,185,129,0.35)] before:bg-[radial-gradient(circle_at_top,_rgba(52,211,153,0.45),_rgba(20,184,166,0.18)_55%,_transparent_85%)] before:opacity-90 after:bg-[radial-gradient(circle,_rgba(16,185,129,0.32),_transparent_78%)] after:opacity-95',
        variant === 'defeat' &&
          'border-red-500/50 bg-slate-950/95 text-red-50 shadow-[0_25px_120px_rgba(220,38,38,0.35)] before:bg-[radial-gradient(circle_at_top,_rgba(239,68,68,0.45),_rgba(185,28,28,0.18)_55%,_transparent_85%)] before:opacity-90 after:bg-[radial-gradient(circle,_rgba(220,38,38,0.32),_transparent_78%)] after:opacity-95',
        variant === 'stalemate' &&
          'border-amber-400/50 bg-slate-950/95 text-amber-50 shadow-[0_25px_120px_rgba(245,158,11,0.35)] before:bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.45),_rgba(217,119,6,0.18)_55%,_transparent_85%)] before:opacity-90 after:bg-[radial-gradient(circle,_rgba(245,158,11,0.32),_transparent_78%)] after:opacity-95',
        variant === 'default' &&
          'border-newspaper-border bg-newspaper-bg text-newspaper-text before:bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.28),_transparent_70%)] before:opacity-80 after:bg-[radial-gradient(circle,_rgba(16,185,129,0.18),_transparent_75%)] after:opacity-80',
        className,
      )}
    >
      <header
        className={cn(
          'relative border-b-4 border-double px-6 py-6',
          variant === 'victory' &&
            'border-emerald-300/50 bg-gradient-to-b from-emerald-500/95 via-emerald-600/95 to-emerald-700/95 text-emerald-50 shadow-[inset_0_-8px_30px_rgba(15,118,110,0.45)]',
          variant === 'defeat' &&
            'border-red-400/50 bg-gradient-to-b from-red-600/95 via-red-700/95 to-red-800/95 text-red-50 shadow-[inset_0_-8px_30px_rgba(127,29,29,0.45)]',
          variant === 'stalemate' &&
            'border-amber-300/50 bg-gradient-to-b from-amber-500/95 via-amber-600/95 to-amber-700/95 text-amber-50 shadow-[inset_0_-8px_30px_rgba(146,64,14,0.45)]',
          variant === 'default' &&
            'border-newspaper-border bg-newspaper-header/95 text-newspaper-text',
        )}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close final report"
          className={cn(
            'absolute right-4 top-4 rounded-full border-2 p-1 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
            variant === 'victory' &&
              'border-emerald-200/60 bg-emerald-500/20 text-emerald-50 hover:bg-emerald-400/25 focus-visible:outline-emerald-200',
            variant === 'defeat' &&
              'border-red-200/60 bg-red-500/20 text-red-50 hover:bg-red-400/25 focus-visible:outline-red-200',
            variant === 'stalemate' &&
              'border-amber-200/60 bg-amber-500/20 text-amber-50 hover:bg-amber-400/25 focus-visible:outline-amber-200',
            variant === 'default' &&
              'border-newspaper-text/40 bg-newspaper-bg/40 text-newspaper-text hover:bg-newspaper-bg focus-visible:outline-newspaper-border/60',
          )}
        >
          <X className={cn(
            'h-5 w-5',
            variant === 'victory' && 'drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]',
            variant === 'defeat' && 'drop-shadow-[0_0_8px_rgba(220,38,38,0.6)]',
            variant === 'stalemate' && 'drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]',
          )} />
        </button>
        <div className="flex flex-col items-center gap-2 text-center">
          <span
            className={cn(
              'text-[11px] font-semibold uppercase tracking-[0.38em]',
              variant === 'victory' && 'text-emerald-100/80 drop-shadow-[0_0_8px_rgba(16,185,129,0.35)]',
              variant === 'defeat' && 'text-red-100/80 drop-shadow-[0_0_8px_rgba(220,38,38,0.35)]',
              variant === 'stalemate' && 'text-amber-100/80 drop-shadow-[0_0_8px_rgba(245,158,11,0.35)]',
              variant === 'default' && 'text-newspaper-text/60',
            )}
          >
            Paranoid Times Joint Spin Bureau
          </span>
          <p
            className={cn(
              'text-xs font-semibold uppercase tracking-[0.35em]',
              variant === 'victory' && 'text-emerald-100/90 drop-shadow-[0_0_6px_rgba(16,185,129,0.35)]',
              variant === 'defeat' && 'text-red-100/90 drop-shadow-[0_0_6px_rgba(220,38,38,0.35)]',
              variant === 'stalemate' && 'text-amber-100/90 drop-shadow-[0_0_6px_rgba(245,158,11,0.35)]',
              variant === 'default' && 'text-newspaper-text/70',
            )}
          >
            {kicker}
          </p>
          <div className="flex items-center gap-3">
            {bannerIcon ? (
              <span
                className={cn(
                  variant === 'victory' && 'text-emerald-100 drop-shadow-[0_0_12px_rgba(16,185,129,0.45)]',
                  variant === 'defeat' && 'text-red-100 drop-shadow-[0_0_12px_rgba(220,38,38,0.45)]',
                  variant === 'stalemate' && 'text-amber-100 drop-shadow-[0_0_12px_rgba(245,158,11,0.45)]',
                  variant === 'default' && 'text-newspaper-headline',
                )}
              >
                {bannerIcon}
              </span>
            ) : null}
            <h2
              className={cn(
                'text-3xl font-black uppercase tracking-[0.25em] sm:text-4xl',
                variant === 'victory' && 'text-emerald-50 drop-shadow-[0_6px_18px_rgba(15,118,110,0.65)]',
                variant === 'defeat' && 'text-red-50 drop-shadow-[0_6px_18px_rgba(127,29,29,0.65)]',
                variant === 'stalemate' && 'text-amber-50 drop-shadow-[0_6px_18px_rgba(146,64,14,0.65)]',
                variant === 'default' && 'text-newspaper-text',
              )}
            >
              {bannerLabel}
            </h2>
          </div>
          <p
            className={cn(
              'text-[11px] font-semibold uppercase tracking-[0.35em]',
              variant === 'victory' && 'text-emerald-100/80',
              variant === 'defeat' && 'text-red-100/80',
              variant === 'stalemate' && 'text-amber-100/80',
              variant === 'default' && 'text-newspaper-text/60',
            )}
          >
            {metaLine}
          </p>
          {tagline ? (
            <p
              className={cn(
                'text-[11px] font-semibold uppercase tracking-[0.32em]',
                variant === 'victory' && 'text-emerald-100/70',
                variant === 'defeat' && 'text-red-100/70',
                variant === 'stalemate' && 'text-amber-100/70',
                variant === 'default' && 'text-newspaper-text/50',
              )}
            >
              {tagline}
            </p>
          ) : null}
        </div>
      </header>

      <main
        className={cn(
          'flex-1 overflow-y-auto px-6 py-6',
          variant === 'victory' && 'bg-slate-950/90',
          variant === 'defeat' && 'bg-slate-950/90',
          variant === 'stalemate' && 'bg-slate-950/90',
          variant === 'default' && 'bg-slate-950/95',
        )}
      >
        <div
          className={cn(
            'mx-auto max-w-4xl',
            variant === 'victory' && 'text-emerald-100 drop-shadow-[0_0_12px_rgba(16,185,129,0.35)]',
            variant === 'defeat' && 'text-red-100 drop-shadow-[0_0_12px_rgba(220,38,38,0.35)]',
            variant === 'stalemate' && 'text-amber-100 drop-shadow-[0_0_12px_rgba(245,158,11,0.35)]',
            variant === 'default' && 'text-emerald-100',
          )}
        >
          {children}
        </div>
      </main>

      {footer ? (
        <footer
          className={cn(
            'border-t-4 px-6 py-5',
            variant === 'victory' && 'border-emerald-300/40 bg-slate-950/80 text-emerald-100',
            variant === 'defeat' && 'border-red-400/40 bg-slate-950/80 text-red-100',
            variant === 'stalemate' && 'border-amber-300/40 bg-slate-950/80 text-amber-100',
            variant === 'default' && 'border-newspaper-border bg-newspaper-header/95 text-newspaper-text',
          )}
        >
          {footer}
        </footer>
      ) : null}
    </div>
  );
};

export default GameOverEditionLayout;
