import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { isExtensionCard, getCardExtensionInfo } from '@/data/extensionIntegration';
import { getAllCardsSnapshot } from '@/data/cardDatabase';
import type { ResolvedAsset } from '@/services/assets/types';
import { resolveImage } from '@/services/assets/AssetResolver';
import AutofillControls from '@/ui/devtools/AutofillControls';

interface CardImageProps {
  cardId: string;
  className?: string;
  fit?: 'cover' | 'contain';
}

const getFallbackImagePath = (cardId: string) => {
  if (isExtensionCard(cardId)) {
    const extensionInfo = getCardExtensionInfo(cardId);

    if (extensionInfo?.id?.toLowerCase().includes('cryptids')) {
      return '/lovable-uploads/c290a92b-014a-4427-8dd2-a78b76dd986e.png';
    }

    if (extensionInfo?.id?.toLowerCase().includes('halloween_spooktacular')) {
      return '/card-art/halloween_spooktacular-Temp-Image.png';
    }
  }

  const lower = cardId.toLowerCase();

  if (lower.startsWith('hallo-')) {
    return '/card-art/halloween_spooktacular-Temp-Image.png';
  }

  if (
    lower.includes('bigfoot') ||
    lower.includes('mothman') ||
    lower.includes('chupacabra') ||
    lower.includes('cryptid') ||
    lower.includes('men_in_black') ||
    lower.includes('area_51') ||
    lower.includes('roswell')
  ) {
    return '/lovable-uploads/c290a92b-014a-4427-8dd2-a78b76dd986e.png';
  }

  return '/lovable-uploads/e7c952a9-333a-4f6b-b1b5-f5aeb6c3d9c1.png';
};

const CardImage: React.FC<CardImageProps> = ({ cardId, className = '', fit = 'cover' }) => {
  const card = useMemo(() => getAllCardsSnapshot().find(item => item.id === cardId), [cardId]);
  const fallbackImagePath = useMemo(() => getFallbackImagePath(cardId), [cardId]);
  const [asset, setAsset] = useState<ResolvedAsset | null>(null);
  const [imageUrl, setImageUrl] = useState<string>(fallbackImagePath);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isResolving, setIsResolving] = useState(false);

  const assetContext = useMemo(() => {
    if (!card) return null;
    return {
      scope: 'card' as const,
      card,
      tags: card.artTags,
      fallbackUrl: fallbackImagePath,
    };
  }, [card, fallbackImagePath]);

  useEffect(() => {
    setImageUrl(fallbackImagePath);
    setImageLoaded(false);
    setImageError(false);
  }, [fallbackImagePath, cardId]);

  useEffect(() => {
    if (!assetContext) {
      setAsset(null);
      setImageUrl(fallbackImagePath);
      return;
    }

    let cancelled = false;
    setIsResolving(true);

    resolveImage(assetContext)
      .then(result => {
        if (cancelled) return;
        setAsset(result);
        if (result?.styledUrl) {
          setImageUrl(result.styledUrl);
        } else if (result?.url) {
          setImageUrl(result.url);
        } else {
          setImageUrl(fallbackImagePath);
        }
      })
      .catch(() => {
        if (cancelled) return;
        setAsset(null);
        setImageUrl(fallbackImagePath);
      })
      .finally(() => {
        if (!cancelled) {
          setIsResolving(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [assetContext, fallbackImagePath]);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const handleImageError = useCallback(() => {
    setImageLoaded(false);

    const metadata = asset?.metadata as Record<string, unknown> | undefined;
    const fallbackFromMetadata =
      typeof metadata?.['extensionFallback'] === 'string'
        ? (metadata['extensionFallback'] as string)
        : undefined;
    if (fallbackFromMetadata && fallbackFromMetadata !== imageUrl) {
      setImageUrl(fallbackFromMetadata);
      return;
    }

    if (!imageError) {
      setImageError(true);
      setImageUrl(fallbackImagePath);
    }
  }, [asset, fallbackImagePath, imageError, imageUrl]);

  const containerClassName = cn(
    'relative overflow-hidden',
    fit === 'contain' && 'bg-muted/20',
    className,
  );

  const loadingClassName = cn(
    'absolute inset-0 flex items-center justify-center text-xs text-muted-foreground animate-pulse',
    fit === 'contain' ? 'bg-muted/30' : 'bg-muted/20',
  );

  const imageClassName = cn(
    'h-full w-full',
    fit === 'contain' ? 'object-contain' : 'object-cover',
  );

  const handleResolved = useCallback(
    (resolved: ResolvedAsset | null) => {
      if (!resolved) return;
      setAsset(resolved);
      setImageLoaded(false);
      setImageUrl(resolved.styledUrl ?? resolved.url);
      setImageError(false);
    },
    [],
  );

  const showControls = assetContext && card?.artPolicy !== 'manual';

  return (
    <div className={containerClassName}>
      {(!imageLoaded || isResolving) && (
        <div className={loadingClassName}>
          {isResolving ? 'Resolving art…' : 'Loading...'}
        </div>
      )}

      <img
        src={imageUrl}
        alt={`Card art for ${cardId}`}
        className={imageClassName}
        onLoad={handleImageLoad}
        onError={handleImageError}
      />

      {asset?.credit && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-black/60 px-2 py-1 text-[10px] text-muted-foreground">
          <span className="line-clamp-2">{asset.credit}</span>
        </div>
      )}

      {showControls && assetContext && (
        <div className="pointer-events-none absolute inset-x-1 bottom-1">
          <div className="pointer-events-auto">
            <AutofillControls context={assetContext} onResolved={handleResolved} className="mt-0 bg-background/95" />
          </div>
        </div>
      )}
    </div>
  );
};

export default CardImage;