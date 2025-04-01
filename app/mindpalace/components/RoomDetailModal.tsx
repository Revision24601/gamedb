import React from 'react';
import { FaGamepad, FaStar, FaArrowRight } from 'react-icons/fa';
import { Room, BaseMindPalaceProps, getRoomBackground } from '../types';
import { IGame } from '@/models/Game';
import { iconComponents } from '../utils/iconMapping';

interface RoomDetailModalProps extends BaseMindPalaceProps {
  room: Room;
  game: IGame | null;
  isTransitioning: boolean;
  onClose: () => void;
  onEnterRoom: (e: React.MouseEvent) => void;
}

// Helper for rendering star ratings
const renderRatingStars = (rating: number) => {
  const stars = [];
  const fullStars = Math.floor(rating / 2);
  const hasHalfStar = rating % 2 >= 1;
  
  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push(<FaStar key={i} className="text-yellow-500" />);
    } else if (i === fullStars && hasHalfStar) {
      stars.push(<FaStar key={i} className="text-yellow-500 opacity-50" />);
    } else {
      stars.push(<FaStar key={i} className="text-gray-300" />);
    }
  }
  
  return (
    <div className="flex space-x-1">
      {stars}
      <span className="ml-2 text-sm font-medium">{rating}/10</span>
    </div>
  );
};

// Get status badge color
const getStatusColor = (status: string): string => {
  switch (status) {
    case 'Playing': return 'bg-blue-500';
    case 'Completed': return 'bg-green-500';
    case 'On Hold': return 'bg-yellow-500';
    case 'Dropped': return 'bg-red-500';
    case 'Plan to Play': return 'bg-purple-500';
    default: return 'bg-gray-500';
  }
};

const RoomDetailModal: React.FC<RoomDetailModalProps> = ({
  room,
  game,
  isTransitioning,
  onClose,
  onEnterRoom,
  animationConfig,
  renderMode = 'static'
}) => {
  // Get the icon component for the room type
  const RoomIcon = iconComponents[room.type] || iconComponents.default;
  
  // Get container classes based on render mode and transition state
  const getContainerClasses = () => {
    const baseClasses = `fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50`;
    
    switch (renderMode) {
      case 'static':
        return baseClasses;
      case '2d-animated':
        return `${baseClasses} animate-fadeIn`;
      case 'webgl':
        return `${baseClasses} webgl-modal-backdrop`;
      default:
        return baseClasses;
    }
  };
  
  // Get modal panel classes
  const getModalClasses = () => {
    const baseClasses = `max-w-lg w-full m-4 transition-all duration-500 ${isTransitioning ? 'scale-110 opacity-0' : 'scale-100 opacity-100'} 
    relative overflow-hidden rounded-2xl border-2 border-white/20 bg-white/90 dark:bg-gray-800/90 p-8 backdrop-blur-sm shadow-2xl`;
    
    switch (renderMode) {
      case 'static':
        return baseClasses;
      case '2d-animated':
        return `${baseClasses} animate-zoomIn`;
      case 'webgl':
        return `${baseClasses} webgl-modal`;
      default:
        return baseClasses;
    }
  };
  
  // For future WebGL/Canvas implementation
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
      }
    }
  }, [renderMode]);

  return (
    <div 
      className={getContainerClasses()}
      onClick={onClose}
      data-room-id={room.id}
      data-room-type={room.type}
    >
      {/* WebGL canvas - hidden in static mode */}
      {renderMode === 'webgl' && (
        <canvas 
          ref={canvasRef}
          className="absolute inset-0 -z-10 opacity-0"
          width="1000"
          height="1000"
        />
      )}
      
      <div 
        className={getModalClasses()}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative corners */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-accent/30 rounded-tl-xl"></div>
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-accent/30 rounded-tr-xl"></div>
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-accent/30 rounded-bl-xl"></div>
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-accent/30 rounded-br-xl"></div>
          
        <div className="flex items-center mb-6">
          <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${getRoomBackground(room.type)} flex items-center justify-center text-white mr-4 shadow-lg`}>
            <RoomIcon className="text-2xl" />
          </div>
          <h2 className="journal-section m-0">{room.name}</h2>
        </div>
        
        <p className="journal-text mb-6">{room.description}</p>
        
        {/* Game Display */}
        {game && (
          <div className="mb-6 bg-white/70 dark:bg-gray-900/70 rounded-xl shadow-md relative overflow-hidden border border-white/20 backdrop-blur-sm">
            <div className="p-5">
              <h3 className="text-lg font-semibold mb-4 pl-2 border-l-4 border-accent">Featured Game</h3>
              
              <div className="flex items-start">
                {/* Game Image */}
                <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-lg mr-4 flex items-center justify-center overflow-hidden shadow-md border-2 border-white/10">
                  {game.imageUrl ? (
                    <img 
                      src={game.imageUrl} 
                      alt={game.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FaGamepad className="text-gray-400 dark:text-gray-500 text-3xl" />
                  )}
                </div>
                
                {/* Game Details */}
                <div className="flex-1">
                  <h4 className="font-medium text-lg text-gray-900 dark:text-white">{game.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Platform: {game.platform}
                  </p>
                  <div className="flex items-center mt-2">
                    <span className={`inline-block px-3 py-1 text-xs rounded-full text-white ${getStatusColor(game.status)} shadow-sm`}>
                      {game.status}
                    </span>
                  </div>
                  
                  {game.rating > 0 && (
                    <div className="mt-2 flex items-center">
                      {renderRatingStars(game.rating)}
                    </div>
                  )}
                  
                  {game.hoursPlayed > 0 && (
                    <p className="text-sm mt-2 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded inline-block">
                      {game.hoursPlayed} {game.hoursPlayed === 1 ? 'hour' : 'hours'} played
                    </p>
                  )}
                </div>
              </div>
              
              {/* Game Notes */}
              {game.notes && (
                <div className="mt-5 bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h5 className="text-sm font-medium mb-2 text-gray-900 dark:text-white flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Your Notes:
                  </h5>
                  <p className="text-sm bg-white dark:bg-gray-900 p-3 rounded border border-gray-100 dark:border-gray-800 text-gray-700 dark:text-gray-300 font-light italic">
                    {game.notes}
                  </p>
                </div>
              )}
            </div>
            
            {/* Entering Room Message */}
            {isTransitioning && (
              <div className="absolute inset-0 bg-accent/90 flex flex-col items-center justify-center text-white transition-opacity duration-500">
                <div className="animate-pulse text-2xl mb-2">Entering Room...</div>
                <div className="text-sm">Traveling to {game.title}</div>
              </div>
            )}
          </div>
        )}
        
        <div className="bg-white/50 dark:bg-gray-700/50 p-5 rounded-xl mb-6 border border-gray-200/50 dark:border-gray-600/50 backdrop-blur-sm">
          <h3 className="font-semibold mb-2 text-gray-900 dark:text-white flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Future Functionality
          </h3>
          <p className="text-sm italic text-gray-700 dark:text-gray-300">
            In the full version, this room will contain:
          </p>
          <ul className="list-disc pl-5 mt-2 text-sm space-y-1 text-gray-700 dark:text-gray-300">
            <li>Interactive 3D space to organize game memories</li>
            <li>Notes and reflection tools specific to this room's purpose</li>
            <li>Visual connections to related games in your collection</li>
            <li>Custom organization system for your thoughts</li>
          </ul>
        </div>
        
        <div className="flex justify-end">
          {game ? (
            <button 
              className="px-5 py-2.5 bg-gradient-to-r from-accent to-accent/80 text-white rounded-lg flex items-center shadow-lg hover:shadow-accent/20 transition-all"
              onClick={onEnterRoom}
            >
              Enter Room <FaArrowRight className="ml-2" />
            </button>
          ) : (
            <button 
              className="px-5 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white rounded-lg shadow-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomDetailModal; 