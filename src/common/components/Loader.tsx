'use client';

import React from 'react';

interface LoaderProps {
  text?: string;
}

const Loader: React.FC<LoaderProps> = ({ text = 'Loading...' }) => {
  return (
    <div className="min-h-screen pt-[8vh] md:pt-[12vh] text-white flex items-center justify-center px-4">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-b-2 border-yellow-400 mx-auto mb-3 md:mb-4" />
        <p className="text-gray-300 text-sm md:text-base">{text}</p>
      </div>
    </div>
  );
};

export default Loader;