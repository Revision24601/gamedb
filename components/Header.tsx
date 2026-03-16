'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { FaGamepad, FaChartBar, FaChartPie, FaBrain, FaSignOutAlt, FaUser } from 'react-icons/fa';
import SearchBar from './SearchBar';
import ThemeToggle from './ThemeToggle';

const Header = () => {
  const { data: session, status } = useSession();

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <FaGamepad className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">GameDB</span>
            </Link>
          </div>
          
          {session && (
            <div className="flex-1 max-w-md mx-4">
              <SearchBar />
            </div>
          )}
          
          <div className="flex items-center space-x-4">
            {session ? (
              <>
                <Link 
                  href="/games" 
                  className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-500"
                >
                  My Games
                </Link>
                <Link 
                  href="/dashboard" 
                  className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-500 flex items-center"
                >
                  <FaChartBar className="mr-1" /> Dashboard
                </Link>
                <Link
                  href="/stats"
                  className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-500 flex items-center"
                >
                  <FaChartPie className="mr-1" /> Stats
                </Link>
                <Link
                  href="/mindpalace"
                  className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-500 flex items-center"
                >
                  <FaBrain className="mr-1" /> Mind Palace
                </Link>
                <Link 
                  href="/games/new" 
                  className="btn btn-primary"
                >
                  Add Game
                </Link>

                {/* User info + logout */}
                <div className="flex items-center gap-2 ml-2 pl-4 border-l border-gray-200 dark:border-gray-700">
                  <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                    <FaUser className="text-xs" />
                    {session.user?.name || session.user?.email}
                  </span>
                  <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                    title="Sign out"
                  >
                    <FaSignOutAlt />
                  </button>
                </div>
              </>
            ) : status === 'loading' ? (
              <div className="text-sm text-gray-400">Loading...</div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-500 text-sm font-medium"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="btn btn-primary text-sm"
                >
                  Create Account
                </Link>
              </div>
            )}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
