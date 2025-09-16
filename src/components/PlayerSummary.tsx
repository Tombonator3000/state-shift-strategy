import type { PlayerState } from "../engine/types";

export const PlayerSummary = ({ player }: { player: PlayerState }) => {
  return (
    <section className="player-summary">
      <h2>{player.id} · {player.faction.toUpperCase()}</h2>
      <div className="stats">
        <div><span className="label">IP</span> <span className="value">{player.ip}</span></div>
        <div><span className="label">Deck</span> <span className="value">{player.deck.length}</span></div>
        <div><span className="label">Hand</span> <span className="value">{player.hand.length}</span></div>
        <div><span className="label">Discard</span> <span className="value">{player.discard.length}</span></div>
        <div><span className="label">States</span> <span className="value">{player.states.join(", ") || "—"}</span></div>
      </div>
    </section>
  );
};
