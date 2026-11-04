'use client';

import React from 'react';

export interface HeadStrikeAnimationState {
  /** Monotonically increasing counter so consecutive identical strokes retrigger CSS keyframes */
  seq: number;
  stroke: string;
  articulation: 'open' | 'closed' | 'rim' | 'pitch-bend';
  velocity: number;
  bolLabel: string;
  devanagariLabel: string;
}

interface MadalHandAnimatorProps {
  bhaleStrike: HeadStrikeAnimationState | null;
  pothiStrike: HeadStrikeAnimationState | null;
  activeBolLabel?: string;
  activeDevanagari?: string;
  onStrikeHead?: (head: 'bhale' | 'pothi', closed: boolean) => void;
}

/**
 * Clean Anatomical Outline Hand & Dual-Head Nepali Madal Visualizer.
 *
 * Uses a continuous vector line-art hand silhouette with active finger highlights
 * and contact-point markers on the Bhale (left bass) and Pothi (right treble) heads:
 * - Bhale (Left):
 *   • Ghin (Open): All 4 fingers strike & bounce off.
 *   • Kha (Closed): Middle, ring & little fingers press & hold on the khari.
 * - Pothi (Right):
 *   • Taang / Naa (Open): Index finger strikes the khari edge & lifts off.
 *   • Taak / Ra (Closed): Middle, ring & little fingers press & hold on the khari.
 */
export function MadalHandAnimator({
  bhaleStrike,
  pothiStrike,
  activeBolLabel,
  activeDevanagari,
  onStrikeHead,
}: MadalHandAnimatorProps) {
  const bhaleIsClosed = bhaleStrike?.articulation === 'closed';
  const bhaleIsActive = Boolean(bhaleStrike && bhaleStrike.seq > 0);

  const pothiIsClosed = pothiStrike?.articulation === 'closed';
  const pothiIsActive = Boolean(pothiStrike && pothiStrike.seq > 0);

  const bhaleTechniqueText = !bhaleIsActive
    ? 'Ready • Left Hand (4 fingers)'
    : bhaleIsClosed
    ? 'Kha (ख) • 3 fingers press & mute khari'
    : 'Ghin (घिं) • 4 fingers strike & bounce off';

  const pothiTechniqueText = !pothiIsActive
    ? 'Ready • Right Hand (Index / 3 fingers)'
    : pothiIsClosed
    ? 'Taak (तक्) • 3 fingers press & mute khari'
    : 'Taang (तां) • Index finger strikes & lifts off';

  return (
    <div className="bg-slate-900/60 border border-slate-800/90 rounded-2xl p-4 space-y-3 overflow-hidden">
      <style>{`
        @keyframes bhaleOpenBounce {
          0%   { transform: translate(0px, 0px) rotate(0deg); }
          18%  { transform: translate(22px, 10px) rotate(-5deg); }
          45%  { transform: translate(-6px, -6px) rotate(3deg); }
          100% { transform: translate(0px, 0px) rotate(0deg); }
        }
        @keyframes bhaleClosedPress {
          0%   { transform: translate(0px, 0px) rotate(0deg); }
          16%  { transform: translate(25px, 12px) rotate(-7deg); }
          70%  { transform: translate(23px, 11px) rotate(-6deg); }
          100% { transform: translate(0px, 0px) rotate(0deg); }
        }
        @keyframes pothiOpenBounce {
          0%   { transform: translate(0px, 0px) rotate(0deg); }
          18%  { transform: translate(-22px, 10px) rotate(5deg); }
          45%  { transform: translate(6px, -6px) rotate(-3deg); }
          100% { transform: translate(0px, 0px) rotate(0deg); }
        }
        @keyframes pothiClosedPress {
          0%   { transform: translate(0px, 0px) rotate(0deg); }
          16%  { transform: translate(-25px, 12px) rotate(7deg); }
          70%  { transform: translate(-23px, 11px) rotate(6deg); }
          100% { transform: translate(0px, 0px) rotate(0deg); }
        }
        @keyframes headMembraneRing {
          0%   { transform: scale(1); }
          18%  { transform: scale(0.965); }
          45%  { transform: scale(1.025); }
          75%  { transform: scale(0.992); }
          100% { transform: scale(1); }
        }
        @keyframes soundWaveExpand {
          0%   { r: 28px; opacity: 0.85; stroke-width: 3px; }
          100% { r: 84px; opacity: 0; stroke-width: 0.5px; }
        }
        @keyframes contactPulse {
          0%   { opacity: 1; transform: scale(0.85); }
          30%  { opacity: 0.95; transform: scale(1.1); }
          100% { opacity: 0; transform: scale(1); }
        }
      `}</style>

      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Live Hand &amp; Finger Articulation Stage
          </span>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            (Click heads to strike • Shift+Click for closed Kha/Taak)
          </span>
        </div>

        <div className="flex items-center gap-2">
          {activeBolLabel ? (
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-orange-500/20 border border-orange-500/50 text-orange-200 shadow-sm">
              <span>{activeBolLabel}</span>
              {activeDevanagari && (
                <span className="text-orange-300 font-normal">{activeDevanagari}</span>
              )}
            </span>
          ) : (
            <span className="text-xs text-slate-500">
              Play a Taal or click any pad/drumhead to watch hand mechanics
            </span>
          )}
        </div>
      </div>

      {/* Main SVG Stage */}
      <div className="relative rounded-xl bg-gradient-to-b from-[#0b1120] via-[#0f172a] to-[#0b1120] border border-slate-800/90 p-2">
        <svg
          viewBox="0 0 880 300"
          className="w-full h-auto max-h-[290px] select-none overflow-visible"
          role="img"
          aria-label="Interactive Nepali Madal drum with outline hand articulation"
        >
          <defs>
            {/* Carved Uttis Wood Body Gradient */}
            <linearGradient id="madalWoodGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#7c2d12" />
              <stop offset="28%" stopColor="#b45309" />
              <stop offset="52%" stopColor="#d97706" />
              <stop offset="78%" stopColor="#92400e" />
              <stop offset="100%" stopColor="#451a03" />
            </linearGradient>

            {/* Parchment Drum Skin Gradients */}
            <radialGradient id="skinParchmentBhale" cx="48%" cy="46%" r="52%">
              <stop offset="0%" stopColor="#fef3c7" />
              <stop offset="68%" stopColor="#fde68a" />
              <stop offset="88%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#78350f" />
            </radialGradient>

            <radialGradient id="skinParchmentPothi" cx="52%" cy="46%" r="52%">
              <stop offset="0%" stopColor="#fef3c7" />
              <stop offset="66%" stopColor="#fde68a" />
              <stop offset="87%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#78350f" />
            </radialGradient>

            {/* Black Khari Tuning Paste Gradient */}
            <radialGradient id="khariPasteGrad" cx="42%" cy="38%" r="58%">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="35%" stopColor="#1e293b" />
              <stop offset="80%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#020617" />
            </radialGradient>

            {/* Glow Filter for Active Hand Outline */}
            <filter id="outlineGlowBhale" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="3.5" floodColor="#f97316" floodOpacity="0.7" />
            </filter>
            <filter id="outlineGlowPothi" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="3.5" floodColor="#14b8a6" floodOpacity="0.7" />
            </filter>

            {/* Canonical Right-Pointing Anatomical Hand Silhouette (Origin at palm center 0,0) */}
            <g id="anatomicalHandOutline">
              {/* Outer continuous hand silhouette: wrist -> thumb -> index -> middle -> ring -> pinky -> lower palm */}
              <path
                d="
                  M -62 -18
                  C -44 -20, -28 -22, -14 -28
                  C -4 -33, 6 -46, 16 -52
                  C 24 -56, 31 -50, 26 -42
                  C 20 -33, 8 -24, 4 -18
                  L 52 -16
                  C 60 -16, 60 -5, 52 -4
                  L 14 -2
                  L 60 2
                  C 68 3, 68 14, 60 15
                  L 14 15
                  L 54 20
                  C 62 21, 61 32, 53 32
                  L 10 30
                  L 40 36
                  C 47 38, 45 47, 38 47
                  C 14 45, -12 42, -32 34
                  C -45 29, -54 24, -62 24
                "
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              {/* Subtle internal palm & knuckle crease lines */}
              <path
                d="M -8 -12 Q 2 12 -6 30 M -24 -4 Q -10 8 -18 26"
                fill="none"
                strokeOpacity="0.35"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </g>
          </defs>

          {/* ================================================================= */}
          {/* CENTER: CARVED WOODEN MADAL BODY (GHAR) & LEATHER STRAPS (TANA)   */}
          {/* ================================================================= */}
          <g>
            <ellipse cx="440" cy="262" rx="220" ry="18" fill="#020617" opacity="0.65" />

            <path
              d="M 272 68 Q 440 54 608 78 L 608 222 Q 440 246 272 232 Z"
              fill="url(#madalWoodGrad)"
              stroke="#451a03"
              strokeWidth="2.5"
            />

            <path
              d="M 385 62 Q 392 150 385 238"
              fill="none"
              stroke="#451a03"
              strokeWidth="3"
              opacity="0.55"
            />
            <path
              d="M 495 66 Q 488 150 495 234"
              fill="none"
              stroke="#451a03"
              strokeWidth="3"
              opacity="0.55"
            />

            {[82, 106, 130, 154, 178, 202, 220].map((y, i) => (
              <g key={`strap-${i}`}>
                <line
                  x1="276"
                  y1={y}
                  x2="604"
                  y2={y + (i % 2 === 0 ? 10 : -8)}
                  stroke="#fde68a"
                  strokeWidth="2.4"
                  strokeOpacity="0.72"
                />
                <line
                  x1="276"
                  y1={y + 6}
                  x2="604"
                  y2={y + (i % 2 === 0 ? -6 : 12)}
                  stroke="#92400e"
                  strokeWidth="2"
                  strokeOpacity="0.8"
                />
                {i < 6 && (
                  <rect
                    x={335 + (i % 3) * 32}
                    y={y - 2}
                    width="18"
                    height="9"
                    rx="3"
                    fill="#78350f"
                    stroke="#fef3c7"
                    strokeWidth="0.9"
                  />
                )}
              </g>
            ))}

            <rect x="264" y="64" width="14" height="172" rx="6" fill="#92400e" stroke="#fef3c7" strokeWidth="1.2" />
            <rect x="602" y="74" width="14" height="152" rx="6" fill="#92400e" stroke="#fef3c7" strokeWidth="1.2" />

            <text
              x="440"
              y="146"
              textAnchor="middle"
              fill="#fef3c7"
              fillOpacity="0.85"
              fontSize="13"
              fontWeight="700"
              letterSpacing="1.5"
            >
              मादल • MADAL
            </text>
            <text
              x="440"
              y="165"
              textAnchor="middle"
              fill="#fde68a"
              fillOpacity="0.65"
              fontSize="10"
              fontWeight="600"
            >
              ← BHALE (BASS) • POTHI (TREBLE) →
            </text>
          </g>

          {/* ================================================================= */}
          {/* LEFT DRUMHEAD: BHALE (LARGE BASS HEAD, ~174 Hz)                   */}
          {/* ================================================================= */}
          <g
            className="cursor-pointer"
            onClick={(e) => onStrikeHead?.('bhale', e.shiftKey)}
          >
            <circle
              cx="165"
              cy="150"
              r="92"
              fill="#78350f"
              stroke={bhaleIsActive ? '#f97316' : '#b45309'}
              strokeWidth={bhaleIsActive ? '4' : '2.5'}
            />

            <g
              key={`bhale-head-${bhaleStrike?.seq ?? 0}`}
              style={{
                transformOrigin: '165px 150px',
                animation:
                  bhaleIsActive && !bhaleIsClosed
                    ? 'headMembraneRing 460ms cubic-bezier(0.22, 1, 0.36, 1)'
                    : undefined,
              }}
            >
              <circle
                cx="165"
                cy="150"
                r="82"
                fill="url(#skinParchmentBhale)"
                stroke="#92400e"
                strokeWidth="2"
              />

              {Array.from({ length: 16 }).map((_, idx) => {
                const a = (idx / 16) * Math.PI * 2;
                return (
                  <line
                    key={`b-stitch-${idx}`}
                    x1={165 + Math.cos(a) * 76}
                    y1={150 + Math.sin(a) * 76}
                    x2={165 + Math.cos(a) * 89}
                    y2={150 + Math.sin(a) * 89}
                    stroke="#78350f"
                    strokeWidth="2"
                  />
                );
              })}

              <circle
                cx="165"
                cy="150"
                r="49"
                fill="url(#khariPasteGrad)"
                stroke="#1e293b"
                strokeWidth="1.5"
              />
              <circle
                cx="165"
                cy="150"
                r="36"
                fill="none"
                stroke="#475569"
                strokeWidth="0.8"
                strokeDasharray="3,3"
                opacity="0.55"
              />
            </g>

            {/* Open Ghin acoustic ripples */}
            {bhaleIsActive && !bhaleIsClosed && (
              <g key={`bhale-wave-${bhaleStrike?.seq}`}>
                <circle
                  cx="165"
                  cy="150"
                  r="34"
                  fill="none"
                  stroke="#f97316"
                  style={{ animation: 'soundWaveExpand 600ms ease-out forwards' }}
                />
                <circle
                  cx="165"
                  cy="150"
                  r="24"
                  fill="none"
                  stroke="#fb923c"
                  style={{ animation: 'soundWaveExpand 600ms ease-out 85ms forwards' }}
                />
              </g>
            )}

            {/* Finger impact contact dots on the Bhale Khari when struck */}
            {bhaleIsActive && (
              <g
                key={`bhale-contact-${bhaleStrike?.seq}`}
                style={{
                  transformOrigin: '165px 150px',
                  animation: 'contactPulse 420ms ease-out forwards',
                }}
              >
                {!bhaleIsClosed && (
                  <circle cx="152" cy="126" r="5.5" fill="#fb923c" stroke="#fff7ed" strokeWidth="1.5" />
                )}
                <circle cx="160" cy="141" r="6" fill="#f97316" stroke="#fff7ed" strokeWidth="1.5" />
                <circle cx="156" cy="157" r="5.5" fill="#f97316" stroke="#fff7ed" strokeWidth="1.5" />
                <circle cx="144" cy="171" r="5" fill="#fb923c" stroke="#fff7ed" strokeWidth="1.5" />
              </g>
            )}

            <text x="165" y="264" textAnchor="middle" fill="#fdba74" fontSize="12" fontWeight="700">
              BHALE (भाले • Large Bass Head)
            </text>
            <text x="165" y="280" textAnchor="middle" fill="#94a3b8" fontSize="11">
              {bhaleTechniqueText}
            </text>
          </g>

          {/* ================================================================= */}
          {/* RIGHT DRUMHEAD: POTHI (SMALL TREBLE HEAD, ~266 Hz)                */}
          {/* ================================================================= */}
          <g
            className="cursor-pointer"
            onClick={(e) => onStrikeHead?.('pothi', e.shiftKey)}
          >
            <circle
              cx="715"
              cy="150"
              r="80"
              fill="#78350f"
              stroke={pothiIsActive ? '#14b8a6' : '#b45309'}
              strokeWidth={pothiIsActive ? '4' : '2.5'}
            />

            <g
              key={`pothi-head-${pothiStrike?.seq ?? 0}`}
              style={{
                transformOrigin: '715px 150px',
                animation:
                  pothiIsActive && !pothiIsClosed
                    ? 'headMembraneRing 420ms cubic-bezier(0.22, 1, 0.36, 1)'
                    : undefined,
              }}
            >
              <circle
                cx="715"
                cy="150"
                r="70"
                fill="url(#skinParchmentPothi)"
                stroke="#92400e"
                strokeWidth="2"
              />

              {Array.from({ length: 16 }).map((_, idx) => {
                const a = (idx / 16) * Math.PI * 2;
                return (
                  <line
                    key={`p-stitch-${idx}`}
                    x1={715 + Math.cos(a) * 64}
                    y1={150 + Math.sin(a) * 64}
                    x2={715 + Math.cos(a) * 77}
                    y2={150 + Math.sin(a) * 77}
                    stroke="#78350f"
                    strokeWidth="2"
                  />
                );
              })}

              <circle
                cx="715"
                cy="150"
                r="42"
                fill="url(#khariPasteGrad)"
                stroke="#1e293b"
                strokeWidth="1.5"
              />
              <circle
                cx="715"
                cy="150"
                r="30"
                fill="none"
                stroke="#475569"
                strokeWidth="0.8"
                strokeDasharray="3,3"
                opacity="0.55"
              />
            </g>

            {/* Open Taang acoustic ripples */}
            {pothiIsActive && !pothiIsClosed && (
              <g key={`pothi-wave-${pothiStrike?.seq}`}>
                <circle
                  cx="715"
                  cy="150"
                  r="28"
                  fill="none"
                  stroke="#14b8a6"
                  style={{ animation: 'soundWaveExpand 540ms ease-out forwards' }}
                />
                <circle
                  cx="715"
                  cy="150"
                  r="20"
                  fill="none"
                  stroke="#2dd4bf"
                  style={{ animation: 'soundWaveExpand 540ms ease-out 80ms forwards' }}
                />
              </g>
            )}

            {/* Finger impact contact dots on the Pothi Khari when struck */}
            {pothiIsActive && (
              <g
                key={`pothi-contact-${pothiStrike?.seq}`}
                style={{
                  transformOrigin: '715px 150px',
                  animation: 'contactPulse 400ms ease-out forwards',
                }}
              >
                {!pothiIsClosed ? (
                  /* Open Taang: single index finger strike point near upper khari rim */
                  <circle cx="726" cy="126" r="7" fill="#2dd4bf" stroke="#f0fdfa" strokeWidth="2" />
                ) : (
                  /* Closed Taak: 3-finger (middle, ring, little) mute cluster on khari center */
                  <>
                    <circle cx="718" cy="141" r="6" fill="#14b8a6" stroke="#f0fdfa" strokeWidth="1.5" />
                    <circle cx="722" cy="157" r="5.5" fill="#14b8a6" stroke="#f0fdfa" strokeWidth="1.5" />
                    <circle cx="734" cy="171" r="5" fill="#2dd4bf" stroke="#f0fdfa" strokeWidth="1.5" />
                  </>
                )}
              </g>
            )}

            <text x="715" y="264" textAnchor="middle" fill="#5eead4" fontSize="12" fontWeight="700">
              POTHI (पोथी • Small Treble Head)
            </text>
            <text x="715" y="280" textAnchor="middle" fill="#94a3b8" fontSize="11">
              {pothiTechniqueText}
            </text>
          </g>

          {/* ================================================================= */}
          {/* LEFT HAND OUTLINE (BHALE)                                         */}
          {/* ================================================================= */}
          <g
            key={`left-hand-${bhaleStrike?.seq ?? 0}`}
            className="pointer-events-none"
            style={{
              transformOrigin: '82px 136px',
              animation: !bhaleIsActive
                ? undefined
                : bhaleIsClosed
                ? 'bhaleClosedPress 400ms cubic-bezier(0.22, 1, 0.36, 1)'
                : 'bhaleOpenBounce 400ms cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          >
            <g
              transform="translate(82, 136)"
              fill={bhaleIsActive ? 'rgba(249, 115, 22, 0.14)' : 'rgba(148, 163, 184, 0.07)'}
              stroke={bhaleIsActive ? '#fb923c' : '#94a3b8'}
              strokeWidth={bhaleIsActive ? '2.4' : '1.8'}
              filter={bhaleIsActive ? 'url(#outlineGlowBhale)' : undefined}
            >
              <use href="#anatomicalHandOutline" />

              {/* Highlighted active striking finger tips on Left Hand */}
              {bhaleIsActive && (
                <g stroke="#fff7ed" strokeWidth="1.5" fill="#f97316">
                  {!bhaleIsClosed && <circle cx="52" cy="-10" r="4.2" />}
                  <circle cx="60" cy="8.5" r="4.5" />
                  <circle cx="53" cy="26" r="4.2" />
                  <circle cx="38" cy="41.5" r="3.8" />
                </g>
              )}
            </g>

            {bhaleIsActive && (
              <g transform="translate(86, 48)">
                <rect
                  x="-48"
                  y="-16"
                  width="104"
                  height="22"
                  rx="11"
                  fill="#0f172a"
                  stroke="#f97316"
                  strokeWidth="1.5"
                />
                <text x="4" y="-1" textAnchor="middle" fill="#fed7aa" fontSize="11" fontWeight="700">
                  {bhaleIsClosed ? 'ख Kha • 3 Fingers' : 'घिं Ghin • 4 Fingers'}
                </text>
              </g>
            )}
          </g>

          {/* ================================================================= */}
          {/* RIGHT HAND OUTLINE (POTHI — mirrored horizontally)                */}
          {/* ================================================================= */}
          <g
            key={`right-hand-${pothiStrike?.seq ?? 0}`}
            className="pointer-events-none"
            style={{
              transformOrigin: '798px 136px',
              animation: !pothiIsActive
                ? undefined
                : pothiIsClosed
                ? 'pothiClosedPress 390ms cubic-bezier(0.22, 1, 0.36, 1)'
                : 'pothiOpenBounce 390ms cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          >
            <g
              transform="translate(798, 136) scale(-1, 1)"
              fill={pothiIsActive ? 'rgba(20, 184, 166, 0.14)' : 'rgba(148, 163, 184, 0.07)'}
              stroke={pothiIsActive ? '#2dd4bf' : '#94a3b8'}
              strokeWidth={pothiIsActive ? '2.4' : '1.8'}
              filter={pothiIsActive ? 'url(#outlineGlowPothi)' : undefined}
            >
              <use href="#anatomicalHandOutline" />

              {/* Highlighted active striking finger tips on Right Hand */}
              {pothiIsActive && (
                <g stroke="#f0fdfa" strokeWidth="1.5" fill="#14b8a6">
                  {!pothiIsClosed ? (
                    /* Open Taang: Index fingertip lights up */
                    <circle cx="52" cy="-10" r="5" fill="#2dd4bf" />
                  ) : (
                    /* Closed Taak: Middle + Ring + Little fingertips light up */
                    <>
                      <circle cx="60" cy="8.5" r="4.5" />
                      <circle cx="53" cy="26" r="4.2" />
                      <circle cx="38" cy="41.5" r="3.8" />
                    </>
                  )}
                </g>
              )}
            </g>

            {pothiIsActive && (
              <g transform="translate(794, 48)">
                <rect
                  x="-54"
                  y="-16"
                  width="108"
                  height="22"
                  rx="11"
                  fill="#0f172a"
                  stroke="#14b8a6"
                  strokeWidth="1.5"
                />
                <text x="0" y="-1" textAnchor="middle" fill="#99f6e4" fontSize="11" fontWeight="700">
                  {pothiIsClosed ? 'तक् Taak • 3 Fingers' : 'तां Taang • Index'}
                </text>
              </g>
            )}
          </g>
        </svg>
      </div>
    </div>
  );
}
