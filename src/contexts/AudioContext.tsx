import React, { createContext, useContext, ReactNode, useRef, useEffect } from 'react';
import { useAudio } from '@/hooks/useAudio';

type AudioContextType = ReturnType<typeof useAudio>;

const AudioContext = createContext<AudioContextType | null>(null);

export const AudioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const initializeRef = useRef(false);
  
  // Only initialize once using a ref to prevent multiple initializations
  useEffect(() => {
    if (!initializeRef.current) {
      console.log('🎵 AudioProvider: First-time initialization');
      initializeRef.current = true;
    }
  }, []);
  
  // Always call useAudio - hooks must be called consistently
  const audioSystem = useAudio();
  
  // Only log after first initialization to reduce noise
  if (initializeRef.current) {
    console.log('🎵 AudioProvider: Using stable audio system');
  }
  
  return (
    <AudioContext.Provider value={audioSystem}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudioContext = () => {
  const context = useContext(AudioContext);
  if (!context) {
    console.error('🎵 useAudioContext: No audio context available');
    throw new Error('useAudioContext must be used within an AudioProvider');
  }
  return context;
};