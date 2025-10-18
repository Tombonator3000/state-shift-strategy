import type { ArticleBlock } from '@/news/types';

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

export type ExtraExtraArticleEntry = {
  kind: 'article';
  data: ArticleBlock;
};

export type ExtraExtraBulletinEntry = {
  kind: 'bulletin';
  data: ArticleBlock;
};

export type ExtraExtraCompositeEntry = {
  kind: 'composite';
  data: CompositeStory;
};

export type ExtraExtraFeedEntry =
  | ExtraExtraArticleEntry
  | ExtraExtraBulletinEntry
  | ExtraExtraCompositeEntry;
