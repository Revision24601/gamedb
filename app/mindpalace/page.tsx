'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { IGame } from '@/models/Game';

// Import modular components
import MindPalaceHeader from './components/MindPalaceHeader';
import MindPalaceNavigator from './components/MindPalaceNavigator';

// Import room types
import { Room, RoomType } from './types';

// Import animations
import './animations.css';

export default function MindPalace() {
  const [allRooms, setAllRooms] = useState<Room[]>([]);
  const [games, setGames] = useState<IGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch games when component mounts
  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/games');
        if (!response.ok) throw new Error('Failed to fetch games');
        const data = await response.json();
        const gamesData = data.games || [];
        setGames(gamesData);
        initializeRooms(gamesData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching games:', err);
        setError('Failed to load games');
        setLoading(false);
        initializeRooms([]);
      }
    };
    fetchGames();
  }, []);

  // Initialize rooms with games
  const initializeRooms = (gamesData: IGame[]) => {
    const roomTypes: { type: RoomType; name: string; description: string }[] = [
      { type: 'study', name: 'Analysis', description: 'Deep analysis of game mechanics and systems.' },
      { type: 'library', name: 'Archive', description: 'Collection of game lore and narrative elements.' },
      { type: 'garden', name: 'Reflection', description: 'Aesthetic appreciation and visual design memories.' },
      { type: 'workshop', name: 'Workshop', description: 'Game systems and design analysis.' },
      { type: 'gallery', name: 'Gallery', description: 'Memorable moments and visual memories.' },
      { type: 'theater', name: 'Theater', description: 'Story moments and narrative techniques.' },
      { type: 'trophy', name: 'Trophy Vault', description: 'Achievements and milestones.' },
      { type: 'archive', name: 'Chronicle', description: 'Historical record of your gaming journey.' },
    ];

    const initialRooms: Room[] = [];
    let roomId = 1;

    gamesData.forEach((game, index) => {
      const roomType = roomTypes[index % roomTypes.length];
      initialRooms.push({
        id: roomId++,
        name: roomType.name,
        type: roomType.type,
        description: roomType.description,
        isLocked: false,
        gameId: game._id,
      });
    });

    // One locked "expansion" room
    initialRooms.push({
      id: roomId,
      name: 'Undiscovered',
      type: 'locked',
      description: 'Future expansion of your Mind Palace.',
      isLocked: true,
    });

    setAllRooms(initialRooms);
  };

  const getGameForRoom = (room: Room): IGame | undefined => {
    if (!room.gameId) return undefined;
    return games.find((game) => game._id === room.gameId);
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="animus-page">
          <div className="animus-page-bg" />
          <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="flex flex-col items-center justify-center h-[60vh]">
              <div className="w-10 h-10 border-2 border-cyan-500/50 border-t-cyan-400 rounded-full animate-spin mb-4" />
              <p className="font-mono text-xs tracking-widest text-cyan-500/60 uppercase">
                Loading memories...
              </p>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="animus-page">
        <div className="animus-page-bg" />
        <div className="max-w-6xl mx-auto px-4 py-6 animus-page-container">
          {/* Header */}
          <MindPalaceHeader />

          {/* Error state */}
          {error && (
            <div className="mb-4 px-4 py-3 rounded border border-red-500/30 bg-red-500/10 text-red-400 text-sm font-mono">
              {error}
            </div>
          )}

          {/* Navigator (contains the viewport + modal) */}
          <MindPalaceNavigator rooms={allRooms} getGameForRoom={getGameForRoom} />
        </div>
      </main>
    </>
  );
}
