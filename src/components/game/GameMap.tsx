import { useState } from 'react';
import { Card } from '@/components/ui/card';

interface State {
  id: string;
  name: string;
  x: number;
  y: number;
  defense: number;
  pressure: number;
  owner: 'player' | 'ai' | 'neutral';
}

interface GameMapProps {
  states: State[];
  onStateClick: (stateId: string) => void;
}

const GameMap = ({ states, onStateClick }: GameMapProps) => {
  const [hoveredState, setHoveredState] = useState<string | null>(null);

  // Simplified US state positions (grid fallback)
  const statePositions = {
    'WA': { x: 10, y: 10 }, 'OR': { x: 10, y: 25 }, 'CA': { x: 10, y: 40 },
    'ID': { x: 25, y: 15 }, 'NV': { x: 25, y: 35 }, 'AZ': { x: 25, y: 50 },
    'MT': { x: 40, y: 10 }, 'WY': { x: 40, y: 25 }, 'UT': { x: 40, y: 35 }, 'CO': { x: 40, y: 45 },
    'NM': { x: 40, y: 60 }, 'ND': { x: 55, y: 5 }, 'SD': { x: 55, y: 18 }, 'NE': { x: 55, y: 30 },
    'KS': { x: 55, y: 42 }, 'OK': { x: 55, y: 55 }, 'TX': { x: 55, y: 70 }, 'MN': { x: 70, y: 8 },
    'IA': { x: 70, y: 25 }, 'MO': { x: 70, y: 40 }, 'AR': { x: 70, y: 55 }, 'LA': { x: 70, y: 70 },
    'WI': { x: 85, y: 15 }, 'IL': { x: 85, y: 30 }, 'MS': { x: 85, y: 60 }, 'AL': { x: 100, y: 55 },
    'IN': { x: 100, y: 35 }, 'KY': { x: 100, y: 45 }, 'TN': { x: 115, y: 50 }, 'MI': { x: 115, y: 25 },
    'OH': { x: 130, y: 35 }, 'WV': { x: 130, y: 45 }, 'VA': { x: 145, y: 45 }, 'NC': { x: 145, y: 55 },
    'SC': { x: 145, y: 65 }, 'GA': { x: 130, y: 65 }, 'FL': { x: 130, y: 80 }, 'PA': { x: 145, y: 35 },
    'NY': { x: 160, y: 25 }, 'VT': { x: 175, y: 20 }, 'NH': { x: 175, y: 25 }, 'ME': { x: 190, y: 15 },
    'MA': { x: 175, y: 30 }, 'RI': { x: 180, y: 32 }, 'CT': { x: 170, y: 32 }, 'NJ': { x: 155, y: 38 },
    'DE': { x: 150, y: 40 }, 'MD': { x: 145, y: 40 }, 'DC': { x: 145, y: 42 }, 'AK': { x: 15, y: 85 },
    'HI': { x: 35, y: 85 }
  };

  const getStateColor = (state: State) => {
    if (state.owner === 'player') return 'fill-truth-red border-truth-red';
    if (state.owner === 'ai') return 'fill-government-blue border-government-blue';
    return 'fill-muted border-border';
  };

  return (
    <Card className="p-4 h-full">
      <h2 className="text-xl font-bold mb-4 text-center font-mono">
        UNITED STATES OF CONSPIRACY
      </h2>
      
      <div className="relative w-full h-[600px] bg-muted/20 rounded border-2 border-dashed">
        {/* SVG Map */}
        <svg 
          viewBox="0 0 200 100" 
          className="w-full h-full"
          style={{ filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.3))' }}
        >
          {Object.entries(statePositions).map(([stateCode, pos]) => {
            const state = states.find(s => s.id === stateCode) || {
              id: stateCode,
              name: stateCode,
              x: pos.x,
              y: pos.y,
              defense: 2,
              pressure: 0,
              owner: 'neutral' as const
            };
            
            return (
              <g key={stateCode}>
                <rect
                  x={pos.x - 3}
                  y={pos.y - 2}
                  width="6"
                  height="4"
                  className={`${getStateColor(state)} stroke-2 cursor-pointer transition-all hover:scale-110`}
                  onClick={() => onStateClick(stateCode)}
                  onMouseEnter={() => setHoveredState(stateCode)}
                  onMouseLeave={() => setHoveredState(null)}
                />
                
                {/* Pressure indicators */}
                {state.pressure > 0 && (
                  <circle
                    cx={pos.x}
                    cy={pos.y - 4}
                    r="1"
                    className="fill-destructive animate-pulse"
                  />
                )}
                
                {/* State label */}
                <text
                  x={pos.x}
                  y={pos.y + 1}
                  textAnchor="middle"
                  className="text-xs font-mono fill-foreground"
                  style={{ fontSize: '2px' }}
                >
                  {stateCode}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Tooltip */}
        {hoveredState && (
          <div className="absolute top-4 left-4 bg-popover border rounded p-2 text-sm font-mono">
            <div className="font-bold">{hoveredState}</div>
            <div>Defense: {states.find(s => s.id === hoveredState)?.defense || 2}</div>
            <div>Pressure: {states.find(s => s.id === hoveredState)?.pressure || 0}</div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 flex justify-center gap-6 text-xs font-mono">
        <div className="flex items-center gap-2">
          <div className="w-3 h-2 bg-truth-red border border-truth-red"></div>
          <span>Truth Seekers</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-2 bg-government-blue border border-government-blue"></div>
          <span>Deep State</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-2 bg-muted border border-border"></div>
          <span>Contested</span>
        </div>
      </div>
    </Card>
  );
};

export default GameMap;