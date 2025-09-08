import { Progress } from '@/components/ui/progress';

interface TruthMeterProps {
  value: number; // 0-100
}

const TruthMeter = ({ value }: TruthMeterProps) => {
  const getColor = () => {
    if (value >= 90) return 'bg-truth-red';
    if (value <= 10) return 'bg-government-blue';
    return 'bg-primary';
  };

  const getGlowEffect = () => {
    if (value >= 90 || value <= 10) {
      return 'animate-pulse drop-shadow-glow-red';
    }
    return '';
  };

  return (
    <div className="flex items-center gap-3">
      <div className="text-sm font-mono font-bold">TRUTH METER</div>
      
      <div className={`relative w-32 ${getGlowEffect()}`}>
        <Progress 
          value={value} 
          className="h-3 bg-muted"
        />
        <div 
          className={`absolute top-0 left-0 h-3 rounded transition-all ${getColor()}`}
          style={{ width: `${value}%` }}
        />
        
        {/* Critical thresholds */}
        <div className="absolute top-0 left-[10%] w-0.5 h-3 bg-government-blue opacity-50"></div>
        <div className="absolute top-0 left-[90%] w-0.5 h-3 bg-truth-red opacity-50"></div>
      </div>
      
      <div className="text-sm font-mono font-bold min-w-12">
        {value}%
      </div>
      
      {/* Status indicator */}
      {value >= 90 && (
        <div className="text-xs font-mono text-truth-red animate-pulse">
          TRUTH REVEALED!
        </div>
      )}
      {value <= 10 && (
        <div className="text-xs font-mono text-government-blue animate-pulse">
          TRUTH SUPPRESSED!
        </div>
      )}
    </div>
  );
};

export default TruthMeter;