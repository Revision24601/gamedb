import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export const dynamic = 'force-dynamic';

function generateBlendCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No I/O/0/1 to avoid confusion
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Generate blend code if doesn't exist
    if (!user.blendCode) {
      let code = generateBlendCode();
      // Ensure uniqueness
      let attempts = 0;
      while (await User.findOne({ blendCode: code }) && attempts < 10) {
        code = generateBlendCode();
        attempts++;
      }
      user.blendCode = code;
      await user.save();
    }

    return NextResponse.json({ blendCode: user.blendCode });
  } catch (error) {
    console.error('Blend code error:', error);
    return NextResponse.json({ error: 'Failed to get blend code' }, { status: 500 });
  }
}
