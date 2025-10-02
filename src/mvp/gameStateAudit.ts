import type { GameState, PlayerId, PlayerState } from './validator';

export type GameStateAuditFinding = {
  level: 'info' | 'warning';
  message: string;
};

export class GameStateAuditError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GameStateAuditError';
  }
}

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

const assertState = (condition: boolean, message: string): asserts condition => {
  if (!condition) {
    throw new GameStateAuditError(message);
  }
};

const PLAYER_IDS: readonly PlayerId[] = ['P1', 'P2'];

const validatePlayer = (
  state: GameState,
  playerId: PlayerId,
  playersStates: Map<PlayerId, Set<string>>,
): GameStateAuditFinding => {
  const player = state.players[playerId];
  assertState(Boolean(player), `Missing player entry for ${playerId}`);

  const playerState = player as PlayerState;
  assertState(playerState.id === playerId, `Player ${playerId} has mismatched id '${playerState.id}'`);
  assertState(
    playerState.faction === 'truth' || playerState.faction === 'government',
    `Player ${playerId} has invalid faction '${playerState.faction}'`,
  );
  assertState(isFiniteNumber(playerState.ip), `Player ${playerId} IP must be a finite number`);
  assertState(playerState.ip >= 0, `Player ${playerId} IP cannot be negative`);
  assertState(Array.isArray(playerState.deck), `Player ${playerId} deck must be an array`);
  assertState(Array.isArray(playerState.hand), `Player ${playerId} hand must be an array`);
  assertState(Array.isArray(playerState.discard), `Player ${playerId} discard must be an array`);
  assertState(Array.isArray(playerState.states), `Player ${playerId} states must be an array`);

  if (playerState.nextAttackMultiplier !== undefined) {
    assertState(
      isFiniteNumber(playerState.nextAttackMultiplier),
      `Player ${playerId} nextAttackMultiplier must be numeric when defined`,
    );
    assertState(
      playerState.nextAttackMultiplier >= 0,
      `Player ${playerId} nextAttackMultiplier cannot be negative`,
    );
  }

  const normalizedStates = new Set<string>();
  for (const rawStateId of playerState.states) {
    assertState(typeof rawStateId === 'string', `Player ${playerId} has non-string state entry`);
    const stateId = rawStateId.trim();
    assertState(stateId.length > 0, `Player ${playerId} has blank state entry`);
    assertState(!normalizedStates.has(stateId), `Player ${playerId} has duplicate state '${stateId}'`);
    normalizedStates.add(stateId);

    const pressure = state.pressureByState?.[stateId];
    assertState(pressure !== undefined, `Missing pressure entry for state '${stateId}' controlled by ${playerId}`);
    assertState(
      typeof pressure === 'object' && pressure !== null,
      `Pressure entry for '${stateId}' must be an object`,
    );

    for (const candidateId of PLAYER_IDS) {
      const value = (pressure as Record<PlayerId, unknown>)[candidateId];
      assertState(isFiniteNumber(value), `Pressure for '${stateId}' must include numeric value for ${candidateId}`);
      assertState((value as number) >= 0, `Pressure for '${stateId}' cannot be negative for ${candidateId}`);
    }

    const ownerPressure = (pressure as Record<PlayerId, number>)[playerId];
    assertState(ownerPressure === 0, `Controlled state '${stateId}' must have zero pressure for ${playerId}`);

    const opponentId = playerId === 'P1' ? 'P2' : 'P1';
    const opponentPressure = (pressure as Record<PlayerId, number>)[opponentId];
    assertState(
      opponentPressure === 0,
      `Controlled state '${stateId}' must not retain opponent pressure (${opponentId})`,
    );

    const defense = state.stateDefense?.[stateId];
    assertState(isFiniteNumber(defense), `Missing defense value for controlled state '${stateId}'`);
    assertState((defense as number) >= 0, `Defense for controlled state '${stateId}' cannot be negative`);
  }

  playersStates.set(playerId, normalizedStates);

  return {
    level: 'info',
    message: `Player ${playerId} controls ${normalizedStates.size} state${
      normalizedStates.size === 1 ? '' : 's'
    } with ${playerState.ip} IP`,
  };
};

export function auditGameState(state: GameState): GameStateAuditFinding[] {
  assertState(Boolean(state), 'Game state must be provided');
  assertState(isFiniteNumber(state.truth), 'Truth value must be a finite number');
  assertState(state.truth >= 0 && state.truth <= 100, `Truth value ${state.truth} is outside 0-100`);
  assertState(PLAYER_IDS.includes(state.currentPlayer), `Invalid currentPlayer '${state.currentPlayer}'`);
  assertState(Number.isInteger(state.turn) && state.turn >= 0, `Turn must be a non-negative integer`);
  assertState(
    Number.isInteger(state.playsThisTurn) && state.playsThisTurn >= 0,
    `playsThisTurn must be a non-negative integer`,
  );
  assertState(Array.isArray(state.turnPlays), 'turnPlays must be an array');
  assertState(Array.isArray(state.log), 'log must be an array');
  assertState(
    state.pressureByState !== null && typeof state.pressureByState === 'object',
    'pressureByState must be an object',
  );
  assertState(
    state.stateDefense !== null && typeof state.stateDefense === 'object',
    'stateDefense must be an object',
  );

  const playerStates = new Map<PlayerId, Set<string>>();
  const findings: GameStateAuditFinding[] = [];
  for (const playerId of PLAYER_IDS) {
    findings.push(validatePlayer(state, playerId, playerStates));
  }

  const p1States = playerStates.get('P1') ?? new Set<string>();
  const p2States = playerStates.get('P2') ?? new Set<string>();
  const overlap = Array.from(p1States).filter(stateId => p2States.has(stateId));
  assertState(overlap.length === 0, `States cannot be controlled by both players: ${overlap.join(', ')}`);

  for (const [stateId, pressure] of Object.entries(state.pressureByState)) {
    assertState(
      pressure !== null && typeof pressure === 'object',
      `Pressure entry for '${stateId}' must be an object`,
    );

    for (const playerId of PLAYER_IDS) {
      const value = (pressure as Record<PlayerId, unknown>)[playerId];
      assertState(isFiniteNumber(value), `Pressure for '${stateId}' must include numeric value for ${playerId}`);
      assertState((value as number) >= 0, `Pressure for '${stateId}' cannot be negative for ${playerId}`);
    }

    const defenseValue = state.stateDefense[stateId];
    if (defenseValue !== undefined) {
      assertState(isFiniteNumber(defenseValue), `Defense for '${stateId}' must be numeric`);
      assertState(defenseValue >= 0, `Defense for '${stateId}' cannot be negative`);
    }
  }

  for (const [stateId, defense] of Object.entries(state.stateDefense)) {
    assertState(isFiniteNumber(defense), `Defense for '${stateId}' must be numeric`);
    assertState(defense >= 0, `Defense for '${stateId}' cannot be negative`);
  }

  findings.push({
    level: 'info',
    message: `Turn ${state.turn} audit completed (truth=${state.truth})`,
  });

  return findings;
}
