import { useEffect, useRef } from 'react';

interface ParallaxLayerProps {
  children?: React.ReactNode;
  depth?: number; // 0.1 - 2.0
  className?: string;
}

export default function ParallaxLayer({ children, depth = 0.6, className = '' }: ParallaxLayerProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const el = ref.current;
    if (!el) return;

    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      const offset = (rect.top / window.innerHeight) * depth * 20;
      el.style.transform = `translate3d(0, ${offset}px, 0)`;
    };

    // throttle
    let ticking = false;
    const handler = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => { onScroll(); ticking = false; });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handler, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', handler as any);
  }, [depth]);

  return (
    <div ref={ref} className={`parallax-layer ${className}`} style={{ willChange: 'transform' }}>
      {children}
    </div>
  );
}
