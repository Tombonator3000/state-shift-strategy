/**
 * OnlineLobby — Room creation, joining, and pre-game configuration UI.
 *
 * Themed as a "SECURE BRIEFING ROOM" in the Paranoid Times tabloid style.
 */

import { useState } from 'react';
import type { UseOnlineGameReturn } from '@/multiplayer/useOnlineGame';
import '@/styles/tabloid.css';

type LobbyScreen = 'menu' | 'create' | 'join' | 'waiting';

interface OnlineLobbyProps {
  onlineGame: UseOnlineGameReturn;
  onStartGame: (hostFaction: 'government' | 'truth', guestFaction: 'government' | 'truth') => void;
  onBack: () => void;
}

export function OnlineLobby({ onlineGame, onStartGame, onBack }: OnlineLobbyProps) {
  const {
    lobby,
    localPlayer,
    connectionStatus,
    roomCode,
    role,
    error,
    createRoom,
    joinRoom,
    setFaction,
    setReady,
    leaveRoom,
  } = onlineGame;

  const [screen, setScreen] = useState<LobbyScreen>('menu');
  const [playerName, setPlayerName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [nameError, setNameError] = useState('');

  const validateName = (): boolean => {
    const trimmed = playerName.trim();
    if (trimmed.length < 2) {
      setNameError('Name must be at least 2 characters');
      return false;
    }
    if (trimmed.length > 16) {
      setNameError('Name must be 16 characters or less');
      return false;
    }
    setNameError('');
    return true;
  };

  const handleCreateRoom = async () => {
    if (!validateName()) return;
    await createRoom(playerName.trim());
    setScreen('waiting');
  };

  const handleJoinRoom = async () => {
    if (!validateName()) return;
    if (joinCode.trim().length !== 6) {
      setNameError('Room code must be 6 characters');
      return;
    }
    await joinRoom(joinCode.trim().toUpperCase(), playerName.trim());
    setScreen('waiting');
  };

  const handleBack = () => {
    if (screen === 'waiting') {
      leaveRoom();
    }
    if (screen === 'menu') {
      onBack();
      return;
    }
    setScreen('menu');
  };

  const handleStartGame = () => {
    if (role !== 'host' || !lobby) return;
    const host = lobby.players.find(p => p.role === 'host');
    const guest = lobby.players.find(p => p.role === 'guest');
    if (!host || !guest) return;

    const hostFaction = host.faction ?? 'government';
    const guestFaction = hostFaction === 'government' ? 'truth' : 'government';

    onStartGame(hostFaction, guestFaction);
  };

  const allPlayersReady = lobby?.players.every(p => p.ready) ?? false;
  const hasEnoughPlayers = (lobby?.players.length ?? 0) >= 2;
  const canStart = role === 'host' && allPlayersReady && hasEnoughPlayers;

  // ---------------------------------------------------------------------------
  // Render: Menu
  // ---------------------------------------------------------------------------

  if (screen === 'menu') {
    return (
      <main className="tabloid-bg min-h-[100dvh] px-3 sm:px-6 py-4 flex flex-col items-center justify-center">
        <div className="masthead text-2xl sm:text-4xl mb-2">SECURE COMM CHANNEL</div>
        <div className="subhead mb-8">ONLINE MULTIPLAYER — CLASSIFIED ACCESS</div>

        <div className="w-full max-w-md space-y-4">
          <div className="space-y-2">
            <label className="block text-xs uppercase tracking-[0.2em] font-mono text-newspaper-text/70">
              Agent Codename
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your codename..."
              maxLength={16}
              className="w-full px-4 py-3 bg-newspaper-bg border-2 border-newspaper-text font-mono text-newspaper-text placeholder:text-newspaper-text/40 focus:outline-none focus:border-newspaper-accent"
            />
            {nameError && (
              <p className="text-xs font-mono text-red-600">{nameError}</p>
            )}
          </div>

          <button
            type="button"
            className="ad-card tabloid-menu-btn w-full"
            onClick={() => {
              if (!validateName()) return;
              setScreen('create');
            }}
          >
            <span className="menu-masthead">CREATE ROOM</span>
            <span className="menu-headline">ESTABLISH SECURE BRIEFING ROOM</span>
            <small className="menu-subhead">Generate a code for your operative to join</small>
          </button>

          <button
            type="button"
            className="ad-card tabloid-menu-btn w-full"
            onClick={() => {
              if (!validateName()) return;
              setScreen('join');
            }}
          >
            <span className="menu-masthead">JOIN ROOM</span>
            <span className="menu-headline">INFILTRATE EXISTING BRIEFING</span>
            <small className="menu-subhead">Enter a 6-character room code</small>
          </button>

          <button
            type="button"
            className="w-full mt-4 px-4 py-2 border border-newspaper-text/40 text-newspaper-text/60 font-mono text-sm hover:bg-newspaper-text/10"
            onClick={handleBack}
          >
            ABORT MISSION
          </button>
        </div>
      </main>
    );
  }

  // ---------------------------------------------------------------------------
  // Render: Create Room
  // ---------------------------------------------------------------------------

  if (screen === 'create') {
    return (
      <main className="tabloid-bg min-h-[100dvh] px-3 sm:px-6 py-4 flex flex-col items-center justify-center">
        <div className="masthead text-2xl sm:text-4xl mb-2">ESTABLISHING SECURE LINE...</div>
        <div className="subhead mb-8">Setting up encrypted channel</div>

        {connectionStatus === 'connecting' && (
          <div className="text-newspaper-text font-mono animate-pulse text-lg">
            Encrypting channel...
          </div>
        )}

        {error && (
          <div className="bg-red-900/20 border border-red-600 text-red-400 px-4 py-2 font-mono text-sm mb-4">
            {error}
          </div>
        )}

        <button
          type="button"
          className="ad-card tabloid-menu-btn max-w-md"
          onClick={handleCreateRoom}
          disabled={connectionStatus === 'connecting'}
        >
          <span className="menu-headline">OPEN SECURE CHANNEL</span>
        </button>

        <button
          type="button"
          className="mt-4 px-4 py-2 border border-newspaper-text/40 text-newspaper-text/60 font-mono text-sm hover:bg-newspaper-text/10"
          onClick={handleBack}
        >
          BACK
        </button>
      </main>
    );
  }

  // ---------------------------------------------------------------------------
  // Render: Join Room
  // ---------------------------------------------------------------------------

  if (screen === 'join') {
    return (
      <main className="tabloid-bg min-h-[100dvh] px-3 sm:px-6 py-4 flex flex-col items-center justify-center">
        <div className="masthead text-2xl sm:text-4xl mb-2">ENTER ACCESS CODE</div>
        <div className="subhead mb-8">Type the 6-character room code</div>

        <div className="w-full max-w-md space-y-4">
          <input
            type="text"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 6))}
            placeholder="ABC123"
            maxLength={6}
            className="w-full px-4 py-4 bg-newspaper-bg border-2 border-newspaper-text font-mono text-2xl text-center tracking-[0.5em] text-newspaper-text placeholder:text-newspaper-text/30 focus:outline-none focus:border-newspaper-accent uppercase"
          />

          {error && (
            <div className="bg-red-900/20 border border-red-600 text-red-400 px-4 py-2 font-mono text-sm">
              {error}
            </div>
          )}

          <button
            type="button"
            className="ad-card tabloid-menu-btn w-full"
            onClick={handleJoinRoom}
            disabled={connectionStatus === 'connecting' || joinCode.length !== 6}
          >
            <span className="menu-headline">
              {connectionStatus === 'connecting' ? 'CONNECTING...' : 'INFILTRATE'}
            </span>
          </button>

          <button
            type="button"
            className="w-full mt-2 px-4 py-2 border border-newspaper-text/40 text-newspaper-text/60 font-mono text-sm hover:bg-newspaper-text/10"
            onClick={handleBack}
          >
            BACK
          </button>
        </div>
      </main>
    );
  }

  // ---------------------------------------------------------------------------
  // Render: Waiting Room / Lobby
  // ---------------------------------------------------------------------------

  return (
    <main className="tabloid-bg min-h-[100dvh] px-3 sm:px-6 py-4 flex flex-col items-center">
      <div className="masthead text-2xl sm:text-4xl mb-1">SECURE BRIEFING ROOM</div>
      <div className="subhead mb-4">
        {role === 'host' ? 'Waiting for operatives...' : 'Connected to briefing'}
      </div>

      {/* Room Code Display */}
      <div className="bg-newspaper-bg border-4 border-newspaper-text px-8 py-4 mb-6 text-center">
        <div className="text-xs uppercase tracking-[0.3em] font-mono text-newspaper-text/60 mb-1">
          Room Code
        </div>
        <div className="text-4xl sm:text-5xl font-mono font-bold tracking-[0.5em] text-newspaper-text">
          {roomCode}
        </div>
        <div className="text-xs font-mono text-newspaper-text/50 mt-1">
          Share this code with your opponent
        </div>
      </div>

      {/* Connection Status */}
      <div className="flex items-center gap-2 mb-6 font-mono text-sm">
        <div className={`w-2 h-2 rounded-full ${
          connectionStatus === 'connected' ? 'bg-green-500 animate-pulse' :
          connectionStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' :
          'bg-red-500'
        }`} />
        <span className="text-newspaper-text/70 uppercase tracking-wider">
          {connectionStatus}
        </span>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-600 text-red-400 px-4 py-2 font-mono text-sm mb-4 max-w-md">
          {error}
        </div>
      )}

      {/* Players List */}
      <div className="w-full max-w-md space-y-3 mb-6">
        <div className="text-xs uppercase tracking-[0.3em] font-mono text-newspaper-text/60 border-b border-newspaper-text/20 pb-1">
          Operatives ({lobby?.players.length ?? 0}/2)
        </div>

        {lobby?.players.map((player) => (
          <div
            key={player.peerId}
            className="flex items-center justify-between bg-newspaper-bg border border-newspaper-text/30 px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${
                player.ready ? 'bg-green-500' : 'bg-yellow-500'
              }`} />
              <div>
                <div className="font-mono text-newspaper-text font-bold">
                  {player.name}
                  {player.peerId === localPlayer?.peerId && (
                    <span className="text-xs text-newspaper-text/50 ml-2">(you)</span>
                  )}
                </div>
                <div className="text-xs font-mono text-newspaper-text/50">
                  {player.role === 'host' ? 'HOST' : 'GUEST'} — Slot {player.slot}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-sm font-mono font-bold ${
                player.faction === 'government' ? 'text-blue-400' : 'text-red-400'
              }`}>
                {player.faction?.toUpperCase() ?? 'UNDECIDED'}
              </div>
              <div className="text-xs font-mono text-newspaper-text/50">
                {player.ready ? 'READY' : 'NOT READY'}
              </div>
            </div>
          </div>
        ))}

        {(lobby?.players.length ?? 0) < 2 && (
          <div className="border border-dashed border-newspaper-text/20 px-4 py-3 text-center">
            <div className="font-mono text-newspaper-text/30 text-sm">
              Waiting for opponent to join...
            </div>
          </div>
        )}
      </div>

      {/* Faction Selection */}
      <div className="w-full max-w-md mb-6">
        <div className="text-xs uppercase tracking-[0.3em] font-mono text-newspaper-text/60 border-b border-newspaper-text/20 pb-1 mb-3">
          Choose Your Faction
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            className={`px-4 py-3 border-2 font-mono text-sm transition-all ${
              localPlayer?.faction === 'government'
                ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                : 'border-newspaper-text/30 text-newspaper-text/60 hover:border-blue-500/50'
            }`}
            onClick={() => setFaction('government')}
          >
            DEEP STATE
          </button>
          <button
            type="button"
            className={`px-4 py-3 border-2 font-mono text-sm transition-all ${
              localPlayer?.faction === 'truth'
                ? 'border-red-500 bg-red-500/10 text-red-400'
                : 'border-newspaper-text/30 text-newspaper-text/60 hover:border-red-500/50'
            }`}
            onClick={() => setFaction('truth')}
          >
            TRUTH SEEKERS
          </button>
        </div>
      </div>

      {/* Ready / Start Buttons */}
      <div className="w-full max-w-md space-y-3">
        {role === 'guest' && (
          <button
            type="button"
            className={`w-full px-4 py-3 border-2 font-mono text-lg transition-all ${
              localPlayer?.ready
                ? 'border-green-500 bg-green-500/20 text-green-400'
                : 'border-newspaper-text bg-newspaper-text/10 text-newspaper-text hover:bg-newspaper-text/20'
            }`}
            onClick={() => setReady(!localPlayer?.ready)}
          >
            {localPlayer?.ready ? 'STANDING BY...' : 'READY UP'}
          </button>
        )}

        {role === 'host' && (
          <button
            type="button"
            className={`w-full px-4 py-4 border-2 font-mono text-lg font-bold transition-all ${
              canStart
                ? 'border-green-500 bg-green-500/20 text-green-400 hover:bg-green-500/30 animate-pulse'
                : 'border-newspaper-text/30 bg-newspaper-text/5 text-newspaper-text/40 cursor-not-allowed'
            }`}
            onClick={handleStartGame}
            disabled={!canStart}
          >
            {!hasEnoughPlayers
              ? 'WAITING FOR OPERATIVE...'
              : !allPlayersReady
                ? 'WAITING FOR READY...'
                : 'LAUNCH OPERATION'}
          </button>
        )}

        <button
          type="button"
          className="w-full px-4 py-2 border border-newspaper-text/40 text-newspaper-text/60 font-mono text-sm hover:bg-newspaper-text/10"
          onClick={handleBack}
        >
          LEAVE ROOM
        </button>
      </div>
    </main>
  );
}
