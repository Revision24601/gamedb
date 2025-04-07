import React from 'react';
import { Room } from '../types';

interface MindPalaceMinimapProps {
  rooms: Room[];
  position: { x: number, y: number };
  canvasSize: { width: number, height: number };
  viewportSize: { width: number, height: number };
  scale: number;
  onMinimapClick: (x: number, y: number) => void;
}

const MindPalaceMinimap: React.FC<MindPalaceMinimapProps> = ({
  rooms,
  position,
  canvasSize,
  viewportSize,
  scale,
  onMinimapClick
}) => {
  // Minimap configuration
  const MINIMAP_SIZE = 150;
  const MINIMAP_PADDING = 10;
  const ROOM_DOT_SIZE = 6;
  
  // Calculate scaling factors
  const widthRatio = (MINIMAP_SIZE - MINIMAP_PADDING * 2) / canvasSize.width;
  const heightRatio = (MINIMAP_SIZE - MINIMAP_PADDING * 2) / canvasSize.height;
  const minimapScale = Math.min(widthRatio, heightRatio);
  
  // Calculate scaled viewport dimensions
  const scaledViewportWidth = viewportSize.width * minimapScale;
  const scaledViewportHeight = viewportSize.height * minimapScale;
  
  // Calculate viewport position in minimap coordinates
  const viewportX = MINIMAP_PADDING + (-position.x * minimapScale);
  const viewportY = MINIMAP_PADDING + (-position.y * minimapScale);
  
  // Handle minimap click
  const handleMinimapClick = (e: React.MouseEvent) => {
    const minimapRect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - minimapRect.left - MINIMAP_PADDING;
    const clickY = e.clientY - minimapRect.top - MINIMAP_PADDING;
    
    // Convert minimap coordinates to canvas coordinates
    const canvasX = -(clickX / minimapScale - viewportSize.width / 2);
    const canvasY = -(clickY / minimapScale - viewportSize.height / 2);
    
    onMinimapClick(canvasX, canvasY);
  };
  
  // Calculate room positions in minimap coordinates
  const getRoomPosition = (roomIndex: number) => {
    const GRID_COLUMNS = 5;
    const ROOM_SIZE = 220;
    const ROOM_GAP = 40;
    
    const row = Math.floor(roomIndex / GRID_COLUMNS);
    const col = roomIndex % GRID_COLUMNS;
    
    const x = col * (ROOM_SIZE + ROOM_GAP) + ROOM_GAP + ROOM_SIZE / 2;
    const y = row * (ROOM_SIZE + ROOM_GAP) + ROOM_GAP + ROOM_SIZE / 2;
    
    return {
      x: MINIMAP_PADDING + x * minimapScale,
      y: MINIMAP_PADDING + y * minimapScale
    };
  };
  
  return (
    <div className="absolute left-4 bottom-4 z-50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden">
      {/* Minimap container */}
      <div 
        className="relative cursor-pointer"
        style={{ 
          width: `${MINIMAP_SIZE}px`, 
          height: `${MINIMAP_SIZE}px` 
        }}
        onClick={handleMinimapClick}
      >
        {/* Grid pattern background */}
        <div className="absolute inset-0 viewport-grid opacity-30"></div>
        
        {/* Room dots */}
        {rooms.map((room, index) => {
          const pos = getRoomPosition(index);
          return (
            <div 
              key={room.id}
              className="absolute rounded-full bg-accent/70"
              style={{
                width: `${ROOM_DOT_SIZE}px`,
                height: `${ROOM_DOT_SIZE}px`,
                left: pos.x - ROOM_DOT_SIZE / 2,
                top: pos.y - ROOM_DOT_SIZE / 2,
                opacity: room.isLocked ? 0.3 : 0.7
              }}
            />
          );
        })}
        
        {/* Current viewport indicator */}
        <div 
          className="absolute border-2 border-accent rounded"
          style={{
            width: `${scaledViewportWidth}px`,
            height: `${scaledViewportHeight}px`,
            left: `${viewportX}px`,
            top: `${viewportY}px`,
            transform: `scale(${1/scale})`,
            transformOrigin: 'center'
          }}
        >
          {/* Current position indicator */}
          <div className="absolute left-1/2 top-1/2 w-2 h-2 bg-accent rounded-full -translate-x-1/2 -translate-y-1/2 animate-minimap-blip"></div>
        </div>
      </div>
      
      {/* Caption */}
      <div className="text-xs text-center py-1 px-2 text-gray-600 dark:text-gray-300 border-t border-gray-200 dark:border-gray-700">
        Navigate
      </div>
    </div>
  );
};

export default MindPalaceMinimap; 