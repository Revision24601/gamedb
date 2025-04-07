import { 
  FaGraduationCap, 
  FaBook, 
  FaLeaf, 
  FaTools, 
  FaImage, 
  FaFilm, 
  FaTrophy, 
  FaArchive, 
  FaQuestion,
  FaGem,
  FaCog,
  FaGamepad
} from 'react-icons/fa';
import { RoomType } from '../types';

// Map room types to their corresponding React icon components
export const iconComponents: Record<RoomType | string, React.ComponentType<any>> = {
  'study': FaGraduationCap,
  'library': FaBook,
  'garden': FaLeaf,
  'workshop': FaTools,
  'gallery': FaImage,
  'theater': FaFilm,
  'trophy': FaTrophy,
  'archive': FaArchive,
  'locked': FaQuestion,
  'default': FaQuestion
};

// Helper function to safely get an icon component with fallback
export const getIconComponent = (type: RoomType): React.ComponentType<any> => {
  try {
    const icon = iconComponents[type];
    if (icon) return icon;
    return iconComponents.default || FaQuestion;
  } catch (error) {
    console.error(`Error getting icon for room type: ${type}`, error);
    return FaQuestion;
  }
};

// Add missing room types dynamically to prevent future errors
export const ensureAllRoomTypesHaveIcons = () => {
  const allRoomTypes: RoomType[] = [
    'study', 'library', 'garden', 'workshop', 
    'gallery', 'theater', 'trophy', 'archive', 
    'locked'
  ];
  
  // Add any missing icons
  allRoomTypes.forEach(type => {
    if (!iconComponents[type]) {
      console.warn(`Missing icon for room type: ${type}. Using default.`);
      iconComponents[type] = FaQuestion;
    }
  });
}; 