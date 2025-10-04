import { useEffect, useMemo, useState } from 'react';

import { loadArticleBank, type ArticleBank, type CardArticle } from '@/engine/news/articleBank';
import { generateMainStory, type GeneratedStory, type PlayedCardMeta } from '@/engine/news/mainStory';
import newspaperData from '@/data/newspaperData.json';
import { cn } from '@/lib/utils';

const DEFAULT_FALLBACK = {
  headline: 'SPECIAL EDITION: PRINTING GREMLINS AT WORK',
  subhead: 'Article vault temporarily unavailable — dispatch desk investigating.',
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
  const [articleBankReady, setArticleBankReady] = useState(false);

  const dominantFaction = normaliseFaction(faction ?? cards[0]?.faction);
  const kickerLabel = dominantFaction === 'TRUTH' ? 'FRONT PAGE DISPATCH' : 'OFFICIAL GOVERNMENT BULLETIN';

  useEffect(() => {
    let cancelled = false;

    loadArticleBank()
      .then(bank => {
        if (!cancelled) {
          setArticleBank(bank);
          setArticleBankReady(bank.hasArticles());
        }
      })
      .catch(error => {
        console.warn('Failed to load article bank for front page', error);
        if (!cancelled) {
          setArticleBank(null);
          setArticleBankReady(false);
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

  const hasSecondaryArticles = articleBankReady && secondaryStories.some(({ article }) => Boolean(article));

  const headline = mainStory?.headline ?? headlineFallback.headline;
  const toneClass = mainStory?.tone ?? (dominantFaction === 'GOV' ? 'gov' : 'truth');

  const flavorSubhead =
    mainStory?.subhead ??
    (Array.isArray(newspaperData?.subheads) && newspaperData.subheads.length
      ? newspaperData.subheads[(cards[0]?.id?.length ?? 0) % newspaperData.subheads.length]
      : headlineFallback.subhead);

  const displaySubhead = flavorSubhead ?? headlineFallback.subhead;

  return (
    <div className={cn('frontpage text-newspaper-text', className)}>
      <section className="frontpage-main">
        <div className={cn('kicker text-newspaper-text/70')}>{kickerLabel}</div>
        <h1 className={cn('headline', toneClass)}>{headline}</h1>
        {displaySubhead ? <p className="subhead">{displaySubhead}</p> : null}
      </section>

      <section className="frontpage-secondary">
        <h2 className="section-title">SECONDARY REPORTS</h2>
        {hasSecondaryArticles ? (
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
        ) : (
          <ul className="space-y-2 rounded border border-dashed border-newspaper-border/60 bg-white/60 p-4 text-sm italic">
            {cards.map(card => (
              <li key={card.id} className="flex flex-wrap items-center gap-2">
                <span className="rounded border border-newspaper-border/60 bg-white px-2 py-1 text-xs font-semibold uppercase tracking-wide">[{card.type}]</span>
                <span className="font-semibold not-italic">{card.name}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default FrontPage;
