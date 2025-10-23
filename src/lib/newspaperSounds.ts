/**
 * Newspaper Sound Effects System
 * Creates satisfying audio feedback for newspaper interactions
 */

class NewspaperSoundEffects {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;

  constructor() {
    if (typeof window !== 'undefined' && window.AudioContext) {
      this.audioContext = new AudioContext();
    }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  private playSound(
    frequency: number,
    type: OscillatorType,
    duration: number,
    volume: number
  ) {
    if (!this.enabled || !this.audioContext) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = type;

      gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        this.audioContext.currentTime + duration
      );

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);
    } catch (error) {
      console.warn('Failed to play sound:', error);
    }
  }

  /**
   * Page turn/rustle sound
   */
  pageFlip() {
    if (!this.audioContext) return;

    const now = this.audioContext.currentTime;
    
    // Create a rustling effect with multiple frequencies
    this.playSound(200, 'sawtooth', 0.15, 0.08);
    
    setTimeout(() => {
      this.playSound(180, 'sawtooth', 0.1, 0.06);
    }, 50);
    
    setTimeout(() => {
      this.playSound(160, 'sawtooth', 0.08, 0.04);
    }, 100);
  }

  /**
   * Typewriter click for article expansion
   */
  typewriterClick() {
    this.playSound(800, 'square', 0.05, 0.04);
  }

  /**
   * Article fold/unfold
   */
  paperUnfold() {
    if (!this.audioContext) return;

    // Ascending whoosh
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.frequency.setValueAtTime(100, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(
      300,
      this.audioContext.currentTime + 0.2
    );
    
    oscillator.type = 'triangle';
    
    gainNode.gain.setValueAtTime(0.06, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      this.audioContext.currentTime + 0.2
    );
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.2);
  }

  /**
   * Newspaper thud (opening/closing)
   */
  newspaperThud() {
    if (!this.audioContext) return;

    // Low thump
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.frequency.value = 80;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.15, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      this.audioContext.currentTime + 0.3
    );
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.3);
  }

  /**
   * Pencil scratch (for interactive elements)
   */
  pencilScratch() {
    this.playSound(300, 'sawtooth', 0.1, 0.03);
  }

  /**
   * Stamp sound (for badges, stamps)
   */
  stamp() {
    if (!this.audioContext) return;

    // Quick thunk
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.frequency.value = 150;
    oscillator.type = 'square';
    
    gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      this.audioContext.currentTime + 0.08
    );
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.08);
  }
}

export const newspaperSounds = new NewspaperSoundEffects();
