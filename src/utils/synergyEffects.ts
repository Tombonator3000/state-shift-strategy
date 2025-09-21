import { ParticleEffectType } from '@/components/effects/ParticleSystem';
import { StateCombination } from '@/data/stateCombinations';

export type SynergyCategory = StateCombination['category'];
export type SynergyEffectIdentifier = `synergy-${SynergyCategory}`;

export interface SynergyEffectPreset {
  id: SynergyEffectIdentifier;
  category: SynergyCategory;
  label: string;
  particleType: ParticleEffectType;
  floating: {
    textClass: string;
    prefix: string;
    shadow: string;
    fontSize: string;
    filter?: string;
  };
}

export const SYNERGY_CATEGORY_TO_IDENTIFIER: Record<SynergyCategory, SynergyEffectIdentifier> = {
  economic: 'synergy-economic',
  military: 'synergy-military',
  intelligence: 'synergy-intelligence',
  cultural: 'synergy-cultural',
  energy: 'synergy-energy',
  transport: 'synergy-transport'
};

export const SYNERGY_EFFECT_PRESETS: Record<SynergyEffectIdentifier, SynergyEffectPreset> = {
  'synergy-economic': {
    id: 'synergy-economic',
    category: 'economic',
    label: 'ECONOMIC SYNERGY',
    particleType: 'bigwin',
    floating: {
      textClass: 'text-amber-300',
      prefix: '💰',
      shadow: '0 0 18px rgba(251, 191, 36, 0.85)',
      fontSize: '1.85rem',
      filter: 'drop-shadow(0 0 12px rgba(255, 196, 45, 0.55))'
    }
  },
  'synergy-military': {
    id: 'synergy-military',
    category: 'military',
    label: 'MILITARY SYNERGY',
    particleType: 'capture',
    floating: {
      textClass: 'text-rose-300',
      prefix: '🎖️',
      shadow: '0 0 18px rgba(244, 63, 94, 0.8)',
      fontSize: '1.85rem',
      filter: 'drop-shadow(0 0 12px rgba(244, 63, 94, 0.45))'
    }
  },
  'synergy-intelligence': {
    id: 'synergy-intelligence',
    category: 'intelligence',
    label: 'INTELLIGENCE SYNERGY',
    particleType: 'broadcast',
    floating: {
      textClass: 'text-sky-300',
      prefix: '🕵️',
      shadow: '0 0 18px rgba(125, 211, 252, 0.85)',
      fontSize: '1.85rem',
      filter: 'drop-shadow(0 0 12px rgba(56, 189, 248, 0.45))'
    }
  },
  'synergy-cultural': {
    id: 'synergy-cultural',
    category: 'cultural',
    label: 'CULTURAL SYNERGY',
    particleType: 'stateevent',
    floating: {
      textClass: 'text-fuchsia-300',
      prefix: '🎭',
      shadow: '0 0 18px rgba(217, 70, 239, 0.82)',
      fontSize: '1.85rem',
      filter: 'drop-shadow(0 0 12px rgba(192, 38, 211, 0.45))'
    }
  },
  'synergy-energy': {
    id: 'synergy-energy',
    category: 'energy',
    label: 'ENERGY SYNERGY',
    particleType: 'synergy',
    floating: {
      textClass: 'text-emerald-300',
      prefix: '🔋',
      shadow: '0 0 18px rgba(16, 185, 129, 0.8)',
      fontSize: '1.85rem',
      filter: 'drop-shadow(0 0 12px rgba(16, 185, 129, 0.4))'
    }
  },
  'synergy-transport': {
    id: 'synergy-transport',
    category: 'transport',
    label: 'TRANSPORT SYNERGY',
    particleType: 'chain',
    floating: {
      textClass: 'text-cyan-300',
      prefix: '🚚',
      shadow: '0 0 18px rgba(103, 232, 249, 0.85)',
      fontSize: '1.85rem',
      filter: 'drop-shadow(0 0 12px rgba(6, 182, 212, 0.45))'
    }
  }
};

export const isSynergyEffectIdentifier = (value: string): value is SynergyEffectIdentifier =>
  Object.prototype.hasOwnProperty.call(SYNERGY_EFFECT_PRESETS, value);

export const getSynergyEffectIdentifier = (category: SynergyCategory): SynergyEffectIdentifier =>
  SYNERGY_CATEGORY_TO_IDENTIFIER[category];

const KNOWN_PARTICLE_EFFECT_TYPES: ParticleEffectType[] = [
  'deploy',
  'capture',
  'counter',
  'victory',
  'synergy',
  'bigwin',
  'stateloss',
  'chain',
  'flash',
  'stateevent',
  'contested',
  'broadcast',
  'cryptid',
  'glitch'
];

export const resolveParticleEffectType = (
  identifier: string,
  fallback: ParticleEffectType = 'synergy'
): ParticleEffectType => {
  if (isSynergyEffectIdentifier(identifier)) {
    return SYNERGY_EFFECT_PRESETS[identifier].particleType;
  }

  return KNOWN_PARTICLE_EFFECT_TYPES.includes(identifier as ParticleEffectType)
    ? (identifier as ParticleEffectType)
    : fallback;
};
