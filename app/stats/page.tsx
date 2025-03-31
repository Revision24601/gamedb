'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { 
  FaClock, 
  FaChartPie, 
  FaLightbulb, 
  FaArrowLeft, 
  FaBookOpen,
  FaGamepad, 
  FaStar, 
  FaTrophy,
  FaHourglassHalf,
  FaChartBar
} from 'react-icons/fa';
import type { IGame } from '@/models/Game';
import { GameStatus, GamePlatform } from '@/lib/validators';

// Type for our stats
interface GameStats {
  totalGames: number;
  totalHours: number;
  completedGames: number;
  playingGames: number;
  averageRating: number;
  averageHoursPerCompletedGame: number;
  mostPlayedPlatform: string;
  mostPlayedPlatformCount: number;
  highestRatedGame: IGame | null;
  longestPlayedGame: IGame | null;
}

interface PlatformCount {
  [key: string]: number;
}

interface StatusCount {
  [key: string]: number;
}

interface HoursByPlatform {
  [key: string]: number;
}

export default function StatsPage() {
  const [games, setGames] = useState<IGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<GameStats>({
    totalGames: 0,
    totalHours: 0,
    completedGames: 0,
    playingGames: 0,
    averageRating: 0,
    averageHoursPerCompletedGame: 0,
    mostPlayedPlatform: '',
    mostPlayedPlatformCount: 0,
    highestRatedGame: null,
    longestPlayedGame: null,
  });

  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/games');
        if (!response.ok) {
          throw new Error('Failed to fetch games');
        }
        const data = await response.json();
        setGames(data.games || []);
      } catch (err) {
        console.error('Error fetching games:', err);
        setError('Failed to load games. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  useEffect(() => {
    if (games.length > 0) {
      // Calculate statistics
      const platformCounts: PlatformCount = {};
      const statusCounts: StatusCount = {};
      const hoursByPlatform: HoursByPlatform = {};
      let totalHours = 0;
      let totalCompletedHours = 0;
      let totalRating = 0;
      let validRatingCount = 0;
      let highestRatedGame: IGame | null = null;
      let longestPlayedGame: IGame | null = null;

      games.forEach(game => {
        // Count platforms
        platformCounts[game.platform] = (platformCounts[game.platform] || 0) + 1;
        
        // Count statuses
        statusCounts[game.status] = (statusCounts[game.status] || 0) + 1;
        
        // Track hours by platform
        hoursByPlatform[game.platform] = (hoursByPlatform[game.platform] || 0) + (game.hoursPlayed || 0);
        
        // Calculate total hours
        totalHours += game.hoursPlayed || 0;
        
        // Track completed game hours
        if (game.status === 'Completed') {
          totalCompletedHours += game.hoursPlayed || 0;
        }
        
        // Track ratings (only count valid ratings)
        if (game.rating > 0) {
          totalRating += game.rating;
          validRatingCount++;
          
          // Track highest rated game
          if (!highestRatedGame || game.rating > (highestRatedGame.rating || 0)) {
            highestRatedGame = game;
          }
        }
        
        // Track longest played game
        if (!longestPlayedGame || (game.hoursPlayed || 0) > (longestPlayedGame.hoursPlayed || 0)) {
          longestPlayedGame = game;
        }
      });

      // Find most played platform
      let mostPlayedPlatform = '';
      let mostPlayedPlatformCount = 0;
      Object.entries(platformCounts).forEach(([platform, count]) => {
        if (count > mostPlayedPlatformCount) {
          mostPlayedPlatform = platform;
          mostPlayedPlatformCount = count;
        }
      });

      // Calculate averages
      const averageRating = validRatingCount > 0 ? (totalRating / validRatingCount) : 0;
      const completedGames = statusCounts['Completed'] || 0;
      const averageHoursPerCompletedGame = completedGames > 0 ? (totalCompletedHours / completedGames) : 0;

      // Set stats
      setStats({
        totalGames: games.length,
        totalHours,
        completedGames,
        playingGames: statusCounts['Playing'] || 0,
        averageRating,
        averageHoursPerCompletedGame,
        mostPlayedPlatform,
        mostPlayedPlatformCount,
        highestRatedGame,
        longestPlayedGame,
      });
    }
  }, [games]);

  // Helper function to format hours
  const formatHours = (hours: number) => {
    if (hours === 0) return '0 hours';
    if (hours < 1) return '< 1 hour';
    
    const roundedHours = Math.round(hours * 10) / 10;
    return `${roundedHours} ${roundedHours === 1 ? 'hour' : 'hours'}`;
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link href="/" className="text-accent hover:text-accent-dark flex items-center gap-1 mb-3 transition-all duration-200 group">
            <FaArrowLeft className="text-sm transition-transform group-hover:-translate-x-1" />
            <span>Back to Home</span>
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
            <FaChartPie className="text-accent" />
            <span>Your Gaming Insights</span>
          </h1>
          
          <p className="text-gray-600 dark:text-gray-300 mt-2 max-w-2xl">
            Fun facts and statistics about your gaming collection and habits
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-xl">
            <p className="text-red-800 dark:text-red-400">{error}</p>
          </div>
        ) : games.length === 0 ? (
          <div className="text-center py-12 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <FaGamepad className="mx-auto h-12 w-12 text-gray-400 mb-3" />
            <h3 className="text-xl font-medium text-gray-800 dark:text-white">Your collection is empty</h3>
            <p className="mt-2 text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              Start building your gaming journal so we can show you interesting insights!
            </p>
            <div className="mt-6">
              <Link 
                href="/games/new" 
                className="btn-primary inline-flex items-center shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                Add Your First Game
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Overview stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Total Games */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-transform hover:scale-102 hover:shadow-md">
                <div className="flex items-center gap-4">
                  <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-xl">
                    <FaGamepad className="text-indigo-500 text-xl" />
                  </div>
                  <div>
                    <h2 className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                      Total Games
                    </h2>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {stats.totalGames}
                    </p>
                  </div>
                </div>
              </div>

              {/* Total Hours */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-transform hover:scale-102 hover:shadow-md">
                <div className="flex items-center gap-4">
                  <div className="bg-accent/10 p-4 rounded-xl">
                    <FaClock className="text-accent text-xl" />
                  </div>
                  <div>
                    <h2 className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                      Total Hours
                    </h2>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {stats.totalHours.toFixed(1)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Completed Games */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-transform hover:scale-102 hover:shadow-md">
                <div className="flex items-center gap-4">
                  <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-xl">
                    <FaTrophy className="text-green-500 text-xl" />
                  </div>
                  <div>
                    <h2 className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                      Completed
                    </h2>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {stats.completedGames}
                    </p>
                  </div>
                </div>
              </div>

              {/* Average Rating */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-transform hover:scale-102 hover:shadow-md">
                <div className="flex items-center gap-4">
                  <div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-xl">
                    <FaStar className="text-yellow-500 text-xl" />
                  </div>
                  <div>
                    <h2 className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                      Avg. Rating
                    </h2>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {stats.averageRating.toFixed(1)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Fun insights */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-white flex items-center gap-2">
                <FaLightbulb className="text-yellow-500" />
                Fun Gaming Insights
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Most Played Platform */}
                <div className="flex gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-xl h-max">
                    <FaGamepad className="text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Favorite Platform</h3>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">
                      <span className="font-medium text-accent">{stats.mostPlayedPlatform}</span> is your 
                      most-used platform with {stats.mostPlayedPlatformCount} {stats.mostPlayedPlatformCount === 1 ? 'game' : 'games'}.
                    </p>
                  </div>
                </div>
                
                {/* Hours per Completed Game */}
                <div className="flex gap-4">
                  <div className="bg-purple-50 dark:bg-purple-900/30 p-3 rounded-xl h-max">
                    <FaHourglassHalf className="text-purple-500" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Time to Complete</h3>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">
                      {stats.completedGames > 0 ? (
                        <>On average, you spend <span className="font-medium text-accent">{formatHours(stats.averageHoursPerCompletedGame)}</span> to complete a game.</>
                      ) : (
                        <>You haven't completed any games yet.</>
                      )}
                    </p>
                  </div>
                </div>
                
                {/* Highest Rated Game */}
                {stats.highestRatedGame && stats.highestRatedGame.rating > 0 && (
                  <div className="flex gap-4">
                    <div className="bg-yellow-50 dark:bg-yellow-900/30 p-3 rounded-xl h-max">
                      <FaStar className="text-yellow-500" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">Your Favorite Game</h3>
                      <p className="text-gray-600 dark:text-gray-300 mt-1">
                        <Link href={`/games/${stats.highestRatedGame._id}`} className="font-medium text-accent hover:underline">
                          {stats.highestRatedGame.title}
                        </Link> is your highest-rated game with a {stats.highestRatedGame.rating}/10 rating.
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Longest Played Game */}
                {stats.longestPlayedGame && stats.longestPlayedGame.hoursPlayed > 0 && (
                  <div className="flex gap-4">
                    <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-xl h-max">
                      <FaClock className="text-green-500" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">Most Time Invested</h3>
                      <p className="text-gray-600 dark:text-gray-300 mt-1">
                        You've spent the most time on <Link href={`/games/${stats.longestPlayedGame._id}`} className="font-medium text-accent hover:underline">{stats.longestPlayedGame.title}</Link> with <span className="font-medium text-accent">{formatHours(stats.longestPlayedGame.hoursPlayed || 0)}</span>.
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Gaming Commitment */}
                <div className="flex gap-4">
                  <div className="bg-orange-50 dark:bg-orange-900/30 p-3 rounded-xl h-max">
                    <FaBookOpen className="text-orange-500" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Your Gaming Journey</h3>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">
                      {stats.totalHours > 0 ? (
                        <>You've spent <span className="font-medium text-accent">{formatHours(stats.totalHours)}</span> enjoying your games. {stats.playingGames > 0 ? `You're currently playing ${stats.playingGames} ${stats.playingGames === 1 ? 'game' : 'games'}.` : ''}</>
                      ) : (
                        <>Start tracking your hours played to see your gaming commitment.</>
                      )}
                    </p>
                  </div>
                </div>

                {/* Completion Rate */}
                <div className="flex gap-4">
                  <div className="bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded-xl h-max">
                    <FaTrophy className="text-indigo-500" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Completion Rate</h3>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">
                      {stats.totalGames > 0 ? (
                        <>You've completed <span className="font-medium text-accent">{Math.round((stats.completedGames / stats.totalGames) * 100)}%</span> of your game collection.</>
                      ) : (
                        <>Add some games to see your completion rate.</>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Did You Know section */}
            <div className="bg-gradient-to-br from-accent/10 to-accent/5 dark:from-accent/20 dark:to-accent/5 backdrop-blur-sm rounded-xl shadow-sm border border-accent/20 dark:border-accent/30 p-6">
              <div className="flex items-start gap-4">
                <div className="bg-white dark:bg-gray-800 p-3 rounded-xl">
                  <FaLightbulb className="text-accent" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Did you know?</h3>
                  <p className="text-gray-700 dark:text-gray-300 mt-1">
                    {stats.totalHours > 0 ? (
                      <>
                        {stats.totalHours > 500 ? (
                          <>With {stats.totalHours.toFixed(0)} hours of gaming, you could have watched all of the Lord of the Rings extended editions about {Math.floor(stats.totalHours / 11.4)} times! That's quite the gaming commitment.</>
                        ) : stats.totalHours > 100 ? (
                          <>Your {stats.totalHours.toFixed(0)} hours of gaming is equivalent to watching about {Math.floor(stats.totalHours / 2.5)} feature-length movies. Your gaming journey is a blockbuster saga!</>
                        ) : (
                          <>If you'd spent your {stats.totalHours.toFixed(0)} gaming hours on learning a language, you'd be well on your way to basic fluency! But games are more fun, right?</>
                        )}
                      </>
                    ) : (
                      <>
                        The average gamer spends about 8 hours per week playing video games. Start logging your hours to see how you compare!
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Link to Dashboard */}
            <div className="text-center mt-12">
              <Link 
                href="/dashboard" 
                className="inline-flex items-center text-accent hover:text-accent-dark transition-colors gap-2 font-medium"
              >
                <FaChartBar className="text-accent" /> View detailed dashboard
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
} 