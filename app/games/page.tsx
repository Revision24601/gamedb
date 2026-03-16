'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import StarRating from '@/components/StarRating';
import { FaGamepad, FaPlus, FaBook, FaSearch, FaClock, FaHeart } from 'react-icons/fa';
import type { IGame } from '@/models/Game';

const statusOptions = ['All', 'Favorites', 'Playing', 'Completed', 'On Hold', 'Dropped', 'Plan to Play'] as const;

type SortField = 'recent' | 'title' | 'rating' | 'hoursPlayed';

const statusColors: Record<string, string> = {
  'Playing': 'bg-green-100 text-green-800 border border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
  'Completed': 'bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
  'On Hold': 'bg-yellow-100 text-yellow-800 border border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800',
  'Dropped': 'bg-red-100 text-red-800 border border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
  'Plan to Play': 'bg-purple-100 text-purple-800 border border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800',
};

export default function GamesPage() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search');
  
  const [allGames, setAllGames] = useState<IGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [sortBy, setSortBy] = useState<SortField>('recent');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Fetch all games once
  useEffect(() => {
    const fetchGames = async () => {
      setLoading(true);
      try {
        const url = searchQuery 
          ? `/api/games?search=${encodeURIComponent(searchQuery)}` 
          : '/api/games';
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch games');
        const data = await response.json();
        setAllGames(data.games || []);
      } catch (err) {
        setError('Error loading games. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchGames();
  }, [searchQuery]);

  // Compute counts for each status (from full unfiltered list)
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { All: allGames.length, Favorites: 0 };
    allGames.forEach((game: any) => {
      counts[game.status] = (counts[game.status] || 0) + 1;
      if (game.isFavorite) counts.Favorites++;
    });
    return counts;
  }, [allGames]);

  // Filter by status (client-side from already-fetched data)
  const filteredGames = useMemo(() => {
    if (selectedStatus === 'All') return allGames;
    if (selectedStatus === 'Favorites') return allGames.filter((g: any) => g.isFavorite);
    return allGames.filter((g) => g.status === selectedStatus);
  }, [allGames, selectedStatus]);

  // Sort
  const sortedGames = useMemo(() => {
    if (!filteredGames.length) return [];
    return [...filteredGames].sort((a: any, b: any) => {
      let cmp = 0;
      switch (sortBy) {
        case 'recent':
          cmp = new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime();
          break;
        case 'title':
          cmp = a.title.localeCompare(b.title);
          break;
        case 'rating':
          cmp = (b.rating || 0) - (a.rating || 0);
          break;
        case 'hoursPlayed':
          cmp = (b.hoursPlayed || 0) - (a.hoursPlayed || 0);
          break;
      }
      return sortOrder === 'desc' ? cmp : -cmp;
    });
  }, [filteredGames, sortBy, sortOrder]);

  const handleSortChange = (newSort: SortField) => {
    if (sortBy === newSort) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSort);
      setSortOrder(newSort === 'title' ? 'asc' : 'desc');
    }
  };

  const sortBtnClass = (field: SortField) =>
    `px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 border transition-all ${
      sortBy === field
        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border-primary-200 dark:border-primary-800'
        : 'bg-white/50 dark:bg-slate-700/50 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-600'
    }`;

  const arrow = (field: SortField) => sortBy === field ? (sortOrder === 'asc' ? ' ↑' : ' ↓') : '';

  return (
    <main className="min-h-screen">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
              <FaBook className="text-primary-500" />
              {searchQuery ? `Results: "${searchQuery}"` : 'My Collection'}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
              {searchQuery ? 'Games matching your search' : `${allGames.length} games in your library`}
            </p>
          </div>
          
          <Link href="/games/new" className="btn-primary flex items-center gap-2 self-start md:self-auto">
            <FaPlus className="text-xs" /> Add Game
          </Link>
        </div>
        
        {/* Filter + Sort bar */}
        <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl border border-gray-100 dark:border-slate-700 p-4 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Status tabs with counts */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
              {statusOptions.map((status) => {
                const count = statusCounts[status] || 0;
                const isActive = selectedStatus === status;
                return (
                  <button
                    key={status}
                    onClick={() => setSelectedStatus(status)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap border transition-all ${
                      isActive
                        ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                        : 'bg-white/50 dark:bg-slate-700/50 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-600'
                    }`}
                  >
                    {status === 'Favorites' ? '♥ Favorites' : status}
                    {count > 0 && (
                      <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] ${
                        isActive ? 'bg-white/20' : 'bg-gray-200/80 dark:bg-slate-600'
                      }`}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            
            {/* Sort buttons */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider mr-1">Sort:</span>
              <button onClick={() => handleSortChange('recent')} className={sortBtnClass('recent')}>
                Recent{arrow('recent')}
              </button>
              <button onClick={() => handleSortChange('title')} className={sortBtnClass('title')}>
                Name{arrow('title')}
              </button>
              <button onClick={() => handleSortChange('rating')} className={sortBtnClass('rating')}>
                Rating{arrow('rating')}
              </button>
              <button onClick={() => handleSortChange('hoursPlayed')} className={sortBtnClass('hoursPlayed')}>
                Hours{arrow('hoursPlayed')}
              </button>
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="loading-spinner"></div>
            <p className="ml-4 text-gray-500 dark:text-gray-400 text-sm">Loading collection...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-6 rounded-xl text-center">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        ) : sortedGames.length === 0 ? (
          <div className="text-center py-12 card p-8">
            {searchQuery ? (
              <>
                <FaSearch className="mx-auto h-10 w-10 text-gray-400 mb-3" />
                <h3 className="text-lg font-medium text-gray-800 dark:text-white">No matches found</h3>
                <p className="mt-2 text-gray-500 dark:text-gray-400 text-sm">
                  No games matching &ldquo;{searchQuery}&rdquo;
                </p>
              </>
            ) : selectedStatus === 'Favorites' ? (
              <>
                <FaHeart className="mx-auto h-10 w-10 text-gray-400 mb-3" />
                <h3 className="text-lg font-medium text-gray-800 dark:text-white">No favorites yet</h3>
                <p className="mt-2 text-gray-500 dark:text-gray-400 text-sm">
                  Click the heart icon on any game to mark it as a favorite.
                </p>
              </>
            ) : (
              <>
                <FaGamepad className="mx-auto h-10 w-10 text-gray-400 mb-3" />
                <h3 className="text-lg font-medium text-gray-800 dark:text-white">
                  {selectedStatus === 'All' ? 'Your collection is empty' : `No ${selectedStatus} games`}
                </h3>
                <p className="mt-2 text-gray-500 dark:text-gray-400 text-sm max-w-md mx-auto">
                  Start building your gaming journal by adding games you love.
                </p>
                <Link href="/games/new" className="btn-primary inline-flex items-center gap-2 mt-4">
                  <FaPlus className="text-xs" /> Add Your First Game
                </Link>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedGames.map((game: any) => (
              <Link 
                key={game._id} 
                href={`/games/${game._id}`}
                className="group"
              >
                <div className="card card-hover overflow-hidden">
                  <div className="relative h-48 w-full bg-gray-100 dark:bg-slate-700 overflow-hidden">
                    {game.imageUrl ? (
                      <Image
                        src={game.imageUrl}
                        alt={game.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <FaGamepad className="h-10 w-10 text-gray-300 dark:text-gray-600" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium ${statusColors[game.status] || ''}`}>
                        {game.status}
                      </span>
                    </div>
                    {game.isFavorite && (
                      <div className="absolute top-3 left-3">
                        <FaHeart className="text-red-500 text-sm drop-shadow" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-gray-800 dark:text-white truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {game.title}
                    </h3>
                    {game.platform && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{game.platform}</p>
                    )}
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center">
                        <StarRating rating={game.rating} readonly size="sm" />
                        <span className="ml-1.5 text-xs text-gray-500">{game.rating}/10</span>
                      </div>
                      {game.hoursPlayed > 0 && (
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <FaClock className="text-[10px]" />
                          {game.hoursPlayed}h
                        </span>
                      )}
                    </div>
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
