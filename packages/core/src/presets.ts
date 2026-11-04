export interface TaalPreset {
  id: string;
  name: string;
  devanagariName: string;
  meter: string;
  defaultTempo: number;
  region: string;
  description: string;
  source: string;
}

export const TAAL_PRESETS: TaalPreset[] = [
  {
    id: 'jhyaure',
    name: 'Jhyaure Taal',
    devanagariName: 'झ्याउरे ताल',
    meter: '6/8',
    defaultTempo: 180,
    region: 'Nepal (Lok Dohori & Hill Folk Songs — "Lekali He Choyako Doko")',
    description:
      '6-count cycle: Ghin - Taang : Taak Ghin Taang (घिं X तां : तक् घिं तां), with Rolling Variation and Kaat turnaround: Taang Ghin Taang : Ghin Taang - (तां घिं तां : घिं तां X).',
    source: `# Traditional Jhyaure Taal (6/8) — Lok Dohori & Hill Folk Songs
# 6 Matras: १:घिं  २:X  ३:तां  :  ४:तक्  ५:घिं  ६:तां
# Kaat (काट): १:तां  २:घिं  ३:तां  :  ४:घिं  ५:तां  ६:X
@title: Traditional Jhyaure Taal
@taal: Jhyaure
@tempo: 180
@meter: 6/8
@region: Nepal (Lok Dohori & Hill Folk Songs)
@tali: 1
@khali: 4

[Theka]
| >Ghin - Taang : Taak Ghin Taang | x4

[Rolling Variation]
| >Ghin Ghin Taang : Taak Ghin Taang | x2
| >Ghin - Taang : Ghin Ghin Taang | x2

[Kaat]
| >Taang Ghin Taang : Ghin Taang - |

[Lekali He Choyako Doko]
| >Ghin - Taang : Taak Ghin Taang | x3
| >Taang Ghin Taang : Ghin Taang - |`,
  },
  {
    id: 'khyali',
    name: 'Khyali Taal',
    devanagariName: 'ख्याली ताल',
    meter: '8/8',
    defaultTempo: 176,
    region: 'Nepal (Lok Dohori, Adhunik Folk & Bhajan)',
    description:
      '8-count cycle: Ghin - Kha Taang : Taak Ghin Ghin Taang (घिं X ख तां : तक् घिं घिं तां; spoken: धिङ s ख ति ता क धि ना), with Uthaan pickup and Kaat turnaround.',
    source: `# Traditional Khyali Taal (8/8) — Lok Dohori, Adhunik Folk & Bhajan
# Spoken rhyme (8 matras): १:धिङ  २:s  ३:ख  ४:ति  :  ५:ता  ६:क  ७:धि  ८:ना
# Physical strokes:        १:घिं   २:X  ३:ख  ४:तां  :  ५:तक्  ६:घिं  ७:घिं  ८:तां
# Uthaan (उठान): तां [घिं तां] तां [घिं तां] : तां [घिं तां] घिं तां
# Kaat (काट):   १:घिं  २:तां  ३:तां  ४:घिं : ५:तां  ६:तां  ७:घिं  ८:तां
@title: Traditional Khyali Taal
@taal: Khyali
@tempo: 176
@meter: 8/8
@region: Nepal (Lok Dohori, Adhunik Folk & Bhajan)
@tali: 1
@khali: 5

[Theka]
| >Ghin - Kha Taang : Taak Ghin Ghin Taang | x4

[Uthaan]
| >Taang [Ghin Taang] Taang [Ghin Taang] : Taang [Ghin Taang] Ghin Taang |

[Laya Variation]
| >Ghin - Kha Taang : Taang - Taang Ghin | x2

[Kaat]
| >Ghin Taang Taang Ghin : Taang Taang Ghin Taang |
| >Ghin Taang - Taang : Taak Ghin Ghin Taang |`,
  },
  {
    id: 'tamang-selo',
    name: 'Tamang Selo (Damphu/Madal)',
    devanagariName: 'तामाङ सेलो',
    meter: '4/4',
    defaultTempo: 140,
    region: 'Eastern & Central Himalayan Foothills (Sailung / Helambu)',
    description:
      'Brisk 4/4 Damphu & Madal rhythm: Ghin [Taak Ghin] Ghin [Taak Ghin] (घिं [तक् घिं] घिं [तक् घिं] — signature "Taak Ghin-Ghin" double-bass bounce), with Kha-Taak roll and Kaat turnaround.',
    source: `# Traditional Tamang Selo (4/4) — Damphu & Madal Rhythm
# 4-count Selo cycle (घिं X तक् घिं) played two cycles per 4/4 bar:
#   Beat 1: घिं (Ghin rings across 2 eighth-notes)
#   Beat 2: [तक् घिं] ([Taak Ghin] leads into Beat 3 Ghin for the "Taak Ghin-Ghin" double bass)
#   Beat 3: घिं (Ghin rings across 2 eighth-notes)
#   Beat 4: [तक् घिं] ([Taak Ghin] leads into Beat 1 Ghin across the barline)
# Kaat (काट): १:[घिं घिं]  २:[~ घिं]  ३:[तां घिं]  ४:[तां X]
@title: Traditional Tamang Selo
@taal: Tamang Selo
@tempo: 140
@meter: 4/4
@region: Eastern & Central Himalayan Foothills (Sailung / Helambu)
@tali: 1, 3
@khali: 2, 4

[Theka]
| >Ghin [Taak Ghin] >Ghin [Taak Ghin] | x4

[Treble Response]
| >Ghin [Taak Taang] >Taang [Taak Ghin] | x2

[Kha-Taak Roll]
| >Ghin [Kha Taak] [Kha Taang] Taang |
| [Kha Taak] [Kha Ghin] >Ghin [Taak Ghin] |

[Kaat]
| [>Ghin Ghin] [~ Ghin] [Taang Ghin] [Taang -] |`,
  },
  {
    id: 'samala',
    name: 'Samala Taal',
    devanagariName: 'समला ताल',
    meter: '4/4',
    defaultTempo: 100,
    region: 'Kathmandu Valley & Hill Folk Songs ("Resham Firiri")',
    description:
      '4-count cycle: Ghin | [Kha Taang] | [Taak Ghin] | [Ghin Taang] (घिं [ख तां] [तक् घिं] [घिं तां]), with Rolling Uthaan ([Ghin Taang]x3 Dhang) and Kaat ([Ghin Taang] [Taang Ghin] Taang -).',
    source: `# Traditional Samala Taal (4/4)
# 4 Matras (8 eighth-note subdivisions): १:घिं  २:[ख तां]  ३:[तक् घिं]  ४:[घिं तां]
# Rolling Uthaan (उठान): १:[घिं तां]  २:[घिं तां]  ३:[घिं तां]  ४:धां
# Kaat (काट): १:[घिं तां]  २:[तां घिं]  ३:तां  ४:X
@title: Traditional Samala Taal
@taal: Samala
@tempo: 100
@meter: 4/4
@region: Kathmandu Valley & Hill Folk Songs ("Resham Firiri")
@tali: 1, 3
@khali: 2

[Theka]
| >Ghin [Kha Taang] [Taak Ghin] [Ghin Taang] | x4

[Laya Variation]
| [>Ghin Ghin] [Kha Taang] [Taak Ghin] [Ghin Taang] | x2

[Rolling Uthaan]
| [>Ghin Taang] [Ghin Taang] [Ghin Taang] Dhang |

[Kaat]
| [>Ghin Taang] [Taang Ghin] Taang - | x2`,
  },
  {
    id: 'maruni',
    name: 'Maruni Taal',
    devanagariName: 'मारुनी ताल',
    meter: '4/4',
    defaultTempo: 104,
    region: 'Nepal (Maruni Dance & Folk Songs)',
    description:
      '4-count cycle: Taang | [Kha Taang] | [Taang Ghin] | [Ghin Taang] (तां [ख तां] [तां घिं] [घिं तां]), with Purbeli variation (तां [ख तक्] [तां घिं] घिं) and rolling Kaat turnaround.',
    source: `# Traditional Maruni Taal (4/4)
# 4 Matras (8 eighth-note subdivisions): १:तां  २:[ख तां]  ३:[तां घिं]  ४:[घिं तां]
# Purbeli Variation: १:तां  २:[ख तक्]  ३:[तां घिं]  ४:घिं
# Kaat (काट): १:[घिं तां]  २:[घिं तां]  ३:[घिं तां]  ४:तां  |  १:[तक् घिं]  २:तां  ३:[तक् घिं]  ४:तां
@title: Traditional Maruni Taal
@taal: Maruni
@tempo: 104
@meter: 4/4
@region: Nepal (Maruni Dance & Folk Songs)
@tali: 1, 3
@khali: 2

[Theka]
| >Taang [Kha Taang] [Taang Ghin] [Ghin Taang] | x4

[Purbeli Variation]
| >Taang [Kha Taak] [Taang Ghin] Ghin | x2

[Kaat]
| [>Ghin Taang] [Ghin Taang] [Ghin Taang] Taang |
| [>Taak Ghin] Taang [Taak Ghin] Taang |`,
  },
  {
    id: 'sangini',
    name: 'Sangini Taal',
    devanagariName: 'सङ्गिनी ताल',
    meter: '6/8',
    defaultTempo: 120,
    region: 'Nepal (Sangini Songs, Deuda & Folk Dance)',
    description:
      '6-count cycle: Ghin Ghin Taang : Taak Ghin Taang (घिं घिं तां : तक् घिं तां; spoken: घिं घिं ताङ । नकी घिं ताङ), with Prakar variations and rolling Kaat turnaround.',
    source: `# Traditional Sangini Taal (6/8)
# 6 Matras, 2 Vibhags (3+3), 1 Tali (Beat 1), 1 Khali (Beat 4)
# Spoken rhyme: १:घिं  २:घिं  ३:ताङ  :  ४:नकी  ५:घिं  ६:ताङ
# Physical strokes: १:घिं  २:घिं  ३:तां  :  ४:तक्  ५:घिं  ६:तां
# Kaat (काट): १:[घिं घिं]  २:[~ घिं]  ३:[तां घिं]  :  ४:[तां घिं]  ५:तां  ६:X
@title: Traditional Sangini Taal
@taal: Sangini
@tempo: 120
@meter: 6/8
@region: Nepal (Sangini Songs, Deuda & Folk Dance)
@tali: 1
@khali: 4

[Theka]
| >Ghin Ghin Taang : Taak Ghin Taang | x4

[Prakar]
| >Ghin Taang Taang : Taak Ghin Taang | x2
| >Ghin Ghin Taang : Ghin Taang - | x2
| >Ghin Taang Taang : Taak Taang Taang | x2

[Kaat]
| [>Ghin Ghin] [~ Ghin] [Taang Ghin] : [Taang Ghin] Taang - |`,
  },
  {
    id: 'dadra-chudka',
    name: 'Chudka / Kauda Taal',
    devanagariName: 'चुड्का / कौडा ताल',
    meter: '6/8',
    defaultTempo: 148,
    region: 'Gandaki Heartland, Nepal (Kauda, Chudka & Roila Bhajan)',
    description:
      '6-count cycle: Ghin Ghin Taang : Kha Ghin Taang (घिं घिं तां : ख घिं तां; spoken: घिं घि ना खत् घि ना), Dhang Uthaan pickup, Drut Chudka (तक् घिं तां : तक् घिं तां), and Kaat.',
    source: `# Traditional Chudka / Kauda Taal (6/8)
# Spoken rhyme (6 matras): १:घिं  २:घि  ३:ना  :  ४:खत्  ५:घि  ६:ना
# Physical strokes:        १:घिं  २:घिं  ३:तां  :  ४:ख   ५:घिं  ६:तां
# Uthaan (उठान): १:तक्  २:धां  ३:तक्  :  ४:धां  ५:घिं  ६:तां
# Drut (Fast) Chudka:      १:तक्  २:घिं  ३:तां  :  ४:तक्  ५:घिं  ६:तां  (spoken: ताक घिना ताक घिना)
# Kaat (काट):   १:तां  २:घिं  ३:तां  :  ४:घिं  ५:तां  ६:X
@title: Traditional Chudka / Kauda Taal
@taal: Chudka
@tempo: 148
@meter: 6/8
@region: Gandaki Heartland, Nepal (Kauda, Chudka & Roila Bhajan)
@tali: 1
@khali: 4

[Theka]
| >Ghin Ghin Taang : Kha Ghin Taang | x4

[Uthaan]
| >Taak Dhang Taak : Dhang Ghin Taang |

[Drut Chudka]
| >Taak Ghin Taang : Taak Ghin Taang | x4

[Kaat]
| >Taang Ghin Taang : Ghin Taang - |`,
  },
];

export function getPresetById(id: string): TaalPreset | undefined {
  return TAAL_PRESETS.find((p) => p.id.toLowerCase() === id.toLowerCase());
}
