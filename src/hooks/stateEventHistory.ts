import type {
  GameState,
  StateEventBonusSummary,
  StateParanormalHotspotSummary,
} from './gameStateTypes';

export const STATE_EVENT_HISTORY_LIMIT = 5;
export const STATE_HOTSPOT_HISTORY_LIMIT = 5;

export const trimStateEventHistory = (
  history: StateEventBonusSummary[],
): StateEventBonusSummary[] => {
  if (history.length <= STATE_EVENT_HISTORY_LIMIT) {
    return history;
  }

  return history.slice(history.length - STATE_EVENT_HISTORY_LIMIT);
};

export const trimParanormalHotspotHistory = (
  history: StateParanormalHotspotSummary[],
): StateParanormalHotspotSummary[] => {
  if (history.length <= STATE_HOTSPOT_HISTORY_LIMIT) {
    return history;
  }

  return history.slice(history.length - STATE_HOTSPOT_HISTORY_LIMIT);
};

const buildHistoryLookupKey = (state: GameState['states'][number]): string[] => {
  const keys = [] as string[];
  if (typeof state.id === 'string') {
    keys.push(state.id);
  }
  if (typeof state.abbreviation === 'string') {
    keys.push(state.abbreviation);
  }
  return keys;
};

type StateWithOptionalHistory = Omit<
  GameState['states'][number],
  'stateEventHistory' | 'paranormalHotspotHistory'
> & {
  stateEventHistory?: StateEventBonusSummary[];
  paranormalHotspotHistory?: StateParanormalHotspotSummary[];
  stateEventBonus?: StateEventBonusSummary;
};

export const mergeStateEventHistories = (
  previous: GameState['states'],
  next: StateWithOptionalHistory[],
): GameState['states'] => {
  const historyLookup = new Map<string, StateEventBonusSummary[]>();
  const hotspotHistoryLookup = new Map<string, StateParanormalHotspotSummary[]>();

  for (const state of previous) {
    const history = Array.isArray(state.stateEventHistory) ? state.stateEventHistory : [];
    const hotspotHistory = Array.isArray(state.paranormalHotspotHistory)
      ? state.paranormalHotspotHistory
      : [];
    for (const key of buildHistoryLookupKey(state)) {
      historyLookup.set(key, history);
      hotspotHistoryLookup.set(key, hotspotHistory);
    }
  }

  return next.map(state => {
    const existingHistory = Array.isArray(state.stateEventHistory)
      ? state.stateEventHistory
      : historyLookup.get(state.id) ?? historyLookup.get(state.abbreviation) ?? [];
    const existingHotspotHistory = Array.isArray(state.paranormalHotspotHistory)
      ? state.paranormalHotspotHistory
      : hotspotHistoryLookup.get(state.id)
          ?? hotspotHistoryLookup.get(state.abbreviation)
          ?? [];
    const normalizedHistory = trimStateEventHistory([...existingHistory]);
    const normalizedHotspotHistory = trimParanormalHotspotHistory([...existingHotspotHistory]);
    const historyWithBonus =
      normalizedHistory.length === 0 && state.stateEventBonus
        ? trimStateEventHistory([...normalizedHistory, state.stateEventBonus])
        : normalizedHistory;
    const normalizedBonus = historyWithBonus.length > 0
      ? historyWithBonus[historyWithBonus.length - 1]
      : undefined;

    return {
      ...state,
      stateEventHistory: historyWithBonus,
      paranormalHotspotHistory: normalizedHotspotHistory,
      stateEventBonus: normalizedBonus,
    } satisfies GameState['states'][number];
  });
};
