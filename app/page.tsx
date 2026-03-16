import Header from '@/components/Header';
import Link from 'next/link';
import { FaGamepad, FaStar, FaList, FaPlus, FaArrowRight } from 'react-icons/fa';
import GameList from '@/components/GameList';
import MigrationBanner from '@/components/MigrationBanner';
import NowPlayingShelf from '@/components/NowPlayingShelf';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function Home() {
  const session = await getServerSession(authOptions);
  const isLoggedIn = !!session;

  return (
    <main>
      <Header />
      <MigrationBanner />

      {!isLoggedIn ? (
        <>
          {/* Hero Section — for logged-out visitors */}
          <div className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-primary-950 text-white">
            <div className="absolute inset-0 bg-hero-pattern opacity-60" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-500/10 rounded-full blur-3xl" />

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-sm text-primary-200 mb-6">
                  <FaGamepad className="text-accent" />
                  <span>Your personal gaming journal</span>
                </div>

                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                  Track Your{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-light to-accent">
                    Gaming Journey
                  </span>
                </h1>

                <p className="mt-6 text-lg text-primary-200 max-w-2xl mx-auto leading-relaxed">
                  Rate, organize, and remember every game you play. Your collection, your way.
                </p>

                <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
                  <Link href="/register" className="btn-primary inline-flex items-center justify-center gap-2 text-base px-8 py-3">
                    Get Started <FaArrowRight className="text-sm" />
                  </Link>
                  <Link href="/login" className="inline-flex items-center justify-center gap-2 text-base px-8 py-3 rounded-lg font-medium bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 transition-all duration-200">
                    Sign In
                  </Link>
                </div>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-surface-light dark:from-surface-dark to-transparent" />
          </div>

          {/* Features — for logged-out visitors */}
          <div className="py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Everything You Need</h2>
                <p className="mt-3 text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
                  A complete toolkit for managing your gaming collection.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  { icon: FaGamepad, title: 'Track Your Games', desc: 'Keep a comprehensive list of all your games across different platforms.' },
                  { icon: FaStar, title: 'Rate Your Experience', desc: 'Use our 10-star rating system to score games based on your experience.' },
                  { icon: FaList, title: 'Organize by Status', desc: 'Categorize as Playing, Completed, On Hold, Dropped, or Plan to Play.' },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="card card-hover p-6 group">
                    <div className="icon-wrapper w-12 h-12 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
                    <p className="mt-2 text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Logged-in: Games first, no marketing */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Now Playing — front and center */}
            <NowPlayingShelf />

            {/* Game collection */}
            <div className="space-y-6 mt-10">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Games</h2>
                <Link href="/games/new" className="btn-primary inline-flex items-center gap-2">
                  <FaPlus className="text-xs" /> Add Game
                </Link>
              </div>
              <GameList />
            </div>
          </div>
        </>
      )}
    </main>
  );
}
