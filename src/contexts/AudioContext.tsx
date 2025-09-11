import React, { createContext, useContext, ReactNode } from 'react';
import { useAudio } from '@/hooks/useAudio';

type AudioContextType = ReturnType<typeof useAudio>;

const AudioContext = createContext<AudioContextType | null>(null);

export const AudioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  console.log('🎵 AudioProvider: Initializing real audio system...');
  
  // Now use the real useAudio hook
  const audioSystem = useAudio();
  console.log('🎵 AudioProvider: Real audio system created successfully');
  
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
  console.log('🎵 useAudioContext: Using real audio system');
  return context;
};