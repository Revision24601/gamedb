import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Game from '@/models/Game';

export const dynamic = 'force-dynamic';

const RAWG_API_KEY = process.env.RAWG_API_KEY || 'c564933cc32c473e86b0c5034ee99427';

// RAWG genre slug mapping
const GENRE_SLUGS: Record<string, string> = {
  'Action': 'action', 'Adventure': 'adventure', 'RPG': 'role-playing-games-rpg',
  'Strategy': 'strategy', 'Shooter': 'shooter', 'Simulation': 'simulation',
  'Puzzle': 'puzzle', 'Platformer': 'platformer', 'Racing': 'racing',
  'Sports': 'sports', 'Fighting': 'fighting', 'Indie': 'indie',
  'Casual': 'casual', 'Arcade': 'arcade', 'Horror': 'horror',
};

// RAWG platform ID mapping
const PLATFORM_IDS: Record<string, string> = {
  'PC': '4', 'PlayStation 5': '187', 'PlayStation 4': '18', 'PlayStation 3': '16',
  'Xbox Series X/S': '186', 'Xbox One': '1', 'Xbox 360': '14',
  'Nintendo Switch': '7', 'MacOS': '5', 'Linux': '6', 'iOS': '3', 'Android': '21',
};

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const games = await Game.find({ userId: session.user.id }).lean();
    if (games.length === 0) {
      return NextResponse.json({ recommendations: [], reason: 'Add games to get recommendations' });
    }

    // Compute top genres
    const genreCounts: Record<string, number> = {};
    const platformCounts: Record<string, number> = {};
    const existingTitles = new Set(games.map((g: any) => g.title.toLowerCase()));

    games.forEach((game: any) => {
      // Count platforms
      if (game.platform) platformCounts[game.platform] = (platformCounts[game.platform] || 0) + 1;
      // Count genres from array or notes
      const genres = game.genres || [];
      if (genres.length === 0 && game.notes) {
        const match = game.notes.match(/Genres?:\s*(.+)/i);
        if (match) match[1].split(',').map((g: string) => g.trim()).filter((g: string) => g && g !== 'Unknown').forEach((g: string) => {
          genreCounts[g] = (genreCounts[g] || 0) + 1;
        });
      } else {
        genres.forEach((g: string) => { genreCounts[g] = (genreCounts[g] || 0) + 1; });
      }
    });

    const topGenres = Object.entries(genreCounts).sort((a, b) => b[1] - a[1]).slice(0, 3);
    const topPlatform = Object.entries(platformCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '';

    if (topGenres.length === 0) {
      return NextResponse.json({ recommendations: [], reason: 'Not enough genre data. Add genres to your games.' });
    }

    // Query RAWG for each top genre
    const allRecs: any[] = [];

    for (const [genre] of topGenres.slice(0, 2)) {
      const genreSlug = GENRE_SLUGS[genre] || genre.toLowerCase();
      const platformId = PLATFORM_IDS[topPlatform] || '';
      const params = new URLSearchParams({
        key: RAWG_API_KEY,
        genres: genreSlug,
        ordering: '-metacritic',
        page_size: '15',
        metacritic: '70,100',
      });
      if (platformId) params.set('platforms', platformId);

      try {
        const res = await fetch(`https://api.rawg.io/api/games?${params.toString()}`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          const results = (data.results || [])
            .filter((r: any) => !existingTitles.has(r.name.toLowerCase()))
            .map((r: any) => ({
              title: r.name,
              imageUrl: r.background_image,
              metacritic: r.metacritic,
              genres: r.genres?.map((g: any) => g.name) || [],
              platforms: r.platforms?.map((p: any) => p.platform.name) || [],
              released: r.released,
              reason: `Because you love ${genre}${topPlatform ? ` on ${topPlatform}` : ''}`,
            }));
          allRecs.push(...results);
        }
      } catch (err) {
        console.error('RAWG recommendation fetch error:', err);
      }
    }

    // Deduplicate and limit
    const seen = new Set<string>();
    const unique = allRecs.filter(r => {
      const key = r.title.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, 20);

    return NextResponse.json({
      recommendations: unique,
      topGenres: topGenres.map(([name, count]) => ({ name, count })),
      topPlatform,
    });
  } catch (error) {
    console.error('Recommendations error:', error);
    return NextResponse.json({ error: 'Failed to get recommendations' }, { status: 500 });
  }
}
