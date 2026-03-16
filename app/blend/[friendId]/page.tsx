'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import StarRating from '@/components/StarRating';
import { FaArrowLeft, FaGamepad, FaClock, FaExchangeAlt, FaHeart } from 'react-icons/fa';

export default function FriendLibraryPage({ params }: { params: { friendId: string } }) {
  const [friend, setFriend] = useState<{ id: string; name: string } | null>(null);
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLibrary = async () => {
      try {
        const res = await fetch(`/api/blend/library/${params.friendId}`);
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Failed to load library');
          return;
        }
        setFriend(data.friend);
        setGames(data.games || []);
      } catch (err) {
        setError('Failed to load library');
      } finally {
        setLoading(false);
      }
    };
    fetchLibrary();
  }, [params.friendId]);

  const statusColors: Record<string, string> = {
    'Playing': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    'Completed': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    'On Hold': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    'Dropped': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    'Plan to Play': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  };

  return (
    <main className="min-h-screen">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/blend" className="nav-link flex items-center gap-1 mb-6 text-sm group">
          <FaArrowLeft className="text-xs transition-transform group-hover:-translate-x-1" />
          <span>Back to Blend</span>
        </Link>

        {loading ? (
          <div className="flex justify-center py-16"><div className="loading-spinner" /></div>
        ) : error ? (
          <div className="card p-8 text-center">
            <p className="text-red-500">{error}</p>
            <Link href="/blend" className="btn-primary mt-4 inline-block">Back to Blend</Link>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {friend?.name}&apos;s Library
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">{games.length} games</p>
              </div>
              <Link
                href={`/blend/compare/${params.friendId}`}
                className="btn-primary flex items-center gap-2"
              >
                <FaExchangeAlt className="text-sm" /> Compare Libraries
              </Link>
            </div>

            {games.length === 0 ? (
              <div className="card p-8 text-center">
                <FaGamepad className="text-4xl text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">{friend?.name} hasn&apos;t added any games yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {games.map((game: any) => (
                  <div key={game._id} className="card card-hover overflow-hidden">
                    <div className="relative h-48 bg-gray-100 dark:bg-slate-700 overflow-hidden">
                      {game.imageUrl ? (
                        <Image src={game.imageUrl} alt={game.title} fill className="object-cover" />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <FaGamepad className="h-10 w-10 text-gray-300 dark:text-gray-600" />
                        </div>
                      )}
                      <div className="absolute top-3 right-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium ${statusColors[game.status] || ''}`}>
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
                      <h3 className="font-medium text-gray-800 dark:text-white truncate">{game.title}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{game.platform}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center">
                          <StarRating rating={game.rating || 0} readonly size="sm" />
                          <span className="ml-1.5 text-xs text-gray-500">{game.rating}/10</span>
                        </div>
                        {game.hoursPlayed > 0 && (
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <FaClock className="text-[10px]" /> {game.hoursPlayed}h
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
