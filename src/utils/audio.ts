// 8-bit Retro Web Audio Synthesizer for "Happy Birthday"

export interface MelodyNote {
  note: string;
  freq: number;
  duration: number; // in beats
}

const FREQUENCIES: Record<string, number> = {
  'C4': 261.63,
  'D4': 293.66,
  'E4': 329.63,
  'F4': 349.23,
  'G4': 392.00,
  'A4': 440.00,
  'Bb4': 466.16,
  'C5': 523.25,
  'D5': 587.33,
  'E5': 659.25,
  'F5': 698.46,
};

// Happy Birthday melody in beats (temp tempo: 120bpm -> 0.5s per beat)
const MELODY: MelodyNote[] = [
  { note: 'C4', freq: FREQUENCIES['C4'], duration: 0.75 },
  { note: 'C4', freq: FREQUENCIES['C4'], duration: 0.25 },
  { note: 'D4', freq: FREQUENCIES['D4'], duration: 1.0 },
  { note: 'C4', freq: FREQUENCIES['C4'], duration: 1.0 },
  { note: 'F4', freq: FREQUENCIES['F4'], duration: 1.0 },
  { note: 'E4', freq: FREQUENCIES['E4'], duration: 2.0 },

  { note: 'C4', freq: FREQUENCIES['C4'], duration: 0.75 },
  { note: 'C4', freq: FREQUENCIES['C4'], duration: 0.25 },
  { note: 'D4', freq: FREQUENCIES['D4'], duration: 1.0 },
  { note: 'C4', freq: FREQUENCIES['C4'], duration: 1.0 },
  { note: 'G4', freq: FREQUENCIES['G4'], duration: 1.0 },
  { note: 'F4', freq: FREQUENCIES['F4'], duration: 2.0 },

  { note: 'C4', freq: FREQUENCIES['C4'], duration: 0.75 },
  { note: 'C4', freq: FREQUENCIES['C4'], duration: 0.25 },
  { note: 'C5', freq: FREQUENCIES['C5'], duration: 1.0 },
  { note: 'A4', freq: FREQUENCIES['A4'], duration: 1.0 },
  { note: 'F4', freq: FREQUENCIES['F4'], duration: 1.0 },
  { note: 'E4', freq: FREQUENCIES['E4'], duration: 1.0 },
  { note: 'D4', freq: FREQUENCIES['D4'], duration: 2.0 },

  { note: 'Bb4', freq: FREQUENCIES['Bb4'], duration: 0.75 },
  { note: 'Bb4', freq: FREQUENCIES['Bb4'], duration: 0.25 },
  { note: 'A4', freq: FREQUENCIES['A4'], duration: 1.0 },
  { note: 'F4', freq: FREQUENCIES['F4'], duration: 1.0 },
  { note: 'G4', freq: FREQUENCIES['G4'], duration: 1.0 },
  { note: 'F4', freq: FREQUENCIES['F4'], duration: 2.0 },
];

export class RetroSynth {
  private ctx: AudioContext | null = null;
  private currentOscillators: { osc: OscillatorNode; gain: GainNode }[] = [];
  private isPlaying: boolean = false;
  private playTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private stepCallback: ((noteName: string, index: number) => void) | null = null;
  private stopCallback: (() => void) | null = null;
  private currentProgressIndex: number = -1;

  constructor() {
    // Lazy initialize to bypass initial autoplay restrictions
  }

  public unlock() {
    this.initCtx();
  }

  private initCtx() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setCallbacks(
    onStep: (noteName: string, index: number) => void,
    onStop: () => void
  ) {
    this.stepCallback = onStep;
    this.stopCallback = onStop;
  }

  public play(tempoBpm: number = 130) {
    this.stop();
    this.initCtx();
    if (!this.ctx) return;

    this.isPlaying = true;
    const beatDuration = 60 / tempoBpm;
    let scheduledTime = this.ctx.currentTime + 0.1;

    const playStep = (index: number) => {
      if (!this.isPlaying || !this.ctx) return;
      if (index >= MELODY.length) {
        // Continuous looping loop for delightful ambient background music
        playStep(0);
        return;
      }

      this.currentProgressIndex = index;
      const step = MELODY[index];
      
      if (this.stepCallback) {
        this.stepCallback(step.note, index);
      }

      const durationSec = step.duration * beatDuration;

      // 8-bit oscillator shape
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // "Square" wave for nostalgic retro game sound effect
      osc.type = 'square';
      osc.frequency.setValueAtTime(step.freq, scheduledTime);

      // Volume envelope to make it sound punchy & retro
      gain.gain.setValueAtTime(0.08, scheduledTime);
      gain.gain.exponentialRampToValueAtTime(0.001, scheduledTime + durationSec - 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(scheduledTime);
      osc.stop(scheduledTime + durationSec);

      this.currentOscillators.push({ osc, gain });

      scheduledTime += durationSec;

      this.playTimeoutId = setTimeout(() => {
        playStep(index + 1);
      }, durationSec * 1000);
    };

    playStep(0);
  }

  public playSingleNote(noteName: string) {
    this.initCtx();
    if (!this.ctx) return;

    const freq = FREQUENCIES[noteName];
    if (!freq) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle'; // Soft instrument sound
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.5);
  }

  public stop() {
    this.isPlaying = false;
    if (this.playTimeoutId) {
      clearTimeout(this.playTimeoutId);
      this.playTimeoutId = null;
    }
    this.currentOscillators.forEach((item) => {
      try {
        item.osc.stop();
        item.osc.disconnect();
        item.gain.disconnect();
      } catch (e) {}
    });
    this.currentOscillators = [];
    this.currentProgressIndex = -1;
    if (this.stopCallback) {
      this.stopCallback();
    }
  }

  public isCurrentlyPlaying() {
    return this.isPlaying;
  }

  public getMelodyLength() {
    return MELODY.length;
  }

  public getNotes() {
    return MELODY;
  }
}
