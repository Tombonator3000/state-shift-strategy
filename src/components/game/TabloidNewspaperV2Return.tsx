/**
 * Interactive Newspaper Return Component
 * Wraps the multi-page newspaper in a beautiful modal with header and page flip
 */

import { X } from 'lucide-react';
import { Card as UICard } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExtraStamp } from '@/components/newspaper/ExtraStamp';
import { NewspaperPageFlip } from '@/components/newspaper/NewspaperPageFlip';
import { cn } from '@/lib/utils';
import { NEWSPAPER_CARD_CLASS, NEWSPAPER_HEADER_CLASS } from './newspaperLayout';

interface NewspaperReturnProps {
  onClose: () => void;
  displayMasthead: string;
  glitchText: string | null;
  faction: 'truth' | 'government';
  hasExtraExtra: boolean;
  breakingStamp: string | null;
  agendaIssue?: { label: string } | null;
  newspaperPages: React.ReactNode[];
}

export const NewspaperReturn = ({
  onClose,
  displayMasthead,
  glitchText,
  faction,
  hasExtraExtra,
  breakingStamp,
  agendaIssue,
  newspaperPages,
}: NewspaperReturnProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <UICard className={cn(NEWSPAPER_CARD_CLASS, "max-h-[90vh] overflow-hidden flex flex-col")}>
        {/* Header */}
        <header className={cn(NEWSPAPER_HEADER_CLASS, 'overflow-hidden flex-shrink-0')}>
          {breakingStamp && (
            <div className="stamp stamp--breaking absolute left-6 top-4 z-10">{breakingStamp}</div>
          )}
          {hasExtraExtra && (
            <ExtraStamp
              className="top-4 right-20 md:top-6 md:right-24"
              size="md"
            />
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close newspaper"
            className="absolute right-4 top-4 z-10 rounded-full border-2 border-newspaper-text/40 bg-newspaper-bg/40 p-1 text-newspaper-text transition hover:bg-newspaper-bg hover:scale-110"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Paper texture overlay */}
          <div
            className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle,_rgba(15,23,42,0.12)_1px,transparent_1px)] [background-size:6px_6px] mix-blend-multiply"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-b from-white/45 via-transparent to-white/10"
            aria-hidden="true"
          />

          {/* Masthead */}
          <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-col items-center gap-1 sm:gap-3 text-center">
            <div className="hidden sm:flex flex-wrap items-center justify-center gap-3 text-[11px] font-semibold uppercase tracking-[0.32em] text-newspaper-text/70">
              <span>Global Edition</span>
              <span className="hidden h-3 w-px bg-newspaper-text/30 sm:block" aria-hidden="true" />
              <span>Joint Spin Bureau</span>
              <span className="hidden h-3 w-px bg-newspaper-text/30 sm:block" aria-hidden="true" />
              <span>Est. 1947</span>
            </div>
            <div className="flex w-full flex-col items-center gap-1 sm:gap-2">
              <p
                className={`relative font-serif text-2xl xs:text-3xl font-black uppercase tracking-[0.08em] sm:tracking-[0.12em] text-newspaper-text sm:text-4xl md:text-5xl ${glitchText ? 'glitch' : ''}`}
                data-text={displayMasthead}
              >
                {displayMasthead}
              </p>
              <div className="h-px w-12 bg-newspaper-text/40 sm:w-24" aria-hidden="true" />
            </div>
            <p className="hidden sm:block text-xs font-semibold uppercase tracking-[0.22em] text-newspaper-text/70">
              Equal-Opportunity Propaganda for Loyalists & Leaksters
            </p>
            <p className="text-[9px] sm:text-[11px] font-semibold uppercase tracking-[0.18em] sm:tracking-[0.26em] text-newspaper-text/55">
              Edition courtesy of the{' '}
              {faction === 'truth' ? 'Truth Coalition Whisper Network' : 'State Narrative Directorate'}
            </p>
            {agendaIssue && (
              <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.2em] sm:tracking-[0.3em] text-newspaper-text/45">
                Spotlight: {agendaIssue.label}
              </p>
            )}
          </div>
        </header>

        {/* Interactive Page Flip Container */}
        <div className="flex-1 overflow-hidden relative">
          <NewspaperPageFlip 
            pages={newspaperPages} 
            enableSound={true}
            onPageChange={(pageIndex) => {
              // Optional: Add analytics or state tracking here
              console.log('Newspaper page changed to:', pageIndex + 1);
            }}
          />
        </div>

        {/* Footer */}
        <footer className="border-t-2 sm:border-t-4 border-newspaper-border bg-newspaper-header/90 px-3 py-2 sm:px-6 sm:py-4 flex-shrink-0">
          <div className="flex flex-col items-center gap-2 sm:gap-3 sm:flex-row sm:justify-between">
            <p className="hidden sm:block text-xs font-semibold uppercase tracking-wide text-newspaper-bg/80">
              {new Date().toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })} · Printed on recycled leak fragments
            </p>
            <Button
              variant="secondary"
              onClick={onClose}
              className="w-full sm:w-auto font-black uppercase tracking-wide hover:scale-105 transition-transform text-sm sm:text-base"
            >
              Continue the Operation
            </Button>
          </div>
        </footer>
      </UICard>
    </div>
  );
};
