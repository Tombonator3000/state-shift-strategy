export type ComboKind =
  | 'MEDIA_WAVE'
  | 'CHAIN_REACTION'
  | 'ZONE_LOCKDOWN'
  | 'MEDIA_CAMPAIGN'
  | 'COVER_OPERATION'
  | 'CLOAK_AND_SIGNAL'
  | 'TIMELINE_FRAGMENT'
  | 'MEGA_SPREAD';

export interface ComboTheme {
  id: string;
  label: string;
  intensityScale: 'minor' | 'major' | 'mega';
  calloutTitle: string;
  calloutSubtitlePool: string[];
  glyph: 'redaction' | 'scanline' | 'crt' | 'ticker' | 'wire' | 'map-blink';
  sfx: {
    start: string;
    peak?: string;
    end?: string;
  };
  tokens: {
    bgAlpha: number;
    jitterPx: number;
    blurPx: number;
    vignette: boolean;
    halftone: boolean;
  };
}

export const ComboThemeMap: Record<ComboKind, ComboTheme> = {
  MEDIA_WAVE: {
    id: 'interference',
    label: 'Signal Interference',
    intensityScale: 'minor',
    calloutTitle: 'MEDIA WAVE',
    calloutSubtitlePool: [
      'Talking points synchronized',
      'Narrative harmonized',
      'Teleprompter seized'
    ],
    glyph: 'ticker',
    sfx: { start: 'radio-static-soft', peak: 'typewriter-tick', end: 'scanline-fade' },
    tokens: { bgAlpha: 0.15, jitterPx: 1, blurPx: 0, vignette: false, halftone: true }
  },
  CHAIN_REACTION: {
    id: 'static',
    label: 'Chain Reaction',
    intensityScale: 'major',
    calloutTitle: 'CHAIN REACTION',
    calloutSubtitlePool: [
      'Inputs overheat',
      'Containment breached',
      'Protocol cascade'
    ],
    glyph: 'redaction',
    sfx: { start: 'relay-click', peak: 'alarm-ping', end: 'radio-cut' },
    tokens: { bgAlpha: 0.2, jitterPx: 2, blurPx: 1, vignette: true, halftone: true }
  },
  ZONE_LOCKDOWN: {
    id: 'blackout',
    label: 'Zone Lockdown',
    intensityScale: 'major',
    calloutTitle: 'ZONE LOCKDOWN',
    calloutSubtitlePool: [
      'Access revised',
      'Perimeter tightened',
      'Local bulletin suppressed'
    ],
    glyph: 'map-blink',
    sfx: { start: 'sirene-muffled', peak: 'stamp-thud', end: 'low-hum' },
    tokens: { bgAlpha: 0.22, jitterPx: 1, blurPx: 1, vignette: true, halftone: false }
  },
  MEDIA_CAMPAIGN: {
    id: 'interference',
    label: 'Media Campaign',
    intensityScale: 'minor',
    calloutTitle: 'MEDIA CAMPAIGN',
    calloutSubtitlePool: ['Saturation achieved', 'Talking heads aligned'],
    glyph: 'ticker',
    sfx: { start: 'radio-static-soft', peak: 'flashbulb', end: 'scanline-fade' },
    tokens: { bgAlpha: 0.16, jitterPx: 1, blurPx: 0, vignette: false, halftone: true }
  },
  COVER_OPERATION: {
    id: 'static',
    label: 'Cover Operation',
    intensityScale: 'major',
    calloutTitle: 'COVER OPERATION',
    calloutSubtitlePool: ['Records refiled', 'Paper trail replaced'],
    glyph: 'redaction',
    sfx: { start: 'folder-swish', peak: 'stamp-thud', end: 'radio-cut' },
    tokens: { bgAlpha: 0.2, jitterPx: 2, blurPx: 1, vignette: true, halftone: true }
  },
  CLOAK_AND_SIGNAL: {
    id: 'interference',
    label: 'Cloak & Signal',
    intensityScale: 'minor',
    calloutTitle: 'CLOAK & SIGNAL',
    calloutSubtitlePool: ['Transmission rerouted', 'Local static blooms'],
    glyph: 'wire',
    sfx: { start: 'wire-buzz', peak: 'typewriter-tick', end: 'low-hum' },
    tokens: { bgAlpha: 0.18, jitterPx: 1, blurPx: 0, vignette: false, halftone: true }
  },
  TIMELINE_FRAGMENT: {
    id: 'crt',
    label: 'Timeline Fragmentation',
    intensityScale: 'mega',
    calloutTitle: 'TIMELINE FRAGMENTATION',
    calloutSubtitlePool: ['Parallel copies disagree', 'Memory desync detected'],
    glyph: 'crt',
    sfx: { start: 'tv-on', peak: 'glitch-chirp', end: 'tv-off' },
    tokens: { bgAlpha: 0.28, jitterPx: 3, blurPx: 2, vignette: true, halftone: true }
  },
  MEGA_SPREAD: {
    id: 'blackout',
    label: 'Anomaly Yield',
    intensityScale: 'mega',
    calloutTitle: 'ANOMALY YIELD',
    calloutSubtitlePool: ['Front page guaranteed', 'All channels compromised'],
    glyph: 'scanline',
    sfx: { start: 'sirene-muffled', peak: 'camera-flash-burst', end: 'radio-cut' },
    tokens: { bgAlpha: 0.3, jitterPx: 3, blurPx: 2, vignette: true, halftone: true }
  }
};
