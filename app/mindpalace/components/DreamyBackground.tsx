import React, { useEffect, useState } from 'react';

interface Star {
  id: number;
  size: number;
  top: number;
  left: number;
  delay: number;
  duration: number;
}

interface Particle {
  id: number;
  type: 'dot' | 'circle' | 'square';
  size: number;
  top: number;
  left: number;
  delay: number;
  rotation: number;
  color: string;
}

interface CloudShape {
  id: number;
  width: number;
  height: number;
  top: number;
  left: number;
  opacity: number;
  delay: number;
  isAlt: boolean;
}

interface DreamyBackgroundProps {
  density?: 'low' | 'medium' | 'high';
  theme?: 'default' | 'warm' | 'cool';
}

const DreamyBackground: React.FC<DreamyBackgroundProps> = ({
  density = 'medium',
  theme = 'default'
}) => {
  const [stars, setStars] = useState<Star[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [clouds, setClouds] = useState<CloudShape[]>([]);
  
  // Generate stars based on density
  useEffect(() => {
    const starCounts = {
      low: 15,
      medium: 25,
      high: 40
    };
    
    const count = starCounts[density];
    const newStars: Star[] = [];
    
    for (let i = 0; i < count; i++) {
      newStars.push({
        id: i,
        size: Math.random() * 4 + 1, // 1-5px
        top: Math.random() * 100, // 0-100%
        left: Math.random() * 100, // 0-100%
        delay: Math.random() * 8, // 0-8s delay
        duration: Math.random() * 4 + 6, // 6-10s duration
      });
    }
    
    setStars(newStars);
    
    // Generate floating particles
    const particleCounts = {
      low: 8,
      medium: 15,
      high: 25
    };
    
    const particleCount = particleCounts[density];
    const newParticles: Particle[] = [];
    
    const particleTypes: ('dot' | 'circle' | 'square')[] = ['dot', 'circle', 'square'];
    
    // Theme color sets
    const colorSets = {
      default: ['rgba(255, 217, 102, 0.3)', 'rgba(252, 186, 3, 0.2)', 'rgba(214, 158, 3, 0.2)'],
      warm: ['rgba(255, 170, 102, 0.3)', 'rgba(252, 129, 3, 0.2)', 'rgba(214, 109, 3, 0.2)'],
      cool: ['rgba(176, 223, 229, 0.3)', 'rgba(86, 207, 225, 0.2)', 'rgba(0, 169, 194, 0.2)']
    };
    
    const colors = colorSets[theme];
    
    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: i,
        type: particleTypes[Math.floor(Math.random() * particleTypes.length)],
        size: Math.random() * 8 + 3, // 3-11px
        top: Math.random() * 100, // 0-100%
        left: Math.random() * 100, // 0-100%
        delay: Math.random() * 15, // 0-15s delay
        rotation: Math.random() * 360, // 0-360 degrees
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
    
    setParticles(newParticles);
    
    // Generate clouds
    const cloudCounts = {
      low: 3,
      medium: 5,
      high: 8
    };
    
    const cloudCount = cloudCounts[density];
    const newClouds: CloudShape[] = [];
    
    for (let i = 0; i < cloudCount; i++) {
      newClouds.push({
        id: i,
        width: Math.random() * 30 + 20, // 20-50%
        height: Math.random() * 20 + 10, // 10-30%
        top: Math.random() * 90, // 0-90%
        left: Math.random() * 90, // 0-90%
        opacity: Math.random() * 0.2 + 0.1, // 0.1-0.3
        delay: Math.random() * 10, // 0-10s delay
        isAlt: Math.random() > 0.5 // 50% chance of alternate animation
      });
    }
    
    setClouds(newClouds);
  }, [density, theme]);
  
  // Get theme-specific colors
  const getThemeColors = () => {
    switch (theme) {
      case 'warm':
        return {
          starColor: '#FFEDD5',
          cloudColor: 'rgba(255, 237, 213, 0.1)',
          vignetteColor: 'rgba(154, 52, 18, 0.1)'
        };
      case 'cool':
        return {
          starColor: '#DBEAFE',
          cloudColor: 'rgba(219, 234, 254, 0.1)',
          vignetteColor: 'rgba(30, 58, 138, 0.1)'
        };
      default:
        return {
          starColor: '#FFF7ED',
          cloudColor: 'rgba(255, 247, 237, 0.1)',
          vignetteColor: 'rgba(120, 53, 15, 0.1)'
        };
    }
  };
  
  const { starColor, cloudColor, vignetteColor } = getThemeColors();
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Vignette effect */}
      <div
        className="absolute inset-0 animate-vignette z-0"
        style={{ boxShadow: `inset 0 0 15vw 15vw ${vignetteColor}` }}
      />
      
      {/* Stars */}
      {stars.map((star) => (
        <div
          key={`star-${star.id}`}
          className="absolute rounded-full animate-star z-0"
          style={{
            width: `${star.size}px`,
            height: `${star.size}px`,
            top: `${star.top}%`,
            left: `${star.left}%`,
            backgroundColor: starColor,
            animationDelay: `${star.delay}s`,
            animationDuration: `${star.duration}s`
          }}
        />
      ))}
      
      {/* Particles */}
      {particles.map((particle) => {
        // Different shapes based on type
        const getParticleStyle = () => {
          const baseStyle = {
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            top: `${particle.top}%`,
            left: `${particle.left}%`,
            backgroundColor: particle.color,
            animationDelay: `${particle.delay}s`,
            transform: `rotate(${particle.rotation}deg)`
          };
          
          switch (particle.type) {
            case 'circle':
              return { ...baseStyle, borderRadius: '50%' };
            case 'square':
              return { ...baseStyle, borderRadius: '2px' };
            default: // dot
              return { ...baseStyle, borderRadius: '50%', width: `${particle.size / 2}px`, height: `${particle.size / 2}px` };
          }
        };
        
        return (
          <div
            key={`particle-${particle.id}`}
            className="absolute animate-memory-particle z-0"
            style={getParticleStyle()}
          />
        );
      })}
      
      {/* Cloud shapes */}
      {clouds.map((cloud) => (
        <div
          key={`cloud-${cloud.id}`}
          className={`absolute rounded-full z-0 ${cloud.isAlt ? 'animate-dream-cloud-alt' : 'animate-dream-cloud'}`}
          style={{
            width: `${cloud.width}%`,
            height: `${cloud.height}%`,
            top: `${cloud.top}%`,
            left: `${cloud.left}%`,
            background: `radial-gradient(ellipse at center, ${cloudColor} 0%, transparent 70%)`,
            opacity: cloud.opacity,
            animationDelay: `${cloud.delay}s`
          }}
        />
      ))}
    </div>
  );
};

export default DreamyBackground; 