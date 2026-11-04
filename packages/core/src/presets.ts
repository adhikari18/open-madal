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
      '6-count cycle: Ghin - Taang | Taak Ghin Taang (घिं X तां तक् घिं तां), with Kaat turnaround: Taang Ghin Taang | Ghin Taang - (तां घिं तां घिं तां X).',
    source: `# Traditional Jhyaure Taal (6/8)
# 6 Matras: १:घिं  २:X  ३:तां  ४:तक्  ५:घिं  ६:तां
# Kaat (काट): १:तां  २:घिं  ३:तां  ४:घिं  ५:तां  ६:X
@title: Traditional Jhyaure Taal
@taal: Jhyaure
@tempo: 180
@meter: 6/8
@region: Nepal (Lok Dohori & Hill Folk Songs)
@tali: 1, 4
@khali: 2

[Theka]
| >Ghin - Taang : Taak Ghin Taang | x4

[Kaat]
| >Taang Ghin Taang : Ghin Taang - | x2

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
      '8-count cycle: Ghin - Kha Taang | Taak Ghin Ghin Taang (घिं X ख तां तक् घिं घिं तां; spoken: धिङ s ख ति ता क धि ना), with Uthaan pickup and Kaat turnaround.',
    source: `# Traditional Khyali Taal (8/8)
# Spoken rhyme (8 matras): १:धिङ  २:s  ३:ख  ४:ति  ५:ता  ६:क  ७:धि  ८:ना
# Physical strokes:        १:घिं   २:X  ३:ख  ४:तां  ५:तक्  ६:घिं  ७:घिं  ८:तां
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

[Kaat]
| >Ghin Taang Taang Ghin : Taang Taang Ghin Taang |
| >Ghin Taang - Taang : - - - - |

[Laya Variation]
| >Ghin - Kha Taang : Taang - Taang Ghin | x2`,
  },
  {
    id: 'tamang-selo',
    name: 'Tamang Selo (Damphu/Madal)',
    devanagariName: 'तामाङ सेलो',
    meter: '4/4',
    defaultTempo: 140,
    region: 'Eastern & Central Himalayan Foothills (Sailung / Helambu)',
    description:
      'Energetic, brisk 4-beat rhythm featuring syncopated bass pickups and crisp treble rim accents.',
    source: `# Tamang Selo Groove (4/4)
@title: Tamang Selo Groove
@taal: Tamang Selo
@tempo: 140
@meter: 4/4
@region: Eastern & Central Himalayas
@tali: 1, 3
@khali: 2, 4

[Theka]
| >Dha - [Ghe Ti] >Ta | >Ghe [Ti Ta] >Dhin - | x2

[Uthan Pickup]
| >Dhum [Ka Ta] >Dha >Ta | [Ghe Ghe] >Tin >Dha - |`,
  },
  {
    id: 'samala',
    name: 'Samala Taal',
    devanagariName: 'समला ताल',
    meter: '4/4',
    defaultTempo: 100,
    region: 'Kathmandu Valley (popular among Newars); used for "Resham Firiri"',
    description:
      'Simple 4-count cycle: Ghin | Kha-Taang | Taak-Ghin | Ghin-Taang.',
    source: `# Samala Taal (4 counts)
@title: Samala Taal (Resham Firiri)
@taal: Samala
@tempo: 100
@meter: 4/4
@region: Kathmandu Valley, Nepal
@tali: 1, 3
@khali: 2

[Theka]
| >Ghin [Kha Taang] [Taak Ghin] [Ghin Taang] | x4`,
  },
  {
    id: 'maruni',
    name: 'Maruni Taal',
    devanagariName: 'मारुनी ताल',
    meter: '4/4',
    defaultTempo: 104,
    region: 'Pan-Nepali (Maruni dance)',
    description:
      '4-count cycle: Taang | Kha-Taang | Taang-Ghin | Ghin-Taang.',
    source: `# Maruni Taal (4 counts)
@title: Maruni Taal
@taal: Maruni
@tempo: 104
@meter: 4/4
@region: Nepal
@tali: 1, 3
@khali: 2

[Theka]
| >Taang [Kha Taang] [Taang Ghin] [Ghin Taang] | x4`,
  },
  {
    id: 'sangini',
    name: 'Sangini Taal',
    devanagariName: 'सङ्गिनी ताल',
    meter: '6/8',
    defaultTempo: 120,
    region: 'Nepal (Sangini songs and dance)',
    description:
      '6-count cycle: Ghin Ghin Taang Taak Ghin Taang.',
    source: `# Sangini Taal (6 counts)
@title: Sangini Taal
@taal: Sangini
@tempo: 120
@meter: 6/8
@region: Nepal
@tali: 1, 4

[Theka]
| >Ghin Ghin Taang : Taak Ghin Taang | x4`,
  },
  {
    id: 'dadra-chudka',
    name: 'Chudka / Kauda Taal',
    devanagariName: 'चुड्का / कौडा ताल',
    meter: '6/8',
    defaultTempo: 148,
    region: 'Magar & Gurung Heartland (Palpa, Tanahun, Gorkha)',
    description:
      'Fast, driving 6-beat Kauda and Chudka dance cycle with rolling subdivisions and sharp muted slaps.',
    source: `# Chudka / Kauda Dance Taal (6/8)
@title: Chudka Kauda Fast Cycle
@taal: Chudka
@tempo: 148
@meter: 6/8
@region: Gandaki Heartland, Nepal
@tali: 1, 4
@khali: 3

[Theka]
| >Dha [Ti Ta] Ka : >Dhin >Ta - | x2

[Fast Roll]
| >Dha [Ti Ta] [Ki Ta] : >Dhing >Ta Ghe |`,
  },
];

export function getPresetById(id: string): TaalPreset | undefined {
  return TAAL_PRESETS.find((p) => p.id.toLowerCase() === id.toLowerCase());
}
