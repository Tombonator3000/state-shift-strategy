// File-backed SFX (real audio files served from /public/audio).
export const SFX_MANIFEST = {
  cardPlay: '/audio/card-play.mp3',
  flash: '/audio/card-play.mp3',
  cardDraw: '/audio/card-draw.mp3',
  stateCapture: '/audio/state-capture.mp3',
  turnEnd: '/audio/turn-end.mp3',
  newspaper: '/audio/newspaper.mp3',
  victory: '/audio/victory.mp3',
  defeat: '/audio/defeat.mp3',
  hover: '/audio/hover.mp3',
  click: '/audio/click.mp3',
  typewriter: '/audio/typewriter.mp3',
  lightClick: '/audio/click.mp3',
  error: '/audio/click.mp3',
} as const;

// Procedural paranormal SFX live in a ~5 MB base64 module — keep them out of
// the main bundle and only fetch the chunk when the audio system actually
// initialises. Returns a map of key → data URI.
export const PROCEDURAL_SFX_KEYS = ['ufo-elvis', 'cryptid-rumble', 'radio-static'] as const;
export type ProceduralSfxKey = (typeof PROCEDURAL_SFX_KEYS)[number];

export const loadProceduralSfx = async (): Promise<Record<ProceduralSfxKey, string>> => {
  const module = await import('./paranormalSfx');
  return {
    'ufo-elvis': module.UFO_ELVIS_SFX,
    'cryptid-rumble': module.CRYPTID_RUMBLE_SFX,
    'radio-static': module.RADIO_STATIC_SFX,
  };
};

export type SfxKey = keyof typeof SFX_MANIFEST | ProceduralSfxKey;

export const SFX_KEYS: SfxKey[] = [
  ...(Object.keys(SFX_MANIFEST) as Array<keyof typeof SFX_MANIFEST>),
  ...PROCEDURAL_SFX_KEYS,
];
