import React from 'react';
import { cn } from '@/lib/utils';

export type CardFrameSize = 'modal' | 'boardMini' | 'handMini';

type CardFrameProps = {
  children: React.ReactNode;
  size?: CardFrameSize;
  className?: string;
};

const SIZE_TO_SCALE: Record<CardFrameSize, number> = {
  modal: 1,
  boardMini: 0.72,
  handMini: 0.78,
};

export function CardFrame({ children, size = 'modal', className }: CardFrameProps) {
  const scale = SIZE_TO_SCALE[size];
  const frameRef = React.useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = React.useState<{ width: number; height: number }>({
    width: 320,
    height: 450,
  });

  React.useLayoutEffect(() => {
    const frameEl = frameRef.current;
    if (!frameEl) {
      return;
    }

    const child = frameEl.firstElementChild as HTMLElement | null;
    if (!child) {
      return;
    }

    const updateDimensions = () => {
      setDimensions(prev => {
        const next = {
          width: child.offsetWidth || prev.width,
          height: child.offsetHeight || prev.height,
        };

        if (prev.width === next.width && prev.height === next.height) {
          return prev;
        }

        return next;
      });
    };

    updateDimensions();

    if (typeof ResizeObserver === 'function') {
      const observer = new ResizeObserver(entries => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          setDimensions(prev => {
            const next = {
              width: width || prev.width,
              height: height || prev.height,
            };

            if (prev.width === next.width && prev.height === next.height) {
              return prev;
            }

            return next;
          });
        }
      });

      observer.observe(child);

      return () => {
        observer.disconnect();
      };
    }

    if (typeof window !== 'undefined') {
      const resizeHandler = () => updateDimensions();
      window.addEventListener('resize', resizeHandler);

      return () => {
        window.removeEventListener('resize', resizeHandler);
      };
    }

    return undefined;
  }, [children]);

  const scaledWidth = dimensions.width * scale;
  const scaledHeight = dimensions.height * scale;

  return (
    <div
      ref={frameRef}
      className={cn('card-frame', className)}
      style={{
        width: `${scaledWidth}px`,
        height: `${scaledHeight}px`,
        ['--card-scale' as any]: scale,
      }}
      aria-label={size === 'modal' ? 'Card (full)' : 'Card (mini)'}
    >
      {children}
    </div>
  );
}

