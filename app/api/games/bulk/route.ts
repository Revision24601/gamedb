import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Game from '@/models/Game';

export const dynamic = 'force-dynamic';

/**
 * POST /api/games/bulk
 * Body: { games: [{ title, platform, imageUrl, hoursPlayed, notes, status }] }
 * Creates multiple games at once for the authenticated user.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const { games } = body;

    if (!Array.isArray(games) || games.length === 0) {
      return NextResponse.json({ error: 'No games provided' }, { status: 400 });
    }

    // Cap at 200 games per request
    if (games.length > 200) {
      return NextResponse.json({ error: 'Maximum 200 games per import' }, { status: 400 });
    }

    // Get existing game titles for this user to skip duplicates
    const existingGames = await Game.find(
      { userId: session.user.id },
      { title: 1 }
    ).lean();
    const existingTitles = new Set(existingGames.map((g: any) => g.title.toLowerCase()));

    // Prepare documents, skipping duplicates
    const newGames: any[] = [];
    const skipped: string[] = [];

    for (const game of games) {
      if (!game.title) continue;

      if (existingTitles.has(game.title.toLowerCase())) {
        skipped.push(game.title);
        continue;
      }

      newGames.push({
        title: game.title.substring(0, 200),
        platform: game.platform || 'PC',
        status: game.status || 'Plan to Play',
        rating: game.rating || 0,
        hoursPlayed: game.hoursPlayed || 0,
        imageUrl: game.imageUrl || null,
        notes: game.notes ? game.notes.substring(0, 2000) : null,
        isFavorite: false,
        userId: session.user.id,
      });
    }

    let imported = 0;
    if (newGames.length > 0) {
      const result = await Game.insertMany(newGames, { ordered: false });
      imported = result.length;
    }

    return NextResponse.json({
      imported,
      skipped: skipped.length,
      skippedTitles: skipped.slice(0, 10), // Show first 10 skipped
      total: games.length,
    });
  } catch (error: any) {
    console.error('Bulk import error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to import games' },
      { status: 500 }
    );
  }
}
