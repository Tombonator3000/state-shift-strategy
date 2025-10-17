// Enhanced AI Personality System with distinct playstyles and banter
import type { AIDifficulty } from './aiStrategy';

export interface AIPersona {
  id: string;
  name: string;
  title: string;
  description: string;
  difficulty: AIDifficulty;
  
  // Playstyle traits (0-1 scale)
  aggressiveness: number;      // Prefers ATTACK cards
  defensiveness: number;        // Prefers DEFENSIVE/ZONE cards
  territorial: number;          // Focuses on state control
  truthFocused: number;         // Prioritizes Truth meter
  economical: number;           // Focuses on IP generation
  riskTolerance: number;        // Willing to take risks
  comboAwareness: number;       // Seeks card synergies
  
  // Strategic preferences
  priorityTargets: string[];    // Preferred states to target
  cardTypePriority: Array<'MEDIA' | 'ZONE' | 'ATTACK' | 'TECH' | 'DEFENSIVE'>;
  
  // Banter personality
  banterStyle: 'scientific' | 'bureaucratic' | 'passionate' | 'smug' | 'cryptic';
  taunts: string[];
  defeats: string[];
  victories: string[];
}

export const AI_PERSONAS: Record<string, AIPersona> = {
  skeptic: {
    id: 'skeptic',
    name: 'Dr. Margaret Chen',
    title: 'The Skeptic',
    description: 'A methodical scientist who questions everything and relies on data over intuition.',
    difficulty: 'easy',
    
    aggressiveness: 0.2,
    defensiveness: 0.7,
    territorial: 0.4,
    truthFocused: 0.8,
    economical: 0.5,
    riskTolerance: 0.3,
    comboAwareness: 0.4,
    
    priorityTargets: ['Massachusetts', 'California', 'New York'],
    cardTypePriority: ['MEDIA', 'TECH', 'DEFENSIVE', 'ZONE', 'ATTACK'],
    
    banterStyle: 'scientific',
    taunts: [
      'Correlation does not imply causation.',
      'Your hypothesis lacks empirical support.',
      'Let me show you what the data actually says.',
      'Anecdotal evidence is not evidence.',
      'Interesting theory. Completely wrong, but interesting.',
    ],
    defeats: [
      'The data was... inconclusive.',
      'I need to recalibrate my methodology.',
      'Perhaps I should have considered alternative variables.',
    ],
    victories: [
      'As predicted by the statistical model.',
      'The results speak for themselves.',
      'Science wins again.',
    ],
  },

  operative: {
    id: 'operative',
    name: 'Agent Marcus Stone',
    title: 'The Operative',
    description: 'A balanced government agent who follows protocol but adapts to circumstances.',
    difficulty: 'medium',
    
    aggressiveness: 0.5,
    defensiveness: 0.5,
    territorial: 0.6,
    truthFocused: 0.4,
    economical: 0.6,
    riskTolerance: 0.5,
    comboAwareness: 0.6,
    
    priorityTargets: ['Texas', 'Florida', 'Pennsylvania'],
    cardTypePriority: ['ZONE', 'ATTACK', 'MEDIA', 'DEFENSIVE', 'TECH'],
    
    banterStyle: 'bureaucratic',
    taunts: [
      'Protocol demands a measured response.',
      'Your actions have been noted in the report.',
      'Standard operating procedure, nothing personal.',
      'Authorization confirmed. Proceeding with countermeasures.',
      'You are operating outside acceptable parameters.',
    ],
    defeats: [
      'Mission parameters were... suboptimal.',
      'Requesting immediate tactical support.',
      'This will require a full debriefing.',
    ],
    victories: [
      'Mission accomplished. Filing completion report.',
      'Target neutralized within acceptable timeframe.',
      'Operation concluded successfully.',
    ],
  },

  zealot: {
    id: 'zealot',
    name: 'Sarah "Prophet" Hayes',
    title: 'The Zealot',
    description: 'A passionate truth seeker who rushes aggressively toward territorial dominance.',
    difficulty: 'hard',
    
    aggressiveness: 0.8,
    defensiveness: 0.3,
    territorial: 0.9,
    truthFocused: 0.3,
    economical: 0.4,
    riskTolerance: 0.8,
    comboAwareness: 0.5,
    
    priorityTargets: ['Nevada', 'New Mexico', 'Arizona', 'Wyoming'],
    cardTypePriority: ['ZONE', 'ATTACK', 'TECH', 'MEDIA', 'DEFENSIVE'],
    
    banterStyle: 'passionate',
    taunts: [
      'THE TRUTH IS OUT THERE AND I WILL FIND IT!',
      'You cannot suppress what is REAL!',
      'Every state we take brings us closer to PROOF!',
      'They are hiding something and WE WILL EXPOSE IT!',
      'The cover-up ends TODAY!',
    ],
    defeats: [
      "They silenced us... for now. But we'll be back!",
      'The truth cannot be buried forever!',
      'This is only a temporary setback!',
    ],
    victories: [
      'WE DID IT! THE TRUTH PREVAILS!',
      'I KNEW IT! I ALWAYS KNEW IT!',
      'The conspiracy is EXPOSED!',
    ],
  },

  manipulator: {
    id: 'manipulator',
    name: 'Viktor Kline',
    title: 'The Manipulator',
    description: 'A master of psychological warfare who controls reality through media manipulation.',
    difficulty: 'hard',
    
    aggressiveness: 0.6,
    defensiveness: 0.4,
    territorial: 0.4,
    truthFocused: 0.9,
    economical: 0.7,
    riskTolerance: 0.6,
    comboAwareness: 0.8,
    
    priorityTargets: ['New York', 'California', 'Illinois'],
    cardTypePriority: ['MEDIA', 'TECH', 'ATTACK', 'ZONE', 'DEFENSIVE'],
    
    banterStyle: 'smug',
    taunts: [
      'Reality is what I say it is.',
      'Your perception is my playground.',
      'Watch as I reshape what people believe.',
      'The truth? A malleable concept, really.',
      'I control the narrative. You just live in it.',
    ],
    defeats: [
      'Hmm. An unexpected deviation from the script.',
      'Interesting. I may have underestimated you.',
      'A temporary loss of control. Nothing more.',
    ],
    victories: [
      'Exactly as I orchestrated.',
      'Did you really think you had a choice?',
      'Another mind successfully... influenced.',
    ],
  },

  director: {
    id: 'director',
    name: 'SIGMA-7',
    title: 'The Director',
    description: 'A cryptic master strategist who plans multiple turns ahead and speaks in code.',
    difficulty: 'insane',
    
    aggressiveness: 0.7,
    defensiveness: 0.7,
    territorial: 0.7,
    truthFocused: 0.7,
    economical: 0.8,
    riskTolerance: 0.7,
    comboAwareness: 0.9,
    
    priorityTargets: ['Washington', 'Virginia', 'Maryland'],
    cardTypePriority: ['TECH', 'MEDIA', 'ZONE', 'ATTACK', 'DEFENSIVE'],
    
    banterStyle: 'cryptic',
    taunts: [
      'PROJECT CLEARANCE: SIGMA-7. PROCEED.',
      'Timeline divergence detected. Correcting.',
      'All variables accounted for.',
      'You are operating within predicted parameters.',
      'DIRECTIVE: EXECUTE CONTINGENCY THETA.',
    ],
    defeats: [
      'ANOMALY DETECTED. PROTOCOL REQUIRES REASSESSMENT.',
      'Unexpected outcome. Recalculating probability matrix.',
      'AUTHORIZATION CODE: FALLBACK SIGMA.',
    ],
    victories: [
      'OPERATION: COMPLETE. ALL OBJECTIVES ACHIEVED.',
      'Timeline restored to optimal trajectory.',
      'As calculated. Probability: 99.7%.',
    ],
  },
};

// Helper function to get persona by difficulty
export const getPersonaByDifficulty = (difficulty: AIDifficulty): AIPersona => {
  const difficultyMap: Record<AIDifficulty, string> = {
    easy: 'skeptic',
    medium: 'operative',
    hard: 'manipulator', // Could also use 'zealot'
    insane: 'director',
  };
  return AI_PERSONAS[difficultyMap[difficulty]];
};

// Helper function to get random banter line
export const getRandomBanter = (
  persona: AIPersona,
  type: 'taunts' | 'defeats' | 'victories'
): string => {
  const lines = persona[type];
  return lines[Math.floor(Math.random() * lines.length)];
};
