import type { ArticleBlock } from '@/news/types';
import { cn } from '@/lib/utils';

interface ExtraFeedProps {
  articles: ArticleBlock[];
  className?: string;
  emptyMessage?: string;
}

const getKickerLabel = (tone: ArticleBlock['tone']): string => {
  switch (tone) {
    case 'truth':
      return 'Truth Network Bulletin';
    case 'government':
      return 'Official Government Wire';
    default:
      return 'Breaking Desk Update';
  }
};

const toneHeadlineClass: Record<ArticleBlock['tone'], string> = {
  truth: 'text-truth-red',
  government: 'text-government-blue',
  draw: 'text-newspaper-headline',
};

const toneBadgeClass: Record<ArticleBlock['tone'], string> = {
  truth: 'border-truth-red/60 bg-truth-red/10 text-truth-red',
  government: 'border-government-blue/60 bg-government-blue/10 text-government-blue',
  draw: 'border-newspaper-border/60 bg-newspaper-bg/70 text-newspaper-headline',
};

const ExtraFeed = ({ articles, className, emptyMessage = 'No desk bulletins yet. Play more cards to trigger breaking news.' }: ExtraFeedProps) => {
  const visibleArticles = articles.slice(-4).reverse();

  return (
    <section
      aria-label="Extra Extra news feed"
      className={cn(
        'flex flex-col gap-3 rounded-2xl border-2 border-dashed border-newspaper-border/70 bg-white/70 p-4 text-newspaper-text shadow-sm',
        className,
      )}
    >
      <header className="flex items-center justify-between">
        <h2 className="text-xs font-black uppercase tracking-[0.48em] text-newspaper-text/70">Extra! Extra!</h2>
        <span className="rounded-full border border-newspaper-border/50 bg-newspaper-bg/80 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.32em] text-newspaper-text/60">
          News Desk
        </span>
      </header>

      {visibleArticles.length === 0 ? (
        <p className="rounded border border-dashed border-newspaper-border/50 bg-white/60 px-3 py-4 text-[13px] italic text-newspaper-text/70">
          {emptyMessage}
        </p>
      ) : (
        <div className="space-y-3">
          {visibleArticles.map((article, index) => {
            const badgeClass = toneBadgeClass[article.tone];
            const headlineClass = toneHeadlineClass[article.tone];
            return (
              <article
                key={`${article.hed}-${index}`}
                className="rounded-xl border border-newspaper-border/60 bg-newspaper-bg/70 p-3 shadow-inner"
              >
                <div className={cn('inline-flex items-center rounded-full border px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.42em]', badgeClass)}>
                  {getKickerLabel(article.tone)}
                </div>
                <h3 className={cn('mt-2 font-headline text-xl uppercase tracking-tight text-newspaper-headline', headlineClass)}>
                  {article.hed}
                </h3>
                {article.dek ? (
                  <p className="mt-1 text-sm italic text-newspaper-text/80">{article.dek}</p>
                ) : null}
                {article.bullets.length > 0 ? (
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-[12px] text-newspaper-text/80">
                    {article.bullets.slice(0, 4).map((bullet, bulletIndex) => (
                      <li key={`${bulletIndex}-${bullet.slice(0, 24)}`}>{bullet}</li>
                    ))}
                  </ul>
                ) : null}
                <footer className="mt-3 text-[10px] uppercase tracking-[0.32em] text-newspaper-text/60">
                  <div>{article.byline}</div>
                  <div>{article.source}</div>
                </footer>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default ExtraFeed;

