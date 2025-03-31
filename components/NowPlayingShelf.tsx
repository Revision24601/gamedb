'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaClock, FaGamepad, FaChevronRight } from 'react-icons/fa';
import type { IGame } from '@/models/Game';
import styles from '@/styles/scrollbar.module.css';
import { useTheme } from 'next-themes';

export default function NowPlayingShelf() {
  const [games, setGames] = useState<IGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { theme } = useTheme();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Handle touch and mouse scrolling
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll speed multiplier
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  useEffect(() => {
    const fetchPlayingGames = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/games?status=Playing');
        if (!response.ok) {
          throw new Error('Failed to fetch games');
        }
        const data = await response.json();
        
        // Sort by last updated or added date (most recent first)
        // Assuming games have updatedAt or createdAt fields
        const sortedGames = [...(data.games || [])].sort((a, b) => {
          const dateA = new Date(a.updatedAt || a.createdAt || 0);
          const dateB = new Date(b.updatedAt || b.createdAt || 0);
          return dateB.getTime() - dateA.getTime();
        });
        
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
  // This is a simple implementation - you might want to adjust based on your app's logic
  const calculateProgress = (game: IGame) => {
    // Assuming games typically take around 30-40 hours to complete
    // You could customize this logic based on game type or add a "total hours" field
    const estimatedTotal = 40;
    const hoursPlayed = game.hoursPlayed || 0;
    const percentage = Math.min(Math.round((hoursPlayed / estimatedTotal) * 100), 100);
    return percentage;
  };

  // Function to truncate long titles
  const truncateTitle = (title: string, maxLength = 25) => {
    return title.length > maxLength ? `${title.substring(0, maxLength)}...` : title;
  };

  // Determine which scrollbar style to use based on theme
  const scrollbarClass = theme === 'dark' ? styles.darkScrollbarThin : styles.scrollbarThin;

  if (loading) {
    return (
      <div className="my-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <FaGamepad className="text-accent" /> 
            <span>Now Playing</span>
          </h2>
        </div>
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 animate-pulse">
          <div className="flex space-x-4 overflow-x-auto pb-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex-shrink-0 w-48 h-64 rounded-xl bg-gray-200 dark:bg-gray-700"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl shadow-sm p-4">
          <p className="text-red-800 dark:text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div className="my-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <FaGamepad className="text-accent" /> 
            <span>Now Playing</span>
          </h2>
        </div>
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 text-center">
          <FaGamepad className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600 mb-3" />
          <p className="text-gray-500 dark:text-gray-400 mb-4">You don't have any games in progress right now.</p>
          <Link 
            href="/games/new" 
            className="inline-flex items-center justify-center bg-accent hover:bg-accent-dark text-white font-medium py-2 px-4 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105"
          >
            Add Your First Game
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="my-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <FaGamepad className="text-accent" /> 
          <span>Now Playing</span>
        </h2>
        <Link 
          href="/dashboard" 
          className="text-accent hover:text-accent-dark flex items-center text-sm font-medium transition-all duration-200 group"
        >
          View All <FaChevronRight className="ml-1 h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
      
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div
          ref={scrollContainerRef}
          className={`flex space-x-5 overflow-x-auto p-5 pb-6 ${scrollbarClass} select-none`}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
        >
          {games.map((game) => (
            <Link 
              key={game._id} 
              href={`/games/${game._id}`}
              className="flex-shrink-0 w-48 group relative"
              onClick={(e) => isDragging && e.preventDefault()}
              data-cy="now-playing-item"
            >
              <div className="rounded-xl overflow-hidden bg-gray-100/50 dark:bg-gray-700/50 transition-all duration-300 transform group-hover:scale-103 group-hover:-translate-y-1 shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-700">
                <div className="h-32 bg-gray-200 dark:bg-gray-600 relative overflow-hidden">
                  {game.imageUrl ? (
                    <Image 
                      src={game.imageUrl} 
                      alt={game.title} 
                      fill 
                      sizes="100%"
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gray-200 dark:bg-gray-700">
                      <FaGamepad className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <h3 className="font-medium text-gray-800 dark:text-white mb-1 group-hover:text-accent transition-colors" title={game.title}>
                    {truncateTitle(game.title)}
                  </h3>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {game.platform}
                  </p>
                  
                  <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                    <FaClock className="mr-1 text-accent" />
                    <span>{game.hoursPlayed?.toFixed(1) || 0} hours</span>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-accent rounded-full h-2 transition-all duration-500 ease-out" 
                        style={{ width: `${calculateProgress(game)}%` }}
                        title={`Estimated progress: ${calculateProgress(game)}%`}
                        data-cy="progress-bar"
                      ></div>
                    </div>
                    <p className="text-xs text-right mt-1 text-gray-500 dark:text-gray-400">
                      {calculateProgress(game)}%
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
} 