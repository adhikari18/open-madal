#!/usr/bin/env python3
"""Trim, fade and normalise raw Madal one-shot recordings into web-ready mono 16-bit WAVs.

Usage:
    python3 scripts/prepare-madal-samples.py <raw-dir>

<raw-dir> must contain the decoded source recordings named by Freesound ID
(532810.wav, 536028.wav, 532811.wav, 532812.wav, 532813.wav). Output goes to
apps/web/public/samples/madal/. Requires numpy + scipy.
"""
import os
import sys

import numpy as np
from scipy.io import wavfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DST = os.path.join(ROOT, 'apps', 'web', 'public', 'samples', 'madal')

ONE_SHOTS = {
    'taang.wav': '532810.wav',     # small head, index finger, open
    'taang-2.wav': '536028.wav',   # small head, open (second take, brighter)
    'taak.wav': '532811.wav',      # small head, middle+ring+little on khari, closed
    'kha.wav': '532812.wav',       # large head, four fingers, closed
    'ghin.wav': '532813.wav',      # large head, four fingers, open
}


def prepare(src_path: str, dst_path: str) -> float:
    sr, x = wavfile.read(src_path)
    x = x.astype(np.float64)
    if x.ndim > 1:
        x = x.mean(axis=1)
    x -= x.mean()
    peak = np.abs(x).max()

    # Onset = first sample above -30 dB of peak; keep 1.5 ms of pre-roll.
    onset = int(np.argmax(np.abs(x) > peak * 10 ** (-30 / 20)))
    x = x[max(0, onset - int(0.0015 * sr)):]

    # Tail = last 10 ms window whose RMS is still above -60 dB of peak.
    hop = int(0.01 * sr)
    rms = np.array([np.sqrt(np.mean(x[i:i + hop] ** 2)) for i in range(0, len(x) - hop, hop)])
    above = np.where(rms > peak * 10 ** (-60 / 20))[0]
    if len(above):
        x = x[:min(len(x), (above[-1] + 2) * hop)]

    # 1 ms fade-in guard + 30 ms raised-cosine fade-out.
    fi = int(0.001 * sr)
    x[:fi] *= np.linspace(0, 1, fi)
    fo = min(int(0.03 * sr), len(x) // 4)
    x[-fo:] *= 0.5 * (1 + np.cos(np.linspace(0, np.pi, fo)))

    # Normalise to -1 dBFS.
    x = x / np.abs(x).max() * 10 ** (-1 / 20)
    wavfile.write(dst_path, sr, (x * 32767).astype(np.int16))
    return len(x) / sr


def main() -> None:
    if len(sys.argv) != 2:
        print(__doc__)
        sys.exit(1)
    raw_dir = sys.argv[1]
    os.makedirs(DST, exist_ok=True)
    for out, src in ONE_SHOTS.items():
        dur = prepare(os.path.join(raw_dir, src), os.path.join(DST, out))
        print(f'{out:12s} <- {src}  {dur * 1000:6.0f} ms')


if __name__ == '__main__':
    main()
