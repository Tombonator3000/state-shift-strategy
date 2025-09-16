import React, { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import * as topojson from 'topojson-client';
import { geoAlbersUsa, geoPath } from 'd3-geo';

interface State {
  id: string;
  name: string;
  abbreviation: string;
  baseIP: number;
  defense: number;
  pressure: number;
  owner: 'player' | 'ai' | 'neutral';
  specialBonus?: string;
  bonusValue?: number;
}

interface USAMapProps {
  states: State[];
  onStateClick: (stateId: string) => void;
  selectedCard?: string | null;
  audio?: any;
}

const USAMap: React.FC<USAMapProps> = ({ states, onStateClick, selectedCard, audio }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [geoData, setGeoData] = useState<any>(null);
  const [hoveredState, setHoveredState] = useState<string | null>(null);

  useEffect(() => {
    // Load US states TopoJSON data
    const loadUSData = async () => {
      try {
        // Using us-atlas package data
        const response = await fetch('https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json');
        const topology = await response.json();
        
        // Convert TopoJSON to GeoJSON
        const geojson = topojson.feature(topology, topology.objects.states);
        setGeoData(geojson);
      } catch (error) {
        console.error('Failed to load US map data:', error);
        // Fallback to mock data if needed
        setGeoData({
          type: 'FeatureCollection',
          features: states.map(state => ({
            type: 'Feature',
            id: state.id,
            properties: { name: state.name },
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

    // Set up Albers USA projection
    const projection = geoAlbersUsa()
      .scale(1000)
      .translate([width / 2, height / 2]);

    const path = geoPath(projection);

    // Clear previous content
    svg.innerHTML = '';

    // Create groups for different layers
    const statesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const labelsGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    
    svg.appendChild(statesGroup);
    svg.appendChild(labelsGroup);

    // Draw states
    geoData.features.forEach((feature: any) => {
      const stateId = feature.id || feature.properties.name;
      const gameState = states.find(s => 
        s.id === stateId || 
        s.name === feature.properties.name ||
        s.abbreviation === feature.properties.STUSPS || // Handle different ID formats
        s.id === feature.properties.STUSPS
      );

      const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      pathElement.setAttribute('d', path(feature) || '');
      pathElement.setAttribute('class', `state-path ${getStateClass(gameState)}`);
      pathElement.setAttribute('data-state-id', stateId);
      
      // Add event listeners
      pathElement.addEventListener('click', () => {
        audio?.playSFX?.('stateCapture');
        onStateClick(stateId);
      });
      pathElement.addEventListener('mouseenter', () => setHoveredState(stateId));
      pathElement.addEventListener('mouseleave', () => setHoveredState(null));

      statesGroup.appendChild(pathElement);

      // Add state labels and indicators
      const centroid = path.centroid(feature);
      if (centroid && !isNaN(centroid[0]) && !isNaN(centroid[1])) {
        // State name/abbreviation label
        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('x', centroid[0].toString());
        label.setAttribute('y', centroid[1].toString());
        label.setAttribute('text-anchor', 'middle');
        label.setAttribute('class', 'state-label');
        label.textContent = gameState?.abbreviation || stateId;
        labelsGroup.appendChild(label);

        // Pressure indicators
        if (gameState?.pressure > 0) {
          for (let i = 0; i < Math.min(gameState.pressure, 3); i++) {
            const indicator = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            indicator.setAttribute('cx', (centroid[0] - 10 + i * 10).toString());
            indicator.setAttribute('cy', (centroid[1] + 15).toString());
            indicator.setAttribute('r', '3');
            indicator.setAttribute('class', 'pressure-indicator');
            labelsGroup.appendChild(indicator);
          }
        }
      }
    });

  }, [geoData, states, onStateClick]);

  const getStateClass = (state?: State) => {
    if (!state) return 'neutral';
    return state.owner;
  };

  const getHoveredStateInfo = () => {
    if (!hoveredState) return null;
    const state = states.find(s => s.id === hoveredState);
    return state;
  };

  return (
    <Card className="p-4 bg-card border-border relative">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground">United States - Shadow Government Control</h3>
      </div>
      
      <div className="relative">
        <svg 
          ref={svgRef}
          width="800" 
          height="500" 
          className="w-full h-full border border-border rounded"
          style={{ backgroundColor: 'hsl(var(--muted))' }}
          viewBox="0 0 800 500"
          preserveAspectRatio="xMidYMid meet"
        >
        </svg>

        {/* Enhanced Tooltip */}
        {hoveredState && getHoveredStateInfo() && (
          <div className="absolute top-2 left-2 bg-card border-2 border-border rounded-lg p-4 shadow-xl z-10 max-w-sm backdrop-blur-sm bg-card/95">
            <div className="space-y-2">
              <div className="font-bold text-lg text-foreground">{getHoveredStateInfo()?.name}</div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="space-y-1">
                  <div className="text-foreground font-medium">
                    Owner: <span className={`capitalize font-bold ${getHoveredStateInfo()?.owner === 'player' ? 'text-truth-red' : getHoveredStateInfo()?.owner === 'ai' ? 'text-government-blue' : 'text-muted-foreground'}`}>
                      {getHoveredStateInfo()?.owner === 'neutral' ? 'NEUTRAL' : getHoveredStateInfo()?.owner?.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-foreground">Base IP: <span className="font-mono font-bold">{getHoveredStateInfo()?.baseIP}</span></div>
                </div>
                <div className="space-y-1">
                  <div className="text-foreground">Defense: <span className="font-mono font-bold">{getHoveredStateInfo()?.defense}</span></div>
                  <div className="text-foreground">Pressure: <span className="font-mono font-bold text-destructive">{getHoveredStateInfo()?.pressure}</span></div>
                </div>
              </div>
              {getHoveredStateInfo()?.specialBonus && (
                <div className="text-base mt-2 p-3 bg-accent/20 border border-accent/40 rounded">
                  <span className="font-bold text-lg text-foreground">🎯 Special Bonus</span><br />
                  <span className="font-mono text-lg text-foreground">{getHoveredStateInfo()?.specialBonus}</span>
                  {getHoveredStateInfo()?.bonusValue && <span className="text-primary font-bold"> (+${getHoveredStateInfo()?.bonusValue} IP)</span>}
                </div>
              )}
              {getHoveredStateInfo()?.pressure >= getHoveredStateInfo()?.defense && (
                <div className="text-destructive text-sm font-bold bg-destructive/10 border border-destructive/20 rounded p-2">
                  ⚠️ Capture {getHoveredStateInfo()?.pressure}/{getHoveredStateInfo()?.defense} needed
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-truth border border-border rounded"></div>
          <span className="text-foreground">Truth Seekers</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-government border border-border rounded"></div>
          <span className="text-foreground">Government</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-muted border border-border rounded"></div>
          <span className="text-foreground">Neutral</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-destructive rounded-full"></div>
          <span className="text-foreground">Pressure</span>
        </div>
      </div>

      <style>
        {`
        .state-path {
          stroke: hsl(var(--border));
          stroke-width: 1;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .state-path.player {
          fill: hsl(var(--truth));
        }
        
        .state-path.ai {
          fill: hsl(var(--government));
        }
        
        .state-path.neutral {
          fill: hsl(var(--muted));
        }
        
        .state-path:hover {
          stroke-width: 2;
          filter: brightness(1.1);
        }
        
        .state-label {
          font-size: 10px;
          font-weight: bold;
          fill: hsl(var(--foreground));
          pointer-events: none;
        }
        
        .pressure-indicator {
          fill: hsl(var(--destructive));
          stroke: hsl(var(--destructive-foreground));
          stroke-width: 0.5;
        }
        `}
      </style>
    </Card>
  );
};

export default USAMap;