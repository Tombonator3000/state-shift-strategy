import { UFO_ELVIS_SFX, CRYPTID_RUMBLE_SFX, RADIO_STATIC_SFX } from './paranormalSfx';

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
  'ufo-elvis': UFO_ELVIS_SFX,
  'cryptid-rumble': CRYPTID_RUMBLE_SFX,
  'radio-static': RADIO_STATIC_SFX,
} as const;

export type SfxKey = keyof typeof SFX_MANIFEST;

export const SFX_KEYS = Object.keys(SFX_MANIFEST) as SfxKey[];
