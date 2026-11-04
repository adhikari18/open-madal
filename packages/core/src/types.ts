/**
 * Core AST and domain types for MadalCode v0.1.0
 */

export type DrumHead = 'bhale' | 'pothi' | 'both' | 'none';

export type StrokeArticulation =
  | 'open'        // Khula (open resonant ring on khari)
  | 'closed'      // Bandha / muted slap (Ka, Ki)
  | 'rim'         // Kinara / edge strike (Ta, Na)
  | 'pitch-bend'  // Heel pressure pitch-slide on Bhale (Dhing / Ghe^)
  | 'rest'        // Silence (-)
  | 'sustain';    // Let previous stroke ring (~)

export type CanonicalBolId =
  | 'Ghe'
  | 'Ga'
  | 'Dhum'
  | 'Ka'
  | 'Ki'
  | 'Ta'
  | 'Ti'
  | 'Tin'
  | 'Na'
  | 'Ra'
  | 'Di'
  | 'Ri'
  | 'Dha'
  | 'Dhin'
  | 'Dhing'
  | '-'
  | '~';

/**
 * Chromatic tonic scale (Sur / Key) of the Madal.
 * 'C' corresponds to the reference recording (~266 Hz Pothi / ~174 Hz Bhale).
 */
export type MadalScale =
  | 'C'
  | 'C#'
  | 'D'
  | 'D#'
  | 'E'
  | 'F'
  | 'F#'
  | 'G'
  | 'G#'
  | 'A'
  | 'A#'
  | 'B';

export interface MadalScaleInfo {
  id: MadalScale;
  /** Traditional Nepali harmonium scale name (Safed / Kali) */
  harmoniumName: string;
  /** Semitone shift relative to the reference C recording */
  semitonesFromC: number;
  /** Frequency multiplier relative to the reference C recording */
  pitchRatio: number;
  /** Approximate Bhale (large bass head) fundamental in Hz */
  bhaleHz: number;
  /** Approximate Pothi (small treble head) fundamental in Hz */
  pothiHz: number;
}

export interface HeadStrokeSpec {
  /** Which head is struck */
  head: 'bhale' | 'pothi';
  /** Individual stroke name on that head */
  stroke: string;
  /** Articulation style */
  articulation: StrokeArticulation;
  /** General MIDI Percussion note number */
  midiNote: number;
  /** Fundamental frequency in Hz for synthesis */
  fundamentalHz: number;
  /** Decay duration in seconds */
  decaySec: number;
}

export interface BolDefinition {
  id: CanonicalBolId;
  roman: string;
  devanagari: string;
  head: DrumHead;
  articulation: StrokeArticulation;
  description: string;
  /** Decomposition onto Bhale (left bass head) if active */
  bhale?: HeadStrokeSpec;
  /** Decomposition onto Pothi (right treble head) if active */
  pothi?: HeadStrokeSpec;
  /** Default MIDI velocity (1-127) */
  defaultVelocity: number;
}

export interface StrokeModifiers {
  /** Dynamic accent (>Dha) */
  accent?: boolean;
  /** Heel pressure pitch bend up (Ghe^) */
  pitchBend?: boolean;
  /** Damped / choked immediately after strike (Ghe.) */
  damped?: boolean;
  /** Optional grace bol preceding main stroke, e.g. (Ka)Dha */
  graceBol?: CanonicalBolId;
}

/**
 * Exact rational number representation (numerator / denominator) in lowest terms
 * to represent arbitrary-depth tuplet beat subdivisions without floating-point drift.
 */
export interface RationalFraction {
  numerator: number;
  denominator: number;
}

export interface BolTokenNode {
  type: 'BolToken';
  /** Canonical bol identifier */
  bol: CanonicalBolId;
  /** Raw token text from source */
  raw: string;
  /** Expressive modifiers */
  modifiers: StrokeModifiers;
  /** Decomposed Bhale stroke (if this bol activates the left bass head) */
  bhale?: HeadStrokeSpec;
  /** Decomposed Pothi stroke (if this bol activates the right treble head) */
  pothi?: HeadStrokeSpec;
  /** Relative duration weight inside a beat (e.g., 1 for whole beat, 0.5 for [Ti Ta]) */
  durationFractions: number;
  /** Exact rational duration inside a beat (e.g., { numerator: 1, denominator: 6 } for sextuplets) */
  rationalDuration: RationalFraction;
  /** Nesting depth of bracketed subdivisions (0 for whole beat, 1 for [Ti Ta], 2 for [Ti [Ra Ki] Ta]) */
  tupletDepth?: number;
  /** Source location */
  line: number;
  column: number;
}

export interface BeatCellNode {
  type: 'BeatCell';
  /** Beat index within the bar (1-based) */
  beatNumber: number;
  /** Sub-strokes inside this beat (1 for simple beat, 2+ for bracketed subdivisions like [Ti Ta]) */
  subdivisions: BolTokenNode[];
  /** Marker for Sam (X), Tali (1, 2...), or Khali (0) */
  vibhagMarker?: 'sam' | 'tali' | 'khali';
}

export interface BarNode {
  type: 'Bar';
  barNumber: number;
  beats: BeatCellNode[];
  /** Optional repeat multiplier (e.g., | Dha - Ti Ta | x2) */
  repeat: number;
  line: number;
}

export interface SectionNode {
  type: 'Section';
  name: string;
  bars: BarNode[];
}

export interface TimeSignature {
  beatsPerBar: number;
  beatUnit: number;
}

export interface MadalDocumentMetadata {
  title: string;
  taal: string;
  tempo: number;
  meter: TimeSignature;
  /** Optional chromatic scale (Sur / Key) of the Madal, e.g. 'C', 'C#', 'D', 'F#', 'G' */
  scale?: MadalScale;
  region?: string;
  composer?: string;
  /** 1-based beat numbers that carry a Tali (clap), Beat 1 is always Sam */
  taliBeats: number[];
  /** 1-based beat numbers that carry a Khali (open wave) */
  khaliBeats: number[];
}

export interface ParseDiagnostic {
  severity: 'error' | 'warning';
  message: string;
  line: number;
  column: number;
}

export interface MadalProgramAST {
  type: 'MadalProgram';
  metadata: MadalDocumentMetadata;
  sections: SectionNode[];
  diagnostics: ParseDiagnostic[];
}

export interface FlattenedTimelineEvent {
  /** Absolute time in beats (0-based from start of pattern) */
  beatOffset: number;
  /** Duration in beats */
  durationBeats: number;
  /** Exact rational beat offset from start of pattern */
  rationalOffset: RationalFraction;
  /** Exact rational duration in beats */
  rationalDuration: RationalFraction;
  /** Absolute time in seconds based on document tempo */
  timeSeconds: number;
  /** Duration in seconds */
  durationSeconds: number;
  /** 1-based bar index */
  barIndex: number;
  /** 1-based beat index within bar */
  beatInBar: number;
  /** 0-based subdivision index within beat */
  subdivisionIndex: number;
  /** Total subdivisions in this beat */
  totalSubdivisions: number;
  /** Section name */
  sectionName: string;
  /** Underlying Bol token */
  token: BolTokenNode;
  /** Velocity (1-127) */
  velocity: number;
}

