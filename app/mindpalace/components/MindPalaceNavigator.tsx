import React, { useState } from 'react';
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
  
  // Handle clicking a room
  const handleRoomClick = (room: Room) => {
    setSelectedRoom(room);
    setShowModal(true);
  };
  
  // Navigate to game details page
  const navigateToGame = (e: React.MouseEvent, gameId: string) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/games/${gameId}`);
  };
  
  // Close room detail modal
  const closeModal = () => {
    setShowModal(false);
    setTimeout(() => setSelectedRoom(null), 300); // Wait for animation to finish
  };
  
  return (
    <div className="relative w-full">
      {/* Main viewport for rooms */}
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
          onEnterRoom={gameId => gameId && router.push(`/games/${gameId}`)}
        />
      )}
    </div>
  );
};

export default MindPalaceNavigator; 