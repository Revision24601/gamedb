import React from 'react';

interface MindPalaceHeaderProps {
  title?: string;
  subtitle?: string;
}

const MindPalaceHeader: React.FC<MindPalaceHeaderProps> = ({ 
  title = "Mind Palace",
  subtitle = "Organize your gaming memories spatially"
}) => {
  return (
    <div className="mb-6">
      <h1 className="journal-title text-center">
        {title}
      </h1>
      {subtitle && (
        <p className="text-center text-gray-600 dark:text-gray-400 mt-2 italic">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default MindPalaceHeader; 