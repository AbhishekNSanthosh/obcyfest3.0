"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import Flipbook from "@widgets/flipbook/Flipbook";

// Constants
const PAGES = [
  "/magazine/page1.png",
  "/magazine/page2.png",
  "/magazine/page2.png",
  "/magazine/page2.png",
  "/magazine/page2.png",
  "/magazine/page2.png",
  "/magazine/page2.png",
  "/magazine/page2.png",
  "/magazine/page3.png",
  "/magazine/page4.png",
];

const HINT_DISPLAY_TIME = 3000; // Reduced from 5000

// Custom hooks
const useFullscreen = (elementRef: React.RefObject<HTMLDivElement | null>) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement && elementRef.current) {
      elementRef.current.requestFullscreen().catch((err) => {
        console.error(`Error enabling fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  }, [elementRef]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
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
const Header = () => (
  <h1 className="text-3xl sm:text-4xl mt-20 md:text-5xl lg:text-6xl font-serif font-bold mb-4 sm:mb-6 md:mb-8 text-center text-yellow-400 animate-fade-in-up z-10">
    Digital Magazine
  </h1>
);

const PageHint = () => (
  <div className="absolute top-2 left-2 bg-black bg-opacity-80 text-yellow-400 px-2 py-1 rounded text-sm z-20">
    Click or swipe to turn pages
  </div>
);

const PageCounter = ({
  currentPage,
  totalPages,
}: {
  currentPage: number;
  totalPages: number;
}) => (
  <div className="mt-3 text-center text-sm font-medium text-yellow-500">
    Page {currentPage + 1} of {totalPages}
  </div>
);

const FullscreenButton = ({
  isFullscreen,
  onToggle,
}: {
  isFullscreen: boolean;
  onToggle: () => void;
}) => (
  <button
    onClick={onToggle}
    className={`sticky mt-10 px-4 py-2 bg-yellow-400 text-black rounded-lg text-sm font-semibold shadow-lg hover:bg-yellow-300 transition-colors duration-200 z-50 focus:outline-none focus:ring-2 focus:ring-yellow-500`}
    aria-label="Toggle fullscreen mode"
  >
    {isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
  </button>
);

// Optimized Flipbook Wrapper to reduce re-renders
const OptimizedFlipbook = React.memo(
  ({
    pages,
    onFlip,
    isFullscreen,
    currentPage,
  }: {
    pages: string[];
    onFlip: (e: { data: number }) => void;
    isFullscreen: boolean;
    currentPage: number;
  }) => (
    <Flipbook
      pages={pages}
      onFlip={onFlip}
      isFullscreen={isFullscreen}
      currentPage={currentPage}
    />
  )
);

// Main component
export default function Magazine() {
  const [currentPage, setCurrentPage] = useState(0);
  const [showHint, setShowHint] = useTimedState(true, HINT_DISPLAY_TIME);
  const flipbookRef = useRef<HTMLDivElement | null>(null);

  const { isFullscreen, toggleFullscreen } = useFullscreen(flipbookRef);

  // Memoized flip handler
  const handleFlip = useCallback((e: { data: number }) => {
    setCurrentPage(e.data);
  }, []);

  // Optimize images preloading for better performance
  useEffect(() => {
    // Only preload next 2 pages to reduce memory usage
    const preloadImages = async () => {
      const nextPages = [
        PAGES[Math.min(currentPage + 1, PAGES.length - 1)],
        PAGES[Math.min(currentPage + 2, PAGES.length - 1)],
      ];

      nextPages.forEach((src) => {
        const img = new Image();
        img.src = src;
      });
    };

    preloadImages();
  }, [currentPage]);

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden flex flex-col items-center p-2 sm:p-4">
      {/* Simplified background - removed gradient for performance */}
      <div className="absolute inset-0 bg-black" />

      {/* Header - Hidden in Fullscreen */}
      {!isFullscreen && <Header />}

      {/* Flipbook Container */}
      <div
        ref={flipbookRef}
        className={`relative w-full ${
          isFullscreen ? "h-screen" : "max-w-4xl mx-auto"
        } flex flex-col items-center justify-center`}
      >
        <OptimizedFlipbook
          pages={PAGES}
          onFlip={handleFlip}
          isFullscreen={isFullscreen}
          currentPage={currentPage}
        />

        {/* Page-Turning Hint - Shown briefly on load */}
        {!isFullscreen && showHint && <PageHint />}

        {/* Page Counter - Hidden in Fullscreen */}
        {!isFullscreen && (
          <PageCounter currentPage={currentPage} totalPages={PAGES.length} />
        )}
      </div>

      {/* Fullscreen Toggle */}
      <FullscreenButton
        isFullscreen={isFullscreen}
        onToggle={toggleFullscreen}
      />

      {/* Performance optimizations */}
      <PerformanceOptimizations />
    </div>
  );
}

// Additional performance optimizations
const PerformanceOptimizations = () => {
  useEffect(() => {
    // Reduce animation precision for better performance
    if (typeof window !== "undefined") {
      // Force hardware acceleration for flipbook
      const style = document.createElement("style");
      style.textContent = `
        .flipbook-container {
          transform: translateZ(0);
          backface-visibility: hidden;
          perspective: 1000;
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
