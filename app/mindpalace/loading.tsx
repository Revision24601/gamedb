import Header from '@/components/Header';

export default function MindPalaceLoading() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-900">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Title skeleton */}
          <div className="flex flex-col items-center mb-6">
            <div className="h-8 w-48 bg-gray-700 rounded mb-2 animate-pulse" />
            <div className="h-4 w-64 bg-gray-800 rounded animate-pulse" />
          </div>

          {/* Viewport skeleton */}
          <div className="w-full h-[85vh] bg-gray-800/50 rounded-xl border border-gray-700/30 flex flex-col items-center justify-center animate-pulse">
            <div className="w-10 h-10 border-2 border-gray-600 border-t-gray-400 rounded-full animate-spin mb-4" />
            <div className="h-3 w-32 bg-gray-700 rounded" />
          </div>
        </div>
      </main>
    </>
  );
}
