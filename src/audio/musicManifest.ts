import { getAssetPath } from '@/lib/assets';

export type MusicType = 'theme' | 'government' | 'truth' | 'endcredits';
export type AudioScene = 'menu' | 'factionSelect' | 'playing';
export const resolveAudioSource = (src: string, base?: string) =>
  /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(src) ? src : getAssetPath(src, base);

// Theme-1.mp3 is a two-byte CRLF placeholder in the source history, not audio.
// Keep the original file, but never queue it or claim it has been repaired.
const filenames: Record<MusicType, string[]> = {
  theme: ['Theme-2.mp3'],
  government: [2, 1, 3, 4, 5].map(n => `Government-${n}.mp3`),
  truth: [1, 2, 3, 4, 5].map(n => `Truth-${n}.mp3`),
  endcredits: ['endcredits-theme.mp3'],
};
export const musicLibrary = (base?: string) => Object.fromEntries(
  Object.entries(filenames).map(([type, files]) => [type, files.map((file, index) => ({
    index, src: resolveAudioSource(`muzak/${file}`, base), label: file.replace(/\.mp3$/, '').replace(/-/g, ' '),
  }))]),
) as Record<MusicType, { index: number; src: string; label: string }[]>;
