# Madal One-Shot Samples (CC0 1.0)

Real acoustic recordings of a Nepali *madal*, one stroke per file. The web studio
uses them as the primary sound source and falls back to the research-calibrated modal synthesiser
in `apps/web/src/lib/madalSynth.ts` only if they fail to load.

| File | Stroke (bol) | Head | Technique (as documented by the recordist) | Source |
|---|---|---|---|---|
| `taang.wav` | ताङ *Taang* | Small (treble) | Index finger only, open: finger leaves the skin right after the strike | [freesound.org/s/532810](https://freesound.org/people/pbimal/sounds/532810/) |
| `taang-2.wav` | ताङ *Taang* (2nd take) | Small (treble) | Open stroke | [freesound.org/s/536028](https://freesound.org/people/pbimal/sounds/536028/) |
| `taak.wav` | ताक *Taak* | Small (treble) | Middle + ring + little fingers on the *khari*, closed: fingers stay on the skin until it is silent | [freesound.org/s/532811](https://freesound.org/people/pbimal/sounds/532811/) |
| `kha.wav` | ख *Kha* | Large (bass) | All four fingers, closed | [freesound.org/s/532812](https://freesound.org/people/pbimal/sounds/532812/) |
| `ghin.wav` | घिन *Ghin* (the uploader titled it *Dhin*) | Large (bass) | All four fingers, open | [freesound.org/s/532813](https://freesound.org/people/pbimal/sounds/532813/) |

- **Recordist:** [pbimal](https://freesound.org/people/pbimal/) on Freesound (lavalier microphone).
- **License:** [Creative Commons Zero 1.0 (public domain dedication)](https://creativecommons.org/publicdomain/zero/1.0/). No attribution is required, but we credit the recordist anyway.
- **Processing:** These were decoded from Freesound's public HQ previews, then trimmed to the onset (1.5 ms pre-roll), cut at −60 dB, given a 30 ms fade-out, and normalised to −1 dBFS as mono 16-bit / 44.1 kHz WAV. Nothing else was changed (no EQ, no compression, no pitch change). The script is `scripts/prepare-madal-samples.py`.

To use better source files, download the original lossless WAVs from the links above (you need a Freesound account), or record your own madal using the same one-stroke-per-file layout, and replace these files. The engine picks them up automatically.
