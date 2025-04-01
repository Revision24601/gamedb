'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { FaStar, FaArrowLeft } from 'react-icons/fa';
import type { IGame } from '@/models/Game';

type GameFormData = Omit<IGame, 'createdAt' | 'updatedAt'>;

const statusOptions = [
  'Playing',
  'Completed',
  'On Hold',
  'Dropped',
  'Plan to Play',
] as const;

export default function AddGame() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors }, watch } = useForm<GameFormData>();

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

      if (!response.ok) throw new Error('Failed to add game');
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Error adding game:', error);
      alert('Failed to add game. Please try again.');
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
          <input
            type="text"
            id="platform"
            className="input-field w-full"
            {...register('platform', { required: 'Platform is required' })}
          />
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