import React from 'react';
import { Room } from '../types';

interface MindPalaceMinimapProps {
  rooms: Room[];
  position: { x: number; y: number };
  canvasSize: { width: number; height: number };
  viewportSize: { width: number; height: number };
  scale: number;
  onMinimapClick: (x: number, y: number) => void;
}

const MindPalaceMinimap: React.FC<MindPalaceMinimapProps> = ({
  rooms,
  position,
  canvasSize,
  viewportSize,
  scale,
  onMinimapClick,
}) => {
  const SIZE = 140;
  const PAD = 8;
  const DOT = 4;

  const wRatio = (SIZE - PAD * 2) / canvasSize.width;
  const hRatio = (SIZE - PAD * 2) / canvasSize.height;
  const mapScale = Math.min(wRatio, hRatio);

  const vpW = viewportSize.width * mapScale;
  const vpH = viewportSize.height * mapScale;
  const vpX = PAD + -position.x * mapScale;
  const vpY = PAD + -position.y * mapScale;

  const handleClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = e.clientX - rect.left - PAD;
    const cy = e.clientY - rect.top - PAD;
    onMinimapClick(-(cx / mapScale - viewportSize.width / 2), -(cy / mapScale - viewportSize.height / 2));
  };

  return (
    <div className="absolute left-4 bottom-20 z-30 rounded-lg overflow-hidden border border-cyan-500/15 bg-black/80 backdrop-blur-sm">
      <div className="relative cursor-pointer" style={{ width: SIZE, height: SIZE }} onClick={handleClick}>
        {/* Grid */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'linear-gradient(to right, rgba(0,212,255,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,212,255,0.1) 1px, transparent 1px)',
          backgroundSize: '10px 10px',
        }} />

        {/* Room dots */}
        {rooms.map((room, i) => {
          const cols = 5;
          const gap = 40;
          const rSize = 220;
          const row = Math.floor(i / cols);
          const col = i % cols;
          const x = PAD + (col * (rSize + gap) + gap + rSize / 2) * mapScale;
          const y = PAD + (row * (rSize + gap) + gap + rSize / 2) * mapScale;
          return (
            <div
              key={room.id}
              className="absolute rounded-full"
              style={{
                width: DOT,
                height: DOT,
                left: x - DOT / 2,
                top: y - DOT / 2,
                backgroundColor: room.isLocked ? '#374151' : '#00d4ff',
                opacity: room.isLocked ? 0.3 : 0.6,
              }}
            />
          );
        })}

        {/* Viewport indicator */}
        <div
          className="absolute border border-cyan-500/50 rounded-sm"
          style={{
            width: vpW,
            height: vpH,
            left: vpX,
            top: vpY,
            transform: `scale(${1 / scale})`,
            transformOrigin: 'center',
          }}
        />
      </div>
      <div className="text-[9px] text-center py-1 font-mono text-gray-500 border-t border-gray-700/30">
        MAP
      </div>
    </div>
  );
};

export default MindPalaceMinimap;
