import React, { useState, useRef } from 'react';
import { FaGamepad, FaStar, FaLock, FaArrowRight, FaStickyNote, FaQuestion } from 'react-icons/fa';
import { Room, getRoomBackground, getRoomPattern, getStatusColor } from '../types';
import { IGame } from '@/models/Game';
import { iconComponents, getIconComponent, ensureAllRoomTypesHaveIcons } from '../utils/iconMapping';
import { useRouter } from 'next/navigation';

interface MindPalaceRoomProps {
  room: Room;
  game?: IGame;
  isMobile: boolean;
}

// Ensure all room types have icons before rendering any component
ensureAllRoomTypesHaveIcons();

const MindPalaceRoom: React.FC<MindPalaceRoomProps> = ({
  room,
  game,
  isMobile
}) => {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Get icon component using the safe helper function
  const RoomIcon = getIconComponent(room.type);
  
  // Get styling properties
  const backgroundClass = getRoomBackground(room.type);
  const patternClass = getRoomPattern(room.type);
  
  // Handle room click to navigate to game detail
  const handleRoomClick = () => {
    if (!room.isLocked && game && game._id) {
      router.push(`/games/${game._id}`);
    }
  };
  
  // Toggle tooltip for mobile
  const handleMobileTap = (e: React.MouseEvent) => {
    if (isMobile && !room.isLocked && game) {
      e.stopPropagation();
      setShowTooltip(!showTooltip);
    }
  };
  
  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleRoomClick();
    }
  };

  return (
    <div 
      className={`relative aspect-square cursor-pointer transition-all duration-300
        ${room.isLocked ? 'opacity-70 grayscale' : ''}
        ${game ? 'group' : ''}
        transform transition-transform duration-300 ease-out
        hover:scale-105 hover:translate-y-[-5px] hover:z-10
        focus-within:scale-105 focus-within:translate-y-[-5px] focus-within:z-10
        ${isHovered ? 'floating-animation shadow-lg shadow-accent/30' : ''}`}
      onClick={handleRoomClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        if (!isMobile) setShowTooltip(false);
      }}
      onTouchStart={handleMobileTap}
      onKeyDown={handleKeyDown}
      ref={cardRef}
      tabIndex={0}
      role="button"
      aria-label={`${room.name} room${game ? ` containing ${game.title}` : ''}`}
    >
      {/* Room Card with Border Glow Effect */}
      <div className={`absolute inset-1 rounded-2xl bg-gradient-to-br ${backgroundClass} opacity-40 blur-md transition-opacity ${!room.isLocked && isHovered ? 'opacity-70' : ''}`}></div>
      
      {/* Room Card Main Content */}
      <div 
        className={`relative h-full backdrop-blur-sm rounded-2xl flex flex-col justify-between 
        border-2 border-white/10 bg-opacity-80 
        ${room.isLocked ? 'bg-gray-700/50 dark:bg-gray-900/50' : 'bg-white/30 dark:bg-gray-800/30'} 
        p-5 overflow-hidden shadow-[inset_0_0_15px_rgba(255,255,255,0.1)] ${patternClass}
        transition-all duration-300`}
      >
        {/* Ornamental Corner Designs */}
        <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-white/20 rounded-tl-xl"></div>
        <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-white/20 rounded-tr-xl"></div>
        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-white/20 rounded-bl-xl"></div>
        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-white/20 rounded-br-xl"></div>
        
        {/* Room Header */}
        <div className="flex flex-col items-center mb-2 z-10">
          {/* Room Icon */}
          <div className={`w-14 h-14 rounded-xl backdrop-blur-md bg-gradient-to-br ${backgroundClass} flex items-center justify-center text-white mb-3 
            shadow-lg shadow-black/20 transition-transform duration-300 ${!room.isLocked && isHovered ? 'scale-110' : ''}`}>
            <RoomIcon className="text-2xl" />
          </div>
          
          {/* Room Name */}
          <h2 className="text-lg font-medium text-center drop-shadow text-gray-800 dark:text-white">{room.name}</h2>
          
          {/* Room Type */}
          <div className="text-xs text-gray-700 dark:text-gray-300 mb-3 opacity-80">
            {room.type !== 'locked' ? room.type : '???'}
          </div>
        </div>
        
        {/* Game Info (if a game is assigned) */}
        {game && (
          <div className="flex-1 flex flex-col items-center justify-center pt-3 relative backdrop-blur-sm rounded-lg bg-white/20 dark:bg-black/20 p-3 border border-white/10">
            {/* Game Placeholder Image */}
            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg mb-2 flex items-center justify-center overflow-hidden ring-0 transition-all duration-300 shadow-md
              group-hover:ring-2 group-hover:ring-white/30">
              {game.imageUrl ? (
                <img 
                  src={game.imageUrl} 
                  alt={game.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <FaGamepad className="text-gray-400 dark:text-gray-500 text-2xl" />
              )}
            </div>
            
            {/* Game Title */}
            <h3 className="text-sm font-medium text-center line-clamp-1 mb-1 text-gray-800 dark:text-white">
              {game.title}
            </h3>
            
            {/* Game Status */}
            <div className={`text-xs px-3 py-1 rounded-full text-white ${getStatusColor(game.status)} mb-1 shadow-sm`}>
              {game.status}
            </div>
            
            {/* Game Rating (if rated) */}
            {game.rating > 0 && (
              <div className="flex items-center space-x-1 text-xs mt-1">
                <FaStar className="text-yellow-500" />
                <span className="text-gray-700 dark:text-gray-300">{game.rating}/10</span>
              </div>
            )}
            
            {/* Note indicator */}
            {game.notes && (
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-amber-400 dark:bg-amber-500 rounded-full flex items-center justify-center shadow-md"
                   title="Has personal reflections">
                <FaStickyNote className="text-xs text-white" />
              </div>
            )}
            
            {/* Personal Reflection Note (if available) */}
            {game.notes && (
              <div className="mt-2 max-h-16 overflow-hidden relative">
                <div className="absolute inset-0 bg-amber-50 dark:bg-amber-900/30 -z-10 rotate-1 rounded"></div>
                <p className="text-xs italic text-gray-700 dark:text-gray-300 font-handwriting p-2 line-clamp-2">
                  {game.notes}
                </p>
              </div>
            )}
          </div>
        )}
        
        {/* Empty Game Placeholder */}
        {!game && !room.isLocked && (
          <div className="flex-1 flex flex-col items-center justify-center border-t border-white/10 pt-3">
            <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
              No game assigned yet
            </div>
          </div>
        )}
        
        {/* Locked Indicator */}
        {room.isLocked && (
          <div className="absolute top-0 right-0 p-2">
            <FaLock className="text-gray-400" />
          </div>
        )}
      </div>
      
      {/* Game Tooltip */}
      {(isHovered || showTooltip) && !room.isLocked && game && (
        <div className="absolute z-20 w-64 bg-white/90 dark:bg-gray-800/90 p-4 rounded-xl shadow-xl border border-white/20 backdrop-blur-sm
          transform transition-all duration-200 ease-out
          animate-fadeIn pointer-events-none
          -translate-y-2"
          style={{
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)'
          }}
        >
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">{game.title}</h4>
          
          <div className="flex justify-between items-center mb-2">
            <span className={`text-xs px-2 py-0.5 rounded-full text-white ${getStatusColor(game.status)}`}>
              {game.status}
            </span>
            
            {game.rating > 0 && (
              <div className="flex items-center text-xs">
                <FaStar className="text-yellow-500 mr-1" />
                <span>{game.rating}/10</span>
              </div>
            )}
          </div>
          
          {game.hoursPlayed > 0 && (
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
              {game.hoursPlayed} {game.hoursPlayed === 1 ? 'hour' : 'hours'} played
            </div>
          )}
          
          {game.notes && (
            <div className="relative mt-3 bg-amber-50 dark:bg-amber-900/30 p-2 rounded rotate-1">
              <p className="text-xs italic text-gray-700 dark:text-gray-300 font-handwriting line-clamp-4">
                {game.notes}
              </p>
            </div>
          )}
          
          <div className="text-xs text-accent mt-2 text-center">
            Click to view game details
          </div>
        </div>
      )}
    </div>
  );
};

export default MindPalaceRoom; 