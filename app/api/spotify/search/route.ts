import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID || '';
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET || '';

// Cache the access token in memory (server-side)
let cachedToken: { token: string; expiresAt: number } | null = null;

async function getSpotifyToken(): Promise<string> {
  // Return cached token if still valid (with 60s buffer)
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60000) {
    return cachedToken.token;
  }

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64'),
    },
    body: 'grant_type=client_credentials',
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Failed to get Spotify access token');
  }

  const data = await res.json();
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in * 1000),
  };

  return cachedToken.token;
}

/**
 * GET /api/spotify/search?q=Elden Ring soundtrack
 *
 * Searches Spotify for albums/playlists matching the query.
 * Returns the best match with embed URI, album art, and tracks.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
      return NextResponse.json({ error: 'Spotify not configured' }, { status: 503 });
    }

    const query = request.nextUrl.searchParams.get('q') || '';
    if (!query.trim()) {
      return NextResponse.json({ error: 'Search query required' }, { status: 400 });
    }

    const token = await getSpotifyToken();

    // Search for albums first (most likely to be an OST)
    const searchQuery = encodeURIComponent(query);
    const albumRes = await fetch(
      `https://api.spotify.com/v1/search?q=${searchQuery}&type=album&limit=5`,
      {
        headers: { 'Authorization': `Bearer ${token}` },
        cache: 'no-store',
      }
    );

    if (!albumRes.ok) {
      throw new Error('Spotify search failed');
    }

    const albumData = await albumRes.json();
    const albums = albumData?.albums?.items || [];

    // Also search playlists as fallback
    const playlistRes = await fetch(
      `https://api.spotify.com/v1/search?q=${searchQuery}&type=playlist&limit=3`,
      {
        headers: { 'Authorization': `Bearer ${token}` },
        cache: 'no-store',
      }
    );

    const playlistData = await playlistRes.json();
    const playlists = playlistData?.playlists?.items || [];

    // Format results
    const results = [
      ...albums.map((a: any) => ({
        type: 'album' as const,
        id: a.id,
        name: a.name,
        artist: a.artists?.map((ar: any) => ar.name).join(', ') || 'Unknown',
        imageUrl: a.images?.[0]?.url || null,
        imageSmall: a.images?.[1]?.url || a.images?.[0]?.url || null,
        spotifyUrl: a.external_urls?.spotify || '',
        embedUrl: `https://open.spotify.com/embed/album/${a.id}?utm_source=generator&theme=0&autoplay=true`,
        releaseDate: a.release_date || '',
        totalTracks: a.total_tracks || 0,
      })),
      ...playlists.map((p: any) => ({
        type: 'playlist' as const,
        id: p.id,
        name: p.name,
        artist: p.owner?.display_name || 'Unknown',
        imageUrl: p.images?.[0]?.url || null,
        imageSmall: p.images?.[1]?.url || p.images?.[0]?.url || null,
        spotifyUrl: p.external_urls?.spotify || '',
        embedUrl: `https://open.spotify.com/embed/playlist/${p.id}?utm_source=generator&theme=0&autoplay=true`,
        releaseDate: '',
        totalTracks: p.tracks?.total || 0,
      })),
    ];

    // Try to fetch tracks for the best album match
    let tracks: any[] = [];
    if (albums.length > 0) {
      try {
        const tracksRes = await fetch(
          `https://api.spotify.com/v1/albums/${albums[0].id}/tracks?limit=20`,
          {
            headers: { 'Authorization': `Bearer ${token}` },
            cache: 'no-store',
          }
        );
        if (tracksRes.ok) {
          const tracksData = await tracksRes.json();
          tracks = (tracksData?.items || []).map((t: any) => ({
            name: t.name,
            durationMs: t.duration_ms,
            trackNumber: t.track_number,
            previewUrl: t.preview_url,
          }));
        }
      } catch {
        // Tracks are optional, don't fail
      }
    }

    return NextResponse.json({
      results,
      tracks,
      bestMatch: results[0] || null,
    });
  } catch (error) {
    console.error('Spotify search error:', error);
    return NextResponse.json({ error: 'Failed to search Spotify' }, { status: 500 });
  }
}
