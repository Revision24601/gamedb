import React, { useState, useCallback } from 'react';
import { Room } from '../types';
import { IGame } from '@/models/Game';
import { useRouter } from 'next/navigation';
import MindPalaceViewport from './MindPalaceViewport';
import RoomDetailModal from './RoomDetailModal';

interface MindPalaceNavigatorProps {
  rooms: Room[];
  getGameForRoom: (room: Room) => IGame | undefined;
}

const MindPalaceNavigator: React.FC<MindPalaceNavigatorProps> = ({
  rooms,
  getGameForRoom,
}) => {
  const router = useRouter();
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isEnteringMemory, setIsEnteringMemory] = useState(false);

  const handleRoomClick = (room: Room) => {
    setSelectedRoom(room);
    setShowModal(true);
  };

  // Navigate with memory-enter transition
  const enterMemory = useCallback((gameId: string) => {
    setIsEnteringMemory(true);
    // Brief transition, then navigate
    setTimeout(() => {
      router.push(`/games/${gameId}`);
    }, 700);
  }, [router]);

  // Navigate from viewport (double-click on focused room)
  const navigateToGame = useCallback((e: React.MouseEvent, gameId: string) => {
    e.preventDefault();
    e.stopPropagation();
    enterMemory(gameId);
  }, [enterMemory]);

  const closeModal = () => {
    setShowModal(false);
    setTimeout(() => setSelectedRoom(null), 300);
  };

  return (
    <div className="relative w-full">
      {/* Main viewport */}
      <MindPalaceViewport
        rooms={rooms}
        getGameForRoom={getGameForRoom}
        handleRoomClick={handleRoomClick}
        navigateToGame={navigateToGame}
      />

      {/* Room detail modal */}
      {selectedRoom && (
        <RoomDetailModal
          room={selectedRoom}
          game={getGameForRoom(selectedRoom)}
          isOpen={showModal}
          onClose={closeModal}
          onEnterRoom={(gameId) => gameId && enterMemory(gameId)}
        />
      )}

      {/* Memory-enter transition overlay */}
      {isEnteringMemory && (
        <div className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center"
          style={{ animation: 'memoryEnterTransition 0.7s ease-out forwards' }}
        >
          {/* Flash */}
          <div className="absolute inset-0 bg-cyan-500/20" style={{ animation: 'memoryFlash 0.7s ease-out forwards' }} />

          {/* Scan line sweep */}
          <div
            className="absolute left-0 right-0 h-[3px]"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.9), transparent)',
              boxShadow: '0 0 30px rgba(0,212,255,0.6)',
              animation: 'bootScanline 0.5s ease-in-out forwards',
            }}
          />

          {/* Center text */}
          <div className="z-10 flex flex-col items-center">
            <div className="w-8 h-8 border-2 border-cyan-500/60 border-t-cyan-400 rounded-full animate-spin mb-3" />
            <span className="font-mono text-xs tracking-[0.3em] text-cyan-400 uppercase">
              Loading Memory
            </span>
          </div>

          {/* Fade to black */}
          <div className="absolute inset-0 bg-black" style={{ animation: 'fadeToBlack 0.7s ease-in 0.3s forwards', opacity: 0 }} />
        </div>
      )}

      {/* Inline keyframes for the transition overlay */}
      <style jsx>{`
        @keyframes memoryEnterTransition {
          0% { opacity: 0; }
          20% { opacity: 1; }
          100% { opacity: 1; }
        }
        @keyframes memoryFlash {
          0% { opacity: 0; }
          15% { opacity: 0.6; }
          40% { opacity: 0.1; }
          100% { opacity: 0; }
        }
        @keyframes fadeToBlack {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default MindPalaceNavigator;
