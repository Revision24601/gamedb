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
  gameId?: string;
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

// Room icon names (mapped in iconMapping.ts)
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

// Room background — Animus theme (used for icon containers)
export const getRoomBackground = (type: RoomType): string => {
  switch (type) {
    case 'study': return 'from-cyan-500/20 to-cyan-700/20';
    case 'library': return 'from-blue-500/20 to-blue-700/20';
    case 'garden': return 'from-emerald-500/20 to-emerald-700/20';
    case 'workshop': return 'from-orange-500/20 to-orange-700/20';
    case 'gallery': return 'from-purple-500/20 to-purple-700/20';
    case 'theater': return 'from-indigo-500/20 to-indigo-700/20';
    case 'trophy': return 'from-yellow-500/20 to-yellow-700/20';
    case 'archive': return 'from-slate-500/20 to-slate-700/20';
    case 'locked': return 'from-gray-600/20 to-gray-800/20';
    default: return 'from-gray-500/20 to-gray-700/20';
  }
};

export const getRoomPattern = (_type: RoomType): string => {
  // Patterns removed — Animus theme uses clean geometric styling
  return '';
};

// Game status accent colors — Animus palette
export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'Playing': return '#00d4ff';      // Cyan
    case 'Completed': return '#00ff88';    // Green
    case 'On Hold': return '#a855f7';      // Purple
    case 'Dropped': return '#ff4444';      // Red
    case 'Plan to Play': return '#6366f1'; // Indigo
    default: return '#6b7280';             // Gray
  }
};
