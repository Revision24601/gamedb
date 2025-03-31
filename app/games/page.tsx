'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import StarRating from '@/components/StarRating';
import { FaGamepad, FaFilter, FaSort, FaPlus, FaStar, FaBook, FaSearch, FaClock } from 'react-icons/fa';
import type { IGame } from '@/models/Game';

const statusOptions = ['All', 'Playing', 'Completed', 'On Hold', 'Dropped', 'Plan to Play'] as const;

const statusColors = {
  'Playing': 'bg-green-100 text-green-800 border border-green-200',
  'Completed': 'bg-blue-100 text-blue-800 border border-blue-200',
  'On Hold': 'bg-yellow-100 text-yellow-800 border border-yellow-200',
  'Dropped': 'bg-red-100 text-red-800 border border-red-200',
  'Plan to Play': 'bg-purple-100 text-purple-800 border border-purple-200',
};

export default function GamesPage() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search');
  
  const [games, setGames] = useState<IGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'title' | 'rating' | 'status'>('title');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  useEffect(() => {
    const fetchGames = async () => {
      setLoading(true);
      try {
        const url = searchQuery 
          ? `/api/games?search=${encodeURIComponent(searchQuery)}` 
          : '/api/games';
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error('Failed to fetch games');
        }
        
        const data = await response.json();
        
        // Extract the games array from the response
        const gamesArray = data.games || [];
        
        // Filter games by status if not 'All'
        const filteredGames = selectedStatus === 'All'
          ? gamesArray
          : gamesArray.filter((game: IGame) => game.status === selectedStatus);
        
        setGames(filteredGames);
      } catch (err) {
        setError('Error loading games. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchGames();
  }, [searchQuery, selectedStatus]);
  
  // Handle case where games might be null or undefined
  const sortedGames = games && games.length > 0 
    ? [...games].sort((a, b) => {
        if (sortBy === 'title') {
          return sortOrder === 'asc' 
            ? a.title.localeCompare(b.title)
            : b.title.localeCompare(a.title);
        } else if (sortBy === 'rating') {
          return sortOrder === 'asc' 
            ? a.rating - b.rating
            : b.rating - a.rating;
        } else {
          return sortOrder === 'asc' 
            ? a.status.localeCompare(b.status)
            : b.status.localeCompare(a.status);
        }
      })
    : [];
  
  const handleSortChange = (newSortBy: 'title' | 'rating' | 'status') => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('asc');
    }
  };
  
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
              <FaBook className="text-accent" />
              {searchQuery ? `Search Results: "${searchQuery}"` : 'My Collection'}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              {searchQuery 
                ? 'Games that match your search query' 
                : 'Your personal gaming library and memories'}
            </p>
          </div>
          
          <Link 
            href="/games/new" 
            className="btn-primary flex items-center self-start md:self-auto shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            <FaPlus className="mr-2" />
            Add to Collection
          </Link>
        </div>
        
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
              {statusOptions.map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap border transition-all duration-200 ${
                    selectedStatus === status
                      ? 'bg-accent/90 text-white border-accent/30 shadow-md'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
            
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => handleSortChange('title')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1 border transition-all ${
                  sortBy === 'title' 
                    ? 'bg-accent/10 text-accent border-accent/20' 
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600'
                }`}
              >
                Name {sortBy === 'title' && (sortOrder === 'asc' ? '↑' : '↓')}
              </button>
              <button
                onClick={() => handleSortChange('rating')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1 border transition-all ${
                  sortBy === 'rating' 
                    ? 'bg-accent/10 text-accent border-accent/20' 
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600'
                }`}
              >
                Rating {sortBy === 'rating' && (sortOrder === 'asc' ? '↑' : '↓')}
              </button>
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-accent border-r-transparent"></div>
            <p className="ml-4 text-gray-600 dark:text-gray-400">Finding your treasures...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-6 rounded-xl text-center">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        ) : sortedGames.length === 0 ? (
          <div className="text-center py-12 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            {searchQuery ? (
              <>
                <FaSearch className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                <h3 className="text-xl font-medium text-gray-800 dark:text-white">No matches found</h3>
                <p className="mt-2 text-gray-500 dark:text-gray-400">
                  We couldn't find any games matching "{searchQuery}"
                </p>
              </>
            ) : (
              <>
                <FaGamepad className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                <h3 className="text-xl font-medium text-gray-800 dark:text-white">Your collection is empty</h3>
                <p className="mt-2 text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                  Start building your personal gaming journal by adding the games you love.
                </p>
              </>
            )}
            <div className="mt-6">
              <Link 
                href="/games/new" 
                className="btn-primary inline-flex items-center shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                <FaPlus className="mr-2" />
                Add Your First Game
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedGames.map((game) => (
              <Link 
                key={game._id} 
                href={`/games/${game._id}`}
                className="group"
              >
                <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transform transition-all duration-300 hover:shadow-md hover:scale-102 hover:-translate-y-1">
                  <div className="relative h-48 w-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                    {game.imageUrl ? (
                      <Image
                        src={game.imageUrl}
                        alt={game.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <FaGamepad className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium shadow-sm ${statusColors[game.status]}`}>
                        {game.status}
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-medium text-gray-800 dark:text-white truncate group-hover:text-accent transition-colors">
                      {game.title}
                    </h3>
                    {game.platform && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {game.platform}
                      </p>
                    )}
                    <div className="mt-3 flex items-center">
                      <StarRating rating={game.rating} readonly size="sm" />
                      <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                        {game.rating}/10
                      </span>
                    </div>
                    {game.hoursPlayed > 0 && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 flex items-center">
                        <FaClock className="mr-1.5 text-accent" />
                        {game.hoursPlayed} hours played
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
} 