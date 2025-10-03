import type { RelicEffect, TabloidRelicRuntimeEntry } from './RelicTypes';

export type FalloutSummaryTone = 'positive' | 'negative' | 'neutral';

export interface FalloutEffectSummary {
  readonly key: string;
  readonly label: string;
  readonly sentence: string;
  readonly tone: FalloutSummaryTone;
}

interface SummarizeOptions {
  readonly locale?: string;
}

interface FormatOptions extends SummarizeOptions {
  readonly includeLabel?: boolean;
}

const DEFAULT_LOCALE = 'en-US';

const escapeSpaces = (value: string): string => value.replace(/\s+/g, ' ').trim();

const resolveLanguage = (locale?: string): 'en' | 'nb' => {
  if (!locale) {
    return 'en';
  }
  const lower = locale.toLowerCase();
  return lower.startsWith('nb') ? 'nb' : 'en';
};

const determineFractionDigits = (value: number): number => (Number.isInteger(value) ? 0 : 1);

const formatSignedNumber = (value: number, locale: string, fractionDigits = determineFractionDigits(value)): string => {
  return new Intl.NumberFormat(locale, {
    signDisplay: 'always',
    minimumFractionDigits: fractionDigits > 0 ? fractionDigits : 0,
    maximumFractionDigits: fractionDigits,
  }).format(value);
};

const formatPercent = (value: number, locale: string): string => {
  return `${formatSignedNumber(value, locale, determineFractionDigits(value))}%`;
};

const LEXICON: Record<'en' | 'nb', {
  readonly truth: string;
  readonly ip: string;
  readonly aiIp: string;
  readonly cardDraw: string;
  readonly perRoundPhrase: string;
  readonly perRoundShort: string;
  readonly immediatePhrase: string;
  readonly fallback: string;
  readonly and: string;
}> = {
  en: {
    truth: 'Truth',
    ip: 'IP',
    aiIp: 'AI IP',
    cardDraw: 'Card draw',
    perRoundPhrase: 'per round',
    perRoundShort: '/round',
    immediatePhrase: 'this round',
    fallback: 'No active fallout effects',
    and: 'and',
  },
  nb: {
    truth: 'Sannhet',
    ip: 'IP',
    aiIp: 'AI-IP',
    cardDraw: 'Korttrekk',
    perRoundPhrase: 'per runde',
    perRoundShort: '/runde',
    immediatePhrase: 'denne runden',
    fallback: 'Ingen aktive tabloideffekter',
    and: 'og',
  },
};

const toneForValue = (value: number): FalloutSummaryTone => {
  if (value > 0) {
    return 'positive';
  }
  if (value < 0) {
    return 'negative';
  }
  return 'neutral';
};

const joinSegments = (segments: readonly string[], language: 'en' | 'nb'): string => {
  if (segments.length === 0) {
    return '';
  }
  if (segments.length === 1) {
    return segments[0];
  }
  if (segments.length === 2) {
    return `${segments[0]} ${LEXICON[language].and} ${segments[1]}`;
  }
  const leading = segments.slice(0, -1).join(', ');
  const last = segments[segments.length - 1];
  const comma = language === 'en' ? ',' : '';
  return `${leading}${comma} ${LEXICON[language].and} ${last}`;
};

export const summarizeEffects = (
  effects?: RelicEffect | null,
  options?: SummarizeOptions,
): FalloutEffectSummary[] => {
  if (!effects) {
    return [];
  }

  const locale = options?.locale ?? DEFAULT_LOCALE;
  const language = resolveLanguage(locale);
  const lexicon = LEXICON[language];

  const summaries: FalloutEffectSummary[] = [];

  const addPerRoundSummary = (key: string, label: string, value: number, isPercent = false) => {
    if (value === 0) {
      return;
    }
    const formatted = isPercent ? formatPercent(value, locale) : formatSignedNumber(value, locale);
    summaries.push({
      key,
      label: `${label} ${formatted}${lexicon.perRoundShort}`,
      sentence: `${label} ${formatted} ${lexicon.perRoundPhrase}`,
      tone: toneForValue(value),
    });
  };

  const addImmediateSummary = (key: string, label: string, value: number, isPercent = false) => {
    if (value === 0) {
      return;
    }
    const formatted = isPercent ? formatPercent(value, locale) : formatSignedNumber(value, locale);
    summaries.push({
      key,
      label: `${label} ${formatted}`,
      sentence: `${label} ${formatted} ${lexicon.immediatePhrase}`,
      tone: toneForValue(value),
    });
  };

  if (typeof effects.truthPerRound === 'number') {
    addPerRoundSummary('truthPerRound', lexicon.truth, effects.truthPerRound, true);
  }
  if (typeof effects.ipPerRound === 'number') {
    addPerRoundSummary('ipPerRound', lexicon.ip, effects.ipPerRound);
  }
  if (typeof effects.aiIpPerRound === 'number') {
    addPerRoundSummary('aiIpPerRound', lexicon.aiIp, effects.aiIpPerRound);
  }
  if (typeof effects.cardDrawBonus === 'number' && effects.cardDrawBonus !== 0) {
    addPerRoundSummary('cardDrawBonus', lexicon.cardDraw, effects.cardDrawBonus);
  }

  if (typeof effects.truthDelta === 'number') {
    addImmediateSummary('truthDelta', lexicon.truth, effects.truthDelta, true);
  }
  if (typeof effects.ipDelta === 'number') {
    addImmediateSummary('ipDelta', lexicon.ip, effects.ipDelta);
  }
  if (typeof effects.aiIpDelta === 'number') {
    addImmediateSummary('aiIpDelta', lexicon.aiIp, effects.aiIpDelta);
  }

  return summaries;
};

export const formatFalloutLine = (
  entry: Pick<TabloidRelicRuntimeEntry, 'label' | 'effects'>,
  options?: FormatOptions,
): string => {
  const locale = options?.locale ?? DEFAULT_LOCALE;
  const language = resolveLanguage(locale);
  const includeLabel = options?.includeLabel ?? true;
  const lexicon = LEXICON[language];

  const summaries = summarizeEffects(entry.effects, { locale });
  const segments = summaries.map(summary => escapeSpaces(summary.sentence));
  const body = segments.length ? joinSegments(segments, language) : lexicon.fallback;

  if (includeLabel) {
    return `${entry.label}: ${body}.`;
  }
  return `${body}.`;
};

export const stripLeadingLabel = (label: string, text: string): string => {
  if (!label) {
    return text.trim();
  }
  const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`^${escapedLabel}\s*[:\-\u2013\u2014]?\s*`, 'i');
  return text.replace(pattern, '').trim();
};
