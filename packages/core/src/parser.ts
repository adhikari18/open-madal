import { resolveBol } from './bols.js';
import {
  BarNode,
  BeatCellNode,
  BolTokenNode,
  FlattenedTimelineEvent,
  MadalDocumentMetadata,
  MadalProgramAST,
  ParseDiagnostic,
  SectionNode,
  StrokeModifiers,
  TimeSignature,
} from './types.js';

const DEFAULT_METADATA: MadalDocumentMetadata = {
  title: 'Untitled Madal Pattern',
  taal: 'Jhyaure',
  tempo: 120,
  meter: { beatsPerBar: 6, beatUnit: 8 },
  taliBeats: [1],
  khaliBeats: [4],
};

function parseMeter(raw: string): TimeSignature | null {
  const match = raw.trim().match(/^(\d+)\s*\/\s*(\d+)$/);
  if (!match) return null;
  const beatsPerBar = parseInt(match[1], 10);
  const beatUnit = parseInt(match[2], 10);
  if (beatsPerBar <= 0 || beatUnit <= 0) return null;
  return { beatsPerBar, beatUnit };
}

function parseNumberList(raw: string): number[] {
  if (!raw.trim() || raw.trim().toLowerCase() === 'none') return [];
  return raw
    .split(',')
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => !Number.isNaN(n) && n > 0);
}

/**
 * Parse an individual bol token string (with optional modifiers like >Dha, (Ka)Dha, Ghe^, Ghe.)
 */
export function parseBolToken(
  rawToken: string,
  durationFractions: number,
  line: number,
  column: number,
  diagnostics: ParseDiagnostic[]
): BolTokenNode {
  let working = rawToken.trim();
  const modifiers: StrokeModifiers = {};

  // 1. Check accent prefix '>' and grace note prefix '(Ka)' in either order
  let changedPrefix = true;
  while (changedPrefix) {
    changedPrefix = false;
    if (working.startsWith('>')) {
      modifiers.accent = true;
      working = working.slice(1);
      changedPrefix = true;
    }
    const graceMatch = working.match(/^\(([A-Za-z]+)\)(.+)$/);
    if (graceMatch) {
      const graceDef = resolveBol(graceMatch[1]);
      if (graceDef && graceDef.id !== '-' && graceDef.id !== '~') {
        modifiers.graceBol = graceDef.id;
      } else {
        diagnostics.push({
          severity: 'warning',
          message: `Unknown grace bol "(${graceMatch[1]})" ignored.`,
          line,
          column,
        });
      }
      working = graceMatch[2];
      changedPrefix = true;
    }
  }

  // 3. Check suffixes '^' (pitch-bend) and '.' (damped)
  while (working.endsWith('^') || working.endsWith('.')) {
    if (working.endsWith('^')) {
      modifiers.pitchBend = true;
      working = working.slice(0, -1);
    } else if (working.endsWith('.')) {
      modifiers.damped = true;
      working = working.slice(0, -1);
    }
  }

  const bolDef = resolveBol(working);
  if (!bolDef) {
    diagnostics.push({
      severity: 'error',
      message: `Unrecognized Madal bol "${rawToken}". Expected Ghe, Ka, Ta, Ti, Tin, Na, Dha, Dhin, Dhing, -, or ~.`,
      line,
      column,
    });
    return {
      type: 'BolToken',
      bol: '-',
      raw: rawToken,
      modifiers,
      durationFractions,
      line,
      column,
    };
  }

  const bhale = bolDef.bhale
    ? {
        ...bolDef.bhale,
        articulation: modifiers.pitchBend
          ? 'pitch-bend'
          : modifiers.damped
          ? 'closed'
          : bolDef.bhale.articulation,
        decaySec: modifiers.damped ? 0.08 : bolDef.bhale.decaySec,
      }
    : undefined;

  const pothi = bolDef.pothi
    ? {
        ...bolDef.pothi,
        articulation: modifiers.damped ? 'closed' : bolDef.pothi.articulation,
        decaySec: modifiers.damped ? 0.08 : bolDef.pothi.decaySec,
      }
    : undefined;

  return {
    type: 'BolToken',
    bol: bolDef.id,
    raw: rawToken,
    modifiers,
    bhale,
    pothi,
    durationFractions,
    line,
    column,
  };
}

/**
 * Parse a bar segment's content into BeatCellNodes.
 * Supports single tokens (`Dha`, `-`, `Ti`) and bracketed sub-beat groups (`[Ti Ta]`, `[Ghe Ti Ta]`).
 */
function parseBarCells(
  barContent: string,
  lineNum: number,
  baseCol: number,
  metadata: MadalDocumentMetadata,
  diagnostics: ParseDiagnostic[]
): BeatCellNode[] {
  const beats: BeatCellNode[] = [];
  // Allow ':' as a visual Vibhag (sub-bar) separator inside a bar
  const normalizedContent = barContent.replace(/:/g, ' ');
  const tokenRegex = /\[([^\]]+)\]|(\S+)/g;
  let match: RegExpExecArray | null;
  let beatIdx = 1;

  while ((match = tokenRegex.exec(normalizedContent)) !== null) {
    const col = baseCol + match.index;
    const bracketInner = match[1];
    const singleToken = match[2];

    let subdivisions: BolTokenNode[] = [];
    if (bracketInner !== undefined) {
      const subParts = bracketInner
        .trim()
        .split(/\s+/)
        .filter(Boolean);
      if (subParts.length === 0) {
        diagnostics.push({
          severity: 'warning',
          message: 'Empty subdivision bracket [] treated as rest.',
          line: lineNum,
          column: col,
        });
        subdivisions = [parseBolToken('-', 1, lineNum, col, diagnostics)];
      } else {
        const frac = 1 / subParts.length;
        subdivisions = subParts.map((part, idx) =>
          parseBolToken(part, frac, lineNum, col + 1 + idx * 2, diagnostics)
        );
      }
    } else if (singleToken !== undefined) {
      subdivisions = [parseBolToken(singleToken, 1, lineNum, col, diagnostics)];
    }

    let vibhagMarker: 'sam' | 'tali' | 'khali' | undefined;
    if (beatIdx === 1) {
      vibhagMarker = 'sam';
    } else if (metadata.taliBeats.includes(beatIdx)) {
      vibhagMarker = 'tali';
    } else if (metadata.khaliBeats.includes(beatIdx)) {
      vibhagMarker = 'khali';
    }

    beats.push({
      type: 'BeatCell',
      beatNumber: beatIdx,
      subdivisions,
      vibhagMarker,
    });
    beatIdx++;
  }

  return beats;
}

/**
 * Parse MadalCode source string into a structured AST with diagnostics.
 */
export function parseMadalCode(source: string): MadalProgramAST {
  const diagnostics: ParseDiagnostic[] = [];
  const metadata: MadalDocumentMetadata = {
    ...DEFAULT_METADATA,
    meter: { ...DEFAULT_METADATA.meter },
    taliBeats: [...DEFAULT_METADATA.taliBeats],
    khaliBeats: [...DEFAULT_METADATA.khaliBeats],
  };

  const sections: SectionNode[] = [];
  let currentSection: SectionNode = {
    type: 'Section',
    name: 'Main Pattern',
    bars: [],
  };

  const lines = source.split(/\r?\n/);
  let globalBarNumber = 1;

  for (let i = 0; i < lines.length; i++) {
    const lineNum = i + 1;
    // Strip inline comments (# or //)
    const commentIndex = lines[i].search(/(?:#|\/\/)/);
    const cleanLine = (commentIndex >= 0 ? lines[i].slice(0, commentIndex) : lines[i]).trim();

    if (!cleanLine) continue;

    // 1. Metadata directive: @key: value
    if (cleanLine.startsWith('@')) {
      const directiveMatch = cleanLine.match(/^@([a-zA-Z0-9_-]+)\s*:\s*(.+)$/);
      if (!directiveMatch) {
        diagnostics.push({
          severity: 'warning',
          message: `Malformed directive "${cleanLine}". Use "@key: value" format.`,
          line: lineNum,
          column: 1,
        });
        continue;
      }

      const key = directiveMatch[1].toLowerCase();
      const value = directiveMatch[2].trim();

      switch (key) {
        case 'title':
          metadata.title = value;
          break;
        case 'taal':
          metadata.taal = value;
          break;
        case 'region':
          metadata.region = value;
          break;
        case 'composer':
          metadata.composer = value;
          break;
        case 'tempo':
        case 'bpm': {
          const bpm = parseFloat(value);
          if (Number.isNaN(bpm) || bpm < 20 || bpm > 320) {
            diagnostics.push({
              severity: 'warning',
              message: `Invalid tempo "${value}". Must be between 20 and 320 BPM.`,
              line: lineNum,
              column: 1,
            });
          } else {
            metadata.tempo = bpm;
          }
          break;
        }
        case 'meter':
        case 'time': {
          const meter = parseMeter(value);
          if (!meter) {
            diagnostics.push({
              severity: 'warning',
              message: `Invalid meter "${value}". Expected format like 6/8 or 4/4.`,
              line: lineNum,
              column: 1,
            });
          } else {
            metadata.meter = meter;
          }
          break;
        }
        case 'tali':
          metadata.taliBeats = parseNumberList(value);
          if (!metadata.taliBeats.includes(1)) {
            metadata.taliBeats.unshift(1);
          }
          break;
        case 'khali':
          metadata.khaliBeats = parseNumberList(value);
          break;
        default:
          diagnostics.push({
            severity: 'warning',
            message: `Unrecognized metadata directive "@${key}".`,
            line: lineNum,
            column: 1,
          });
      }
      continue;
    }

    // 2. Section header: [Section Name] (only if line does NOT contain pipe bars '|')
    if (cleanLine.startsWith('[') && cleanLine.endsWith(']') && !cleanLine.includes('|')) {
      const sectionName = cleanLine.slice(1, -1).trim() || 'Unnamed Section';
      if (currentSection.bars.length > 0) {
        sections.push(currentSection);
      }
      currentSection = {
        type: 'Section',
        name: sectionName,
        bars: [],
      };
      continue;
    }

    // 3. Bar notation line: | Dha - Ti Ta Ghe - | [x2]
    if (cleanLine.includes('|')) {
      // Check for trailing repeat marker like x2 or *2 after last pipe
      const lastPipeIdx = cleanLine.lastIndexOf('|');
      const firstPipeIdx = cleanLine.indexOf('|');
      const trailingText = cleanLine.slice(lastPipeIdx + 1).trim();
      let lineRepeat = 1;
      if (trailingText) {
        const repeatMatch = trailingText.match(/^[xX*](\d+)$/);
        if (repeatMatch) {
          lineRepeat = Math.max(1, Math.min(16, parseInt(repeatMatch[1], 10)));
        } else {
          diagnostics.push({
            severity: 'warning',
            message: `Unexpected trailing text "${trailingText}" after bar line.`,
            line: lineNum,
            column: lastPipeIdx + 2,
          });
        }
      }

      const insidePipes = cleanLine.slice(firstPipeIdx + 1, lastPipeIdx);
      const rawBars = insidePipes.split('|');

      for (let b = 0; b < rawBars.length; b++) {
        const rawBar = rawBars[b].trim();
        if (!rawBar) continue;

        const beats = parseBarCells(rawBar, lineNum, 1, metadata, diagnostics);
        const barNode: BarNode = {
          type: 'Bar',
          barNumber: globalBarNumber++,
          beats,
          repeat: b === rawBars.length - 1 ? lineRepeat : 1,
          line: lineNum,
        };
        currentSection.bars.push(barNode);
      }
      continue;
    }

    // 4. Free-form single bar line without pipes
    const beats = parseBarCells(cleanLine, lineNum, 1, metadata, diagnostics);
    if (beats.length > 0) {
      currentSection.bars.push({
        type: 'Bar',
        barNumber: globalBarNumber++,
        beats,
        repeat: 1,
        line: lineNum,
      });
    }
  }

  if (currentSection.bars.length > 0 || sections.length === 0) {
    sections.push(currentSection);
  }

  return {
    type: 'MadalProgram',
    metadata,
    sections,
    diagnostics,
  };
}

/**
 * Flatten a parsed MadalProgramAST into chronological playback/MIDI timeline events.
 */
export function flattenTimeline(ast: MadalProgramAST): FlattenedTimelineEvent[] {
  const events: FlattenedTimelineEvent[] = [];
  const secondsPerBeat = 60 / ast.metadata.tempo;
  let currentBeatOffset = 0;
  let sequentialBarIndex = 1;

  for (const section of ast.sections) {
    for (const bar of section.bars) {
      const repeats = Math.max(1, bar.repeat || 1);
      for (let r = 0; r < repeats; r++) {
        for (const beatCell of bar.beats) {
          const totalSubs = beatCell.subdivisions.length;
          for (let s = 0; s < totalSubs; s++) {
            const token = beatCell.subdivisions[s];
            const durationBeats = token.durationFractions;
            const baseVelocity = token.bol === '-' || token.bol === '~' ? 0 : 100;
            const accentedVelocity = token.modifiers.accent
              ? Math.min(127, baseVelocity + 22)
              : beatCell.beatNumber === 1 && s === 0
              ? Math.min(127, baseVelocity + 12)
              : baseVelocity;

            events.push({
              beatOffset: currentBeatOffset,
              durationBeats,
              timeSeconds: currentBeatOffset * secondsPerBeat,
              durationSeconds: durationBeats * secondsPerBeat,
              barIndex: sequentialBarIndex,
              beatInBar: beatCell.beatNumber,
              subdivisionIndex: s,
              totalSubdivisions: totalSubs,
              sectionName: section.name,
              token,
              velocity: accentedVelocity,
            });

            currentBeatOffset += durationBeats;
          }
        }
        sequentialBarIndex++;
      }
    }
  }

  return events;
}
