import React, { useState } from 'react';

interface CardImageProps {
  cardId: string;
  className?: string;
}

const CardImage: React.FC<CardImageProps> = ({ cardId, className = '' }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Always use PARANOID TIMES placeholder for now
  const placeholderImagePath = '/lovable-uploads/e7c952a9-333a-4f6b-b1b5-f5aeb6c3d9c1.png';

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
        src={placeholderImagePath}
        alt={`PARANOID TIMES - Card art for ${cardId}`}
        className="w-full h-full object-cover"
        onLoad={handleImageLoad}
      />
    </div>
  );
};

export default CardImage;