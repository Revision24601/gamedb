'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { FaStar, FaArrowLeft, FaSearch } from 'react-icons/fa';
import type { IGame } from '@/models/Game';
import { searchGames, RawgGame, formatGameData } from '@/lib/gameApi';
import Image from 'next/image';
import { gamePlatformEnum, gameStatusEnum } from '@/lib/validators';

type GameFormData = Omit<IGame, 'createdAt' | 'updatedAt' | '_id'>;

const statusOptions = Object.values(gameStatusEnum.enum);

// Get platform options from the Zod enum
const platformOptions = Object.values(gamePlatformEnum.enum);

export default function NewGame() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<GameFormData>();

  // Game search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<RawgGame[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close search results when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Search for games when query changes
  useEffect(() => {
    const performSearch = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const results = await searchGames(searchQuery);
        setSearchResults(results);
        setShowResults(true);
      } catch (error) {
        console.error('Error searching games:', error);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(performSearch, 500);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  // Handle selecting a game from search results
  const handleSelectGame = (game: RawgGame) => {
    const formattedGame = formatGameData(game);
    
    // Set form values
    setValue('title', formattedGame.title);
    
    // Find the most appropriate platform from our dropdown options
    if (formattedGame.platform) {
      const platformLower = formattedGame.platform.toLowerCase();
      let selectedPlatform = 'Other';
      
      // Try to find a matching platform
      for (const platform of platformOptions) {
        if (platformLower.includes(platform.toLowerCase())) {
          selectedPlatform = platform;
          break;
        }
      }
      
      // Special case mappings
      if (platformLower.includes('playstation 4') || platformLower.includes('ps4')) {
        selectedPlatform = 'PlayStation 4';
      } else if (platformLower.includes('playstation 5') || platformLower.includes('ps5')) {
        selectedPlatform = 'PlayStation 5';
      } else if (platformLower.includes('xbox one')) {
        selectedPlatform = 'Xbox One';
      } else if (platformLower.includes('xbox series')) {
        selectedPlatform = 'Xbox Series X/S';
      } else if (platformLower.includes('switch')) {
        selectedPlatform = 'Nintendo Switch';
      } else if (platformLower.includes('windows') || platformLower.includes('pc')) {
        selectedPlatform = 'PC';
      } else if (platformLower.includes('mac') || platformLower.includes('macos') || platformLower.includes('os x')) {
        selectedPlatform = 'MacOS';
      }
      
      setValue('platform', selectedPlatform);
    }
    
    setValue('imageUrl', formattedGame.imageUrl);
    setValue('notes', formattedGame.notes);
    
    // Hide search results
    setShowResults(false);
    setSearchQuery('');
  };

  const onSubmit = async (data: GameFormData) => {
    try {
      setSubmitting(true);
      
      // Set default values for rating and hoursPlayed when status is 'Plan to Play'
      if (data.status === 'Plan to Play') {
        data.rating = 0;
        data.hoursPlayed = 0;
      }
      
      const response = await fetch('/api/games', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add game');
      }

      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Error adding game:', error);
      alert(error instanceof Error ? error.message : 'Failed to add game. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/" className="flex items-center gap-2 text-accent hover:opacity-80">
          <FaArrowLeft /> Back to Games
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-8">Add New Game</h1>

      {/* Game Search */}
      <div className="mb-8" ref={searchRef}>
        <label htmlFor="gameSearch" className="block text-sm font-medium mb-1">
          Search for a game
        </label>
        <div className="relative">
          <input
            type="text"
            id="gameSearch"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for a game (e.g., Skyrim, Halo, etc.)"
            className="input-field w-full pl-10"
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          
          {showResults && (
            <div className="absolute z-10 w-full mt-1 bg-secondary-700 rounded-md shadow-lg max-h-96 overflow-auto">
              {isSearching ? (
                <div className="p-4 text-center">
                  <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-accent border-r-transparent"></div>
                  <p className="mt-2 text-sm">Searching...</p>
                </div>
              ) : searchResults.length > 0 ? (
                <ul className="py-2">
                  {searchResults.map((game) => (
                    <li
                      key={game.id}
                      onClick={() => handleSelectGame(game)}
                      className="px-4 py-2 hover:bg-secondary-600 cursor-pointer flex items-center"
                    >
                      {game.background_image ? (
                        <div className="w-16 h-12 mr-3 relative flex-shrink-0">
                          <Image
                            src={game.background_image}
                            alt={game.name}
                            fill
                            className="object-cover rounded"
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-12 mr-3 bg-gray-700 rounded flex-shrink-0 flex items-center justify-center">
                          <FaSearch className="text-gray-500" />
                        </div>
                      )}
                      <div>
                        <div className="font-medium">{game.name}</div>
                        <div className="text-sm text-gray-400">
                          {game.platforms?.slice(0, 3).map(p => p.platform.name).join(', ')}
                          {game.platforms && game.platforms.length > 3 && '...'}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-4 text-center text-gray-400">
                  No games found matching "{searchQuery}"
                </div>
              )}
            </div>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-1">
          Search for licensed games to auto-fill details
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">
            Title *
          </label>
          <input
            type="text"
            id="title"
            className="input-field w-full"
            {...register('title', { required: 'Title is required' })}
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="platform" className="block text-sm font-medium mb-1">
            Platform *
          </label>
          <select
            id="platform"
            className="input-field w-full"
            {...register('platform', { required: 'Platform is required' })}
          >
            <option value="" disabled>Select a platform</option>
            {platformOptions.map((platform) => (
              <option key={platform} value={platform}>
                {platform}
              </option>
            ))}
          </select>
          {errors.platform && (
            <p className="text-red-500 text-sm mt-1">{errors.platform.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium mb-1">
            Status
          </label>
          <select
            id="status"
            className="input-field w-full"
            {...register('status')}
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        {/* Only show rating and hours played if status is not 'Plan to Play' */}
        {watch('status') !== 'Plan to Play' && (
          <>
            <div>
              <label htmlFor="rating" className="block text-sm font-medium mb-1">
                Rating
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  id="rating"
                  min="0"
                  max="10"
                  className="input-field w-24"
                  {...register('rating', {
                    valueAsNumber: true,
                    min: { value: 0, message: 'Rating must be between 0 and 10' },
                    max: { value: 10, message: 'Rating must be between 0 and 10' },
                  })}
                />
                <FaStar className="text-yellow-400" />
                <span className="text-sm text-gray-400">/10</span>
              </div>
              {errors.rating && (
                <p className="text-red-500 text-sm mt-1">{errors.rating.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="hoursPlayed" className="block text-sm font-medium mb-1">
                Hours Played
              </label>
              <input
                type="number"
                id="hoursPlayed"
                min="0"
                className="input-field w-32"
                {...register('hoursPlayed', {
                  valueAsNumber: true,
                  min: { value: 0, message: 'Hours played cannot be negative' },
                })}
              />
              {errors.hoursPlayed && (
                <p className="text-red-500 text-sm mt-1">{errors.hoursPlayed.message}</p>
              )}
            </div>
          </>
        )}

        <div>
          <label htmlFor="imageUrl" className="block text-sm font-medium mb-1">
            Image URL
          </label>
          <input
            type="url"
            id="imageUrl"
            className="input-field w-full"
            {...register('imageUrl')}
          />
          {watch('imageUrl') && (
            <div className="mt-2 relative w-full h-32">
              <Image 
                src={watch('imageUrl') || ''} 
                alt="Game cover preview" 
                fill
                className="object-contain rounded-md"
              />
            </div>
          )}
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium mb-1">
            Notes
          </label>
          <textarea
            id="notes"
            rows={4}
            className="input-field w-full"
            {...register('notes')}
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary flex-1"
          >
            {submitting ? 'Adding...' : 'Add Game'}
          </button>
          <Link href="/" className="btn-primary bg-gray-500 flex-1 text-center">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
} 