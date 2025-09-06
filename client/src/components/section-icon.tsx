export default function SectionIcon({ type = 'spark' }: { type?: 'spark' | 'rune' | 'leaf' }) {
  if (type === 'leaf') {
    return (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" className="section-icon leaf" aria-hidden>
        <path d="M4 12c4-6 8-8 12-8" stroke="url(#g)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        <defs>
          <linearGradient id="g" x1="0" x2="1"><stop offset="0" stopColor="#ffdE99"/><stop offset="1" stopColor="#ff9b3b"/></linearGradient>
        </defs>
      </svg>
    );
  }

  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" className="section-icon spark" aria-hidden>
      <g stroke="url(#g2)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v4" />
        <path d="M12 18v4" />
        <path d="M4.5 4.5l2.5 2.5" />
        <path d="M17 17l2.5 2.5" />
      </g>
      <defs>
        <linearGradient id="g2" x1="0" x2="1"><stop offset="0" stopColor="#fff2c8"/><stop offset="1" stopColor="#ffb86b"/></linearGradient>
      </defs>
    </svg>
  );
}
