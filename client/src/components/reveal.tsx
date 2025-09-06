import React, { useEffect, useRef, useState, ReactNode } from 'react';

type RevealProps = {
  children: ReactNode;
  className?: string;
  rootMargin?: string;
  threshold?: number;
  once?: boolean;
  delay?: 'small' | 'medium' | 'large' | number;
};

export default function Reveal({
  children,
  className = '',
  rootMargin = '0px 0px -12% 0px',
  threshold = 0.08,
  once = false,
  delay,
}: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if ('IntersectionObserver' in window) {
      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setVisible(true);
              if (once && entry.target) obs.unobserve(entry.target);
            } else if (!once) {
              setVisible(false);
            }
          });
        },
        { root: null, rootMargin, threshold }
      );

      obs.observe(el);
      return () => obs.disconnect();
    }

    // Fallback: make visible immediately
    setVisible(true);
  }, [rootMargin, threshold, once]);

  return (
    <div
      ref={ref}
      className={`reveal ${visible ? 'reveal--visible' : ''} ${className || ''}`.trim()}
      style={{ transitionDelay: typeof delay === 'number' ? `${delay}ms` : delay === 'small' ? '80ms' : delay === 'medium' ? '160ms' : delay === 'large' ? '280ms' : undefined }}
      data-delay={typeof delay === 'string' ? delay : undefined}
    >
      {children}
    </div>
  );
}
