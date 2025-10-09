import type { GameOverReport, FrontPageArticle } from '@/types/finalEdition';

interface HeadlineContext {
  winner: GameOverReport['winner'];
  victoryType: GameOverReport['victoryType'];
  mvpCardName?: string;
  capturedStatesCount?: number;
  frontPage?: FrontPageArticle | null;
}

const TRUTH_VICTORY_HEADLINES = {
  truth: [
    'TRUTH BOMB DETONATES — COVER-UP COLLAPSES',
    'DISCLOSURE SHOCKWAVE SHATTERS GOVERNMENT LIES',
    'THEY TRIED TO HIDE IT — WE EXPOSED EVERYTHING',
    'TRUTH METER EXPLODES — OFFICIALS SCRAMBLE',
    'MASSIVE LEAK TRIGGERS NATIONWIDE AWAKENING',
  ],
  states: [
    'FIELD OPS STORM {count} STATES — OFFICIALS PANIC',
    '{count}-STATE SWEEP TRIGGERS MASS DISCLOSURE',
    'TRUTH NETWORK CONQUERS {count} STATES IN BLITZ',
    'UNSTOPPABLE: {count} STATES FALL TO TRUTH OPERATIVES',
    'GOVERNMENT LOSES {count} STATES — NARRATIVE CRUMBLES',
  ],
  ip: [
    'TRUTH OPERATIVES FLOOD THE AIRWAVES — IT\'S OVER',
    'BROADCAST BLITZ OVERWHELMS SHADOW GOVERNMENT',
    'TRUTH NETWORK DOMINATES — OFFICIALS CAN\'T STOP IT',
    'MASSIVE IP SURGE TRIGGERS DISCLOSURE CASCADE',
    'THEY COULDN\'T SILENCE US — WE WON THE AIRWAVES',
  ],
  agenda: [
    'SECRET PLAN EXPOSED — TRUTH OPERATIVES WIN',
    'COVERT AGENDA REVEALED — GOVERNMENT IN SHAMBLES',
    'THEY HAD A PLAN — WE EXPOSED IT ALL',
    'CLASSIFIED OPERATION BLOWN WIDE OPEN',
    'SECRET MISSION COMPLETE — TRUTH PREVAILS',
  ],
};

const GOV_VICTORY_HEADLINES = {
  truth: [
    'NARRATIVE LOCKDOWN COMPLETE — TRUTH SUPPRESSED',
    'GOVERNMENT CRUSHES RESISTANCE — SILENCE RESTORED',
    'SHADOW BUREAU WINS — DISCLOSURE DEAD',
    'TRUTH NETWORK NEUTRALIZED BY MASSIVE BLITZ',
    'COVER-UP SUCCEEDS — RESISTANCE SILENCED',
  ],
  states: [
    'GOVERNMENT RECAPTURES {count} STATES — ORDER RESTORED',
    'SHADOW FORCES SWEEP {count} STATES IN BRUTAL CRACKDOWN',
    '{count}-STATE OFFENSIVE CRUSHES TRUTH MOVEMENT',
    'GOVERNMENT RETAKES {count} STATES — RESISTANCE CRUMBLES',
    'BRUTAL SWEEP: {count} STATES FALL TO SHADOW GOVERNMENT',
  ],
  ip: [
    'GOVERNMENT COUNTER-NARRATIVE DOMINATES AIRWAVES',
    'SHADOW BUREAU WINS BROADCAST WAR — TRUTH SILENCED',
    'MASSIVE PROPAGANDA BLITZ OVERWHELMS RESISTANCE',
    'GOVERNMENT FLOODS AIRWAVES — DISCLOSURE DEAD',
    'COUNTER-INTEL SURGE CRUSHES TRUTH NETWORK',
  ],
  agenda: [
    'CLASSIFIED PLAN SUCCEEDS — RESISTANCE NEUTRALIZED',
    'SHADOW BUREAU EXECUTES SECRET OPERATION',
    'COVERT MISSION COMPLETE — TRUTH MOVEMENT DEAD',
    'SECRET AGENDA ACCOMPLISHED — NOBODY SAW IT COMING',
    'GOVERNMENT WINS — CLASSIFIED PLAN UNFOLDS',
  ],
};

const DRAW_HEADLINES = [
  'DEADLOCK! NEITHER SIDE BLINKS',
  'STALEMATE — BOTH CLAIM VICTORY',
  'IT\'S A TIE — CHAOS REIGNS',
  'GRIDLOCK! NO WINNER DECLARED',
  'FINAL ROUND ENDS IN SHOCKING DRAW',
];

const hashString = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
};

export const generateSensationalistHeadline = (context: HeadlineContext): string => {
  if (context.frontPage?.hed && context.frontPage.hed.length > 10) {
    return context.frontPage.hed.toUpperCase();
  }

  if (context.winner === 'draw') {
    const seed = hashString(`${context.victoryType}-draw`);
    return DRAW_HEADLINES[seed % DRAW_HEADLINES.length];
  }

  const templates = context.winner === 'truth'
    ? TRUTH_VICTORY_HEADLINES[context.victoryType]
    : GOV_VICTORY_HEADLINES[context.victoryType];

  if (!templates || templates.length === 0) {
    return context.winner === 'truth'
      ? 'TRUTH NETWORK WINS — GOVERNMENT IN SHAMBLES'
      : 'SHADOW GOVERNMENT CRUSHES RESISTANCE';
  }

  const seed = hashString(`${context.winner}-${context.victoryType}-${context.mvpCardName ?? 'unknown'}`);
  let headline = templates[seed % templates.length];

  if (headline.includes('{count}') && context.capturedStatesCount !== undefined) {
    headline = headline.replace('{count}', context.capturedStatesCount.toString());
  }

  return headline;
};
