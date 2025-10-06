import type { NewspaperData } from '@/lib/newspaperData';

export interface FrontPageSubheadCombo {
  deck?: string | null;
  tags?: string[];
  magnitude?: number | string;
}

export interface FrontPageSubheadInput {
  datasetSubheads?: NewspaperData['subheads'];
  fallback?: string | null;
  combo?: FrontPageSubheadCombo | null;
  comboOwnerLabel?: string | null;
  capturedStates?: string[];
  truthDeltaLabel?: string | null;
  agendaLabel?: string | null;
  faction?: 'truth' | 'government';
}

const pickRandom = (values: string[] | undefined): string | null => {
  if (!Array.isArray(values) || values.length === 0) {
    return null;
  }

  const index = Math.floor(Math.random() * values.length);
  const candidate = values[index];
  return typeof candidate === 'string' && candidate.trim().length ? candidate : null;
};

const formatList = (values: string[]): string => {
  if (values.length === 0) {
    return '';
  }

  if (values.length === 1) {
    return values[0];
  }

  const head = values.slice(0, -1);
  const tail = values[values.length - 1];
  return `${head.join(', ')} and ${tail}`;
};

const describeTruthShift = (label: string | null | undefined): string | null => {
  if (!label) {
    return null;
  }

  const trimmed = label.replace(/\s+/g, '');
  if (!trimmed.length) {
    return null;
  }

  const sign = trimmed[0];
  const magnitude = trimmed.slice(1) || trimmed;

  if (sign === '+') {
    return `Truth index climbs ${magnitude}.`;
  }
  if (sign === '−' || sign === '-') {
    return `Truth index dips ${magnitude}.`;
  }
  return `Truth index shifts ${trimmed}.`;
};

const selectDatasetFallback = (
  datasetSubheads: NewspaperData['subheads'] | undefined,
  fallback: string | null | undefined,
): string => {
  const generic = pickRandom(datasetSubheads?.generic);
  if (generic) {
    return generic;
  }
  const attack = pickRandom(datasetSubheads?.attack);
  if (attack) {
    return attack;
  }
  const media = pickRandom(datasetSubheads?.media);
  if (media) {
    return media;
  }
  const zone = pickRandom(datasetSubheads?.zone);
  if (zone) {
    return zone;
  }
  if (fallback && fallback.trim().length) {
    return fallback;
  }
  return 'Officials decline to elaborate.';
};

export const deriveFrontPageSubhead = ({
  datasetSubheads,
  fallback,
  combo,
  comboOwnerLabel,
  capturedStates,
  truthDeltaLabel,
  agendaLabel,
  faction,
}: FrontPageSubheadInput): string => {
  const comboDeck = combo?.deck?.trim();
  if (comboDeck) {
    return comboDeck;
  }

  const comboTags = Array.isArray(combo?.tags) ? combo?.tags.filter(Boolean) : [];
  if (comboTags && comboTags.length) {
    const owner = comboOwnerLabel?.trim() || 'Operative cell';
    const rawMagnitude = combo?.magnitude;
    const magnitude =
      typeof rawMagnitude === 'number'
        ? Number.isFinite(rawMagnitude) && rawMagnitude > 0
          ? rawMagnitude
          : null
        : typeof rawMagnitude === 'string'
          ? rawMagnitude.trim()
          : null;
    const magnitudeLabel =
      typeof magnitude === 'number'
        ? `magnitude ${magnitude}`
        : magnitude
          ? `${magnitude} combo`
          : 'combo chain';
    return `${owner} spotlight a ${magnitudeLabel}: ${comboTags.join(' • ')}.`;
  }

  const states = Array.isArray(capturedStates) ? capturedStates.filter(Boolean) : [];
  if (states.length) {
    const subject = faction === 'government' ? 'Directorate envoys' : 'Coalition operatives';
    const action = states.length > 1 ? 'lock down' : 'secure';
    const stateList = formatList(states.slice(0, 3));
    const truthLine = describeTruthShift(truthDeltaLabel);
    return truthLine ? `${subject} ${action} ${stateList}. ${truthLine}` : `${subject} ${action} ${stateList}.`;
  }

  const truthLine = describeTruthShift(truthDeltaLabel);
  if (truthLine) {
    return truthLine;
  }

  if (agendaLabel && agendaLabel.trim().length) {
    return `Campaign focus: ${agendaLabel.trim()}.`;
  }

  return selectDatasetFallback(datasetSubheads, fallback);
};
