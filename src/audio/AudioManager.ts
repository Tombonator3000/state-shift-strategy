import { BGM_TRACKS, SFX_TRACKS, type SceneId, type BGMTrackId, type SFXTrackId } from './tracks';
import { loadAudioSettings, saveAudioSettings, type AudioSettings } from '../state/audioPersist';

export interface AudioState {
  currentTrackId: BGMTrackId | null;
  scene: SceneId;
  isPlaying: boolean;
  position: number;
  canPlay: boolean;
  settings: AudioSettings;
}

export interface CrossfadeOptions {
  duration?: number;
  loop?: boolean;
}

class AudioManagerClass {
  private currentBgm: HTMLAudioElement | null = null;
  private sfxPool: Map<string, HTMLAudioElement> = new Map();
  private state: AudioState;
  private listeners: Array<(state: AudioState) => void> = [];
  private crossfadeTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.state = {
      currentTrackId: null,
      scene: 'start-menu',
      isPlaying: false,
      position: 0,
      canPlay: false,
      settings: loadAudioSettings()
    };

    this.setupVisibilityHandling();
    this.preloadSFX();
  }

  private setupVisibilityHandling() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.currentBgm && this.state.isPlaying) {
        this.currentBgm.pause();
      } else if (!document.hidden && this.currentBgm && this.state.isPlaying) {
        this.currentBgm.play().catch(console.warn);
      }
    });
  }

  private async preloadSFX() {
    for (const [id, track] of Object.entries(SFX_TRACKS)) {
      try {
        const audio = new Audio(track.path);
        audio.preload = 'auto';
        audio.volume = 0;
        this.sfxPool.set(id, audio);
      } catch (error) {
        console.warn(`Failed to preload SFX ${id}:`, error);
      }
    }
  }

  private updateState(updates: Partial<AudioState>) {
    this.state = { ...this.state, ...updates };
    this.listeners.forEach(listener => listener(this.state));
  }

  private calculateVolume(base: number, type: 'bgm' | 'sfx'): number {
    if (this.state.settings.isMuted) return 0;
    return this.state.settings.master * this.state.settings[type] * base;
  }

  public subscribe(listener: (state: AudioState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) this.listeners.splice(index, 1);
    };
  }

  public getState(): AudioState {
    return { ...this.state };
  }

  public enableAudio(): void {
    this.updateState({ canPlay: true });
  }

  public async playBgm(trackId: BGMTrackId, options: CrossfadeOptions = {}): Promise<void> {
    if (!this.state.canPlay) return;
    
    const track = BGM_TRACKS[trackId];
    if (!track) {
      console.warn(`BGM track ${trackId} not found`);
      return;
    }

    // Don't restart the same track
    if (this.state.currentTrackId === trackId && this.currentBgm && this.state.isPlaying) {
      return;
    }

    try {
      const newAudio = new Audio(track.path);
      newAudio.loop = options.loop ?? track.loop;
      newAudio.volume = this.calculateVolume(track.volume, 'bgm');

      // Crossfade if there's a current track
      if (this.currentBgm && this.state.isPlaying && options.duration) {
        await this.crossfade(this.currentBgm, newAudio, options.duration);
      } else {
        // Stop current and start new
        this.stopBgm();
        await newAudio.play();
      }

      this.currentBgm = newAudio;
      this.updateState({
        currentTrackId: trackId,
        isPlaying: true,
        position: 0
      });

      // Update position tracking
      newAudio.addEventListener('timeupdate', () => {
        this.updateState({ position: newAudio.currentTime });
      });

      newAudio.addEventListener('ended', () => {
        if (!newAudio.loop) {
          this.updateState({ isPlaying: false, currentTrackId: null });
        }
      });

    } catch (error) {
      console.warn(`Failed to play BGM ${trackId}:`, error);
    }
  }

  private async crossfade(fromAudio: HTMLAudioElement, toAudio: HTMLAudioElement, duration: number): Promise<void> {
    if (this.crossfadeTimeout) {
      clearTimeout(this.crossfadeTimeout);
    }

    const startVolume = fromAudio.volume;
    const targetVolume = toAudio.volume;
    toAudio.volume = 0;

    await toAudio.play();

    const steps = 20;
    const stepDuration = duration / steps;

    for (let i = 0; i <= steps; i++) {
      const progress = i / steps;
      const easeProgress = 0.5 - 0.5 * Math.cos(progress * Math.PI); // Smooth ease

      fromAudio.volume = startVolume * (1 - easeProgress);
      toAudio.volume = targetVolume * easeProgress;

      if (i < steps) {
        await new Promise(resolve => {
          this.crossfadeTimeout = setTimeout(resolve, stepDuration);
        });
      }
    }

    fromAudio.pause();
    fromAudio.currentTime = 0;
  }

  public pauseBgm(): void {
    if (this.currentBgm && this.state.isPlaying) {
      this.currentBgm.pause();
      this.updateState({ isPlaying: false });
    }
  }

  public resumeBgm(): void {
    if (this.currentBgm && !this.state.isPlaying) {
      this.currentBgm.play().catch(console.warn);
      this.updateState({ isPlaying: true });
    }
  }

  public stopBgm(): void {
    if (this.currentBgm) {
      this.currentBgm.pause();
      this.currentBgm.currentTime = 0;
      this.currentBgm = null;
      this.updateState({
        isPlaying: false,
        currentTrackId: null,
        position: 0
      });
    }
  }

  public playSfx(soundId: SFXTrackId): void {
    if (!this.state.canPlay || this.state.settings.isMuted) return;

    const audio = this.sfxPool.get(soundId);
    if (audio) {
      const track = SFX_TRACKS[soundId];
      audio.volume = this.calculateVolume(track.volume, 'sfx');
      audio.currentTime = 0;
      audio.play().catch(console.warn);
    }
  }

  public setVolumes(volumes: Partial<AudioSettings>): void {
    const newSettings = { ...this.state.settings, ...volumes };
    this.updateState({ settings: newSettings });
    saveAudioSettings(newSettings);

    // Update current BGM volume
    if (this.currentBgm && this.state.currentTrackId) {
      const track = BGM_TRACKS[this.state.currentTrackId];
      this.currentBgm.volume = this.calculateVolume(track.volume, 'bgm');
    }
  }

  public mute(isMuted: boolean): void {
    this.setVolumes({ isMuted });
  }

  public setScene(scene: SceneId): void {
    this.updateState({ scene });

    // Auto-play appropriate music for scene
    switch (scene) {
      case 'start-menu':
        if (this.state.canPlay) {
          this.playBgm('start-theme');
        }
        break;
      case 'end-credits':
        this.playBgm('endcredits-theme', { duration: 1200 });
        break;
    }
  }

  public startGameplay(faction: 'government' | 'truth'): void {
    const trackId = faction === 'government' ? 'gameplay-government' : 'gameplay-truth';
    this.playBgm(trackId as BGMTrackId, { duration: 1400 });
    this.updateState({ scene: 'gameplay' });
  }
}

export const AudioManager = new AudioManagerClass();