'use client';

import { useEffect, useState, useMemo } from 'react';

export default function BackgroundAnimation() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Ash/snow particles — deterministic
  const ashParticles = useMemo(() => {
    return Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      size: 1.5 + (i % 5) * 0.8,
      left: (i * 2.07) % 100,
      delay: (i * 0.6) % 18,
      duration: 12 + (i % 8) * 2.5,
      drift: ((i % 3) - 1) * 30,
      opacity: 0.15 + (i % 4) * 0.1,
    }));
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Fog layers — much more visible now */}
      <div className="absolute left-0 w-[200%] h-[250px] top-[5%] blur-[50px] animate-fogDrift1"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(160,160,160,0.25), rgba(180,180,180,0.35), rgba(160,160,160,0.25), transparent)' }} />
      <div className="absolute left-0 w-[200%] h-[200px] top-[30%] blur-[60px] animate-fogDrift2"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(150,150,150,0.2), rgba(170,170,170,0.3), rgba(150,150,150,0.2), transparent)' }} />
      <div className="absolute left-0 w-[200%] h-[280px] top-[55%] blur-[45px] animate-fogDrift3"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(170,170,170,0.3), rgba(190,190,190,0.4), rgba(170,170,170,0.3), transparent)' }} />
      <div className="absolute left-0 w-[200%] h-[220px] top-[78%] blur-[55px] animate-fogDrift4"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(155,155,155,0.2), rgba(175,175,175,0.25), rgba(155,155,155,0.2), transparent)' }} />

      {/* Falling ash */}
      {ashParticles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: `${p.size}px`,
            height: `${p.size}px`,
            left: `${p.left}%`,
            top: '-2%',
            backgroundColor: `rgba(200, 195, 185, ${p.opacity})`,
            animation: `ashFall ${p.duration}s linear infinite`,
            animationDelay: `${p.delay}s`,
            ['--drift' as string]: `${p.drift}px`,
          }}
        />
      ))}

      {/* Vignette */}
      <div className="absolute inset-0" style={{ boxShadow: 'inset 0 0 200px 80px rgba(0,0,0,0.12)' }} />
      <div className="absolute inset-0 hidden dark:block" style={{ boxShadow: 'inset 0 0 250px 100px rgba(0,0,0,0.35)' }} />

      {/* Film grain */}
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04] mix-blend-overlay animate-grain"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '150px 150px',
        }}
      />

      {/* Flicker */}
      <div className="absolute inset-0 bg-black/[0.02] dark:bg-black/[0.05] animate-flicker" />

      <style jsx>{`
        @keyframes ashFall {
          0% { transform: translateY(-10px) translateX(0) rotate(0deg); opacity: 0; }
          5% { opacity: 1; }
          85% { opacity: 0.6; }
          100% { transform: translateY(105vh) translateX(var(--drift)) rotate(360deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
