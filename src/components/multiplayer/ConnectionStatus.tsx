/**
 * ConnectionStatus — small indicator showing the WebRTC connection state.
 * Sits in the top-right corner of the game board during online play.
 */

import type { ConnectionStatus as ConnectionStatusType } from '@/multiplayer/types';

interface ConnectionStatusProps {
  status: ConnectionStatusType;
  roomCode: string;
  role: 'host' | 'guest';
  playerCount: number;
}

const STATUS_CONFIG: Record<ConnectionStatusType, { color: string; label: string }> = {
  connected: { color: 'bg-green-500', label: 'CONNECTED' },
  connecting: { color: 'bg-yellow-500', label: 'CONNECTING' },
  reconnecting: { color: 'bg-yellow-500', label: 'RECONNECTING' },
  disconnected: { color: 'bg-red-500', label: 'DISCONNECTED' },
  error: { color: 'bg-red-500', label: 'ERROR' },
};

export function ConnectionStatusBadge({ status, roomCode, role, playerCount }: ConnectionStatusProps) {
  const config = STATUS_CONFIG[status];

  return (
    <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm border border-white/10 px-3 py-1.5 rounded font-mono text-xs text-white/80">
      <div className={`w-2 h-2 rounded-full ${config.color} ${status === 'connected' ? '' : 'animate-pulse'}`} />
      <span className="uppercase tracking-wider">{config.label}</span>
      <span className="text-white/40">|</span>
      <span className="text-white/60">{roomCode}</span>
      <span className="text-white/40">|</span>
      <span className="text-white/60">{role.toUpperCase()}</span>
      <span className="text-white/40">|</span>
      <span className="text-white/60">{playerCount}P</span>
    </div>
  );
}
