import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { type ActiveParanormalHotspot } from '@/hooks/gameStateTypes';
import { VisualEffectsCoordinator } from '@/utils/visualEffects';

interface HotspotInspectorProps {
  hotspots?: Record<string, ActiveParanormalHotspot>;
  onTriggerEvent?: (eventId: string) => void;
}

const resolvePosition = (stateAbbreviation: string | undefined) => {
  if (!stateAbbreviation) {
    return VisualEffectsCoordinator.getScreenCenter();
  }

  const element = document.querySelector<HTMLElement>(`[data-state-id="${stateAbbreviation.toUpperCase()}"]`);
  return element
    ? VisualEffectsCoordinator.getElementCenter(element)
    : VisualEffectsCoordinator.getScreenCenter();
};

const HotspotInspector = ({ hotspots, onTriggerEvent }: HotspotInspectorProps) => {
  const entries = useMemo(() => {
    if (!hotspots) {
      return [] as ActiveParanormalHotspot[];
    }

    return Object.values(hotspots).sort((a, b) => b.createdOnTurn - a.createdOnTurn);
  }, [hotspots]);

  const triggerVisuals = (hotspot: ActiveParanormalHotspot) => {
    const position = resolvePosition(hotspot.stateAbbreviation);
    VisualEffectsCoordinator.triggerParanormalHotspot({
      position,
      stateId: hotspot.stateId,
      stateName: hotspot.stateName,
      label: hotspot.label,
      icon: hotspot.icon,
      source: hotspot.source,
      defenseBoost: hotspot.defenseBoost,
      truthReward: hotspot.truthReward,
    });
  };

  return (
    <Card>
      <CardHeader className="space-y-2 border-b border-gray-800 bg-gray-900/60">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-white">
            Paranormal Hotspots
          </CardTitle>
          <Badge variant="outline" className="uppercase tracking-wide text-[11px] border-amber-500/40 text-amber-200">
            Live map
          </Badge>
        </div>
        <p className="text-xs text-slate-400">
          Inspect and manually trigger active anomaly effects to validate overlays, audio, and event wiring.
        </p>
      </CardHeader>
      <CardContent className="p-0">
        {entries.length === 0 ? (
          <div className="p-6 text-center text-sm text-slate-400">
            No active hotspots detected. Fire an event that spawns anomalies to populate this panel.
          </div>
        ) : (
          <ScrollArea className="max-h-72">
            <div className="divide-y divide-gray-800">
              {entries.map(hotspot => (
                <div key={hotspot.id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[12px] border-emerald-500/40 text-emerald-200">
                        {hotspot.stateAbbreviation}
                      </Badge>
                      <h4 className="text-sm font-semibold text-slate-200">
                        {hotspot.icon ?? '👻'} {hotspot.label}
                      </h4>
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono">
                      Turn {hotspot.createdOnTurn}
                    </span>
                  </div>
                  <div className="grid gap-2 text-xs text-slate-300 sm:grid-cols-2">
                    <div className="rounded border border-gray-800 bg-gray-950/60 px-3 py-2">
                      <span className="block font-semibold text-[11px] uppercase tracking-wide text-slate-400">Defense bonus</span>
                      <span className="text-sm text-slate-200">+{hotspot.defenseBoost}</span>
                    </div>
                    <div className="rounded border border-gray-800 bg-gray-950/60 px-3 py-2">
                      <span className="block font-semibold text-[11px] uppercase tracking-wide text-slate-400">Truth reward</span>
                      <span className="text-sm text-slate-200">+{hotspot.truthReward}%</span>
                    </div>
                    <div className="rounded border border-gray-800 bg-gray-950/60 px-3 py-2">
                      <span className="block font-semibold text-[11px] uppercase tracking-wide text-slate-400">Source</span>
                      <span className="text-sm text-slate-200">{hotspot.source}</span>
                    </div>
                    <div className="rounded border border-gray-800 bg-gray-950/60 px-3 py-2">
                      <span className="block font-semibold text-[11px] uppercase tracking-wide text-slate-400">Expires</span>
                      <span className="text-sm text-slate-200">Turn {hotspot.expiresOnTurn}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="secondary" onClick={() => triggerVisuals(hotspot)}>
                      Trigger visuals
                    </Button>
                    {onTriggerEvent && hotspot.eventId && (
                      <Button size="sm" variant="outline" onClick={() => onTriggerEvent(hotspot.eventId)}>
                        Trigger source event
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default HotspotInspector;
