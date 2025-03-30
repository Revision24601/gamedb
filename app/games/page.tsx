'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import StarRating from '@/components/StarRating';
import { GameStatus } from '@/models/Game';
import { FaGamepad, FaFilter, FaSort, FaPlus } from 'react-icons/fa';

interface Game {
  _id: string;
  title: string;
  coverImage?: string;
  developer?: string;
  platforms?: string[];
  rating: number;
  status: GameStatus;
}

export default function GamesPage() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search');
  
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<GameStatus | 'All'>('All');
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
        setGames(data);
      } catch (err) {
        setError('Error loading games. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchGames();
  }, [searchQuery]);
  
  const filteredGames = games.filter(game => {
    if (statusFilter === 'All') return true;
    return game.status === statusFilter;
  });
  
  const sortedGames = [...filteredGames].sort((a, b) => {
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
  });
  
  const handleSortChange = (newSortBy: 'title' | 'rating' | 'status') => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('asc');
    }
  };
  
  const statusOptions = ['All', ...Object.values(GameStatus)];
  
  const statusColors = {
    [GameStatus.WISHLIST]: 'bg-blue-100 text-blue-800',
    [GameStatus.IN_LIBRARY]: 'bg-gray-100 text-gray-800',
    [GameStatus.PLAYING]: 'bg-green-100 text-green-800',
    [GameStatus.PAUSED]: 'bg-yellow-100 text-yellow-800',
    [GameStatus.DROPPED]: 'bg-red-100 text-red-800',
    [GameStatus.COMPLETED]: 'bg-purple-100 text-purple-800',
  };
  
  return (
    <main>
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {searchQuery ? `Search Results: ${searchQuery}` : 'My Games'}
          </h1>
          
          <Link href="/games/new" className="btn btn-primary flex items-center">
            <FaPlus className="mr-2" />
            Add Game
          </Link>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center">
              <FaFilter className="text-gray-500 mr-2" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">Filter:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as GameStatus | 'All')}
                className="input max-w-xs"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center">
              <FaSort className="text-gray-500 mr-2" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">Sort by:</span>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleSortChange('title')}
                  className={`px-3 py-1 text-sm rounded-md ${
                    sortBy === 'title' 
                      ? 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200' 
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  Title {sortBy === 'title' && (sortOrder === 'asc' ? '↑' : '↓')}
                </button>
                <button
                  onClick={() => handleSortChange('rating')}
                  className={`px-3 py-1 text-sm rounded-md ${
                    sortBy === 'rating' 
                      ? 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200' 
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  Rating {sortBy === 'rating' && (sortOrder === 'asc' ? '↑' : '↓')}
                </button>
                <button
                  onClick={() => handleSortChange('status')}
                  className={`px-3 py-1 text-sm rounded-md ${
                    sortBy === 'status' 
                      ? 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200' 
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  Status {sortBy === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading games...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        ) : sortedGames.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
            <FaGamepad className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No games found</h3>
            <p className="mt-1 text-gray-500 dark:text-gray-400">
              {searchQuery 
                ? `No games matching "${searchQuery}" were found.` 
                : 'Start building your collection by adding some games.'}
            </p>
            <div className="mt-6">
              <Link href="/games/new" className="btn btn-primary">
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
                className="card hover:shadow-lg transition-shadow"
              >
                <div className="relative h-48 w-full bg-gray-200 dark:bg-gray-700">
                  {game.coverImage ? (
                    <Image
                      src={game.coverImage}
                      alt={game.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <FaGamepad className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[game.status]}`}>
                      {game.status}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate">
                    {game.title}
                  </h3>
                  {game.developer && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {game.developer}
                    </p>
                  )}
                  <div className="mt-2">
                    <StarRating rating={game.rating} readonly size="sm" />
                  </div>
                  {game.platforms && game.platforms.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {game.platforms.map((platform) => (
                        <span 
                          key={platform} 
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                        >
                          {platform}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
} 