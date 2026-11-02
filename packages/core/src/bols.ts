import { BolDefinition, CanonicalBolId, HeadStrokeSpec } from './types.js';

const BHALE_OPEN: HeadStrokeSpec = {
  head: 'bhale',
  stroke: 'Ghe',
  articulation: 'open',
  midiNote: 60, // High Bongo / Low Conga / Bass Hand Drum mapping
  fundamentalHz: 118,
  decaySec: 0.42,
};

const BHALE_BEND: HeadStrokeSpec = {
  head: 'bhale',
  stroke: 'Ghe^',
  articulation: 'pitch-bend',
  midiNote: 61,
  fundamentalHz: 128,
  decaySec: 0.48,
};

const BHALE_SLAP: HeadStrokeSpec = {
  head: 'bhale',
  stroke: 'Ka',
  articulation: 'closed',
  midiNote: 62,
  fundamentalHz: 175,
  decaySec: 0.09,
};

const POTHI_RIM: HeadStrokeSpec = {
  head: 'pothi',
  stroke: 'Ta',
  articulation: 'rim',
  midiNote: 63,
  fundamentalHz: 340,
  decaySec: 0.24,
};

const POTHI_OPEN: HeadStrokeSpec = {
  head: 'pothi',
  stroke: 'Ti',
  articulation: 'open',
  midiNote: 64,
  fundamentalHz: 295,
  decaySec: 0.36,
};

const POTHI_RING: HeadStrokeSpec = {
  head: 'pothi',
  stroke: 'Tin',
  articulation: 'open',
  midiNote: 65,
  fundamentalHz: 320,
  decaySec: 0.44,
};

const POTHI_CLOSED: HeadStrokeSpec = {
  head: 'pothi',
  stroke: 'Ki',
  articulation: 'closed',
  midiNote: 66,
  fundamentalHz: 410,
  decaySec: 0.08,
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
    description: 'Deep open resonant bass stroke on the larger Bhale head.',
    bhale: BHALE_OPEN,
    defaultVelocity: 105,
  },
  Ga: {
    id: 'Ga',
    roman: 'Ga',
    devanagari: 'ग',
    head: 'bhale',
    articulation: 'open',
    description: 'Lighter open bass stroke on the Bhale head.',
    bhale: { ...BHALE_OPEN, stroke: 'Ga', decaySec: 0.32 },
    defaultVelocity: 88,
  },
  Dhum: {
    id: 'Dhum',
    roman: 'Dhum',
    devanagari: 'धुम',
    head: 'bhale',
    articulation: 'open',
    description: 'Full-hand booming open bass stroke on the Bhale head.',
    bhale: { ...BHALE_OPEN, stroke: 'Dhum', fundamentalHz: 110, decaySec: 0.52 },
    defaultVelocity: 115,
  },
  Ka: {
    id: 'Ka',
    roman: 'Ka',
    devanagari: 'का',
    head: 'bhale',
    articulation: 'closed',
    description: 'Flat palm muted slap on the Bhale (bass) head.',
    bhale: BHALE_SLAP,
    defaultVelocity: 85,
  },
  Ki: {
    id: 'Ki',
    roman: 'Ki',
    devanagari: 'कि',
    head: 'pothi',
    articulation: 'closed',
    description: 'Crisp muted finger tap on the Pothi (treble) head.',
    pothi: POTHI_CLOSED,
    defaultVelocity: 82,
  },
  Ta: {
    id: 'Ta',
    roman: 'Ta',
    devanagari: 'ता',
    head: 'pothi',
    articulation: 'rim',
    description: 'Sharp rim/edge strike on the Pothi (treble) head.',
    pothi: POTHI_RIM,
    defaultVelocity: 102,
  },
  Na: {
    id: 'Na',
    roman: 'Na',
    devanagari: 'ना',
    head: 'pothi',
    articulation: 'rim',
    description: 'Lighter index-finger rim strike on the Pothi head.',
    pothi: { ...POTHI_RIM, stroke: 'Na', decaySec: 0.2 },
    defaultVelocity: 92,
  },
  Ti: {
    id: 'Ti',
    roman: 'Ti',
    devanagari: 'ति',
    head: 'pothi',
    articulation: 'open',
    description: 'Open resonant finger strike on the Pothi center khari paste.',
    pothi: POTHI_OPEN,
    defaultVelocity: 96,
  },
  Tin: {
    id: 'Tin',
    roman: 'Tin',
    devanagari: 'तिन',
    head: 'pothi',
    articulation: 'open',
    description: 'Sustained harmonic ring on the Pothi khari spot.',
    pothi: POTHI_RING,
    defaultVelocity: 100,
  },
  Dha: {
    id: 'Dha',
    roman: 'Dha',
    devanagari: 'धा',
    head: 'both',
    articulation: 'open',
    description: 'Compound stroke combining open Bhale (Ghe) + crisp Pothi (Ta).',
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
    description: 'Compound resonant stroke combining open Bhale (Ghe) + ringing Pothi (Tin).',
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
 */
export const REGIONAL_BOL_ALIASES: Record<string, CanonicalBolId> = {
  ge: 'Ghe',
  ghin: 'Ghe',
  kat: 'Ka',
  khat: 'Ka',
  tang: 'Tin',
  tan: 'Ta',
  dhi: 'Dhin',
};

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

