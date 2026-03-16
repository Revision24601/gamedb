'use client';

import Link from 'next/link';
import Header from '@/components/Header';
import { FaArrowLeft, FaSteam, FaPlaystation, FaXbox } from 'react-icons/fa';

const platforms = [
  {
    id: 'steam',
    name: 'Steam',
    icon: FaSteam,
    color: '#1b2838',
    available: true,
    description: 'Import your PC game library from Steam',
    href: '/games/import/steam',
  },
  {
    id: 'psn',
    name: 'PlayStation',
    icon: FaPlaystation,
    color: '#003087',
    available: false,
    description: 'Import your PlayStation game library (coming soon)',
    href: '#',
  },
  {
    id: 'xbox',
    name: 'Xbox',
    icon: FaXbox,
    color: '#107c10',
    available: false,
    description: 'Import your Xbox game library (coming soon)',
    href: '#',
  },
];

export default function ImportPage() {
  return (
    <main className="min-h-screen">
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/games" className="nav-link flex items-center gap-1 mb-6 text-sm group">
          <FaArrowLeft className="text-xs transition-transform group-hover:-translate-x-1" />
          <span>Back to Games</span>
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Import Games</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          Connect your gaming accounts to quickly import your library into GameDB.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {platforms.map((platform) => {
            const Icon = platform.icon;
            return (
              <Link
                key={platform.id}
                href={platform.href}
                className={`card p-6 transition-all duration-200 ${
                  platform.available
                    ? 'card-hover cursor-pointer'
                    : 'opacity-60 cursor-not-allowed'
                }`}
                onClick={(e) => !platform.available && e.preventDefault()}
              >
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: platform.color }}
                >
                  <Icon className="text-2xl text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {platform.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {platform.description}
                </p>
                {!platform.available && (
                  <span className="inline-block mt-3 text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400">
                    Coming Soon
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
