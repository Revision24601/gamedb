'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface MusicTrack {
  embedUrl: string;
  name: string;
  artist?: string;
  imageUrl?: string;
}

// Preset ambient themes — curated Spotify playlists
export const AMBIENT_THEMES: { id: string; name: string; emoji: string; track: MusicTrack }[] = [
  {
    id: 'silent-hill',
    name: 'Silent Hill',
    emoji: '🌫️',
    track: {
      embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX6XceWZP1znY?utm_source=generator&theme=0',
      name: 'Dark Ambient',
      artist: 'Spotify',
    },
  },
  {
    id: 'chill-rpg',
    name: 'Chill RPG',
    emoji: '🏰',
    track: {
      embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DWWQRwui0ExPn?utm_source=generator&theme=0',
      name: 'Peaceful RPG',
      artist: 'Spotify',
    },
  },
  {
    id: 'boss-battle',
    name: 'Boss Battle',
    emoji: '⚔️',
    track: {
      embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX0pH2SQMRXnC?utm_source=generator&theme=0',
      name: 'Epic Gaming',
      artist: 'Spotify',
    },
  },
  {
    id: 'lofi-gaming',
    name: 'Lo-Fi Gaming',
    emoji: '🎧',
    track: {
      embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX8Uebhn9wzrS?utm_source=generator&theme=0',
      name: 'Chill Beats',
      artist: 'Spotify',
    },
  },
  {
    id: 'retro',
    name: 'Retro',
    emoji: '👾',
    track: {
      embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DXdVbMzaMNNYp?utm_source=generator&theme=0',
      name: 'Retro Gaming',
      artist: 'Spotify',
    },
  },
];

interface MusicContextValue {
  currentTrack: MusicTrack | null;
  isPlayerVisible: boolean;
  playTrack: (track: MusicTrack) => void;
  stopMusic: () => void;
}

const MusicContext = createContext<MusicContextValue | undefined>(undefined);

export function useMusic() {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
}

export function MusicProvider({ children }: { children: ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<MusicTrack | null>(null);
  const [isPlayerVisible, setIsPlayerVisible] = useState(false);

  const playTrack = useCallback((track: MusicTrack) => {
    setCurrentTrack(track);
    setIsPlayerVisible(true);
  }, []);

  const stopMusic = useCallback(() => {
    setCurrentTrack(null);
    setIsPlayerVisible(false);
  }, []);

  return (
    <MusicContext.Provider value={{ currentTrack, isPlayerVisible, playTrack, stopMusic }}>
      {children}
    </MusicContext.Provider>
  );
}
