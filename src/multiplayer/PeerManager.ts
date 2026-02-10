/**
 * PeerManager — thin wrapper around PeerJS.
 *
 * Handles:
 *  - Peer creation with deterministic IDs (room code prefix)
 *  - Connection lifecycle (open, close, error, reconnect)
 *  - Message send/receive with typed messages
 *  - Heartbeat (ping/pong) for connection health
 */

import Peer, { type DataConnection } from 'peerjs';
import type { NetworkMessage } from './types';

const PEER_ID_PREFIX = 'paranoid-times-';
const HEARTBEAT_INTERVAL = 5_000;
const CONNECTION_TIMEOUT = 15_000;

export type PeerEventHandler = {
  onMessage: (msg: NetworkMessage, connId: string) => void;
  onConnect: (connId: string) => void;
  onDisconnect: (connId: string) => void;
  onError: (err: Error) => void;
};

export class PeerManager {
  private peer: Peer | null = null;
  private connections = new Map<string, DataConnection>();
  private handlers: PeerEventHandler | null = null;
  private heartbeatTimers = new Map<string, ReturnType<typeof setInterval>>();
  private _localPeerId = '';
  private _destroyed = false;

  get localPeerId(): string {
    return this._localPeerId;
  }

  get isConnected(): boolean {
    return this.connections.size > 0;
  }

  get connectionCount(): number {
    return this.connections.size;
  }

  /** Create a peer as host. The peerId is derived from the room code. */
  async createHost(roomCode: string, handlers: PeerEventHandler): Promise<string> {
    this.handlers = handlers;
    const peerId = `${PEER_ID_PREFIX}${roomCode}`;
    return this.initPeer(peerId);
  }

  /** Create a peer as guest with a random suffix. */
  async createGuest(handlers: PeerEventHandler): Promise<string> {
    this.handlers = handlers;
    const suffix = Math.random().toString(36).substring(2, 8);
    const peerId = `${PEER_ID_PREFIX}guest-${suffix}`;
    return this.initPeer(peerId);
  }

  /** Guest connects to host's room. */
  async connectToHost(roomCode: string): Promise<DataConnection> {
    if (!this.peer) throw new Error('Peer not initialized');
    const hostPeerId = `${PEER_ID_PREFIX}${roomCode}`;

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Connection timeout — room may not exist'));
      }, CONNECTION_TIMEOUT);

      const conn = this.peer!.connect(hostPeerId, {
        reliable: true,
        serialization: 'json',
      });

      conn.on('open', () => {
        clearTimeout(timeout);
        this.registerConnection(conn);
        resolve(conn);
      });

      conn.on('error', (err) => {
        clearTimeout(timeout);
        reject(err);
      });
    });
  }

  /** Send a message to a specific peer. */
  send(peerId: string, msg: NetworkMessage): void {
    const conn = this.connections.get(peerId);
    if (!conn || !conn.open) {
      console.warn(`[PeerManager] Cannot send to ${peerId} — not connected`);
      return;
    }
    conn.send(msg);
  }

  /** Broadcast a message to ALL connected peers. */
  broadcast(msg: NetworkMessage): void {
    for (const [, conn] of this.connections) {
      if (conn.open) {
        conn.send(msg);
      }
    }
  }

  /** Gracefully shut down all connections and the peer. */
  destroy(): void {
    this._destroyed = true;
    for (const timer of this.heartbeatTimers.values()) {
      clearInterval(timer);
    }
    this.heartbeatTimers.clear();

    for (const [, conn] of this.connections) {
      try { conn.close(); } catch { /* ignore */ }
    }
    this.connections.clear();

    if (this.peer) {
      try { this.peer.destroy(); } catch { /* ignore */ }
      this.peer = null;
    }
  }

  // -----------------------------------------------------------------------
  // Internal
  // -----------------------------------------------------------------------

  private initPeer(peerId: string): Promise<string> {
    return new Promise((resolve, reject) => {
      if (this._destroyed) {
        reject(new Error('PeerManager destroyed'));
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error('Peer creation timeout'));
      }, CONNECTION_TIMEOUT);

      this.peer = new Peer(peerId, {
        debug: 1, // errors only
      });

      this.peer.on('open', (id) => {
        clearTimeout(timeout);
        this._localPeerId = id;
        resolve(id);
      });

      this.peer.on('connection', (conn) => {
        conn.on('open', () => {
          this.registerConnection(conn);
        });
      });

      this.peer.on('error', (err) => {
        clearTimeout(timeout);
        if (err.type === 'unavailable-id') {
          reject(new Error('Room code already in use — try another'));
        } else {
          this.handlers?.onError(err);
          // Only reject if peer hasn't opened yet
          if (!this._localPeerId) {
            reject(err);
          }
        }
      });

      this.peer.on('disconnected', () => {
        // PeerJS lost connection to signaling server; try reconnect
        if (!this._destroyed && this.peer && !this.peer.destroyed) {
          try {
            this.peer.reconnect();
          } catch { /* ignore */ }
        }
      });
    });
  }

  private registerConnection(conn: DataConnection): void {
    const remotePeerId = conn.peer;
    this.connections.set(remotePeerId, conn);
    this.handlers?.onConnect(remotePeerId);

    conn.on('data', (data) => {
      const msg = data as NetworkMessage;

      // Handle heartbeat internally
      if (msg.type === 'ping') {
        conn.send({ type: 'pong', timestamp: msg.timestamp });
        return;
      }
      if (msg.type === 'pong') {
        // Heartbeat ack — connection is alive
        return;
      }

      this.handlers?.onMessage(msg, remotePeerId);
    });

    conn.on('close', () => {
      this.cleanupConnection(remotePeerId);
    });

    conn.on('error', () => {
      this.cleanupConnection(remotePeerId);
    });

    // Start heartbeat
    this.startHeartbeat(remotePeerId);
  }

  private cleanupConnection(peerId: string): void {
    this.connections.delete(peerId);
    const timer = this.heartbeatTimers.get(peerId);
    if (timer) {
      clearInterval(timer);
      this.heartbeatTimers.delete(peerId);
    }
    this.handlers?.onDisconnect(peerId);
  }

  private startHeartbeat(peerId: string): void {
    const timer = setInterval(() => {
      this.send(peerId, { type: 'ping', timestamp: Date.now() });
    }, HEARTBEAT_INTERVAL);
    this.heartbeatTimers.set(peerId, timer);
  }
}
