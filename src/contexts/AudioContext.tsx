import React, { createContext, useContext, ReactNode, useRef, useEffect } from 'react';
import { useAudio } from '@/hooks/useAudio';

type AudioContextType = ReturnType<typeof useAudio>;

const AudioContext = createContext<AudioContextType | null>(null);

export const AudioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const initCountRef = useRef(0);
  
  // Always call useAudio - hooks must be called consistently
  const audioSystem = useAudio();
  
  // Track initialization count but don't affect the hook call
  initCountRef.current++;
  
  // Only log on first few calls to reduce noise
  if (initCountRef.current <= 2) {
    console.log(`🎵 AudioProvider: Render #${initCountRef.current} - audio system ready`);
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