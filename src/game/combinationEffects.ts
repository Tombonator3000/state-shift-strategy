import { STATE_COMBINATIONS, type StateCombination } from '@/data/stateCombinations';
import type { GameCard } from '@/rules/mvp';
import type { GameState } from '@/hooks/gameStateTypes';

export interface CombinationModifiers {
  flatIncomeBonus: number;
  incomePerControlled: number;
  incomePerNeutral: number;
  mediaCostReduction: number;
}

export interface CombinationContext {
  activeCombinations: StateCombination[];
  modifiers: CombinationModifiers;
}

export interface CardCostAdjustment {
  adjustedCost: number;
  discount: number;
}

export interface IncomeBreakdown {
  totalIncome: number;
  comboBonus: number;
  components: {
    flat: number;
    perControlled: number;
    perNeutral: number;
  };
}

const createEmptyModifiers = (): CombinationModifiers => ({
  flatIncomeBonus: 0,
  incomePerControlled: 0,
  incomePerNeutral: 0,
  mediaCostReduction: 0,
});

const normalizeStates = (states: string[] | undefined): Set<string> => {
  if (!Array.isArray(states) || states.length === 0) {
    return new Set();
  }

  return new Set(states.map(entry => entry.toUpperCase()));
};

export const getActiveCombinationsFromStates = (controlledStates: string[]): StateCombination[] => {
  const normalized = normalizeStates(controlledStates);
  if (normalized.size === 0) {
    return [];
  }

  return STATE_COMBINATIONS.filter(combination =>
    combination.requiredStates.every(state => normalized.has(state.toUpperCase())),
  );
};

export const buildCombinationModifiers = (combinations: StateCombination[]): CombinationModifiers => {
  const modifiers = createEmptyModifiers();

  for (const combination of combinations) {
    switch (combination.id) {
      case 'wall_street_empire':
        modifiers.flatIncomeBonus += 2;
        break;
      case 'silicon_valley_network':
        modifiers.mediaCostReduction += 1;
        break;
      case 'oil_cartel':
        modifiers.incomePerControlled += 1;
        break;
      case 'southern_border':
        modifiers.incomePerNeutral += 1;
        break;
      default:
        break;
    }
  }

  return modifiers;
};

export const getCombinationContextFromControlledStates = (
  controlledStates: string[],
): CombinationContext => {
  const activeCombinations = getActiveCombinationsFromStates(controlledStates);
  const modifiers = buildCombinationModifiers(activeCombinations);
  return { activeCombinations, modifiers };
};

export const getCombinationContextForOwner = (
  state: Pick<GameState, 'controlledStates' | 'aiControlledStates'>,
  owner: 'human' | 'ai',
): CombinationContext => {
  const controlled = owner === 'human' ? state.controlledStates : state.aiControlledStates ?? [];
  return getCombinationContextFromControlledStates(controlled);
};

export const getCardCostAdjustment = (
  card: GameCard,
  context: CombinationContext,
): CardCostAdjustment => {
  const discount = card.type === 'MEDIA' ? context.modifiers.mediaCostReduction : 0;
  const adjustedCost = Math.max(0, card.cost - discount);
  return { adjustedCost, discount };
};

export const buildCardWithAdjustedCost = (
  card: GameCard,
  context: CombinationContext,
): { card: GameCard; adjustedCost: number; discount: number } => {
  const { adjustedCost, discount } = getCardCostAdjustment(card, context);
  if (discount <= 0) {
    return { card, adjustedCost, discount };
  }

  return {
    card: { ...card, cost: adjustedCost },
    adjustedCost,
    discount,
  };
};

export const calculateIncomeWithCombination = (
  baseIncome: number,
  stateIncome: number,
  context: CombinationContext,
  controlledStateCount: number,
  neutralStateCount: number,
): IncomeBreakdown => {
  const flat = context.modifiers.flatIncomeBonus;
  const perControlled = context.modifiers.incomePerControlled * controlledStateCount;
  const perNeutral = context.modifiers.incomePerNeutral * neutralStateCount;
  const comboBonus = flat + perControlled + perNeutral;
  const totalIncome = baseIncome + stateIncome + comboBonus;

  return {
    totalIncome,
    comboBonus,
    components: {
      flat,
      perControlled,
      perNeutral,
    },
  };
};

export const countNeutralStates = (state: Pick<GameState, 'states'>): number => {
  return state.states.reduce((total, entry) => (entry.owner === 'neutral' ? total + 1 : total), 0);
};
