import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Game from '@/models/Game';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    const url = new URL(req.url);
    const query = url.searchParams.get('q');
    
    if (!query) {
      return NextResponse.json([]);
    }
    
    const games = await Game.find({
      title: { $regex: query, $options: 'i' }
    })
    .limit(10)
    .select('title coverImage')
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