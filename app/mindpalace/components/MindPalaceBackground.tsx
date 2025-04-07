import React, { useState, useEffect } from 'react';

type BackgroundStyle = 'gradient' | 'parallax' | 'particles';
type BackgroundTheme = 'default' | 'cool' | 'warm' | 'neutral' | 'forest';
type BackgroundIntensity = 'low' | 'medium' | 'high';

interface MindPalaceBackgroundProps {
  style?: BackgroundStyle;
  theme?: BackgroundTheme;
  intensity?: BackgroundIntensity;
  animated?: boolean;
}

const MindPalaceBackground: React.FC<MindPalaceBackgroundProps> = ({ 
  style = 'gradient',
  theme = 'default',
  intensity = 'medium',
  animated = true
}) => {
  // Track whether component is mounted to avoid animation performance issues
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);
  
  // Get opacity based on intensity
  const getOpacity = (): string => {
    switch (intensity) {
      case 'low': return 'opacity-20';
      case 'medium': return 'opacity-30';
      case 'high': return 'opacity-40';
      default: return 'opacity-30';
    }
  };
  
  // Get theme colors for gradients
  const getThemeGradient = (): string => {
    switch (theme) {
      case 'cool':
        return 'from-cyan-500/30 via-blue-500/30 to-indigo-500/30';
      case 'warm':
        return 'from-red-500/30 via-orange-500/30 to-amber-500/30';
      case 'neutral':
        return 'from-gray-500/30 via-slate-500/30 to-zinc-500/30';
      case 'forest':
        return 'from-emerald-500/30 via-green-500/30 to-teal-500/30';
      default:
        return 'from-indigo-500/30 via-purple-500/30 to-pink-500/30';
    }
  };
  
  // Get animation class
  const getAnimationClass = (): string => {
    return animated ? 'animate-gradient' : '';
  };
  
  // Gradient background
  if (style === 'gradient') {
    return (
      <div className="fixed inset-0 -z-10">
        <div className={`absolute inset-0 bg-gradient-to-br ${getThemeGradient()} ${getAnimationClass()}`}></div>
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
      </div>
    );
  }
  
  // Particles background
  if (style === 'particles') {
    return (
      <div className="fixed inset-0 -z-10 bg-gray-900/20 backdrop-blur-sm">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        {isMounted && (
          <div className="absolute inset-0 overflow-hidden">
            {/* Simulated particles with floating divs */}
            {Array.from({ length: 20 }).map((_, index) => (
              <div 
                key={index}
                className={`absolute rounded-full ${getOpacity()} animate-float-particle`}
                style={{
                  width: `${Math.random() * 6 + 2}px`,
                  height: `${Math.random() * 6 + 2}px`,
                  backgroundColor: `${getParticleColor(theme)}`,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${Math.random() * 10 + 10}s`
                }}
              ></div>
            ))}
          </div>
        )}
      </div>
    );
  }
  
  // Parallax background (default)
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Only render animations when component is mounted */}
      {isMounted && (
        <>
          {/* Parallax layer 1 - stars */}
          <div className="absolute inset-0 parallax-layer-1">
            <div className="absolute inset-0 bg-black opacity-10"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0.5px,transparent_0.5px)] bg-[length:24px_24px]"></div>
          </div>
          
          {/* Parallax layer 2 - nebula */}
          <div className="absolute inset-0 parallax-layer-2">
            <div className={`absolute inset-0 bg-gradient-to-br ${getParallaxGradient(theme, 'primary')} to-transparent rounded-full blur-3xl scale-125 translate-x-1/4 -translate-y-1/4`}></div>
            
            <div className={`absolute inset-0 bg-gradient-to-tr ${getParallaxGradient(theme, 'secondary')} to-transparent rounded-full blur-3xl scale-125 -translate-x-1/4 translate-y-1/4`}></div>
          </div>
          
          {/* Parallax layer 3 - distant glow */}
          <div className="absolute inset-0 parallax-layer-3">
            <div className={`absolute left-1/4 top-1/4 w-1/2 h-1/2 bg-gradient-to-br ${getParallaxGradient(theme, 'tertiary')} to-transparent rounded-full blur-2xl`}></div>
              
            <div className={`absolute right-1/4 bottom-1/4 w-1/2 h-1/2 bg-gradient-to-tl ${getParallaxGradient(theme, 'quaternary')} to-transparent rounded-full blur-2xl`}></div>
          </div>
        </>
      )}
      
      {/* Fixed overlay to soften everything */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
    </div>
  );
};

// Helper functions for gradient colors
function getParallaxGradient(theme: BackgroundTheme, position: 'primary' | 'secondary' | 'tertiary' | 'quaternary'): string {
  const gradients = {
    default: {
      primary: 'from-blue-500/20 via-purple-500/20',
      secondary: 'from-pink-500/20 via-indigo-500/20',
      tertiary: 'from-amber-500/10 via-orange-500/10',
      quaternary: 'from-emerald-500/10 via-teal-500/10'
    },
    cool: {
      primary: 'from-blue-500/20 via-cyan-500/20',
      secondary: 'from-indigo-500/20 via-sky-500/20',
      tertiary: 'from-teal-500/10 via-cyan-500/10',
      quaternary: 'from-blue-500/10 via-sky-500/10'
    },
    warm: {
      primary: 'from-red-500/20 via-orange-500/20',
      secondary: 'from-amber-500/20 via-yellow-500/20',
      tertiary: 'from-amber-500/10 via-orange-500/10',
      quaternary: 'from-red-500/10 via-rose-500/10'
    },
    neutral: {
      primary: 'from-gray-500/20 via-slate-500/20',
      secondary: 'from-zinc-500/20 via-stone-500/20',
      tertiary: 'from-gray-500/10 via-slate-500/10',
      quaternary: 'from-zinc-500/10 via-stone-500/10'
    },
    forest: {
      primary: 'from-green-500/20 via-emerald-500/20',
      secondary: 'from-teal-500/20 via-green-500/20',
      tertiary: 'from-emerald-500/10 via-green-500/10',
      quaternary: 'from-lime-500/10 via-teal-500/10'
    }
  };
  
  return gradients[theme][position];
}

function getParticleColor(theme: BackgroundTheme): string {
  switch (theme) {
    case 'cool': return 'rgb(125, 211, 252)'; // sky-300
    case 'warm': return 'rgb(253, 186, 116)'; // orange-300
    case 'neutral': return 'rgb(209, 213, 219)'; // gray-300
    case 'forest': return 'rgb(110, 231, 183)'; // emerald-300
    default: return 'rgb(216, 180, 254)'; // violet-300
  }
}

export default MindPalaceBackground; 