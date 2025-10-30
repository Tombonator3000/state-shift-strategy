import { useMemo, useState } from 'react';
import {
  Activity,
  ArrowUpRight,
  Banknote,
  Brain,
  Network,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { TRUTH_HIGH_THRESHOLD, TRUTH_LOW_THRESHOLD } from '@/constants/truthThresholds';

const clampPercent = (value: number) => Math.min(100, Math.max(0, Math.round(value)));

type MoraleTone = 'high' | 'steady' | 'strained';

const moraleToneStyles: Record<MoraleTone, { label: string; badge: string; bar: string }> = {
  high: {
    label: 'HIGH',
    badge: 'text-emerald-200',
    bar: 'bg-gradient-to-r from-emerald-400 via-emerald-300 to-emerald-500',
  },
  steady: {
    label: 'STEADY',
    badge: 'text-sky-200',
    bar: 'bg-gradient-to-r from-sky-400 via-cyan-300 to-sky-500',
  },
  strained: {
    label: 'LOW',
    badge: 'text-amber-200',
    bar: 'bg-gradient-to-r from-amber-400 via-orange-300 to-amber-500',
  },
};

const resolveMoraleTone = (score: number): MoraleTone => {
  if (score >= 70) {
    return 'high';
  }
  if (score >= 45) {
    return 'steady';
  }
  return 'strained';
};

const formatStatusDelta = (playerMetric: number, opponentMetric: number) => {
  const delta = Math.round(playerMetric - opponentMetric);
  if (delta >= 6) {
    return 'Dominant';
  }
  if (delta >= 1) {
    return 'Leading';
  }
  if (delta === 0) {
    return 'Tied';
  }
  if (delta <= -6) {
    return 'Critical';
  }
  return 'Lagging';
};

const formatTruthStatus = (truthProgress: number, truthMomentum?: number | null) => {
  if (truthProgress >= 100) {
    return 'Ready';
  }
  if ((truthMomentum ?? 0) > 0) {
    return 'Rising';
  }
  if ((truthMomentum ?? 0) < 0) {
    return 'Slipping';
  }
  return 'Stable';
};

export interface EmpireInfoButtonProps {
  faction: 'truth' | 'government';
  playerStates: number;
  aiStates: number;
  neutralStates: number;
  contestedStates: number;
  totalStates: number;
  truth: number;
  truthMomentum?: number | null;
  ip: number;
  aiIp: number;
  cardsPlayedThisRound: number;
  intelCount: number;
  round: number;
  onRequestHub?: () => void;
  className?: string;
}

export const EmpireInfoButton = ({
  faction,
  playerStates,
  aiStates,
  neutralStates,
  contestedStates,
  totalStates,
  truth,
  truthMomentum,
  ip,
  aiIp,
  cardsPlayedThisRound,
  intelCount,
  round,
  onRequestHub,
  className,
}: EmpireInfoButtonProps) => {
  const [open, setOpen] = useState(false);

  const militaryProgress = useMemo(() => clampPercent((playerStates / 10) * 100), [playerStates]);
  const economicProgress = useMemo(() => clampPercent((ip / 200) * 100), [ip]);
  const truthProgress = useMemo(() => {
    if (truth >= 50) {
      return clampPercent((truth / TRUTH_HIGH_THRESHOLD) * 100);
    }
    const distanceToLow = 50 - TRUTH_LOW_THRESHOLD;
    const travelled = 50 - truth;
    return clampPercent((travelled / distanceToLow) * 100);
  }, [truth]);

  const oppositionMilitary = useMemo(() => clampPercent((aiStates / 10) * 100), [aiStates]);
  const oppositionEconomic = useMemo(() => clampPercent((aiIp / 200) * 100), [aiIp]);

  const contestedRatio = totalStates > 0 ? contestedStates / totalStates : 0;
  const neutralRatio = totalStates > 0 ? neutralStates / totalStates : 0;

  const operativeMorale = useMemo(() => {
    const composite = (militaryProgress + economicProgress + truthProgress) / 3;
    const tempoBonus = Math.min(12, cardsPlayedThisRound * 4);
    return clampPercent(composite + tempoBonus / 2);
  }, [militaryProgress, economicProgress, truthProgress, cardsPlayedThisRound]);

  const oppositionMorale = useMemo(() => {
    const truthPenalty = 100 - truthProgress;
    const base = (oppositionMilitary + oppositionEconomic + truthPenalty) / 3;
    return clampPercent(base);
  }, [oppositionMilitary, oppositionEconomic, truthProgress]);

  const publicSentiment = useMemo(() => {
    const truthCenter = 100 - Math.abs(truth - 50) * 1.6;
    const contestPenalty = contestedRatio * 35;
    const intelBonus = Math.min(20, intelCount * 3);
    const adjusted = truthCenter - contestPenalty + intelBonus;
    return clampPercent(adjusted);
  }, [truth, contestedRatio, intelCount]);

  const fieldAssets = useMemo(() => {
    const controlShare = totalStates > 0 ? (playerStates / totalStates) * 100 : 0;
    const stability = 100 - contestedRatio * 100;
    const neutralOpportunity = neutralRatio * 45;
    return clampPercent(controlShare * 0.4 + stability * 0.4 + neutralOpportunity * 0.2);
  }, [playerStates, totalStates, contestedRatio, neutralRatio]);

  const undergroundNetwork = useMemo(() => {
    const intelSignal = Math.min(100, intelCount * 12);
    const truthVelocity = clampPercent((truthMomentum ?? 0) * 15 + 50);
    const cadence = clampPercent(40 + cardsPlayedThisRound * 10);
    return clampPercent((intelSignal + truthVelocity + cadence) / 3);
  }, [intelCount, truthMomentum, cardsPlayedThisRound]);

  const moraleEntries = useMemo(
    () => [
      {
        id: 'operatives',
        label: faction === 'truth' ? 'Operative Network' : 'Directorate Cohesion',
        icon: faction === 'truth' ? <ShieldCheck className="h-4 w-4 text-emerald-300" aria-hidden /> : <ShieldCheck className="h-4 w-4 text-emerald-300" aria-hidden />,
        score: operativeMorale,
      },
      {
        id: 'opposition',
        label: faction === 'truth' ? 'Opposition Agencies' : 'Resistance Cells',
        icon: <Target className="h-4 w-4 text-amber-200" aria-hidden />,
        score: oppositionMorale,
        inverted: true,
      },
      {
        id: 'public',
        label: 'Public Sentiment',
        icon: <Activity className="h-4 w-4 text-sky-200" aria-hidden />,
        score: publicSentiment,
      },
      {
        id: 'assets',
        label: 'Field Assets',
        icon: <Network className="h-4 w-4 text-purple-200" aria-hidden />,
        score: fieldAssets,
      },
      {
        id: 'underground',
        label: faction === 'truth' ? 'Underground Signals' : 'Counter-Intel Sweep',
        icon: <Brain className="h-4 w-4 text-fuchsia-200" aria-hidden />,
        score: undergroundNetwork,
      },
    ],
    [
      faction,
      fieldAssets,
      operativeMorale,
      oppositionMorale,
      publicSentiment,
      undergroundNetwork,
    ],
  );

  const victoryEntries = useMemo(
    () => [
      {
        id: 'military',
        label: 'Military',
        progress: militaryProgress,
        status: formatStatusDelta(playerStates, aiStates),
        icon: <Target className="h-4 w-4 text-sky-200" aria-hidden />,
      },
      {
        id: 'economic',
        label: 'Economic',
        progress: economicProgress,
        status: formatStatusDelta(ip, aiIp),
        icon: <Banknote className="h-4 w-4 text-emerald-200" aria-hidden />,
      },
      {
        id: 'cultural',
        label: 'Cultural',
        progress: truthProgress,
        status: formatTruthStatus(truthProgress, truthMomentum),
        icon: <Sparkles className="h-4 w-4 text-violet-200" aria-hidden />,
      },
    ],
    [aiIp, aiStates, economicProgress, militaryProgress, playerStates, truthMomentum, truthProgress, ip],
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'touch-target inline-flex items-center justify-center rounded-full border border-white/30 bg-gradient-to-r from-[#6ff2ff] via-[#a370ff] to-[#ff79c6] px-3 py-1 text-xs font-bold uppercase tracking-[0.35em] text-slate-900 shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:ring-cyan-200',
            className,
          )}
        >
          Empire Info
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={12}
        className="z-[60] w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-cyan-200/20 bg-slate-950/95 p-0 text-slate-100 shadow-2xl backdrop-blur-lg"
      >
        <div className="bg-gradient-to-r from-cyan-500/20 via-fuchsia-500/10 to-purple-500/20 px-4 pb-4 pt-3">
          <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.28em] text-cyan-100">
            <span>Morale Outlook</span>
            <span>Round {round}</span>
          </div>
        </div>
        <ScrollArea className="max-h-[24rem]">
          <div className="space-y-4 px-4 py-4">
            <div className="space-y-3">
              {moraleEntries.map(entry => {
                const tone = resolveMoraleTone(entry.inverted ? 100 - entry.score : entry.score);
                const { label, badge, bar } = moraleToneStyles[tone];
                const displayScore = entry.inverted ? 100 - entry.score : entry.score;
                return (
                  <div
                    key={entry.id}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-3 shadow-sm backdrop-blur"
                  >
                    <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.18em]">
                      <div className="flex items-center gap-2 text-slate-100">
                        {entry.icon}
                        <span>{entry.label}</span>
                      </div>
                      <span className={cn('font-bold', badge)}>{label} {displayScore}%</span>
                    </div>
                    <div className="mt-2 h-2 w-full rounded-full bg-slate-800/80">
                      <div
                        className={cn('h-full rounded-full transition-all', bar)}
                        style={{ width: `${displayScore}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="space-y-3 rounded-xl border border-white/10 bg-slate-900/60 p-4 shadow-inner">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-200">
                  <Trophy className="h-4 w-4" aria-hidden />
                  <span>Victory Progress</span>
                </div>
                <ArrowUpRight className="h-4 w-4 text-cyan-200" aria-hidden />
              </div>
              <div className="space-y-3">
                {victoryEntries.map(entry => (
                  <div key={entry.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.22em] text-slate-200">
                      <div className="flex items-center gap-2 font-semibold">
                        {entry.icon}
                        <span>{entry.label}</span>
                      </div>
                      <span className="font-bold text-cyan-100">{entry.status}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={entry.progress} className="h-1.5 flex-1 bg-slate-800" />
                      <span className="w-10 text-right text-[11px] font-mono text-cyan-100">{entry.progress}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
        <div className="border-t border-white/10 bg-slate-900/80 px-4 py-3">
          <Button
            type="button"
            variant="secondary"
            className="w-full bg-gradient-to-r from-cyan-400/20 via-purple-400/20 to-fuchsia-400/20 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100 hover:from-cyan-400/30 hover:via-purple-400/30 hover:to-fuchsia-400/30"
            onClick={() => {
              setOpen(false);
              onRequestHub?.();
            }}
          >
            Open Player Hub
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default EmpireInfoButton;
