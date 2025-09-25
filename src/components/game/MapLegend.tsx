import { Card } from '@/components/ui/card';

const LEGEND_ITEMS = [
  {
    label: 'Truth controlled',
    description: 'States under your faction control',
    swatch: 'bg-blue-500',
  },
  {
    label: 'Government controlled',
    description: 'States aligned with the opposition',
    swatch: 'bg-red-500',
  },
  {
    label: 'Neutral',
    description: 'Open for either faction to pressure',
    swatch: 'bg-gray-400',
  },
  {
    label: 'Contested',
    description: 'Pressure is near the defense threshold',
    swatch: 'bg-orange-500 animate-pulse',
  },
  {
    label: 'Active pressure',
    description: 'Glow indicates pressure toward capture',
    swatch: 'bg-lime-400/60 border border-lime-500/50 shadow-[0_0_12px_rgba(132,204,22,0.45)]',
  },
];

export function MapLegend() {
  return (
    <Card className="space-y-3 border border-border bg-muted/40 p-3 text-sm shadow-inner">
      <header className="text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
        Map Legend
      </header>
      <dl className="space-y-2">
        {LEGEND_ITEMS.map(item => (
          <div key={item.label} className="flex items-center gap-3">
            <span className={`h-6 w-6 flex-shrink-0 rounded-full ${item.swatch}`} aria-hidden="true" />
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.22em] text-foreground">{item.label}</dt>
              <dd className="text-[11px] text-muted-foreground">{item.description}</dd>
            </div>
          </div>
        ))}
      </dl>
    </Card>
  );
}

export default MapLegend;
