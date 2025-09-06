import { useEffect, useRef } from 'react';

export default function HeroParticles() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
  // Respect reduced motion
  // NOTE: removed pointer-driven parallax per user request (no moving particles)
  return;
  }, []);

  // Generate only small, quicker particles (remove large "energy balls")
  const particles = Array.from({ length: 18 }).map((_, i) => {
    // small sizes only: 6 - 14px
    const size = 6 + Math.round(Math.random() * 8);
    const left = Math.round(Math.random() * 100);
    const top = Math.round(Math.random() * 100);
    // depth kept for subtle layering but no parallax movement
    const depth = (0.9 + Math.random() * 1.1).toFixed(2); // 0.9 - 2.0
    const opacity = (0.12 + Math.random() * 0.36).toFixed(2);
    return { id: i, size, left, top, depth, opacity };
  });

  return (
    <div ref={containerRef} className="hero-particles" aria-hidden>
      {particles.map(p => (
        <span
          key={p.id}
          className="particle"
          style={{
            width: `${p.size}px`,
            height: `${p.size}px`,
            left: `${p.left}%`,
            top: `${p.top}%`,
            opacity: p.opacity,
            // expose depth to css for subtle layering
            ['--d' as any]: p.depth,
          }}
        />
      ))}
    </div>
  );
}
