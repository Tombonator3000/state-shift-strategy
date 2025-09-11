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
  // Load initial config from localStorage or defaults
  const [config, setConfig] = useState<AudioConfig>(() => {
    const saved = localStorage.getItem('gameSettings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          volume: (parsed.masterVolume || 70) / 100,
          muted: false,
          musicEnabled: true,
          sfxEnabled: true
        };
      } catch {
        console.log('🎵 Failed to parse saved audio settings, using defaults');
      }
    }
    return {
      volume: 0.7, // Default to 70%
      muted: false,
      musicEnabled: true,
      sfxEnabled: true
    };
  });

  const [currentMusicType, setCurrentMusicType] = useState<MusicType>('theme');
  const [gameState, setGameState] = useState<GameState>('menu');
  const [tracksLoaded, setTracksLoaded] = useState(false);
  const [audioContextUnlocked, setAudioContextUnlocked] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackName, setCurrentTrackName] = useState<string>('');
  const [audioStatus, setAudioStatus] = useState<string>('Initializing...');
  
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
      if (audioContextUnlocked) {
        console.log('🎵 Audio context already unlocked');
        return;
      }
      setAudioContextUnlocked(true);
      setAudioStatus('Audio context unlocked - ready to play');
      console.log('🎵 Audio context unlocked via user interaction - will auto-start menu music');
    };

    // Add click/tap/pointer event listener to unlock audio once
    const handleUserInteraction = () => {
      unlockAudioContext();
      setAudioStatus('Audio context unlocked - starting menu music');
      console.log('🎵 Audio context unlocked via user interaction');
      
      // Auto-start menu music after audio context unlock
      setTimeout(() => {
        if (config.musicEnabled && currentMusicType === 'theme') {
          console.log('🎵 Auto-starting menu music after user interaction');
          playMusic('theme');
        }
      }, 500);
      
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('pointerdown', handleUserInteraction);
    };

    document.addEventListener('click', handleUserInteraction, { once: true });
    document.addEventListener('touchstart', handleUserInteraction, { once: true });
    document.addEventListener('pointerdown', handleUserInteraction, { once: true });
    // Robust audio loader with better error handling
    const loadAudioTrack = async (src: string): Promise<HTMLAudioElement | null> => {
      return new Promise((resolve) => {
        const audio = new Audio();
        
        const onLoad = () => {
          audio.loop = false;
          audio.volume = config.volume;
          console.log(`🎵 Audio loaded: ${src}`);
          cleanup();
          resolve(audio);
        };
        
        const onError = (e: ErrorEvent | Event) => {
          console.warn(`🎵 Audio file failed to load: ${src}`, e);
          cleanup();
          resolve(null);
        };
        
        const cleanup = () => {
          audio.removeEventListener('canplaythrough', onLoad);
          audio.removeEventListener('error', onError);
          audio.removeEventListener('loadeddata', onLoad);
        };
        
        // Add timeout to prevent hanging
        setTimeout(() => {
          onError(new Event('timeout'));
        }, 5000);
        
        audio.addEventListener('canplaythrough', onLoad, { once: true });
        audio.addEventListener('loadeddata', onLoad, { once: true });
        audio.addEventListener('error', onError, { once: true });
        
        try {
          audio.src = src;
        } catch (error) {
          onError(new ErrorEvent('source-error', { error }));
        }
      });
    };

    const loadMusicTracks = async () => {
      console.log('🎵 Loading music tracks...');
      
      // Load theme music tracks (1-4) - DISABLE FALLBACK BACKGROUND MUSIC
      const themePromises = [];
      for (let i = 1; i <= 4; i++) {
        themePromises.push(loadAudioTrack(`/muzak/Theme-${i}.mp3`));
      }
      
      const themeResults = await Promise.all(themePromises);
      const validThemeTracks = themeResults.filter(audio => audio !== null) as HTMLAudioElement[];
      
      // REMOVED FALLBACK - no more background-music.mp3 chaos
      musicTracks.current.theme = validThemeTracks;
      console.log('🎵 Theme tracks loaded:', validThemeTracks.length);

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

      console.log('🎵 Loaded music tracks:', {
        theme: musicTracks.current.theme.length,
        government: musicTracks.current.government.length,
        truth: musicTracks.current.truth.length
      });

      setTracksLoaded(true);
      setAudioStatus('Ready - No fallback music');
    };

    loadMusicTracks();

    // Create sound effects with fallback handling
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
      lightClick: '/audio/click.mp3', // Very light sound for buttons
      error: '/audio/click.mp3' // Fallback for error sound
    };

    // Load SFX asynchronously with error handling
    const loadSFX = async () => {
      const loadPromises = Object.entries(sfxFiles).map(async ([key, src]) => {
        const audio = await loadAudioTrack(src);
        if (audio) {
          audio.volume = config.volume;
          sfxRefs.current[key] = audio;
        } else {
          // Create silent audio element as fallback
          const silentAudio = new Audio();
          silentAudio.volume = 0;
          sfxRefs.current[key] = silentAudio;
        }
      });
      
      await Promise.all(loadPromises);
      console.log('🎵 SFX loaded:', Object.keys(sfxRefs.current).length, 'sounds');
      setAudioStatus('Ready');
    };

    loadSFX();

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

  // Update volumes when config changes and sync to localStorage
  useEffect(() => {
    console.log('🎵 Volume updated:', { volume: config.volume, muted: config.muted });
    
    if (currentMusicRef.current) {
      currentMusicRef.current.volume = config.muted ? 0 : config.volume;
    }
    Object.values(musicTracks.current).flat().forEach(audio => {
      audio.volume = config.muted ? 0 : config.volume;
    });
    Object.values(sfxRefs.current).forEach(audio => {
      audio.volume = config.muted ? 0 : config.volume;
    });

    // Sync volume to localStorage (gameSettings)
    const saved = localStorage.getItem('gameSettings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        parsed.masterVolume = Math.round(config.volume * 100);
        localStorage.setItem('gameSettings', JSON.stringify(parsed));
      } catch (e) {
        console.warn('🎵 Failed to sync audio settings to localStorage');
      }
    }
  }, [config.volume, config.muted]);

  const getNextTrack = useCallback((musicType: MusicType): HTMLAudioElement | null => {
    console.log('🎵 getNextTrack called for:', musicType);
    const tracks = musicTracks.current[musicType];
    if (!tracks || tracks.length === 0) {
      console.warn(`No tracks available for music type: ${musicType}`);
      return null;
    }
    const currentIndex = currentTrackIndex.current[musicType];
    const nextIndex = (currentIndex + 1) % tracks.length;
    currentTrackIndex.current[musicType] = nextIndex;
    console.log('🎵 Selected track index:', nextIndex, 'of', tracks.length);
    return tracks[nextIndex];
  }, []);

  const switchTrack = useCallback((fromAudio: HTMLAudioElement | null, toAudio: HTMLAudioElement | null) => {
    console.log('🎵 switchTrack called', { fromAudio: !!fromAudio, toAudio: !!toAudio });
    
    if (!toAudio || !audioContextUnlocked) {
      console.warn('🎵 Cannot play: toAudio is null or audio context not unlocked');
      setAudioStatus('Cannot play - audio locked');
      return;
    }
    
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
    }
    
    if (fromAudio) {
      fromAudio.pause();
      fromAudio.currentTime = 0;
      setIsPlaying(false);
    }
    
    if (config.musicEnabled) {
      toAudio.volume = config.muted ? 0 : config.volume;
      toAudio.currentTime = 0;
      
      const trackName = toAudio.src.split('/').pop() || 'Unknown';
      setCurrentTrackName(trackName);
      console.log('🎵 Switching to track:', trackName);
      
      const playPromise = toAudio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            setAudioStatus(`Playing: ${trackName}`);
            console.log('🎵 Track playing successfully');
          })
          .catch(error => {
            console.log('🎵 Audio play prevented by browser policy:', error);
            setAudioStatus('Playback blocked by browser');
            setIsPlaying(false);
          });
      }
    }
  }, [config.musicEnabled, config.muted, config.volume, audioContextUnlocked]);

  // Play music based on current state
  const playMusic = useCallback((musicType?: MusicType) => {
    console.log('🎵 playMusic called with type:', musicType, 'current state:', {
      musicEnabled: config.musicEnabled,
      muted: config.muted,
      tracksLoaded,
      audioContextUnlocked,
      currentlyPlaying: !!currentMusicRef.current
    });
    
    // Don't play music until tracks are loaded and audio context is unlocked (mobile requirement)
    if (!config.musicEnabled || config.muted || !tracksLoaded || !audioContextUnlocked) {
      console.log('🎵 Music playback blocked:', { 
        musicEnabled: config.musicEnabled, 
        muted: config.muted, 
        tracksLoaded, 
        audioContextUnlocked 
      });
      setAudioStatus('Music blocked - check settings');
      return;
    }

    const typeToPlay = musicType || currentMusicType;
    const nextTrack = getNextTrack(typeToPlay);
    
    if (!nextTrack) {
      console.warn(`🎵 No available track for music type: ${typeToPlay}`);
      setAudioStatus(`No tracks available for: ${typeToPlay}`);
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
    
    console.log('🎵 playMusic completed for type:', typeToPlay);
  }, [config.musicEnabled, config.muted, currentMusicType, gameState, getNextTrack, switchTrack, tracksLoaded, audioContextUnlocked]);


  const stopMusic = useCallback(() => {
    console.log('🎵 Stopping music');
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
    }
    if (currentMusicRef.current) {
      currentMusicRef.current.pause();
      currentMusicRef.current.currentTime = 0;
      currentMusicRef.current.onended = null;
    }
    setIsPlaying(false);
    setCurrentTrackName('');
    setAudioStatus('Music stopped');
  }, []);

  const pauseMusic = useCallback(() => {
    console.log('🎵 pauseMusic called - current state:', { isPlaying, hasCurrentMusic: !!currentMusicRef.current });
    if (currentMusicRef.current && !currentMusicRef.current.paused) {
      currentMusicRef.current.pause();
      setIsPlaying(false);
      setAudioStatus('Music paused');
      console.log('🎵 Music paused successfully');
    } else {
      console.log('🎵 Cannot pause - no music playing or already paused');
    }
  }, []);

  const resumeMusic = useCallback(() => {
    console.log('🎵 resumeMusic called - current state:', { 
      hasCurrentMusic: !!currentMusicRef.current, 
      isPaused: currentMusicRef.current?.paused,
      audioContextUnlocked,
      currentTrackName 
    });
    
    if (currentMusicRef.current && currentMusicRef.current.paused && audioContextUnlocked) {
      const playPromise = currentMusicRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            setAudioStatus(`Playing: ${currentTrackName}`);
            console.log('🎵 Music resumed successfully');
          })
          .catch(error => {
            console.log('🎵 Resume failed:', error);
            setAudioStatus('Resume failed');
          });
      }
    } else {
      console.log('🎵 Cannot resume - no paused music or audio context locked');
    }
  }, [audioContextUnlocked, currentTrackName]);

  const playSFX = useCallback((soundName: string) => {
    if (!config.sfxEnabled || config.muted || !audioContextUnlocked) {
      console.log('🎵 SFX blocked:', soundName, { sfxEnabled: config.sfxEnabled, muted: config.muted, unlocked: audioContextUnlocked });
      return;
    }
    
    const audio = sfxRefs.current[soundName];
    if (audio) {
      try {
        console.log('🎵 Playing SFX:', soundName);
        // Reduce volume for light click specifically
        if (soundName === 'lightClick') {
          const originalVolume = audio.volume;
          audio.volume = originalVolume * 0.3; // Very quiet
          audio.currentTime = 0;
          audio.play().catch(() => {}); // Silently fail
          // Reset volume after playing
          setTimeout(() => {
            audio.volume = originalVolume;
          }, 100);
        } else {
          audio.currentTime = 0;
          audio.play().catch(() => {}); // Silently fail
        }
      } catch (error) {
        console.debug('🎵 SFX play failed:', soundName, error);
      }
    } else {
      console.debug('🎵 SFX not found:', soundName);
    }
  }, [config.sfxEnabled, config.muted, audioContextUnlocked]);

  const testSFX = useCallback(() => {
    const testSounds = ['click', 'hover', 'cardPlay', 'cardDraw'];
    const randomSound = testSounds[Math.floor(Math.random() * testSounds.length)];
    console.log('🎵 Testing SFX:', randomSound);
    playSFX(randomSound);
  }, [playSFX]);

  const setVolume = useCallback((volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    console.log('🎵 Setting volume to:', Math.round(clampedVolume * 100) + '%');
    setConfig(prev => ({ ...prev, volume: clampedVolume }));
  }, []);

  const toggleMute = useCallback(() => {
    setConfig(prev => ({ ...prev, muted: !prev.muted }));
  }, []);

  const toggleMusic = useCallback(() => {
    console.log('🎵 toggleMusic called - current state:', config.musicEnabled);
    setConfig(prev => {
      const newMusicEnabled = !prev.musicEnabled;
      console.log('🎵 Music toggled to:', newMusicEnabled);
      
      if (!newMusicEnabled && currentMusicRef.current) {
        console.log('🎵 Stopping music due to toggle off');
        currentMusicRef.current.onended = null;
        currentMusicRef.current.pause();
        currentMusicRef.current.currentTime = 0;
        setIsPlaying(false);
        setAudioStatus('Music disabled');
      } else if (newMusicEnabled) {
        console.log('🎵 Starting music due to toggle on');
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
    console.log('🎵 setMenuMusic called');
    if (gameState === 'menu' && currentMusicType === 'theme' && currentMusicRef.current && !currentMusicRef.current.paused) {
      console.log('🎵 setMenuMusic - already playing theme music');
      return;
    }
    setGameState('menu');
    setCurrentMusicType('theme');
    playMusic('theme');
  }, [gameState, currentMusicType, playMusic]);

  const setFactionMusic = useCallback((faction: 'government' | 'truth') => {
    console.log('🎵 setFactionMusic called with:', faction);
    if (gameState === 'factionSelect' && currentMusicType === faction && currentMusicRef.current && !currentMusicRef.current.paused) {
      console.log('🎵 setFactionMusic - already playing faction music');
      return;
    }
    setGameState('factionSelect');
    setCurrentMusicType(faction);
    playMusic(faction);
  }, [gameState, currentMusicType, playMusic]);

  const setGameplayMusic = useCallback((faction: 'government' | 'truth') => {
    console.log('🎵 setGameplayMusic called with:', faction);
    if (gameState === 'playing' && currentMusicType === faction && currentMusicRef.current && !currentMusicRef.current.paused) {
      console.log('🎵 setGameplayMusic - already playing gameplay music');
      return;
    }
    setGameState('playing');
    setCurrentMusicType(faction);
    playMusic(faction);
  }, [gameState, currentMusicType, playMusic]);

  return {
    config,
    playMusic,
    stopMusic,
    pauseMusic,
    resumeMusic,
    playSFX,
    testSFX,
    setVolume,
    toggleMute,
    toggleMusic,
    toggleSFX,
    setMenuMusic,
    setFactionMusic,
    setGameplayMusic,
    currentMusicType,
    gameState,
    isPlaying,
    currentTrackName,
    audioStatus,
    tracksLoaded,
    audioContextUnlocked
  };
};