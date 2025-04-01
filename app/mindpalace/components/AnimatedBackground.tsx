import React, { useState, useEffect } from 'react';

interface AnimatedBackgroundProps {
  style: 'gradient' | 'parallax';
  intensity?: 'low' | 'medium' | 'high';
  theme?: 'default' | 'cool' | 'warm' | 'neutral';
}

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ 
  style,
  intensity = 'medium',
  theme = 'default'
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
      default:
        return 'from-indigo-500/30 via-purple-500/30 to-pink-500/30';
    }
  };
  
  // Gradient background
  if (style === 'gradient') {
    return (
      <div className="fixed inset-0 -z-10">
        <div className={`absolute inset-0 bg-gradient-to-br ${getThemeGradient()} animate-gradient`}></div>
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
      </div>
    );
  }
  
  // Parallax background
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
            <div className={`absolute inset-0 bg-gradient-to-br ${theme === 'cool' ? 'from-blue-500/20 via-cyan-500/20' : 
              theme === 'warm' ? 'from-red-500/20 via-orange-500/20' : 
              theme === 'neutral' ? 'from-gray-500/20 via-slate-500/20' : 
              'from-blue-500/20 via-purple-500/20'} to-transparent rounded-full blur-3xl scale-125 translate-x-1/4 -translate-y-1/4`}></div>
            
            <div className={`absolute inset-0 bg-gradient-to-tr ${theme === 'cool' ? 'from-indigo-500/20 via-sky-500/20' : 
              theme === 'warm' ? 'from-amber-500/20 via-yellow-500/20' : 
              theme === 'neutral' ? 'from-zinc-500/20 via-stone-500/20' : 
              'from-pink-500/20 via-indigo-500/20'} to-transparent rounded-full blur-3xl scale-125 -translate-x-1/4 translate-y-1/4`}></div>
          </div>
          
          {/* Parallax layer 3 - distant glow */}
          <div className="absolute inset-0 parallax-layer-3">
            <div className={`absolute left-1/4 top-1/4 w-1/2 h-1/2 bg-gradient-to-br ${theme === 'cool' ? 'from-teal-500/10 via-cyan-500/10' : 
              theme === 'warm' ? 'from-amber-500/10 via-orange-500/10' : 
              theme === 'neutral' ? 'from-gray-500/10 via-slate-500/10' : 
              'from-amber-500/10 via-orange-500/10'} to-transparent rounded-full blur-2xl`}></div>
              
            <div className={`absolute right-1/4 bottom-1/4 w-1/2 h-1/2 bg-gradient-to-tl ${theme === 'cool' ? 'from-blue-500/10 via-sky-500/10' : 
              theme === 'warm' ? 'from-red-500/10 via-rose-500/10' : 
              theme === 'neutral' ? 'from-zinc-500/10 via-stone-500/10' : 
              'from-emerald-500/10 via-teal-500/10'} to-transparent rounded-full blur-2xl`}></div>
          </div>
        </>
      )}
      
      {/* Fixed overlay to soften everything */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
    </div>
  );
};

export default AnimatedBackground; 