import { useEffect, useRef } from 'react';

export default function SectionDivider() {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof window === 'undefined') return;

    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) el.classList.add('section-divider--visible');
        else el.classList.remove('section-divider--visible');
      });
    }, { threshold: 0.15 });

    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className="section-divider" aria-hidden>
      <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className="w-full h-20">
        <defs>
          <linearGradient id="g1" x1="0" x2="1">
            <stop offset="0%" stopColor="rgba(255,238,153,0.12)" />
            <stop offset="100%" stopColor="rgba(255,150,40,0.06)" />
          </linearGradient>
        </defs>
        {/* layered waves for fluid motion */}
        <g className="wave-layer wave-layer-back" transform="translate(0,6)">
          <path className="divider-path" d="M0,52 C360,100 1080,0 1440,52 L1440 120 L0 120 Z" fill="url(#g1)" />
        </g>
        <g className="wave-layer wave-layer-front" transform="translate(0,0)">
          <path className="divider-path" d="M0,40 C360,120 1080,-40 1440,40 L1440 120 L0 120 Z" fill="url(#g1)" />
        </g>
      </svg>
    </div>
  );
}
