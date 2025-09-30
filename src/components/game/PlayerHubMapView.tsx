import { useEffect, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';
import { Card } from '@/components/ui/card';
import * as topojson from 'topojson-client';
import { geoAlbersUsa, geoPath } from 'd3-geo';
import type { PlayerStateIntel } from './PlayerHubOverlay';
import type { StateEventBonusSummary } from '@/hooks/gameStateTypes';

interface PlayerHubMapViewProps {
  intel?: PlayerStateIntel;
  faction: 'truth' | 'government';
  className?: string;
}

type IntelState = PlayerStateIntel['states'][number];
type IntelEvent = PlayerStateIntel['recentEvents'][number];

interface TooltipIntel {
  state: IntelState;
  recentEvent?: IntelEvent;
  latestHistory?: StateEventBonusSummary;
}

const MAP_BASE_WIDTH = 975;
const MAP_BASE_HEIGHT = 610;
const MAP_ASPECT_RATIO = MAP_BASE_HEIGHT / MAP_BASE_WIDTH;

const ownerLabels: Record<IntelState['owner'], string> = {
  player: 'Operative Control',
  ai: 'Opposition Control',
  neutral: 'Unaligned',
};

const normalizeKey = (value?: string | null) => value?.toString().toUpperCase() ?? '';

const PlayerHubMapView = ({ intel, faction, className }: PlayerHubMapViewProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [geoData, setGeoData] = useState<any>(null);
  const [dimensions, setDimensions] = useState({ width: MAP_BASE_WIDTH, height: MAP_BASE_HEIGHT });
  const [tooltipIntel, setTooltipIntel] = useState<TooltipIntel | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const states = useMemo(() => intel?.states ?? [], [intel]);
  const recentEvents = useMemo(() => intel?.recentEvents ?? [], [intel]);

  const recentEventLookup = useMemo(() => {
    const map = new Map<string, IntelEvent>();
    recentEvents.forEach(event => {
      const candidates = [event.abbreviation, event.stateId, event.stateName];
      candidates.forEach(candidate => {
        if (!candidate) return;
        map.set(candidate, event);
        map.set(candidate.toUpperCase(), event);
      });
    });
    return map;
  }, [recentEvents]);

  const stateLookup = useMemo(() => {
    const map = new Map<string, IntelState>();
    states.forEach(state => {
      const candidates = [state.abbreviation, state.id, state.name];
      candidates.forEach(candidate => {
        if (!candidate) return;
        map.set(candidate, state);
        map.set(candidate.toUpperCase(), state);
      });
    });
    return map;
  }, [states]);

  useEffect(() => {
    let isMounted = true;
    const loadUSData = async () => {
      try {
        const response = await fetch('https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json');
        const topology = await response.json();
        if (!isMounted) return;
        const geojson = topojson.feature(topology, topology.objects.states);
        setGeoData(geojson);
      } catch (error) {
        console.error('Failed to load US map data for PlayerHubMapView:', error);
        if (!isMounted) return;
        setGeoData({
          type: 'FeatureCollection',
          features: states.map(state => ({
            type: 'Feature',
            id: state.abbreviation ?? state.id,
            properties: {
              name: state.name,
              STUSPS: state.abbreviation ?? state.id,
            },
            geometry: {
              type: 'Polygon',
              coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]],
            },
          })),
        });
      }
    };

    loadUSData();
    return () => {
      isMounted = false;
    };
  }, [states]);

  useEffect(() => {
    if (typeof ResizeObserver === 'undefined') {
      return;
    }

    const observer = new ResizeObserver(entries => {
      if (entries.length === 0) return;
      const entry = entries[0];
      const width = entry.contentRect.width;
      const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : MAP_BASE_HEIGHT;
      const idealHeight = width * MAP_ASPECT_RATIO;
      const maxHeight = viewportHeight * 0.6;
      const height = Math.min(Math.max(idealHeight, 280), maxHeight > 0 ? maxHeight : idealHeight);
      setDimensions(prev => {
        if (prev.width === width && prev.height === height) {
          return prev;
        }
        return { width, height };
      });
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setTooltipIntel(null);
  }, [states]);

  useEffect(() => {
    if (!geoData || !svgRef.current) return;

    const svg = svgRef.current;
    const width = dimensions.width;
    const height = dimensions.height;

    svg.setAttribute('width', `${width}`);
    svg.setAttribute('height', `${height}`);
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.innerHTML = '';

    const projection = geoAlbersUsa().fitSize([width, height], geoData);
    const path = geoPath(projection);

    const statesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const overlayGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const labelsGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    overlayGroup.setAttribute('class', 'player-hub-map-overlays');
    labelsGroup.setAttribute('class', 'player-hub-map-labels');

    svg.appendChild(statesGroup);
    svg.appendChild(overlayGroup);
    svg.appendChild(labelsGroup);

    geoData.features.forEach((feature: any) => {
      const topoStateId: string = feature.properties?.STUSPS || feature.id || feature.properties?.name;
      const candidates = [
        topoStateId,
        feature.properties?.name,
        feature.id,
      ].filter(Boolean) as string[];

      let gameState: IntelState | undefined;
      for (const candidate of candidates) {
        gameState = stateLookup.get(candidate) ?? stateLookup.get(candidate.toUpperCase());
        if (gameState) break;
      }

      const stateKey = gameState?.abbreviation ?? topoStateId;
      const recentEvent = recentEventLookup.get(stateKey) ?? recentEventLookup.get(normalizeKey(stateKey));
      const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      pathElement.setAttribute('d', path(feature) || '');

      const ownerClass = gameState ? `owner-${gameState.owner}` : 'owner-neutral';
      const contestedClass = gameState?.contested ? ' contested' : '';
      pathElement.setAttribute('class', `state-path ${ownerClass}${contestedClass}`);
      pathElement.setAttribute('data-state-id', stateKey);
      if (gameState?.name) {
        pathElement.setAttribute('aria-label', `${gameState.name} (${ownerLabels[gameState.owner]})`);
      }

      const updateTooltipPosition = (event: PointerEvent) => {
        const containerRect = containerRef.current?.getBoundingClientRect();
        if (!containerRect) return;
        setTooltipPosition({
          x: event.clientX - containerRect.left,
          y: event.clientY - containerRect.top,
        });
      };

      pathElement.addEventListener('pointerenter', event => {
        if (!gameState) return;
        updateTooltipPosition(event);
        const latestHistory = gameState.stateEventHistory?.length
          ? gameState.stateEventHistory[gameState.stateEventHistory.length - 1]
          : undefined;
        setTooltipIntel({
          state: gameState,
          recentEvent,
          latestHistory,
        });
      });

      pathElement.addEventListener('pointermove', event => {
        updateTooltipPosition(event);
      });

      pathElement.addEventListener('pointerleave', () => {
        setTooltipIntel(null);
      });

      statesGroup.appendChild(pathElement);

      const centroid = path.centroid(feature);
      if (centroid && !Number.isNaN(centroid[0]) && !Number.isNaN(centroid[1])) {
        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('x', centroid[0].toString());
        label.setAttribute('y', centroid[1].toString());
        label.setAttribute('class', 'state-label');
        label.setAttribute('text-anchor', 'middle');
        label.textContent = gameState?.abbreviation ?? topoStateId;
        labelsGroup.appendChild(label);

        if (gameState) {
          const pressure = Math.max(0, Math.floor(gameState.pressure));
          const pressureIndicators = Math.min(pressure, 3);
          for (let i = 0; i < pressureIndicators; i += 1) {
            const indicator = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            indicator.setAttribute('cx', (centroid[0] - 16 + i * 10).toString());
            indicator.setAttribute('cy', (centroid[1] + 20).toString());
            indicator.setAttribute('r', '4');
            indicator.setAttribute('class', 'pressure-indicator');
            overlayGroup.appendChild(indicator);
          }

          if (pressure > 3) {
            const overflow = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            overflow.setAttribute('x', (centroid[0] + 22).toString());
            overflow.setAttribute('y', (centroid[1] + 24).toString());
            overflow.setAttribute('class', 'pressure-overflow');
            overflow.textContent = `+${pressure - 3}`;
            overlayGroup.appendChild(overflow);
          }

          if (gameState.contested) {
            const contestedRing = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            contestedRing.setAttribute('cx', centroid[0].toString());
            contestedRing.setAttribute('cy', centroid[1].toString());
            contestedRing.setAttribute('r', '30');
            contestedRing.setAttribute('class', 'contested-ring');
            contestedRing.setAttribute('pointer-events', 'none');
            overlayGroup.appendChild(contestedRing);
          }

          const hasHistory = Array.isArray(gameState.stateEventHistory) && gameState.stateEventHistory.length > 0;
          if (recentEvent || hasHistory) {
            const marker = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            marker.setAttribute('cx', centroid[0].toString());
            marker.setAttribute('cy', (centroid[1] - 26).toString());
            marker.setAttribute('r', recentEvent ? '6' : '4');
            const markerClass = recentEvent ? 'event-marker recent' : 'event-marker history';
            marker.setAttribute('class', markerClass);
            marker.setAttribute('pointer-events', 'none');
            overlayGroup.appendChild(marker);
          }
        }
      }
    });
  }, [geoData, dimensions, stateLookup, recentEventLookup]);

  const isTruth = faction === 'truth';
  const hasIntel = states.length > 0;

  return (
    <Card
      ref={containerRef}
      className={clsx(
        'player-hub-map-card relative flex h-full flex-col overflow-hidden border backdrop-blur',
        isTruth
          ? 'border-rose-900/40 bg-[rgba(255,247,237,0.92)]'
          : 'border-emerald-500/20 bg-[rgba(8,47,30,0.88)]',
        className,
      )}
    >
      <div
        className={clsx(
          'pointer-events-none absolute inset-0 opacity-70',
          isTruth
            ? 'bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.35),_transparent_55%)]'
            : 'bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.24),_transparent_60%)]',
        )}
        aria-hidden
      />

      <div className="relative z-10 flex flex-col gap-3 p-5 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <p
              className={clsx(
                'font-mono text-xs uppercase tracking-[0.36em]',
                isTruth ? 'text-rose-700' : 'text-emerald-300',
              )}
            >
              Field Intel Mesh
            </p>
            <h3
              className={clsx(
                'text-2xl font-semibold uppercase tracking-[0.18em]',
                isTruth ? 'text-rose-900' : 'text-emerald-100',
              )}
            >
              Continental Control Grid
            </h3>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono uppercase tracking-[0.32em]">
            <span className="flex items-center gap-2 text-emerald-200">
              <span className="block h-2.5 w-2.5 rounded-full bg-emerald-400" aria-hidden />
              Player
            </span>
            <span className="flex items-center gap-2 text-rose-200">
              <span className="block h-2.5 w-2.5 rounded-full bg-rose-400" aria-hidden />
              Opposition
            </span>
            <span className="flex items-center gap-2 text-slate-300">
              <span className="block h-2.5 w-2.5 rounded-full bg-slate-400" aria-hidden />
              Neutral
            </span>
          </div>
        </div>
        <p className={clsx('max-w-2xl text-sm leading-relaxed', isTruth ? 'text-stone-700' : 'text-emerald-100/70')}>
          Hover over any territory to inspect control pressure, defense thresholds, and the latest incident reports routed
          from the intelligence network.
        </p>
      </div>

      <div className="relative z-10 flex-1 px-5 pb-5">
        {hasIntel ? (
          <div className="player-hub-map-canvas">
            <svg ref={svgRef} className="h-full w-full" role="img" aria-label="United States field intel map" />
            {tooltipIntel && (
              <div
                className="player-hub-map-tooltip"
                style={{ left: `${tooltipPosition.x}px`, top: `${tooltipPosition.y}px` }}
              >
                <header className="mb-2 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.38em] text-slate-400">
                      {tooltipIntel.state.abbreviation} · Defense {tooltipIntel.state.defense}
                    </p>
                    <h4 className="text-lg font-semibold text-slate-100">{tooltipIntel.state.name}</h4>
                  </div>
                  <span
                    className={clsx(
                      'rounded-full px-3 py-1 text-[10px] font-mono uppercase tracking-[0.38em]',
                      tooltipIntel.state.owner === 'player'
                        ? 'bg-emerald-500/20 text-emerald-200'
                        : tooltipIntel.state.owner === 'ai'
                          ? 'bg-rose-500/20 text-rose-100'
                          : 'bg-slate-500/20 text-slate-200',
                    )}
                  >
                    {ownerLabels[tooltipIntel.state.owner]}
                  </span>
                </header>
                <dl className="grid grid-cols-2 gap-2 text-xs text-slate-200">
                  <div>
                    <dt className="font-mono uppercase tracking-[0.28em] text-slate-400">Pressure</dt>
                    <dd className="text-sm text-rose-200">
                      AI {tooltipIntel.state.pressureAi}
                      <span className="text-slate-500"> · </span>
                      Player {tooltipIntel.state.pressurePlayer}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-mono uppercase tracking-[0.28em] text-slate-400">Status</dt>
                    <dd className="text-sm text-slate-200">
                      {tooltipIntel.state.contested ? 'Hot Zone' : 'Stable'}
                    </dd>
                  </div>
                </dl>
                {tooltipIntel.recentEvent && (
                  <div className="mt-3 rounded-md border border-slate-700/60 bg-slate-900/70 p-3">
                    <p className="font-mono text-[10px] uppercase tracking-[0.38em] text-slate-500">
                      Latest Incident · Turn {tooltipIntel.recentEvent.event.triggeredOnTurn}
                    </p>
                    <p className="text-sm font-semibold text-slate-100">
                      {tooltipIntel.recentEvent.event.label}
                    </p>
                    {tooltipIntel.recentEvent.event.description && (
                      <p className="mt-1 text-xs text-slate-300">
                        {tooltipIntel.recentEvent.event.description}
                      </p>
                    )}
                  </div>
                )}
                {!tooltipIntel.recentEvent && tooltipIntel.latestHistory && (
                  <div className="mt-3 rounded-md border border-slate-700/60 bg-slate-900/70 p-3">
                    <p className="font-mono text-[10px] uppercase tracking-[0.38em] text-slate-500">
                      Historical Event · Turn {tooltipIntel.latestHistory.triggeredOnTurn}
                    </p>
                    <p className="text-sm font-semibold text-slate-100">
                      {tooltipIntel.latestHistory.label}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-200/70">
            No state intel has been synchronized yet.
          </div>
        )}
      </div>

      <style>{`
        .player-hub-map-card {
          border-radius: 1.5rem;
        }

        .player-hub-map-canvas {
          position: relative;
          width: 100%;
          height: 100%;
          min-height: 320px;
          border-radius: 1.25rem;
          overflow: hidden;
          border: 1px solid rgba(148, 163, 184, 0.25);
          backdrop-filter: blur(4px);
          background: rgba(10, 23, 38, 0.35);
        }

        .player-hub-map-tooltip {
          position: absolute;
          transform: translate(-50%, -110%);
          min-width: 260px;
          max-width: 320px;
          padding: 1rem;
          border-radius: 1rem;
          background: rgba(15, 23, 42, 0.92);
          border: 1px solid rgba(148, 163, 184, 0.35);
          pointer-events: none;
          box-shadow: 0 20px 45px rgba(15, 23, 42, 0.45);
          backdrop-filter: blur(12px);
        }

        .player-hub-map-tooltip::after {
          content: '';
          position: absolute;
          bottom: -10px;
          left: 50%;
          transform: translateX(-50%);
          width: 16px;
          height: 16px;
          background: rgba(15, 23, 42, 0.92);
          border-left: 1px solid rgba(148, 163, 184, 0.35);
          border-bottom: 1px solid rgba(148, 163, 184, 0.35);
          clip-path: polygon(0 0, 100% 0, 100% 100%);
        }

        .state-path {
          stroke: rgba(15, 23, 42, 0.85);
          stroke-width: 1.4;
          transition: transform 200ms ease, filter 200ms ease, stroke 200ms ease;
        }

        .state-path.owner-player {
          fill: rgba(34, 197, 94, 0.55);
        }

        .state-path.owner-ai {
          fill: rgba(248, 113, 113, 0.5);
        }

        .state-path.owner-neutral {
          fill: rgba(148, 163, 184, 0.38);
        }

        .state-path.contested {
          stroke-width: 2.2;
          stroke-dasharray: 6 4;
          stroke: rgba(251, 191, 36, 0.85);
        }

        .state-path:hover {
          filter: brightness(1.15) drop-shadow(0 0 14px rgba(148, 163, 184, 0.35));
        }

        .player-hub-map-overlays text {
          font-family: 'JetBrains Mono', monospace;
        }

        .pressure-indicator {
          fill: rgba(248, 113, 113, 0.75);
          stroke: rgba(248, 250, 252, 0.85);
          stroke-width: 1;
          animation: playerHubPulse 1.8s ease-in-out infinite;
        }

        .pressure-overflow {
          fill: rgba(248, 113, 113, 0.85);
          font-size: 10px;
          font-weight: 600;
        }

        .contested-ring {
          fill: none;
          stroke: rgba(251, 191, 36, 0.7);
          stroke-width: 2.4;
          stroke-dasharray: 10 8;
          animation: playerHubSweep 2.6s ease-in-out infinite;
        }

        .event-marker {
          fill: rgba(129, 140, 248, 0.85);
          stroke: rgba(226, 232, 240, 0.9);
          stroke-width: 1.2;
          animation: playerHubEventPulse 2.2s ease-in-out infinite;
        }

        .event-marker.recent {
          fill: rgba(96, 165, 250, 0.9);
          stroke: rgba(191, 219, 254, 0.95);
          animation-duration: 1.8s;
        }

        .state-label {
          font-size: 12px;
          font-weight: 600;
          fill: rgba(15, 23, 42, 0.85);
          stroke: rgba(255, 255, 255, 0.85);
          stroke-width: 2;
          paint-order: stroke fill;
          pointer-events: none;
        }

        @keyframes playerHubPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.55; }
        }

        @keyframes playerHubSweep {
          0%, 100% { opacity: 0.9; transform: scale(0.95); }
          50% { opacity: 0.4; transform: scale(1.08); }
        }

        @keyframes playerHubEventPulse {
          0%, 100% { transform: translateY(0); opacity: 1; }
          50% { transform: translateY(-2px); opacity: 0.6; }
        }

        @media (prefers-reduced-motion: reduce) {
          .pressure-indicator,
          .contested-ring,
          .event-marker {
            animation: none !important;
          }
        }
      `}</style>
    </Card>
  );
};

export default PlayerHubMapView;
