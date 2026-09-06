import { describe, it, expect } from 'bun:test';
import { NewsroomRadio, DEFAULT_AUDIO } from '@/audio/NewsroomRadio';
import { musicLibrary, resolveAudioSource } from '@/audio/musicManifest';
class FakeAudio {
  src = ''; preload = ''; volume = 1; currentTime = 0; paused = true;
  onended: (() => void) | null = null; onerror: (() => void) | null = null;
  onpause: (() => void) | null = null; onplaying: (() => void) | null = null;
  result: () => Promise<void> = () => Promise.resolve();
  play() { this.paused = false; return this.result(); }
  pause() { this.paused = true; }
  getAttribute() { return this.src; } removeAttribute() { this.src = ''; } load() {}
}
const tick = async () => { await Promise.resolve(); await Promise.resolve(); await Promise.resolve(); };
function rig(result?: () => Promise<void>) {
  const made: FakeAudio[] = [];
  const radio = new NewsroomRadio({ ...DEFAULT_AUDIO }, () => {
    const audio = new FakeAudio(); if (result) audio.result = result; made.push(audio);
    return audio as unknown as HTMLAudioElement;
  }, '/state-shift-strategy/');
  return { radio, made };
}
describe('newsroom radio', () => {
  it('uses the deployment base for audio and leaves absolute and embedded sources intact', () => {
    expect(musicLibrary('/state-shift-strategy/').theme[0].src).toBe('/state-shift-strategy/muzak/Theme-2.mp3');
    expect(musicLibrary('/').truth[0].src).toBe('/muzak/Truth-1.mp3');
    expect(Object.values(musicLibrary('/')).flat()).toHaveLength(12);
    expect(resolveAudioSource('data:audio/wav;base64,AA', '/game/')).toBe('data:audio/wav;base64,AA');
    expect(resolveAudioSource('https://cdn.test/a.mp3', '/game/')).toBe('https://cdn.test/a.mp3');
    expect(resolveAudioSource('/audio/click.mp3', '/game/')).toBe('/game/audio/click.mp3');
  });
  it('loads no recordings until a gesture and pause stays paused through scene changes', async () => {
    const { radio, made } = rig(); radio.play(); expect(made).toHaveLength(0);
    radio.unlock(); await tick(); expect(made).toHaveLength(1); expect(radio.snapshot.isPlaying).toBe(true);
    radio.pause(); radio.scene('playing', 'truth'); radio.unlock(); await tick();
    expect(radio.snapshot.isPlaying).toBe(false); expect(made).toHaveLength(1);
    radio.resume(); await tick(); expect(made[1].src).toContain('Truth-1.mp3'); expect(radio.snapshot.isPlaying).toBe(true);
    radio.dispose();
  });
  it('shows a persistent retry status for autoplay denial without retrying in a loop', async () => {
    let attempts = 0;
    const { radio, made } = rig(() => { attempts++; return Promise.reject(new DOMException('gesture needed', 'NotAllowedError')); });
    radio.unlock(); await tick(); expect(attempts).toBe(1); expect(radio.snapshot.audioStatus).toContain('Press Play to retry');
    made[0].result = () => Promise.resolve(); radio.resume(); await tick(); expect(radio.snapshot.isPlaying).toBe(true); radio.dispose();
  });
  it('tries the next existing recording on failure and stops after a bounded set', async () => {
    const { radio, made } = rig(() => Promise.reject(new Error('404')));
    radio.select('government', 0); for (let i = 0; i < 8; i++) await tick();
    expect(made).toHaveLength(5); expect(radio.snapshot.isPlaying).toBe(false); expect(radio.snapshot.audioStatus).toContain('could not load'); radio.dispose();
  });
  it('a late play result cannot reverse pause or a new track choice', async () => {
    let finish!: () => void;
    const { radio } = rig(() => new Promise<void>(resolve => { finish = resolve; }));
    radio.unlock(); radio.pause(); finish(); await tick(); expect(radio.snapshot.isPlaying).toBe(false);
    expect(radio.snapshot.audioStatus).toContain('Paused'); radio.dispose();
  });
  it('resumes after background only if the user did not pause and preserves volume', async () => {
    const { radio, made } = rig(); radio.unlock(); await tick(); radio.updateConfig({ ...DEFAULT_AUDIO, volume: .5, musicVolume: .2 });
    expect(made[0].volume).toBe(.1); radio.background(true); expect(made[0].paused).toBe(true);
    radio.background(false); await tick(); expect(radio.snapshot.isPlaying).toBe(true);
    radio.background(true); radio.pause(); radio.background(false); await tick(); expect(radio.snapshot.isPlaying).toBe(false); radio.dispose();
  });
  it('does not continue at track end with loop disabled, and can return from credits to menu', async () => {
    const { radio, made } = rig(); radio.updateConfig({ ...DEFAULT_AUDIO, loop: false }); radio.unlock(); await tick(); made[0].onended?.(); expect(radio.snapshot.isPlaying).toBe(false);
    radio.select('endcredits', 0); radio.queueMenu(true); await tick(); made.at(-1)!.onended?.(); await tick(); expect(radio.snapshot.currentMusicType).toBe('theme'); radio.dispose();
  });
});
