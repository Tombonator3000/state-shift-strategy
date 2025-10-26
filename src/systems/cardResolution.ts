import { applyEffectsMvp, type PlayerId } from '@/engine/applyEffects-mvp';
import { auditGameState } from '@/mvp/gameStateAudit';
import type { MediaResolutionOptions } from '@/mvp/media';
import { cloneGameState, type Card, type GameState as EngineGameState } from '@/mvp';
import type { GameCard } from '@/rules/mvp';
import { setStateOccupation } from '@/data/usaStates';
import {
  applyDefenseBonusToStates,
  createDefaultCombinationEffects,
  type StateCombinationEffects,
} from '@/data/stateCombinations';
import type { PlayerStats } from '@/data/achievementSystem';
import type {
  StateEventBonusSummary,
  StateParanormalHotspot,
  StateParanormalHotspotSummary,
} from '@/hooks/gameStateTypes';
import { applyTruthDelta } from '@/utils/truth';
import { trimParanormalHotspotHistory } from '@/hooks/stateEventHistory';
import {
  resolveHotspot as resolveParanormalHotspot,
  type HotspotResolutionOutcome,
} from '@/systems/paranormalHotspots';
import type { EditorId } from '@/game/editors';
import {
  emitBanter,
  defaultBanterUi,
  getStateChangeTrigger,
  type TriggerKey,
} from '@/ai/banter/banterEngine';

type Faction = 'government' | 'truth';

type StateOwner = 'player' | 'ai' | 'neutral';

export interface AchievementTracker {
  stats: Pick<
    PlayerStats,
    |
      'total_states_controlled'
      | 'max_states_controlled_single_game'
      | 'max_ip_reached'
      | 'max_truth_reached'
      | 'min_truth_reached'
  >;
  updateStats: (updates: Partial<PlayerStats>) => void;
}

export interface StateForResolution {
  id: string;
  name: string;
  abbreviation: string;
  baseIP: number;
  baseDefense: number;
  defense: number;
  pressure: number;
  pressurePlayer: number;
  pressureAi: number;
  contested: boolean;
  owner: StateOwner;
  occupierCardId?: string | null;
  occupierCardName?: string | null;
  occupierLabel?: string | null;
  occupierIcon?: string | null;
  occupierUpdatedAt?: number;
  paranormalHotspot?: StateParanormalHotspot;
  paranormalHotspotHistory?: StateParanormalHotspotSummary[];
  stateEventBonus?: StateEventBonusSummary;
  stateEventHistory?: StateEventBonusSummary[];
}

export interface GameSnapshot {
  truth: number;
  ip: number;
  aiIP: number;
  hand: GameCard[];
  aiHand: GameCard[];
  controlledStates: string[];
  aiControlledStates?: string[];
  round: number;
  turn: number;
  faction: Faction;
  states: StateForResolution[];
  stateCombinationEffects?: StateCombinationEffects;
  playerEditorId?: EditorId | null;
  playerEditor?: EditorId | null;
  editorId?: EditorId | null;
  aiEditorId?: EditorId | null;
  aiEditor?: EditorId | null;
}

export interface CardHotspotResolution {
  stateId: string;
  stateAbbreviation: string;
  stateName: string;
  hotspotId: string;
  label: string;
  defenseBoost: number;
  truthReward: number;
  truthDelta: number;
  expectedTruthDelta: number;
  faction: 'truth' | 'government';
  source: 'truth' | 'government' | 'neutral';
}

export interface CardPlayResolution {
  ip: number;
  aiIP: number;
  truth: number;
  states: StateForResolution[];
  controlledStates: string[];
  aiControlledStates: string[];
  capturedStateIds: string[];
  targetState: string | null;
  selectedCard: string | null;
  logEntries: string[];
  damageDealt: number;
  aiSecretAgendaRevealed?: boolean;
  resolvedHotspots?: string[];
  hotspotResolutions?: CardHotspotResolution[];
  countered?: boolean;
}

const PLAYER_ID: PlayerId = 'P1';
const AI_ID: PlayerId = 'P2';

type ClashLike = {
  targetCardId?: unknown;
  cardId?: unknown;
  cardIds?: unknown;
  targetCardIds?: unknown;
  card?: unknown;
  target?: unknown;
  outcome?: unknown;
  result?: unknown;
  status?: unknown;
  countered?: unknown;
  message?: unknown;
  log?: unknown;
  text?: unknown;
  reason?: unknown;
  summary?: unknown;
  detail?: unknown;
};

const toTrimmedStringOrNull = (value: unknown): string | null => {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  return null;
};

const collectCandidateIds = (entry: ClashLike): string[] => {
  const ids: string[] = [];
  const pushId = (candidate: unknown) => {
    const resolved = toTrimmedStringOrNull(candidate);
    if (resolved) {
      ids.push(resolved);
    }
  };

  pushId(entry.targetCardId);
  pushId(entry.cardId);

  if (Array.isArray(entry.cardIds)) {
    for (const id of entry.cardIds as unknown[]) {
      pushId(id);
    }
  }

  if (Array.isArray(entry.targetCardIds)) {
    for (const id of entry.targetCardIds as unknown[]) {
      pushId(id);
    }
  }

  if (entry.card && typeof entry.card === 'object') {
    const payload = entry.card as { id?: unknown };
    pushId(payload.id);
  }

  if (entry.target && typeof entry.target === 'object') {
    const payload = entry.target as { id?: unknown };
    pushId(payload.id);
  } else if (typeof entry.target === 'string') {
    pushId(entry.target);
  }

  return ids;
};

const extractCounterMessage = (entry: ClashLike): string | null => {
  const fields: unknown[] = [
    entry.message,
    entry.log,
    entry.text,
    entry.reason,
    entry.summary,
    entry.detail,
  ];

  for (const field of fields) {
    const message = toTrimmedStringOrNull(field);
    if (message) {
      return message;
    }
  }

  return null;
};

const normalizeClashOutcome = (
  value: unknown,
): { appliesToCard: (cardId: string) => boolean; countered: boolean; message?: string } | null => {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const entry = value as ClashLike;
  const ids = collectCandidateIds(entry);
  const outcomeText = toTrimmedStringOrNull(entry.outcome)
    ?? toTrimmedStringOrNull(entry.result)
    ?? toTrimmedStringOrNull(entry.status);
  const countered = Boolean(
    entry.countered === true ||
      (outcomeText ? outcomeText.toLowerCase() === 'countered' : false),
  );
  const message = extractCounterMessage(entry) ?? undefined;

  return {
    appliesToCard: (cardId: string) => {
      if (!ids.length) {
        return true;
      }
      return ids.includes(cardId);
    },
    countered,
    message,
  };
};

const detectCounterOutcome = (
  snapshot: GameSnapshot,
  card: GameCard,
): { countered: boolean; message?: string } => {
  const probes: unknown[] = [];
  const enrichedSnapshot = snapshot as GameSnapshot & {
    clash?: unknown;
    matchContext?: Record<string, unknown> | null;
  };

  if (enrichedSnapshot.clash) {
    probes.push(enrichedSnapshot.clash);
  }

  const matchContext = enrichedSnapshot.matchContext;
  if (matchContext && typeof matchContext === 'object') {
    if (matchContext.clash) {
      probes.push(matchContext.clash);
    }

    const pending = matchContext.pendingCounters;
    if (Array.isArray(pending)) {
      probes.push(...pending);
    }

    const counteredCards = matchContext.counteredCards;
    if (Array.isArray(counteredCards)) {
      const normalized = counteredCards
        .map(entry => toTrimmedStringOrNull(entry))
        .filter((entry): entry is string => Boolean(entry));
      if (normalized.includes(card.id)) {
        const message = toTrimmedStringOrNull(matchContext.counteredMessage);
        return { countered: true, message: message ?? undefined };
      }
    }

    const counterMap = matchContext.counterMap;
    if (counterMap && typeof counterMap === 'object') {
      const lookup = (counterMap as Record<string, unknown>)[card.id];
      if (lookup) {
        probes.push(lookup);
      }
    }
  }

  for (const probe of probes) {
    const normalized = normalizeClashOutcome(probe);
    if (!normalized) {
      continue;
    }
    if (!normalized.appliesToCard(card.id)) {
      continue;
    }
    if (!normalized.countered) {
      continue;
    }
    return { countered: true, message: normalized.message };
  }

  return { countered: false };
};

const resolvePlayerEditorId = (snapshot: GameSnapshot): string | null => {
  const enriched = snapshot as GameSnapshot & {
    playerEditorId?: EditorId | null;
    playerEditor?: EditorId | null;
    editorId?: EditorId | null;
  };
  const candidate = enriched.playerEditorId ?? enriched.playerEditor ?? enriched.editorId ?? null;
  return typeof candidate === 'string' && candidate.length > 0 ? candidate : null;
};

const resolveAiEditorId = (snapshot: GameSnapshot): string | null => {
  const enriched = snapshot as GameSnapshot & {
    aiEditorId?: EditorId | null;
    aiEditor?: EditorId | null;
  };
  const candidate = enriched.aiEditorId ?? enriched.aiEditor ?? null;
  return typeof candidate === 'string' && candidate.length > 0 ? candidate : null;
};

const queueBanterForTrigger = (snapshot: GameSnapshot, trigger: TriggerKey) => {
  const editorId = resolvePlayerEditorId(snapshot);
  if (!editorId) {
    return;
  }
  void emitBanter(editorId, trigger, snapshot.turn ?? 0, defaultBanterUi);
};

export type CardActor = 'human' | 'ai';

/**
 * Resolves a target string to a state id, matching case-insensitively against
 * known identifiers. If no match is found we fall back to the trimmed input so
 * downstream logic can decide how to handle the value.
 */
const resolveTargetStateId = (
  snapshot: GameSnapshot,
  target?: string | null,
): string | undefined => {
  if (!target) {
    return undefined;
  }

  const trimmedTarget = target.trim();
  if (!trimmedTarget) {
    return undefined;
  }

  const normalizedTarget = trimmedTarget.toLowerCase();

  const normalize = (value: string) => value.trim().toLowerCase();

  const match = snapshot.states.find(state => {
    const candidates = [state.id, state.abbreviation, state.name].filter(
      Boolean,
    ) as string[];
    return candidates.some(candidate => normalize(candidate) === normalizedTarget);
  });

  return match ? match.id : trimmedTarget;
};

const buildStateLookups = (states: StateForResolution[]) => {
  const abbreviationToId = new Map<string, string>();

  for (const state of states) {
    abbreviationToId.set(state.abbreviation, state.id);
  }

  return { abbreviationToId };
};

const toEngineState = (
  snapshot: GameSnapshot,
  log: string[],
): EngineGameState => {
  const { abbreviationToId } = buildStateLookups(snapshot.states);

  const pressureByState: EngineGameState['pressureByState'] = {};
  const stateDefense: EngineGameState['stateDefense'] = {};
  const playerStates = new Set<string>();
  const aiStates = new Set<string>();
  const ownerById = new Map<string, StateOwner>();

  for (const state of snapshot.states) {
    stateDefense[state.id] = state.defense;
    ownerById.set(state.id, state.owner);
    const owner = state.owner;
    const fallbackPressure = Math.max(0, state.pressure ?? 0);
    let playerPressure = Number.isFinite(state.pressurePlayer)
      ? Math.max(0, state.pressurePlayer)
      : owner === 'player'
        ? 0
        : fallbackPressure;
    let aiPressure = Number.isFinite(state.pressureAi)
      ? Math.max(0, state.pressureAi)
      : owner === 'ai'
        ? fallbackPressure
        : 0;

    if (owner === 'player') {
      playerPressure = 0;
      aiPressure = 0;
    } else if (owner === 'ai') {
      aiPressure = 0;
      playerPressure = 0;
    }

    if (owner === 'player') {
      playerStates.add(state.id);
    } else if (owner === 'ai') {
      aiStates.add(state.id);
    }

    pressureByState[state.id] = {
      P1: playerPressure,
      P2: aiPressure,
    };
  }

  for (const abbr of snapshot.controlledStates) {
    const id = abbreviationToId.get(abbr) ?? abbr;
    playerStates.add(id);
  }

  for (const abbr of snapshot.aiControlledStates ?? []) {
    const id = abbreviationToId.get(abbr) ?? abbr;
    aiStates.add(id);
  }

  const normalizedPlayerStates = new Set(playerStates);
  const normalizedAiStates = new Set(aiStates);

  for (const id of Array.from(normalizedPlayerStates)) {
    if (!normalizedAiStates.has(id)) {
      continue;
    }

    const declaredOwner = ownerById.get(id);
    if (declaredOwner === 'ai') {
      normalizedPlayerStates.delete(id);
    } else if (declaredOwner === 'player') {
      normalizedAiStates.delete(id);
    } else {
      normalizedPlayerStates.delete(id);
      normalizedAiStates.delete(id);
    }
  }

  for (const id of normalizedPlayerStates) {
    pressureByState[id] = { P1: 0, P2: 0 };
  }

  for (const id of normalizedAiStates) {
    pressureByState[id] = { P1: 0, P2: 0 };
  }

  return {
    turn: snapshot.turn,
    currentPlayer: PLAYER_ID,
    truth: snapshot.truth,
    players: {
      [PLAYER_ID]: {
        id: PLAYER_ID,
        faction: snapshot.faction,
        deck: [],
        hand: snapshot.hand as Card[],
        discard: [],
        ip: snapshot.ip,
        states: Array.from(normalizedPlayerStates),
        activeEditorId: resolvePlayerEditorId(snapshot),
      },
      [AI_ID]: {
        id: AI_ID,
        faction: snapshot.faction === 'truth' ? 'government' : 'truth',
        deck: [],
        hand: snapshot.aiHand as Card[],
        discard: [],
        ip: snapshot.aiIP,
        states: Array.from(normalizedAiStates),
        activeEditorId: resolveAiEditorId(snapshot),
      },
    },
    pressureByState,
    stateDefense,
    playsThisTurn: 0,
    turnPlays: [],
    turnBuffer: [],
    log,
    headlineLog: [],
    extraExtraFeed: [],
    traps: [],
    persistentEffects: [],
    winner: null,
    victoryType: null,
    finalEdition: null,
  };
};

const defaultAchievementTracker: AchievementTracker = {
  stats: {
    total_states_controlled: 0,
    max_states_controlled_single_game: 0,
    max_ip_reached: 0,
    max_truth_reached: 0,
    min_truth_reached: 100,
  },
  updateStats: () => {
    /* no-op */
  },
};

export function resolveCardMVP(
  gameState: GameSnapshot,
  card: GameCard,
  targetState: string | null,
  actor: CardActor,
  achievements: AchievementTracker = defaultAchievementTracker,
  mediaOptions: MediaResolutionOptions = {},
): CardPlayResolution {
  const counterOutcome = detectCounterOutcome(gameState, card);
  if (counterOutcome.countered) {
    const baseStates = gameState.states.map(state => ({ ...state }));
    const baseControlled = Array.from(gameState.controlledStates);
    const baseAiControlled = Array.from(gameState.aiControlledStates ?? []);
    const logEntry = counterOutcome.message
      ?? `${card.name} was countered before its effects could resolve.`;
    return {
      ip: gameState.ip,
      aiIP: gameState.aiIP,
      truth: gameState.truth,
      states: baseStates,
      controlledStates: baseControlled,
      aiControlledStates: baseAiControlled,
      capturedStateIds: [],
      targetState: null,
      selectedCard: null,
      logEntries: [logEntry],
      damageDealt: 0,
      countered: true,
    };
  }

  const engineLog: string[] = [];
  const engineState = toEngineState(gameState, engineLog);
  const ownerId = actor === 'human' ? PLAYER_ID : AI_ID;
  const opponentId = ownerId === PLAYER_ID ? AI_ID : PLAYER_ID;
  const comboEffects = gameState.stateCombinationEffects ?? createDefaultCombinationEffects();
  const revealsSecretAgenda =
    actor === 'human' &&
    Boolean((card.effects as { revealSecretAgenda?: boolean } | undefined)?.revealSecretAgenda);

  engineState.players[ownerId] = {
    ...engineState.players[ownerId],
    ip: Math.max(0, engineState.players[ownerId].ip - card.cost),
  };

  const beforeState = cloneGameState(engineState);
  const targetStateId = resolveTargetStateId(gameState, targetState);

  let effectiveCard: GameCard = card;

  if (actor === 'human' && comboEffects.attackIpBonus > 0 && card.type === 'ATTACK') {
    const extraDamage = comboEffects.attackIpBonus;
    const existingEffects = card.effects ?? {};
    const updatedIpDelta = {
      ...(existingEffects.ipDelta ?? {}),
      opponent: ((existingEffects.ipDelta?.opponent ?? 0) as number) + extraDamage,
    };
    const updatedEffects = { ...existingEffects, ipDelta: updatedIpDelta };
    effectiveCard = { ...card, effects: updatedEffects };
  }

  if (
    actor === 'ai' &&
    comboEffects.incomingPressureReduction > 0 &&
    card.type === 'ZONE' &&
    targetStateId
  ) {
    const targetStateData = gameState.states.find(candidate =>
      candidate.id === targetStateId || candidate.abbreviation === targetStateId,
    );
    const targetOwnedByPlayer = targetStateData?.owner === 'player' ||
      gameState.controlledStates.includes(targetStateData?.abbreviation ?? '');

    if (targetStateData && targetOwnedByPlayer) {
      const reduction = comboEffects.incomingPressureReduction;
      const existingEffects = effectiveCard.effects ?? {};
      const basePressure = (existingEffects.pressureDelta ?? 0) as number;
      if (basePressure > 0) {
        const adjustedPressure = Math.max(0, basePressure - reduction);
        if (adjustedPressure !== basePressure) {
          const updatedEffects = { ...existingEffects, pressureDelta: adjustedPressure };
          effectiveCard = { ...effectiveCard, effects: updatedEffects };
        }
      }
    }
  }

  let mediaOptionsWithCombos = mediaOptions;
  if (actor === 'human' && card.type === 'MEDIA' && comboEffects.truthSwingMultiplier > 1) {
    mediaOptionsWithCombos = {
      ...mediaOptions,
      truthMultiplier: comboEffects.truthSwingMultiplier,
      truthMultiplierSource: 'Academic Elite',
    };
  }

  applyEffectsMvp(engineState, ownerId, effectiveCard as Card, targetStateId, mediaOptionsWithCombos);
  auditGameState(engineState);

  const logEntries: string[] = engineLog.map(message => `${card.name}: ${message}`);
  let syncedEngineLogLength = engineLog.length;
  const flushEngineLog = () => {
    while (syncedEngineLogLength < engineLog.length) {
      logEntries.push(`${card.name}: ${engineLog[syncedEngineLogLength++]}`);
    }
  };
  const newStates = gameState.states.map(state => ({ ...state }));
  const nextControlledStates = new Set(gameState.controlledStates);
  const nextAiControlledStates = new Set(gameState.aiControlledStates ?? []);
  let capturedCount = 0;
  const capturedStateIds: string[] = [];
  let nextTargetState: string | null = actor === 'human' && card.type === 'ZONE' ? targetState : null;
  const resolvedHotspots: string[] = [];
  const hotspotResolutions: CardHotspotResolution[] = [];
  let truthBonusFromHotspots = 0;
  let emittedSelfCaptureBanter = false;
  let emittedOpponentCaptureBanter = false;
  let emittedSelfLossBanter = false;
  let emittedOpponentLossBanter = false;
  for (const state of newStates) {
    const beforePressurePlayer = beforeState.pressureByState[state.id]?.[PLAYER_ID] ?? 0;
    const afterPressurePlayer = engineState.pressureByState[state.id]?.[PLAYER_ID] ?? 0;
    const beforePressureAi = beforeState.pressureByState[state.id]?.[AI_ID] ?? 0;
    const afterPressureAi = engineState.pressureByState[state.id]?.[AI_ID] ?? 0;
    const playerOwns = engineState.players[PLAYER_ID].states.includes(state.id);
    const aiOwns = engineState.players[AI_ID].states.includes(state.id);

    const previousOwner = state.owner;
    const owner: StateOwner = playerOwns ? 'player' : aiOwns ? 'ai' : 'neutral';

    state.owner = owner;
    state.pressurePlayer = afterPressurePlayer;
    state.pressureAi = afterPressureAi;
    state.pressure = Math.max(afterPressurePlayer, afterPressureAi);
    const isContested = afterPressurePlayer > 0 && afterPressureAi > 0;
    state.contested = previousOwner !== owner ? false : isContested;

    if (owner === 'player') {
      nextControlledStates.add(state.abbreviation);
      nextAiControlledStates.delete(state.abbreviation);
    } else if (owner === 'ai') {
      nextControlledStates.delete(state.abbreviation);
      nextAiControlledStates.add(state.abbreviation);
    } else {
      nextControlledStates.delete(state.abbreviation);
      nextAiControlledStates.delete(state.abbreviation);
    }

    if (previousOwner !== 'player' && owner === 'player') {
      capturedCount += 1;
      capturedStateIds.push(state.id);
      setStateOccupation(state, gameState.faction, { id: card.id, name: card.name }, false);
      logEntries.push(`🚨 ${card.name} captured ${state.name}!`);
      if (targetStateId === state.id) {
        nextTargetState = null;
      }
      if (!emittedSelfCaptureBanter) {
        emittedSelfCaptureBanter = true;
        queueBanterForTrigger(gameState, getStateChangeTrigger('captured', 'self'));
      }
      if (previousOwner === 'ai' && !emittedOpponentLossBanter) {
        emittedOpponentLossBanter = true;
        queueBanterForTrigger(gameState, getStateChangeTrigger('lost', 'opponent'));
      }
    } else if (previousOwner !== 'ai' && owner === 'ai') {
      const aiFaction = gameState.faction === 'truth' ? 'government' : 'truth';
      capturedStateIds.push(state.id);
      setStateOccupation(state, aiFaction, { id: card.id, name: card.name }, false);
      logEntries.push(`⚠️ ${card.name} seized ${state.name} for the enemy!`);
      if (targetStateId === state.id) {
        nextTargetState = null;
      }
      if (!emittedOpponentCaptureBanter) {
        emittedOpponentCaptureBanter = true;
        queueBanterForTrigger(gameState, getStateChangeTrigger('captured', 'opponent'));
      }
      if (previousOwner === 'player' && !emittedSelfLossBanter) {
        emittedSelfLossBanter = true;
        queueBanterForTrigger(gameState, getStateChangeTrigger('lost', 'self'));
      }
    } else if (previousOwner === 'player' && owner === 'neutral') {
      if (!emittedSelfLossBanter) {
        emittedSelfLossBanter = true;
        queueBanterForTrigger(gameState, getStateChangeTrigger('lost', 'self'));
      }
    } else if (previousOwner === 'ai' && owner === 'neutral') {
      if (!emittedOpponentLossBanter) {
        emittedOpponentLossBanter = true;
        queueBanterForTrigger(gameState, getStateChangeTrigger('lost', 'opponent'));
      }
    } else if (targetStateId === state.id && card.type === 'ZONE') {
      const deltaPlayer = afterPressurePlayer - beforePressurePlayer;
      const deltaAi = afterPressureAi - beforePressureAi;
      if (actor === 'human' && deltaPlayer !== 0) {
        logEntries.push(
          `${card.name} added pressure to ${state.name} (${deltaPlayer > 0 ? '+' : ''}${deltaPlayer}, ${afterPressurePlayer}/${state.defense})`,
        );
      } else if (actor === 'ai' && deltaAi !== 0) {
        logEntries.push(
          `${card.name} increased enemy pressure on ${state.name} (${deltaAi > 0 ? '+' : ''}${deltaAi}, ${afterPressureAi}/${state.defense})`,
        );
      }
    }

    const hotspot = state.paranormalHotspot;
    if (hotspot && previousOwner !== owner && owner !== 'neutral') {
      const captureFaction: 'truth' | 'government' = owner === 'player'
        ? gameState.faction
        : gameState.faction === 'truth'
          ? 'government'
          : 'truth';
      const fallbackReward = Number.isFinite(hotspot.truthReward) ? hotspot.truthReward : undefined;
      const hotspotOutcome: HotspotResolutionOutcome = resolveParanormalHotspot(
        state.abbreviation ?? state.id,
        captureFaction,
        {
          stateId: state.id,
          stateAbbreviation: state.abbreviation,
          fallbackTruthReward: fallbackReward,
          hotspotKind: hotspot.kind,
        },
      );
      const directionalDelta = hotspotOutcome.truthDelta;
      let actualTruthDelta = 0;
      if (directionalDelta !== 0) {
        const beforeTruth = engineState.truth;
        applyTruthDelta(engineState, directionalDelta, owner === 'player' ? 'human' : 'ai');
        flushEngineLog();
        const actualDelta = engineState.truth - beforeTruth;
        truthBonusFromHotspots += actualDelta;
        actualTruthDelta = actualDelta;
        if (actualDelta !== 0) {
          logEntries.push(
            `👻 ${hotspot.label} resolved in ${state.name}! Truth ${actualDelta > 0 ? '+' : ''}${actualDelta}.`,
          );
        } else {
          logEntries.push(`👻 ${hotspot.label} resolved in ${state.name}!`);
        }
      } else {
        logEntries.push(`👻 ${hotspot.label} resolved in ${state.name}!`);
      }

      const adjustedDefense = Math.max(1, state.defense - hotspot.defenseBoost);
      state.defense = Math.max(1, adjustedDefense);
      const resolvedSummary: StateParanormalHotspotSummary = {
        id: hotspot.id,
        label: hotspot.label,
        resolvedOnTurn: gameState.turn,
        faction: captureFaction,
        truthDelta: actualTruthDelta,
      };
      recordParanormalHotspotResolution(state, resolvedSummary);
      state.paranormalHotspot = undefined;
      resolvedHotspots.push(state.abbreviation);
      hotspotResolutions.push({
        stateId: state.id,
        stateAbbreviation: state.abbreviation,
        stateName: state.name,
        hotspotId: hotspot.id,
        label: hotspot.label,
        defenseBoost: hotspot.defenseBoost,
        truthReward: hotspotOutcome.finalReward,
        truthDelta: actualTruthDelta,
        expectedTruthDelta: hotspotOutcome.truthDelta,
        faction: captureFaction,
        source: hotspot.source,
      });
    }
  }

  const playerIPAfterEffects = engineState.players[PLAYER_ID].ip;
  const aiIPAfterEffects = engineState.players[AI_ID].ip;
  flushEngineLog();
  const truthAfterEffects = engineState.truth;
  const damageDealt = Math.max(0, beforeState.players[opponentId].ip - engineState.players[opponentId].ip);

  const adjustedStates = applyDefenseBonusToStates(newStates, comboEffects.stateDefenseBonus);

  if (actor === 'human') {
    const achievementUpdates: Partial<PlayerStats> = {
      max_ip_reached: Math.max(achievements.stats.max_ip_reached, playerIPAfterEffects),
      max_truth_reached: Math.max(achievements.stats.max_truth_reached, truthAfterEffects),
      min_truth_reached: Math.min(achievements.stats.min_truth_reached, truthAfterEffects),
    };

    if (capturedCount > 0) {
      achievementUpdates.total_states_controlled = achievements.stats.total_states_controlled + capturedCount;
      achievementUpdates.max_states_controlled_single_game = Math.max(
        achievements.stats.max_states_controlled_single_game,
        nextControlledStates.size,
      );
    }

    achievements.updateStats(achievementUpdates);
  }

  return {
    ip: playerIPAfterEffects,
    aiIP: aiIPAfterEffects,
    truth: truthAfterEffects,
    states: adjustedStates,
    controlledStates: Array.from(nextControlledStates),
    aiControlledStates: Array.from(nextAiControlledStates),
    capturedStateIds,
    targetState: actor === 'human' ? nextTargetState : (gameState as any).targetState,
    selectedCard: null,
    logEntries,
    damageDealt,
    aiSecretAgendaRevealed: revealsSecretAgenda,
    resolvedHotspots: resolvedHotspots.length > 0 ? resolvedHotspots : undefined,
    hotspotResolutions: hotspotResolutions.length > 0 ? hotspotResolutions : undefined,
  };
}

export function resolveCardEffects(
  gameState: GameSnapshot,
  card: GameCard,
  targetState: string | null,
  achievements: AchievementTracker = defaultAchievementTracker,
  mediaOptions: MediaResolutionOptions = {},
): CardPlayResolution {
  return resolveCardMVP(gameState, card, targetState, 'human', achievements, mediaOptions);
}
export const recordParanormalHotspotResolution = (
  state: StateForResolution,
  summary: StateParanormalHotspotSummary,
) => {
  const existingHistory = Array.isArray(state.paranormalHotspotHistory)
    ? state.paranormalHotspotHistory
    : [];
  state.paranormalHotspotHistory = trimParanormalHotspotHistory([
    ...existingHistory,
    summary,
  ]);
};

