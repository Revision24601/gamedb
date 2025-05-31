import React from 'react';

interface MindPalaceHeaderProps {
  title?: string;
  subtitle?: string;
}

const MindPalaceHeader: React.FC<MindPalaceHeaderProps> = ({ 
  title = "Cartographer's Atlas",
  subtitle = "A map of your gaming journey"
}) => {
  return (
    <div className="mb-6">
      <div className="relative flex flex-col items-center">
        {/* Map scroll decoration */}
        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-20 h-10 
          border-b-2 border-amber-800/20 dark:border-amber-200/20 rounded-b-3xl"></div>
        
        <h1 className="journal-title text-center text-amber-900 dark:text-amber-100 
          px-8 py-2 border-b-2 border-amber-800/20 dark:border-amber-200/20">
          {title}
        </h1>
        
        {subtitle && (
          <p className="text-center text-amber-700 dark:text-amber-300 mt-3 italic font-light">
            {subtitle}
          </p>
        )}
        
        {/* Decorative line */}
        <div className="mt-4 h-[1px] w-32 bg-gradient-to-r from-transparent via-amber-700/30 dark:via-amber-300/30 to-transparent"></div>
      </div>
    </div>
  );
};

export default MindPalaceHeader; 