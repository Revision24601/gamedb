import React, { useState } from 'react';
import { FaKeyboard, FaArrowUp, FaArrowDown, FaArrowLeft, FaArrowRight, FaEnter } from 'react-icons/fa';

interface KeyboardHelperProps {
  showInitially?: boolean;
}

const KeyboardHelper: React.FC<KeyboardHelperProps> = ({ showInitially = false }) => {
  const [isVisible, setIsVisible] = useState(showInitially);

  return (
    <div className="relative">
      {/* Toggle button */}
      <button 
        onClick={() => setIsVisible(!isVisible)}
        className="absolute top-0 right-0 p-2 text-gray-500 hover:text-accent hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
        aria-label={isVisible ? "Hide keyboard shortcuts" : "Show keyboard shortcuts"}
      >
        <FaKeyboard className="text-lg" />
      </button>
      
      {/* Keyboard shortcut panel */}
      {isVisible && (
        <div className="mt-10 p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg animate-fadeIn">
          <h3 className="text-sm font-medium mb-2 text-gray-800 dark:text-white">Keyboard Navigation</h3>
          
          <div className="space-y-2">
            <div className="flex items-center text-xs text-gray-600 dark:text-gray-300">
              <span className="flex items-center justify-center w-8 h-6 bg-gray-200 dark:bg-gray-700 rounded mr-2">
                <span className="flex space-x-1">
                  <FaArrowLeft className="text-xs" />
                  <FaArrowRight className="text-xs" />
                </span>
              </span>
              <span>Navigate between rooms</span>
            </div>
            
            <div className="flex items-center text-xs text-gray-600 dark:text-gray-300">
              <span className="flex items-center justify-center w-8 h-6 bg-gray-200 dark:bg-gray-700 rounded mr-2">
                <span className="flex space-x-1">
                  <FaArrowUp className="text-xs" />
                  <FaArrowDown className="text-xs" />
                </span>
              </span>
              <span>Navigate between rows</span>
            </div>
            
            <div className="flex items-center text-xs text-gray-600 dark:text-gray-300">
              <span className="flex items-center justify-center w-14 h-6 bg-gray-200 dark:bg-gray-700 rounded mr-2">
                <FaEnter className="text-xs mr-1" />
                <span>Enter</span>
              </span>
              <span>Select room</span>
            </div>
            
            <div className="flex items-center text-xs text-gray-600 dark:text-gray-300">
              <span className="flex items-center justify-center w-14 h-6 bg-gray-200 dark:bg-gray-700 rounded mr-2">
                <span>Space</span>
              </span>
              <span>Select room</span>
            </div>
            
            <div className="flex items-center text-xs text-gray-600 dark:text-gray-300">
              <span className="flex items-center justify-center w-8 h-6 bg-gray-200 dark:bg-gray-700 rounded mr-2">
                <span>Esc</span>
              </span>
              <span>Close detail modal</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KeyboardHelper; 