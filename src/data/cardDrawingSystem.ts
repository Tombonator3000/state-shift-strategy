export type DrawMode = 'standard' | 'classic' | 'momentum' | 'catchup' | 'fast';

export interface DrawModeConfig {
  name: string;
  description: string;
  startingHandSize: number;
  baseDrawPerTurn: number;
  minHandGuarantee: number;
  midgameRampTurn: number;
  midgameExtraDraw: number;
  specialRules: string[];
}

export const DRAW_MODE_CONFIGS: Record<DrawMode, DrawModeConfig> = {
  standard: {
    name: 'Standard',
    description: 'Balanced draw system with safety nets',
    startingHandSize: 4,
    baseDrawPerTurn: 1,
    minHandGuarantee: 3,
    midgameRampTurn: 8,
    midgameExtraDraw: 1,
    specialRules: [
      'Draw up to 3 cards if hand < 3 at turn start',
      'From turn 8: +1 extra draw per turn'
    ]
  },
  classic: {
    name: 'Classic CCG',
    description: 'Traditional card game style',
    startingHandSize: 4,
    baseDrawPerTurn: 1,
    minHandGuarantee: 0,
    midgameRampTurn: 999,
    midgameExtraDraw: 0,
    specialRules: [
      'Mulligan available at start',
      'Steady 1 card per turn'
    ]
  },
  momentum: {
    name: 'Early Momentum',
    description: 'Fast start, slower mid-game',
    startingHandSize: 5,
    baseDrawPerTurn: 2,
    minHandGuarantee: 2,
    midgameRampTurn: 4,
    midgameExtraDraw: -1, // reduces to 1 per turn
    specialRules: [
      'Start with 5 cards',
      '2 cards/turn for turns 1-3',
      '1 card/turn from turn 4+'
    ]
  },
  catchup: {
    name: 'Catch-Up Mechanics',
    description: 'Rewards conservative play',
    startingHandSize: 4,
    baseDrawPerTurn: 1,
    minHandGuarantee: 2,
    midgameRampTurn: 999,
    midgameExtraDraw: 0,
    specialRules: [
      'If no cards played last turn: +1 draw',
      'Minimum 2 cards in hand'
    ]
  },
  fast: {
    name: 'Fast Mode',
    description: 'High-tempo matches',
    startingHandSize: 5,
    baseDrawPerTurn: 2,
    minHandGuarantee: 3,
    midgameRampTurn: 999,
    midgameExtraDraw: 0,
    specialRules: [
      'Always draw 2 cards per turn',
      'Shorter, more action-packed games'
    ]
  }
};

export interface CardDrawState {
  cardsPlayedLastTurn: number;
  lastTurnWithoutPlay: boolean;
}

export function calculateCardDraw(
  mode: DrawMode,
  currentTurn: number,
  currentHandSize: number,
  maxHandSize: number,
  drawState: CardDrawState,
  bonusCardDraw: number = 0
): number {
  const config = DRAW_MODE_CONFIGS[mode];
  let totalDraw = 0;

  // Base draw calculation
  let baseDraw = config.baseDrawPerTurn;

  // Momentum mode special logic
  if (mode === 'momentum' && currentTurn >= config.midgameRampTurn) {
    baseDraw += config.midgameExtraDraw;
  }

  // Standard/Fast mode midgame ramp
  if ((mode === 'standard' || mode === 'fast') && currentTurn >= config.midgameRampTurn) {
    baseDraw += config.midgameExtraDraw;
  }

  // Catch-up mode special rule
  if (mode === 'catchup' && drawState.lastTurnWithoutPlay) {
    baseDraw += 1;
  }

  totalDraw += baseDraw;

  // Minimum hand guarantee
  const minHandShortfall = Math.max(0, config.minHandGuarantee - currentHandSize);
  totalDraw = Math.max(totalDraw, minHandShortfall);

  // Add any bonus draws (from events, etc.)
  totalDraw += bonusCardDraw;

  // Respect hand size limit
  const maxDrawable = maxHandSize - currentHandSize;
  totalDraw = Math.min(totalDraw, maxDrawable);

  return Math.max(0, totalDraw);
}

export function getStartingHandSize(mode: DrawMode, faction?: 'government' | 'truth'): number {
  const config = DRAW_MODE_CONFIGS[mode];
  
  // Keep faction-based variance for balance
  if (faction === 'government') {
    return Math.max(3, config.startingHandSize - 1);
  }
  
  return config.startingHandSize;
}

export function shouldOfferMulligan(mode: DrawMode): boolean {
  return mode === 'classic';
}

// Statistics for dead turn analysis
export interface DrawingStats {
  deadTurns: number;
  totalTurns: number;
  averageHandSize: number;
  handSizeHistory: number[];
}

export function analyzeDrawingPerformance(stats: DrawingStats): {
  deadTurnRate: number;
  needsAdjustment: boolean;
  recommendation: string;
} {
  const deadTurnRate = stats.totalTurns > 0 ? stats.deadTurns / stats.totalTurns : 0;
  const midgameTurns = stats.handSizeHistory.slice(5, 10); // turns 6-10
  const avgMidgameHand = midgameTurns.length > 0 ? 
    midgameTurns.reduce((a, b) => a + b, 0) / midgameTurns.length : 0;

  let needsAdjustment = false;
  let recommendation = 'Draw system performing well';

  if (deadTurnRate > 0.15) {
    needsAdjustment = true;
    recommendation = 'High dead turn rate - consider Fast Mode or increasing base draw';
  } else if (avgMidgameHand < 2) {
    needsAdjustment = true;
    recommendation = 'Low midgame hand size - consider Momentum Mode or earlier ramp';
  }

  return {
    deadTurnRate,
    needsAdjustment,
    recommendation
  };
}
