'use client';

import React from 'react';
import { HeadStrokeSpec } from '@open-madal/core';

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
 * Realistic Dual-Head Nepali Madal & Hand/Finger Articulation Visualizer.
 *
 * Models the physical hand and finger mechanics of traditional Madal playing:
 * - Bhale (Left / Large Bass Head):
 *   • Ghin (Open): All 4 fingers together strike and immediately bounce off so the membrane rings.
 *   • Kha (Closed): Middle, ring & little fingers press onto the black khari and stay down to damp.
 * - Pothi (Right / Small Treble Head):
 *   • Taang / Naa (Open / Rim): Index finger strikes the khari edge and lifts off for a bright ring.
 *   • Taak / Ra (Closed): Middle, ring & little fingers strike the khari center and stay pressed down.
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
    ? `Kha (ख) • 3 fingers press & hold on khari`
    : `Ghin (घिं) • 4 fingers strike & bounce off`;

  const pothiTechniqueText = !pothiIsActive
    ? 'Ready • Right Hand (Index / 3 fingers)'
    : pothiIsClosed
    ? `Taak (तक्) • Middle+Ring+Pinky press khari`
    : `Taang (तां) • Index finger strikes & lifts off`;

  return (
    <div className="bg-slate-900/60 border border-slate-800/90 rounded-2xl p-4 space-y-3 overflow-hidden">
      <style>{`
        @keyframes bhaleOpenBounce {
          0%   { transform: translate(0px, 0px) rotate(0deg) scale(1); }
          18%  { transform: translate(26px, 16px) rotate(-9deg) scale(0.95); }
          42%  { transform: translate(-8px, -10px) rotate(5deg) scale(1.03); }
          70%  { transform: translate(-3px, -4px) rotate(2deg) scale(1.01); }
          100% { transform: translate(0px, 0px) rotate(0deg) scale(1); }
        }
        @keyframes bhaleClosedPress {
          0%   { transform: translate(0px, 0px) rotate(0deg) scale(1); }
          16%  { transform: translate(30px, 20px) rotate(-12deg) scale(0.93); }
          68%  { transform: translate(28px, 18px) rotate(-10deg) scale(0.94); }
          100% { transform: translate(0px, 0px) rotate(0deg) scale(1); }
        }
        @keyframes pothiIndexBounce {
          0%   { transform: translate(0px, 0px) rotate(0deg) scale(1); }
          16%  { transform: translate(-26px, 16px) rotate(10deg) scale(0.95); }
          40%  { transform: translate(9px, -11px) rotate(-6deg) scale(1.03); }
          70%  { transform: translate(3px, -4px) rotate(-2deg) scale(1.01); }
          100% { transform: translate(0px, 0px) rotate(0deg) scale(1); }
        }
        @keyframes pothiClosedPress {
          0%   { transform: translate(0px, 0px) rotate(0deg) scale(1); }
          16%  { transform: translate(-30px, 20px) rotate(12deg) scale(0.93); }
          68%  { transform: translate(-27px, 18px) rotate(10deg) scale(0.94); }
          100% { transform: translate(0px, 0px) rotate(0deg) scale(1); }
        }
        @keyframes headMembraneRing {
          0%   { transform: scale(1); opacity: 0.95; }
          15%  { transform: scale(0.96); opacity: 1; }
          40%  { transform: scale(1.03); opacity: 0.9; }
          70%  { transform: scale(0.99); opacity: 0.6; }
          100% { transform: scale(1); opacity: 0.35; }
        }
        @keyframes soundWaveExpand {
          0%   { r: 28px; opacity: 0.85; stroke-width: 3.5px; }
          100% { r: 84px; opacity: 0; stroke-width: 0.5px; }
        }
        @keyframes dampedFlash {
          0%   { opacity: 0.85; transform: scale(0.92); }
          35%  { opacity: 0.65; transform: scale(1.02); }
          100% { opacity: 0; transform: scale(1); }
        }
      `}</style>

      {/* Top Bar: Title & Active Stroke Pill */}
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

      {/* Main SVG Stage: Left Bhale Head + Wooden Ghar Body + Right Pothi Head + Articulated Hands */}
      <div className="relative rounded-xl bg-gradient-to-b from-[#0b1120] via-[#0f172a] to-[#0b1120] border border-slate-800/90 p-2">
        <svg
          viewBox="0 0 880 300"
          className="w-full h-auto max-h-[290px] select-none overflow-visible"
          role="img"
          aria-label="Interactive Nepali Madal drum with animated left and right hands"
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

            {/* Parchment Drum Skin Gradient */}
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

            {/* Realistic Warm Hand Skin Gradient */}
            <linearGradient id="handSkinLeft" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f5cba7" />
              <stop offset="55%" stopColor="#e59866" />
              <stop offset="100%" stopColor="#ca6f1e" />
            </linearGradient>

            <linearGradient id="handSkinRight" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f5cba7" />
              <stop offset="55%" stopColor="#e59866" />
              <stop offset="100%" stopColor="#ca6f1e" />
            </linearGradient>

            {/* Soft drop shadow for hands */}
            <filter id="handShadow" x="-25%" y="-25%" width="150%" height="150%">
              <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#020617" floodOpacity="0.65" />
            </filter>
          </defs>

          {/* ================================================================= */}
          {/* CENTER: CARVED WOODEN MADAL BODY (GHAR) & LEATHER STRAPS (TANA)   */}
          {/* ================================================================= */}
          <g>
            {/* Floor shadow */}
            <ellipse cx="440" cy="262" rx="220" ry="18" fill="#020617" opacity="0.65" />

            {/* Tapered cylindrical wooden barrel (larger on left for Bhale, slightly narrower on right for Pothi) */}
            <path
              d="M 272 68 Q 440 54 608 78 L 608 222 Q 440 246 272 232 Z"
              fill="url(#madalWoodGrad)"
              stroke="#451a03"
              strokeWidth="2.5"
            />

            {/* Decorative carved wooden ridges around the barrel waist */}
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

            {/* Crisscross leather tension straps (Tana / Dori) */}
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
                {/* Wooden tuning blocks (Gola) wedged under the straps */}
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

            {/* Braided leather end-hoops (Mathi) */}
            <rect x="264" y="64" width="14" height="172" rx="6" fill="#92400e" stroke="#fef3c7" strokeWidth="1.2" />
            <rect x="602" y="74" width="14" height="152" rx="6" fill="#92400e" stroke="#fef3c7" strokeWidth="1.2" />

            {/* Center label on the wooden barrel */}
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
            {/* Outer braided rim hoop */}
            <circle
              cx="155"
              cy="150"
              r="92"
              fill="#78350f"
              stroke={bhaleIsActive ? '#f97316' : '#b45309'}
              strokeWidth={bhaleIsActive ? '4' : '2.5'}
            />

            {/* Vibrating leather membrane + Khari paste */}
            <g
              key={`bhale-head-${bhaleStrike?.seq ?? 0}`}
              style={{
                transformOrigin: '155px 150px',
                animation:
                  bhaleIsActive && !bhaleIsClosed
                    ? 'headMembraneRing 480ms cubic-bezier(0.22, 1, 0.36, 1)'
                    : undefined,
              }}
            >
              {/* Parchment skin */}
              <circle
                cx="155"
                cy="150"
                r="82"
                fill="url(#skinParchmentBhale)"
                stroke="#92400e"
                strokeWidth="2"
              />

              {/* Radial stitching marks around hoop */}
              {Array.from({ length: 16 }).map((_, idx) => {
                const a = (idx / 16) * Math.PI * 2;
                return (
                  <line
                    key={`b-stitch-${idx}`}
                    x1={155 + Math.cos(a) * 76}
                    y1={150 + Math.sin(a) * 76}
                    x2={155 + Math.cos(a) * 89}
                    y2={150 + Math.sin(a) * 89}
                    stroke="#78350f"
                    strokeWidth="2"
                  />
                );
              })}

              {/* Black circular Khari paste (large bass head) */}
              <circle
                cx="155"
                cy="150"
                r="49"
                fill="url(#khariPasteGrad)"
                stroke="#1e293b"
                strokeWidth="1.5"
              />
              {/* Subtle khari grain rings */}
              <circle
                cx="155"
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
                  cx="155"
                  cy="150"
                  r="34"
                  fill="none"
                  stroke="#f97316"
                  style={{ animation: 'soundWaveExpand 620ms ease-out forwards' }}
                />
                <circle
                  cx="155"
                  cy="150"
                  r="26"
                  fill="none"
                  stroke="#fb923c"
                  style={{ animation: 'soundWaveExpand 620ms ease-out 90ms forwards' }}
                />
              </g>
            )}

            {/* Closed Kha damped press indicator on the Khari */}
            {bhaleIsActive && bhaleIsClosed && (
              <circle
                key={`bhale-damp-${bhaleStrike?.seq}`}
                cx="155"
                cy="150"
                r="47"
                fill="#f97316"
                fillOpacity="0.32"
                stroke="#fb923c"
                strokeWidth="2.5"
                style={{
                  transformOrigin: '155px 150px',
                  animation: 'dampedFlash 420ms ease-out forwards',
                }}
              />
            )}

            {/* Head label below */}
            <text x="155" y="264" textAnchor="middle" fill="#fdba74" fontSize="12" fontWeight="700">
              BHALE (भाले • Large Bass Head)
            </text>
            <text x="155" y="280" textAnchor="middle" fill="#94a3b8" fontSize="11">
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
            {/* Outer braided rim hoop (slightly smaller diameter than Bhale) */}
            <circle
              cx="725"
              cy="150"
              r="80"
              fill="#78350f"
              stroke={pothiIsActive ? '#14b8a6' : '#b45309'}
              strokeWidth={pothiIsActive ? '4' : '2.5'}
            />

            {/* Vibrating leather membrane + Khari paste */}
            <g
              key={`pothi-head-${pothiStrike?.seq ?? 0}`}
              style={{
                transformOrigin: '725px 150px',
                animation:
                  pothiIsActive && !pothiIsClosed
                    ? 'headMembraneRing 430ms cubic-bezier(0.22, 1, 0.36, 1)'
                    : undefined,
              }}
            >
              {/* Parchment skin */}
              <circle
                cx="725"
                cy="150"
                r="70"
                fill="url(#skinParchmentPothi)"
                stroke="#92400e"
                strokeWidth="2"
              />

              {/* Radial stitching marks around hoop */}
              {Array.from({ length: 16 }).map((_, idx) => {
                const a = (idx / 16) * Math.PI * 2;
                return (
                  <line
                    key={`p-stitch-${idx}`}
                    x1={725 + Math.cos(a) * 64}
                    y1={150 + Math.sin(a) * 64}
                    x2={725 + Math.cos(a) * 77}
                    y2={150 + Math.sin(a) * 77}
                    stroke="#78350f"
                    strokeWidth="2"
                  />
                );
              })}

              {/* Black circular Khari paste (small treble head) */}
              <circle
                cx="725"
                cy="150"
                r="42"
                fill="url(#khariPasteGrad)"
                stroke="#1e293b"
                strokeWidth="1.5"
              />
              <circle
                cx="725"
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
                  cx="725"
                  cy="150"
                  r="28"
                  fill="none"
                  stroke="#14b8a6"
                  style={{ animation: 'soundWaveExpand 560ms ease-out forwards' }}
                />
                <circle
                  cx="725"
                  cy="150"
                  r="20"
                  fill="none"
                  stroke="#2dd4bf"
                  style={{ animation: 'soundWaveExpand 560ms ease-out 80ms forwards' }}
                />
              </g>
            )}

            {/* Closed Taak damped press indicator on the Khari */}
            {pothiIsActive && pothiIsClosed && (
              <circle
                key={`pothi-damp-${pothiStrike?.seq}`}
                cx="725"
                cy="150"
                r="40"
                fill="#14b8a6"
                fillOpacity="0.32"
                stroke="#2dd4bf"
                strokeWidth="2.5"
                style={{
                  transformOrigin: '725px 150px',
                  animation: 'dampedFlash 400ms ease-out forwards',
                }}
              />
            )}

            {/* Head label below */}
            <text x="725" y="264" textAnchor="middle" fill="#5eead4" fontSize="12" fontWeight="700">
              POTHI (पोथी • Small Treble Head)
            </text>
            <text x="725" y="280" textAnchor="middle" fill="#94a3b8" fontSize="11">
              {pothiTechniqueText}
            </text>
          </g>

          {/* ================================================================= */}
          {/* ANIMATED LEFT HAND (BHALE): 4-FINGER GHIN BOUNCE vs KHA PRESS     */}
          {/* ================================================================= */}
          <g
            key={`left-hand-${bhaleStrike?.seq ?? 0}`}
            filter="url(#handShadow)"
            className="pointer-events-none"
            style={{
              transformOrigin: '60px 120px',
              animation: !bhaleIsActive
                ? undefined
                : bhaleIsClosed
                ? 'bhaleClosedPress 420ms cubic-bezier(0.22, 1, 0.36, 1)'
                : 'bhaleOpenBounce 420ms cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          >
            {/* Left Wrist & Palm */}
            <path
              d="M 10 108 Q 38 92 68 96 C 84 98 95 114 94 140 C 93 162 80 176 58 176 L 12 166 Z"
              fill="url(#handSkinLeft)"
              stroke="#9a3412"
              strokeWidth="1.4"
            />
            {/* Thumb tucked upward outside the rim (never strikes in Ghin/Kha) */}
            <path
              d="M 55 96 Q 74 72 95 70 C 103 70 106 79 98 86 Q 82 96 68 104 Z"
              fill="url(#handSkinLeft)"
              stroke="#9a3412"
              strokeWidth="1.3"
            />

            {/* Index Finger (lifts slightly on closed Kha, joins all 4 fingers on open Ghin) */}
            <g
              style={{
                transformOrigin: '88px 108px',
                transform: bhaleIsActive && bhaleIsClosed ? 'translate(-8px, -7px) rotate(-12deg)' : 'none',
                transition: 'transform 90ms ease-out',
              }}
            >
              <rect
                x="84"
                y="101"
                width="54"
                height="13"
                rx="6.5"
                transform="rotate(4 84 101)"
                fill="url(#handSkinLeft)"
                stroke="#9a3412"
                strokeWidth="1.3"
              />
              {/* Fingernail / tip */}
              <circle cx="133" cy="110" r="4" fill="#fdebd0" opacity="0.75" />
            </g>

            {/* Middle Finger */}
            <rect
              x="86"
              y="117"
              width="60"
              height="13.5"
              rx="6.5"
              transform="rotate(6 86 117)"
              fill="url(#handSkinLeft)"
              stroke="#9a3412"
              strokeWidth="1.3"
            />
            <circle cx="141" cy="128" r="4" fill="#fdebd0" opacity="0.75" />

            {/* Ring Finger */}
            <rect
              x="84"
              y="134"
              width="55"
              height="13"
              rx="6.5"
              transform="rotate(8 84 134)"
              fill="url(#handSkinLeft)"
              stroke="#9a3412"
              strokeWidth="1.3"
            />
            <circle cx="134" cy="146" r="3.8" fill="#fdebd0" opacity="0.75" />

            {/* Little (Pinky) Finger */}
            <rect
              x="78"
              y="150"
              width="45"
              height="11.5"
              rx="5.5"
              transform="rotate(11 78 150)"
              fill="url(#handSkinLeft)"
              stroke="#9a3412"
              strokeWidth="1.3"
            />
            <circle cx="118" cy="162" r="3.4" fill="#fdebd0" opacity="0.75" />

            {/* Strike badge above left hand when active */}
            {bhaleIsActive && (
              <g transform="translate(88, 52)">
                <rect
                  x="-36"
                  y="-16"
                  width="92"
                  height="22"
                  rx="11"
                  fill="#0f172a"
                  stroke="#f97316"
                  strokeWidth="1.5"
                />
                <text x="10" y="-1" textAnchor="middle" fill="#fed7aa" fontSize="11" fontWeight="700">
                  {bhaleIsClosed ? 'ख Kha (Closed)' : 'घिं Ghin (Open)'}
                </text>
              </g>
            )}
          </g>

          {/* ================================================================= */}
          {/* ANIMATED RIGHT HAND (POTHI): INDEX TAANG vs 3-FINGER TAAK         */}
          {/* ================================================================= */}
          <g
            key={`right-hand-${pothiStrike?.seq ?? 0}`}
            filter="url(#handShadow)"
            className="pointer-events-none"
            style={{
              transformOrigin: '820px 120px',
              animation: !pothiIsActive
                ? undefined
                : pothiIsClosed
                ? 'pothiClosedPress 400ms cubic-bezier(0.22, 1, 0.36, 1)'
                : 'pothiIndexBounce 400ms cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          >
            {/* Right Wrist & Palm */}
            <path
              d="M 870 108 Q 842 92 812 96 C 796 98 785 114 786 140 C 787 162 800 176 822 176 L 868 166 Z"
              fill="url(#handSkinRight)"
              stroke="#9a3412"
              strokeWidth="1.4"
            />
            {/* Right Thumb resting above */}
            <path
              d="M 825 96 Q 806 72 785 70 C 777 70 774 79 782 86 Q 798 96 812 104 Z"
              fill="url(#handSkinRight)"
              stroke="#9a3412"
              strokeWidth="1.3"
            />

            {/* INDEX FINGER: Primary striking finger for Open Taang (curls back on Closed Taak) */}
            <g
              style={{
                transformOrigin: '792px 108px',
                transform:
                  pothiIsActive && pothiIsClosed
                    ? 'translate(14px, -9px) rotate(16deg)'
                    : pothiIsActive && !pothiIsClosed
                    ? 'translate(-8px, 4px) rotate(-6deg)'
                    : 'none',
                transition: 'transform 80ms ease-out',
              }}
            >
              <rect
                x="738"
                y="101"
                width="58"
                height="13.5"
                rx="6.5"
                transform="rotate(-4 796 101)"
                fill="url(#handSkinRight)"
                stroke={pothiIsActive && !pothiIsClosed ? '#2dd4bf' : '#9a3412'}
                strokeWidth={pothiIsActive && !pothiIsClosed ? '2' : '1.3'}
              />
              <circle cx="744" cy="109" r="4.2" fill="#fdebd0" opacity="0.85" />
            </g>

            {/* MIDDLE + RING + LITTLE FINGERS: Primary striking group for Closed Taak (curl back slightly on Open Taang) */}
            <g
              style={{
                transformOrigin: '794px 138px',
                transform:
                  pothiIsActive && !pothiIsClosed
                    ? 'translate(14px, 4px) rotate(-8deg)'
                    : pothiIsActive && pothiIsClosed
                    ? 'translate(-8px, 2px) rotate(4deg)'
                    : 'none',
                transition: 'transform 80ms ease-out',
              }}
            >
              {/* Middle Finger */}
              <rect
                x="734"
                y="117"
                width="60"
                height="13.5"
                rx="6.5"
                transform="rotate(-6 794 117)"
                fill="url(#handSkinRight)"
                stroke={pothiIsActive && pothiIsClosed ? '#2dd4bf' : '#9a3412'}
                strokeWidth={pothiIsActive && pothiIsClosed ? '1.8' : '1.3'}
              />
              <circle cx="740" cy="126" r="4" fill="#fdebd0" opacity="0.75" />

              {/* Ring Finger */}
              <rect
                x="741"
                y="134"
                width="55"
                height="13"
                rx="6.5"
                transform="rotate(-8 796 134)"
                fill="url(#handSkinRight)"
                stroke={pothiIsActive && pothiIsClosed ? '#2dd4bf' : '#9a3412'}
                strokeWidth={pothiIsActive && pothiIsClosed ? '1.8' : '1.3'}
              />
              <circle cx="747" cy="144" r="3.8" fill="#fdebd0" opacity="0.75" />

              {/* Little (Pinky) Finger */}
              <rect
                x="755"
                y="150"
                width="45"
                height="11.5"
                rx="5.5"
                transform="rotate(-11 800 150)"
                fill="url(#handSkinRight)"
                stroke={pothiIsActive && pothiIsClosed ? '#2dd4bf' : '#9a3412'}
                strokeWidth={pothiIsActive && pothiIsClosed ? '1.8' : '1.3'}
              />
              <circle cx="761" cy="160" r="3.4" fill="#fdebd0" opacity="0.75" />
            </g>

            {/* Strike badge above right hand when active */}
            {pothiIsActive && (
              <g transform="translate(765, 52)">
                <rect
                  x="-46"
                  y="-16"
                  width="96"
                  height="22"
                  rx="11"
                  fill="#0f172a"
                  stroke="#14b8a6"
                  strokeWidth="1.5"
                />
                <text x="2" y="-1" textAnchor="middle" fill="#99f6e4" fontSize="11" fontWeight="700">
                  {pothiIsClosed ? 'तक् Taak (Closed)' : 'तां Taang (Open)'}
                </text>
              </g>
            )}
          </g>
        </svg>
      </div>
    </div>
  );
}
