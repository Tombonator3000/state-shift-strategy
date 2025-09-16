import { useCallback, useMemo, useState } from "react";
import { createState, playCard as enginePlayCard, endTurn as engineEndTurn, aiAction as engineAiAction, type UIOnlyState } from "@/engine";
import { getInitialDeck } from "@/data/CARD_DATABASE";
import { USA_STATES, type EnhancedStateData } from "@/data/usaStates";
import type { Card } from "@/types/public";

export type ShowcaseMapState = EnhancedStateData & {
  owner: "player" | "ai" | "neutral";
  pressure: number;
};

export type ShowcaseGameState = {
  faction: "truth" | "government";
  truth: number;
  ip: number;
  aiIP: number;
  round: number;
  playerHand: Card[];
  aiHand: Card[];
  deck: Card[];
  log: string[];
  states: ShowcaseMapState[];
};

export type ShowcaseEvent = {
  toast?: string;
  newspaper?: string;
  mapPulse?: string;
};

const createMapStates = (): ShowcaseMapState[] =>
  USA_STATES.map(state => ({
    ...state,
    owner: "neutral" as const,
    pressure: 0
  }));

const cloneEngineState = (state: UIOnlyState): UIOnlyState => ({
  ...state,
  playerHand: [...state.playerHand],
  aiHand: [...state.aiHand],
  deck: [...state.deck],
  log: [...state.log]
});

export function useGameState() {
  const [engineState, setEngineState] = useState<UIOnlyState>(() => {
    const initialDeck = getInitialDeck();
    return createState([...initialDeck]);
  });
  const [states, setStates] = useState<ShowcaseMapState[]>(() => createMapStates());
  const [faction] = useState<"truth" | "government">("truth");
  const [truth, setTruth] = useState(60);
  const [ip, setIP] = useState(20);
  const [aiIP, setAiIP] = useState(20);
  const [showNewspaper, setShowNewspaper] = useState(false);
  const [newspaperHeadline, setNewspaperHeadline] = useState<string | null>(null);
  const [mapPulse, setMapPulse] = useState<string | null>(null);

  const gameState: ShowcaseGameState = useMemo(() => ({
    faction,
    truth,
    ip,
    aiIP,
    round: engineState.round,
    playerHand: engineState.playerHand,
    aiHand: engineState.aiHand,
    deck: engineState.deck,
    log: engineState.log,
    states
  }), [faction, truth, ip, aiIP, engineState, states]);

  const applyEvent = useCallback((event?: ShowcaseEvent) => {
    if (!event) return;

    if (event.newspaper) {
      setNewspaperHeadline(event.newspaper);
      setShowNewspaper(true);
    }

    if (event.mapPulse) {
      const pulseId = event.mapPulse.toUpperCase();
      setMapPulse(pulseId);
      setStates(prev => prev.map(state => {
        if (state.abbreviation === pulseId) {
          const nextPressure = Math.min(state.defense, state.pressure + 1);
          return {
            ...state,
            pressure: nextPressure,
            owner: nextPressure >= state.defense ? "player" : state.owner
          };
        }
        return state;
      }));
    }
  }, []);

  const initGame = useCallback(() => {
    const deck = getInitialDeck();
    const nextEngineState = createState([...deck]);
    nextEngineState.log = ["Showcase ready. Select a card to highlight it."];

    setEngineState(nextEngineState);
    setStates(createMapStates());
    setTruth(60);
    setIP(20);
    setAiIP(20);
    setShowNewspaper(false);
    setNewspaperHeadline(null);
    setMapPulse(null);
  }, []);

  const playCard = useCallback((handIndex: number): ShowcaseEvent => {
    let event: ShowcaseEvent | undefined;

    setEngineState(prev => {
      const next = cloneEngineState(prev);
      const card = next.playerHand[handIndex];
      if (card) {
        next.playerHand = next.playerHand.filter((_, idx) => idx !== handIndex);
        if (next.deck.length > 0) {
          const [drawn, ...rest] = next.deck;
          next.playerHand = [...next.playerHand, drawn];
          next.deck = rest;
        }
      }
      event = enginePlayCard(next, handIndex);
      if (event?.toast) {
        next.log = [...next.log, event.toast];
      }
      return next;
    });

    applyEvent(event);
    return event ?? {};
  }, [applyEvent]);

  const endTurn = useCallback((): ShowcaseEvent => {
    let event: ShowcaseEvent | undefined;

    setEngineState(prev => {
      const next = cloneEngineState(prev);
      event = engineEndTurn(next);
      if (event?.toast) {
        next.log = [...next.log, event.toast];
      }
      return next;
    });

    setTruth(prev => Math.min(100, prev + 1));
    setIP(prev => prev + 1);

    applyEvent(event);
    return event ?? {};
  }, [applyEvent]);

  const executeAITurn = useCallback((): ShowcaseEvent => {
    let event: ShowcaseEvent | undefined;

    setEngineState(prev => {
      const next = cloneEngineState(prev);
      if (next.aiHand.length > 0) {
        next.aiHand = next.aiHand.slice(1);
        if (next.deck.length > 0) {
          const [drawn, ...rest] = next.deck;
          next.aiHand = [...next.aiHand, drawn];
          next.deck = rest;
        }
      }
      event = engineAiAction(next);
      if (event?.toast) {
        next.log = [...next.log, event.toast];
      }
      return next;
    });

    setAiIP(prev => prev + 1);
    applyEvent(event);
    return event ?? {};
  }, [applyEvent]);

  const closeNewspaper = useCallback(() => {
    setShowNewspaper(false);
    setNewspaperHeadline(null);
  }, []);

  return {
    gameState,
    mapPulse,
    showNewspaper,
    newspaperHeadline,
    initGame,
    playCard,
    endTurn,
    executeAITurn,
    closeNewspaper
  };
}
