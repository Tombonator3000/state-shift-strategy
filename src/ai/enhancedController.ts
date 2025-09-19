import { EnhancedAIStrategist, type EnhancedCardPlay } from '@/data/enhancedAIStrategy';
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

interface ChooseTurnActionsParams {
  strategist: EnhancedAIStrategist;
  gameState: AIPlanningState;
  maxActions?: number;
  priorityThreshold?: number;
}

const DEFAULT_PRIORITY_THRESHOLD = 0.3;
const DEFAULT_MAX_ACTIONS = 3;

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

  const baseStrategistView: Record<string, unknown> = {
    ...gameState,
    ip: -(gameState.ip ?? 0),
    aiIP: gameState.aiIP ?? 0,
    hand: initialHand,
    aiHand: initialHand,
    controlledStates,
  };

  const evaluation = strategist.evaluateGameState(baseStrategistView);
  const evaluationScore = typeof evaluation?.overallScore === 'number' ? evaluation.overallScore : 0;

  const sequenceDetails = [formatEvaluationScore(evaluationScore)];
  const adaptiveSummary = strategist.getAdaptiveSummary();
  if (adaptiveSummary.length) {
    sequenceDetails.push(...adaptiveSummary);
  }

  const actions: PlannedCardAction[] = [];
  const synergyHighlights = new Set<string>();
  const chosenIds = new Set<string>();
  const attemptedIds = new Set<string>();
  let availableIp = gameState.aiIP ?? 0;

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

    if (!enhancedPlay || enhancedPlay.priority < priorityThreshold) {
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

    const details: string[] = [];

    if (enhancedPlay.synergies?.length) {
      const synergyDescriptions = enhancedPlay.synergies.map(synergy => synergy.description);
      synergyDescriptions.forEach(desc => synergyHighlights.add(desc));
      details.push(`AI Synergy Bonus: ${synergyDescriptions.join(', ')}`);
    }

    if (enhancedPlay.deceptionValue > 0) {
      details.push(`Deception tactics engaged (${Math.round(enhancedPlay.deceptionValue * 100)}% intensity)`);
    }

    if (enhancedPlay.threatResponse) {
      details.push('Countering recent player action.');
    }

    actions.push({
      cardId: candidateCard.id,
      card: candidateCard,
      targetState: enhancedPlay.targetState,
      reasoning: enhancedPlay.reasoning,
      strategyDetails: details.length ? details : undefined,
    });

    chosenIds.add(candidateCard.id);
    availableIp -= cost;
    attemptedIds.clear();
  }

  if (actions.length && synergyHighlights.size) {
    sequenceDetails.push(`Turn synergies: ${Array.from(synergyHighlights).join(', ')}`);
  }

  return { actions, sequenceDetails, evaluationScore };
};

export type { PlannedCardAction, TurnSequencePlan };
