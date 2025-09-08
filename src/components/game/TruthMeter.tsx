import { Progress } from '@/components/ui/progress';

interface TruthMeterProps {
  value: number; // 0-100
}

const TruthMeter = ({ value }: TruthMeterProps) => {
  const getColor = () => {
    if (value >= 90) return 'bg-truth-red';
    if (value <= 10) return 'bg-government-blue';
    return 'bg-gradient-to-r from-government-blue to-truth-red';
  };

  const getGlowEffect = () => {
    if (value >= 90 || value <= 10) {
      return 'animate-truth-pulse';
    }
    return '';
  };

  const getLabel = () => {
    if (value >= 90) return 'TRUTH REVEALED';
    if (value <= 10) return 'TRUTH SUPPRESSED';
    if (value >= 70) return 'AWAKENING';
    if (value <= 30) return 'CONTROLLED';
    return 'CONTESTED';
  };

  return (
    <div className="flex items-center gap-4 bg-black/20 p-3 rounded-lg border border-secret-red/30">
      <div className="text-sm font-mono font-bold text-secret-red">TRUTH-O-METER™</div>
      
      <div className={`relative w-40 ${getGlowEffect()}`}>
        <div className="relative h-4 bg-black rounded border border-secret-red/50 overflow-hidden">
          <div 
            className={`absolute top-0 left-0 h-full transition-all duration-500 ${
              value >= 90 ? 'bg-truth-red' : 
              value <= 10 ? 'bg-government-blue' : 
              'bg-gradient-to-r from-government-blue via-yellow-500 to-truth-red'
            }`}
            style={{ width: `${value}%` }}
          />
          
          {/* Animated scanlines */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
        </div>
        
        {/* Critical thresholds with labels */}
        <div className="absolute -bottom-2 left-[10%] transform -translate-x-1/2">
          <div className="w-0.5 h-2 bg-government-blue"></div>
          <div className="text-xs font-mono text-government-blue mt-1">10%</div>
        </div>
        <div className="absolute -bottom-2 left-[90%] transform -translate-x-1/2">
          <div className="w-0.5 h-2 bg-truth-red"></div>
          <div className="text-xs font-mono text-truth-red mt-1">90%</div>
        </div>
      </div>
      
      <div className="flex flex-col items-center">
        <div className="text-lg font-mono font-bold min-w-12 text-center">
          {value}%
        </div>
        <div className={`text-xs font-mono text-center ${
          value >= 90 ? 'text-truth-red' :
          value <= 10 ? 'text-government-blue' :
          'text-yellow-500'
        }`}>
          {getLabel()}
        </div>
      </div>
      
      {/* Status indicators with glitch effects */}
      {value >= 90 && (
        <div className="text-xs font-mono text-truth-red animate-glitch">
          ⚠️ CONTAINMENT BREACH ⚠️
        </div>
      )}
      {value <= 10 && (
        <div className="text-xs font-mono text-government-blue animate-glitch">
          🔒 NARRATIVE SECURED 🔒
        </div>
      )}
    </div>
  );
};

export default TruthMeter;