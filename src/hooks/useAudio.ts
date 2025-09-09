import { useState, useRef, useCallback, useEffect } from 'react';

interface AudioConfig {
  volume: number;
  muted: boolean;
  musicEnabled: boolean;
  sfxEnabled: boolean;
}

export const useAudio = () => {
  const [config, setConfig] = useState<AudioConfig>({
    volume: 0.7,
    muted: false,
    musicEnabled: true,
    sfxEnabled: true
  });

  const musicRef = useRef<HTMLAudioElement | null>(null);
  const sfxRefs = useRef<{ [key: string]: HTMLAudioElement }>({});

  // Initialize audio context
  useEffect(() => {
    // Create background music (placeholder URLs - replace with actual files)
    musicRef.current = new Audio('/audio/background-music.mp3');
    if (musicRef.current) {
      musicRef.current.loop = true;
      musicRef.current.volume = config.volume * 0.3; // Background music lower
    }

    // Create sound effects
    const sfxFiles = {
      cardPlay: '/audio/card-play.mp3',
      cardDraw: '/audio/card-draw.mp3',
      stateCapture: '/audio/state-capture.mp3',
      turnEnd: '/audio/turn-end.mp3',
      newspaper: '/audio/newspaper.mp3',
      victory: '/audio/victory.mp3',
      defeat: '/audio/defeat.mp3',
      hover: '/audio/hover.mp3',
      click: '/audio/click.mp3',
      typewriter: '/audio/typewriter.mp3'
    };

    Object.entries(sfxFiles).forEach(([key, src]) => {
      const audio = new Audio(src);
      audio.volume = config.volume;
      sfxRefs.current[key] = audio;
    });

    return () => {
      // Cleanup
      if (musicRef.current) {
        musicRef.current.pause();
      }
      Object.values(sfxRefs.current).forEach(audio => {
        audio.pause();
      });
    };
  }, []);

  // Update volumes when config changes
  useEffect(() => {
    if (musicRef.current) {
      musicRef.current.volume = config.muted ? 0 : config.volume * 0.3;
    }
    Object.values(sfxRefs.current).forEach(audio => {
      audio.volume = config.muted ? 0 : config.volume;
    });
  }, [config.volume, config.muted]);

  const playMusic = useCallback(() => {
    if (musicRef.current && config.musicEnabled && !config.muted) {
      musicRef.current.play().catch(console.error);
    }
  }, [config.musicEnabled, config.muted]);

  const stopMusic = useCallback(() => {
    if (musicRef.current) {
      musicRef.current.pause();
      musicRef.current.currentTime = 0;
    }
  }, []);

  const playSFX = useCallback((soundName: string) => {
    if (!config.sfxEnabled || config.muted) return;
    
    const audio = sfxRefs.current[soundName];
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(console.error);
    }
  }, [config.sfxEnabled, config.muted]);

  const setVolume = useCallback((volume: number) => {
    setConfig(prev => ({ ...prev, volume: Math.max(0, Math.min(1, volume)) }));
  }, []);

  const toggleMute = useCallback(() => {
    setConfig(prev => ({ ...prev, muted: !prev.muted }));
  }, []);

  const toggleMusic = useCallback(() => {
    setConfig(prev => {
      const newMusicEnabled = !prev.musicEnabled;
      if (!newMusicEnabled && musicRef.current) {
        musicRef.current.pause();
      } else if (newMusicEnabled) {
        playMusic();
      }
      return { ...prev, musicEnabled: newMusicEnabled };
    });
  }, [playMusic]);

  const toggleSFX = useCallback(() => {
    setConfig(prev => ({ ...prev, sfxEnabled: !prev.sfxEnabled }));
  }, []);

  return {
    config,
    playMusic,
    stopMusic,
    playSFX,
    setVolume,
    toggleMute,
    toggleMusic,
    toggleSFX
  };
};