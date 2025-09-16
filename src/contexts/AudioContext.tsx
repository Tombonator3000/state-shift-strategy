import React, { createContext, useContext, ReactNode, useRef, useEffect } from 'react';
import { useAudio } from '@/hooks/useAudio';

type AudioContextType = ReturnType<typeof useAudio>;

const AudioContext = createContext<AudioContextType | null>(null);

export const AudioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  console.log('🎵 AudioProvider: Starting render...');
  
  let audioSystem;
  try {
    audioSystem = useAudio();
    console.log('🎵 AudioProvider: useAudio completed successfully');
  } catch (error) {
    console.error('🎵 AudioProvider: Error in useAudio:', error);
    throw error; // Re-throw to prevent rendering with null context
  }
  
  if (!audioSystem) {
    console.error('🎵 AudioProvider: audioSystem is null/undefined!');
    throw new Error('AudioProvider: useAudio returned null');
  }
  
  console.log('🎵 AudioProvider: Providing context value');
  
  return (
    <AudioContext.Provider value={audioSystem}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudioContext = () => {
  console.log('🎵 useAudioContext: Attempting to access audio context...');
  const context = useContext(AudioContext);
  
  if (!context) {
    console.error('🎵 useAudioContext: Context is null/undefined!');
    console.error('🎵 useAudioContext: Make sure AudioProvider is wrapping this component');
    throw new Error('useAudioContext must be used within an AudioProvider');
  }
  
  console.log('🎵 useAudioContext: Successfully accessed audio context');
  return context;
};