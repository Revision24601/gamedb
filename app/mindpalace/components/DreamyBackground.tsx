import React, { useEffect, useState, useMemo } from 'react';

interface Particle {
  id: number;
  size: number;
  x: number;
  y: number;
  delay: number;
  duration: number;
  opacity: number;
}

interface GeoShape {
  id: number;
  size: number;
  x: number;
  y: number;
  delay: number;
  rotation: number;
  type: 'diamond' | 'ring' | 'square';
}

interface DreamyBackgroundProps {
  density?: 'low' | 'medium' | 'high';
  theme?: string;
}

const DreamyBackground: React.FC<DreamyBackgroundProps> = ({
  density = 'medium',
}) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const particleCounts = { low: 20, medium: 35, high: 55 };
  const geoCounts = { low: 3, medium: 6, high: 10 };

  const particles = useMemo<Particle[]>(() => {
    const count = particleCounts[density];
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      size: Math.random() * 2 + 1,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 12,
      duration: Math.random() * 8 + 10,
      opacity: Math.random() * 0.3 + 0.1,
    }));
  }, [density]);

  const geoShapes = useMemo<GeoShape[]>(() => {
    const count = geoCounts[density];
    const types: ('diamond' | 'ring' | 'square')[] = ['diamond', 'ring', 'square'];
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      size: Math.random() * 30 + 15,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 15,
      rotation: Math.random() * 360,
      type: types[Math.floor(Math.random() * types.length)],
    }));
  }, [density]);

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Dark void gradient */}
      <div className="absolute inset-0 animus-void" />

      {/* Floating particles (small dots of light) */}
      {particles.map((p) => (
        <div
          key={`p-${p.id}`}
          className="animus-particle"
          style={{
            width: `${p.size}px`,
            height: `${p.size}px`,
            left: `${p.x}%`,
            top: `${p.y}%`,
            backgroundColor: `rgba(0, 212, 255, ${p.opacity})`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            boxShadow: `0 0 ${p.size * 3}px rgba(0, 212, 255, ${p.opacity * 0.5})`,
          }}
        />
      ))}

      {/* Geometric shapes (slow-floating outlines) */}
      {geoShapes.map((g) => (
        <div
          key={`g-${g.id}`}
          className="animus-geo-shape"
          style={{
            width: `${g.size}px`,
            height: `${g.size}px`,
            left: `${g.x}%`,
            top: `${g.y}%`,
            animationDelay: `${g.delay}s`,
            transform: `rotate(${g.rotation}deg)`,
            borderRadius: g.type === 'ring' ? '50%' : g.type === 'diamond' ? '2px' : '0',
          }}
        />
      ))}
    </div>
  );
};

export default DreamyBackground;
