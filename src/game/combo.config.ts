import type { ComboDefinition, ComboSettings } from './combo.types';

const sequenceCombos: ComboDefinition[] = [
  {
    id: 'sequence_attack_blitz',
    name: 'Attack Blitz',
    description: 'Play three ATTACK cards in a row to overwhelm the opposition.',
    category: 'sequence',
    priority: 100,
    cap: 4,
    trigger: { kind: 'sequence', sequence: ['ATTACK', 'ATTACK', 'ATTACK'] },
    reward: { nextAttackMultiplier: 2, log: 'Attack Blitz primes your next strike for double damage.' },
    fxText: 'Chain of strikes primed—next blow hits twice as hard!'
  },
  {
    id: 'sequence_media_wave',
    name: 'Media Wave',
    description: 'Flood the airwaves with three back-to-back MEDIA plays.',
    category: 'sequence',
    priority: 100,
    trigger: { kind: 'sequence', sequence: ['MEDIA', 'MEDIA', 'MEDIA'] },
    reward: { truth: 4, log: '+Truth from media wave' },
    fxText: 'Broadcast control achieved.'
  },
  {
    id: 'sequence_zone_lock',
    name: 'Zone Lock',
    description: 'Deploy three ZONE cards consecutively to lock the map.',
    category: 'sequence',
    priority: 95,
    trigger: { kind: 'sequence', sequence: ['ZONE', 'ZONE', 'ZONE'] },
    reward: { ip: 3, log: '+IP from zone lock' },
    fxText: 'Territories fortified.'
  },
  {
    id: 'sequence_shock_and_awe',
    name: 'Shock & Awe',
    description: 'Strike with ATTACK then follow with double MEDIA spin.',
    category: 'sequence',
    priority: 96,
    trigger: { kind: 'sequence', sequence: ['ATTACK', 'MEDIA', 'MEDIA'] },
    reward: { truth: 3, log: '+Truth from shock & awe' },
    fxText: 'Narrative blitz hits hard.'
  },
  {
    id: 'sequence_crossfire',
    name: 'Crossfire',
    description: 'MEDIA exposes the target before a pair of ATTACK plays.',
    category: 'sequence',
    priority: 92,
    trigger: { kind: 'sequence', sequence: ['MEDIA', 'ATTACK', 'ATTACK'] },
    reward: { ip: 3, log: '+IP from crossfire' },
    fxText: 'Crossfire barrage complete.'
  },
  {
    id: 'sequence_signal_jam',
    name: 'Signal Jam',
    description: 'MEDIA-ZONE-MEDIA triangle to scramble responses.',
    category: 'sequence',
    priority: 90,
    trigger: { kind: 'sequence', sequence: ['MEDIA', 'ZONE', 'MEDIA'] },
    reward: { truth: 2, log: 'Truth swing from signal jam' },
    fxText: 'Signals disrupted.'
  },
  {
    id: 'sequence_territorial_push',
    name: 'Territorial Push',
    description: 'ZONE-ATTACK-ZONE to lock down contested regions.',
    category: 'sequence',
    priority: 94,
    trigger: { kind: 'sequence', sequence: ['ZONE', 'ATTACK', 'ZONE'] },
    reward: { ip: 3, log: 'IP surge from territorial push' },
    fxText: 'Zones reinforced.'
  },
  {
    id: 'sequence_full_spectrum',
    name: 'Full Spectrum',
    description: 'Play ATTACK, MEDIA and ZONE in sequence for total coverage.',
    category: 'sequence',
    priority: 98,
    trigger: { kind: 'sequence', sequence: ['ATTACK', 'MEDIA', 'ZONE'] },
    reward: { ip: 2, truth: 1, log: 'Full spectrum pressure applied' },
    fxText: 'Full spectrum dominance!'
  },
  {
    id: 'sequence_closed_circuit',
    name: 'Closed Circuit',
    description: 'ZONE-MEDIA-ATTACK loops intelligence to offense.',
    category: 'sequence',
    priority: 91,
    trigger: { kind: 'sequence', sequence: ['ZONE', 'MEDIA', 'ATTACK'] },
    reward: { ip: 2, log: 'Closed circuit advantage' },
    fxText: 'Circuit complete.'
  },
  {
    id: 'sequence_firestorm',
    name: 'Firestorm',
    description: 'Two ATTACK cards followed by MEDIA exploitation.',
    category: 'sequence',
    priority: 93,
    trigger: { kind: 'sequence', sequence: ['ATTACK', 'ATTACK', 'MEDIA'] },
    reward: { truth: 2, log: 'Media fans the flames' },
    fxText: 'Firestorm breaks containment.'
  }
];

const countCombos: ComboDefinition[] = [
  {
    id: 'count_attack_barrage',
    name: 'Attack Barrage',
    description: 'Play at least three ATTACK cards during the turn.',
    category: 'count',
    priority: 89,
    cap: 4,
    trigger: { kind: 'count', type: 'ATTACK', count: 3 },
    reward: { ip: 6, log: 'Barrage drains their reserves' },
    fxText: 'Barrage executed.'
  },
  {
    id: 'count_media_campaign',
    name: 'Media Campaign',
    description: 'Publish three MEDIA pieces to sway opinion.',
    category: 'count',
    priority: 88,
    trigger: { kind: 'count', type: 'MEDIA', count: 3 },
    reward: { truth: 3, log: 'Campaign shifts public sentiment' },
    fxText: 'Campaign reaches critical mass.'
  },
  {
    id: 'count_zone_network',
    name: 'Zone Network',
    description: 'Deploy two or more ZONE cards to secure control.',
    category: 'count',
    priority: 87,
    trigger: { kind: 'count', type: 'ZONE', count: 2 },
    reward: { ip: 2, log: 'Network strengthens position' },
    fxText: 'Network anchors the field.'
  },
  {
    id: 'count_full_press',
    name: 'Full Press',
    description: 'Play four or more cards of any type in a turn.',
    category: 'count',
    priority: 85,
    trigger: { kind: 'count', type: 'ANY', count: 4 },
    reward: { ip: 2, log: 'Full press exhausts the opposition' },
    fxText: 'Full press accomplished.'
  },
  {
    id: 'count_relentless',
    name: 'Relentless Pressure',
    description: 'Play five or more cards regardless of type.',
    category: 'count',
    priority: 84,
    trigger: { kind: 'count', type: 'ANY', count: 5 },
    reward: { ip: 3, log: 'Relentless drive yields dividends' },
    fxText: 'Relentless momentum maintained.'
  },
  {
    id: 'count_rare_circle',
    name: 'Rare Circle',
    description: 'Play two or more cards of rare or legendary rarity.',
    category: 'count',
    priority: 83,
    trigger: { kind: 'count', type: 'ANY', count: 2, rarity: 'rare' },
    reward: { ip: 3, log: 'Elites mobilised' },
    fxText: 'Rare assets deployed.'
  },
  {
    id: 'count_legendary_gambit',
    name: 'Legendary Gambit',
    description: 'Play a legendary card to swing the narrative.',
    category: 'count',
    priority: 90,
    trigger: { kind: 'count', type: 'ANY', count: 1, rarity: 'legendary' },
    reward: { ip: 4, log: 'Legendary gambit pays off' },
    fxText: 'Legendary gambit ignites.'
  },
  {
    id: 'count_media_pair',
    name: 'Media Pair',
    description: 'Play two MEDIA cards to maintain coverage.',
    category: 'count',
    priority: 82,
    trigger: { kind: 'count', type: 'MEDIA', count: 2 },
    reward: { truth: 2, log: 'Media pairing sustains attention' },
    fxText: 'Media pair resonates.'
  },
  {
    id: 'count_balanced_arsenal',
    name: 'Balanced Arsenal',
    description: 'Play at least one card of each type in a single turn.',
    category: 'count',
    priority: 88,
    trigger: { kind: 'hybrid', triggers: [
      { kind: 'count', type: 'ATTACK', count: 1 },
      { kind: 'count', type: 'MEDIA', count: 1 },
      { kind: 'count', type: 'ZONE', count: 1 }
    ] },
    reward: { ip: 2, truth: 1, log: 'Balanced arsenal unlocks flexibility' },
    fxText: 'Balanced arsenal achieved.'
  },
  {
    id: 'count_budget_masters',
    name: 'Budget Masters',
    description: 'Play three low-cost cards (cost ≤ 2) in one turn.',
    category: 'count',
    priority: 81,
    trigger: { kind: 'threshold', metric: 'lowCostCount', value: 3 },
    reward: { truth: 2, log: 'Budget plays resonate locally' },
    fxText: 'Budget mastery applauded.'
  }
];

const thresholdCombos: ComboDefinition[] = [
  {
    id: 'threshold_total_spend_12',
    name: 'Strategic Budget',
    description: 'Spend at least 12 IP on cards this turn.',
    category: 'threshold',
    priority: 80,
    trigger: { kind: 'threshold', metric: 'ipSpent', value: 12 },
    reward: { ip: 4, log: 'Budget converts to momentum' },
    fxText: 'Strategic funds deployed.'
  },
  {
    id: 'threshold_attack_spend_9',
    name: 'Ordnance Allocation',
    description: 'Invest 9 or more IP into ATTACK cards in one turn.',
    category: 'threshold',
    priority: 86,
    trigger: { kind: 'threshold', metric: 'attackSpent', value: 9 },
    reward: { ip: 3, log: 'Heavy strike investment returns' },
    fxText: 'Ordnance allocated with precision.'
  },
  {
    id: 'threshold_media_spend_8',
    name: 'Broadcast Budget',
    description: 'Invest eight or more IP into MEDIA plays.',
    category: 'threshold',
    priority: 85,
    trigger: { kind: 'threshold', metric: 'mediaSpent', value: 8 },
    reward: { truth: 4, log: 'Media saturation achieved' },
    fxText: 'Broadcast network saturates feeds.'
  },
  {
    id: 'threshold_zone_spend_6',
    name: 'Logistics Surge',
    description: 'Spend at least six IP on ZONE cards this turn.',
    category: 'threshold',
    priority: 84,
    trigger: { kind: 'threshold', metric: 'zoneSpent', value: 6 },
    reward: { ip: 2, log: 'Logistics surge expands reach' },
    fxText: 'Logistics surge enacted.'
  },
  {
    id: 'threshold_total_spend_18',
    name: 'Grand Offensive',
    description: 'Spend eighteen or more IP during a single turn.',
    category: 'threshold',
    priority: 88,
    trigger: { kind: 'threshold', metric: 'ipSpent', value: 18 },
    reward: { ip: 5, log: 'Grand offensive reshapes the board' },
    fxText: 'Grand offensive underway.'
  },
  {
    id: 'threshold_low_cost_4',
    name: 'Grassroots Push',
    description: 'Deploy four low-cost cards (cost ≤ 2).',
    category: 'threshold',
    priority: 79,
    trigger: { kind: 'threshold', metric: 'lowCostCount', value: 4 },
    reward: { truth: 2, log: 'Grassroots push builds trust' },
    fxText: 'Grassroots surge mobilised.'
  },
  {
    id: 'threshold_high_cost_2',
    name: 'High Roller',
    description: 'Play two cards costing six IP or more.',
    category: 'threshold',
    priority: 83,
    trigger: { kind: 'threshold', metric: 'highCostCount', value: 2 },
    reward: { ip: 3, log: 'High-cost cards swing the tide' },
    fxText: 'High rollers crash the market.'
  },
  {
    id: 'threshold_unique_states_3',
    name: 'Multi-State Operation',
    description: 'Target three different states with ZONE cards.',
    category: 'threshold',
    priority: 82,
    trigger: { kind: 'threshold', metric: 'uniqueStatesTargeted', value: 3 },
    reward: { ip: 3, log: 'Multi-state operation widens influence' },
    fxText: 'Operation spans multiple fronts.'
  }
];

const stateCombos: ComboDefinition[] = [
  {
    id: 'state_double_down',
    name: 'Double Down',
    description: 'Target the same state twice with ZONE plays in a turn.',
    category: 'state',
    priority: 78,
    trigger: { kind: 'state', cardType: 'ZONE', sameStateCount: 2 },
    reward: { ip: 2, log: 'Double targeting overwhelms defences' },
    fxText: 'Double down intensifies pressure.'
  },
  {
    id: 'state_lockdown',
    name: 'Lockdown',
    description: 'Hit the same state three times with ZONE cards.',
    category: 'state',
    priority: 90,
    trigger: { kind: 'state', cardType: 'ZONE', sameStateCount: 3 },
    reward: { ip: 4, log: 'Lockdown secures the region' },
    fxText: 'State locked down tight.'
  },
  {
    id: 'state_coastal_pressure',
    name: 'Coastal Pressure',
    description: 'Target two coastal states (CA, OR, WA, FL, NY).',
    category: 'state',
    priority: 76,
    trigger: { kind: 'state', cardType: 'ZONE', targetList: ['CA', 'OR', 'WA', 'FL', 'NY'], uniqueStatesCount: 2 },
    reward: { ip: 2, log: 'Coastal pressure strains supply lines' },
    fxText: 'Coasts feel the squeeze.'
  },
  {
    id: 'state_border_push',
    name: 'Border Push',
    description: 'Apply ZONE pressure to two southern border states.',
    category: 'state',
    priority: 77,
    trigger: { kind: 'state', cardType: 'ZONE', targetList: ['CA', 'AZ', 'NM', 'TX'], uniqueStatesCount: 2 },
    reward: { ip: 2, log: 'Border operations escalate' },
    fxText: 'Border push surges forward.'
  },
  {
    id: 'state_capital_strike',
    name: 'Capital Strike',
    description: 'Target DC with any ZONE card.',
    category: 'state',
    priority: 85,
    trigger: { kind: 'state', cardType: 'ZONE', targetList: ['DC'], sameStateCount: 1 },
    reward: { truth: 3, log: 'Capital strike rattles leadership' },
    fxText: 'Capital strike executed.'
  },
  {
    id: 'state_heartland_drive',
    name: 'Heartland Drive',
    description: 'Target two heartland states (IA, KS, MO, NE, OK).',
    category: 'state',
    priority: 75,
    trigger: { kind: 'state', cardType: 'ZONE', targetList: ['IA', 'KS', 'MO', 'NE', 'OK'], uniqueStatesCount: 2 },
    reward: { ip: 2, log: 'Heartland drive captures logistics' },
    fxText: 'Heartland drive advances.'
  }
];

const hybridCombos: ComboDefinition[] = [
  {
    id: 'hybrid_precision_strike',
    name: 'Precision Strike',
    description: 'Chain ATTACK into ZONE while spending six IP on ATTACK plays.',
    category: 'hybrid',
    priority: 92,
    trigger: {
      kind: 'hybrid',
      triggers: [
        { kind: 'sequence', sequence: ['ATTACK', 'ZONE'] },
        { kind: 'threshold', metric: 'attackSpent', value: 6 }
      ]
    },
    reward: { ip: 3, log: 'Precision strike breaks resistance' },
    fxText: 'Precision strike lands.'
  },
  {
    id: 'hybrid_signal_lock',
    name: 'Signal Lock',
    description: 'Play MEDIA twice and spend at least three IP on ZONE.',
    category: 'hybrid',
    priority: 86,
    trigger: {
      kind: 'hybrid',
      triggers: [
        { kind: 'sequence', sequence: ['MEDIA', 'MEDIA'] },
        { kind: 'threshold', metric: 'zoneSpent', value: 3 }
      ]
    },
    reward: { truth: 2, log: 'Signal lock cements the story' },
    fxText: 'Signal lock jams dissent.'
  },
  {
    id: 'hybrid_momentum',
    name: 'Momentum Engine',
    description: 'Play three cards and spend at least ten IP in total.',
    category: 'hybrid',
    priority: 88,
    trigger: {
      kind: 'hybrid',
      triggers: [
        { kind: 'count', type: 'ANY', count: 3 },
        { kind: 'threshold', metric: 'ipSpent', value: 10 }
      ]
    },
    reward: { ip: 3, log: 'Momentum engine fuels dominance' },
    fxText: 'Momentum engine roaring.'
  },
  {
    id: 'hybrid_rally',
    name: 'Public Rally',
    description: 'Two MEDIA plays and two unique targeted states in one turn.',
    category: 'hybrid',
    priority: 87,
    trigger: {
      kind: 'hybrid',
      triggers: [
        { kind: 'count', type: 'MEDIA', count: 2 },
        { kind: 'threshold', metric: 'uniqueStatesTargeted', value: 2 }
      ]
    },
    reward: { truth: 3, log: 'Public rally energises supporters' },
    fxText: 'Crowds rally behind the message.'
  },
  {
    id: 'hybrid_last_resort',
    name: 'Last Resort',
    description: 'Play two cards including at least one high-cost option.',
    category: 'hybrid',
    priority: 74,
    trigger: {
      kind: 'hybrid',
      triggers: [
        { kind: 'count', type: 'ANY', count: 2 },
        { kind: 'threshold', metric: 'highCostCount', value: 1 }
      ]
    },
    reward: { ip: 2, log: 'Last resort squeezes hidden reserves' },
    fxText: 'Last resort deployed.'
  },
  {
    id: 'hybrid_chain_reaction',
    name: 'Chain Reaction',
    description: 'Execute a three-card sequence while targeting two states.',
    category: 'hybrid',
    priority: 93,
    trigger: {
      kind: 'hybrid',
      triggers: [
        { kind: 'count', type: 'ANY', count: 3 },
        { kind: 'threshold', metric: 'uniqueStatesTargeted', value: 2 }
      ]
    },
    reward: { ip: 3, truth: 1, log: 'Chain reaction cascades advantages' },
    fxText: 'Chain reaction ignites across the map.'
  }
];

export const COMBO_DEFINITIONS: ComboDefinition[] = [
  ...sequenceCombos,
  ...countCombos,
  ...thresholdCombos,
  ...stateCombos,
  ...hybridCombos,
];

export const DEFAULT_COMBO_SETTINGS: ComboSettings = {
  enabled: true,
  fxEnabled: true,
  maxCombosPerTurn: 2,
  comboToggles: Object.fromEntries(COMBO_DEFINITIONS.map(def => [def.id, def.enabledByDefault ?? true])),
  rng: Math.random,
};
