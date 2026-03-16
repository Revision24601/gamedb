'use client';

import { useEffect, useState } from 'react';

export default function BackgroundAnimation() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Slow-moving gradient orbs */}
      <div className="absolute -top-1/4 -left-1/4 w-[600px] h-[600px] rounded-full bg-primary-500/[0.07] dark:bg-primary-500/[0.04] blur-3xl animate-orb1" />
      <div className="absolute -bottom-1/4 -right-1/4 w-[500px] h-[500px] rounded-full bg-accent/[0.06] dark:bg-accent/[0.03] blur-3xl animate-orb2" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-primary-400/[0.04] dark:bg-primary-400/[0.02] blur-3xl animate-orb3" />

      {/* Floating particles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-primary-400/10 dark:bg-primary-400/5"
          style={{
            width: `${2 + Math.random() * 3}px`,
            height: `${2 + Math.random() * 3}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `particleFloat ${15 + Math.random() * 20}s linear infinite`,
            animationDelay: `${Math.random() * 15}s`,
          }}
        />
      ))}

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <style jsx>{`
        @keyframes particleFloat {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: 0.6; }
          90% { opacity: 0.2; }
          100% { transform: translateY(-100vh) translateX(20px); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
