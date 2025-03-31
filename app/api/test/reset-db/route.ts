import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

/**
 * API endpoint to reset the database during testing
 * Only available in development and test environments
 */
export async function POST() {
  // Safety check to prevent accidental data deletion in production
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'This endpoint is not available in production' },
      { status: 403 }
    );
  }

  try {
    const { db } = await connectToDatabase();
    
    // Only clear the games collection (don't delete other collections)
    await db.collection('games').deleteMany({});
    
    // Insert test data (optional)
    const testGames = [
      {
        title: 'Test Game 1',
        platform: 'PC',
        status: 'Playing',
        rating: 8,
        hoursPlayed: 10,
        imageUrl: 'https://via.placeholder.com/300x400',
        notes: 'Test game for Cypress testing'
      }
    ];
    
    if (testGames.length > 0) {
      await db.collection('games').insertMany(testGames);
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database reset successfully',
      testData: testGames.length > 0
    });
  } catch (error) {
    console.error('Error resetting database:', error);
    return NextResponse.json(
      { error: 'Failed to reset database' },
      { status: 500 }
    );
  }
} 