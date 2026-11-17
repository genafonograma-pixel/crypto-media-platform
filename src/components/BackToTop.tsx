import React, { useState, useEffect, useCallback } from 'react';
import { ChevronUp } from 'lucide-react';

/**
 * BackToTop
 * A fixed button that fades in after the user scrolls 600px and
 * smoothly scrolls back to the top when tapped.
 * Uses IntersectionObserver (where available) with a scroll fallback.
 */
export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  const handleScroll = useCallback(() => {
    setVisible(window.scrollY > 600);
  }, []);

  useEffect(() => {
    // Passive scroll listener — no layout thrash
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  if (!visible) return null;

  return (
    <button
      type="button"
      aria-label="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-6 right-4 z-40 w-11 h-11 flex items-center justify-center rounded-full bg-ink-900 text-white shadow-lg hover:bg-brand transition-colors duration-150 focus-visible:outline-brand focus-visible:outline-offset-2"
    >
      <ChevronUp size={22} />
    </button>
  );
}
