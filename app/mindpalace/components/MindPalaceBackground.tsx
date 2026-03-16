import React from 'react';

// The page background is now handled via CSS class `animus-page-bg` on the page itself.
// This component is kept as a no-op for backward compatibility.

interface MindPalaceBackgroundProps {
  style?: string;
  theme?: string;
  intensity?: string;
}

const MindPalaceBackground: React.FC<MindPalaceBackgroundProps> = () => {
  return null;
};

export default MindPalaceBackground;
