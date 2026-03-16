import React, { useEffect, useRef, useState } from 'react';
import { FaGamepad, FaStar, FaArrowRight, FaClock } from 'react-icons/fa';
import { Room, BaseMindPalaceProps, getStatusColor } from '../types';
import { IGame } from '@/models/Game';
import { getIconComponent } from '../utils/iconMapping';

interface RoomDetailModalProps extends BaseMindPalaceProps {
  room: Room;
  game?: IGame | undefined;
  isOpen: boolean;
  onClose: () => void;
  onEnterRoom: (gameId: string) => void;
}

const RoomDetailModal: React.FC<RoomDetailModalProps> = ({
  room,
  game,
  isOpen,
  onClose,
  onEnterRoom,
}) => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const RoomIcon = getIconComponent(room.type);
  const statusAccent = game ? getStatusColor(game.status) : '#6b7280';

  // ESC to close + focus management
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen && closeButtonRef.current) closeButtonRef.current.focus();
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Focus trap
  useEffect(() => {
    const handleTab = (e: KeyboardEvent) => {
      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusable.length === 0) return;
        const first = focusable[0] as HTMLElement;
        const last = focusable[focusable.length - 1] as HTMLElement;
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener('keydown', handleTab);
    return () => window.removeEventListener('keydown', handleTab);
  }, []);

  const handleEnterRoom = () => {
    if (game?._id) {
      setIsTransitioning(true);
      setTimeout(() => {
        onEnterRoom(game._id as string);
        setIsTransitioning(false);
      }, 600);
    }
  };

  // Rating stars
  const renderRating = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 10; i++) {
      stars.push(
        <div
          key={i}
          className={`w-2.5 h-2.5 rounded-sm ${i <= rating ? 'bg-yellow-500' : 'bg-gray-700'}`}
          style={i <= rating ? { boxShadow: '0 0 4px rgba(234, 179, 8, 0.4)' } : {}}
        />
      );
    }
    return <div className="flex gap-0.5">{stars}</div>;
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center animus-modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`animus-modal max-w-lg w-full m-4 p-8 ${isTransitioning ? 'animus-modal-exit' : ''}`}
        onClick={(e) => e.stopPropagation()}
        ref={modalRef}
      >
        {/* HUD corners */}
        <div className="hud-corner tl" />
        <div className="hud-corner tr" />
        <div className="hud-corner bl" />
        <div className="hud-corner br" />

        {/* Close button */}
        <button
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded flex items-center justify-center text-gray-500 hover:text-cyan-400 hover:bg-cyan-500/10 border border-transparent hover:border-cyan-500/20 transition-all font-mono text-sm"
          onClick={onClose}
          ref={closeButtonRef}
          aria-label="Close"
        >
          ×
        </button>

        {/* Header */}
        <div className="flex items-center gap-4 mb-6 relative z-10">
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center"
            style={{
              background: `${statusAccent}15`,
              border: `1px solid ${statusAccent}33`,
              color: statusAccent,
            }}
          >
            <RoomIcon className="text-xl" />
          </div>
          <div>
            <h2 className="text-lg font-medium text-gray-100">{room.name}</h2>
            <p className="text-xs font-mono text-gray-500 tracking-wider uppercase">{room.type}</p>
          </div>
        </div>

        <p className="text-sm text-gray-400 mb-6 relative z-10">{room.description}</p>

        {/* Game display */}
        {game && (
          <div
            className="mb-6 rounded-lg overflow-hidden relative z-10"
            style={{
              background: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            <div className="p-5">
              {/* Section label */}
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-4 rounded-full" style={{ backgroundColor: statusAccent }} />
                <span className="text-xs font-mono text-gray-400 tracking-wider uppercase">Memory Data</span>
              </div>

              <div className="flex items-start gap-4">
                {/* Game image */}
                <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border border-gray-700/50">
                  {game.imageUrl ? (
                    <img src={game.imageUrl} alt={game.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-800">
                      <FaGamepad className="text-gray-600 text-2xl" />
                    </div>
                  )}
                </div>

                {/* Game details */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-base font-medium text-gray-100 mb-1">{game.title}</h4>
                  <p className="text-xs font-mono text-gray-500 mb-2">{game.platform}</p>

                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className="text-[10px] px-2 py-0.5 rounded font-mono text-white"
                      style={{ backgroundColor: statusAccent }}
                    >
                      {game.status}
                    </span>
                    {game.hoursPlayed > 0 && (
                      <span className="text-[10px] font-mono text-gray-500 flex items-center gap-1">
                        <FaClock style={{ fontSize: '9px' }} />
                        {game.hoursPlayed}h
                      </span>
                    )}
                  </div>

                  {game.rating > 0 && (
                    <div className="flex items-center gap-2">
                      {renderRating(game.rating)}
                      <span className="text-xs font-mono text-gray-500">{game.rating}/10</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              {game.notes && (
                <div className="mt-4 pt-4 border-t border-gray-700/30">
                  <p className="text-xs font-mono text-gray-500 mb-1 tracking-wider uppercase">Notes</p>
                  <p className="text-sm text-gray-400 italic leading-relaxed">{game.notes}</p>
                </div>
              )}
            </div>

            {/* Memory loading overlay */}
            {isTransitioning && (
              <div className="memory-loading-overlay">
                <div className="w-8 h-8 border-2 border-cyan-500/50 border-t-cyan-400 rounded-full animate-spin mb-3" />
                <span className="text-xs font-mono text-cyan-400 tracking-widest uppercase">
                  Entering Memory...
                </span>
              </div>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex justify-end gap-3 relative z-10">
          <button
            className="px-4 py-2 text-xs font-mono text-gray-400 border border-gray-700 rounded hover:bg-gray-800 transition-colors"
            onClick={onClose}
          >
            Close
          </button>
          {game && (
            <button
              className="px-4 py-2 text-xs font-mono rounded flex items-center gap-2 transition-all"
              style={{
                color: statusAccent,
                border: `1px solid ${statusAccent}44`,
                background: `${statusAccent}11`,
              }}
              onClick={handleEnterRoom}
              onMouseOver={(e) => {
                e.currentTarget.style.background = `${statusAccent}22`;
                e.currentTarget.style.boxShadow = `0 0 15px ${statusAccent}22`;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = `${statusAccent}11`;
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              Enter Memory <FaArrowRight style={{ fontSize: '10px' }} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomDetailModal;
