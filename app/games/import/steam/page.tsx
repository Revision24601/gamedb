'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { useToast } from '@/components/ToastProvider';
import { FaArrowLeft, FaSteam, FaSearch, FaCheck, FaGamepad, FaClock, FaSpinner } from 'react-icons/fa';

interface SteamGame {
  appId: number;
  name: string;
  playtimeMinutes: number;
  playtimeHours: number;
  iconUrl: string | null;
  headerUrl: string;
}

type Step = 'input' | 'loading' | 'select' | 'importing' | 'done';

export default function SteamImportPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [step, setStep] = useState<Step>('input');
  const [steamInput, setSteamInput] = useState('');
  const [error, setError] = useState('');
  const [games, setGames] = useState<SteamGame[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [filter, setFilter] = useState('');
  const [importResult, setImportResult] = useState({ imported: 0, skipped: 0 });

  // Parse the steam input into either a steamId or vanityUrl
  const parseSteamInput = (input: string): { steamId?: string; vanityUrl?: string } => {
    const trimmed = input.trim();

    // Direct 17-digit steam ID
    if (/^\d{17}$/.test(trimmed)) {
      return { steamId: trimmed };
    }

    // URL formats: steamcommunity.com/profiles/76561198... or steamcommunity.com/id/vanityname
    const profileMatch = trimmed.match(/steamcommunity\.com\/profiles\/(\d{17})/);
    if (profileMatch) return { steamId: profileMatch[1] };

    const vanityMatch = trimmed.match(/steamcommunity\.com\/id\/([^/\s]+)/);
    if (vanityMatch) return { vanityUrl: vanityMatch[1] };

    // Assume it's a vanity URL name if it's a simple string
    if (/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
      return { vanityUrl: trimmed };
    }

    return {};
  };

  const fetchLibrary = async () => {
    setError('');
    const parsed = parseSteamInput(steamInput);

    if (!parsed.steamId && !parsed.vanityUrl) {
      setError('Please enter a valid Steam ID, profile URL, or custom URL name.');
      return;
    }

    setStep('loading');

    try {
      const params = new URLSearchParams();
      if (parsed.steamId) params.set('steamId', parsed.steamId);
      if (parsed.vanityUrl) params.set('vanityUrl', parsed.vanityUrl);

      const res = await fetch(`/api/steam/library?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to fetch Steam library');
        setStep('input');
        return;
      }

      setGames(data.games || []);
      // Pre-select all games with playtime > 0
      const preSelected = new Set<number>(
        (data.games || [])
          .filter((g: SteamGame) => g.playtimeMinutes > 0)
          .map((g: SteamGame) => g.appId)
      );
      setSelected(preSelected);
      setStep('select');
    } catch (err) {
      setError('Failed to connect to Steam. Please try again.');
      setStep('input');
    }
  };

  const filteredGames = useMemo(() => {
    if (!filter) return games;
    const lower = filter.toLowerCase();
    return games.filter((g) => g.name.toLowerCase().includes(lower));
  }, [games, filter]);

  const toggleGame = (appId: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(appId)) next.delete(appId);
      else next.add(appId);
      return next;
    });
  };

  const selectAll = () => {
    setSelected(new Set(filteredGames.map((g) => g.appId)));
  };

  const deselectAll = () => {
    setSelected(new Set());
  };

  const importSelected = async () => {
    const toImport = games.filter((g) => selected.has(g.appId));
    if (toImport.length === 0) {
      showToast('No games selected', 'warning');
      return;
    }

    setStep('importing');

    try {
      const gameObjects = toImport.map((g) => ({
        title: g.name,
        platform: 'PC',
        status: g.playtimeHours > 0 ? 'Playing' : 'Plan to Play',
        rating: 0,
        hoursPlayed: g.playtimeHours,
        imageUrl: g.headerUrl,
        notes: `Imported from Steam (AppID: ${g.appId})`,
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
          <div className="w-12 h-12 rounded-xl bg-[#1b2838] flex items-center justify-center">
            <FaSteam className="text-2xl text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Import from Steam</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Bring your Steam library into GameDB</p>
          </div>
        </div>

        {/* Step 1: Input */}
        {step === 'input' && (
          <div className="card p-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Enter your Steam ID</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              You can enter your 17-digit Steam ID, your custom URL name, or your full profile URL.
              <br />
              <span className="text-xs text-gray-400 mt-1 block">
                Your Steam profile must be set to <strong>Public</strong> for this to work.
              </span>
            </p>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <input
                type="text"
                value={steamInput}
                onChange={(e) => setSteamInput(e.target.value)}
                placeholder="76561198012345678 or steamcommunity.com/id/yourname"
                className="input flex-1"
                onKeyDown={(e) => e.key === 'Enter' && fetchLibrary()}
              />
              <button onClick={fetchLibrary} className="btn-primary px-6">
                Fetch Library
              </button>
            </div>

            <div className="mt-6 p-4 rounded-lg bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">How to find your Steam ID:</h3>
              <ol className="text-xs text-gray-500 dark:text-gray-400 space-y-1.5 list-decimal list-inside">
                <li>Open Steam and go to your profile</li>
                <li>Look at the URL — it will be <code className="bg-gray-200 dark:bg-slate-700 px-1 rounded">steamcommunity.com/profiles/76561198...</code> or <code className="bg-gray-200 dark:bg-slate-700 px-1 rounded">steamcommunity.com/id/yourname</code></li>
                <li>Paste the full URL or just the ID/name above</li>
                <li>Make sure your Game Details are set to <strong>Public</strong> in Steam &gt; Profile &gt; Privacy Settings</li>
              </ol>
            </div>
          </div>
        )}

        {/* Step 2: Loading */}
        {step === 'loading' && (
          <div className="card p-12 text-center">
            <FaSteam className="text-5xl text-gray-400 mx-auto mb-4 animate-pulse" />
            <p className="text-gray-600 dark:text-gray-400">Fetching your Steam library...</p>
            <p className="text-xs text-gray-400 mt-2">This may take a few seconds for large libraries</p>
          </div>
        )}

        {/* Step 3: Select games */}
        {step === 'select' && (
          <div>
            {/* Summary bar */}
            <div className="card p-4 mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Found <strong className="text-gray-900 dark:text-white">{games.length}</strong> games —{' '}
                  <strong className="text-primary-600">{selected.size}</strong> selected
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={selectAll} className="btn-secondary text-xs px-3 py-1.5">Select All</button>
                <button onClick={deselectAll} className="btn-secondary text-xs px-3 py-1.5">Deselect All</button>
                <button
                  onClick={importSelected}
                  disabled={selected.size === 0}
                  className="btn-primary text-xs px-4 py-1.5 disabled:opacity-50"
                >
                  Import {selected.size} Games
                </button>
              </div>
            </div>

            {/* Search filter */}
            <div className="relative mb-4">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="text"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Filter games..."
                className="input pl-9"
              />
            </div>

            {/* Game list */}
            <div className="card overflow-hidden">
              <div className="max-h-[500px] overflow-y-auto divide-y divide-gray-100 dark:divide-slate-700">
                {filteredGames.map((game) => {
                  const isSelected = selected.has(game.appId);
                  return (
                    <div
                      key={game.appId}
                      onClick={() => toggleGame(game.appId)}
                      className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-primary-50 dark:bg-primary-900/10'
                          : 'hover:bg-gray-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {/* Checkbox */}
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-primary-600 border-primary-600 text-white'
                          : 'border-gray-300 dark:border-slate-600'
                      }`}>
                        {isSelected && <FaCheck className="text-[10px]" />}
                      </div>

                      {/* Icon */}
                      <div className="w-10 h-10 rounded bg-gray-100 dark:bg-slate-700 flex-shrink-0 overflow-hidden">
                        {game.iconUrl ? (
                          <img src={game.iconUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FaGamepad className="text-gray-400 text-xs" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{game.name}</p>
                      </div>

                      {/* Playtime */}
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

            {/* Bottom import bar */}
            <div className="mt-4 flex justify-between items-center">
              <button onClick={() => setStep('input')} className="btn-secondary text-sm">
                Back
              </button>
              <button
                onClick={importSelected}
                disabled={selected.size === 0}
                className="btn-primary text-sm disabled:opacity-50"
              >
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
            <p className="text-xs text-gray-400 mt-2">This may take a moment</p>
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
              <p className="text-sm text-gray-400">
                {importResult.skipped} games skipped (already in your collection)
              </p>
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
