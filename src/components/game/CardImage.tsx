import React, { useState } from 'react';
import { isExtensionCard, getCardExtensionInfo } from '@/data/extensionIntegration';

interface CardImageProps {
  cardId: string;
  className?: string;
}

const CardImage: React.FC<CardImageProps> = ({ cardId, className = '' }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Check if this is an extension card with temp image
  const getImagePath = () => {
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