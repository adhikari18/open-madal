'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  BOL_DICTIONARY,
  CanonicalBolId,
  TAAL_PRESETS,
  compileToMidi,
  flattenTimeline,
  formatBolLabel,
  parseBolToken,
  parseMadalCode,
  renderLinearTabSVG,
  renderRadialClockSVG,
  validateMadalProgram,
} from '@open-madal/core';
import {
  Activity,
  BookOpen,
  CheckCircle2,
  Disc,
  Download,
  FileCode2,
  Languages,
  Music,
  Pause,
  Play,
  Sparkles,
  Volume2,
  AlertTriangle,
} from 'lucide-react';
import { MadalAudioEngine } from '@/lib/madalSynth';

/** The core madal strokes taught in lessons: Ghin, Kha, Taang, Taak, Naa, and Dhang. */
const PLAYABLE_PAD_BOLS: CanonicalBolId[] = [
  'Ghe',
  'Ka',
  'Ta',
  'Tin',
  'Ki',
  'Na',
  'Dha',
  'Dhin',
];

/** Name of the physical madal stroke behind each pad (as taught by madal teachers). */
const MADAL_STROKE_NAMES: Partial<Record<CanonicalBolId, string>> = {
  Ghe: 'Ghin',
  Ka: 'Kha',
  Ta: 'Taang',
  Tin: 'Taang · ring',
  Ki: 'Taak',
  Na: 'Naa',
  Dha: 'Dhang',
  Dhin: 'Ghin + Taang',
};

export default function OpenMadalStudioPage() {
  const [selectedPresetId, setSelectedPresetId] = useState<string>(TAAL_PRESETS[0].id);
  const [sourceCode, setSourceCode] = useState<string>(TAAL_PRESETS[0].source);
  const [scriptMode, setScriptMode] = useState<'roman' | 'devanagari'>('roman');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [metronomeEnabled, setMetronomeEnabled] = useState<boolean>(true);
  const [activeEventIdx, setActiveEventIdx] = useState<number | null>(null);
  const [activePadBol, setActivePadBol] = useState<CanonicalBolId | null>(null);

  const audioEngineRef = useRef<MadalAudioEngine | null>(null);
  const timerRef = useRef<number | null>(null);

  const getAudioEngine = useCallback(() => {
    if (!audioEngineRef.current) {
      audioEngineRef.current = new MadalAudioEngine();
    }
    return audioEngineRef.current;
  }, []);

  // Parse and validate MadalCode live
  const ast = useMemo(() => parseMadalCode(sourceCode), [sourceCode]);
  const validation = useMemo(() => validateMadalProgram(ast), [ast]);
  const timeline = useMemo(() => flattenTimeline(ast), [ast]);

  // Active beat inside the bar for the radial clock
  const activeBeatIndex = useMemo(() => {
    if (activeEventIdx === null || !timeline[activeEventIdx]) return undefined;
    return timeline[activeEventIdx].beatInBar - 1;
  }, [activeEventIdx, timeline]);

  const radialClockSvg = useMemo(
    () =>
      renderRadialClockSVG(ast, {
        script: scriptMode,
        activeBeatIndex,
      }),
    [ast, scriptMode, activeBeatIndex]
  );

  const linearTabSvg = useMemo(
    () =>
      renderLinearTabSVG(ast, {
        script: scriptMode,
        theme: 'dark',
      }),
    [ast, scriptMode]
  );

  // Stop playback loop helper
  const stopPlayback = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsPlaying(false);
    setActiveEventIdx(null);
  }, []);

  // Sequencer step playback loop.
  // Strokes are scheduled on the AudioContext clock slightly ahead of time, so timing stays
  // steady like a real player's hands instead of drifting with setTimeout jitter.
  useEffect(() => {
    if (!isPlaying) return;
    if (timeline.length === 0) {
      stopPlayback();
      return;
    }

    const LOOKAHEAD_SEC = 0.06;
    let stepIndex = 0;
    let isCancelled = false;
    const engine = getAudioEngine();
    let nextTime = engine.getCurrentTime() + LOOKAHEAD_SEC;

    const scheduleStep = () => {
      if (isCancelled) return;
      const now = engine.getCurrentTime();
      if (nextTime < now - 0.1) {
        // Tab was throttled in the background: resync instead of bursting missed strokes
        nextTime = now + LOOKAHEAD_SEC;
      }

      const ev = timeline[stepIndex];
      const idx = stepIndex;

      if (metronomeEnabled && ev.subdivisionIndex === 0) {
        engine.triggerMetronome(ev.beatInBar === 1, nextTime);
      }
      if (ev.token.bol !== '-' && ev.token.bol !== '~') {
        engine.triggerBolToken(ev.token, nextTime, ev.velocity);
      }
      window.setTimeout(() => {
        if (!isCancelled) setActiveEventIdx(idx);
      }, Math.max(0, (nextTime - now) * 1000));

      nextTime += Math.max(0.04, ev.durationSeconds);
      stepIndex = (stepIndex + 1) % timeline.length;
      timerRef.current = window.setTimeout(
        scheduleStep,
        Math.max(0, (nextTime - engine.getCurrentTime() - LOOKAHEAD_SEC) * 1000)
      );
    };

    scheduleStep();

    return () => {
      isCancelled = true;
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, [isPlaying, timeline, metronomeEnabled, getAudioEngine, stopPlayback]);

  // Fetch & decode the madal recordings up front so the first stroke is already real audio
  useEffect(() => {
    void getAudioEngine().preload();
  }, [getAudioEngine]);

  // Select a built-in Taal preset
  const handleSelectPreset = (presetId: string) => {
    stopPlayback();
    setSelectedPresetId(presetId);
    const preset = TAAL_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setSourceCode(preset.source);
    }
  };

  // Update tempo directive in source code
  const handleTempoChange = (newBpm: number) => {
    setSourceCode((prev) => {
      if (/@tempo\s*:\s*\d+/i.test(prev)) {
        return prev.replace(/@tempo\s*:\s*\d+/i, `@tempo: ${newBpm}`);
      }
      return `@tempo: ${newBpm}\n${prev}`;
    });
  };

  // Audition a single bol pad
  const handleAuditionBol = (bolId: CanonicalBolId) => {
    const engine = getAudioEngine();
    const token = parseBolToken(bolId, 1, 1, 1, []);
    engine.triggerBolToken(token, undefined, 112);
    setActivePadBol(bolId);
    window.setTimeout(() => setActivePadBol(null), 180);
  };

  // Insert bol into source editor
  const handleInsertBol = (bolId: CanonicalBolId) => {
    handleAuditionBol(bolId);
    setSourceCode((prev) => `${prev.trimEnd()} ${bolId}`);
  };

  // Export Standard MIDI File (.mid)
  const handleExportMidi = () => {
    const midiBytes = compileToMidi(ast);
    const blob = new Blob([new Uint8Array(midiBytes)], { type: 'audio/midi' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const slug = ast.metadata.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    a.href = url;
    a.download = `${slug || 'madal-pattern'}.mid`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export Linear Tablature SVG (.svg)
  const handleExportSvg = () => {
    const blob = new Blob([linearTabSvg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const slug = ast.metadata.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    a.href = url;
    a.download = `${slug || 'madal-pattern'}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col">
      {/* Top Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-teal-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Disc className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-white">
                  open-madal
                </h1>
                <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-300 border border-orange-500/30">
                  v0.1.0 Studio
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Declarative <code className="text-orange-300">MadalCode</code> Notation Compiler, Radial Taal Clock &amp; Modal Web Synthesizer
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() =>
                setScriptMode((s) => (s === 'roman' ? 'devanagari' : 'roman'))
              }
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 transition"
              title="Toggle Romanized / Devanagari Bol Script"
            >
              <Languages className="w-3.5 h-3.5 text-teal-400" />
              {scriptMode === 'roman' ? 'Script: Roman (Dha)' : 'Script: देवनागरी (धा)'}
            </button>

            <button
              onClick={handleExportMidi}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 transition"
            >
              <Download className="w-3.5 h-3.5 text-orange-400" />
              Export MIDI (.mid)
            </button>

            <button
              onClick={handleExportSvg}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 transition"
            >
              <Download className="w-3.5 h-3.5 text-teal-400" />
              Export Sheet (.svg)
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6 flex-1">
        {/* Preset Selector & Transport Bar */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-4 bg-slate-900/60 border border-slate-800/90 rounded-2xl p-4">
          {/* Taal Presets */}
          <div className="lg:col-span-7 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <BookOpen className="w-3.5 h-3.5 text-orange-400" />
              Traditional Nepali Taal Corpus
            </div>
            <div className="flex flex-wrap gap-2">
              {TAAL_PRESETS.map((preset) => {
                const active = preset.id === selectedPresetId;
                return (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset.id)}
                    className={`px-3 py-2 rounded-xl text-left transition border ${
                      active
                        ? 'bg-orange-500/15 border-orange-500/60 text-white shadow-sm'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold flex items-center gap-1.5">
                      <span>{preset.name}</span>
                      <span className="text-[11px] text-orange-300/90 font-normal">
                        {preset.devanagariName}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {preset.meter} • {preset.defaultTempo} BPM
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Playback Transport Controls */}
          <div className="lg:col-span-5 flex flex-col justify-between bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5 gap-3">
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  if (isPlaying) {
                    stopPlayback();
                  } else {
                    setIsPlaying(true);
                  }
                }}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition shadow-lg ${
                  isPlaying
                    ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20'
                    : 'bg-orange-500 hover:bg-orange-400 text-slate-950 shadow-orange-500/20'
                }`}
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-4 h-4 fill-current" />
                    Stop Sequencer
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    Play Taal Cycle
                  </>
                )}
              </button>

              <label className="inline-flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={metronomeEnabled}
                  onChange={(e) => setMetronomeEnabled(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-orange-500 focus:ring-orange-500"
                />
                Metronome Pulse
              </label>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Tempo (Laya)</span>
                <span className="font-mono font-semibold text-orange-300">
                  {ast.metadata.tempo} BPM
                </span>
              </div>
              <input
                type="range"
                min={60}
                max={260}
                value={ast.metadata.tempo}
                onChange={(e) => handleTempoChange(Number(e.target.value))}
                className="w-full accent-orange-500 cursor-pointer"
              />
            </div>
          </div>
        </section>

        {/* Audition Drum Pads (Bhale + Pothi + Compound Bols) */}
        <section className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <Volume2 className="w-3.5 h-3.5 text-teal-400" />
              Interactive Dual-Head Bol Audition Pads (Click to Play Sound)
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="inline-flex items-center gap-1.5 text-orange-300">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                Bhale (Left Bass Head)
              </span>
              <span className="inline-flex items-center gap-1.5 text-teal-300">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
                Pothi (Right Treble Head)
              </span>
              <span className="inline-flex items-center gap-1.5 text-amber-300">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                Both Heads (Compound)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
            {PLAYABLE_PAD_BOLS.map((bolId) => {
              const def = BOL_DICTIONARY[bolId];
              const isTriggered = activePadBol === bolId;
              const borderClass =
                def.head === 'bhale'
                  ? 'border-orange-500/40 hover:border-orange-400'
                  : def.head === 'pothi'
                  ? 'border-teal-500/40 hover:border-teal-400'
                  : 'border-amber-500/40 hover:border-amber-400';

              return (
                <button
                  key={bolId}
                  onClick={() => handleAuditionBol(bolId)}
                  title={def.description}
                  className={`p-3 rounded-xl border bg-slate-950/80 text-left transition transform ${borderClass} ${
                    isTriggered ? 'scale-95 ring-2 ring-orange-400 bg-slate-900' : ''
                  }`}
                >
                  <div className="flex items-baseline justify-between">
                    <span className="text-base font-bold text-white">
                      {def.roman}
                    </span>
                    <span className="text-sm font-semibold text-slate-400">
                      {def.devanagari}
                    </span>
                  </div>
                  <div className="mt-1 text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                    {MADAL_STROKE_NAMES[bolId] ?? def.roman} •{' '}
                    {def.head === 'both' ? 'both heads' : def.head}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Main Workspace: MadalCode Editor (Left) + Radial Clock & Step Sequencer (Right) */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: MadalCode DSL Editor & Diagnostics */}
          <div className="lg:col-span-5 flex flex-col bg-slate-900/60 border border-slate-800/90 rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
                <FileCode2 className="w-4 h-4 text-orange-400" />
                MadalCode DSL Source (.madal)
              </div>
              <div className="flex items-center gap-1.5">
                {validation.valid ? (
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Valid AST
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs text-rose-400 font-medium">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {validation.errors.length} Error(s)
                  </span>
                )}
              </div>
            </div>

            <textarea
              value={sourceCode}
              onChange={(e) => setSourceCode(e.target.value)}
              spellCheck={false}
              rows={14}
              className="w-full flex-1 bg-slate-950/90 text-slate-100 font-mono text-sm p-4 focus:outline-none resize-y leading-relaxed"
              placeholder="Write MadalCode notation here..."
            />

            {/* Quick Bol Insert Bar */}
            <div className="px-4 py-2.5 bg-slate-950/60 border-t border-slate-800/80 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-slate-400 mr-1">Append Bol:</span>
              {PLAYABLE_PAD_BOLS.map((bolId) => (
                <button
                  key={bolId}
                  onClick={() => handleInsertBol(bolId)}
                  className="px-2 py-1 text-xs font-mono rounded bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/70 transition"
                >
                  +{bolId}
                </button>
              ))}
            </div>

            {/* Compiler Statistics & Diagnostics Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/80 space-y-2 text-xs">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-slate-900/90 rounded-lg p-2 border border-slate-800">
                  <div className="text-slate-400 text-[11px]">Bars / Beats</div>
                  <div className="font-bold text-white text-sm">
                    {validation.stats.totalExpandedBars} / {validation.stats.totalBeats}
                  </div>
                </div>
                <div className="bg-slate-900/90 rounded-lg p-2 border border-slate-800">
                  <div className="text-orange-300 text-[11px]">Bhale (Bass)</div>
                  <div className="font-bold text-orange-400 text-sm">
                    {validation.stats.bhaleStrokes} strokes
                  </div>
                </div>
                <div className="bg-slate-900/90 rounded-lg p-2 border border-slate-800">
                  <div className="text-teal-300 text-[11px]">Pothi (Treble)</div>
                  <div className="font-bold text-teal-400 text-sm">
                    {validation.stats.pothiStrokes} strokes
                  </div>
                </div>
              </div>

              {(validation.errors.length > 0 || validation.warnings.length > 0) && (
                <div className="space-y-1 pt-2">
                  {validation.errors.map((err, i) => (
                    <div
                      key={`err-${i}`}
                      className="text-rose-300 bg-rose-950/50 border border-rose-800/60 rounded px-2.5 py-1.5"
                    >
                      Line {err.line}: {err.message}
                    </div>
                  ))}
                  {validation.warnings.map((warn, i) => (
                    <div
                      key={`warn-${i}`}
                      className="text-amber-300 bg-amber-950/40 border border-amber-800/50 rounded px-2.5 py-1.5"
                    >
                      Line {warn.line}: {warn.message}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Radial Taal Rhythm Clock + Interactive Step Grid */}
          <div className="lg:col-span-7 space-y-6">
            {/* Concentric Radial Taal Clock */}
            <div className="bg-slate-900/60 border border-slate-800/90 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-6">
              <div
                className="w-64 h-64 sm:w-72 sm:h-72 shrink-0 flex items-center justify-center"
                dangerouslySetInnerHTML={{ __html: radialClockSvg }}
              />
              <div className="space-y-3 text-sm">
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-orange-400">
                  <Sparkles className="w-3.5 h-3.5" />
                  Concentric Radial Rhythm Clock
                </div>
                <h2 className="text-xl font-bold text-white">
                  {ast.metadata.title}
                </h2>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Nepali folk <em>Taals</em> are cyclical—every cycle departs from and resolves back to{' '}
                  <strong className="text-amber-300">Sam (Beat 1)</strong>. The outer terracotta ring maps{' '}
                  <strong className="text-orange-300">Bhale (left bass)</strong> resonance, while the inner teal ring maps{' '}
                  <strong className="text-teal-300">Pothi (right treble)</strong> articulations.
                </p>
                <div className="pt-1 flex flex-wrap gap-2 text-xs">
                  <span className="px-2.5 py-1 rounded-md bg-slate-950 border border-slate-800 text-slate-300">
                    Meter: <strong>{ast.metadata.meter.beatsPerBar}/{ast.metadata.meter.beatUnit}</strong>
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-slate-950 border border-slate-800 text-slate-300">
                    Tali (Clap): <strong>Beats {ast.metadata.taliBeats.join(', ')}</strong>
                  </span>
                  {ast.metadata.khaliBeats.length > 0 && (
                    <span className="px-2.5 py-1 rounded-md bg-slate-950 border border-slate-800 text-slate-300">
                      Khali (Wave): <strong>Beats {ast.metadata.khaliBeats.join(', ')}</strong>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Live Timeline Step Sequencer Grid */}
            <div className="bg-slate-900/60 border border-slate-800/90 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
                  <Activity className="w-4 h-4 text-teal-400" />
                  Live Dual-Head Sequencer Timeline (Click Any Step to Audition)
                </div>
                <span className="text-xs text-slate-400">
                  {timeline.length} total steps ({validation.stats.durationSeconds}s loop)
                </span>
              </div>

              <div className="overflow-x-auto pb-2">
                <div className="inline-flex gap-1.5 min-w-full">
                  {timeline.map((ev, idx) => {
                    const isCurrent = activeEventIdx === idx;
                    const label = formatBolLabel(ev.token, scriptMode);

                    return (
                      <button
                        key={idx}
                        onClick={() =>
                           getAudioEngine().triggerBolToken(
                            ev.token,
                            undefined,
                            ev.velocity
                          )
                        }
                        className={`min-w-[60px] rounded-xl p-2 border flex flex-col items-center gap-1.5 transition ${
                          isCurrent
                            ? 'bg-orange-500/20 border-orange-400 ring-2 ring-orange-400/50'
                            : 'bg-slate-950/75 border-slate-800/90 hover:border-slate-700'
                        }`}
                      >
                        <span className="text-[10px] font-mono text-slate-400">
                          {ev.barIndex}.{ev.beatInBar}
                          {ev.totalSubdivisions > 1 ? `.${ev.subdivisionIndex + 1}` : ''}
                        </span>

                        <span className="text-xs font-bold text-white">
                          {label}
                        </span>

                        {/* Pothi (Treble) indicator */}
                        <span
                          className={`w-6 h-5 rounded text-[10px] font-bold flex items-center justify-center ${
                            ev.token.pothi
                              ? 'bg-teal-500/25 text-teal-300 border border-teal-500/50'
                              : 'bg-slate-900 text-slate-700'
                          }`}
                        >
                          {ev.token.pothi ? ev.token.pothi.stroke : '·'}
                        </span>

                        {/* Bhale (Bass) indicator */}
                        <span
                          className={`w-6 h-5 rounded text-[10px] font-bold flex items-center justify-center ${
                            ev.token.bhale
                              ? 'bg-orange-500/25 text-orange-300 border border-orange-500/50'
                              : 'bg-slate-900 text-slate-700'
                          }`}
                        >
                          {ev.token.bhale ? ev.token.bhale.stroke : '·'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Generated Dual-Track SVG Sheet Tablature Preview */}
        <section className="bg-slate-900/60 border border-slate-800/90 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
              <Music className="w-4 h-4 text-orange-400" />
              Compiled Dual-Track Percussion Sheet Music (SVG Output)
            </div>
            <span className="text-xs text-slate-400">
              Auto-compiled from <code className="text-orange-300">@open-madal/core</code>
            </span>
          </div>
          <div
            className="overflow-x-auto rounded-xl border border-slate-800 bg-[#0f172a] p-2"
            dangerouslySetInnerHTML={{ __html: linearTabSvg }}
          />
        </section>
      </main>
    </div>
  );
}
