"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import Flipbook from "@widgets/flipbook/Flipbook";
import { ref, getDownloadURL, listAll } from "firebase/storage";
import { storage } from "@lib/firebase";
import LoadingStatus from "@components/LoadingStatus";
import IconFullscreen from "@icons/IconFullscreen";

// Constants
const HINT_DISPLAY_TIME = 3000;

// Custom hooks
const useFullscreen = (elementRef: React.RefObject<HTMLDivElement | null>) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement && elementRef.current) {
      elementRef.current.requestFullscreen().catch((err) => {
        console.error(`Error enabling fullscreen: ${err.message}`);
        alert("Fullscreen not allowed. Please interact with the page first.");
      });
    } else {
      document.exitFullscreen();
    }
  }, [elementRef]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const active = !!document.fullscreenElement;
      setIsFullscreen(active);
      if (typeof document !== "undefined") {
        document.documentElement.style.overflow = active ? "hidden" : "";
        document.body.style.overflow = active ? "hidden" : "";
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  return { isFullscreen, toggleFullscreen };
};

const useTimedState = (initialState: boolean, duration: number) => {
  const [state, setState] = useState(initialState);

  useEffect(() => {
    if (state) {
      const timer = setTimeout(() => setState(false), duration);
      return () => clearTimeout(timer);
    }
  }, [state, duration]);

  return [state, setState] as const;
};

// Memoized Components to prevent unnecessary re-renders
const Header = React.memo(() => (
  <h1 className="text-4xl sm:text-4xl mt-20 md:text-5xl lg:text-6xl font-serif font-bold mb-4 sm:mb-6 md:mb-8 text-center text-yellow-400 animate-fade-in-up z-10">
    Digital Magazine
  </h1>
));

const PageHint = React.memo(() => (
  <div className="absolute top-2 left-2 bg-black bg-opacity-80 text-yellow-400 px-2 py-1 rounded text-sm z-20">
    Click or swipe to turn pages
  </div>
));

const PageCounter = React.memo(
  ({
    currentPage,
    totalPages,
  }: {
    currentPage: number;
    totalPages: number;
  }) => (
    <div className="mt-3 text-center text-sm font-medium text-yellow-500">
      Page {currentPage} of {totalPages - 1}
    </div>
  )
);

const FullscreenButton = React.memo(
  ({
    isFullscreen,
    onToggle,
  }: {
    isFullscreen: boolean;
    onToggle: () => void;
  }) => (
    <button
      onClick={onToggle}
      className={`absolute top-4 right-4 p-2 bg-black bg-opacity-80 hover:bg-opacity-90 text-yellow-400 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-50 focus:outline-none focus:ring-2 focus:ring-yellow-500 group touch-manipulation`}
      aria-label={isFullscreen ? "Exit fullscreen mode" : "Enter fullscreen mode"}
      title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
    >
      <IconFullscreen 
        isFullscreen={isFullscreen} 
        className="w-4 h-4 group-hover:scale-110 animate-pulse transition-transform duration-200" 
      />
    </button>
  )
);

const LoadingSpinner = React.memo(({ progress = 0 }: { progress?: number }) => (
  <div className="flex flex-col items-center justify-center min-h-[400px]">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mb-4"></div>
    <p className="text-yellow-400 text-lg mb-4">Loading magazine...</p>
    <div className="w-64 bg-gray-700 rounded-full h-2">
      <div 
        className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
        style={{ width: `${progress}%` }}
      ></div>
    </div>
    <p className="text-yellow-400 text-sm mt-2">{Math.round(progress)}%</p>
  </div>
));

// Optimized Flipbook Wrapper to reduce re-renders
const OptimizedFlipbook = React.memo(
  ({
    pages,
    onFlip,
    isFullscreen,
    currentPage,
    onImageLoad,
    onImageError,
  }: {
    pages: string[];
    onFlip: (e: { data: number }) => void;
    isFullscreen: boolean;
    currentPage: number;
    onImageLoad?: (pageIndex: number) => void;
    onImageError?: (pageIndex: number) => void;
  }) => (
    <Flipbook
      pages={pages}
      onFlip={onFlip}
      isFullscreen={isFullscreen}
      currentPage={currentPage}
      preloadPages={2} // Add preload property for smoother transitions
      onImageLoad={onImageLoad}
      onImageError={onImageError}
    />
  )
);

// Main component
export default function Magazine({ name }: { name: string }) {
  const [currentPage, setCurrentPage] = useState(0);
  const [showHint, setShowHint] = useTimedState(true, HINT_DISPLAY_TIME);
  const [pages, setPages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set());
  const flipbookRef = useRef<HTMLDivElement | null>(null);

  const { isFullscreen, toggleFullscreen } = useFullscreen(flipbookRef);

  // Fetch all pages from Firebase Storage
  useEffect(() => {
    const fetchAllPages = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const magazineRef = ref(storage, name);
        const result = await listAll(magazineRef);

        const sortedItems = result.items.sort((a, b) => {
          const aName = a.name.toLowerCase();
          const bName = b.name.toLowerCase();
          return aName.localeCompare(bName, undefined, { numeric: true });
        });

        const pageUrls = await Promise.all(
          sortedItems.map(async (itemRef) => {
            const url = await getDownloadURL(itemRef);
            return url;
          })
        );

        // Cache with timestamp
        const cacheData = {
          urls: pageUrls,
          timestamp: Date.now(),
          magazineName: name, // Include magazine name to handle different magazines
        };

        localStorage.setItem("magazinePages", JSON.stringify(cacheData));
        setPages(pageUrls);
        setLoadingProgress(100); // URLs fetched, now loading images
      } catch (err) {
        console.error("Error fetching magazine pages:", err);
        setError("Failed to load magazine. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    const cached = localStorage.getItem("magazinePages");

    if (cached) {
      const cacheData = JSON.parse(cached);
      const cacheAge = Date.now() - cacheData.timestamp;
      const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

      // Use cache only if it's fresh and for the same magazine
      if (cacheAge < CACHE_DURATION && cacheData.magazineName === name) {
        setPages(cacheData.urls);
        setLoadingProgress(100);
        setIsLoading(false);

        // Still fetch fresh data in background
        fetchAllPages();
      } else {
        // Cache expired or different magazine
        fetchAllPages();
      }
    } else {
      fetchAllPages();
    }
  }, [name]); // Add name as dependency

  // Memoized flip handler
  const handleFlip = useCallback((e: { data: number }) => {
    setCurrentPage(e.data);
  }, []);

  // Handle individual image loading
  const handleImageLoad = useCallback((pageIndex: number) => {
    setLoadedImages(prev => new Set([...Array.from(prev), pageIndex]));
    setFailedImages(prev => {
      const newSet = new Set(prev);
      newSet.delete(pageIndex);
      return newSet;
    });
  }, []);

  const handleImageError = useCallback((pageIndex: number) => {
    setFailedImages(prev => new Set([...Array.from(prev), pageIndex]));
  }, []);

  // Update loading progress based on loaded images
  useEffect(() => {
    if (pages.length > 0) {
      const progress = (loadedImages.size / pages.length) * 100;
      setLoadingProgress(progress);
    }
  }, [loadedImages.size, pages.length]);

  // Preload next 2 pages for performance
  useEffect(() => {
    if (pages.length === 0) return;

    const preloadImages = async () => {
      const nextPages = [
        pages[Math.min(currentPage + 1, pages.length - 1)],
        pages[Math.min(currentPage + 2, pages.length - 1)],
      ];

      nextPages.forEach((src) => {
        const img = new Image();
        img.src = src;
      });
    };

    preloadImages();
  }, [currentPage, pages]);

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl text-yellow-400 mb-4">
            Error Loading Magazine
          </h2>
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-yellow-400 text-black rounded-lg font-semibold hover:bg-yellow-300 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden flex flex-col items-center p-2 sm:p-4">
      {/* Background */}
      <div className="absolute inset-0 bg-black" />

      {/* Header - Hidden in Fullscreen */}
      {!isFullscreen && <Header />}

      {/* Flipbook Container */}
      <div
        ref={flipbookRef}
        role="region"
        aria-label="Magazine flipbook"
        className={`relative w-full ${
          isFullscreen ? "h-screen overflow-hidden" : "max-w-4xl mx-auto"
        } flex flex-col items-center justify-center flipbook-container`}
      >
        {isLoading ? (
          <LoadingSpinner progress={loadingProgress} />
        ) : pages.length > 0 ? (
          <>
             <OptimizedFlipbook
               {...{ 
                 pages, 
                 onFlip: handleFlip, 
                 isFullscreen, 
                 currentPage,
                 onImageLoad: handleImageLoad,
                 onImageError: handleImageError
               }}
             />

             {/* Fullscreen Button - Positioned on the book */}
             <FullscreenButton
               isFullscreen={isFullscreen}
               onToggle={toggleFullscreen}
             />

             {/* Page-Turning Hint */}
             {!isFullscreen && showHint && <PageHint />}

             {/* Page Counter */}
             {!isFullscreen && (
               <PageCounter
                 currentPage={currentPage}
                 totalPages={pages.length}
               />
             )}
          </>
        ) : (
          <div className="text-center text-yellow-400">
            <p>No magazine pages found.</p>
          </div>
        )}
      </div>


      {/* Loading Status Indicator */}
      {!isLoading && pages.length > 0 && (
        <LoadingStatus
          totalPages={pages.length}
          loadedPages={loadedImages}
          failedPages={failedImages}
          currentPage={currentPage}
        />
      )}

      {/* Performance optimizations */}
      <PerformanceOptimizations />
    </div>
  );
}

// Additional performance optimizations
const PerformanceOptimizations = () => {
  useEffect(() => {
    if (typeof window !== "undefined") {
      const style = document.createElement("style");
      style.textContent = `
        .flipbook-container {
          transform: translateZ(0);
          backface-visibility: hidden;
          perspective: 1000;
          will-change: transform;
        }
        * {
          -webkit-tap-highlight-color: transparent;
          -webkit-touch-callout: none;
        }
      `;
      document.head.appendChild(style);

      return () => {
        document.head.removeChild(style);
      };
    }
  }, []);

  return null;
};
