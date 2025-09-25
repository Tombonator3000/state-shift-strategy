import { Repeat2, Zap, Target, Trophy } from 'lucide-react';
import clsx from 'clsx';

interface TurnSummaryStripProps {
  currentIP: number;
  playsRemaining: number;
  maxPlays?: number;
  truth: number;
  controlledStates: number;
}

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export function TurnSummaryStrip({
  currentIP,
  playsRemaining,
  maxPlays = 3,
  truth,
  controlledStates,
}: TurnSummaryStripProps) {
  const boundedPlays = clamp(playsRemaining, 0, maxPlays);
  const playsUsed = maxPlays - boundedPlays;
  const playsPercent = (playsUsed / maxPlays) * 100;

  const summaryItems = [
    {
      label: 'Plays left',
      value: `${boundedPlays}/${maxPlays}`,
      icon: Repeat2,
      accent: 'bg-amber-200/30 text-amber-700 border-amber-400/60',
    },
    {
      label: 'Influence Points',
      value: currentIP.toLocaleString(),
      icon: Zap,
      accent: currentIP > 0
        ? 'bg-emerald-200/30 text-emerald-700 border-emerald-400/60'
        : 'bg-slate-200/40 text-slate-700 border-slate-300/70',
    },
    {
      label: 'Truth Meter',
      value: `${Math.round(truth)}%`,
      icon: Target,
      accent: truth >= 95
        ? 'bg-blue-200/40 text-blue-700 border-blue-400/60'
        : truth <= 5
          ? 'bg-red-200/40 text-red-700 border-red-400/60'
          : 'bg-slate-200/40 text-slate-700 border-slate-300/70',
    },
    {
      label: 'States held',
      value: controlledStates.toString(),
      icon: Trophy,
      accent: controlledStates >= 10
        ? 'bg-purple-200/40 text-purple-700 border-purple-400/60'
        : 'bg-slate-200/40 text-slate-700 border-slate-300/70',
    },
  ];

  return (
    <section className="space-y-3 rounded-lg border border-border bg-muted/40 p-3 shadow-inner">
      <header className="flex items-center justify-between gap-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
        <span>Turn Summary</span>
        <span className="font-mono text-xs tracking-widest">Rulebook sync</span>
      </header>
      <div className="flex items-center gap-3">
        <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-border">
          <div
            className={clsx(
              'absolute inset-y-0 left-0 rounded-full transition-[width] duration-300',
              playsUsed >= maxPlays ? 'bg-red-500' : 'bg-amber-500'
            )}
            style={{ width: `${playsPercent}%` }}
          />
        </div>
        <span
          className={clsx(
            'rounded-full border px-2 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-[0.2em]',
            boundedPlays > 0 ? 'border-emerald-400/70 text-emerald-700' : 'border-red-400/70 text-red-600'
          )}
        >
          {boundedPlays > 0 ? 'Plays available' : 'Play cap reached'}
        </span>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {summaryItems.map(({ label, value, icon: Icon, accent }) => (
          <div
            key={label}
            className={clsx(
              'flex items-center gap-3 rounded-md border bg-background/60 px-3 py-2 text-sm shadow-sm transition-colors',
              accent,
            )}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-current bg-background/80 text-base">
              <Icon className="h-4 w-4" />
            </span>
            <div className="flex flex-col leading-tight">
              <span className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">{label}</span>
              <span className="font-mono text-base font-bold text-foreground">{value}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default TurnSummaryStrip;
