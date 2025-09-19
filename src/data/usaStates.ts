// USA States Database for Shadow Government Game
export interface StateData {
  id: string;          // FIPS code or abbreviation
  name: string;
  abbreviation: string;
  baseIP: number;      // Base IP generation per turn
  defense: number;     // Difficulty to capture (1-5)
  specialBonus?: string; // Special bonus description
  bonusValue?: number;   // Bonus amount
  population: 'low' | 'medium' | 'high' | 'mega'; // Affects various mechanics
}

// Extended state interface for runtime game state
export interface EnhancedStateData extends StateData {
  owner?: 'player' | 'ai' | null;
  pressure?: number;
  contested?: boolean;
  // Occupation data for ZONE takeovers
  occupierCardId?: string | null;
  occupierCardName?: string | null;
  occupierLabel?: string | null;
  occupierIcon?: string | null;
  occupierUpdatedAt?: number;
}

export const USA_STATES: StateData[] = [
  // Mega States (High IP, High Defense)
  { id: '06', name: 'California', abbreviation: 'CA', baseIP: 4, defense: 4, specialBonus: 'Tech Hub', bonusValue: 2, population: 'mega' },
  { id: '48', name: 'Texas', abbreviation: 'TX', baseIP: 4, defense: 4, specialBonus: 'Oil Revenue', bonusValue: 3, population: 'mega' },
  { id: '36', name: 'New York', abbreviation: 'NY', baseIP: 5, defense: 5, specialBonus: 'Financial Center', bonusValue: 4, population: 'mega' },
  { id: '12', name: 'Florida', abbreviation: 'FL', baseIP: 2, defense: 2, specialBonus: 'Florida Man Chaos', bonusValue: 1, population: 'mega' },
  
  // High Value States
  { id: '17', name: 'Illinois', abbreviation: 'IL', baseIP: 3, defense: 3, specialBonus: 'Transport Hub', bonusValue: 2, population: 'high' },
  { id: '42', name: 'Pennsylvania', abbreviation: 'PA', baseIP: 3, defense: 3, specialBonus: 'Steel Industry Legacy', bonusValue: 2, population: 'high' },
  { id: '39', name: 'Ohio', abbreviation: 'OH', baseIP: 3, defense: 3, specialBonus: 'Industrial Midwest', bonusValue: 1, population: 'high' },
  { id: '13', name: 'Georgia', abbreviation: 'GA', baseIP: 3, defense: 3, specialBonus: 'CDC Headquarters', bonusValue: 2, population: 'high' },
  { id: '37', name: 'North Carolina', abbreviation: 'NC', baseIP: 3, defense: 3, specialBonus: 'Research Triangle', bonusValue: 2, population: 'high' },
  { id: '26', name: 'Michigan', abbreviation: 'MI', baseIP: 3, defense: 3, specialBonus: 'Auto Industry', bonusValue: 2, population: 'high' },
  
  // Strategic States
  { id: '11', name: 'Washington DC', abbreviation: 'DC', baseIP: 5, defense: 5, specialBonus: 'Government Control', bonusValue: 5, population: 'medium' },
  { id: '53', name: 'Washington', abbreviation: 'WA', baseIP: 3, defense: 3, specialBonus: 'Tech Industry', bonusValue: 2, population: 'high' },
  { id: '32', name: 'Nevada', abbreviation: 'NV', baseIP: 2, defense: 2, specialBonus: 'Area 51 Access', bonusValue: 3, population: 'medium' },
  { id: '08', name: 'Colorado', abbreviation: 'CO', baseIP: 2, defense: 2, specialBonus: 'Denver Airport Tunnels', bonusValue: 2, population: 'medium' },
  
  // Medium States
  { id: '51', name: 'Virginia', abbreviation: 'VA', baseIP: 3, defense: 3, specialBonus: 'CIA Headquarters', bonusValue: 3, population: 'high' },
  { id: '24', name: 'Maryland', abbreviation: 'MD', baseIP: 3, defense: 3, specialBonus: 'NSA Access', bonusValue: 2, population: 'medium' },
  { id: '22', name: 'Louisiana', abbreviation: 'LA', baseIP: 2, defense: 2, specialBonus: 'Voodoo Protection', bonusValue: 1, population: 'medium' },
  { id: '47', name: 'Tennessee', abbreviation: 'TN', baseIP: 2, defense: 2, specialBonus: 'Music Industry', bonusValue: 1, population: 'medium' },
  { id: '01', name: 'Alabama', abbreviation: 'AL', baseIP: 2, defense: 2, specialBonus: 'Space Program', bonusValue: 2, population: 'medium' },
  { id: '21', name: 'Kentucky', abbreviation: 'KY', baseIP: 2, defense: 2, specialBonus: 'Coal Reserves', bonusValue: 1, population: 'medium' },
  { id: '45', name: 'South Carolina', abbreviation: 'SC', baseIP: 2, defense: 2, specialBonus: 'Military Bases', bonusValue: 2, population: 'medium' },
  { id: '05', name: 'Arkansas', abbreviation: 'AR', baseIP: 2, defense: 2, specialBonus: 'Walmart Empire', bonusValue: 1, population: 'medium' },
  { id: '28', name: 'Mississippi', abbreviation: 'MS', baseIP: 2, defense: 2, specialBonus: 'River Control', bonusValue: 1, population: 'medium' },
  { id: '04', name: 'Arizona', abbreviation: 'AZ', baseIP: 2, defense: 2, specialBonus: 'Desert Bases', bonusValue: 1, population: 'medium' },
  { id: '49', name: 'Utah', abbreviation: 'UT', baseIP: 2, defense: 2, specialBonus: 'NSA Data Center', bonusValue: 2, population: 'medium' },
  { id: '35', name: 'New Mexico', abbreviation: 'NM', baseIP: 2, defense: 2, specialBonus: 'Alien Activity', bonusValue: 2, population: 'low' },
  
  // Swing States
  { id: '55', name: 'Wisconsin', abbreviation: 'WI', baseIP: 2, defense: 2, specialBonus: 'Dairy Industry', bonusValue: 1, population: 'medium' },
  { id: '27', name: 'Minnesota', abbreviation: 'MN', baseIP: 2, defense: 2, specialBonus: 'Mining Wealth', bonusValue: 2, population: 'medium' },
  { id: '29', name: 'Missouri', abbreviation: 'MO', baseIP: 2, defense: 2, specialBonus: 'Gateway Control', bonusValue: 1, population: 'medium' },
  { id: '18', name: 'Indiana', abbreviation: 'IN', baseIP: 2, defense: 2, specialBonus: 'Crossroads', bonusValue: 1, population: 'medium' },
  { id: '09', name: 'Connecticut', abbreviation: 'CT', baseIP: 3, defense: 3, specialBonus: 'Insurance Capital', bonusValue: 2, population: 'medium' },
  { id: '41', name: 'Oregon', abbreviation: 'OR', baseIP: 2, defense: 2, specialBonus: 'Conspiracy Theorists', bonusValue: 1, population: 'medium' },
  
  // Low Population States
  { id: '02', name: 'Alaska', abbreviation: 'AK', baseIP: 1, defense: 1, specialBonus: 'Oil Reserves', bonusValue: 3, population: 'low' },
  { id: '15', name: 'Hawaii', abbreviation: 'HI', baseIP: 1, defense: 1, specialBonus: 'Pacific Base', bonusValue: 2, population: 'low' },
  { id: '56', name: 'Wyoming', abbreviation: 'WY', baseIP: 1, defense: 1, specialBonus: 'Nuclear Silos', bonusValue: 2, population: 'low' },
  { id: '50', name: 'Vermont', abbreviation: 'VT', baseIP: 1, defense: 1, specialBonus: 'Maple Syrup Monopoly', bonusValue: 1, population: 'low' },
  { id: '10', name: 'Delaware', abbreviation: 'DE', baseIP: 2, defense: 2, specialBonus: 'Corporate Haven', bonusValue: 2, population: 'low' },
  { id: '33', name: 'New Hampshire', abbreviation: 'NH', baseIP: 1, defense: 1, specialBonus: 'First Primary', bonusValue: 1, population: 'low' },
  { id: '44', name: 'Rhode Island', abbreviation: 'RI', baseIP: 1, defense: 1, specialBonus: 'Organized Crime', bonusValue: 1, population: 'low' },
  { id: '23', name: 'Maine', abbreviation: 'ME', baseIP: 1, defense: 1, specialBonus: 'Lobster Cartel', bonusValue: 1, population: 'low' },
  { id: '25', name: 'Massachusetts', abbreviation: 'MA', baseIP: 3, defense: 3, specialBonus: 'Elite Universities', bonusValue: 2, population: 'high' },
  { id: '34', name: 'New Jersey', abbreviation: 'NJ', baseIP: 3, defense: 3, specialBonus: 'Pharmaceutical Giants', bonusValue: 2, population: 'high' },
  
  // Plains States
  { id: '31', name: 'Nebraska', abbreviation: 'NE', baseIP: 1, defense: 1, specialBonus: 'Corn Empire', bonusValue: 1, population: 'low' },
  { id: '20', name: 'Kansas', abbreviation: 'KS', baseIP: 1, defense: 1, specialBonus: 'Wheat Fields', bonusValue: 1, population: 'low' },
  { id: '38', name: 'North Dakota', abbreviation: 'ND', baseIP: 1, defense: 1, specialBonus: 'Oil Boom', bonusValue: 2, population: 'low' },
  { id: '46', name: 'South Dakota', abbreviation: 'SD', baseIP: 1, defense: 1, specialBonus: 'Gold Mines', bonusValue: 2, population: 'low' },
  { id: '19', name: 'Iowa', abbreviation: 'IA', baseIP: 1, defense: 1, specialBonus: 'Alien Corn Circles', bonusValue: 1, population: 'low' },
  { id: '40', name: 'Oklahoma', abbreviation: 'OK', baseIP: 2, defense: 2, specialBonus: 'Oil Wells', bonusValue: 1, population: 'medium' },
  
  // Mountain States  
  { id: '30', name: 'Montana', abbreviation: 'MT', baseIP: 1, defense: 1, specialBonus: 'Militia Groups', bonusValue: 1, population: 'low' },
  { id: '16', name: 'Idaho', abbreviation: 'ID', baseIP: 1, defense: 1, specialBonus: 'Potato Cartel', bonusValue: 1, population: 'low' },
  { id: '54', name: 'West Virginia', abbreviation: 'WV', baseIP: 1, defense: 1, specialBonus: 'Underground Bunkers', bonusValue: 1, population: 'low' }
];

// Helper functions
export const getStateByAbbreviation = (abbr: string): StateData | undefined => {
  return USA_STATES.find(state => state.abbreviation === abbr);
};

export const getStateById = (id: string): StateData | undefined => {
  return USA_STATES.find(state => state.id === id);
};

export const getStatesByPopulation = (population: StateData['population']): StateData[] => {
  return USA_STATES.filter(state => state.population === population);
};

export const getTotalIPFromStates = (controlledStates: string[]): number => {
  return controlledStates.reduce((total, stateAbbr) => {
    const state = getStateByAbbreviation(stateAbbr);
    return total + (state?.baseIP || 0) + (state?.bonusValue || 0);
  }, 0);
};

// Occupation label generation
const GOV_LABELS = [
  "Black Site: ${cardName}",
  "Containment Zone: ${cardName}",
  "Federal Custody: ${cardName}",
  "Narrative Lockdown: ${cardName}",
  "Deep-State Node: ${cardName}",
];

const TRUTH_LABELS = [
  "Truth Beacon: ${cardName}",
  "Liberated by: ${cardName}",
  "Safehouse: ${cardName}",
  "Leak Hub: ${cardName}",
  "Leyline Anchor: ${cardName}",
  "Sanctum: ${cardName}",
];

const TABLOID_LABELS = [
  "Under New Management: ${cardName}",
  "They Live HQ: ${cardName}",
  "Haunted Ops: ${cardName}",
  "Lizard VIP Lounge: ${cardName}",
  "Paranormal Annex: ${cardName}",
];

export const buildOccupierLabel = (params: {
  faction: 'government' | 'truth';
  cardName: string;
  useTabloid?: boolean;
}): string => {
  const { faction, cardName, useTabloid } = params;
  const pool = useTabloid ? TABLOID_LABELS : (faction === 'government' ? GOV_LABELS : TRUTH_LABELS);
  const template = pool[0]; // Use first entry for consistency
  return template.replace('${cardName}', cardName);
};

export const setStateOccupation = (state: any, faction: 'government' | 'truth', card: { id: string; name: string }, useTabloid = false) => {
  const icon = faction === 'government' ? '🦎' : '👁️';
  const label = buildOccupierLabel({ faction, cardName: card.name, useTabloid });
  
  state.occupierCardId = card.id;
  state.occupierCardName = card.name;
  state.occupierLabel = `${icon} ${label}`;
  state.occupierIcon = icon;
  state.occupierUpdatedAt = Date.now();
};

export const clearStateOccupation = (state: any) => {
  state.occupierCardId = null;
  state.occupierCardName = null;
  state.occupierLabel = null;
  state.occupierIcon = null;
  state.occupierUpdatedAt = undefined;
};

// Initial game state - all states start neutral, no pre-controlled states
export const getInitialStateControl = (playerFaction: 'government' | 'truth') => {
  return {
    player: [], // No states controlled at start
    ai: [],     // No states controlled at start
    neutral: USA_STATES.map(s => s.abbreviation) // All states start neutral
  };
};