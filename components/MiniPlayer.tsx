'use client';

import { useState } from 'react';
import { useMusic, AMBIENT_THEMES } from './MusicProvider';
import { FaTimes, FaMusic, FaChevronUp, FaChevronDown } from 'react-icons/fa';

export default function MiniPlayer() {
  const { currentTrack, isPlayerVisible, playTrack, stopMusic } = useMusic();
  const [showThemes, setShowThemes] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  if (!isPlayerVisible || !currentTrack) {
    // Show a small floating theme button when no music is playing
    return (
      <div className="fixed bottom-4 left-4 z-50">
        <button
          onClick={() => setShowThemes(!showThemes)}
          className="w-10 h-10 rounded-full bg-primary-600 hover:bg-primary-700 text-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
          title="Ambient Music"
        >
          <FaMusic className="text-sm" />
        </button>

        {/* Theme picker popup */}
        {showThemes && (
          <div className="absolute bottom-14 left-0 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-100 dark:border-slate-700 p-3 w-56 animate-fadeIn">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-1">
              Ambient Themes
            </p>
            <div className="space-y-1">
              {AMBIENT_THEMES.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => {
                    playTrack(theme.track);
                    setShowThemes(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-left"
                >
                  <span className="text-lg">{theme.emoji}</span>
                  <span className="text-sm text-gray-800 dark:text-gray-200">{theme.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* Collapsed bar */}
      {collapsed ? (
        <div className="bg-slate-900/95 backdrop-blur-md border-t border-slate-700/50 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FaMusic className="text-primary-400 text-sm" />
            <div>
              <p className="text-sm text-white font-medium truncate max-w-[200px]">{currentTrack.name}</p>
              {currentTrack.artist && (
                <p className="text-[10px] text-gray-400">{currentTrack.artist}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCollapsed(false)}
              className="p-1.5 text-gray-400 hover:text-white transition-colors"
              title="Expand player"
            >
              <FaChevronUp className="text-xs" />
            </button>
            <button
              onClick={stopMusic}
              className="p-1.5 text-gray-400 hover:text-red-400 transition-colors"
              title="Stop music"
            >
              <FaTimes className="text-xs" />
            </button>
          </div>
        </div>
      ) : (
        /* Full player bar */
        <div className="bg-slate-900/95 backdrop-blur-md border-t border-slate-700/50">
          {/* Controls row */}
          <div className="px-4 pt-2 pb-1 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FaMusic className="text-primary-400 text-sm" />
              <div>
                <p className="text-sm text-white font-medium truncate max-w-[250px]">{currentTrack.name}</p>
                {currentTrack.artist && (
                  <p className="text-[10px] text-gray-400">{currentTrack.artist}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1">
              {/* Theme switcher */}
              <div className="relative">
                <button
                  onClick={() => setShowThemes(!showThemes)}
                  className="px-2.5 py-1 text-[10px] text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 rounded-md transition-colors"
                >
                  Themes
                </button>
                {showThemes && (
                  <div className="absolute bottom-8 right-0 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-100 dark:border-slate-700 p-3 w-52 animate-fadeIn">
                    <div className="space-y-1">
                      {AMBIENT_THEMES.map((theme) => (
                        <button
                          key={theme.id}
                          onClick={() => {
                            playTrack(theme.track);
                            setShowThemes(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-left"
                        >
                          <span className="text-base">{theme.emoji}</span>
                          <span className="text-xs text-gray-800 dark:text-gray-200">{theme.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={() => setCollapsed(true)}
                className="p-1.5 text-gray-400 hover:text-white transition-colors"
                title="Minimize"
              >
                <FaChevronDown className="text-xs" />
              </button>
              <button
                onClick={stopMusic}
                className="p-1.5 text-gray-400 hover:text-red-400 transition-colors"
                title="Stop music"
              >
                <FaTimes className="text-sm" />
              </button>
            </div>
          </div>

          {/* Spotify embed — compact */}
          <div className="px-4 pb-2">
            <iframe
              key={currentTrack.embedUrl}
              src={currentTrack.embedUrl}
              width="100%"
              height="80"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="eager"
              style={{ borderRadius: '8px' }}
              title="Now Playing"
            />
          </div>
        </div>
      )}
    </div>
  );
}
