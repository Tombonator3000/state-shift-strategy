import { useEffect, useMemo, useState } from 'react';

import { loadArticleBank, type ArticleBank, type CardArticle } from '@/engine/news/articleBank';
import { generateMainStory, type GeneratedStory, type PlayedCardMeta } from '@/engine/news/mainStory';
import { cn } from '@/lib/utils';

const ARTICLE_BANK_PATH = '/data/paranoid_times_card_articles_ALL.json';

const DEFAULT_FALLBACK = {
  headline: 'SPECIAL DISPATCH: PRINTING GREMLINS AT WORK',
  subhead: 'Witnesses report escalating weirdness. Officials baffled.',
};

type SecondaryStory = {
  card: PlayedCardMeta;
  article: CardArticle | null;
};

export interface FrontPageProps {
  cards: PlayedCardMeta[];
  className?: string;
  headlineFallback?: { headline: string; subhead: string };
}

const FrontPage = ({ cards, className, headlineFallback = DEFAULT_FALLBACK }: FrontPageProps) => {
  const [articleBank, setArticleBank] = useState<ArticleBank | null>(null);
  const [mainStory, setMainStory] = useState<GeneratedStory | null>(null);

  useEffect(() => {
    let cancelled = false;

    loadArticleBank(ARTICLE_BANK_PATH)
      .then(bank => {
        if (!cancelled) {
          setArticleBank(bank);
        }
      })
      .catch(error => {
        console.warn('Failed to load article bank for front page', error);
        if (!cancelled) {
          setArticleBank(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (cards.length !== 3) {
      setMainStory(null);
      return;
    }

    try {
      const story = generateMainStory(cards, id => articleBank?.getById(id) ?? null);
      setMainStory(story);
    } catch (error) {
      console.warn('Failed to compose main story', error);
      setMainStory(null);
    }
  }, [articleBank, cards]);

  const secondaryStories = useMemo<SecondaryStory[]>(
    () =>
      cards.map(card => ({
        card,
        article: articleBank?.getById(card.id) ?? null,
      })),
    [articleBank, cards],
  );

  const headline = mainStory?.headline ?? headlineFallback.headline;
  const subhead = mainStory?.subhead ?? headlineFallback.subhead;

  return (
    <div className={cn('frontpage', className)}>
      <section className="frontpage-main space-y-2">
        <div className="kicker text-[10px] font-semibold uppercase tracking-[0.35em] text-newspaper-text/60">
          Front Page Dispatch
        </div>
        <h1 className="headline">{headline}</h1>
        {subhead ? <p className="subhead">{subhead}</p> : null}
      </section>

      <section className="frontpage-secondary mt-6 space-y-3">
        <h2 className="section-title text-sm">SECONDARY REPORTS</h2>
        <div className="grid-2">
          {secondaryStories.map(({ card, article }) => {
            const bodyText = article?.body?.trim();
            return (
              <article
                key={card.id}
                className="secondary-article space-y-2 rounded border border-newspaper-border/60 bg-white/70 p-3"
              >
                <div className="pill text-newspaper-text/80">[{card.type}]</div>
                <h3 className="text-lg font-semibold leading-snug text-newspaper-headline">
                  {article?.headline ?? card.name}
                </h3>
                {article?.subhead ? (
                  <p className="muted text-sm italic text-newspaper-text/70">{article.subhead}</p>
                ) : null}
                {bodyText ? <p className="text-sm leading-relaxed text-newspaper-text/80">{bodyText}</p> : null}
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default FrontPage;
