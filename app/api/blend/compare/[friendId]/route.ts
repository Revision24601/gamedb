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

    // Fetch both libraries
    const myGames = await Game.find({ userId: session.user.id }).lean();
    const theirGames = await Game.find({ userId: params.friendId }).lean();

    // Build title-based lookup (normalize to lowercase for matching)
    const myByTitle: Record<string, any> = {};
    myGames.forEach((g: any) => { myByTitle[g.title.toLowerCase()] = g; });

    const theirByTitle: Record<string, any> = {};
    theirGames.forEach((g: any) => { theirByTitle[g.title.toLowerCase()] = g; });

    // Find common, only mine, only theirs
    const common: any[] = [];
    const onlyMine: any[] = [];
    const onlyTheirs: any[] = [];

    for (const [titleKey, myGame] of Object.entries(myByTitle)) {
      if (theirByTitle[titleKey]) {
        common.push({
          title: myGame.title,
          imageUrl: myGame.imageUrl || theirByTitle[titleKey].imageUrl,
          mine: { status: myGame.status, rating: myGame.rating, hoursPlayed: myGame.hoursPlayed },
          theirs: { status: theirByTitle[titleKey].status, rating: theirByTitle[titleKey].rating, hoursPlayed: theirByTitle[titleKey].hoursPlayed },
        });
      } else {
        onlyMine.push({
          title: myGame.title,
          imageUrl: myGame.imageUrl,
          status: myGame.status,
          rating: myGame.rating,
          hoursPlayed: myGame.hoursPlayed,
        });
      }
    }

    for (const [titleKey, theirGame] of Object.entries(theirByTitle)) {
      if (!myByTitle[titleKey]) {
        onlyTheirs.push({
          title: theirGame.title,
          imageUrl: theirGame.imageUrl,
          status: theirGame.status,
          rating: theirGame.rating,
          hoursPlayed: theirGame.hoursPlayed,
        });
      }
    }

    // Stats
    const myTotalHours = myGames.reduce((sum: number, g: any) => sum + (g.hoursPlayed || 0), 0);
    const theirTotalHours = theirGames.reduce((sum: number, g: any) => sum + (g.hoursPlayed || 0), 0);
    const myRated = myGames.filter((g: any) => g.rating > 0);
    const theirRated = theirGames.filter((g: any) => g.rating > 0);
    const myAvgRating = myRated.length > 0 ? myRated.reduce((s: number, g: any) => s + g.rating, 0) / myRated.length : 0;
    const theirAvgRating = theirRated.length > 0 ? theirRated.reduce((s: number, g: any) => s + g.rating, 0) / theirRated.length : 0;

    // Rating agreement on common games (how similar are ratings)
    const bothRated = common.filter(g => g.mine.rating > 0 && g.theirs.rating > 0);
    let agreementScore = 0;
    if (bothRated.length > 0) {
      const totalDiff = bothRated.reduce((sum, g) => sum + Math.abs(g.mine.rating - g.theirs.rating), 0);
      agreementScore = Math.round((1 - totalDiff / (bothRated.length * 10)) * 100);
    }

    return NextResponse.json({
      myName: (me as any).name,
      friendName: (friend as any).name,
      common: common.sort((a, b) => a.title.localeCompare(b.title)),
      onlyMine: onlyMine.sort((a, b) => a.title.localeCompare(b.title)),
      onlyTheirs: onlyTheirs.sort((a, b) => a.title.localeCompare(b.title)),
      stats: {
        myTotal: myGames.length,
        theirTotal: theirGames.length,
        commonCount: common.length,
        myTotalHours: Math.round(myTotalHours * 10) / 10,
        theirTotalHours: Math.round(theirTotalHours * 10) / 10,
        myAvgRating: Math.round(myAvgRating * 10) / 10,
        theirAvgRating: Math.round(theirAvgRating * 10) / 10,
        agreementScore,
      },
    });
  } catch (error) {
    console.error('Blend compare error:', error);
    return NextResponse.json({ error: 'Failed to compare' }, { status: 500 });
  }
}
