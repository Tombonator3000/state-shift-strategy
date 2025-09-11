export interface AudioSettings {
  master: number;
  bgm: number;
  sfx: number;
  isMuted: boolean;
}

const AUDIO_SETTINGS_KEY = 'shadowgov-audio-settings';

const DEFAULT_SETTINGS: AudioSettings = {
  master: 0.3,
  bgm: 1.0,
  sfx: 1.0,
  isMuted: false
};

export const loadAudioSettings = (): AudioSettings => {
  try {
    const stored = localStorage.getItem(AUDIO_SETTINGS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        master: typeof parsed.master === 'number' ? parsed.master : DEFAULT_SETTINGS.master,
        bgm: typeof parsed.bgm === 'number' ? parsed.bgm : DEFAULT_SETTINGS.bgm,
        sfx: typeof parsed.sfx === 'number' ? parsed.sfx : DEFAULT_SETTINGS.sfx,
        isMuted: typeof parsed.isMuted === 'boolean' ? parsed.isMuted : DEFAULT_SETTINGS.isMuted
      };
    }
  } catch (error) {
    console.warn('Failed to load audio settings:', error);
  }
  return DEFAULT_SETTINGS;
};

export const saveAudioSettings = (settings: AudioSettings): void => {
  try {
    localStorage.setItem(AUDIO_SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.warn('Failed to save audio settings:', error);
  }
};