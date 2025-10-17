export type CompositeStoryTone = 'truth' | 'government';

export interface CompositeSourceReference {
  id: string;
  headline: string;
  subhead?: string;
}

export interface CompositeStory {
  tone: CompositeStoryTone;
  tags: string[];
  headline: string;
  subhead: string;
  byline: 'Composite Desk';
  body: string[];
  imagePrompt?: string;
  sources: CompositeSourceReference[];
}
