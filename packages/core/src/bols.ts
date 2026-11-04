import { BolDefinition, CanonicalBolId, HeadStrokeSpec } from './types.js';

/*
 * Pitches and ring lengths below were measured from real madal recordings
 * (see docs/madal-acoustics.md): large (bass) head ~174 Hz, small (treble) head ~266 Hz,
 * i.e. the two heads sit roughly a fifth apart. decaySec is the time an open stroke takes
 * to fall ~40 dB, which the web engine uses as the audible ring length.
 */
const BHALE_OPEN: HeadStrokeSpec = {
  head: 'bhale',
  stroke: 'Ghe',
  articulation: 'open',
  midiNote: 60, // High Bongo / Low Conga / Bass Hand Drum mapping
  fundamentalHz: 174,
  decaySec: 1.8,
};

const BHALE_BEND: HeadStrokeSpec = {
  head: 'bhale',
  stroke: 'Ghe^',
  articulation: 'pitch-bend',
  midiNote: 61,
  fundamentalHz: 174,
  decaySec: 1.8,
};

const BHALE_SLAP: HeadStrokeSpec = {
  head: 'bhale',
  stroke: 'Ka',
  articulation: 'closed',
  midiNote: 62,
  fundamentalHz: 177,
  decaySec: 0.3,
};

const POTHI_RIM: HeadStrokeSpec = {
  head: 'pothi',
  stroke: 'Ta',
  articulation: 'rim',
  midiNote: 63,
  fundamentalHz: 266,
  decaySec: 1.0,
};

const POTHI_OPEN: HeadStrokeSpec = {
  head: 'pothi',
  stroke: 'Ti',
  articulation: 'open',
  midiNote: 64,
  fundamentalHz: 266,
  decaySec: 0.45,
};

const POTHI_RING: HeadStrokeSpec = {
  head: 'pothi',
  stroke: 'Tin',
  articulation: 'open',
  midiNote: 65,
  fundamentalHz: 266,
  decaySec: 1.15,
};

const POTHI_CLOSED: HeadStrokeSpec = {
  head: 'pothi',
  stroke: 'Ki',
  articulation: 'closed',
  midiNote: 66,
  fundamentalHz: 267,
  decaySec: 0.25,
};

/**
 * Dictionary of canonical Madal bols (mnemonic strokes) with dual-head decomposition
 * and Devanagari script representation.
 */
export const BOL_DICTIONARY: Record<CanonicalBolId, BolDefinition> = {
  Ghe: {
    id: 'Ghe',
    roman: 'Ghe',
    devanagari: 'घे',
    head: 'bhale',
    articulation: 'open',
    description:
      'Ghin (घिन): all four fingers together (no thumb) strike the large head and bounce off, leaving a deep open ring.',
    bhale: BHALE_OPEN,
    defaultVelocity: 105,
  },
  Ga: {
    id: 'Ga',
    roman: 'Ga',
    devanagari: 'ग',
    head: 'bhale',
    articulation: 'open',
    description: 'Lighter, shorter open Ghin on the large head.',
    bhale: { ...BHALE_OPEN, stroke: 'Ga', decaySec: 0.5 },
    defaultVelocity: 88,
  },
  Dhum: {
    id: 'Dhum',
    roman: 'Dhum',
    devanagari: 'धुम',
    head: 'bhale',
    articulation: 'open',
    description: 'Full-strength open Ghin on the large head, allowed to ring out completely.',
    bhale: { ...BHALE_OPEN, stroke: 'Dhum', fundamentalHz: 172, decaySec: 1.9 },
    defaultVelocity: 115,
  },
  Ka: {
    id: 'Ka',
    roman: 'Ka',
    devanagari: 'का',
    head: 'bhale',
    articulation: 'closed',
    description:
      'Kha (ख): middle, ring and little fingers strike the khari of the large head and stay on the skin. Gives a muffled, closed bass.',
    bhale: BHALE_SLAP,
    defaultVelocity: 85,
  },
  Ki: {
    id: 'Ki',
    roman: 'Ki',
    devanagari: 'कि',
    head: 'pothi',
    articulation: 'closed',
    description:
      'Taak (ताक): middle, ring and little fingers strike the khari of the small head and stay down. Gives a dry, closed treble.',
    pothi: POTHI_CLOSED,
    defaultVelocity: 82,
  },
  Ta: {
    id: 'Ta',
    roman: 'Ta',
    devanagari: 'ता',
    head: 'pothi',
    articulation: 'rim',
    description:
      'Taang (ताङ): the index finger strikes the small head and lifts off, leaving a bright open ring.',
    pothi: POTHI_RIM,
    defaultVelocity: 102,
  },
  Na: {
    id: 'Na',
    roman: 'Na',
    devanagari: 'ना',
    head: 'pothi',
    articulation: 'rim',
    description:
      'Naa (ना): a lighter open stroke on the small head that sounds about three semitones above Taang.',
    pothi: { ...POTHI_RIM, stroke: 'Na', fundamentalHz: 313, decaySec: 0.6 },
    defaultVelocity: 92,
  },
  Ti: {
    id: 'Ti',
    roman: 'Ti',
    devanagari: 'ति',
    head: 'pothi',
    articulation: 'open',
    description: 'Light, short open Taang on the small head (used inside fast phrases).',
    pothi: POTHI_OPEN,
    defaultVelocity: 96,
  },
  Tin: {
    id: 'Tin',
    roman: 'Tin',
    devanagari: 'तिन',
    head: 'pothi',
    articulation: 'open',
    description: 'Open Taang on the small head, allowed to ring out fully.',
    pothi: POTHI_RING,
    defaultVelocity: 100,
  },
  Ra: {
    id: 'Ra',
    roman: 'Ra',
    devanagari: 'र',
    head: 'pothi',
    articulation: 'closed',
    description: 'Rapid finger-rebound stroke on the Pothi head used in Tirakita ornamental rolls.',
    pothi: { ...POTHI_CLOSED, stroke: 'Ra', fundamentalHz: 275, decaySec: 0.12 },
    defaultVelocity: 88,
  },
  Di: {
    id: 'Di',
    roman: 'Di',
    devanagari: 'दि',
    head: 'both',
    articulation: 'open',
    description: 'Rapid alternating roll lead stroke combining Bhale and Pothi open resonance (Diri-Diri).',
    bhale: { ...BHALE_OPEN, stroke: 'Di', decaySec: 0.25 },
    pothi: { ...POTHI_OPEN, stroke: 'Di', decaySec: 0.22 },
    defaultVelocity: 98,
  },
  Ri: {
    id: 'Ri',
    roman: 'Ri',
    devanagari: 'रि',
    head: 'pothi',
    articulation: 'rim',
    description: 'Crisp Pothi rebound stroke paired with Di in rapid Diri-Diri rolls.',
    pothi: { ...POTHI_RIM, stroke: 'Ri', fundamentalHz: 313, decaySec: 0.14 },
    defaultVelocity: 90,
  },
  Dha: {
    id: 'Dha',
    roman: 'Dha',
    devanagari: 'धा',
    head: 'both',
    articulation: 'open',
    description: 'Dhang (धाङ): Ghin on the large head and Taang on the small head struck together.',
    bhale: BHALE_OPEN,
    pothi: POTHI_RIM,
    defaultVelocity: 115,
  },
  Dhin: {
    id: 'Dhin',
    roman: 'Dhin',
    devanagari: 'धिन',
    head: 'both',
    articulation: 'open',
    description: 'Ghin on the large head with a fully ringing Taang on the small head.',
    bhale: BHALE_OPEN,
    pothi: POTHI_RING,
    defaultVelocity: 112,
  },
  Dhing: {
    id: 'Dhing',
    roman: 'Dhing',
    devanagari: 'धिङ',
    head: 'both',
    articulation: 'pitch-bend',
    description: 'Compound stroke with palm-heel pitch bend on Bhale (Ghe^) + ringing Pothi (Tin).',
    bhale: BHALE_BEND,
    pothi: POTHI_RING,
    defaultVelocity: 118,
  },
  '-': {
    id: '-',
    roman: '-',
    devanagari: 'ऽ',
    head: 'none',
    articulation: 'rest',
    description: 'Silent beat rest (Khali pause).',
    defaultVelocity: 0,
  },
  '~': {
    id: '~',
    roman: '~',
    devanagari: '〜',
    head: 'none',
    articulation: 'sustain',
    description: 'Sustain / let the previous resonant stroke ring through this subdivision.',
    defaultVelocity: 0,
  },
};

const CASE_INSENSITIVE_BOL_LOOKUP = new Map<string, CanonicalBolId>(
  Object.keys(BOL_DICTIONARY).map((key) => [key.toLowerCase(), key as CanonicalBolId])
);

/**
 * Regional oral dialect aliases that normalize to CanonicalBolId in the Open-Madal Specification.
 *
 * Includes the stroke names used in madal teaching (Kutumba / Raju Maharjan, Kathmandu Post 2020):
 * Taang (open treble), Taak (closed treble), Ghin (open bass), Kha (closed bass), and
 * Dhang (Taang + Ghin). Note that Taak is a closed stroke on the khari, so it maps to Ki, not Ta.
 */
export const REGIONAL_BOL_ALIASES: Record<string, CanonicalBolId> = {
  ge: 'Ghe',
  ghin: 'Ghe',
  kat: 'Ka',
  khat: 'Ka',
  kha: 'Ka',
  tang: 'Tin',
  taang: 'Tin',
  tan: 'Ta',
  tak: 'Ki',
  taak: 'Ki',
  naa: 'Na',
  dhi: 'Dhin',
  dhang: 'Dha',
};

/**
 * Compound ornamental roll shorthands that expand into multi-stroke sub-beat subdivisions.
 */
export const ORNAMENTAL_ROLL_SHORTHANDS: Record<string, CanonicalBolId[]> = {
  tirakita: ['Ti', 'Ra', 'Ki', 'Ta'],
  'ti-ra-ki-ta': ['Ti', 'Ra', 'Ki', 'Ta'],
  tirkit: ['Ti', 'Ra', 'Ki', 'Ta'],
  diridiri: ['Di', 'Ri', 'Di', 'Ri'],
  'diri-diri': ['Di', 'Ri', 'Di', 'Ri'],
  diri: ['Di', 'Ri'],
  'di-ri': ['Di', 'Ri'],
  tira: ['Ti', 'Ra'],
  'ti-ra': ['Ti', 'Ra'],
  kita: ['Ki', 'Ta'],
  'ki-ta': ['Ki', 'Ta'],
};

/**
 * Check whether a raw token represents a compound ornamental roll (such as `Tirakita`,
 * `Diri-Diri`, or hyphenated roll sequences like `Ti-Ra-Ki-Ta`) and expand it into
 * constituent bol token strings while preserving prefix/suffix modifiers.
 */
export function expandOrnamentalRoll(rawToken: string): string[] | null {
  let working = rawToken.trim();
  if (!working || working === '-' || working === '~') return null;

  let prefix = '';
  let changedPrefix = true;
  while (changedPrefix) {
    changedPrefix = false;
    if (working.startsWith('>')) {
      prefix += '>';
      working = working.slice(1);
      changedPrefix = true;
    }
    const graceMatch = working.match(/^\(([A-Za-z]+)\)(.+)$/);
    if (graceMatch) {
      prefix += `(${graceMatch[1]})`;
      working = graceMatch[2];
      changedPrefix = true;
    }
  }

  let suffix = '';
  while (working.endsWith('^') || working.endsWith('.')) {
    suffix = working.slice(-1) + suffix;
    working = working.slice(0, -1);
  }

  const lowerStem = working.toLowerCase();
  const shorthand = ORNAMENTAL_ROLL_SHORTHANDS[lowerStem];
  if (shorthand) {
    return shorthand.map((bol, idx) => `${idx === 0 ? prefix : ''}${bol}${suffix}`);
  }

  // Also expand explicit hyphenated multi-bol rolls like Di-Ri-Di-Ri or Ta-Ki-Ta
  if (working.includes('-')) {
    const parts = working.split('-').filter(Boolean);
    if (parts.length >= 2 && parts.every((p) => resolveBol(p) !== undefined)) {
      return parts.map((part, idx) => `${idx === 0 ? prefix : ''}${part}${suffix}`);
    }
  }

  return null;
}

/**
 * Look up a canonical Bol definition case-insensitively, including regional oral aliases.
 */
export function resolveBol(rawName: string): BolDefinition | undefined {
  const normalized = rawName.trim().toLowerCase();
  const canonical =
    CASE_INSENSITIVE_BOL_LOOKUP.get(normalized) ?? REGIONAL_BOL_ALIASES[normalized];
  return canonical ? BOL_DICTIONARY[canonical] : undefined;
}

export function listAllBols(): BolDefinition[] {
  return Object.values(BOL_DICTIONARY);
}

