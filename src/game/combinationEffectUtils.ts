import { recalculateCombinationEffects, cloneCombinationSummary } from '@/mvp/combinationEffects';
import type {
  CombinationEffectBreakdown,
  CombinationEffectSummary,
  GameState as MVPGameState,
  PlayerState,
} from '@/mvp/validator';
import type { GameCard } from '@/rules/mvp';
import type { TurnPlay } from '@/game/combo.types';

export type CombinationEffectContext = {
  faction: 'government' | 'truth';
  controlledStates?: string[];
  aiControlledStates?: string[];
};

export type DerivedCombinationEffectSummaries = {
  human: CombinationEffectSummary;
  ai: CombinationEffectSummary;
};

const sanitizeStates = (states: string[] | undefined): string[] =>
  Array.isArray(states) ? states.filter(Boolean) : [];

const createPlayerState = (
  id: PlayerState['id'],
  faction: PlayerState['faction'],
  states: string[],
): PlayerState => ({
  id,
  faction,
  deck: [],
  hand: [],
  discard: [],
  ip: 0,
  states,
});

const buildMvpState = (
  context: CombinationEffectContext,
): MVPGameState => {
  const humanStates = sanitizeStates(context.controlledStates);
  const aiStates = sanitizeStates(context.aiControlledStates);
  const humanFaction = context.faction;
  const aiFaction = humanFaction === 'truth' ? 'government' : 'truth';

  return {
    turn: 1,
    currentPlayer: 'P1',
    truth: 50,
    players: {
      P1: createPlayerState('P1', humanFaction, humanStates),
      P2: createPlayerState('P2', aiFaction, aiStates),
    },
    pressureByState: {},
    stateDefense: {},
    maxPlaysPerTurn: 1,
    playsThisTurn: 0,
    turnPlays: [] as TurnPlay[],
    log: [],
  };
};

export const deriveCombinationEffectSummaries = (
  context: CombinationEffectContext,
): DerivedCombinationEffectSummaries => {
  const mvpState = buildMvpState(context);
  const computed = recalculateCombinationEffects(mvpState);

  return {
    human: cloneCombinationSummary(computed.P1)!,
    ai: cloneCombinationSummary(computed.P2)!,
  };
};

export const getCombinationSummaryForActor = (
  context: CombinationEffectContext,
  actor: 'human' | 'ai',
): CombinationEffectSummary => {
  const summaries = deriveCombinationEffectSummaries(context);
  return actor === 'human' ? summaries.human : summaries.ai;
};

export const calculateComboIncome = (
  summary: CombinationEffectSummary,
): number => {
  const breakdown = summary.breakdown;
  return (
    summary.totalBonusIP +
    breakdown.flatIpBonus +
    breakdown.ipPerControlledState * summary.controlledStateCount +
    breakdown.ipPerNeutralState * summary.neutralStateCount
  );
};

export const getEffectiveCardCost = (
  card: GameCard,
  breakdown: CombinationEffectBreakdown,
): number => {
  let effectiveCost = card.cost;

  if (card.type === 'MEDIA') {
    effectiveCost += breakdown.mediaCostModifier;
  }

  return Math.max(0, Math.floor(effectiveCost));
};

export const collectUnhandledCombinationEffects = (
  breakdown: CombinationEffectBreakdown,
): string[] => {
  const pending: string[] = [];

  if (breakdown.attackDamageBonus !== 0) pending.push('attackDamageBonus');
  if (breakdown.zonePressureBonus !== 0) pending.push('zonePressureBonus');
  if (breakdown.incomingPressureReduction !== 0) pending.push('incomingPressureReduction');
  if (breakdown.stateDefenseBonus !== 0) pending.push('stateDefenseBonus');
  if (breakdown.truthMultiplier !== 1) pending.push('truthMultiplier');
  if (breakdown.governmentTruthBonus !== 0) pending.push('governmentTruthBonus');
  if (breakdown.rareDrawBias) pending.push('rareDrawBias');
  if (breakdown.canPeekOpponentHand) pending.push('canPeekOpponentHand');
  if (breakdown.canTransferPressure) pending.push('canTransferPressure');
  if (breakdown.preventEventPressureLoss) pending.push('preventEventPressureLoss');

  return pending;
};
