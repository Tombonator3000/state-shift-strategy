import React, { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import * as topojson from 'topojson-client';
import { geoAlbersUsa, geoPath } from 'd3-geo';
import { AlertTriangle, Target, Shield } from 'lucide-react';

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
      const canTarget = selectedZoneCard && gameState && gameState.owner !== 'player'; // Can't target own states
      let classes = `state-path ${getStateOwnerClass(gameState)}`;
      if (isSelected) classes += ' selected';
      if (isTargeting && canTarget) classes += ' targeting';
      if (isTargeting && !canTarget) classes += ' invalid-target';
      
      pathElement.setAttribute('class', classes);
      pathElement.setAttribute('data-state-id', stateId);
      pathElement.setAttribute('data-state-abbr', gameState?.abbreviation || stateId);
      
      // Enhanced event listeners with better feedback
      pathElement.addEventListener('click', () => {
        if (selectedZoneCard && gameState) {
          if (gameState.owner === 'player') {
            // Can't target own states - enhanced feedback
            audio?.playSFX?.('lightClick');
            toast({
              title: "❌ Invalid Target",
              description: `Cannot target ${gameState.name} - you already control this state!`,
              variant: "destructive",
            });
            return;
          }
          
          // Valid target - success feedback
          audio?.playSFX?.('click');
          toast({
            title: "🎯 Target Acquired",
            description: `Deploying zone asset to ${gameState.name}...`,
          });
          onStateClick(gameState?.abbreviation || stateId);
        } else {
          audio?.playSFX?.('lightClick');
          onStateClick(gameState?.abbreviation || stateId);
        }
      });
      pathElement.addEventListener('mouseenter', (e) => {
        audio?.playSFX?.('lightClick'); // Very quiet hover sound
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
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-foreground font-mono">
            SHADOW GOVERNMENT: USA CONTROL GRID
          </h3>
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
        {/* Enhanced Legend */}
        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div className="w-4 h-4 bg-blue-500 border border-border rounded shadow-sm"></div>
              <span className="text-foreground font-mono font-medium">Truth Seekers</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-red-500/10 border border-red-500/20">
              <div className="w-4 h-4 bg-red-500 border border-border rounded shadow-sm"></div>
              <span className="text-foreground font-mono font-medium">Government</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-400/10 border border-gray-400/20">
              <div className="w-4 h-4 bg-gray-400 border border-border rounded shadow-sm"></div>
              <span className="text-foreground font-mono font-medium">Neutral</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
              <div className="w-4 h-4 bg-orange-500 border border-border rounded shadow-sm animate-pulse"></div>
              <span className="text-foreground font-mono font-medium">Contested</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-destructive/10 border border-destructive/20">
              <div className="w-3 h-3 bg-destructive rounded-full shadow-sm animate-pulse"></div>
              <span className="text-foreground font-mono font-medium">Pressure Indicators</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-accent/10 border border-accent/20">
              <Shield className="w-4 h-4 text-accent" />
              <span className="text-foreground font-mono font-medium">Defense Points</span>
            </div>
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
                  <div className="text-sm font-mono bg-accent/20 border border-accent/40 p-3 rounded shadow-sm">
                    <span className="font-bold text-foreground">{stateInfo.specialBonus}</span>
                    {stateInfo.bonusValue && <span className="text-primary font-bold"> (+{stateInfo.bonusValue} IP)</span>}
                  </div>
                </div>
              )}
          </div>
        </div>
      )}

      <style>
        {`
        /* Firefox/LibreWolf flickering fix */
        #map-container, svg {
          will-change: transform;
          transform: translateZ(0);
          backface-visibility: hidden;
          contain: paint;
        }
        
        .state-path {
          stroke: hsl(var(--border));
          stroke-width: 1;
          cursor: pointer;
          transition: all 0.2s ease;
          will-change: transform;
          transform: translateZ(0);
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
          stroke: hsl(var(--foreground));
        }
        
        /* Firefox-specific: reduce costly filter effects */
        @-moz-document url-prefix() {
          .state-path:hover {
            filter: none;
            opacity: 0.9;
          }
        }
        
        .state-path.targeting {
          stroke: #ffd700;
          stroke-width: 4;
          stroke-dasharray: 8,4;
          animation: dash 1s linear infinite, targetPulse 2s ease-in-out infinite;
          filter: brightness(1.3) drop-shadow(0 0 15px #ffd700);
          cursor: crosshair;
        }
        
        .state-path.invalid-target {
          stroke: #ef4444;
          stroke-width: 3;
          stroke-dasharray: 4,4;
          animation: dash 0.5s linear infinite;
          filter: brightness(0.7) saturate(0.5);
          cursor: not-allowed;
        }
        
        @keyframes targetPulse {
          0%, 100% { 
            stroke-width: 4;
            filter: brightness(1.3) drop-shadow(0 0 15px #ffd700);
          }
          50% { 
            stroke-width: 6;
            filter: brightness(1.6) drop-shadow(0 0 25px #ffd700) drop-shadow(0 0 35px #ffd700);
          }
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
          font-size: 14px;
          font-weight: bold;
          fill: #000000;
          stroke: #ffffff;
          stroke-width: 2;
          paint-order: stroke fill;
          pointer-events: none;
          font-family: monospace;
          text-anchor: middle;
          text-shadow: 0 0 4px rgba(255,255,255,0.8);
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