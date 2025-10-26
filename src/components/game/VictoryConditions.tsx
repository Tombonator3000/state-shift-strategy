import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { TRUTH_HIGH_THRESHOLD, TRUTH_LOW_THRESHOLD } from '@/constants/truthThresholds';

interface VictoryConditionsProps {
  controlledStates: number;
  truth: number;
  ip: number;
  isMobile?: boolean;
}

export const VictoryConditions: React.FC<VictoryConditionsProps> = ({
  controlledStates,
  truth,
  ip,
  isMobile = false
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Calculate progress towards each condition
  const stateProgress = (controlledStates / 10) * 100;
  const truthProgress = truth;
  const ipProgress = (ip / 200) * 100;

  // Determine which condition is closest
  const progressMetrics = [
    { type: 'states', value: stateProgress, label: 'States' },
    { type: 'truth', value: truth >= 50 ? truthProgress : 100 - truthProgress, label: 'Truth' }
  ];
  const closestCondition = progressMetrics.reduce((prev, curr) => 
    curr.value > prev.value ? curr : prev
  );

  return (
    <div className="bg-newspaper-text text-newspaper-bg p-2 mb-3 border border-newspaper-border">
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="font-bold text-xs text-center flex-1">VICTORY CONDITIONS</h3>
        {isExpanded ? (
          <ChevronUp className="w-3 h-3 ml-1" />
        ) : (
          <ChevronDown className="w-3 h-3 ml-1" />
        )}
      </div>
      
      {isExpanded && (
        <div className="mt-2">
          {isMobile ? (
            <div className="text-xs font-mono">
              States: {controlledStates}/10 | Truth: {truth}% | IP: {ip}
            </div>
          ) : (
            <div className="text-xs space-y-2 font-mono">
              {/* Primary Victory Paths */}
              <div className="border-b border-newspaper-bg/20 pb-2">
                <div className="font-bold mb-1">PRIMARY PATHS:</div>
                
                {/* States Progress */}
                <div className="mb-1">
                  <div className="flex justify-between items-center">
                    <span className={closestCondition.type === 'states' ? 'font-bold' : ''}>
                      • Control 10 states
                    </span>
                    <span className={closestCondition.type === 'states' ? 'font-bold' : ''}>
                      {controlledStates}/10
                    </span>
                  </div>
                  <div className="w-full bg-newspaper-bg/20 h-1 mt-0.5">
                    <div 
                      className="bg-newspaper-bg h-1 transition-all"
                      style={{ width: `${Math.min(100, stateProgress)}%` }}
                    />
                  </div>
                </div>

                {/* Truth Progress */}
                <div>
                  <div className="flex justify-between items-center">
                    <span className={closestCondition.type === 'truth' ? 'font-bold' : ''}>
                      • Truth ≥{TRUTH_HIGH_THRESHOLD}% / ≤{TRUTH_LOW_THRESHOLD}%
                    </span>
                    <span className={closestCondition.type === 'truth' ? 'font-bold' : ''}>
                      {truth}%
                    </span>
                  </div>
                  <div className="w-full bg-newspaper-bg/20 h-1 mt-0.5">
                    <div 
                      className="bg-newspaper-bg h-1 transition-all"
                      style={{ 
                        width: `${truth >= 50 ? truthProgress : 100 - truthProgress}%`,
                        marginLeft: truth < 50 ? 'auto' : '0'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Secondary Metrics */}
              <div className="text-[10px] opacity-70">
                <div className="font-bold mb-0.5">TIE-BREAKER:</div>
                <div>IP: {ip}/200 (Economic dominance)</div>
              </div>

              {/* Closest to Victory Indicator */}
              {closestCondition.value > 50 && (
                <div className="text-[10px] font-bold pt-1 border-t border-newspaper-bg/20">
                  ⚠ Closest: {closestCondition.label} ({Math.round(closestCondition.value)}%)
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};