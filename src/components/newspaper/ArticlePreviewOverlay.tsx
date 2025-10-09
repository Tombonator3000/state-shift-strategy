import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { getArticleForCard } from '@/data/cardArticles/articleDatabase';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';

interface ArticlePreviewOverlayProps {
  cardId: string | null;
  cardName: string;
  onClose: () => void;
}

/**
 * Full article preview overlay with newspaper-style layout
 */
export function ArticlePreviewOverlay({ cardId, cardName, onClose }: ArticlePreviewOverlayProps) {
  const [article, setArticle] = useState<ReturnType<typeof getArticleForCard>>(null);

  useEffect(() => {
    if (cardId) {
      const foundArticle = getArticleForCard(cardId);
      setArticle(foundArticle);
    }
  }, [cardId]);

  if (!cardId || !article) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <Card className="relative max-w-3xl w-full max-h-[90vh] bg-background border-2 border-border">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 z-10"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>

        <ScrollArea className="h-full p-6">
          <div className="space-y-4 newspaper-article">
            {/* Masthead */}
            <div className="border-b-4 border-double border-border pb-2">
              <h1 className="text-4xl font-bold font-serif text-center">
                THE PARANOID TIMES
              </h1>
              <p className="text-center text-xs text-muted-foreground uppercase tracking-wider">
                Truth is Out There • Est. 1947
              </p>
            </div>

            {/* Article Header */}
            <div className="space-y-2">
              <h2 className="text-3xl font-bold font-serif leading-tight">
                {article.headline}
              </h2>
              <p className="text-lg italic text-muted-foreground border-l-4 border-primary pl-3">
                {article.subhead}
              </p>
              <p className="text-sm text-muted-foreground uppercase tracking-wide">
                {article.byline}
              </p>
            </div>

            {/* Article Body */}
            <div className="prose prose-sm max-w-none space-y-3 text-justify">
              {article.body.split('\n\n').map((paragraph, idx) => (
                <p key={idx} className="leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Related Info */}
            {article.statesMentioned && article.statesMentioned.length > 0 && (
              <div className="mt-6 p-3 bg-muted/50 border-l-4 border-primary">
                <p className="text-xs font-semibold uppercase tracking-wide mb-1">
                  States Mentioned:
                </p>
                <p className="text-sm">{article.statesMentioned.join(', ')}</p>
              </div>
            )}

            {article.recurringCharacter && (
              <div className="mt-4 p-3 bg-muted/50 border-l-4 border-secondary">
                <p className="text-xs font-semibold uppercase tracking-wide mb-1">
                  Recurring Character:
                </p>
                <p className="text-sm">{article.recurringCharacter}</p>
              </div>
            )}

            {/* Follow-up Hooks */}
            {article.followUpHooks && article.followUpHooks.length > 0 && (
              <div className="mt-6 pt-4 border-t border-border">
                <p className="text-sm font-semibold uppercase tracking-wide mb-2">
                  Related Stories:
                </p>
                <ul className="space-y-1 text-sm">
                  {article.followUpHooks.map((hook, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="mr-2">▸</span>
                      <span>{hook}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
}
