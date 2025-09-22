declare const window: any;

import { computeMediaTruthDelta_MVP, warnIfMediaScaling, type MediaResolutionOptions } from '@/mvp/media';
import { recalculateCombinationEffects } from '@/mvp/combinationEffects';
import { applyTruthDelta } from '@/utils/truth';
import type {
  Card,
  EffectsATTACK,
  EffectsZONE,
  GameState,
  PlayerState,
} from '@/mvp/validator';

export type PlayerId = 'P1' | 'P2';

const otherPlayer = (id: PlayerId): PlayerId => (id === 'P1' ? 'P2' : 'P1');

export function clampIP(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.max(0, Math.floor(value));
}

export function discardRandom(
  state: GameState,
  who: PlayerId,
  count: number,
  rng: () => number,
): void {
  let remaining = Math.max(0, Math.floor(count));
  if (remaining <= 0) {
    return;
  }

  const target = state.players[who];
  const hand = [...target.hand];
  const discard = [...target.discard];

  while (remaining > 0 && hand.length > 0) {
    const index = Math.floor(rng() * hand.length);
    const [card] = hand.splice(index, 1);
    discard.push(card);
    remaining -= 1;
  }

  state.players[who] = {
    ...target,
    hand,
    discard,
  } satisfies PlayerState;
}

function getCombinationBreakdown(state: GameState, player: PlayerId) {
  if (!state.combinationEffects) {
    recalculateCombinationEffects(state);
  }
  return state.combinationEffects?.[player]?.breakdown;
}

function applyAttackEffect(
  state: GameState,
  owner: PlayerId,
  effects: EffectsATTACK,
  rng: () => number,
) {
  const opponent = otherPlayer(owner);
  const breakdown = getCombinationBreakdown(state, owner);
  const bonusDamage = breakdown?.attackDamageBonus ?? 0;
  const damage = Math.max(0, (effects.ipDelta?.opponent ?? 0) + bonusDamage);
  const before = state.players[opponent].ip;
  state.players[opponent].ip = clampIP(before - damage);
  const delta = state.players[opponent].ip - before;
  if (delta !== 0 && typeof window !== 'undefined' && (window as any).uiToastIp) {
    (window as any).uiToastIp(opponent, delta);
  }
  state.log.push(`Opponent loses ${damage} IP (${before} → ${state.players[opponent].ip})`);

  if ((effects.discardOpponent ?? 0) > 0) {
    discardRandom(state, opponent, effects.discardOpponent ?? 0, rng);
  }
}

function applyZoneEffect(
  state: GameState,
  owner: PlayerId,
  effects: EffectsZONE,
  targetStateId: string,
) {
  const opponent = otherPlayer(owner);
  const currentPressure = state.pressureByState[targetStateId] ?? { P1: 0, P2: 0 };
  const ownerBreakdown = getCombinationBreakdown(state, owner);
  const opponentBreakdown = getCombinationBreakdown(state, opponent);
  const bonusPressure = ownerBreakdown?.zonePressureBonus ?? 0;
  const resistance = opponentBreakdown?.incomingPressureReduction ?? 0;
  const appliedPressure = Math.max(0, effects.pressureDelta + bonusPressure - resistance);
  const updatedOwnerPressure = (currentPressure[owner] ?? 0) + appliedPressure;

  let pressureByState: GameState['pressureByState'] = {
    ...state.pressureByState,
    [targetStateId]: { ...currentPressure, [owner]: updatedOwnerPressure },
  };

  let updatedPlayers: Record<PlayerId, PlayerState> = {
    ...state.players,
    [owner]: { ...state.players[owner] },
    [opponent]: { ...state.players[opponent] },
  };

  const defenseBonus = opponentBreakdown?.stateDefenseBonus ?? 0;
  const defense = (state.stateDefense[targetStateId] ?? Infinity) + defenseBonus;
  const captured = updatedOwnerPressure >= defense;
  if (captured) {
    pressureByState = {
      ...pressureByState,
      [targetStateId]: { P1: 0, P2: 0 },
    };

    const ownerStates = new Set(updatedPlayers[owner].states);
    ownerStates.add(targetStateId);
    const opponentStates = updatedPlayers[opponent].states.filter(id => id !== targetStateId);

    updatedPlayers = {
      ...updatedPlayers,
      [owner]: {
        ...updatedPlayers[owner],
        states: Array.from(ownerStates),
      },
      [opponent]: {
        ...updatedPlayers[opponent],
        states: opponentStates,
      },
    };
  }

  state.players = updatedPlayers;
  state.pressureByState = pressureByState;

  if (captured && typeof window !== 'undefined' && (window as any).uiFlashState) {
    (window as any).uiFlashState(targetStateId, owner);
  }

  if (captured) {
    recalculateCombinationEffects(state);
  }
}

export function applyEffectsMvp(
  state: GameState,
  owner: PlayerId,
  card: Card,
  targetStateId?: string,
  opts: MediaResolutionOptions = {},
  rng: () => number = Math.random,
): GameState {
  if (card.type === 'ATTACK') {
    applyAttackEffect(state, owner, card.effects as EffectsATTACK, rng);
    return state;
  }

  if (card.type === 'MEDIA') {
    const baseDelta = computeMediaTruthDelta_MVP(state.players[owner], card, opts);
    const breakdown = getCombinationBreakdown(state, owner);
    let delta = baseDelta;
    if (breakdown) {
      delta *= breakdown.truthMultiplier;
      if (card.faction === 'government' && breakdown.governmentTruthBonus !== 0) {
        const adjustment = breakdown.governmentTruthBonus;
        delta += delta >= 0 ? adjustment : -adjustment;
      }
    }
    delta = Math.round(delta);
    warnIfMediaScaling(card, delta);
    applyTruthDelta(state, delta, owner);
    return state;
  }

  if (card.type === 'ZONE') {
    if (!targetStateId) {
      throw new Error('ZONE card requires a target state');
    }

    applyZoneEffect(state, owner, card.effects as EffectsZONE, targetStateId);
    return state;
  }

  return state;
}
