import React from 'react';
import { FaInfoCircle } from 'react-icons/fa';

interface MindPalaceIntroProps {
  showInfoTip: boolean;
  toggleInfoTip: (e: React.MouseEvent) => void;
  introText?: string;
  instructionText?: string;
}

const MindPalaceIntro: React.FC<MindPalaceIntroProps> = ({
  showInfoTip,
  toggleInfoTip,
  introText = "Welcome to your gaming Mind Palace, a spatial memory system for organizing your thoughts about games you've played.",
  instructionText = "Each room displays a game from your collection. Hover over a room to see more details, and click to view the full game page."
}) => {
  return (
    <div className="journal-card mt-8 mb-8 relative">
      <div className="absolute top-4 right-4 cursor-pointer" onClick={toggleInfoTip}>
        <FaInfoCircle className="text-accent hover:text-accent/80" />
        {showInfoTip && (
          <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg z-10 text-sm animate-fadeIn">
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