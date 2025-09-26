import type { MVPCardType, Rarity } from '@/rules/mvp';
import { MVP_COST_TABLE, MVP_CARD_TYPES } from '@/rules/mvp';
import { COMBO_DEFINITIONS } from '@/game/combo.config';
import { formatComboReward } from '@/game/comboEngine';
import type { ComboCategory } from '@/game/combo.types';

export interface MvpRulesSection {
  title: string;
  description?: string;
  bullets?: string[];
}

export interface MvpComboSummaryEntry {
  id: string;
  name: string;
  description: string;
  reward: string;
  cap?: number;
  fxText?: string;
}

export interface MvpComboOverview {
  category: ComboCategory;
  combos: MvpComboSummaryEntry[];
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
      'Truth faction wins at ≥ 95% Truth; Government faction wins at ≤ 5% Truth.',
      'Reach 300 Influence Points (IP) to overrun your rival’s resources.',
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
    title: 'Combo System',
    description:
      'Combos award bonus IP or Truth when you meet card pattern goals within a single turn. Toggle individual combos, the FX channel, or the global system from the Options menu.',
    bullets: [
      'Sequence combos check for specific card type orders as you resolve plays.',
      'Count combos reward playing several cards of a type, rarity, or overall volume.',
      'Threshold combos measure total IP spent, high/low cost usage, and unique targets.',
      'State combos focus on hitting the same location repeatedly or spreading across regions.',
      'Hybrid combos mix multiple triggers. All rewards respect each combo’s cap and your per-turn limit (default 2).',
    ],
  },
  {
    title: 'Effect Whitelist (MVP)',
    bullets: [
      'ATTACK: ipDelta.opponent (required) with optional opponentPercent (0–1) and discardOpponent (max 2).',
      'MEDIA: truthDelta (positive or negative shifts).',
      'ZONE: pressureDelta (requires a target state).',
    ],
  },
  {
    title: 'Card Roles',
    bullets: MVP_CARD_TYPES.map((type) => `${type}: ${effectSummary[type]}`),
  },
];

const COMBO_CATEGORY_ORDER: ComboCategory[] = ['sequence', 'count', 'threshold', 'state', 'hybrid'];

export const MVP_COMBO_OVERVIEW: MvpComboOverview[] = (() => {
  const grouped = new Map<ComboCategory, { category: ComboCategory; combos: Array<MvpComboSummaryEntry & { priority: number }>; }>();

  for (const category of COMBO_CATEGORY_ORDER) {
    grouped.set(category, { category, combos: [] });
  }

  for (const definition of COMBO_DEFINITIONS) {
    const rewardText = formatComboReward(definition.reward);
    const group = grouped.get(definition.category) ?? {
      category: definition.category,
      combos: [],
    };

    group.combos.push({
      id: definition.id,
      name: definition.name,
      description: definition.description,
      reward: rewardText,
      cap: definition.cap,
      fxText: definition.fxText,
      priority: definition.priority,
    });

    grouped.set(definition.category, group);
  }

  return COMBO_CATEGORY_ORDER.map(category => {
    const entry = grouped.get(category);
    if (!entry) {
      return { category, combos: [] } satisfies MvpComboOverview;
    }

    const combos = entry.combos
      .sort((a, b) => b.priority - a.priority)
      .map(({ priority: _priority, ...rest }) => rest);

    return { category, combos } satisfies MvpComboOverview;
  });
})();

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
