import React from 'react';
import { BaseMindPalaceProps } from '../types';

interface MindPalaceHeaderProps extends BaseMindPalaceProps {
  title?: string;
}

const MindPalaceHeader: React.FC<MindPalaceHeaderProps> = ({ 
  title = "Mind Palace (Prototype)",
  animationConfig,
  renderMode = 'static'
}) => {
  // CSS classes based on render mode
  const getHeaderClasses = () => {
    switch (renderMode) {
      case 'static':
        return 'journal-title text-center';
      case '2d-animated':
        return 'journal-title text-center animate-fadeIn';
      case 'webgl':
        return 'journal-title text-center webgl-text';
      default:
        return 'journal-title text-center';
    }
  };

  return (
    <h1 className={getHeaderClasses()}>
      {title}
    </h1>
  );
};

export default MindPalaceHeader; 