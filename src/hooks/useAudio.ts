import { useState, useCallback, useEffect, useRef } from 'react';
import { SFX_MANIFEST, PROCEDURAL_SFX_KEYS, loadProceduralSfx } from '@/assets/audio/sfxManifest';
import { safeGetLocalStorageItem, safeSetLocalStorageItem } from '@/utils/storage';
import { NewsroomRadio, DEFAULT_AUDIO, type AudioConfig } from '@/audio/NewsroomRadio';
import { resolveAudioSource, type MusicType } from '@/audio/musicManifest';

const settings = (): Record<string, unknown> => {
  try { const value = JSON.parse(safeGetLocalStorageItem('gameSettings') || '{}'); return value && typeof value === 'object' && !Array.isArray(value) ? value : {}; } catch { return {}; }
};
const readConfig = (): AudioConfig => {
  const saved = settings();
  const volume = (key: string, fallback: number) => typeof saved[key] === 'number' ? Math.max(0, Math.min(100, saved[key] as number)) / 100 : fallback;
  return { ...DEFAULT_AUDIO, volume: volume('masterVolume', .8), musicVolume: volume('musicVolume', .12), sfxVolume: volume('sfxVolume', .8), muted: saved.audioMuted === true, musicEnabled: saved.musicEnabled !== false, sfxEnabled: saved.sfxEnabled !== false, shuffle: saved.musicShuffle === true, loop: saved.musicLoop !== false, crossfade: saved.musicCrossfade !== false };
};

export const useAudio = () => {
  const [radio] = useState(() => new NewsroomRadio(readConfig()));
  const [config, setConfig] = useState(radio.config);
  const [state, setState] = useState(radio.snapshot);
  const sfx = useRef(new Map<string, HTMLAudioElement>());
  const mounted = useRef(true);
  const change = useCallback((patch: Partial<AudioConfig>) => {
    const next = { ...radio.config, ...patch };
    radio.updateConfig(next);
    setConfig(next);
    safeSetLocalStorageItem('gameSettings', JSON.stringify({ ...settings(), masterVolume: next.volume * 100, musicVolume: next.musicVolume * 100, sfxVolume: next.sfxVolume * 100, audioMuted: next.muted, musicEnabled: next.musicEnabled, sfxEnabled: next.sfxEnabled, musicShuffle: next.shuffle, musicLoop: next.loop, musicCrossfade: next.crossfade }));
  }, [radio]);
  useEffect(() => {
    mounted.current = true;
    const soundEffects = sfx.current;
    radio.onChange = setState;
    const unlock = () => radio.unlock();
    const visibility = () => radio.background(document.hidden);
    document.addEventListener('pointerdown', unlock);
    document.addEventListener('keydown', unlock);
    document.addEventListener('visibilitychange', visibility);
    return () => {
      mounted.current = false;
      document.removeEventListener('pointerdown', unlock);
      document.removeEventListener('keydown', unlock);
      document.removeEventListener('visibilitychange', visibility);
      radio.onChange = () => {};
      radio.dispose();
      soundEffects.forEach(audio => audio.pause());
      soundEffects.clear();
    };
  }, [radio]);
  const playSFX = useCallback(async (key: string) => {
    if (!radio.config.sfxEnabled || radio.config.muted) return;
    let audio = sfx.current.get(key);
    if (!audio) {
      let src = SFX_MANIFEST[key as keyof typeof SFX_MANIFEST] as string | undefined;
      if (!src && (PROCEDURAL_SFX_KEYS as readonly string[]).includes(key)) {
        try { src = (await loadProceduralSfx())[key as typeof PROCEDURAL_SFX_KEYS[number]]; } catch { return; }
      }
      if (!src || !mounted.current || !radio.config.sfxEnabled || radio.config.muted) return;
      audio = new Audio(resolveAudioSource(src));
      audio.preload = 'none';
      sfx.current.set(key, audio);
    }
    audio.volume = radio.config.volume * radio.config.sfxVolume;
    audio.currentTime = 0;
    try { await audio.play(); } catch { /* Cosmetic sound never blocks play or overwrites music status. */ }
  }, [radio]);
  const playMusic = useCallback((type?: MusicType) => radio.play(type), [radio]);
  const pauseMusic = useCallback(() => radio.pause(), [radio]);
  const resumeMusic = useCallback(() => { if (!radio.config.musicEnabled) change({ musicEnabled: true }); radio.resume(); }, [radio, change]);
  const stopMusic = useCallback(() => radio.stop(), [radio]);
  const selectTrack = useCallback((type: MusicType, index: number) => { if (!radio.config.musicEnabled) change({ musicEnabled: true }); radio.select(type, index); }, [radio, change]);
  const setMenuMusic = useCallback(() => radio.scene('menu', 'theme'), [radio]);
  const setFactionMusic = useCallback((faction: 'government' | 'truth') => radio.scene('factionSelect', faction), [radio]);
  const setGameplayMusic = useCallback((faction: 'government' | 'truth') => radio.scene('playing', faction), [radio]);
  const setEndCreditsMusic = useCallback(() => radio.play('endcredits'), [radio]);
  const queueMenuMusicAfterEnd = useCallback(() => radio.queueMenu(true), [radio]);
  const cancelMenuMusicQueue = useCallback(() => radio.queueMenu(false), [radio]);
  const clamp = (value: number) => Math.max(0, Math.min(1, value));
  return {
    config, ...state, tracksLoaded: true, availableTracks: radio.availableTracks,
    playMusic, pauseMusic, resumeMusic, stopMusic, selectTrack, playSFX,
    testSFX: () => playSFX('cardPlay'),
    setVolume: (value: number) => change({ volume: clamp(value) }),
    setMusicVolume: (value: number) => change({ musicVolume: clamp(value) }),
    setSfxVolume: (value: number) => change({ sfxVolume: clamp(value) }),
    toggleMute: () => change({ muted: !radio.config.muted }),
    toggleSFX: () => change({ sfxEnabled: !radio.config.sfxEnabled }),
    toggleMusic: () => { const enabled = !radio.config.musicEnabled; change({ musicEnabled: enabled }); if (enabled) radio.resume(); else radio.pause(); },
    setMenuMusic, setFactionMusic, setGameplayMusic, setEndCreditsMusic, queueMenuMusicAfterEnd, cancelMenuMusicQueue,
  };
};
