import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Game from '@/models/Game';

/**
 * One-time migration endpoint.
 * Assigns all games that have no userId to the currently authenticated user.
 * Call this once after you register to claim your existing 51 games.
 * 
 * POST /api/auth/migrate-games
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Find all games with no userId (orphaned games from before auth was added)
    const result = await Game.updateMany(
      { userId: { $exists: false } },
      { $set: { userId: session.user.id } }
    );

    // Also catch games where userId is null
    const result2 = await Game.updateMany(
      { userId: null },
      { $set: { userId: session.user.id } }
    );

    const totalMigrated = result.modifiedCount + result2.modifiedCount;

    return NextResponse.json({
      message: `Migration complete. ${totalMigrated} games assigned to your account.`,
      migrated: totalMigrated,
    });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { error: 'Migration failed' },
      { status: 500 }
    );
  }
}
