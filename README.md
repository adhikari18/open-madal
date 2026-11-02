# open-madal 🥁

**Digital preservation, declarative `MadalCode` notation compiler, dual-drumhead percussion tablature, and interactive Web Audio sequencer for the traditional Nepali Madal hand drum.**

[![License: MIT](https://img.shields.io/badge/License-MIT-orange.svg)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)

---

## Overview

The **Madal** (*मादल*) is the backbone of Nepali folk music (*Lok Dohori*, *Jhyaure*, *Khyali*, *Tamang Selo*, *Maruni*, *Chudka*). It is a cylindrical, two-headed hand drum carved from a hollowed hardwood log (*khamari* or *dar*), with a larger bass head (**Bhale** / left) and a smaller treble head (**Pothi** / right), both tuned with a concentric black harmonic paste called **khari**.

Historically, Madal rhythms (*Taals*) have been transmitted almost exclusively through oral mnemonic syllables (**bols** such as *Ghe*, *Ka*, *Ta*, *Ti*, *Tin*, *Dha*, *Dhin*, *Dhing*) without a standardized machine-readable notation format, digital tablature renderer, or browser-based practice sequencer.

### The Standardization Gap & Our Proposed Specification

Today, **there is no formal digital or machine-readable standard for Madal notation**:
1. **Oral Dialect Fragmentation:** Across Nepal's hills and valleys, the same physical stroke is spelled differently depending on regional tradition—for example, the open bass stroke is written variously as *Ghe* (घे) or *Ge* (गे), and the open treble ring is written as *Tin* (तिन), *Ti* (ति), or *Tang* (ताङ).
2. **Conflation of Sonic Syllables and Physical Mechanics:** Traditional *bols* describe what a rhythm *sounds* like rather than which hand strikes which drumhead. A compound syllable like `Dha` is a single spoken word, but physically requires a simultaneous left-hand open bass strike (`Ghe` on the *Bhale* head) and right-hand treble rim strike (`Ta` on the *Pothi* head).
3. **Incompatibility with Western Drum & MIDI Standards:** General MIDI (Channel 10) and Western 5-line drum staves were designed for kick/snare/hi-hat kits and lack a standardized mapping for two-headed tuned Himalayan drums with *khari* harmonic paste and palm-heel pitch bends.

**`open-madal` proposes the first open, deterministic specification (`MadalCode` v0.1 Draft RFC)** that normalizes regional oral *bol* dialects into a canonical **Dual-Head Physical AST**, compiling seamlessly to General MIDI, two-track SVG sheet music, and Web Audio synthesis:

1. **`@open-madal/core` (`MadalCode` DSL & Compiler):**
   A zero-dependency TypeScript lexer, recursive parser, semantic validator, Standard MIDI File (`.mid`) encoder, and dual-track SVG tablature + concentric radial rhythm clock renderer.
2. **`@open-madal/cli` (`madal` CLI):**
   A command-line compiler and validator to convert `.madal` text files into `.mid` files for DAWs (Ableton, Logic, Reaper, FL Studio) and print-ready `.svg` sheet music in both **Romanized** and **Devanagari** (`घे, का, ता, ति, धा`) scripts.
3. **`@open-madal/web` (Interactive Web Sequencer & Modal Synthesizer):**
   A Next.js + Tailwind CSS studio featuring a real-time **Web Audio API modal physical-modeling synthesizer** (modeling the harmonic partials of the *khari* spot and *Bhale* palm-heel pitch bends), a concentric radial *Taal* clock, and a live step sequencer.

---

## Who Is It For?

- **Folk Musicians, Students & Ethnomusicologists:** Learn, transcribe, and preserve regional Nepali *Taals* in a clean, human-readable text format that renders both circular *Taal* clocks and linear two-hand sheet notation.
- **Music Producers & Composers:** Write authentic Nepali folk grooves in `MadalCode` and export multi-note General MIDI patterns (`.mid`) directly into any DAW.
- **Open-Source Audio & Compiler Developers:** Explore a clean TypeScript monorepo combining domain-specific language (DSL) design, binary MIDI encoding, SVG geometry, and Web Audio acoustic synthesis.

---

## `MadalCode` Notation Example

```madal
# Classic Jhyaure Taal (6/8) — Lok Dohori & Hill Folk Dance
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
| >Dhing - Ti : [Ta Ka] Ghe - |
```

### Proposed Canonical Dual-Head Bol Specification (`MadalCode` v0.1)

The compiler accepts both canonical *bols* and regional oral aliases (such as `Ge` → `Ghe`, `Tang` → `Tin`, `Kat` → `Ka`) and decomposes every token into explicit **Bhale (Left Bass)** and **Pothi (Right Treble)** physical states:

| Canonical Bol | Regional Aliases | Devanagari | Drumhead(s) | Articulation | Physical Technique |
| :--- | :--- | :---: | :---: | :---: | :--- |
| **`Ghe`** / **`Ga`** / **`Dhum`** | `Ge`, `Ghin` | घे / ग / धुम | **Bhale** (Left Bass) | Open (`khula`) | Open resonant bass strike on the larger head |
| **`Ka`** | `Kat`, `Khat` | का | **Bhale** (Left Bass) | Closed (`bandha`) | Flat-palm muted slap on the bass head |
| **`Ta`** / **`Na`** | `Tan` | ता / ना | **Pothi** (Right Treble) | Rim (`kinara`) | Crisp finger strike on the treble rim/edge |
| **`Ti`** / **`Tin`** | `Tang` | ति / तिन | **Pothi** (Right Treble) | Open (`khula`) | Resonant strike on the center black *khari* spot |
| **`Ki`** | — | कि | **Pothi** (Right Treble) | Closed (`bandha`) | Muted treble finger tap |
| **`Dha`** | — | धा | **Both** (`Ghe` + `Ta`) | Compound Open | Simultaneous open bass `Ghe` + crisp treble `Ta` |
| **`Dhin`** | `Dhi` | धिन | **Both** (`Ghe` + `Tin`) | Compound Ring | Simultaneous open bass `Ghe` + ringing treble `Tin` |
| **`Dhing`** | — | धिङ | **Both** (`Ghe^` + `Tin`) | Pitch-Bend | Bass strike with palm-heel pressure pitch-slide + `Tin` |
| **`-`** / **`~`** | — | ऽ / 〜 | None | Rest / Sustain | Silent pause (`-`) or let previous stroke ring (`~`) |

---

## Repository Structure

```text
open-madal/
├── packages/
│   ├── core/          # @open-madal/core — Lexer, Parser, Validator, MIDI & SVG compilers
│   └── cli/           # @open-madal/cli  — Command-line compiler & Taal inspector
├── apps/
│   └── web/           # @open-madal/web  — Next.js + Web Audio interactive sequencer & clock
├── corpus/            # Canonical .madal notation files (Jhyaure, Khyali, Tamang Selo, Samala, Chudka)
├── ROADMAP.md         # Detailed milestone roadmap & planned features
├── CONTRIBUTING.md    # Guidelines for adding regional Taals and compiler features
└── LICENSE            # MIT License
```

---

## Getting Started

### Prerequisites

- **Node.js** `>= 20.0.0`
- **npm** `>= 10.0.0`

### 1. Install & Build Packages

```bash
git clone https://github.com/adhikari18/open-madal.git
cd open-madal
npm install
npm run build
```

### 2. Run the Test Suite

```bash
npm test
```

### 3. Launch the Interactive Web Sequencer

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to edit `MadalCode`, audition individual *Bhale*/*Pothi* drum pads, watch the concentric radial *Taal* clock, toggle Devanagari script, and export `.mid` or `.svg` files.

### 4. Use the Command-Line Compiler (`madal`)

```bash
# List all built-in Nepali Taal presets
npm run cli -- taals

# List all canonical Madal bols and dual-head mappings
npm run cli -- bols

# Validate a .madal file from the corpus
npm run cli -- validate corpus/jhyaure.madal

# Compile a .madal file to Standard MIDI (.mid), Linear SVG (.svg), and Radial Clock (.clock.svg)
npm run cli -- compile corpus/jhyaure.madal --midi --svg --clock --devanagari --out-dir ./out
```

---

## Roadmap

See [ROADMAP.md](./ROADMAP.md) for our detailed development plan covering `MadalCode` v0.2 expressive modifiers, click-to-edit radial clock interaction, print-ready multi-page PDF sheet generation, and deterministic Web Audio DSP practice tools.

---

## License

Released under the [MIT License](./LICENSE).

