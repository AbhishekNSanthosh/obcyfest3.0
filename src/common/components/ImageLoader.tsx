'use client';

import React, { useState, useRef, useEffect } from 'react';
import SkeletonPlaceholder from './SkeletonPlaceholder';

interface ImageLoaderProps {
  src: string;
  alt: string;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
  showProgress?: boolean;
  placeholder?: React.ReactNode;
}

const ImageLoader: React.FC<ImageLoaderProps> = ({
  src,
  alt,
  className = '',
  onLoad,
  onError,
  showProgress = false,
  placeholder
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [progress, setProgress] = useState(0);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!src) return;

    setLoading(true);
    setError(false);
    setProgress(0);

    const img = new Image();
    
    const handleLoad = () => {
      setLoading(false);
      setProgress(100);
      onLoad?.();
    };

    const handleError = () => {
      setLoading(false);
      setError(true);
      onError?.();
    };

    const handleProgress = (e: ProgressEvent) => {
      if (e.lengthComputable) {
        const percentComplete = (e.loaded / e.total) * 100;
        setProgress(percentComplete);
      }
    };

    img.onload = handleLoad;
    img.onerror = handleError;
    img.onprogress = handleProgress;
    img.src = src;

    return () => {
      img.onload = null;
      img.onerror = null;
      img.onprogress = null;
    };
  }, [src, onLoad, onError]);

  const defaultPlaceholder = (
    <div className="w-full h-full relative">
      <SkeletonPlaceholder 
        variant="magazine-page" 
        className="w-full h-full"
      />
      {showProgress && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-32 bg-gray-700 rounded-full h-1">
          <div 
            className="bg-yellow-400 h-1 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}
    </div>
  );

  const errorPlaceholder = (
    <div className="w-full h-full bg-gray-800 flex items-center justify-center">
      <div className="text-center">
        <div className="text-red-400 text-4xl mb-2">⚠️</div>
        <p className="text-red-400 text-sm">Failed to load image</p>
        <button 
          onClick={() => {
            setError(false);
            setLoading(true);
            setProgress(0);
            // Trigger reload by changing src
            if (imgRef.current) {
              imgRef.current.src = src + '?retry=' + Date.now();
            }
          }}
          className="mt-2 px-3 py-1 bg-yellow-400 text-black text-xs rounded hover:bg-yellow-300 transition-colors"
        >
          Retry
        </button>
      </div>
    </div>
  );

  if (error) {
    return (
      <div className={className}>
        {errorPlaceholder}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {loading && (placeholder || defaultPlaceholder)}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className={`w-full h-full object-contain transition-opacity duration-300 ${
          loading ? 'opacity-0 absolute' : 'opacity-100'
        }`}
        style={{ display: loading ? 'none' : 'block' }}
      />
    </div>
  );
};

export default ImageLoader;
