/**
 * useOnlineGame — manages the lobby phase of online multiplayer.
 *
 * Responsibilities:
 *  - Create / join a room via PeerManager
 *  - Track lobby state (players, factions, ready status)
 *  - Validate lobby actions
 *  - Transition to game-start when host clicks Start
 *
 * Bug fixes applied:
 *  #6 MEDIUM — Uses ref for lobby state to avoid stale closures when
 *              new guests join after the initial lobby setup.
 *  #7 MEDIUM — game-start message includes full lobby data so guest can
 *              reliably find their player slot.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { PeerManager } from './PeerManager';
import {
  generateRoomCode,
  type ConnectionStatus,
  type LobbyPlayer,
  type LobbyState,
  type NetworkMessage,
  type PlayerRole,
  type RoomConfig,
  type SerializedGameState,
} from './types';

export interface UseOnlineGameReturn {
  /** Current lobby state */
  lobby: LobbyState | null;
  /** Local player info */
  localPlayer: LobbyPlayer | null;
  /** Connection status */
  connectionStatus: ConnectionStatus;
  /** Room code (set after create/join) */
  roomCode: string;
  /** Role: host or guest */
  role: PlayerRole | null;
  /** Error message if any */
  error: string | null;
  /** PeerManager instance for use by useNetworkSync */
  peerManager: PeerManager | null;

  // --- Actions ---
  createRoom: (playerName: string) => Promise<void>;
  joinRoom: (roomCode: string, playerName: string) => Promise<void>;
  setFaction: (faction: 'government' | 'truth') => void;
  setReady: (ready: boolean) => void;
  updateConfig: (config: Partial<RoomConfig>) => void;
  startGame: (initialState: SerializedGameState) => void;
  leaveRoom: () => void;
}

export function useOnlineGame(): UseOnlineGameReturn {
  const [lobby, setLobby] = useState<LobbyState | null>(null);
  const [localPlayer, setLocalPlayer] = useState<LobbyPlayer | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [roomCode, setRoomCode] = useState('');
  const [role, setRole] = useState<PlayerRole | null>(null);
  const [error, setError] = useState<string | null>(null);

  const peerManagerRef = useRef<PeerManager | null>(null);
  // Fix #6: Use ref to always have latest lobby state in callbacks
  const lobbyRef = useRef<LobbyState | null>(null);
  const localPlayerRef = useRef<LobbyPlayer | null>(null);

  // Keep refs in sync with state
  useEffect(() => { lobbyRef.current = lobby; }, [lobby]);
  useEffect(() => { localPlayerRef.current = localPlayer; }, [localPlayer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      peerManagerRef.current?.destroy();
      peerManagerRef.current = null;
    };
  }, []);

  const broadcastLobbyUpdate = useCallback((lobbyState: LobbyState) => {
    peerManagerRef.current?.broadcast({
      type: 'lobby-update',
      lobby: lobbyState,
    });
  }, []);

  const handleHostMessage = useCallback((msg: NetworkMessage, connId: string) => {
    // Fix #6: read from ref, not stale closure
    const currentLobby = lobbyRef.current;
    if (!currentLobby) return;

    switch (msg.type) {
      case 'lobby-join': {
        // Check if player already in lobby
        if (currentLobby.players.some(p => p.peerId === msg.peerId)) return;

        const newPlayer: LobbyPlayer = {
          peerId: msg.peerId,
          name: msg.playerName,
          slot: 1,
          role: 'guest',
          ready: false,
        };

        const updatedLobby: LobbyState = {
          ...currentLobby,
          players: [...currentLobby.players, newPlayer],
        };

        setLobby(updatedLobby);
        broadcastLobbyUpdate(updatedLobby);
        break;
      }

      case 'lobby-ready': {
        const updatedPlayers = currentLobby.players.map(p =>
          p.peerId === msg.peerId ? { ...p, ready: msg.ready } : p
        );
        const updatedLobby = { ...currentLobby, players: updatedPlayers };
        setLobby(updatedLobby);
        broadcastLobbyUpdate(updatedLobby);
        break;
      }

      case 'lobby-faction': {
        const updatedPlayers = currentLobby.players.map(p =>
          p.peerId === msg.peerId ? { ...p, faction: msg.faction } : p
        );
        const updatedLobby = { ...currentLobby, players: updatedPlayers };
        setLobby(updatedLobby);
        broadcastLobbyUpdate(updatedLobby);
        break;
      }
    }
  }, [broadcastLobbyUpdate]);

  const handleGuestMessage = useCallback((msg: NetworkMessage) => {
    switch (msg.type) {
      case 'lobby-update': {
        setLobby(msg.lobby);
        break;
      }
      case 'error': {
        setError(msg.message);
        break;
      }
    }
  }, []);

  // -----------------------------------------------------------------------
  // Create Room (Host)
  // -----------------------------------------------------------------------

  const createRoom = useCallback(async (playerName: string) => {
    try {
      setError(null);
      setConnectionStatus('connecting');

      const code = generateRoomCode();
      const pm = new PeerManager();
      peerManagerRef.current = pm;

      const peerId = await pm.createHost(code, {
        onMessage: handleHostMessage,
        onConnect: (connId) => {
          console.log(`[Lobby] Guest connected: ${connId}`);
        },
        onDisconnect: (connId) => {
          console.log(`[Lobby] Guest disconnected: ${connId}`);
          const currentLobby = lobbyRef.current;
          if (!currentLobby) return;

          const updatedPlayers = currentLobby.players.filter(p => p.peerId !== connId);
          const updatedLobby = { ...currentLobby, players: updatedPlayers };
          setLobby(updatedLobby);
          broadcastLobbyUpdate(updatedLobby);
        },
        onError: (err) => {
          console.error('[Lobby] Peer error:', err);
          setError(err.message);
        },
      });

      const hostPlayer: LobbyPlayer = {
        peerId,
        name: playerName,
        slot: 0,
        role: 'host',
        faction: 'government',
        ready: true,
      };

      const initialLobby: LobbyState = {
        config: {
          roomCode: code,
          victoryGoal: 26,
          aiDifficulty: 'medium',
          maxTurns: 0,
        },
        players: [hostPlayer],
        started: false,
      };

      setRoomCode(code);
      setRole('host');
      setLocalPlayer(hostPlayer);
      setLobby(initialLobby);
      setConnectionStatus('connected');
    } catch (err) {
      setConnectionStatus('error');
      setError(err instanceof Error ? err.message : 'Failed to create room');
    }
  }, [handleHostMessage, broadcastLobbyUpdate]);

  // -----------------------------------------------------------------------
  // Join Room (Guest)
  // -----------------------------------------------------------------------

  const joinRoom = useCallback(async (code: string, playerName: string) => {
    try {
      setError(null);
      setConnectionStatus('connecting');

      const pm = new PeerManager();
      peerManagerRef.current = pm;

      const peerId = await pm.createGuest({
        onMessage: handleGuestMessage,
        onConnect: () => {
          console.log('[Lobby] Connected to host');
        },
        onDisconnect: () => {
          console.log('[Lobby] Disconnected from host');
          setConnectionStatus('disconnected');
          setError('Lost connection to host');
        },
        onError: (err) => {
          console.error('[Lobby] Peer error:', err);
          setError(err.message);
        },
      });

      await pm.connectToHost(code);

      // Send join message to host
      const hostPeerId = `paranoid-times-${code}`;
      pm.send(hostPeerId, {
        type: 'lobby-join',
        playerName,
        peerId,
      });

      const guestPlayer: LobbyPlayer = {
        peerId,
        name: playerName,
        slot: 1,
        role: 'guest',
        ready: false,
      };

      setRoomCode(code);
      setRole('guest');
      setLocalPlayer(guestPlayer);
      setConnectionStatus('connected');
    } catch (err) {
      setConnectionStatus('error');
      setError(err instanceof Error ? err.message : 'Failed to join room');
    }
  }, [handleGuestMessage]);

  // -----------------------------------------------------------------------
  // Lobby Actions
  // -----------------------------------------------------------------------

  const setFaction = useCallback((faction: 'government' | 'truth') => {
    const player = localPlayerRef.current;
    if (!player) return;

    if (role === 'host') {
      const currentLobby = lobbyRef.current;
      if (!currentLobby) return;

      const updatedPlayers = currentLobby.players.map(p =>
        p.peerId === player.peerId ? { ...p, faction } : p
      );
      const updatedLobby = { ...currentLobby, players: updatedPlayers };
      setLobby(updatedLobby);
      setLocalPlayer(prev => prev ? { ...prev, faction } : prev);
      broadcastLobbyUpdate(updatedLobby);
    } else {
      // Guest sends faction to host
      const hostPeerId = `paranoid-times-${roomCode}`;
      peerManagerRef.current?.send(hostPeerId, {
        type: 'lobby-faction',
        peerId: player.peerId,
        faction,
      });
      setLocalPlayer(prev => prev ? { ...prev, faction } : prev);
    }
  }, [role, roomCode, broadcastLobbyUpdate]);

  const setReady = useCallback((ready: boolean) => {
    const player = localPlayerRef.current;
    if (!player) return;

    if (role === 'host') {
      const currentLobby = lobbyRef.current;
      if (!currentLobby) return;

      const updatedPlayers = currentLobby.players.map(p =>
        p.peerId === player.peerId ? { ...p, ready } : p
      );
      const updatedLobby = { ...currentLobby, players: updatedPlayers };
      setLobby(updatedLobby);
      setLocalPlayer(prev => prev ? { ...prev, ready } : prev);
      broadcastLobbyUpdate(updatedLobby);
    } else {
      const hostPeerId = `paranoid-times-${roomCode}`;
      peerManagerRef.current?.send(hostPeerId, {
        type: 'lobby-ready',
        peerId: player.peerId,
        ready,
      });
      setLocalPlayer(prev => prev ? { ...prev, ready } : prev);
    }
  }, [role, roomCode, broadcastLobbyUpdate]);

  const updateConfig = useCallback((configUpdate: Partial<RoomConfig>) => {
    if (role !== 'host') return;
    const currentLobby = lobbyRef.current;
    if (!currentLobby) return;

    const updatedLobby: LobbyState = {
      ...currentLobby,
      config: { ...currentLobby.config, ...configUpdate },
    };
    setLobby(updatedLobby);
    broadcastLobbyUpdate(updatedLobby);
  }, [role, broadcastLobbyUpdate]);

  // Fix #7: game-start includes full lobby data
  const startGame = useCallback((initialState: SerializedGameState) => {
    if (role !== 'host') return;
    const currentLobby = lobbyRef.current;
    if (!currentLobby) return;

    const startedLobby = { ...currentLobby, started: true };
    setLobby(startedLobby);

    peerManagerRef.current?.broadcast({
      type: 'game-start',
      lobby: startedLobby,
      initialState,
    });
  }, [role]);

  const leaveRoom = useCallback(() => {
    peerManagerRef.current?.destroy();
    peerManagerRef.current = null;
    setLobby(null);
    setLocalPlayer(null);
    setConnectionStatus('disconnected');
    setRoomCode('');
    setRole(null);
    setError(null);
  }, []);

  return {
    lobby,
    localPlayer,
    connectionStatus,
    roomCode,
    role,
    error,
    peerManager: peerManagerRef.current,
    createRoom,
    joinRoom,
    setFaction,
    setReady,
    updateConfig,
    startGame,
    leaveRoom,
  };
}
