import { createContext, useContext, type ReactNode } from 'react';
import { useAudio } from '@/hooks/useAudio';
const AudioContext = createContext<ReturnType<typeof useAudio> | null>(null);
export function AudioProvider({ children }: { children: ReactNode }) {
  const audio = useAudio();
  return <AudioContext.Provider value={audio}>{children}</AudioContext.Provider>;
}
export function useAudioContext() {
  const audio = useContext(AudioContext);
  if (!audio) throw new Error('useAudioContext must be used within an AudioProvider');
  return audio;
}
