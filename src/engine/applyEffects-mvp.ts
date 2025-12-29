declare const window: any;

import { computeMediaTruthDelta_MVP, warnIfMediaScaling, type MediaResolutionOptions } from '@/mvp/media';
import { applyTruthDelta } from '@/utils/truth';
import { getEditor as getAiEditor } from '@/ai/editors';
import type { CardEffects } from '@/rules/mvp';
import type {
  Card,
  EffectsATTACK,
  EffectsZONE,
  GameState,
  PlayerState,
} from '@/mvp/validator';
import { getEditorAggregatedEffects, getEditorById as lookupEditorById } from '@/game/editors';
import { resolveEffectiveMods } from '@/game/editorRuntimeModifiers';
import { ensureAiEditorSelected } from '@/game/aiEditorBinding';

export type PlayerId = 'P1' | 'P2';

const otherPlayer = (id: PlayerId): PlayerId => (id === 'P1' ? 'P2' : 'P1');

/**
 * Gets AI editor effective modifiers for a player if applicable.
 * Returns null if AI editors are disabled, player is not AI, or no editor is active.
 */
function getAiEditorMods(
  state: GameState,
  owner: PlayerId,
): { mediaTruthDelta?: number; zonePressureBonus?: number } | null {
  try {
    const expansions = (state as any)?.expansions;
    if (!(expansions?.aiEditors ?? true)) {
      return null;
    }

    const ownerState = (state.players as unknown as Record<string, any>)?.[owner];
    if (!ownerState?.isAI) {
      return null;
    }

    const activeId = ownerState?.activeEditor ?? ownerState?.activeEditorId;
    if (!activeId) {
      return null;
    }

    const editor = getAiEditor(activeId as any);
    if (!editor) {
      return null;
    }

    const difficulty = ((state as any)?.options?.difficulty ?? 'NORMAL') as any;
    return resolveEffectiveMods(editor, difficulty);
  } catch {
    return null;
  }
}

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

const applyIpDelta = (
  state: GameState,
  owner: PlayerId,
  target: PlayerId,
  delta: number,
  sourceLabel: string,
) => {
  if (!delta) {
    return;
  }
  const before = state.players[target].ip;
  const after = clampIP(before + delta);
  state.players[target].ip = after;
  const applied = after - before;
  if (applied !== 0) {
    const tag = target === owner ? 'self' : 'opponent';
    state.log.push(`${sourceLabel}: ${tag} IP ${applied >= 0 ? '+' : ''}${applied}`);
    if (typeof window !== 'undefined' && (window as any).uiToastIp) {
      (window as any).uiToastIp(target, applied);
    }
  }
};

const drawCards = (state: GameState, who: PlayerId, count: number) => {
  if (count <= 0) {
    return;
  }
  const target = state.players[who];
  const deck = [...target.deck];
  const hand = [...target.hand];
  const discard = [...target.discard];

  let remaining = Math.min(count, 9);
  while (remaining > 0 && deck.length > 0) {
    hand.push(deck.shift()!);
    remaining -= 1;
  }

  state.players[who] = { ...target, deck, hand, discard } satisfies PlayerState;
};

export function applyCardEffectsPayload(
  state: GameState,
  owner: PlayerId,
  effects: CardEffects | undefined,
  rng: () => number,
  sourceLabel = 'Effect',
): void {
  if (!effects) {
    return;
  }

  const opponent = otherPlayer(owner);

  if (typeof effects.truthDelta === 'number' && !Number.isNaN(effects.truthDelta)) {
    applyTruthDelta(state, effects.truthDelta, owner);
    state.log.push(
      `${sourceLabel}: Truth ${effects.truthDelta >= 0 ? '+' : ''}${effects.truthDelta}`,
    );
  }

  if (effects.ipDelta) {
    const { ipDelta } = effects;
    if (typeof ipDelta.self === 'number' && !Number.isNaN(ipDelta.self)) {
      applyIpDelta(state, owner, owner, Math.trunc(ipDelta.self), sourceLabel);
    }
    if (typeof ipDelta.opponent === 'number' && !Number.isNaN(ipDelta.opponent)) {
      applyIpDelta(state, owner, opponent, Math.trunc(ipDelta.opponent), sourceLabel);
    }
    if (typeof ipDelta.opponentPercent === 'number' && ipDelta.opponentPercent !== 0) {
      const before = state.players[opponent].ip;
      const percentDelta = Math.floor(before * ipDelta.opponentPercent);
      if (percentDelta !== 0) {
        applyIpDelta(state, owner, opponent, percentDelta, `${sourceLabel} (percent)`);
      }
    }
  }

  if (typeof effects.draw === 'number' && effects.draw > 0) {
    drawCards(state, owner, effects.draw);
    state.log.push(`${sourceLabel}: drew ${effects.draw}`);
  }

  if (typeof effects.discardOpponent === 'number' && effects.discardOpponent > 0) {
    discardRandom(state, opponent, effects.discardOpponent, rng);
    state.log.push(`${sourceLabel}: forced opponent discard ${effects.discardOpponent}`);
  }

  if (effects.revealSecretAgenda) {
    state.log.push(`${sourceLabel}: Revealed secret agenda`);
  }
}

const registerTrap = (state: GameState, owner: PlayerId, card: Card) => {
  const config = card.trapConfig;
  if (!config) {
    state.log.push(`${card.name}: missing trap configuration`);
    return;
  }

  state.traps = [
    ...state.traps,
    {
      owner,
      cardId: card.id,
      cardName: card.name,
      triggerOn: config.triggerOn,
      effects: { ...(config.effects ?? {}) },
      label: config.label,
      revealMessage: config.revealMessage,
    },
  ];

  state.log.push(`${card.name}: Trap armed (${config.label})`);
};

const registerPersistentEffect = (state: GameState, owner: PlayerId, card: Card) => {
  const config = card.persistentConfig;
  if (!config) {
    state.log.push(`${card.name}: missing persistent configuration`);
    return;
  }

  state.persistentEffects = [
    ...state.persistentEffects,
    {
      owner,
      cardId: card.id,
      cardName: card.name,
      remaining: config.duration,
      perTurnEffect: { ...(config.perTurnEffect ?? {}) },
      onExpire: config.onExpire ? { ...config.onExpire } : undefined,
      label: config.label,
      icon: config.icon,
    },
  ];

  state.log.push(
    `${card.name}: Persistent effect active for ${config.duration} turn${
      config.duration === 1 ? '' : 's'
    }`,
  );
};

type TrapTriggerEvent =
  | { kind: 'card_play'; owner: PlayerId; cardType: Card['type']; targetStateId?: string }
  | { kind: 'state_capture'; owner: PlayerId; stateId: string };

const shouldTriggerTrap = (trapTrigger: string, event: TrapTriggerEvent): boolean => {
  if (event.kind === 'card_play') {
    switch (trapTrigger) {
      case 'any_card':
        return true;
      case 'opponent_attack':
        return event.cardType === 'ATTACK';
      case 'opponent_media':
        return event.cardType === 'MEDIA';
      case 'opponent_zone':
        return event.cardType === 'ZONE';
      default:
        return false;
    }
  }
  if (event.kind === 'state_capture') {
    return trapTrigger === 'state_capture';
  }
  return false;
};

const triggerTraps = (state: GameState, event: TrapTriggerEvent, rng: () => number) => {
  if (state.traps.length === 0) {
    return;
  }

  const remaining: GameState['traps'] = [];
  for (const trap of state.traps) {
    if (trap.owner === event.owner) {
      remaining.push(trap);
      continue;
    }
    if (!shouldTriggerTrap(trap.triggerOn, event)) {
      remaining.push(trap);
      continue;
    }

    state.log.push(`${trap.label}: ${trap.revealMessage}`);
    applyCardEffectsPayload(state, trap.owner, trap.effects, rng, trap.label);
  }
  state.traps = remaining;
};

export const tickPersistentEffects = (
  state: GameState,
  owner: PlayerId,
  rng: () => number,
) => {
  if (state.persistentEffects.length === 0) {
    return;
  }

  const remaining: GameState['persistentEffects'] = [];
  for (const effect of state.persistentEffects) {
    if (effect.owner !== owner) {
      remaining.push(effect);
      continue;
    }

    applyCardEffectsPayload(state, owner, effect.perTurnEffect, rng, effect.label);
    const nextRemaining = effect.remaining - 1;
    if (nextRemaining <= 0) {
      if (effect.onExpire && Object.keys(effect.onExpire).length > 0) {
        applyCardEffectsPayload(state, owner, effect.onExpire, rng, `${effect.label} (expire)`);
      }
      state.log.push(`${effect.label}: expired`);
    } else {
      remaining.push({ ...effect, remaining: nextRemaining });
      state.log.push(`${effect.label}: ${nextRemaining} turn${nextRemaining === 1 ? '' : 's'} remaining`);
    }
  }

  state.persistentEffects = remaining;
};

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
  rng: () => number,
) {
  const opponent = otherPlayer(owner);
  const currentPressure = state.pressureByState[targetStateId] ?? { P1: 0, P2: 0 };
  const ownerControlsState = state.players[owner]?.states.includes(targetStateId);

  if (ownerControlsState) {
    if ((currentPressure[owner] ?? 0) !== 0) {
      state.pressureByState = {
        ...state.pressureByState,
        [targetStateId]: { ...currentPressure, [owner]: 0 },
      } satisfies GameState['pressureByState'];
    }
    state.log.push(`${owner} reinforces ${targetStateId} but already controls it—pressure remains at 0.`);
    return;
  }

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

  if (captured) {
    triggerTraps(state, { kind: 'state_capture', owner, stateId: targetStateId }, rng);
  }
}

function applyMediaEffect(
  state: GameState,
  owner: PlayerId,
  card: Card,
  opts: MediaResolutionOptions,
): void {
  const baseDelta = computeMediaTruthDelta_MVP(state.players[owner], card, opts);
  const multiplier = typeof opts.truthMultiplier === 'number' && opts.truthMultiplier > 0
    ? opts.truthMultiplier
    : 1;

  let delta = baseDelta;

  // Apply AI editor truth modifier
  const aiMods = getAiEditorMods(state, owner);
  if (aiMods?.mediaTruthDelta) {
    state.truth += aiMods.mediaTruthDelta;
  }

  // Apply multiplier scaling
  if (multiplier !== 1 && baseDelta !== 0) {
    const scaled = Math.round(Math.abs(baseDelta) * multiplier);
    delta = baseDelta >= 0 ? scaled : -scaled;
  }

  // Warn about media scaling issues
  warnIfMediaScaling(card, multiplier === 1 ? delta : baseDelta);

  // Apply player editor truth modifier
  const editor = lookupEditorById(state.players[owner]?.activeEditorId ?? undefined);
  if (editor) {
    const effects = getEditorAggregatedEffects(editor);
    if (effects.mediaTruthModifier) {
      delta += effects.mediaTruthModifier;
      state.log.push(
        `${owner} ${editor.name} adjusts MEDIA truth by ${effects.mediaTruthModifier > 0 ? '+' : ''}${effects.mediaTruthModifier}.`,
      );
    }
  }

  applyTruthDelta(state, delta, owner);

  // Log multiplier bonus if applicable
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
}

function computeZonePressureDelta(
  state: GameState,
  owner: PlayerId,
  basePressureDelta: number,
): number {
  let pressureDelta = basePressureDelta;

  // Apply AI editor zone pressure bonus
  const aiMods = getAiEditorMods(state, owner);
  if (aiMods?.zonePressureBonus) {
    pressureDelta += aiMods.zonePressureBonus;
  }

  // Apply player editor zone pressure bonus
  const editor = lookupEditorById(state.players[owner]?.activeEditorId ?? undefined);
  if (editor) {
    const effects = getEditorAggregatedEffects(editor);
    if (effects.zonePressureBonus) {
      const adjusted = Math.max(0, pressureDelta + effects.zonePressureBonus);
      if (adjusted !== pressureDelta) {
        pressureDelta = adjusted;
        state.log.push(
          `${owner} ${editor.name} adjusts ZONE pressure by ${effects.zonePressureBonus > 0 ? '+' : ''}${effects.zonePressureBonus}.`,
        );
      }
    }
  }

  return pressureDelta;
}

export function applyEffectsMvp(
  state: GameState,
  owner: PlayerId,
  card: Card,
  targetStateId?: string,
  opts: MediaResolutionOptions = {},
  rng: () => number = Math.random,
): GameState {
  ensureAiEditorSelected(state);
  if (!Array.isArray(state.traps)) {
    state.traps = [];
  }
  if (!Array.isArray(state.persistentEffects)) {
    state.persistentEffects = [];
  }
  triggerTraps(state, { kind: 'card_play', owner, cardType: card.type, targetStateId }, rng);

  if (card.type === 'TRAP') {
    registerTrap(state, owner, card);
    return state;
  }

  if (card.type === 'PERSISTENT') {
    registerPersistentEffect(state, owner, card);
    return state;
  }

  if (card.type === 'HYBRID') {
    applyCardEffectsPayload(state, owner, card.effects as CardEffects, rng, card.name);
    return state;
  }

  if (card.type === 'ATTACK') {
    applyAttackEffect(state, owner, card.effects as EffectsATTACK, rng);
    return state;
  }

  if (card.type === 'MEDIA') {
    applyMediaEffect(state, owner, card, opts);
    return state;
  }

  if (card.type === 'ZONE') {
    if (!targetStateId) {
      throw new Error('ZONE card requires a target state');
    }

    const zoneEffects = card.effects as EffectsZONE;
    const pressureDelta = computeZonePressureDelta(state, owner, zoneEffects.pressureDelta);
    applyZoneEffect(state, owner, { ...zoneEffects, pressureDelta }, targetStateId, rng);
    return state;
  }

  return state;
}
