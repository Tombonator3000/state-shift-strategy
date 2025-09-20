// Utility to generate synthetic audio for missing sound effects
export class AudioGenerator {
  private audioContext: AudioContext | null = null;
  
  constructor() {
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  // Generate UFO/Alien sound - oscillating tones with reverb
  generateUFOSound(duration: number = 2.0): AudioBuffer | null {
    if (!this.audioContext) return null;

    const sampleRate = this.audioContext.sampleRate;
    const length = sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      
      // Main oscillating frequency (sci-fi UFO sound)
      const freq1 = 200 + Math.sin(t * 2) * 100; // Slow oscillation
      const freq2 = 400 + Math.sin(t * 5) * 50;  // Faster oscillation
      
      // Generate waveforms
      const wave1 = Math.sin(2 * Math.PI * freq1 * t) * 0.3;
      const wave2 = Math.sin(2 * Math.PI * freq2 * t) * 0.2;
      
      // Add envelope (fade in/out)
      const envelope = Math.sin(Math.PI * t / duration) * 0.8;
      
      // Combine waves with envelope
      data[i] = (wave1 + wave2) * envelope;
    }

    return buffer;
  }

  // Generate radio static sound
  generateStaticSound(duration: number = 1.5): AudioBuffer | null {
    if (!this.audioContext) return null;

    const sampleRate = this.audioContext.sampleRate;
    const length = sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < length; i++) {
      // Generate white noise with filtering
      const noise = (Math.random() * 2 - 1) * 0.5;
      
      // Add some radio interference patterns
      const interference = Math.sin(i * 0.001) * Math.sin(i * 0.003) * 0.3;
      
      data[i] = noise + interference;
    }

    return buffer;
  }

  // Generate deep rumble sound
  generateRumbleSound(duration: number = 3.0): AudioBuffer | null {
    if (!this.audioContext) return null;

    const sampleRate = this.audioContext.sampleRate;
    const length = sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      
      // Very low frequency rumble
      const freq1 = 40 + Math.sin(t * 0.5) * 10;  // Sub-bass rumble
      const freq2 = 80 + Math.sin(t * 1.2) * 20;  // Low rumble
      
      // Generate low-frequency waves
      const wave1 = Math.sin(2 * Math.PI * freq1 * t) * 0.6;
      const wave2 = Math.sin(2 * Math.PI * freq2 * t) * 0.4;
      
      // Add some random variation for organic feel
      const variation = (Math.random() * 2 - 1) * 0.1;
      
      // Envelope that builds up and fades
      const envelope = Math.min(t * 3, 1) * Math.max(1 - (t - duration * 0.7) / (duration * 0.3), 0.3);
      
      data[i] = (wave1 + wave2 + variation) * envelope;
    }

    return buffer;
  }

  // Convert AudioBuffer to downloadable blob
  bufferToBlob(buffer: AudioBuffer): Blob {
    const length = buffer.length;
    const arrayBuffer = new ArrayBuffer(44 + length * 2);
    const view = new DataView(arrayBuffer);
    const channelData = buffer.getChannelData(0);

    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, buffer.sampleRate, true);
    view.setUint32(28, buffer.sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, length * 2, true);

    // Convert float samples to 16-bit PCM
    let offset = 44;
    for (let i = 0; i < length; i++) {
      const sample = Math.max(-1, Math.min(1, channelData[i]));
      view.setInt16(offset, sample * 0x7FFF, true);
      offset += 2;
    }

    return new Blob([arrayBuffer], { type: 'audio/wav' });
  }
}