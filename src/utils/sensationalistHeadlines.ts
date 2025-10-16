import type { GameOverReport, FrontPageArticle } from '@/types/finalEdition';
import type { CardArticle } from '@/news/articleBank';

interface HeadlineContext {
  winner: GameOverReport['winner'];
  victoryType: GameOverReport['victoryType'];
  mvpCardName?: string;
  mvpCardArticle?: CardArticle | null;
  runnerUpCardArticle?: CardArticle | null;
  capturedStatesCount?: number;
  frontPage?: FrontPageArticle | null;
  finalTruth?: number;
}

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

function seedPick<T>(arr: readonly T[], seed: string): T {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
  }
  return arr[Math.abs(h) % arr.length];
}

const TRUTH_VICTORY_VERBS = [
  'EXPOSES', 'BLOWS LID OFF', 'LEAKS', 'REVEALS', 'DETONATES',
  'TRIGGERS', 'STORMS', 'DOMINATES', 'FLOODS', 'SHOCKS'
];

const GOV_VICTORY_VERBS = [
  'NEUTRALIZES', 'CONTAINS', 'CLASSIFIES', 'REDACTS', 'SUPPRESSES',
  'LOCKS DOWN', 'SWEEPS', 'CRUSHES', 'CONTROLS', 'SILENCES'
];

const TRUTH_LOCATIONS = [
  'AREA 51', 'ROSWELL', 'BERMUDA TRIANGLE', 'OHIO', 'NEVADA',
  'THE PENTAGON', 'SECRET FACILITY', 'CLASSIFIED ZONE', 'MOON BASE'
];

const GOV_EUPHEMISMS = [
  'ROUTINE TRAINING EXERCISE', 'ADMINISTRATIVE TEST', 'BENIGN ANOMALY',
  'LOCALIZED PHENOMENON', 'STANDARD PROCEDURE', 'SCHEDULED MAINTENANCE',
  'TECHNICAL ADJUSTMENT', 'WEATHER BALLOON', 'SWAMP GAS'
];

function generateCoherentHeadline(context: HeadlineContext): string {
  const { winner, victoryType, mvpCardArticle, runnerUpCardArticle, mvpCardName, capturedStatesCount, finalTruth } = context;
  const seed = `${winner}-${victoryType}-${mvpCardName ?? 'unknown'}`;

  // Extract elements from articles if available
  const mvpHeadline = mvpCardArticle?.headline?.toUpperCase() || mvpCardName?.toUpperCase() || 'CLASSIFIED';
  const mvpTags = mvpCardArticle?.tags || [];
  const runnerUpHeadline = runnerUpCardArticle?.headline?.toUpperCase();
  
  // Find paranormal subject matter
  const paranormalTags = ['alien', 'ufo', 'ghost', 'cryptid', 'bigfoot', 'mothman', 'chupacabra'];
  const foundSubject = mvpTags.find(tag => paranormalTags.includes(tag.toLowerCase()));
  const subject = foundSubject ? foundSubject.toUpperCase() : seedPick(TRUTH_LOCATIONS, seed);

  if (winner === 'truth') {
    const verb = seedPick(TRUTH_VICTORY_VERBS, seed);
    
    if (victoryType === 'states' && capturedStatesCount) {
      return `${mvpHeadline} ${verb} ${capturedStatesCount} STATES • ${subject} FILES LEAK — OFFICIALS SCRAMBLE`;
    }
    
    if (victoryType === 'truth' && finalTruth !== undefined) {
      return `${mvpHeadline} ${verb} • TRUTH METER HITS ${Math.round(finalTruth)}% — COVER-UP COLLAPSES`;
    }
    
    if (victoryType === 'ip') {
      return `${mvpHeadline} FLOODS AIRWAVES • ${subject} EXPOSED — GOVERNMENT CAN'T STOP IT`;
    }
    
    if (victoryType === 'agenda') {
      const secondVerb = seedPick(TRUTH_VICTORY_VERBS, seed + '2');
      if (runnerUpHeadline) {
        return `${mvpHeadline} ${verb} • ${runnerUpHeadline} ${secondVerb} — SECRET PLAN REVEALED`;
      }
      return `${mvpHeadline} ${verb} SECRET AGENDA • ${subject} FILES LEAK — IT'S ALL TRUE`;
    }
  } else if (winner === 'government') {
    const verb = seedPick(GOV_VICTORY_VERBS, seed);
    const euphemism = seedPick(GOV_EUPHEMISMS, seed);
    
    if (victoryType === 'states' && capturedStatesCount) {
      return `INTERNAL MEMO: ${euphemism} • ${subject} AREA CLOSURE • ${capturedStatesCount} STATES SECURED — OFFICIAL STORY HOLDS`;
    }
    
    if (victoryType === 'truth') {
      return `${euphemism} • ${subject} REPORTS DISMISSED • ${mvpHeadline} ${verb} — NOTHING TO SEE HERE`;
    }
    
    if (victoryType === 'ip') {
      return `OFFICIAL STATEMENT: ${euphemism} • ${subject} ADVISORY LIFTED • NARRATIVE ${verb} — SOURCE: 'THIS IS FINE'`;
    }
    
    if (victoryType === 'agenda') {
      if (runnerUpHeadline) {
        return `CLASSIFIED: ${euphemism} • ${mvpHeadline} ${verb} • ${runnerUpHeadline} CONTAINED — MISSION ACCOMPLISHED`;
      }
      return `${euphemism} • ${subject} INCIDENT RESOLVED • ${mvpHeadline} ${verb} — ALL ACCORDING TO PLAN`;
    }
  }

  // Fallback
  return winner === 'truth'
    ? `${mvpHeadline} TRIGGERS MASS AWAKENING — TRUTH NETWORK WINS`
    : `OFFICIAL STORY HOLDS — ${mvpHeadline} CONTAINED`;
}

export const generateSensationalistHeadline = (context: HeadlineContext): string => {
  // Use custom front page headline if available
  if (context.frontPage?.hed && context.frontPage.hed.length > 10) {
    return context.frontPage.hed.toUpperCase();
  }

  // Handle draw
  if (context.winner === 'draw') {
    const seed = hashString(`${context.victoryType}-draw`);
    return DRAW_HEADLINES[seed % DRAW_HEADLINES.length];
  }

  // Generate coherent headline from articles
  if (context.mvpCardArticle || context.mvpCardName) {
    return generateCoherentHeadline(context);
  }

  // Final fallback
  return context.winner === 'truth'
    ? 'TRUTH NETWORK WINS — GOVERNMENT IN SHAMBLES'
    : 'SHADOW GOVERNMENT CRUSHES RESISTANCE';
};
