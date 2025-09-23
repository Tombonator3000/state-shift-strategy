import { useState, useRef, useCallback, useEffect } from 'react';
import { UFO_ELVIS_DATA_URL } from '../assets/audio/ufoElvisDataUrl';

interface AudioConfig {
  volume: number;
  musicVolume: number;
  sfxVolume: number;
  muted: boolean;
  musicEnabled: boolean;
  sfxEnabled: boolean;
  shuffle: boolean;
  loop: boolean;
  crossfade: boolean;
}

type MusicType = 'theme' | 'government' | 'truth' | 'endcredits';
type GameState = 'menu' | 'factionSelect' | 'playing';

export const useAudio = () => {
  console.log('🎵 useAudio: Hook called - initializing...');
  
  // Load initial config from localStorage or defaults
  const [config, setConfig] = useState<AudioConfig>(() => {
    console.log('🎵 useAudio: Loading initial config...');
    const saved = localStorage.getItem('gameSettings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        console.log('🎵 useAudio: Loaded saved audio config');
        const rawMasterVolume = typeof parsed.masterVolume === 'number'
          ? parsed.masterVolume
          : 80;
        const rawSfxVolume = typeof parsed.sfxVolume === 'number'
          ? parsed.sfxVolume
          : 80;
        const rawMusicVolume = typeof parsed.musicVolume === 'number'
          ? parsed.musicVolume
          : 20;

        const normalizeVolume = (value: number) => {
          const clamped = Math.max(0, Math.min(100, value));
          return clamped > 1 ? clamped / 100 : clamped;
        };

        return {
          volume: normalizeVolume(rawMasterVolume),
          musicVolume: normalizeVolume(rawMusicVolume),
          sfxVolume: normalizeVolume(rawSfxVolume),
          muted: false,
          musicEnabled: parsed.musicEnabled !== false,
          sfxEnabled: parsed.sfxEnabled !== false,
          shuffle: parsed.musicShuffle || false,
          loop: parsed.musicLoop !== false,
          crossfade: parsed.musicCrossfade !== false
        };
      } catch {
        console.log('🎵 useAudio: Failed to parse saved audio settings, using defaults');
      }
    }
    console.log('🎵 useAudio: Using default audio config');
    return {
      volume: 0.8, // Default to 80%
      musicVolume: 0.2,
      sfxVolume: 0.8,
      muted: false,
      musicEnabled: true,
      sfxEnabled: true,
      shuffle: false,
      loop: true,
      crossfade: true
    };
  });

  const [currentMusicType, setCurrentMusicType] = useState<MusicType>('theme');
  const [gameState, setGameState] = useState<GameState>('menu');
  const [tracksLoaded, setTracksLoaded] = useState(false);
  const [audioContextUnlocked, setAudioContextUnlocked] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackName, setCurrentTrackName] = useState<string>('');
  const [audioStatus, setAudioStatus] = useState<string>('Initializing...');
  const [previousTrackRef, setPreviousTrackRef] = useState<HTMLAudioElement | null>(null);
  const [hoverPreventRestart, setHoverPreventRestart] = useState(false);
  
  console.log('🎵 useAudio: State initialized');
  
  const currentMusicRef = useRef<HTMLAudioElement | null>(null);
  const nextMusicRef = useRef<HTMLAudioElement | null>(null);
  const sfxRefs = useRef<{ [key: string]: HTMLAudioElement }>({});
  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const playTokenRef = useRef(0);
  const resumeMenuAfterEndRef = useRef(false);
  const menuMusicCallbackRef = useRef<(() => void) | null>(null);
  // Music track arrays
  const musicTracks = useRef<{ [key in MusicType]: HTMLAudioElement[] }>({
    theme: [],
    government: [],
    truth: [],
    endcredits: []
  });
  
  const currentTrackIndex = useRef<{ [key in MusicType]: number }>({
    theme: 0,
    government: 0,
    truth: 0,
    endcredits: 0
  });

  // Initialize audio context - only run once
  useEffect(() => {
    // Prevent duplicate initialization
    if (tracksLoaded) {
      console.log('🎵 Audio already initialized, skipping...');
      return;
    }
    
    console.log('🎵 useAudio: Initializing audio system...');

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
          const baseMusicVolume = config.muted ? 0 : config.volume * config.musicVolume;
          audio.volume = baseMusicVolume;
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
      
      // Load theme music tracks for start screen
      const themeTracks = ['/muzak/Theme-1.mp3', '/muzak/Theme-2.mp3'];
      console.log('🎵 Attempting to load theme tracks:', themeTracks);
      const themePromises = themeTracks.map(track => loadAudioTrack(track));
      
      const themeResults = await Promise.all(themePromises);
      const validThemeTracks = themeResults.filter(audio => audio !== null) as HTMLAudioElement[];
      
      musicTracks.current.theme = validThemeTracks;
      console.log('🎵 Theme tracks loaded:', validThemeTracks.length, 'out of', themeTracks.length);

      // Load government faction music tracks in specific order
      const govTracks = ['/muzak/Government-2.mp3', '/muzak/Government-1.mp3', '/muzak/Government-3.mp3'];
      console.log('🎵 Attempting to load government tracks:', govTracks);
      const govPromises = govTracks.map(track => loadAudioTrack(track));
      const govResults = await Promise.all(govPromises);
      musicTracks.current.government = govResults.filter(audio => audio !== null) as HTMLAudioElement[];
      console.log('🎵 Government tracks loaded:', musicTracks.current.government.length, 'out of', govTracks.length);

      // Load truth faction music tracks in specific order
      const truthTracks = ['/muzak/Truth-1.mp3', '/muzak/Truth-2.mp3', '/muzak/Truth-3.mp3'];
      console.log('🎵 Attempting to load truth tracks:', truthTracks);
      const truthPromises = truthTracks.map(track => loadAudioTrack(track));
      const truthResults = await Promise.all(truthPromises);
      musicTracks.current.truth = truthResults.filter(audio => audio !== null) as HTMLAudioElement[];
      console.log('🎵 Truth tracks loaded:', musicTracks.current.truth.length, 'out of', truthTracks.length);

      // Load end credits music
      const endCreditsAudio = await loadAudioTrack('/muzak/endcredits-theme.mp3');
      if (endCreditsAudio) {
        musicTracks.current.endcredits = [endCreditsAudio];
      }

      console.log('🎵 Final loaded music tracks:', {
        theme: musicTracks.current.theme.length,
        government: musicTracks.current.government.length,
        truth: musicTracks.current.truth.length,
        endcredits: musicTracks.current.endcredits.length
      });

      // Log which specific tracks were successfully loaded
      console.log('🎵 Successfully loaded theme tracks:', musicTracks.current.theme.map(audio => audio.src));
      console.log('🎵 Successfully loaded government tracks:', musicTracks.current.government.map(audio => audio.src));
      console.log('🎵 Successfully loaded truth tracks:', musicTracks.current.truth.map(audio => audio.src));

      setTracksLoaded(true);
      setAudioStatus('Ready - All tracks loaded');
    };

    loadMusicTracks();

    // Create sound effects with fallback handling - use existing files for paranormal effects
    const existingSfxFiles = {
      cardPlay: '/audio/card-play.mp3',
      flash: '/audio/card-play.mp3',
      cardDraw: '/audio/card-draw.mp3',
      stateCapture: '/audio/state-capture.mp3',
      turnEnd: '/audio/turn-end.mp3',
      newspaper: '/audio/newspaper.mp3',
      victory: '/audio/victory.mp3',
      defeat: '/audio/defeat.mp3',
      hover: '/audio/hover.mp3',
      click: '/audio/click.mp3',
      typewriter: '/audio/typewriter.mp3',
      lightClick: '/audio/click.mp3', // Reuse click sound
      error: '/audio/click.mp3', // Fallback for error sound
      // Paranormal effects - using creative fallbacks until proper sounds are added
      'ufo-elvis': UFO_ELVIS_DATA_URL, // Generated shortwave broadcast sting for UFO/Elvis reports
      'cryptid-rumble': '/audio/defeat.mp3', // Use defeat sound as rumble
      'radio-static': '/audio/typewriter.mp3' // Use typewriter as static
    };

    // Load SFX asynchronously with error handling
    const loadSFX = async () => {
      const loadPromises = Object.entries(existingSfxFiles).map(async ([key, src]) => {
        const audio = await loadAudioTrack(src);
        if (audio) {
          const baseSfxVolume = config.muted ? 0 : config.volume * config.sfxVolume;
          audio.volume = baseSfxVolume;
          sfxRefs.current[key] = audio;
        } else {
          // Create silent audio element as fallback
          console.log(`🎵 SFX not available: ${key}, using silent fallback`);
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

  // Update volumes when config changes and sync to localStorage - but prevent excessive calls
  useEffect(() => {
    console.log('🎵 Volume update triggered:', {
      volume: config.volume,
      musicVolume: config.musicVolume,
      sfxVolume: config.sfxVolume,
      muted: config.muted
    });

    const musicVolume = config.muted ? 0 : config.volume * config.musicVolume;
    const sfxVolume = config.muted ? 0 : config.volume * config.sfxVolume;

    if (currentMusicRef.current) {
      currentMusicRef.current.volume = musicVolume;
    }
    Object.values(musicTracks.current).flat().forEach(audio => {
      audio.volume = musicVolume;
    });
    Object.values(sfxRefs.current).forEach(audio => {
      audio.volume = sfxVolume;
    });

    // Sync volume to localStorage (gameSettings) - but only if it actually changed
    const saved = localStorage.getItem('gameSettings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const newMasterVolume = Math.round(config.volume * 100);
        const newMusicVolume = Math.round(config.musicVolume * 100);
        const newSfxVolume = Math.round(config.sfxVolume * 100);
        let shouldSync = false;

        if (parsed.masterVolume !== newMasterVolume) {
          parsed.masterVolume = newMasterVolume;
          shouldSync = true;
        }

        if (parsed.sfxVolume !== newSfxVolume) {
          parsed.sfxVolume = newSfxVolume;
          shouldSync = true;
        }

        if (parsed.musicVolume !== newMusicVolume) {
          parsed.musicVolume = newMusicVolume;
          shouldSync = true;
        }

        if (shouldSync) {
          localStorage.setItem('gameSettings', JSON.stringify(parsed));
          console.log('🎵 Synced volume to localStorage:', {
            masterVolume: newMasterVolume,
            musicVolume: newMusicVolume,
            sfxVolume: newSfxVolume
          });
        }
      } catch (e) {
        console.warn('🎵 Failed to sync audio settings to localStorage');
      }
    }
  }, [config.volume, config.musicVolume, config.sfxVolume, config.muted]);

  const getNextTrack = useCallback((musicType: MusicType): HTMLAudioElement | null => {
    console.log('🎵 getNextTrack called for:', musicType);
    const tracks = musicTracks.current[musicType];
    if (!tracks || tracks.length === 0) {
      console.warn(`No tracks available for music type: ${musicType}`);
      return null;
    }
    const currentIndex = currentTrackIndex.current[musicType];
    const trackToPlay = tracks[currentIndex];
    const nextIndex = (currentIndex + 1) % tracks.length;
    currentTrackIndex.current[musicType] = nextIndex;
    console.log('🎵 Selected track index:', currentIndex, 'of', tracks.length);
    return trackToPlay;
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
      const musicVolume = config.muted ? 0 : config.volume * config.musicVolume;
      toAudio.volume = musicVolume;
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
  }, [config.musicEnabled, config.muted, config.volume, config.musicVolume, audioContextUnlocked]);

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

      if (typeToPlay === 'endcredits') {
        if (resumeMenuAfterEndRef.current && menuMusicCallbackRef.current) {
          resumeMenuAfterEndRef.current = false;
          menuMusicCallbackRef.current();
        } else {
          playMusic(typeToPlay);
        }
        return;
      }

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
      currentMusicRef.current.volume = config.muted
        ? 0
        : config.volume * config.musicVolume;
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
  }, [audioContextUnlocked, config.musicVolume, config.volume, config.muted, currentTrackName]);

  const playSFX = useCallback((soundName: string) => {
    if (!config.sfxEnabled || config.muted || !audioContextUnlocked) {
      console.log('🎵 SFX blocked:', soundName, { sfxEnabled: config.sfxEnabled, muted: config.muted, unlocked: audioContextUnlocked });
      return;
    }

    const audio = sfxRefs.current[soundName];
    if (audio) {
      try {
        console.log('🎵 Playing SFX:', soundName);
        const baseSfxVolume = config.muted ? 0 : config.volume * config.sfxVolume;
        // Reduce volume for light click specifically
        if (soundName === 'lightClick') {
          const originalVolume = baseSfxVolume;
          audio.volume = originalVolume * 0.3; // Very quiet
          audio.currentTime = 0;
          audio.play().catch(() => {}); // Silently fail
          // Reset volume after playing
          setTimeout(() => {
            audio.volume = originalVolume;
          }, 100);
        } else {
          audio.volume = baseSfxVolume;
          audio.currentTime = 0;
          audio.play().catch(() => {}); // Silently fail
        }
      } catch (error) {
        console.debug('🎵 SFX play failed:', soundName, error);
      }
    } else {
      console.debug('🎵 SFX not found:', soundName);
    }
  }, [config.sfxEnabled, config.muted, config.volume, config.sfxVolume, audioContextUnlocked]);

  const testSFX = useCallback(() => {
    const testSounds = ['click', 'hover', 'cardPlay', 'cardDraw'];
    const randomSound = testSounds[Math.floor(Math.random() * testSounds.length)];
    console.log('🎵 Testing SFX:', randomSound);
    playSFX(randomSound);
  }, [playSFX]);

  const setVolume = useCallback((volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    const currentVolumePercent = Math.round(config.volume * 100);
    const newVolumePercent = Math.round(clampedVolume * 100);

    // Only update if volume actually changed to prevent spam
    if (currentVolumePercent !== newVolumePercent) {
      console.log('🎵 Setting volume from', currentVolumePercent + '%', 'to:', newVolumePercent + '%');
      setConfig(prev => ({ ...prev, volume: clampedVolume }));
    }
  }, [config.volume]);

  const setSfxVolume = useCallback((volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    const currentSfxPercent = Math.round(config.sfxVolume * 100);
    const newSfxPercent = Math.round(clampedVolume * 100);

    if (currentSfxPercent !== newSfxPercent) {
      console.log('🎵 Setting SFX volume from', currentSfxPercent + '%', 'to:', newSfxPercent + '%');
      setConfig(prev => ({ ...prev, sfxVolume: clampedVolume }));
    }
  }, [config.sfxVolume]);

  const setMusicVolume = useCallback((volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    const currentMusicPercent = Math.round(config.musicVolume * 100);
    const newMusicPercent = Math.round(clampedVolume * 100);

    if (currentMusicPercent !== newMusicPercent) {
      console.log('🎵 Setting music volume from', currentMusicPercent + '%', 'to:', newMusicPercent + '%');
      const baseMusicVolume = config.muted ? 0 : config.volume * clampedVolume;
      if (currentMusicRef.current) {
        currentMusicRef.current.volume = baseMusicVolume;
      }
      Object.values(musicTracks.current).flat().forEach(audio => {
        audio.volume = baseMusicVolume;
      });
      setConfig(prev => ({ ...prev, musicVolume: clampedVolume }));
    }
  }, [config.musicVolume, config.muted, config.volume]);

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

  menuMusicCallbackRef.current = setMenuMusic;

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

  const setEndCreditsMusic = useCallback(() => {
    console.log('🎵 setEndCreditsMusic called');
    if (currentMusicType === 'endcredits' && currentMusicRef.current && !currentMusicRef.current.paused) {
      console.log('🎵 setEndCreditsMusic - already playing end credits music');
      return;
    }
    setCurrentMusicType('endcredits');
    playMusic('endcredits');
  }, [currentMusicType, playMusic]);

  const queueMenuMusicAfterEnd = useCallback(() => {
    console.log('🎵 queueMenuMusicAfterEnd called');
    resumeMenuAfterEndRef.current = true;
  }, []);

  const cancelMenuMusicQueue = useCallback(() => {
    console.log('🎵 cancelMenuMusicQueue called');
    resumeMenuAfterEndRef.current = false;
  }, []);

  console.log('🎵 useAudio: Returning audio system object');
  
  return {
    config,
    playMusic,
    stopMusic,
    pauseMusic,
    resumeMusic,
    playSFX,
    testSFX,
    setVolume,
    setMusicVolume,
    setSfxVolume,
    toggleMute,
    toggleMusic,
    toggleSFX,
    setMenuMusic,
    setFactionMusic,
    setGameplayMusic,
    setEndCreditsMusic,
    queueMenuMusicAfterEnd,
    cancelMenuMusicQueue,
    currentMusicType,
    gameState,
    isPlaying,
    currentTrackName,
    audioStatus,
    tracksLoaded,
    audioContextUnlocked
  };
};