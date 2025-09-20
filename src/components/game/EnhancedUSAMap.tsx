import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import * as topojson from 'topojson-client';
import { geoAlbersUsa, geoPath } from 'd3-geo';
import { AlertTriangle, Target, Shield } from 'lucide-react';
import { VisualEffectsCoordinator } from '@/utils/visualEffects';


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
  // Occupation data for ZONE takeovers
  occupierCardId?: string | null;
  occupierCardName?: string | null;
  occupierLabel?: string | null;
  occupierIcon?: string | null;
  occupierUpdatedAt?: number;
}

interface PlayedCard {
  card: any;
  player: 'human' | 'ai';
}

interface EnhancedUSAMapProps {
  states: EnhancedState[];
  onStateClick: (stateId: string) => void;
  selectedZoneCard?: string | null;
  hoveredStateId?: string | null;
  selectedState?: string | null;
  audio?: any;
  playedCards?: PlayedCard[];
}

const EnhancedUSAMap: React.FC<EnhancedUSAMapProps> = ({
  states,
  onStateClick,
  selectedZoneCard,
  hoveredStateId,
  selectedState,
  audio,
  playedCards = []
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [geoData, setGeoData] = useState<any>(null);
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const lastPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const frameRef = useRef<number | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const tooltipStableRef = useRef<{ timeout: NodeJS.Timeout | null; lastUpdate: number }>({
    timeout: null,
    lastUpdate: 0
  });
  const contestedStatesRef = useRef<Record<string, boolean>>({});
  const contestedAnimationTimeoutsRef = useRef<number[]>([]);
  const [governmentTarget, setGovernmentTarget] = useState<{
    active: boolean;
    cardId?: string;
    cardName?: string;
    stateId?: string;
    mode?: 'select' | 'lock' | 'complete';
  } | null>(null);

  const getTooltipPosition = () => {
    const tooltipWidth = tooltipRef.current?.offsetWidth ?? 384;
    const tooltipHeight = tooltipRef.current?.offsetHeight ?? 200;

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    
    const margin = 20;
    const rightSideThreshold = vw * 0.6; // Consider right side when mouse is past 60% of screen width
    
    // Calculate base position with more stable positioning for right side
    let left: number;
    if (mousePosition.x > rightSideThreshold) {
      // On right side: always place tooltip to the left of cursor for stability
      left = mousePosition.x - tooltipWidth - 20;
    } else {
      // On left side: place tooltip to the right of cursor
      left = mousePosition.x + 15;
    }
    
    let top = mousePosition.y - tooltipHeight / 2;

    // Final boundary checks
    if (left + tooltipWidth > vw - margin) {
      left = vw - tooltipWidth - margin;
    }
    if (left < margin) {
      left = margin;
    }

    if (top + tooltipHeight > vh - margin) {
      top = vh - tooltipHeight - margin;
    }
    if (top < margin) {
      top = margin;
    }

    return { left, top };
  };

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
    const handleGovernmentZoneTarget = (event: CustomEvent<{ active: boolean; cardId?: string; cardName?: string; stateId?: string; mode?: 'select' | 'lock' | 'complete'; }>) => {
      if (!event?.detail) return;

      if (!event.detail.active) {
        setGovernmentTarget(null);
        return;
      }

      setGovernmentTarget(event.detail);
    };

    window.addEventListener('governmentZoneTarget', handleGovernmentZoneTarget as EventListener);

    return () => {
      window.removeEventListener('governmentZoneTarget', handleGovernmentZoneTarget as EventListener);
    };
  }, []);

  useEffect(() => {
    if (!geoData || !svgRef.current) return;

    const svg = svgRef.current;
    const width = 800;
    const height = 500;

    // Clear any pending contested animation retries before rebuilding the scene
    contestedAnimationTimeoutsRef.current.forEach(timeoutId => window.clearTimeout(timeoutId));
    contestedAnimationTimeoutsRef.current = [];

    // Global pointerleave to hide tooltip when exiting the map
    const handlePointerLeave = () => setHoveredState(null);
    svg.addEventListener('pointerleave', handlePointerLeave);

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
    const nextContestedStates: Record<string, boolean> = {};
    const svgRect = svg.getBoundingClientRect();

    const prefersReducedMotion = typeof window !== 'undefined'
      ? window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
      : false;

    const isGovernmentZoneTargeting = Boolean(governmentTarget?.active);
    const lockedStateId = governmentTarget?.stateId;

    geoData.features.forEach((feature: any) => {
      const stateId = feature.properties.STUSPS || feature.id || feature.properties.name;
      const gameState = states.find(s =>
        s.abbreviation === stateId ||
        s.id === stateId ||
        s.name === feature.properties.name
      );
      const stateKey = gameState?.abbreviation || stateId;
      const isContested = Boolean(gameState?.contested);
      nextContestedStates[stateKey] = isContested;

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
          onStateClick(gameState?.abbreviation || stateId);
        } else {
          audio?.playSFX?.('lightClick');
          onStateClick(gameState?.abbreviation || stateId);
        }
      });
      let spotlightGroup: SVGGElement | null = null;

      pathElement.addEventListener('pointerenter', (e: PointerEvent) => {
        audio?.playSFX?.('lightClick'); // Very quiet hover sound

        // Clear any pending hide timeout
        if (tooltipStableRef.current.timeout) {
          clearTimeout(tooltipStableRef.current.timeout);
          tooltipStableRef.current.timeout = null;
        }
        
        setHoveredState(stateId);
        pathElement.setAttribute('aria-describedby', 'map-state-tooltip');
        
        // Initial position update without throttling for better responsiveness
        const { clientX, clientY } = e;
        lastPosRef.current = { x: clientX, y: clientY };
        setMousePosition({ x: clientX, y: clientY });
        tooltipStableRef.current.lastUpdate = Date.now();

        if (spotlightGroup && isGovernmentZoneTargeting && canTarget && !spotlightGroup.classList.contains('locked')) {
          spotlightGroup.classList.add('active');
        }
      });

      pathElement.addEventListener('pointermove', (e: PointerEvent) => {
        const { clientX, clientY } = e;
        lastPosRef.current = { x: clientX, y: clientY };
        
        // Throttle position updates more aggressively to prevent flickering
        const now = Date.now();
        if (now - tooltipStableRef.current.lastUpdate > 50) { // 50ms throttle
          if (frameRef.current == null) {
            frameRef.current = requestAnimationFrame(() => {
              setMousePosition(lastPosRef.current);
              tooltipStableRef.current.lastUpdate = Date.now();
              frameRef.current = null;
            });
          }
        }
      });

      pathElement.addEventListener('pointerleave', () => {
        // Add small delay before hiding to prevent flicker from micro-movements
        tooltipStableRef.current.timeout = setTimeout(() => {
          setHoveredState(null);
          pathElement.removeAttribute('aria-describedby');
        }, 50);

        if (spotlightGroup && !spotlightGroup.classList.contains('locked')) {
          spotlightGroup.classList.remove('active');
        }
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

        if (isContested) {
          const contestedRing = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          contestedRing.setAttribute('cx', centroid[0].toString());
          contestedRing.setAttribute('cy', centroid[1].toString());
          contestedRing.setAttribute('r', '28');
          contestedRing.setAttribute('class', 'contested-radar');
          contestedRing.setAttribute('pointer-events', 'none');
          pressureGroup.appendChild(contestedRing);

          const contestedChanged = contestedStatesRef.current[stateKey] !== isContested;
          if (contestedChanged) {
            const timeoutId = window.setTimeout(() => {
              contestedRing.remove();
              window.requestAnimationFrame(() => {
                pressureGroup.appendChild(contestedRing);
              });
            }, 50);
            contestedAnimationTimeoutsRef.current.push(timeoutId);

            if (typeof window !== 'undefined') {
              const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
              if (!prefersReducedMotion) {
                VisualEffectsCoordinator.triggerParticleEffect('contested', {
                  x: svgRect.left + centroid[0],
                  y: svgRect.top + centroid[1]
                });
              }
            }
          }
        }

        if (isGovernmentZoneTargeting && canTarget) {
          spotlightGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
          spotlightGroup.setAttribute('class', 'orbital-spotlight');
          spotlightGroup.setAttribute('transform', `translate(${centroid[0]}, ${centroid[1]})`);
          spotlightGroup.setAttribute('pointer-events', 'none');

          if (prefersReducedMotion) {
            spotlightGroup.classList.add('reduced-motion');
          }

          const outerRing = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          outerRing.setAttribute('class', 'orbital-ring');
          outerRing.setAttribute('r', '36');
          spotlightGroup.appendChild(outerRing);

          const innerRing = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          innerRing.setAttribute('class', 'orbital-inner-ring');
          innerRing.setAttribute('r', '18');
          spotlightGroup.appendChild(innerRing);

          const verticalLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          verticalLine.setAttribute('class', 'orbital-cross');
          verticalLine.setAttribute('x1', '0');
          verticalLine.setAttribute('y1', '-44');
          verticalLine.setAttribute('x2', '0');
          verticalLine.setAttribute('y2', '44');
          spotlightGroup.appendChild(verticalLine);

          const horizontalLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          horizontalLine.setAttribute('class', 'orbital-cross');
          horizontalLine.setAttribute('x1', '-44');
          horizontalLine.setAttribute('y1', '0');
          horizontalLine.setAttribute('x2', '44');
          horizontalLine.setAttribute('y2', '0');
          spotlightGroup.appendChild(horizontalLine);

          const caption = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          caption.setAttribute('class', 'orbital-caption');
          caption.setAttribute('y', '58');
          caption.setAttribute('text-anchor', 'middle');
          caption.textContent = 'COORD. VERIFIED – NOTHING TO SEE';
          spotlightGroup.appendChild(caption);

          if (lockedStateId && lockedStateId === (gameState?.abbreviation || stateId)) {
            spotlightGroup.classList.add('locked', 'active');
          }

          pressureGroup.appendChild(spotlightGroup);
        }
      }
    });

    contestedStatesRef.current = nextContestedStates;

    return () => {
      svg.removeEventListener('pointerleave', handlePointerLeave);
      contestedAnimationTimeoutsRef.current.forEach(timeoutId => window.clearTimeout(timeoutId));
      contestedAnimationTimeoutsRef.current = [];
    };

  }, [
    geoData,
    states,
    onStateClick,
    selectedZoneCard,
    selectedState,
    governmentTarget?.active,
    governmentTarget?.stateId
  ]);

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
    <div className="relative" ref={containerRef}>
      <Card className="p-4 bg-card border-border relative">
        
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

      </Card>


      {/* Enhanced Tooltip (Portal) */}
      {hoveredState && stateInfo && createPortal(
        <div 
          ref={tooltipRef}
          id="map-state-tooltip"
          role="tooltip"
          aria-live="polite"
          className="fixed pointer-events-none select-none bg-popover border border-border rounded-lg p-4 shadow-2xl z-[99999] max-w-sm"
          style={getTooltipPosition()}
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
                
                {/* Occupation Info */}
                {stateInfo.occupierLabel && stateInfo.owner && stateInfo.owner !== null && (
                  <div className="mt-2 text-sm font-mono bg-card/60 border border-border/40 p-2 rounded shadow-sm opacity-95">
                    <span className="font-bold text-foreground">{stateInfo.occupierLabel}</span>
                  </div>
                )}
              </div>
            )}
            
            {/* Show occupation info even when no special bonus */}
            {!stateInfo.specialBonus && stateInfo.occupierLabel && stateInfo.owner && stateInfo.owner !== null && (
              <div className="pt-2 border-t border-border">
                <div className="text-sm font-bold text-foreground mb-1">Control</div>
                <div className="text-sm font-mono bg-card/60 border border-border/40 p-2 rounded shadow-sm opacity-95">
                  <span className="font-bold text-foreground">{stateInfo.occupierLabel}</span>
                </div>
              </div>
            )}
          </div>
        </div>,
        document.body
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

        .contested-radar {
          fill: rgba(57, 255, 20, 0.08);
          stroke: #39ff14;
          stroke-width: 2.5;
          stroke-dasharray: 8 10;
          animation: radarSweep 2.4s linear infinite, contestedPulse 2.4s ease-in-out infinite;
          transform-origin: center;
          opacity: 0.85;
          filter: drop-shadow(0 0 10px rgba(57, 255, 20, 0.35));
          pointer-events: none;
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

        @keyframes radarSweep {
          0% {
            stroke-dashoffset: 0;
            transform: scale(0.85);
            opacity: 0.9;
          }
          60% {
            opacity: 0.45;
          }
          100% {
            stroke-dashoffset: -140;
            transform: scale(1.32);
            opacity: 0;
          }
        }

        @keyframes contestedPulse {
          0%, 100% {
            filter: drop-shadow(0 0 12px rgba(57, 255, 20, 0.45));
          }
          50% {
            filter: drop-shadow(0 0 24px rgba(57, 255, 20, 0.85));
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .contested-radar {
            animation: none !important;
            transform: none !important;
            opacity: 0.8;
            filter: drop-shadow(0 0 14px rgba(57, 255, 20, 0.6));
            stroke-dasharray: 0;
          }
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