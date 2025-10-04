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
  faction?: 'truth' | 'gov' | 'TRUTH' | 'GOV';
  headlineFallback?: { headline: string; subhead: string };
}

const normaliseFaction = (value?: string): 'TRUTH' | 'GOV' => {
  if (typeof value === 'string' && value.toUpperCase().includes('GOV')) {
    return 'GOV';
  }
  return 'TRUTH';
};

const FrontPage = ({ cards, className, faction, headlineFallback = DEFAULT_FALLBACK }: FrontPageProps) => {
  const [articleBank, setArticleBank] = useState<ArticleBank | null>(null);
  const [mainStory, setMainStory] = useState<GeneratedStory | null>(null);

  const dominantFaction = normaliseFaction(faction ?? cards[0]?.faction);
  const kickerLabel = dominantFaction === 'TRUTH' ? 'FRONT PAGE DISPATCH' : 'OFFICIAL GOVERNMENT BULLETIN';

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
    if (!articleBank || cards.length !== 3) {
      setMainStory(null);
      return;
    }

    try {
      const story = generateMainStory(cards, id => articleBank.getById(id));
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
  const toneClass = mainStory?.tone ?? (dominantFaction === 'GOV' ? 'gov' : 'truth');

  return (
    <div className={cn('frontpage text-newspaper-text', className)}>
      <section className="frontpage-main">
        <div className={cn('kicker text-newspaper-text/70')}>{kickerLabel}</div>
        <h1 className={cn('headline', toneClass)}>{headline}</h1>
        {subhead ? <p className="subhead">{subhead}</p> : null}
      </section>

      <section className="frontpage-secondary">
        <h2 className="section-title">SECONDARY REPORTS</h2>
        <div className="secondary-grid">
          {secondaryStories.map(({ card, article }) => {
            const bodyText = article?.body?.trim();
            return (
              <article
                key={card.id}
                className={cn('secondary-article border border-newspaper-border/60 bg-white/70 shadow-sm')}
              >
                <div className="pill">[{card.type}]</div>
                <h3 className="secondary-headline text-newspaper-headline">{article?.headline ?? card.name}</h3>
                {article?.subhead ? <p className="muted italic">{article.subhead}</p> : null}
                {bodyText ? <p>{bodyText}</p> : null}
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default FrontPage;
