import { 
  FaGraduationCap, 
  FaBook, 
  FaLeaf, 
  FaTools, 
  FaImage, 
  FaFilm, 
  FaTrophy, 
  FaArchive, 
  FaQuestion 
} from 'react-icons/fa';
import { RoomType } from '../types';

// Map room types to their corresponding React icon components
export const iconComponents: Record<RoomType | 'default', React.ComponentType<any>> = {
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