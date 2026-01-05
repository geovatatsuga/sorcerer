import React, { useId, useMemo } from 'react';

type Ratio = '21:9' | '4:1';

type Props = {
  ratio?: Ratio;
  heightClassName?: string;
  className?: string;
};

function safeSvgId(raw: string) {
  // React useId() can include ':' which is valid in XML but annoying in url(#...)
  return raw.replace(/[^a-zA-Z0-9_-]/g, '');
}

export default function PageDividerUltrawide({ ratio = '21:9', heightClassName, className }: Props) {
  const uid = safeSvgId(useId());

  const ids = useMemo(
    () => ({
      flowMain: `flowMain_${uid}`,
      flowThin: `flowThin_${uid}`,
      diamondStroke: `diamondStroke_${uid}`,
      diamondCore: `diamondCore_${uid}`,
      glow: `glow_${uid}`,
      dust: `dust_${uid}`,
      dustGrad: `dustGrad_${uid}`,
    }),
    [uid]
  );

  const height = heightClassName || 'h-14 md:h-16';

  // Keep the artwork in a true ultra-wide coordinate space.
  // The rendered element is intentionally a thin horizontal band.
  const W = ratio === '4:1' ? 2000 : 2100;
  const H = ratio === '4:1' ? 500 : 900;
  const cy = H / 2;
  const cx = W / 2;

  // A gentle ribbon path with micro-variation; we render it twice (main + thin).
  // The band occupies ~10–20% of height around the center.
  const leftPath = `M 0 ${cy}
    C ${cx * 0.22} ${cy - 10}, ${cx * 0.38} ${cy + 12}, ${cx - 96} ${cy + 2}`;

  const rightPath = `M ${cx + 96} ${cy + 2}
    C ${cx * 1.62} ${cy + 12}, ${cx * 1.78} ${cy - 10}, ${W} ${cy}`;

  // Secondary (thinner) has tiny phase difference for “alive energy”.
  const leftPath2 = `M 0 ${cy + 3}
    C ${cx * 0.20} ${cy - 6}, ${cx * 0.36} ${cy + 8}, ${cx - 96} ${cy - 1}`;

  const rightPath2 = `M ${cx + 96} ${cy - 1}
    C ${cx * 1.64} ${cy + 8}, ${cx * 1.80} ${cy - 6}, ${W} ${cy + 3}`;

  // A small set of deterministic dust points (denser near center).
  const dust = [
    { x: cx - 260, y: cy - 22, r: 1.0, o: 0.55, d: 4.4, b: -0.8 },
    { x: cx - 210, y: cy + 18, r: 0.9, o: 0.45, d: 3.3, b: -1.6 },
    { x: cx - 160, y: cy - 6, r: 0.8, o: 0.52, d: 5.1, b: -2.1 },
    { x: cx - 120, y: cy + 28, r: 1.1, o: 0.40, d: 2.8, b: -0.4 },
    { x: cx - 70, y: cy - 18, r: 0.9, o: 0.62, d: 5.7, b: -1.1 },
    { x: cx - 30, y: cy + 10, r: 0.7, o: 0.38, d: 3.9, b: -0.2 },
    { x: cx + 30, y: cy - 10, r: 0.7, o: 0.42, d: 4.8, b: -1.9 },
    { x: cx + 78, y: cy + 22, r: 0.9, o: 0.50, d: 3.6, b: -0.9 },
    { x: cx + 130, y: cy - 28, r: 1.0, o: 0.46, d: 5.4, b: -1.4 },
    { x: cx + 176, y: cy + 6, r: 0.8, o: 0.58, d: 2.9, b: -0.6 },
    { x: cx + 220, y: cy - 14, r: 0.9, o: 0.44, d: 4.2, b: -1.2 },
    { x: cx + 270, y: cy + 20, r: 1.1, o: 0.36, d: 5.9, b: -0.3 },
  ];

  return (
    <div className={`w-full ${height} ${className || ''}`} aria-hidden>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid slice"
        style={{ display: 'block', background: 'transparent', pointerEvents: 'none' }}
      >
        <defs>
          {/* Premium gold palette */}
          <linearGradient id={ids.flowMain} x1="0" y1={cy} x2={W} y2={cy} gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#a8782a" stopOpacity="0.05" />
            <stop offset="18%" stopColor="#f5d77a" stopOpacity="0.30" />
            <stop offset="34%" stopColor="#fff3c4" stopOpacity="0.65" />
            <stop offset="50%" stopColor="#ffd36b" stopOpacity="0.90" />
            <stop offset="66%" stopColor="#fff3c4" stopOpacity="0.65" />
            <stop offset="82%" stopColor="#f5d77a" stopOpacity="0.30" />
            <stop offset="100%" stopColor="#a8782a" stopOpacity="0.05" />
          </linearGradient>

          <linearGradient id={ids.flowThin} x1="0" y1={cy} x2={W} y2={cy} gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#caa24a" stopOpacity="0.04" />
            <stop offset="22%" stopColor="#ffd36b" stopOpacity="0.22" />
            <stop offset="50%" stopColor="#fff3c4" stopOpacity="0.55" />
            <stop offset="78%" stopColor="#ffd36b" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#caa24a" stopOpacity="0.04" />
          </linearGradient>

          <linearGradient id={ids.diamondStroke} x1={cx - 90} y1={cy} x2={cx + 90} y2={cy} gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#caa24a" stopOpacity="0.85" />
            <stop offset="45%" stopColor="#fff3c4" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#a8782a" stopOpacity="0.80" />
          </linearGradient>

          <radialGradient id={ids.diamondCore} cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="#fff3c4" stopOpacity="0.70" />
            <stop offset="55%" stopColor="#ffd36b" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#a8782a" stopOpacity="0.10" />
          </radialGradient>

          <radialGradient id={ids.dustGrad} cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#fff3c4" stopOpacity="0.90" />
            <stop offset="100%" stopColor="#ffd36b" stopOpacity="0.00" />
          </radialGradient>

          <filter id={ids.glow} x="-60%" y="-240%" width="220%" height="580%">
            <feGaussianBlur stdDeviation="2.2" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id={ids.dust} x="-80%" y="-200%" width="260%" height="600%">
            <feGaussianBlur stdDeviation="1.2" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Gentle, near-invisible vertical oscillation for the whole energy band */}
        <g>
          <animateTransform
            attributeName="transform"
            type="translate"
            values={`0 -2; 0 2; 0 -2`}
            dur="11s"
            repeatCount="indefinite"
          />

          {/* MAIN energy ribbon (soft edge + glow) */}
          <path
            d={leftPath}
            fill="none"
            stroke={`url(#${ids.flowMain})`}
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter={`url(#${ids.glow})`}
            opacity="0.95"
          />
          <path
            d={leftPath}
            fill="none"
            stroke="#fff3c4"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.22"
            strokeDasharray="2 12"
          >
            <animate attributeName="stroke-dashoffset" from="0" to="-140" dur="12s" repeatCount="indefinite" />
          </path>
          <path
            d={rightPath}
            fill="none"
            stroke={`url(#${ids.flowMain})`}
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter={`url(#${ids.glow})`}
            opacity="0.95"
          />
          <path
            d={rightPath}
            fill="none"
            stroke="#fff3c4"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.22"
            strokeDasharray="2 12"
          >
            <animate attributeName="stroke-dashoffset" from="0" to="-140" dur="12s" repeatCount="indefinite" />
          </path>

          {/* Secondary thinner thread */}
          <path
            d={leftPath2}
            fill="none"
            stroke={`url(#${ids.flowThin})`}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.85"
          />
          <path
            d={leftPath2}
            fill="none"
            stroke="#ffd36b"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.18"
            strokeDasharray="1 14"
          >
            <animate attributeName="stroke-dashoffset" from="0" to="-120" dur="10s" repeatCount="indefinite" />
          </path>
          <path
            d={rightPath2}
            fill="none"
            stroke={`url(#${ids.flowThin})`}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.85"
          />
          <path
            d={rightPath2}
            fill="none"
            stroke="#ffd36b"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.18"
            strokeDasharray="1 14"
          >
            <animate attributeName="stroke-dashoffset" from="0" to="-120" dur="10s" repeatCount="indefinite" />
          </path>

          {/* Stardust (denser around center, subtle twinkle) */}
          <g filter={`url(#${ids.dust})`} opacity="0.85">
            {dust.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r={p.r} fill={`url(#${ids.dustGrad})`} opacity={p.o}>
                <animate
                  attributeName="opacity"
                  values="0.3;0.8;0.3"
                  dur={`${p.d}s`}
                  begin={`${p.b}s`}
                  repeatCount="indefinite"
                />
                <animateTransform
                  attributeName="transform"
                  type="translate"
                  values="0 0; 18 0; 0 0"
                  dur={`${10 + (i % 4) * 1.4}s`}
                  begin={`${-1.5 - (i % 3) * 0.7}s`}
                  repeatCount="indefinite"
                />
              </circle>
            ))}
          </g>
        </g>

        {/* Center diamond (subtle breathing pulse) */}
        <g filter={`url(#${ids.glow})`}>
          <g transform={`translate(${cx} ${cy})`}>
            <animateTransform
              attributeName="transform"
              additive="sum"
              type="scale"
              values="1;1.03;1"
              dur="4.2s"
              repeatCount="indefinite"
            />

            {/* Outer diamond stroke */}
            <polygon
              points="0,-52 52,0 0,52 -52,0"
              fill="none"
              stroke={`url(#${ids.diamondStroke})`}
              strokeWidth="3"
              opacity="0.95"
            />

            {/* Soft glow layer (breathes with the pulse) */}
            <polygon points="0,-52 52,0 0,52 -52,0" fill="#ffd36b" opacity="0.10">
              <animate attributeName="opacity" values="0.10;0.18;0.10" dur="4.2s" repeatCount="indefinite" />
            </polygon>

            {/* Inner core */}
            <polygon points="0,-26 26,0 0,26 -26,0" fill={`url(#${ids.diamondCore})`} opacity="0.95" />

            {/* Core highlight */}
            <polygon points="0,-18 18,0 0,18 -18,0" fill="#fff3c4" opacity="0.12">
              <animate attributeName="opacity" values="0.10;0.16;0.10" dur="4.2s" repeatCount="indefinite" />
            </polygon>
          </g>
        </g>
      </svg>
    </div>
  );
}
