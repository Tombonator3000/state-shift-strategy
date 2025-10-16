import { useEffect, useMemo, useState } from 'react';

import { getArticleById, loadArticleBank, type ArticleBank } from '@/news/articleBank';
import { generateMainStory, type GeneratedStory, type PlayedCardMeta } from '@/engine/news/mainStory';
import type { FrontPagePackage } from '@/engine/newspaper/IssueGenerator';
import { deriveFrontPageSubhead, type FrontPageSubheadInput } from '@/engine/news/frontPageSubhead';
import { loadNewspaperData, type NewspaperData } from '@/lib/newspaperData';
import { cn } from '@/lib/utils';

const DEFAULT_FALLBACK = {
  headline: 'SPECIAL EDITION: PRINTING GREMLINS AT WORK',
  subhead: 'Article vault temporarily unavailable — dispatch desk investigating.',
};

type SecondaryStory = {
  card: PlayedCardMeta;
  article: {
    headline?: string | null;
    subhead?: string | null;
    body?: string | null;
  } | null;
  isFallback: boolean;
};

export interface FrontPageProps {
  cards?: PlayedCardMeta[];
  className?: string;
  faction?: 'truth' | 'government' | 'TRUTH' | 'GOV' | 'GOVERNMENT';
  headlineFallback?: { headline: string; subhead: string };
  prefetchedStory?: FrontPagePackage | null;
  subheadContext?: Partial<Omit<FrontPageSubheadInput, 'datasetSubheads' | 'fallback' | 'faction'>>;
}

const normaliseFaction = (value?: string): 'TRUTH' | 'GOV' => {
  if (typeof value === 'string') {
    const upper = value.toUpperCase();
    if (upper.includes('GOV')) {
      return 'GOV';
    }
  }
  return 'TRUTH';
};

const FrontPage = ({
  cards = [],
  className,
  faction,
  headlineFallback = DEFAULT_FALLBACK,
  prefetchedStory = null,
  subheadContext,
}: FrontPageProps) => {
  const [articleBank, setArticleBank] = useState<ArticleBank | null>(null);
  const [mainStory, setMainStory] = useState<GeneratedStory | null>(prefetchedStory?.main ?? null);
  const [articleBankReady, setArticleBankReady] = useState(prefetchedStory?.articleBankReady ?? false);
  const [dataset, setDataset] = useState<NewspaperData | null>(null);

  const cardList = useMemo(() => (prefetchedStory?.cards ?? cards), [prefetchedStory, cards]);
  const dominantFaction = normaliseFaction(faction ?? cardList[0]?.faction);
  const kickerLabel = dominantFaction === 'TRUTH' ? 'FRONT PAGE DISPATCH' : 'OFFICIAL GOVERNMENT BULLETIN';

  useEffect(() => {
    let cancelled = false;

    loadNewspaperData()
      .then(data => {
        if (!cancelled) {
          setDataset(data);
        }
      })
      .catch(error => {
        console.warn('Failed to load newspaper dataset', error);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (prefetchedStory) {
      setArticleBank(null);
      setArticleBankReady(prefetchedStory.articleBankReady);
      setMainStory(prefetchedStory.main ?? null);
      return;
    }

    let cancelled = false;

    loadArticleBank()
      .then(bank => {
        if (!cancelled) {
          setArticleBank(bank);
          setArticleBankReady(bank.size > 0);
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
  }, [prefetchedStory]);

  useEffect(() => {
    if (prefetchedStory) {
      return;
    }

    if (cardList.length !== 3) {
      setMainStory(null);
      return;
    }

    try {
      const story = generateMainStory(cardList, id => getArticleById(id, articleBank));
      setMainStory(story);
    } catch (error) {
      console.warn('Failed to compose main story', error);
      setMainStory(null);
    }
  }, [articleBank, cardList, prefetchedStory]);

  const articleMap = useMemo(() => {
    if (!prefetchedStory) {
      return null;
    }
    const map = new Map<string, FrontPagePackage['articles'][number]>();
    for (const article of prefetchedStory.articles) {
      map.set(article.cardId, article);
    }
    return map;
  }, [prefetchedStory]);

  const secondaryStories = useMemo<SecondaryStory[]>(() => {
    if (prefetchedStory && articleMap) {
      return cardList.map(card => {
        const generated = articleMap.get(card.id) ?? null;
        return {
          card,
          article: generated
            ? {
                headline: generated.headline,
                subhead: generated.subhead,
                body: generated.body[0] ?? null,
              }
            : null,
          isFallback: generated ? generated.isFallback : true,
        } satisfies SecondaryStory;
      });
    }

    return cardList.map(card => {
      const article = getArticleById(card.id, articleBank);
      return {
        card,
        article: article
          ? {
              headline: article.headline,
              subhead: article.subhead,
              body: article.body ?? null,
            }
          : null,
        isFallback: !article,
      } satisfies SecondaryStory;
    });
  }, [articleBank, articleMap, cardList, prefetchedStory]);

  const hasSecondaryArticles = prefetchedStory
    ? secondaryStories.some(story => Boolean(story.article) && !story.isFallback)
    : articleBankReady && secondaryStories.some(story => Boolean(story.article));

  const fallbackHeadline = prefetchedStory?.fallbackHeadline ?? headlineFallback.headline;
  const fallbackSubheadBase = prefetchedStory?.fallbackSubhead ?? headlineFallback.subhead;
  const helperFaction = dominantFaction === 'GOV' ? 'government' : 'truth';

  const derivedSubhead = useMemo(() => {
    if (mainStory?.subhead) {
      return mainStory.subhead;
    }
    if (prefetchedStory) {
      return prefetchedStory.fallbackSubhead;
    }
    return deriveFrontPageSubhead({
      datasetSubheads: dataset?.subheads,
      fallback: fallbackSubheadBase,
      combo: subheadContext?.combo ?? null,
      comboOwnerLabel: subheadContext?.comboOwnerLabel ?? null,
      capturedStates: subheadContext?.capturedStates ?? [],
      truthDeltaLabel: subheadContext?.truthDeltaLabel ?? null,
      agendaLabel: subheadContext?.agendaLabel ?? null,
      faction: helperFaction,
    });
  }, [dataset, fallbackSubheadBase, helperFaction, mainStory?.subhead, prefetchedStory, subheadContext]);

  const headline = mainStory?.headline ?? fallbackHeadline;
  const toneClass = mainStory?.tone ?? (dominantFaction === 'GOV' ? 'government' : 'truth');
  const displaySubhead = derivedSubhead ?? fallbackSubheadBase;

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
            {cardList.map(card => (
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
