import React from 'react';

// Keyboard helper is no longer rendered in the page — hints are shown
// inline in the viewport when active. Kept as a no-op for compatibility.

interface KeyboardHelperProps {
  showInitially?: boolean;
}

const KeyboardHelper: React.FC<KeyboardHelperProps> = () => {
  return null;
};

export default KeyboardHelper;
