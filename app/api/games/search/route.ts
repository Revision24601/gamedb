import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Game from '@/models/Game';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    const url = new URL(req.url);
    const query = url.searchParams.get('q');
    
    if (!query) {
      return NextResponse.json([]);
    }
    
    const games = await Game.find({
      userId: session.user.id,
      title: { $regex: query, $options: 'i' },
    })
    .limit(10)
    .select('title imageUrl')
    .sort({ title: 1 });
    
    return NextResponse.json(games);
  } catch (error) {
    console.error('Error searching games:', error);
    return NextResponse.json(
      { error: 'Failed to search games' },
      { status: 500 }
    );
  }
}
