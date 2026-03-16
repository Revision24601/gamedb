import React from 'react';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';

const MindPalaceHeader: React.FC = () => {
  return (
    <div className="mb-6">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-gray-500 hover:text-cyan-400 text-xs font-mono tracking-wider uppercase transition-colors mb-4"
      >
        <FaArrowLeft className="text-[10px]" />
        <span>Return to Base</span>
      </Link>

      <div className="flex flex-col items-center text-center">
        <h1 className="animus-title text-2xl md:text-3xl font-light">
          Mind Palace
        </h1>
        <p className="animus-subtitle mt-2">
          Navigate your gaming memories
        </p>
        <div className="animus-divider w-32 mt-4" />
      </div>
    </div>
  );
};

export default MindPalaceHeader;
