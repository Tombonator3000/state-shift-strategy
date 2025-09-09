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
    // Robust audio loader that checks for existing files
    const loadAudioTrack = async (src: string): Promise<HTMLAudioElement | null> => {
      return new Promise((resolve) => {
        const audio = new Audio();
        audio.addEventListener('canplaythrough', () => {
          audio.loop = false;
          audio.volume = config.volume * 0.3;
          resolve(audio);
        }, { once: true });
        audio.addEventListener('error', () => {
          console.log(`Audio file not found: ${src}`);
          resolve(null);
        }, { once: true });
        audio.src = src;
      });
    };

    const loadMusicTracks = async () => {
      // Load theme music tracks (1-4)
      const themePromises = [];
      for (let i = 1; i <= 4; i++) {
        themePromises.push(loadAudioTrack(`/muzak/Theme-${i}.mp3`));
      }
      
      // Try both case variations for background music
      themePromises.push(
        loadAudioTrack(`/audio/background-music.mp3`),
        loadAudioTrack(`/audio/Background-music.mp3`)
      );
      
      const themeResults = await Promise.all(themePromises);
      musicTracks.current.theme = themeResults.filter(audio => audio !== null) as HTMLAudioElement[];

      // Load government faction music tracks (1-3)
      const govPromises = [];
      for (let i = 1; i <= 3; i++) {
        govPromises.push(loadAudioTrack(`/muzak/Government-${i}.mp3`));
      }
      const govResults = await Promise.all(govPromises);
      musicTracks.current.government = govResults.filter(audio => audio !== null) as HTMLAudioElement[];

      // Load truth faction music tracks (1-3)
      const truthPromises = [];
      for (let i = 1; i <= 3; i++) {
        truthPromises.push(loadAudioTrack(`/muzak/Truth-${i}.mp3`));
      }
      const truthResults = await Promise.all(truthPromises);
      musicTracks.current.truth = truthResults.filter(audio => audio !== null) as HTMLAudioElement[];

      console.log('Loaded music tracks:', {
        theme: musicTracks.current.theme.length,
        government: musicTracks.current.government.length,
        truth: musicTracks.current.truth.length
      });
    };

    loadMusicTracks();

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