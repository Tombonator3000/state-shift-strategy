import { useMemo, useState } from "react";
import type { Card, EffectsATTACK, EffectsMEDIA, EffectsZONE } from "../engine/types";
import type { STATES } from "../data/states";

const stateOptions = (states: typeof STATES) => states.map(state => ({ value: state.id, label: `${state.id} (DEF ${state.defense})` }));

const describeCard = (card: Card) => {
  switch (card.type) {
    case "ATTACK": {
      const attack = card.effects as EffectsATTACK;
      const base = `Drain ${attack.ipDelta.opponent} IP`;
      if (attack.discardOpponent) {
        return `${base} · Opponent discards ${attack.discardOpponent}`;
      }
      return base;
    }
    case "MEDIA": {
      const media = card.effects as EffectsMEDIA;
      const magnitude = Math.abs(media.truthDelta);
      return `Adjust Truth ${media.truthDelta > 0 ? "+" : "-"}${magnitude}%`;
    }
    case "ZONE": {
      const zone = card.effects as EffectsZONE;
      return `Add +${zone.pressureDelta} Pressure (needs target)`;
    }
    default:
      return "";
  }
};

type HandProps = {
  cards: Card[];
  onPlay: (cardId: string, targetStateId?: string) => void;
  onToggleDiscard: (cardId: string) => void;
  discardSelection: Set<string>;
  playable: (card: Card, targetStateId?: string) => { ok: boolean; reason?: string };
  states: typeof STATES;
};

export const Hand = ({ cards, onPlay, playable, states, discardSelection, onToggleDiscard }: HandProps) => {
  const [zoneTargets, setZoneTargets] = useState<Record<string, string>>({});

  const options = useMemo(() => stateOptions(states), [states]);

  const handlePlay = (card: Card) => {
    const target = card.type === "ZONE" ? zoneTargets[card.id] : undefined;
    onPlay(card.id, target);
    if (discardSelection.has(card.id)) {
      onToggleDiscard(card.id);
    }
  };

  return (
    <div className="hand">
      {cards.length === 0 && <p className="empty">No cards in hand.</p>}
      {cards.map(card => {
        const target = card.type === "ZONE" ? zoneTargets[card.id] : undefined;
        const check = playable(card, target);
        const isDiscarding = discardSelection.has(card.id);
        return (
          <div key={card.id} className={`card ${card.type.toLowerCase()} ${isDiscarding ? "discarding" : ""}`}>
            <header>
              <span className="name">{card.name}</span>
              <span className="cost">IP {card.cost}</span>
            </header>
            <div className="details">
              <div className="type">{card.type} · {card.rarity}</div>
              <div className="effect">{describeCard(card)}</div>
              {card.flavor && <div className="flavor">{card.flavor}</div>}
            </div>
            {card.type === "ZONE" && (
              <label className="target">
                Target State
                <select
                  value={target ?? ""}
                  onChange={event => setZoneTargets(prev => ({ ...prev, [card.id]: event.target.value }))}
                >
                  <option value="">Select state</option>
                  {options.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>
            )}
            <div className="actions">
              <button
                type="button"
                onClick={() => handlePlay(card)}
                disabled={!check.ok}
                title={check.reason}
              >
                Play
              </button>
              <button
                type="button"
                onClick={() => onToggleDiscard(card.id)}
                className={isDiscarding ? "active" : ""}
              >
                {isDiscarding ? "Cancel Discard" : "Mark Discard"}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
