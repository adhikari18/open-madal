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
    defaultTempo: 132,
    region: 'Central & Western Hills (Gandaki / Lumbini)',
    description:
      'The quintessential 6-beat Nepali folk dance rhythm driving Lok Dohori and festive hill songs. Accents fall on Beat 1 (Sam) and Beat 4.',
    source: `# Classic Jhyaure Taal (6/8)
@title: Traditional Jhyaure Taal
@taal: Jhyaure
@tempo: 132
@meter: 6/8
@region: Central & Western Hills, Nepal
@tali: 1, 4
@khali: 2

[Theka]
| >Dha - Ti : Ta Ghe - | x2

[Laya Variation]
| >Dha - [Ti Ta] : Ghe >Dhin - |
| >Dhing - Ti : [Ta Ka] Ghe - |`,
  },
  {
    id: 'khyali',
    name: 'Khyali Taal',
    devanagariName: 'ख्याली ताल',
    meter: '8/8',
    defaultTempo: 118,
    region: 'Pan-Nepali (Folk, Bhajan & Rodhi)',
    description:
      'An 8-beat symmetrical cycle widely played in Rodhi gatherings, modern Adhunik folk-pop, and devotional Bhajans.',
    source: `# Classic Khyali Taal (8/8)
@title: Khyali Folk Cycle
@taal: Khyali
@tempo: 118
@meter: 8/8
@region: Pan-Nepali
@tali: 1, 5
@khali: 3, 7

[Theka]
| >Dha Ti Ta Ghe : >Dhin Ta Ti - | x2

[Prakar]
| >Dha [Ti Ta] Ka Ghe : >Dhin [Ta Ki] Tin - |`,
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
    meter: '8/8',
    defaultTempo: 126,
    region: 'Western Hills (Kaski, Syangja, Tanahun)',
    description:
      'Lively 8-beat western hill rhythm characterized by open ringing Pothi strokes followed by resonant Bhale heel bends.',
    source: `# Samala Taal (8/8)
@title: Samala Western Hill Taal
@taal: Samala
@tempo: 126
@meter: 8/8
@region: Western Hills, Nepal
@tali: 1, 5
@khali: 4

[Theka]
| >Dhin - Ti Ta : >Ghe^ Tin Ta - | x2

[Variation]
| >Dhin [Ti Ta] Ka Ta : >Dhing Tin [Ta Ki] - |`,
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
