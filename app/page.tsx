import Header from '@/components/Header';
import Link from 'next/link';
import { FaGamepad, FaStar, FaList } from 'react-icons/fa';

export default function Home() {
  return (
    <main>
      <Header />
      
      <div className="bg-gradient-to-b from-primary-600 to-primary-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Welcome to GameDB
            </h1>
            <p className="mt-6 text-xl max-w-3xl mx-auto">
              Your personal database to track, rate, and organize your video game collection.
            </p>
            <div className="mt-10 flex justify-center">
              <Link href="/games" className="btn btn-secondary mr-4">
                View My Games
              </Link>
              <Link href="/games/new" className="btn bg-white text-primary-700 hover:bg-gray-100">
                Add New Game
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      <div className="py-12 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
              Features
            </h2>
            <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
              Everything you need to manage your gaming collection.
            </p>
          </div>
          
          <div className="mt-10">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="card p-6">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-600 text-white mb-4">
                  <FaGamepad className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Track Your Games</h3>
                <p className="mt-2 text-gray-500 dark:text-gray-400">
                  Keep a comprehensive list of all your games across different platforms.
                </p>
              </div>
              
              <div className="card p-6">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-600 text-white mb-4">
                  <FaStar className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Rate Your Experience</h3>
                <p className="mt-2 text-gray-500 dark:text-gray-400">
                  Use our 10-star rating system to score games based on your personal experience.
                </p>
              </div>
              
              <div className="card p-6">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-600 text-white mb-4">
                  <FaList className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Organize by Status</h3>
                <p className="mt-2 text-gray-500 dark:text-gray-400">
                  Categorize games as Wishlist, In Library, Playing, Paused, Dropped, or Completed.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 