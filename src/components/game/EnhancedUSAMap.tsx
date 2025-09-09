import React, { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import * as topojson from 'topojson-client';
import { geoAlbersUsa, geoPath } from 'd3-geo';

interface EnhancedState {
  id: string;
  name: string;
  abbreviation: string;
  baseIP: number;
  defense: number;
  pressure: number;
  owner: 'player' | 'ai' | 'neutral';
  specialBonus?: string;
  bonusValue?: number;
  contested?: boolean;
}

interface EnhancedUSAMapProps {
  states: EnhancedState[];
  onStateClick: (stateId: string) => void;
  selectedZoneCard?: string | null;
  hoveredStateId?: string | null;
  selectedState?: string | null;
  audio?: any;
}

const EnhancedUSAMap: React.FC<EnhancedUSAMapProps> = ({ 
  states, 
  onStateClick, 
  selectedZoneCard,
  hoveredStateId,
  selectedState,
  audio
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [geoData, setGeoData] = useState<any>(null);
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    const loadUSData = async () => {
      try {
        const response = await fetch('https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json');
        const topology = await response.json();
        const geojson = topojson.feature(topology, topology.objects.states);
        setGeoData(geojson);
      } catch (error) {
        console.error('Failed to load US map data:', error);
        // Fallback mock data
        setGeoData({
          type: 'FeatureCollection',
          features: states.map(state => ({
            type: 'Feature',
            id: state.id,
            properties: { name: state.name, STUSPS: state.abbreviation },
            geometry: {
              type: 'Polygon',
              coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]
            }
          }))
        });
      }
    };

    loadUSData();
  }, [states]);

  useEffect(() => {
    if (!geoData || !svgRef.current) return;

    const svg = svgRef.current;
    const width = 800;
    const height = 500;

    const projection = geoAlbersUsa()
      .scale(1000)
      .translate([width / 2, height / 2]);

    const path = geoPath(projection);

    // Clear previous content
    svg.innerHTML = '';

    // Create groups for different layers
    const statesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const pressureGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const labelsGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    
    svg.appendChild(statesGroup);
    svg.appendChild(pressureGroup);
    svg.appendChild(labelsGroup);

    // Draw states
    geoData.features.forEach((feature: any) => {
      const stateId = feature.properties.STUSPS || feature.id || feature.properties.name;
      const gameState = states.find(s => 
        s.abbreviation === stateId || 
        s.id === stateId || 
        s.name === feature.properties.name
      );

      const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      pathElement.setAttribute('d', path(feature) || '');
      
      // Determine classes based on state
      const isSelected = selectedState === (gameState?.abbreviation || stateId);
      const isTargeting = selectedZoneCard && !isSelected;
      let classes = `state-path ${getStateOwnerClass(gameState)}`;
      if (isSelected) classes += ' selected';
      if (isTargeting) classes += ' targeting';
      
      pathElement.setAttribute('class', classes);
      pathElement.setAttribute('data-state-id', stateId);
      pathElement.setAttribute('data-state-abbr', gameState?.abbreviation || stateId);
      
      // Add event listeners
      pathElement.addEventListener('click', () => {
        audio?.playSFX?.('click');
        onStateClick(gameState?.abbreviation || stateId);
      });
      pathElement.addEventListener('mouseenter', (e) => {
        audio?.playSFX?.('hover');
        setHoveredState(stateId);
        setMousePosition({ x: e.clientX, y: e.clientY });
      });
      pathElement.addEventListener('mousemove', (e) => {
        setMousePosition({ x: e.clientX, y: e.clientY });
      });
      pathElement.addEventListener('mouseleave', () => {
        setHoveredState(null);
      });

      statesGroup.appendChild(pathElement);

      // Add state labels
      const centroid = path.centroid(feature);
      if (centroid && !isNaN(centroid[0]) && !isNaN(centroid[1])) {
        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('x', centroid[0].toString());
        label.setAttribute('y', centroid[1].toString());
        label.setAttribute('text-anchor', 'middle');
        label.setAttribute('class', 'state-label');
        label.textContent = gameState?.abbreviation || stateId;
        labelsGroup.appendChild(label);

        // Add pressure indicators
        if (gameState && gameState.pressure > 0) {
          const maxIndicators = 3;
          const indicatorsToShow = Math.min(gameState.pressure, maxIndicators);
          
          for (let i = 0; i < indicatorsToShow; i++) {
            const indicator = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            indicator.setAttribute('cx', (centroid[0] - 15 + i * 10).toString());
            indicator.setAttribute('cy', (centroid[1] + 20).toString());
            indicator.setAttribute('r', '4');
            indicator.setAttribute('class', 'pressure-indicator');
            pressureGroup.appendChild(indicator);
          }

          // Show overflow with +X indicator
          if (gameState.pressure > maxIndicators) {
            const overflowText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            overflowText.setAttribute('x', (centroid[0] + 20).toString());
            overflowText.setAttribute('y', (centroid[1] + 25).toString());
            overflowText.setAttribute('class', 'pressure-overflow');
            overflowText.textContent = `+${gameState.pressure - maxIndicators}`;
            pressureGroup.appendChild(overflowText);
          }
        }

        // Add defense indicators
        if (gameState && gameState.defense > 0) {
          for (let i = 0; i < gameState.defense; i++) {
            const shield = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
            const size = 3;
            const x = centroid[0] - 15 + i * 8;
            const y = centroid[1] - 20;
            shield.setAttribute('points', `${x},${y-size} ${x+size},${y} ${x},${y+size} ${x-size},${y}`);
            shield.setAttribute('class', 'defense-indicator');
            pressureGroup.appendChild(shield);
          }
        }
      }
    });

  }, [geoData, states, onStateClick, selectedZoneCard, selectedState]);

  const getStateOwnerClass = (state?: EnhancedState) => {
    if (!state) return 'neutral';
    if (state.contested) return 'contested';
    return state.owner;
  };

  const getHoveredStateInfo = () => {
    if (!hoveredState) return null;
    return states.find(s => 
      s.abbreviation === hoveredState || 
      s.id === hoveredState
    );
  };

  const stateInfo = getHoveredStateInfo();

  return (
    <div className="relative">
      <Card className="p-4 bg-card border-border relative">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground font-mono">
            SHADOW GOVERNMENT: USA CONTROL GRID
          </h3>
          {selectedZoneCard && (
            <Badge variant="destructive" className="animate-pulse font-mono">
              🎯 TARGET MODE: Click State to Apply Zone Card
            </Badge>
          )}
        </div>
        
        <div className="relative">
          <svg 
            ref={svgRef}
            width="800" 
            height="500" 
            className="w-full h-full border border-border rounded bg-black/5"
            viewBox="0 0 800 500"
            preserveAspectRatio="xMidYMid meet"
          >
          </svg>
        </div>

        {/* Legend */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 border border-border rounded"></div>
            <span className="text-foreground font-mono">Truth Seekers</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 border border-border rounded"></div>
            <span className="text-foreground font-mono">Government</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-400 border border-border rounded"></div>
            <span className="text-foreground font-mono">Neutral</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-500 border border-border rounded"></div>
            <span className="text-foreground font-mono">Contested</span>
          </div>
        </div>

        <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-destructive rounded-full"></div>
            <span className="text-foreground font-mono">Pressure</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-accent border border-accent-foreground transform rotate-45"></div>
            <span className="text-foreground font-mono">Defense</span>
          </div>
        </div>
      </Card>

      {/* Enhanced Tooltip */}
      {hoveredState && stateInfo && (
        <div 
          className="fixed bg-popover border border-border rounded-lg p-4 shadow-2xl z-50 max-w-sm"
          style={{ 
            left: mousePosition.x + 10, 
            top: mousePosition.y - 10,
            transform: 'translateY(-100%)'
          }}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-foreground font-mono">{stateInfo.name}</h4>
              <Badge 
                variant="outline" 
                className={`${
                  stateInfo.owner === 'player' ? 'border-blue-500 text-blue-500' :
                  stateInfo.owner === 'ai' ? 'border-red-500 text-red-500' :
                  stateInfo.contested ? 'border-orange-500 text-orange-500' :
                  'border-gray-400 text-gray-400'
                }`}
              >
                {stateInfo.contested ? 'CONTESTED' : 
                 stateInfo.owner === 'player' ? 'TRUTH' : 
                 stateInfo.owner === 'ai' ? 'GOVERNMENT' : 'NEUTRAL'}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Base IP</div>
                <div className="font-mono text-foreground">{stateInfo.baseIP}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Defense</div>
                <div className="font-mono text-foreground">{stateInfo.defense}</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Pressure</div>
                <div className="font-mono text-destructive">{stateInfo.pressure}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Capture</div>
                <div className="font-mono text-foreground">
                  {stateInfo.pressure >= stateInfo.defense ? 'READY' : `${stateInfo.defense - stateInfo.pressure} needed`}
                </div>
              </div>
            </div>
            
              {stateInfo.specialBonus && (
                <div className="pt-2 border-t border-border">
                  <div className="text-sm font-bold text-foreground mb-1">🎯 Special Bonus</div>
                  <div className="text-base font-mono text-accent bg-accent/10 p-2 rounded">
                    {stateInfo.specialBonus}
                    {stateInfo.bonusValue && ` (+${stateInfo.bonusValue} IP)`}
                  </div>
                </div>
              )}
          </div>
        </div>
      )}

      <style>
        {`
        .state-path {
          stroke: hsl(var(--border));
          stroke-width: 1;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .state-path.player {
          fill: #3b82f6;
        }
        
        .state-path.ai {
          fill: #ef4444;
        }
        
        .state-path.neutral {
          fill: #9ca3af;
        }
        
        .state-path.contested {
          fill: #f97316;
          animation: pulse 2s infinite;
        }
        
        .state-path:hover {
          stroke-width: 3;
          filter: brightness(1.2);
          stroke: hsl(var(--foreground));
        }
        
        .state-path.targeting {
          stroke: hsl(var(--warning, 45 93% 58%));
          stroke-width: 3;
          stroke-dasharray: 8,4;
          animation: dash 1s linear infinite;
        }
        
        .state-path.selected {
          stroke: #ffffff;
          stroke-width: 4;
          filter: brightness(1.4) drop-shadow(0 0 10px #ffffff);
          animation: pulseGlow 1.5s ease-in-out infinite;
        }
        
        @keyframes dash {
          to { stroke-dashoffset: -12; }
        }
        
        @keyframes pulseGlow {
          0%, 100% { 
            filter: brightness(1.4) drop-shadow(0 0 10px #ffffff);
            stroke-width: 4;
          }
          50% { 
            filter: brightness(1.8) drop-shadow(0 0 20px #ffffff) drop-shadow(0 0 40px #ffffff);
            stroke-width: 6;
          }
        }
        
        .state-label {
          font-size: 10px;
          font-weight: bold;
          fill: white;
          text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
          pointer-events: none;
          font-family: monospace;
        }
        
        .pressure-indicator {
          fill: hsl(var(--destructive));
          stroke: white;
          stroke-width: 1;
          animation: pulse 1.5s infinite;
        }
        
        .pressure-overflow {
          font-size: 8px;
          font-weight: bold;
          fill: hsl(var(--destructive));
          font-family: monospace;
        }
        
        .defense-indicator {
          fill: hsl(var(--accent));
          stroke: hsl(var(--accent-foreground));
          stroke-width: 0.5;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        `}
      </style>
    </div>
  );
};

export default EnhancedUSAMap;