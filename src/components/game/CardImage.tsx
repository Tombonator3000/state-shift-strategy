import React, { useState } from 'react';
import { isExtensionCard, getCardExtensionInfo } from '@/data/extensionIntegration';

interface CardImageProps {
  cardId: string;
  className?: string;
}

const CardImage: React.FC<CardImageProps> = ({ cardId, className = '' }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Check if this is an extension card and determine appropriate image
  const getImagePath = () => {
    // Primary: extension metadata
    if (isExtensionCard(cardId)) {
      const extensionInfo = getCardExtensionInfo(cardId);
      if (extensionInfo?.id?.toLowerCase().includes('halloween_spooktacular')) {
        return '/card-art/halloween_spooktacular-Temp-Image.png';
      }
      if (extensionInfo?.id?.toLowerCase().includes('cryptids')) {
        return '/lovable-uploads/e77a8c78-91bb-46f5-b640-46f4c940371b.png';
      }
    }

    // Fallback: card id naming convention for expansions
    if (cardId.toLowerCase().startsWith('hallo-')) {
      return '/card-art/halloween_spooktacular-Temp-Image.png';
    }
    if (cardId.toLowerCase().startsWith('crypt-')) {
      return '/lovable-uploads/e77a8c78-91bb-46f5-b640-46f4c940371b.png';
    }

    // Default PARANOID TIMES placeholder
    return '/lovable-uploads/e7c952a9-333a-4f6b-b1b5-f5aeb6c3d9c1.png';
  };

  const imagePath = getImagePath();

  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!imageLoaded && (
        <div className="absolute inset-0 bg-muted/20 flex items-center justify-center text-xs text-muted-foreground animate-pulse">
          Loading...
        </div>
      )}
      
      <img
        src={imagePath}
        alt={`Card art for ${cardId}`}
        className="w-full h-full object-cover"
        onLoad={handleImageLoad}
        onError={handleImageError}
      />
    </div>
  );
};

export default CardImage;