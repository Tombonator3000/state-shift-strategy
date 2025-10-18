import { memo } from 'react';

import { cn } from '@/lib/utils';
import type { CompositeStory, CompositeStoryTone } from '@/types/news';
import { NEWSPAPER_BADGE_CLASS } from '@/components/game/newspaperLayout';

interface TurnEditionProps {
  story: CompositeStory;
  className?: string;
}

const CONNECTORS: Record<CompositeStoryTone, readonly string[]> = {
  truth: ['UNCOVERS', 'BROADCASTS', 'AMPLIFIES', 'DECRYPTS'],
  government: ['SUPPRESSES', 'REDACTS', 'OBSCURES', 'COUNTERSPINS'],
};

const TONE_BADGE: Record<CompositeStoryTone, string> = {
  truth: 'Truth Composite Dispatch',
  government: 'Directorate Composite Memo',
};

const TONE_BADGE_CLASS: Record<CompositeStoryTone, string> = {
  truth: 'border-truth-red text-truth-red',
  government: 'border-government-blue text-government-blue',
};

const CONNECTOR_LABEL: Record<CompositeStoryTone, string> = {
  truth: 'Truth Connectors',
  government: 'Government Connectors',
};

const SOURCE_PREFIX: Record<CompositeStoryTone, string> = {
  truth: 'Whistlewire sources',
  government: 'Directorate sources',
};

const formatTag = (tag: string): string => {
  return tag
    .split(/[-_]/g)
    .map(segment => segment.trim())
    .filter(Boolean)
    .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
};

const formatSourceLine = (story: CompositeStory): string => {
  if (!story.sources.length) {
    return `${SOURCE_PREFIX[story.tone]} pending clearance.`;
  }

  const headlines = story.sources
    .map(source => source.headline.trim())
    .filter(Boolean);

  if (!headlines.length) {
    return `${SOURCE_PREFIX[story.tone]} withheld.`;
  }

  return `${SOURCE_PREFIX[story.tone]}: ${headlines.slice(0, 3).join(' • ')}`;
};

const TurnEdition = memo(({ story, className }: TurnEditionProps) => {
  const connectors = CONNECTORS[story.tone];
  const focusTags = story.tags.filter(Boolean).slice(0, 4);
  const sourceLine = formatSourceLine(story);

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-semibold uppercase tracking-wide text-newspaper-text/70">
        <span
          className={cn(
            NEWSPAPER_BADGE_CLASS,
            'rounded-full px-3 py-1 text-[11px] tracking-wide',
            TONE_BADGE_CLASS[story.tone],
          )}
        >
          {TONE_BADGE[story.tone]}
        </span>
        {focusTags.length ? (
          <span className="rounded-full border border-dashed border-newspaper-border px-3 py-1 text-[10px] tracking-[0.32em] text-newspaper-text/60">
            Focus: {focusTags.slice(0, 2).map(formatTag).join(' • ')}
          </span>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.32em] text-newspaper-text/60">
        <span>{CONNECTOR_LABEL[story.tone]}:</span>
        {connectors.map(connector => (
          <span
            key={connector}
            className={cn(
              'rounded border px-2 py-0.5',
              story.tone === 'truth'
                ? 'border-truth-red/50 text-truth-red'
                : 'border-government-blue/50 text-government-blue',
            )}
          >
            {connector}
          </span>
        ))}
      </div>

      <div className="space-y-4">
        <h2
          className={cn(
            'text-3xl font-black leading-tight sm:text-4xl',
            story.tone === 'truth' ? 'text-newspaper-headline' : 'text-newspaper-headline/90',
          )}
        >
          {story.headline}
        </h2>
        <p className="text-lg font-semibold italic text-newspaper-text/80">{story.subhead}</p>

        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] uppercase tracking-wide text-newspaper-text/70">
          <span>By: {story.byline}</span>
          <span>{sourceLine}</span>
        </div>

        <div className="relative overflow-hidden rounded-md border border-newspaper-border bg-newspaper-header/20">
          {story.imagePrompt ? (
            <div className="flex aspect-[4/3] w-full max-h-64 flex-col items-center justify-center gap-2 px-6 py-5 text-center">
              <span className="text-[10px] font-semibold uppercase tracking-[0.32em] text-newspaper-text/50">
                Image Prompt
              </span>
              <p className="text-sm leading-relaxed text-newspaper-text/80">{story.imagePrompt}</p>
            </div>
          ) : (
            <div className="flex aspect-[4/3] w-full max-h-64 items-center justify-center px-4 text-center text-sm font-semibold uppercase tracking-wide text-newspaper-text/60">
              Archival footage pending clearance.
            </div>
          )}
        </div>

        <div className="space-y-4 text-sm leading-relaxed text-newspaper-text/80">
          {story.body.map((paragraph, index) => (
            <p key={`${paragraph.slice(0, 32)}-${index}`}>{paragraph}</p>
          ))}
        </div>

        {focusTags.length ? (
          <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-wide text-newspaper-text/60">
            {focusTags.map(tag => (
              <span key={tag} className="rounded border border-newspaper-border px-2 py-0.5">
                {formatTag(tag)}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
});

TurnEdition.displayName = 'TurnEdition';

export default TurnEdition;
