# `open-madal` Engineering Roadmap (130+ Hours Planned)

This document outlines the multi-milestone engineering roadmap for `open-madal` beyond the `v0.1.0` core release. Each milestone is broken into modular, testable tasks (3–6 hours each) across compiler engineering, Web Audio synthesis, deterministic DSP, interactive UI, and developer tooling.

---

## Milestone 1: `MadalCode` v0.2 Compiler, Grammar & Expressive AST (~18 hrs)

- [x] **1.1 Nested Tuplets & Ornamental Rolls (`Tirakita` / `Diri-Diri`) (~4 hrs):**
  - Support arbitrary-depth bracketed subdivisions (`[Ti [Ra Ki] Ta]`, triplets, sextuplets) with exact rational-number beat fractions in the AST.
- [ ] **1.2 Continuous Pitch-Bend & Heel-Slide Automation (`Ghe^` / `Dhing`) (~4 hrs):**
  - Emit 14-bit MIDI Pitch Wheel (`0xE0`) and Control Change envelopes alongside note events so external DAW samplers reproduce palm-heel pressure pitch bends on the *Bhale* head.
- [ ] **1.3 Folk Micro-Timing & Groove Engine (`@groove` Directive) (~4 hrs):**
  - Implement non-isochronous regional swing templates (`jhyaure-lilt`, `selo-bounce`, `khyali-rodhi`, `deuda-swing`) with per-subdivision millisecond/tick offsets and dynamic velocity curves.
- [ ] **1.4 Variables, Macros & Reusable Phrase Blocks (`@define`) (~3 hrs):**
  - Allow composers to define reusable rhythmic phrases (`@define uthan_1 = | >Dhum [Ka Ta] >Dha >Ta |`) and compose full song structures (`@play uthan_1 x2`).
- [ ] **1.5 Rich CLI Source-Span Diagnostic Formatter (~3 hrs):**
  - Upgrade `@open-madal/cli` error reporting with line/column carets (`^`), colorized code frames, and Levenshtein "Did you mean?" suggestions for misspelled *bols*.

---

## Milestone 2: Multi-Format Sheet Music & Notation Exporters (~16 hrs)

- [ ] **2.1 MusicXML 4.0 Exporter (`@open-madal/core`) (~5 hrs):**
  - Compile `MadalProgramAST` into standard `.musicxml` unpitched percussion staves (2-line staff mapping *Bhale* and *Pothi* with custom noteheads) so scores open directly in MuseScore, Finale, Sibelius, and Dorico.
- [ ] **2.2 LilyPond (`.ly`) & ABC Notation Transpilers (~4 hrs):**
  - Generate publication-quality LilyPond percussion engraving scripts with embedded Devanagari and Romanized *bol* lyrics.
- [ ] **2.3 Multi-Page Printable Lesson PDF Generator (~4 hrs):**
  - Build a paginated sheet music layout engine with title headers, *Taal* hand-clap (*Sam/Tali/Khali*) legends, tempo markings, and bilingual lyrics alignment under each beat.
- [ ] **2.4 SMF Format 1 Multi-Track MIDI Exporter (~3 hrs):**
  - Upgrade the binary MIDI encoder to support Format 1 multi-track `.mid` files (Track 0: Tempo/Meter map, Track 1: *Bhale* Bass channel, Track 2: *Pothi* Treble channel, Track 3: Vibhag Click track).

---

## Milestone 3: Two-Way Interactive Sequencer & Radial *Taal* Studio (~20 hrs)

- [ ] **3.1 Click-to-Edit Concentric Radial Rhythm Clock (~5 hrs):**
  - Make every node on the SVG radial polygon clock interactive: clicking or dragging outer (*Bhale*) or inner (*Pothi*) vertices toggles strokes, cycles articulations (`Ghe` → `Ka` → `Ghe^`), and bi-directionally updates the `MadalCode` editor AST.
- [ ] **3.2 Matrix Step Sequencer with Velocity & Micro-Timing Lanes (~5 hrs):**
  - Build a DAW-style 2D step grid with per-step draggable velocity bars, accent toggles, flam/grace-note toggles, and sub-beat split buttons (`1x`, `2x`, `3x`, `4x`).
- [ ] **3.3 Live QWERTY Drum Pad Recording & Quantizer (~4 hrs):**
  - Map computer keyboard keys (`A S D F` = *Bhale*, `J K L ;` = *Pothi*) with real-time loop recording and automatic quantization into the active `.madal` bar.
- [ ] **3.4 URL Permalink Compression & Embeddable `<madal-player>` Web Component (~3 hrs):**
  - Compress `.madal` source into URL-safe LZ/Base64 hash fragments (`#code=...`) and package a standalone custom element for embedding interactive rhythms in blogs and documentation.
- [ ] **3.5 Undo/Redo History Stack & LocalStorage Songbook Manager (~3 hrs):**
  - Add multi-tab pattern management, version snapshots, and local browser workspace persistence.

---

## Milestone 4: Acoustic Synthesis, Sample Engine & Offline WAV Renderer (~18 hrs)

- [ ] **4.1 Multi-Modal Waveguide & Membrane Resonator Synth v2 (~5 hrs):**
  - Model circular membrane Bessel modes $(0,1), (1,1), (2,1)$ and the mass-loading effect of the central black *khari* paste with adjustable tuning pitch (C# to G), skin tension, and shell resonance parameters.
- [ ] **4.2 Hybrid Multi-Velocity Sample Pack Loader & Mixer (~5 hrs):**
  - Support loading recorded round-robin `.wav`/`.ogg` sample layers alongside the physical-modeling synth, with independent *Bhale*/*Pothi* stereo panning, 3-band EQ, and convolution room reverb.
- [ ] **4.3 Offline Audio Context `.wav` Stem Renderer (~4 hrs):**
  - Render any `MadalCode` file faster-than-realtime using `OfflineAudioContext` (in browser) or PCM synthesis (in Node CLI) directly to downloadable 48kHz/24-bit `.wav` audio loops.
- [ ] **4.4 SFZ & Ableton/Logic Drum Rack Preset Exporter (~4 hrs):**
  - Auto-generate open `.sfz` sampler instrument definitions paired with synthesized or recorded one-shot WAV kits.

---

## Milestone 5: Deterministic Web Audio DSP Practice Coach (~20 hrs)

- [ ] **5.1 Low-Latency `AudioWorklet` Onset Detector (~5 hrs):**
  - Implement deterministic Digital Signal Processing (spectral flux, high-frequency content, and adaptive median thresholding) inside a Web Audio `AudioWorklet` to detect live mic strikes with `<10ms` latency.
- [ ] **5.2 Acoustic Bandpass & Pitch-Contour Stroke Estimator (~5 hrs):**
  - Use dual digital biquad filter banks (low band `90–190 Hz` for *Bhale* fundamental vs. harmonic band `260–680 Hz` for *Pothi* *khari* ring), zero-crossing rate (ZCR), and autocorrelation pitch tracking to classify live strikes into `Ghe`, `Ka`, `Ta`, `Ti`, or `Dha`.
- [ ] **5.3 "Call & Response" Interactive Rhythm Tutor & Timing Histogram (~5 hrs):**
  - Build a guided practice mode where the synth plays 2 bars and listens for 2 bars, plotting a millisecond timing accuracy histogram (`early` / `on-beat` / `late`) and tempo stability score.
- [ ] **5.4 Live Tap-to-MadalCode Dictation Transcriber (~5 hrs):**
  - Allow users to tap a rhythm on their desk or play a real Madal into the microphone against a metronome and automatically quantize the detected onsets into a draft `.madal` bar.

---

## Milestone 6: Nepali Folk Ensemble Arranger (`Panche Baja` & `Lok Dohori`) (~16 hrs)

- [ ] **6.1 Multi-Instrument Folk Companion Tracks (~6 hrs):**
  - Extend `MadalCode` to support companion percussion tracks commonly played alongside the Madal: **Jhyali / Mujura** (bronze cymbals marking *Tali* beats), **Damphu**, **Khaisjadi** (tambourine), and **Bansuri / Sarangi** drone root notes (`Sa` / `Pa`).
- [ ] **6.2 Full Song Form Arranger (`Uthan` → `Theka` → `Prakar` → `Tihai`) (~5 hrs):**
  - Build a visual arrangement timeline for sequencing intro pickups (*Uthan*), main grooves (*Theka*), fills (*Lagani*), and 3-fold cadential endings (*Tihai* that land precisely on Beat 1 *Sam*).
- [ ] **6.3 Automatic *Tihai* Cadence Calculator (~5 hrs):**
  - Given any *Taal* meter (e.g., 6/8 *Jhyaure* or 8/8 *Khyali*) and starting beat, mathematically compute valid *Damdar* (with rest) and *Bedam* (no rest) 3-repeat *Tihai* phrases that resolve onto *Sam*.

---

## Milestone 7: Developer Ecosystem, LSP & VS Code Extension (~12 hrs)

- [ ] **7.1 `MadalCode` Language Server Protocol (`packages/madal-lsp`) (~6 hrs):**
  - Implement hover documentation (showing *bol* hand technique and frequency specs), autocomplete for directives and *bols*, and real-time beat-count diagnostics.
- [ ] **7.2 VS Code Extension (`packages/vscode-madal`) (~6 hrs):**
  - Syntax highlighting (`.tmLanguage.json`) for `.madal` files plus a live side-panel SVG Tablature & Radial Clock preview inside VS Code.

---

## Milestone 8: Cultural Archive, Interactive Curriculum & Documentation (~12 hrs)

- [ ] **8.1 25+ Regional Nepali *Taal* Encyclopedia (`corpus/`) (~6 hrs):**
  - Transcribe, verify, and document canonical rhythms across all provinces of Nepal: *Maruni*, *Sangini*, *Sorathi*, *Deuda*, *Chliyya*, *Hakpare*, *Palam*, *Chabrung*, *Jhoda*, *Roila*, *Bhojpuri Kaharwa*, and *Newa Dhimay/Khin* cross-references.
- [ ] **8.2 Interactive Step-by-Step Curriculum Mode (`apps/web/learn`) (~6 hrs):**
  - Build a 10-lesson interactive syllabus teaching beginners hand placement, single-head strokes, compound *Dha/Dhin* coordination, and regional *Taal* variations.
