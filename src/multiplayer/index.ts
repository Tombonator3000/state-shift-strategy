export { PeerManager } from './PeerManager';
export { useOnlineGame } from './useOnlineGame';
export { useNetworkSync } from './useNetworkSync';
export { createNetworkActionProxy } from './NetworkActionProxy';
export {
  generateRoomCode,
  serializeGameState,
  buildPeerPlayerMap,
  HOST_INTERNAL_ACTIONS,
} from './types';
export type {
  NetworkMessage,
  LobbyState,
  LobbyPlayer,
  RoomConfig,
  PlayerRole,
  PlayerSlot,
  ConnectionStatus,
  SerializedGameState,
  MultiplayerSession,
  GameActionKind,
} from './types';
