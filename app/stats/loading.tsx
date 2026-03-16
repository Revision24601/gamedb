import Header from '@/components/Header';

export default function StatsLoading() {
  return (
    <main className="min-h-screen">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back + title skeleton */}
        <div className="mb-8">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-28 mb-3 animate-pulse" />
          <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded w-56 mb-2 animate-pulse" />
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-80 animate-pulse" />
        </div>

        {/* Overview cards skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white/80 dark:bg-gray-800/80 rounded-xl p-6 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                <div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-2" />
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-14" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Insights skeleton */}
        <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl p-6 mb-8 animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex gap-4">
                <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-xl flex-shrink-0" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-1" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
