import { useState, useEffect } from 'react';
import { AudioManager } from '../audio/AudioManager';
import type { AudioState, CrossfadeOptions } from '../audio/AudioManager';
import type { BGMTrackId, SFXTrackId, SceneId } from '../audio/tracks';

export const useAudioManager = () => {
  const [state, setState] = useState<AudioState>(AudioManager.getState());

  useEffect(() => {
    const unsubscribe = AudioManager.subscribe(setState);
    return unsubscribe;
  }, []);

  return {
    // State
    ...state,
    
    // BGM Controls
    playBgm: (trackId: BGMTrackId, options?: CrossfadeOptions) => AudioManager.playBgm(trackId, options),
    pauseBgm: () => AudioManager.pauseBgm(),
    resumeBgm: () => AudioManager.resumeBgm(),
    stopBgm: () => AudioManager.stopBgm(),
    
    // SFX Controls
    playSfx: (soundId: SFXTrackId) => AudioManager.playSfx(soundId),
    
    // Volume Controls
    setVolumes: AudioManager.setVolumes.bind(AudioManager),
    mute: (isMuted: boolean) => AudioManager.mute(isMuted),
    
    // Scene Management
    setScene: (scene: SceneId) => AudioManager.setScene(scene),
    startGameplay: (faction: 'government' | 'truth') => AudioManager.startGameplay(faction),
    
    // System
    enableAudio: () => AudioManager.enableAudio()
  };
};