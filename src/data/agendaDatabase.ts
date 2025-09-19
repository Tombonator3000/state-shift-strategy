export interface SecretAgenda {
  id: string;
  faction: 'truth' | 'government' | 'both';
  category: 'territorial' | 'resource' | 'influence' | 'sabotage' | 'strategic';
  title: string;
  description: string;
  target: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'legendary';
  checkProgress: (gameState: any) => number;
  flavorText: string;
}

export const AGENDA_DATABASE: SecretAgenda[] = [
  // TRUTH FACTION AGENDAS
  {
    id: 'truth_coastal_dominance',
    faction: 'truth',
    category: 'territorial',
    title: 'Coastal Enlightenment',
    description: 'Control 4 coastal states to spread truth through maritime networks',
    target: 4,
    difficulty: 'medium',
    checkProgress: (gameState) => {
      const coastalStates = ['CA', 'FL', 'NY', 'TX', 'WA', 'ME', 'OR', 'NC', 'SC', 'GA', 'VA', 'MD', 'DE', 'NJ', 'CT', 'RI', 'MA', 'NH', 'LA', 'MS', 'AL'];
      return gameState.controlledStates.filter((state: string) => coastalStates.includes(state)).length;
    },
    flavorText: 'The seas have always carried truth across continents.'
  },
  {
    id: 'truth_media_centers',
    faction: 'truth',
    category: 'influence',
    title: 'Media Liberation',
    description: 'Control NY, CA, and IL to dominate mainstream media',
    target: 3,
    difficulty: 'hard',
    checkProgress: (gameState) => {
      const mediaCenters = ['NY', 'CA', 'IL'];
      return gameState.controlledStates.filter((state: string) => mediaCenters.includes(state)).length;
    },
    flavorText: 'Control the narrative, control reality.'
  },
  {
    id: 'truth_tech_triangle',
    faction: 'truth',
    category: 'strategic',
    title: 'Silicon Awakening',
    description: 'Control CA, WA, and TX to dominate tech infrastructure',
    target: 3,
    difficulty: 'hard',
    checkProgress: (gameState) => {
      const techStates = ['CA', 'WA', 'TX'];
      return gameState.controlledStates.filter((state: string) => techStates.includes(state)).length;
    },
    flavorText: 'Technology is the ultimate truth amplifier.'
  },
  {
    id: 'truth_heartland_awakening',
    faction: 'truth',
    category: 'territorial',
    title: 'Heartland Awakening',
    description: 'Control 5 midwest states to awaken rural America',
    target: 5,
    difficulty: 'medium',
    checkProgress: (gameState) => {
      const midwestStates = ['OH', 'IN', 'IL', 'MI', 'WI', 'MN', 'IA', 'MO', 'ND', 'SD', 'NE', 'KS'];
      return gameState.controlledStates.filter((state: string) => midwestStates.includes(state)).length;
    },
    flavorText: 'The heartland holds the soul of America.'
  },
  {
    id: 'truth_truth_threshold',
    faction: 'truth',
    category: 'resource',
    title: 'Truth Cascade',
    description: 'Maintain Truth level above 80% for 3 consecutive turns',
    target: 3,
    difficulty: 'hard',
    checkProgress: (gameState) => {
      // This would need turn-based tracking logic
      return gameState.truth >= 80 ? 1 : 0;
    },
    flavorText: 'When truth reaches critical mass, reality shifts.'
  },
  {
    id: 'truth_resource_independence',
    faction: 'truth',
    category: 'resource',
    title: 'Resource Independence',
    description: 'Accumulate 150 IP while maintaining Truth above 70%',
    target: 150,
    difficulty: 'hard',
    checkProgress: (gameState) => {
      return gameState.truth >= 70 ? gameState.ip : 0;
    },
    flavorText: 'True power comes from self-sufficiency.'
  },
  {
    id: 'truth_dc_liberation',
    faction: 'truth',
    category: 'strategic',
    title: 'Capital Liberation',
    description: 'Control DC and all 3 surrounding states (VA, MD, WV)',
    target: 4,
    difficulty: 'legendary',
    checkProgress: (gameState) => {
      const capitalRegion = ['DC', 'VA', 'MD', 'WV'];
      return gameState.controlledStates.filter((state: string) => capitalRegion.includes(state)).length;
    },
    flavorText: 'Strike at the heart of the conspiracy.'
  },
  {
    id: 'truth_border_control',
    faction: 'truth',
    category: 'territorial',
    title: 'Border Truth',
    description: 'Control 4 border states to stop information flow',
    target: 4,
    difficulty: 'medium',
    checkProgress: (gameState) => {
      const borderStates = ['TX', 'NM', 'AZ', 'CA', 'WA', 'MT', 'ND', 'MN', 'MI', 'NY', 'VT', 'NH', 'ME'];
      return gameState.controlledStates.filter((state: string) => borderStates.includes(state)).length;
    },
    flavorText: 'Truth knows no borders, but control does.'
  },
  {
    id: 'truth_energy_grid',
    faction: 'truth',
    category: 'strategic',
    title: 'Energy Truth',
    description: 'Control TX, ND, and WV to control energy narrative',
    target: 3,
    difficulty: 'medium',
    checkProgress: (gameState) => {
      const energyStates = ['TX', 'ND', 'WV'];
      return gameState.controlledStates.filter((state: string) => energyStates.includes(state)).length;
    },
    flavorText: 'Control energy, control civilization.'
  },
  {
    id: 'truth_university_network',
    faction: 'truth',
    category: 'influence',
    title: 'Academic Awakening',
    description: 'Control MA, CT, and NH to influence education',
    target: 3,
    difficulty: 'easy',
    checkProgress: (gameState) => {
      const academicStates = ['MA', 'CT', 'NH'];
      return gameState.controlledStates.filter((state: string) => academicStates.includes(state)).length;
    },
    flavorText: 'Education is the foundation of enlightenment.'
  },

  // GOVERNMENT FACTION AGENDAS
  {
    id: 'gov_military_complex',
    faction: 'government',
    category: 'strategic',
    title: 'Military Supremacy',
    description: 'Control VA, TX, and CO to dominate military infrastructure',
    target: 3,
    difficulty: 'hard',
    checkProgress: (gameState) => {
      const militaryStates = ['VA', 'TX', 'CO'];
      return gameState.controlledStates.filter((state: string) => militaryStates.includes(state)).length;
    },
    flavorText: 'Security through strength, order through control.'
  },
  {
    id: 'gov_intelligence_triangle',
    faction: 'government',
    category: 'strategic',
    title: 'Intelligence Network',
    description: 'Control VA, MD, and DC to secure intelligence agencies',
    target: 3,
    difficulty: 'hard',
    checkProgress: (gameState) => {
      const intelStates = ['VA', 'MD', 'DC'];
      return gameState.controlledStates.filter((state: string) => intelStates.includes(state)).length;
    },
    flavorText: 'Information is the ultimate weapon.'
  },
  {
    id: 'gov_economic_control',
    faction: 'government',
    category: 'resource',
    title: 'Economic Dominance',
    description: 'Control NY, IL, and CA to dominate financial centers',
    target: 3,
    difficulty: 'legendary',
    checkProgress: (gameState) => {
      const economicStates = ['NY', 'IL', 'CA'];
      return gameState.controlledStates.filter((state: string) => economicStates.includes(state)).length;
    },
    flavorText: 'Control the markets, control the masses.'
  },
  {
    id: 'gov_resource_monopoly',
    faction: 'government',
    category: 'resource',
    title: 'Resource Monopoly',
    description: 'Accumulate 300 IP through systematic exploitation',
    target: 300,
    difficulty: 'hard',
    checkProgress: (gameState) => {
      return gameState.ip;
    },
    flavorText: 'Efficiency through centralization.'
  },
  {
    id: 'gov_truth_suppression',
    faction: 'government',
    category: 'sabotage',
    title: 'Truth Suppression',
    description: 'Maintain Truth level below 20% for 3 consecutive turns',
    target: 3,
    difficulty: 'hard',
    checkProgress: (gameState) => {
      // This would need turn-based tracking logic
      return gameState.truth <= 20 ? 1 : 0;
    },
    flavorText: 'Some truths are too dangerous for public consumption.'
  },
  {
    id: 'gov_southern_strategy',
    faction: 'government',
    category: 'territorial',
    title: 'Southern Strategy',
    description: 'Control 6 southern states to maintain traditional power',
    target: 6,
    difficulty: 'medium',
    checkProgress: (gameState) => {
      const southernStates = ['TX', 'FL', 'GA', 'NC', 'SC', 'TN', 'AL', 'MS', 'LA', 'AR', 'KY', 'WV', 'VA'];
      return gameState.controlledStates.filter((state: string) => southernStates.includes(state)).length;
    },
    flavorText: 'The South remembers, and the South endures.'
  },
  {
    id: 'gov_industrial_control',
    faction: 'government',
    category: 'strategic',
    title: 'Industrial Control',
    description: 'Control OH, PA, and MI to dominate manufacturing',
    target: 3,
    difficulty: 'medium',
    checkProgress: (gameState) => {
      const industrialStates = ['OH', 'PA', 'MI'];
      return gameState.controlledStates.filter((state: string) => industrialStates.includes(state)).length;
    },
    flavorText: 'Industry is the backbone of power.'
  },
  {
    id: 'gov_agriculture_control',
    faction: 'government',
    category: 'resource',
    title: 'Agricultural Control',
    description: 'Control 5 agricultural states to control food supply',
    target: 5,
    difficulty: 'medium',
    checkProgress: (gameState) => {
      const agStates = ['IA', 'IL', 'NE', 'KS', 'MN', 'IN', 'OH', 'WI', 'SD', 'ND'];
      return gameState.controlledStates.filter((state: string) => agStates.includes(state)).length;
    },
    flavorText: 'Control the food, control the people.'
  },
  {
    id: 'gov_surveillance_network',
    faction: 'government',
    category: 'influence',
    title: 'Surveillance State',
    description: 'Control NY, CA, TX, and FL to monitor 60% of population',
    target: 4,
    difficulty: 'hard',
    checkProgress: (gameState) => {
      const surveillanceStates = ['NY', 'CA', 'TX', 'FL'];
      return gameState.controlledStates.filter((state: string) => surveillanceStates.includes(state)).length;
    },
    flavorText: 'Safety requires sacrifice of privacy.'
  },
  {
    id: 'gov_western_expansion',
    faction: 'government',
    category: 'territorial',
    title: 'Western Expansion',
    description: 'Control 4 western states to maintain frontier control',
    target: 4,
    difficulty: 'easy',
    checkProgress: (gameState) => {
      const westernStates = ['CA', 'NV', 'AZ', 'UT', 'CO', 'WY', 'MT', 'ID', 'WA', 'OR'];
      return gameState.controlledStates.filter((state: string) => westernStates.includes(state)).length;
    },
    flavorText: 'Manifest Destiny never ended.'
  },

  // SHARED/NEUTRAL AGENDAS
  {
    id: 'shared_population_centers',
    faction: 'both',
    category: 'territorial',
    title: 'Population Control',
    description: 'Control the 5 most populous states',
    target: 5,
    difficulty: 'legendary',
    checkProgress: (gameState) => {
      const populousStates = ['CA', 'TX', 'FL', 'NY', 'PA'];
      return gameState.controlledStates.filter((state: string) => populousStates.includes(state)).length;
    },
    flavorText: 'Numbers are power, population is destiny.'
  },
  {
    id: 'shared_transport_network',
    faction: 'both',
    category: 'strategic',
    title: 'Transport Dominance',
    description: 'Control key transport hubs: IL, TX, GA, NY, CA',
    target: 5,
    difficulty: 'legendary',
    checkProgress: (gameState) => {
      const transportStates = ['IL', 'TX', 'GA', 'NY', 'CA'];
      return gameState.controlledStates.filter((state: string) => transportStates.includes(state)).length;
    },
    flavorText: 'Control the movement, control the nation.'
  },
  {
    id: 'shared_electoral_dominance',
    faction: 'both',
    category: 'strategic',
    title: 'Electoral Control',
    description: 'Control states worth 270+ electoral votes',
    target: 270,
    difficulty: 'legendary',
    checkProgress: (gameState) => {
      // This would need electoral vote mapping
      return gameState.controlledStates.length * 10; // Simplified
    },
    flavorText: 'Democracy is just counting, and we control the count.'
  }
];

export const getRandomAgenda = (faction: 'truth' | 'government'): SecretAgenda => {
  const factionAgendas = AGENDA_DATABASE.filter(agenda => 
    agenda.faction === faction || agenda.faction === 'both'
  );
  
  // Weight by difficulty - easier agendas more likely
  const weightedAgendas: SecretAgenda[] = [];
  factionAgendas.forEach(agenda => {
    const weight = agenda.difficulty === 'easy' ? 4 : 
                   agenda.difficulty === 'medium' ? 3 : 
                   agenda.difficulty === 'hard' ? 2 : 1;
    for (let i = 0; i < weight; i++) {
      weightedAgendas.push(agenda);
    }
  });
  
  return weightedAgendas[Math.floor(Math.random() * weightedAgendas.length)];
};

export const getAgendaById = (id: string): SecretAgenda | undefined => {
  return AGENDA_DATABASE.find(agenda => agenda.id === id);
};

export const getAgendasByFaction = (faction: 'truth' | 'government' | 'both'): SecretAgenda[] => {
  return AGENDA_DATABASE.filter(agenda => agenda.faction === faction || agenda.faction === 'both');
};

export const getAgendasByDifficulty = (difficulty: 'easy' | 'medium' | 'hard' | 'legendary'): SecretAgenda[] => {
  return AGENDA_DATABASE.filter(agenda => agenda.difficulty === difficulty);
};