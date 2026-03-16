import Header from '@/components/Header';

export default function HomeLoading() {
  return (
    <main>
      <Header />
      {/* Hero skeleton */}
      <div className="bg-gradient-to-b from-primary-600 to-primary-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="h-12 bg-white/10 rounded-lg w-80 mx-auto mb-6 animate-pulse" />
          <div className="h-6 bg-white/10 rounded w-96 mx-auto mb-10 animate-pulse" />
          <div className="flex justify-center gap-4">
            <div className="h-10 w-36 bg-white/10 rounded-lg animate-pulse" />
            <div className="h-10 w-36 bg-white/10 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
      {/* Game list skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-6 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden animate-pulse">
              <div className="h-48 bg-gray-200 dark:bg-gray-700" />
              <div className="p-5">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3" />
                <div className="flex justify-between">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20" />
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-20" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
