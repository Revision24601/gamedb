'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import StarRating from '@/components/StarRating';
import { FaGamepad, FaFilter, FaSort, FaPlus, FaStar } from 'react-icons/fa';
import type { IGame } from '@/models/Game';

const statusOptions = ['All', 'Playing', 'Completed', 'On Hold', 'Dropped', 'Plan to Play'] as const;

const statusColors = {
  'Playing': 'bg-green-100 text-green-800',
  'Completed': 'bg-blue-100 text-blue-800',
  'On Hold': 'bg-yellow-100 text-yellow-800',
  'Dropped': 'bg-red-100 text-red-800',
  'Plan to Play': 'bg-purple-100 text-purple-800',
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
    <main>
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {searchQuery ? `Search Results: ${searchQuery}` : 'My Games'}
          </h1>
          
          <Link href="/games/new" className="btn-primary flex items-center">
            <FaPlus className="mr-2" />
            Add Game
          </Link>
        </div>
        
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {statusOptions.map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                selectedStatus === status
                  ? 'bg-accent text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              {status}
            </button>
          ))}
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
              <Link href="/games/new" className="btn-primary">
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
                  {game.imageUrl && (
                    <Image
                      src={game.imageUrl}
                      alt={game.title}
                      fill
                      className="object-cover"
                    />
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
                  {game.platform && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {game.platform}
                    </p>
                  )}
                  <div className="mt-2">
                    <StarRating rating={game.rating} readonly size="sm" />
                  </div>
                  {game.hoursPlayed > 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      {game.hoursPlayed} hours played
                    </p>
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