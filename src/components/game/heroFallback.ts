import { formatTruthDelta } from './tabloidRoundUtils';

export interface HeroComboEntry {
  name?: string | null;
  reward?: string | null;
}

export interface HeroComboReport {
  entries: HeroComboEntry[];
}

export interface HeroFallbackInput {
  faction: 'truth' | 'government';
  capturedStates: string[];
  truthDeltaTotal: number;
  comboReport: HeroComboReport | null;
  comboOwnerLabel?: string | null;
}

export interface HeroFallbackContent {
  headline: string;
  subhead: string;
  body: string[];
  tags: string[];
}

const toUpperId = (value: string): string => value.replace(/[^A-Z0-9]+/gi, ' ').trim().toUpperCase();

const describeTruthSwing = (label: string | null): string | null => {
  if (!label) {
    return null;
  }
  const trimmed = label.trim();
  if (!trimmed.length) {
    return null;
  }
  if (trimmed.startsWith('+')) {
    return `Truth monitors log a ${trimmed} surge across the grid.`;
  }
  if (trimmed.startsWith('−') || trimmed.startsWith('-')) {
    return `Truth index slips ${trimmed.replace(/^[-−]/, '')}, analysts raise amber flags.`;
  }
  return `Truth index shifts ${trimmed}.`;  
};

const buildStateHeadline = (subject: string, states: string[]): string => {
  const focus = toUpperId(states[0] ?? 'State');
  return `${subject} STABILIZE ${focus}`;
};

const buildTruthHeadline = (label: string, faction: 'truth' | 'government'): string => {
  const magnitude = label.replace(/^[-+−]/, '').toUpperCase();
  const trend = label.startsWith('+') ? 'CLIMBS' : label.startsWith('−') || label.startsWith('-') ? 'SLIPS' : 'SHIFTS';
  const subject = faction === 'truth' ? 'TRUTH INDEX' : 'TRUTH INDEX';
  return `${subject} ${trend} ${magnitude}`;
};

const joinList = (items: string[]): string => {
  if (items.length === 0) {
    return '';
  }
  if (items.length === 1) {
    return items[0];
  }
  const lead = items.slice(0, -1).join(', ');
  const tail = items[items.length - 1];
  return `${lead} and ${tail}`;
};

export const composeHeroFallback = ({
  faction,
  capturedStates,
  truthDeltaTotal,
  comboReport,
  comboOwnerLabel,
}: HeroFallbackInput): HeroFallbackContent => {
  const uniqueStates = Array.from(new Set(capturedStates.filter(Boolean)));
  const truthLabel = formatTruthDelta(truthDeltaTotal);
  const truthSwing = describeTruthSwing(truthLabel);
  const combos = comboReport?.entries;
  const comboEntries = Array.isArray(combos) ? combos : [];
  const comboNames = comboEntries
    .map(entry => entry.name)
    .filter((name): name is string => Boolean(name && name.trim()));
  const comboRewards = comboEntries
    .map(entry => entry.reward)
    .filter((reward): reward is string => Boolean(reward && reward.trim()));

  const subjectLabel = faction === 'truth' ? 'COALITION OPS' : 'DIRECTORATE ENVOYS';
  const subjectNarrative = faction === 'truth' ? 'Coalition operatives' : 'Directorate envoys';

  let headline: string;
  if (uniqueStates.length) {
    headline = buildStateHeadline(subjectLabel, uniqueStates);
  } else if (comboNames.length) {
    const owner = comboOwnerLabel ? comboOwnerLabel.toUpperCase() : 'COMBO GRID';
    headline = `${owner} SYNCS STRIKES`;
  } else if (truthLabel) {
    headline = buildTruthHeadline(truthLabel, faction);
  } else {
    headline = faction === 'truth' ? 'COALITION OPS HOLD PATTERN' : 'DIRECTORATE ENVOYS MAINTAIN WATCH';
  }

  let subhead: string;
  if (uniqueStates.length) {
    const list = joinList(uniqueStates.slice(0, 3));
    subhead = `${subjectNarrative} report ${list} secured${truthSwing ? '; ' + truthSwing : '.'}`;
  } else if (comboNames.length) {
    const owner = comboOwnerLabel ?? 'Operative cell';
    const reward = comboRewards[0];
    const rewardFragment = reward ? ` (${reward})` : '';
    subhead = `${owner} broadcast combo hits${rewardFragment}.`;
  } else if (truthSwing) {
    subhead = truthSwing;
  } else {
    subhead = faction === 'truth'
      ? 'Signal grid hums steady while analysts scan for sabotage.'
      : 'Briefings stay routine, but watchdogs keep scanners warmed.';
  }

  const body: string[] = [];
  if (uniqueStates.length) {
    const list = joinList(uniqueStates.slice(0, 4));
    body.push(`${subjectNarrative} confirm fresh control over ${list}, filing dossiers for the archive.`);
  }

  if (truthSwing) {
    body.push(truthSwing.replace(/\.$/, '') + '.');
  } else {
    body.push('Truth auditors flag no dramatic fluctuation, but the watch floor keeps the consoles warm.');
  }

  if (comboNames.length) {
    const owner = comboOwnerLabel ?? 'The combo console';
    const highlight = comboNames.slice(0, 3);
    body.push(`${owner} celebrate chain reactions: ${highlight.join(' • ')}.`);
  }

  if (!body.length) {
    body.push('Operatives cycle surveillance duties and await the next anomaly ping.');
  }

  const tags = comboNames.length ? comboNames : uniqueStates;

  return {
    headline,
    subhead,
    body,
    tags,
  };
};
