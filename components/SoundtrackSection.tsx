'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaMusic, FaSpotify, FaApple, FaYoutube, FaExternalLinkAlt, FaCompactDisc, FaUser } from 'react-icons/fa';

interface SpotifyResult {
  type: 'album' | 'playlist';
  id: string;
  name: string;
  artist: string;
  imageUrl: string | null;
  imageSmall: string | null;
  spotifyUrl: string;
  embedUrl: string;
  releaseDate: string;
  totalTracks: number;
}

interface Track {
  name: string;
  durationMs: number;
  trackNumber: number;
  previewUrl: string | null;
}

interface SoundtrackSectionProps {
  gameTitle: string;
  composer?: string | null;
}

function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export default function SoundtrackSection({ gameTitle, composer }: SoundtrackSectionProps) {
  const [spotifyData, setSpotifyData] = useState<{
    bestMatch: SpotifyResult | null;
    results: SpotifyResult[];
    tracks: Track[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(true);
  const [showAllTracks, setShowAllTracks] = useState(false);
  const [selectedResult, setSelectedResult] = useState<SpotifyResult | null>(null);

  useEffect(() => {
    const fetchSoundtrack = async () => {
      try {
        const searchQuery = `${gameTitle} original soundtrack`;
        const res = await fetch(`/api/spotify/search?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setSpotifyData(data);
          setSelectedResult(data.bestMatch);
        }
      } catch (err) {
        console.error('Failed to fetch soundtrack:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSoundtrack();
  }, [gameTitle]);

  // Generate platform search URLs
  const encodedTitle = encodeURIComponent(`${gameTitle} soundtrack`);
  const platformLinks = [
    { name: 'Spotify', icon: FaSpotify, color: '#1DB954', url: `https://open.spotify.com/search/${encodedTitle}` },
    { name: 'Apple Music', icon: FaApple, color: '#FC3C44', url: `https://music.apple.com/search?term=${encodedTitle}` },
    { name: 'YouTube Music', icon: FaYoutube, color: '#FF0000', url: `https://music.youtube.com/search?q=${encodedTitle}` },
    { name: 'VGMdb', icon: FaCompactDisc, color: '#4a9eff', url: `https://vgmdb.net/search?q=${encodeURIComponent(gameTitle)}` },
  ];

  const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(`${gameTitle} full ost`)}`;
  const youtubeEmbedUrl = `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(`${gameTitle} full ost`)}&autoplay=0`;

  const active = selectedResult || spotifyData?.bestMatch;

  return (
    <div className="journal-card overflow-hidden">
      {/* Header — always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-0"
      >
        <h2 className="journal-section m-0">
          <FaMusic className="text-primary-500" />
          Listening Room
        </h2>
        <span className="text-xs text-gray-400 font-normal">
          {expanded ? 'Collapse' : 'Expand'}
        </span>
      </button>

      {/* Composer badge */}
      {composer && (
        <div className="mt-3 flex items-center gap-2">
          <FaUser className="text-xs text-gray-400" />
          <span className="text-sm text-gray-500 dark:text-gray-400">Composed by</span>
          <Link
            href={`/games?composer=${encodeURIComponent(composer)}`}
            className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline"
          >
            {composer}
          </Link>
        </div>
      )}

      {/* Expanded content */}
      {expanded && (
        <div className="mt-6 space-y-6">
          {/* Spotify embed + album art */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="loading-spinner" />
              <span className="ml-3 text-sm text-gray-400">Finding soundtracks...</span>
            </div>
          ) : active ? (
            <div>
              {/* Album info header */}
              <div className="flex items-start gap-4 mb-4">
                {active.imageUrl && (
                  <img
                    src={active.imageUrl}
                    alt={active.name}
                    className="w-24 h-24 rounded-lg shadow-lg object-cover"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white truncate">{active.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{active.artist}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                    {active.totalTracks > 0 && <span>{active.totalTracks} tracks</span>}
                    {active.releaseDate && <span>{active.releaseDate}</span>}
                    <span className="capitalize px-1.5 py-0.5 rounded bg-gray-100 dark:bg-slate-700">{active.type}</span>
                  </div>
                </div>
              </div>

              {/* Spotify Embed Player */}
              <div className="rounded-xl overflow-hidden bg-black">
                <iframe
                  src={active.embedUrl}
                  width="100%"
                  height="352"
                  frameBorder="0"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                  className="rounded-xl"
                  title={`${active.name} on Spotify`}
                />
              </div>

              {/* Tracklist */}
              {spotifyData?.tracks && spotifyData.tracks.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tracklist</h3>
                  <div className="space-y-0.5">
                    {(showAllTracks ? spotifyData.tracks : spotifyData.tracks.slice(0, 8)).map((track) => (
                      <div
                        key={track.trackNumber}
                        className="flex items-center gap-3 px-3 py-1.5 rounded hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        <span className="text-xs text-gray-400 w-5 text-right font-mono">{track.trackNumber}</span>
                        <span className="text-sm text-gray-800 dark:text-gray-200 flex-1 truncate">{track.name}</span>
                        <span className="text-xs text-gray-400 font-mono">{formatDuration(track.durationMs)}</span>
                      </div>
                    ))}
                    {spotifyData.tracks.length > 8 && (
                      <button
                        onClick={() => setShowAllTracks(!showAllTracks)}
                        className="text-xs text-primary-600 dark:text-primary-400 hover:underline mt-1 px-3"
                      >
                        {showAllTracks ? 'Show less' : `Show all ${spotifyData.tracks.length} tracks`}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Other Spotify results */}
              {spotifyData && spotifyData.results.length > 1 && (
                <div className="mt-4">
                  <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">Other results</h3>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {spotifyData.results.filter(r => r.id !== active.id).slice(0, 4).map((result) => (
                      <button
                        key={result.id}
                        onClick={() => setSelectedResult(result)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors flex-shrink-0"
                      >
                        {result.imageSmall && (
                          <img src={result.imageSmall} alt="" className="w-8 h-8 rounded object-cover" />
                        )}
                        <div className="text-left">
                          <p className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate max-w-[150px]">{result.name}</p>
                          <p className="text-[10px] text-gray-400">{result.type}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6">
              <FaMusic className="text-3xl text-gray-300 dark:text-gray-600 mx-auto mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">No Spotify results found for this game.</p>
            </div>
          )}

          {/* YouTube fallback */}
          <div>
            <a
              href={youtubeSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-red-500 hover:text-red-400 transition-colors"
            >
              <FaYoutube /> Search YouTube for Full OST <FaExternalLinkAlt className="text-[10px]" />
            </a>
          </div>

          {/* Platform links */}
          <div>
            <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">Listen on</h3>
            <div className="flex flex-wrap gap-2">
              {platformLinks.map((p) => {
                const Icon = p.icon;
                return (
                  <a
                    key={p.name}
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors text-sm text-gray-700 dark:text-gray-300"
                  >
                    <Icon style={{ color: p.color }} /> {p.name}
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
