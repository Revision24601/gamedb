'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { useToast } from '@/components/ToastProvider';
import { FaArrowLeft, FaXbox, FaSearch, FaCheck, FaGamepad, FaClock, FaSpinner } from 'react-icons/fa';

interface XboxGame {
  titleId: string;
  name: string;
  playtimeMinutes: number;
  playtimeHours: number;
  imageUrl: string | null;
  lastPlayed: string | null;
}

type Step = 'input' | 'loading' | 'select' | 'importing' | 'done';

export default function XboxImportPage() {
  const { showToast } = useToast();

  const [step, setStep] = useState<Step>('input');
  const [gamertag, setGamertag] = useState('');
  const [error, setError] = useState('');
  const [games, setGames] = useState<XboxGame[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState('');
  const [importResult, setImportResult] = useState({ imported: 0, skipped: 0 });

  const fetchLibrary = async () => {
    if (!gamertag.trim()) {
      setError('Please enter an Xbox Gamertag.');
      return;
    }

    setError('');
    setStep('loading');

    try {
      const res = await fetch(`/api/xbox/library?gamertag=${encodeURIComponent(gamertag.trim())}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to fetch Xbox library');
        setStep('input');
        return;
      }

      setGames(data.games || []);
      // Pre-select games with playtime
      const preSelected = new Set<string>(
        (data.games || [])
          .filter((g: XboxGame) => g.playtimeMinutes > 0)
          .map((g: XboxGame) => g.titleId)
      );
      setSelected(preSelected);
      setStep('select');
    } catch (err) {
      setError('Failed to connect. Please try again.');
      setStep('input');
    }
  };

  const filteredGames = useMemo(() => {
    if (!filter) return games;
    const lower = filter.toLowerCase();
    return games.filter((g) => g.name.toLowerCase().includes(lower));
  }, [games, filter]);

  const toggleGame = (titleId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(titleId)) next.delete(titleId);
      else next.add(titleId);
      return next;
    });
  };

  const selectAll = () => setSelected(new Set(filteredGames.map((g) => g.titleId)));
  const deselectAll = () => setSelected(new Set());

  const importSelected = async () => {
    const toImport = games.filter((g) => selected.has(g.titleId));
    if (toImport.length === 0) {
      showToast('No games selected', 'warning');
      return;
    }

    setStep('importing');

    try {
      const gameObjects = toImport.map((g) => ({
        title: g.name,
        platform: 'Xbox Series X/S',
        status: g.playtimeHours > 0 ? 'Playing' : 'Plan to Play',
        rating: 0,
        hoursPlayed: g.playtimeHours,
        imageUrl: g.imageUrl,
        notes: `Imported from Xbox (Title ID: ${g.titleId})`,
      }));

      const res = await fetch('/api/games/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ games: gameObjects }),
      });

      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || 'Import failed', 'error');
        setStep('select');
        return;
      }

      setImportResult({ imported: data.imported, skipped: data.skipped });
      setStep('done');
      showToast(`${data.imported} games imported!`, 'success');
    } catch (err) {
      showToast('Import failed. Please try again.', 'error');
      setStep('select');
    }
  };

  return (
    <main className="min-h-screen">
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/games/import" className="nav-link flex items-center gap-1 mb-6 text-sm group">
          <FaArrowLeft className="text-xs transition-transform group-hover:-translate-x-1" />
          <span>Back to Import</span>
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-[#107c10] flex items-center justify-center">
            <FaXbox className="text-2xl text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Import from Xbox</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Bring your Xbox library into GameDB</p>
          </div>
        </div>

        {/* Step 1: Input */}
        {step === 'input' && (
          <div className="card p-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Enter your Gamertag</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Type your Xbox Gamertag exactly as it appears on your profile.
            </p>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <input
                type="text"
                value={gamertag}
                onChange={(e) => setGamertag(e.target.value)}
                placeholder="Your Gamertag"
                className="input flex-1"
                onKeyDown={(e) => e.key === 'Enter' && fetchLibrary()}
              />
              <button onClick={fetchLibrary} className="btn-primary px-6">
                Fetch Library
              </button>
            </div>

            <div className="mt-6 p-4 rounded-lg bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">How to find your Gamertag:</h3>
              <ol className="text-xs text-gray-500 dark:text-gray-400 space-y-1.5 list-decimal list-inside">
                <li>Open the Xbox app or go to xbox.com</li>
                <li>Your Gamertag is shown on your profile (e.g., &ldquo;PlayerOne123&rdquo;)</li>
                <li>Type it exactly as shown, including any numbers</li>
              </ol>
            </div>
          </div>
        )}

        {/* Step 2: Loading */}
        {step === 'loading' && (
          <div className="card p-12 text-center">
            <FaXbox className="text-5xl text-[#107c10] mx-auto mb-4 animate-pulse" />
            <p className="text-gray-600 dark:text-gray-400">Fetching your Xbox library...</p>
            <p className="text-xs text-gray-400 mt-2">This may take a few seconds</p>
          </div>
        )}

        {/* Step 3: Select games */}
        {step === 'select' && (
          <div>
            <div className="card p-4 mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Found <strong className="text-gray-900 dark:text-white">{games.length}</strong> games —{' '}
                <strong className="text-primary-600">{selected.size}</strong> selected
              </p>
              <div className="flex gap-2">
                <button onClick={selectAll} className="btn-secondary text-xs px-3 py-1.5">Select All</button>
                <button onClick={deselectAll} className="btn-secondary text-xs px-3 py-1.5">Deselect All</button>
                <button onClick={importSelected} disabled={selected.size === 0} className="btn-primary text-xs px-4 py-1.5 disabled:opacity-50">
                  Import {selected.size} Games
                </button>
              </div>
            </div>

            <div className="relative mb-4">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
              <input type="text" value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Filter games..." className="input pl-9" />
            </div>

            <div className="card overflow-hidden">
              <div className="max-h-[500px] overflow-y-auto divide-y divide-gray-100 dark:divide-slate-700">
                {filteredGames.map((game) => {
                  const isSelected = selected.has(game.titleId);
                  return (
                    <div
                      key={game.titleId}
                      onClick={() => toggleGame(game.titleId)}
                      className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                        isSelected ? 'bg-primary-50 dark:bg-primary-900/10' : 'hover:bg-gray-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                        isSelected ? 'bg-primary-600 border-primary-600 text-white' : 'border-gray-300 dark:border-slate-600'
                      }`}>
                        {isSelected && <FaCheck className="text-[10px]" />}
                      </div>

                      <div className="w-10 h-10 rounded bg-gray-100 dark:bg-slate-700 flex-shrink-0 overflow-hidden">
                        {game.imageUrl ? (
                          <img src={game.imageUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FaGamepad className="text-gray-400 text-xs" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{game.name}</p>
                      </div>

                      {game.playtimeHours > 0 && (
                        <div className="flex items-center gap-1 text-xs text-gray-400 flex-shrink-0">
                          <FaClock className="text-[10px]" />
                          {game.playtimeHours}h
                        </div>
                      )}
                    </div>
                  );
                })}

                {filteredGames.length === 0 && (
                  <div className="p-8 text-center text-gray-400 text-sm">
                    {filter ? 'No games match your filter' : 'No games found'}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 flex justify-between items-center">
              <button onClick={() => setStep('input')} className="btn-secondary text-sm">Back</button>
              <button onClick={importSelected} disabled={selected.size === 0} className="btn-primary text-sm disabled:opacity-50">
                Import {selected.size} Games
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Importing */}
        {step === 'importing' && (
          <div className="card p-12 text-center">
            <FaSpinner className="text-4xl text-primary-500 mx-auto mb-4 animate-spin" />
            <p className="text-gray-600 dark:text-gray-400">Importing {selected.size} games...</p>
          </div>
        )}

        {/* Step 5: Done */}
        {step === 'done' && (
          <div className="card p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
              <FaCheck className="text-2xl text-emerald-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Import Complete!</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-1">
              <strong className="text-gray-900 dark:text-white">{importResult.imported}</strong> games added to your collection
            </p>
            {importResult.skipped > 0 && (
              <p className="text-sm text-gray-400">{importResult.skipped} skipped (already in collection)</p>
            )}
            <div className="mt-8 flex justify-center gap-4">
              <Link href="/games" className="btn-primary">View My Games</Link>
              <button onClick={() => { setStep('input'); setGames([]); setSelected(new Set()); }} className="btn-secondary">
                Import More
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
