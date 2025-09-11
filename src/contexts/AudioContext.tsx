import React, { createContext, useContext, ReactNode, useRef, useEffect } from 'react';
import { useAudio } from '@/hooks/useAudio';

type AudioContextType = ReturnType<typeof useAudio>;

const AudioContext = createContext<AudioContextType | null>(null);

export const AudioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const initCountRef = useRef(0);
  
  // Track initialization count
  initCountRef.current++;
  
  console.log(`🎵 AudioProvider: Render #${initCountRef.current} - initializing...`);
  
  // MUST call useAudio unconditionally - React hooks rule!
  const audioSystem = useAudio();
  
  console.log(`🎵 AudioProvider: Audio system created successfully on render #${initCountRef.current}`);
  
  // Validate that audioSystem is not null/undefined
  if (!audioSystem) {
    console.error('🎵 AudioProvider: Audio system is null!');
  }
  
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