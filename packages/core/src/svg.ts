import { BOL_DICTIONARY } from './bols.js';
import { BeatCellNode, BolTokenNode, MadalProgramAST } from './types.js';

export interface SVGRenderOptions {
  /** Render bol labels in Romanized ('roman') or Devanagari ('devanagari') script */
  script?: 'roman' | 'devanagari';
  /** Color theme ('dark' | 'light') */
  theme?: 'dark' | 'light';
  /** Active beat index (0-based) to highlight for interactive UI */
  activeBeatIndex?: number;
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

const TEACHING_STROKE_LABELS: Record<string, { roman: string; devanagari: string }> = {
  ghin: { roman: 'Ghin', devanagari: 'घिं' },
  kha: { roman: 'Kha', devanagari: 'ख' },
  taang: { roman: 'Taang', devanagari: 'तां' },
  tang: { roman: 'Taang', devanagari: 'तां' },
  taak: { roman: 'Taak', devanagari: 'तक्' },
  tak: { roman: 'Taak', devanagari: 'तक्' },
  dhang: { roman: 'Dhang', devanagari: 'धां' },
  naa: { roman: 'Naa', devanagari: 'ना' },
};

export function formatBolLabel(token: BolTokenNode, script: 'roman' | 'devanagari'): string {
  const def = BOL_DICTIONARY[token.bol];
  if (!def) return token.raw;
  const rawStem = token.raw
    .trim()
    .replace(/^>+/, '')
    .replace(/^\([A-Za-z]+\)/, '')
    .replace(/^>+/, '')
    .replace(/[\^.]*$/, '')
    .toLowerCase();
  const teachingLabel = TEACHING_STROKE_LABELS[rawStem];
  const base = teachingLabel
    ? teachingLabel[script]
    : script === 'devanagari'
    ? def.devanagari
    : def.roman;
  const prefix = token.modifiers.accent ? '>' : '';
  const suffix =
    (token.modifiers.pitchBend ? '^' : '') + (token.modifiers.damped ? '.' : '');
  return `${prefix}${base}${suffix}`;
}

/**
 * Render a dual-track (Bhale bass + Pothi treble) linear percussion tablature SVG.
 */
export function renderLinearTabSVG(
  ast: MadalProgramAST,
  options: SVGRenderOptions = {}
): string {
  const script = options.script ?? 'roman';
  const theme = options.theme ?? 'dark';

  const bg = theme === 'dark' ? '#0f172a' : '#fffbeb';
  const cardBg = theme === 'dark' ? '#1e293b' : '#ffffff';
  const borderCol = theme === 'dark' ? '#334155' : '#d6d3d1';
  const textPrimary = theme === 'dark' ? '#f8fafc' : '#1c1917';
  const textMuted = theme === 'dark' ? '#94a3b8' : '#78716c';
  const bhaleColor = '#f97316'; // Warm terracotta orange for Bhale bass
  const pothiColor = '#14b8a6'; // Bright Himalayan teal for Pothi treble
  const samColor = '#eab308';   // Gold for Sam (Beat 1)

  const leftGutter = 120;
  const rightPadding = 36;
  const barHeight = 148;
  const headerHeight = 84;

  // Flatten bars across sections for visual layout
  const allBars: { sectionName: string; barNumber: number; repeat: number; beats: BeatCellNode[] }[] = [];
  let minSubFraction = 1;
  for (const section of ast.sections) {
    for (const bar of section.bars) {
      allBars.push({
        sectionName: section.name,
        barNumber: bar.barNumber,
        repeat: bar.repeat,
        beats: bar.beats,
      });
      for (const beat of bar.beats) {
        for (const sub of beat.subdivisions) {
          if (sub.durationFractions > 0 && sub.durationFractions < minSubFraction) {
            minSubFraction = sub.durationFractions;
          }
        }
      }
    }
  }

  // Scale beat cell width automatically when dense tuplets or rolls (e.g., 1/6, 1/8) are present
  const cellWidth = Math.max(96, Math.min(180, Math.ceil(24 / minSubFraction)));

  const maxBeatsInBar = Math.max(
    ast.metadata.meter.beatsPerBar,
    ...allBars.map((b) => b.beats.length),
    1
  );

  const width = leftGutter + maxBeatsInBar * cellWidth + rightPadding;
  const height = headerHeight + Math.max(1, allBars.length) * (barHeight + 24) + 32;

  const lines: string[] = [];
  lines.push(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" font-family="Inter, system-ui, -apple-system, sans-serif">`
  );

  // Background
  lines.push(`<rect width="${width}" height="${height}" rx="12" fill="${bg}" />`);

  // Header metadata
  lines.push(
    `<text x="24" y="36" fill="${textPrimary}" font-size="20" font-weight="700">${escapeXml(
      ast.metadata.title
    )}</text>`
  );
  const subtitle = `Taal: ${ast.metadata.taal}  •  Meter: ${ast.metadata.meter.beatsPerBar}/${ast.metadata.meter.beatUnit}  •  Tempo: ${ast.metadata.tempo} BPM${
    ast.metadata.region ? `  •  Region: ${ast.metadata.region}` : ''
  }`;
  lines.push(
    `<text x="24" y="60" fill="${textMuted}" font-size="13" font-weight="500">${escapeXml(
      subtitle
    )}</text>`
  );

  // Render each bar row
  allBars.forEach((bar, barIdx) => {
    const topY = headerHeight + barIdx * (barHeight + 24);

    // Bar card background
    lines.push(
      `<rect x="16" y="${topY}" width="${width - 32}" height="${barHeight}" rx="8" fill="${cardBg}" stroke="${borderCol}" stroke-width="1" />`
    );

    // Left track labels
    lines.push(
      `<text x="28" y="${topY + 26}" fill="${textMuted}" font-size="11" font-weight="600">${escapeXml(
        `${bar.sectionName} #${bar.barNumber}${bar.repeat > 1 ? ` (x${bar.repeat})` : ''}`
      )}</text>`
    );
    lines.push(
      `<text x="28" y="${topY + 62}" fill="${textPrimary}" font-size="12" font-weight="700">BOL</text>`
    );
    lines.push(
      `<text x="28" y="${topY + 95}" fill="${pothiColor}" font-size="12" font-weight="700">POTHI (R)</text>`
    );
    lines.push(
      `<text x="28" y="${topY + 128}" fill="${bhaleColor}" font-size="12" font-weight="700">BHALE (L)</text>`
    );

    // Horizontal track divider lines
    lines.push(
      `<line x1="${leftGutter}" y1="${topY + 40}" x2="${width - 24}" y2="${topY + 40}" stroke="${borderCol}" stroke-width="1" />`
    );
    lines.push(
      `<line x1="${leftGutter}" y1="${topY + 74}" x2="${width - 24}" y2="${topY + 74}" stroke="${borderCol}" stroke-width="1" />`
    );
    lines.push(
      `<line x1="${leftGutter}" y1="${topY + 108}" x2="${width - 24}" y2="${topY + 108}" stroke="${borderCol}" stroke-width="1" />`
    );

    // Render beat columns
    bar.beats.forEach((beat, beatIdx) => {
      const colX = leftGutter + beatIdx * cellWidth;

      // Vertical beat separator
      lines.push(
        `<line x1="${colX}" y1="${topY + 10}" x2="${colX}" y2="${
          topY + barHeight - 10
        }" stroke="${borderCol}" stroke-width="1" stroke-dasharray="${
          beatIdx === 0 ? 'none' : '3,3'
        }" />`
      );

      // Vibhag / Beat number header
      const vibhagSymbol =
        beat.vibhagMarker === 'sam'
          ? 'X (Sam)'
          : beat.vibhagMarker === 'tali'
          ? '+ (Tali)'
          : beat.vibhagMarker === 'khali'
          ? '0 (Khali)'
          : '';
      const beatHeaderColor = beat.vibhagMarker === 'sam' ? samColor : textMuted;
      lines.push(
        `<text x="${colX + 10}" y="${topY + 26}" fill="${beatHeaderColor}" font-size="11" font-weight="700">${
          beat.beatNumber
        } ${escapeXml(vibhagSymbol)}</text>`
      );

      // Subdivisions within this beat positioned proportionally by rational durationFractions
      const subCount = beat.subdivisions.length;
      if (subCount > 1) {
        // Primary tuplet beam spanning the beat cell
        lines.push(
          `<line x1="${(colX + 6).toFixed(1)}" y1="${topY + 44}" x2="${(
            colX +
            cellWidth -
            6
          ).toFixed(1)}" y2="${topY + 44}" stroke="${textMuted}" stroke-width="1.5" stroke-opacity="0.6" />`
        );
      }

      let cumulativeFraction = 0;
      beat.subdivisions.forEach((sub) => {
        const frac =
          sub.durationFractions > 0 ? sub.durationFractions : 1 / Math.max(1, subCount);
        const subStartX = colX + cumulativeFraction * cellWidth;
        const subWidth = frac * cellWidth;
        const subCenterX = Number((subStartX + subWidth / 2).toFixed(2));
        cumulativeFraction += frac;

        // Secondary beam for nested tuplets (depth >= 2)
        if ((sub.tupletDepth ?? 0) >= 2) {
          lines.push(
            `<line x1="${(subStartX + 2).toFixed(1)}" y1="${topY + 47}" x2="${(
              subStartX +
              subWidth -
              2
            ).toFixed(1)}" y2="${topY + 47}" stroke="${samColor}" stroke-width="1.5" stroke-opacity="0.75" />`
          );
        }

        const label = formatBolLabel(sub, script);
        const bolFontSize = subWidth < 26 ? 10 : subWidth < 36 ? 11 : 13;
        const nodeRadius = subWidth < 26 ? 8 : 11;
        const nodeFontSize = subWidth < 26 ? 8 : 10;

        // Mnemonic Bol label
        lines.push(
          `<text x="${subCenterX}" y="${
            topY + 62
          }" text-anchor="middle" fill="${textPrimary}" font-size="${bolFontSize}" font-weight="700">${escapeXml(
            label
          )}</text>`
        );

        // Pothi (Right/Treble) node
        if (sub.pothi) {
          lines.push(
            `<circle cx="${subCenterX}" cy="${
              topY + 91
            }" r="${nodeRadius}" fill="${pothiColor}" fill-opacity="0.2" stroke="${pothiColor}" stroke-width="2" />`
          );
          lines.push(
            `<text x="${subCenterX}" y="${
              topY + 95
            }" text-anchor="middle" fill="${pothiColor}" font-size="${nodeFontSize}" font-weight="700">${escapeXml(
              sub.pothi.stroke
            )}</text>`
          );
        }

        // Bhale (Left/Bass) node
        if (sub.bhale) {
          lines.push(
            `<circle cx="${subCenterX}" cy="${
              topY + 124
            }" r="${nodeRadius}" fill="${bhaleColor}" fill-opacity="0.2" stroke="${bhaleColor}" stroke-width="2" />`
          );
          lines.push(
            `<text x="${subCenterX}" y="${
              topY + 128
            }" text-anchor="middle" fill="${bhaleColor}" font-size="${nodeFontSize}" font-weight="700">${escapeXml(
              sub.bhale.stroke
            )}</text>`
          );
        }
      });
    });
  });

  lines.push('</svg>');
  return lines.join('\n');
}

/**
 * Render a concentric circular Radial Taal Rhythm Clock SVG for the first bar/cycle of a MadalProgramAST.
 */
export function renderRadialClockSVG(
  ast: MadalProgramAST,
  options: SVGRenderOptions = {}
): string {
  const script = options.script ?? 'roman';
  const size = 380;
  const cx = size / 2;
  const cy = size / 2;
  const outerRadius = 142; // Bhale ring
  const innerRadius = 98;  // Pothi ring
  const labelRadius = 168;

  const firstBar = ast.sections[0]?.bars[0];
  const beats = firstBar?.beats ?? [];
  const totalBeats = Math.max(1, beats.length);

  const lines: string[] = [];
  lines.push(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" font-family="Inter, system-ui, -apple-system, sans-serif">`
  );
  lines.push(`<rect width="${size}" height="${size}" rx="16" fill="#0f172a" />`);

  // Concentric guide rings
  lines.push(
    `<circle cx="${cx}" cy="${cy}" r="${outerRadius}" fill="none" stroke="#334155" stroke-width="2" />`
  );
  lines.push(
    `<circle cx="${cx}" cy="${cy}" r="${innerRadius}" fill="none" stroke="#334155" stroke-width="1.5" stroke-dasharray="4,4" />`
  );

  // Center Taal badge
  lines.push(
    `<text x="${cx}" y="${cy - 6}" text-anchor="middle" fill="#f8fafc" font-size="15" font-weight="700">${escapeXml(
      ast.metadata.taal
    )}</text>`
  );
  lines.push(
    `<text x="${cx}" y="${cy + 14}" text-anchor="middle" fill="#94a3b8" font-size="12" font-weight="500">${
      ast.metadata.meter.beatsPerBar
    }/${ast.metadata.meter.beatUnit} • ${ast.metadata.tempo} BPM</text>`
  );

  const polygonPoints: string[] = [];

  beats.forEach((beat, idx) => {
    const angle = (idx / totalBeats) * Math.PI * 2 - Math.PI / 2;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    const bx = cx + outerRadius * cos;
    const by = cy + outerRadius * sin;
    const px = cx + innerRadius * cos;
    const py = cy + innerRadius * sin;
    const lx = cx + labelRadius * cos;
    const ly = cy + labelRadius * sin;

    // Radial spoke
    lines.push(
      `<line x1="${cx + 52 * cos}" y1="${cy + 52 * sin}" x2="${bx}" y2="${by}" stroke="#1e293b" stroke-width="1.5" />`
    );

    const primarySub = beat.subdivisions[0];
    if (primarySub && (primarySub.bhale || primarySub.pothi)) {
      polygonPoints.push(`${bx.toFixed(1)},${by.toFixed(1)}`);
    }

    const isActive = options.activeBeatIndex === idx;
    if (isActive) {
      lines.push(
        `<circle cx="${bx.toFixed(1)}" cy="${by.toFixed(1)}" r="19" fill="#eab308" fill-opacity="0.25" />`
      );
    }

    // Bhale marker on outer ring
    if (primarySub?.bhale) {
      lines.push(
        `<circle cx="${bx.toFixed(1)}" cy="${by.toFixed(1)}" r="13" fill="#f97316" stroke="#fff7ed" stroke-width="2" />`
      );
    } else {
      lines.push(
        `<circle cx="${bx.toFixed(1)}" cy="${by.toFixed(1)}" r="5" fill="#334155" />`
      );
    }

    // Pothi marker on inner ring
    if (primarySub?.pothi) {
      lines.push(
        `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="10" fill="#14b8a6" stroke="#f0fdfa" stroke-width="2" />`
      );
    } else {
      lines.push(
        `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="4" fill="#334155" />`
      );
    }

    // Outer label
    const label =
      beat.subdivisions.length > 1
        ? `[${beat.subdivisions.map((s) => formatBolLabel(s, script)).join(' ')}]`
        : primarySub
        ? formatBolLabel(primarySub, script)
        : '-';
    const labelColor = idx === 0 ? '#eab308' : '#e2e8f0';
    lines.push(
      `<text x="${lx.toFixed(1)}" y="${(ly + 4).toFixed(
        1
      )}" text-anchor="middle" fill="${labelColor}" font-size="12" font-weight="700">${
        idx + 1
      }:${escapeXml(label)}</text>`
    );
  });

  if (polygonPoints.length >= 3) {
    lines.push(
      `<polygon points="${polygonPoints.join(
        ' '
      )}" fill="#f97316" fill-opacity="0.08" stroke="#f97316" stroke-width="1.5" stroke-opacity="0.45" />`
    );
  }

  lines.push('</svg>');
  return lines.join('\n');
}

