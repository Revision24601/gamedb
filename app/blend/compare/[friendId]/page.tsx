'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import { FaArrowLeft, FaGamepad, FaStar, FaClock, FaUsers, FaExchangeAlt, FaChartBar } from 'react-icons/fa';

interface GameCommon {
  title: string;
  imageUrl?: string;
  mine: { status: string; rating: number; hoursPlayed: number };
  theirs: { status: string; rating: number; hoursPlayed: number };
}

interface GameUnique {
  title: string;
  imageUrl?: string;
  status: string;
  rating: number;
  hoursPlayed: number;
}

interface CompareData {
  myName: string;
  friendName: string;
  common: GameCommon[];
  onlyMine: GameUnique[];
  onlyTheirs: GameUnique[];
  stats: {
    myTotal: number;
    theirTotal: number;
    commonCount: number;
    myTotalHours: number;
    theirTotalHours: number;
    myAvgRating: number;
    theirAvgRating: number;
    agreementScore: number;
  };
}

type Tab = 'common' | 'onlyMine' | 'onlyTheirs';

export default function ComparePage({ params }: { params: { friendId: string } }) {
  const [data, setData] = useState<CompareData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<Tab>('common');

  useEffect(() => {
    const fetchComparison = async () => {
      try {
        const res = await fetch(`/api/blend/compare/${params.friendId}`);
        const json = await res.json();
        if (!res.ok) {
          setError(json.error || 'Failed to load comparison');
          return;
        }
        setData(json);
      } catch (err) {
        setError('Failed to load comparison');
      } finally {
        setLoading(false);
      }
    };
    fetchComparison();
  }, [params.friendId]);

  return (
    <main className="min-h-screen">
      <Header />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/blend" className="nav-link flex items-center gap-1 mb-6 text-sm group">
          <FaArrowLeft className="text-xs transition-transform group-hover:-translate-x-1" />
          <span>Back to Blend</span>
        </Link>

        {loading ? (
          <div className="flex justify-center py-16"><div className="loading-spinner" /></div>
        ) : error || !data ? (
          <div className="card p-8 text-center">
            <p className="text-red-500">{error}</p>
            <Link href="/blend" className="btn-primary mt-4 inline-block">Back to Blend</Link>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center justify-center gap-3">
                <FaExchangeAlt className="text-primary-500" />
                {data.myName} vs {data.friendName}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Library Comparison</p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              <div className="card p-4 text-center">
                <p className="text-2xl font-bold text-primary-600">{data.stats.commonCount}</p>
                <p className="text-xs text-gray-500 mt-1">Games in Common</p>
              </div>
              <div className="card p-4 text-center">
                <p className="text-2xl font-bold text-emerald-500">{data.stats.agreementScore}%</p>
                <p className="text-xs text-gray-500 mt-1">Rating Agreement</p>
              </div>
              <div className="card p-4 text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.stats.myTotal}</p>
                <p className="text-xs text-gray-500 mt-1">Your Games</p>
              </div>
              <div className="card p-4 text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.stats.theirTotal}</p>
                <p className="text-xs text-gray-500 mt-1">{data.friendName}&apos;s Games</p>
              </div>
            </div>

            {/* Head to Head Stats */}
            <div className="card p-6 mb-8">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FaChartBar className="text-primary-500" /> Head to Head
              </h2>
              <div className="space-y-4">
                {/* Hours */}
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>{data.myName}: {data.stats.myTotalHours}h</span>
                    <span>Total Hours</span>
                    <span>{data.friendName}: {data.stats.theirTotalHours}h</span>
                  </div>
                  <div className="flex h-3 rounded-full overflow-hidden bg-gray-100 dark:bg-slate-700">
                    <div
                      className="bg-primary-500 transition-all duration-500"
                      style={{ width: `${data.stats.myTotalHours + data.stats.theirTotalHours > 0 ? (data.stats.myTotalHours / (data.stats.myTotalHours + data.stats.theirTotalHours)) * 100 : 50}%` }}
                    />
                    <div className="bg-accent flex-1" />
                  </div>
                </div>
                {/* Avg Rating */}
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>{data.myName}: {data.stats.myAvgRating}/10</span>
                    <span>Avg Rating</span>
                    <span>{data.friendName}: {data.stats.theirAvgRating}/10</span>
                  </div>
                  <div className="flex h-3 rounded-full overflow-hidden bg-gray-100 dark:bg-slate-700">
                    <div
                      className="bg-primary-500 transition-all duration-500"
                      style={{ width: `${data.stats.myAvgRating + data.stats.theirAvgRating > 0 ? (data.stats.myAvgRating / (data.stats.myAvgRating + data.stats.theirAvgRating)) * 100 : 50}%` }}
                    />
                    <div className="bg-accent flex-1" />
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
              {([
                { key: 'common' as Tab, label: `In Common (${data.common.length})` },
                { key: 'onlyMine' as Tab, label: `Only You (${data.onlyMine.length})` },
                { key: 'onlyTheirs' as Tab, label: `Only ${data.friendName} (${data.onlyTheirs.length})` },
              ]).map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    tab === t.key
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'bg-white/50 dark:bg-slate-700/50 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-600'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Common games — side by side */}
            {tab === 'common' && (
              <div className="space-y-3">
                {data.common.length === 0 ? (
                  <div className="card p-8 text-center text-gray-400">No games in common yet</div>
                ) : (
                  data.common.map((game, i) => (
                    <div key={i} className="card p-4">
                      <div className="flex items-center gap-4">
                        {/* Image */}
                        <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-slate-700 flex-shrink-0 overflow-hidden">
                          {game.imageUrl ? (
                            <img src={game.imageUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <FaGamepad className="text-gray-400 text-sm" />
                            </div>
                          )}
                        </div>

                        {/* Title */}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white truncate">{game.title}</p>
                        </div>

                        {/* Your stats */}
                        <div className="text-right text-xs space-y-0.5 min-w-[90px]">
                          <p className="text-primary-600 dark:text-primary-400 font-medium">You</p>
                          {game.mine.rating > 0 && (
                            <p className="flex items-center justify-end gap-1 text-gray-500">
                              <FaStar className="text-yellow-500 text-[9px]" /> {game.mine.rating}
                            </p>
                          )}
                          {game.mine.hoursPlayed > 0 && (
                            <p className="text-gray-400">{game.mine.hoursPlayed}h</p>
                          )}
                        </div>

                        {/* Divider */}
                        <div className="w-px h-10 bg-gray-200 dark:bg-slate-600" />

                        {/* Their stats */}
                        <div className="text-left text-xs space-y-0.5 min-w-[90px]">
                          <p className="text-accent font-medium">{data.friendName}</p>
                          {game.theirs.rating > 0 && (
                            <p className="flex items-center gap-1 text-gray-500">
                              <FaStar className="text-yellow-500 text-[9px]" /> {game.theirs.rating}
                            </p>
                          )}
                          {game.theirs.hoursPlayed > 0 && (
                            <p className="text-gray-400">{game.theirs.hoursPlayed}h</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Only mine / only theirs */}
            {(tab === 'onlyMine' || tab === 'onlyTheirs') && (
              <div className="space-y-3">
                {(tab === 'onlyMine' ? data.onlyMine : data.onlyTheirs).length === 0 ? (
                  <div className="card p-8 text-center text-gray-400">No unique games</div>
                ) : (
                  (tab === 'onlyMine' ? data.onlyMine : data.onlyTheirs).map((game, i) => (
                    <div key={i} className="card p-4 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-slate-700 flex-shrink-0 overflow-hidden">
                        {game.imageUrl ? (
                          <img src={game.imageUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FaGamepad className="text-gray-400 text-sm" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white truncate">{game.title}</p>
                        <p className="text-xs text-gray-500">{game.status}</p>
                      </div>
                      <div className="text-xs text-gray-400 text-right space-y-0.5">
                        {game.rating > 0 && (
                          <p className="flex items-center justify-end gap-1">
                            <FaStar className="text-yellow-500 text-[9px]" /> {game.rating}/10
                          </p>
                        )}
                        {game.hoursPlayed > 0 && (
                          <p className="flex items-center justify-end gap-1">
                            <FaClock className="text-[9px]" /> {game.hoursPlayed}h
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
