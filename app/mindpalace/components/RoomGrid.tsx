import React from 'react';
import { Room, BaseMindPalaceProps } from '../types';
import { IGame } from '@/models/Game';
import RoomCard from './RoomCard';

interface RoomGridProps extends BaseMindPalaceProps {
  rooms: Room[];
  getGameForRoom: (room: Room) => IGame | undefined;
  handleRoomClick: (room: Room) => void;
  navigateToGame: (e: React.MouseEvent, gameId: string) => void;
  columns?: number;
  gap?: number;
}

const RoomGrid: React.FC<RoomGridProps> = ({
  rooms,
  getGameForRoom,
  handleRoomClick,
  navigateToGame,
  columns = 3,
  gap = 8,
  animationConfig,
  renderMode = 'static'
}) => {
  // Helper to get container CSS classes based on render mode
  const getContainerClasses = () => {
    // Base grid class with responsive columns
    const baseClasses = `grid grid-cols-1 sm:grid-cols-2 md:grid-cols-${columns} gap-${gap}`;
    
    switch (renderMode) {
      case 'static':
        return baseClasses;
      case '2d-animated':
        return `${baseClasses} animate-fadeIn`;
      case 'webgl':
        return `${baseClasses} webgl-grid`;
      default:
        return baseClasses;
    }
  };

  // For future webGL/canvas implementation
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  
  React.useEffect(() => {
    // Only initialize canvas if in webGL mode
    if (renderMode === 'webgl' && canvasRef.current) {
      // WebGL initialization would go here
      // This is just a placeholder for future implementation
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        // Basic canvas setup - would be replaced with WebGL in the future
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = 'rgba(0, 0, 0, 0.1)';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw placeholder for each room
        rooms.forEach((room, index) => {
          const x = (index % columns) * (canvas.width / columns);
          const y = Math.floor(index / columns) * (canvas.height / (Math.ceil(rooms.length / columns)));
          const width = canvas.width / columns - gap;
          const height = width;
          
          context.fillStyle = 'rgba(255, 255, 255, 0.2)';
          context.fillRect(x, y, width, height);
        });
      }
    }
  }, [rooms, renderMode, columns, gap]);

  return (
    <>
      {/* WebGL canvas - hidden in static mode, but ready for future implementation */}
      {renderMode === 'webgl' && (
        <canvas 
          ref={canvasRef}
          className="absolute inset-0 -z-10 opacity-0"
          width="1000"
          height="1000"
        />
      )}
      
      {/* Grid of room cards */}
      <div 
        className={getContainerClasses()}
        data-render-mode={renderMode}
      >
        {rooms.map(room => {
          const game = getGameForRoom(room);
          
          return (
            <RoomCard
              key={room.id}
              room={room}
              game={game}
              onClick={() => handleRoomClick(room)}
              onEnterRoom={navigateToGame}
              renderMode={renderMode}
              animationConfig={animationConfig}
            />
          );
        })}
      </div>
    </>
  );
};

export default RoomGrid; 