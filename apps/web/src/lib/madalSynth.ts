import { BolTokenNode, HeadStrokeSpec } from '@open-madal/core';

/**
 * Modal physical-modeling Web Audio synthesizer for the Nepali Madal drum.
 * Synthesizes the harmonic overtones of the black 'khari' tuning paste on both
 * the Bhale (left bass) and Pothi (right treble) drumheads.
 */
export class MadalAudioEngine {
  private ctx: AudioContext | null = null;
  private noiseBuffer: AudioBuffer | null = null;

  private ensureContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    if (!this.noiseBuffer) {
      const sampleRate = this.ctx.sampleRate;
      const length = Math.floor(sampleRate * 0.15);
      const buffer = this.ctx.createBuffer(1, length, sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (sampleRate * 0.025));
      }
      this.noiseBuffer = buffer;
    }
    return this.ctx;
  }

  public getCurrentTime(): number {
    return this.ensureContext().currentTime;
  }

  /**
   * Trigger a Bhale (bass) or Pothi (treble) head strike at a specific AudioContext time.
   */
  public triggerHeadStroke(
    spec: HeadStrokeSpec,
    when?: number,
    velocity = 100
  ): void {
    const ctx = this.ensureContext();
    const now = when ?? ctx.currentTime;
    const gainScale = Math.max(0.15, Math.min(1.0, velocity / 120));

    if (spec.head === 'bhale') {
      this.synthesizeBhale(ctx, spec, now, gainScale);
    } else {
      this.synthesizePothi(ctx, spec, now, gainScale);
    }
  }

  /**
   * Trigger a complete BolTokenNode (which may strike Bhale, Pothi, or both simultaneously).
   */
  public triggerBolToken(
    token: BolTokenNode,
    when?: number,
    velocity = 105
  ): void {
    const ctx = this.ensureContext();
    const now = when ?? ctx.currentTime;

    if (token.bhale) {
      this.triggerHeadStroke(token.bhale, now, velocity);
    }
    if (token.pothi) {
      this.triggerHeadStroke(token.pothi, now, velocity);
    }
  }

  /**
   * Trigger a crisp woodblock/metronome pulse for Sam (Beat 1) or normal beats.
   */
  public triggerMetronome(isSam: boolean, when?: number): void {
    const ctx = this.ensureContext();
    const now = when ?? ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(isSam ? 1046.5 : 784.0, now);

    gain.gain.setValueAtTime(isSam ? 0.14 : 0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.05);
  }

  private synthesizeBhale(
    ctx: AudioContext,
    spec: HeadStrokeSpec,
    now: number,
    gainScale: number
  ): void {
    const masterGain = ctx.createGain();
    masterGain.connect(ctx.destination);

    if (spec.articulation === 'closed') {
      // Muted palm slap (Ka): short punchy low-mid membrane thump + skin slap transient
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(95, now + 0.06);

      masterGain.gain.setValueAtTime(0.55 * gainScale, now);
      masterGain.gain.exponentialRampToValueAtTime(0.001, now + 0.085);

      osc.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.09);

      this.addSkinTransient(ctx, now, 520, 0.25 * gainScale);
      return;
    }

    // Open or Pitch-Bend Bhale bass resonance (Ghe / Dhum / Ghe^)
    const f0 = spec.fundamentalHz;
    const decay = spec.decaySec;

    const fundOsc = ctx.createOscillator();
    const overtoneOsc = ctx.createOscillator();
    const overtoneGain = ctx.createGain();

    fundOsc.type = 'sine';
    overtoneOsc.type = 'triangle';

    if (spec.articulation === 'pitch-bend') {
      // Heel pressure pitch bend up (Dhing / Ghe^)
      fundOsc.frequency.setValueAtTime(f0 * 1.15, now);
      fundOsc.frequency.exponentialRampToValueAtTime(f0, now + 0.04);
      fundOsc.frequency.linearRampToValueAtTime(f0 * 1.24, now + 0.22);
      fundOsc.frequency.exponentialRampToValueAtTime(f0 * 0.96, now + decay);
    } else {
      // Natural membrane attack pitch envelope
      fundOsc.frequency.setValueAtTime(f0 * 1.38, now);
      fundOsc.frequency.exponentialRampToValueAtTime(f0, now + 0.038);
      fundOsc.frequency.exponentialRampToValueAtTime(f0 * 0.94, now + decay);
    }

    overtoneOsc.frequency.setValueAtTime(f0 * 1.98, now);
    overtoneGain.gain.setValueAtTime(0.22 * gainScale, now);
    overtoneGain.gain.exponentialRampToValueAtTime(0.0001, now + decay * 0.65);

    masterGain.gain.setValueAtTime(0.001, now);
    masterGain.gain.linearRampToValueAtTime(0.8 * gainScale, now + 0.004);
    masterGain.gain.exponentialRampToValueAtTime(0.0008, now + decay);

    fundOsc.connect(masterGain);
    overtoneOsc.connect(overtoneGain);
    overtoneGain.connect(masterGain);

    fundOsc.start(now);
    overtoneOsc.start(now);
    fundOsc.stop(now + decay + 0.02);
    overtoneOsc.stop(now + decay + 0.02);

    this.addSkinTransient(ctx, now, 310, 0.18 * gainScale);
  }

  private synthesizePothi(
    ctx: AudioContext,
    spec: HeadStrokeSpec,
    now: number,
    gainScale: number
  ): void {
    const f0 = spec.fundamentalHz;
    const decay = spec.decaySec;

    if (spec.articulation === 'closed') {
      // Crisp muted treble tap (Ki)
      this.addSkinTransient(ctx, now, 950, 0.35 * gainScale);
      return;
    }

    // Modal harmonic partials characteristic of the Pothi khari spot
    const ratios =
      spec.articulation === 'rim' ? [1.0, 2.14, 3.18] : [1.0, 1.99, 2.98];
    const amplitudes =
      spec.articulation === 'rim' ? [0.48, 0.32, 0.16] : [0.58, 0.28, 0.12];

    ratios.forEach((ratio, idx) => {
      const osc = ctx.createOscillator();
      const partialGain = ctx.createGain();
      osc.type = idx === 0 ? 'sine' : 'triangle';

      const freq = f0 * ratio;
      osc.frequency.setValueAtTime(freq * 1.06, now);
      osc.frequency.exponentialRampToValueAtTime(freq, now + 0.015);

      const partialDecay = decay / (1 + idx * 0.55);
      partialGain.gain.setValueAtTime(0.001, now);
      partialGain.gain.linearRampToValueAtTime(
        amplitudes[idx] * gainScale,
        now + 0.003
      );
      partialGain.gain.exponentialRampToValueAtTime(0.0005, now + partialDecay);

      osc.connect(partialGain);
      partialGain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + partialDecay + 0.02);
    });

    this.addSkinTransient(ctx, now, 1200, 0.16 * gainScale);
  }

  private addSkinTransient(
    ctx: AudioContext,
    now: number,
    centerFreq: number,
    level: number
  ): void {
    if (!this.noiseBuffer) return;
    const noise = ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(centerFreq, now);
    filter.Q.setValueAtTime(2.2, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(level, now);
    gain.gain.exponentialRampToValueAtTime(0.0005, now + 0.045);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(now);
    noise.stop(now + 0.05);
  }
}

