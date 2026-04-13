import { useState, useRef, useCallback, useEffect } from 'react';
import { SFX_MANIFEST, loadProceduralSfx } from '@/assets/audio/sfxManifest';
import { safeGetLocalStorageItem, safeSetLocalStorageItem } from '@/utils/storage';

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

type TrackMetadata = {
  index: number;
  src: string;
  label: string;
};


type TrackLibrary = Record<MusicType, TrackMetadata[]>;

const SILENT_AUDIO_DATA_URL =
  'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAIlYAAESsAAACABAAZGF0YQAAAAA=';

const formatTrackLabel = (src: string): string => {
  const fileName = decodeURIComponent(src.split('/').pop() ?? 'Track');
  return fileName
    .replace(/\.mp3$/i, '')
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

export const useAudio = () => {
  console.log('🎵 useAudio: Hook called - initializing...');
  
  // Load initial config from localStorage or defaults
  const [config, setConfig] = useState<AudioConfig>(() => {
    console.log('🎵 useAudio: Loading initial config...');
    const saved = safeGetLocalStorageItem('gameSettings');
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
          : 12;

        const normalizeVolume = (value: number) => {
          const clamped = Math.max(0, Math.min(100, value));
          return clamped > 1 ? clamped / 100 : clamped;
        };

        const normalizedMasterVolume = normalizeVolume(rawMasterVolume);
        const normalizedMusicVolume = normalizeVolume(rawMusicVolume);
        const normalizedSfxVolume = normalizeVolume(rawSfxVolume);

        return {
          volume: normalizedMasterVolume,
          musicVolume: normalizedMusicVolume,
          sfxVolume: normalizedSfxVolume,
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
      musicVolume: 0.12,
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
  const [availableTracks, setAvailableTracks] = useState<TrackLibrary>({
    theme: [],
    government: [],
    truth: [],
    endcredits: []
  });
  
  console.log('🎵 useAudio: State initialized');
  
  const currentMusicRef = useRef<HTMLAudioElement | null>(null);
  const nextMusicRef = useRef<HTMLAudioElement | null>(null);
  const sfxRefs = useRef<{ [key: string]: HTMLAudioElement }>({});
  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const playTokenRef = useRef(0);
  const resumeMenuAfterEndRef = useRef(false);
  const manualStopRef = useRef(false);
  const menuMusicCallbackRef = useRef<(() => void) | null>(null);
  const lastMusicVolumeRef = useRef(config.muted ? 0 : config.volume * config.musicVolume);
  const pendingAutoplayRef = useRef(false);
  const configRef = useRef(config);
  const tracksLoadedRef = useRef(tracksLoaded);
  const audioContextUnlockedRef = useRef(audioContextUnlocked);
  const currentMusicTypeRef = useRef(currentMusicType);
  const gestureUnlockAudioRef = useRef<HTMLAudioElement | null>(null);
  const beginPlaybackFromGestureRef = useRef<() => void>();
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

  useEffect(() => {
    configRef.current = config;
  }, [config]);

  useEffect(() => {
    tracksLoadedRef.current = tracksLoaded;
  }, [tracksLoaded]);

  useEffect(() => {
    audioContextUnlockedRef.current = audioContextUnlocked;
  }, [audioContextUnlocked]);

  useEffect(() => {
    currentMusicTypeRef.current = currentMusicType;
  }, [currentMusicType]);

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
      if (audioContextUnlockedRef.current) {
        console.log('🎵 Audio context already unlocked');
        return;
      }
      audioContextUnlockedRef.current = true;
      setAudioContextUnlocked(true);
      setAudioStatus('Audio context unlocked - ready to play');
      console.log('🎵 Audio context unlocked via user interaction - will auto-start menu music');
    };

    // Add click/tap/pointer event listener to unlock audio once
    const handleUserInteraction = () => {
      unlockAudioContext();
      setAudioStatus('Audio context unlocked - starting menu music');
      console.log('🎵 Audio context unlocked via user interaction');

      if (!gestureUnlockAudioRef.current) {
        const unlockAudio = new Audio(SILENT_AUDIO_DATA_URL);
        unlockAudio.loop = false;
        unlockAudio.volume = 0;
        gestureUnlockAudioRef.current = unlockAudio;
      }

      const unlockAudio = gestureUnlockAudioRef.current;
      if (unlockAudio) {
        unlockAudio.currentTime = 0;
        unlockAudio.play().catch(error => {
          console.debug('🎵 Silent unlock audio failed to play:', error);
        });
      }

      if (configRef.current.musicEnabled && !configRef.current.muted) {
        if (tracksLoadedRef.current) {
          console.log('🎵 Starting playback immediately after user interaction');
          beginPlaybackFromGestureRef.current?.();
        } else {
          console.log('🎵 Tracks not ready - deferring autoplay until loaded');
          pendingAutoplayRef.current = true;
          setAudioStatus('Autoplay pending - tracks loading');
        }
      } else {
        pendingAutoplayRef.current = false;
      }

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
          const baseMusicVolume = config.muted ? 0 : lastMusicVolumeRef.current;
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
      const themeMetadata: TrackMetadata[] = [];
      musicTracks.current.theme = [];
      themeTracks.forEach((src, index) => {
        const result = themeResults[index];
        if (result) {
          const audioElement = result as HTMLAudioElement;
          musicTracks.current.theme.push(audioElement);
          const trackIndex = musicTracks.current.theme.length - 1;
          themeMetadata.push({
            index: trackIndex,
            src,
            label: formatTrackLabel(src)
          });
        }
      });

      if (themeMetadata.length > 0) {
        currentTrackIndex.current.theme = Math.floor(Math.random() * themeMetadata.length);
      }

      console.log('🎵 Theme tracks loaded:', themeMetadata.length, 'out of', themeTracks.length);

      // Load government faction music tracks in specific order
      const govTracks = [
        '/muzak/Government-2.mp3',
        '/muzak/Government-1.mp3',
        '/muzak/Government-3.mp3',
        '/muzak/Government-4.mp3',
        '/muzak/Government-5.mp3'
      ];
      console.log('🎵 Attempting to load government tracks:', govTracks);
      const govPromises = govTracks.map(track => loadAudioTrack(track));
      const govResults = await Promise.all(govPromises);
      const governmentMetadata: TrackMetadata[] = [];
      musicTracks.current.government = [];
      govTracks.forEach((src, index) => {
        const result = govResults[index];
        if (result) {
          const audioElement = result as HTMLAudioElement;
          musicTracks.current.government.push(audioElement);
          const trackIndex = musicTracks.current.government.length - 1;
          governmentMetadata.push({
            index: trackIndex,
            src,
            label: formatTrackLabel(src)
          });
        }
      });
      console.log('🎵 Government tracks loaded:', musicTracks.current.government.length, 'out of', govTracks.length);

      // Load truth faction music tracks in specific order
      const truthTracks = [
        '/muzak/Truth-1.mp3',
        '/muzak/Truth-2.mp3',
        '/muzak/Truth-3.mp3',
        '/muzak/Truth-4.mp3',
        '/muzak/Truth-5.mp3'
      ];
      console.log('🎵 Attempting to load truth tracks:', truthTracks);
      const truthPromises = truthTracks.map(track => loadAudioTrack(track));
      const truthResults = await Promise.all(truthPromises);
      const truthMetadata: TrackMetadata[] = [];
      musicTracks.current.truth = [];
      truthTracks.forEach((src, index) => {
        const result = truthResults[index];
        if (result) {
          const audioElement = result as HTMLAudioElement;
          musicTracks.current.truth.push(audioElement);
          const trackIndex = musicTracks.current.truth.length - 1;
          truthMetadata.push({
            index: trackIndex,
            src,
            label: formatTrackLabel(src)
          });
        }
      });
      console.log('🎵 Truth tracks loaded:', musicTracks.current.truth.length, 'out of', truthTracks.length);

      // Load end credits music
      const endCreditsAudio = await loadAudioTrack('/muzak/endcredits-theme.mp3');
      const endCreditsMetadata: TrackMetadata[] = [];
      if (endCreditsAudio) {
        musicTracks.current.endcredits = [endCreditsAudio];
        endCreditsMetadata.push({
          index: 0,
          src: '/muzak/endcredits-theme.mp3',
          label: formatTrackLabel('/muzak/endcredits-theme.mp3')
        });
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

      setAvailableTracks({
        theme: themeMetadata,
        government: governmentMetadata,
        truth: truthMetadata,
        endcredits: endCreditsMetadata
      });

      tracksLoadedRef.current = true;
      setTracksLoaded(true);
      setAudioStatus('Ready - All tracks loaded');

      if (pendingAutoplayRef.current && audioContextUnlockedRef.current) {
        console.log('🎵 Pending autoplay detected after track load - starting playback');
        beginPlaybackFromGestureRef.current?.();
      }
    };

    loadMusicTracks();

    // Create sound effects with fallback handling - use existing files for paranormal effects
    // Load SFX asynchronously with error handling. The procedural paranormal
    // SFX module is ~5 MB of base64 data URIs, so it's pulled in via dynamic
    // import to keep it out of the main bundle.
    const loadSFX = async () => {
      const proceduralPromise = loadProceduralSfx().catch(error => {
        console.warn('🎵 Procedural SFX chunk failed to load', error);
        return {} as Record<string, string>;
      });

      const fileEntries = Object.entries(SFX_MANIFEST) as Array<[string, string]>;

      const loadPromises = fileEntries.map(async ([key, src]) => {
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

      const proceduralSources = await proceduralPromise;
      const proceduralPromises = Object.entries(proceduralSources).map(async ([key, src]) => {
        const audio = await loadAudioTrack(src);
        if (audio) {
          const baseSfxVolume = config.muted ? 0 : config.volume * config.sfxVolume;
          audio.volume = baseSfxVolume;
          sfxRefs.current[key] = audio;
        } else {
          const silentAudio = new Audio();
          silentAudio.volume = 0;
          sfxRefs.current[key] = silentAudio;
        }
      });
      await Promise.all(proceduralPromises);

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
    lastMusicVolumeRef.current = musicVolume;
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
    const saved = safeGetLocalStorageItem('gameSettings');
    if (!saved) {
      console.log('🎵 No saved audio settings found or storage unavailable - skipping sync');
      return;
    }

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
        const didPersist = safeSetLocalStorageItem('gameSettings', JSON.stringify(parsed));
        if (didPersist) {
          console.log('🎵 Synced volume to localStorage:', {
            masterVolume: newMasterVolume,
            musicVolume: newMusicVolume,
            sfxVolume: newSfxVolume
          });
        } else {
          console.warn('🎵 Failed to persist audio settings to localStorage');
        }
      }
    } catch (error) {
      console.warn('🎵 Failed to sync audio settings to localStorage', error);
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
    
    if (!toAudio || !audioContextUnlockedRef.current) {
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
      const musicVolume = config.muted ? 0 : lastMusicVolumeRef.current;
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
  }, [config.musicEnabled, config.muted, config.volume, config.musicVolume]);

  // Play music based on current state
  const playMusic = useCallback((musicType?: MusicType) => {
    console.log('🎵 playMusic called with type:', musicType, 'current state:', {
      musicEnabled: configRef.current.musicEnabled,
      muted: configRef.current.muted,
      tracksLoaded: tracksLoadedRef.current,
      audioContextUnlocked: audioContextUnlockedRef.current,
      currentlyPlaying: !!currentMusicRef.current
    });

    // Don't play music until tracks are loaded and audio context is unlocked (mobile requirement)
    if (
      !configRef.current.musicEnabled ||
      configRef.current.muted ||
      !tracksLoadedRef.current ||
      !audioContextUnlockedRef.current
    ) {
      console.log('🎵 Music playback blocked:', {
        musicEnabled: configRef.current.musicEnabled,
        muted: configRef.current.muted,
        tracksLoaded: tracksLoadedRef.current,
        audioContextUnlocked: audioContextUnlockedRef.current
      });
      setAudioStatus('Music blocked - check settings');
      return;
    }

    const typeToPlay = musicType || currentMusicTypeRef.current;
    const nextTrack = getNextTrack(typeToPlay);

    if (!nextTrack) {
      console.warn(`🎵 No available track for music type: ${typeToPlay}`);
      setAudioStatus(`No tracks available for: ${typeToPlay}`);
      return;
    }

    manualStopRef.current = false;

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
  }, [getNextTrack, switchTrack]);

  const beginPlaybackFromGesture = useCallback(() => {
    console.log('🎵 beginPlaybackFromGesture called');
    const { musicEnabled, muted } = configRef.current;
    if (!musicEnabled || muted) {
      pendingAutoplayRef.current = false;
      console.log('🎵 beginPlaybackFromGesture aborted - music disabled or muted');
      return;
    }

    pendingAutoplayRef.current = false;
    manualStopRef.current = false;
    const typeToPlay = currentMusicTypeRef.current || 'theme';
    playMusic(typeToPlay);
  }, [playMusic]);

  beginPlaybackFromGestureRef.current = beginPlaybackFromGesture;

  const selectTrack = useCallback(
    (musicType: MusicType, trackIndex: number) => {
      const tracks = musicTracks.current[musicType];
      if (!tracks || tracks.length === 0) {
        console.warn(`🎵 selectTrack: No tracks available for ${musicType}`);
        return false;
      }

      const normalizedIndex = ((trackIndex % tracks.length) + tracks.length) % tracks.length;
      currentTrackIndex.current[musicType] = normalizedIndex;
      setCurrentMusicType(musicType);
      playMusic(musicType);
      return true;
    },
    [playMusic]
  );


  const stopMusic = useCallback(() => {
    console.log('🎵 Stopping music');
    manualStopRef.current = true;
    pendingAutoplayRef.current = false;
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
      manualStopRef.current = false;
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
      setConfig(prev => {
        const nextConfig = { ...prev, volume: clampedVolume };
        lastMusicVolumeRef.current = nextConfig.muted
          ? 0
          : nextConfig.volume * nextConfig.musicVolume;
        return nextConfig;
      });
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
      lastMusicVolumeRef.current = baseMusicVolume;
      setConfig(prev => ({ ...prev, musicVolume: clampedVolume }));
    }
  }, [config.musicVolume, config.muted, config.volume]);

  const toggleMute = useCallback(() => {
    setConfig(prev => {
      const newMuted = !prev.muted;
      const nextConfig = { ...prev, muted: newMuted };
      lastMusicVolumeRef.current = newMuted ? 0 : nextConfig.volume * nextConfig.musicVolume;
      return nextConfig;
    });
  }, []);

  const toggleMusic = useCallback(() => {
    console.log('🎵 toggleMusic called - current state:', config.musicEnabled);
    setConfig(prev => {
      const newMusicEnabled = !prev.musicEnabled;
      console.log('🎵 Music toggled to:', newMusicEnabled);
      
      if (!newMusicEnabled) {
        pendingAutoplayRef.current = false;
        if (currentMusicRef.current) {
          console.log('🎵 Stopping music due to toggle off');
          currentMusicRef.current.onended = null;
          currentMusicRef.current.pause();
          currentMusicRef.current.currentTime = 0;
        }
        setIsPlaying(false);
        setAudioStatus('Music disabled');
      } else if (newMusicEnabled) {
        console.log('🎵 Starting music due to toggle on');
        manualStopRef.current = false;
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

  useEffect(() => {
    if (manualStopRef.current) {
      return;
    }
    if (tracksLoaded && audioContextUnlocked && config.musicEnabled && !config.muted && !isPlaying) {
      console.log('🎵 Auto-starting music after tracks loaded');
      playMusic(currentMusicType);
    }
  }, [tracksLoaded, audioContextUnlocked, config.musicEnabled, config.muted, isPlaying, playMusic, currentMusicType]);

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
    audioContextUnlocked,
    availableTracks,
    selectTrack
  };
};
