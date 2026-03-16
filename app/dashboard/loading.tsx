import Header from '@/components/Header';

export default function DashboardLoading() {
  return (
    <main>
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back + title skeleton */}
        <div className="mb-12">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-28 mb-4 animate-pulse" />
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-2 animate-pulse" />
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-96 animate-pulse" />
        </div>

        {/* Stats cards skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                <div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-2" />
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-12" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Chart skeleton */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-8 animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4" />
          <div className="h-[400px] bg-gray-200 dark:bg-gray-700 rounded" />
        </div>

        {/* Game lists skeleton */}
        {[1, 2].map((section) => (
          <div key={section} className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-8 animate-pulse">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-40 mb-4" />
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-center gap-4 p-4 mb-2">
                <div className="h-16 w-16 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-40 mb-2" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24" />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </main>
  );
}
