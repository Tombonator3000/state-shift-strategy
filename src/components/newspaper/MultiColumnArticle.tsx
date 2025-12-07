import { cn } from '@/lib/utils';

interface MultiColumnArticleProps {
  headline: string;
  subhead?: string;
  content: string | string[];
  columns?: 1 | 2 | 3;
  byline?: string;
  image?: React.ReactNode;
  imagePosition?: 'top' | 'left' | 'right';
  className?: string;
}

export const MultiColumnArticle = ({
  headline,
  subhead,
  content,
  columns = 2,
  byline,
  image,
  imagePosition = 'top',
  className,
}: MultiColumnArticleProps) => {
  const contentArray = Array.isArray(content) ? content : content.split('\n\n');
  
  const columnClass = {
    1: 'column-count-1',
    2: 'column-count-1 sm:column-count-2',
    3: 'column-count-1 sm:column-count-2 lg:column-count-3',
  }[columns];

  return (
    <article className={cn("newspaper-article", className)}>
      <div className="mb-2 sm:mb-4">
        <h2
          className="font-black text-xl sm:text-2xl md:text-3xl mb-1 sm:mb-2 leading-tight uppercase border-b-2 sm:border-b-4 border-foreground pb-1 sm:pb-2 break-words hyphens-auto"
          style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}
        >
          {headline}
        </h2>

        {subhead && (
          <p className="text-sm sm:text-base md:text-lg font-bold mb-1 sm:mb-2 text-muted-foreground italic break-words">
            {subhead}
          </p>
        )}

        {byline && (
          <p className="text-xs sm:text-sm font-mono mb-2 sm:mb-3 text-muted-foreground">
            {byline}
          </p>
        )}
      </div>

      <div className={cn(
        "flex gap-2 sm:gap-4",
        imagePosition === 'left' && "flex-col md:flex-row",
        imagePosition === 'right' && "flex-col md:flex-row-reverse",
        imagePosition === 'top' && "flex-col"
      )}>
        {image && (
          <div className={cn(
            "flex-shrink-0",
            imagePosition === 'top' && "w-full mb-2 sm:mb-4",
            (imagePosition === 'left' || imagePosition === 'right') && "w-full md:w-1/3 md:min-w-[160px] lg:min-w-[200px]"
          )}>
            {image}
          </div>
        )}

        <div
          className={cn(
            columnClass,
            "gap-2 sm:gap-4 text-xs sm:text-sm leading-relaxed",
            "newspaper-columns"
          )}
          style={{
            columnGap: '0.75rem',
            columnRule: '1px solid hsl(var(--border))',
          }}
        >
          {contentArray.map((paragraph, i) => (
            <p
              key={i}
              className="mb-2 sm:mb-3 break-inside-avoid text-justify break-words"
              style={{ textIndent: i === 0 ? '1em' : '0' }}
            >
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </article>
  );
};
