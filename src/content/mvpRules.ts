import type { MVPCardType, Rarity } from '@/rules/mvp';
import { MVP_COST_TABLE, MVP_CARD_TYPES } from '@/rules/mvp';
import { COMBO_DEFINITIONS } from '@/game/combo.config';
import { formatComboReward } from '@/game/comboEngine';
import type { ComboCategory } from '@/game/combo.types';
import type { StateCombination } from '@/data/stateCombinations';
import { STATE_COMBINATIONS } from '@/data/stateCombinations';

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

export interface MvpSynergyEntry {
  id: string;
  name: string;
  requiredStates: string[];
  bonusIp: number;
  bonusEffect?: string;
}

export interface MvpSynergyGroup {
  id: SynergyGroupId;
  title: string;
  description: string;
  combos: MvpSynergyEntry[];
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
      'Set national Truth to 50% and give both factions 5 starting IP.',
      'Every state begins with 0 Pressure for both factions.',
      'Paranormal overlays & sightings are disabled by default—enable them from Options if desired.',
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
      'Combos evaluate every card you play during a turn, then award bonus IP or Truth once their pattern triggers fire. Each combo respects its own payout cap and the engine enforces a default limit of two combo rewards per turn (adjustable from Options). Toggle individual combos, the FX channel, or the global system in the Options menu.',
    bullets: [
      'Sequence: Attack Blitz (ATTACK → ATTACK → ATTACK) pays +5 IP for executing the full order.',
      'Count: Attack Barrage grants +6 IP once you play three ATTACK cards during the turn.',
      'Threshold: Strategic Budget delivers +4 IP after you spend at least 12 IP in a single turn.',
      'State: Lockdown awards +4 IP when you slam the same state with three ZONE plays.',
      'Hybrid: Precision Strike combines an ATTACK → ZONE sequence with 6 IP of ATTACK spending for +3 IP.',
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

const COMBO_CATEGORY_ORDER: ComboCategory[] = ['sequence', 'count', 'threshold', 'state', 'hybrid'];

type SynergyGroupId = 'economic' | 'energy' | 'military' | 'intelCultural' | 'transport';

const SYNERGY_CATEGORY_ROUTES: Record<StateCombination['category'], SynergyGroupId> = {
  economic: 'economic',
  energy: 'energy',
  military: 'military',
  intelligence: 'intelCultural',
  cultural: 'intelCultural',
  transport: 'transport',
};

const SYNERGY_GROUP_METADATA: Record<SynergyGroupId, { title: string; description: string; priority: number }> = {
  economic: {
    title: 'Economic Networks',
    description: 'Financial hubs and industrial belts stack extra IP income and local resilience.',
    priority: 1,
  },
  energy: {
    title: 'Energy Cartels',
    description: 'Energy-state monopolies supercharge your influence production.',
    priority: 2,
  },
  military: {
    title: 'Military Infrastructure',
    description: 'Strategic bases and borders reinforce pressure plays and territorial defense.',
    priority: 3,
  },
  intelCultural: {
    title: 'Intelligence & Cultural Blocks',
    description: 'Information webs and cultural footholds amplify card draw and Truth swings.',
    priority: 4,
  },
  transport: {
    title: 'Transport & Logistics',
    description: 'National supply chains keep pressure moving between adjacent fronts.',
    priority: 5,
  },
};

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

export const MVP_SYNERGY_GROUPS: MvpSynergyGroup[] = (() => {
  const groups = new Map<SynergyGroupId, MvpSynergyGroup>();

  for (const [id, meta] of Object.entries(SYNERGY_GROUP_METADATA) as Array<[SynergyGroupId, typeof SYNERGY_GROUP_METADATA[SynergyGroupId]]>) {
    groups.set(id, { id, title: meta.title, description: meta.description, combos: [] });
  }

  for (const combo of STATE_COMBINATIONS) {
    const groupId = SYNERGY_CATEGORY_ROUTES[combo.category];
    const group = groups.get(groupId);

    if (!group) {
      continue;
    }

    group.combos.push({
      id: combo.id,
      name: combo.name,
      requiredStates: [...combo.requiredStates],
      bonusIp: combo.bonusIP,
      bonusEffect: combo.bonusEffect,
    });
  }

  return Array.from(groups.values())
    .sort((a, b) => SYNERGY_GROUP_METADATA[a.id].priority - SYNERGY_GROUP_METADATA[b.id].priority)
    .map(group => ({
      ...group,
      combos: [...group.combos].sort((a, b) => a.name.localeCompare(b.name)),
    }));
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
