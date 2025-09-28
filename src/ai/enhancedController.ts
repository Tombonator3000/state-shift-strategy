import { EnhancedAIStrategist, type EnhancedCardPlay } from '@/data/enhancedAIStrategy';
import { evaluateCatchUpAdjustments } from '@/mvp/engine';
import type { GameCard } from '@/rules/mvp';

interface AIPlanningState {
  aiHand: GameCard[];
  aiIP: number;
  ip: number;
  states: Array<{
    owner: 'player' | 'ai' | 'neutral';
    abbreviation: string;
  }>;
  [key: string]: unknown;
}

interface PlannedCardAction {
  cardId: string;
  card: GameCard;
  targetState?: string;
  reasoning?: string;
  strategyDetails?: string[];
}

interface TurnSequencePlan {
  actions: PlannedCardAction[];
  sequenceDetails: string[];
  evaluationScore: number;
}

export interface ChooseTurnActionsParams {
  strategist: EnhancedAIStrategist;
  gameState: AIPlanningState;
  maxActions?: number;
  priorityThreshold?: number;
}

const DEFAULT_PRIORITY_THRESHOLD = 0.3;
const DEFAULT_MAX_ACTIONS = 3;
const ABSOLUTE_PRIORITY_FLOOR = 0.18;

const DIFFICULTY_PRIORITY_FLOORS: Record<EnhancedAIStrategist['difficulty'], number> = {
  easy: 0.3,
  medium: 0.27,
  hard: 0.22,
  legendary: 0.2,
};

const evaluatePriorityPreferences = (
  strategist: EnhancedAIStrategist,
  configuredThreshold: number,
): { minimumPriority: number; allowFallback: boolean } => {
  const preferredThreshold = Number.isFinite(configuredThreshold)
    ? configuredThreshold
    : DEFAULT_PRIORITY_THRESHOLD;

  const baseFloor = DIFFICULTY_PRIORITY_FLOORS[strategist.difficulty] ?? preferredThreshold;
  const personality = strategist.personality;
  const aggression = typeof personality?.aggressiveness === 'number' ? personality.aggressiveness : 0.5;
  const territorial = typeof personality?.territorial === 'number' ? personality.territorial : 0.5;
  const aggressionProfile = (aggression + territorial) / 2;
  const aggressionAdjustment = Math.max(0, aggressionProfile - 0.6) * 0.15;
  const dynamicFloor = Math.max(ABSOLUTE_PRIORITY_FLOOR, baseFloor - aggressionAdjustment);
  const minimumPriority = Math.max(ABSOLUTE_PRIORITY_FLOOR, Math.min(preferredThreshold, dynamicFloor));
  const allowFallback =
    strategist.difficulty === 'hard' ||
    strategist.difficulty === 'legendary' ||
    aggressionProfile >= 0.7;

  return { minimumPriority, allowFallback };
};

const formatEvaluationScore = (score: number): string => {
  if (!Number.isFinite(score)) {
    return 'Strategic evaluation score unavailable.';
  }

  const percent = Math.round(score * 100);
  const signedPercent = percent >= 0 ? `+${percent}` : `${percent}`;
  return `Strategic evaluation score: ${signedPercent}.`;
};

export const chooseTurnActions = ({
  strategist,
  gameState,
  maxActions = DEFAULT_MAX_ACTIONS,
  priorityThreshold = DEFAULT_PRIORITY_THRESHOLD,
}: ChooseTurnActionsParams): TurnSequencePlan => {
  const initialHand = Array.isArray(gameState.aiHand) ? [...gameState.aiHand] : [];
  if (!initialHand.length) {
    return { actions: [], sequenceDetails: [], evaluationScore: 0 };
  }

  const controlledStates = Array.isArray(gameState.states)
    ? gameState.states
        .filter(state => state.owner === 'ai')
        .map(state => state.abbreviation)
    : [];
  const opponentStates = Array.isArray(gameState.states)
    ? gameState.states.filter(state => state.owner === 'player').map(state => state.abbreviation)
    : [];

  const aiIp = gameState.aiIP ?? 0;
  const playerIp = gameState.ip ?? 0;
  const catchUp = evaluateCatchUpAdjustments(aiIp - playerIp, controlledStates.length - opponentStates.length);
  const projectedBaseIncome = 5 + controlledStates.length;
  const projectedNetIncome = Math.max(0, projectedBaseIncome - catchUp.swingTax + catchUp.catchUpBonus);

  const baseStrategistView: Record<string, unknown> = {
    ...gameState,
    ip: -(gameState.ip ?? 0),
    aiIP: aiIp,
    hand: initialHand,
    aiHand: initialHand,
    controlledStates,
    catchUpForecast: catchUp,
    projectedIncome: {
      base: projectedBaseIncome,
      swingTax: catchUp.swingTax,
      catchUpBonus: catchUp.catchUpBonus,
      net: projectedNetIncome,
    },
  };

  const evaluation = strategist.evaluateGameState(baseStrategistView);
  const evaluationScore = typeof evaluation?.overallScore === 'number' ? evaluation.overallScore : 0;

  const sequenceDetails = [formatEvaluationScore(evaluationScore)];
  const adaptiveSummary = strategist.getAdaptiveSummary();
  if (adaptiveSummary.length) {
    sequenceDetails.push(...adaptiveSummary);
  }
  if (catchUp.swingTax > 0 || catchUp.catchUpBonus > 0) {
    const modifiers: string[] = [];
    if (catchUp.swingTax > 0) {
      modifiers.push(`swing tax -${catchUp.swingTax} IP`);
    }
    if (catchUp.catchUpBonus > 0) {
      modifiers.push(`catch-up +${catchUp.catchUpBonus} IP`);
    }
    const gapDetails: string[] = [];
    if (catchUp.ipGap !== 0) {
      const direction = catchUp.ipGap > 0 ? 'lead' : 'deficit';
      gapDetails.push(`${direction} ${Math.abs(catchUp.ipGap)} IP`);
    }
    if (catchUp.stateGap !== 0) {
      const count = Math.abs(catchUp.stateGap);
      const label = count === 1 ? 'state' : 'states';
      const direction = catchUp.stateGap > 0 ? 'lead' : 'deficit';
      gapDetails.push(`${direction} ${count} ${label}`);
    }
    const reason = gapDetails.length ? ` (${gapDetails.join(', ')})` : '';
    sequenceDetails.push(`Income modulation: ${modifiers.join(', ')}${reason}.`);
  }

  const actions: PlannedCardAction[] = [];
  const synergyHighlights = new Set<string>();
  const chosenIds = new Set<string>();
  const attemptedIds = new Set<string>();
  let availableIp = gameState.aiIP ?? 0;
  const preferredThreshold = Number.isFinite(priorityThreshold)
    ? priorityThreshold
    : DEFAULT_PRIORITY_THRESHOLD;
  const { minimumPriority, allowFallback } = evaluatePriorityPreferences(strategist, preferredThreshold);
  let fallbackPlay: EnhancedCardPlay | null = null;
  let fallbackCard: GameCard | null = null;

  const createPlannedAction = (
    play: EnhancedCardPlay,
    card: GameCard,
    { opportunistic = false }: { opportunistic?: boolean } = {},
  ): PlannedCardAction => {
    const details: string[] = [];

    if (play.synergies?.length) {
      const synergyDescriptions = play.synergies.map(synergy => synergy.description);
      synergyDescriptions.forEach(desc => synergyHighlights.add(desc));
      details.push(`AI Synergy Bonus: ${synergyDescriptions.join(', ')}`);
    }

    if (play.deceptionValue > 0) {
      details.push(`Deception tactics engaged (${Math.round(play.deceptionValue * 100)}% intensity)`);
    }

    if (play.threatResponse) {
      details.push('Countering recent player action.');
    }

    if (opportunistic) {
      details.push('Opportunistic play despite low priority assessment.');
    }

    return {
      cardId: card.id,
      card,
      targetState: play.targetState,
      reasoning: play.reasoning,
      strategyDetails: details.length ? details : undefined,
    };
  };

  while (actions.length < maxActions) {
    const remainingHand = initialHand.filter(
      card => !chosenIds.has(card.id) && !attemptedIds.has(card.id),
    );

    if (!remainingHand.length) {
      break;
    }

    const strategistView = {
      ...baseStrategistView,
      hand: remainingHand,
      aiHand: remainingHand,
      aiIP: availableIp,
    };

    const enhancedPlay = strategist.selectOptimalPlay(strategistView) as EnhancedCardPlay | null;

    if (!enhancedPlay) {
      break;
    }

    const candidateCard = remainingHand.find(card => card.id === enhancedPlay.cardId);

    if (!candidateCard) {
      attemptedIds.add(enhancedPlay.cardId);
      continue;
    }

    const cost = candidateCard.cost ?? 0;
    if (availableIp < cost) {
      attemptedIds.add(candidateCard.id);
      continue;
    }

    if (!fallbackPlay || enhancedPlay.priority > fallbackPlay.priority) {
      fallbackPlay = enhancedPlay;
      fallbackCard = candidateCard;
    }

    if (enhancedPlay.priority < minimumPriority) {
      break;
    }

    const opportunistic = enhancedPlay.priority < preferredThreshold;
    actions.push(createPlannedAction(enhancedPlay, candidateCard, { opportunistic }));

    chosenIds.add(candidateCard.id);
    availableIp -= cost;
    attemptedIds.clear();
  }

  if (!actions.length && allowFallback && fallbackPlay && fallbackCard) {
    const fallbackCost = fallbackCard.cost ?? 0;
    if (availableIp >= fallbackCost) {
      actions.push(createPlannedAction(fallbackPlay, fallbackCard, { opportunistic: true }));
      availableIp -= fallbackCost;
      sequenceDetails.push('Fallback action: executing best available option despite low priorities.');
    }
  }

  if (actions.length && synergyHighlights.size) {
    sequenceDetails.push(`Turn synergies: ${Array.from(synergyHighlights).join(', ')}`);
  }

  return { actions, sequenceDetails, evaluationScore };
};

export type { PlannedCardAction, TurnSequencePlan };
