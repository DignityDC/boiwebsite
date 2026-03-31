export default function BOISeal({ size = 200, className = '' }) {
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size * 0.46;
  const textR  = size * 0.40;

  // Circle path used for textPath (archimedes arc)
  const textPath = `
    M ${cx},${cy}
    m -${textR},0
    a ${textR},${textR} 0 1,1 ${textR * 2},0
    a ${textR},${textR} 0 1,1 -${textR * 2},0
  `;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <path id={`seal-text-${size}`} d={textPath} />
        <filter id={`gold-glow-${size}`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <radialGradient id={`inner-fill-${size}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#c9a228" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#c9a228" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* ── Outer rings ─────────────────── */}
      <circle cx={cx} cy={cy} r={outerR}       stroke="#c9a228" strokeWidth="1.6" />
      <circle cx={cx} cy={cy} r={outerR - 6}   stroke="#c9a228" strokeWidth="0.5" strokeDasharray="3 2" />
      <circle cx={cx} cy={cy} r={size * 0.32}  stroke="#c9a228" strokeWidth="0.7" />
      <circle cx={cx} cy={cy} r={size * 0.32}  fill={`url(#inner-fill-${size})`} />

      {/* ── Cardinal dots ───────────────── */}
      {[0, 90, 180, 270].map((deg) => {
        const rad = (deg * Math.PI) / 180;
        return (
          <circle
            key={deg}
            cx={cx + outerR * Math.cos(rad)}
            cy={cy + outerR * Math.sin(rad)}
            r={size * 0.016}
            fill="#c9a228"
          />
        );
      })}

      {/* ── Outer text ──────────────────── */}
      <text
        fontSize={size * 0.062}
        fill="#c9a228"
        fontFamily="Georgia, 'Times New Roman', serif"
        letterSpacing={size * 0.016}
      >
        <textPath href={`#seal-text-${size}`} startOffset="4%">
          ✦ BUREAU OF OPERATIONAL INTEGRITY ✦
        </textPath>
      </text>

      {/* ── Central shield ──────────────── */}
      <path
        d={`
          M ${cx} ${cy - size * 0.26}
          L ${cx + size * 0.155} ${cy - size * 0.16}
          L ${cx + size * 0.155} ${cy + size * 0.04}
          Q ${cx + size * 0.155} ${cy + size * 0.14} ${cx} ${cy + size * 0.22}
          Q ${cx - size * 0.155} ${cy + size * 0.14} ${cx - size * 0.155} ${cy + size * 0.04}
          L ${cx - size * 0.155} ${cy - size * 0.16}
          Z
        `}
        stroke="#c9a228"
        strokeWidth="1.3"
        fill="rgba(201,162,40,0.07)"
        filter={`url(#gold-glow-${size})`}
      />

      {/* ── Eye symbol inside shield ─────── */}
      <ellipse
        cx={cx}
        cy={cy - size * 0.04}
        rx={size * 0.095}
        ry={size * 0.055}
        stroke="#c9a228"
        strokeWidth="1"
        fill="none"
      />
      <circle cx={cx} cy={cy - size * 0.04} r={size * 0.028} fill="#c9a228" />
      <circle cx={cx} cy={cy - size * 0.04} r={size * 0.012} fill="#06070d" />

      {/* ── Top eye rays ────────────────── */}
      {[-1, 0, 1].map((i) => (
        <line
          key={i}
          x1={cx + i * size * 0.04}
          y1={cy - size * 0.11}
          x2={cx + i * size * 0.02}
          y2={cy - size * 0.095}
          stroke="#c9a228"
          strokeWidth="0.7"
          opacity="0.6"
        />
      ))}

      {/* ── BOI text ────────────────────── */}
      <text
        x={cx}
        y={cy + size * 0.1}
        textAnchor="middle"
        fill="#c9a228"
        fontSize={size * 0.115}
        fontWeight="bold"
        fontFamily="Georgia, 'Times New Roman', serif"
        letterSpacing={size * 0.025}
        filter={`url(#gold-glow-${size})`}
      >
        BOI
      </text>

      {/* ── Separator line ──────────────── */}
      <line
        x1={cx - size * 0.19}
        y1={cy + size * 0.13}
        x2={cx + size * 0.19}
        y2={cy + size * 0.13}
        stroke="#c9a228"
        strokeWidth="0.6"
        opacity="0.7"
      />

      {/* ── Est. text ───────────────────── */}
      <text
        x={cx}
        y={cy + size * 0.2}
        textAnchor="middle"
        fill="#c9a228"
        fontSize={size * 0.044}
        fontFamily="Georgia, 'Times New Roman', serif"
        letterSpacing={size * 0.01}
        opacity="0.75"
      >
        EST. MMXXIV
      </text>
    </svg>
  );
}
