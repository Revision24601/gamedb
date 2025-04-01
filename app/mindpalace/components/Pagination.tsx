import React from 'react';
import { BaseMindPalaceProps } from '../types';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

interface PaginationProps extends BaseMindPalaceProps {
  currentPage: number;
  totalPages: number;
  goToPrevPage: () => void;
  goToNextPage: () => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  goToPrevPage,
  goToNextPage,
  animationConfig,
  renderMode = 'static'
}) => {
  // Get container classes based on render mode
  const getContainerClasses = () => {
    const baseClasses = "flex justify-center items-center mt-12 space-x-4";
    
    switch (renderMode) {
      case 'static':
        return baseClasses;
      case '2d-animated':
        return `${baseClasses} animate-fadeIn`;
      case 'webgl':
        return `${baseClasses} webgl-pagination`;
      default:
        return baseClasses;
    }
  };

  // Get button classes based on whether it's enabled and render mode
  const getButtonClasses = (isEnabled: boolean) => {
    const baseClasses = `p-3 rounded-xl flex items-center justify-center border-2 shadow-md transition-all ${
      isEnabled 
        ? 'text-accent hover:bg-accent/10 border-accent/20 hover:border-accent/40' 
        : 'text-gray-400 cursor-not-allowed border-gray-200 dark:border-gray-700'
    }`;
    
    switch (renderMode) {
      case 'static':
        return baseClasses;
      case '2d-animated':
        return `${baseClasses} hover:animate-pulse`;
      case 'webgl':
        return `${baseClasses} webgl-button`;
      default:
        return baseClasses;
    }
  };

  return (
    <div 
      className={getContainerClasses()}
      data-current-page={currentPage}
      data-total-pages={totalPages}
    >
      <button 
        onClick={goToPrevPage} 
        disabled={currentPage === 1}
        className={getButtonClasses(currentPage !== 1)}
        aria-label="Previous page"
      >
        <FaChevronLeft />
      </button>
      
      <div className="text-sm font-medium px-6 py-2 bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm rounded-lg shadow-md border border-white/10">
        Page {currentPage} of {totalPages}
      </div>
      
      <button 
        onClick={goToNextPage} 
        disabled={currentPage === totalPages}
        className={getButtonClasses(currentPage !== totalPages)}
        aria-label="Next page"
      >
        <FaChevronRight />
      </button>
    </div>
  );
};

export default Pagination; 