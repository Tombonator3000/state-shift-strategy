import type { GameState } from "../engine/types";
import { STATES } from "../data/states";

const ownerLabel = (game: GameState, stateId: string): string => {
  if (game.players.P1.states.includes(stateId)) return "P1";
  if (game.players.P2.states.includes(stateId)) return "P2";
  return "—";
};

export const StatePressureTable = ({ game }: { game: GameState }) => {
  return (
    <table className="pressure-table">
      <thead>
        <tr>
          <th>State</th>
          <th>Defense</th>
          <th>P1 Pressure</th>
          <th>P2 Pressure</th>
          <th>Owner</th>
        </tr>
      </thead>
      <tbody>
        {STATES.map(state => {
          const pressure = game.pressureByState[state.id];
          return (
            <tr key={state.id}>
              <td>{state.id}</td>
              <td>{state.defense}</td>
              <td>{pressure?.P1 ?? 0}</td>
              <td>{pressure?.P2 ?? 0}</td>
              <td>{ownerLabel(game, state.id)}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};
