'use client';

import React from 'react';

interface LoadingStatusProps {
  totalPages: number;
  loadedPages: Set<number>;
  failedPages: Set<number>;
  currentPage: number;
  className?: string;
}

const LoadingStatus: React.FC<LoadingStatusProps> = ({
  totalPages,
  loadedPages,
  failedPages,
  currentPage,
  className = ''
}) => {
  const loadingPages = totalPages - loadedPages.size - failedPages.size;
  const progress = totalPages > 0 ? (loadedPages.size / totalPages) * 100 : 0;

  if (totalPages === 0 || progress >= 100) return null;

  return (
    <div className={`fixed bottom-4 right-4 bg-black bg-opacity-80 text-white p-3 rounded-lg text-sm z-50 ${className}`}>
      <div className="flex items-center space-x-2 mb-2">
        <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
        <span>Loading Status</span>
      </div>
      
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span>Progress: {Math.round(progress)}%</span>
          <span>{loadedPages.size}/{totalPages}</span>
        </div>
        
        <div className="w-32 bg-gray-700 rounded-full h-1">
          <div 
            className="bg-yellow-400 h-1 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        {loadingPages > 0 && (
          <div className="text-xs text-yellow-400">
            {loadingPages} page{loadingPages !== 1 ? 's' : ''} loading...
          </div>
        )}
        
        {failedPages.size > 0 && (
          <div className="text-xs text-red-400">
            {failedPages.size} page{failedPages.size !== 1 ? 's' : ''} failed
          </div>
        )}
        
        <div className="text-xs text-gray-400">
          Current: Page {currentPage + 1}
        </div>
      </div>
    </div>
  );
};

export default LoadingStatus;
