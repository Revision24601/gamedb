import { NextRequest, NextResponse } from 'next/server';

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
    
    // Fetch data from RAWG API
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`RAWG API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Return the data
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error proxying to RAWG API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data from RAWG API' },
      { status: 500 }
    );
  }
} 