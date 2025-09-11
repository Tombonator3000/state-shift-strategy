export interface AudioTrack {
  id: string;
  path: string;
  loop: boolean;
  volume: number;
}

export interface SFXTrack {
  id: string;
  path: string;
  volume: number;
}

export const BGM_TRACKS: Record<string, AudioTrack> = {
  'start-theme': {
    id: 'start-theme',
    path: '/muzak/Theme-2.mp3',
    loop: true,
    volume: 1.0
  },
  'gameplay-government': {
    id: 'gameplay-government',
    path: '/muzak/Government-3.mp3',
    loop: true,
    volume: 1.0
  },
  'gameplay-truth': {
    id: 'gameplay-truth',
    path: '/muzak/Truth-3.mp3',
    loop: true,
    volume: 1.0
  },
  'endcredits-theme': {
    id: 'endcredits-theme',
    path: '/muzak/endcredits-theme.mp3',
    loop: false,
    volume: 1.0
  }
};

export const SFX_TRACKS: Record<string, SFXTrack> = {
  'click': {
    id: 'click',
    path: '/audio/click.mp3',
    volume: 1.0
  },
  'hover': {
    id: 'hover',
    path: '/audio/hover.mp3',
    volume: 0.6
  },
  'card-draw': {
    id: 'card-draw',
    path: '/audio/card-draw.mp3',
    volume: 0.8
  },
  'card-play': {
    id: 'card-play',
    path: '/audio/card-play.mp3',
    volume: 0.8
  },
  'victory': {
    id: 'victory',
    path: '/audio/victory.mp3',
    volume: 1.0
  },
  'defeat': {
    id: 'defeat',
    path: '/audio/defeat.mp3',
    volume: 1.0
  }
};

export type SceneId = 'start-menu' | 'faction-select' | 'gameplay' | 'end-credits';
export type BGMTrackId = keyof typeof BGM_TRACKS;
export type SFXTrackId = keyof typeof SFX_TRACKS;