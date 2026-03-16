import Header from '@/components/Header';

export default function GameDetailLoading() {
  return (
    <main className="min-h-screen">
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back link skeleton */}
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-8 animate-pulse" />

        {/* Title skeleton */}
        <div className="mb-8">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-72 mb-3 animate-pulse" />
          <div className="flex gap-4">
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-28 animate-pulse" />
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse" />
          </div>
        </div>

        {/* Status badge skeleton */}
        <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded-full mb-8 animate-pulse" />

        {/* Content grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-8">
            {/* Rating skeleton */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 animate-pulse">
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-4" />
              <div className="flex gap-1">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded" />
                ))}
              </div>
            </div>
            {/* Notes skeleton */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 animate-pulse">
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-4" />
              <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </div>
          <div className="space-y-8">
            {/* Image skeleton */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 animate-pulse">
              <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            </div>
            {/* Actions skeleton */}
            <div className="flex gap-4">
              <div className="h-10 flex-1 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
              <div className="h-10 flex-1 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
