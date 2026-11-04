import { BOL_DICTIONARY, BolTokenNode, HeadStrokeSpec } from '@open-madal/core';

/**
 * Acoustic Madal voice engine.
 *
 * Primary source: real CC0 one-shot recordings of a madal (see
 * `public/samples/madal/README.md`). Every bol is mapped to the physical stroke that
 * produces it (Taang, Taak, Naa, Ghin, Kha) instead of a generic drum sound.
 *
 * Fallback: if samples have not loaded yet (or cannot be fetched), strokes are rendered by a
 * modal synthesiser whose partial frequency ratios, levels and per-partial T60 decay times
 * were measured from those same recordings (see `docs/madal-acoustics.md`). Unlike a western
 * kick/tom, a madal head has steady pitch (no downward pitch sweep), a soft finger attack,
 * and a long tonal ring shaped by the black khari paste.
 */

// ---------------------------------------------------------------------------
// Sample bank
// ---------------------------------------------------------------------------

type SampleId = 'taang' | 'taang-2' | 'taak' | 'kha' | 'ghin';

const SAMPLE_FILES: Record<SampleId, string> = {
  taang: '/samples/madal/taang.wav',
  'taang-2': '/samples/madal/taang-2.wav',
  taak: '/samples/madal/taak.wav',
  kha: '/samples/madal/kha.wav',
  ghin: '/samples/madal/ghin.wav',
};

/** Measured fundamental of each recording (Hz), used to retune samples to HeadStrokeSpec pitch. */
const SAMPLE_FUNDAMENTAL_HZ: Record<SampleId, number> = {
  taang: 269.8,
  'taang-2': 263.4,
  taak: 267.1,
  kha: 177.6,
  ghin: 173.9,
};

interface StrokeVoice {
  sample: SampleId;
  /** Linear gain relative to a full-strength open stroke */
  gain: number;
  /** Modal fallback profile */
  modal: ModalProfileId;
}

/**
 * Physical stroke used for each per-head stroke name emitted by @open-madal/core.
 * Pitch comes from HeadStrokeSpec.fundamentalHz and ring length from HeadStrokeSpec.decaySec,
 * so the core bol dictionary stays the single source of truth for tuning and duration.
 */
const POTHI_VOICES: Record<string, StrokeVoice> = {
  // Open index-finger stroke on the small head = Taang (ताङ)
  Tin: { sample: 'taang', gain: 0.92, modal: 'pothi-open' },
  Ti: { sample: 'taang', gain: 0.78, modal: 'pothi-open' },
  Ta: { sample: 'taang-2', gain: 0.95, modal: 'pothi-open' },
  Di: { sample: 'taang', gain: 0.62, modal: 'pothi-open' },
  // Higher, lighter open stroke = Naa (ना); same mode structure as Taang, ~3 semitones up
  Na: { sample: 'taang', gain: 0.8, modal: 'pothi-naa' },
  Ri: { sample: 'taang', gain: 0.6, modal: 'pothi-naa' },
  // Closed three-finger stroke on the khari = Taak (ताक)
  Ki: { sample: 'taak', gain: 0.82, modal: 'pothi-closed' },
  Ra: { sample: 'taak', gain: 0.66, modal: 'pothi-closed' },
};

const BHALE_VOICES: Record<string, StrokeVoice> = {
  // Open four-finger stroke on the large head = Ghin (घिन)
  Ghe: { sample: 'ghin', gain: 1.0, modal: 'bhale-open' },
  'Ghe^': { sample: 'ghin', gain: 1.0, modal: 'bhale-open' },
  Dhum: { sample: 'ghin', gain: 1.0, modal: 'bhale-open' },
  Ga: { sample: 'ghin', gain: 0.74, modal: 'bhale-open' },
  Di: { sample: 'ghin', gain: 0.7, modal: 'bhale-open' },
  // Closed stroke on the large head's khari = Kha (ख)
  Ka: { sample: 'kha', gain: 0.88, modal: 'bhale-closed' },
};

function resolveVoice(spec: HeadStrokeSpec): StrokeVoice {
  const table = spec.head === 'bhale' ? BHALE_VOICES : POTHI_VOICES;
  const voice = table[spec.stroke];
  if (voice) return voice;
  // Unknown stroke name: choose by head + articulation
  if (spec.head === 'bhale') {
    return spec.articulation === 'closed' ? BHALE_VOICES.Ka : BHALE_VOICES.Ghe;
  }
  if (spec.articulation === 'closed') return POTHI_VOICES.Ki;
  if (spec.articulation === 'rim') return POTHI_VOICES.Ta;
  return POTHI_VOICES.Tin;
}

// ---------------------------------------------------------------------------
// Modal fallback synthesis (measured from the recordings)
// ---------------------------------------------------------------------------

type ModalProfileId = 'pothi-open' | 'pothi-closed' | 'pothi-naa' | 'bhale-open' | 'bhale-closed';

interface ModalPartial {
  /** Frequency ratio relative to the head's fundamental */
  ratio: number;
  /** Level relative to the strongest partial (dB) */
  levelDb: number;
  /** Time for this partial to decay by 60 dB (s) */
  t60: number;
}

interface ModalProfile {
  /** Fundamental of the measured recording; partial ratios are relative to this */
  referenceHz: number;
  partials: ModalPartial[];
  /** Low-passed finger/skin contact noise */
  contactCutoffHz: number;
  contactLevel: number;
}

// Levels are initial amplitudes, chosen so the 10-400 ms spectrum of the rendered stroke matches the
// recording (verified by capturing Chrome's output and re-analysing it).
const MODAL_PROFILES: Record<ModalProfileId, ModalProfile> = {
  // Taang: 270 Hz fundamental, flat octave at 1.86-1.9x, upper modes die in <0.5 s
  'pothi-open': {
    referenceHz: 266,
    partials: [
      { ratio: 1.0, levelDb: 0, t60: 1.85 },
      { ratio: 1.89, levelDb: -9, t60: 1.35 },
      { ratio: 2.86, levelDb: -33, t60: 0.48 },
      { ratio: 3.86, levelDb: -51, t60: 0.25 },
    ],
    contactCutoffHz: 1400,
    contactLevel: 0.22,
  },
  // Taak: fingers on the khari damp the fundamental hardest; the 1.94x mode outlives it
  'pothi-closed': {
    referenceHz: 267,
    partials: [
      { ratio: 1.0, levelDb: 0, t60: 0.18 },
      { ratio: 1.94, levelDb: -20, t60: 0.55 },
      { ratio: 2.95, levelDb: -21, t60: 0.22 },
      { ratio: 3.87, levelDb: -37, t60: 0.15 },
    ],
    contactCutoffHz: 1100,
    contactLevel: 0.3,
  },
  // Naa: 313 Hz with the same 1 : 1.94 : 2.83 mode pattern as Taang
  'pothi-naa': {
    referenceHz: 313,
    partials: [
      { ratio: 1.0, levelDb: 0, t60: 1.63 },
      { ratio: 1.94, levelDb: -14, t60: 0.95 },
      { ratio: 2.83, levelDb: -27, t60: 0.17 },
    ],
    contactCutoffHz: 1600,
    contactLevel: 0.2,
  },
  // Ghin: 174 Hz, inharmonic 1.65x partial (not an octave), very long ring
  'bhale-open': {
    referenceHz: 174,
    partials: [
      { ratio: 1.0, levelDb: 0, t60: 2.72 },
      { ratio: 1.65, levelDb: -21, t60: 2.16 },
      { ratio: 2.37, levelDb: -35, t60: 0.75 },
      { ratio: 2.56, levelDb: -31, t60: 0.75 },
    ],
    contactCutoffHz: 900,
    contactLevel: 0.18,
  },
  // Kha: same head, damped: 177 Hz + 1.63x, gone in ~0.3 s
  'bhale-closed': {
    referenceHz: 177,
    partials: [
      { ratio: 1.0, levelDb: 0, t60: 0.28 },
      { ratio: 1.63, levelDb: -24, t60: 0.51 },
      { ratio: 2.48, levelDb: -33, t60: 0.17 },
      { ratio: 2.7, levelDb: -30, t60: 0.17 },
    ],
    contactCutoffHz: 800,
    contactLevel: 0.28,
  },
};

// ---------------------------------------------------------------------------
// Engine
// ---------------------------------------------------------------------------

interface ActiveVoice {
  gain: GainNode;
  stopAt: number;
}

/** Players sit facing the drum: bass head on the left, treble head on the right. */
const HEAD_PAN: Record<'bhale' | 'pothi', number> = { bhale: -0.18, pothi: 0.18 };

export class MadalAudioEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private headBus: Partial<Record<'bhale' | 'pothi', GainNode>> = {};
  private noiseBuffer: AudioBuffer | null = null;
  private samples: Partial<Record<SampleId, AudioBuffer>> = {};
  private samplesPromise: Promise<void> | null = null;
  private activeVoices: Record<'bhale' | 'pothi', ActiveVoice[]> = { bhale: [], pothi: [] };

  /**
   * Fetch and decode the madal recordings. Safe to call before any user gesture: decoding
   * uses an OfflineAudioContext, and AudioBuffers can be played on any AudioContext.
   */
  public preload(): Promise<void> {
    if (this.samplesPromise) return this.samplesPromise;
    if (typeof window === 'undefined') return Promise.resolve();

    const OfflineCtx =
      window.OfflineAudioContext ||
      (window as unknown as { webkitOfflineAudioContext: typeof OfflineAudioContext })
        .webkitOfflineAudioContext;
    const decoder = new OfflineCtx(1, 1, 44100);

    this.samplesPromise = Promise.all(
      (Object.keys(SAMPLE_FILES) as SampleId[]).map(async (id) => {
        try {
          const res = await fetch(SAMPLE_FILES[id]);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = await res.arrayBuffer();
          this.samples[id] = await decoder.decodeAudioData(data);
        } catch (err) {
          console.warn(
            `[open-madal] Could not load ${SAMPLE_FILES[id]} (${String(err)}); using modal synthesis.`
          );
        }
      })
    ).then(() => undefined);
    return this.samplesPromise;
  }

  /** True once all recordings are decoded and strokes play from real audio. */
  public isUsingRecordings(): boolean {
    return (Object.keys(SAMPLE_FILES) as SampleId[]).every((id) => this.samples[id]);
  }

  private ensureContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx({ latencyHint: 'interactive' });
      this.buildMixer(this.ctx);
      void this.preload();
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  /**
   * Mixer: per-head pan -> master -> gentle glue compression -> output,
   * with a short, quiet room send (the recordings are close-miked and very dry).
   */
  private buildMixer(ctx: AudioContext): void {
    const master = ctx.createGain();
    master.gain.value = 0.9;

    const glue = ctx.createDynamicsCompressor();
    glue.threshold.value = -14;
    glue.knee.value = 10;
    glue.ratio.value = 3;
    glue.attack.value = 0.006;
    glue.release.value = 0.18;

    const room = ctx.createConvolver();
    room.buffer = this.createRoomImpulse(ctx, 0.55);
    const roomSend = ctx.createGain();
    roomSend.gain.value = 0.12;

    master.connect(glue);
    master.connect(roomSend);
    roomSend.connect(room);
    room.connect(glue);
    glue.connect(ctx.destination);

    for (const head of ['bhale', 'pothi'] as const) {
      const bus = ctx.createGain();
      const pan = ctx.createStereoPanner();
      pan.pan.value = HEAD_PAN[head];
      bus.connect(pan);
      pan.connect(master);
      this.headBus[head] = bus;
    }

    // Short noise burst for the modal fallback's finger-contact transient
    const len = Math.floor(ctx.sampleRate * 0.03);
    const noise = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = noise.getChannelData(0);
    for (let i = 0; i < len; i++) {
      d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.004));
    }
    this.noiseBuffer = noise;
    this.master = master;
  }

  /** Small wooden room: exponentially decaying, progressively darker stereo noise. */
  private createRoomImpulse(ctx: AudioContext, seconds: number): AudioBuffer {
    const len = Math.floor(ctx.sampleRate * seconds);
    const ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const data = ir.getChannelData(ch);
      let lp = 0;
      for (let i = 0; i < len; i++) {
        const t = i / ctx.sampleRate;
        const coeff = 0.25 + 0.7 * (t / seconds); // darker as the tail decays
        lp += (1 - coeff) * ((Math.random() * 2 - 1) - lp);
        data[i] = lp * Math.exp(-t / (seconds * 0.22)) * (i < ctx.sampleRate * 0.008 ? 0 : 1);
      }
    }
    return ir;
  }

  public getCurrentTime(): number {
    return this.ensureContext().currentTime;
  }

  /**
   * Trigger a Bhale (bass) or Pothi (treble) head strike at a specific AudioContext time.
   */
  public triggerHeadStroke(spec: HeadStrokeSpec, when?: number, velocity = 100): void {
    const ctx = this.ensureContext();
    const now = Math.max(when ?? ctx.currentTime, ctx.currentTime);
    const voice = resolveVoice(spec);
    const vel = Math.max(1, Math.min(127, velocity)) / 127;

    // Hand-played dynamics: loudness and brightness follow velocity, with small human variance
    const humanGain = 1 + (Math.random() - 0.5) * 0.12;
    const amp = voice.gain * Math.pow(vel, 1.4) * humanGain;
    const brightnessHz = 1400 + Math.pow(vel, 1.6) * 9000;
    const humanDetune = 1 + (Math.random() - 0.5) * 0.006;

    // A new stroke on a head stops that head's previous ring: fingers touch the same skin.
    const isClosed = spec.articulation === 'closed';
    this.chokeHead(spec.head, now, isClosed ? 0.006 : 0.025);

    const length = Math.max(0.05, spec.decaySec);
    const buffer = this.samples[voice.sample];
    const output = buffer
      ? this.playSample(ctx, spec, voice, buffer, now, length, amp, brightnessHz, humanDetune)
      : this.playModal(ctx, spec, voice, now, length, amp, brightnessHz, humanDetune);

    this.activeVoices[spec.head].push(output);
    this.activeVoices[spec.head] = this.activeVoices[spec.head].filter(
      (v) => v.stopAt > ctx.currentTime
    );
  }

  /**
   * Trigger a complete BolTokenNode (which may strike Bhale, Pothi, or both simultaneously).
   */
  public triggerBolToken(token: BolTokenNode, when?: number, velocity = 105): void {
    const ctx = this.ensureContext();
    const now = when ?? ctx.currentTime;

    if (token.modifiers.graceBol) {
      // Grace stroke ~35 ms ahead of the main stroke, played softly on its own head(s)
      const graceTime = Math.max(ctx.currentTime, now - 0.035);
      const graceDef = BOL_DICTIONARY[token.modifiers.graceBol];
      if (graceDef?.bhale) this.triggerHeadStroke(graceDef.bhale, graceTime, velocity * 0.55);
      if (graceDef?.pothi) this.triggerHeadStroke(graceDef.pothi, graceTime, velocity * 0.55);
    }
    if (token.bhale) {
      this.triggerHeadStroke(token.bhale, now, velocity);
    }
    if (token.pothi) {
      this.triggerHeadStroke(token.pothi, now, velocity);
    }
  }

  /**
   * Soft wooden tick for the beat guide (Sam slightly brighter and louder).
   * Kept quiet and non-tonal so it does not sound like an electronic beep over the drum.
   */
  public triggerMetronome(isSam: boolean, when?: number): void {
    const ctx = this.ensureContext();
    const now = Math.max(when ?? ctx.currentTime, ctx.currentTime);
    if (!this.noiseBuffer || !this.master) return;

    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    const body = ctx.createBiquadFilter();
    body.type = 'bandpass';
    body.frequency.value = isSam ? 2400 : 1900;
    body.Q.value = 6;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(isSam ? 0.32 : 0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);

    src.connect(body);
    body.connect(gain);
    gain.connect(this.master);
    src.start(now);
    src.stop(now + 0.035);
  }

  private chokeHead(head: 'bhale' | 'pothi', at: number, timeConstant: number): void {
    for (const v of this.activeVoices[head]) {
      if (v.stopAt <= at) continue;
      v.gain.gain.cancelScheduledValues(at);
      v.gain.gain.setTargetAtTime(0, at, timeConstant);
    }
    this.activeVoices[head] = [];
  }

  private playSample(
    ctx: AudioContext,
    spec: HeadStrokeSpec,
    voice: StrokeVoice,
    buffer: AudioBuffer,
    now: number,
    length: number,
    amp: number,
    brightnessHz: number,
    humanDetune: number
  ): ActiveVoice {
    const src = ctx.createBufferSource();
    src.buffer = buffer;

    // Retune the recording to the stroke's pitch (e.g. Naa sits ~3 semitones above Taang)
    const rate = (spec.fundamentalHz / SAMPLE_FUNDAMENTAL_HZ[voice.sample]) * humanDetune;
    src.playbackRate.setValueAtTime(rate, now);
    if (spec.articulation === 'pitch-bend') {
      // Pressing the heel into the skin raises tension: gentle upward glide, then settle
      src.playbackRate.linearRampToValueAtTime(rate * 1.07, now + 0.22);
      src.playbackRate.linearRampToValueAtTime(rate * 1.05, now + Math.min(length, 0.9));
    }

    const tone = ctx.createBiquadFilter();
    tone.type = 'lowpass';
    tone.frequency.value = brightnessHz;
    tone.Q.value = 0.5;

    const naturalLength = buffer.duration / rate;
    const stopAt = now + Math.min(length, naturalLength);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(amp, now);
    if (length < naturalLength) {
      // Shortened ring (lighter stroke or damped `.` modifier): fade over the last part
      const fade = Math.min(0.06, length * 0.4);
      gain.gain.setValueAtTime(amp, stopAt - fade);
      gain.gain.linearRampToValueAtTime(0, stopAt);
    }

    src.connect(tone);
    tone.connect(gain);
    gain.connect(this.headBus[spec.head]!);
    src.start(now);
    src.stop(stopAt + 0.02);
    return { gain, stopAt };
  }

  private playModal(
    ctx: AudioContext,
    spec: HeadStrokeSpec,
    voice: StrokeVoice,
    now: number,
    length: number,
    amp: number,
    brightnessHz: number,
    humanDetune: number
  ): ActiveVoice {
    const profile = MODAL_PROFILES[voice.modal];
    const f0 = spec.fundamentalHz * humanDetune;
    const bus = this.headBus[spec.head]!;
    const voiceGain = ctx.createGain();
    voiceGain.gain.value = amp * 0.55;
    voiceGain.connect(bus);

    const stopAt = now + length;
    const fadeStart = Math.max(now + 0.005, stopAt - Math.min(0.06, length * 0.4));

    for (const partial of profile.partials) {
      const freq = f0 * partial.ratio;
      if (freq > brightnessHz * 1.2) continue;
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      // Steady membrane pitch: only a ~0.6% tension-modulation settle, no kick-drum sweep
      osc.frequency.setValueAtTime(freq * 1.006, now);
      osc.frequency.exponentialRampToValueAtTime(freq, now + 0.03);
      if (spec.articulation === 'pitch-bend') {
        osc.frequency.linearRampToValueAtTime(freq * 1.07, now + 0.22);
        osc.frequency.linearRampToValueAtTime(freq * 1.05, now + Math.min(length, 0.9));
      }

      const g = ctx.createGain();
      const peak = Math.pow(10, partial.levelDb / 20);
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(peak, now + 0.003);
      // Exponential decay reaching -60 dB at t60: time constant = t60 / ln(1000)
      g.gain.setTargetAtTime(0, now + 0.003, partial.t60 / 6.9);
      g.gain.setValueAtTime(peak * Math.pow(10, (-3 * (fadeStart - now)) / partial.t60), fadeStart);
      g.gain.linearRampToValueAtTime(0, stopAt);

      osc.connect(g);
      g.connect(voiceGain);
      osc.start(now);
      osc.stop(stopAt + 0.02);
    }

    // Soft finger-on-skin contact (dull, low-passed; not a bright click)
    if (this.noiseBuffer) {
      const n = ctx.createBufferSource();
      n.buffer = this.noiseBuffer;
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = Math.min(profile.contactCutoffHz, brightnessHz);
      const ng = ctx.createGain();
      ng.gain.value = profile.contactLevel;
      n.connect(lp);
      lp.connect(ng);
      ng.connect(voiceGain);
      n.start(now);
      n.stop(now + 0.03);
    }

    return { gain: voiceGain, stopAt };
  }
}
