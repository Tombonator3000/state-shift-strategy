export type SightingCategory = 'synergy' | 'truth-meltdown' | 'cryptid' | 'hotspot';

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
  defenseBoost?: number;
  truthReward?: number;
  duration?: number;
  turnsRemaining?: number;
  hotspotId?: string;
  outcome?: 'active' | 'captured' | 'expired';
  truthDelta?: number;
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
