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
    volume: 0.3, // Start at 30% volume
    muted: false,
    musicEnabled: true,
    sfxEnabled: true
  });

  const [currentMusicType, setCurrentMusicType] = useState<MusicType>('theme');
  const [gameState, setGameState] = useState<GameState>('menu');
  const [tracksLoaded, setTracksLoaded] = useState(false);
  const [audioContextUnlocked, setAudioContextUnlocked] = useState(false);
  
  const currentMusicRef = useRef<HTMLAudioElement | null>(null);
  const nextMusicRef = useRef<HTMLAudioElement | null>(null);
  const sfxRefs = useRef<{ [key: string]: HTMLAudioElement }>({});
  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const playTokenRef = useRef(0);
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
    // Mobile audio context unlock function
    const unlockAudioContext = () => {
      if (audioContextUnlocked) return;
      setAudioContextUnlocked(true);
      console.log('Audio context unlocked via user interaction');
    };

    // Add click/tap/pointer event listener to unlock audio once
    const handleUserInteraction = () => {
      unlockAudioContext();
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('pointerdown', handleUserInteraction);
    };

    document.addEventListener('click', handleUserInteraction, { once: true });
    document.addEventListener('touchstart', handleUserInteraction, { once: true });
    document.addEventListener('pointerdown', handleUserInteraction, { once: true });
    // Robust audio loader that checks for existing files
    const loadAudioTrack = async (src: string): Promise<HTMLAudioElement | null> => {
      return new Promise((resolve) => {
        const audio = new Audio();
        audio.addEventListener('canplaythrough', () => {
          audio.loop = false;
          audio.volume = config.volume;
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
      
      const themeResults = await Promise.all(themePromises);
      const validThemeTracks = themeResults.filter(audio => audio !== null) as HTMLAudioElement[];
      
      // Only use background music as fallback if no theme tracks found
      if (validThemeTracks.length === 0) {
        const backgroundPromises = [
          loadAudioTrack(`/audio/background-music.mp3`),
          loadAudioTrack(`/audio/Background-music.mp3`)
        ];
        const backgroundResults = await Promise.all(backgroundPromises);
        musicTracks.current.theme = backgroundResults.filter(audio => audio !== null) as HTMLAudioElement[];
      } else {
        musicTracks.current.theme = validThemeTracks;
      }

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

      setTracksLoaded(true);
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
      currentMusicRef.current.volume = config.muted ? 0 : config.volume;
    }
    Object.values(musicTracks.current).flat().forEach(audio => {
      audio.volume = config.muted ? 0 : config.volume;
    });
    Object.values(sfxRefs.current).forEach(audio => {
      audio.volume = config.muted ? 0 : config.volume;
    });
  }, [config.volume, config.muted]);

  // Get next track for the current music type
  const getNextTrack = useCallback((musicType: MusicType): HTMLAudioElement | null => {
    const tracks = musicTracks.current[musicType];
    if (!tracks || tracks.length === 0) {
      console.warn(`No tracks available for music type: ${musicType}`);
      return null;
    }
    const currentIndex = currentTrackIndex.current[musicType];
    const nextIndex = (currentIndex + 1) % tracks.length;
    currentTrackIndex.current[musicType] = nextIndex;
    return tracks[nextIndex];
  }, []);

  // Fade between two audio elements
  const switchTrack = useCallback((fromAudio: HTMLAudioElement | null, toAudio: HTMLAudioElement | null) => {
    if (!toAudio || !audioContextUnlocked) {
      console.warn('Cannot play: toAudio is null or audio context not unlocked');
      return;
    }
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
    }
    if (fromAudio) {
      fromAudio.pause();
      fromAudio.currentTime = 0;
    }
    if (config.musicEnabled) {
      toAudio.volume = config.muted ? 0 : config.volume;
      toAudio.currentTime = 0;
      const playPromise = toAudio.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.log('Audio play prevented by browser policy:', error);
        });
      }
    }
  }, [config.musicEnabled, config.muted, config.volume, audioContextUnlocked]);

  // Play music based on current state
  const playMusic = useCallback((musicType?: MusicType) => {
    // Don't play music until tracks are loaded and audio context is unlocked (mobile requirement)
    if (!config.musicEnabled || config.muted || !tracksLoaded || !audioContextUnlocked) {
      console.log('Music playback blocked:', { 
        musicEnabled: config.musicEnabled, 
        muted: config.muted, 
        tracksLoaded, 
        audioContextUnlocked 
      });
      return;
    }

    const typeToPlay = musicType || currentMusicType;
    const nextTrack = getNextTrack(typeToPlay);
    
    if (!nextTrack) {
      console.warn(`No available track for music type: ${typeToPlay}`);
      return;
    }
    
    // Ensure only one track plays at a time
    if (currentMusicRef.current && currentMusicRef.current !== nextTrack) {
      currentMusicRef.current.onended = null;
    }

    const token = ++playTokenRef.current;

    switchTrack(currentMusicRef.current, nextTrack);
    currentMusicRef.current = nextTrack;

    nextTrack.onended = () => {
      if (playTokenRef.current !== token) return;
      playMusic(typeToPlay);
    };
  }, [config.musicEnabled, config.muted, currentMusicType, gameState, getNextTrack, switchTrack, tracksLoaded, audioContextUnlocked]);


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
        currentMusicRef.current.onended = null;
        currentMusicRef.current.pause();
        currentMusicRef.current.currentTime = 0;
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
    if (gameState === 'menu' && currentMusicType === 'theme' && currentMusicRef.current && !currentMusicRef.current.paused) return;
    setGameState('menu');
    setCurrentMusicType('theme');
    playMusic('theme');
  }, [gameState, currentMusicType, playMusic]);

  const setFactionMusic = useCallback((faction: 'government' | 'truth') => {
    if (gameState === 'factionSelect' && currentMusicType === faction && currentMusicRef.current && !currentMusicRef.current.paused) return;
    setGameState('factionSelect');
    setCurrentMusicType(faction);
    playMusic(faction);
  }, [gameState, currentMusicType, playMusic]);

  const setGameplayMusic = useCallback((faction: 'government' | 'truth') => {
    if (gameState === 'playing' && currentMusicType === faction && currentMusicRef.current && !currentMusicRef.current.paused) return;
    setGameState('playing');
    setCurrentMusicType(faction);
    playMusic(faction);
  }, [gameState, currentMusicType, playMusic]);

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