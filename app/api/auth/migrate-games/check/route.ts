import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Game from '@/models/Game';

/**
 * GET /api/auth/migrate-games/check
 * Returns the count of games that have no userId (unclaimed).
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const count = await Game.countDocuments({
      $or: [
        { userId: { $exists: false } },
        { userId: null },
      ],
    });

    return NextResponse.json({ count });
  } catch (error) {
    console.error('Error checking unclaimed games:', error);
    return NextResponse.json({ error: 'Failed to check' }, { status: 500 });
  }
}
