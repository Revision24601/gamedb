'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaStar, FaGamepad, FaClock } from 'react-icons/fa';
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

  if (loading) return (
    <div className="flex justify-center items-center py-16">
      <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-accent border-r-transparent"></div>
      <p className="ml-4 text-gray-600 dark:text-gray-400">Loading your collection...</p>
    </div>
  );
  
  if (error) return (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-6 rounded-xl">
      <p className="text-red-600 dark:text-red-400">{error}</p>
    </div>
  );
  
  if (games.length === 0) {
    return (
      <div className="text-center py-12 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <FaGamepad className="mx-auto h-12 w-12 text-gray-400 mb-3" />
        <h3 className="text-xl font-medium text-gray-800 dark:text-white">Your collection is empty</h3>
        <p className="mt-2 text-gray-500 dark:text-gray-400 max-w-md mx-auto">
          Start building your personal gaming journal by adding the games you love.
        </p>
        <div className="mt-6">
          <Link 
            href="/games/new" 
            className="btn-primary inline-flex items-center shadow-md hover:shadow-lg transition-all duration-200"
          >
            Add Your First Game
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {games.map((game) => (
        <Link 
          key={game._id} 
          href={`/games/${game._id}`}
          className="group"
        >
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transform transition-all duration-300 hover:shadow-md hover:scale-102 hover:-translate-y-1">
            <div className="relative">
              {game.imageUrl ? (
                <img
                  src={game.imageUrl}
                  alt={game.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="flex items-center justify-center h-48 bg-gray-200 dark:bg-gray-700">
                  <FaGamepad className="h-12 w-12 text-gray-400" />
                </div>
              )}
              {game.rating !== undefined && (
                <div className="absolute top-3 right-3 bg-black/60 px-2.5 py-1.5 rounded-full shadow-md">
                  <div className="flex items-center gap-1">
                    <FaStar className="text-yellow-400" />
                    <span className="text-white text-sm font-medium">{game.rating}/10</span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-5">
              <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2 group-hover:text-accent transition-colors">{game.title}</h3>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">{game.platform}</span>
                <span className="px-2.5 py-1 rounded-full bg-accent/10 text-accent text-sm border border-accent/20">
                  {game.status}
                </span>
              </div>
              {game.hoursPlayed > 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 flex items-center">
                  <FaClock className="text-accent mr-1.5" />
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