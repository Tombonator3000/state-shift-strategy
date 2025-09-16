import type { FC } from "react";

interface CardImageProps {
  cardId: string;
  className?: string;
}

const CardImage: FC<CardImageProps> = ({ cardId, className = "" }) => {
  return (
    <div className={`relative overflow-hidden rounded ${className}`}>
      <div className="flex h-full w-full items-center justify-center bg-slate-800/70 text-xs text-slate-300">
        ART {cardId}
      </div>
    </div>
  );
};

export default CardImage;
