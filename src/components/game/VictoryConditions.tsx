import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

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

  return (
    <div id="victory-conditions" className="bg-newspaper-text text-newspaper-bg p-2 mb-3 border border-newspaper-border">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex-1 text-center">
          <div className="text-[8px] uppercase tracking-[0.35em] text-newspaper-bg/70">Editorial Desk</div>
          <h3 className="font-bold text-xs tracking-[0.25em]">MISSION BRIEF</h3>
        </div>
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
              States: {controlledStates}/10 | Truth: {truth}% | IP: {ip}/300
            </div>
          ) : (
            <div className="text-xs space-y-1 font-mono">
              <div>• Control 10 states</div>
              <div>• Reach 300 IP</div>
              <div>• Truth ≥95% / ≤5%</div>
              <div className="border-t border-newspaper-bg/30 pt-1 mt-1">
                <div className="text-center text-xs">States: {controlledStates}/10</div>
                <div className="text-center text-xs">Truth: {truth}%</div>
                <div className="text-center text-xs">IP: {ip}/300</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};