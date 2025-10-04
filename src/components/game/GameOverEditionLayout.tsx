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
  variant?: 'default' | 'victory';
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
        variant === 'victory'
          ? 'border-emerald-400/50 bg-slate-950/95 text-emerald-50 shadow-[0_25px_120px_rgba(16,185,129,0.35)] before:bg-[radial-gradient(circle_at_top,_rgba(52,211,153,0.45),_rgba(20,184,166,0.18)_55%,_transparent_85%)] before:opacity-90 after:bg-[radial-gradient(circle,_rgba(16,185,129,0.32),_transparent_78%)] after:opacity-95'
          : 'border-newspaper-border bg-newspaper-bg text-newspaper-text before:bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.28),_transparent_70%)] before:opacity-80 after:bg-[radial-gradient(circle,_rgba(16,185,129,0.18),_transparent_75%)] after:opacity-80',
        className,
      )}
    >
      <header
        className={cn(
          'relative border-b-4 border-double px-6 py-6',
          variant === 'victory'
            ? 'border-emerald-300/50 bg-gradient-to-b from-emerald-500/95 via-emerald-600/95 to-emerald-700/95 text-emerald-50 shadow-[inset_0_-8px_30px_rgba(15,118,110,0.45)]'
            : 'border-newspaper-border bg-newspaper-header/95 text-newspaper-text',
        )}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close final report"
          className={cn(
            'absolute right-4 top-4 rounded-full border-2 p-1 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
            variant === 'victory'
              ? 'border-emerald-200/60 bg-emerald-500/20 text-emerald-50 hover:bg-emerald-400/25 focus-visible:outline-emerald-200'
              : 'border-newspaper-text/40 bg-newspaper-bg/40 text-newspaper-text hover:bg-newspaper-bg focus-visible:outline-newspaper-border/60',
          )}
        >
          <X className={cn('h-5 w-5', variant === 'victory' ? 'drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]' : undefined)} />
        </button>
        <div className="flex flex-col items-center gap-2 text-center">
          <span
            className={cn(
              'text-[11px] font-semibold uppercase tracking-[0.6em]',
              variant === 'victory' ? 'text-emerald-100/80 drop-shadow-[0_0_8px_rgba(16,185,129,0.35)]' : 'text-newspaper-text/60',
            )}
          >
            ShadowGov Press Bureau
          </span>
          <p
            className={cn(
              'text-xs font-semibold uppercase tracking-[0.35em]',
              variant === 'victory' ? 'text-emerald-100/90 drop-shadow-[0_0_6px_rgba(16,185,129,0.35)]' : 'text-newspaper-text/70',
            )}
          >
            {kicker}
          </p>
          <div className="flex items-center gap-3">
            {bannerIcon ? (
              <span
                className={cn(
                  variant === 'victory'
                    ? 'text-emerald-100 drop-shadow-[0_0_12px_rgba(16,185,129,0.45)]'
                    : 'text-newspaper-headline',
                )}
              >
                {bannerIcon}
              </span>
            ) : null}
            <h2
              className={cn(
                'text-3xl font-black uppercase tracking-[0.25em] sm:text-4xl',
                variant === 'victory'
                  ? 'text-emerald-50 drop-shadow-[0_6px_18px_rgba(15,118,110,0.65)]'
                  : 'text-newspaper-text',
              )}
            >
              {bannerLabel}
            </h2>
          </div>
          <p
            className={cn(
              'text-[11px] font-semibold uppercase tracking-[0.35em]',
              variant === 'victory' ? 'text-emerald-100/80' : 'text-newspaper-text/60',
            )}
          >
            {metaLine}
          </p>
          {tagline ? (
            <p
              className={cn(
                'text-[11px] font-semibold uppercase tracking-[0.32em]',
                variant === 'victory' ? 'text-emerald-100/70' : 'text-newspaper-text/50',
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
          variant === 'victory' ? 'bg-slate-950/90' : 'bg-slate-950/95',
        )}
      >
        <div
          className={cn(
            'mx-auto max-w-4xl',
            variant === 'victory' ? 'text-emerald-100 drop-shadow-[0_0_12px_rgba(16,185,129,0.35)]' : 'text-emerald-100',
          )}
        >
          {children}
        </div>
      </main>

      {footer ? (
        <footer
          className={cn(
            'border-t-4 px-6 py-5',
            variant === 'victory'
              ? 'border-emerald-300/40 bg-slate-950/80 text-emerald-100'
              : 'border-newspaper-border bg-newspaper-header/95 text-newspaper-text',
          )}
        >
          {footer}
        </footer>
      ) : null}
    </div>
  );
};

export default GameOverEditionLayout;
