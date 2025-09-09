import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Eye, Lock } from 'lucide-react';

interface SecretAgendaProps {
  agenda: {
    id: string;
    description: string;
    progress: number;
    target: number;
    completed: boolean;
    revealed: boolean;
  };
  isPlayer?: boolean;
}

const SecretAgenda = ({ agenda, isPlayer = true }: SecretAgendaProps) => {
  const progressPercent = (agenda.progress / agenda.target) * 100;

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

  // Player view - full display
  return (
    <Card className="p-4 bg-black text-white border-2 border-secret-red relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-secret-red/10 to-transparent"></div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          {agenda.revealed ? (
            <Eye size={16} className="text-secret-red" />
          ) : (
            <Lock size={16} className="text-secret-red" />
          )}
          <h3 className="font-bold text-sm font-mono text-secret-red">
            {agenda.revealed ? 'YOUR SECRET AGENDA' : 'CLASSIFIED OBJECTIVE'}
          </h3>
        </div>

        {agenda.revealed ? (
          <div className="space-y-3">
            <div className="text-xs font-mono">
              {agenda.description}
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Progress:</span>
                <span>{agenda.progress}/{agenda.target}</span>
              </div>
              <Progress 
                value={progressPercent} 
                className="h-2 bg-gray-800"
              />
            </div>

            {agenda.completed && (
              <div className="text-xs text-center text-secret-red font-bold animate-pulse">
                *** OBJECTIVE COMPLETE ***
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-xs font-mono text-gray-400">
              ███████████████████████
            </div>
            <div className="text-xs font-mono text-gray-400">
              ████████████ █████████
            </div>
            <div className="text-xs font-mono text-gray-400">
              ███████ ████████████████
            </div>
            
            <div className="text-xs text-center text-secret-red mt-3">
              [SECURITY CLEARANCE INSUFFICIENT]
            </div>
            
            {agenda.progress > 0 && (
              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1 h-1 bg-gray-800 rounded">
                  <div 
                    className="h-full bg-secret-red rounded transition-all"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="text-xs text-gray-400">
                  {Math.floor(progressPercent)}%
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Glitch effect overlay */}
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
    </Card>
  );
};

export default SecretAgenda;