'use client';

import { useEffect, useState, useMemo } from 'react';

// Genre-to-theme mapping
type GenreTheme = {
  baseLight: string;
  baseDark: string;
  fogColor: string;
  ashColor: string;
  fogOpacity: number;
};

const GENRE_THEMES: Record<string, GenreTheme> = {
  RPG:       { baseLight: '#f0eef5', baseDark: '#120c22', fogColor: '140,120,180', ashColor: '180,170,200', fogOpacity: 0.25 },
  Action:    { baseLight: '#f2f0ee', baseDark: '#1a1210', fogColor: '180,140,120', ashColor: '200,180,160', fogOpacity: 0.2 },
  Shooter:   { baseLight: '#eef0f2', baseDark: '#0c1018', fogColor: '140,160,180', ashColor: '160,175,190', fogOpacity: 0.18 },
  Horror:    { baseLight: '#ededed', baseDark: '#0a0a0e', fogColor: '160,160,160', ashColor: '200,195,185', fogOpacity: 0.35 },
  Adventure: { baseLight: '#f0f2ee', baseDark: '#0e1410', fogColor: '140,170,140', ashColor: '170,195,170', fogOpacity: 0.22 },
  Strategy:  { baseLight: '#eef0f4', baseDark: '#0c0e18', fogColor: '130,150,190', ashColor: '160,175,210', fogOpacity: 0.2 },
  Indie:     { baseLight: '#f4f0ee', baseDark: '#18120e', fogColor: '190,160,140', ashColor: '210,190,170', fogOpacity: 0.15 },
  Platformer:{ baseLight: '#eef4f0', baseDark: '#0e1812', fogColor: '140,190,160', ashColor: '170,210,185', fogOpacity: 0.15 },
  Simulation:{ baseLight: '#f0f2f4', baseDark: '#0e1014', fogColor: '150,165,180', ashColor: '175,190,200', fogOpacity: 0.18 },
};

const DEFAULT_THEME: GenreTheme = {
  baseLight: '#f0f1f5', baseDark: '#0c1322', fogColor: '160,160,160', ashColor: '200,195,185', fogOpacity: 0.25,
};

function getThemeForGenre(genre: string): GenreTheme {
  // Try exact match first, then partial
  if (GENRE_THEMES[genre]) return GENRE_THEMES[genre];
  const key = Object.keys(GENRE_THEMES).find(k => genre.toLowerCase().includes(k.toLowerCase()));
  return key ? GENRE_THEMES[key] : DEFAULT_THEME;
}

export default function BackgroundAnimation() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<GenreTheme>(DEFAULT_THEME);

  useEffect(() => {
    setMounted(true);
    const topGenre = localStorage.getItem('gamedb-top-genre') || '';
    if (topGenre) setTheme(getThemeForGenre(topGenre));
  }, []);

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

  const t = theme;

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Adaptive base color */}
      <div className="absolute inset-0" style={{ backgroundColor: `var(--bg-base, ${t.baseLight})` }} />
      <div className="absolute inset-0 hidden dark:block" style={{ backgroundColor: t.baseDark }} />

      {/* Fog layers with genre-adapted color */}
      <div className="absolute left-0 w-[200%] h-[250px] top-[5%] blur-[50px] animate-fogDrift1"
        style={{ background: `linear-gradient(90deg, transparent, rgba(${t.fogColor},${t.fogOpacity}), rgba(${t.fogColor},${t.fogOpacity + 0.1}), rgba(${t.fogColor},${t.fogOpacity}), transparent)` }} />
      <div className="absolute left-0 w-[200%] h-[200px] top-[30%] blur-[60px] animate-fogDrift2"
        style={{ background: `linear-gradient(90deg, transparent, rgba(${t.fogColor},${t.fogOpacity - 0.05}), rgba(${t.fogColor},${t.fogOpacity + 0.05}), rgba(${t.fogColor},${t.fogOpacity - 0.05}), transparent)` }} />
      <div className="absolute left-0 w-[200%] h-[280px] top-[55%] blur-[45px] animate-fogDrift3"
        style={{ background: `linear-gradient(90deg, transparent, rgba(${t.fogColor},${t.fogOpacity + 0.05}), rgba(${t.fogColor},${t.fogOpacity + 0.15}), rgba(${t.fogColor},${t.fogOpacity + 0.05}), transparent)` }} />
      <div className="absolute left-0 w-[200%] h-[220px] top-[78%] blur-[55px] animate-fogDrift4"
        style={{ background: `linear-gradient(90deg, transparent, rgba(${t.fogColor},${t.fogOpacity - 0.05}), rgba(${t.fogColor},${t.fogOpacity}), rgba(${t.fogColor},${t.fogOpacity - 0.05}), transparent)` }} />

      {/* Falling ash with genre-adapted color */}
      {ashParticles.map((p) => (
        <div key={p.id} className="absolute rounded-full"
          style={{
            width: `${p.size}px`, height: `${p.size}px`, left: `${p.left}%`, top: '-2%',
            backgroundColor: `rgba(${t.ashColor}, ${p.opacity})`,
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
