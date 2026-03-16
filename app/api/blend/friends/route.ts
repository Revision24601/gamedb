import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Game from '@/models/Game';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const me = await User.findById(session.user.id).lean();
    if (!me || !me.friends || me.friends.length === 0) {
      return NextResponse.json({ friends: [] });
    }

    // Fetch friend details
    const friends = await User.find(
      { _id: { $in: me.friends } },
      { name: 1, email: 1, blendCode: 1 }
    ).lean();

    // Get game count for each friend
    const friendsWithStats = await Promise.all(
      friends.map(async (f: any) => {
        const gameCount = await Game.countDocuments({ userId: f._id });
        return {
          id: f._id.toString(),
          name: f.name,
          gameCount,
        };
      })
    );

    return NextResponse.json({ friends: friendsWithStats });
  } catch (error) {
    console.error('Blend friends error:', error);
    return NextResponse.json({ error: 'Failed to fetch friends' }, { status: 500 });
  }
}
