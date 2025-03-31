'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaClock, FaGamepad, FaStar, FaCalendarAlt } from 'react-icons/fa';
import type { IGame } from '@/models/Game';

export default function NowPlayingDetail() {
  const [games, setGames] = useState<IGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPlayingGames = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/games?status=Playing');
        if (!response.ok) {
          throw new Error('Failed to fetch games');
        }
        const data = await response.json();
        
        // Sort by hours played (descending)
        const sortedGames = [...(data.games || [])].sort((a, b) => 
          (b.hoursPlayed || 0) - (a.hoursPlayed || 0)
        ).slice(0, 6); // Limit to top 6
        
        setGames(sortedGames);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching playing games:', err);
        setError('Failed to load games');
        setLoading(false);
      }
    };

    fetchPlayingGames();
  }, []);

  // Function to calculate progress percentage based on hours played
  const calculateProgress = (game: IGame) => {
    const estimatedTotal = 40;
    const hoursPlayed = game.hoursPlayed || 0;
    const percentage = Math.min(Math.round((hoursPlayed / estimatedTotal) * 100), 100);
    return percentage;
  };

  // Function to format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="my-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-48 rounded-md bg-gray-200 dark:bg-gray-700"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-8">
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg shadow p-4">
          <p className="text-red-800 dark:text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div className="my-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">You don't have any games in progress right now.</p>
          <Link 
            href="/games/new" 
            className="inline-flex items-center justify-center bg-accent hover:bg-accent-dark text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Add Your First Game
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="my-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {games.map((game) => (
          <Link 
            key={game._id} 
            href={`/games/${game._id}`}
            className="block h-full"
            data-cy="now-playing-detail-item"
          >
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow h-full hover:shadow-md transition-shadow duration-200 overflow-hidden">
              <div className="flex h-full">
                {/* Game image or placeholder */}
                <div className="w-1/3 relative">
                  {game.imageUrl ? (
                    <Image 
                      src={game.imageUrl} 
                      alt={game.title} 
                      fill 
                      sizes="33vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gray-200 dark:bg-gray-700">
                      <FaGamepad className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                    </div>
                  )}
                </div>
                
                {/* Game details */}
                <div className="w-2/3 p-4">
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-1 line-clamp-2">
                    {game.title}
                  </h3>
                  
                  <div className="space-y-2 mt-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                      <span className="inline-block w-20">Platform:</span> 
                      <span className="font-medium text-gray-800 dark:text-gray-200">{game.platform}</span>
                    </p>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                      <FaClock className="mr-2 text-accent" />
                      <span className="inline-block w-20">Playtime:</span>
                      <span className="font-medium text-gray-800 dark:text-gray-200">{game.hoursPlayed?.toFixed(1) || 0} hours</span>
                    </p>
                    
                    {game.rating !== null && game.rating !== undefined && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                        <FaStar className="mr-2 text-yellow-500" />
                        <span className="inline-block w-20">Rating:</span>
                        <span className="font-medium text-gray-800 dark:text-gray-200">{game.rating}/10</span>
                      </p>
                    )}
                    
                    {(game.updatedAt || game.createdAt) && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                        <FaCalendarAlt className="mr-2 text-gray-500" />
                        <span className="inline-block w-20">Updated:</span>
                        <span className="font-medium text-gray-800 dark:text-gray-200">
                          {formatDate(game.updatedAt || game.createdAt)}
                        </span>
                      </p>
                    )}
                  </div>
                  
                  {/* Progress bar */}
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-accent rounded-full h-2" 
                        style={{ width: `${calculateProgress(game)}%` }}
                        data-cy="progress-bar-detail"
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs mt-1 text-gray-500 dark:text-gray-400">
                      <span>Progress</span>
                      <span>{calculateProgress(game)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
} 