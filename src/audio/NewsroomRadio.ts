import { musicLibrary, type MusicType, type AudioScene } from './musicManifest';

export interface AudioConfig {
  volume: number; musicVolume: number; sfxVolume: number; muted: boolean;
  musicEnabled: boolean; sfxEnabled: boolean; shuffle: boolean; loop: boolean; crossfade: boolean;
}
export const DEFAULT_AUDIO: AudioConfig = { volume: .8, musicVolume: .12, sfxVolume: .8, muted: false, musicEnabled: true, sfxEnabled: true, shuffle: false, loop: true, crossfade: true };
export interface RadioSnapshot {
  currentMusicType: MusicType; gameState: AudioScene; isPlaying: boolean;
  currentTrackName: string; audioStatus: string; audioContextUnlocked: boolean;
}

/** One lazy media element at a time. Playback promises never outrank a later pause. */
export class NewsroomRadio {
  readonly availableTracks: ReturnType<typeof musicLibrary>;
  config: AudioConfig;
  snapshot: RadioSnapshot = { currentMusicType: 'theme', gameState: 'menu', isPlaying: false, currentTrackName: '', audioStatus: 'Press Play to start the newsroom radio.', audioContextUnlocked: false };
  onChange = (_: RadioSnapshot) => {};
  private audio: HTMLAudioElement | null = null;
  private request = 0;
  private pausedByUser = false;
  private resumeAfterBackground = false;
  private menuAfterEnd = false;
  private indices: Record<MusicType, number> = { theme: 0, government: 0, truth: 0, endcredits: 0 };
  private timeout?: ReturnType<typeof setTimeout>;

  constructor(config: AudioConfig, private makeAudio = () => new Audio(), base?: string) {
    this.config = config;
    this.availableTracks = musicLibrary(base);
  }
  private publish(patch: Partial<RadioSnapshot>) {
    this.snapshot = { ...this.snapshot, ...patch };
    this.onChange(this.snapshot);
  }
  private release(reset = false) {
    this.request++;
    clearTimeout(this.timeout);
    if (this.audio) {
      this.audio.onended = this.audio.onerror = this.audio.onpause = this.audio.onplaying = null;
      this.audio.pause();
      if (reset) this.audio.currentTime = 0;
    }
  }
  updateConfig(config: AudioConfig) {
    this.config = config;
    if (this.audio) this.audio.volume = config.muted ? 0 : config.volume * config.musicVolume;
  }
  /** Called synchronously from a pointer/keyboard gesture. */
  unlock() {
    if (this.snapshot.audioContextUnlocked) return;
    this.publish({ audioContextUnlocked: true });
    if (!this.pausedByUser && this.config.musicEnabled) this.play();
  }
  play(type = this.snapshot.currentMusicType) {
    const changed = type !== this.snapshot.currentMusicType;
    this.publish({ currentMusicType: type });
    if (!this.config.musicEnabled || this.pausedByUser || !this.snapshot.audioContextUnlocked) return;
    if (!changed && this.audio && !this.audio.paused) return;
    void this.start(type, this.indices[type], !changed);
  }
  resume() {
    this.pausedByUser = false;
    this.publish({ audioContextUnlocked: true });
    if (!this.config.musicEnabled) { this.publish({ audioStatus: 'Music is off. Enable music to play.' }); return; }
    void this.start(this.snapshot.currentMusicType, this.indices[this.snapshot.currentMusicType], true);
  }
  pause() {
    this.pausedByUser = true;
    this.resumeAfterBackground = false;
    this.release();
    this.publish({ isPlaying: false, audioStatus: 'Paused — press Play to resume.' });
  }
  stop() { this.pause(); if (this.audio) this.audio.currentTime = 0; }
  select(type: MusicType, index: number) {
    if (!this.availableTracks[type][index]) return;
    this.pausedByUser = false;
    this.publish({ currentMusicType: type, audioContextUnlocked: true });
    if (this.config.musicEnabled) void this.start(type, index);
  }
  scene(scene: AudioScene, type: MusicType) { this.publish({ gameState: scene }); this.play(type); }
  queueMenu(enabled: boolean) { this.menuAfterEnd = enabled; }
  background(hidden: boolean) {
    if (hidden) {
      this.resumeAfterBackground = this.snapshot.isPlaying;
      if (this.resumeAfterBackground) {
        this.release();
        this.publish({ isPlaying: false, audioStatus: 'Radio paused while the game is in the background.' });
      }
    } else if (this.resumeAfterBackground && !this.pausedByUser) {
      this.resumeAfterBackground = false;
      this.resume();
    }
  }
  dispose() { this.release(); this.audio?.removeAttribute('src'); this.audio?.load(); this.audio = null; }

  private async start(type: MusicType, index: number, resume = false, attempted = new Set<number>()) {
    const tracks = this.availableTracks[type];
    const track = tracks[index];
    if (!track || !this.config.musicEnabled) return;
    const previous = this.audio;
    const reuse = resume && previous?.getAttribute('src') === track.src;
    this.release();
    const token = this.request;
    const audio = reuse && previous ? previous : this.makeAudio();
    this.audio = audio;
    this.indices[type] = index;
    attempted.add(index);
    const live = () => token === this.request && audio === this.audio;
    audio.preload = 'none';
    audio.volume = this.config.muted ? 0 : this.config.volume * this.config.musicVolume;
    if (!reuse) audio.src = track.src;
    this.publish({ isPlaying: false, currentTrackName: track.label, audioStatus: `Tuning in: ${track.label}…` });
    let failed = false;
    const fail = (error: unknown) => {
      if (!live() || failed) return;
      failed = true;
      clearTimeout(this.timeout);
      if (error instanceof Error && (error.name === 'NotAllowedError' || error.name === 'AbortError')) {
        this.release();
        this.publish({ isPlaying: false, audioStatus: 'Playback was interrupted or blocked. Press Play to retry.' });
        return;
      }
      const next = tracks.findIndex((_, i) => !attempted.has(i));
      if (next >= 0) void this.start(type, next, false, attempted);
      else {
        this.release();
        this.publish({ isPlaying: false, audioStatus: 'Music could not load. Check your connection, then press Play to retry.' });
      }
    };
    audio.onerror = () => fail(new Error('Media could not load'));
    audio.onpause = () => { if (live()) this.publish({ isPlaying: false, audioStatus: 'Playback interrupted — press Play to resume.' }); };
    audio.onplaying = () => { if (live()) this.publish({ isPlaying: true, audioStatus: `On air · ${track.label}` }); };
    audio.onended = () => {
      if (!live()) return;
      if (type === 'endcredits' && this.menuAfterEnd) {
        this.menuAfterEnd = false;
        this.publish({ currentMusicType: 'theme', gameState: 'menu' });
        void this.start('theme', this.indices.theme);
      } else if (this.config.loop) {
        const next = this.config.shuffle && tracks.length > 1
          ? (index + 1 + Math.floor(Math.random() * (tracks.length - 1))) % tracks.length
          : (index + 1) % tracks.length;
        void this.start(type, next);
      } else this.pause();
    };
    this.timeout = setTimeout(() => fail(new Error('Media timed out')), 12000);
    try {
      // Invoke before any await: mobile browsers require the gesture stack.
      await audio.play();
      if (!live()) { if (audio !== this.audio || this.pausedByUser) audio.pause(); return; }
      clearTimeout(this.timeout);
      this.publish({ isPlaying: true, audioStatus: `${attempted.size > 1 ? 'Unavailable track skipped. ' : ''}On air · ${track.label}` });
    } catch (error) { fail(error); }
  }
}
