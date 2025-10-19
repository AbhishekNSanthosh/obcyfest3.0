"use client";

import HTMLFlipBook from "react-pageflip";
import { FC, useEffect, useState, useRef, useCallback } from "react";
import ImageLoader from "@components/ImageLoader";

// Set minimum dimensions
const minWidth = 849;
const minHeight = 1200;

interface FlipbookProps {
  pages: string[];
  onFlip?: (e: { data: number }) => void;
  isFullscreen?: boolean;
  currentPage?: number;
  preloadPages?: number; // New prop to define how many next pages to preload
  onImageLoad?: (pageIndex: number) => void;
  onImageError?: (pageIndex: number) => void;
  isLowEndDevice?: boolean; // Add device performance prop
}

// Define a minimal type for the flipbook ref
interface PageFlip {
  pageFlip: () => {
    update: () => void;
  };
}

const Flipbook: FC<FlipbookProps> = ({
  pages,
  onFlip,
  isFullscreen = false,
  currentPage = 0,
  preloadPages = 3, // Default preload next 2 pages
  onImageLoad,
  onImageError,
  isLowEndDevice = false,
}) => {
  const [dimensions, setDimensions] = useState({ width: 500, height: 700 });
  const [visiblePages, setVisiblePages] = useState<Set<number>>(new Set());
  const flipbookRef = useRef<PageFlip>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const updateDimensions = () => {
      try {
        const vw = window.innerWidth;
        const vh = window.innerHeight;

        const aspectRatio = minWidth / minHeight;
        let newWidth;
        let newHeight;

        if (isFullscreen) {
          const viewportAspectRatio = vw / vh;

          if (viewportAspectRatio > aspectRatio) {
            // Viewport is wider than book aspect ratio - fit to height with small margin
            newHeight = vh ; // 98% of viewport height
            newWidth = newHeight * aspectRatio;
          } else {
            // Viewport is taller than book aspect ratio - fit to width with small margin
            newWidth = vw; // 98% of viewport width
            newHeight = newWidth / aspectRatio;
          }

          // Additional safety margin to ensure no cutting
          if (newWidth > vw) {
            newWidth = vw;
            newHeight = newWidth / aspectRatio;
          }
          if (newHeight > vh) {
            newHeight = vh;
            newWidth = newHeight * aspectRatio;
          }
        } else {
          // Default (non-fullscreen) responsive scaling
          if (vw < 480) {
            newWidth = vw * 0.95;
          } else if (vw < 640) {
            newWidth = vw * 0.92;
          } else if (vw < 768) {
            newWidth = vw * 0.85;
          } else if (vw < 1024) {
            newWidth = vw * 0.8;
          } else if (vw < 1280) {
            newWidth = Math.min(vw * 0.75, 900);
          } else {
            newWidth = Math.min(vw * 0.9, 800);
          }

          newHeight = newWidth * (minHeight / minWidth);
          newWidth = Math.min(newWidth, vw - 20);
          newHeight = Math.min(newHeight, vh - 20);

          // Enforce minimum only in normal mode (not fullscreen)
          newWidth = Math.max(newWidth, minWidth);
          newHeight = Math.max(newHeight, minHeight);
        }

        setDimensions({
          width: Math.floor(newWidth),
          height: Math.floor(newHeight),
        });
      } catch (error) {
        console.error("Error updating dimensions:", error);
        setDimensions({
          width: 800,
          height: 560,
        });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);

    // Ensure internal layout refresh on any mode change
    const timeoutId = setTimeout(() => {
      const pageFlip = flipbookRef.current?.pageFlip();
      if (pageFlip) {
        pageFlip.update();
      }
    }, 5);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", updateDimensions);
    };
  }, [isFullscreen, currentPage]);

  // Intersection Observer for lazy loading on low-end devices
  const setupIntersectionObserver = useCallback(() => {
    if (!isLowEndDevice || typeof window === 'undefined') return;

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const pageIndex = parseInt(entry.target.getAttribute('data-page-index') || '0');
          if (entry.isIntersecting) {
            setVisiblePages(prev => new Set([...Array.from(prev), pageIndex]));
          }
        });
      },
      {
        rootMargin: '50px', // Start loading when page is 50px away from viewport
        threshold: 0.1
      }
    );

    // Observe all page elements
    const pageElements = document.querySelectorAll('[data-page-index]');
    pageElements.forEach(el => observerRef.current?.observe(el));
  }, [isLowEndDevice]);

  // Setup intersection observer for low-end devices
  useEffect(() => {
    if (isLowEndDevice) {
      setupIntersectionObserver();
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [isLowEndDevice, setupIntersectionObserver]);

  // Priority-based preloading is now handled by the parent component
  // This effect is kept for backward compatibility but is less aggressive
  useEffect(() => {
    if (pages.length === 0) return;

    // Only preload the immediate next page to avoid conflicts with priority loading
    const nextPage = Math.min(currentPage + 1, pages.length - 1);
    if (nextPage !== currentPage && (!isLowEndDevice || visiblePages.has(nextPage))) {
      const img = new Image();
      img.src = pages[nextPage];
    }
  }, [currentPage, pages, isLowEndDevice, visiblePages]);

  return (
    <div
      className={`flex justify-center items-center w-full ${
        isFullscreen ? "" : "h-auto"
      }`}
    >
      <HTMLFlipBook
        key={`${dimensions.width}x${dimensions.height}-${isFullscreen}`}
        style={{}}
        width={dimensions.width}
        height={dimensions.height}
        showCover={true}
        className="shadow-2xl rounded-lg border-4 border-black-900 animate-fade-in-up"
        startPage={currentPage}
        size="stretch"
        minWidth={280}
        maxWidth={isFullscreen ? dimensions.width : 1200} // Allow full width in fullscreen
        minHeight={360}
        maxHeight={isFullscreen ? dimensions.height : 1600} // Allow full height in fullscreen
        drawShadow={true}
        flippingTime={600}
        useMouseEvents={true}
        usePortrait={true}
        startZIndex={0}
        autoSize={true}
        clickEventForward={true}
        swipeDistance={30}
        showPageCorners={true}
        disableFlipByClick={false}
        maxShadowOpacity={0.3}
        mobileScrollSupport={true}
        onFlip={onFlip}
        ref={flipbookRef}
      >
        {pages.map((page, i) => {
          // For low-end devices, only render visible pages or current page vicinity
          const shouldRender = !isLowEndDevice || 
            visiblePages.has(i) || 
            Math.abs(i - currentPage) <= 1 ||
            i < 2; // Always render first 2 pages

          return (
            <div 
              key={i} 
              className="bg-white relative"
              data-page-index={i}
            >
              {shouldRender ? (
                <ImageLoader
                  src={page}
                  alt={`Magazine page ${i + 1}`}
                  className="w-full h-full"
                  onLoad={() => onImageLoad?.(i)}
                  onError={() => onImageError?.(i)}
                  showProgress={false} // Disable progress for all pages to prevent skeleton flicker
                  isLowEndDevice={isLowEndDevice}
                  priority={i < 2 || Math.abs(i - currentPage) <= 1 ? 'high' : 'low'}
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <div className="text-gray-500 text-sm">Loading...</div>
                </div>
              )}
              {isFullscreen && (
                <div className="absolute bottom-2 right-2 bg-black-900 text-yellow-400 px-2 py-1 rounded text-sm">
                  {i + 1}
                </div>
              )}
            </div>
          );
        })}
      </HTMLFlipBook>
    </div>
  );
};

export default Flipbook;