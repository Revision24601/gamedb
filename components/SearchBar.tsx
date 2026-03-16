'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FaSearch, FaPlus, FaGamepad } from 'react-icons/fa';
import Image from 'next/image';

interface Game {
  _id: string;
  title: string;
  coverImage?: string;
  imageUrl?: string;
}

interface RawgGame {
  id: number;
  name: string;
  background_image: string | null;
  platforms?: { platform: { name: string } }[];
  released?: string;
  genres?: { name: string }[];
}

const SearchBar = () => {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [myGames, setMyGames] = useState<Game[]>([]);
  const [rawgGames, setRawgGames] = useState<RawgGame[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingRawg, setIsLoadingRawg] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search both local collection and RAWG
  useEffect(() => {
    if (query.length < 2) {
      setMyGames([]);
      setRawgGames([]);
      return;
    }

    const searchLocal = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/games/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setMyGames(data);
          setShowResults(true);
        }
      } catch (err) {
        console.error('Error searching local games:', err);
      } finally {
        setIsLoading(false);
      }
    };

    const searchRawg = async () => {
      setIsLoadingRawg(true);
      try {
        const res = await fetch(`/api/proxy/rawg?search=${encodeURIComponent(query)}&page_size=5`);
        if (res.ok) {
          const data = await res.json();
          setRawgGames(data.results || []);
        }
      } catch (err) {
        console.error('Error searching RAWG:', err);
      } finally {
        setIsLoadingRawg(false);
      }
    };

    const debounce = setTimeout(() => {
      searchLocal();
      searchRawg();
    }, 400);

    return () => clearTimeout(debounce);
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/games?search=${encodeURIComponent(query)}`);
      setShowResults(false);
    }
  };

  const handleGameSelect = (gameId: string) => {
    router.push(`/games/${gameId}`);
    setShowResults(false);
    setQuery('');
  };

  const handleQuickAdd = (game: RawgGame) => {
    const params = new URLSearchParams();
    params.set('title', game.name);
    if (game.background_image) params.set('imageUrl', game.background_image);
    if (game.platforms?.length) params.set('platform', game.platforms[0].platform.name);
    if (game.released) params.set('released', game.released);
    if (game.genres?.length) params.set('genres', game.genres.map(g => g.name).join(', '));

    router.push(`/games/new?${params.toString()}`);
    setShowResults(false);
    setQuery('');
  };

  const hasResults = myGames.length > 0 || rawgGames.length > 0;
  const isAnyLoading = isLoading || isLoadingRawg;

  return (
    <div className="relative" ref={searchRef}>
      <form onSubmit={handleSearch} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search games..."
          className="input pr-10"
          onFocus={() => query.length >= 2 && setShowResults(true)}
        />
        <button
          type="submit"
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <FaSearch />
        </button>
      </form>

      {showResults && query.length >= 2 && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-100 dark:border-slate-700 max-h-[420px] overflow-auto">
          {/* Your Collection */}
          {myGames.length > 0 && (
            <div>
              <div className="px-3 py-2 text-[10px] font-semibold tracking-wider uppercase text-gray-400 dark:text-slate-500 border-b border-gray-100 dark:border-slate-700">
                Your Games
              </div>
              <ul>
                {myGames.map((game) => (
                  <li
                    key={game._id}
                    onClick={() => handleGameSelect(game._id)}
                    className="px-3 py-2 hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer flex items-center gap-3"
                  >
                    <div className="w-8 h-8 bg-gray-100 dark:bg-slate-700 rounded flex-shrink-0 flex items-center justify-center overflow-hidden">
                      {game.coverImage || game.imageUrl ? (
                        <Image
                          src={(game.coverImage || game.imageUrl)!}
                          alt={game.title}
                          width={32}
                          height={32}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <FaGamepad className="text-gray-400 text-xs" />
                      )}
                    </div>
                    <span className="text-sm text-gray-900 dark:text-white truncate">{game.title}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* RAWG Results — Add to Collection */}
          {rawgGames.length > 0 && (
            <div>
              <div className="px-3 py-2 text-[10px] font-semibold tracking-wider uppercase text-gray-400 dark:text-slate-500 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
                <span>Add to Collection</span>
                <span className="text-[9px] font-normal normal-case text-gray-300 dark:text-slate-600">via RAWG</span>
              </div>
              <ul>
                {rawgGames.map((game) => (
                  <li
                    key={game.id}
                    className="px-3 py-2 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-3 group"
                  >
                    <div className="w-8 h-8 bg-gray-100 dark:bg-slate-700 rounded flex-shrink-0 overflow-hidden">
                      {game.background_image ? (
                        <Image
                          src={game.background_image}
                          alt={game.name}
                          width={32}
                          height={32}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FaGamepad className="text-gray-400 text-xs" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 dark:text-white truncate">{game.name}</p>
                      <p className="text-[10px] text-gray-400 dark:text-slate-500 truncate">
                        {game.platforms?.slice(0, 2).map(p => p.platform.name).join(', ')}
                      </p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleQuickAdd(game); }}
                      className="flex-shrink-0 p-1.5 rounded-lg text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Add to collection"
                    >
                      <FaPlus className="text-xs" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Loading state */}
          {isAnyLoading && !hasResults && (
            <div className="p-4 text-center text-sm text-gray-400">Searching...</div>
          )}

          {/* Empty state */}
          {!isAnyLoading && !hasResults && (
            <div className="p-4 text-center text-sm text-gray-400">No games found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
