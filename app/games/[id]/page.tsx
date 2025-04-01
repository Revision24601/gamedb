'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import StarRating from '@/components/StarRating';
import StatusSelector from '@/components/StatusSelector';
import { FaEdit, FaTrash, FaArrowLeft, FaCalendarAlt, FaGamepad, FaTag, FaLaptop, FaClock } from 'react-icons/fa';
import type { IGame } from '@/models/Game';

type GameStatus = 'Playing' | 'Completed' | 'On Hold' | 'Dropped' | 'Plan to Play';

interface Game extends Omit<IGame, 'status'> {
  _id: string;
  status: GameStatus;
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
      <main className="journal-page">
        <Header />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Back button */}
          <Link 
            href="/" 
            className="nav-link flex items-center gap-1 mb-8 group"
          >
            <FaArrowLeft className="text-sm transition-transform group-hover:-translate-x-1" />
            <span>Back to Games</span>
          </Link>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="loading-spinner"></div>
            </div>
          ) : error ? (
            <div className="card p-4">
              <p className="error-message">{error}</p>
            </div>
          ) : game ? (
            <div className="space-y-12">
              {/* Game Title Section */}
              <div className="relative">
                <div className="absolute -top-4 -left-4 w-24 h-24 bg-accent/5 rounded-full blur-2xl"></div>
                <h1 className="journal-title">
                  {game.title}
                </h1>
                <div className="flex items-center gap-4 text-gray-600 dark:text-gray-300">
                  <span className="flex items-center gap-2">
                    <FaGamepad className="text-accent" />
                    {game.platform}
                  </span>
                  <span className="flex items-center gap-2">
                    <FaClock className="text-accent" />
                    {game.hoursPlayed?.toFixed(1) || 0} hours
                  </span>
                </div>
              </div>

              {/* Status Badge */}
              <div className="inline-block">
                <span className={`status-badge ${
                  game.status === 'Playing' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300' :
                  game.status === 'Completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                  game.status === 'Plan to Play' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                  'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                }`}>
                  {game.status}
                </span>
              </div>

              {/* Game Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-8">
                  {/* Rating Section */}
                  {game.status !== 'Plan to Play' && (
                    <div className="journal-card">
                      <h2 className="journal-section">My Rating</h2>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                          <svg
                            key={star}
                            className={`w-5 h-5 ${
                              star <= (game.rating || 0)
                                ? 'text-yellow-400'
                                : 'text-gray-300 dark:text-gray-600'
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Rating: {game.rating}/10
                      </div>
                    </div>
                  )}

                  {/* Notes Section */}
                  {game.notes && (
                    <div className="journal-card">
                      <h2 className="journal-section">My Notes</h2>
                      <div className="journal-text whitespace-pre-wrap">
                        {game.notes}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column */}
                <div className="space-y-8">
                  {/* Game Cover Image */}
                  {game.imageUrl && (
                    <div className="journal-card">
                      <div className="game-image-container">
                        <Image
                          src={game.imageUrl}
                          alt={game.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="object-cover"
                          priority
                          onError={(e) => {
                            console.error('Error loading image:', e);
                            // You could set a fallback image here if needed
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-4">
                    <Link
                      href={`/games/${game._id}/edit`}
                      className="btn-primary flex-1 flex items-center justify-center gap-2"
                    >
                      <FaEdit />
                      Edit Entry
                    </Link>
                    <button
                      onClick={handleDelete}
                      className="btn-secondary flex-1 flex items-center justify-center gap-2"
                    >
                      <FaTrash />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
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
    <main className="journal-page">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back button */}
        <Link 
          href="/" 
          className="nav-link flex items-center gap-1 mb-8 group"
        >
          <FaArrowLeft className="text-sm transition-transform group-hover:-translate-x-1" />
          <span>Back to Games</span>
        </Link>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="loading-spinner"></div>
          </div>
        ) : error ? (
          <div className="card p-4">
            <p className="error-message">{error}</p>
          </div>
        ) : game ? (
          <div className="space-y-12">
            {/* Game Title Section */}
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-accent/5 rounded-full blur-2xl"></div>
              <h1 className="journal-title">
                {game.title}
              </h1>
              <div className="flex items-center gap-4 text-gray-600 dark:text-gray-300">
                <span className="flex items-center gap-2">
                  <FaGamepad className="text-accent" />
                  {game.platform}
                </span>
                <span className="flex items-center gap-2">
                  <FaClock className="text-accent" />
                  {game.hoursPlayed?.toFixed(1) || 0} hours
                </span>
              </div>
            </div>

            {/* Status Badge */}
            <div className="inline-block">
              <span className={`status-badge ${
                game.status === 'Playing' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300' :
                game.status === 'Completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                game.status === 'Plan to Play' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
              }`}>
                {game.status}
              </span>
            </div>

            {/* Game Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-8">
                {/* Rating Section */}
                {game.status !== 'Plan to Play' && (
                  <div className="journal-card">
                    <h2 className="journal-section">My Rating</h2>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                        <svg
                          key={star}
                          className={`w-5 h-5 ${
                            star <= (game.rating || 0)
                              ? 'text-yellow-400'
                              : 'text-gray-300 dark:text-gray-600'
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      Rating: {game.rating}/10
                    </div>
                  </div>
                )}

                {/* Notes Section */}
                {game.notes && (
                  <div className="journal-card">
                    <h2 className="journal-section">My Notes</h2>
                    <div className="journal-text whitespace-pre-wrap">
                      {game.notes}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column */}
              <div className="space-y-8">
                {/* Game Cover Image */}
                {game.imageUrl && (
                  <div className="journal-card">
                    <div className="game-image-container">
                      <Image
                        src={game.imageUrl}
                        alt={game.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover"
                        priority
                        onError={(e) => {
                          console.error('Error loading image:', e);
                          // You could set a fallback image here if needed
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-4">
                  <Link
                    href={`/games/${game._id}/edit`}
                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                  >
                    <FaEdit />
                    Edit Entry
                  </Link>
                  <button
                    onClick={handleDelete}
                    className="btn-secondary flex-1 flex items-center justify-center gap-2"
                  >
                    <FaTrash />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
} 