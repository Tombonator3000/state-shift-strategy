import React, { useState, useEffect, useRef } from 'react';
import type { GameCard } from '@/types/cardTypes';
import { CardTextGenerator } from '@/systems/CardTextGenerator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import CardImage from '@/components/game/CardImage';
import type { SourceZone } from '@/contexts/CardPreviewContext';

interface CardPreviewProps {
  card: GameCard;
  sourceZone: SourceZone;
  onClose: () => void;
}

export function CardPreview({ card, sourceZone, onClose }: CardPreviewProps) {
  const [fullArt, setFullArt] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (fullArt) {
          setFullArt(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handler);
    modalRef.current?.focus();
    return () => window.removeEventListener('keydown', handler);
  }, [fullArt, onClose]);

  const zoneLabel = () => {
    switch (sourceZone) {
      case 'board':
        return 'In Play – Board';
      case 'discard':
        return 'Discard Pile';
      case 'zone':
        return 'Zone';
      case 'timeline':
        return 'Timeline';
      default:
        return null;
    }
  };

  const renderRules = (c: GameCard) => {
    if (c.effects && Object.keys(c.effects).length > 0) {
      return CardTextGenerator.generateRulesText(c.effects);
    }
    return c.text || '';
  };

  const flavorText = card.faction === 'truth' ? card.flavorTruth : card.flavorGov;

  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="card-modal"
        role="dialog"
        aria-modal="true"
        aria-label={`${card.name} preview`}
        tabIndex={-1}
        ref={modalRef}
        onClick={e => e.stopPropagation()}
      >
        <header className="card-header">
          <h3 style={{ fontFamily: 'var(--font-head)' }} className="text-lg font-semibold flex-1 truncate">
            {card.name}
          </h3>
          <span
            className="font-bold rounded-full px-2 py-1 text-sm"
            style={{
              background: 'var(--accent)',
              color: 'var(--paper)',
              fontFamily: 'var(--font-ui)'
            }}
          >
            {card.cost} IP
          </span>
          <Button aria-label="Close" onClick={onClose} size="icon" variant="ghost">
            ✕
          </Button>
        </header>

        <div className="card-meta" style={{ fontFamily: 'var(--font-ui)' }}>
          {zoneLabel() && <Badge variant="secondary">{zoneLabel()}</Badge>}
          <Badge variant="outline">{card.type}</Badge>
          <Badge
            style={{
              background: `var(--rarity-${card.rarity?.toLowerCase() || 'common'})`,
              color: 'var(--ink)'
            }}
          >
            {card.rarity}
          </Badge>
        </div>

        <div className="card-content">
          <aside className="artwork-pane">
            <CardImage cardId={card.id} className="w-full h-full" />
            <div className="artwork-actions">
              <Button onClick={() => setFullArt(true)} size="sm">
                View Full Art
              </Button>
            </div>
          </aside>

          <main className="text-pane" style={{ fontFamily: 'var(--font-ui)' }}>
            <section className="text-section">
              <h4>Effect</h4>
              <p>{renderRules(card)}</p>
            </section>
            {flavorText && (
              <details className="text-section" open>
                <summary style={{ fontFamily: 'var(--font-head)' }}>Lore</summary>
                <p>{flavorText}</p>
              </details>
            )}
          </main>
        </div>

        {fullArt && (
          <div className="fullart-overlay" onClick={() => setFullArt(false)}>
            <CardImage cardId={card.id} className="max-w-[92vw] max-h-[92vh] object-contain" />
          </div>
        )}
      </div>
    </div>
  );
}

export default CardPreview;
