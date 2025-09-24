import type { GameCard } from '@/rules/mvp';
import type {
  EvidenceTrackState,
  GameState,
  PublicFrenzyState,
} from '@/hooks/gameStateTypes';

export const createEvidenceTrackState = (): EvidenceTrackState => ({
  exposeReady: false,
  exposeOwner: null,
  exposeTriggered: false,
  obfuscateReady: false,
  obfuscateOwner: null,
  obfuscateTriggered: false,
});

export const createPublicFrenzyState = (initialTruth: number = 50): PublicFrenzyState => ({
  value: 50,
  bonusHeadlineActiveFor: null,
  governmentInitiativeActiveFor: null,
  lastTruthSample: initialTruth,
  underReviewState: null,
});

const clamp = (value: number, min: number, max: number): number => {
  if (Number.isNaN(value)) {
    return min;
  }
  return Math.max(min, Math.min(max, value));
};

const TRUTH_THRESHOLD_EXPOSE = 70;
const TRUTH_THRESHOLD_OBFUSCATE = 30;
const EXPOSE_RESET_THRESHOLD = 60;
const OBFUSCATE_RESET_THRESHOLD = 40;
const FRENZY_TRUTH_SPIKE = 60;
const FRENZY_GOVERNMENT_LOCK = 40;
export const BASE_PLAY_LIMIT = 3;

const resolveTruthController = (state: GameState): { truth: 'human' | 'ai'; government: 'human' | 'ai' } => {
  const truth = state.faction === 'truth' ? 'human' : 'ai';
  return { truth, government: truth === 'human' ? 'ai' : 'human' };
};

interface TruthMomentumOptions {
  previousTruth: number;
  newTruth: number;
  state: GameState;
  actor: 'human' | 'ai';
  card?: GameCard;
}

export function withTruthMomentum(options: TruthMomentumOptions): GameState {
  const { previousTruth, newTruth, state } = options;
  const { truth: truthController, government: governmentController } = resolveTruthController(state);

  const evidence = state.evidenceTrack ? { ...state.evidenceTrack } : createEvidenceTrackState();
  const frenzy = state.publicFrenzy
    ? { ...state.publicFrenzy }
    : createPublicFrenzyState(previousTruth ?? 50);
  const log = [...(state.log ?? [])];

  const next: GameState = {
    ...state,
    log,
    evidenceTrack: evidence,
    publicFrenzy: frenzy,
  };

  // Evidence vs. Red Tape milestones
  if (!evidence.exposeTriggered && previousTruth < TRUTH_THRESHOLD_EXPOSE && newTruth >= TRUTH_THRESHOLD_EXPOSE) {
    evidence.exposeReady = true;
    evidence.exposeOwner = truthController;
    evidence.exposeTriggered = true;
    log.push('Expose! Evidence stash hits 70% — headline coupons unlocked.');
  } else if (evidence.exposeTriggered && newTruth <= EXPOSE_RESET_THRESHOLD) {
    evidence.exposeTriggered = false;
    if (!evidence.exposeReady) {
      evidence.exposeOwner = null;
    }
  }

  if (!evidence.obfuscateTriggered && previousTruth > TRUTH_THRESHOLD_OBFUSCATE && newTruth <= TRUTH_THRESHOLD_OBFUSCATE) {
    evidence.obfuscateReady = true;
    evidence.obfuscateOwner = governmentController;
    evidence.obfuscateTriggered = true;
    log.push('Obfuscate protocol engaged — red tape discount secured.');
  } else if (evidence.obfuscateTriggered && newTruth >= OBFUSCATE_RESET_THRESHOLD) {
    evidence.obfuscateTriggered = false;
    if (!evidence.obfuscateReady) {
      evidence.obfuscateOwner = null;
    }
  }

  // Public Frenzy momentum (react to ~10% truth swings)
  const truthDelta = newTruth - frenzy.lastTruthSample;
  const swingUnits = Math.trunc(truthDelta / 10);
  if (swingUnits !== 0) {
    const previousFrenzy = frenzy.value;
    const updated = clamp(previousFrenzy + swingUnits * 10, 0, 100);
    frenzy.value = updated;

    if (previousFrenzy < FRENZY_TRUTH_SPIKE && updated >= FRENZY_TRUTH_SPIKE) {
      frenzy.bonusHeadlineActiveFor = truthController;
      log.push('Public Frenzy erupts! Truth side gains a bonus headline slot.');
    }

    if (previousFrenzy > FRENZY_GOVERNMENT_LOCK && updated <= FRENZY_GOVERNMENT_LOCK) {
      frenzy.governmentInitiativeActiveFor = governmentController;
      frenzy.underReviewState = options.card?.targetState ?? null;
      log.push('Bureaucrats stamp UNDER REVIEW — government seizes initiative.');
    }
  }

  frenzy.lastTruthSample = newTruth;

  return next;
}

export const consumeExpose = (state: GameState, actor: 'human' | 'ai'): GameState => {
  if (!state.evidenceTrack.exposeReady || state.evidenceTrack.exposeOwner !== actor) {
    return state;
  }

  return {
    ...state,
    log: [...state.log, 'Expose! discount cashed in.'],
    evidenceTrack: {
      ...state.evidenceTrack,
      exposeReady: false,
      exposeOwner: null,
    },
  };
};

export const consumeObfuscate = (state: GameState, actor: 'human' | 'ai'): GameState => {
  if (!state.evidenceTrack.obfuscateReady || state.evidenceTrack.obfuscateOwner !== actor) {
    return state;
  }

  return {
    ...state,
    log: [...state.log, 'Obfuscate! paperwork bribes a fresh lead.'],
    evidenceTrack: {
      ...state.evidenceTrack,
      obfuscateReady: false,
      obfuscateOwner: null,
    },
  };
};

export const clearHeadlineBonus = (state: GameState, actor: 'human' | 'ai'): GameState => {
  if (state.publicFrenzy.bonusHeadlineActiveFor !== actor) {
    return state;
  }
  return {
    ...state,
    publicFrenzy: {
      ...state.publicFrenzy,
      bonusHeadlineActiveFor: null,
    },
  };
};

export const clearGovernmentInitiative = (state: GameState, actor: 'human' | 'ai'): GameState => {
  if (state.publicFrenzy.governmentInitiativeActiveFor !== actor) {
    return state;
  }
  return {
    ...state,
    publicFrenzy: {
      ...state.publicFrenzy,
      governmentInitiativeActiveFor: null,
      underReviewState: null,
    },
  };
};

export const getMaxPlaysForTurn = (state: GameState, actor: 'human' | 'ai'): number => {
  const bonus = state.publicFrenzy.bonusHeadlineActiveFor === actor ? 1 : 0;
  return BASE_PLAY_LIMIT + bonus;
};
