import Header from '@/components/Header';

export default function GamesLoading() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title skeleton */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2 animate-pulse" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64 animate-pulse" />
          </div>
          <div className="h-10 w-36 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        </div>

        {/* Filter bar skeleton */}
        <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl p-4 mb-8 animate-pulse">
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-9 w-24 bg-gray-200 dark:bg-gray-700 rounded-full" />
            ))}
          </div>
        </div>

        {/* Game grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="bg-white/90 dark:bg-gray-800/90 rounded-xl shadow-sm overflow-hidden animate-pulse">
              <div className="h-48 bg-gray-200 dark:bg-gray-700" />
              <div className="p-5">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-3" />
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <div key={s} className="h-3 w-3 bg-gray-200 dark:bg-gray-700 rounded-full" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
