import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Game from '@/models/Game';

export const dynamic = 'force-dynamic';

/**
 * POST /api/migrate/genres
 * Parses genres from the notes field ("Genres: RPG, Action") into the genres array field.
 * Safe to run multiple times.
 */
export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const games = await Game.find({
      userId: session.user.id,
      $or: [{ genres: { $exists: false } }, { genres: { $size: 0 } }, { genres: null }],
    });

    let migrated = 0;

    for (const game of games) {
      const notes = game.notes || '';
      const genreMatch = notes.match(/Genres?:\s*(.+)/i);
      if (genreMatch) {
        const genres = genreMatch[1]
          .split(',')
          .map((g: string) => g.trim())
          .filter((g: string) => g.length > 0 && g !== 'Unknown');

        if (genres.length > 0) {
          await Game.updateOne({ _id: game._id }, { $set: { genres } });
          migrated++;
        }
      }
    }

    return NextResponse.json({
      message: `Parsed genres for ${migrated} games.`,
      migrated,
      total: games.length,
    });
  } catch (error) {
    console.error('Genre migration error:', error);
    return NextResponse.json({ error: 'Migration failed' }, { status: 500 });
  }
}
