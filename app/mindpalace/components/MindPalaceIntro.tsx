import React from 'react';

// Intro is now minimal — just a one-liner tagline rendered inside the header.
// Kept as a component for future expansion (e.g., first-time tutorial overlay).

interface MindPalaceIntroProps {
  showInfoTip?: boolean;
  toggleInfoTip?: (e: React.MouseEvent) => void;
}

const MindPalaceIntro: React.FC<MindPalaceIntroProps> = () => {
  return null; // Rendered content is now in MindPalaceHeader
};

export default MindPalaceIntro;
