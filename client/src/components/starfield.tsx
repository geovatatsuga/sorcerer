import { useEffect, useRef } from 'react';

export default function Starfield({ count = 80 }: { count?: number }) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  }, []);

  // Start stars lower on the hero so they rise into view
  const stars = Array.from({ length: count }).map((_, i) => {
    // bias sizes a little larger and brighter
    const size = Math.random() * 3 + 0.8; // 0.8 - 3.8
    const left = Math.random() * 100;
    const top = 60 + Math.random() * 40; // start between 60% and 100%
    const delay = Math.random() * 6;
    const duration = 5 + Math.random() * 10;
    const opacity = 0.12 + Math.random() * 0.36;
    const glow = 6 + Math.random() * 12;
    return { id: i, size, left, top, delay, duration, opacity, glow };
  });

  // small set of comets for variety
  const comets = Array.from({ length: 3 }).map((_, i) => {
    const left = Math.random() * 80 + 5; // avoid exact edges
    const top = 70 + Math.random() * 25;
    const delay = Math.random() * 6;
    const duration = 6 + Math.random() * 8;
    const size = 1.5 + Math.random() * 2.5;
    return { id: `c-${i}`, left, top, delay, duration, size };
  });

  return (
    <div ref={ref} className="starfield" aria-hidden>
      {/* nebula/soft gradient layer handled in CSS via ::before */}
      {stars.map(s => (
        <span
          key={s.id}
          className="star"
          style={{
              width: `${s.size}px`,
              height: `${s.size}px`,
              left: `${s.left}%`,
              top: `${s.top}%`,
              opacity: s.opacity,
              ['--d' as any]: `${s.duration}s`,
              ['--delay' as any]: `${s.delay}s`,
              ['--glow' as any]: `${s.glow}px`,
            }}
        />
      ))}

      {comets.map(c => (
        <span
          key={c.id}
          className="comet"
          style={{
            left: `${c.left}%`,
            top: `${c.top}%`,
            ['--d' as any]: `${c.duration}s`,
            ['--delay' as any]: `${c.delay}s`,
            ['--size' as any]: `${c.size}px`,
          }}
        />
      ))}
    </div>
  );
}
