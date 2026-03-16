'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const prevUrlRef = useRef('');

  const cleanup = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  const completeProgress = useCallback(() => {
    cleanup();
    setProgress(100);
    timerRef.current = setTimeout(() => {
      setVisible(false);
      setTimeout(() => setProgress(0), 300);
    }, 200);
  }, [cleanup]);

  useEffect(() => {
    const url = `${pathname}?${searchParams.toString()}`;

    // Skip initial render
    if (!prevUrlRef.current) {
      prevUrlRef.current = url;
      return;
    }

    // URL changed — navigation completed
    if (prevUrlRef.current !== url) {
      prevUrlRef.current = url;
      completeProgress();
    }
  }, [pathname, searchParams, completeProgress]);

  // Intercept link clicks to start progress immediately
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto:')) return;
      if (anchor.target === '_blank') return;

      // Same page link — don't show progress
      const currentUrl = `${pathname}?${searchParams.toString()}`;
      if (href === pathname || href === currentUrl) return;

      // Start progress
      cleanup();
      setProgress(0);
      setVisible(true);

      // Simulate progress: fast start, slow middle
      let current = 0;
      intervalRef.current = setInterval(() => {
        current += Math.random() * 12 + 3;
        if (current > 90) current = 90;
        setProgress(current);
      }, 200);
    };

    document.addEventListener('click', handleClick, true);
    return () => {
      document.removeEventListener('click', handleClick, true);
      cleanup();
    };
  }, [pathname, searchParams, cleanup]);

  if (!visible && progress === 0) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[9999] h-[3px] pointer-events-none"
      style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.3s' }}
    >
      <div
        className="h-full bg-accent"
        style={{
          width: `${progress}%`,
          transition: progress === 0 ? 'none' : 'width 0.3s ease',
          boxShadow: '0 0 8px rgba(74, 158, 255, 0.5)',
        }}
      />
    </div>
  );
}
