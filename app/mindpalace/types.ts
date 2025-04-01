import { IGame } from '@/models/Game';

// Room type definition
export type RoomType = 'study' | 'library' | 'garden' | 'workshop' | 'gallery' | 'theater' | 'trophy' | 'archive' | 'locked';

// Room interface
export interface Room {
  id: number;
  name: string;
  type: RoomType;
  description: string;
  isLocked: boolean;
  gameId?: string; // ID of the associated game
}

// Shared props interface for animation configuration
export interface AnimationConfig {
  enabled: boolean;
  duration?: number;
  easing?: string;
  delay?: number;
}

// Render mode for future extensibility
export type RenderMode = 'static' | '2d-animated' | 'webgl';

// Base props that all MindPalace components should accept
export interface BaseMindPalaceProps {
  animationConfig?: AnimationConfig;
  renderMode?: RenderMode;
}

// Room styling utilities
export const getRoomIcon = (type: RoomType): string => {
  switch (type) {
    case 'study': return 'FaGraduationCap';
    case 'library': return 'FaBook';
    case 'garden': return 'FaLeaf';
    case 'workshop': return 'FaTools';
    case 'gallery': return 'FaImage';
    case 'theater': return 'FaFilm';
    case 'trophy': return 'FaTrophy';
    case 'archive': return 'FaArchive';
    case 'locked': return 'FaQuestion';
    default: return 'FaQuestion';
  }
};

export const getRoomBackground = (type: RoomType): string => {
  switch (type) {
    case 'study': return 'from-blue-400 to-blue-600';
    case 'library': return 'from-amber-400 to-amber-600';
    case 'garden': return 'from-green-400 to-green-600';
    case 'workshop': return 'from-red-400 to-red-600';
    case 'gallery': return 'from-purple-400 to-purple-600';
    case 'theater': return 'from-indigo-400 to-indigo-600';
    case 'trophy': return 'from-yellow-400 to-yellow-600';
    case 'archive': return 'from-gray-400 to-gray-600';
    case 'locked': return 'from-gray-300 to-gray-500';
    default: return 'from-accent to-accent/70';
  }
};

export const getRoomPattern = (type: RoomType): string => {
  switch (type) {
    case 'study': return 'bg-[radial-gradient(circle_at_1rem_1rem,rgba(255,255,255,0.1)_0.5rem,transparent_0.5rem)]';
    case 'library': return 'bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,255,255,0.05)_10px,rgba(255,255,255,0.05)_15px)]';
    case 'garden': return 'bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0.5rem,transparent_2rem)]';
    case 'workshop': return 'bg-[repeating-linear-gradient(-45deg,transparent,transparent_10px,rgba(255,255,255,0.05)_10px,rgba(255,255,255,0.05)_20px)]';
    case 'gallery': return 'bg-[linear-gradient(transparent_0%,rgba(255,255,255,0.05)_100%)]';
    case 'theater': return 'bg-[repeating-linear-gradient(90deg,transparent,transparent_20px,rgba(255,255,255,0.05)_20px,rgba(255,255,255,0.05)_40px)]';
    case 'trophy': return 'bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1)_1rem,transparent_2rem)]';
    case 'archive': return 'bg-[repeating-linear-gradient(0deg,transparent,transparent_10px,rgba(255,255,255,0.05)_10px,rgba(255,255,255,0.05)_20px)]';
    case 'locked': return '';
    default: return '';
  }
};

// Game status badge color
export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'Playing': return 'bg-blue-500';
    case 'Completed': return 'bg-green-500';
    case 'On Hold': return 'bg-yellow-500';
    case 'Dropped': return 'bg-red-500';
    case 'Plan to Play': return 'bg-purple-500';
    default: return 'bg-gray-500';
  }
}; 