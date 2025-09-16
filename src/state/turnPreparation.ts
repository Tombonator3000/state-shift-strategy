import { generateWeightedDeck } from '@/data/weightedCardDistribution';
import { getTotalIPFromStates } from '@/data/usaStates';
import type { GameCard } from '@/types/cardTypes';
import type { GameState } from './gameState';

type DeckFactory = (size: number, faction: 'government' | 'truth') => GameCard[];

export interface DrawStacks {
  hand: GameCard[];
  deck: GameCard[];
  discard: GameCard[];
}

export interface DrawOutcome {
  hand: GameCard[];
  deck: GameCard[];
  discard: GameCard[];
  drawn: GameCard[];
  reshuffled: boolean;
  deckShortage: boolean;
  replenishedFromFactory: boolean;
}

export interface TurnPreparation {
  patch: Partial<GameState>;
  logEntries: string[];
}

export interface HumanTurnOptions {
  bonusDraw?: number;
  deckFactory?: DeckFactory;
}

export interface AITurnOptions {
  deckFactory?: DeckFactory;
}

export const HAND_LIMIT = 5;

const shuffleArray = <T,>(items: T[]): T[] => {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const refillHandFromStacks = (
  stacks: DrawStacks,
  faction: 'government' | 'truth',
  targetHandSize: number,
  deckFactory: DeckFactory = generateWeightedDeck,
): DrawOutcome => {
  const hand = [...stacks.hand];
  let deck = [...stacks.deck];
  let discard = [...stacks.discard];
  const drawn: GameCard[] = [];
  let reshuffled = false;
  let deckShortage = false;
  let factoryAttempted = false;
  let replenishedFromFactory = false;

  while (hand.length + drawn.length < targetHandSize) {
    if (deck.length === 0) {
      if (discard.length > 0) {
        deck = shuffleArray(discard);
        discard = [];
        reshuffled = true;
      } else if (!factoryAttempted) {
        factoryAttempted = true;
        const replenishedDeck = deckFactory(40, faction);
        if (replenishedDeck.length > 0) {
          deck = [...replenishedDeck];
          replenishedFromFactory = true;
        } else {
          deck = [];
        }
      } else {
        break;
      }
    }

    const nextCard = deck.shift();
    if (!nextCard) {
      break;
    }

    drawn.push(nextCard);
  }

  const finalHand = [...hand, ...drawn];
  deckShortage = finalHand.length < targetHandSize;

  return {
    hand: finalHand,
    deck,
    discard,
    drawn,
    reshuffled,
    deckShortage,
    replenishedFromFactory,
  };
};

export const prepareHumanTurnStart = (
  prev: GameState,
  options: HumanTurnOptions = {},
): TurnPreparation => {
  const pendingBonus = Math.max(0, options.bonusDraw ?? prev.pendingCardDraw ?? 0);
  const targetHandSize = HAND_LIMIT + pendingBonus;
  const drawOutcome = refillHandFromStacks(
    { hand: prev.hand, deck: prev.deck, discard: prev.discardPile },
    prev.faction,
    targetHandSize,
    options.deckFactory,
  );

  const logEntries: string[] = [];

  if (drawOutcome.reshuffled) {
    logEntries.push('Deck reshuffled from discard pile');
  }

  if (drawOutcome.replenishedFromFactory) {
    logEntries.push('Deck replenished from reserves');
  }

  let summary = '';
  if (drawOutcome.drawn.length > 0) {
    const bonusNote = pendingBonus > 0 ? ` (+${pendingBonus} bonus)` : '';
    summary = `Drew ${drawOutcome.drawn.length} card${drawOutcome.drawn.length === 1 ? '' : 's'}${bonusNote} to start turn (hand ${drawOutcome.hand.length}/${targetHandSize})`;
  } else {
    summary = `Ready to act (hand ${drawOutcome.hand.length}/${targetHandSize})`;
  }

  logEntries.push(summary);

  if (drawOutcome.deckShortage) {
    logEntries.push('Deck exhausted: unable to draw enough cards for new turn');
  }

  const patch: Partial<GameState> = {
    hand: drawOutcome.hand,
    deck: drawOutcome.deck,
    discardPile: drawOutcome.discard,
    showNewspaper: false,
    cardsPlayedThisRound: [],
    phase: 'action',
    currentPlayer: 'human',
    showNewCardsPresentation: false,
    newCards: [],
    pendingCardDraw: 0,
    cardsPlayedThisTurn: 0,
    animating: false,
    selectedCard: null,
    targetState: null,
    aiTurnInProgress: false,
  };

  return { patch, logEntries };
};

export const prepareAITurnStart = (
  prev: GameState,
  options: AITurnOptions = {},
): TurnPreparation => {
  const aiFaction = prev.faction === 'government' ? 'truth' : 'government';
  const aiControlledStates = prev.states
    .filter(state => state.owner === 'ai')
    .map(state => state.abbreviation);
  const aiStateIncome = getTotalIPFromStates(aiControlledStates);
  const aiBaseIncome = 5;
  const aiTotalIncome = aiBaseIncome + aiStateIncome;

  const drawOutcome = refillHandFromStacks(
    { hand: prev.aiHand, deck: prev.aiDeck, discard: prev.aiDiscardPile },
    aiFaction,
    HAND_LIMIT,
    options.deckFactory,
  );

  const logEntries: string[] = [
    `AI Income: ${aiBaseIncome} base + ${aiStateIncome} from ${aiControlledStates.length} states = ${aiTotalIncome} IP`,
  ];

  if (drawOutcome.reshuffled) {
    logEntries.push('AI reshuffled discard into new deck');
  }

  if (drawOutcome.replenishedFromFactory) {
    logEntries.push('AI deck replenished from reserves');
  }

  if (drawOutcome.drawn.length > 0) {
    logEntries.push(
      `AI drew ${drawOutcome.drawn.length} card${drawOutcome.drawn.length === 1 ? '' : 's'} (hand ${drawOutcome.hand.length}/${HAND_LIMIT})`,
    );
  } else if (drawOutcome.deckShortage) {
    logEntries.push('AI deck exhausted: unable to draw enough cards for turn');
  } else {
    logEntries.push(`AI ready (hand ${drawOutcome.hand.length}/${HAND_LIMIT})`);
  }

  if (drawOutcome.deckShortage && drawOutcome.drawn.length > 0) {
    logEntries.push('AI deck lacks enough cards to reach hand limit');
  }

  const patch: Partial<GameState> = {
    aiHand: drawOutcome.hand,
    aiDeck: drawOutcome.deck,
    aiDiscardPile: drawOutcome.discard,
    aiIP: prev.aiIP + aiTotalIncome,
    cardsPlayedThisTurn: 0,
  };

  return { patch, logEntries };
};
