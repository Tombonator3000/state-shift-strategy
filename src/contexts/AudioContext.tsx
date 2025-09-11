import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { useAudio } from '@/hooks/useAudio';

type AudioContextType = ReturnType<typeof useAudio>;

const AudioContext = createContext<AudioContextType | null>(null);

export const AudioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  console.log('🎵 AudioProvider: Creating single audio system instance');
  
  // Memoize the audio system to prevent recreation on re-renders
  const audioSystem = useMemo(() => {
    const system = useAudio();
    console.log('🎵 Audio system created and memoized');
    return system;
  }, []);
  
  return (
    <AudioContext.Provider value={audioSystem}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudioContext = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudioContext must be used within an AudioProvider');
  }
  console.log('🎵 useAudioContext: Using shared audio system');
  return context;
};