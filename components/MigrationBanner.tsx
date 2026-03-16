'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { FaExclamationCircle, FaCheck, FaSpinner } from 'react-icons/fa';

export default function MigrationBanner() {
  const { data: session } = useSession();
  const [unclaimedCount, setUnclaimedCount] = useState<number | null>(null);
  const [migrating, setMigrating] = useState(false);
  const [migrated, setMigrated] = useState(false);
  const [error, setError] = useState('');

  // Check for unclaimed games on mount
  useEffect(() => {
    if (!session?.user?.id) return;

    const checkUnclaimed = async () => {
      try {
        const res = await fetch('/api/auth/migrate-games/check');
        if (res.ok) {
          const data = await res.json();
          setUnclaimedCount(data.count);
        }
      } catch {
        // Silently fail — banner just won't show
      }
    };

    checkUnclaimed();
  }, [session]);

  const handleMigrate = async () => {
    setMigrating(true);
    setError('');
    try {
      const res = await fetch('/api/auth/migrate-games', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setMigrated(true);
        setUnclaimedCount(0);
        // Reload after a brief moment so game lists refresh
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setError(data.error || 'Migration failed');
      }
    } catch {
      setError('Something went wrong');
    } finally {
      setMigrating(false);
    }
  };

  // Don't render if not logged in, no unclaimed games, or already migrated
  if (!session || unclaimedCount === null || unclaimedCount === 0) return null;

  if (migrated) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        <div className="flex items-center gap-3 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400">
          <FaCheck />
          <span>All games have been added to your collection! Refreshing...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
        <div className="flex items-center gap-3 text-amber-700 dark:text-amber-400">
          <FaExclamationCircle className="flex-shrink-0" />
          <span>
            <strong>{unclaimedCount} unclaimed {unclaimedCount === 1 ? 'game' : 'games'}</strong> found from before accounts were set up. Add them to your collection?
          </span>
        </div>
        <div className="flex items-center gap-2">
          {error && <span className="text-red-500 text-sm">{error}</span>}
          <button
            onClick={handleMigrate}
            disabled={migrating}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
          >
            {migrating ? (
              <>
                <FaSpinner className="animate-spin" /> Claiming...
              </>
            ) : (
              `Claim ${unclaimedCount} ${unclaimedCount === 1 ? 'Game' : 'Games'}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
