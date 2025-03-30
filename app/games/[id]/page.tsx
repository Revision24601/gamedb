'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import StarRating from '@/components/StarRating';
import StatusSelector from '@/components/StatusSelector';
import { GameStatus } from '@/models/Game';
import { FaEdit, FaTrash, FaArrowLeft, FaCalendarAlt, FaGamepad, FaTag, FaLaptop } from 'react-icons/fa';

interface Game {
  _id: string;
  title: string;
  coverImage?: string;
  description?: string;
  releaseDate?: string;
  developer?: string;
  publisher?: string;
  genres?: string[];
  platforms?: string[];
  rating: number;
  status: GameStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export default function GameDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  useEffect(() => {
    const fetchGame = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/games/${params.id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Game not found');
          }
          throw new Error('Failed to fetch game');
        }
        
        const data = await response.json();
        setGame(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchGame();
  }, [params.id]);
  
  const handleStatusChange = async (newStatus: GameStatus) => {
    if (!game) return;
    
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/games/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update game status');
      }
      
      const updatedGame = await response.json();
      setGame(updatedGame);
    } catch (err) {
      console.error('Error updating game status:', err);
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handleRatingChange = async (newRating: number) => {
    if (!game) return;
    
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/games/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rating: newRating }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update game rating');
      }
      
      const updatedGame = await response.json();
      setGame(updatedGame);
    } catch (err) {
      console.error('Error updating game rating:', err);
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/games/${params.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete game');
      }
      
      router.push('/games');
    } catch (err) {
      console.error('Error deleting game:', err);
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString();
  };
  
  if (loading) {
    return (
      <main>
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading game details...</p>
          </div>
        </div>
      </main>
    );
  }
  
  if (error || !game) {
    return (
      <main>
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
            <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">Error</h2>
            <p className="text-gray-600 dark:text-gray-400">{error || 'Failed to load game'}</p>
            <div className="mt-6">
              <Link href="/games" className="btn btn-primary">
                Back to Games
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }
  
  return (
    <main>
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/games" className="flex items-center text-primary-600 hover:text-primary-700">
            <FaArrowLeft className="mr-2" />
            Back to Games
          </Link>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/3 lg:w-1/4 bg-gray-100 dark:bg-gray-700">
              <div className="relative h-64 md:h-full w-full">
                {game.coverImage ? (
                  <Image
                    src={game.coverImage}
                    alt={game.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <FaGamepad className="h-24 w-24 text-gray-400" />
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-6 md:w-2/3 lg:w-3/4">
              <div className="flex justify-between items-start">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{game.title}</h1>
                
                <div className="flex space-x-2">
                  <Link 
                    href={`/games/${params.id}/edit`}
                    className="btn btn-outline flex items-center"
                  >
                    <FaEdit className="mr-2" />
                    Edit
                  </Link>
                  
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="btn bg-red-600 hover:bg-red-700 text-white flex items-center"
                  >
                    <FaTrash className="mr-2" />
                    Delete
                  </button>
                </div>
              </div>
              
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Details</h2>
                  
                  <div className="space-y-3">
                    {game.developer && (
                      <div className="flex items-start">
                        <FaGamepad className="mt-1 mr-2 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Developer</p>
                          <p className="text-gray-900 dark:text-white">{game.developer}</p>
                        </div>
                      </div>
                    )}
                    
                    {game.publisher && (
                      <div className="flex items-start">
                        <FaGamepad className="mt-1 mr-2 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Publisher</p>
                          <p className="text-gray-900 dark:text-white">{game.publisher}</p>
                        </div>
                      </div>
                    )}
                    
                    {game.releaseDate && (
                      <div className="flex items-start">
                        <FaCalendarAlt className="mt-1 mr-2 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Release Date</p>
                          <p className="text-gray-900 dark:text-white">{formatDate(game.releaseDate)}</p>
                        </div>
                      </div>
                    )}
                    
                    {game.genres && game.genres.length > 0 && (
                      <div className="flex items-start">
                        <FaTag className="mt-1 mr-2 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Genres</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {game.genres.map((genre) => (
                              <span 
                                key={genre} 
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                              >
                                {genre}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {game.platforms && game.platforms.length > 0 && (
                      <div className="flex items-start">
                        <FaLaptop className="mt-1 mr-2 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Platforms</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {game.platforms.map((platform) => (
                              <span 
                                key={platform} 
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                              >
                                {platform}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Your Progress</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Status</p>
                      <StatusSelector 
                        status={game.status} 
                        onChange={handleStatusChange} 
                      />
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Your Rating</p>
                      <StarRating 
                        rating={game.rating} 
                        onChange={handleRatingChange} 
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {game.description && (
                <div className="mt-8">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Description</h2>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{game.description}</p>
                </div>
              )}
              
              {game.notes && (
                <div className="mt-8">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Your Notes</h2>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{game.notes}</p>
                  </div>
                </div>
              )}
              
              <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
                <p>Added on {formatDate(game.createdAt)}</p>
                <p>Last updated on {formatDate(game.updatedAt)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Delete Game</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Are you sure you want to delete "{game.title}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn btn-outline"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="btn bg-red-600 hover:bg-red-700 text-white"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
} 