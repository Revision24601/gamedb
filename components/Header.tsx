'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import {
  FaGamepad,
  FaChartBar,
  FaChartPie,
  FaBrain,
  FaSignOutAlt,
  FaUser,
  FaBars,
  FaTimes,
} from 'react-icons/fa';
import SearchBar from './SearchBar';
import ThemeToggle from './ThemeToggle';

const Header = () => {
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/games', label: 'My Games', icon: null },
    { href: '/dashboard', label: 'Dashboard', icon: FaChartBar },
    { href: '/stats', label: 'Stats', icon: FaChartPie },
    { href: '/mindpalace', label: 'Mind Palace', icon: FaBrain },
  ];

  return (
    <header className="bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0" onClick={() => setMobileMenuOpen(false)}>
            <FaGamepad className="h-7 w-7 text-primary-600" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">GameDB</span>
          </Link>

          {/* Desktop: Search bar */}
          {session && (
            <div className="hidden md:block flex-1 max-w-md mx-6">
              <SearchBar />
            </div>
          )}

          {/* Desktop: Nav links */}
          <div className="hidden md:flex items-center gap-1">
            {session ? (
              <>
                {navLinks.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className="nav-link px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center gap-1.5"
                  >
                    {Icon && <Icon className="text-xs opacity-70" />}
                    {label}
                  </Link>
                ))}
                <Link href="/games/new" className="btn-primary ml-2 text-sm">
                  Add Game
                </Link>

                {/* User + logout */}
                <div className="flex items-center gap-2 ml-3 pl-3 border-l border-gray-200 dark:border-slate-600">
                  <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                    <FaUser className="text-[10px]" />
                    {session.user?.name || session.user?.email?.split('@')[0]}
                  </span>
                  <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                    title="Sign out"
                  >
                    <FaSignOutAlt className="text-sm" />
                  </button>
                </div>
              </>
            ) : status === 'loading' ? (
              <div className="text-sm text-gray-400">Loading...</div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login" className="nav-link text-sm font-medium px-3 py-2">
                  Sign In
                </Link>
                <Link href="/register" className="btn-primary text-sm">
                  Create Account
                </Link>
              </div>
            )}
            <ThemeToggle />
          </div>

          {/* Mobile: hamburger + theme toggle */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            {session && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
              >
                {mobileMenuOpen ? <FaTimes className="h-5 w-5" /> : <FaBars className="h-5 w-5" />}
              </button>
            )}
            {!session && status !== 'loading' && (
              <Link href="/login" className="btn-primary text-sm">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && session && (
        <div className="md:hidden border-t border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800">
          <div className="px-4 py-3">
            <SearchBar />
          </div>
          <nav className="px-2 pb-3 space-y-1">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="nav-link flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-slate-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                {Icon && <Icon className="text-sm opacity-70" />}
                {label}
              </Link>
            ))}
            <Link
              href="/games/new"
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20"
              onClick={() => setMobileMenuOpen(false)}
            >
              Add Game
            </Link>
          </nav>
          <div className="px-4 py-3 border-t border-gray-100 dark:border-slate-700 flex items-center justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
              <FaUser className="text-[10px]" />
              {session.user?.name || session.user?.email?.split('@')[0]}
            </span>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="text-sm text-red-500 hover:text-red-600 font-medium flex items-center gap-1.5"
            >
              <FaSignOutAlt className="text-xs" /> Sign Out
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
