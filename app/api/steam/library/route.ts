import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const STEAM_API_KEY = process.env.STEAM_API_KEY || '';
const STEAM_BASE = 'https://api.steampowered.com';

/**
 * GET /api/steam/library?steamId=76561198012345678
 * or  /api/steam/library?vanityUrl=nischay
 *
 * Returns the user's Steam library.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!STEAM_API_KEY) {
      return NextResponse.json(
        { error: 'Steam import is not configured. STEAM_API_KEY is missing.' },
        { status: 503 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    let steamId = searchParams.get('steamId') || '';
    const vanityUrl = searchParams.get('vanityUrl') || '';

    // If vanity URL provided, resolve it to a Steam ID
    if (!steamId && vanityUrl) {
      const resolveUrl = `${STEAM_BASE}/ISteamUser/ResolveVanityURL/v1/?key=${STEAM_API_KEY}&vanityurl=${encodeURIComponent(vanityUrl)}`;
      const resolveRes = await fetch(resolveUrl, { cache: 'no-store' });
      if (!resolveRes.ok) {
        return NextResponse.json({ error: 'Failed to resolve Steam vanity URL' }, { status: 502 });
      }
      const resolveData = await resolveRes.json();
      if (resolveData.response?.success !== 1) {
        return NextResponse.json(
          { error: 'Could not find a Steam account with that URL. Make sure it\'s correct.' },
          { status: 404 }
        );
      }
      steamId = resolveData.response.steamid;
    }

    if (!steamId) {
      return NextResponse.json({ error: 'Please provide a Steam ID or profile URL' }, { status: 400 });
    }

    // Validate steam ID format (should be 17-digit number)
    if (!/^\d{17}$/.test(steamId)) {
      return NextResponse.json(
        { error: 'Invalid Steam ID format. It should be a 17-digit number.' },
        { status: 400 }
      );
    }

    // Fetch owned games
    const gamesUrl = `${STEAM_BASE}/IPlayerService/GetOwnedGames/v1/?key=${STEAM_API_KEY}&steamid=${steamId}&include_appinfo=1&include_played_free_games=1&format=json`;
    const gamesRes = await fetch(gamesUrl, { cache: 'no-store' });

    if (!gamesRes.ok) {
      return NextResponse.json({ error: 'Failed to fetch games from Steam' }, { status: 502 });
    }

    const gamesData = await gamesRes.json();

    if (!gamesData.response || !gamesData.response.games) {
      return NextResponse.json(
        { error: 'No games found. Make sure the Steam profile is set to Public in Steam privacy settings.' },
        { status: 404 }
      );
    }

    // Map to a clean format
    const games = gamesData.response.games.map((game: any) => ({
      appId: game.appid,
      name: game.name,
      playtimeMinutes: game.playtime_forever || 0,
      playtimeHours: Math.round((game.playtime_forever || 0) / 60 * 10) / 10,
      iconUrl: game.img_icon_url
        ? `https://media.steampowered.com/steamcommunity/public/images/apps/${game.appid}/${game.img_icon_url}.jpg`
        : null,
      // Steam store header image (higher quality)
      headerUrl: `https://cdn.akamai.steamstatic.com/steam/apps/${game.appid}/header.jpg`,
    }));

    // Sort by playtime descending
    games.sort((a: any, b: any) => b.playtimeMinutes - a.playtimeMinutes);

    return NextResponse.json({
      steamId,
      gameCount: gamesData.response.game_count,
      games,
    });
  } catch (error) {
    console.error('Steam library error:', error);
    return NextResponse.json({ error: 'Failed to fetch Steam library' }, { status: 500 });
  }
}
