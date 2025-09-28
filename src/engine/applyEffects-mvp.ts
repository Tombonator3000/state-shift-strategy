declare const window: any;

import { computeMediaTruthDelta_MVP, warnIfMediaScaling, type MediaResolutionOptions } from '@/mvp/media';
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

function applyAttackEffect(
  state: GameState,
  owner: PlayerId,
  effects: EffectsATTACK,
  rng: () => number,
) {
  const opponent = otherPlayer(owner);
  const before = state.players[opponent].ip;
  const flatDamage = Math.max(0, effects.ipDelta?.opponent ?? 0);
  const percentFactor = Math.max(0, Math.min(1, effects.ipDelta?.opponentPercent ?? 0));
  const percentDamage = percentFactor > 0 ? Math.floor(before * percentFactor) : 0;
  const baseDamage = flatDamage + percentDamage;

  const attacker = state.players[owner];
  const buff = attacker.nextAttackMultiplier;
  const multiplier = typeof buff === 'number' && buff > 0 ? buff : undefined;
  const damage = multiplier ? Math.max(0, Math.floor(baseDamage * multiplier)) : baseDamage;
  const after = clampIP(before - damage);
  state.players[opponent].ip = after;
  if (typeof buff !== 'undefined') {
    state.players[owner] = { ...attacker, nextAttackMultiplier: undefined } satisfies PlayerState;
  }
  const delta = after - before;
  if (delta !== 0 && typeof window !== 'undefined' && (window as any).uiToastIp) {
    (window as any).uiToastIp(opponent, delta);
  }
  const components: string[] = [];
  components.push(`flat ${flatDamage}`);
  components.push(`scaled ${percentDamage}`);
  if (multiplier) {
    components.push(`combo x${multiplier}`);
  }
  state.log.push(
    `Opponent loses ${damage} IP (${before} → ${after}) [${components.join(', ')}]`,
  );

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
  const updatedOwnerPressure = (currentPressure[owner] ?? 0) + effects.pressureDelta;

  let pressureByState: GameState['pressureByState'] = {
    ...state.pressureByState,
    [targetStateId]: { ...currentPressure, [owner]: updatedOwnerPressure },
  };

  let updatedPlayers: Record<PlayerId, PlayerState> = {
    ...state.players,
    [owner]: { ...state.players[owner] },
    [opponent]: { ...state.players[opponent] },
  };

  const defense = state.stateDefense[targetStateId] ?? Infinity;
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
    const multiplier = typeof opts.truthMultiplier === 'number' && opts.truthMultiplier > 0
      ? opts.truthMultiplier
      : 1;
    const delta = multiplier === 1 ? baseDelta : Math.round(baseDelta * multiplier);

    if (multiplier === 1) {
      warnIfMediaScaling(card, delta);
    } else {
      warnIfMediaScaling(card, baseDelta);
    }

    applyTruthDelta(state, delta, owner);

    if (multiplier !== 1 && baseDelta !== 0) {
      const bonus = delta - baseDelta;
      if (bonus !== 0) {
        const formattedMultiplier = Number.isInteger(multiplier)
          ? multiplier.toFixed(0)
          : multiplier.toFixed(2).replace(/\.0+$|0+$/, '');
        const sourceLabel = opts.truthMultiplierSource ?? 'State combination';
        state.log.push(
          `${sourceLabel} amplifies MEDIA truth swing by ${bonus > 0 ? '+' : ''}${bonus} (x${formattedMultiplier})`,
        );
      }
    }

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
