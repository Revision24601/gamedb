import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { blendCode } = await request.json();
    if (!blendCode || typeof blendCode !== 'string') {
      return NextResponse.json({ error: 'Please provide a blend code' }, { status: 400 });
    }

    const code = blendCode.trim().toUpperCase();

    // Find the friend by blend code
    const friend = await User.findOne({ blendCode: code });
    if (!friend) {
      return NextResponse.json({ error: 'No user found with that blend code. Check the code and try again.' }, { status: 404 });
    }

    // Can't add yourself
    if (friend._id!.toString() === session.user.id) {
      return NextResponse.json({ error: 'That\'s your own blend code!' }, { status: 400 });
    }

    const me = await User.findById(session.user.id);
    if (!me) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if already friends
    const myFriends = me.friends || [];
    if (myFriends.map((f: any) => f.toString()).includes(friend._id!.toString())) {
      return NextResponse.json({ error: 'You\'re already connected with this person!' }, { status: 409 });
    }

    // Add each other as friends (bidirectional)
    await User.findByIdAndUpdate(session.user.id, {
      $addToSet: { friends: friend._id },
    });
    await User.findByIdAndUpdate(friend._id, {
      $addToSet: { friends: session.user.id },
    });

    return NextResponse.json({
      message: `Connected with ${friend.name}!`,
      friend: { id: friend._id, name: friend.name },
    });
  } catch (error) {
    console.error('Blend connect error:', error);
    return NextResponse.json({ error: 'Failed to connect' }, { status: 500 });
  }
}
