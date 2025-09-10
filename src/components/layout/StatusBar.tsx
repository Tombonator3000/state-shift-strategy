import React from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Bot, 
  Eye, 
  Map, 
  Target, 
  Clock 
} from 'lucide-react';

interface StatusBarProps {
  round: number;
  playerIP: number;
  aiIP: number;
  truth: number;
  playerStates: number;
  aiStates: number;
  faction: 'government' | 'truth';
  phase: string;
  currentPlayer: 'player' | 'ai';
}

const StatusBar: React.FC<StatusBarProps> = ({
  round,
  playerIP,
  aiIP,
  truth,
  playerStates,
  aiStates,
  faction,
  phase,
  currentPlayer
}) => {
  return (
    <div className="bg-newspaper-text text-newspaper-bg px-4 py-2">
      <div className="flex items-center justify-between font-mono text-sm">
        {/* Left section - Round & Phase */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span className="font-bold">Round {round}</span>
          </div>
          <Badge 
            variant="outline" 
            className={currentPlayer === 'player' ? 'border-blue-400 text-blue-400' : 'border-red-400 text-red-400'}
          >
            {phase === 'player_turn' ? 'YOUR TURN' : 
             phase === 'ai_turn' ? 'AI THINKING' : 
             phase.toUpperCase()}
          </Badge>
        </div>

        {/* Center section - IP & Resources */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-blue-400" />
            <span className="text-blue-400 font-bold">{playerIP}</span>
            <span className="text-xs">IP</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-red-400" />
            <span className="text-red-400 font-bold">{aiIP}</span>
            <span className="text-xs">IP</span>
          </div>

          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-yellow-400" />
            <span className="text-yellow-400 font-bold">{truth}%</span>
            <span className="text-xs">Truth</span>
          </div>
        </div>

        {/* Right section - State Control */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Map className="w-4 h-4" />
            <span className="text-xs">States:</span>
            <span className="text-blue-400 font-bold">{playerStates}</span>
            <span className="text-xs">vs</span>
            <span className="text-red-400 font-bold">{aiStates}</span>
          </div>
          
          <Badge 
            variant="outline"
            className={faction === 'truth' ? 'border-blue-400 text-blue-400' : 'border-red-400 text-red-400'}
          >
            {faction === 'truth' ? 'TRUTH SEEKER' : 'DEEP STATE'}
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default StatusBar;