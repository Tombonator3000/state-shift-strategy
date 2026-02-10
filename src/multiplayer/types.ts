/**
 * Online Multiplayer Types
 *
 * Architecture: WebRTC P2P via PeerJS (host-authoritative)
 *
 * Host PC (useGameState) <-> WebRTC Data Channel <-> Guest PC (read-only mirror)
 *         ^                    PeerJS Cloud                    ^
 *   Runs game logic          (signaling only)        Forwards actions to host
 */

import type { GameState } from '@/hooks/gameStateTypes';
import type { AIDifficulty } from '@/data/aiStrategy';

// ---------------------------------------------------------------------------
// Room & Player
// ---------------------------------------------------------------------------

export type PlayerRole = 'host' | 'guest';
export type PlayerSlot = 0 | 1;

export interface LobbyPlayer {
  /** PeerJS peer id */
  peerId: string;
  /** Display name chosen by user */
  name: string;
  /** Which slot (0 = host, 1 = guest) */
  slot: PlayerSlot;
  /** Player role */
  role: PlayerRole;
  /** Faction chosen (set in lobby) */
  faction?: 'government' | 'truth';
  /** Ready state */
  ready: boolean;
}

export interface RoomConfig {
  /** 6-character uppercase room code */
  roomCode: string;
  /** Victory goal: number of states to control */
  victoryGoal: number;
  /** AI difficulty for any AI players */
  aiDifficulty: AIDifficulty;
  /** Maximum turns (0 = unlimited) */
  maxTurns: number;
}

export interface LobbyState {
  /** Room configuration */
  config: RoomConfig;
  /** Connected players (host is always index 0) */
  players: LobbyPlayer[];
  /** Is the game started? */
  started: boolean;
}

// ---------------------------------------------------------------------------
// Network Messages
// ---------------------------------------------------------------------------

/**
 * All messages sent over the WebRTC data channel.
 * Discriminated union on `type`.
 */
export type NetworkMessage =
  | LobbyJoinMessage
  | LobbyUpdateMessage
  | LobbyReadyMessage
  | LobbyFactionMessage
  | GameStartMessage
  | GameStateMessage
  | GameActionMessage
  | GameActionAckMessage
  | PingMessage
  | PongMessage
  | PlayerDisconnectedMessage
  | ErrorMessage;

// --- Lobby Phase ---

export interface LobbyJoinMessage {
  type: 'lobby-join';
  playerName: string;
  peerId: string;
}

export interface LobbyUpdateMessage {
  type: 'lobby-update';
  lobby: LobbyState;
}

export interface LobbyReadyMessage {
  type: 'lobby-ready';
  peerId: string;
  ready: boolean;
}

export interface LobbyFactionMessage {
  type: 'lobby-faction';
  peerId: string;
  faction: 'government' | 'truth';
}

// --- Game Phase ---

export interface GameStartMessage {
  type: 'game-start';
  lobby: LobbyState;
  /** Initial game state from host */
  initialState: SerializedGameState;
}

export interface GameStateMessage {
  type: 'game-state';
  /** Serialized game state from host */
  state: SerializedGameState;
  /** Monotonic sequence number to discard stale updates */
  seq: number;
}

/** Actions a guest can request the host to execute */
export type GameActionKind =
  | 'playCard'
  | 'endTurn'
  | 'selectCard'
  | 'selectTargetState';

export interface GameActionMessage {
  type: 'game-action';
  /** Which action to execute */
  action: GameActionKind;
  /** Action payload */
  payload: Record<string, unknown>;
  /** Sender's peerId for validation */
  peerId: string;
  /** Request id for ack */
  requestId: string;
}

export interface GameActionAckMessage {
  type: 'game-action-ack';
  requestId: string;
  success: boolean;
  error?: string;
}

// --- Connection Health ---

export interface PingMessage {
  type: 'ping';
  timestamp: number;
}

export interface PongMessage {
  type: 'pong';
  timestamp: number;
}

export interface PlayerDisconnectedMessage {
  type: 'player-disconnected';
  peerId: string;
  playerName: string;
}

export interface ErrorMessage {
  type: 'error';
  code: string;
  message: string;
}

// ---------------------------------------------------------------------------
// Serialized Game State
// ---------------------------------------------------------------------------

/**
 * A JSON-safe subset of GameState that can be sent over the wire.
 * Excludes non-serializable fields (functions, class instances, EventManager).
 */
export type SerializedGameState = Omit<
  GameState,
  'eventManager' | 'aiStrategist'
>;

// ---------------------------------------------------------------------------
// Host-internal actions that guests must NEVER execute locally
// ---------------------------------------------------------------------------

export const HOST_INTERNAL_ACTIONS = new Set([
  'startTurn',
  'processWeekEnd',
  'executeAITurn',
  'checkVictoryConditions',
  'assignSecretAgenda',
  'closeNewspaper',
  'confirmNewCards',
] as const);

// ---------------------------------------------------------------------------
// Connection State
// ---------------------------------------------------------------------------

export type ConnectionStatus =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'error';

export interface MultiplayerSession {
  role: PlayerRole;
  roomCode: string;
  localPlayer: LobbyPlayer;
  remotePlayer: LobbyPlayer | null;
  connectionStatus: ConnectionStatus;
  lobby: LobbyState;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Generate a 6-character alphanumeric room code */
export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no I/O/0/1 for clarity
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

/**
 * Strip non-serializable fields from GameState to create a wire-safe copy.
 */
export function serializeGameState(state: GameState): SerializedGameState {
  // Destructure out non-serializable fields
  const { eventManager, aiStrategist, ...serializable } = state;
  return serializable;
}

/**
 * Map from peerId -> playerSlot for turn validation.
 */
export type PeerPlayerMap = Map<string, PlayerSlot>;

/**
 * Build peer -> slot mapping from lobby players.
 */
export function buildPeerPlayerMap(players: LobbyPlayer[]): PeerPlayerMap {
  const map: PeerPlayerMap = new Map();
  for (const player of players) {
    map.set(player.peerId, player.slot);
  }
  return map;
}
