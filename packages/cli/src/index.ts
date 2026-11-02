#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {
  BOL_DICTIONARY,
  TAAL_PRESETS,
  compileToMidi,
  parseMadalCode,
  renderLinearTabSVG,
  renderRadialClockSVG,
  validateMadalProgram,
} from '@open-madal/core';

function printHelp(): void {
  console.log(`
open-madal CLI v0.1.0 — Declarative Nepali Madal Notation Compiler

Usage:
  madal compile <file.madal> [options]   Compile a .madal file to MIDI and/or SVG
  madal validate <file.madal>            Validate syntax, meter, and stroke statistics
  madal taals                            List built-in Nepali Taal rhythm presets
  madal bols                             List all canonical Madal bols & dual-head mappings
  madal help                             Show this help message

Compile Options:
  --midi                 Export Standard MIDI File (<basename>.mid)
  --svg                  Export Linear Percussion Tablature (<basename>.svg)
  --clock                Export Concentric Radial Taal Clock (<basename>.clock.svg)
  --devanagari           Render SVG bol labels in Devanagari script (घे, का, ता, ति, धा)
  --out-dir <dir>        Output directory for compiled artifacts
`);
}

function runCompile(args: string[]): number {
  const inputFile = args.find((a) => !a.startsWith('--'));
  if (!inputFile) {
    console.error('Error: Missing input .madal file path.');
    printHelp();
    return 1;
  }

  const resolvedPath = path.resolve(process.cwd(), inputFile);
  if (!fs.existsSync(resolvedPath)) {
    console.error(`Error: File not found: ${resolvedPath}`);
    return 1;
  }

  const source = fs.readFileSync(resolvedPath, 'utf8');
  const ast = parseMadalCode(source);
  const report = validateMadalProgram(ast);

  for (const warn of report.warnings) {
    console.warn(`Warning [Line ${warn.line}]: ${warn.message}`);
  }

  if (!report.valid) {
    for (const err of report.errors) {
      console.error(`Error [Line ${err.line}:${err.column}]: ${err.message}`);
    }
    return 1;
  }

  const wantMidi = args.includes('--midi');
  const wantSvg = args.includes('--svg');
  const wantClock = args.includes('--clock');
  const script = args.includes('--devanagari') ? 'devanagari' : 'roman';

  const outDirIdx = args.indexOf('--out-dir');
  const outDir =
    outDirIdx >= 0 && args[outDirIdx + 1]
      ? path.resolve(process.cwd(), args[outDirIdx + 1])
      : path.dirname(resolvedPath);

  fs.mkdirSync(outDir, { recursive: true });
  const baseName = path.basename(resolvedPath, path.extname(resolvedPath));

  // If no explicit format flag passed, export both MIDI and SVG by default
  const exportMidi = wantMidi || (!wantMidi && !wantSvg && !wantClock);
  const exportSvg = wantSvg || (!wantMidi && !wantSvg && !wantClock);

  if (exportMidi) {
    const midiBytes = compileToMidi(ast);
    const midiPath = path.join(outDir, `${baseName}.mid`);
    fs.writeFileSync(midiPath, Buffer.from(midiBytes));
    console.log(`✓ Compiled MIDI (${midiBytes.byteLength} bytes) -> ${midiPath}`);
  }

  if (exportSvg) {
    const svgContent = renderLinearTabSVG(ast, { script });
    const svgPath = path.join(outDir, `${baseName}.svg`);
    fs.writeFileSync(svgPath, svgContent, 'utf8');
    console.log(`✓ Compiled Linear Tablature SVG (${script}) -> ${svgPath}`);
  }

  if (wantClock) {
    const clockSvg = renderRadialClockSVG(ast, { script });
    const clockPath = path.join(outDir, `${baseName}.clock.svg`);
    fs.writeFileSync(clockPath, clockSvg, 'utf8');
    console.log(`✓ Compiled Radial Taal Clock SVG (${script}) -> ${clockPath}`);
  }

  return 0;
}

function runValidate(args: string[]): number {
  const inputFile = args.find((a) => !a.startsWith('--'));
  if (!inputFile) {
    console.error('Error: Missing input .madal file path.');
    return 1;
  }

  const resolvedPath = path.resolve(process.cwd(), inputFile);
  if (!fs.existsSync(resolvedPath)) {
    console.error(`Error: File not found: ${resolvedPath}`);
    return 1;
  }

  const source = fs.readFileSync(resolvedPath, 'utf8');
  const ast = parseMadalCode(source);
  const report = validateMadalProgram(ast);

  console.log(`\nDocument: ${ast.metadata.title}`);
  console.log(
    `Taal:     ${ast.metadata.taal} (${ast.metadata.meter.beatsPerBar}/${ast.metadata.meter.beatUnit} @ ${ast.metadata.tempo} BPM)`
  );
  console.log(
    `Stats:    ${report.stats.totalSections} sections, ${report.stats.totalExpandedBars} bars (${report.stats.totalBeats} beats, ${report.stats.durationSeconds}s)`
  );
  console.log(
    `Strokes:  ${report.stats.bhaleStrokes} Bhale (bass), ${report.stats.pothiStrokes} Pothi (treble), ${report.stats.compoundStrokes} compound\n`
  );

  for (const warn of report.warnings) {
    console.warn(`  [WARN]  Line ${warn.line}: ${warn.message}`);
  }
  for (const err of report.errors) {
    console.error(`  [ERROR] Line ${err.line}:${err.column}: ${err.message}`);
  }

  if (report.valid) {
    console.log('✓ Validation passed.');
    return 0;
  } else {
    console.error(`✗ Validation failed with ${report.errors.length} error(s).`);
    return 1;
  }
}

function runListTaals(): number {
  console.log('\nBuilt-in Nepali Taal Corpus:\n');
  for (const preset of TAAL_PRESETS) {
    console.log(
      `  • ${preset.name.padEnd(28)} [${preset.devanagariName}] — ${preset.meter} @ ${preset.defaultTempo} BPM`
    );
    console.log(`    Region: ${preset.region}`);
    console.log(`    ${preset.description}\n`);
  }
  return 0;
}

function runListBols(): number {
  console.log('\nCanonical Madal Bol Dictionary:\n');
  for (const bol of Object.values(BOL_DICTIONARY)) {
    console.log(
      `  • ${bol.roman.padEnd(8)} (${bol.devanagari.padEnd(4)}) [${bol.head.toUpperCase().padEnd(6)}] — ${bol.description}`
    );
  }
  console.log('');
  return 0;
}

function main(): void {
  const [, , command, ...rest] = process.argv;

  switch (command) {
    case 'compile':
      process.exitCode = runCompile(rest);
      break;
    case 'validate':
      process.exitCode = runValidate(rest);
      break;
    case 'taals':
      process.exitCode = runListTaals();
      break;
    case 'bols':
      process.exitCode = runListBols();
      break;
    case 'help':
    case '--help':
    case '-h':
    case undefined:
      printHelp();
      break;
    default:
      console.error(`Unknown command "${command}".`);
      printHelp();
      process.exitCode = 1;
  }
}

main();

