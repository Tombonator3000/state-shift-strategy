import React, { createContext, useContext, ReactNode } from 'react';
import { useAudio } from '@/hooks/useAudio';

type AudioContextType = ReturnType<typeof useAudio>;

const AudioContext = createContext<AudioContextType | null>(null);

export const AudioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  console.log('🎵 AudioProvider: Creating single audio system instance');
  const audioSystem = useAudio();
  
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