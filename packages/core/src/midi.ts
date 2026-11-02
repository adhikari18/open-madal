import { resolveBol } from './bols.js';
import { flattenTimeline } from './parser.js';
import { MadalProgramAST } from './types.js';

const TICKS_PER_BEAT = 480;
const MIDI_PERCUSSION_CHANNEL = 9; // 0-indexed Channel 10

interface RawMidiEvent {
  tick: number;
  bytes: number[];
}

function encodeVariableLengthQuantity(value: number): number[] {
  let buffer = value & 0x7f;
  const bytes: number[] = [];
  while ((value >>= 7) > 0) {
    buffer <<= 8;
    buffer |= (value & 0x7f) | 0x80;
  }
  while (true) {
    bytes.push(buffer & 0xff);
    if (buffer & 0x80) {
      buffer >>= 8;
    } else {
      break;
    }
  }
  return bytes;
}

function uint32Bytes(val: number): number[] {
  return [(val >>> 24) & 0xff, (val >>> 16) & 0xff, (val >>> 8) & 0xff, val & 0xff];
}

function uint16Bytes(val: number): number[] {
  return [(val >>> 8) & 0xff, val & 0xff];
}

function stringToBytes(str: string): number[] {
  return Array.from(new TextEncoder().encode(str));
}

/**
 * Compile a MadalProgramAST into a Standard MIDI File (SMF Format 0) binary Uint8Array.
 * Decomposes compound bols (such as Dha, Dhin, Dhing) into simultaneous Bhale and Pothi MIDI notes.
 */
export function compileToMidi(ast: MadalProgramAST): Uint8Array {
  const timeline = flattenTimeline(ast);
  const rawEvents: RawMidiEvent[] = [];

  // 1. Track title meta event at tick 0
  const titleBytes = stringToBytes(`${ast.metadata.title} (${ast.metadata.taal})`);
  rawEvents.push({
    tick: 0,
    bytes: [0xff, 0x03, ...encodeVariableLengthQuantity(titleBytes.length), ...titleBytes],
  });

  // 2. Tempo meta event (microseconds per beat)
  const microsecondsPerBeat = Math.round(60_000_000 / Math.max(20, ast.metadata.tempo));
  rawEvents.push({
    tick: 0,
    bytes: [
      0xff,
      0x51,
      0x03,
      (microsecondsPerBeat >>> 16) & 0xff,
      (microsecondsPerBeat >>> 8) & 0xff,
      microsecondsPerBeat & 0xff,
    ],
  });

  // 3. Time signature meta event
  const { beatsPerBar, beatUnit } = ast.metadata.meter;
  const denominatorPower = Math.max(1, Math.round(Math.log2(beatUnit)));
  rawEvents.push({
    tick: 0,
    bytes: [0xff, 0x58, 0x04, beatsPerBar & 0xff, denominatorPower & 0xff, 0x18, 0x08],
  });

  // 4. Schedule note events for Bhale and Pothi heads
  for (const event of timeline) {
    const startTick = Math.round(
      (event.rationalOffset.numerator * TICKS_PER_BEAT) / event.rationalOffset.denominator
    );
    const exactDurationTicks =
      (event.rationalDuration.numerator * TICKS_PER_BEAT) / event.rationalDuration.denominator;
    const gateDurationTicks = Math.max(
      40,
      Math.round(exactDurationTicks * (event.token.modifiers.damped ? 0.25 : 0.8))
    );

    // Optional grace bol slightly before main beat (or at startTick if 0)
    if (event.token.modifiers.graceBol) {
      const graceDef = resolveBol(event.token.modifiers.graceBol);
      if (graceDef) {
        const graceTick = Math.max(0, startTick - 60);
        const graceNote = graceDef.bhale?.midiNote ?? graceDef.pothi?.midiNote ?? 62;
        rawEvents.push({
          tick: graceTick,
          bytes: [0x90 | MIDI_PERCUSSION_CHANNEL, graceNote, 72],
        });
        rawEvents.push({
          tick: graceTick + 45,
          bytes: [0x80 | MIDI_PERCUSSION_CHANNEL, graceNote, 0],
        });
      }
    }

    if (event.token.bhale) {
      const note = event.token.bhale.midiNote;
      rawEvents.push({
        tick: startTick,
        bytes: [0x90 | MIDI_PERCUSSION_CHANNEL, note, event.velocity],
      });
      rawEvents.push({
        tick: startTick + gateDurationTicks,
        bytes: [0x80 | MIDI_PERCUSSION_CHANNEL, note, 0],
      });
    }

    if (event.token.pothi) {
      const note = event.token.pothi.midiNote;
      rawEvents.push({
        tick: startTick,
        bytes: [0x90 | MIDI_PERCUSSION_CHANNEL, note, event.velocity],
      });
      rawEvents.push({
        tick: startTick + gateDurationTicks,
        bytes: [0x80 | MIDI_PERCUSSION_CHANNEL, note, 0],
      });
    }
  }

  // Sort events chronologically; Note Off (0x80) before Note On (0x90) at same tick
  rawEvents.sort((a, b) => {
    if (a.tick !== b.tick) return a.tick - b.tick;
    return a.bytes[0] - b.bytes[0];
  });

  // Encode delta times into track data
  const trackData: number[] = [];
  let lastTick = 0;
  for (const ev of rawEvents) {
    const delta = Math.max(0, ev.tick - lastTick);
    lastTick = ev.tick;
    trackData.push(...encodeVariableLengthQuantity(delta), ...ev.bytes);
  }

  // End of Track meta event
  trackData.push(0x00, 0xff, 0x2f, 0x00);

  // Assemble complete SMF Format 0 binary
  const headerChunk = [
    ...stringToBytes('MThd'),
    ...uint32Bytes(6),
    ...uint16Bytes(0), // Format 0
    ...uint16Bytes(1), // 1 track
    ...uint16Bytes(TICKS_PER_BEAT),
  ];

  const trackChunk = [
    ...stringToBytes('MTrk'),
    ...uint32Bytes(trackData.length),
    ...trackData,
  ];

  return new Uint8Array([...headerChunk, ...trackChunk]);
}

