import React, { useEffect, useState } from 'react';

interface EntranceEffectProps {
  onComplete?: () => void;
}

const EntranceEffect: React.FC<EntranceEffectProps> = ({ onComplete }) => {
  // Generate random particles for the curtain effect
  const [particles, setParticles] = useState<{ id: number, size: number, x: number, y: number, delay: number, color: string }[]>([]);
  
  useEffect(() => {
    // Generate particles on first render
    const particleCount = 30; // Keep count low for performance
    const newParticles = [];
    
    const colors = [
      'rgba(255, 236, 179, 0.6)', // Amber/gold
      'rgba(255, 249, 219, 0.5)', // Light gold
      'rgba(202, 138, 4, 0.4)',   // Dark amber
      'rgba(255, 255, 255, 0.7)'  // White
    ];
    
    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: i,
        size: Math.random() * 8 + 2, // 2-10px
        x: Math.random() * 100, // 0-100%
        y: Math.random() * 100, // 0-100%
        delay: Math.random() * 0.5, // 0-0.5s delay
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
    
    setParticles(newParticles);
    
    // Set timeout to call onComplete when animation is done
    const timer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 2500); // Slightly shorter than animation to ensure smooth transition
    
    return () => clearTimeout(timer);
  }, [onComplete]);
  
  return (
    <div className="absolute inset-0 z-30 pointer-events-none overflow-hidden">
      {/* Glow veil overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-amber-500/20 to-amber-900/20 animate-glow-veil z-30"></div>
      
      {/* Light sweep */}
      <div className="absolute inset-0 z-40 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-amber-100/40 to-transparent animate-light-sweep"></div>
      </div>
      
      {/* Light rays */}
      <div className="absolute inset-0 opacity-30 overflow-hidden z-20">
        <div className="absolute top-1/2 left-1/2 w-[200%] h-[200%] -translate-x-1/2 -translate-y-1/2 
          bg-[radial-gradient(ellipse_at_center,_rgba(255,236,179,0.3)_0%,_transparent_70%)] animate-glow-veil"></div>
      </div>
      
      {/* Particles */}
      <div className="absolute inset-0 animate-particle-curtain z-20">
        {particles.map(particle => (
          <div
            key={particle.id}
            className="absolute rounded-full"
            style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              backgroundColor: particle.color,
              boxShadow: '0 0 10px rgba(255, 236, 179, 0.5)',
              animationDelay: `${particle.delay}s`
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default EntranceEffect; 