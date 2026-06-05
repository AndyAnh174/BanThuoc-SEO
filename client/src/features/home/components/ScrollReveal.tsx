'use client';

import React, { useEffect, useRef, useState } from 'react';

const offsets = { up: 'translateY(2rem)', left: 'translateX(-2rem)', right: 'translateX(2rem)' };

export function ScrollReveal({ children, className = '', direction = 'up', delay = 0 }:
  { children: React.ReactNode; className?: string; direction?: 'up' | 'left' | 'right'; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.unobserve(node); } },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : offsets[direction],
        transition: `opacity 0.7s ease-out, transform 0.7s ease-out`,
        transitionDelay: `${delay}ms`,
      }}>
      {children}
    </div>
  );
}
