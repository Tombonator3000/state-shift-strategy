// Campaign Mode - Progressive 7-mission storyline with escalating difficulty

export interface CampaignMission {
  id: string;
  number: number;
  name: string;
  description: string;
  briefing: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'insane';
  
  // Victory conditions (override normal rules)
  victoryConditions?: {
    statesRequired?: number;
    truthHigh?: number;
    truthLow?: number;
    maxTurns?: number;
  };
  
  // Starting conditions
  startingConditions?: {
    playerIP?: number;
    aiIP?: number;
    playerStates?: string[];
    aiStates?: string[];
    startingTruth?: number;
  };
  
  // Special rules/modifiers
  modifiers?: {
    id: string;
    name: string;
    description: string;
    effect: string;
  }[];
  
  // Story elements
  story: {
    intro: string;
    victory: string;
    defeat: string;
  };
  
  // Rewards
  rewards?: {
    unlockedCards?: string[];
    unlockedPersonas?: string[];
  };
}

export const CAMPAIGN_MISSIONS: CampaignMission[] = [
  {
    id: 'mission-01-first-contact',
    number: 1,
    name: 'First Contact',
    description: 'Your first investigation into the conspiracy',
    briefing: 'Strange signals detected. Begin your investigation by establishing presence in key territories.',
    difficulty: 'easy',
    
    victoryConditions: {
      statesRequired: 5, // Reduced from 10
    },
    
    startingConditions: {
      playerIP: 15,
      aiIP: 10,
      startingTruth: 50,
    },
    
    story: {
      intro: 'A series of unexplained phenomena has caught your attention. Something is happening, and the authorities are silent. Time to find out what they\'re hiding.',
      victory: 'Your initial investigation reveals patterns. This is bigger than you thought. The conspiracy runs deep.',
      defeat: 'The government shut down your investigation before you could gather enough evidence. Perhaps next time...',
    },
    
    rewards: {
      unlockedCards: ['comeback-truth-01'],
    },
  },

  {
    id: 'mission-02-local-outbreak',
    number: 2,
    name: 'Local Outbreak',
    description: 'Reports flood in from multiple states',
    briefing: 'The phenomenon is spreading. Establish control in critical regions before the government suppresses everything.',
    difficulty: 'easy',
    
    victoryConditions: {
      statesRequired: 7,
    },
    
    startingConditions: {
      startingTruth: 45,
    },
    
    story: {
      intro: 'What started as isolated incidents is now a coordinated pattern. People are talking. The government is scrambling to contain the narrative.',
      victory: 'You\'ve built a network of informants and evidence. The public is starting to question official explanations.',
      defeat: 'The cover-up was too strong. Your sources went silent.',
    },
    
    rewards: {
      unlockedCards: ['comeback-truth-02', 'comeback-gov-01'],
    },
  },

  {
    id: 'mission-03-media-war',
    number: 3,
    name: 'Media War',
    description: 'Control the narrative to win public opinion',
    briefing: 'This mission focuses on Truth control. Expose the conspiracy or bury it completely.',
    difficulty: 'medium',
    
    victoryConditions: {
      truthHigh: 85,
      truthLow: 15,
    },
    
    startingConditions: {
      startingTruth: 50,
    },
    
    modifiers: [
      {
        id: 'media-focus',
        name: 'Media Spotlight',
        description: 'All MEDIA cards have +1% Truth effect',
        effect: 'mediaBonusTruth',
      },
    ],
    
    story: {
      intro: 'The battle for hearts and minds begins. Whoever controls the story controls reality.',
      victory: 'The narrative is yours. The public either sees the truth or believes your version of it.',
      defeat: 'They controlled the message. Your story never reached enough people.',
    },
    
    rewards: {
      unlockedCards: ['comeback-truth-03'],
      unlockedPersonas: ['manipulator'],
    },
  },

  {
    id: 'mission-04-economic-pressure',
    number: 4,
    name: 'Economic Pressure',
    description: 'The government leverages unlimited resources',
    briefing: 'Face an opponent with significant resource advantage. Overcome the odds.',
    difficulty: 'medium',
    
    startingConditions: {
      playerIP: 10,
      aiIP: 60, // Massive disadvantage
    },
    
    modifiers: [
      {
        id: 'resource-crisis',
        name: 'Resource Disadvantage',
        description: 'Opponent starts with +50 IP',
        effect: 'startingIpDelta',
      },
    ],
    
    story: {
      intro: 'The government has mobilized its full resources against you. Money, influence, power - they have it all. You have the truth.',
      victory: 'Against all odds, you prevailed. Resources mean nothing when the people are on your side.',
      defeat: 'Sometimes, money does buy silence.',
    },
    
    rewards: {
      unlockedCards: ['comeback-truth-04', 'comeback-gov-02'],
    },
  },

  {
    id: 'mission-05-contested-territory',
    number: 5,
    name: 'Contested Territory',
    description: 'Every state is heavily defended',
    briefing: 'All territories have increased defenses. Breaking through will require strategy.',
    difficulty: 'hard',
    
    modifiers: [
      {
        id: 'fortified',
        name: 'Fortified States',
        description: 'All states have +2 Defense',
        effect: 'globalDefenseBonus',
      },
    ],
    
    story: {
      intro: 'Both sides have dug in. Every state is a fortress. This will be a war of attrition.',
      victory: 'You broke through their defenses. The fortifications crumbled under sustained pressure.',
      defeat: 'Their defenses held. You couldn\'t break through.',
    },
    
    rewards: {
      unlockedCards: ['comeback-truth-05'],
      unlockedPersonas: ['zealot'],
    },
  },

  {
    id: 'mission-06-cover-up',
    number: 6,
    name: 'The Cover-Up',
    description: 'Reality itself is being suppressed',
    briefing: 'Special rule: Truth cannot exceed 70%. The government has reality locked down.',
    difficulty: 'hard',
    
    victoryConditions: {
      statesRequired: 10,
    },
    
    modifiers: [
      {
        id: 'truth-cap',
        name: 'Reality Suppression',
        description: 'Truth cannot exceed 70%',
        effect: 'truthCap',
      },
    ],
    
    story: {
      intro: 'They\'ve implemented emergency protocols. Reality itself is being managed, controlled, suppressed. You must win by territory alone.',
      victory: 'You controlled enough ground truth that their narrative control collapsed. The people see through the lies.',
      defeat: 'They maintained the illusion. Reality remained... flexible.',
    },
    
    rewards: {
      unlockedCards: ['comeback-gov-03', 'comeback-gov-04'],
    },
  },

  {
    id: 'mission-07-final-edition',
    number: 7,
    name: 'Final Edition',
    description: 'The ultimate confrontation',
    briefing: 'Face the master strategist. Normal rules. Winner takes all.',
    difficulty: 'insane',
    
    story: {
      intro: 'This is it. The final showdown. Everything you\'ve learned, every strategy you\'ve mastered, comes down to this moment. Face the ultimate opponent.',
      victory: 'You did it. Against all odds, against the full might of the conspiracy, you prevailed. The truth is finally out there for all to see. The Paranoid Times prints its final, triumphant edition.',
      defeat: 'The conspiracy proved too powerful. The truth remains hidden. But perhaps, in another timeline, you succeeded...',
    },
    
    rewards: {
      unlockedCards: ['comeback-gov-05'],
      unlockedPersonas: ['director'],
    },
  },
];

// Campaign progress tracking
export interface CampaignProgress {
  completedMissions: string[];
  currentMission: number;
  unlockedCards: string[];
  unlockedPersonas: string[];
  victoryCount: number;
  defeatCount: number;
}

export const getInitialCampaignProgress = (): CampaignProgress => ({
  completedMissions: [],
  currentMission: 1,
  unlockedCards: [],
  unlockedPersonas: ['skeptic', 'operative'], // Starting personas
  victoryCount: 0,
  defeatCount: 0,
});

export const getMissionById = (id: string): CampaignMission | undefined => {
  return CAMPAIGN_MISSIONS.find(m => m.id === id);
};

export const getMissionByNumber = (number: number): CampaignMission | undefined => {
  return CAMPAIGN_MISSIONS.find(m => m.number === number);
};

export const getNextMission = (currentNumber: number): CampaignMission | undefined => {
  return CAMPAIGN_MISSIONS.find(m => m.number === currentNumber + 1);
};

export const isMissionUnlocked = (
  missionNumber: number,
  progress: CampaignProgress
): boolean => {
  return missionNumber <= progress.currentMission;
};
