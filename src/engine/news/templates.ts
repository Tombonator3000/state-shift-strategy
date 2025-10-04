import type { Card } from '@/types';

export type StoryTone = 'truth' | 'government';

export interface StoryTemplate {
  id: string;
  headline: string;
  deck: string;
  body: string[];
  imagePrompt: string;
}

export const VERB_POOLS: Record<StoryTone, string[]> = {
  truth: ['EXPOSES', 'UNCOVERS', 'BROADCASTS', 'LEAKS', 'SPOTLIGHTS', 'AMPLIFIES'],
  government: ['CONTAINS', 'REDACTS', 'SANITIZES', 'STABILIZES', 'DISMISSES', 'NEUTRALIZES'],
};

export const BYLINE_POOLS: Record<StoryTone, string[]> = {
  truth: [
    'By: Field Unit 27-B/6',
    'By: Rogue Desk of Disclosure',
    'By: Signal-Watcher Syndicate',
    'By: Anonymous Courier (Probably)',
  ],
  government: [
    'By: Office of Narrative Compliance',
    'By: Department of Plausible Updates',
    'By: Clearance Channel Liaison',
    'By: Bureau of Strategic Messaging',
  ],
};

export const DEFAULT_TAGS: Record<StoryTone, string[]> = {
  truth: ['#TruthSignal', '#LeakSeason'],
  government: ['#NarrativeContainment', '#OfficialChannel'],
};

export const STORY_TEMPLATES: Record<StoryTone, StoryTemplate[]> = {
  truth: [
    {
      id: 'truth-broadcast-surge',
      headline: '{primaryNameUpper} {verb} {tagHeadline}',
      deck: 'Citizen transmitters flood {tagSummary} back into daylight.',
      body: [
        '{cardListPlain} circulate {tagPhrase} receipts after {primaryName} hits the feeds.',
        'Witnesses swear the newsroom smells like ozone whenever {tagLine} trends.',
      ],
      imagePrompt:
        'tabloid collage, chaotic neon annotations, {primaryName} spotlight, references to {tagSummary}, halftone texture',
    },
    {
      id: 'truth-insider-signal',
      headline: 'INSIDERS {verb} {tagHeadline} VIA {primaryNameUpper}',
      deck: '{tagSummary} returns to circulation despite official denials.',
      body: [
        'Underground channels credit {primaryName} with rerouting the narrative.',
        'Analysts note {cardListPlain} cross-post fragments linking {tagPhrase} to midnight transmissions.',
      ],
      imagePrompt:
        'zine collage, photocopied clippings, {primaryName} headline circled in red ink, graffiti {tagLine}',
    },
  ],
  government: [
    {
      id: 'gov-bulletin-control',
      headline: '{primaryNameUpper} {verb} {tagHeadline}',
      deck: 'Official communique assures stakeholders {tagSummary} remains contained.',
      body: [
        '{cardListPlain} file counter-messaging briefings to neutralize {tagPhrase}.',
        'Compliance desk reminds outlets to reference memo {tagLine} before broadcasting.',
      ],
      imagePrompt:
        'sterile government dossier, redacted text, {primaryName} headline, {tagSummary}, muted palette',
    },
    {
      id: 'gov-audit-review',
      headline: '{primaryNameUpper} TRIGGERS {verb} REVIEW OF {tagHeadline}',
      deck: 'Compliance board declares {tagSummary} an internal matter.',
      body: [
        'Spokespeople cite {primaryName} as evidence protocols remain agile.',
        'Internal monitors confirm {cardListPlain} rerouted chatter about {tagPhrase} to secure channels.',
      ],
      imagePrompt:
        'monochrome surveillance still, stacks of binders, {primaryName} file, barcode overlays, cool desaturated tones',
    },
  ],
};

export type StoryCardLike = Pick<Card, 'id' | 'name' | 'faction'> & { tags?: string[] };
