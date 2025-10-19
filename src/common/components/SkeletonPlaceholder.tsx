'use client';

import React from 'react';

interface SkeletonPlaceholderProps {
  className?: string;
  variant?: 'magazine-page' | 'text' | 'image' | 'button';
  lines?: number;
}

const SkeletonPlaceholder: React.FC<SkeletonPlaceholderProps> = ({
  className = '',
  variant = 'magazine-page',
  lines = 3
}) => {
  const baseClasses = "animate-pulse bg-gray-700 rounded";
  
  const getVariantClasses = () => {
    switch (variant) {
      case 'magazine-page':
        return "w-full h-full flex flex-col items-center justify-center p-8";
      case 'text':
        return "h-4 w-full mb-2";
      case 'image':
        return "w-full h-48 mb-4";
      case 'button':
        return "h-10 w-24";
      default:
        return "w-full h-full";
    }
  };

  const renderMagazinePageSkeleton = () => (
    <div className="w-full h-full bg-gray-800 flex flex-col items-center justify-center p-8">
      {/* Magazine cover skeleton */}
      <div className="w-3/4 h-3/4 bg-gray-700 rounded-lg mb-4 animate-pulse"></div>
      
      {/* Title skeleton */}
      <div className="w-2/3 h-6 bg-gray-700 rounded mb-2 animate-pulse"></div>
      <div className="w-1/2 h-4 bg-gray-700 rounded animate-pulse"></div>
      
      {/* Loading indicator */}
      <div className="mt-6 flex items-center space-x-2">
        <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
    </div>
  );

  const renderTextSkeleton = () => (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={`${baseClasses} ${getVariantClasses()}`}
          style={{ width: index === lines - 1 ? '60%' : '100%' }}
        />
      ))}
    </div>
  );

  const renderImageSkeleton = () => (
    <div className={`${baseClasses} ${getVariantClasses()}`} />
  );

  const renderButtonSkeleton = () => (
    <div className={`${baseClasses} ${getVariantClasses()}`} />
  );

  const renderSkeleton = () => {
    switch (variant) {
      case 'magazine-page':
        return renderMagazinePageSkeleton();
      case 'text':
        return renderTextSkeleton();
      case 'image':
        return renderImageSkeleton();
      case 'button':
        return renderButtonSkeleton();
      default:
        return <div className={`${baseClasses} ${getVariantClasses()} ${className}`} />;
    }
  };

  return (
    <div className={className}>
      {renderSkeleton()}
    </div>
  );
};

export default SkeletonPlaceholder;
