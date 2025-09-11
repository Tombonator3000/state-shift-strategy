import React, { createContext, useContext, ReactNode } from 'react';

// Create a simple fallback audio object for testing
const createFallbackAudio = () => ({
  config: { volume: 0.7, muted: false, musicEnabled: false, sfxEnabled: false },
  playMusic: (musicType?: string) => console.log('🎵 Fallback: playMusic called with', musicType),
  stopMusic: () => console.log('🎵 Fallback: stopMusic called'),
  pauseMusic: () => console.log('🎵 Fallback: pauseMusic called'),
  resumeMusic: () => console.log('🎵 Fallback: resumeMusic called'),
  playSFX: (soundName: string) => console.log('🎵 Fallback: playSFX called with', soundName),
  testSFX: () => console.log('🎵 Fallback: testSFX called'),
  setVolume: (volume: number) => console.log('🎵 Fallback: setVolume called with', volume),
  toggleMute: () => console.log('🎵 Fallback: toggleMute called'),
  toggleMusic: () => console.log('🎵 Fallback: toggleMusic called'),
  toggleSFX: () => console.log('🎵 Fallback: toggleSFX called'),
  setMenuMusic: () => console.log('🎵 Fallback: setMenuMusic called'),
  setFactionMusic: (faction: 'government' | 'truth') => console.log('🎵 Fallback: setFactionMusic called with', faction),
  setGameplayMusic: (faction: 'government' | 'truth') => console.log('🎵 Fallback: setGameplayMusic called with', faction),
  currentMusicType: 'theme' as const,
  gameState: 'menu' as const,
  isPlaying: false,
  currentTrackName: '',
  audioStatus: 'Fallback mode - audio disabled',
  tracksLoaded: false,
  audioContextUnlocked: false
});

type AudioContextType = ReturnType<typeof createFallbackAudio>;

const AudioContext = createContext<AudioContextType>(createFallbackAudio());

export const AudioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  console.log('🎵 AudioProvider: Using fallback audio system for now');
  
  // Temporarily use fallback to test if context works
  const fallbackAudio = createFallbackAudio();
  
  return (
    <AudioContext.Provider value={fallbackAudio}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudioContext = () => {
  const context = useContext(AudioContext);
  console.log('🎵 useAudioContext: Context accessed successfully');
  return context;
};