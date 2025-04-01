import React from 'react';
import { BaseMindPalaceProps } from '../types';
import { FaInfoCircle } from 'react-icons/fa';

interface MindPalaceIntroProps extends BaseMindPalaceProps {
  showInfoTip: boolean;
  toggleInfoTip: (e: React.MouseEvent) => void;
  introText?: string;
  instructionText?: string;
}

const MindPalaceIntro: React.FC<MindPalaceIntroProps> = ({
  showInfoTip,
  toggleInfoTip,
  introText = "Welcome to your gaming Mind Palace, a spatial memory system for organizing your thoughts about games you've played.",
  instructionText = "Each room displays a game from your collection. Click on a room to enter it and explore the game within.",
  animationConfig,
  renderMode = 'static'
}) => {
  // CSS classes based on render mode
  const getContainerClasses = () => {
    const baseClasses = "journal-card mt-8 mb-8 relative";
    
    switch (renderMode) {
      case 'static':
        return baseClasses;
      case '2d-animated':
        return `${baseClasses} animate-fadeIn`;
      case 'webgl':
        return `${baseClasses} webgl-card`;
      default:
        return baseClasses;
    }
  };

  return (
    <div className={getContainerClasses()}>
      <div className="absolute top-4 right-4 cursor-pointer" onClick={toggleInfoTip}>
        <FaInfoCircle className="text-accent hover:text-accent/80" />
        {showInfoTip && (
          <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg z-10 text-sm">
            <p className="mb-2">The Mind Palace is based on the ancient mnemonic technique used to organize and recall information.</p>
            <p>In future versions, you'll be able to organize specific game memories in a spatial way, creating a 3D explorable environment.</p>
          </div>
        )}
      </div>
      <p className="journal-text mb-4">
        {introText}
      </p>
      <p className="journal-text">
        {instructionText}
      </p>
    </div>
  );
};

export default MindPalaceIntro; 