'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { FaGamepad, FaArrowLeft, FaClock, FaChartBar, FaInfoCircle, FaBookOpen } from 'react-icons/fa';
import Header from '@/components/Header';
import NowPlayingDetail from '@/components/NowPlayingDetail';
import type { IGame } from '@/models/Game';

export default function Dashboard() {
  const [games, setGames] = useState<IGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalHours, setTotalHours] = useState(0);
  const [windowWidth, setWindowWidth] = useState(0);
  const [allGames, setAllGames] = useState<IGame[]>([]);
  const [statsData, setStatsData] = useState({
    totalGames: 0,
    completedGames: 0,
    averageRating: 0,
    mostPlayedPlatform: '',
  });

  const router = useRouter();

  // Update window width state when window is resized
  useEffect(() => {
    // Set initial width
    setWindowWidth(window.innerWidth);
    
    // Update width on resize
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true);
        
        // Fetch all games for stats
        const allGamesResponse = await fetch('/api/games');
        if (!allGamesResponse.ok) throw new Error('Failed to fetch all games');
        const allGamesData = await allGamesResponse.json();
        setAllGames(allGamesData.games || []);
        
        // Calculate insights
        const totalGames = allGamesData.games?.length || 0;
        const completedGames = allGamesData.games?.filter(g => g.status === 'Completed').length || 0;
        
        const validRatings = allGamesData.games?.filter(g => g.rating !== undefined && g.rating !== null);
        const averageRating = validRatings?.length 
          ? validRatings.reduce((sum, g) => sum + (g.rating || 0), 0) / validRatings.length 
          : 0;
        
        // Calculate most used platform
        const platformCounts = {};
        allGamesData.games?.forEach(game => {
          if (game.platform) {
            platformCounts[game.platform] = (platformCounts[game.platform] || 0) + 1;
          }
        });
        
        let mostPlayedPlatform = '';
        let maxCount = 0;
        Object.entries(platformCounts).forEach(([platform, count]) => {
          if (count > maxCount) {
            mostPlayedPlatform = platform;
            maxCount = count as number;
          }
        });
        
        setStatsData({
          totalGames,
          completedGames,
          averageRating,
          mostPlayedPlatform
        });
        
        // Set all games for the chart
        setGames(allGamesData.games || []);
        
        // Calculate total hours for currently playing games
        const total = allGamesData.games
          .filter((game: IGame) => game.status === 'Playing')
          .reduce((sum: number, game: IGame) => sum + (game.hoursPlayed || 0), 0);
        setTotalHours(total);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching games:', err);
        setError('Failed to load games. Please try again later.');
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  // Function to truncate long titles with responsive length
  const truncateTitle = useCallback((title: string) => {
    const maxLength = windowWidth < 640 ? 10 : windowWidth < 1024 ? 15 : 20;
    return title.length > maxLength ? `${title.substring(0, maxLength)}...` : title;
  }, [windowWidth]);

  // Filter and sort games by hours played
  const playingGames = games
    .filter(game => game.status === 'Playing' && game.hoursPlayed > 0)
    .sort((a, b) => (b.hoursPlayed || 0) - (a.hoursPlayed || 0))
    .slice(0, 15);

  const completedGames = games
    .filter(game => game.status === 'Completed' && game.hoursPlayed > 0)
    .sort((a, b) => (b.hoursPlayed || 0) - (a.hoursPlayed || 0))
    .slice(0, 15);

  // Replace the above code with this new version:
  // Combine all games and sort by hours played
  const chartData = games
    .filter(game => game.hoursPlayed > 0)
    .map(game => ({
      name: truncateTitle(game.title),
      hours: game.hoursPlayed || 0,
      status: game.status,
      fill: game.status === 'Playing' ? '#4F46E5' : '#10B981' // Indigo for playing, green for completed
    }))
    .sort((a, b) => b.hours - a.hours)
    .slice(0, 15);

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-medium text-gray-900 dark:text-white">{label}</p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {data.hours} {data.hours === 1 ? 'hour' : 'hours'} played
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Status: {data.status}
          </p>
        </div>
      );
    }
    return null;
  };

  // Function to handle bar click to navigate to game detail
  const handleBarClick = (data, index) => {
    if (data && data.activePayload && data.activePayload[0]) {
      const gameId = data.activePayload[0].payload._id;
      if (gameId) {
        router.push(`/games/${gameId}`);
      }
    }
  };

  // Function to make chart bars look clickable
  const CustomCursor = (props) => {
    const { x, y, width, height, payload } = props;
    return (
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill="rgba(99, 102, 241, 0.2)"
        stroke="rgba(99, 102, 241, 0.8)"
        strokeWidth={2}
        style={{ pointerEvents: "none" }}
      />
    );
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between">
          <div>
            <Link href="/" className="text-accent hover:text-accent-dark flex items-center gap-1 mb-3 transition-all duration-200 group">
              <FaArrowLeft className="text-sm transition-transform group-hover:-translate-x-1" />
              <span>Back to Home</span>
            </Link>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
              <FaBookOpen className="text-accent" />
              <span>My Gaming Journal</span>
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2 max-w-2xl">
              Track your gaming journey, see your progress, and reminisce about your adventures.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-xl">
            <p className="text-red-800 dark:text-red-400">{error}</p>
          </div>
        ) : chartData.length === 0 ? (
          <div className="text-center py-12 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <FaGamepad className="mx-auto h-12 w-12 text-gray-400 mb-3" />
            <h3 className="text-xl font-medium text-gray-800 dark:text-white">No games in progress</h3>
            <p className="mt-2 text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              Start playing some games to see your progress here!
            </p>
            <div className="mt-6">
              <Link 
                href="/games/new" 
                className="btn-primary inline-flex items-center shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                Add a Game
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Stats Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
              {/* Total Games Card */}
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
                      {statsData.totalGames}
                    </p>
                  </div>
                </div>
              </div>

              {/* Completed Games Card */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-transform hover:scale-102 hover:shadow-md">
                <div className="flex items-center gap-4">
                  <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-xl">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                      Completed
                    </h2>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {statsData.completedGames}
                    </p>
                  </div>
                </div>
              </div>

              {/* Average Rating Card */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-transform hover:scale-102 hover:shadow-md">
                <div className="flex items-center gap-4">
                  <div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-xl">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                      Avg Rating
                    </h2>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {statsData.averageRating.toFixed(1)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Hours Playing Card */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-transform hover:scale-102 hover:shadow-md">
                <div className="flex items-center gap-4">
                  <div className="bg-accent/10 p-4 rounded-xl">
                    <FaClock className="text-accent text-xl" />
                  </div>
                  <div>
                    <h2 className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                      Hours Playing
                    </h2>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {totalHours.toFixed(1)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Section title for Now Playing games */}
            <div className="flex items-center mb-6 mt-12 border-b border-gray-200 dark:border-gray-700 pb-2">
              <FaGamepad className="text-accent mr-3 text-xl" /> 
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                Currently Playing
              </h2>
            </div>

            {/* Now Playing Detail Component */}
            <NowPlayingDetail />

            {/* Platform Insight (appears only if there are games) */}
            {games.length > 0 && statsData.mostPlayedPlatform && (
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 my-10">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-xl">
                    <FaInfoCircle className="text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-1">Gaming Insights</h3>
                    <p className="text-gray-700 dark:text-gray-300">
                      <span className="font-medium text-accent">{statsData.mostPlayedPlatform}</span> is your favorite platform with {allGames.filter(g => g.platform === statsData.mostPlayedPlatform).length} games. 
                      {games.length > 0 && ` You're currently playing ${games.length} ${games.length === 1 ? 'game' : 'games'}.`}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Hours Distribution Chart */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-white flex items-center gap-2">
                <FaChartBar className="text-accent" />
                Hours Distribution
              </h2>
              
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45}
                      textAnchor="end"
                      height={100}
                      interval={0}
                      tick={{ fill: '#6B7280', fontSize: 12 }}
                    />
                    <YAxis 
                      tick={{ fill: '#6B7280', fontSize: 12 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="hours" 
                      name="Hours Played"
                      fill="#4F46E5"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Legend */}
              <div className="flex justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-indigo-600 rounded"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">Currently Playing</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-emerald-500 rounded"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">Completed</span>
                </div>
              </div>
            </div>

            {/* Game List Table (mobile-friendly alternative) */}
            <div className="mt-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                  <FaGamepad className="text-accent mr-2" />
                  Playing Games List
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                  Games you're currently exploring
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50/80 dark:bg-gray-700/80">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Game
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Platform
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Hours
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {games.map((game) => (
                      <tr key={game._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link href={`/games/${game._id}`} className="text-accent hover:underline font-medium">
                            {game.title}
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {game.platform}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-700 dark:text-gray-300">
                          {game.hoursPlayed?.toFixed(1) || 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
} 
