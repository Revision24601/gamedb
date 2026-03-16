import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Game from '@/models/Game';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { friendId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Verify friendship
    const me = await User.findById(session.user.id).lean();
    if (!me?.friends?.map((f: any) => f.toString()).includes(params.friendId)) {
      return NextResponse.json({ error: 'Not connected with this user' }, { status: 403 });
    }

    const friend = await User.findById(params.friendId, { name: 1 }).lean();
    if (!friend) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const games = await Game.find({ userId: params.friendId })
      .sort({ updatedAt: -1 })
      .lean();

    return NextResponse.json({
      friend: { id: params.friendId, name: (friend as any).name },
      games,
    });
  } catch (error) {
    console.error('Blend library error:', error);
    return NextResponse.json({ error: 'Failed to fetch library' }, { status: 500 });
  }
}
