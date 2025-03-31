import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Game from '@/models/Game';
import { gameCreateSchema, gameSearchSchema } from '@/lib/validators';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const queryParams = {
      search: searchParams.get('search') || undefined,
      status: searchParams.get('status') || undefined,
      platform: searchParams.get('platform') || undefined,
      sort: searchParams.get('sort') || undefined,
      order: searchParams.get('order') || undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit') || '0') : undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page') || '0') : undefined,
    };

    // Validate search parameters
    const validationResult = gameSearchSchema.safeParse(queryParams);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid search parameters', details: validationResult.error.format() },
        { status: 400 }
      );
    }

    // Build the query
    const query: any = {};
    if (queryParams.search) {
      query.$or = [
        { title: { $regex: queryParams.search, $options: 'i' } },
        { platform: { $regex: queryParams.search, $options: 'i' } },
        { notes: { $regex: queryParams.search, $options: 'i' } },
      ];
    }

    if (queryParams.status) {
      query.status = queryParams.status;
    }

    if (queryParams.platform) {
      query.platform = { $regex: queryParams.platform, $options: 'i' };
    }

    // Determine sort options
    const sortField = queryParams.sort || 'updatedAt';
    const sortOrder = queryParams.order === 'asc' ? 1 : -1;
    const sortOptions: any = {};
    sortOptions[sortField] = sortOrder;

    // Pagination
    const limit = queryParams.limit || 50;
    const skip = queryParams.page ? (queryParams.page - 1) * limit : 0;

    // Execute the query
    const games = await Game.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const totalGames = await Game.countDocuments(query);

    return NextResponse.json({
      games,
      pagination: {
        total: totalGames,
        page: queryParams.page || 1,
        limit,
        pages: Math.ceil(totalGames / limit),
      },
    });
  } catch (error) {
    console.error('Failed to fetch games:', error);
    return NextResponse.json(
      { error: 'Failed to fetch games. Please try again later.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // First establish the connection
    await dbConnect();

    // Parse and validate the request body
    const body = await request.json();
    const validationResult = gameCreateSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid game data', details: validationResult.error.format() },
        { status: 400 }
      );
    }
    
    // Create the game with validated data
    const gameData = validationResult.data;
    const game = await Game.create(gameData);
    
    return NextResponse.json(game, { status: 201 });
  } catch (error: any) {
    console.error('Failed to create game:', error);
    
    // Return a more specific error message
    const errorMessage = error.code === 11000 
      ? 'A game with this title already exists.'
      : error.message || 'Failed to create game. Please try again later.';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: error.code === 11000 ? 409 : 500 }
    );
  }
} 