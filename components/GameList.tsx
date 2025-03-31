'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaStar } from 'react-icons/fa';
import type { IGame } from '@/models/Game';

export default function GameList() {
  const [games, setGames] = useState<IGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      const response = await fetch('/api/games');
      if (!response.ok) throw new Error('Failed to fetch games');
      const data = await response.json();
      // Extract the games array from the response
      setGames(data.games || []);
    } catch (err) {
      setError('Failed to load games');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (games.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500 mb-4">No games added yet</p>
        <Link href="/games/new" className="btn-primary">
          Add Your First Game
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {games.map((game) => (
        <Link key={game._id} href={`/games/${game._id}`}>
          <div className="card hover:shadow-xl transition-shadow">
            <div className="relative">
              {game.imageUrl && (
                <img
                  src={game.imageUrl}
                  alt={game.title}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
              )}
              <div className="absolute top-2 right-2 bg-black/50 px-2 py-1 rounded">
                <div className="flex items-center gap-1">
                  <FaStar className="text-yellow-400" />
                  <span>{game.rating}/10</span>
                </div>
              </div>
            </div>
            
            <div className="p-4">
              <h3 className="text-xl font-semibold mb-2">{game.title}</h3>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">{game.platform}</span>
                <span className="px-2 py-1 rounded bg-accent/10 text-accent text-sm">
                  {game.status}
                </span>
              </div>
              {game.hoursPlayed > 0 && (
                <p className="text-sm text-gray-400 mt-2">
                  {game.hoursPlayed} hours played
                </p>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
} 