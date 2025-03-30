import { useState, useEffect } from 'react';
import { FaStar, FaRegStar, FaStarHalfAlt } from 'react-icons/fa';

interface StarRatingProps {
  rating: number;
  onChange?: (rating: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const StarRating = ({ 
  rating, 
  onChange, 
  readonly = false,
  size = 'md'
}: StarRatingProps) => {
  const [hoverRating, setHoverRating] = useState(0);
  const [currentRating, setCurrentRating] = useState(rating);

  useEffect(() => {
    setCurrentRating(rating);
  }, [rating]);

  const handleMouseEnter = (index: number) => {
    if (readonly) return;
    setHoverRating(index);
  };

  const handleMouseLeave = () => {
    if (readonly) return;
    setHoverRating(0);
  };

  const handleClick = (index: number) => {
    if (readonly) return;
    
    // Toggle between full star and no star if clicking on the same star
    const newRating = currentRating === index ? index - 0.5 : index;
    setCurrentRating(newRating);
    
    if (onChange) {
      onChange(newRating);
    }
  };

  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
  };

  const renderStar = (index: number) => {
    const displayRating = hoverRating || currentRating;
    const starClass = `${sizeClasses[size]} ${readonly ? '' : 'cursor-pointer'} transition-colors`;
    
    // Full star
    if (displayRating >= index) {
      return <FaStar className={`${starClass} text-yellow-400`} />;
    }
    
    // Half star
    if (displayRating >= index - 0.5) {
      return <FaStarHalfAlt className={`${starClass} text-yellow-400`} />;
    }
    
    // Empty star
    return <FaRegStar className={`${starClass} text-gray-300 dark:text-gray-600`} />;
  };

  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((index) => (
        <span
          key={index}
          onMouseEnter={() => handleMouseEnter(index)}
          onMouseLeave={handleMouseLeave}
          onClick={() => handleClick(index)}
        >
          {renderStar(index)}
        </span>
      ))}
      
      {!readonly && (
        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
          {hoverRating || currentRating || 0}/10
        </span>
      )}
    </div>
  );
};

export default StarRating; 