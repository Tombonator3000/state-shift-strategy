import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { isExtensionCard, getCardExtensionInfo } from '@/data/extensionIntegration';

interface CardImageProps {
  cardId: string;
  className?: string;
  fit?: 'cover' | 'contain';
}

const CardImage: React.FC<CardImageProps> = ({ cardId, className = '', fit = 'cover' }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageExtension, setImageExtension] = useState<'jpg' | 'png'>('jpg');

  // Check if this is an extension card with temp image
  const getFallbackImagePath = () => {
    // Primary: extension metadata
    if (isExtensionCard(cardId)) {
      const extensionInfo = getCardExtensionInfo(cardId);
      
      // CRYPTIDS extension temp image
      if (extensionInfo?.id?.toLowerCase().includes('cryptids')) {
        return '/lovable-uploads/c290a92b-014a-4427-8dd2-a78b76dd986e.png';
      }
      
      // Halloween Spooktacular extension temp image  
      if (extensionInfo?.id?.toLowerCase().includes('halloween_spooktacular')) {
        return '/card-art/halloween_spooktacular-Temp-Image.png';
      }
    }

    // Fallback: card id naming conventions for extensions
    if (cardId.toLowerCase().startsWith('hallo-')) {
      return '/card-art/halloween_spooktacular-Temp-Image.png';
    }
    
    // CRYPTIDS cards have various prefixes like gov_, truth_ from the extension
    if (cardId.toLowerCase().includes('bigfoot') || 
        cardId.toLowerCase().includes('mothman') || 
        cardId.toLowerCase().includes('chupacabra') ||
        cardId.toLowerCase().includes('cryptid') ||
        cardId.toLowerCase().includes('men_in_black') ||
        cardId.toLowerCase().includes('area_51') ||
        cardId.toLowerCase().includes('roswell')) {
      return '/lovable-uploads/c290a92b-014a-4427-8dd2-a78b76dd986e.png';
    }

    // Default PARANOID TIMES placeholder
    return '/lovable-uploads/e7c952a9-333a-4f6b-b1b5-f5aeb6c3d9c1.png';
  };

  const fallbackImagePath = getFallbackImagePath();
  const imagePath = imageError
    ? fallbackImagePath
    : `/card-art/${cardId}.${imageExtension}`;

  useEffect(() => {
    setImageError(false);
    setImageLoaded(false);
    setImageExtension('jpg');
  }, [cardId]);

  const handleImageError = () => {
    setImageLoaded(false);

    if (!imageError && imageExtension === 'jpg') {
      setImageExtension('png');
      return;
    }

    if (!imageError) {
      setImageError(true);
    }
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

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

  return (
    <div className={containerClassName}>
      {!imageLoaded && (
        <div className={loadingClassName}>
          Loading...
        </div>
      )}

      <img
        src={imagePath}
        alt={`Card art for ${cardId}`}
        className={imageClassName}
        onLoad={handleImageLoad}
        onError={handleImageError}
      />
    </div>
  );
};

export default CardImage;