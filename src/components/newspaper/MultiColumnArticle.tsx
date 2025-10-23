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
      <div className="mb-4">
        <h2
          className="font-black text-3xl mb-2 leading-tight uppercase border-b-4 border-foreground pb-2"
          style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}
        >
          {headline}
        </h2>

        {subhead && (
          <p className="text-lg font-bold mb-2 text-muted-foreground italic">
            {subhead}
          </p>
        )}

        {byline && (
          <p className="text-sm font-mono mb-3 text-muted-foreground">
            {byline}
          </p>
        )}
      </div>

      <div className={cn(
        "flex gap-4",
        imagePosition === 'left' && "flex-row",
        imagePosition === 'right' && "flex-row-reverse",
        imagePosition === 'top' && "flex-col"
      )}>
        {image && (
          <div className={cn(
            "flex-shrink-0",
            imagePosition === 'top' && "w-full mb-4",
            (imagePosition === 'left' || imagePosition === 'right') && "w-1/3"
          )}>
            {image}
          </div>
        )}

        <div
          className={cn(
            columnClass,
            "gap-4 text-sm leading-relaxed",
            "newspaper-columns"
          )}
          style={{
            columnGap: '1rem',
            columnRule: '1px solid hsl(var(--border))',
          }}
        >
          {contentArray.map((paragraph, i) => (
            <p
              key={i}
              className="mb-3 break-inside-avoid text-justify"
              style={{ textIndent: i === 0 ? '2em' : '0' }}
            >
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </article>
  );
};
