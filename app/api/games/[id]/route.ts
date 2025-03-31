import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Game from '@/models/Game';
import mongoose from 'mongoose';
import { gameIdSchema, gameUpdateSchema, isValidObjectId } from '@/lib/validators';

interface Params {
  params: {
    id: string;
  };
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    await dbConnect();
    
    // Validate ID format
    const validationResult = gameIdSchema.safeParse({ id: params.id });
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid game ID format', details: validationResult.error.format() },
        { status: 400 }
      );
    }
    
    const game = await Game.findById(params.id);
    
    if (!game) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(game);
  } catch (error) {
    console.error('Error fetching game:', error);
    return NextResponse.json(
      { error: 'Failed to fetch game' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    await dbConnect();
    
    // Validate ID format
    const idValidation = gameIdSchema.safeParse({ id: params.id });
    if (!idValidation.success) {
      return NextResponse.json(
        { error: 'Invalid game ID format', details: idValidation.error.format() },
        { status: 400 }
      );
    }
    
    // Parse and validate the request body
    const body = await req.json();
    const validationResult = gameUpdateSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid game data', details: validationResult.error.format() },
        { status: 400 }
      );
    }
    
    const gameData = validationResult.data;
    
    // Update the game with validated data
    const game = await Game.findByIdAndUpdate(
      params.id,
      {
        ...gameData,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );
    
    if (!game) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(game);
  } catch (error) {
    console.error('Error updating game:', error);
    return NextResponse.json(
      { error: 'Failed to update game' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    await dbConnect();
    
    // Validate ID format
    const validationResult = gameIdSchema.safeParse({ id: params.id });
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid game ID format', details: validationResult.error.format() },
        { status: 400 }
      );
    }
    
    const game = await Game.findByIdAndDelete(params.id);
    
    if (!game) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: 'Game deleted successfully' });
  } catch (error) {
    console.error('Error deleting game:', error);
    return NextResponse.json(
      { error: 'Failed to delete game' },
      { status: 500 }
    );
  }
} 