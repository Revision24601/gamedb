import React, { useEffect, useState } from 'react';

interface EntranceEffectProps {
  onComplete?: () => void;
}

const EntranceEffect: React.FC<EntranceEffectProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<'boot' | 'fadeout' | 'done'>('boot');

  useEffect(() => {
    // Phase 1: boot sequence plays for 2s
    const fadeTimer = setTimeout(() => setPhase('fadeout'), 2000);
    // Phase 2: fade out takes 0.8s, then complete
    const doneTimer = setTimeout(() => {
      setPhase('done');
      onComplete?.();
    }, 2800);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, [onComplete]);

  if (phase === 'done') return null;

  return (
    <div className={`animus-boot ${phase === 'fadeout' ? 'animus-boot-fadeout' : ''}`}>
      {/* Grid materializing */}
      <div className="animus-boot-grid" />

      {/* Scan line sweeping down */}
      <div className="animus-boot-scanline" />

      {/* Center text */}
      <div className="animus-boot-text animus-glitch flex flex-col items-center gap-3 z-10">
        <div className="w-12 h-12 border border-cyan-500/40 rounded-full flex items-center justify-center">
          <div className="w-6 h-6 border border-cyan-500/60 rounded-full animate-pulse" />
        </div>
        <span>Synchronizing Memories</span>
        <div className="flex gap-1 mt-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 bg-cyan-500/60 rounded-full"
              style={{ animation: `statusPulse 1s ease-in-out ${i * 0.15}s infinite` }}
            />
          ))}
        </div>
      </div>

      {/* Corner brackets */}
      <div className="absolute top-6 left-6 w-8 h-8 border-t border-l border-cyan-500/30" />
      <div className="absolute top-6 right-6 w-8 h-8 border-t border-r border-cyan-500/30" />
      <div className="absolute bottom-6 left-6 w-8 h-8 border-b border-l border-cyan-500/30" />
      <div className="absolute bottom-6 right-6 w-8 h-8 border-b border-r border-cyan-500/30" />
    </div>
  );
};

export default EntranceEffect;
