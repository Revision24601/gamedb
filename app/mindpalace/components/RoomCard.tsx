import React, { useState, useEffect } from 'react';
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
  const [showTooltip, setShowTooltip] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);
  
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
      ${isClicked ? 'animate-roomCardExit' : ''}
      bg-amber-50/70 dark:bg-amber-900/70 backdrop-blur-sm
      rounded-xl overflow-hidden
      border border-amber-800/20 dark:border-amber-200/20
      shadow-md hover:shadow-lg`;
    
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
  
  // Handle mobile tap events
  const handleMobileTap = (e: React.TouchEvent) => {
    if (isMobile && game && !showTooltip) {
      e.preventDefault();
      setShowTooltip(true);
      // Prevent immediate click through
      return false;
    }
    return true;
  };

  return (
    <div
      className={getContainerClasses()}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        if (!isMobile) setShowTooltip(false);
      }}
      onTouchStart={handleMobileTap}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`${room.name} room${game ? ` containing ${game.title}` : ''}`}
    >
      {/* Parchment texture overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-10 bg-repeat bg-[url('data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5z\' fill=\'%236b5237\' fill-opacity=\'1\' fill-rule=\'evenodd\'/%3E%3C/svg%3E')]"></div>
      
      {/* Room Card with Border Glow Effect */}
      <div className={`absolute inset-1 rounded-xl bg-gradient-to-br ${backgroundClass} opacity-40 blur-md transition-opacity ${!room.isLocked && isHovered ? 'opacity-70' : ''}`}></div>
      
      {/* Room Card Main Content */}
      <div className="relative flex flex-col items-center justify-between h-full p-4 z-10">
        <div className="flex flex-col items-center mb-2 z-10">
          {/* Room Icon */}
          <div className={`w-14 h-14 rounded-xl backdrop-blur-md bg-gradient-to-br ${backgroundClass} flex items-center justify-center text-white mb-3 
            shadow-lg shadow-black/20 transition-transform duration-300 ${!room.isLocked && isHovered ? 'scale-110' : ''}`}>
            <RoomIcon className="text-2xl" />
          </div>
          
          {/* Room Name */}
          <h2 className="text-lg font-medium text-center drop-shadow text-amber-900 dark:text-amber-100">{room.name}</h2>
          
          {/* Room Type */}
          <div className="text-xs text-amber-700 dark:text-amber-300 mb-3 opacity-80">
            {room.type !== 'locked' ? room.type : '???'}
          </div>
        </div>
        
        {/* Game Info (if a game is assigned) */}
        {game && (
          <div className="w-full mt-auto">
            <div className="relative">
              {/* Game title with separator */}
              <div className="text-center mb-2">
                <div className="h-px w-10 bg-amber-700/30 mx-auto mb-2"></div>
                <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200 line-clamp-1">
                  {game.title}
                </h3>
              </div>
              
              {/* Platform Badge */}
              <div className="flex justify-center mt-1">
                <span className="inline-block px-2 py-0.5 text-2xs bg-amber-100 dark:bg-amber-800 
                  text-amber-800 dark:text-amber-100 rounded-full text-center">
                  {game.platform || 'Unknown Platform'}
                </span>
              </div>
              
              {/* "Enter Room" Action Button - Shows on Hover */}
              <div className={`absolute inset-x-0 bottom-0 transform transition-all duration-300 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 ${showTooltip ? 'opacity-100 translate-y-0' : ''}`}>
                <button
                  className="w-full py-1.5 px-3 mt-2 bg-amber-100 dark:bg-amber-800 text-amber-800 dark:text-amber-100 
                    rounded-lg flex items-center justify-center gap-1 text-xs font-medium shadow-sm 
                    hover:bg-amber-700 hover:text-amber-50 dark:hover:bg-amber-600 dark:hover:text-amber-50
                    transition-colors"
                  onClick={handleEnterRoom}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  Enter Room
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Locked Room Overlay */}
        {room.isLocked && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-amber-900/20 backdrop-blur-sm rounded-xl">
            <FaLock className="text-2xl text-amber-700 dark:text-amber-300 mb-2" />
            <p className="text-sm text-amber-800 dark:text-amber-200 text-center px-4">
              This room is currently locked
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomCard; 