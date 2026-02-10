# Online Multiplayer — Architecture & Implementation

**Date:** 2026-02-10
**Branch:** claude/improve-game-multiplayer-2HUdM

## Architecture

```
Host PC (useGameState) <——> WebRTC Data Channel <——> Guest PC (Read-only mirror)
         ^                    PeerJS Cloud                    ^
   Runs game logic          (signaling only)        Forwards actions to host
```

**Model:** Host-authoritative P2P via PeerJS

- **No dedicated server** — PeerJS cloud handles only initial WebRTC signaling
- **Host** runs all game logic (useGameState), broadcasts state after every change
- **Guest** receives state updates, forwards actions to host for validation & execution
- **~50ms debounce** on state broadcasts to avoid flooding

## How It Works

### 1. Create Room
Host clicks "Online Multiplayer" on title screen, enters a codename, creates a room.
Gets a 6-character code (e.g., `K7M2NP`) to share.

### 2. Join Room
Guest enters the room code and connects via WebRTC peer-to-peer.

### 3. Lobby
Host sees connected players, selects factions. Clicks "Start Game" to begin.

### 4. During Play
- Host's `useGameState` is the authority
- After every state change, host broadcasts full serialized `GameState` to guest (~50ms debounce)
- When it's the guest's turn, their actions are intercepted by `NetworkActionProxy` and forwarded to host
- Host validates (turn check, peerId→slot mapping), executes, then broadcasts new state

### 5. Turn Lock
Guest sees a "Waiting for [player]..." overlay when it's not their turn.
They can still view the board (spectator mode) but can't act.

## File Structure

```
src/multiplayer/
├── types.ts                  # All type definitions, message types, helpers
├── PeerManager.ts            # Thin PeerJS wrapper (connection, send, broadcast, heartbeat)
├── useOnlineGame.ts          # Lobby phase hook (create/join room, faction, ready)
├── useNetworkSync.ts         # Gameplay sync hook (state broadcast, action forwarding, turn validation)
├── NetworkActionProxy.ts     # Guest action interception & host broadcast utility
└── index.ts                  # Barrel exports

src/components/multiplayer/
├── OnlineLobby.tsx           # Room create/join/lobby UI (tabloid-themed)
├── TurnLockOverlay.tsx       # "Waiting for [player]..." overlay
└── ConnectionStatus.tsx      # Connection status badge (top-right corner)
```

## Modified Files

| File | Changes |
|------|---------|
| `src/pages/Index.tsx` | Added online lobby flow, TurnLockOverlay, ConnectionStatusBadge, multiplayer state |
| `src/ui/start/StartScreen.tsx` | Added `onOnlineMultiplayer` prop and sidebar button |
| `src/components/game/GameMenu.tsx` | Added `onOnlineMultiplayer` prop and button in both themes |
| `package.json` | Added `peerjs` dependency |

## Network Messages

All messages are JSON over WebRTC DataChannel:

| Type | Direction | Purpose |
|------|-----------|---------|
| `lobby-join` | Guest → Host | Guest requests to join room |
| `lobby-update` | Host → Guest | Full lobby state broadcast |
| `lobby-ready` | Guest → Host | Guest ready status |
| `lobby-faction` | Guest → Host | Guest faction choice |
| `game-start` | Host → Guest | Game begins, includes initial state + lobby data |
| `game-state` | Host → Guest | Full serialized GameState (seq numbered) |
| `game-action` | Guest → Host | Action request (playCard, endTurn, etc.) |
| `game-action-ack` | Host → Guest | Ack/nack for action request |
| `ping`/`pong` | Both | Heartbeat (5s interval) |
| `player-disconnected` | Host → Guest | Notification of disconnection |
| `error` | Host → Guest | Error notification |

## Bug Fixes Applied

| # | Severity | Issue | Fix |
|---|----------|-------|-----|
| 1 | CRITICAL | No turn validation in useNetworkSync | Host checks `peerId→playerSlot` before executing any guest action |
| 2 | CRITICAL | No peerId→playerId mapping | `buildPeerPlayerMap()` creates mapping from lobby data, used in every validation |
| 3 | CRITICAL | HOST_INTERNAL_ACTIONS ran on guest | `HOST_INTERNAL_ACTIONS` set blocks startTurn, processWeekEnd, executeAITurn etc. from guest execution |
| 4 | HIGH | Guest ran useAutoEndTurn | `suppressAutoEndTurn` flag exported, controlled via `isLocalTurn` |
| 5 | HIGH | applyNetworkState missing events | Full `SerializedGameState` includes all event fields |
| 6 | MEDIUM | Stale closure in useOnlineGame | `lobbyRef` and `localPlayerRef` refs keep latest state for callbacks |
| 7 | MEDIUM | game-start missing lobby data | `GameStartMessage` includes full `lobby: LobbyState` |
| 8 | LOW | "Only host can broadcast" warning | `broadcastState()` short-circuits for non-host role |

## Turn Validation Flow (Host)

```
Guest sends game-action {peerId, action, payload}
  ↓
1. Look up peerId in PeerPlayerMap → get playerSlot
   - Unknown? → reject "Unknown player"
  ↓
2. Get current game state → determine active slot
   - getCurrentSlot(): human=slot0 (host), ai=slot1 (guest)
  ↓
3. Compare senderSlot vs activeSlot
   - Mismatch? → reject "Not your turn"
  ↓
4. Check HOST_INTERNAL_ACTIONS set
   - Match? → reject "Action not allowed"
  ↓
5. Execute action on host's game state
  ↓
6. Broadcast updated state to all guests
```

## Player Slot Mapping

In the existing game engine, `currentPlayer` is `'human' | 'ai'`:
- **Slot 0 (Host)** = `'human'` (host always plays the "human" slot)
- **Slot 1 (Guest)** = `'ai'` (guest takes over the AI's slot)

This mapping reuses the existing turn system without modifying the core engine.

## Dependencies

- **peerjs ^1.5.5** — WebRTC abstraction with free cloud signaling

## Room Code Format

6 characters from `ABCDEFGHJKLMNPQRSTUVWXYZ23456789` (no I/O/0/1 for readability).
Host's PeerJS ID: `paranoid-times-{roomCode}` (deterministic, so guests can find them).

## Serialization

`serializeGameState()` strips non-serializable fields:
- `eventManager` (class instance with methods)
- `aiStrategist` (class instance)

Everything else in `GameState` is plain data and JSON-safe.

## Known Limitations

1. **2 players max** — current implementation supports host + 1 guest
2. **No reconnection** — if WebRTC connection drops, the game is lost
3. **No spectators** — only active players can connect
4. **State size** — full GameState is broadcast (~50-200KB JSON), could optimize with delta encoding
5. **No chat** — players must use external communication
6. **Save/load disabled** — online games cannot be saved/loaded
