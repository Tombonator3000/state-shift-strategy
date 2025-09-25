import { Card } from '@/components/ui/card';

interface StateSummary {
  id: string;
  name: string;
  abbreviation: string;
  baseIP: number;
  defense: number;
  pressure: number;
  contested: boolean;
  owner: 'player' | 'ai' | 'neutral';
  specialBonus?: string;
  bonusValue?: number;
}

interface StateDetailPanelProps {
  states: StateSummary[];
  focusedStateId: string | null;
  selectedStateId?: string | null;
  zoneCardActive?: boolean;
}

const ownerCopy: Record<StateSummary['owner'], string> = {
  player: 'Truth faction',
  ai: 'Government faction',
  neutral: 'Neutral',
};

export function StateDetailPanel({ states, focusedStateId, selectedStateId, zoneCardActive }: StateDetailPanelProps) {
  const lookup = (id: string) =>
    states.find(state => state.id === id || state.abbreviation === id || state.name === id);

  const selectedState = selectedStateId ? lookup(selectedStateId) : null;
  const fallbackFocus = focusedStateId ? lookup(focusedStateId) : null;
  const detail = selectedState ?? fallbackFocus;

  return (
    <Card className="flex flex-col gap-3 border border-border bg-muted/40 p-3 text-sm shadow-inner">
      <header className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
        <span>State Intel</span>
        {zoneCardActive && <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-amber-600">Targeting</span>}
      </header>
      {detail ? (
        <div className="space-y-3">
          <div>
            <h3 className="text-base font-bold leading-tight text-foreground">{detail.name}</h3>
            <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">{detail.abbreviation}</p>
          </div>
          <dl className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <dt className="text-muted-foreground">Base IP</dt>
              <dd className="font-mono text-sm text-foreground">{detail.baseIP}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Defense</dt>
              <dd className="font-mono text-sm text-foreground">{detail.defense}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Pressure</dt>
              <dd className="font-mono text-sm text-foreground">{detail.pressure}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Owner</dt>
              <dd className="font-mono text-sm text-foreground">{ownerCopy[detail.owner]}</dd>
            </div>
          </dl>
          {detail.specialBonus && (
            <div className="rounded border border-dashed border-amber-400/60 bg-amber-50/40 p-2 text-xs text-amber-700">
              <p className="font-semibold uppercase tracking-[0.18em]">Special bonus</p>
              <p>{detail.specialBonus}{typeof detail.bonusValue === 'number' ? ` (+${detail.bonusValue})` : ''}</p>
            </div>
          )}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          Hover over a state or select a Zone target to preview defense and pressure information.
        </p>
      )}
    </Card>
  );
}

export default StateDetailPanel;
