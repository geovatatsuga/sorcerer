import { useEffect, useRef } from 'react';

type Props = {
  density?: number; // number of sparks per edge
  variant?: 'gold' | 'cool' | 'muted';
  className?: string;
  sides?: 'bottom' | 'top' | 'both';
};

export default function SectionParticles({ density = 18, variant = 'gold', className = '', sides = 'both' }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  }, []);

  // only gold and muted palettes — map any 'cool' or others to gold to avoid blue
  const colors = {
    gold: ['rgba(255,238,153,0.95)', 'rgba(255,200,80,0.85)'],
    muted: ['rgba(255,255,255,0.7)', 'rgba(255,255,255,0.4)'],
  } as const;

  const palette = (variant === 'muted' ? colors.muted : colors.gold);

  const makeSparks = (count: number) =>
    Array.from({ length: count }).map((_, i) => {
      const size = 3 + Math.round(Math.random() * 12);
      const left = Math.round(Math.random() * 100);
      const offset = Math.round(Math.random() * 12);
      const delay = Math.random() * 6;
      const duration = 3 + Math.random() * 6;
      const opacity = 0.2 + Math.random() * 0.8;
      const color = palette[Math.floor(Math.random() * palette.length)];
      const sway = 6 + Math.random() * 18;
      return { id: i, size, left, offset, delay, duration, opacity, color, sway };
    });

  const topSparks = sides !== 'bottom' ? makeSparks(Math.round(density)) : [];
  const bottomSparks = sides !== 'top' ? makeSparks(Math.round(density)) : [];

  // We'll render thin streaks that travel diagonally across the section.
  return (
    <div ref={ref} className={`section-particles ${className}`} aria-hidden>
      {/* top sparks travel down-right; bottom sparks travel up-right */}

      {topSparks.map(s => (
        <span
          key={`t-${s.id}`}
          className="section-spark section-spark-top spark-cross"
          style={{
            left: `${s.left}%`,
            top: `${-8 + (s.offset % 8)}%`,
            width: `${Math.max(1, Math.round(s.size / 6))}px`,
            height: `${Math.max(16, s.size + 10)}px`,
            opacity: Math.max(0.3, Math.min(1, s.opacity)),
            background: `linear-gradient(180deg, ${s.color}, rgba(255,255,255,0.0))`,
            ['--d' as any]: `${Math.max(3, s.duration)}s`,
            ['--delay' as any]: `${s.delay}s`,
            ['--angle' as any]: `${-15 + Math.round((Math.random() - 0.5) * 30)}deg`,
          }}
        />
      ))}

      {bottomSparks.map(s => (
        <span
          key={`b-${s.id}`}
          className="section-spark section-spark-bottom spark-cross"
          style={{
            left: `${s.left}%`,
            bottom: `${-6 + (s.offset % 8)}%`,
            width: `${Math.max(1, Math.round(s.size / 6))}px`,
            height: `${Math.max(16, s.size + 10)}px`,
            opacity: Math.max(0.3, Math.min(1, s.opacity)),
            background: `linear-gradient(0deg, ${s.color}, rgba(255,255,255,0.0))`,
            ['--d' as any]: `${Math.max(3, s.duration)}s`,
            ['--delay' as any]: `${s.delay}s`,
            ['--angle' as any]: `${15 + Math.round((Math.random() - 0.5) * 30)}deg`,
          }}
        />
      ))}
    </div>
  );
}
