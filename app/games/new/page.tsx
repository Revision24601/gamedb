'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import Header from '@/components/Header';
import StarRating from '@/components/StarRating';
import StatusSelector from '@/components/StatusSelector';
import { GameStatus } from '@/models/Game';
import { FaSave, FaTimes } from 'react-icons/fa';

interface GameFormData {
  title: string;
  coverImage?: string;
  description?: string;
  releaseDate?: string;
  developer?: string;
  publisher?: string;
  genres?: string;
  platforms?: string;
  rating: number;
  status: GameStatus;
  notes?: string;
}

export default function NewGamePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const { register, handleSubmit, control, formState: { errors } } = useForm<GameFormData>({
    defaultValues: {
      title: '',
      coverImage: '',
      description: '',
      releaseDate: '',
      developer: '',
      publisher: '',
      genres: '',
      platforms: '',
      rating: 5,
      status: GameStatus.WISHLIST,
      notes: '',
    }
  });
  
  const onSubmit = async (data: GameFormData) => {
    setIsSubmitting(true);
    setError('');
    
    try {
      // Convert comma-separated strings to arrays
      const formattedData = {
        ...data,
        genres: data.genres ? data.genres.split(',').map(g => g.trim()) : undefined,
        platforms: data.platforms ? data.platforms.split(',').map(p => p.trim()) : undefined,
      };
      
      const response = await fetch('/api/games', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create game');
      }
      
      const newGame = await response.json();
      router.push(`/games/${newGame._id}`);
    } catch (err) {
      console.error('Error creating game:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <main>
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Game</h1>
          
          <button
            onClick={() => router.back()}
            className="btn btn-outline flex items-center"
          >
            <FaTimes className="mr-2" />
            Cancel
          </button>
        </div>
        
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 mb-6">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label htmlFor="title" className="label">
                Game Title <span className="text-red-500">*</span>
              </label>
              <input
                id="title"
                type="text"
                className={`input ${errors.title ? 'border-red-500' : ''}`}
                {...register('title', { required: 'Title is required' })}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="coverImage" className="label">Cover Image URL</label>
              <input
                id="coverImage"
                type="text"
                className="input"
                placeholder="https://example.com/image.jpg"
                {...register('coverImage')}
              />
            </div>
            
            <div>
              <label htmlFor="releaseDate" className="label">Release Date</label>
              <input
                id="releaseDate"
                type="date"
                className="input"
                {...register('releaseDate')}
              />
            </div>
            
            <div>
              <label htmlFor="developer" className="label">Developer</label>
              <input
                id="developer"
                type="text"
                className="input"
                {...register('developer')}
              />
            </div>
            
            <div>
              <label htmlFor="publisher" className="label">Publisher</label>
              <input
                id="publisher"
                type="text"
                className="input"
                {...register('publisher')}
              />
            </div>
            
            <div>
              <label htmlFor="genres" className="label">Genres</label>
              <input
                id="genres"
                type="text"
                className="input"
                placeholder="RPG, Action, Adventure (comma separated)"
                {...register('genres')}
              />
            </div>
            
            <div>
              <label htmlFor="platforms" className="label">Platforms</label>
              <input
                id="platforms"
                type="text"
                className="input"
                placeholder="PC, PS5, Xbox (comma separated)"
                {...register('platforms')}
              />
            </div>
            
            <div>
              <label className="label">Rating</label>
              <Controller
                name="rating"
                control={control}
                render={({ field }) => (
                  <StarRating
                    rating={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>
            
            <div>
              <label className="label">Status</label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <StatusSelector
                    status={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="description" className="label">Description</label>
              <textarea
                id="description"
                rows={4}
                className="input"
                {...register('description')}
              ></textarea>
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="notes" className="label">Personal Notes</label>
              <textarea
                id="notes"
                rows={4}
                className="input"
                placeholder="Your thoughts, progress, or anything else you want to remember about this game..."
                {...register('notes')}
              ></textarea>
            </div>
          </div>
          
          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary flex items-center"
            >
              {isSubmitting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent"></div>
                  Saving...
                </>
              ) : (
                <>
                  <FaSave className="mr-2" />
                  Save Game
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
} 