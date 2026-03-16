import React, { useState } from 'react';
import { FaGamepad, FaStar, FaLock } from 'react-icons/fa';
import { Room, BaseMindPalaceProps, getStatusColor } from '../types';
import { IGame } from '@/models/Game';
import { getIconComponent } from '../utils/iconMapping';

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
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const RoomIcon = getIconComponent(room.type);
  const statusAccent = game ? getStatusColor(game.status) : '#6b7280';

  const handleEnterRoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (game && game._id) onEnterRoom(e, game._id);
  };

  // Rating as percentage for the ring
  const ratingPercent = game && game.rating > 0 ? (game.rating / 10) * 100 : 0;
  const circumference = 2 * Math.PI * 38; // radius = 38
  const strokeDashoffset = circumference - (ratingPercent / 100) * circumference;

  if (room.isLocked) {
    return (
      <div className="memory-node opacity-50 flex items-center justify-center" onClick={onClick}>
        <div className="memory-node-corner tl" />
        <div className="memory-node-corner tr" />
        <div className="memory-node-corner bl" />
        <div className="memory-node-corner br" />
        <div className="flex flex-col items-center gap-2 text-gray-600">
          <FaLock className="text-lg" />
          <span className="text-[10px] font-mono tracking-wider uppercase">{room.name}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="memory-node"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="button"
      tabIndex={0}
      aria-label={`${room.name}${game ? ` — ${game.title}` : ''}`}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } }}
    >
      {/* Corner decorations */}
      <div className="memory-node-corner tl" style={{ borderColor: `${statusAccent}44` }} />
      <div className="memory-node-corner tr" style={{ borderColor: `${statusAccent}44` }} />
      <div className="memory-node-corner bl" style={{ borderColor: `${statusAccent}44` }} />
      <div className="memory-node-corner br" style={{ borderColor: `${statusAccent}44` }} />

      {/* Content */}
      <div className="relative flex flex-col items-center justify-center h-full p-3 z-10">
        {game ? (
          <>
            {/* Game image with rating ring */}
            <div className="relative mb-2">
              <div className="w-[84px] h-[84px] rounded-full overflow-hidden border border-gray-700/50 relative">
                {game.imageUrl ? (
                  <img
                    src={game.imageUrl}
                    alt={game.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-800">
                    <FaGamepad className="text-gray-600 text-xl" />
                  </div>
                )}
              </div>

              {/* Rating ring overlay */}
              {ratingPercent > 0 && (
                <svg className="absolute inset-0 w-[84px] h-[84px]" viewBox="0 0 84 84" style={{ transform: 'rotate(-90deg)' }}>
                  {/* Background ring */}
                  <circle cx="42" cy="42" r="38" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="2" />
                  {/* Rating ring */}
                  <circle
                    cx="42" cy="42" r="38"
                    fill="none"
                    stroke={statusAccent}
                    strokeWidth="2"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-500"
                    style={{ filter: `drop-shadow(0 0 4px ${statusAccent})` }}
                  />
                </svg>
              )}

              {/* Status dot */}
              <div
                className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full status-pulse border border-black"
                style={{ backgroundColor: statusAccent, boxShadow: `0 0 6px ${statusAccent}` }}
              />
            </div>

            {/* Game title */}
            <h3 className="text-[11px] font-mono text-gray-200 text-center line-clamp-2 leading-tight mb-1">
              {game.title}
            </h3>

            {/* Platform + rating */}
            <div className="flex items-center gap-2 text-[9px] font-mono text-gray-500">
              {game.rating > 0 && (
                <span className="flex items-center gap-0.5">
                  <FaStar className="text-yellow-500" style={{ fontSize: '8px' }} />
                  {game.rating}
                </span>
              )}
              {game.hoursPlayed > 0 && (
                <span>{game.hoursPlayed}h</span>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Room type icon (no game assigned) */}
            <div className="w-10 h-10 rounded-lg bg-gray-800/50 border border-gray-700/30 flex items-center justify-center mb-2">
              <RoomIcon className="text-gray-500 text-sm" />
            </div>
            <span className="text-[10px] font-mono text-gray-600 tracking-wider">{room.name}</span>
          </>
        )}
      </div>

      {/* Hover HUD tooltip */}
      {isHovered && game && (
        <div
          className="absolute z-30 w-56 p-4 rounded-lg animate-fadeIn pointer-events-none"
          style={{
            top: '105%',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(6, 10, 18, 0.95)',
            border: '1px solid rgba(0, 212, 255, 0.2)',
            boxShadow: '0 0 30px rgba(0, 0, 0, 0.5), 0 0 15px rgba(0, 212, 255, 0.1)',
          }}
        >
          <div className="hud-corner tl" />
          <div className="hud-corner tr" />
          <div className="hud-corner bl" />
          <div className="hud-corner br" />

          <h4 className="text-sm text-gray-100 font-medium mb-2">{game.title}</h4>

          <div className="flex items-center gap-2 mb-2">
            <span
              className="text-[10px] px-2 py-0.5 rounded font-mono text-white"
              style={{ backgroundColor: statusAccent }}
            >
              {game.status}
            </span>
            {game.rating > 0 && (
              <span className="text-[10px] font-mono text-gray-400 flex items-center gap-0.5">
                <FaStar className="text-yellow-500" style={{ fontSize: '9px' }} />
                {game.rating}/10
              </span>
            )}
          </div>

          <div className="text-[10px] font-mono text-gray-500 space-y-1">
            <p>{game.platform}</p>
            {game.hoursPlayed > 0 && <p>{game.hoursPlayed} hours played</p>}
          </div>

          {game.notes && (
            <p className="text-[10px] text-gray-400 mt-2 italic line-clamp-2 border-t border-gray-700/50 pt-2">
              {game.notes}
            </p>
          )}

          <p className="text-[9px] text-cyan-500/60 mt-2 text-center font-mono tracking-wider">
            CLICK TO FOCUS
          </p>
        </div>
      )}
    </div>
  );
};

export default RoomCard;
