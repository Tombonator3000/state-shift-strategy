import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Eye, Lock, ChevronDown, ChevronUp } from 'lucide-react';
import { useMemo, useState } from 'react';

import { SecretAgenda as AgendaType } from '@/data/agendaDatabase';

interface SecretAgendaProps {
  agenda: AgendaType & {
    progress: number;
    completed: boolean;
    revealed: boolean;
  };
  isPlayer?: boolean;
}

const SecretAgenda = ({ agenda, isPlayer = true }: SecretAgendaProps) => {
  const progressPercent = useMemo(() => {
    if (!agenda.target) {
      return 0;
    }

    const raw = (agenda.progress / agenda.target) * 100;
    return Math.max(0, Math.min(100, Number.isFinite(raw) ? raw : 0));
  }, [agenda.progress, agenda.target]);

  const difficultyBadgeClass = useMemo(() => {
    switch (agenda.difficulty) {
      case 'easy':
        return 'bg-green-900/50 text-green-400';
      case 'medium':
        return 'bg-yellow-900/50 text-yellow-400';
      case 'hard':
        return 'bg-red-900/50 text-red-400';
      default:
        return 'bg-purple-900/50 text-purple-400';
    }
  }, [agenda.difficulty]);

  const renderProgressBar = () => (
    <div className="space-y-1">
      <div className="flex justify-between items-center text-xs">
        <span>Progress:</span>
        <div className="flex items-center gap-2">
          <span>{agenda.progress}/{agenda.target}</span>
          <span className={`px-1 py-0.5 rounded text-xs font-bold ${difficultyBadgeClass}`}>
            {agenda.difficulty.toUpperCase()}
          </span>
        </div>
      </div>
      <Progress
        value={progressPercent}
        className="h-2 bg-gray-800"
      />
    </div>
  );

  const [isExpanded, setIsExpanded] = useState(false);

  // Opponent view - just a progress bar
  if (!isPlayer) {
    return (
      <Card className="p-2 bg-black text-white border border-secret-red/50 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-secret-red/5 to-transparent"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Lock size={12} className="text-secret-red/70" />
            <h3 className="font-bold text-xs font-mono text-secret-red/70">
              AI OBJECTIVE
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-gray-800 rounded">
              <div 
                className="h-full bg-secret-red/70 rounded transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="text-xs text-gray-400 font-mono">
              {Math.floor(progressPercent)}%
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Player view - expandable display
  return (
    <Card
      className={`bg-black text-white border-2 border-secret-red relative overflow-hidden cursor-pointer transition-all duration-300 ${
        isExpanded ? 'p-4' : 'p-2'
      }`}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-secret-red/10 to-transparent"></div>
      
      <div className="relative z-10">
        <div className={`flex items-center justify-between ${isExpanded ? 'mb-3' : 'mb-0'}`}>
          <div className="flex items-center gap-2">
            <Eye size={isExpanded ? 16 : 12} className="text-secret-red" />
            <h3 className={`font-bold font-mono text-secret-red ${isExpanded ? 'text-sm' : 'text-xs'}`}>
              SECRET AGENDA
            </h3>
          </div>
          {isExpanded ? (
            <ChevronUp size={14} className="text-secret-red" />
          ) : (
            <ChevronDown size={14} className="text-secret-red" />
          )}
        </div>

        {!isExpanded ? (
          // Minimized view - show quick summary
          <div className="space-y-2 text-xs font-mono text-gray-300">
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-secret-red/90 uppercase tracking-wide text-[10px]">
                  {agenda.title}
                </span>
                <span className={`px-1 py-0.5 rounded text-[10px] font-bold ${difficultyBadgeClass}`}>
                  {agenda.difficulty.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-gray-400">
                <span>{agenda.progress}/{agenda.target}</span>
                <span>{Math.round(progressPercent)}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-secret-red/20">
                <div className="h-full bg-secret-red transition-all" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>
            <div className="text-[10px] text-gray-400 line-clamp-2">
              {agenda.description}
            </div>
            {agenda.completed && (
              <div className="text-[10px] text-secret-red font-bold">
                Objective Complete
              </div>
            )}
          </div>
        ) : (
          // Expanded view - full details
          <div className="space-y-3">
            <div className="space-y-2">
              <div className="text-xs font-bold text-secret-red/90 uppercase tracking-wider">
                {agenda.title}
              </div>
              <div className="text-xs font-mono text-gray-300">
                {agenda.description}
              </div>
              <div className="text-xs text-gray-500 italic">
                "{agenda.flavorText}"
              </div>
            </div>

            {renderProgressBar()}

            {agenda.completed && (
              <div className="text-xs text-center text-secret-red font-bold animate-pulse">
                *** OBJECTIVE COMPLETE ***
              </div>
            )}
          </div>
        )}
      </div>

      {/* Glitch effect overlay - only when expanded */}
      {isExpanded && (
        <div className="absolute inset-0 pointer-events-none opacity-20">
          {Array.from({ length: 3 }).map((_, i) => (
            <div 
              key={i}
              className="absolute bg-secret-red h-px"
              style={{
                width: '100%',
                top: `${30 + i * 20}%`,
                animation: `glitch ${0.5 + i * 0.2}s infinite alternate`,
                animationDelay: `${i * 0.1}s`
              }}
            />
          ))}
        </div>
      )}
    </Card>
  );
};

export default SecretAgenda;