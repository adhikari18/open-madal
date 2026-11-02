import { describe, expect, it } from 'vitest';
import {
  BOL_DICTIONARY,
  TAAL_PRESETS,
  addRational,
  compileToMidi,
  createRational,
  divideRationalByInt,
  flattenTimeline,
  formatRational,
  multiplyRational,
  parseMadalCode,
  renderLinearTabSVG,
  renderRadialClockSVG,
  validateMadalProgram,
} from '../src/index.js';

describe('@open-madal/core parser & AST', () => {
  it('parses metadata headers, sections, bars, and dual-head bol decompositions', () => {
    const src = `
@title: Test Jhyaure
@taal: Jhyaure
@tempo: 132
@meter: 6/8
@tali: 1, 4
@khali: 2

[Theka]
| >Dha - Ti : Ta Ghe - | x2
`;
    const ast = parseMadalCode(src);
    expect(ast.diagnostics).toHaveLength(0);
    expect(ast.metadata.title).toBe('Test Jhyaure');
    expect(ast.metadata.tempo).toBe(132);
    expect(ast.metadata.meter).toEqual({ beatsPerBar: 6, beatUnit: 8 });
    expect(ast.sections).toHaveLength(1);
    expect(ast.sections[0].name).toBe('Theka');
    expect(ast.sections[0].bars).toHaveLength(1);

    const firstBar = ast.sections[0].bars[0];
    expect(firstBar.repeat).toBe(2);
    expect(firstBar.beats).toHaveLength(6);

    // Beat 1 is >Dha (compound: Bhale Ghe + Pothi Ta, accented)
    const beat1Token = firstBar.beats[0].subdivisions[0];
    expect(beat1Token.bol).toBe('Dha');
    expect(beat1Token.modifiers.accent).toBe(true);
    expect(beat1Token.bhale?.stroke).toBe('Ghe');
    expect(beat1Token.pothi?.stroke).toBe('Ta');
  });

  it('parses bracketed sub-beat subdivisions and expressive modifiers', () => {
    const src = `
@meter: 4/4
| (Ka)>Dha [Ti Ta] Ghe^ Ghe. |
`;
    const ast = parseMadalCode(src);
    expect(ast.diagnostics).toHaveLength(0);
    const beats = ast.sections[0].bars[0].beats;
    expect(beats).toHaveLength(4);

    // Beat 1: (Ka)>Dha
    expect(beats[0].subdivisions[0].modifiers.graceBol).toBe('Ka');
    expect(beats[0].subdivisions[0].modifiers.accent).toBe(true);

    // Beat 2: [Ti Ta]
    expect(beats[1].subdivisions).toHaveLength(2);
    expect(beats[1].subdivisions[0].bol).toBe('Ti');
    expect(beats[1].subdivisions[0].durationFractions).toBe(0.5);
    expect(beats[1].subdivisions[1].bol).toBe('Ta');

    // Beat 3: Ghe^
    expect(beats[2].subdivisions[0].modifiers.pitchBend).toBe(true);
    expect(beats[2].subdivisions[0].bhale?.articulation).toBe('pitch-bend');

    // Beat 4: Ghe.
    expect(beats[3].subdivisions[0].modifiers.damped).toBe(true);
    expect(beats[3].subdivisions[0].bhale?.articulation).toBe('closed');
  });

  it('validates all built-in Nepali Taal presets without errors or warnings', () => {
    for (const preset of TAAL_PRESETS) {
      const ast = parseMadalCode(preset.source);
      const report = validateMadalProgram(ast);
      expect(report.valid).toBe(true);
      expect(report.errors).toHaveLength(0);
      expect(report.warnings).toHaveLength(0);
      expect(report.stats.totalBeats).toBeGreaterThan(0);
    }
  });

  it('flattens timeline and compiles valid Standard MIDI File (MThd + MTrk)', () => {
    const ast = parseMadalCode(TAAL_PRESETS[0].source);
    const timeline = flattenTimeline(ast);
    expect(timeline.length).toBeGreaterThan(12);

    const midiBytes = compileToMidi(ast);
    // Check 'MThd' magic header
    const headerMagic = String.fromCharCode(...midiBytes.slice(0, 4));
    expect(headerMagic).toBe('MThd');
    // Check 'MTrk' chunk header at byte 14
    const trackMagic = String.fromCharCode(...midiBytes.slice(14, 18));
    expect(trackMagic).toBe('MTrk');
    expect(midiBytes.byteLength).toBeGreaterThan(60);
  });

  it('renders both Linear Tablature SVG and Radial Rhythm Clock SVG in Roman and Devanagari scripts', () => {
    const ast = parseMadalCode(TAAL_PRESETS[0].source);
    const linearRoman = renderLinearTabSVG(ast, { script: 'roman' });
    const linearDeva = renderLinearTabSVG(ast, { script: 'devanagari' });
    const radialSvg = renderRadialClockSVG(ast, { script: 'devanagari', activeBeatIndex: 0 });

    expect(linearRoman).toContain('<svg');
    expect(linearRoman).toContain('Traditional Jhyaure Taal');
    expect(linearDeva).toContain(BOL_DICTIONARY.Dha.devanagari);
    expect(radialSvg).toContain('<polygon');
  });

  it('normalizes regional oral dialect aliases (Ge -> Ghe, Tang -> Tin, Kat -> Ka) into canonical dual-head AST nodes', () => {
    const src = `
@meter: 4/4
| Ge Tang Kat Dhi |
`;
    const ast = parseMadalCode(src);
    expect(ast.diagnostics).toHaveLength(0);
    const beats = ast.sections[0].bars[0].beats;
    expect(beats[0].subdivisions[0].bol).toBe('Ghe');
    expect(beats[1].subdivisions[0].bol).toBe('Tin');
    expect(beats[2].subdivisions[0].bol).toBe('Ka');
    expect(beats[3].subdivisions[0].bol).toBe('Dhin');
  });

  it('computes exact lowest-terms rational beat fractions without floating-point drift', () => {
    const oneThird = createRational(1, 3);
    const oneSixth = divideRationalByInt(oneThird, 2);
    expect(oneSixth).toEqual({ numerator: 1, denominator: 6 });
    expect(formatRational(oneSixth)).toBe('1/6');

    const sum = addRational(
      addRational(oneThird, oneSixth),
      addRational(oneSixth, oneThird)
    );
    expect(sum).toEqual({ numerator: 1, denominator: 1 });
    expect(formatRational(sum)).toBe('1');
    expect(multiplyRational(createRational(2, 3), createRational(3, 4))).toEqual({
      numerator: 1,
      denominator: 2,
    });

    const ast = parseMadalCode('| [Ti Ta Ki] Dha |');
    const timeline = flattenTimeline(ast);
    expect(timeline[0].rationalDuration).toEqual({ numerator: 1, denominator: 3 });
    expect(timeline[1].rationalOffset).toEqual({ numerator: 1, denominator: 3 });
    expect(timeline[2].rationalOffset).toEqual({ numerator: 2, denominator: 3 });
    expect(timeline[3].rationalOffset).toEqual({ numerator: 1, denominator: 1 });
  });

  it('parses arbitrary-depth nested tuplets with exact rational beat fractions and nesting depth', () => {
    const src = `
@meter: 4/4
| [Ti [Ka Ki] Ta] [Dha [Ti [Ka Ki] Ta]] [Ti Ta Ki] Dha |
`;
    const ast = parseMadalCode(src);
    expect(ast.diagnostics).toHaveLength(0);
    const beats = ast.sections[0].bars[0].beats;
    expect(beats).toHaveLength(4);

    // Beat 1: [Ti [Ka Ki] Ta] -> 1/3, 1/6, 1/6, 1/3
    const b1 = beats[0].subdivisions;
    expect(b1).toHaveLength(4);
    expect(b1.map((s) => s.bol)).toEqual(['Ti', 'Ka', 'Ki', 'Ta']);
    expect(b1.map((s) => s.rationalDuration)).toEqual([
      { numerator: 1, denominator: 3 },
      { numerator: 1, denominator: 6 },
      { numerator: 1, denominator: 6 },
      { numerator: 1, denominator: 3 },
    ]);
    expect(b1.map((s) => s.tupletDepth)).toEqual([1, 2, 2, 1]);

    // Beat 2: [Dha [Ti [Ka Ki] Ta]] -> 1/2, 1/6, 1/12, 1/12, 1/6 (depth up to 3)
    const b2 = beats[1].subdivisions;
    expect(b2).toHaveLength(5);
    expect(b2.map((s) => s.rationalDuration)).toEqual([
      { numerator: 1, denominator: 2 },
      { numerator: 1, denominator: 6 },
      { numerator: 1, denominator: 12 },
      { numerator: 1, denominator: 12 },
      { numerator: 1, denominator: 6 },
    ]);
    expect(b2.map((s) => s.tupletDepth)).toEqual([1, 2, 3, 3, 2]);

    // Beat 4: whole beat Dha -> 1/1, depth 0
    expect(beats[3].subdivisions[0].rationalDuration).toEqual({
      numerator: 1,
      denominator: 1,
    });
    expect(beats[3].subdivisions[0].tupletDepth).toBe(0);

    // Verify unmatched bracket diagnostic recovery
    const malformed = parseMadalCode('| [Ti [Ka Ki] Dha |');
    expect(malformed.diagnostics.some((d) => d.message.includes('Unclosed subdivision bracket'))).toBe(true);
  });

  it('expands ornamental rolls (Tirakita, Diri-Diri, [Ti [Ra Ki] Ta]) with exact rational subdivisions', () => {
    const src = `
@meter: 4/4
| [Ti [Ra Ki] Ta] >Tirakita Diri-Diri [Dha Tirakita] |
`;
    const ast = parseMadalCode(src);
    expect(ast.diagnostics).toHaveLength(0);
    const beats = ast.sections[0].bars[0].beats;
    expect(beats).toHaveLength(4);

    // Beat 1: [Ti [Ra Ki] Ta] -> 1/3, 1/6, 1/6, 1/3
    expect(beats[0].subdivisions.map((s) => s.bol)).toEqual(['Ti', 'Ra', 'Ki', 'Ta']);
    expect(beats[0].subdivisions.map((s) => s.rationalDuration)).toEqual([
      { numerator: 1, denominator: 3 },
      { numerator: 1, denominator: 6 },
      { numerator: 1, denominator: 6 },
      { numerator: 1, denominator: 3 },
    ]);

    // Beat 2: >Tirakita -> 4 quarter-beat roll strokes (1/4 each), accent on first stroke
    expect(beats[1].subdivisions.map((s) => s.bol)).toEqual(['Ti', 'Ra', 'Ki', 'Ta']);
    expect(beats[1].subdivisions[0].modifiers.accent).toBe(true);
    expect(beats[1].subdivisions[1].modifiers.accent).toBeUndefined();
    expect(beats[1].subdivisions.every((s) => s.rationalDuration.numerator === 1 && s.rationalDuration.denominator === 4)).toBe(true);

    // Beat 3: Diri-Diri -> 4 alternating roll strokes (Di, Ri, Di, Ri) at 1/4 beat each
    expect(beats[2].subdivisions.map((s) => s.bol)).toEqual(['Di', 'Ri', 'Di', 'Ri']);
    expect(beats[2].subdivisions[0].bhale?.stroke).toBe('Di');
    expect(beats[2].subdivisions[0].pothi?.stroke).toBe('Di');
    expect(beats[2].subdivisions[1].pothi?.stroke).toBe('Ri');

    // Beat 4: [Dha Tirakita] -> Dha (1/2) + Ti, Ra, Ki, Ta (1/8 each)
    expect(beats[3].subdivisions.map((s) => s.bol)).toEqual(['Dha', 'Ti', 'Ra', 'Ki', 'Ta']);
    expect(beats[3].subdivisions.map((s) => s.rationalDuration)).toEqual([
      { numerator: 1, denominator: 2 },
      { numerator: 1, denominator: 8 },
      { numerator: 1, denominator: 8 },
      { numerator: 1, denominator: 8 },
      { numerator: 1, denominator: 8 },
    ]);

    // Verify proportional SVG tablature rendering for nested tuplets and rolls
    const svg = renderLinearTabSVG(ast, { script: 'roman' });
    expect(svg).toContain('>Ra<');
    expect(svg).toContain('>Di<');
    expect(svg).toContain('>Ri<');
    const clockSvg = renderRadialClockSVG(ast, { script: 'roman' });
    expect(clockSvg).toContain('[Ti Ra Ki Ta]');
  });
});

