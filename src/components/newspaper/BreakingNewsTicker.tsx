import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface NewsItem {
  id: string;
  text: string;
  timestamp: number;
  type?: 'urgent' | 'normal' | 'update';
}

interface BreakingNewsTickerProps {
  className?: string;
}

/**
 * Scrolling news ticker showing recent game events
 * Appears at top of screen during gameplay
 */
export function BreakingNewsTicker({ className }: BreakingNewsTickerProps) {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Listen for custom news events
    const handleNewsEvent = (event: CustomEvent<{ text: string; type?: NewsItem['type'] }>) => {
      const newItem: NewsItem = {
        id: `news-${Date.now()}-${Math.random()}`,
        text: event.detail.text,
        timestamp: Date.now(),
        type: event.detail.type || 'normal',
      };

      setNewsItems(prev => {
        const updated = [newItem, ...prev].slice(0, 10); // Keep last 10 items
        return updated;
      });

      setIsVisible(true);

      // Auto-hide old items after 15 seconds
      setTimeout(() => {
        setNewsItems(prev => prev.filter(item => item.id !== newItem.id));
      }, 15000);
    };

    window.addEventListener('breaking-news' as any, handleNewsEvent);
    return () => window.removeEventListener('breaking-news' as any, handleNewsEvent);
  }, []);

  if (!isVisible || newsItems.length === 0) return null;

  const latestItem = newsItems[0];

  return (
    <Card
      className={cn(
        "fixed left-1/2 -translate-x-1/2 z-40 max-w-2xl w-[calc(100%-2rem)]",
        "bg-destructive/90 text-destructive-foreground backdrop-blur-sm",
        "border-2 border-destructive-foreground/20 shadow-lg",
        "animate-in slide-in-from-top duration-500",
        className
      )}
      style={{
        top: "calc(var(--safe-top, 0px) + var(--masthead-h, 64px) + 0.5rem)",
      }}
    >
      <div className="p-2 flex items-center gap-3">
        <div className="flex-shrink-0">
          <div
            className={cn(
              "px-3 py-1 text-xs font-bold uppercase tracking-wider rounded",
              latestItem.type === 'urgent' && "bg-destructive-foreground text-destructive animate-pulse",
              latestItem.type === 'normal' && "bg-primary text-primary-foreground",
              latestItem.type === 'update' && "bg-secondary text-secondary-foreground"
            )}
          >
            {latestItem.type === 'urgent' ? '⚠️ BREAKING' : '📰 UPDATE'}
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          <div className="ticker-scroll">
            <p className="text-sm font-medium whitespace-nowrap">
              {latestItem.text}
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="flex-shrink-0 hover:bg-destructive-foreground/10 rounded p-1 transition-colors"
          aria-label="Dismiss ticker"
        >
          <span className="text-xs">✕</span>
        </button>
      </div>
    </Card>
  );
}

// Helper function to dispatch news events from anywhere in the app
export function dispatchBreakingNews(text: string, type: NewsItem['type'] = 'normal') {
  window.dispatchEvent(
    new CustomEvent('breaking-news', {
      detail: { text, type },
    })
  );
}
