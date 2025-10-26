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
    if (faction === 'truth') {
      body.push(
        `Coalition stringers swear ${list} just flipped live on the scanner wall, and someone stapled a rumor slip saying "totally not lizard-run" before it got redacted.`
      );
    } else {
      body.push(
        `Directorate envoys log ${list} as "stabilized," though the memo arrives 80% redacted and the surviving line winks about "routine hypnotic briefings."`
      );
    }
  } else {
    body.push(
      faction === 'truth'
        ? 'No new map pins yet, but a courier left a coffee-ringed rumor clipping claiming the next state already rehearsed its liberation cheers.'
        : 'Territory charts stay tidy; an internal memo (redacted in advance) warns staff to rehearse victory statements just in case a state defects on camera.'
    );
  }

  const truthMagnitude = Math.abs(truthDeltaTotal);
  const truthDirection = truthDeltaTotal > 0 ? 'surge' : truthDeltaTotal < 0 ? 'slump' : 'plateau';
  if (truthSwing) {
    const swingLine = truthSwing.replace(/\.$/, '');
    if (faction === 'truth') {
      body.push(
        `${swingLine}; the Paranoid Times rumor desk circled the number ${truthMagnitude} three times and added "ALIENS DID MATH" in glitter pen.`
      );
    } else {
      body.push(
        `${swingLine}; the compliance chief appended a footnote insisting the ${truthDirection} is "within bureaucratically acceptable paranormal variance."`
      );
    }
  } else {
    body.push(
      faction === 'truth'
        ? 'No fresh truth spike registered, so our tipster mailed a blank page labeled "THIS IS THE PROOF."'
        : 'Truth monitors show a polite plateau, prompting the deputy director to issue a memo forbidding celebratory blinking.'
    );
  }

  if (comboNames.length) {
    const owner = comboOwnerLabel ?? (faction === 'truth' ? 'The combo cabal' : 'Operations desk');
    const highlight = comboNames.slice(0, 3);
    const rewardMention = comboRewards.length
      ? `Reward chits dispensed: ${comboRewards.map(reward => `«${reward}»`).join(', ')}.`
      : 'Reward ledger says "classified icing."';
    if (faction === 'truth') {
      body.push(
        `${owner} bragged about chain reactions — ${highlight.join(' • ')} — before whispering that the vending machine started preaching after the payout. ${rewardMention}`
      );
    } else {
      body.push(
        `${owner} filed combo form ${highlight.join(' / ')} and stapled a smiling lizard doodle beside the reward line. ${rewardMention}`
      );
    }
  } else {
    body.push(
      faction === 'truth'
        ? 'Combo grid sat idle, so the rumor channel replayed last night’s pirate broadcast about a jackpot hidden in the director’s espresso machine.'
        : 'No combo paperwork processed; an internal quip suggests the reward cabinet only opens for agents who laugh at the director’s joke twice.'
    );
  }

  const rumorAnchor = uniqueStates[0] ?? (comboNames[0] ?? (faction === 'truth' ? 'hotline' : 'briefing room'));
  if (faction === 'truth') {
    body.push(
      `Anon fax from ${rumorAnchor} claims a captured state archivist slipped us a microfiche titled "Definitely Not A Cover Story," but half the slides were replaced by doodles of Bat Boy in a trench coat.`
    );
  } else {
    body.push(
      `Security whispered that ${rumorAnchor} submitted an insider quip: "If anyone asks about the anomaly, tell them it was morale training" — the rest of the joke was dutifully blacked out.`
    );
  }

  while (body.length < 3) {
    body.push(
      faction === 'truth'
        ? 'Paranoid Times interns swear they heard humming behind the archive door, but the official note reads "probably the fridge."'
        : 'Audit clerks add a boilerplate reminder: "All inexplicable noises are to be logged as HVAC triumphs until further notice."'
    );
  }

  const tags = comboNames.length ? comboNames : uniqueStates;

  return {
    headline,
    subhead,
    body,
    tags,
  };
};
