'use client';

import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 500);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-6 right-6 z-50 w-12 h-12 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg shadow-green-600/30 flex items-center justify-center transition-all hover:scale-110 active:scale-95 animate-in fade-in zoom-in duration-300"
      aria-label="Lên đầu trang"
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
}
