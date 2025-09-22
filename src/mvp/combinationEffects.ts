import { STATE_COMBINATIONS } from '@/data/stateCombinations';
import { USA_STATES } from '@/data/usaStates';
import type {
  CombinationEffectBreakdown,
  CombinationEffectSummary,
  GameState,
  PlayerId,
} from './validator';

const TOTAL_STATES = USA_STATES.length;

const OPPONENT: Record<PlayerId, PlayerId> = { P1: 'P2', P2: 'P1' };

const createEmptyBreakdown = (): CombinationEffectBreakdown => ({
  flatIpBonus: 0,
  ipPerControlledState: 0,
  ipPerNeutralState: 0,
  extraCardDraw: 0,
  mediaCostModifier: 0,
  attackDamageBonus: 0,
  zonePressureBonus: 0,
  incomingPressureReduction: 0,
  stateDefenseBonus: 0,
  truthMultiplier: 1,
  governmentTruthBonus: 0,
  rareDrawBias: false,
  canPeekOpponentHand: false,
  canTransferPressure: false,
  preventEventPressureLoss: false,
});

const cloneBreakdown = (breakdown: CombinationEffectBreakdown): CombinationEffectBreakdown => ({
  ...breakdown,
});

const mapActiveCombination = (combo: (typeof STATE_COMBINATIONS)[number]) => ({
  id: combo.id,
  name: combo.name,
  bonusIP: combo.bonusIP,
  bonusEffect: combo.bonusEffect,
  category: combo.category,
  description: combo.description,
});

const evaluateForPlayer = (state: GameState, playerId: PlayerId): CombinationEffectSummary => {
  const playerStates = new Set(state.players[playerId]?.states ?? []);
  const opponentStates = new Set(state.players[OPPONENT[playerId]]?.states ?? []);
  const neutralStates = Math.max(0, TOTAL_STATES - playerStates.size - opponentStates.size);

  const activeCombinations = STATE_COMBINATIONS.filter(combo =>
    combo.requiredStates.every(abbr => playerStates.has(abbr)),
  );

  const totalBonusIP = activeCombinations.reduce((sum, combo) => sum + combo.bonusIP, 0);
  const breakdown = createEmptyBreakdown();

  for (const combo of activeCombinations) {
    switch (combo.id) {
      case 'wall_street_empire': {
        breakdown.flatIpBonus += 2;
        break;
      }
      case 'silicon_valley_network': {
        breakdown.mediaCostModifier -= 1;
        break;
      }
      case 'oil_cartel': {
        breakdown.ipPerControlledState += 1;
        break;
      }
      case 'military_triangle': {
        breakdown.attackDamageBonus += 1;
        breakdown.zonePressureBonus += 1;
        break;
      }
      case 'nuclear_triad': {
        breakdown.stateDefenseBonus += 1;
        break;
      }
      case 'space_program': {
        breakdown.canPeekOpponentHand = true;
        break;
      }
      case 'intel_web': {
        breakdown.extraCardDraw += 1;
        break;
      }
      case 'academic_elite': {
        breakdown.truthMultiplier = Math.max(breakdown.truthMultiplier, 1.5);
        break;
      }
      case 'midwest_backbone': {
        breakdown.incomingPressureReduction += 1;
        break;
      }
      case 'deep_south': {
        breakdown.governmentTruthBonus += 2;
        break;
      }
      case 'new_england_conspiracy': {
        breakdown.rareDrawBias = true;
        break;
      }
      case 'transport_control': {
        breakdown.canTransferPressure = true;
        break;
      }
      case 'southern_border': {
        breakdown.ipPerNeutralState += 1;
        break;
      }
      case 'food_supply': {
        breakdown.preventEventPressureLoss = true;
        break;
      }
      default:
        break;
    }
  }

  const computedTurnBonus =
    totalBonusIP +
    breakdown.flatIpBonus +
    breakdown.ipPerControlledState * playerStates.size +
    breakdown.ipPerNeutralState * neutralStates;

  return {
    activeCombinations: activeCombinations.map(mapActiveCombination),
    totalBonusIP,
    breakdown,
    computedTurnBonus,
    appliedTurnBonus: 0,
    controlledStateCount: playerStates.size,
    neutralStateCount: neutralStates,
  };
};

export const cloneCombinationSummary = (
  summary: CombinationEffectSummary | undefined,
): CombinationEffectSummary | undefined => {
  if (!summary) {
    return undefined;
  }

  return {
    ...summary,
    activeCombinations: summary.activeCombinations.map(combo => ({ ...combo })),
    breakdown: cloneBreakdown(summary.breakdown),
  };
};

export const recalculateCombinationEffects = (
  state: GameState,
): Record<PlayerId, CombinationEffectSummary> => {
  const computed = {
    P1: evaluateForPlayer(state, 'P1'),
    P2: evaluateForPlayer(state, 'P2'),
  } as Record<PlayerId, CombinationEffectSummary>;

  state.combinationEffects = computed;
  return computed;
};
