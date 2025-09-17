import type { MVPCardType, Rarity } from '@/rules/mvp';
import { MVP_COST_TABLE, MVP_CARD_TYPES } from '@/rules/mvp';

export interface MvpRulesSection {
  title: string;
  description?: string;
  bullets?: string[];
}

export interface MvpCostTableRow {
  rarity: Rarity;
  attack: { effect: string; cost: string };
  media: { effect: string; cost: string };
  zone: { effect: string; cost: string };
}

export const MVP_RARITIES: Rarity[] = ['common', 'uncommon', 'rare', 'legendary'];

const effectSummary: Record<MVPCardType, string> = {
  ATTACK: 'Take IP directly from the opponent. Optionally force discards at higher rarities.',
  MEDIA: 'Shift national Truth toward your faction’s objective.',
  ZONE: 'Build Pressure in a targeted state to claim control.',
};

export const MVP_RULES_TITLE = 'How to Play ShadowGov (MVP Rules)';

export const MVP_RULES_SECTIONS: MvpRulesSection[] = [
  {
    title: 'Objective',
    bullets: [
      'Control 10 states to secure the map.',
      'Truth faction wins at ≥ 90% Truth; Government faction wins at ≤ 10% Truth.',
      'Reach 200 Influence Points (IP) to overrun your rival’s resources.',
    ],
  },
  {
    title: 'Setup',
    bullets: [
      'Each player draws 5 cards after shuffling their deck.',
      'Set national Truth to 50% and both Influence Point tracks to 0.',
      'Every state begins with 0 Pressure for both factions.',
    ],
  },
  {
    title: 'Turn Structure',
    bullets: [
      'Start: Gain 5 IP plus +1 IP for every state you control, then draw back up to 5 cards.',
      'Main: Play up to three cards, paying their IP costs and choosing targets when required.',
      'Capture Check: Any state where your Pressure meets or beats Defense flips to your control.',
      'End: Optionally discard 1 card for free; additional discards cost 1 IP each.',
    ],
  },
  {
    title: 'Effect Whitelist (MVP)',
    bullets: [
      'ATTACK: ipDelta.opponent (required) and optional discardOpponent (max 2).',
      'MEDIA: truthDelta (positive or negative shifts).',
      'ZONE: pressureDelta (requires a target state).',
    ],
  },
  {
    title: 'Card Roles',
    bullets: MVP_CARD_TYPES.map((type) => `${type}: ${effectSummary[type]}`),
  },
];

export const MVP_COST_TABLE_ROWS: MvpCostTableRow[] = MVP_RARITIES.map((rarity) => ({
  rarity,
  attack: {
    effect: `Take ${rarity === 'common' ? '1' : rarity === 'uncommon' ? '2' : rarity === 'rare' ? '3' : '4'} IP`,
    cost: `${MVP_COST_TABLE.ATTACK[rarity]} IP`,
  },
  media: {
    effect: `${rarity === 'legendary' ? '±4%' : rarity === 'rare' ? '±3%' : rarity === 'uncommon' ? '±2%' : '±1%'} Truth`,
    cost: `${MVP_COST_TABLE.MEDIA[rarity]} IP`,
  },
  zone: {
    effect: `+${rarity === 'legendary' ? '4' : rarity === 'rare' ? '3' : rarity === 'uncommon' ? '2' : '1'} Pressure`,
    cost: `${MVP_COST_TABLE.ZONE[rarity]} IP`,
  },
}));
