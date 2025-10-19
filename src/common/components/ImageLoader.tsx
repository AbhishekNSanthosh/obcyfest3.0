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
  isLowEndDevice?: boolean;
  priority?: 'high' | 'low';
}

const ImageLoader: React.FC<ImageLoaderProps> = ({
  src,
  alt,
  className = '',
  onLoad,
  onError,
  showProgress = false,
  placeholder,
  isLowEndDevice = false,
  priority = 'high'
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [progress, setProgress] = useState(0);
  const [hasLoaded, setHasLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!src) return;

    setLoading(true);
    setError(false);
    setProgress(0);

    // For low-end devices, add delay for low priority images
    const loadDelay = isLowEndDevice && priority === 'low' ? 1000 : 0;

    const loadImage = () => {
      const img = new Image();
      
      // For low-end devices, optimize image loading
      if (isLowEndDevice) {
        img.loading = 'lazy';
        img.decoding = 'async';
      }
      
      const handleLoad = () => {
        setLoading(false);
        setProgress(100);
        setHasLoaded(true);
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
    };

    if (loadDelay > 0) {
      const timeoutId = setTimeout(loadImage, loadDelay);
      return () => {
        clearTimeout(timeoutId);
      };
    } else {
      loadImage();
    }
  }, [src, onLoad, onError, isLowEndDevice, priority]);

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
      {loading && !hasLoaded && (placeholder || defaultPlaceholder)}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className={`w-full h-full object-contain transition-opacity duration-300 ${
          loading && !hasLoaded ? 'opacity-0 absolute' : 'opacity-100'
        }`}
        style={{ display: loading && !hasLoaded ? 'none' : 'block' }}
      />
    </div>
  );
};

export default ImageLoader;
