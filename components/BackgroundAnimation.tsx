'use client';

import { useEffect, useState, useMemo } from 'react';

export default function BackgroundAnimation() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Generate particles once on mount to avoid hydration mismatch
  const particles = useMemo(() => {
    return Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      size: 2 + (i % 4),
      left: (i * 3.3) % 100,
      top: (i * 7.7) % 100,
      duration: 18 + (i % 7) * 3,
      delay: (i * 1.1) % 15,
    }));
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Large slow-moving gradient orbs — visible! */}
      <div className="absolute -top-32 -left-32 w-[700px] h-[700px] rounded-full bg-primary-500/20 dark:bg-primary-400/10 blur-[120px] animate-orb1" />
      <div className="absolute -bottom-32 -right-32 w-[600px] h-[600px] rounded-full bg-accent/15 dark:bg-accent/8 blur-[100px] animate-orb2" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-primary-300/10 dark:bg-primary-500/5 blur-[140px] animate-orb3" />

      {/* Floating particles — small glowing dots drifting up */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-primary-400/30 dark:bg-primary-300/15"
          style={{
            width: `${p.size}px`,
            height: `${p.size}px`,
            left: `${p.left}%`,
            top: `${p.top}%`,
            animation: `particleFloat ${p.duration}s linear infinite`,
            animationDelay: `${p.delay}s`,
            boxShadow: '0 0 6px rgba(99, 102, 241, 0.3)',
          }}
        />
      ))}

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.04]"
        style={{
          backgroundImage: 'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <style jsx>{`
        @keyframes particleFloat {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: 0.8; }
          90% { opacity: 0.15; }
          100% { transform: translateY(-100vh) translateX(30px); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
