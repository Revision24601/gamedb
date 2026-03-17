'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import { FaArrowLeft, FaLightbulb, FaStar, FaPlus, FaGamepad } from 'react-icons/fa';

interface Recommendation {
  title: string;
  imageUrl: string;
  metacritic: number | null;
  genres: string[];
  platforms: string[];
  released: string;
  reason: string;
}

export default function RecommendationsPage() {
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [topGenres, setTopGenres] = useState<{ name: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRecs = async () => {
      try {
        const res = await fetch('/api/recommendations');
        const data = await res.json();
        if (!res.ok) { setError(data.error || 'Failed'); return; }
        setRecs(data.recommendations || []);
        setTopGenres(data.topGenres || []);
      } catch (err) {
        setError('Failed to load recommendations');
      } finally {
        setLoading(false);
      }
    };
    fetchRecs();
  }, []);

  const handleQuickAdd = (rec: Recommendation) => {
    const params = new URLSearchParams();
    params.set('title', rec.title);
    if (rec.imageUrl) params.set('imageUrl', rec.imageUrl);
    if (rec.platforms[0]) params.set('platform', rec.platforms[0]);
    if (rec.genres.length) params.set('genres', rec.genres.join(', '));
    if (rec.released) params.set('released', rec.released);
    window.location.href = `/games/new?${params.toString()}`;
  };

  return (
    <main className="min-h-screen">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/" className="nav-link flex items-center gap-1 mb-6 text-sm group">
          <FaArrowLeft className="text-xs transition-transform group-hover:-translate-x-1" />
          <span>Back to Home</span>
        </Link>

        <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3 mb-2">
          <FaLightbulb className="text-accent" />
          Recommended For You
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">
          {topGenres.length > 0
            ? `Based on your love of ${topGenres.map(g => g.name).join(', ')}`
            : 'Games you might enjoy based on your library'}
        </p>

        {loading ? (
          <div className="flex justify-center py-16"><div className="loading-spinner" /></div>
        ) : error ? (
          <div className="card p-8 text-center"><p className="text-red-500">{error}</p></div>
        ) : recs.length === 0 ? (
          <div className="card p-8 text-center">
            <FaGamepad className="text-4xl text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Not enough data for recommendations yet. Add more games with genre info!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {recs.map((rec, i) => (
              <div key={i} className="card card-hover overflow-hidden group">
                <div className="relative h-48 bg-gray-100 dark:bg-slate-700 overflow-hidden">
                  {rec.imageUrl ? (
                    <Image src={rec.imageUrl} alt={rec.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="flex items-center justify-center h-full"><FaGamepad className="h-10 w-10 text-gray-300" /></div>
                  )}
                  {rec.metacritic && (
                    <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-black/60 text-white text-xs font-mono">
                      <FaStar className="inline text-yellow-400 mr-1 text-[10px]" />{rec.metacritic}
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-gray-800 dark:text-white truncate">{rec.title}</h3>
                  <p className="text-[10px] text-gray-400 mt-1 truncate">{rec.genres.slice(0, 3).join(' · ')}</p>
                  <p className="text-xs text-primary-600 dark:text-primary-400 mt-2 italic">{rec.reason}</p>
                  <button
                    onClick={() => handleQuickAdd(rec)}
                    className="mt-3 w-full btn-primary text-xs py-2 flex items-center justify-center gap-1.5"
                  >
                    <FaPlus className="text-[10px]" /> Add to Collection
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
