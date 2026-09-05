import { TRUTH_HIGH_THRESHOLD, TRUTH_LOW_THRESHOLD } from '@/constants/truthThresholds';

export const ECONOMIC_VICTORY_IP = 200;
export const TERRITORIAL_VICTORY_STATES = 10;

interface Contender<Id extends string> {
  id: Id;
  faction: string;
  ip: number;
  states: number;
}

/** Standard match priority: Truth, then IP, then territory. Agendas award Truth separately. */
export function evaluateStandardVictory<Id extends string>({
  truth,
  contenders,
  truthHigh = TRUTH_HIGH_THRESHOLD,
  truthLow = TRUTH_LOW_THRESHOLD,
  economicGoal = ECONOMIC_VICTORY_IP,
}: {
  truth: number;
  contenders: readonly Contender<Id>[];
  truthHigh?: number;
  truthLow?: number;
  economicGoal?: number;
}): { winner: Id; victoryType: 'truth' | 'ip' | 'states' } | null {
  const winningFaction = truth >= truthHigh ? 'truth' : truth <= truthLow ? 'government' : null;
  const truthWinner = winningFaction && contenders.find(player => player.faction.toLowerCase() === winningFaction);
  if (truthWinner) return { winner: truthWinner.id, victoryType: 'truth' };

  const economicWinner = contenders.find(player => player.ip >= economicGoal);
  if (economicWinner) return { winner: economicWinner.id, victoryType: 'ip' };

  const territorialWinner = contenders.find(player => player.states >= TERRITORIAL_VICTORY_STATES);
  return territorialWinner ? { winner: territorialWinner.id, victoryType: 'states' } : null;
}
