'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FaSearch } from 'react-icons/fa';
import Image from 'next/image';

interface Game {
  _id: string;
  title: string;
  coverImage?: string;
}

const SearchBar = () => {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchGames = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`/api/games/search?q=${encodeURIComponent(query)}`);
        if (response.ok) {
          const data = await response.json();
          setResults(data);
          setShowResults(true);
        }
      } catch (error) {
        console.error('Error searching games:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchGames, 300);
    return () => clearTimeout(debounceTimer);
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

      {showResults && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 rounded-md shadow-lg max-h-60 overflow-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">Loading...</div>
          ) : results.length > 0 ? (
            <ul>
              {results.map((game) => (
                <li
                  key={game._id}
                  onClick={() => handleGameSelect(game._id)}
                  className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center"
                >
                  {game.coverImage ? (
                    <div className="w-10 h-10 mr-3 relative flex-shrink-0">
                      <Image
                        src={game.coverImage}
                        alt={game.title}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 mr-3 bg-gray-200 dark:bg-gray-700 rounded flex-shrink-0 flex items-center justify-center">
                      <FaSearch className="text-gray-400" />
                    </div>
                  )}
                  <span>{game.title}</span>
                </li>
              ))}
            </ul>
          ) : query.length >= 2 ? (
            <div className="p-4 text-center text-gray-500">No games found</div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default SearchBar; 