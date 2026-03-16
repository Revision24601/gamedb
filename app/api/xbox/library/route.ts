import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const OPENXBL_API_KEY = process.env.OPENXBL_API_KEY || '';
const OPENXBL_BASE = 'https://xbl.io/api/v2';

/**
 * GET /api/xbox/library?gamertag=SomeGamertag
 *
 * Fetches an Xbox user's game library via OpenXBL.
 * Step 1: Resolve Gamertag to XUID
 * Step 2: Fetch title history (games played)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!OPENXBL_API_KEY) {
      return NextResponse.json(
        { error: 'Xbox import is not configured. OPENXBL_API_KEY is missing.' },
        { status: 503 }
      );
    }

    const gamertag = request.nextUrl.searchParams.get('gamertag') || '';
    if (!gamertag.trim()) {
      return NextResponse.json({ error: 'Please provide an Xbox Gamertag' }, { status: 400 });
    }

    const headers = {
      'X-Authorization': OPENXBL_API_KEY,
      'Accept': 'application/json',
      'Accept-Language': 'en-US',
    };

    // Step 1: Resolve Gamertag to XUID
    const searchRes = await fetch(
      `${OPENXBL_BASE}/search/${encodeURIComponent(gamertag.trim())}`,
      { headers, cache: 'no-store' }
    );

    if (!searchRes.ok) {
      if (searchRes.status === 404) {
        return NextResponse.json({ error: 'Gamertag not found. Check the spelling and try again.' }, { status: 404 });
      }
      if (searchRes.status === 429) {
        return NextResponse.json({ error: 'API rate limit reached. Please try again in a few minutes.' }, { status: 429 });
      }
      return NextResponse.json({ error: 'Failed to look up Gamertag' }, { status: 502 });
    }

    const searchData = await searchRes.json();
    const xuid = searchData?.people?.[0]?.xuid;

    if (!xuid) {
      return NextResponse.json({ error: 'Could not find an Xbox account with that Gamertag.' }, { status: 404 });
    }

    // Step 2: Fetch title history (games played)
    const titlesRes = await fetch(
      `${OPENXBL_BASE}/player/titleHistory/${xuid}`,
      { headers, cache: 'no-store' }
    );

    if (!titlesRes.ok) {
      if (titlesRes.status === 429) {
        return NextResponse.json({ error: 'API rate limit reached. Please try again in a few minutes.' }, { status: 429 });
      }
      return NextResponse.json({ error: 'Failed to fetch Xbox game library' }, { status: 502 });
    }

    const titlesData = await titlesRes.json();
    const titles = titlesData?.titles || [];

    // Map to clean format, filtering to actual games (not apps)
    const games = titles
      .filter((t: any) => t.type === 'Game' || t.type === 'DGame')
      .map((t: any) => ({
        titleId: t.titleId,
        name: t.name,
        modernTitleId: t.modernTitleId,
        // Calculate playtime from minutesPlayed if available
        playtimeMinutes: t.minutesPlayed || 0,
        playtimeHours: Math.round((t.minutesPlayed || 0) / 60 * 10) / 10,
        // Use display image if available
        imageUrl: t.displayImage || null,
        // Devices info
        devices: t.devices || [],
        lastPlayed: t.titleHistory?.lastTimePlayed || null,
      }));

    // Sort by last played / playtime
    games.sort((a: any, b: any) => {
      if (a.lastPlayed && b.lastPlayed) {
        return new Date(b.lastPlayed).getTime() - new Date(a.lastPlayed).getTime();
      }
      return b.playtimeMinutes - a.playtimeMinutes;
    });

    return NextResponse.json({
      gamertag: gamertag.trim(),
      xuid,
      gameCount: games.length,
      games,
    });
  } catch (error) {
    console.error('Xbox library error:', error);
    return NextResponse.json({ error: 'Failed to fetch Xbox library' }, { status: 500 });
  }
}
