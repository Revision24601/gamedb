// API key for RAWG from environment variables
const RAWG_API_KEY = process.env.NEXT_PUBLIC_RAWG_API_KEY || '';
const API_BASE = 'https://api.rawg.io/api';

export interface RawgGame {
  id: number;
  name: string;
  background_image: string;
  released?: string;
  platforms?: { platform: { id: number; name: string } }[];
  genres?: { id: number; name: string }[];
  developers?: { id: number; name: string }[];
  publishers?: { id: number; name: string }[];
  metacritic?: number;
}

/**
 * Search for games by name
 */
export async function searchGames(query: string): Promise<RawgGame[]> {
  if (!query || query.length < 2) return [];
  
  try {
    const response = await fetch(
      `${API_BASE}/games?key=${RAWG_API_KEY}&search=${encodeURIComponent(query)}&page_size=10`
    );
    
    if (!response.ok) throw new Error('Failed to search games');
    
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error searching games:', error);
    return [];
  }
}

/**
 * Get detailed information about a specific game
 */
export async function getGameDetails(gameId: number): Promise<RawgGame | null> {
  try {
    const response = await fetch(
      `${API_BASE}/games/${gameId}?key=${RAWG_API_KEY}`
    );
    
    if (!response.ok) throw new Error('Failed to get game details');
    
    return await response.json();
  } catch (error) {
    console.error('Error getting game details:', error);
    return null;
  }
}

/**
 * Format a RAWG game object into our Game format
 */
export function formatGameData(rawgGame: RawgGame) {
  return {
    title: rawgGame.name,
    platform: rawgGame.platforms?.map(p => p.platform.name).join(', ') || '',
    imageUrl: rawgGame.background_image || '',
    // Default values for our fields
    status: 'Plan to Play',
    rating: 0,
    hoursPlayed: 0,
    notes: `Release Date: ${rawgGame.released || 'Unknown'}\nGenres: ${rawgGame.genres?.map(g => g.name).join(', ') || 'Unknown'}`
  };
} 