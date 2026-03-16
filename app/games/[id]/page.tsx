'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import StarRating from '@/components/StarRating';
import StatusSelector from '@/components/StatusSelector';
import { useToast } from '@/components/ToastProvider';
import { FaEdit, FaTrash, FaArrowLeft, FaGamepad, FaClock, FaPlus, FaHeart, FaRegHeart } from 'react-icons/fa';
import type { IGame } from '@/models/Game';

type GameStatus = 'Playing' | 'Completed' | 'On Hold' | 'Dropped' | 'Plan to Play';

interface Game extends Omit<IGame, 'status' | 'createdAt' | 'updatedAt'> {
  _id: string;
  status: GameStatus;
  createdAt: string;
  updatedAt: string;
}

export default function GameDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [hoursToAdd, setHoursToAdd] = useState('');

  useEffect(() => {
    const fetchGame = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/games/${params.id}`);
        if (!response.ok) {
          throw new Error(response.status === 404 ? 'Game not found' : 'Failed to fetch game');
        }
        const data = await response.json();
        setGame(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };
    fetchGame();
  }, [params.id]);

  const updateGame = async (updates: Partial<Game>, successMessage: string) => {
    if (!game) return;
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/games/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Failed to update');
      const updatedGame = await response.json();
      setGame(updatedGame);
      showToast(successMessage, 'success');
    } catch (err) {
      showToast('Failed to update game', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStatusChange = (newStatus: GameStatus) => {
    updateGame({ status: newStatus }, `Status updated to ${newStatus}`);
  };

  const handleRatingChange = (newRating: number) => {
    updateGame({ rating: newRating }, `Rating saved: ${newRating}/10`);
  };

  const handleToggleFavorite = () => {
    const newVal = !(game as any)?.isFavorite;
    updateGame({ isFavorite: newVal } as any, newVal ? 'Added to favorites ♥' : 'Removed from favorites');
  };

  const handleAddHours = () => {
    const hours = parseFloat(hoursToAdd);
    if (isNaN(hours) || hours <= 0) {
      showToast('Enter a valid number of hours', 'warning');
      return;
    }
    const newTotal = (game?.hoursPlayed || 0) + hours;
    updateGame({ hoursPlayed: newTotal }, `${hours}h logged — total: ${newTotal.toFixed(1)}h`);
    setHoursToAdd('');
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/games/${params.id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete');
      showToast('Game deleted', 'success');
      router.push('/games');
    } catch (err) {
      showToast('Failed to delete game', 'error');
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <main className="journal-page">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex justify-center items-center h-64">
            <div className="loading-spinner"></div>
          </div>
        </div>
      </main>
    );
  }

  // Error state
  if (error || !game) {
    return (
      <main className="journal-page">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-12 card p-8">
            <h2 className="text-2xl font-bold text-red-500 mb-4">Error</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{error || 'Failed to load game'}</p>
            <Link href="/games" className="btn-primary">Back to Games</Link>
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
        <Link href="/" className="nav-link flex items-center gap-1 mb-8 group text-sm">
          <FaArrowLeft className="text-xs transition-transform group-hover:-translate-x-1" />
          <span>Back to Games</span>
        </Link>

        <div className="space-y-8">
          {/* Title + favorite + platform + hours */}
          <div>
            <div className="flex items-start gap-3">
              <h1 className="journal-title flex-1">{game.title}</h1>
              <button
                onClick={handleToggleFavorite}
                className={`mt-2 p-2 rounded-lg transition-all ${
                  (game as any).isFavorite 
                    ? 'text-red-500 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30' 
                    : 'text-gray-300 dark:text-gray-600 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10'
                }`}
                title={(game as any).isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                {(game as any).isFavorite ? <FaHeart className="text-xl" /> : <FaRegHeart className="text-xl" />}
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-gray-500 dark:text-gray-400 text-sm">
              <span className="flex items-center gap-1.5">
                <FaGamepad className="text-primary-500" />
                {game.platform}
              </span>
              <span className="flex items-center gap-1.5">
                <FaClock className="text-primary-500" />
                {game.hoursPlayed?.toFixed(1) || 0} hours
              </span>
            </div>
          </div>

          {/* Interactive Status Selector */}
          <div className="journal-card">
            <h2 className="journal-section">Status</h2>
            <div className="max-w-xs">
              <StatusSelector status={game.status} onChange={handleStatusChange} />
            </div>
            {isUpdating && <p className="text-xs text-gray-400 mt-2">Saving...</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-8">
              {/* Interactive Rating */}
              {game.status !== 'Plan to Play' && (
                <div className="journal-card">
                  <h2 className="journal-section">My Rating</h2>
                  <StarRating
                    rating={game.rating || 0}
                    onChange={handleRatingChange}
                    size="md"
                  />
                </div>
              )}

              {/* Quick Hours Logger */}
              {game.status !== 'Plan to Play' && (
                <div className="journal-card">
                  <h2 className="journal-section">
                    <FaClock className="text-primary-500" />
                    Log Hours
                  </h2>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min="0.5"
                      step="0.5"
                      value={hoursToAdd}
                      onChange={(e) => setHoursToAdd(e.target.value)}
                      placeholder="Hours"
                      className="input w-28"
                      onKeyDown={(e) => e.key === 'Enter' && handleAddHours()}
                    />
                    <button
                      onClick={handleAddHours}
                      disabled={isUpdating}
                      className="btn-primary flex items-center gap-1.5"
                    >
                      <FaPlus className="text-xs" /> Add
                    </button>
                    <span className="text-sm text-gray-400">
                      Total: {game.hoursPlayed?.toFixed(1) || 0}h
                    </span>
                  </div>
                </div>
              )}

              {/* Notes */}
              {game.notes && (
                <div className="journal-card">
                  <h2 className="journal-section">My Notes</h2>
                  <div className="journal-text whitespace-pre-wrap">{game.notes}</div>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              {/* Cover Image */}
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
                    />
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <Link
                  href={`/games/${game._id}/edit`}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  <FaEdit className="text-sm" /> Edit
                </Link>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="btn-secondary flex-1 flex items-center justify-center gap-2 hover:!bg-red-50 hover:!text-red-600 dark:hover:!bg-red-900/20 dark:hover:!text-red-400"
                >
                  <FaTrash className="text-sm" /> Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4 border border-gray-100 dark:border-slate-700" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Delete Game?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Are you sure you want to delete <strong>{game.title}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 px-5 py-2.5 rounded-lg font-medium text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50"
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
