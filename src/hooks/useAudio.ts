import { useState, useRef, useCallback, useEffect } from 'react';

interface AudioConfig {
  volume: number;
  muted: boolean;
  musicEnabled: boolean;
  sfxEnabled: boolean;
}

type MusicType = 'theme' | 'government' | 'truth';
type GameState = 'menu' | 'factionSelect' | 'playing';

export const useAudio = () => {
  const [config, setConfig] = useState<AudioConfig>({
    volume: 0.7,
    muted: false,
    musicEnabled: true,
    sfxEnabled: true
  });

  const [currentMusicType, setCurrentMusicType] = useState<MusicType>('theme');
  const [gameState, setGameState] = useState<GameState>('menu');
  
  const currentMusicRef = useRef<HTMLAudioElement | null>(null);
  const nextMusicRef = useRef<HTMLAudioElement | null>(null);
  const sfxRefs = useRef<{ [key: string]: HTMLAudioElement }>({});
  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Music track arrays
  const musicTracks = useRef<{ [key in MusicType]: HTMLAudioElement[] }>({
    theme: [],
    government: [],
    truth: []
  });
  
  const currentTrackIndex = useRef<{ [key in MusicType]: number }>({
    theme: 0,
    government: 0,
    truth: 0
  });

  // Initialize audio context
  useEffect(() => {
    // Create theme music tracks
    for (let i = 1; i <= 4; i++) {
      const audio = new Audio(`/muzak/Theme-${i}.mp3`);
      audio.loop = false;
      audio.volume = config.volume * 0.3;
      musicTracks.current.theme.push(audio);
    }

    // Add background-music.mp3 as additional theme track
    try {
      const backgroundAudio = new Audio(`/audio/background-music.mp3`);
      backgroundAudio.loop = false;
      backgroundAudio.volume = config.volume * 0.3;
      musicTracks.current.theme.push(backgroundAudio);
    } catch (error) {
      console.log('Background music file not found, using existing tracks');
    }

    // Create government faction music tracks
    for (let i = 1; i <= 3; i++) {
      const audio = new Audio(`/muzak/Government-${i}.mp3`);
      audio.loop = false;
      audio.volume = config.volume * 0.3;
      musicTracks.current.government.push(audio);
    }

    // Create truth faction music tracks
    for (let i = 1; i <= 3; i++) {
      const audio = new Audio(`/muzak/Truth-${i}.mp3`);
      audio.loop = false;
      audio.volume = config.volume * 0.3;
      musicTracks.current.truth.push(audio);
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
      typewriter: '/audio/typewriter.mp3',
      lightClick: '/audio/click.mp3' // Very light sound for buttons
    };

    Object.entries(sfxFiles).forEach(([key, src]) => {
      const audio = new Audio(src);
      audio.volume = config.volume;
      sfxRefs.current[key] = audio;
    });

    return () => {
      // Cleanup
      if (currentMusicRef.current) {
        currentMusicRef.current.pause();
      }
      if (nextMusicRef.current) {
        nextMusicRef.current.pause();
      }
      Object.values(musicTracks.current).flat().forEach(audio => {
        audio.pause();
      });
      Object.values(sfxRefs.current).forEach(audio => {
        audio.pause();
      });
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
      }
    };
  }, []);

  // Update volumes when config changes
  useEffect(() => {
    if (currentMusicRef.current) {
      currentMusicRef.current.volume = config.muted ? 0 : config.volume * 0.3;
    }
    Object.values(musicTracks.current).flat().forEach(audio => {
      audio.volume = config.muted ? 0 : config.volume * 0.3;
    });
    Object.values(sfxRefs.current).forEach(audio => {
      audio.volume = config.muted ? 0 : config.volume;
    });
  }, [config.volume, config.muted]);

  // Get next track for the current music type
  const getNextTrack = useCallback((musicType: MusicType): HTMLAudioElement => {
    const tracks = musicTracks.current[musicType];
    const currentIndex = currentTrackIndex.current[musicType];
    const nextIndex = (currentIndex + 1) % tracks.length;
    currentTrackIndex.current[musicType] = nextIndex;
    return tracks[nextIndex];
  }, []);

  // Fade between two audio elements
  const crossFade = useCallback((fromAudio: HTMLAudioElement | null, toAudio: HTMLAudioElement, duration: number = 2000) => {
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
    }

    const steps = 50;
    const stepDuration = duration / steps;
    let step = 0;

    const initialFromVolume = fromAudio ? fromAudio.volume : 0;
    const targetToVolume = config.muted ? 0 : config.volume * 0.3;

    // Start playing the new audio
    if (config.musicEnabled && !config.muted) {
      toAudio.volume = 0;
      toAudio.currentTime = 0;
      toAudio.play().catch(console.error);
    }

    fadeIntervalRef.current = setInterval(() => {
      step++;
      const progress = step / steps;

      if (fromAudio) {
        fromAudio.volume = initialFromVolume * (1 - progress);
      }
      
      if (config.musicEnabled && !config.muted) {
        toAudio.volume = targetToVolume * progress;
      }

      if (step >= steps) {
        if (fromAudio) {
          fromAudio.pause();
          fromAudio.currentTime = 0;
        }
        if (fadeIntervalRef.current) {
          clearInterval(fadeIntervalRef.current);
        }
      }
    }, stepDuration);
  }, [config.musicEnabled, config.muted, config.volume]);

  // Play music based on current state
  const playMusic = useCallback((musicType?: MusicType) => {
    if (!config.musicEnabled || config.muted) return;

    const typeToPlay = musicType || currentMusicType;
    const nextTrack = getNextTrack(typeToPlay);
    
    crossFade(currentMusicRef.current, nextTrack);
    currentMusicRef.current = nextTrack;
    
    // Set up event listener for when track ends
    nextTrack.addEventListener('ended', () => {
      if (gameState === 'playing') {
        // Alternate between faction music and theme music during gameplay
        const nextType = currentMusicType === 'theme' ? 
          (typeToPlay === 'government' ? 'government' : 'truth') : 'theme';
        setCurrentMusicType(nextType);
        playMusic(nextType);
      } else {
        // Continue with same type during menu/faction select
        playMusic(typeToPlay);
      }
    });
  }, [config.musicEnabled, config.muted, currentMusicType, gameState, getNextTrack, crossFade]);

  const stopMusic = useCallback(() => {
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
    }
    if (currentMusicRef.current) {
      currentMusicRef.current.pause();
      currentMusicRef.current.currentTime = 0;
    }
  }, []);

  const playSFX = useCallback((soundName: string) => {
    if (!config.sfxEnabled || config.muted) return;
    
    const audio = sfxRefs.current[soundName];
    if (audio) {
      // Reduce volume for light click specifically
      if (soundName === 'lightClick') {
        const originalVolume = audio.volume;
        audio.volume = originalVolume * 0.3; // Very quiet
        audio.currentTime = 0;
        audio.play().catch(console.error);
        // Reset volume after playing
        setTimeout(() => {
          audio.volume = originalVolume;
        }, 100);
      } else {
        audio.currentTime = 0;
        audio.play().catch(console.error);
      }
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
      if (!newMusicEnabled && currentMusicRef.current) {
        currentMusicRef.current.pause();
      } else if (newMusicEnabled) {
        playMusic();
      }
      return { ...prev, musicEnabled: newMusicEnabled };
    });
  }, [playMusic]);

  const toggleSFX = useCallback(() => {
    setConfig(prev => ({ ...prev, sfxEnabled: !prev.sfxEnabled }));
  }, []);

  // New functions for game state management
  const setMenuMusic = useCallback(() => {
    setGameState('menu');
    setCurrentMusicType('theme');
    playMusic('theme');
  }, [playMusic]);

  const setFactionMusic = useCallback((faction: 'government' | 'truth') => {
    setGameState('factionSelect');
    setCurrentMusicType(faction);
    playMusic(faction);
  }, [playMusic]);

  const setGameplayMusic = useCallback((faction: 'government' | 'truth') => {
    setGameState('playing');
    setCurrentMusicType(faction);
    playMusic(faction);
  }, [playMusic]);

  return {
    config,
    playMusic,
    stopMusic,
    playSFX,
    setVolume,
    toggleMute,
    toggleMusic,
    toggleSFX,
    setMenuMusic,
    setFactionMusic,
    setGameplayMusic,
    currentMusicType,
    gameState
  };
};