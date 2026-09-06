import CardImage from '@/components/game/CardImage';
import type { GameCard } from '@/rules/mvp';
import { formatEffect } from '@/lib/cardUi';
import { Crosshair, Radio, Zap, Layers, Shield, Clock3 } from 'lucide-react';

const cardIcons = { ATTACK: Zap, MEDIA: Radio, ZONE: Crosshair, HYBRID: Layers, TRAP: Shield, PERSISTENT: Clock3 };

/** A readable hand thumbnail. Full rules and discard actions live in the inspector. */
export function MobileHandCard({ card, affordable, selected, queued, busy }: {
  card: GameCard;
  affordable: boolean;
  selected: boolean;
  queued: boolean;
  busy: boolean;
}) {
  const Icon = cardIcons[card.type] ?? Layers;
  return (
    <span className="mobile-hand-card" data-type={card.type} data-affordable={affordable} data-selected={selected} data-queued={queued}>
      <span className="mobile-card-art"><CardImage cardId={card.id} className="h-full w-full object-cover" fallback={
        <span className="mobile-card-signal" data-type={card.type} role="img" aria-label={`${card.type} field dossier illustration`}>
          <span className="mobile-signal-orbit" /><Icon size={46} strokeWidth={1.35} aria-hidden="true" /><span className="mobile-signal-lines" />
        </span>
      } /></span>
      <span className="mobile-card-cost" aria-label={`${card.cost} IP cost`}>{card.cost}<small>IP</small></span>
      <span className="mobile-card-type"><Icon size={12} aria-hidden="true" />{card.type}</span>
      <span className="mobile-card-copy"><strong>{card.name}</strong><span>{formatEffect(card)}</span></span>
      {(busy || selected || queued || !affordable) && (
        <span className="mobile-card-state">{busy ? 'Playing…' : selected ? 'Choose target' : queued ? 'Discard queued' : 'Need more IP'}</span>
      )}
    </span>
  );
}
