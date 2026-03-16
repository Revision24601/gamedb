import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const RAWG_API_KEY = 'c564933cc32c473e86b0c5034ee99427'; // Consider moving this to environment variables
const RAWG_BASE_URL = 'https://api.rawg.io/api';

export async function GET(request: NextRequest) {
  try {
    // Get search parameters from the request
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const pageSize = searchParams.get('page_size') || '10';
    
    // Construct the RAWG API URL
    const url = `${RAWG_BASE_URL}/games?key=${RAWG_API_KEY}&search=${encodeURIComponent(search)}&page_size=${pageSize}`;
    
    // Fetch data from RAWG API (no-store to prevent caching in production)
    const response = await fetch(url, { cache: 'no-store' });
    
    if (!response.ok) {
      throw new Error(`RAWG API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error proxying to RAWG API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data from RAWG API' },
      { status: 500 }
    );
  }
} 