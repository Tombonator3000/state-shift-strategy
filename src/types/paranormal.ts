export type SightingCategory = 'synergy' | 'truth-meltdown' | 'cryptid';

export interface ParanormalSightingMetadata {
  setList?: string[];
  footageQuality?: string;
  intensity?: 'surge' | 'collapse';
  truthValue?: number;
  stateId?: string;
  stateName?: string;
  comboName?: string;
  bonusIP?: number;
  reducedMotion?: boolean;
  source?: 'truth' | 'government';
}

export interface ParanormalSighting {
  id: string;
  timestamp: number;
  category: SightingCategory;
  headline: string;
  subtext: string;
  location?: string;
  metadata?: ParanormalSightingMetadata;
}
