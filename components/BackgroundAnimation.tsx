'use client';

import { useEffect, useState, useMemo } from 'react';

export default function BackgroundAnimation() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Deterministic ash/snow particles
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

  // Fog layers
  const fogLayers = useMemo(() => [
    { id: 0, y: '10%', duration: 45, delay: 0, opacity: 0.08 },
    { id: 1, y: '35%', duration: 55, delay: 5, opacity: 0.06 },
    { id: 2, y: '60%', duration: 40, delay: 12, opacity: 0.1 },
    { id: 3, y: '80%', duration: 50, delay: 8, opacity: 0.07 },
  ], []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Base atmospheric gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-400/[0.03] to-gray-500/[0.06] dark:from-transparent dark:via-gray-600/[0.05] dark:to-gray-800/[0.08]" />

      {/* Drifting fog layers */}
      {fogLayers.map((fog) => (
        <div
          key={fog.id}
          className="absolute left-0 w-[200%] h-[180px]"
          style={{
            top: fog.y,
            opacity: fog.opacity,
            background: 'linear-gradient(90deg, transparent 0%, rgba(180,180,180,0.4) 20%, rgba(200,200,200,0.6) 50%, rgba(180,180,180,0.4) 80%, transparent 100%)',
            filter: 'blur(40px)',
            animation: `fogDrift ${fog.duration}s linear infinite`,
            animationDelay: `${fog.delay}s`,
          }}
        />
      ))}

      {/* Falling ash / snow particles */}
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

      {/* Vignette — dark edges like limited visibility */}
      <div
        className="absolute inset-0"
        style={{
          boxShadow: 'inset 0 0 150px 60px rgba(0,0,0,0.15)',
        }}
      />
      {/* Darker vignette for dark mode */}
      <div
        className="absolute inset-0 hidden dark:block"
        style={{
          boxShadow: 'inset 0 0 200px 80px rgba(0,0,0,0.3)',
        }}
      />

      {/* Film grain / static noise overlay */}
      <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03] mix-blend-overlay animate-grain"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '150px 150px',
        }}
      />

      {/* Occasional subtle flicker */}
      <div className="absolute inset-0 bg-black/[0.02] dark:bg-black/[0.04] animate-flicker" />

      <style jsx>{`
        @keyframes fogDrift {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0%); }
        }
        @keyframes ashFall {
          0% { 
            transform: translateY(-10px) translateX(0) rotate(0deg); 
            opacity: 0; 
          }
          5% { opacity: 1; }
          85% { opacity: 0.6; }
          100% { 
            transform: translateY(105vh) translateX(var(--drift)) rotate(360deg); 
            opacity: 0; 
          }
        }
        @keyframes grain {
          0%, 100% { transform: translate(0, 0); }
          10% { transform: translate(-1%, -1%); }
          20% { transform: translate(1%, 0%); }
          30% { transform: translate(0%, 1%); }
          40% { transform: translate(-1%, 1%); }
          50% { transform: translate(1%, -1%); }
          60% { transform: translate(0%, 0%); }
          70% { transform: translate(1%, 1%); }
          80% { transform: translate(-1%, 0%); }
          90% { transform: translate(0%, -1%); }
        }
        @keyframes flicker {
          0%, 97%, 100% { opacity: 0; }
          97.5% { opacity: 1; }
          98% { opacity: 0; }
          98.5% { opacity: 0.5; }
          99% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
