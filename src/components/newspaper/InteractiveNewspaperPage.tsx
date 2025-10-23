/**
 * Interactive Newspaper Page
 * A comprehensive newspaper page component that brings together all interactive elements
 */

import { ExpandableArticle } from './ExpandableArticle';
import { MultiColumnArticle } from './MultiColumnArticle';
import { ClassifiedAds } from './ClassifiedAds';
import { LettersToEditor } from './LettersToEditor';
import { ComicStrip } from './ComicStrip';
import { NewspaperHoroscope } from './NewspaperHoroscope';
import { NewspaperTexture } from './NewspaperTexture';
import { newspaperSounds } from '@/lib/newspaperSounds';
import { cn } from '@/lib/utils';

export interface ArticleData {
  headline: string;
  subhead?: string;
  preview: string;
  fullContent: string;
  byline?: string;
  image?: React.ReactNode;
}

interface InteractiveNewspaperPageProps {
  // Main content
  heroArticle?: ArticleData;
  articles?: ArticleData[];
  
  // Layout options
  pageType?: 'front' | 'inside' | 'features' | 'back';
  texture?: 'light' | 'medium' | 'heavy';
  aged?: boolean;
  
  // Feature flags
  showClassifieds?: boolean;
  showComicStrip?: boolean;
  showHoroscope?: boolean;
  showLetters?: boolean;
  
  // Sound
  soundEnabled?: boolean;
  
  className?: string;
}

export const InteractiveNewspaperPage = ({
  heroArticle,
  articles = [],
  pageType = 'inside',
  texture = 'medium',
  aged = false,
  showClassifieds = false,
  showComicStrip = false,
  showHoroscope = false,
  showLetters = false,
  soundEnabled = true,
  className,
}: InteractiveNewspaperPageProps) => {
  
  const handleArticleExpand = (expanded: boolean) => {
    if (soundEnabled && expanded) {
      newspaperSounds.paperUnfold();
    }
  };

  // Front page layout
  if (pageType === 'front' && heroArticle) {
    return (
      <NewspaperTexture intensity={texture} aged={aged} className={className}>
        <div className="space-y-4">
          <MultiColumnArticle
            headline={heroArticle.headline}
            subhead={heroArticle.subhead}
            content={heroArticle.fullContent}
            byline={heroArticle.byline}
            image={heroArticle.image}
            columns={2}
            className="mb-6"
          />
          
          {articles.length > 0 && (
            <div className="grid grid-cols-1 gap-4">
              {articles.slice(0, 2).map((article, i) => (
                <ExpandableArticle
                  key={i}
                  {...article}
                  onExpand={handleArticleExpand}
                />
              ))}
            </div>
          )}
        </div>
      </NewspaperTexture>
    );
  }

  // Inside pages layout
  if (pageType === 'inside') {
    return (
      <NewspaperTexture intensity={texture} aged={aged} className={className}>
        <div className="grid grid-cols-2 gap-4">
          {articles.map((article, i) => (
            <ExpandableArticle
              key={i}
              {...article}
              onExpand={handleArticleExpand}
              className="h-fit"
            />
          ))}
        </div>
      </NewspaperTexture>
    );
  }

  // Features page layout
  if (pageType === 'features') {
    return (
      <NewspaperTexture intensity={texture} aged={aged} className={className}>
        <div className="space-y-4">
          {showComicStrip && <ComicStrip />}
          
          <div className="grid grid-cols-2 gap-4">
            {showHoroscope && <NewspaperHoroscope />}
            {showLetters && <LettersToEditor count={4} />}
          </div>
          
          {articles.length > 0 && (
            <div className="grid grid-cols-1 gap-4 mt-4">
              {articles.map((article, i) => (
                <ExpandableArticle
                  key={i}
                  {...article}
                  onExpand={handleArticleExpand}
                />
              ))}
            </div>
          )}
        </div>
      </NewspaperTexture>
    );
  }

  // Back page layout
  if (pageType === 'back') {
    return (
      <NewspaperTexture intensity={texture} aged={aged} className={className}>
        <div className="space-y-4">
          {showClassifieds && <ClassifiedAds count={8} includePersonals />}
          
          {articles.length > 0 && (
            <div className="grid grid-cols-2 gap-4">
              {articles.slice(0, 2).map((article, i) => (
                <ExpandableArticle
                  key={i}
                  {...article}
                  onExpand={handleArticleExpand}
                />
              ))}
            </div>
          )}
        </div>
      </NewspaperTexture>
    );
  }

  // Default generic layout
  return (
    <NewspaperTexture intensity={texture} aged={aged} className={className}>
      <div className="space-y-4">
        {heroArticle && (
          <MultiColumnArticle
            headline={heroArticle.headline}
            subhead={heroArticle.subhead}
            content={heroArticle.fullContent}
            byline={heroArticle.byline}
            image={heroArticle.image}
            columns={2}
          />
        )}
        
        {articles.length > 0 && (
          <div className="grid grid-cols-2 gap-4">
            {articles.map((article, i) => (
              <ExpandableArticle
                key={i}
                {...article}
                onExpand={handleArticleExpand}
              />
            ))}
          </div>
        )}
      </div>
    </NewspaperTexture>
  );
};
