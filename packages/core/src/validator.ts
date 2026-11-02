import { MadalProgramAST, ParseDiagnostic } from './types.js';

export interface ValidationReport {
  valid: boolean;
  errors: ParseDiagnostic[];
  warnings: ParseDiagnostic[];
  stats: {
    totalSections: number;
    totalBars: number;
    totalExpandedBars: number;
    totalBeats: number;
    bhaleStrokes: number;
    pothiStrokes: number;
    compoundStrokes: number;
    restCount: number;
    durationSeconds: number;
  };
}

/**
 * Validate a parsed MadalProgramAST against its declared time signature and structural rules.
 */
export function validateMadalProgram(ast: MadalProgramAST): ValidationReport {
  const diagnostics: ParseDiagnostic[] = [...ast.diagnostics];
  const expectedBeats = ast.metadata.meter.beatsPerBar;

  let totalBars = 0;
  let totalExpandedBars = 0;
  let totalBeats = 0;
  let bhaleStrokes = 0;
  let pothiStrokes = 0;
  let compoundStrokes = 0;
  let restCount = 0;

  for (const section of ast.sections) {
    for (const bar of section.bars) {
      totalBars++;
      const repeats = Math.max(1, bar.repeat || 1);
      totalExpandedBars += repeats;

      if (bar.beats.length !== expectedBeats) {
        diagnostics.push({
          severity: 'warning',
          message: `Bar ${bar.barNumber} in section "${section.name}" has ${bar.beats.length} beats, but @meter declares ${expectedBeats}/${ast.metadata.meter.beatUnit}.`,
          line: bar.line,
          column: 1,
        });
      }

      for (const beat of bar.beats) {
        totalBeats += repeats;
        for (const sub of beat.subdivisions) {
          if (sub.bhale && sub.pothi) {
            compoundStrokes += repeats;
            bhaleStrokes += repeats;
            pothiStrokes += repeats;
          } else if (sub.bhale) {
            bhaleStrokes += repeats;
          } else if (sub.pothi) {
            pothiStrokes += repeats;
          } else {
            restCount += repeats;
          }
        }
      }
    }
  }

  if (totalBars === 0) {
    diagnostics.push({
      severity: 'error',
      message: 'Document contains no playable bars.',
      line: 1,
      column: 1,
    });
  }

  const errors = diagnostics.filter((d) => d.severity === 'error');
  const warnings = diagnostics.filter((d) => d.severity === 'warning');
  const durationSeconds = (totalBeats * 60) / ast.metadata.tempo;

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    stats: {
      totalSections: ast.sections.length,
      totalBars,
      totalExpandedBars,
      totalBeats,
      bhaleStrokes,
      pothiStrokes,
      compoundStrokes,
      restCount,
      durationSeconds: Number(durationSeconds.toFixed(2)),
    },
  };
}

