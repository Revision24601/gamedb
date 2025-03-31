'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import Image from 'next/image';
import { FaStar, FaArrowLeft } from 'react-icons/fa';
import type { IGame } from '@/models/Game';
import Header from '@/components/Header';
import { gamePlatformEnum, gameStatusEnum } from '@/lib/validators';

type GameStatus = 'Playing' | 'Completed' | 'On Hold' | 'Dropped' | 'Plan to Play';

type GameFormData = Omit<IGame, 'createdAt' | 'updatedAt' | '_id'>;

const statusOptions = Object.values(gameStatusEnum.enum);

// Get platform options from the Zod enum
const platformOptions = Object.values(gamePlatformEnum.enum);

export default function EditGamePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<GameFormData>();

  // Fetch game data on component mount
  useEffect(() => {
    async function fetchGame() {
      try {
        setLoading(true);
        const response = await fetch(`/api/games/${params.id}`);
        
        if (!response.ok) {
          throw new Error(response.status === 404 
            ? 'Game not found' 
            : 'Failed to fetch game data');
        }
        
        const game = await response.json();
        
        // Populate form with game data
        setValue('title', game.title);
        setValue('platform', game.platform);
        setValue('status', game.status);
        setValue('rating', game.rating);
        setValue('hoursPlayed', game.hoursPlayed);
        setValue('imageUrl', game.imageUrl);
        setValue('notes', game.notes);
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load game');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchGame();
  }, [params.id, setValue]);

  const onSubmit = async (data: GameFormData) => {
    try {
      setSubmitting(true);
      const response = await fetch(`/api/games/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update game');
      }

      router.push(`/games/${params.id}`);
    } catch (error) {
      console.error('Error updating game:', error);
      alert(error instanceof Error ? error.message : 'Failed to update game. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main>
        <Header />
        <div className="max-w-2xl mx-auto p-4">
          <div className="text-center py-10">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-accent border-r-transparent"></div>
            <p className="mt-4 text-gray-500">Loading game data...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main>
        <Header />
        <div className="max-w-2xl mx-auto p-4">
          <div className="text-center py-10">
            <h2 className="text-2xl font-bold text-red-500 mb-4">Error</h2>
            <p className="text-gray-500 mb-4">{error}</p>
            <Link href="/games" className="btn-primary">
              Back to Games
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main>
      <Header />
      <div className="max-w-2xl mx-auto p-4">
        <div className="mb-6">
          <Link href={`/games/${params.id}`} className="flex items-center gap-2 text-accent hover:opacity-80">
            <FaArrowLeft /> Back to Game
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-8">Edit Game</h1>

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
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
            <Link 
              href={`/games/${params.id}`} 
              className="btn-primary bg-gray-500 flex-1 text-center"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
} 