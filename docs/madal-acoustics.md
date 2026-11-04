# Madal Sound Research

This file records the evidence behind the web engine in `apps/web/src/lib/madalSynth.ts` and the
pitches and ring lengths in `packages/core/src/bols.ts`.

## 1. Sources

| Source | What it gives us |
|---|---|
| Raju Maharjan (Kutumba), *[Ghin-Kha-Taang-Taak-Ghin-Ghin-Taang: It's that simple](https://kathmandupost.com/weekender/2020/03/06/ghin-kha-taang-taak-ghin-ghin-taang-it-s-that-simple)*, The Kathmandu Post, 2020 | The five basic strokes and how to play them, plus the Samala, Maruni and Sangini cycles |
| [pbimal on Freesound](https://freesound.org/people/pbimal/packs/30009/), CC0 | One recording per stroke (Taang, Taak, Kha, Ghin/Dhin) with the technique documented for each, plus groove loops |
| [Nepali Wikipedia: मादल](https://ne.wikipedia.org/wiki/मादल) | Construction (*khari* paste of rice, iron filings and similar), and head naming (larger head = *bhale*) |
| C. V. Raman's work on loaded-membrane Indian drums (tabla, mridangam) | Why the *khari* load makes the partials of a head more harmonic and its pitch definite |

## 2. The Strokes (Kutumba)

| Stroke | Head | Technique | Sound |
|---|---|---|---|
| **Taang** (ताङ) | Small | Index finger strikes and lifts off | Bright, open, ringing |
| **Taak** (ताक) | Small | Middle, ring and little fingers together strike the *khari* and stay down | Dry, closed |
| **Ghin** (घिन) | Large | All four fingers together (no thumb) strike and bounce off | Deep, open, ringing |
| **Kha** (ख) | Large | Middle, ring and little fingers strike the *khari* and stay down | Muffled, closed |
| **Dhang** (धाङ) | Both | Taang + Ghin together | Full, combined |

Raju Maharjan puts *bhale* on the right, where Taang is played. Nepali Wikipedia calls the larger head
*bhale*. The project keeps the Wikipedia naming (`bhale` = large/bass head in code). The stroke names
do not depend on which convention you use.

## 3. Measurements from the Recordings

Analysis scripts: FFT peak picking over the 10–400 ms window, plus per-partial STFT decay slopes.

| Stroke | Fundamental | Main partials (ratio · level) | Per-partial T60 | Overall −20 dB / −40 dB |
|---|---|---|---|---|
| Taang (small, open) | **266–270 Hz** | 1.00 · 0 dB, 1.86–1.9 · −9 dB, 2.8 · −33 dB | 1.85 s, 1.35 s, 0.48 s | 0.6 s / 1.1 s |
| Taak (small, closed) | 267 Hz | 1.00 · 0 dB, 1.94 · −3 dB, 2.95 · −21 dB | **0.18 s**, 0.55 s, 0.22 s | 75 ms / 185 ms |
| Naa (small, lighter open) | **313 Hz** | 1.00, 1.94, 2.83 | 1.63 s, 0.95 s, 0.17 s | (measured inside a loop) |
| Ghin (large, open) | **174 Hz** | 1.00 · 0 dB, **1.65** · −21 dB, 2.37/2.56 · −31…−35 dB | 2.72 s, 2.16 s, 0.75 s | 0.86 s / 1.8 s |
| Kha (large, closed) | 177 Hz | 1.00 · 0 dB, 1.63 · −14 dB | 0.28 s, 0.51 s | 130 ms / 245 ms |

What the numbers show:

1. **The heads are about a fifth apart** (174 Hz vs. 266 Hz). The old synth used a 110–128 Hz "bass" head, which is well below a real madal.
2. **The pitch does not sweep.** The pitch of every stroke stays within about 1% for its whole ring. The old synth dropped its bass pitch by 38% in the first 40 ms, which is exactly how an electronic kick drum works and the main reason it sounded western.
3. **The attack is soft.** Spectral centroid is only 0.7–1.3 kHz in the first 15 ms, because a finger hit a skin. A bright noise burst sounds like a snare or a woodblock.
4. **Closed strokes damp the fundamental hardest.** In Taak, the 1.94× mode outlives the fundamental (T60 0.55 s vs. 0.18 s). This is why Taak still sounds pitched rather than like a click.
5. **The large head is inharmonic** (second partial at 1.65×, not 2×). The small head comes close to an octave (1.86–1.94×), which fits the *khari* loading.
6. **Open strokes ring for a long time** (Ghin ≈ 1.8 s to −40 dB). In playing, a new stroke on the same head stops the old ring. The engine models this with per-head choke.

## 4. Engine Design

- **Primary:** Plays the CC0 recordings (`apps/web/public/samples/madal/`), mapping each bol to its physical stroke. They are retuned to the bol's `fundamentalHz` (for example, Naa is Taang played at ×1.16) and cut to the bol's `decaySec`.
- **Dynamics:** Velocity sets both loudness and brightness (a low-pass filter). Small random variations in gain and pitch (±6% gain, ±0.3% pitch) stop repeated strokes from sounding machine-identical.
- **Per-head choke:** A new stroke fades out the previous ring on the same head. Fade time is about 25 ms for open strokes and about 6 ms for closed ones.
- **Mix:** The bass head is panned slightly left and the treble head slightly right (player's perspective). There is light glue compression and a quiet small-room send, because the recordings are dry lavalier takes.
- **Fallback:** A sine-partial modal synthesiser built from the table above, for when the samples cannot be fetched. It has steady pitch, a 3 ms attack, and a low-passed finger-contact transient.
- **Timing:** The sequencer schedules strokes on the `AudioContext` clock with 60 ms of lookahead, not on bare `setTimeout`.

**Verification:** The studio's output was captured from headless Chrome and analysed the same way as the recordings. The fundamentals, partial ratios and decay times of every pad match the recordings within a few Hz and tens of milliseconds, with no clipping.

## 5. Taal Notations

| Taal | Meter | Beat-by-beat cycle |
|---|---|---|
| **Jhyaure Taal** (झ्याउरे ताल) | 6/8 | `१: Ghin (घिं)` · `२: - (X)` · `३: Taang (तां)` · `४: Taak (तक्)` · `५: Ghin (घिं)` · `६: Taang (तां)`<br>**Kaat (काट):** `१: Taang (तां)` · `२: Ghin (घिं)` · `३: Taang (तां)` · `४: Ghin (घिं)` · `५: Taang (तां)` · `६: - (X)` |
| **Sangini Taal** (सङ्गिनी ताल) | 6/8 | `१: Ghin` · `२: Ghin` · `३: Taang` · `४: Taak` · `५: Ghin` · `६: Taang` |
| **Samala Taal** (समला ताल) | 4/4 | `१: Ghin` · `२: [Kha Taang]` · `३: [Taak Ghin]` · `४: [Ghin Taang]` |
| **Maruni Taal** (मारुनी ताल) | 4/4 | `१: Taang` · `२: [Kha Taang]` · `३: [Taang Ghin]` · `४: [Ghin Taang]` |

Notice the relationship between 6/8 **Jhyaure** and **Sangini**: both share the same 6-count skeleton, except Beat 2 is a rest (`X`) in Jhyaure (letting Beat 1's *Ghin* ring across Beats 1–2) and a second *Ghin* in Sangini.

## 6. Open Questions

- **Khyali, Tamang Selo and Chudka** are still the original project drafts, and their notation is not yet backed by a teacher or recording source.
- The `Ghe^` / `Dhing` heel pitch-bend is kept from the original specification, but none of the sources above document it for madal.
- Adding multi-velocity and round-robin one-shot recordings across madals of different sizes is the next step for realism.

