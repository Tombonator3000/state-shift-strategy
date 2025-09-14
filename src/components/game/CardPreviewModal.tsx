import { useState, useEffect, useRef } from 'react';
import type { SourceZone } from '@/contexts/CardPreviewContext';
import { isExtensionCard, getCardExtensionInfo } from '@/data/extensionIntegration';
import type { GameCard } from '@/types/cardTypes';

type Props = {
  card: GameCard;
  sourceZone: SourceZone;
  onClose: () => void;
};

export default function CardPreviewModal({ card, sourceZone, onClose }: Props) {
  const [showFullArt, setShowFullArt] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const getImagePath = () => {
    if (isExtensionCard(card.id)) {
      const extensionInfo = getCardExtensionInfo(card.id);
      if (extensionInfo?.id?.toLowerCase().includes('cryptids')) {
        return '/lovable-uploads/c290a92b-014a-4427-8dd2-a78b76dd986e.png';
      }
      if (extensionInfo?.id?.toLowerCase().includes('halloween_spooktacular')) {
        return '/card-art/halloween_spooktacular-Temp-Image.png';
      }
    }
    if (card.id.toLowerCase().startsWith('hallo-')) {
      return '/card-art/halloween_spooktacular-Temp-Image.png';
    }
    if (
      card.id.toLowerCase().includes('bigfoot') ||
      card.id.toLowerCase().includes('mothman') ||
      card.id.toLowerCase().includes('chupacabra') ||
      card.id.toLowerCase().includes('cryptid') ||
      card.id.toLowerCase().includes('men_in_black') ||
      card.id.toLowerCase().includes('area_51') ||
      card.id.toLowerCase().includes('roswell')
    ) {
      return '/lovable-uploads/c290a92b-014a-4427-8dd2-a78b76dd986e.png';
    }
    return '/lovable-uploads/e7c952a9-333a-4f6b-b1b5-f5aeb6c3d9c1.png';
  };
  const imagePath = getImagePath();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showFullArt) setShowFullArt(false);
        else onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showFullArt, onClose]);

  return (
    <div className="sg-card-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="sg-card-modal"
        onClick={(e) => e.stopPropagation()}
        ref={modalRef}
        aria-label={`${card.name} preview`}
      >
        <header className="sg-card-header">
          <h3 className="sg-title">{card.name}</h3>
          <span className="sg-pill">{card.cost} IP</span>
          <button className="sg-close" aria-label="Close" onClick={onClose}>✕</button>
        </header>

        <div className="sg-card-meta">
          <span className="sg-badge">In Play – {sourceZone}</span>
          <span className="sg-badge">{card.type}</span>
          {card.rarity && <span className="sg-badge">{card.rarity}</span>}
        </div>

        <div className="sg-card-content">
          <aside className="sg-artwork-pane">
            {imagePath && <img src={imagePath} alt="" />}
            {imagePath && (
              <div className="sg-artwork-actions">
                <button onClick={() => setShowFullArt(true)}>View Full Art</button>
              </div>
            )}
          </aside>

          <main className="sg-text-pane">
            <section className="sg-text-section">
              <h4>Effect</h4>
              <p>{card.text}</p>
            </section>
            {((card.faction?.toLowerCase().startsWith('truth') ? card.flavorTruth : card.flavorGov)) && (
              <section className="sg-text-section">
                <h4>Lore</h4>
                <p>{card.faction?.toLowerCase().startsWith('truth') ? card.flavorTruth : card.flavorGov}</p>
              </section>
            )}
          </main>
        </div>

        {showFullArt && imagePath && (
          <div className="sg-fullart-overlay" onClick={() => setShowFullArt(false)}>
            <img src={imagePath} alt={`${card.name} full art`} />
          </div>
        )}
      </div>
    </div>
  );
}

