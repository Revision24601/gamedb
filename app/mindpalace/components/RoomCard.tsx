import React, { useState } from 'react';
import { FaGamepad, FaStar, FaLock, FaArrowRight } from 'react-icons/fa';
import { Room, BaseMindPalaceProps, getRoomBackground, getRoomPattern, getStatusColor } from '../types';
import { IGame } from '@/models/Game';
import { iconComponents } from '../utils/iconMapping';

interface RoomCardProps extends BaseMindPalaceProps {
  room: Room;
  game?: IGame;
  onClick: () => void;
  onEnterRoom: (e: React.MouseEvent, gameId: string) => void;
}

const RoomCard: React.FC<RoomCardProps> = ({
  room,
  game,
  onClick,
  onEnterRoom,
  animationConfig,
  renderMode = 'static'
}) => {
  // Local state for hover and click animations
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  
  // Get the icon component based on room type
  const RoomIcon = iconComponents[room.type] || iconComponents.default;
  
  // Get styling properties
  const backgroundClass = getRoomBackground(room.type);
  const patternClass = getRoomPattern(room.type);
  
  // Get container classes based on render mode and states
  const getContainerClasses = () => {
    const baseClasses = `relative aspect-square cursor-pointer transition-all duration-300 
      ${room.isLocked ? 'opacity-70 grayscale' : ''} 
      ${game ? 'group' : ''}
      ${isClicked ? 'animate-roomCardExit' : ''}`;
    
    switch (renderMode) {
      case 'static':
        return baseClasses;
      case '2d-animated':
        return `${baseClasses} animate-fadeIn`;
      case 'webgl':
        return `${baseClasses} webgl-room`;
      default:
        return baseClasses;
    }
  };
  
  // Handle room click with animation
  const handleClick = () => {
    if (!room.isLocked && game) {
      setIsClicked(true);
      
      // Add a slight delay before executing the actual onClick handler
      setTimeout(() => {
        onClick();
      }, 150);
    } else {
      onClick();
    }
  };
  
  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Enter or space key activates the card
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };
  
  // Handle direct enter room button click
  const handleEnterRoom = (e: React.MouseEvent) => {
    if (game && game._id) {
      setIsClicked(true);
      onEnterRoom(e, game._id);
    }
  };

  return (
    <div 
      className={getContainerClasses()}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onKeyDown={handleKeyDown}
      data-room-id={room.id}
      data-room-type={room.type}
      data-hovered={isHovered}
      data-clicked={isClicked}
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
        transition-all duration-300 ${!room.isLocked && isHovered ? 'translate-y-[-5px] shadow-lg shadow-accent/20' : ''}`}
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
            
            {/* Overlay that appears on hover */}
            <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end items-center pb-4 rounded-lg
              transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
              <button 
                className="px-3 py-1.5 bg-white/90 text-gray-800 hover:bg-white rounded-lg flex items-center text-sm mt-2 font-medium shadow-lg transition-all transform group-hover:scale-105"
                onClick={handleEnterRoom}
              >
                Enter Room <FaArrowRight className="ml-1" />
              </button>
            </div>
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
    </div>
  );
};

export default RoomCard; 