import { describe, expect, it } from 'vitest';
import {
  BOL_DICTIONARY,
  TAAL_PRESETS,
  compileToMidi,
  flattenTimeline,
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
});

