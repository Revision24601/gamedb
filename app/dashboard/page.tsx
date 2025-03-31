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
import { FaGamepad, FaArrowLeft, FaClock, FaChartBar, FaInfoCircle } from 'react-icons/fa';
import Header from '@/components/Header';
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
        
        // Fetch playing games for the chart
        const playingGamesResponse = await fetch('/api/games?status=Playing');
        if (!playingGamesResponse.ok) throw new Error('Failed to fetch playing games');
        const playingGamesData = await playingGamesResponse.json();
        
        // Sort by hours played (descending) and take top 15
        let sortedGames = [...(playingGamesData.games || [])].sort((a, b) => 
          (b.hoursPlayed || 0) - (a.hoursPlayed || 0)
        ).slice(0, 15);
        
        setGames(sortedGames);
        
        // Calculate total hours
        const total = sortedGames.reduce((sum, game) => sum + (game.hoursPlayed || 0), 0);
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

  // Transform data for the chart - moved inside the component to use truncateTitle
  const chartData = games.map(game => ({
    name: truncateTitle(game.title),
    hours: game.hoursPlayed || 0,
    fullTitle: game.title, // Keep the full title for tooltips
    _id: game._id, // Include the game ID for navigation
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const game = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded shadow-lg">
          <p className="font-medium text-gray-900 dark:text-white">{game.fullTitle}</p>
          <p className="text-accent">{`${payload[0].value} hours`}</p>
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
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between">
          <div>
            <Link href="/" className="text-accent hover:text-accent-dark flex items-center gap-1 mb-2">
              <FaArrowLeft className="text-sm" />
              <span>Back to Games</span>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FaChartBar className="text-accent" />
              Gaming Dashboard
            </h1>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-lg">
            <p className="text-red-800 dark:text-red-400">{error}</p>
          </div>
        ) : (
          <>
            {/* Stats Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {/* Total Games Card */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center gap-4">
                  <div className="bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded-full">
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
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center gap-4">
                  <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-full">
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
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center gap-4">
                  <div className="bg-yellow-50 dark:bg-yellow-900/30 p-3 rounded-full">
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
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center gap-4">
                  <div className="bg-accent/10 p-3 rounded-full">
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

            {/* Playing Games Section */}
            {games.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-10 text-center">
                <FaGamepad className="text-gray-400 text-6xl mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                  No Games Currently Being Played
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  When you start playing games, they'll appear here with their play time.
                </p>
                <Link 
                  href="/games/new" 
                  className="inline-flex items-center justify-center bg-accent hover:bg-accent-dark text-white font-medium py-2 px-4 rounded-md transition-colors"
                >
                  Add Your First Game
                </Link>
              </div>
            ) : (
              <>
                {/* Platform Insight */}
                {statsData.mostPlayedPlatform && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-8">
                    <div className="flex items-start gap-3">
                      <FaInfoCircle className="text-accent mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-gray-700 dark:text-gray-300">
                          <span className="font-medium">{statsData.mostPlayedPlatform}</span> is your most played platform with {allGames.filter(g => g.platform === statsData.mostPlayedPlatform).length} games. 
                          {games.length > 0 && ` You're currently playing ${games.length} ${games.length === 1 ? 'game' : 'games'}.`}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Games Bar Chart */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6 mb-8">
                  <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">
                    Currently Playing Games
                  </h2>
                  
                  <div className="h-80 md:h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chartData}
                        margin={{ 
                          top: 10, 
                          right: windowWidth < 640 ? 5 : 10, 
                          left: windowWidth < 640 ? 5 : 10, 
                          bottom: windowWidth < 640 ? 80 : 50 
                        }}
                        layout={windowWidth < 640 ? "vertical" : "horizontal"}
                        onClick={handleBarClick}
                        style={{ cursor: 'pointer' }}
                      >
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                        {windowWidth < 640 ? (
                          // Mobile view - Horizontal bars (vertical layout)
                          <>
                            <XAxis type="number" />
                            <YAxis 
                              dataKey="name" 
                              type="category" 
                              width={100}
                              tick={{ fontSize: 12 }}
                            />
                          </>
                        ) : (
                          // Desktop view - Vertical bars (horizontal layout)
                          <>
                            <XAxis 
                              dataKey="name" 
                              angle={-45} 
                              textAnchor="end" 
                              tick={{ fontSize: 12 }}
                              interval={0}
                              height={70}
                            />
                            <YAxis 
                              label={{ 
                                value: 'Hours Played', 
                                angle: -90, 
                                position: 'insideLeft',
                                style: { textAnchor: 'middle' }
                              }} 
                              allowDecimals={false}
                            />
                          </>
                        )}
                        <Tooltip 
                          content={<CustomTooltip />} 
                          cursor={<CustomCursor />}
                        />
                        <Legend wrapperStyle={{ paddingTop: 10 }} />
                        <Bar 
                          dataKey="hours" 
                          name="Hours Played" 
                          fill="#6366f1" 
                          radius={[4, 4, 0, 0]}
                          className="hover:opacity-80 transition-opacity"
                          animationDuration={1000}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Game List Table (mobile-friendly alternative) */}
                <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                  <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      Playing Games List
                    </h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                      Tabular view of your active games
                    </p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
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
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {games.map((game) => (
                          <tr key={game._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Link href={`/games/${game._id}`} className="text-accent hover:underline">
                                {game.title}
                              </Link>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {game.platform}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
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
          </>
        )}
      </div>
    </main>
  );
} 