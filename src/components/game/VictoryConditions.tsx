import { useId, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { TRUTH_HIGH_THRESHOLD, TRUTH_LOW_THRESHOLD } from '@/constants/truthThresholds';
import { ECONOMIC_VICTORY_IP, TERRITORIAL_VICTORY_STATES } from '@/game/victoryRules';

interface VictoryConditionsProps {
  controlledStates: number;
  truth: number;
  ip: number;
  faction?: 'truth' | 'government';
  economicGoal?: number;
  truthHigh?: number;
  truthLow?: number;
  isMobile?: boolean;
}

export const VictoryConditions = ({
  controlledStates, truth, ip, faction = 'truth',
  economicGoal = ECONOMIC_VICTORY_IP,
  truthHigh = TRUTH_HIGH_THRESHOLD, truthLow = TRUTH_LOW_THRESHOLD,
  isMobile = false,
}: VictoryConditionsProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const contentId = useId();
  const truthTarget = faction === 'truth' ? truthHigh : truthLow;
  const truthProgress = faction === 'truth'
    ? (truth - 50) / Math.max(1, truthTarget - 50) * 100
    : (50 - truth) / Math.max(1, 50 - truthTarget) * 100;
  const paths = [
    { label: faction === 'truth' ? `Raise Truth to ${truthTarget}%` : `Lower Truth to ${truthTarget}%`, value: `${Math.round(truth)}%`, progress: truthProgress },
    { label: `Bank ${economicGoal} IP`, value: `${ip} / ${economicGoal}`, progress: ip / economicGoal * 100 },
    { label: `Control ${TERRITORIAL_VICTORY_STATES} states`, value: `${controlledStates} / ${TERRITORIAL_VICTORY_STATES}`, progress: controlledStates / TERRITORIAL_VICTORY_STATES * 100 },
  ];

  return (
    <section className={`bg-newspaper-text text-newspaper-bg border border-newspaper-border ${isMobile ? 'p-3' : 'p-4'}`}>
      <button type="button" className="flex min-h-11 w-full items-center justify-between gap-3 text-left font-bold text-sm" aria-expanded={isExpanded} aria-controls={contentId} onClick={() => setIsExpanded(value => !value)}>
        VICTORY CONDITIONS
        {isExpanded ? <ChevronUp aria-hidden className="h-4 w-4" /> : <ChevronDown aria-hidden className="h-4 w-4" />}
      </button>
      {isExpanded && (
        <div id={contentId} className="space-y-4 pt-2 text-sm">
          <p>Complete any one path. Truth takes priority, then IP, then states.</p>
          {paths.map(path => {
            const progress = Math.max(0, Math.min(100, path.progress));
            return (
              <div key={path.label}>
                <div className="flex flex-wrap justify-between gap-x-3 gap-y-1">
                  <span>{path.label}</span><span className="font-mono tabular-nums">{path.value}</span>
                </div>
                <div role="progressbar" aria-label={path.label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)} aria-valuetext={path.value} className="mt-2 h-1.5 bg-newspaper-bg/20">
                  <div className="h-full bg-newspaper-bg" style={{ width: `${progress}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
